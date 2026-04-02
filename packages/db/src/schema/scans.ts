import { desc, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { leads } from "./leads";

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    overallScore: integer("overall_score"),
    performanceScore: integer("performance_score"),
    seoScore: integer("seo_score"),
    accessibilityScore: integer("accessibility_score"),
    trustSecurityScore: integer("trust_security_score"),
    standardsScore: integer("standards_score"),
    aiReadinessScore: integer("ai_readiness_score"),
    source: text("source").notNull().default(sql`'scan'`),
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_scans_lead_id").on(table.leadId),
    index("idx_scans_lead_created").on(
      table.leadId,
      desc(table.createdAt),
    ),
  ],
).enableRLS();
