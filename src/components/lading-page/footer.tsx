import Link from "next/link";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";
import FadeIn from "../shared/fade-in";
import Section from "./section";
import SectionContent from "./section-content";
import PrivacyPolicy from "../shared/privacy-policy";
import TermsAndConditions from "../shared/terms-and-conditions";

export default function Component() {
  return (
    <FadeIn>
      <Section className="mb-8 md:mb-8">
        <SectionContent className="bg-gradient-to-br from-emerald-100 to-sky-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-12">
            <div className="col-span-2 lg:pr-8">
              <h4 className="font-bold text-2xl">Vivotiv</h4>

              <p className="text-base leading-relaxed text-gray-600 mt-7">
                We aim to make it easy for you to start working out from home
                today by providing simple, effective routines that fit your
                schedule and space.
              </p>

              <ul className="flex items-center space-x-3 mt-9">
                <li className="bg-slate-800 p-2 rounded-full">
                  <Link
                    href="https://www.linkedin.com/in/pnilssson/"
                    target="_blank">
                    <LinkedInLogoIcon color="white" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-widest  text-muted-foreground uppercase">
                Company
              </p>

              <ul className="mt-6 space-y-4">
                <li>
                  <Link
                    href="#"
                    title=""
                    className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                    About
                  </Link>
                </li>

                <li>
                  <Link
                    href="#"
                    title=""
                    className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                Resources
              </p>

              <ul className="mt-6 space-y-4">
                <li>
                  <TermsAndConditions className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600" />
                </li>

                <li>
                  <PrivacyPolicy className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600" />
                </li>
              </ul>
            </div>
          </div>

          <p className="text-sm mt-12">
            © Copyright 2024, All Rights Reserved by Vivotiv
          </p>
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
