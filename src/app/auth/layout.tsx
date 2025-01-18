import Header from "@/components/header";
import Center from "@/components/shared/center";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <Header />
      <Center>{children}</Center>
    </React.Fragment>
  );
}
