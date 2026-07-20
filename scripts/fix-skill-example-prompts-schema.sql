-- Align existing databases with the skill schema before deploying code that
-- reads examplePrompts from the skill table. Fresh databases should continue
-- to use `pnpm db:push`.
ALTER TABLE "skill"
  ADD COLUMN IF NOT EXISTS "examplePrompts" text[] NOT NULL DEFAULT ARRAY[]::text[];
