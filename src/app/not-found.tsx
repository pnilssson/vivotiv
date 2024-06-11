import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="h-1/4"></div>
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">404</CardTitle>
          <CardDescription>
            Sorry, the page you were looking for was not found.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/">Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
