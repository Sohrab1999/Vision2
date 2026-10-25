// @vitest-environment jsdom
// ------------------------------------------------------------------
// r346 — «خانوادهٔ کهنگی» (the staleness family), two halves.
//
// Evidence: the FIRST real client-error breadcrumb ever captured
// (client-errors.log, 2026-10-23) is a ChunkLoadError from a real
// learner's tab on the preview proxy — kind:"error" (window hook),
// view:"home". Task 293's heal was boundary-only, so this leg was
// reported but never healed. This round:
//   ① the reporter's window "error" + "unhandledrejection" hooks now
//     heal stale-chunk failures too — evidence first (the keepalive
//     breadcrumb posts BEFORE the reload), 60s-window idempotent.
//   ② a new page-side «نسخهٔ تازه» watcher: when a new service worker
//     claims an already-controlled tab mid-session (the exact
//     pre-condition of the captured crash), the learner gets a
//     family-language toast with an explicit «تازه‌سازی» action —
//     never an automatic reload. The first install's null→controller
//     claim stays silent.
// ------------------------------------------------------------------

import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, renderHook, act } from "@testing-library/react";
import { useSwUpdateToast } from "@/components/study/shell/use-sw-update-toast";

// the heal is spied; the matcher stays REAL (it is the family's gate)
vi.mock("@/lib/chunk-heal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/chunk-heal")>();
  return { ...actual, healChunkFailure: vi.fn(() => true) };
});
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

import { healChunkFailure } from "@/lib/chunk-heal";

const heal = healChunkFailure as ReturnType<typeof vi.fn>;

// the exact captured real-world crash language (client-errors.log row 1)
const CAPTURED = "ChunkLoadError: Failed to load chunk /_next/static/chunks/089330b197ab1bb1.js from module 964893";

// ---------------------------------------------------------------
// ① گزارشگر — شفایِ chunk در گوک‌های window (نیمهٔ اولِ خانواده)
// ---------------------------------------------------------------
describe("client-error-reporter r346 — hook-level chunk heal", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  // ONE shared install for the whole file: jsdom's window outlives tests,
  // and vi.resetModules() would stack a NEW reporter's listeners on top of
  // the old ones (one dispatch ⇒ N reports). The real reporter is
  // install-once per session — the tests mirror that reality; per-test
  // isolation comes from re-stubbed fetch + unique messages (dedupe keys).
  beforeAll(async () => {
    const mod = await import("@/lib/client-error-reporter");
    mod.installClientErrorReporter();
    mod.installClientErrorReporter(); // idempotent — still exactly one net
  });

  beforeEach(() => {
    heal.mockClear();
    fetchMock = vi.fn(() => Promise.resolve(new Response("{}", { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("window error with the captured ChunkLoadError language ⇒ evidence POST first, THEN one heal", async () => {
    const order: string[] = [];
    fetchMock.mockImplementation(() => {
      order.push("report");
      return Promise.resolve(new Response("{}", { status: 200 }));
    });
    heal.mockImplementation(() => {
      order.push("heal");
      return true;
    });
    window.dispatchEvent(new ErrorEvent("error", { message: CAPTURED }));
    await Promise.resolve();
    // evidence survives the reload — keepalive POST is wired before the heal
    expect(order).toEqual(["report", "heal"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.kind).toBe("error");
    expect(payload.message).toBe(CAPTURED);
    expect(heal).toHaveBeenCalledTimes(1);
  });

  it("stack fallback: a bare window error whose message is innocent but stack says «Loading chunk N failed» still heals", async () => {
    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "Script error.",
        error: Object.assign(new Error("Loading chunk 12 failed.\n(missing: http://x/12.js)"), {}),
      })
    );
    await Promise.resolve();
    expect(heal).toHaveBeenCalledTimes(1);
  });

  it("an ordinary window error never heals — the matcher is the only gate", async () => {
    window.dispatchEvent(new ErrorEvent("error", { message: "TypeError: x is not a function (r346 ordinary window leg)" }));
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1); // reported
    expect(heal).not.toHaveBeenCalled(); // but NOT healed
  });

  it("unhandledrejection with «Failed to fetch dynamically imported module» ⇒ heal (the no-boundary import leg)", async () => {
    const rejection = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(rejection, "reason", { value: new Error("Failed to fetch dynamically imported module: /_next/static/chunks/abc.js") });
    window.dispatchEvent(rejection);
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String((fetchMock.mock.calls[0] as [string, RequestInit])[1].body)) as Record<string, unknown>;
    expect(payload.kind).toBe("rejection");
    expect(heal).toHaveBeenCalledTimes(1);
  });

  it("an ordinary rejection never heals either", async () => {
    const rejection = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(rejection, "reason", { value: "plain string rejection" });
    window.dispatchEvent(rejection);
    await Promise.resolve();
    expect(heal).not.toHaveBeenCalled();
  });

  it("resource-load noise (no error object) reports but never heals", async () => {
    window.dispatchEvent(new ErrorEvent("error", { message: "unknown window error" }));
    await Promise.resolve();
    expect(heal).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------
// ② نیمهٔ دوم — «نسخهٔ تازه»: watcherِ controllerchange
// ---------------------------------------------------------------
describe("useSwUpdateToast — the page side notices the takeover", () => {
  type FakeSW = EventTarget & { controller: unknown };
  let fake: FakeSW;

  function installFakeServiceWorker(controllerAtMount: unknown) {
    fake = new EventTarget() as FakeSW;
    Object.defineProperty(fake, "controller", { value: controllerAtMount, configurable: true });
    Object.defineProperty(navigator, "serviceWorker", { value: fake, configurable: true });
  }

  afterEach(() => {
    cleanup();
    // jsdom's navigator has no serviceWorker — drop the stub entirely
    try {
      delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    } catch {
      Object.defineProperty(navigator, "serviceWorker", { value: undefined, configurable: true });
    }
  });

  it("an already-controlled tab (real redeploy mid-session) ⇒ toast callback fires", () => {
    installFakeServiceWorker({}); // controller present at mount
    const onUpdate = vi.fn();
    renderHook(() => useSwUpdateToast(onUpdate));
    act(() => {
      fake.dispatchEvent(new Event("controllerchange"));
    });
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("first install's null→controller claim is silent — the page is already fresh", () => {
    installFakeServiceWorker(null); // not yet controlled at mount
    const onUpdate = vi.fn();
    renderHook(() => useSwUpdateToast(onUpdate));
    act(() => {
      fake.dispatchEvent(new Event("controllerchange")); // the first claim
    });
    expect(onUpdate).not.toHaveBeenCalled();
    act(() => {
      fake.dispatchEvent(new Event("controllerchange")); // a REAL update afterwards
    });
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("no serviceWorker in the browser (old targets) ⇒ hook is a no-op, never throws", () => {
    installFakeServiceWorker({});
    try {
      delete (navigator as unknown as { serviceWorker?: unknown }).serviceWorker;
    } catch {
      /* keep going — the assertion below is the contract */
    }
    const onUpdate = vi.fn();
    expect(() => renderHook(() => useSwUpdateToast(onUpdate))).not.toThrow();
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------
// ③ قفل‌هایِ ساختاری — سیم‌کشیِ pwa-layer و قراردادِ سرویس‌ورکر
// ---------------------------------------------------------------
describe("staleness family — structural locks (r319 lesson: locks inside scoped slices)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("pwa-layer wires the watcher with the family toast + an explicit reload action", () => {
    const src = read("src/components/study/shell/pwa-layer.tsx");
    const wiring = src.slice(src.indexOf("export default function PwaLayer"));
    expect(wiring).toContain("useSwUpdateToast(");
    expect(wiring).toContain("نسخهٔ تازهٔ وب‌کتاب فعال شد");
    expect(wiring).toContain("تازه‌سازی");
    expect(wiring).toContain("<ToastAction");
    // the action's contract: reload is the LEARNER's tap, never automatic
    expect(wiring).toContain("window.location.reload()");
    // and the watcher import comes from the shell's own module
    expect(src.slice(0, src.indexOf("const INSTALL_DISMISS_KEY"))).toContain('from "@/components/study/shell/use-sw-update-toast"');
  });

  it("sw.js keeps the eager-activation contract the toast depends on", () => {
    const sw = read("public/sw.js");
    expect(sw).toContain("self.skipWaiting()");
    expect(sw).toContain("self.clients.claim()");
    expect(sw).toContain('"SKIP_WAITING"');
  });

  it("the reporter still imports the heal from chunk-heal (one family, one matcher)", () => {
    const rep = read("src/lib/client-error-reporter.ts");
    expect(rep).toContain('import { healChunkFailure, isChunkLoadFailure } from "@/lib/chunk-heal"');
    expect(rep).toContain("maybeHeal(message, err?.stack)");
    expect(rep).toContain("maybeHeal(message, r instanceof Error ? r.stack : undefined)");
  });
});
