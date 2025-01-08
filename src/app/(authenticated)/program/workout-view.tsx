"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Workout } from "@/types/types";
import { CheckIcon } from "lucide-react";

export default function Component({
  workout,
  action,
}: {
  workout: Workout | undefined;
  action: (workout: Workout | undefined) => Promise<void>;
}) {
  function numberToLetter(number: number) {
    const letter = String.fromCharCode(97 + number);
    return letter;
  }
  const handleCompleteWorkout = async () => {
    await action(workout);
  };
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col mt-4">
      {workout ? (
        <div>
          <div>
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
                Incompleted
              </Badge>
            )}
            <div className="flex justify-between items-center min-h-10">
              <h3 className="text-xl font-semibold tracking-tight">
                {workout.description}
              </h3>
              {!workout.completed ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCompleteWorkout}>
                  <CheckIcon />
                </Button>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{workout.date}</p>
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
