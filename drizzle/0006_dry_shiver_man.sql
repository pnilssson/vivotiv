CREATE TABLE "configuration_to_preferred_day" (
	"configuration_id" uuid NOT NULL,
	"preferred_day_id" uuid NOT NULL,
	CONSTRAINT "configuration_to_preferred_day_configuration_id_preferred_day_id_pk" PRIMARY KEY("configuration_id","preferred_day_id")
);
--> statement-breakpoint
ALTER TABLE "configuration_to_preferred_day" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "preferred_day" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text
);
--> statement-breakpoint
ALTER TABLE "preferred_day" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "configuration_to_preferred_day" ADD CONSTRAINT "configuration_to_preferred_day_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_preferred_day" ADD CONSTRAINT "configuration_to_preferred_day_preferred_day_id_preferred_day_id_fk" FOREIGN KEY ("preferred_day_id") REFERENCES "public"."preferred_day"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Authenticated can handle configurationsToPreferredDay" ON "configuration_to_preferred_day" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Authenticated can handle preferredDay" ON "preferred_day" AS PERMISSIVE FOR ALL TO "authenticated" USING (true);