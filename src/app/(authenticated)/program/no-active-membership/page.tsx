import PageTitle from "@/components/shared/typography/page-title";
import { Button } from "@/components/ui/button";
import { MIN_DATE } from "@/lib/constants";
import { shortDate } from "@/lib/utils";
import Link from "next/link";
import { getMemberShipEndDate } from "./actions";
import FullPageContentBox from "@/components/shared/full-page-content-box";

export default async function Component() {
  const membershipEndDate = await getMemberShipEndDate();

  return (
    <FullPageContentBox className={"flex flex-col justify-center"}>
      <PageTitle
        className="self-center text-center"
        title="No active membership"
        description={
          membershipEndDate.getTime() == MIN_DATE.getTime()
            ? "You haven’t purchased your first membership yet. Visit the membership store to do so and come back to generate your first training program!"
            : `Your membership ended on ${shortDate(membershipEndDate)}. Visit the membership store to renew your membership!`
        }
      />
      <div className="mt-4 self-center">
        <Button className="w-full lg:w-36" asChild>
          <Link href={"/membership"}>Get membership</Link>
        </Button>
      </div>
    </FullPageContentBox>
  );
}
