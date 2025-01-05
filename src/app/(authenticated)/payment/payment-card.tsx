"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { getStripe } from "@/lib/stripe/client";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";

export default function Component({
  title,
  priceId,
  price,
  weeklyPrice,
}: {
  title: string;
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
    <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
      <div className="p-4 sm:p-8">
        <h3 className="text-base font-semibold text-purple-600">{title}</h3>
        <p className="text-2xl sm:text-4xl font-bold text-black mt-4">
          {price}
        </p>
        <p className="text-sm">{weeklyPrice}</p>
        <Button
          className="mt-4 w-full"
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
