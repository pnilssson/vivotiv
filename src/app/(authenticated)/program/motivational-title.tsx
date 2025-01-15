import Title from "@/components/shared/title";
import { motivationalTitles } from "@/lib/constants";

const getRandomMotivationalTitle = () => {
  const randomIndex = Math.floor(Math.random() * motivationalTitles.length);
  return motivationalTitles[randomIndex];
};

export default function MotivationalTitle() {
  return <Title>{getRandomMotivationalTitle()}</Title>;
}
