import { ActionResponse, ProgramActionResponse } from "@/types/types";

export const initialFormState: ActionResponse = {
  success: false,
  errors: [],
};

export const initialGenerateProgramFormState: ProgramActionResponse = {
  success: false,
  errors: [],
  program: null,
};
