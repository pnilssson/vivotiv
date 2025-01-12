import PageTitle from "@/components/shared/page-title";
import { getWorkoutTypes, getPreferredDays } from "./actions";
import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions";

export default async function Page() {
  const [configuration, workoutTypes, preferredDays] = await Promise.all([
    getConfiguration(),
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
        workoutTypes={workoutTypes}
        preferredDays={preferredDays}
      />
    </>
  );
}
