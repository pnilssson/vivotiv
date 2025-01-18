import TextReveal from "../ui/text-reveal";
import SectionContent from "./section-content";

export async function Benefits() {
  return (
    <SectionContent>
      <div className="z-10 flex min-h-64 items-center justify-center">
        <TextReveal text="Working out is not about having a six pack or running a marathon—it’s about feeling good and living life to the fullest. Regular movement, even in small amounts, is ∞ times better than doing nothing at all. Every step forward, no matter how small, will make you more capable in your every day life. It boosts your mood, helps reduce stress, and makes it easier to enjoy the things that matter most, like spending time with friends and family, and feeling confident in your own body. The key is consistency—each workout is an investment in a healthier, more vibrant you." />
      </div>
    </SectionContent>
  );
}
