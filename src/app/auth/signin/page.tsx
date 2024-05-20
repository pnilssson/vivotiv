"use client";

import { Button } from "@/components/ui/button";
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
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="h-1/4"></div>
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            We will send a sign-in link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            required
            type="email"
            value={email}
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              setLoading(true);
              signIn("resend", {
                email: email,
                callbackUrl: "/archive/calendar",
              });
            }}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
