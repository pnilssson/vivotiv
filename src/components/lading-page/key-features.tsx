import {
  AnvilIcon,
  SlidersHorizontalIcon,
  TimerIcon,
  UserCog,
} from "lucide-react";
import FadeIn from "../shared/fade-in";
import Section from "./section";
import SectionContent from "./section-content";
import { FeatureSection } from "../ui/feature-section";

const features = [
  {
    title: "Your time",
    description:
      "Let us know how long sessions and how many sessions you want per week. We'll create a program that fits your schedule.",
    icon: <TimerIcon />,
  },
  {
    title: "Your equipment",
    description:
      "Select the equipment you have, and we’ll build a program that works with what you’ve got.",
    icon: <AnvilIcon />,
  },
  {
    title: "Your experience",
    description:
      "Choose your fitness level, and we'll make sure the program challenge you just right, whether you're a beginner or advanced.",
    icon: <UserCog />,
  },
  {
    title: "Your preferences",
    description:
      "Pick your preferred workout days and focus areas—strength, flexibility, balance, or endurance.",
    icon: <SlidersHorizontalIcon />,
  },
];

export default async function Component() {
  return (
    <FadeIn>
      <Section className="my-36 md:my-64">
        <SectionContent>
          <FeatureSection features={features} />
        </SectionContent>
      </Section>
    </FadeIn>
  );
}
