import ShineBorder from "@/components/magicui/shine-border";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function Component({
  title,
  subtitle,
  description,
  price,
  discount,
  highlight,
}: {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  discount?: string;
  highlight: boolean;
}) {
  const content = (
    <div
      className={cn("rounded-lg lg:h-80 2xl:h-96 md:my-auto", {
        "border-0": highlight,
        "border-2 border-gray-100 bg-white shadow-lg": !highlight,
      })}>
      <div className="p-8 h-full flex flex-col">
        {discount ? (
          <Badge
            className="bg-emerald-300 self-start font-normal hidden 2xl:flex mb-2"
            variant="secondary">
            Save {discount}
          </Badge>
        ) : (
          <div className="h-5 mb-2 hidden 2xl:flex"></div>
        )}
        <div className="flex flex-row justify-between">
          <h3 className="text-base font-semibold text-purple-600">{title}</h3>
          {discount ? (
            <Badge
              className="bg-emerald-300 self-center font-normal ml-auto 2xl:hidden flex"
              variant="secondary">
              Save {discount}
            </Badge>
          ) : null}
        </div>
        <p className="text-3xl font-bold text-black mt-8">{price}</p>
        <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
        <p className="mt-8">{description}</p>
      </div>
    </div>
  );

  return highlight ? (
    <ShineBorder
      className="overflow-hidden flex w-full bg-white shadow-lg"
      color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
      {content}
    </ShineBorder>
  ) : (
    content
  );
}
