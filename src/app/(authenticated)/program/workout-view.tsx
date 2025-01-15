"use client";

import ContentBox from "@/components/shared/content-box";
import Heading from "@/components/shared/heading";
import SubPageTitle from "@/components/shared/sub-page-title";
import TextMuted from "@/components/shared/text-muted";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkoutResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BanIcon, CheckIcon, LoaderCircleIcon, Undo2Icon } from "lucide-react";
import React from "react";

export default function Component({
  workout,
  loading,
  completeAction,
  uncompleteAction,
}: {
  workout: WorkoutResponse | undefined;
  loading: boolean;
  completeAction: (workoutId: string | undefined) => Promise<void>;
  uncompleteAction: (workoutId: string | undefined) => Promise<void>;
}) {
  function numberToLetter(number: number) {
    const letter = String.fromCharCode(97 + number);
    return letter;
  }
  const handleCompleteWorkout = async () => {
    await completeAction(workout?.id);
  };
  const handleUncompleteWorkout = async () => {
    await uncompleteAction(workout?.id);
  };
  return (
    <React.Fragment>
      {workout ? (
        <div className="flex flex-col gap-8 mt-8">
          <div className={cn("flex flex-row justify-between")}>
            <Heading className="self-center">{`Workout of ${new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "short",
                month: "short",
                day: "numeric",
              }
            )}`}</Heading>{" "}
            {!workout.completed ? (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCompleteWorkout}>
                {loading ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <CheckIcon />
                )}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="icon"
                onClick={handleUncompleteWorkout}>
                {loading ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <BanIcon />
                )}
              </Button>
            )}
          </div>
          <div className="">
            <SubPageTitle
              title="Warm up"
              description={workout.warmup?.description ?? ""}
            />
            {workout.warmup?.exercises?.map((exercise, i) => (
              <ContentBox key={exercise.title} className="mt-4">
                <p className="font-medium">
                  <span className="capitalize">{numberToLetter(i)}. </span>
                  {exercise.title}
                </p>
                <p className="font-light">{exercise.execution}</p>
                <div className="text-sm text-muted-foreground">
                  {exercise.description}
                </div>
              </ContentBox>
            ))}
          </div>
          <div className="">
            <SubPageTitle title="Workout" description={workout.description} />
            {workout.exercises?.map((exercise, i) => (
              <ContentBox key={exercise.title} className="mt-4">
                <p className="font-medium">
                  <span className="capitalize">{numberToLetter(i)}. </span>
                  {exercise.title}
                </p>
                <p className="font-light">{exercise.execution}</p>
                <div className="text-sm text-muted-foreground">
                  {exercise.description}
                </div>
              </ContentBox>
            ))}
          </div>
        </div>
      ) : (
        <ContentBox className="mt-4">
          <TextMuted>No workout today</TextMuted>
        </ContentBox>
      )}
    </React.Fragment>
  );
}
