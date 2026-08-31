import { Router } from 'express';
import { requireDb } from '../lib/prisma.js';
import { sendJobApplicationConfirmation, sendJobApplicationAdminNotification } from '../lib/email.js';
import { validateBody } from '../middleware/validate.js';
import { JobApplicationSchema } from '@atlas-south/shared';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

export const careersRouter = Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'cv');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  // The stored filename is a server-generated UUID with a hardcoded .pdf extension —
  // never derived from file.originalname. Previously this reused
  // path.extname(file.originalname), which is attacker-controlled: a file uploaded as
  // "resume.html" with a spoofed application/pdf Content-Type would have been written to
  // disk as <random>.html (a security-audit finding, 2026-08-27). Every file accepted by
  // fileFilter below is verified to actually be a PDF before it's ever served back, so a
  // fixed .pdf extension here is correct regardless of what the client claimed.
  filename: (_req, _file, cb) => {
    cb(null, `${randomUUID()}.pdf`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // This only checks the client-supplied Content-Type header — trivially spoofable,
    // and NOT a substitute for the magic-number check performed after upload below. Kept
    // as a cheap first-pass rejection so an obviously-wrong file type never gets written
    // to disk at all.
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/** The real PDF magic number — every valid PDF file begins with these 5 bytes. */
const PDF_MAGIC = Buffer.from('%PDF-');

/**
 * Confirms an uploaded file's actual content, not its declared Content-Type — a
 * security-audit finding (2026-08-27). multer's fileFilter above only ever sees what the
 * uploader's browser/client claims the file is; this reads the first 5 real bytes off
 * disk and checks them against the format's own signature, the same way a virus scanner
 * or a file-type sniffer would. Deletes the file and returns false if it doesn't match.
 */
function verifyIsRealPdf(filePath: string): boolean {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(PDF_MAGIC.length);
    fs.readSync(fd, header, 0, PDF_MAGIC.length, 0);
    return header.equals(PDF_MAGIC);
  } catch {
    return false;
  } finally {
    if (fd !== null) fs.closeSync(fd);
  }
}

/** Named fields, not upload.single — the form now takes an optional Cover Letter file
 * alongside the CV, added 2026-08-31 (client feedback: "allow a user upload a CV and
 * Cover Letter"). Same 5MB-per-file limit and PDF-only fileFilter apply to both. */
const uploadFields = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 },
]);

/** Runs the magic-number check (see verifyIsRealPdf above) on every file multer accepted,
 * deleting and rejecting the whole request if any one of them isn't a real PDF. Returns
 * the files that passed, keyed the same way req.files is. */
function verifyUploadedFiles(files: { [field: string]: Express.Multer.File[] } | undefined) {
  if (!files) return { ok: true as const };
  for (const field of Object.keys(files)) {
    const file = files[field]?.[0];
    if (file && !verifyIsRealPdf(file.path)) {
      // Clean up every file in this request, not just the bad one — a legitimate CV
      // sitting alongside a spoofed cover letter shouldn't be kept without its pair.
      for (const f of Object.values(files).flat()) {
        fs.unlink(f.path, () => {});
      }
      return { ok: false as const };
    }
  }
  return { ok: true as const };
}

careersRouter.post('/careers/apply', uploadFields, validateBody(JobApplicationSchema), async (req, res) => {
  try {
    const { fullName, email, phone, coverLetter, roleTitle } = req.body;
    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const cvFile = files?.cv?.[0];
    const coverLetterFile = files?.coverLetterFile?.[0];

    const verified = verifyUploadedFiles(files);
    if (!verified.ok) {
      return res.status(400).json({ error: 'One of the uploaded files is not a valid PDF.' });
    }

    const db = requireDb();
    const application = await db.jobApplication.create({
      data: {
        fullName,
        email,
        phone,
        roleTitle: roleTitle || null,
        coverLetter: coverLetter || null,
        cvFileName: cvFile?.originalname || null,
        cvFilePath: cvFile?.path || null,
        coverLetterFileName: coverLetterFile?.originalname || null,
        coverLetterFilePath: coverLetterFile?.path || null,
      },
    });

    // Fire confirmation and admin notification emails in parallel
    Promise.all([
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
      }),
    ]).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to send application emails:', err);
    });

    return res.status(201).json({ ok: true, id: application.id });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    // eslint-disable-next-line no-console
    console.error('Failed to create job application:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});

// The admin-facing "download this CV" route lives in routes/admin/applications.ts,
// alongside the rest of the admin JobApplication endpoints, not here — this file stays
// public-only. See the note there on why a route existing doesn't fully fix the
// underlying data-loss problem.
