"use client";

import { useRouter } from "next/navigation";
import FormWrapper from "../formWrapper";
import FormActions from "../formActions";
import { Button, buttonVariants } from "@/components/ui/button";
import useGenerateFormContext from "@/lib/hooks/useGenerateFormContext";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function InfoPage() {
  const router = useRouter();
  const { trigger, formState, setValue, control } = useGenerateFormContext();

  const prioritizeOptions = ["Conditioning", "Strength", "Flexibility"];
  const typeOptions = ["Running", "Cycling"];

  const { isValid, errors } = formState;

  const validateStep = async () => {
    await trigger();
    if (isValid) {
      router.push("/generate/equipment");
    }
  };

  return (
    <FormWrapper
      heading="Personalize"
      description="Provide additional information about how you would like to train.">
      <div className="flex flex-col mt-6">
        <FormField
          control={control}
          name="prioritize"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Prioritize</FormLabel>
              <ToggleGroup
                variant="outline"
                type="multiple"
                className="justify-start flex-wrap"
                value={field.value!}
                onValueChange={(value) => {
                  console.log(value);
                  if (value) setValue("prioritize", value);
                }}>
                {prioritizeOptions.map((prio) => (
                  <ToggleGroupItem
                    key={prio}
                    value={prio}
                    aria-label={`Toggle ${prio}`}>
                    {prio}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FormDescription>
                Leave empty to get an all-round program.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex flex-col mt-6">
        <FormField
          control={control}
          name="types"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Include</FormLabel>
              <ToggleGroup
                variant="outline"
                type="multiple"
                className="justify-start flex-wrap"
                value={field.value!}
                onValueChange={(value) => {
                  if (value) setValue("types", value);
                }}>
                {typeOptions.map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    aria-label={`Toggle ${type}`}>
                    {type}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormActions>
        <Link
          href="/generate/general"
          className={buttonVariants({ variant: "outline" })}>
          Go back
        </Link>
        <Button type="button" onClick={validateStep}>
          Continue
        </Button>
      </FormActions>
    </FormWrapper>
  );
}
