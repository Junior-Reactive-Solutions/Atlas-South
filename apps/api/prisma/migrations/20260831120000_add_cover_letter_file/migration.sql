-- Adds a real cover-letter file upload alongside the existing free-text coverLetter field
-- and the existing CV file columns. Client feedback (2026-08-31): the application form
-- should accept a Cover Letter upload, not just a CV.
ALTER TABLE "JobApplication" ADD COLUMN "coverLetterFileName" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN "coverLetterFilePath" TEXT;
