ALTER TABLE "leads" ADD COLUMN "unsubscribed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scans" ADD COLUMN "source" text DEFAULT 'scan' NOT NULL;