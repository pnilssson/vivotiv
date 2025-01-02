import Header from "@/components/header";
import Center from "@/components/shared/center";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Center>{children}</Center>
    </>
  );
}
