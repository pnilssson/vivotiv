import PageTitle from "@/components/shared/typography/page-title";
import FullPageContentBox from "@/components/shared/full-page-content-box";
import { validateGenerating } from "./actions";
import Spinner from "./spinner";

export default async function Page() {
  await validateGenerating();
  return (
    <FullPageContentBox className={"flex flex-col justify-center"}>
      <PageTitle
        className="self-center text-center"
        title="Generating program"
        description="Your new program will soon be ready. You don't necessarily need to wait—feel free to check back in a minute or two. If you choose to stay, we'll automatically redirect you as soon as it's ready."
      />
      <Spinner />
    </FullPageContentBox>
  );
}
