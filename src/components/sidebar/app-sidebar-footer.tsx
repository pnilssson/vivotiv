import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import React from "react";
import { signOut } from "@/lib/actions/authActions";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

export default async function Component() {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <form action={signOut}>
            <Button type="submit" variant="link">
              <ExitIcon />
              Sign out
            </Button>
          </form>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
