ALTER TABLE "collectionDistribution" DROP CONSTRAINT "collectionDistribution_activeReleaseId_fkey";
--> statement-breakpoint
ALTER TABLE "collectionRelease" ADD CONSTRAINT "collectionRelease_collectionId_id_key" UNIQUE("collectionId","id");--> statement-breakpoint
ALTER TABLE "collectionDistribution" ADD CONSTRAINT "collectionDistribution_activeReleaseId_fkey" FOREIGN KEY ("collectionId","activeReleaseId") REFERENCES "public"."collectionRelease"("collectionId","id") ON DELETE restrict ON UPDATE no action;
