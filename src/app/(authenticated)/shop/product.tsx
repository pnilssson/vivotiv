"use client";

import ShineBorder from "@/components/magicui/shine-border";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { getStripe } from "@/lib/stripe/client";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { cn } from "@/lib/utils";
import { LoaderCircleIcon } from "lucide-react";
import { useState } from "react";

export default function Component({
  title,
  description,
  priceId,
  price,
  weeklyPrice,
  discount,
  highlight,
}: {
  title: string;
  description: string;
  priceId: string;
  price: string;
  weeklyPrice: string;
  discount?: string;
  highlight: boolean;
}) {
  const [loading, setLoading] = useState<boolean>(false);
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

  const content = (
    <div
      className={cn(
        " rounded-lg p-4 flex md:gap-4 items-center md:flex-row flex-wrap",
        { "bg-slate-50/50 border border-slate-100": !highlight }
      )}>
      <div className="flex gap-4 flex-1">
        <div className="my-auto grid gap-2">
          <div className="flex items-center">
            <h3 className="text-xl">{title}</h3>
            {discount ? (
              <Badge
                className="ml-2 bg-emerald-300 align-middle font-normal"
                variant="secondary">
                Save {discount}
              </Badge>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="my-auto">
        <p className="text-xl">{price}</p>
        <p className="text-sm text-muted-foreground">{weeklyPrice}</p>
      </div>
      <div className="flex w-full md:w-auto mt-4 md:mt-0 justify-end">
        <Button
          className="w-full md:w-32"
          size="sm"
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

  return highlight ? (
    <ShineBorder
      className="overflow-hidden flex w-full bg-slate-50/50"
      color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
      {content}
    </ShineBorder>
  ) : (
    content
  );
}
