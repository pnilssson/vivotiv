import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { getPrograms } from "./actions";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const programs = await getPrograms();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
        {programs.map((program) => (
          <Link key={program.id} href={`programs/${program.id}`}>
            <Card>
              <CardHeader>
                <CardDescription>
                  Start date: {program.startDate} <br /> End date:{" "}
                  {program.endDate}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <Separator className="mt-4" />
      {children}
    </>
  );
}
