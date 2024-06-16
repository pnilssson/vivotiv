import { useEffect } from "react";
import { useForm, DefaultValues, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Types
import { GenerateFormValues } from "@/types/types";
import { programRequestSchema } from "../zod/schemas";

export default function useGenerateForm(
  defaultValues?: DefaultValues<GenerateFormValues>
) {
  const form = useForm<z.infer<typeof programRequestSchema>>({
    resolver: zodResolver(programRequestSchema),
    defaultValues: defaultValues,
  });
  const { control } = form;

  // Use useWatch to watch the entire form state
  const formValues = useWatch({
    control,
  });

  // Log the form values whenever they change
  useEffect(() => {
    console.log("Form values changed:", formValues);
  }, [formValues]);

  return form;
}
