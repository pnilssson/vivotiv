"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { FileTextIcon, SettingsIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Application",
    subItems: [
      {
        title: "Program",
        url: "/program",
        icon: FileTextIcon,
      },
      {
        title: "Configuration",
        url: "/configuration",
        icon: SettingsIcon,
      },
    ],
  },
  {
    title: "Store",
    subItems: [
      {
        title: "Shop",
        url: "/shop",
        icon: ShoppingCartIcon,
      },
    ],
  },
];

export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="h-16">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="text-2xl">
              <span className="underline decoration-emerald-400">V</span>ivotiv
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuSub>
                {group.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(subItem.url)}>
                      <Link
                        href={subItem.url}
                        onClick={() => setOpenMobile(false)}>
                        <subItem.icon />
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator />
      {children}
    </Sidebar>
  );
}
