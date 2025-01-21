ALTER TABLE "profile" ADD COLUMN "generating" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER POLICY "Authenticated can handle warmupExercise" ON "warmup_exercise" RENAME TO "Authenticated can handle warmup exercise";--> statement-breakpoint
ALTER POLICY "Authenticated can handle workoutExercise" ON "workout_exercise" RENAME TO "Authenticated can handle workout exercise";