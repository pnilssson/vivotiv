"use client";

import { FC, ReactNode, useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

export const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });
  const words = text.split(" ");

  return (
    <div ref={targetRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent"
        }>
        <p
          ref={targetRef}
          className={
            "flex flex-wrap text-xl font-semibold text-black/20 md:text-2xl xl:text-4xl"
          }>
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="xl:lg-3 relative mx-1 lg:mx-2.5">
      <span className={"absolute opacity-30"}>{children}</span>
      <motion.span style={{ opacity: opacity }} className={"text-black"}>
        {children}
      </motion.span>
    </span>
  );
};

export default TextRevealByWord;
