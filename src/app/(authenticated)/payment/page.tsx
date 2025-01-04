import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  function getLinkWithEmail(link: string) {
    return `${link}?prefilled_email=${user?.email}`;
  }

  return (
    <>
      <div className="grid gap-2">
        <div className="text-2xl font-semibold leading-none tracking-tight">
          Payment options
        </div>
        <div className="text-sm text-muted-foreground">
          All options are one time payments.
        </div>
      </div>
      <div>
        <div className="grid gap-6 mx-auto mt-6 max-w-full grid-cols-2 xl:grid-cols-4">
          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                One week of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $1.99 <span className="text-sm">($1.99/week)</span>
              </p>
              <Button asChild className="mt-4 w-full">
                <Link
                  href={getLinkWithEmail(
                    "https://buy.stripe.com/test_28o8yj8P017x0bS14b"
                  )}
                  target="_blank">
                  Get now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                Four weeks of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $4.99 <span className="text-sm">($1.25/week)</span>
              </p>
              <Button asChild className="mt-4 w-full">
                <Link
                  href={getLinkWithEmail(
                    "https://buy.stripe.com/test_7sIdSD7KWbMb9Ms5ks"
                  )}
                  target="_blank">
                  Get now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                12 weeks of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $11.99 <span className="text-sm">($0.99/week)</span>
              </p>
              <Button asChild className="mt-4 w-full">
                <Link
                  href={getLinkWithEmail(
                    "https://buy.stripe.com/test_8wM3dZ2qC8zZe2I8wF"
                  )}
                  target="_blank">
                  Get now
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-lg shadow-lg md:my-auto">
            <div className="p-8">
              <h3 className="text-base font-semibold text-purple-600">
                26 weeks of training
              </h3>
              <p className="text-4xl font-bold text-black mt-4">
                $19.99 <span className="text-sm">($0.77/week)</span>
              </p>
              <Button asChild className="mt-4 w-full">
                <Link
                  href={getLinkWithEmail(
                    "https://buy.stripe.com/test_8wMdSD5COcQfaQw6oy"
                  )}
                  target="_blank">
                  Get now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
