// ------------------------------------------------------------------
// Task 171 — «لایهٔ اعلام به صفحه‌خوان» — the screen-reader announcement
// layer. The live audit (toast open → zero [aria-live] elements in the
// DOM) proved this Radix build renders NO live region: with 50 toast
// call sites as the app's central notification channel, a screen-reader
// visitor heard NOTHING — badge unlocks, backup saves, error messages,
// all silent. This module is the publish side of the fix: a tiny
// framework-free pub-sub that the mounted <LiveAnnouncer /> (layout.tsx,
// beside <Toaster />) subscribes to, so ONE wiring point covers every
// toast without touching 50 call sites.
//
// Contract:
//   - announceFa(text, assertive?) → routes to every live listener;
//     blank/whitespace messages are dropped (never announce "")
//   - announceToast(title, description?, assertive?) → composes
//     «title — description» (dash dropped when no description)
//   - isAssertiveToast(title) → error toasts («خطا» in the title) take
//     the assertive channel — an error must INTERRUPT, not queue politely
// The DOM side (the two visually-hidden regions) lives in
// shell/live-announcer.tsx — this file stays pure and SSR/test-safe.
// ------------------------------------------------------------------

export type AnnounceListener = (message: string, assertive: boolean) => void;

const listeners = new Set<AnnounceListener>();

/** Subscribe to announcements. Returns the unsubscribe function. */
export function onAnnounce(listener: AnnounceListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Announce a Persian message on the polite (default) or assertive channel. */
export function announceFa(message: string, assertive = false): void {
  const text = message.trim();
  if (!text) return; // never announce an empty string — it wastes a live turn
  for (const listener of listeners) listener(text, assertive);
}

/** Compose a toast announcement: title first, description after an em-dash. */
export function announceToast(title: string, description?: string, assertive = false): void {
  const t = title.trim();
  const d = (description || "").trim();
  announceFa(d ? `${t} — ${d}` : t, assertive);
}

/** Error toasts interrupt: «خطا» in the title takes the assertive channel. */
export function isAssertiveToast(title: string): boolean {
  return /خطا/.test(title);
}
