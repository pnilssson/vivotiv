import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPrograms } from "./actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function Page() {
  const programs = await getPrograms();
  console.log(programs);

  function getProgram(id: string) {}

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <CardDescription>
                Start date: {program.startDate} <br /> End date:{" "}
                {program.endDate}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Separator className="mt-4" />
    </>
  );
}
