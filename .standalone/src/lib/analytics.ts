// ------------------------------------------------------------------
// F10 — client-side event tracker. Fire-and-forget POST with
// `keepalive` so events survive page unload; failures are silently
// ignored (analytics must never affect the learner experience).
// No PII: only the whitelisted event name travels to the server.
// ------------------------------------------------------------------

import { isEventName, type EventName } from "./analytics-events";

export type { EventName };

export function trackEvent(name: EventName): void {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* best-effort */
  }
}

/** dedupe within the current browser session (e.g. app_open) */
export function trackEventOncePerSession(name: EventName): void {
  if (typeof window === "undefined") return;
  const key = `v2-ev-${name}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage unavailable → send anyway once per mount */
  }
  trackEvent(name);
}
