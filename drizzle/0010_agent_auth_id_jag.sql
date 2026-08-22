CREATE TABLE "agentAssertionReplay" (
	"jti" text NOT NULL,
	"purpose" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"seenAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "agentAssertionReplay_pkey" PRIMARY KEY("purpose","jti")
);
--> statement-breakpoint
CREATE TABLE "agentClaim" (
	"id" text PRIMARY KEY NOT NULL,
	"registrationId" text NOT NULL,
	"viewTokenHash" text NOT NULL,
	"viewExpiresAt" timestamp with time zone NOT NULL,
	"userCodeHash" text NOT NULL,
	"userCodeExpiresAt" timestamp with time zone NOT NULL,
	"loginHintEmail" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completedAt" timestamp with time zone,
	"completedByUserId" text
);
--> statement-breakpoint
CREATE TABLE "agentCredentialRevocation" (
	"jti" text PRIMARY KEY NOT NULL,
	"registrationId" text,
	"reason" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"revokedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentDelegation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"providerName" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lastSeenAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"revokedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agentRegistration" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"userId" text,
	"delegationId" uuid,
	"requestedScopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" text NOT NULL,
	"loginHintEmail" text,
	"claimTokenHash" text,
	"claimTokenExpiresAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expiresAt" timestamp with time zone,
	"completedAt" timestamp with time zone,
	"revokedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agentClaim" ADD CONSTRAINT "agentClaim_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."agentRegistration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentDelegation" ADD CONSTRAINT "agentDelegation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentRegistration" ADD CONSTRAINT "agentRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentRegistration" ADD CONSTRAINT "agentRegistration_delegationId_fkey" FOREIGN KEY ("delegationId") REFERENCES "public"."agentDelegation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agentAssertionReplay_expiry_idx" ON "agentAssertionReplay" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "agentClaim_viewTokenHash_unique" ON "agentClaim" USING btree ("viewTokenHash");--> statement-breakpoint
CREATE INDEX "agentClaim_registration_idx" ON "agentClaim" USING btree ("registrationId","createdAt");--> statement-breakpoint
CREATE INDEX "agentCredentialRevocation_expiry_idx" ON "agentCredentialRevocation" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "agentDelegation_identity_unique" ON "agentDelegation" USING btree ("issuer","subject","audience");--> statement-breakpoint
CREATE INDEX "agentDelegation_user_idx" ON "agentDelegation" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "agentRegistration_identity_unique" ON "agentRegistration" USING btree ("issuer","subject","audience");--> statement-breakpoint
CREATE UNIQUE INDEX "agentRegistration_claimTokenHash_unique" ON "agentRegistration" USING btree ("claimTokenHash");--> statement-breakpoint
CREATE INDEX "agentRegistration_user_idx" ON "agentRegistration" USING btree ("userId");