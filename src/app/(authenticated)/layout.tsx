import NavigationWrapper from "@/components/menu/navigation-wrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/signin");
  }

  return <NavigationWrapper>{children}</NavigationWrapper>;
}
