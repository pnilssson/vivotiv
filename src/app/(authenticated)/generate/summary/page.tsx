"use client";
export const maxDuration = 60;

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import FormWrapper from "../formWrapper";
import FormActions from "../formActions";
import useGenerateFormContext from "@/lib/hooks/useGenerateFormContext";
import { useWatch } from "react-hook-form";
import SubmitButton from "@/components/buttons/submit-button";
import { Separator } from "@/components/ui/separator";

export default function SummaryPage() {
  const { control } = useGenerateFormContext();
  const formValues = useWatch({
    control,
  });
  return (
    <FormWrapper
      heading="Finishing up"
      description="Double-check that everything looks correct before we create your personalized training program."
    >
      <div className="flex flex-col rounded-lg mt-6 w-full shrink-0">
        <div className="mb-4">
          <h4 className="font-bold text-md">Start date</h4>
          <p>{formValues.startDate?.toDateString()}</p>
        </div>
        <Separator />
        <div className="flex flex-col lg:flex-row lg:justify-between">
          <div className="mt-4">
            <h4 className="font-bold text-md">Sessions per week</h4>
            <p>{formValues.sessions}</p>
          </div>
          <div className="my-4">
            <h4 className="font-bold text-md">Length of sessions</h4>
            <p>{formValues.time}</p>
          </div>
        </div>
        <Separator />
        <div className="my-4">
          <h4 className="font-bold text-md">Prioritize</h4>
          <p>
            {formValues.prioritize && formValues.prioritize?.length > 0
              ? formValues.prioritize?.join(", ")
              : "Allround"}
          </p>
        </div>
        <Separator />
        <div className="my-4">
          <h4 className="font-bold text-md">Include specific workouts</h4>
          <p>
            {formValues.types && formValues.types?.length > 0
              ? formValues.types?.join(", ")
              : "None"}
          </p>
        </div>
        <Separator />
        <div className="my-4">
          <h4 className="font-bold text-md">Available equipment</h4>
          <p>
            {formValues.equipment && formValues.equipment?.length > 0
              ? formValues.equipment?.join(", ")
              : "None"}
          </p>
        </div>
      </div>
      <FormActions>
        <Link
          href="/generate/equipment"
          className={buttonVariants({ variant: "outline" })}
        >
          Go back
        </Link>
        <SubmitButton content="Confirm" />
      </FormActions>
    </FormWrapper>
  );
}
