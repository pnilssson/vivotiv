"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { LoaderCircleIcon } from "lucide-react";

export default function Component({
  content,
  classes,
}: {
  content: string;
  classes?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      className={classes ?? classes}>
      {content}
      {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
    </Button>
  );
}
