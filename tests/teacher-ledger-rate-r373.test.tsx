// @vitest-environment jsdom
// ------------------------------------------------------------------
// r373 — «دفترِ کلاسهایِ بزرگ» — بندِ ②ِ معطلِ پانزدراندیِ r357④:
// سنجشِ پنلِ معلم با کلاسِ پرجمعیت در برابرِ سقفِ نرخِ ۶۰/دقیقهٔ
// مسیرِ جزئیات. قراردادهایی که این فایل قفل میکند:
//   • ۴۲۹ پایانِ سفر نیست — Retry-After سرور خوانده میشود (هدر، نه
//     حدس)؛ حلقه همان‌قدر مکث میکند و همان ردیف را دوباره میخواهد
//   • هیچ پیشرویی بدونِ کارنامه — هیچskipِ خاموشی (handleهایِ تکراری
//     در برابرِ ردیفِ ۴۲۹خورده = قفلِ همانردیف)
//   • تا LEDGER_RATE_WAITS مکث در یک دانلود؛ بعدش انصرافِ صادق —
//     دفترِ نصفه همچنان ممنوع (قراردادِ r357)
//   • کلاسِ بزرگتر از LEDGER_RATE_WINDOW_MAX از قبل خبردار میشود
//     (توستِ پیشِ پرواز — انتظارِ صادق)؛ درِ مرز (۶۰) بیخبر — دقیقاً جا میشود
//   • ۴۲۹ حرفِ خودش را میزند: «سقفِ سرعت» ≠ نقابِ «اتصال»
//   • پیامها با faNum — ارقامِ فارسیِ زبانِ نما
// [ابزاری] توست با spyِ use-toast سنجیده میشود (الگویِ خانوادهٔ
// r265–r271) — Toaster در رندرِ standalone سوار نیست.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { LEDGER_RATE_WINDOW_MAX, LEDGER_RATE_WAITS } from "@/lib/teacher-class-ledger";
import type { LearnerDetail, RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// ---------------- فیکسچرها ----------------
const detailOf = (name: string): LearnerDetail => ({
  name,
  color: "emerald",
  joinedAt: "2026-10-01T00:00:00.000Z",
  attempts: 3,
  avgPercent: 73,
  bestPercent: 90,
  lessons: 2,
  lastActive: "2026-10-24T08:30:00.000Z",
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10), attempts: i === 13 ? 1 : 0 })),
  byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i < 2 ? 1 : 0, avgPercent: i < 2 ? 73 : null })),
  bySkill: [{ category: "quiz", attempts: 3, avgPercent: 73, bestPercent: 90 }],
  recent: [{ category: "quiz", lesson: 2, percent: 90, createdAt: "2026-10-24T08:30:00.000Z" }],
});

const rowOf = (name: string, handle: string): RosterRow => ({
  name, color: "emerald", attempts: 3, avgPercent: 73, bestPercent: 90, lessons: 2,
  lastActive: "2026-10-24T08:30:00.000Z", weakest: { category: "quiz", avgPercent: 73 }, handle,
});

const HOUR = 3600_000;
const now = Date.now();
const day = (i: number) => new Date(now - i * 86_400_000).toISOString().slice(0, 10);

const reportPayload = (roster: RosterRow[]) => ({
  ok: true,
  generatedAt: new Date(now).toISOString(),
  summary: {
    learners: roster.length,
    attempts: roster.length * 3,
    avgPercent: 73,
    last24h: 1,
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 1, avgPercent: 73 })),
  },
  roster,
});

/** پاسخِ مسیرِ جزئیات — ۴۲۹ با هدرِ Retry-Afterِ صادقِ سرور */
const learnerRes = (status: number, retryAfter?: string) =>
  new Response(status === 429 ? JSON.stringify({ ok: false, code: "rate_limited", error: "درخواست‌های خیلی زیاد" }) : JSON.stringify({ ok: true, learner: detailOf("آرش") }), {
    status,
    headers: retryAfter !== undefined ? { "Retry-After": retryAfter } : {},
  });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  toastSpy.mockClear();
  cleanup();
});

const captureAnchor = () => {
  Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r373", writable: true, configurable: true });
  Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
  const appended: HTMLElement[] = [];
  const orig = document.body.appendChild.bind(document.body);
  document.body.appendChild = ((el: HTMLElement) => {
    appended.push(el);
    return el;
  }) as typeof document.body.appendChild;
  return { appended, restore: () => (document.body.appendChild = orig) };
};

const openPanel = async (fetchMock: (url: string) => Promise<Response>, fake = false) => {
  sessionStorage.setItem("vision2-teacher-code", "edu-1404");
  vi.stubGlobal("fetch", vi.fn(fetchMock));
  const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
  const utils = render(<TeacherView />);
  if (fake) {
    // [ابزاری] با fake timers، waitFor گیر میکند و re-renderِ setState
    // از مسیرِ schedulerِ ریکت (میکروتسکِ خالص نیست) — act، هم
    // میکروتسکها و هم کارِ رندر را قطعی میشوید
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(utils.getByTestId("teacher-ready")).toBeDefined();
  } else {
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
  }
  return utils;
};

const learnerCalls = () =>
  (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
    .map((c) => String(c[0]))
    .filter((u) => u.includes("/api/teacher/learner"))
    .map((u) => u.split("handle=")[1]);

const toastTexts = () =>
  toastSpy.mock.calls.map((c) => {
    const t = c[0] as { title?: string; description?: string };
    return `${t.title ?? ""} ${t.description ?? ""}`;
  });

const downloaded = (cap: { appended: HTMLElement[] }) =>
  cap.appended.some((el) => (el as HTMLAnchorElement).download?.startsWith("vision2-class-ledger-"));

// ---------------------------------------------------------------
// ① سیاست — ثابتها و قفلهایِ منبع
// ---------------------------------------------------------------
describe("سیاستِ سرعتِ دفتر — ثابتها", () => {
  it("① پنجره = ۶۰ (سقفِ واقعیِ مسیرِ جزئیات) و بیشینهٔ مکث = ۳", () => {
    expect(LEDGER_RATE_WINDOW_MAX).toBe(60);
    expect(LEDGER_RATE_WAITS).toBe(3);
  });

  it("② قفلِ منبع: نما هدرِ Retry-After را میخواند، ۴۲۹ شاخهٔ خودش را دارد، مکث بدونِ پیشروی", () => {
    const view = read("src/components/study/teacher/teacher-view.tsx");
    expect(view).toContain("res.status === 429");
    expect(view).toContain('res.headers.get("Retry-After")');
    expect(view).toContain("LEDGER_RATE_WAITS");
    expect(view).toContain("LEDGER_RATE_WINDOW_MAX");
    expect(view).toContain("continue; // همان ردیف — هیچ پیشرویی بدونِ کارنامه");
    // ۴۲۹ حرفِ خودش را میزند — نه نقابِ اتصال
    expect(view).toContain("سقفِ سرعت — مکثِ کوتاه");
    expect(view).not.toContain("transition-all");
  });

  it("③ ثابتها در کتابخانهٔ دامنهاند (سیاست، نه UI) و نما از آنجا وارد میکند", () => {
    const lib = read("src/lib/teacher-class-ledger.ts");
    expect(lib).toContain("export const LEDGER_RATE_WINDOW_MAX");
    expect(lib).toContain("export const LEDGER_RATE_WAITS");
    const view = read("src/components/study/teacher/teacher-view.tsx");
    expect(view).toContain('LEDGER_RATE_WINDOW_MAX, LEDGER_RATE_WAITS } from "@/lib/teacher-class-ledger"');
  });
});

// ---------------------------------------------------------------
// ② رفتارِ زنده — مکث، ادامه، انصراف
// ---------------------------------------------------------------
describe("exportLedger در برابرِ ۴۲۹ — مکثِ محترمانه", () => {
  it("④ مکث رویِ Retry-After و ادامه: همان ردیف دوباره، بعدِ ردیفِ بعد — ترتیبِ دستنخورده", async () => {
    vi.useFakeTimers();
    const roster = [rowOf("آرش", "h1h1h1h1h1h1h1h1"), rowOf("نگار", "n2n2n2n2n2n2n2n2")];
    let learnerNo = 0;
    const utils = await openPanel(async (url) => {
      if (String(url).includes("/api/teacher/learner")) {
        learnerNo += 1;
        return learnerNo === 1 ? learnerRes(429, "2") : learnerRes(200);
      }
      return new Response(JSON.stringify(reportPayload(roster)), { status: 200 });
    }, true);
    const cap = captureAnchor();
    try {
      fireEvent.click(utils.getByTestId("teacher-ledger"));
      // اولین درخواست ۴۲۹ خورد → توستِ صادق با ارقامِ فارسی (۰ از ۲ خوانده)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(learnerCalls()).toEqual(["h1h1h1h1h1h1h1h1"]);
      expect(toastTexts().some((t) => t.includes("سقفِ سرعت — مکثِ کوتاه") && t.includes("۰ از ۲") && t.includes("۲ ثانیه"))).toBe(true);
      // پس از ۳ ثانیه (Retry-After=۲ + حاشیه): همان ردیف، بعدِ ردیفِ بعد
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3100);
      });
      expect(learnerCalls()).toEqual(["h1h1h1h1h1h1h1h1", "h1h1h1h1h1h1h1h1", "n2n2n2n2n2n2n2n2"]);
      expect(downloaded(cap)).toBe(true);
      // دفترِ کامل با ۲ کارنامه — نه مکثِ ابدی، نهskipِ خاموش
      expect(toastTexts().some((t) => t.includes("دفترِ کاملِ کلاس ذخیره شد") && t.includes("۲ کارنامه"))).toBe(true);
    } finally {
      cap.restore();
    }
  });

  it("⑤ انصرافِ صادق پس از ۳ مکث: هیچ لنگری نیست — دفترِ نصفه ممنوع", async () => {
    vi.useFakeTimers();
    const roster = [rowOf("آرش", "h1h1h1h1h1h1h1h1")];
    const utils = await openPanel(async (url) =>
      String(url).includes("/api/teacher/learner") ? learnerRes(429, "1") : new Response(JSON.stringify(reportPayload(roster)), { status: 200 })
    , true);
    const cap = captureAnchor();
    try {
      fireEvent.click(utils.getByTestId("teacher-ledger"));
      for (let k = 0; k < 3; k++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2100); // Retry-After=۱ → مکثِ ۲ثانیهای
        });
      }
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      // چهار ۴۲۹ = یک بیش از سقف → انصراف؛ نه واکشِ پنجم
      expect(learnerCalls()).toHaveLength(4);
      expect(toastTexts().some((t) => t.includes("خواندنِ کارنامه‌ها ناتمام ماند") && t.includes("دفترِ نصفه ساخته نمی‌شود"))).toBe(true);
      expect(downloaded(cap)).toBe(false);
      // دکمه آزاد شد — finally حتی در مسیرِ انصراف
      expect((utils.getByTestId("teacher-ledger") as HTMLButtonElement).disabled).toBe(false);
    } finally {
      cap.restore();
    }
  });

  it("⑥ آستانهٔ سرخودِ ۵۰۰ وسطِ راه همچنان مرگِ سفر است — ۴۲۹ آن را تغییر نداده", async () => {
    vi.useFakeTimers();
    const roster = [rowOf("آرش", "h1h1h1h1h1h1h1h1"), rowOf("نگار", "n2n2n2n2n2n2n2n2")];
    let learnerNo = 0;
    const utils = await openPanel(async (url) => {
      if (String(url).includes("/api/teacher/learner")) {
        learnerNo += 1;
        return learnerNo === 2 ? new Response(JSON.stringify({ ok: false, code: "server_error" }), { status: 500 }) : learnerRes(200);
      }
      return new Response(JSON.stringify(reportPayload(roster)), { status: 200 });
    }, true);
    const cap = captureAnchor();
    try {
      fireEvent.click(utils.getByTestId("teacher-ledger"));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(learnerCalls()).toHaveLength(2);
      expect(downloaded(cap)).toBe(false); // دفترِ نصفه ممنوع — قراردادِ r357 پابرجا
      expect(toastTexts().some((t) => t.includes("خواندنِ کارنامه‌ها ناتمام ماند") && t.includes("اتصال را بررسی کن"))).toBe(true);
    } finally {
      cap.restore();
    }
  });

  it("⑦ کلاسِ ۶۱کارنامهای: توستِ پیشِ پرواز، بعدِ دانلودِ کامل — انتظارِ صادق", async () => {
    const roster = Array.from({ length: LEDGER_RATE_WINDOW_MAX + 1 }, (_, i) => rowOf(`دانشآموز ${i + 1}`, `h${String(i).padStart(15, "0")}`));
    const utils = await openPanel(async (url) =>
      String(url).includes("/api/teacher/learner")
        ? learnerRes(200)
        : new Response(JSON.stringify(reportPayload(roster)), { status: 200 })
    );
    const cap = captureAnchor();
    try {
      fireEvent.click(utils.getByTestId("teacher-ledger"));
      // پیشِ پرواز: توستِ انتظار با شمارشِ فارسیِ ۶۱ — همزمانِ کلیک
      expect(toastTexts().some((t) => t.includes("کلاسِ بزرگ — سفرِ دفتر طولانی است") && t.includes("۶۱"))).toBe(true);
      await waitFor(() => expect(downloaded(cap)).toBe(true));
      expect(learnerCalls()).toHaveLength(61);
      // ترتیبِ آرشیو — به ترتیبِ فهرستِ سرور، نه برعکس و نه jump
      expect(learnerCalls()[0]).toBe("h000000000000000");
      expect(learnerCalls()[60]).toBe("h000000000000060");
    } finally {
      cap.restore();
    }
  });

  it("⑧ کلاسِ ۶۰کارنامهای (درِ مرز): بی‌توستِ پیشِ پرواز — دقیقاً در پنجره جا میشود", async () => {
    const roster = Array.from({ length: LEDGER_RATE_WINDOW_MAX }, (_, i) => rowOf(`دانشآموز ${i + 1}`, `h${String(i).padStart(15, "0")}`));
    const utils = await openPanel(async (url) =>
      String(url).includes("/api/teacher/learner")
        ? learnerRes(200)
        : new Response(JSON.stringify(reportPayload(roster)), { status: 200 })
    );
    const cap = captureAnchor();
    try {
      fireEvent.click(utils.getByTestId("teacher-ledger"));
      await waitFor(() => expect(downloaded(cap)).toBe(true));
      expect(toastTexts().some((t) => t.includes("کلاسِ بزرگ — سفرِ دفتر طولانی است"))).toBe(false);
      expect(learnerCalls()).toHaveLength(60);
    } finally {
      cap.restore();
    }
  });
});
