ALTER TABLE "programs" RENAME COLUMN "program" TO "workouts";--> statement-breakpoint
ALTER TABLE "programs" DROP COLUMN IF EXISTS "prompt";