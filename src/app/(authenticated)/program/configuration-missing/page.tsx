import FullPageContentBox from "@/components/shared/full-page-content-box";
import PageTitle from "@/components/shared/typography/page-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { validateConfigurationExist } from "./actions";

export default async function Page() {
  await validateConfigurationExist();
  return (
    <FullPageContentBox className={"flex flex-col justify-center"}>
      <PageTitle
        className=" self-center text-center"
        title="Configuration missing"
        description="In order to tailor-make your training program we need to know your
            preferences."
      />
      <div className="mt-4 self-center">
        <Button className="lg:w-36" asChild>
          <Link href="/configuration">Configure now</Link>
        </Button>
      </div>
    </FullPageContentBox>
  );
}
