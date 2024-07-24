"use client";

import useGenerateFromContext from "@/lib/hooks/useGenerateFormContext";
import clsx from "clsx";
// Components
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Step({
  step,
  segment,
}: {
  step: {
    number: number;
    segment: "general" | "personalize" | "equipment" | "summary";
    heading: string;
  };
  segment: "general" | "personalize" | "equipment" | "summary";
}) {
  // const router = useRouter();

  // const { formState } = useGenerateFromContext();
  // const { isValid } = formState;

  // const validateStep = async (href: string) => {
  //   if (isValid) {
  //     router.push(href);
  //   }
  // };

  return (
    <Link href={`/generate/${step.segment}`}>
      {/* <button type="button" onClick={() => validateStep(`/${step}`)}> */}
      <div className="flex items-center gap-4">
        <button
          className={clsx(
            "w-8 h-8 rounded-full border",
            "transition-colors duration-300",
            step.segment === segment
              ? "text-emerald-400 border-emerald-400"
              : "bg-transparent text-white border-white",
            "font-bold text-sm",
          )}
        >
          {step.number}
        </button>
        <div className="hidden lg:flex flex-col uppercase">
          <h3 className={clsx("font-normal text-sm")}>Step {step.number}</h3>
          <h2
            className={clsx(
              "font-bold text-sm tracking-wide",
              step.segment === segment
                ? "text-emerald-400 border-emerald-400"
                : "text-white",
            )}
          >
            {step.heading}
          </h2>
        </div>
      </div>
      {/* </button> */}
    </Link>
  );
}
