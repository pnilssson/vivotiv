"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./ui/navigation-menu";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { User } from "@supabase/auth-js";
import Nav from "./nav";

export default function Component({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  return (
    <>
      <header className="w-full bg-background flex items-center justify-between px-4 md:px-6">
        <NavigationMenu className="">
          <NavigationMenuList className="py-4 w-full">
            <NavigationMenuItem>
              <NavigationMenuLink className="text-lg font-medium" href="/">
                Vivotiv
              </NavigationMenuLink>
            </NavigationMenuItem>
            {user ? (
              <NavigationMenuItem className="!ml-auto lg:hidden flex">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <HamburgerMenuIcon className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <Nav>{children}</Nav>
                  </SheetContent>
                </Sheet>
              </NavigationMenuItem>
            ) : (
              <div className="!ml-auto">{children}</div>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <Separator />
    </>
  );
}
