import { getCurrentGeneratedProgramsCount } from "../actions";
import NoProgram from "./no-program";

export default async function Page() {
  const currentGeneratedProgramsCount =
    await getCurrentGeneratedProgramsCount();
  return (
    <NoProgram currentGeneratedProgramsCount={currentGeneratedProgramsCount} />
  );
}
