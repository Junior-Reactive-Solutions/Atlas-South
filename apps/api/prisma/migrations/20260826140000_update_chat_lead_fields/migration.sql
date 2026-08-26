-- Chat lead form now collects First Name, Last Name, Company, Phone Number, and Preferred
-- Contact Method instead of a single free-text `name`. Email stays but becomes optional —
-- it's only asked for when the visitor picks "Email" as their preferred contact method.

-- CreateEnum
CREATE TYPE "PreferredContact" AS ENUM ('email', 'phone');

-- AlterTable: add the new columns first (nullable so the backfill below can populate
-- firstName/lastName from the existing `name` column before either is made NOT NULL).
ALTER TABLE "ChatLead"
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "company" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "preferredContact" "PreferredContact";

-- Backfill every existing row from `name` — first word becomes firstName, the rest (if
-- any) becomes lastName. company/phone/preferredContact are left NULL: there's no honest
-- value to backfill them with, and the admin UI renders that as "—" rather than a lie.
UPDATE "ChatLead"
SET
  "firstName" = split_part("name", ' ', 1),
  "lastName" = CASE
    WHEN position(' ' in "name") > 0 THEN trim(substring("name" from position(' ' in "name") + 1))
    ELSE ''
  END;

-- Every row now has a firstName (even a single-word `name` produces a non-empty
-- split_part result), so this can safely become NOT NULL.
ALTER TABLE "ChatLead" ALTER COLUMN "firstName" SET NOT NULL;

-- `name` is fully replaced by firstName/lastName.
ALTER TABLE "ChatLead" DROP COLUMN "name";

-- email is no longer always collected (only when preferredContact = 'email'), so the
-- existing NOT NULL constraint has to go — every historical row already has a real value,
-- this only changes what's required for new ones.
ALTER TABLE "ChatLead" ALTER COLUMN "email" DROP NOT NULL;
