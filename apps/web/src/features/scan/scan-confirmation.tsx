"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ScanConfirmationProps = {
  onReset: () => void;
};

function AnimatedCheckmark() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="text-emerald-600"
    >
      <motion.circle
        cx="24"
        cy="24"
        r="20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M15 25l6 6 12-14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.2, delay: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

export function ScanConfirmation({ onReset }: ScanConfirmationProps) {
  const t = useTranslations("hero");

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <AnimatedCheckmark />

      <motion.h3
        className="font-heading text-lg font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        {t("confirmationTitle")}
      </motion.h3>

      <motion.p
        className="text-sm text-muted-foreground"
        role="status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        {t("confirmationSubtitle")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <Button variant="outline" onClick={onReset}>
          {t("scanAnother")}
        </Button>
      </motion.div>
    </div>
  );
}
