"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import ContentBox from "../shared/content-box";
import dynamic from "next/dynamic";
const MotivationalTitle = dynamic(() => import("./motivational-title"), {
  ssr: false,
});

export default function Component() {
  return (
    <header className="pt-4 md:px-8 max-w-[1280px] container">
      <ContentBox className="flex flex-row justify-between items-center">
        <MotivationalTitle />
        <SidebarTrigger />
      </ContentBox>
    </header>
  );
}
