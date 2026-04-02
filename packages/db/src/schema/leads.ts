import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  unsubscribed: boolean("unsubscribed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS();
