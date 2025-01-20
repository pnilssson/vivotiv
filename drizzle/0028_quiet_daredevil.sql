CREATE TABLE "exercise_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"promptDescription" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "exercise_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_exercise_type_id_exercise_type_id_fk" FOREIGN KEY ("exercise_type_id") REFERENCES "public"."exercise_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Supabase auth admin can handle exercise types" ON "exercise_type" AS PERMISSIVE FOR ALL TO "supabase_auth_admin" WITH CHECK (true);