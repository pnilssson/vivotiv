"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

const SCRIPT_SRC_BASE = "https://app.termly.io";

export default function TermlyCMP({ websiteUUID }: { websiteUUID: string }) {
  const scriptSrc = useMemo(() => {
    const src = new URL(SCRIPT_SRC_BASE);
    src.pathname = `/resource-blocker/${websiteUUID}`;
    return src.toString();
  }, [websiteUUID]);

  const isScriptAdded = useRef(false);

  useEffect(() => {
    if (isScriptAdded.current) return;
    const script = document.createElement("script");
    script.src = scriptSrc;
    document.head.appendChild(script);
    isScriptAdded.current = true;
  }, [scriptSrc]);

  const pathname = usePathname();

  useEffect(() => {
    window.Termly?.initialize();
  }, [pathname]);

  return null;
}
