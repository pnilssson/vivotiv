import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { EnterIcon, ExitIcon } from "@radix-ui/react-icons";

export default async function Component() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <>
      {data?.user ? (
        <form action={signOut}>
          <Button type="submit" variant="ghost">
            <ExitIcon className="mr-2" /> Sign out
          </Button>
        </form>
      ) : (
        <Button variant="ghost" asChild>
          <Link href="/auth/signin">
            <EnterIcon className="mr-2" /> Sign in
          </Link>
        </Button>
      )}
    </>
  );
}
