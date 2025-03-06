import FadeIn from "../shared/fade-in";
import SectionContent from "./section-content";
import React from "react";
import Section from "./section";
import { RepeatIcon, SlidersHorizontalIcon } from "lucide-react";
import {
  Crosshair2Icon,
  MagicWandIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import Title from "../shared/typography/title";

// Extracted list of steps
const steps = [
  {
    title: "1. Configure",
    text: "The programs will be tailor-made based on your needs and takes above mentioned inputs in consideration.",
    icon: SlidersHorizontalIcon,
  },
  {
    title: "2. Generate",
    text: "We create personalized training programs based on your configuration in minutes.",
    icon: MagicWandIcon,
  },
  {
    title: "3. Execute",
    text: "Execute the program we provide you with and reap the benefits of regular exercise.",
    icon: Crosshair2Icon,
  },
  {
    title: "4. Repeat",
    text: "Fine-tune the configuration, repeat the process and stay healthy.",
    icon: RepeatIcon,
  },
];

export default async function Component() {
  return (
    <FadeIn>
      <Section className="mb-0 md:mb-0">
        <SectionContent className="py-0">
          <div className="flex flex-col gap-10">
            <div className="flex gap-4 flex-col items-start">
              <p className="flex flex-row font-semibold text-violet-600">
                Easy as 1, 2, 3, <ResetIcon className="ml-1 mt-1" />
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold">
                How it works?
              </h2>
              <p className="text-muted-foreground max-w-[540px]">
                It will only take a few minutes to prepare your first custom
                workout program.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg shadow-lg p-8 flex flex-col overflow-hidden hover:border-emerald-400 transition-all duration-300 hover:shadow-emerald-100">
                  {/* Background Icon */}
                  <step.icon className="absolute top-8 right-8 text-violet-400 opacity-25 w-24 h-24 z-0" />

                  {/* Foreground Content */}
                  <div className="relative z-10 flex flex-col gap-4">
                    <Title>{step.title}</Title>
                    <p className="text-muted-foreground text-base">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
