"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { KeySquareIcon, MailIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();

  return (
    <>
      {pathname.endsWith("password") ? (
        <Button variant="outline" asChild className="w-full">
          <Link href="/auth/signin/otp">
            <MailIcon className="mr-2 h-5 w-5" />
            Login with Magic link
          </Link>
        </Button>
      ) : (
        <Button variant="outline" asChild className="w-full">
          <Link href="/auth/signin/password">
            <KeySquareIcon className="mr-2 h-5 w-5" />
            Login with Password
          </Link>
        </Button>
      )}
    </>
  );
}
