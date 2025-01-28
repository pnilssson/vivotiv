"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { LoaderCircleIcon } from "lucide-react";
import { ActionResponse } from "@/lib/types";
import PageTitle from "@/components/shared/typography/page-title";
import { generateProgram } from "../actions";
import FullPageContentBox from "@/components/shared/full-page-content-box";

export default function Component() {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    const result = await generateProgram();
    handleResult(result);
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
    <FullPageContentBox className={"flex flex-col justify-center"}>
      <PageTitle
        className="self-center text-center"
        title="No active programs"
        description="Generate a new program to get started."
      />
      <div className="mt-4 self-center">
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
    </FullPageContentBox>
  );
}
