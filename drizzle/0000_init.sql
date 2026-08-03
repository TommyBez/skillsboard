-- Initial migration for the complete schema at the versioned-migration
-- cutover. Tables, indexes, and foreign keys are guarded (IF NOT EXISTS /
-- duplicate_object), so it applies both to fresh databases and to pre-existing
-- Neon branches created with `drizzle-kit push`. On an existing table, columns,
-- constraints, and defaults are assumed to already match.
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" text NOT NULL,
	"createdBy" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectionSkill" (
	"collectionId" uuid NOT NULL,
	"skillId" uuid NOT NULL,
	"addedBy" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "collectionSkill_pkey" PRIMARY KEY("collectionId","skillId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"inviterId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthAccessToken" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"clientId" text NOT NULL,
	"sessionId" text,
	"refreshId" text,
	"userId" text,
	"referenceId" text,
	"scopes" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "oauthAccessToken_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthClient" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"clientSecret" text,
	"disabled" boolean DEFAULT false,
	"skipConsent" boolean DEFAULT false,
	"enableEndSession" boolean,
	"subjectType" text,
	"scopes" text,
	"userId" text,
	"referenceId" text,
	"name" text,
	"uri" text,
	"icon" text,
	"contacts" text,
	"tos" text,
	"policy" text,
	"softwareId" text,
	"softwareVersion" text,
	"softwareStatement" text,
	"redirectUris" text NOT NULL,
	"postLogoutRedirectUris" text,
	"tokenEndpointAuthMethod" text,
	"grantTypes" text,
	"responseTypes" text,
	"public" boolean,
	"type" text,
	"requirePKCE" boolean,
	"metadata" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "oauthClient_clientId_key" UNIQUE("clientId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthConsent" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"clientId" text NOT NULL,
	"referenceId" text,
	"scopes" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauthRefreshToken" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"clientId" text NOT NULL,
	"sessionId" text,
	"userId" text NOT NULL,
	"referenceId" text,
	"scopes" text NOT NULL,
	"revoked" timestamp with time zone,
	"authTime" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "oauthRefreshToken_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" text,
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "organization_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"activeOrganizationId" text,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" text NOT NULL,
	"createdBy" text NOT NULL,
	"githubUrl" text NOT NULL,
	"skillName" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"repoOwner" text NOT NULL,
	"repoName" text NOT NULL,
	"repoStars" integer DEFAULT 0 NOT NULL,
	"repoUpdatedAt" timestamp with time zone,
	"skillPath" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"note" text,
	"examplePrompts" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"metadataRefreshedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectionSkill" ADD CONSTRAINT "collectionSkill_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectionSkill" ADD CONSTRAINT "collectionSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthAccessToken" ADD CONSTRAINT "oauthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."oauthClient"("clientId") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthConsent" ADD CONSTRAINT "oauthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."oauthClient"("clientId") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauthRefreshToken" ADD CONSTRAINT "oauthRefreshToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."oauthClient"("clientId") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_org_created_idx" ON "collection" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collectionSkill_skill_idx" ON "collectionSkill" USING btree ("skillId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "member_org_user_unique" ON "member" USING btree ("organizationId","userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "skill_org_created_idx" ON "skill" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "skill_org_repo_name_unique" ON "skill" USING btree ("organizationId","githubUrl","skillName");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailConsentEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text,
	"emailHash" text NOT NULL,
	"topic" text NOT NULL,
	"action" text NOT NULL,
	"source" text NOT NULL,
	"noticeVersion" text NOT NULL,
	"noticeText" text NOT NULL,
	"providerReference" text,
	"occurredAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailPreference" (
	"userId" text NOT NULL,
	"topic" text NOT NULL,
	"emailHash" text NOT NULL,
	"subscribed" boolean DEFAULT false NOT NULL,
	"source" text NOT NULL,
	"noticeVersion" text NOT NULL,
	"noticeText" text NOT NULL,
	"unsubscribeToken" text,
	"consentedAt" timestamp with time zone,
	"withdrawnAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emailPreference_pkey" PRIMARY KEY("userId","topic")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailProactiveDelivery" (
	"providerEmailId" text NOT NULL,
	"emailHash" text NOT NULL,
	"providerBroadcastId" text NOT NULL,
	"sentAt" timestamp with time zone NOT NULL,
	"receivedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emailProactiveDelivery_pkey" PRIMARY KEY("providerEmailId","emailHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailProviderContactState" (
	"provider" text NOT NULL,
	"emailHash" text NOT NULL,
	"unsubscribed" boolean NOT NULL,
	"providerReference" text,
	"providerOccurredAt" timestamp with time zone NOT NULL,
	"observedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emailProviderContactState_pkey" PRIMARY KEY("provider","emailHash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailSuppression" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emailHash" text NOT NULL,
	"scope" text NOT NULL,
	"reason" text NOT NULL,
	"source" text NOT NULL,
	"sourceReference" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp with time zone DEFAULT now() NOT NULL,
	"liftedAt" timestamp with time zone,
	"liftedSource" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "emailWebhookEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payloadHash" text NOT NULL,
	"providerEmailId" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"providerCreatedAt" timestamp with time zone,
	"receivedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"processedAt" timestamp with time zone,
	"lastError" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emailConsentEvent" ADD CONSTRAINT "emailConsentEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "emailPreference" ADD CONSTRAINT "emailPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailConsentEvent_email_topic_idx" ON "emailConsentEvent" USING btree ("emailHash","topic","occurredAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailConsentEvent_user_idx" ON "emailConsentEvent" USING btree ("userId","occurredAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailPreference_topic_subscribed_idx" ON "emailPreference" USING btree ("topic","subscribed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailProactiveDelivery_email_sent_idx" ON "emailProactiveDelivery" USING btree ("emailHash","sentAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailProviderContactState_email_idx" ON "emailProviderContactState" USING btree ("emailHash","providerOccurredAt");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailSuppression_email_scope_reason_unique" ON "emailSuppression" USING btree ("emailHash","scope","reason");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "emailSuppression_active_lookup_idx" ON "emailSuppression" USING btree ("emailHash","active","scope");
