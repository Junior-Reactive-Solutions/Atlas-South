-- Migration: add optional internal notes field to Enquiry
-- Docs: docs/build/08-ADMIN-PANEL-SPEC.md §5 — internal admin notes, not visible to enquirers.
ALTER TABLE "Enquiry" ADD COLUMN "notes" TEXT;
