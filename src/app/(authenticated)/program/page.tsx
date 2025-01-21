import {
  getCurrentGeneratedPrograms,
  getCurrentProgram,
  validateConfigurationExist,
  validateGenerating,
  validateMembership,
} from "./actions";
import ProgramWeek from "./program-week";
import React from "react";

export default async function Page() {
  await validateGenerating();
  await validateConfigurationExist();
  await validateMembership();
  const currentProgram = await getCurrentProgram();
  const currentGeneratedProgramsCount = await getCurrentGeneratedPrograms();
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
