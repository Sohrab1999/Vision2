"use client";

// ------------------------------------------------------------------
// Task 171 — the mounted half of the announcement layer. Two
// visually-hidden regions live for the app's lifetime (mounted once in
// layout.tsx, beside <Toaster />):
//   polite   — role="status" aria-live="polite"   — success/info toasts
//   assertive — role="alert" aria-live="assertive" aria-atomic — errors
// The publish side is lib/announcer.ts (announceFa / announceToast) —
// wired once inside ui/toaster.tsx so all 50 toast call sites announce
// without touching any of them.
//
// Re-announcement trick: setting textContent to the SAME string does
// not make a screen reader speak again — each message clears the
// region first, then sets the text one tick later (the canonical
// clear-then-set pattern). The 40ms delay is inside the SR-visible
// mutation window and invisible to sighted users (the regions are
// sr-only).
// ------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { onAnnounce } from "@/lib/announcer";

export default function LiveAnnouncer() {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: number[] = [];
    const off = onAnnounce((message, assertive) => {
      const el = assertive ? assertiveRef.current : politeRef.current;
      if (!el) return;
      el.textContent = "";
      const t = window.setTimeout(() => {
        el.textContent = message;
      }, 40);
      timers.push(t);
    });
    return () => {
      off();
      for (const t of timers) window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div ref={politeRef} role="status" aria-live="polite" className="sr-only" />
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}
