import FadeIn from "../shared/fade-in";
import {
  Crosshair2Icon,
  MagicWandIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import SectionContent from "./section-content";
import React from "react";
import Section from "./section";
import { RepeatIcon, Settings2Icon } from "lucide-react";

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
                It will only take a few minutes to prepare your first custom workout program.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-linear-to-br from-emerald-100 to-sky-100 rounded-lg shadow-lg h-full lg:col-span-2 p-8 flex justify-between flex-col">
                <Settings2Icon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">1. Configure</h3>
                  <p className="text-muted-foreground max-w-xs text-base">
                    The programs will be tailor-made based on your needs and
                    takes above mentioned inputs in consideration.
                  </p>
                </div>
              </div>
              <div className="bg-linear-to-br from-emerald-100 to-sky-100 rounded-lg shadow-lg p-8 flex justify-between flex-col">
                <MagicWandIcon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">2. Generate</h3>
                  <p className="text-muted-foreground max-w-xs text-base">
                    We use AI to generate personalized traning program based on
                    your configuration.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-br from-emerald-100 to-sky-100 rounded-lg shadow-lg p-8 flex justify-between flex-col">
                <Crosshair2Icon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">3. Execute</h3>
                  <p className="text-muted-foreground max-w-xs text-base">
                    Execute the program we provide you with and reap the
                    benefits of regular exercise.
                  </p>
                </div>
              </div>
              <div className="bg-linear-to-br from-emerald-100 to-sky-100 rounded-lg shadow-lg h-full lg:col-span-2 p-8 flex justify-between flex-col">
                <RepeatIcon className="h-6 w-6 mb-4" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold">4. Repeat</h3>
                  <p className="text-muted-foreground max-w-xs text-base">
                    Fine tune the configuration, repeat the process and stay
                    healthy.
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
