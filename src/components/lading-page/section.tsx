import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export default function Component({
  children,
  className = "",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("flex flex-col container mb-12 md:mb-32", className)}
      {...props}>
      {children}
    </section>
  );
}
