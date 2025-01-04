import { updateProgramTokensCommand } from "@/db/commands";
import { getProfileByEmailQuery } from "@/db/queries";
import { stripe } from "@/lib/stripe/config";
import { log } from "next-axiom";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret)
      return new Response("Webhook secret not found.", { status: 400 });
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        console.log(checkoutSession);

        if (!checkoutSession.customer_details?.email)
          log.warn("Email is missing in checkoutSession.", checkoutSession);

        if (checkoutSession.customer_details?.email) {
          const result = await getProfileByEmailQuery(
            checkoutSession.customer_details?.email
          );

          if (!result)
            log.warn(
              "Email was not found when handling completed checkout session.",
              { email: checkoutSession.customer_details?.email }
            );

          if (result) {
            const tokens = getTokens(checkoutSession.amount_total);
            await updateProgramTokensCommand(
              result?.id,
              parseInt(result?.program_tokens),
              tokens
            );
            log.info("Tokens added to user.", {
              email: checkoutSession.customer_details?.email,
              tokens: tokens,
            });
          }
        }
        break;
      default:
        throw new Error("Unhandled relevant event!");
    }
  } catch (error) {
    console.log(error);
    return new Response(
      "Webhook handler failed. View your Next.js function logs.",
      {
        status: 400,
      }
    );
  }

  return new Response(JSON.stringify({ received: true }));
}

function getTokens(amountTotal: number | null): number {
  if (amountTotal === 17) {
    return 3;
  }
  if (amountTotal === 36) {
    return 12;
  }
  if (amountTotal === 84) {
    return 52;
  }

  return 0;
}
