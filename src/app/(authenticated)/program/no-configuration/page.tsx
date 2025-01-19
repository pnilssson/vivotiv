import ContentBox from "@/components/shared/content-box";
import PageTitle from "@/components/shared/typography/page-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <ContentBox className={"flex lg:gap-4 items-center lg:flex-row flex-wrap"}>
      <div className="flex gap-4 flex-1">
        <div className="flex items-center">
          <PageTitle
            className="mb-0"
            title="No configuration"
            description="In order to tailor-make your training program we need to know your
            preferences."
          />
        </div>
      </div>
      <div className="flex w-full lg:w-auto mt-4 lg:mt-0 justify-end">
        <Button className="w-full lg:w-36" asChild>
          <Link href="/configuration">Configure now</Link>
        </Button>
      </div>
    </ContentBox>
  );
}
