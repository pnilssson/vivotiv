import {
  pgTable,
  uuid,
  text,
  date,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// Foerign key from profiles.id to auth.users.id has been added manually in the supabase UI as it wasn't possible to configure it here
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  programTokens: integer("programTokens").notNull().default(0),
});

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  userId: uuid("userId").references(() => profiles.id),
  workouts: jsonb("workouts").notNull(),
  version: integer("version").notNull(),
  archived: boolean("archived").notNull().default(false),
});

export const programs_metadata = pgTable("programs_metadata", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("userId").references(() => profiles.id),
  prompt: text("prompt").notNull(),
  programId: uuid("programId").references(() => programs.id),
  generatedOn: date("generatedOn").notNull().defaultNow(),
});
