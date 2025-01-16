"use client";

import Title from "@/components/shared/typography/title";
import { motivationalTitles } from "@/lib/constants";
import { useEffect, useState } from "react";

const getRandomMotivationalTitle = () => {
  const randomIndex = Math.floor(Math.random() * motivationalTitles.length);
  return motivationalTitles[randomIndex];
};

export default function MotivationalTitle() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(getRandomMotivationalTitle());
  }, []);

  return <Title>{title}</Title>;
}
