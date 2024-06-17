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
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  FileTextIcon,
  HamburgerMenuIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { User } from "@supabase/auth-js";

export default function Component({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  const pathname = usePathname();

  return (
    <header className="container w-full bg-background flex items-center justify-between">
      <NavigationMenu className="w-full">
        <NavigationMenuList className="py-2 flex justify-between">
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
              href="/">
              Vivotiv
            </NavigationMenuLink>
          </NavigationMenuItem>
          {user ? (
            <>
              <NavigationMenuItem className="ml-auto hidden md:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full">
                      <PersonIcon className="h-4 w-4" />
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{children}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 md:hidden">
                      <HamburgerMenuIcon className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <nav className="flex flex-col h-full gap-6 text-lg">
                      <Link
                        href="/programs"
                        className={cn(
                          pathname.startsWith("/programs")
                            ? "font-medium"
                            : "text-muted-foreground",
                          "mt-6 flex items-center gap-4"
                        )}>
                        <FileTextIcon className="h-5 w-5" />
                        Programs
                      </Link>
                      <Link
                        href="/generate/general"
                        className={cn(
                          pathname.startsWith("/generate")
                            ? "font-medium"
                            : "text-muted-foreground",
                          "flex items-center gap-4"
                        )}>
                        <RocketIcon className="h-5 w-5" />
                        Generate
                      </Link>
                      <div className="mt-auto">{children}</div>
                    </nav>
                  </SheetContent>
                </Sheet>
              </NavigationMenuItem>
            </>
          ) : (
            <>{children}</>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
