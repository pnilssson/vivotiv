import { cn } from "@/lib/utils";

type BorderedContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function BorderedContainer({
  children,
  className,
}: BorderedContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}
