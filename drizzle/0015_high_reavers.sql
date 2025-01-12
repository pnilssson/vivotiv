ALTER TABLE "program_metadata" RENAME COLUMN "generated_on" TO "created";--> statement-breakpoint
ALTER TABLE "configuration" ADD COLUMN "created" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "created" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "program" ADD COLUMN "created" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "waiting_list" ADD COLUMN "created" timestamp DEFAULT now() NOT NULL;