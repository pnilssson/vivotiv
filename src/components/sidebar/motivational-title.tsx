"use client";

import { MOTIVATIONAL_TITLES } from "@/lib/constants";
import { useEffect, useState } from "react";
import Title from "../shared/typography/title";

const getRandomMotivationalTitle = () => {
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_TITLES.length);
  return MOTIVATIONAL_TITLES[randomIndex];
};

export default function MotivationalTitle() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(getRandomMotivationalTitle());
  }, []);

  return <Title className="text-xl">{title}</Title>;
}
