import { RefObject, useEffect, useState } from "react";

export function useIsVisible(ref: RefObject<HTMLElement | null>) {
  const [isIntersecting, setIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasBeenVisible) {
        setIntersecting(true);
        setHasBeenVisible(true); // Mark it as visible once
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, hasBeenVisible]);

  return hasBeenVisible; // Return the "has been visible" state
}
