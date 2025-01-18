import exp from "constants";
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  boolean,
  primaryKey,
  pgRole,
  pgSchema,
  foreignKey,
  pgPolicy,
  timestamp,
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

export const exercise = {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text().notNull(),
  execution: text().notNull(),
  completed: boolean().notNull().default(false),
};

// Vivotiv
// Profile
export const profile = pgTable(
  "profile",
  {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    stripe_customer_id: text(),
    membership_end_date: date(),
    created: timestamp().notNull().defaultNow(),
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
    pgPolicy("User can handle their own programs", {
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
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

// Waiting list
export const waitingList = pgTable(
  "waiting_list",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    email: text().notNull(),
    created: timestamp().notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("Anyone can insert to waiting list", {
      for: "insert",
      to: anonRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

// Program
export const program = pgTable(
  "program",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    start_date: date().notNull(),
    end_date: date().notNull(),
    user_id: uuid()
      .notNull()
      .references(() => profile.id, {
        onDelete: "cascade",
      }),
    archived: boolean().notNull().default(false),
    created: timestamp().notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("User can handle their own programs", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = user_id`,
    }),
  ]
).enableRLS();

export const programRelations = relations(program, ({ one, many }) => ({
  profile: one(profile, {
    fields: [program.user_id],
    references: [profile.id],
  }),
  metadata: one(programMetadata, {
    fields: [program.id],
    references: [programMetadata.id],
  }),
  workouts: many(workout),
}));

// Warm-up
export const warmup = pgTable(
  "warmup",
  {
    id: uuid().primaryKey().defaultRandom(),
    description: text().notNull(),
    workout_id: uuid()
      .references(() => workout.id, {
        onDelete: "cascade",
      })
      .unique(),
  },
  (table) => [
    pgPolicy("Authenticated can handle warmup", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const warmUpRelations = relations(warmup, ({ many }) => ({
  exercises: many(warmupExercise),
}));

export const warmupExercise = pgTable(
  "warmup_exercise",
  {
    ...exercise,
    warmup_id: uuid()
      .references(() => warmup.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [
    pgPolicy("Authenticated can handle warmupExercise", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const warmupExerciseRelations = relations(warmupExercise, ({ one }) => ({
  warmup: one(warmup, {
    fields: [warmupExercise.warmup_id],
    references: [warmup.id],
  }),
}));

// Workout
export const workout = pgTable(
  "workout",
  {
    id: uuid().primaryKey().defaultRandom(),
    date: date().notNull(),
    completed: boolean().notNull(),
    description: text().notNull(),
    program_id: uuid().references(() => program.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    pgPolicy("Authenticated can handle workout", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const workoutRelations = relations(workout, ({ one, many }) => ({
  program: one(program, {
    fields: [workout.program_id],
    references: [program.id],
  }),
  warmup: one(warmup, {
    fields: [workout.id],
    references: [warmup.workout_id],
  }),
  exercises: many(workoutExercise),
}));

export const workoutExercise = pgTable(
  "workout_exercise",
  {
    ...exercise,
    workout_id: uuid()
      .references(() => workout.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [
    pgPolicy("Authenticated can handle workoutExercise", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const workoutExerciseRelations = relations(
  workoutExercise,
  ({ one }) => ({
    workout: one(workout, {
      fields: [workoutExercise.workout_id],
      references: [workout.id],
    }),
  })
);

// Program metadata
export const programMetadata = pgTable(
  "program_metadata",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    prompt: text().notNull(),
    prompt_tokens: integer().notNull(),
    completion_tokens: integer().notNull(),
    program_id: uuid().references(() => program.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [
    pgPolicy("Supabase auth admin can handle program metadata", {
      for: "all",
      to: supabaseAuthAdminRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const programMetadataRelations = relations(
  programMetadata,
  ({ one }) => ({
    program: one(program, {
      fields: [programMetadata.id],
      references: [program.id],
    }),
  })
);

// Configuration
export const configuration = pgTable(
  "configuration",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => profile.id, {
      onDelete: "cascade",
    }),
    sessions: integer().notNull(),
    time: integer().notNull(),
    equipment: text(),
    experience_id: uuid()
      .references(() => experience.id)
      .notNull(),
    generate_automatically: boolean().notNull().default(false),
    created: timestamp().notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("User can handle their own configurations", {
      for: "all",
      to: authenticatedRole,
      using: sql`${authUid} = user_id`,
    }),
  ]
).enableRLS();

export const configurationRelations = relations(
  configuration,
  ({ one, many }) => ({
    profile: one(profile, {
      fields: [configuration.user_id],
      references: [profile.id],
    }),
    workoutTypes: many(configurationToWorkoutType),
    prefferedDays: many(configurationToPreferredDay),
    experience: one(experience, {
      fields: [configuration.experience_id],
      references: [experience.id],
    }),
  })
);

// Experience
export const experience = pgTable(
  "experience",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    level: integer().notNull(),
  },
  (table) => [
    pgPolicy("Supabase auth admin can handle experience", {
      for: "all",
      to: supabaseAuthAdminRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const experienceRelations = relations(experience, ({ many }) => ({
  configurations: many(configuration),
}));

// Feedback
export const feedback = pgTable(
  "feedback",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: uuid().references(() => profile.id, {
      onDelete: "set null",
    }),
    feedback: text().notNull(),
    created: timestamp().notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("Authenticated can insert feedback", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

// Workout type
export const workoutType = pgTable(
  "workout_type",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
  },
  (table) => [
    pgPolicy("Supabase auth admin can handle workout types", {
      for: "all",
      to: supabaseAuthAdminRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const workoutTypeRelations = relations(workoutType, ({ many }) => ({
  configurations: many(configurationToWorkoutType),
}));

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

// Preferred day
export const preferredDay = pgTable(
  "preferred_day",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text(),
    number: integer().notNull(),
  },
  (table) => [
    pgPolicy("Supabase auth admin can handle preferred day", {
      for: "all",
      to: supabaseAuthAdminRole,
      withCheck: sql`true`,
    }),
  ]
).enableRLS();

export const preferredDayRelations = relations(preferredDay, ({ many }) => ({
  configurations: many(configuration),
}));

export const configurationToPreferredDay = pgTable(
  "configuration_to_preferred_day",
  {
    configuration_id: uuid()
      .notNull()
      .references(() => configuration.id, { onDelete: "cascade" }),
    preferred_day_id: uuid()
      .notNull()
      .references(() => preferredDay.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.configuration_id, table.preferred_day_id] }),
    pgPolicy("Authenticated can handle configurationsToPreferredDay", {
      for: "all",
      to: authenticatedRole,
      using: sql`true`,
    }),
  ]
).enableRLS();

export const configurationToPreferredDayRelations = relations(
  configurationToPreferredDay,
  ({ one }) => ({
    configuration: one(configuration, {
      fields: [configurationToPreferredDay.configuration_id],
      references: [configuration.id],
    }),
    preferredDay: one(preferredDay, {
      fields: [configurationToPreferredDay.preferred_day_id],
      references: [preferredDay.id],
    }),
  })
);
