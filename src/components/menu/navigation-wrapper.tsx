import AppSidebar from "@/components/menu/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./header";
import { cookies } from "next/headers";
import Footer from "./footer";

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
        <main className="py-4 px-4 container max-w-[1024px]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
