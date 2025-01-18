"use client";

import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { KeySquareIcon, MailIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export default function Component() {
  const pathname = usePathname();

  return (
    <React.Fragment>
      {pathname.endsWith("forgot-password") ? (
        <div className="flex flex-col gap-4 w-full">
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/signin/otp">
              <MailIcon />
              Login with Magic link
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/signin/password">
              <KeySquareIcon />
              Login with Password
            </Link>
          </Button>
        </div>
      ) : pathname.endsWith("password") ? (
        <Button variant="outline" asChild className="w-full">
          <Link href="/auth/signin/otp">
            <MailIcon />
            Login with Magic link
          </Link>
        </Button>
      ) : pathname.endsWith("otp") ? (
        <Button variant="outline" asChild className="w-full">
          <Link href="/auth/signin/password">
            <KeySquareIcon />
            Login with Password
          </Link>
        </Button>
      ) : null}
    </React.Fragment>
  );
}
