"use client";

import Center from "@/components/shared/center";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogLevel, useLogger } from "next-axiom";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Page({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname();
  const log = useLogger({ source: "global-error.tsx" });
  let status = error.message == "Invalid URL" ? 404 : 500;

  log.logHttpRequest(
    LogLevel.error,
    error.message,
    {
      host: window.location.href,
      path: pathname,
      statusCode: status,
    },
    {
      error: error.name,
      cause: error.cause,
      stack: error.stack,
      digest: error.digest,
    }
  );

  return (
    <Center>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            Please try again or contact us if the problem persists.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </Center>
  );
}
