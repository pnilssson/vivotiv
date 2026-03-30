import { cn } from "@/lib/utils";

type ContentCardGridProps = {
  children: React.ReactNode;
  className?: string;
};

function ContentCardGrid({ children, className }: ContentCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-px border border-border bg-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ContentCardProps = {
  children: React.ReactNode;
  className?: string;
};

function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div
      className={cn(
        "h-full bg-card p-8 transition-colors hover:bg-depth-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { ContentCard, ContentCardGrid };
