"use client";

import { ProgramResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import WorkoutView from "./workout-view";
import { cn, shortDate } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { FolderArchiveIcon, LoaderCircleIcon } from "lucide-react";
import { archiveProgram } from "./actions";
import ContentBox from "@/components/shared/content-box";
import TextMuted from "@/components/shared/typography/text-muted";
import ConfirmArchiveDialog from "./confirm-archive-dialog";
import Title from "@/components/shared/typography/title";

export default function Component({
  program,
  currentGeneratedProgramsCount,
}: {
  program: ProgramResponse;
  currentGeneratedProgramsCount: number;
}) {
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
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

  return (
    <React.Fragment>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between items-center">
          <Title>Program</Title>
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
        <div>
          <TextMuted className="max-w-[768px]">
            Your currently active program is displayed below. To generate a new
            program, archive your current program by clicking the archive button
            in the corner.
          </TextMuted>
        </div>
      </div>
      <div className="flex flex-row gap-2 sm:gap-4 mt-4 md:mt-8">
        {daysOfWeek.map((date: string) => {
          const workout = program.workouts.find((w) => w.date === date);
          return (
            <React.Fragment key={date}>
              <ContentBox
                key={date + 1}
                className={cn(
                  "px-0 py-2 md:p-4 flex flex-col flex-1 items-center hover:bg-gray-100/90 cursor-pointer",
                  {
                    "bg-gray-100": date == selectedDate,
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
                    className="bg-gray-200 align-middle font-normal w-fit md:w-8 lg:w-10"
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
      />
    </React.Fragment>
  );
}
