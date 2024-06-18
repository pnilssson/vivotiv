import LoginButton from "@/components/buttons/login-button";
import Sidebar from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }
  return (
    <div className="flex">
      <Sidebar>
        <LoginButton />
      </Sidebar>
      <div className="py-4 px-4 container max-w-[1024px]">{children}</div>
    </div>
  );
}
