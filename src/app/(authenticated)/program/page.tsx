import PageTitle from "@/components/shared/page-title";
import { getCurrentProgram } from "./actions";
import NoProgram from "./no-program";
import { getConfiguration } from "@/lib/actions";
import NoConfiguration from "./no-configuration";
import ProgramWeek from "./program-week";

export default async function Page() {
  const currentProgram = await getCurrentProgram();
  const configuration = await getConfiguration();

  return (
    <>
      <PageTitle
        title={"Program"}
        description={"This is your current active training program."}
      />
      {!configuration ? (
        <NoConfiguration />
      ) : !currentProgram ? (
        <NoProgram />
      ) : (
        <ProgramWeek program={currentProgram} />
      )}
    </>
  );
}
