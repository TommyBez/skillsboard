CREATE TABLE "agentConsumedAssertion" (
	"issuer" text NOT NULL,
	"jti" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"consumedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "agentConsumedAssertion_pkey" PRIMARY KEY("issuer","jti")
);
--> statement-breakpoint
CREATE TABLE "agentDelegation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"providerName" text,
	"lastUsedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"revokedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "agentRegistration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"audience" text NOT NULL,
	"clientId" text NOT NULL,
	"email" text,
	"providerName" text,
	"userId" text,
	"requestedScopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" text NOT NULL,
	"claimTokenHash" text,
	"userCode" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agentDelegation" ADD CONSTRAINT "agentDelegation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentRegistration" ADD CONSTRAINT "agentRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agentConsumedAssertion_expiresAt_idx" ON "agentConsumedAssertion" USING btree ("expiresAt");--> statement-breakpoint
CREATE UNIQUE INDEX "agentDelegation_issuer_subject_audience_uidx" ON "agentDelegation" USING btree ("issuer","subject","audience");--> statement-breakpoint
CREATE INDEX "agentDelegation_userId_idx" ON "agentDelegation" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "agentRegistration_userCode_uidx" ON "agentRegistration" USING btree ("userCode");--> statement-breakpoint
CREATE INDEX "agentRegistration_expiresAt_idx" ON "agentRegistration" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "agentRegistration_lookup_idx" ON "agentRegistration" USING btree ("issuer","subject","audience");