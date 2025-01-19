import React from "react";
import FadeIn from "@/components/shared/fade-in";
import Section from "@/components/lading-page/section";
import SectionContent from "@/components/lading-page/section-content";
import Header from "@/components/header";
import Link from "next/link";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";

export default async function Component() {
  return (
    <React.Fragment>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <FadeIn>
          <Section className="mb-0 md:mb-0 mt-16 lg:mt-48">
            <SectionContent className="py-0">
              <h2 className="text-5xl md:text-6xl font-semibold">
                With the goal to make more people{" "}
                <span className="text-emerald-400">move</span>
              </h2>
            </SectionContent>
          </Section>
          <Section className="mb-0 md:mb-0 mt-16 lg:mt-40">
            <SectionContent className="py-0">
              <div className="flex flex-col gap-10">
                <div className="flex gap-4 flex-col items-start">
                  <div className="flex flex-row items-center">
                    <h2 className="text-4xl md:text-5xl font-semibold">
                      About{" "}
                      <span className="line-through decoration-4 decoration-emerald-400">
                        us
                      </span>{" "}
                      <span className="text-emerald-400">me</span>
                    </h2>
                    <Link
                      className="ml-2"
                      href="https://www.linkedin.com/in/pnilssson/"
                      target="_blank">
                      <LinkedInLogoIcon
                        color="black"
                        className="h-8 w-8 lg:h-10 lg:w-10"
                      />
                    </Link>
                  </div>
                  <p className="text-muted-foreground max-w-[540px]">
                    We, are really just me—a passionate individual who has been
                    working out his whole life and deeply believes in its power
                    to transform lives. I&apos;m certain that movement can
                    improve both physical and mental well-being, and I want to
                    share that with as many people as possible. That&apos;s why
                    I&apos;m building Vivotiv.
                  </p>
                </div>
              </div>
            </SectionContent>
          </Section>
        </FadeIn>
        <FadeIn>
          <Section>
            <SectionContent>
              <Image
                className="lg:mt-24 rounded-lg"
                src="/img/me.JPEG"
                width={1491}
                height={1863}
                alt="Picture of the creator of Vivotiv"
              />
            </SectionContent>
          </Section>
        </FadeIn>
      </div>
    </React.Fragment>
  );
}
