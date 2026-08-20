CREATE TABLE "oauthClientAssertion" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauthClientResource" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"resourceId" text NOT NULL,
	"metadata" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauthResource" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"name" text NOT NULL,
	"accessTokenTtl" integer,
	"refreshTokenTtl" integer,
	"signingAlgorithm" text,
	"signingKeyId" text,
	"allowedScopes" text,
	"customClaims" text,
	"dpopBoundAccessTokensRequired" boolean DEFAULT false,
	"disabled" boolean DEFAULT false,
	"policyVersion" integer DEFAULT 1,
	"metadata" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "oauthResource_identifier_key" UNIQUE("identifier")
);
--> statement-breakpoint
ALTER TABLE "oauthConsent" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
-- Better Auth 1.7 identity backfill: this deployment only ever created
-- credential-style accounts (email OTP / password reset), which 1.7 stores
-- under the synthetic "local:credential" issuer. Any other providerId would
-- come from an OAuth provider without its own issuer, which 1.7 namespaces
-- as "local:oauth:<providerId>".
UPDATE "account" SET "issuer" = CASE
	WHEN "providerId" = 'credential' THEN 'local:credential'
	ELSE 'local:oauth:' || "providerId"
END WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "alg" text;--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "crv" text;--> statement-breakpoint
ALTER TABLE "oauthAccessToken" ADD COLUMN "authorizationCodeId" text;--> statement-breakpoint
ALTER TABLE "oauthAccessToken" ADD COLUMN "resources" text;--> statement-breakpoint
ALTER TABLE "oauthAccessToken" ADD COLUMN "requestedUserInfoClaims" text;--> statement-breakpoint
ALTER TABLE "oauthAccessToken" ADD COLUMN "revoked" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oauthAccessToken" ADD COLUMN "confirmation" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "clientDiscoveryId" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "clientCredentialsScopes" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "backchannelLogoutUri" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "backchannelLogoutSessionRequired" boolean;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "applicationType" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "jwks" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "jwksUri" text;--> statement-breakpoint
ALTER TABLE "oauthClient" ADD COLUMN "dpopBoundAccessTokens" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "oauthConsent" ADD COLUMN "resources" text;--> statement-breakpoint
ALTER TABLE "oauthConsent" ADD COLUMN "requestedUserInfoClaims" text;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "authorizationCodeId" text;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "resources" text;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "requestedUserInfoClaims" text;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "rotatedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "rotationReplayResponse" text;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "rotationReplayExpiresAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "oauthRefreshToken" ADD COLUMN "confirmation" text;--> statement-breakpoint
ALTER TABLE "oauthClientResource" ADD CONSTRAINT "oauthClientResource_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."oauthClient"("clientId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauthClientResource" ADD CONSTRAINT "oauthClientResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."oauthResource"("identifier") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "oauthClientResource_clientId_resourceId_uidx" ON "oauthClientResource" USING btree ("clientId","resourceId");--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","accountId");--> statement-breakpoint
CREATE INDEX "oauthAccessToken_authorizationCodeId_idx" ON "oauthAccessToken" USING btree ("authorizationCodeId");--> statement-breakpoint
CREATE INDEX "oauthRefreshToken_authorizationCodeId_idx" ON "oauthRefreshToken" USING btree ("authorizationCodeId");