import { getCurrentProgram } from "./actions";
import NoProgram from "./no-program";
import {
  getConfiguration,
  getMemberShipEndDate,
} from "@/lib/actions/sharedActions";
import NoConfiguration from "./no-configuration";
import ProgramWeek from "./program-week";
import NoMembership from "./no-membership";
import React from "react";

export default async function Page() {
  const currentProgram = await getCurrentProgram();
  const configuration = await getConfiguration();
  const membershipEndDate = await getMemberShipEndDate();
  const today = new Date();

  return (
    <React.Fragment>
      {!configuration ? (
        <NoConfiguration />
      ) : membershipEndDate < today ? (
        <NoMembership membershipEndDate={membershipEndDate} />
      ) : !currentProgram ? (
        <NoProgram />
      ) : (
        <ProgramWeek program={currentProgram} />
      )}
    </React.Fragment>
  );
}
