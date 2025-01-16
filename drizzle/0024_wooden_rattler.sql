ALTER TABLE "configuration" DROP CONSTRAINT "configuration_experience_id_experience_id_fk";
--> statement-breakpoint
ALTER TABLE "configuration" ALTER COLUMN "experience_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_experience_id_experience_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE no action ON UPDATE no action;