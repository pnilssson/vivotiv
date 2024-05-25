import { ZodIssue } from "zod";

export interface ActionResponse {
  success: boolean;
  errors: ZodIssue[];
}
