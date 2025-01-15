CREATE TABLE "experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "configuration" ADD COLUMN "experience_id" uuid;--> statement-breakpoint
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER POLICY "Authenticated can handle preferredDay" ON "preferred_day" RENAME TO "Supabase auth admin can handle preferred day";--> statement-breakpoint
ALTER POLICY "Authenticated can handle program metadata" ON "program_metadata" RENAME TO "Supabase auth admin can handle program metadata";--> statement-breakpoint
ALTER POLICY "Authenticated can handle workout types" ON "workout_type" RENAME TO "Supabase auth admin can handle workout types";--> statement-breakpoint
CREATE POLICY "Supabase auth admin can handle experience" ON "experience" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" WITH CHECK (true);