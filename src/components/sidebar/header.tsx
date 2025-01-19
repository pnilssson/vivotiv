"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export default function Component() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Function to transform a segment into a readable format
  const formatSegment = (segment: string) =>
    segment
      .split("-") // Split by dashes
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" "); // Join words with spaces

  return (
    <header className="flex h-20 w-full shrink-0 items-center gap-2 border-b px-4 md:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize text-xl">
                    {formatSegment(segment)} {/* Apply the formatting */}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <SidebarTrigger className="ml-auto" />
    </header>
  );
}
