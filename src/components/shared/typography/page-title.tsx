"use client";

import { cn } from "@/lib/utils";
import Title from "./title";
import TextMuted from "./text-muted";

export default function Component({
  title,
  description,
  className = "",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 mb-4 md:mb-8", className)}>
      <Title>{title}</Title>
      <TextMuted className="max-w-[768px]">{description}</TextMuted>
    </div>
  );
}
