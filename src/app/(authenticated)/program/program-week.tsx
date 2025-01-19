"use client";

import { ProgramResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import WorkoutView from "./workout-view";
import { cn, shortDate } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { FolderArchiveIcon, LoaderCircleIcon } from "lucide-react";
import { archiveProgram, completeWorkout, uncompleteWorkout } from "./actions";
import ContentBox from "@/components/shared/content-box";
const MotivationalTitle = dynamic(() => import("./motivational-title"), {
  ssr: false,
});
import dynamic from "next/dynamic";
import TextMuted from "@/components/shared/typography/text-muted";
import ConfirmArchiveDialog from "./confirm-archive-dialog";

export default function Component({
  program,
  currentGeneratedProgramsCount,
}: {
  program: ProgramResponse;
  currentGeneratedProgramsCount: number;
}) {
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [updateWorkoutLoading, setUpdateWorkoutLoading] =
    useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(shortDate());
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(program.start_date);
    day.setDate(day.getDate() + i); // Add i days to the week start
    return shortDate(day); // Format as 'YYYY-MM-DD'
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
    <React.Fragment>
      <div className="flex justify-between">
        <div>
          <MotivationalTitle />
          <TextMuted className="mt-2 max-w-[768px]">
            This is your current active program. If you would like to generate a
            new program, archive existing program by clicking the archive button
            in the corner.
          </TextMuted>
        </div>
        <div>
          <ConfirmArchiveDialog
            action={handleConfirm}
            currentGeneratedProgramsCount={currentGeneratedProgramsCount}>
            <Button variant="secondary" size="icon">
              {archiveLoading ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <FolderArchiveIcon />
              )}
            </Button>
          </ConfirmArchiveDialog>
        </div>
      </div>
      <div className="flex flex-row gap-2 sm:gap-4 mt-8">
        {daysOfWeek.map((date: string) => {
          const workout = program.workouts.find((w) => w.date === date);
          return (
            <React.Fragment key={date}>
              <ContentBox
                key={date + 1}
                className={cn(
                  "px-0 py-2 md:p-4 flex flex-col flex-1 items-center hover:bg-slate-100 cursor-pointer",
                  {
                    "bg-slate-100": date == selectedDate,
                  }
                )}
                onClick={() => setSelectedDate(date)}>
                {workout ? (
                  workout.completed ? (
                    <Badge
                      className="bg-emerald-300 align-middle font-normal w-fit md:w-8 lg:w-10"
                      variant="secondary"></Badge>
                  ) : (
                    <Badge
                      className="bg-red-300 align-middle font-normal w-fit md:w-8 lg:w-10"
                      variant="secondary"></Badge>
                  )
                ) : (
                  <Badge
                    className="bg-slate-200 align-middle font-normal w-fit md:w-8 lg:w-10"
                    variant="secondary"></Badge>
                )}
                <h3 className="mt-2 xl:hidden flex sm:text-xl">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </h3>
                <h3 className="text-xl mt-2 hidden xl:flex">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {date.split("-")[2]}
                </p>
              </ContentBox>
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
    </React.Fragment>
  );
}
