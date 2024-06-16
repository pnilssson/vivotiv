"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { navigationMenuTriggerStyle } from "./ui/navigation-menu";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export default function Component({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <NavigationMenu>
        <NavigationMenuList className="py-2 flex">
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              href="/">
              Vivotiv
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="ml-auto flex items-center">
            {children}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Separator />
    </div>
  );
}
