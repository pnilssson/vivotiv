import ShineBorder from "@/components/magicui/shine-border";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <>
      <div className="grid gap-2">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          Payment and billing
        </div>
        <div className="text-sm text-muted-foreground">
          Manage your payment and billing details.
        </div>
      </div>
      <div>
        <div className="grid max-w-md grid-cols-1 gap-6 mx-auto mt-6 xl:max-w-full xl:mt-16 xl:grid-cols-3">
          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8 xl:px-12">
              <h3 className="text-base font-semibold text-purple-600">
                Three weeks of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                €17<span className="text-sm">/month</span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                One-time payment
              </p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_cN24i35CO8zZ2k05kk"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </div>

          <ShineBorder
            className="overflow-hidden rounded-lg shadow-lg w-full"
            color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
            <div className="p-8 xl:px-12">
              <h3 className="text-base font-semibold text-purple-600">
                Twelve weeks of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                €12<span className="text-sm">/month</span>
              </p>
              <p className="mt-2 text-base text-gray-600">One-time payment</p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_8wM4i31my6rRe2IdQR"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </ShineBorder>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8 xl:px-12">
              <h3 className="text-base font-semibold text-purple-600">
                One year of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                €7<span className="text-sm">/month</span>
              </p>
              <p className="mt-2 text-base text-gray-600">One-time payment</p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_4gwbKv3uGg2r7Ek28a"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
