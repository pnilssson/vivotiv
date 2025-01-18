"use client";

import { INITIAL_FORM_STATE } from "@/lib/constants";
import { signInWithPassword } from "@/lib/actions/authActions";
import { useActionState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "@radix-ui/react-label";
import SubmitButton from "../buttons/submit-button";
import ErrorMessages from "../shared/error-messages";
import { Input } from "../ui/input";

export default function Component() {
  const [state, formAction] = useActionState(
    signInWithPassword,
    INITIAL_FORM_STATE
  );

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in with password</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
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
            <SubmitButton content="Sign in" classes="w-full" />
          </div>
        </form>
      </CardContent>
    </>
  );
}
