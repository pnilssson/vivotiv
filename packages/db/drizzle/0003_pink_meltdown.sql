CREATE INDEX "idx_scans_lead_id" ON "scans" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_scans_lead_created" ON "scans" USING btree ("lead_id","created_at" desc);