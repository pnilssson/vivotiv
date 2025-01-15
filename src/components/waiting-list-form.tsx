"use client";

import { useActionState, useEffect } from "react";
import SubmitButton from "./buttons/submit-button";
import ErrorMessages from "./shared/error-messages";
import { Input } from "./ui/input";
import { addToWaitingList } from "@/app/actions";
import { initialFormState } from "@/lib/constants";
import { useToast } from "@/lib/hooks/use-toast";

export default function Component() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    addToWaitingList,
    initialFormState
  );

  useEffect(() => {
    if (state) {
      if (state.message) {
        toast({ description: state.message, variant: "success" });
      }
    }
  }, [state, state.message, toast]);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2">
        <div className="grid gap-2">
          <h3 className="text-lg font-semibold tracking-tight">
            We&apos;ll be in touch!
          </h3>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            placeholder="Your email"
            type="email"
          />
          <ErrorMessages name="email" errors={state.errors} />
        </div>
        <SubmitButton content="Join the waiting list" classes="w-full" />
      </div>
    </form>
  );
}
