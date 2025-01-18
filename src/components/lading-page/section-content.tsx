import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SectionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Component({
  children,
  className = "",
  ...props
}: SectionContentProps) {
  return (
    <div className={cn("rounded-xl px-8 md:px-24 py-12", className)} {...props}>
      {children}
    </div>
  );
}
