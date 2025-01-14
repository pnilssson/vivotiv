import { cn } from "@/lib/utils";

export default function Component({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-2xl font-light leading-none tracking-tight",
        className
      )}>
      {children}
    </h3>
  );
}
