import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./header";
import { cookies } from "next/headers";
import Footer from "./app-sidebar-footer";

export default async function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar>
        <Footer />
      </AppSidebar>
      <SidebarInset>
        <Header />
        <main className="py-8 px-8 max-w-[1280px] container">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
