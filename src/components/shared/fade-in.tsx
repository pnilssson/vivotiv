"use client";

import { useIsVisible } from "@/lib/hooks/use-is-visible";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Component({
  children,
  className = "",
  ...props
}: FadeInProps) {
  const reference = useRef<HTMLDivElement>(null);
  const hasBeenVisible = useIsVisible(reference);

  return (
    <div
      ref={reference}
      className={cn({ "animate-fade": hasBeenVisible }, className)}
      {...props}>
      {children}
    </div>
  );
}
