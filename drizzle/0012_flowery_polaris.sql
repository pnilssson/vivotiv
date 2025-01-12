ALTER TABLE "warmup_to_exercise" RENAME TO "warmup_to_warmup_exercise";--> statement-breakpoint
ALTER TABLE "workout_to_exercise" RENAME TO "workout_to_workout_exercise";--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" DROP CONSTRAINT "warmup_to_exercise_warmup_id_warmup_id_fk";
--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" DROP CONSTRAINT "warmup_to_exercise_exercise_id_warmup_exercise_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" DROP CONSTRAINT "workout_to_exercise_workout_id_workout_id_fk";
--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" DROP CONSTRAINT "workout_to_exercise_exercise_id_workout_exercise_id_fk";
--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" DROP CONSTRAINT "warmup_to_exercise_warmup_id_exercise_id_pk";--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" DROP CONSTRAINT "workout_to_exercise_workout_id_exercise_id_pk";--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" ADD CONSTRAINT "warmup_to_warmup_exercise_warmup_id_exercise_id_pk" PRIMARY KEY("warmup_id","exercise_id");--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" ADD CONSTRAINT "workout_to_workout_exercise_workout_id_exercise_id_pk" PRIMARY KEY("workout_id","exercise_id");--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" ADD CONSTRAINT "warmup_to_warmup_exercise_warmup_id_warmup_id_fk" FOREIGN KEY ("warmup_id") REFERENCES "public"."warmup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warmup_to_warmup_exercise" ADD CONSTRAINT "warmup_to_warmup_exercise_exercise_id_warmup_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."warmup_exercise"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" ADD CONSTRAINT "workout_to_workout_exercise_workout_id_workout_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workout"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_to_workout_exercise" ADD CONSTRAINT "workout_to_workout_exercise_exercise_id_workout_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workout_exercise"("id") ON DELETE cascade ON UPDATE no action;