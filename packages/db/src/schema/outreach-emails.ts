import { desc } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { leads } from "./leads";
import { scans } from "./scans";

export const outreachEmails = pgTable(
  "outreach_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    toEmail: text("to_email").notNull(),
    fromEmail: text("from_email").notNull(),
    replyTo: text("reply_to"),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    resultsUrl: text("results_url").notNull(),
    unsubscribeUrl: text("unsubscribe_url").notNull(),
    provider: text("provider").notNull(),
    providerMessageId: text("provider_message_id"),
    status: text("status").notNull().default("pending"),
    failureReason: text("failure_reason"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_outreach_emails_lead_created").on(
      table.leadId,
      desc(table.createdAt),
    ),
    index("idx_outreach_emails_scan_created").on(
      table.scanId,
      desc(table.createdAt),
    ),
  ],
).enableRLS();
