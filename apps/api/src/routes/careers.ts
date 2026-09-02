import { Router } from 'express';
import { requireDb } from '../lib/prisma.js';
import {
  sendJobApplicationConfirmation,
  sendJobApplicationAdminNotification,
  type MailAttachment,
} from '../lib/email.js';
import { validateBody } from '../middleware/validate.js';
import { JobApplicationSchema } from '@atlas-south/shared';
import multer from 'multer';

export const careersRouter = Router();

/**
 * Uploads are held in memory and emailed — never written to disk.
 *
 * Client instruction (2026-09-02): CVs and cover letters must not be stored on the server.
 * That also fixes an existing bug rather than merely satisfying a preference — the previous
 * implementation wrote them to `uploads/cv` on Render's local disk, which is **wiped on
 * every deploy**, so every CV received was silently lost at the next release. There is no
 * persistent volume on this plan, so "store on disk" was never actually storage.
 *
 * The consequence to keep in mind: the notification email is now the ONLY copy of a
 * candidate's documents. sendJobApplicationAdminNotification carries that responsibility
 * and logs loudly if the send fails.
 */
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // Only checks the client-supplied Content-Type header — trivially spoofable, and NOT a
    // substitute for the magic-number check below. Kept as a cheap first-pass rejection so
    // an obviously-wrong file never reaches the buffer at all.
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  // 5MB per file, two files max. Deliberately well inside typical mail-server message
  // limits: base64 encoding inflates attachments by ~33%, so 2×5MB arrives as roughly
  // 13.5MB on the wire, and shared mail hosts commonly cap a message at 25–50MB.
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
});

/** The real PDF magic number — every valid PDF begins with these 5 bytes. */
const PDF_MAGIC = Buffer.from('%PDF-');

/**
 * Confirms an uploaded file's actual content, not its declared Content-Type — a
 * security-audit finding (2026-08-27). multer's fileFilter only ever sees what the
 * uploader's client claims the file is; this inspects the real leading bytes against the
 * format's own signature.
 *
 * Now reads the in-memory buffer rather than opening a path, since nothing is written to
 * disk. Same check, no filesystem involved — and nothing to clean up on rejection, because
 * a rejected upload simply goes out of scope.
 */
function isRealPdf(file: Express.Multer.File | undefined): boolean {
  if (!file?.buffer || file.buffer.length < PDF_MAGIC.length) return false;
  return file.buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC);
}

/** Named fields, not upload.single — the form takes an optional Cover Letter alongside the
 * CV. Same 5MB-per-file limit and PDF-only filter apply to both. */
const uploadFields = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 },
]);

careersRouter.post('/careers/apply', uploadFields, validateBody(JobApplicationSchema), async (req, res) => {
  try {
    const { fullName, email, phone, coverLetter, roleTitle } = req.body;
    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const cvFile = files?.cv?.[0];
    const coverLetterFile = files?.coverLetterFile?.[0];

    // Every supplied file must genuinely be a PDF. Rejecting the whole request rather than
    // dropping the bad file: a candidate who attached the wrong thing should be told, not
    // have half their application accepted silently.
    for (const file of [cvFile, coverLetterFile]) {
      if (file && !isRealPdf(file)) {
        return res.status(400).json({ error: 'One of the uploaded files is not a valid PDF.' });
      }
    }

    const attachments: MailAttachment[] = [];
    if (cvFile) {
      attachments.push({
        // The candidate's own filename is used here, unlike the old disk path (which used a
        // server-generated UUID to avoid path traversal). That risk doesn't apply to a mail
        // attachment name, and a recruiter wants "Jane Smith CV.pdf", not a UUID. Stripped
        // of path separators and quotes so it can't smuggle a directory or break the header.
        filename: safeAttachmentName(cvFile.originalname, 'CV.pdf'),
        content: cvFile.buffer,
        contentType: 'application/pdf',
      });
    }
    if (coverLetterFile) {
      attachments.push({
        filename: safeAttachmentName(coverLetterFile.originalname, 'Cover-Letter.pdf'),
        content: coverLetterFile.buffer,
        contentType: 'application/pdf',
      });
    }

    const db = requireDb();
    const application = await db.jobApplication.create({
      data: {
        fullName,
        email,
        phone,
        roleTitle: roleTitle || null,
        coverLetter: coverLetter || null,
        // Filenames are still recorded so the admin list shows what was submitted, but the
        // *Path columns stay null: there is no file on disk to point at. They remain in the
        // schema for historical rows written before this change.
        cvFileName: cvFile?.originalname || null,
        cvFilePath: null,
        coverLetterFileName: coverLetterFile?.originalname || null,
        coverLetterFilePath: null,
      },
    });

    // Confirmation to the candidate and the internal copy go out together. Not awaited: the
    // application is already saved, and the applicant shouldn't wait on SMTP to see their
    // success screen. sendMail never throws for these two, so a failure is logged to
    // /admin/system-logs rather than surfacing here.
    void Promise.all([
      sendJobApplicationConfirmation({
        fullName,
        email,
        roleTitle: roleTitle || 'General Application',
      }),
      sendJobApplicationAdminNotification({
        applicationId: application.id,
        fullName,
        email,
        phone,
        roleTitle: roleTitle || 'General Application',
        coverLetter,
        cvFileName: cvFile?.originalname,
        coverLetterFileName: coverLetterFile?.originalname,
        attachments,
      }),
    ]);

    return res.status(201).json({ ok: true, id: application.id });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    console.error('Failed to create job application:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});

/**
 * Reduces an uploaded filename to something safe to put in a MIME header: no path
 * separators, no quotes or control characters, length-capped, and always ending .pdf.
 */
function safeAttachmentName(original: string | undefined, fallback: string): string {
  if (!original) return fallback;
  const base = original
    .replace(/[\\/]/g, '-')
    .replace(/["\r\n\t]/g, '')
    .trim()
    .slice(0, 100);
  if (!base) return fallback;
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

// The admin-facing "download this CV" route lives in routes/admin/applications.ts,
// alongside the rest of the admin JobApplication endpoints, not here — this file stays
// public-only. See the note there on why a route existing doesn't fully fix the
// underlying data-loss problem.
