import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { EnterIcon, ExitIcon } from "@radix-ui/react-icons";

export default async function Component() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <>
      {data?.user ? (
        <form action={signOut}>
          <Button
            type="submit"
            variant="link"
            className="text-lg px-0 font-medium">
            <ExitIcon className="mr-4 h-5 w-5" /> Sign out
          </Button>
        </form>
      ) : (
        <Button variant="link" asChild className="text-lg px-0 font-medium">
          <Link href="/auth/signin">
            <EnterIcon className="mr-2 h-5 w-5" /> Sign in
          </Link>
        </Button>
      )}
    </>
  );
}
