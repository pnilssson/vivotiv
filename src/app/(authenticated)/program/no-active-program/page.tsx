import { validateActiveProgramExist } from "./actions";
import NoProgram from "./no-program";

export default async function Page() {
  await validateActiveProgramExist();
  return <NoProgram />;
}
