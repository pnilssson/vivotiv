ALTER TABLE "scans" RENAME COLUMN "legal_score" TO "trust_security_score";--> statement-breakpoint
ALTER TABLE "scans" DROP COLUMN "security_score";