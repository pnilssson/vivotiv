ALTER TABLE "configuration" DROP CONSTRAINT "configuration_user_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE set null ON UPDATE no action;