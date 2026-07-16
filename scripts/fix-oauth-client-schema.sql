-- Align OAuth tables with @better-auth/oauth-provider + Kysely adapter.
-- The Kysely adapter sets supportsArrays=false, so string[] fields are stored
-- as JSON text (not Postgres text[]).
--
-- Safe for:
--   1) original minimal oauthClient schema (jsonb redirectUris, few columns)
--   2) partial oauth-provider migration (text[] array columns)
--   3) already-migrated schemas (idempotent no-op)

-- Ensure every oauth-provider client column exists first.
ALTER TABLE "oauthClient"
  ADD COLUMN IF NOT EXISTS "skipConsent" boolean,
  ADD COLUMN IF NOT EXISTS "enableEndSession" boolean,
  ADD COLUMN IF NOT EXISTS "subjectType" text,
  ADD COLUMN IF NOT EXISTS "scopes" text,
  ADD COLUMN IF NOT EXISTS "referenceId" text,
  ADD COLUMN IF NOT EXISTS "uri" text,
  ADD COLUMN IF NOT EXISTS "icon" text,
  ADD COLUMN IF NOT EXISTS "contacts" text,
  ADD COLUMN IF NOT EXISTS "tos" text,
  ADD COLUMN IF NOT EXISTS "policy" text,
  ADD COLUMN IF NOT EXISTS "softwareId" text,
  ADD COLUMN IF NOT EXISTS "softwareVersion" text,
  ADD COLUMN IF NOT EXISTS "softwareStatement" text,
  ADD COLUMN IF NOT EXISTS "postLogoutRedirectUris" text,
  ADD COLUMN IF NOT EXISTS "tokenEndpointAuthMethod" text,
  ADD COLUMN IF NOT EXISTS "grantTypes" text,
  ADD COLUMN IF NOT EXISTS "responseTypes" text,
  ADD COLUMN IF NOT EXISTS "public" boolean,
  ADD COLUMN IF NOT EXISTS "requirePKCE" boolean;

ALTER TABLE "oauthAccessToken" ADD COLUMN IF NOT EXISTS "sessionId" text;
ALTER TABLE "oauthAccessToken" ADD COLUMN IF NOT EXISTS "refreshId" text;
ALTER TABLE "oauthAccessToken" ADD COLUMN IF NOT EXISTS "referenceId" text;
ALTER TABLE "oauthRefreshToken" ADD COLUMN IF NOT EXISTS "sessionId" text;
ALTER TABLE "oauthRefreshToken" ADD COLUMN IF NOT EXISTS "referenceId" text;
ALTER TABLE "oauthRefreshToken" ADD COLUMN IF NOT EXISTS "authTime" timestamptz;
ALTER TABLE "oauthConsent" ADD COLUMN IF NOT EXISTS "referenceId" text;

-- Convert string[]-backed columns to JSON text when they are still arrays/jsonb.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'scopes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'scopes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "scopes" TYPE text USING "scopes"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'redirectUris' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "redirectUris" TYPE text USING to_json("redirectUris")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'redirectUris' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "redirectUris" TYPE text USING "redirectUris"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'postLogoutRedirectUris' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "postLogoutRedirectUris" TYPE text
      USING CASE
        WHEN "postLogoutRedirectUris" IS NULL THEN NULL
        ELSE to_json("postLogoutRedirectUris")::text
      END;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'postLogoutRedirectUris' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "postLogoutRedirectUris" TYPE text USING "postLogoutRedirectUris"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'grantTypes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "grantTypes" TYPE text USING to_json("grantTypes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'grantTypes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "grantTypes" TYPE text USING "grantTypes"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'responseTypes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "responseTypes" TYPE text USING to_json("responseTypes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'responseTypes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "responseTypes" TYPE text USING "responseTypes"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'contacts' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "contacts" TYPE text USING to_json("contacts")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthClient'
      AND column_name = 'contacts' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthClient"
      ALTER COLUMN "contacts" TYPE text USING "contacts"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthAccessToken'
      AND column_name = 'scopes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthAccessToken"
      ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthAccessToken'
      AND column_name = 'scopes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthAccessToken"
      ALTER COLUMN "scopes" TYPE text USING "scopes"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthRefreshToken'
      AND column_name = 'scopes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthRefreshToken"
      ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthRefreshToken'
      AND column_name = 'scopes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthRefreshToken"
      ALTER COLUMN "scopes" TYPE text USING "scopes"::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthConsent'
      AND column_name = 'scopes' AND udt_name = '_text'
  ) THEN
    ALTER TABLE "oauthConsent"
      ALTER COLUMN "scopes" TYPE text USING to_json("scopes")::text;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthConsent'
      AND column_name = 'scopes' AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "oauthConsent"
      ALTER COLUMN "scopes" TYPE text USING "scopes"::text;
  END IF;

  -- Plugin models revoked as a date (revocation timestamp), not a boolean
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'oauthRefreshToken'
      AND column_name = 'revoked' AND data_type = 'boolean'
  ) THEN
    ALTER TABLE "oauthRefreshToken" ALTER COLUMN "revoked" DROP DEFAULT;
    ALTER TABLE "oauthRefreshToken"
      ALTER COLUMN "revoked" TYPE timestamptz USING CASE
        WHEN "revoked" IS TRUE THEN "createdAt"
        ELSE NULL
      END;
  END IF;
END $$;
