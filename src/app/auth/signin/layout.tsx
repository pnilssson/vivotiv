import { Card, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import SignInOptions from "@/app/auth/signin/sign-in-options";
import PrivacyPolicy from "@/components/shared/privacy-policy";
import TermsAndConditions from "@/components/shared/terms-and-conditions";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <div className="grid gap-6">
        <Card>
          {children}
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
          <CardFooter className="flex flex-col mt-6 gap-6">
            <SignInOptions />
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
          By clicking continue, you agree to our{" "}
          <TermsAndConditions className="" /> and <PrivacyPolicy className="" />
          .
        </div>
      </div>
    </React.Fragment>
  );
}
