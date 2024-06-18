"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { FileTextIcon, RocketIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Component({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full min-w-[200px] flex-col gap-6 text-lg">
      <Button
        variant="link"
        asChild
        className={cn(
          pathname.startsWith("/programs") ? "text-emerald-400" : "",
          "text-lg px-0 font-medium"
        )}>
        <Link
          href="/programs"
          className="mt-6 flex items-center gap-4 !justify-start">
          <FileTextIcon className="h-5 w-5" />
          Programs
        </Link>
      </Button>
      <Button
        variant="link"
        asChild
        className={cn(
          pathname.startsWith("/generate") ? "text-emerald-400" : "",
          "text-lg px-0 font-medium"
        )}>
        <Link
          href="/generate/general"
          className="flex items-center gap-4 !justify-start">
          <RocketIcon className="h-5 w-5" />
          Generate
        </Link>
      </Button>
      <div className="mt-auto">{children}</div>
    </nav>
  );
}
