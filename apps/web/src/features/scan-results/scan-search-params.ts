import { parseAsBoolean } from "nuqs/server";

export const scanSearchParams = {
  showPassing: parseAsBoolean.withDefault(false),
  scoringOpen: parseAsBoolean.withDefault(false),
};
