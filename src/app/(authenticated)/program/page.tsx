import { getCurrentGeneratedProgramsCount, getCurrentProgram } from "./actions";
import ProgramWeek from "./program-week";
import React from "react";

export default async function Page() {
  const currentProgram = await getCurrentProgram();
  const currentGeneratedProgramsCount =
    await getCurrentGeneratedProgramsCount();
  return (
    <React.Fragment>
      {currentProgram ? (
        <ProgramWeek
          program={currentProgram}
          currentGeneratedProgramsCount={currentGeneratedProgramsCount}
        />
      ) : null}
    </React.Fragment>
  );
}
