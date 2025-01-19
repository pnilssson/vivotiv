"use client";

import { cn } from "@/lib/utils";

export default function Component({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
