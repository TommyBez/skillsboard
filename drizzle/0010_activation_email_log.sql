CREATE TABLE "emailAutomationSend" (
	"userId" text NOT NULL,
	"automationKey" text NOT NULL,
	"organizationId" text NOT NULL,
	"emailHash" text NOT NULL,
	"providerEmailId" text,
	"sentAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emailAutomationSend_pkey" PRIMARY KEY("userId","automationKey")
);
--> statement-breakpoint
ALTER TABLE "emailAutomationSend" ADD CONSTRAINT "emailAutomationSend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailAutomationSend" ADD CONSTRAINT "emailAutomationSend_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "emailAutomationSend_org_sent_idx" ON "emailAutomationSend" USING btree ("organizationId","sentAt");