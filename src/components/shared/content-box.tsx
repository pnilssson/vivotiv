"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContentBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function ContentBox({
  children,
  className = "",
  ...props
}: ContentBoxProps) {
  return (
    <div
      className={cn(
        "bg-gray-50/90 border border-gray-100 rounded-lg p-4",
        className
      )}
      {...props}>
      {children}
    </div>
  );
}
