-- 1.7 derives client confidentiality from tokenEndpointAuthMethod instead of
-- the legacy public/type flags; make sure clients registered as public keep
-- authenticating with method "none" before the flags are dropped.
UPDATE "oauthClient" SET "tokenEndpointAuthMethod" = 'none'
WHERE "tokenEndpointAuthMethod" IS NULL
	AND ("public" = true OR "type" = 'public');--> statement-breakpoint
ALTER TABLE "oauthClient" DROP COLUMN "public";--> statement-breakpoint
ALTER TABLE "oauthClient" DROP COLUMN "type";