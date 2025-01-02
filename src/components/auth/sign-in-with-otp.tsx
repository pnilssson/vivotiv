"use client";

import { initialFormState } from "@/lib/constants";
import { signInWithOtp } from "@/lib/supabase/actions";
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
  const [state, formAction] = useActionState(signInWithOtp, initialFormState);

  return (
    <>
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
    </>
  );
}
