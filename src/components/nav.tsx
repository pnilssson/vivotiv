"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { FileTextIcon, RocketIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

export default function Component({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full min-w-[200px] flex-col gap-6 text-lg">
      <Link
        href="/programs"
        className={cn(
          pathname.startsWith("/programs")
            ? "font-medium text-emerald-400"
            : "",
          "mt-6 flex items-center gap-4"
        )}>
        <FileTextIcon className="h-5 w-5" />
        Programs
      </Link>
      <Link
        href="/generate/general"
        className={cn(
          pathname.startsWith("/generate")
            ? "font-medium text-emerald-400"
            : "",
          "flex items-center gap-4"
        )}>
        <RocketIcon className="h-5 w-5" />
        Generate
      </Link>
      <div className="mt-auto">{children}</div>
    </nav>
  );
}
