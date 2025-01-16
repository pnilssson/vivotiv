import ContentBox from "@/components/shared/content-box";
import PageTitle from "@/components/shared/typography/page-title";
import { Button } from "@/components/ui/button";
import { MIN_DATE } from "@/lib/constants";
import { shortDate } from "@/lib/utils";
import Link from "next/link";

export default async function Component({
  membershipEndDate,
}: {
  membershipEndDate: Date;
}) {
  return (
    <ContentBox className={"flex lg:gap-4 items-center lg:flex-row flex-wrap"}>
      <div className="flex gap-4 flex-1">
        <div className="flex items-center">
          <PageTitle
            className="mb-0"
            title="No active membership"
            description={
              membershipEndDate.getTime() == MIN_DATE.getTime()
                ? "You haven’t purchased your first membership yet. Visit the shop to do so and come back to generate your first training program!"
                : `Your membership ended on ${shortDate(membershipEndDate)}. Visit the shop to renew your membership!`
            }
          />
        </div>
      </div>
      <div className="flex w-full lg:w-auto mt-4 lg:mt-0 justify-end">
        <Button className="w-full lg:w-36" asChild>
          <Link href={"/shop"}>Get membership</Link>
        </Button>
      </div>
    </ContentBox>
  );
}
