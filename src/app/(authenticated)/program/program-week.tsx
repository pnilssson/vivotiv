"use client";

import { ProgramResponse, WorkoutResponse } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import WorkoutView from "./workout-view";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { FolderArchiveIcon, LoaderCircleIcon } from "lucide-react";
import ConfirmDialog from "@/components/shared/confirm-dialog";
import { archiveProgram, completeWorkout, uncompleteWorkout } from "./actions";

export default function Component({ program }: { program: ProgramResponse }) {
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [updateWorkoutLoading, setUpdateWorkoutLoading] =
    useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(program.start_date);
    day.setDate(day.getDate() + i); // Add i days to the week start
    return day.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  });

  const handleConfirm = async () => {
    setArchiveLoading(true);
    await archiveProgram(program.id);
    setArchiveLoading(false);
  };

  const handleCompleteWorkout = async (workoutId: string | undefined) => {
    if (workoutId) {
      setUpdateWorkoutLoading(true);
      await completeWorkout(workoutId);
      setUpdateWorkoutLoading(false);
    }
  };

  const handleUncompleteWorkout = async (workoutId: string | undefined) => {
    if (workoutId) {
      setUpdateWorkoutLoading(true);
      await uncompleteWorkout(workoutId);
      setUpdateWorkoutLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-xl">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </h3>
        <ConfirmDialog
          title="Are you absolutely sure?"
          description="This will archive the program and you will have to generate a new."
          action={handleConfirm}
          confirmText="Archive"
          cancelText="Cancel">
          <Button variant="secondary" size="icon">
            {archiveLoading ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <FolderArchiveIcon />
            )}
          </Button>
        </ConfirmDialog>
      </div>
      <div className="flex flex-row gap-2 sm:gap-4 mt-4">
        {daysOfWeek.map((date: string) => {
          const workout = program.workouts.find((w) => w.date === date);
          return (
            <React.Fragment key={date}>
              <div
                key={date + 1}
                className={cn(
                  "bg-slate-50/50 border border-slate-100 rounded-lg py-2 md:hidden flex flex-col flex-1 items-center hover:bg-slate-100 cursor-pointer",
                  {
                    "bg-slate-100 hover:bg-slate-100": date == selectedDate,
                  }
                )}
                onClick={() => setSelectedDate(date)}>
                {workout ? (
                  workout.completed ? (
                    <Badge
                      className="bg-emerald-300 align-middle font-normal w-fit"
                      variant="secondary"></Badge>
                  ) : (
                    <Badge
                      className="bg-red-300 align-middle font-normal w-fit"
                      variant="secondary"></Badge>
                  )
                ) : (
                  <Badge
                    className="bg-slate-200 align-middle font-normal w-fit"
                    variant="secondary"></Badge>
                )}
                <h3 className="mt-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {date.split("-")[2]}
                </p>
              </div>

              <div
                key={date + 2}
                className={cn(
                  "bg-slate-50/50 border border-slate-100 rounded-lg p-4 hidden xl:hidden md:flex flex-col flex-1 items-center hover:bg-slate-100 cursor-pointer",
                  {
                    "bg-slate-100 hover:bg-slate-100": date == selectedDate,
                  }
                )}
                onClick={() => setSelectedDate(date)}>
                {workout ? (
                  workout.completed ? (
                    <Badge
                      className="bg-emerald-300 align-middle font-normal w-full"
                      variant="secondary"></Badge>
                  ) : (
                    <Badge
                      className="bg-red-300 align-middle font-normal w-full"
                      variant="secondary"></Badge>
                  )
                ) : (
                  <Badge
                    className="bg-slate-200 align-middle font-normal w-full"
                    variant="secondary"></Badge>
                )}
                <h3 className="text-xl mt-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {date.split("-")[2]}
                </p>
              </div>

              <div
                key={date + 3}
                className={cn(
                  "bg-slate-50/50 border border-slate-100 rounded-lg p-4 hidden xl:flex flex-col flex-1 hover:bg-slate-100 cursor-pointer",
                  {
                    "bg-slate-100 hover:bg-slate-100": date == selectedDate,
                  }
                )}
                onClick={() => setSelectedDate(date)}>
                {workout ? (
                  workout.completed ? (
                    <Badge
                      className="bg-emerald-300 align-middle font-normal w-full"
                      variant="secondary"></Badge>
                  ) : (
                    <Badge
                      className="bg-red-300 align-middle font-normal w-full"
                      variant="secondary"></Badge>
                  )
                ) : (
                  <Badge
                    className="bg-slate-200 align-middle font-normal w-full"
                    variant="secondary"></Badge>
                )}
                <h3 className="text-xl mt-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">{date}</p>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <WorkoutView
        workout={program.workouts.find((w) => w.date == selectedDate)}
        loading={updateWorkoutLoading}
        completeAction={handleCompleteWorkout}
        uncompleteAction={handleUncompleteWorkout}
      />
    </>
  );
}
