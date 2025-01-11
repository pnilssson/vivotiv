DROP POLICY "Authenticated can handle configurationsToEnvironment" ON "configuration_to_environment" CASCADE;--> statement-breakpoint
DROP TABLE "configuration_to_environment" CASCADE;--> statement-breakpoint
DROP POLICY "Authenticated can handle environment" ON "environment" CASCADE;--> statement-breakpoint
DROP TABLE "environment" CASCADE;