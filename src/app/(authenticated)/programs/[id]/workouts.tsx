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

export default function Component({
  workouts,
  startDate,
  endDate,
}: {
  workouts: Workout[];
  startDate: Date;
  endDate: Date;
}) {
  const getDatesBetween = (start: Date, end: Date) => {
    const dates = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Generate the array of dates
  const dates = getDatesBetween(new Date(startDate), new Date(endDate));

  return (
    <div className="grid grid-col-3 md:grid-cols-7 gap-4">
      {dates.map((date, index) => {
        const workout = workouts.find(
          (workout) =>
            new Date(workout.date).toDateString() === date.toDateString()
        );
        return (
          <div key={index}>
            <h4 className="text-muted-foreground">
              {date.toLocaleDateString(undefined, { weekday: "long" })}
            </h4>
            <div className="mt-4 text-center p-4 border-2 rounded-full">
              <h3>
                {date.toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>

            {workout ? (
              <p className="truncate ">{workout.description}</p>
            ) : (
              <p>Rest day</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
