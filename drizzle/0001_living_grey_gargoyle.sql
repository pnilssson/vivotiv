ALTER TABLE "configuration_to_available_space" RENAME TO "configuration_to_environment";--> statement-breakpoint
ALTER TABLE "available_space" RENAME TO "environment";--> statement-breakpoint
ALTER TABLE "configuration_to_environment" RENAME COLUMN "available_space_id" TO "environment_id";--> statement-breakpoint
ALTER TABLE "configuration_to_environment" DROP CONSTRAINT "configuration_to_available_space_configuration_id_configuration_id_fk";
--> statement-breakpoint
ALTER TABLE "configuration_to_environment" DROP CONSTRAINT "configuration_to_available_space_available_space_id_available_space_id_fk";
--> statement-breakpoint
ALTER TABLE "configuration_to_environment" DROP CONSTRAINT "configuration_to_available_space_configuration_id_available_space_id_pk";--> statement-breakpoint
ALTER TABLE "configuration_to_environment" ADD CONSTRAINT "configuration_to_environment_configuration_id_environment_id_pk" PRIMARY KEY("configuration_id","environment_id");--> statement-breakpoint
ALTER TABLE "configuration_to_environment" ADD CONSTRAINT "configuration_to_environment_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_to_environment" ADD CONSTRAINT "configuration_to_environment_environment_id_environment_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."environment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER POLICY "Authenticated can handle available space" ON "environment" RENAME TO "Authenticated can handle environment";--> statement-breakpoint
ALTER POLICY "Authenticated can handle configurationsToAvailableSpace" ON "configuration_to_environment" RENAME TO "Authenticated can handle configurationsToEnvironment";