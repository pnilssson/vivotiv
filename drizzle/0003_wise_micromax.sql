ALTER TABLE "configuration" ADD COLUMN "generate_automatically" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "stripe_customer_id" text;