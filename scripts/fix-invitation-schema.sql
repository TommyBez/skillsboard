-- Align invitation table with Better Auth organization plugin + lib/db/schema.ts.
-- Idempotent: safe to re-run.

ALTER TABLE "invitation"
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now();
