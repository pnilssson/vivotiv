"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { EnterIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();
  return (
    <header className="flex justify-between p-4">
      <Button variant="link" className="text-lg px-0 font-medium">
        <Link href="/">Vivotiv</Link>
      </Button>
      {pathname.startsWith("/auth") ? null : (
        <Button asChild className="!ml-auto" size="sm">
          <Link href="/auth/signin">
            <EnterIcon /> Sign in
          </Link>
        </Button>
      )}
    </header>
  );
}
