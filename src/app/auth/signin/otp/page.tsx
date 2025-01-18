"use client";

import { INITIAL_FORM_STATE } from "@/lib/constants";
import { signInWithOtp } from "@/lib/actions/authActions";
import { useActionState } from "react";
import { Label } from "@radix-ui/react-label";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ErrorMessages from "@/components/shared/error-messages";
import SubmitButton from "@/components/buttons/submit-button";
import React from "react";

export default function Page() {
  const [state, formAction] = useActionState(signInWithOtp, INITIAL_FORM_STATE);

  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in with magic link</CardTitle>
        <CardDescription>
          We will send a sign-in link to your email. We will also create an
          account for you if this is your first time signing in.
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
            <SubmitButton content="Sign in" classes="w-full" />
          </div>
        </form>
      </CardContent>
    </React.Fragment>
  );
}
