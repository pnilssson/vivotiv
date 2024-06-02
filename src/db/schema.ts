import {
  boolean,
  date,
  integer,
  json,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

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
  warmUpId: uuid("warmUpId").references(() => warmUp.id),
});

export const workoutExercise = pgTable("workout_exercises", {
  ...exercise,
  workoutId: uuid("workoutId").references(() => workout.id),
});

export const warmUp = pgTable("warmups", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  workoutId: uuid("workoutId").references(() => workout.id),
});

export const workout = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull(),
  description: text("description").notNull(),
  programId: uuid("programId").references(() => program.id),
});

export const program = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  userId: uuid("userId").references(() => profiles.id),
});

export const generated = pgTable("generated", {
  id: uuid("id").primaryKey().defaultRandom(),
  prompt: text("prompt").notNull(),
  chatgpt: json("chatgpt").notNull(),
  generatedOn: date("generatedOn").notNull().defaultNow(),
  userId: uuid("userId").references(() => profiles.id),
});
