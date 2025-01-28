import TextReveal from "../ui/text-reveal";
import SectionContent from "./section-content";

export default async function Component() {
  return (
    <SectionContent>
      <div className="z-10 flex min-h-64 items-center justify-center">
        <TextReveal
          text="Do it for you, for the ones you love, for the ones who doubt you, and for the ones who inspire you. Working out isn’t about becoming a world champion—it’s about being the best version of yourself. It’s about building good habits, both big and small. Moving your body regularly improves how you feel and function. Staying consistent reduces stress, boosts energy, and enhances your quality of life.

"
        />
      </div>
    </SectionContent>
  );
}
