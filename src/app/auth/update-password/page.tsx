"use client";

import SubmitButton from "@/components/buttons/submit-button";
import ErrorMessages from "@/components/shared/error-messages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/lib/actions/authActions";
import { INITIAL_FORM_STATE } from "@/lib/constants";
import React from "react";
import { useActionState } from "react";

export default function Page() {
  const [state, formAction] = useActionState(
    updatePassword,
    INITIAL_FORM_STATE
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Update password</CardTitle>
        <CardDescription>
          Enter your new password to get back on track.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Password</Label>
              <Input
                autoComplete="password"
                id="password"
                name="password"
                type="password"
              />
              <ErrorMessages name="password" errors={state.errors} />
            </div>
            <SubmitButton content="Reset" classes="w-full" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
