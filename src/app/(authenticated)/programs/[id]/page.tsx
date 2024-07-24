import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { getProgram } from "../actions";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Workout } from "@/types/types";
import { CheckIcon, DrawingPinFilledIcon } from "@radix-ui/react-icons";
import Workouts from "./workouts";

export default async function Page({ params }: { params: { id: string } }) {
  const program = await getProgram(params.id);
  console.log(program);

  const WorkoutsAccordion = ({ workouts }: { workouts: Workout[] | null }) => {
    return (
      <Accordion type="single" collapsible>
        {workouts?.map((workout, index) => (
          <AccordionItem key={workout.id} value={`workout-${index}`}>
            <AccordionTrigger>
              <span className="flex items-center gap-4">
                <h4 className="font-bold flex items-center">
                  <div className="bg-slate-100 p-2 rounded-lg mr-4">
                    <CheckIcon className="h-5 w-5" />
                  </div>
                  {workout.description}
                  <span className="text-base leading-relaxed text-gray-600 ml-2">
                    {new Date(workout.date).toDateString()}
                  </span>
                </h4>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <h4 className="font-bold text-2xl">Warm up</h4>
              <ul>
                {workout.warmup?.exercises?.map((exercise) => (
                  <li key={exercise.id}>
                    <strong>{exercise.title}</strong>: {exercise.description} (
                    {exercise.execution})
                  </li>
                ))}
              </ul>
              <h3>Exercises</h3>
              <ul>
                {workout.exercises?.map((exercise) => (
                  <li key={exercise.id}>
                    <strong>{exercise.title}</strong>: {exercise.description} (
                    {exercise.execution})
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <>
      {program.workouts != null ? (
        <div className="mt-4">
          <Workouts
            workouts={program.workouts}
            startDate={new Date(program.startDate)}
            endDate={new Date(program.endDate)}
          />
        </div>
      ) : null}
      <div className="mt-4 flex flex-col gap-4">
        <h4 className="font-bold text-2xl flex gap-4 items-center">
          <div className="bg-emerald-200 p-2 rounded-lg">
            <DrawingPinFilledIcon className="h-5 w-5" />
          </div>
          Current program
        </h4>
        <p className="leading-relaxed text-muted-foreground">
          This program is scheduled to take place over a period starting from{" "}
          {new Date(program.startDate).toDateString()} and ending on{" "}
          {new Date(program.endDate).toDateString()}. Throughout this duration,
          you will engage in a series of {program.workouts?.length} structured
          workout sessions. Each workout session is carefully designed and
          includes an appropriate warm-up to ensure that you are properly
          prepared for the exercises ahead.
        </p>
        <div>
          <WorkoutsAccordion workouts={program.workouts} />
        </div>
      </div>
    </>
  );
}
