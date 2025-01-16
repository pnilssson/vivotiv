"use client";

import ShineBorder from "@/components/magicui/shine-border";
import ContentBox from "@/components/shared/content-box";
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
    <ContentBox
      className={cn("flex flex-col gap-2", {
        "border-0": highlight,
      })}>
      <div className="flex items-baseline">
        <p className="text-xl">{price}</p>
        <p className="text-sm text-muted-foreground ml-1">{weeklyPrice}</p>
        {discount ? (
          <Badge
            className="bg-emerald-300 self-center font-normal ml-auto"
            variant="secondary">
            Save {discount}
          </Badge>
        ) : null}
      </div>
      <div className="flex items-center">
        <h3 className="text-2xl">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>

      <Button
        className="w-full mt-2"
        aria-disabled={loading}
        onClick={() => handleStripeCheckout(priceId)}>
        {loading ? (
          <span className="flex items-center">
            Redirecting..
            <LoaderCircleIcon className="animate-spin ml-2" />
          </span>
        ) : (
          "Get now"
        )}
      </Button>
    </ContentBox>
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
