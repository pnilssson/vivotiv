import Center from "@/components/shared/center";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Center>{children}</Center>;
}
