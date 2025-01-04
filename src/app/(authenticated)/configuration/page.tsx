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
    <ConfigurationForm
      configuration={configuration}
      workoutFocus={workoutFocus}
      workoutTypes={workoutTypes}
      workoutEnvironments={environments}
    />
  );
}
