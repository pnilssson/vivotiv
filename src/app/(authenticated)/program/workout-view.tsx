"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Workout } from "@/types/types";
import { CheckIcon, Undo2Icon } from "lucide-react";

export default function Component({
  workout,
  completeAction,
  uncompleteAction,
}: {
  workout: Workout | undefined;
  completeAction: (workout: Workout | undefined) => Promise<void>;
  uncompleteAction: (workout: Workout | undefined) => Promise<void>;
}) {
  function numberToLetter(number: number) {
    const letter = String.fromCharCode(97 + number);
    return letter;
  }
  const handleCompleteWorkout = async () => {
    await completeAction(workout);
  };
  const handleUncompleteWorkout = async () => {
    await uncompleteAction(workout);
  };
  return (
    <div className="bg-slate-50/50/50 border border-slate-100 rounded-lg p-4 flex flex-col mt-4">
      {workout ? (
        <div>
          <div className="flex gap-4">
            <div className="flex flex-col flex-grow gap-2">
              {workout.completed ? (
                <Badge
                  className="bg-emerald-300 align-middle font-normal w-fit"
                  variant="secondary">
                  Completed
                </Badge>
              ) : (
                <Badge
                  className="bg-red-300 align-middle font-normal w-fit"
                  variant="secondary">
                  Uncompleted
                </Badge>
              )}
              <h3 className="text-xl font-semibold tracking-tight">
                {workout.description}
              </h3>
              <p className="text-sm text-muted-foreground">{workout.date}</p>
            </div>
            <div>
              {!workout.completed ? (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCompleteWorkout}>
                  <CheckIcon />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleUncompleteWorkout}>
                  <Undo2Icon />
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-4" />
          <h4 className="text-xl font-semibold leading-none tracking-tight">
            Warm up
          </h4>
          <div className="text-sm text-muted-foreground mt-2">
            {workout.warmup?.description}
          </div>
          <ul>
            {workout.warmup?.exercises?.map((exercise, i) => (
              <li key={exercise.title} className="mt-4">
                <p className="">
                  <span className="capitalize font-semibold">
                    {numberToLetter(i)}.{" "}
                  </span>
                  {exercise.title}
                </p>
                <p className="">{exercise.execution}</p>
                <div className="text-sm text-muted-foreground">
                  {exercise.description}
                </div>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <h4 className="text-xl font-semibold leading-none tracking-tight">
            Workout
          </h4>
          <ul>
            {workout.exercises?.map((exercise, i) => (
              <li key={exercise.title} className="mt-4">
                <p className="">
                  <span className="capitalize font-semibold">
                    {numberToLetter(i)}.{" "}
                  </span>
                  {exercise.title}
                </p>
                <p className="">{exercise.execution}</p>
                <div className="text-sm text-muted-foreground">
                  {exercise.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="ml-2 text-sm text-muted-foreground">
            No workout today.
          </p>
        </div>
      )}
    </div>
  );
}
