"use client";

import { useSelectedLayoutSegment } from "next/navigation";
// Components
import Image from "next/image";
import Step from "./step";
// Images
import bgSidebarDesktop from "../../../../public/bg-sidebar-desktop.svg";
import bgSidebarMobile from "../../../../public/bg-sidebar-mobile.svg";

export default function Sidebar() {
  const segment = useSelectedLayoutSegment() as
    | "general"
    | "personalize"
    | "equipment"
    | "summary";

  const steps: {
    number: number;
    segment: "general" | "personalize" | "equipment" | "summary";
    heading: string;
  }[] = [
    {
      number: 1,
      segment: "general",
      heading: "General",
    },
    {
      number: 2,
      segment: "personalize",
      heading: "Personalize",
    },
    {
      number: 3,
      segment: "equipment",
      heading: "Equipment",
    },
    {
      number: 4,
      segment: "summary",
      heading: "Summary",
    },
  ];

  const Steps = steps.map((step) => (
    <Step key={step.number} step={step} segment={segment} />
  ));

  return (
    <div className="relative shrink-0">
      <div className="lg:absolute lg:inset-0 lg:px-8 py-8 lg:py-10 flex flex-row justify-center lg:justify-stretch lg:flex-col gap-4 lg:gap-6">
        {Steps}
      </div>
      <Image
        src={bgSidebarDesktop}
        alt=""
        priority
        className="hidden lg:block -z-10"
      />
      <Image
        src={bgSidebarMobile}
        alt=""
        priority
        className="lg:hidden w-full h-full fixed top-0 inset-x-0 -z-10 max-h-[172px] object-cover object-center"
      />
    </div>
  );
}
