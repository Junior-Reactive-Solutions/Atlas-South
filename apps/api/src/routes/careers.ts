import { Router } from 'express';
import { requireDb } from '../lib/prisma.js';
import { sendJobApplicationConfirmation, sendJobApplicationAdminNotification } from '../lib/email.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

careersRouter.post('/careers/apply', upload.single('cv'), async (req, res) => {
  try {
    const { fullName, email, phone, coverLetter, roleTitle } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields: fullName, email, phone' });
    }

    const db = requireDb();
    const application = await db.jobApplication.create({
      data: {
        fullName,
        email,
        phone,
        roleTitle: roleTitle || null,
        coverLetter: coverLetter || null,
        cvFileName: req.file?.originalname || null,
        cvFilePath: req.file?.path || null,
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
        cvFileName: req.file?.originalname,
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
