ALTER TABLE "emailAutomationSend" DROP CONSTRAINT "emailAutomationSend_organizationId_fkey";
--> statement-breakpoint
ALTER TABLE "emailAutomationSend" ALTER COLUMN "organizationId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "emailAutomationSend" ADD CONSTRAINT "emailAutomationSend_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;