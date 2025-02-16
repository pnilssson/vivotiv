import FadeIn from "../shared/fade-in";
import SectionContent from "./section-content";
import React from "react";
import Section from "./section";
import { ClockIcon, LightbulbIcon, WalletIcon } from "lucide-react";
import Title from "../shared/typography/title";

export default async function Component() {
  return (
    <FadeIn>
      <Section className="mt-64 md:mt-96">
        <SectionContent className="py-0">
          <div className="flex flex-col gap-10">
            <div className="flex gap-4 flex-col items-start">
              <p className="flex flex-row font-semibold text-violet-600">
                Less hassle, more results
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold">
                Make the most out of what you have
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column Spanning 3 Rows */}
              <div className="border rounded-lg shadow-lg p-8 flex flex-col row-span-2 lg:col-span-1 col-span-2">
                <WalletIcon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-4">
                  <Title>Tired of expensive memberships?</Title>
                  <p className="text-muted-foreground text-base">
                    Our pricing is designed to be affordable, so you can access
                    high-quality, personalized training without a hefty monthly
                    fee. No contracts, no hidden costs—just a smarter way to
                    train from home.
                  </p>
                </div>
              </div>
              {/* Right Column - 3 Individual Rows */}
              <div className="border rounded-lg shadow-lg p-8 flex flex-col col-span-2">
                <ClockIcon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-4">
                  <Title>Struggling to find time for the gym?</Title>
                  <p className="text-muted-foreground text-base">
                    Our programs fit seamlessly into your schedule, allowing you
                    to train wherever and whenever it's most convenient. Make
                    the most out of what you have with efficient, personalized
                    workouts designed for your lifestyle.
                  </p>
                </div>
              </div>
              <div className="border rounded-lg shadow-lg p-8 flex flex-col col-span-2">
                <LightbulbIcon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-4">
                  <Title>Overwhelmed by complex workout plans?</Title>
                  <p className="text-muted-foreground text-base">
                    Workout plans can be complex but we've made it easy! Our
                    plans come with clear descriptions and explanations of each
                    exercise, so you can confidently perform every move—no
                    matter your previous experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
