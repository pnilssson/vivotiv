"use client";

import { Button } from "../ui/button";
import Link from "next/link";

export default function Component({
  content,
  classes,
}: {
  content: string;
  classes?: string;
}) {
  return (
    <Button className={classes ?? classes} asChild>
      <Link href="/auth/signin">{content}</Link>
    </Button>
  );
}
