import { updateProfileMembershipCommand } from "@/db/commands";
import { getProfileByIdQuery } from "@/db/queries";
import { stripe } from "@/lib/stripe/config";
import * as Sentry from "@sentry/nextjs";
import Stripe from "stripe";
import { AxiomRequest, withAxiom } from "next-axiom";

export const POST = withAxiom(async (req: AxiomRequest): Promise<Response> => {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      Sentry.captureMessage("Stripe signature missing.", { level: "warning" });
      return respondWithError("Stripe signature missing.", 400);
    }

    if (!webhookSecret) {
      Sentry.captureMessage(
        "Missing STRIPE_WEBHOOK_SECRET environment variable.",
        { level: "warning" }
      );
      return respondWithError("Stripe secret missing.", 400);
    }

    // Construct the Stripe event
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle the event
    return await handleStripeEvent(event, req);
  } catch (error: any) {
    Sentry.captureException(error);
    return respondWithError(`Webhook Error: ${error.message}`, 400);
  }
});

// Handles different event types
async function handleStripeEvent(
  event: Stripe.Event,
  req: AxiomRequest
): Promise<Response> {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event, req);
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
async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  req: AxiomRequest
) {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  const userId = checkoutSession.metadata?.userId;

  req.log.info("Handling completed checkout session.", { checkoutSession });
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
        extra: { checkoutSession },
        level: "error",
      }
    );
    throw new Error(
      "Profile was not found when handling completed checkout session."
    );
  }

  const boughtMembershipDays = parseInt(
    checkoutSession.metadata?.days || "0",
    10
  );

  await updateProfileMembershipCommand(profile, boughtMembershipDays);

  req.log.info("Completed checkout session handled successfully.", {
    checkoutSessionId: checkoutSession.id,
  });
}

// Utility function for consistent error responses
function respondWithError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
