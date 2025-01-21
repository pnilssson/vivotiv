import TextReveal from "../ui/text-reveal";
import SectionContent from "./section-content";

export default async function Component() {
  return (
    <SectionContent>
      <div className="z-10 flex min-h-64 items-center justify-center">
        <TextReveal text="Fitness isn’t defined by reaching a specific goal or hitting a certain number—it’s about creating lasting habits that improve your overall well-being. Moving your body regularly, even in small ways, makes a huge difference in how you feel and function. It’s not about perfection; it’s about progress. Whether it’s walking, stretching, or a quick workout, every bit helps reduce stress, enhance your energy, and improve your quality of life. The more consistent you are, the more your body and mind will thrive, giving you the strength to enjoy the things that matter most, like being active with loved ones and embracing each day with confidence." />
      </div>
    </SectionContent>
  );
}
