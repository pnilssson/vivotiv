import GetStartedButton from "../buttons/get-started-button";
import FadeIn from "../shared/fade-in";
import MembershipCard from "./membership-card";
import Section from "./section";
import SectionContent from "./section-content";

const MEMBERSHIP_OPTIONS = [
  {
    title: "Get started",
    subtitle: "One week membership",
    description:
      "Get started with one week of membership to access personalized training.",
    price: "$1.99",
    discount: "",
    highlight: false,
  },

  {
    title: "Make it a habit",
    subtitle: "Four weeks membership",
    description:
      "The 21/90 rule states that it takes 21 days to make a habit. Get four weeks of membership to access personalized training.",
    price: "$4.99",
    discount: "37%",
    highlight: false,
  },

  {
    title: "Create a lifestyle",
    subtitle: "12 weeks membership",
    description:
      "It takes 90 days to make it a permanent lifestyle change. Get 12 weeks of membership to access personalized training.",
    price: "$11.99",
    discount: "50%",
    highlight: true,
  },
  {
    title: "Never look back",
    subtitle: "26 weeks membership",
    description:
      "But creating a healthy lifestyle is not a sprint, it is a marathon. Get 26 weeks of membership to access personalized training.",
    price: "$19.99",
    discount: "61%",
    highlight: false,
  },
];

export default async function Component() {
  return (
    <FadeIn>
      <Section>
        <SectionContent className="flex flex-col">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-semibold">
              Pricing & Plans
            </h2>
            <p className="text-muted-foreground mt-4 max-w-80 md:max-w-xl mx-auto">
              We will always offer one-time payment options for our services,
              ensuring you don&apos;t have to deal with another subscription.
            </p>
          </div>
          <div className="grid max-w-md grid-cols-1 gap-8 mx-auto mt-10 lg:grid-cols-2 lg:max-w-full 2xl:grid-cols-4">
            {MEMBERSHIP_OPTIONS.map((option, index) => (
              <MembershipCard
                key={index}
                title={option.title}
                subtitle={option.subtitle}
                description={option.description}
                price={option.price}
                discount={option.discount}
                highlight={option.highlight}
              />
            ))}
          </div>
          <GetStartedButton
            content="Join now"
            classes="py-4 mt-10 h-24 w-full mx-auto shadow-lg text-lg"
          />
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
