import type { Database } from "../client";
import { leads } from "../schema";

type CreateLeadInput = {
  email: string;
  url: string;
};

export async function createLead(db: Database, input: CreateLeadInput) {
  const [lead] = await db
    .insert(leads)
    .values({
      email: input.email,
      url: input.url,
    })
    .returning({ id: leads.id });

  return lead;
}
