import Register from "@/components/auth/register";
import { Card, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default async function Page() {
  return (
    <Card>
      <Register />
      <CardFooter className="flex flex-col gap-6">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
