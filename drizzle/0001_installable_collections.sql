CREATE TABLE "collectionDistribution" (
	"collectionId" uuid PRIMARY KEY NOT NULL,
	"shareId" text NOT NULL,
	"activeReleaseId" uuid,
	"activeRevision" integer DEFAULT 0 NOT NULL,
	"publishedAt" timestamp with time zone,
	"revokedAt" timestamp with time zone,
	"createdBy" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "collectionDistribution_shareId_key" UNIQUE("shareId")
);
--> statement-breakpoint
CREATE TABLE "collectionRelease" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collectionId" uuid NOT NULL,
	"revision" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"createdBy" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "collectionRelease_collectionId_revision_key" UNIQUE("collectionId","revision")
);
--> statement-breakpoint
CREATE TABLE "collectionReleaseSkill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"releaseId" uuid NOT NULL,
	"sourceSkillId" uuid,
	"position" integer NOT NULL,
	"skillName" text NOT NULL,
	"description" text NOT NULL,
	"githubUrl" text NOT NULL,
	"repoOwner" text NOT NULL,
	"repoName" text NOT NULL,
	"skillPath" text NOT NULL,
	"commitSha" text NOT NULL,
	"artifactDigest" text NOT NULL,
	"artifactBase64" text NOT NULL,
	"artifactBytes" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "collectionReleaseSkill_releaseId_skillName_key" UNIQUE("releaseId","skillName")
);
--> statement-breakpoint
ALTER TABLE "collectionDistribution" ADD CONSTRAINT "collectionDistribution_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collectionDistribution" ADD CONSTRAINT "collectionDistribution_activeReleaseId_fkey" FOREIGN KEY ("activeReleaseId") REFERENCES "public"."collectionRelease"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collectionRelease" ADD CONSTRAINT "collectionRelease_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collectionReleaseSkill" ADD CONSTRAINT "collectionReleaseSkill_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "public"."collectionRelease"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collectionReleaseSkill_releaseId_position_idx" ON "collectionReleaseSkill" USING btree ("releaseId","position");