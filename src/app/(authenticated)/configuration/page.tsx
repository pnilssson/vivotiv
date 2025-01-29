import PageTitle from "@/components/shared/typography/page-title";
import {
  getWorkoutTypes,
  getPreferredDays,
  getExperiences,
  getConfiguration,
} from "./actions";
import ConfigurationForm from "./configuration-form";
import React from "react";

export default async function Page() {
  const [configuration, workoutTypes, preferredDays, experiences] =
    await Promise.all([
      getConfiguration(),
      getWorkoutTypes(),
      getPreferredDays(),
      getExperiences(),
    ]);
  return (
    <React.Fragment>
      <PageTitle
        className="mb-4 md:mb-8"
        title={"Configuration"}
        description={
          "We will tailor your program to your needs based on the information you provide below."
        }
      />
      {workoutTypes && preferredDays && experiences ? (
        <ConfigurationForm
          configuration={configuration}
          workoutTypes={workoutTypes}
          preferredDays={preferredDays}
          experiences={experiences}
        />
      ) : null}
    </React.Fragment>
  );
}
