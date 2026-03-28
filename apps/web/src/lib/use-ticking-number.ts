"use client";

import { animate, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

type UseTickingNumberOptions = {
  value: number;
  delay?: number;
  isInView: boolean;
};

export function useTickingNumber({ value, delay = 0, isInView }: UseTickingNumberOptions) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 0.8,
      delay,
      ease: "easeOut",
    });
    return controls.stop;
  }, [isInView, motionValue, value, delay]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
  }, [rounded]);

  return ref;
}
