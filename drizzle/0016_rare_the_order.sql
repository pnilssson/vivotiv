DROP POLICY "User can handle their own programs metadata" ON "program_metadata" CASCADE;--> statement-breakpoint
ALTER TABLE "program_metadata" DROP CONSTRAINT "program_metadata_user_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "program_metadata" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "program_metadata" DROP COLUMN "created";--> statement-breakpoint
CREATE POLICY "Authenticated can handle program metadata" ON "program_metadata" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);