ALTER TABLE "configuration" DROP CONSTRAINT "configuration_user_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_user_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "program" DROP CONSTRAINT "program_user_id_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_user_id_profile_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;