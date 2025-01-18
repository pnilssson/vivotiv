import PageTitle from "@/components/shared/typography/page-title";
import { getWorkoutTypes, getPreferredDays, getExperiences } from "./actions";
import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions/sharedActions";

export default async function Page() {
  const [configuration, workoutTypes, preferredDays, experiences] =
    await Promise.all([
      getConfiguration(),
      getWorkoutTypes(),
      getPreferredDays(),
      getExperiences(),
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
        experiences={experiences}
      />
    </>
  );
}
