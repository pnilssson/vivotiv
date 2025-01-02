"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "./ui/navigation-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { User } from "@supabase/auth-js";
import Nav from "./nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Component({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="w-full bg-background flex items-center justify-between px-4 md:px-6">
        <NavigationMenu className="">
          <NavigationMenuList className="py-4 w-full">
            <NavigationMenuItem className="text-lg font-medium">
              <Button
                variant="link"
                asChild
                className="text-lg px-0 font-medium">
                <Link href="/">Vivotiv</Link>
              </Button>
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
                    <SheetTitle>Vivotiv</SheetTitle>
                    <Nav>{children}</Nav>
                  </SheetContent>
                </Sheet>
              </NavigationMenuItem>
            ) : pathname.startsWith("/auth") ? null : (
              <div className="!ml-auto">{children}</div>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </header>
    </>
  );
}
