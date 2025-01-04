import { updateProgramTokensCommand } from "@/db/commands";
import { getProfileByEmailQuery } from "@/db/queries";
import { stripe } from "@/lib/stripe/config";
import { log } from "next-axiom";
import Stripe from "stripe";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return respondWithError("Webhook secret not found.", 400);
    }

    // Construct the Stripe event
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`Webhook received: ${event.type}`);

    // Handle the event
    return await handleStripeEvent(event);
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    log.warn("Error processing webhook.", { error_message: error.message });
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
    console.error(`Error handling event: ${error.message}`);
    log.warn("Error handling event.", { error_message: error.message });
    return respondWithError("Webhook handler failed.", 400);
  }
}

// Processes 'checkout.session.completed' events
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;

  if (!checkoutSession.customer_details?.email) {
    log.warn("Email is missing in checkoutSession.", checkoutSession);
    return;
  }

  const email = checkoutSession.customer_details.email;
  const profile = await getProfileByEmailQuery(email);

  if (!profile) {
    log.warn("Email was not found when handling completed checkout session.", {
      email,
    });
    return;
  }

  log.info("Handling completed checkout session.", checkoutSession);
  const tokensToAdd = parseInt(checkoutSession.metadata?.tokens || "0", 10);
  await updateProgramTokensCommand(
    profile.id,
    parseInt(profile.program_tokens),
    tokensToAdd
  );

  log.info("Tokens added to user.", {
    email,
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
