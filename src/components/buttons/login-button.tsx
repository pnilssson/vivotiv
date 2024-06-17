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
          <Button
            type="submit"
            variant="ghost"
            className="text-lg md:text-sm text-muted-foreground md:text-zinc-950">
            <ExitIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" /> Sign out
          </Button>
        </form>
      ) : (
        <Button variant="ghost" asChild className="md:text-sm md:text-zinc-950">
          <Link href="/auth/signin">
            <EnterIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" /> Sign in
          </Link>
        </Button>
      )}
    </>
  );
}
