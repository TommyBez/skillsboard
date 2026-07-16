-- Align OAuth tables with @better-auth/oauth-provider + Kysely adapter.
-- The Kysely adapter sets supportsArrays=false, so string[] fields are stored
-- as JSON text (not Postgres text[]).

-- oauthClient: add missing columns
ALTER TABLE "oauthClient"
  ADD COLUMN IF NOT EXISTS "icon" text,
  ADD COLUMN IF NOT EXISTS "uri" text,
  ADD COLUMN IF NOT EXISTS "contacts" text,
  ADD COLUMN IF NOT EXISTS "tos" text,
  ADD COLUMN IF NOT EXISTS "policy" text,
  ADD COLUMN IF NOT EXISTS "softwareId" text,
  ADD COLUMN IF NOT EXISTS "softwareVersion" text,
  ADD COLUMN IF NOT EXISTS "softwareStatement" text,
  ADD COLUMN IF NOT EXISTS "enableEndSession" boolean,
  ADD COLUMN IF NOT EXISTS "subjectType" text;

-- oauthClient: store string[] fields as JSON text
ALTER TABLE "oauthClient"
  ALTER COLUMN "scopes" TYPE text USING CASE
    WHEN "scopes" IS NULL THEN NULL
    ELSE to_json("scopes")::text
  END,
  ALTER COLUMN "redirectUris" TYPE text USING to_json("redirectUris")::text,
  ALTER COLUMN "postLogoutRedirectUris" TYPE text USING CASE
    WHEN "postLogoutRedirectUris" IS NULL THEN NULL
    ELSE to_json("postLogoutRedirectUris")::text
  END,
  ALTER COLUMN "grantTypes" TYPE text USING CASE
    WHEN "grantTypes" IS NULL THEN NULL
    ELSE to_json("grantTypes")::text
  END,
  ALTER COLUMN "responseTypes" TYPE text USING CASE
    WHEN "responseTypes" IS NULL THEN NULL
    ELSE to_json("responseTypes")::text
  END;

-- Token/consent scopes also use string[] via the same adapter path
ALTER TABLE "oauthAccessToken"
  ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;

ALTER TABLE "oauthRefreshToken"
  ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;

-- Plugin models revoked as a date (revocation timestamp), not a boolean
ALTER TABLE "oauthRefreshToken"
  ALTER COLUMN "revoked" DROP DEFAULT;

ALTER TABLE "oauthRefreshToken"
  ALTER COLUMN "revoked" TYPE timestamptz USING CASE
    WHEN "revoked" IS TRUE THEN "createdAt"
    ELSE NULL
  END;

ALTER TABLE "oauthConsent"
  ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;
