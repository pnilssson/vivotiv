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
  useSidebar,
} from "@/components/ui/sidebar";
import { FileTextIcon, SettingsIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackDialog from "../feedback-dialog";
import { toast } from "@/lib/hooks/use-toast";

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

function feedbackAction(
  description: string,
  variant: "success" | "destructive"
) {
  toast({ description, variant });
}

export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="h-20 gap-0 p-4 justify-center">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem className="text-xl">Vivotiv</SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent className="gap-8">
        {items.map((group) => (
          <SidebarGroup key={group.title} className="px-4 py-0">
            <SidebarGroupLabel className="text-sm">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.subItems.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton
                      size={"default"}
                      asChild
                      isActive={pathname.startsWith(subItem.url)}>
                      <Link
                        href={subItem.url}
                        onClick={() => setOpenMobile(false)}>
                        <subItem.icon />
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup className="px-4 py-0">
          <SidebarGroupLabel className="text-sm">Feedback</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <FeedbackDialog toastAction={feedbackAction} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {children}
    </Sidebar>
  );
}
