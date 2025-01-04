import Link from "next/link";
import { Separator } from "./ui/separator";
import { LinkedInLogoIcon } from "@radix-ui/react-icons";

export default function Component() {
  return (
    <section className="pt-2 pb-4 container">
      <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100 px-8 md:px-24 py-12">
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
                <Link
                  href="#"
                  title=""
                  className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  title=""
                  className="flex text-base text-black transition-all duration-200 hover:text-purple-600 focus:text-purple-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-12 " />

        <p className="text-sm text-center">
          © Copyright 2024, All Rights Reserved by Vivotiv
        </p>
      </div>
    </section>
  );
}
