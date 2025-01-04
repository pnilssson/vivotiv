import { getPrograms } from "./actions";
import { ProgramMetadataResponse } from "@/types/types";
import { redirect } from "next/navigation";

export default async function Page() {
  const programs = await getPrograms();

  // function findProgram(
  //   programs: ProgramMetadataResponse[]
  // ): ProgramMetadataResponse | null {
  //   const today = new Date();

  //   // Filter programs where today's date is between startDate and endDate
  //   const activePrograms = programs.filter((program) => {
  //     const startDate = new Date(program.startDate);
  //     const endDate = new Date(program.endDate);
  //     return startDate <= today && endDate >= today;
  //   });

  //   if (activePrograms.length > 0) {
  //     return activePrograms[0];
  //   }

  //   // If no active programs, find the one with the closest start date
  //   let closestProgram: ProgramMetadataResponse | null = null;
  //   let closestDiff = Infinity;

  //   programs.forEach((program) => {
  //     const startDate = new Date(program.startDate);
  //     const diff = Math.abs(startDate.getTime() - today.getTime());

  //     if (diff < closestDiff) {
  //       closestDiff = diff;
  //       closestProgram = program;
  //     }
  //   });

  //   return closestProgram;
  // }

  // const activeProgram = findProgram(programs);

  // redirect(`/programs/${activeProgram?.id}`);

  return (
    <>
      <div className="grid gap-2">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          Programs
        </div>
        <div className="text-sm text-muted-foreground"></div>
      </div>
    </>
  );
}
