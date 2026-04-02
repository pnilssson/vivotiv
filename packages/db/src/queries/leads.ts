import { eq } from "drizzle-orm";

import type { Database } from "../client";
import { leads } from "../schema";

type CreateLeadInput = {
  email: string;
};

export async function getLeadById(db: Database, id: string) {
  const [lead] = await db
    .select({ id: leads.id, email: leads.email })
    .from(leads)
    .where(eq(leads.id, id));

  return lead ?? null;
}

export async function upsertLead(db: Database, input: CreateLeadInput) {
  const [lead] = await db
    .insert(leads)
    .values({ email: input.email })
    .onConflictDoNothing({ target: leads.email })
    .returning({ id: leads.id });

  if (lead) return lead;

  const [existing] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.email, input.email));

  return existing;
}

export async function unsubscribeLead(db: Database, id: string) {
  await db
    .update(leads)
    .set({ unsubscribed: true })
    .where(eq(leads.id, id));
}

export async function isLeadUnsubscribed(db: Database, id: string) {
  const [lead] = await db
    .select({ unsubscribed: leads.unsubscribed })
    .from(leads)
    .where(eq(leads.id, id));

  return lead?.unsubscribed ?? false;
}
