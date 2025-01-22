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
            description="Your new program will soon be ready . You don't necessarily need to wait—feel free to check back in a minute or two. If you choose to stay, we'll automatically redirect you as soon as it's ready."
          />
        </div>
      </div>
      <div className="w-full">
        <ProgressBar />
      </div>
    </ContentBox>
  );
}
