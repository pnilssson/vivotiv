"use client";

import { INITIAL_FORM_STATE } from "@/lib/constants";
import { signUpWithPassword } from "@/lib/actions/authActions";
import { useActionState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ErrorMessages from "@/components/shared/error-messages";
import SubmitButton from "@/components/buttons/submit-button";
import React from "react";

export default function Component() {
  const [state, formAction] = useActionState(
    signUpWithPassword,
    INITIAL_FORM_STATE
  );

  return (
    <React.Fragment>
      <CardHeader>
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription className="w-full">
          Glad you&apos;re joining! Let&apos;s make a change. Please provide
          your details below to sign up.
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
              <Label htmlFor="email">Password</Label>
              <Input
                autoComplete="password"
                id="password"
                name="password"
                type="password"
              />
              <ErrorMessages name="password" errors={state.errors} />
            </div>
            <SubmitButton content="Sign up" classes="w-full" />
          </div>
        </form>
      </CardContent>
    </React.Fragment>
  );
}
