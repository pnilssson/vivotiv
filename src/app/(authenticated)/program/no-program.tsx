"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/lib/hooks/use-toast";
import { LoaderCircleIcon } from "lucide-react";
import { generateProgram, validateAvailableTokens } from "./actions";
import { ActionResponse } from "@/lib/types";

export default function Component() {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    const availableTokens = await validateAvailableTokens();
    if (!availableTokens.success) {
      toast({
        description: availableTokens.message,
        variant: "destructive",
      });
    }
    if (availableTokens.success) {
      toast({
        description:
          "Generating your training program may take a minute or two. Please avoid closing or refreshing the page during this process.",
      });
      const result = await generateProgram();
      handleResult(result);
    }
    setLoading(false);
  };

  function handleResult(response: ActionResponse) {
    if (response.success && response.message) {
      toast({ description: response.message, variant: "success" });
    }
    if (!response.success && response.message) {
      toast({ description: response.message, variant: "destructive" });
    }
  }

  return (
    <div
      className={
        "bg-slate-50/50 border border-slate-100 rounded-lg p-4 flex lg:gap-4 items-center lg:flex-row flex-wrap"
      }>
      <div className="flex gap-4 flex-1">
        <div className="my-auto grid gap-2">
          <div className="flex items-center">
            <h3 className="text-xl">No active programs</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Generate a new program to get started.
          </p>
        </div>
      </div>
      <div className="flex w-full lg:w-auto mt-4 lg:mt-0 justify-end">
        <Button
          className="w-full lg:w-36"
          aria-disabled={loading}
          onClick={() => generate()}>
          {loading ? (
            <span className="flex items-center">
              Generating..
              <LoaderCircleIcon className="animate-spin ml-2" />
            </span>
          ) : (
            "Generate now"
          )}
        </Button>
      </div>
    </div>
  );
}
