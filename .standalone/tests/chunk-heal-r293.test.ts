// ------------------------------------------------------------------
// Task 293 — self-heal for stale-chunk crashes (the user's screenshot).
// The r292 reporter captured the real case: ChunkLoadError on
// src_data_lesson1_ts_* from the learner's browser on the preview
// proxy after redeploys — old HTML, old chunk names, lazy view dies,
// «این صفحهٔ کتاب باز نشد» appears. These locks pin:
//   ① the matcher recognizes every bundler's stale-chunk phrasing
//     (the captured Turbopack message verbatim) and nothing else
//   ② the heal fires at most once per 60s window — a reload loop is
//     structurally impossible, and blocked storage never heals blind
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { isChunkLoadFailure, shouldHeal } from "@/lib/chunk-heal";

/** a minimal in-memory Storage stand-in with optional failure injection */
function fakeStorage(opts: { broken?: boolean } = {}): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => {
      if (opts.broken) throw new Error("storage blocked");
      return map.has(k) ? map.get(k)! : null;
    },
    setItem: (k, v) => {
      if (opts.broken) throw new Error("storage blocked");
      map.set(k, String(v));
    },
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

const CAPTURED_TURBOPACK =
  "Failed to load chunk /_next/static/chunks/src_data_lesson1_ts_b3ed3be6._.js from module [project]/node_modules/next/dist/compiled/react-server-dom-turbopack/cjs/react-server-dom-turbopack-client.browser.development.js [app-client] (ecmascript)";

describe("isChunkLoadFailure — bundler-agnostic stale-chunk matcher", () => {
  it("recognizes the exact message captured from the user's browser (Turbopack)", () => {
    expect(isChunkLoadFailure(CAPTURED_TURBOPACK)).toBe(true);
  });

  it("recognizes the ChunkLoadError name (via message or stack line)", () => {
    expect(isChunkLoadFailure("ChunkLoadError: static/chunks/app-page.js")).toBe(true);
    expect(isChunkLoadFailure("TypeError: x is not a function\n    at ChunkLoadError.wrap")).toBe(true);
  });

  it("recognizes webpack and Vite phrasings", () => {
    expect(isChunkLoadFailure("Loading chunk 5 failed.\n(missing: http://x/5.js)")).toBe(true);
    expect(isChunkLoadFailure("Failed to fetch dynamically imported module: /app/view.js")).toBe(true);
    expect(isChunkLoadFailure("error loading dynamically imported module /a.js")).toBe(true);
  });

  it("rejects ordinary runtime errors", () => {
    expect(isChunkLoadFailure("Cannot convert undefined or null to object")).toBe(false);
    expect(isChunkLoadFailure("Cannot read properties of undefined (reading 'score')")).toBe(false);
    expect(isChunkLoadFailure("")).toBe(false);
    expect(isChunkLoadFailure("NetworkError when attempting to fetch resource.")).toBe(false);
  });
});

describe("shouldHeal — one shot per 60s window", () => {
  it("fires once, refuses inside the window, allows again after it", () => {
    const store = fakeStorage();
    const t0 = 1_000_000;
    expect(shouldHeal(t0, store)).toBe(true); // first incident → heal
    expect(shouldHeal(t0 + 59_999, store)).toBe(false); // still inside → refuse
    expect(shouldHeal(t0 + 60_000, store)).toBe(true); // window passed → heal again
    expect(shouldHeal(t0 + 60_001, store)).toBe(false);
  });

  it("never heals when storage is blocked (sandboxed iframe / private mode)", () => {
    expect(shouldHeal(1_000_000, fakeStorage({ broken: true }))).toBe(false);
  });

  it("treats a corrupt stored timestamp as absent (heals)", () => {
    const store = fakeStorage();
    store.setItem("vision2-chunk-heal-at", "not-a-number");
    expect(shouldHeal(1_000_000, store)).toBe(true);
  });
});
