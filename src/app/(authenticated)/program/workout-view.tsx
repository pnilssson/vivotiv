"use client";

import ContentBox from "@/components/shared/content-box";
import Heading from "@/components/shared/typography/heading";
import SubPageTitle from "@/components/shared/typography/sub-page-title";
import TextMuted from "@/components/shared/typography/text-muted";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WorkoutResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BanIcon, CheckIcon, InfoIcon, LoaderCircleIcon } from "lucide-react";
import React, { useState } from "react";
import { completeWorkout, uncompleteWorkout } from "./actions";

export default function Component({
  workout,
}: {
  workout: WorkoutResponse | undefined;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [workoutCompleted, setWorkoutCompleted] = useState<boolean>(
    workout?.completed ?? false
  );
  function numberToLetter(number: number) {
    const letter = String.fromCharCode(97 + number);
    return letter;
  }
  const handleCompleteWorkout = async () => {
    setLoading(true);
    const result = await completeWorkout(workout!.id);
    if (result.success) setWorkoutCompleted(true);
    setLoading(false);
  };
  const handleUncompleteWorkout = async () => {
    setLoading(true);
    const result = await uncompleteWorkout(workout!.id);
    if (result.success) setWorkoutCompleted(false);
    setLoading(false);
  };
  return (
    <React.Fragment>
      {workout ? (
        <div className="flex flex-col gap-4 mt-4">
          <div className={cn("flex flex-row justify-between")}>
            <Heading className="self-center">{`Workout of ${new Date(
              workout.date
            ).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}`}</Heading>{" "}
            {!workoutCompleted ? (
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
                <div className="flex flex-row justify-between items-center">
                  <p className="font-medium">
                    <span className="capitalize">{numberToLetter(i)}. </span>
                    {exercise.title}
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="secondary" className="h-8 w-8">
                        <InfoIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <TextMuted>{exercise.exerciseType.description}</TextMuted>
                    </PopoverContent>
                  </Popover>
                </div>
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
