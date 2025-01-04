"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { EnterIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";

export default function Component() {
  const pathname = usePathname();
  return (
    <header className="w-full bg-background flex items-center justify-between px-4 md:px-6">
      <NavigationMenu className="">
        <NavigationMenuList className="py-4 w-full">
          <NavigationMenuItem className="text-lg font-medium">
            <Button variant="link" className="text-lg px-0 font-medium">
              <Link href="/">Vivotiv</Link>
            </Button>
          </NavigationMenuItem>
          {/* {pathname.startsWith("/auth") ? null : (
            <Button asChild className="!ml-auto">
              <Link href="/auth/signin">
                <EnterIcon className="h-5 w-5" /> Sign in
              </Link>
            </Button>
          )} */}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
