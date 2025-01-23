import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./header";
import Footer from "./footer";

export default async function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Footer />
      </AppSidebar>
      <SidebarInset>
        <Header />
        <main className="py-4 md:py-8 md:px-8 max-w-[1280px] container">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
