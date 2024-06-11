import { relations } from "drizzle-orm";
import { boolean, date, json, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email"),
});

const exercise = {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  execution: text("execution").notNull(),
};

export const warmUpExercise = pgTable("warmup_exercises", {
  ...exercise,
  warmUpId: uuid("warmUpId").references(() => warmUp.id, {
    onDelete: "cascade",
  }),
});

export const warmUpExerciseRelations = relations(warmUpExercise, ({ one }) => ({
  workout: one(warmUp, {
    fields: [warmUpExercise.warmUpId],
    references: [warmUp.id],
  }),
}));

export const workoutExercise = pgTable("workout_exercises", {
  ...exercise,
  workoutId: uuid("workoutId").references(() => workout.id, {
    onDelete: "cascade",
  }),
});

export const workoutExerciseRelations = relations(
  workoutExercise,
  ({ one }) => ({
    workout: one(workout, {
      fields: [workoutExercise.workoutId],
      references: [workout.id],
    }),
  })
);

export const warmUp = pgTable("warmups", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  workoutId: uuid("workoutId").references(() => workout.id, {
    onDelete: "cascade",
  }),
});

export const warmUpRelations = relations(warmUp, ({ many }) => ({
  exercises: many(warmUpExercise),
}));

export const workout = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull(),
  description: text("description").notNull(),
  programId: uuid("programId").references(() => program.id, {
    onDelete: "cascade",
  }),
});

export const workoutRelations = relations(workout, ({ one, many }) => ({
  prgoram: one(program, {
    fields: [workout.programId],
    references: [program.id],
  }),
  warmup: one(warmUp, {
    fields: [workout.id],
    references: [warmUp.workoutId],
  }),
  exercises: many(workoutExercise),
}));

export const program = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  userId: uuid("userId").references(() => profiles.id),
});

export const programRelations = relations(program, ({ many }) => ({
  workouts: many(workout),
}));

export const generated = pgTable("generated", {
  id: uuid("id").primaryKey().defaultRandom(),
  prompt: text("prompt").notNull(),
  chatgpt: json("chatgpt").notNull(),
  generatedOn: date("generatedOn").notNull().defaultNow(),
  userId: uuid("userId").references(() => profiles.id),
});
