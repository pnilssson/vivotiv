"use client";

import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { LogInIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Component({ session }: { session: Session | null }) {
  return (
    <TooltipProvider>
      {session ? (
        <Tooltip>
          <TooltipTrigger>
            <Button onClick={() => signOut()} variant="outline" size="icon">
              <LogInIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign out</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => signIn()} variant="outline" size="icon">
              <LogInIcon className="h-4 w-4" />
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
