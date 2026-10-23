"use client";

// ------------------------------------------------------------------
// r346 — «نسخهٔ تازه» watcher (the staleness family, page side).
//
// The captured real-world crash (client-errors.log, the first ever)
// was a ChunkLoadError from a tab that stayed open across a redeploy:
// the new service worker installs, calls skipWaiting + clients.claim
// immediately, the claim swaps the controller under the live tab — and
// the tab keeps running OLD code with OLD chunk names until something
// lazy fails. The SW side has always been eager (skipWaiting on
// install, SKIP_WAITING message supported since F4); the missing half
// was the PAGE never noticing the takeover.
//
// This hook is that half:
//   • controllerchange while the page was ALREADY controlled ⇒ a real
//     update took over mid-session ⇒ the caller shows the «نسخهٔ تازهٔ
//     وب‌کتاب فعال شد» toast with an explicit «تازه‌سازی» action
//     (reload is the learner's tap, never automatic — a forced reload
//     could cut an in-flight quiz; the store persists regardless).
//   • the null→controller claim right after a FIRST install is silent
//     (a fresh page load already ships fresh chunks).
//   • reload-loop safe by construction: after the tap the fresh page
//     mounts with a controller already present, so wasControlled is
//     true and no further controllerchange fires without a NEW deploy.
//
// No NODE_ENV gate here: in dev the SW never registers (pwa-layer's
// own guard), so controllerchange cannot fire — keeping the hook
// un-gated makes it unit-testable and keeps one truth in pwa-layer.
// ------------------------------------------------------------------

import { useEffect } from "react";

export function useSwUpdateToast(onUpdate: () => void): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const sw = navigator.serviceWorker;
    let wasControlled = !!sw.controller;
    const onChange = () => {
      if (!wasControlled) {
        // first install's claim — silent, the page is already fresh
        wasControlled = true;
        return;
      }
      wasControlled = true;
      onUpdate();
    };
    sw.addEventListener("controllerchange", onChange);
    return () => sw.removeEventListener("controllerchange", onChange);
  }, [onUpdate]);
}
