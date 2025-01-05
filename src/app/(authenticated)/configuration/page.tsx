import PageTitle from "@/components/shared/page-title";
import {
  getConfiguration,
  getEnvironments,
  getWorkoutFocus,
  getWorkoutTypes,
} from "./actions";
import ConfigurationForm from "./configuration-form";

export default async function Page() {
  const [configuration, workoutFocus, workoutTypes, environments] =
    await Promise.all([
      getConfiguration(),
      getWorkoutFocus(),
      getWorkoutTypes(),
      getEnvironments(),
    ]);
  return (
    <>
      <PageTitle
        title={"Configuration"}
        description={
          "We will tailor your program to your needs based on the information you provide below."
        }
      />
      <ConfigurationForm
        configuration={configuration}
        workoutFocus={workoutFocus}
        workoutTypes={workoutTypes}
        workoutEnvironments={environments}
      />
    </>
  );
}
