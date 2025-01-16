import {
  updateProfileMembershipCommand,
  updateProfileNameCommand,
  updateProfileProgramTokensCommand,
} from "@/db/commands";
import { getProfileByIdQuery } from "@/db/queries";
import { stripe } from "@/lib/stripe/config";
import * as Sentry from "@sentry/nextjs";
import Stripe from "stripe";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      Sentry.captureMessage("Webhook secret not found.", { level: "warning" });
      return respondWithError("Webhook secret not found.", 400);
    }

    // Construct the Stripe event
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle the event
    return await handleStripeEvent(event);
  } catch (error: any) {
    Sentry.captureException(error);
    return respondWithError(`Webhook Error: ${error.message}`, 400);
  }
}

// Handles different event types
async function handleStripeEvent(event: Stripe.Event): Promise<Response> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;
      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    Sentry.captureException(error);
    throw new Error("Error handling event stripe.");
  }
}

// Processes 'checkout.session.completed' events
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  const userId = checkoutSession.metadata?.userId;

  Sentry.captureMessage("Handling completed checkout session.", {
    extra: { checkoutSession },
    level: "info",
  });

  if (!userId) {
    Sentry.captureMessage("User id is missing in stripe event.", {
      extra: { checkoutSession },
      level: "error",
    });
    throw new Error("User id is missing in stripe event.");
  }

  const profile = await getProfileByIdQuery(userId);
  if (!profile) {
    Sentry.captureMessage(
      "Profile was not found when handling completed checkout session.",
      {
        extra: { stripe_email: checkoutSession.customer_email },
        level: "error",
      }
    );
    throw new Error(
      "Profile was not found when handling completed checkout session."
    );
  }

  const tokensToAdd = parseInt(checkoutSession.metadata?.tokens || "0", 10);
  const boughtMembershipDays = parseInt(
    checkoutSession.metadata?.days || "0",
    10
  );

  await updateProfileMembershipCommand(profile, boughtMembershipDays);
  // Remove
  await updateProfileProgramTokensCommand(
    profile.id,
    profile.program_tokens,
    tokensToAdd
  );
  if (checkoutSession.customer_details?.name) {
    await updateProfileNameCommand(
      profile.id,
      checkoutSession.customer_details?.name
    );
  }

  Sentry.captureMessage("Checkout session handled successfully.", {
    user: { id: userId },
    extra: { tokensAdded: tokensToAdd },
    level: "info",
  });
}

// Utility function for consistent error responses
function respondWithError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
