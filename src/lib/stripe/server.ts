"use server";

import * as Sentry from "@sentry/nextjs";
import { getProfileByIdQuery } from "@/db/queries";
import { stripe } from "./config";
import { createClient } from "../supabase/server";
import { getUserOrRedirect } from "../server-utils";
import Stripe from "stripe";
import { getURL } from "../utils";
import { updateProfileStripeCustomerIdCommand } from "@/db/commands";

const priceIdTokenMap: {
  [key: string]: number;
} = {
  price_1QdeKSRpZn3h4qfLBhcmNKJY: 1,
  price_1QdeRCRpZn3h4qfLXsBBwv39: 4,
  price_1QdeWmRpZn3h4qfLyWCG7f1A: 12,
  price_1QdeGXRpZn3h4qfLOk4KS5be: 24,
};

export async function checkoutWithStripe(
  priceId: string,
  redirectPath: string = "/program"
) {
  try {
    const supabase = await createClient();
    const user = await getUserOrRedirect(supabase);

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        userId: user?.id,
      });
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Unable to access customer record.");
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      customer,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user?.id,
        tokens: priceIdTokenMap[priceId],
      },
      mode: "payment",
      cancel_url: getURL(),
      success_url: getURL(redirectPath),
    };

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (error) {
      Sentry.captureException(error);
      throw new Error("Unable to create checkout session.");
    }

    return { sessionId: session.id };
  } catch (error) {}
}

export async function createCustomerInStripe(userId: string, email: string) {
  try {
    const customerData = { metadata: { supabaseUUID: userId }, email: email };
    const newCustomer = await stripe.customers.create(customerData);
    if (!newCustomer) {
      Sentry.captureMessage("Stripe customer creation failed.");
      throw new Error("Stripe customer creation failed.");
    }

    return newCustomer.id;
  } catch (error: any) {
    Sentry.captureException(error, { user: { id: userId, email: email } });
    throw new Error("Stripe customer creation failed.");
  }
}

export async function createOrRetrieveCustomer({ userId }: { userId: string }) {
  const existingSupabaseCustomer = await getProfileByIdQuery(userId);

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({
      email: existingSupabaseCustomer?.email,
    });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(userId, existingSupabaseCustomer.email);

  // If Supabase has a record but doesn't match Stripe, update Supabase record
  if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
    await updateProfileStripeCustomerIdCommand(userId, stripeIdToInsert);
  }

  return stripeIdToInsert;
}
