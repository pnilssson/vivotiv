import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Component() {
  return (
    <div
      className={
        "bg-slate-50/50 border border-slate-100 rounded-lg p-4 flex lg:gap-4 items-center lg:flex-row flex-wrap"
      }>
      <div className="flex gap-4 flex-1">
        <div className="my-auto grid gap-2">
          <div className="flex items-center">
            <h3 className="text-xl">No configuration</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            In order to tailor-make your training program we need to know your
            preferences.
          </p>
        </div>
      </div>
      <div className="flex w-full lg:w-auto mt-4 lg:mt-0 justify-end">
        <Button className="w-full lg:w-36" asChild>
          <Link href={"/configuration"}>Configure now</Link>
        </Button>
      </div>
    </div>
  );
}
