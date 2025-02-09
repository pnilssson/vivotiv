"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useLogger } from "next-axiom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Component() {
  const router = useRouter();
  const log = useLogger();

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

  return (
    <LoaderCircleIcon className="animate-spin self-center mt-4 h-8 w-8 text-muted-foreground" />
  );
}
