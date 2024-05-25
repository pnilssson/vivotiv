"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";

export default function Component({ children }: { children: React.ReactNode }) {
  return (
    <NavigationMenu>
      <NavigationMenuList className="py-2 flex">
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
            vivotiv
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="ml-auto">{children}</NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
