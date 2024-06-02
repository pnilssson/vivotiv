CREATE TABLE IF NOT EXISTS "generated" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt" text NOT NULL,
	"generated" json NOT NULL,
	"generatedOn" date DEFAULT now() NOT NULL,
	"userId" uuid
);
--> statement-breakpoint
DROP TABLE "generated_programs";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "generated" ADD CONSTRAINT "generated_userId_profiles_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
