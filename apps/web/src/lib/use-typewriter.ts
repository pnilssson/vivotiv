import { useEffect, useRef, useState } from "react";

type UseTypewriterOptions = {
  enabled: boolean;
  prefix?: string;
};

export function useTypewriter(
  strings: string[],
  { enabled, prefix = "" }: UseTypewriterOptions,
): string {
  const [text, setText] = useState("");
  const stringsRef = useRef(strings);
  stringsRef.current = strings;

  useEffect(() => {
    if (!enabled) {
      setText("");
      return;
    }

    let stringIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      const current = stringsRef.current[stringIdx];
      if (!current) return;

      if (!deleting) {
        charIdx++;
        setText(prefix + current.slice(0, charIdx));

        if (charIdx === current.length) {
          timeoutId = setTimeout(() => {
            deleting = true;
            tick();
          }, 2000);
          return;
        }
        timeoutId = setTimeout(tick, 70 + Math.random() * 30);
      } else {
        charIdx--;
        setText(prefix + current.slice(0, charIdx));

        if (charIdx === 0) {
          deleting = false;
          stringIdx = (stringIdx + 1) % stringsRef.current.length;
          timeoutId = setTimeout(tick, 400);
          return;
        }
        timeoutId = setTimeout(tick, 35);
      }
    }

    timeoutId = setTimeout(tick, 800);
    return () => clearTimeout(timeoutId);
  }, [enabled, prefix]);

  return text;
}
