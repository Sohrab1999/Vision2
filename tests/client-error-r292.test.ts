// @vitest-environment jsdom
// ------------------------------------------------------------------
// r292 «تلمتریِ خطایِ سمتِ یادگیرنده» — سفارشِ صریحِ کاربر («این مشک رو
// درست کن»): کاربر مرزِ خطا (error boundary) را دید ولی ما هیچ چیزی
// برایِ خواندن نداشتیم — چرخهٔ QA فقط نشستِ تازهٔ seedشده میسازد، پس
// خرابیِ وابسته به دادهٔ دیرینهٔ یادگیرندهٔ واقعی هرگز بازتولید
// نمیشود. این پردهها تلمتریِ جدید را قفل میکنند:
//   ① گزارشگرِ سمتِ کاربر: dedupe بر پایهٔ kind+پیام، سقفِ ۲۰ در
//      نشست، payload کوتاهشده — تلمتری هرگز نمیترکاند
//   ② مسیرِ /api/client-error: قراردادِ با-Api (بدنهٔ بزرگ، پیامِ
//      ناقص، ستونِ JSONL روی دیسک با env مسیرِ آزمایشی)
//   ③ کتابخانه: دیگر هیچ `!` رویِ find — bookById بازگشتِ امن دارد
//      و libraryDone با `?? {}` محافظت میشود (اسکنِ ساختاری)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { NextRequest } from "next/server";

const logDir = mkdtempSync(join(tmpdir(), "r292-errors-"));
const LOG = join(logDir, "client-errors.log");
process.env.CLIENT_ERROR_LOG = LOG;

function postReq(body: unknown, opts: { cl?: string | null } = {}): NextRequest {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    method: "POST",
    headers: {
      get: (n: string) =>
        n.toLowerCase() === "content-length"
          ? opts.cl === undefined
            ? String(text.length)
            : opts.cl
          : n.toLowerCase() === "user-agent"
            ? "vitest-agent/1.0"
            : null,
    },
    nextUrl: new URL("http://local/api/client-error"),
    text: async () => text,
  } as unknown as NextRequest;
}

// ---------------------------------------------------------------
// ② مسیر — قراردادِ با-Api
// ---------------------------------------------------------------
describe("POST /api/client-error — the breadcrumb contract", () => {
  beforeEach(() => {
    if (existsSync(LOG)) unlinkSync(LOG);
  });

  it("appends one bounded JSONL row with kind/message/ua and answers ok", async () => {
    const { POST } = await import("@/app/api/client-error/route");
    const res = await POST(
      postReq({ kind: "boundary", message: "Cannot read properties of undefined (reading 'score')", view: "library" }),
    
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
    const raw = readFileSync(LOG, "utf8").trim().split("\n");
    expect(raw).toHaveLength(1);
    const row = JSON.parse(raw[0]) as Record<string, string>;
    expect(row.kind).toBe("boundary");
    expect(row.message).toContain("Cannot read properties");
    expect(row.view).toBe("library");
    expect(row.ua).toBe("vitest-agent/1.0");
    expect(row.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects an oversized Content-Length before reading the body", async () => {
    const { POST } = await import("@/app/api/client-error/route");
    const res = await POST(
      postReq({ kind: "error", message: "x" }, { cl: String(64 * 1024) }),
    
    );
    expect(res.status).toBe(413);
    expect(existsSync(LOG)).toBe(false);
  });

  it("rejects an unknown kind and a missing message (schema is the wire contract)", async () => {
    const { POST } = await import("@/app/api/client-error/route");
    const bad1 = await POST(postReq({ kind: "shout", message: "hi" }));
    expect(bad1.status).toBe(400);
    const bad2 = await POST(postReq({ kind: "error" }));
    expect(bad2.status).toBe(400);
    expect(existsSync(LOG)).toBe(false);
  });

  it("caps a monster stack at the schema ceiling — bounded crumbs, not dumps", async () => {
    const { POST } = await import("@/app/api/client-error/route");
    const res = await POST(
      postReq({ kind: "error", message: "m", stack: "x".repeat(5_000) }),
    
    );
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------
// ① گزارشگرِ سمتِ کاربر — dedupe + سقفِ نشست
// ---------------------------------------------------------------
describe("client-error-reporter — session nets", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    fetchMock = vi.fn(() => Promise.resolve(new Response("{}", { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("boundary report → exactly one POST with the trimmed payload and view", async () => {
    const { reportClientError } = await import("@/lib/client-error-reporter");
    reportClientError({ kind: "boundary", message: "boom in library", stack: "S".repeat(9_000) });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/client-error");
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.kind).toBe("boundary");
    expect(payload.message).toBe("boom in library");
    expect(String(payload.stack).length).toBe(4_000); // hard trim
    expect(payload.path).toBe("/");
    expect(typeof payload.view).toBe("string");
  });

  it("dedupes identical kind+message storms, keeps distinct ones", async () => {
    const { reportClientError } = await import("@/lib/client-error-reporter");
    for (let i = 0; i < 5; i++) {
      reportClientError({ kind: "error", message: "same crash every render" });
    }
    reportClientError({ kind: "error", message: "a different crash" });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("hard session cap — after 20 reports the net goes silent", async () => {
    const { reportClientError } = await import("@/lib/client-error-reporter");
    for (let i = 0; i < 25; i++) {
      reportClientError({ kind: "rejection", message: `unique-${i}` });
    }
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(20);
  });

  it("install is idempotent and the window error event flows through", async () => {
    const mod = await import("@/lib/client-error-reporter");
    mod.installClientErrorReporter();
    mod.installClientErrorReporter(); // second call must not double-install
    window.dispatchEvent(new ErrorEvent("error", { message: "window-level boom" }));
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload.kind).toBe("error");
    expect(payload.message).toBe("window-level boom");
  });
});

// ---------------------------------------------------------------
// ③ کتابخانه — find بدونِ `!` و بازگشتِ امنِ bookById
// ---------------------------------------------------------------
describe("hill library — defensive book lookup (task 292)", () => {
  it("bookById resolves every real book id and stays undefined-safe", async () => {
    const { bookById, HILL_BOOKS, HILL_STORIES } = await import("@/data/hill-stories");
    for (const b of HILL_BOOKS) {
      expect(bookById(b.id)).toBe(b);
    }
    expect(bookById("s9" as never)).toBeUndefined();
    // every story's book id is resolvable — the happy path never needs the fallback
    for (const s of HILL_STORIES) {
      expect(bookById(s.book)).toBeDefined();
    }
  });

  it("structural lock — the library view never asserts a find with `!` again", async () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/library/library-view.tsx"), "utf8");
    expect(src).not.toMatch(/HILL_BOOKS\.find\([^)]*\)!/);
    expect(src).toContain("bookById(story.book)");
    // the hydration guard: null/undefined libraryDone degrades, never crashes.
    // r300 — the guard moved into the stable-memo form (r298 lesson: a bare
    // `?? {}` per render breaks preserve-manual-memoization); the guard's
    // intent is unchanged, so the lock follows the blessed pattern.
    expect(src).toContain("libraryDoneRaw ?? {}");
  });
});
