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
        <div className="grid max-w-md grid-cols-1 gap-6 mx-auto mt-6 xl:max-w-full xl:grid-cols-2">
          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                One week of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $4 <span className="text-sm">($16/month)</span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                One-time payment
              </p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_bIY9Cne9k03t9Ms6or"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                One months of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $12 <span className="text-sm">($12/month)</span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                One-time payment
              </p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_28o3dZ0iug2rgaQ4gk"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                Three months of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $24 <span className="text-sm">($8/month)</span>
              </p>
              <p className="mt-2 text-base text-gray-600">One-time payment</p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_6oE5m72qC03t7Ek4gl"
                  target="_blank">
                  Buy now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                Six month of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $39 <span className="text-sm">($6.5/month)</span>
              </p>
              <p className="mt-2 text-base text-gray-600">One-time payment</p>
              <Button
                asChild
                className="py-4 mt-4 bg-emerald-400 hover:bg-emerald-400/90 shadow-lg w-full">
                <Link
                  href="https://buy.stripe.com/test_3cs29Vfdo6rR5wc5kq"
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
