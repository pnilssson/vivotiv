"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { getStripe } from "@/lib/stripe/client";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";

export default function Component({
  title,
  description,
  priceId,
  price,
  weeklyPrice,
}: {
  title: string;
  description: string;
  priceId: string;
  price: string;
  weeklyPrice: string;
}) {
  const [loading, setLoading] = useState<boolean>();
  const { toast } = useToast();

  const handleStripeCheckout = async (priceId: string) => {
    setLoading(true);
    const checkoutResult = await checkoutWithStripe(priceId);
    if (!checkoutResult || !checkoutResult.sessionId) {
      toast({
        description: "Could not create checkout session.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const stripe = await getStripe();
    const redirectResult = await stripe?.redirectToCheckout({
      sessionId: checkoutResult.sessionId,
    });
    if (redirectResult && redirectResult.error) {
      toast({
        description: redirectResult.error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 grid grid-cols-12 gap-4">
      <div className="col-span-5 my-auto">
        <h3 className="text-xl font-semibold text-emerald-600">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="col-span-3 my-auto">
        <p className="text-xl font-bold mt-2">{price}</p>
        <p className="text-sm  text-muted-foreground">{weeklyPrice}</p>
      </div>
      <div className="col-span-4 flex">
        <Button
          className="my-auto ml-auto"
          aria-disabled={loading}
          onClick={() => handleStripeCheckout(priceId)}>
          Get now
          {loading ? (
            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
          ) : null}
        </Button>
      </div>
    </div>
  );
}
