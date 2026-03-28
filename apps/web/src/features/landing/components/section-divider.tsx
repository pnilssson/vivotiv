import { cn } from "@/lib/utils";

type SectionDividerProps = {
  className?: string;
  wide?: boolean;
};

export function SectionDivider({ className, wide }: SectionDividerProps) {
  if (wide) {
    return <hr className={cn("border-t border-border", className)} />;
  }
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <hr className={cn("border-t border-border", className)} />
    </div>
  );
}
