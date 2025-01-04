CREATE TABLE "waiting_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waiting_list" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Anyone can insert to waiting list" ON "waiting_list" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (true);