import { archiveProgramAction, getProgram } from "./actions";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Workout } from "@/types/types";
import {
  ArchiveIcon,
  CheckIcon,
  DrawingPinFilledIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default async function Page({ params }: { params: { id: string } }) {
  const program = await getProgram(params.id);

  if (!program) {
    redirect("/generate/general");
  }

  const WorkoutsAccordion = ({ workouts }: { workouts: Workout[] | null }) => {
    return (
      <Accordion type="single" collapsible>
        {workouts?.map((workout, index) => (
          <>
            <div className="leading-relaxed text-muted-foreground mt-4">
              {new Date(workout.date).toDateString()}
            </div>
            <AccordionItem key={workout.id} value={`workout-${index}`}>
              <AccordionTrigger>
                <h4 className="flex items-center gap-4 font-bold text-sm md:text-xl">
                  <div className="bg-slate-100 p-2 rounded-lg mr-4">
                    <CheckIcon className="h-5 w-5" />
                  </div>
                  {workout.description}
                </h4>
              </AccordionTrigger>
              <AccordionContent>
                <h4 className="font-bold text-2xl mt-4">Warm up</h4>
                <ul>
                  {workout.warmup?.exercises?.map((exercise) => (
                    <li key={exercise.id} className="mt-4 leading-relaxed">
                      <p className="text-base">
                        <strong>{exercise.title}</strong>
                      </p>
                      <p className="text-base">
                        <strong>{exercise.execution}</strong>
                      </p>
                      <div className="text-muted-foreground mt-2">
                        {exercise.description}
                      </div>
                    </li>
                  ))}
                </ul>
                <Separator className="mt-4" />
                <h4 className="font-bold text-2xl mt-4">Workout</h4>
                <ul>
                  {workout.exercises?.map((exercise) => (
                    <li key={exercise.id} className="mt-4 leading-relaxed">
                      <p className="text-base">
                        <strong>{exercise.title}</strong>
                      </p>
                      <p className="text-base">
                        <strong>{exercise.execution}</strong>
                      </p>
                      <div className="text-muted-foreground mt-2">
                        {exercise.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </>
        ))}
      </Accordion>
    );
  };

  return (
    <>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex justify-between">
          <h4 className="font-bold text-2xl flex gap-4 items-center">
            <div className="bg-emerald-200 p-2 rounded-lg">
              <DrawingPinFilledIcon className="h-5 w-5" />
            </div>
            Current program
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="bg-slate-100 p-2 rounded-lg">
                <GearIcon className="h-5 w-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Handle program</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <form className="flex items-center" action={archiveProgramAction}>
                  <Input type="hidden" name="programId" value={program.id} />
                  <ArchiveIcon />
                  <Button type="submit" variant="ghost">
                    Archive program
                  </Button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
