-- Optional team note when saving a skill to the library.
-- Idempotent: safe to re-run.

ALTER TABLE "skill"
  ADD COLUMN IF NOT EXISTS "note" text;
