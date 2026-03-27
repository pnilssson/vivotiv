import { z } from "zod";

export const locales = ["en", "sv"] as const;

export const LocaleSchema = z.enum(locales);

export type Locale = z.infer<typeof LocaleSchema>;
