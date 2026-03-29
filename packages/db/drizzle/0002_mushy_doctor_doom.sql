ALTER TABLE "leads" DROP COLUMN "url";--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_email_unique" UNIQUE("email");