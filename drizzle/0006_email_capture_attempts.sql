CREATE TABLE "emailCaptureAttempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ipHash" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "emailCaptureAttempt_ip_created_idx" ON "emailCaptureAttempt" USING btree ("ipHash","createdAt");