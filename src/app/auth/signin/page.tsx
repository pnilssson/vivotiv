"use client";

import SubmitButton from "@/components/buttons/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import { login } from "./actions";
import ErrorMessages from "@/components/shared/error-messages";
import { initialFormState } from "@/lib/constants";

export default function Page() {
  const [state, formAction] = useFormState(login, initialFormState);
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="h-1/4"></div>
      <form action={formAction}>
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              We will send a sign-in link to your email. We will also create an
              account for you if this is your first time signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
            />
            <ErrorMessages name="email" errors={state.errors} />
          </CardContent>
          <CardFooter>
            <SubmitButton content="Sign in" classes="w-full" />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
