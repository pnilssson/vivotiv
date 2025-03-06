import GetStartedButton from "../buttons/get-started-button";
import FadeIn from "../shared/fade-in";
import MembershipCard from "./membership-card";
import Section from "./section";
import SectionContent from "./section-content";

const MEMBERSHIP_OPTIONS = [
  {
    subtitle: "One week membership",
    price: "$1.99",
  },

  {
    subtitle: "Four weeks membership",
    price: "$1.25/week",
  },

  {
    subtitle: "12 weeks membership",
    price: "$0.99/week",
  },
  {
    subtitle: "26 weeks membership",
    price: "$0.77/week",
  },
];

export default async function Component() {
  return (
    <FadeIn>
      <Section>
        <SectionContent className="flex flex-col">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-semibold">Pricing</h2>
            <p className="text-muted-foreground mt-4 max-w-80 md:max-w-xl mx-auto">
              We believe in simple and fair pricing. We will therefore always
              offer one-time payment options for our personal training programs,
              with a low price-tag. Join now and get your first week for free!
            </p>
          </div>
          <div className="grid max-w-md grid-cols-1 gap-8 mx-auto mt-10 sm:grid-cols-2 lg:max-w-full xl:grid-cols-4">
            {MEMBERSHIP_OPTIONS.map((option, index) => (
              <MembershipCard
                key={index}
                subtitle={option.subtitle}
                price={option.price}
              />
            ))}
          </div>
          <GetStartedButton
            content="Try one week for free"
            classes="py-4 mt-10 h-16 w-full lg:max-w-md mx-auto shadow-lg text-lg"
          />
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
