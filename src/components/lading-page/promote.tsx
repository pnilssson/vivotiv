import FadeIn from "../shared/fade-in";
import SectionContent from "./section-content";
import React from "react";
import Section from "./section";
import Title from "../shared/typography/title";
import { PiggyBank, Hourglass, Brain } from "lucide-react"; // Importing new icons
import cn from "clsx"; // Import clsx

// Extracted list of steps for the second component
const steps = [
  {
    title: "Tired of expensive memberships?",
    text: "Our pricing is designed to be affordable, so you can access high-quality, personalized training without a hefty monthly fee. No contracts, no hidden costs—just a smarter way to train from home.",
    icon: PiggyBank, // Added icon
    colSpan: "lg:col-span-1 col-span-2",
    rowSpan: "row-span-2 lg:col-span-1 col-span-2",
  },
  {
    title: "Struggling to find time for the gym?",
    text: "Our programs fit seamlessly into your schedule, allowing you to train wherever and whenever it’s most convenient. Make the most out of what you have with efficient, personalized workouts designed for your lifestyle.",
    icon: Hourglass, // Added icon
    colSpan: "col-span-2",
    rowSpan: "col-span-2",
  },
  {
    title: "Overwhelmed by complex workout plans?",
    text: "Workout plans can be complex but we’ve made it easy! Our plans come with clear descriptions and explanations of each exercise, so you can confidently perform every move—no matter your previous experience.",
    icon: Brain, // Added icon
    colSpan: "col-span-2",
    rowSpan: "col-span-2",
  },
];

export default async function Component() {
  return (
    <FadeIn>
      <Section className="mt-64 md:mt-96">
        <SectionContent className="py-0">
          <div className="flex flex-col gap-10">
            <div className="flex gap-4 flex-col items-start">
              <p className="flex flex-row font-semibold text-violet-600">
                Less hassle, all the benefits
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold">
                Why train from home?
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative border rounded-lg shadow-lg p-8 flex flex-col  hover:border-emerald-400 transition-all duration-300 hover:shadow-emerald-100",
                    step.colSpan,
                    step.rowSpan
                  )}>
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
