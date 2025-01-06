ALTER TABLE "program_metadata" ADD COLUMN "prompt_tokens" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "program_metadata" ADD COLUMN "completion_tokens" integer NOT NULL;