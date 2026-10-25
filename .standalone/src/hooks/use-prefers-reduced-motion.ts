"use client";

import { useEffect, useState } from "react";

// Unslop audit F1 (canon G-9, hard) — the OS-level reduce-motion preference
// now drives the SAME kill-switch the manual setting uses (html.user-reduce-
// motion on <html> + MotionConfig on the app root). The manual toggle in the
// settings hub stays authoritative; the OS preference ORs into it.
// SSR-safe: false until a client matchMedia exists (useMounted-style contract).
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
