import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  jsonb,
  integer,
  boolean,
  primaryKey,
  pgRole,
  pgSchema,
  foreignKey,
  pgPolicy,
} from "drizzle-orm/pg-core";

// drizzle-orm/supabase
export const anonRole = pgRole("anon").existing();
export const authenticatedRole = pgRole("authenticated").existing();
export const serviceRole = pgRole("service_role").existing();
export const postgresRole = pgRole("postgres_role").existing();
export const supabaseAuthAdminRole = pgRole("supabase_auth_admin").existing();

export const authUid = sql`(select auth.uid())`;
const auth = pgSchema("auth");
export const authUsers = auth.table("users", {
  id: uuid().primaryKey().notNull(),
});

// Vivotiv
export const profile = pgTable(
  "profile",
  {
    id: uuid().primaryKey().notNull(),
    name: text(),
    email: text().notNull(),
    stripe_customer_id: text(),
    program_tokens: integer().notNull().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      // reference to the auth table from Supabase
      foreignColumns: [authUsers.id],
      name: "profile_id_fk",
    }).onDelete("cascade"),
    pgPolicy("Authenticated can view all profiles", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("Supabase auth admin can insert profile", {
      for: "insert",
      to: supabaseAuthAdminRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const profileRelations = relations(profile, ({ many }) => ({
  programs: many(program),
  programsMetadata: many(programMetadata),
  configurations: many(configuration),
}));

export const waitingList = pgTable(
  "waiting_list",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
  },
  (table) => [
    pgPolicy("Anyone can insert to waiting list", {
      for: "insert",
      to: anonRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const program = pgTable(
  "program",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    start_date: date().notNull(),
    end_date: date().notNull(),
    user_id: uuid()
      .notNull()
      .references(() => profile.id),
    workouts: jsonb().notNull(),
    version: integer().notNull(),
    archived: boolean().notNull().default(false),
  },
  (table) => [
    pgPolicy("User can handle their own programs", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = user_id`,
    }),
  ]
).enableRLS();

export const programRelations = relations(program, ({ one }) => ({
  profile: one(profile, {
    fields: [program.user_id],
    references: [profile.id],
  }),
  metadata: one(programMetadata, {
    fields: [program.id],
    references: [programMetadata.id],
  }),
}));

export const programMetadata = pgTable(
  "program_metadata",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid()
      .notNull()
      .references(() => profile.id),
    prompt: text().notNull(),
    prompt_tokens: integer().notNull(),
    completion_tokens: integer().notNull(),
    program_id: uuid().references(() => program.id),
    generated_on: date().notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("User can handle their own programs metadata", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = user_id`,
    }),
  ]
).enableRLS();

export const programMetadataRelations = relations(
  programMetadata,
  ({ one }) => ({
    profile: one(profile, {
      fields: [programMetadata.user_id],
      references: [profile.id],
    }),
    program: one(program, {
      fields: [programMetadata.id],
      references: [program.id],
    }),
  })
);

export const configuration = pgTable(
  "configuration",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => profile.id),
    sessions: integer().notNull(),
    time: integer().notNull(),
    equipment: text(),
    generate_automatically: boolean().notNull().default(false),
  },
  (table) => [
    pgPolicy("User can handle their own configurations", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = user_id`,
    }),
  ]
).enableRLS();

export const configurationRelations = relations(configuration, ({ many }) => ({
  workoutFocuses: many(configurationToWorkoutFocus),
  workoutTypes: many(configurationToWorkoutType),
  environments: many(configurationToEnvironment),
}));

export const workoutFocus = pgTable(
  "workout_focus",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
  },
  (table) => [
    pgPolicy("Authenticated can handle workout focus", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const workoutFocusRelations = relations(workoutFocus, ({ many }) => ({
  configurations: many(configurationToWorkoutFocus),
}));

export const workoutType = pgTable(
  "workout_type",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
  },
  (table) => [
    pgPolicy("Authenticated can handle workout types", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const workoutTypeRelations = relations(workoutType, ({ many }) => ({
  configurations: many(configurationToWorkoutType),
}));

export const environment = pgTable(
  "environment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
  },
  (table) => [
    pgPolicy("Authenticated can handle environment", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const environmentRelations = relations(environment, ({ many }) => ({
  configurations: many(configuration),
}));

export const configurationToWorkoutFocus = pgTable(
  "configuration_to_workout_focus",
  {
    configuration_id: uuid()
      .notNull()
      .references(() => configuration.id, { onDelete: "cascade" }),
    workout_focus_id: uuid()
      .notNull()
      .references(() => workoutFocus.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.configuration_id, table.workout_focus_id] }),
    pgPolicy("Authenticated can handle configurationToWorkoutFocus", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const configurationToWorkoutFocusRelations = relations(
  configurationToWorkoutFocus,
  ({ one }) => ({
    configuration: one(configuration, {
      fields: [configurationToWorkoutFocus.configuration_id],
      references: [configuration.id],
    }),
    workoutFocus: one(workoutFocus, {
      fields: [configurationToWorkoutFocus.workout_focus_id],
      references: [workoutFocus.id],
    }),
  })
);

export const configurationToWorkoutType = pgTable(
  "configuration_to_workout_type",
  {
    configuration_id: uuid()
      .notNull()
      .references(() => configuration.id, { onDelete: "cascade" }),
    workout_type_id: uuid()
      .notNull()
      .references(() => workoutType.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.configuration_id, table.workout_type_id] }),
    pgPolicy("Authenticated can handle configurationsToWorkoutTypes", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const configurationToWorkoutTypeRelations = relations(
  configurationToWorkoutType,
  ({ one }) => ({
    configuration: one(configuration, {
      fields: [configurationToWorkoutType.configuration_id],
      references: [configuration.id],
    }),
    workoutType: one(workoutType, {
      fields: [configurationToWorkoutType.workout_type_id],
      references: [workoutType.id],
    }),
  })
);

export const configurationToEnvironment = pgTable(
  "configuration_to_environment",
  {
    configuration_id: uuid()
      .notNull()
      .references(() => configuration.id, { onDelete: "cascade" }),
    environment_id: uuid()
      .notNull()
      .references(() => environment.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.configuration_id, table.environment_id] }),
    pgPolicy("Authenticated can handle configurationsToEnvironment", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const configurationToEnvironmentRelations = relations(
  configurationToEnvironment,
  ({ one }) => ({
    configuration: one(configuration, {
      fields: [configurationToEnvironment.configuration_id],
      references: [configuration.id],
    }),
    environment: one(environment, {
      fields: [configurationToEnvironment.environment_id],
      references: [environment.id],
    }),
  })
);
