import Provider from "./provider";
import Sidebar from "./sidebar";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="lg:border text-card-foreground lg:bg-card w-full flex flex-col lg:flex-row px-4 lg:p-4 rounded-lg lg:shadow-sm">
      <Sidebar />
      <Provider>{children}</Provider>
    </div>
  );
}
