import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";
import { EnterIcon, ExitIcon } from "@radix-ui/react-icons";

export default async function Component() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <TooltipProvider>
      {data?.user ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8">
                <ExitIcon />
              </Button>
            </form>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign out</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/auth/signin">
                <EnterIcon />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TooltipProvider>
  );
}
