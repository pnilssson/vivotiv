import PageTitle from "@/components/shared/page-title";
import { getWorkoutFocus, getWorkoutTypes, getPreferredDays } from "./actions";
import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions";

export default async function Page() {
  const [configuration, workoutFocus, workoutTypes, preferredDays] =
    await Promise.all([
      getConfiguration(),
      getWorkoutFocus(),
      getWorkoutTypes(),
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
        preferredDays={preferredDays}
      />
    </>
  );
}
