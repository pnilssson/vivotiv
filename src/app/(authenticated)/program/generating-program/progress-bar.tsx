"use client";

import { Progress } from "@/components/ui/progress";
import { useLogger } from "next-axiom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Component() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const log = useLogger();

  useEffect(() => {
    const totalDuration = 90 * 1000;
    const intervalDuration = totalDuration / 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, intervalDuration);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const validationInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/generating");
        const data = await response.json();

        if (!data.generating) {
          router.push("/program");
        }
      } catch (error) {
        log.error(
          "Error while validating is generating. Redirecting to /program.",
          { error }
        );
        router.push("/program");
      }
    }, 5000);

    return () => clearInterval(validationInterval);
  }, [log, router]);

  return <Progress value={progress} className="w-[100%] h-2" />;
}
