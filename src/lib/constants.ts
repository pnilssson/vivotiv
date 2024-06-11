import { FormResponse, ProgramFormResponse } from "@/types/types";

export const initialFormState: FormResponse = {
  success: false,
  errors: [],
};

export const initialGenerateProgramFormState: ProgramFormResponse = {
  success: false,
  errors: [],
  program: null,
};
