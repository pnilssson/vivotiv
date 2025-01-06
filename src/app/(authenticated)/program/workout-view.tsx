"use client";

import { Separator } from "@/components/ui/separator";
import { Workout } from "@/types/types";

export default function Component({
  workout,
}: {
  workout: Workout | undefined;
}) {
  function numberToLetter(number: number) {
    const letter = String.fromCharCode(97 + number);
    return letter;
  }
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex flex-col mt-4">
      {workout ? (
        <div>
          <h3 className="text-xl font-semibold leading-none tracking-tight">
            {workout.description}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">{workout.date}</p>

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
