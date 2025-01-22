"use client";

import ShineBorder from "@/components/magicui/shine-border";
import ContentBox from "@/components/shared/content-box";
import TextMuted from "@/components/shared/typography/text-muted";
import Title from "@/components/shared/typography/title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
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
  discount,
  highlight,
}: {
  title: string;
  description: string;
  priceId: string;
  price: string;
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
      className={cn("flex flex-col gap-4", {
        "border-0 bg-slate-50/50": highlight,
      })}>
      <div className="flex items-baseline">
        <Title>{price}</Title>
        {discount ? (
          <Badge
            className="bg-emerald-300 self-center font-normal ml-auto"
            variant="secondary">
            Save {discount}
          </Badge>
        ) : null}
      </div>
      <div className="flex items-center">
        <Title>{title}</Title>
      </div>
      <TextMuted className="min-h-10">{description}</TextMuted>

      <Button
        className="w-full"
        aria-disabled={loading}
        onClick={() => handleStripeCheckout(priceId)}>
        {loading ? (
          <span className="flex items-center">
            Redirecting..
            <LoaderCircleIcon className="animate-spin ml-2" />
          </span>
        ) : (
          <span>Get now</span>
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
