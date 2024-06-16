import { useFormContext } from "react-hook-form";
import { GenerateFormValues } from "@/types/types";

export default function useGenerateFormContext() {
  return useFormContext<GenerateFormValues>();
}
