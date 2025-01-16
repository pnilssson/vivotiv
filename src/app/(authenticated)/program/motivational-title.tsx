"use client";

import Title from "@/components/shared/typography/title";
import { MOTIVATIONAL_TITLES } from "@/lib/constants";
import { useEffect, useState } from "react";

const getRandomMotivationalTitle = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_TITLES.length);
  return MOTIVATIONAL_TITLES[randomIndex];
};

export default function MotivationalTitle() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(getRandomMotivationalTitle());
  }, []);

  return <Title>{title}</Title>;
}
