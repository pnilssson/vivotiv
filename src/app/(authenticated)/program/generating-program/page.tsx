import ContentBox from "@/components/shared/content-box";
import PageTitle from "@/components/shared/typography/page-title";
import ProgressBar from "./progress-bar";

export default async function Page() {
  return (
    <ContentBox className={"flex lg:gap-4 items-center lg:flex-row flex-wrap"}>
      <div className="flex gap-4 flex-1">
        <div className="flex items-center">
          <PageTitle
            className="mb-0"
            title="Generating program"
            description="We're currently generating your new program. Please give us a minute."
          />
        </div>
      </div>
      <div className="w-full">
        <ProgressBar />
      </div>
    </ContentBox>
  );
}
