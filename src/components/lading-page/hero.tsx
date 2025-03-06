"use client";

import { cn } from "@/lib/utils";
import GridPattern from "../magicui/grid-pattern";
import { useToast } from "@/lib/hooks/useToast";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Component() {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Try one week for free!",
      description: "Join now and get your first week for free.",
      duration: Infinity,
      action: (
        <Button asChild>
          <Link href="/auth/signup">Join now</Link>
        </Button>
      ),
    });
  }, []);

  return (
    <main className="flex flex-col text-center pt-36 md:pt-48 container animate-fade">
      <h1 className="text-4xl md:text-8xl font-bold md:max-w-[980px] mx-auto">
        Start training from home{" "}
        <span className="underline decoration-emerald-400 underline-offset-4">
          today
        </span>
      </h1>
      <h2 className="text-2xl md:text-6xl font-semibold mt-2 md:mt-4 text-emerald-400">
        With tailor-made programs
      </h2>
      <p className="md:text-xl text-muted-foreground md:max-w-[600px] mx-auto mt-2 md:mt-4">
        Transform your health with personalized training programs created to
        suit your needs.
      </p>
      <GridPattern
        width={30}
        height={30}
        className={cn(
          "[mask-image:linear-gradient(to_bottom,transparent,white,transparent)] h-[600px] md:h-[880px] -z-10 mt-16  "
        )}
      />
    </main>
  );
}
