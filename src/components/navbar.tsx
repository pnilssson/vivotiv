"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import LoginButton from "./buttons/login-button";
import { Session } from "next-auth";

export default function Component({ session }: { session: Session | null }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="py-2 flex">
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="ml-auto">
          <LoginButton session={session} />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
