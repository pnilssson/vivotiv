import PageTitle from "@/components/shared/page-title";
import {
  getEnvironments,
  getWorkoutFocus,
  getWorkoutTypes,
  getPreferredDays,
} from "./actions";
import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions";

export default async function Page() {
  const [
    configuration,
    workoutFocus,
    workoutTypes,
    environments,
    preferredDays,
  ] = await Promise.all([
    getConfiguration(),
    getWorkoutFocus(),
    getWorkoutTypes(),
    getEnvironments(),
    getPreferredDays(),
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
        preferredDays={preferredDays}
      />
    </>
  );
}
