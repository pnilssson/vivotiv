DROP POLICY "Authenticated can handle warmupToExercise" ON "warmup_to_warmup_exercise" CASCADE;--> statement-breakpoint
DROP TABLE "warmup_to_warmup_exercise" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated can handle workoutToExercise" ON "workout_to_workout_exercise" CASCADE;--> statement-breakpoint
DROP TABLE "workout_to_workout_exercise" CASCADE;--> statement-breakpoint
ALTER TABLE "program_metadata" DROP CONSTRAINT "program_metadata_program_id_program_id_fk";
--> statement-breakpoint
ALTER TABLE "warmup_exercise" ADD COLUMN "warmup_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "workout_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "program_metadata" ADD CONSTRAINT "program_metadata_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_exercise" ADD CONSTRAINT "warmup_exercise_warmup_id_warmup_id_fk" FOREIGN KEY ("warmup_id") REFERENCES "public"."warmup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD CONSTRAINT "workout_exercise_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;