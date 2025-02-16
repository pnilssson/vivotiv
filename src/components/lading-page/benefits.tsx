import TextReveal from "../ui/text-reveal";
import SectionContent from "./section-content";

export default async function Component() {
  return (
    <SectionContent>
      <div className="z-10 flex min-h-64 items-center justify-center">
        <TextReveal text="Do it for you, for the ones you love, for those who doubt you, and for those who inspire you. It’s not about becoming a world champion—it’s about becoming the best version of yourself. It’s about building good habits. It’s about being able to enjoy activities with your loved ones. It’s about building confidence in what you’re capable of. Moving your body regularly improves how you feel and function. It reduces stress, boosts energy, and enhances your quality of life." />
      </div>
    </SectionContent>
  );
}
