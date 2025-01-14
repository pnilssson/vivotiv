import { cn } from "@/lib/utils";
import Heading from "./heading";
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
    <div className={cn("grid gap-2 mb-4", className)}>
      <Heading>{title}</Heading>
      <TextMuted className="max-w-[768px]">{description}</TextMuted>
    </div>
  );
}
