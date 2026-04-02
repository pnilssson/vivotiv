import { createLoader, parseAsString } from "nuqs/server";

export const unsubscribeSearchParams = {
  token: parseAsString,
};

export const loadUnsubscribeSearchParams = createLoader(unsubscribeSearchParams);
