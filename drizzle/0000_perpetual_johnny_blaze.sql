-- CREATE TABLE "auth"."users" (
-- 	"id" uuid PRIMARY KEY NOT NULL
-- );
--> statement-breakpoint
CREATE TABLE "available_space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "available_space" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "configuration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"sessions" integer NOT NULL,
	"time" integer NOT NULL,
	"equipment" text
);
--> statement-breakpoint
ALTER TABLE "configuration" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "configuration_to_available_space" (
	"configuration_id" uuid NOT NULL,
	"available_space_id" uuid NOT NULL,
	CONSTRAINT "configuration_to_available_space_configuration_id_available_space_id_pk" PRIMARY KEY("configuration_id","available_space_id")
);
--> statement-breakpoint
ALTER TABLE "configuration_to_available_space" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "configuration_to_workout_focus" (
	"configuration_id" uuid NOT NULL,
	"workout_focus_id" uuid NOT NULL,
	CONSTRAINT "configuration_to_workout_focus_configuration_id_workout_focus_id_pk" PRIMARY KEY("configuration_id","workout_focus_id")
);
--> statement-breakpoint
ALTER TABLE "configuration_to_workout_focus" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "configuration_to_workout_type" (
	"configuration_id" uuid NOT NULL,
	"workout_type_id" uuid NOT NULL,
	CONSTRAINT "configuration_to_workout_type_configuration_id_workout_type_id_pk" PRIMARY KEY("configuration_id","workout_type_id")
);
--> statement-breakpoint
ALTER TABLE "configuration_to_workout_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"program_tokens" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"user_id" uuid NOT NULL,
	"workouts" jsonb NOT NULL,
	"version" integer NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "program_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"program_id" uuid,
	"generated_on" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "program_metadata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_focus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "workout_focus" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "workout_type" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_available_space" ADD CONSTRAINT "configuration_to_available_space_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_available_space" ADD CONSTRAINT "configuration_to_available_space_available_space_id_available_space_id_fk" FOREIGN KEY ("available_space_id") REFERENCES "public"."available_space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_workout_focus" ADD CONSTRAINT "configuration_to_workout_focus_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_workout_focus" ADD CONSTRAINT "configuration_to_workout_focus_workout_focus_id_workout_focus_id_fk" FOREIGN KEY ("workout_focus_id") REFERENCES "public"."workout_focus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_workout_type" ADD CONSTRAINT "configuration_to_workout_type_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_workout_type" ADD CONSTRAINT "configuration_to_workout_type_workout_type_id_workout_type_id_fk" FOREIGN KEY ("workout_type_id") REFERENCES "public"."workout_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_metadata" ADD CONSTRAINT "program_metadata_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_metadata" ADD CONSTRAINT "program_metadata_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Authenticated can handle available space" ON "available_space" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "User can handle their own configurations" ON "configuration" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "Authenticated can handle configurationsToAvailableSpace" ON "configuration_to_available_space" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle configurationToWorkoutFocus" ON "configuration_to_workout_focus" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle configurationsToWorkoutTypes" ON "configuration_to_workout_type" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can view all profiles" ON "profile" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Supabase auth admin can insert profile" ON "profile" AS PERMISSIVE FOR INSERT TO "supabase_auth_admin" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "User can handle their own programs" ON "program" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "User can handle their own programs metadata" ON "program_metadata" AS PERMISSIVE FOR ALL TO "authenticated" USING ((select auth.uid()) = user_id);--> statement-breakpoint
CREATE POLICY "Authenticated can handle workout focus" ON "workout_focus" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle workout types" ON "workout_type" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);