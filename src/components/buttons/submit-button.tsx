"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { LoaderCircleIcon } from "lucide-react";

export default function Component({
  content,
  loadingContent,
  classes,
}: {
  content: string;
  loadingContent?: string;
  classes?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={classes ?? classes}>
      {pending && loadingContent ? null : content}
      {pending && loadingContent ? loadingContent : null}
      {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
    </Button>
  );
}
