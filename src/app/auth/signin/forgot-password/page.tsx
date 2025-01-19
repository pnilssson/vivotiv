"use client";

import SubmitButton from "@/components/buttons/submit-button";
import ErrorMessages from "@/components/shared/error-messages";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/authActions";
import { INITIAL_FORM_STATE } from "@/lib/constants";
import React from "react";
import { useActionState } from "react";

export default function Page() {
  const [state, formAction] = useActionState(resetPassword, INITIAL_FORM_STATE);

  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>
          No worries, we will send you reset intstructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
              />
              <ErrorMessages name="email" errors={state.errors} />
            </div>
            <SubmitButton content="Reset" classes="w-full" />
          </div>
        </form>
      </CardContent>
    </React.Fragment>
  );
}
