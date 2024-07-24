"use client";

import { useRouter } from "next/navigation";
import FormWrapper from "../formWrapper";
import FormActions from "../formActions";
import { Button, buttonVariants } from "@/components/ui/button";
import useGenerateFormContext from "@/lib/hooks/useGenerateFormContext";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function InfoPage() {
  const router = useRouter();
  const { trigger, formState, setValue, control } = useGenerateFormContext();

  const { isValid, errors } = formState;

  const validateStep = async () => {
    await trigger();
    if (isValid) {
      router.push("/generate/summary");
    }
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const equipmentArray = inputValue.split(",").map((item) => item.trim());
    setValue("equipment", equipmentArray);
  };

  return (
    <FormWrapper
      heading="Equipment"
      description="Do you have any available workout equipment at home? Let us know!"
    >
      <div className="flex flex-col mt-6">
        <FormField
          control={control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <FormControl>
                <Input
                  value={field.value!}
                  id="equipment"
                  name="equipment"
                  placeholder="Kettlebell, dumbbell, etc."
                  type="equipment"
                  onChange={handleEquipmentChange}
                />
              </FormControl>
              <FormDescription>
                Specify any kind of equipment you have available separated by a
                commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormActions>
        <Link
          href="/generate/personalize"
          className={buttonVariants({ variant: "outline" })}
        >
          Go back
        </Link>
        <Button type="button" onClick={validateStep}>
          Continue
        </Button>
      </FormActions>
    </FormWrapper>
  );
}
