CREATE TABLE "warmup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"description" text NOT NULL,
	"workout_id" uuid
);
--> statement-breakpoint
ALTER TABLE "warmup" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "warmup_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"execution" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "warmup_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "warmup_to_exercise" (
	"warmup_id" uuid,
	"exercise_id" uuid,
	CONSTRAINT "warmup_to_exercise_warmup_id_exercise_id_pk" PRIMARY KEY("warmup_id","exercise_id")
);
--> statement-breakpoint
ALTER TABLE "warmup_to_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"completed" boolean NOT NULL,
	"description" text NOT NULL,
	"program_id" uuid
);
--> statement-breakpoint
ALTER TABLE "workout" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"execution" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workout_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "workout_to_exercise" (
	"workout_id" uuid,
	"exercise_id" uuid,
	CONSTRAINT "workout_to_exercise_workout_id_exercise_id_pk" PRIMARY KEY("workout_id","exercise_id")
);
--> statement-breakpoint
ALTER TABLE "workout_to_exercise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "Authenticated can handle configurationToWorkoutFocus" ON "configuration_to_workout_focus" CASCADE;--> statement-breakpoint
DROP TABLE "configuration_to_workout_focus" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated can handle workout focus" ON "workout_focus" CASCADE;--> statement-breakpoint
DROP TABLE "workout_focus" CASCADE;--> statement-breakpoint
ALTER TABLE "warmup" ADD CONSTRAINT "warmup_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_to_exercise" ADD CONSTRAINT "warmup_to_exercise_warmup_id_warmup_id_fk" FOREIGN KEY ("warmup_id") REFERENCES "public"."warmup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_to_exercise" ADD CONSTRAINT "warmup_to_exercise_exercise_id_warmup_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."warmup_exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout" ADD CONSTRAINT "workout_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_to_exercise" ADD CONSTRAINT "workout_to_exercise_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_to_exercise" ADD CONSTRAINT "workout_to_exercise_exercise_id_workout_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workout_exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" DROP COLUMN "version";--> statement-breakpoint
CREATE POLICY "User can handle their own programs" ON "profile" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "Authenticated can handle warmup" ON "warmup" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle warmupExercise" ON "warmup_exercise" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle warmupToExercise" ON "warmup_to_exercise" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle workout" ON "workout" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle workoutExercise" ON "workout_exercise" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle workoutToExercise" ON "workout_to_exercise" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);