import Link from "next/link";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import FadeIn from "../shared/fade-in";
import Section from "./section";
import SectionContent from "./section-content";
import PrivacyPolicy from "../shared/privacy-policy";
import TermsAndConditions from "../shared/terms-and-conditions";
import CookiePolicy from "../shared/cookie-policy";
import TextMuted from "../shared/typography/text-muted";
import Title from "../shared/typography/title";

export default async function Component() {
  return (
    <FadeIn>
      <Section className="mb-8 md:mb-8">
        <SectionContent className="border  shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-12">
            <div className="col-span-2 lg:pr-8 flex flex-col gap-4">
              <Title className="font-semibold">Vivotiv</Title>
              <TextMuted className="text-base">
                Our goal is to make it easy for more people to get active. We
                aim to remove barriers by offering simple, effective workouts
                tailored to fit your schedule and space.
              </TextMuted>
              <Link
                href="https://www.linkedin.com/in/pnilssson/"
                title="Creators linkedin"
                target="_blank">
                <LinkedInLogoIcon color="black" className="h-8 w-8" />
              </Link>
            </div>
            <div>
              <Title className="text-base">Company</Title>
              <ul className="mt-4 flex flex-col gap-4">
                <li>
                  <Link
                    href="/about"
                    title="About us"
                    className="flex font-light transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="mailto:info@vivotiv.com"
                    title="Mail us"
                    className="flex font-light transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Title className="text-base">Resources</Title>
              <ul className="mt-4 flex flex-col gap-4">
                <li>
                  <TermsAndConditions className="flex font-light transition-all duration-200 hover:text-purple-600 focus:text-purple-600" />
                </li>
                <li>
                  <PrivacyPolicy className="flex font-light transition-all duration-200 hover:text-purple-600 focus:text-purple-600" />
                </li>
                <li>
                  <CookiePolicy className="flex font-light transition-all duration-200 hover:text-purple-600 focus:text-purple-600" />
                </li>
              </ul>
            </div>
          </div>
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
