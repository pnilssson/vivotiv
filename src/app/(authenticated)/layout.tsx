import NavigationWrapper from "@/components/sidebar/sidebar-wrapper";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

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

  return (
    <React.Fragment>
      <NavigationWrapper>{children}</NavigationWrapper>
    </React.Fragment>
  );
}
