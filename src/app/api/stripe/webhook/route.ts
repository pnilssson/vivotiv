import {
  updateProfileNameCommand,
  updateProfileProgramTokensCommand,
} from "@/db/commands";
import { getProfileByIdQuery } from "@/db/queries";
import { stripe } from "@/lib/stripe/config";
import { log } from "next-axiom";
import Stripe from "stripe";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      log.warn("Webhook secret not found.");
      return respondWithError("Webhook secret not found.", 400);
    }

    // Construct the Stripe event
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle the event
    return await handleStripeEvent(event);
  } catch (error: any) {
    log.error("Error when processing stripe webhook.", {
      error_message: error.message,
    });
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
    log.error("Error handling event stripe.", { error_message: error.message });
    throw new Error("Error handling event stripe.");
  }
}

// Processes 'checkout.session.completed' events
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  log.info("Handling completed checkout session.", checkoutSession);

  if (!checkoutSession.metadata?.userId) {
    log.error("User id is missing in stripe event.", checkoutSession);
    throw new Error("User id is missing in stripe event.");
  }

  const userId = checkoutSession.metadata.userId;
  const profile = await getProfileByIdQuery(userId);

  if (!profile) {
    log.error(
      "Profile was not found when handling completed checkout session.",
      {
        userId,
      }
    );
    throw new Error(
      "Profile was not found when handling completed checkout session."
    );
  }

  const tokensToAdd = parseInt(checkoutSession.metadata?.tokens || "0", 10);
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

  log.info("Checkout session handled successfully.", {
    userId,
    tokens: tokensToAdd,
  });
}

// Utility function for consistent error responses
function respondWithError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
