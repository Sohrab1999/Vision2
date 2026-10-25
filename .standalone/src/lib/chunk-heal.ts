// ------------------------------------------------------------------
// Task 293 — self-heal for stale-chunk crashes («این صفحهٔ کتاب باز نشد»).
//
// The learner's browser keeps the tab open for hours while the dev
// server redeploys underneath it (r290→r292 rounds): old HTML holds old
// chunk names, a lazy view's chunk 404s, and the boundary page appears —
// captured live by the r292 reporter: ChunkLoadError on
// src_data_lesson1_ts_* from the user's real browser on the preview
// proxy, view=home. The standard remedy for every bundler (webpack /
// Turbopack / Vite alike): one hard reload fetches fresh HTML that
// references the fresh chunk map.
//
// Contracts:
//   • ONE automatic heal per 60s window (sessionStorage timestamp) —
//     a reload loop must be impossible even while the server stays broken;
//     a SECOND incident after the window is a new, healable one
//   • the matcher is pure — unit-tested without any window
//   • evidence first: the boundary reports the crash BEFORE healing
//     (fetch keepalive survives the reload)
// ------------------------------------------------------------------

const HEAL_FLAG = "vision2-chunk-heal-at";
const HEAL_WINDOW_MS = 60_000;

/** Does this error look like a stale/failed bundle chunk? Bundler-agnostic:
 *  Turbopack («Failed to load chunk …»), webpack («Loading chunk N failed»),
 *  Vite («Failed to fetch dynamically imported module …») and the Chrome
 *  variant of the same. The boundary feeds it message + stack so the
 *  ChunkLoadError name itself counts too. */
export function isChunkLoadFailure(message: string): boolean {
  const m = (message || "").toLowerCase();
  return (
    m.includes("chunkloaderror") ||
    m.includes("failed to load chunk") ||
    m.includes("loading chunk") ||
    m.includes("failed to fetch dynamically imported module") ||
    m.includes("error loading dynamically imported module")
  );
}

/** May we auto-heal right now? True at most once per HEAL_WINDOW_MS.
 *  Storage-unavailable (private mode, sandboxed iframe) → never heal
 *  blindly; the boundary UI stays in charge. */
export function shouldHeal(now: number, store: Storage): boolean {
  try {
    const last = Number(store.getItem(HEAL_FLAG) || 0);
    if (Number.isFinite(last) && now - last < HEAL_WINDOW_MS) return false;
    store.setItem(HEAL_FLAG, String(now));
    return true;
  } catch {
    return false;
  }
}

/** The boundary's one-liner: reload once per window, else report false
 *  and let the manual buttons take over. */
export function healChunkFailure(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!shouldHeal(Date.now(), window.sessionStorage)) return false;
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}
