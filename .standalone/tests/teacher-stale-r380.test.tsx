// @vitest-environment jsdom
// ------------------------------------------------------------------
// r380 — «درِ صداقتِ کهنگیِ گزارش» — بندِ ②ِ پیشنهادِ r379: سربرگِ پنل
// «آخرین به‌روزرسانی» را چاپ میکرد اما کهنگی را نام نمیداد. قراردادها:
//   • موتورِ تکحقیقت: isReportStale از teacher-report — هیچ دوقلوی
//     محلی مجاز نیست (عینِ قفلِ r363/r378)
//   • مرزِ strictِ داده‌محور: دقیقاً ۵ دقیقه هنوز تازه؛ ۱ms بیشتر
//     کهنه — عینِ قراردادِ مرزِ inclusivoِ r378، اما اینجا خروج
//   • generatedAtِ غایب/ناخوانا ⇒ false — بدونِ شاهد ادعا ممنوع
//   • تیکِ محلیِ ۶۰ث فقط برچسب را نو میکند: judge هیچ واکشی ندارد —
//     پنلِ read-only میماند (هیچ پولینگِ خودکاری)
//   • ارزیابیِ بیواسطه در سوارشدن: گزارشِ رسیده با کهنه ⇒ هشدارِ فوری
//   • رفرشِ گزارش (شیءِ نو) افکت را از نو مسلح میکند ⇒ هشدار فوری خاموش
//   • صفرِ رویدادِ تحلیلیِ نو — برچسبِ خواندنی است، کنشِ یادگیری نیست
//   • قراردادِ کنتراستِ r172: کهرباییِ ۷۰۰ — نه stone-400
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, act, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { isReportStale, REPORT_STALE_MS } from "@/lib/teacher-report";
import type { RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const T0 = Date.parse("2026-10-24T15:00:00.000Z"); // ساعتِ ثابتِ راند — مرزِ کهنگی داده‌محور میشود
const iso = (ms: number) => new Date(ms).toISOString();

const mkRow = (name: string, attempts: number): RosterRow => ({
  name,
  color: "emerald",
  attempts,
  avgPercent: attempts > 0 ? 73 : null,
  bestPercent: attempts > 0 ? 90 : null,
  lessons: attempts > 0 ? 2 : 0,
  lastActive: attempts > 0 ? iso(T0 - 3600_000) : null,
  weakest: attempts > 0 ? { category: "quiz", avgPercent: 73 } : null,
  handle: "h-" + name,
});

const day = (i: number) => new Date(T0 - i * 86_400_000).toISOString().slice(0, 10);

const reportPayload = (generatedAt: string) => ({
  ok: true,
  generatedAt,
  summary: {
    learners: 2,
    attempts: 5,
    avgPercent: 73,
    last24h: 1,
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 1, avgPercent: 73 })),
  },
  roster: [mkRow("سارا", 5), mkRow("علی", 0)],
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  toastSpy.mockClear();
  cleanup();
});

/** واکشِ استاب: report با generatedAtِ دادهشده + استابِ دیالوگِ جزئیات (قراردادِ r377) */
const stubFetchWith = (generatedAt: string) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).includes("/api/teacher/report")) {
        return new Response(JSON.stringify(reportPayload(generatedAt)), { status: 200 });
      }
      return new Response(JSON.stringify({ ok: true, learner: { name: "سارا" } }), { status: 200 });
    })
  );
};

/** سوارِ پنل تا ready — بدونِ waitFor (سازگارِ تایمرِ فیک: میکروتسک‌ها فقط فلاش میشوند) */
const openPanel = async () => {
  sessionStorage.setItem("vision2-teacher-code", "edu-1404");
  const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
  const utils = render(<TeacherView />);
  for (let i = 0; i < 8 && !utils.queryByTestId("teacher-ready"); i++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  expect(utils.queryByTestId("teacher-ready")).not.toBeNull();
  return utils;
};

// ------------------------------------------------------------------
// ① قفلهایِ منبع — تکمنبعی، بیواکش، بیرویداد، کنتراست
// ------------------------------------------------------------------
describe("source locks — r380", () => {
  const view = () => read("src/components/study/teacher/teacher-view.tsx");

  it("engine is single-source: the view imports isReportStale from teacher-report and defines no local twin", () => {
    expect(view()).toContain('isReportStale, type TeacherReport');
    expect(view()).toContain("isReportStale(generatedAt, Date.now())");
    expect(view()).not.toContain("function isReportStale");
    expect(read("src/lib/teacher-report.ts")).toContain("export function isReportStale");
    expect(read("src/lib/teacher-report.ts")).toContain("export const REPORT_STALE_MS");
  });

  it("the polite tick judges only: setInterval runs the setStale-only judge — no fetch inside the tick, cleanup present", () => {
    expect(view()).toContain("const judge = () => setStale(isReportStale(generatedAt, Date.now()));");
    expect(view()).toContain("setInterval(judge, STALE_TICK_MS)");
    expect(view()).toContain("return () => clearInterval(id);");
    // تیک فقط داور را صدا میزند — داور فقط setStale: هیچ واکشی در مسیرِ تیک
    const tickBlock = view().slice(view().indexOf("const judge = () => setStale"), view().indexOf("return () => clearInterval(id);"));
    expect(tickBlock).not.toContain("fetch(");
    expect(tickBlock).not.toContain("load(");
  });

  it("honest hint UI: role=status + testid + amber-700 (contrast contract) — and no analytics event, no transition-all, no stone-400", () => {
    expect(view()).toContain('data-testid="teacher-stale-hint"');
    expect(view()).toContain('role="status"');
    expect(view()).toContain("text-amber-700");
    expect(view()).not.toContain("text-stone-400");
    expect(view()).not.toContain("transition-all");
    expect(view()).not.toContain('trackEvent("teacher_stale"');
    expect(read("src/lib/analytics-events.ts")).not.toContain("stale");
  });
});

// ------------------------------------------------------------------
// ② موتورِ خالص — مرزِ strict داده‌محور + گاردهایِ صداقت
// ------------------------------------------------------------------
describe("isReportStale engine", () => {
  it("exactly 5 minutes is still fresh; one millisecond older is stale — the strict boundary, data-driven", () => {
    const gen = iso(T0);
    expect(isReportStale(gen, T0 + REPORT_STALE_MS)).toBe(false); // دقیقاً ۵ دقیقه — تازه
    expect(isReportStale(gen, T0 + REPORT_STALE_MS + 1)).toBe(true); // ۱ms بیشتر — کهنه
    expect(isReportStale(gen, T0 + REPORT_STALE_MS - 1)).toBe(false); // ۴:۵۹٫۹۹۹ — تازه
  });

  it("far past is stale, near past is fresh", () => {
    expect(isReportStale(iso(T0 - 3600_000), T0)).toBe(true); // ۱ ساعت
    expect(isReportStale(iso(T0 - 3 * 86_400_000), T0)).toBe(true); // ۳ روز
    expect(isReportStale(iso(T0 - 60_000), T0)).toBe(false); // ۱ دقیقه
    expect(isReportStale(iso(T0), T0)).toBe(false); // لحظهٔ صفر
  });

  it("unpresentable evidence never claims staleness — missing or unparseable generatedAt ⇒ false", () => {
    expect(isReportStale(null, T0 + 999_999_999)).toBe(false);
    expect(isReportStale(undefined, T0 + 999_999_999)).toBe(false);
    expect(isReportStale("", T0 + 999_999_999)).toBe(false);
    expect(isReportStale("garbage-not-a-date", T0 + 999_999_999)).toBe(false);
  });
});

// ------------------------------------------------------------------
// ③ نما — سوارشدن، تیک، رفرش، پاکسازی
// ------------------------------------------------------------------
describe("stale hint in the panel", () => {
  it("a fresh report (1 minute old) mounts with NO hint — real clock, real timers", async () => {
    stubFetchWith(iso(Date.now() - 60_000));
    const utils = await openPanel();
    expect(utils.queryByTestId("teacher-stale-hint")).toBeNull();
  });

  it("a report that arrives already stale shows the hint IMMEDIATELY at mount — no waiting for the first tick", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(T0);
    stubFetchWith(iso(T0 - 6 * 60_000)); // ۶ دقیقه پیش — کهنه در بدوِ وصول
    const utils = await openPanel();
    const hint = utils.queryByTestId("teacher-stale-hint");
    expect(hint).not.toBeNull();
    expect(hint).toHaveAttribute("role", "status");
    expect(hint!.textContent).toContain("گزارش کهنه است");
    expect(hint!.textContent).toContain("به‌روزرسانی");
    // هشدار کنارِ مهرِ زمانِ همان سربرگ است — نه جای دور
    expect(hint!.parentElement!.textContent).toContain("آخرین به‌روزرسانی");
  });

  it("a fresh report goes stale later through the 60s polite tick — and the tick fires no fetch", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(T0);
    const fetchSpy = vi.fn(async (url: string) =>
      new Response(JSON.stringify(reportPayload(iso(T0 - 60_000))), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchSpy);
    const utils = await openPanel();
    expect(utils.queryByTestId("teacher-stale-hint")).toBeNull(); // ۱ دقیقه — تازه
    const fetchesAtMount = fetchSpy.mock.calls.length;

    // ساعت ۷ دقیقه جلو میرود؛ تیکِ ۶۰ث صادقانه برچسب را نو میکند — بدونِ هیچ واکشی
    vi.setSystemTime(T0 + 7 * 60_000);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    const hint = utils.queryByTestId("teacher-stale-hint");
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toContain("گزارش کهنه است");
    expect(fetchSpy.mock.calls.length).toBe(fetchesAtMount); // تیک صفر واکش — پنل مؤدب ماند
  });

  it("refresh re-arms the door: a new report object silences the hint immediately", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(T0);
    // واکشِ اول: کهنه (۶ دقیقه) — واکشِ بعدی: تازه (لحظهٔ رفرش)
    stubFetchWith(iso(T0 - 6 * 60_000));
    const utils = await openPanel();
    expect(utils.queryByTestId("teacher-stale-hint")).not.toBeNull();

    stubFetchWith(iso(T0)); // گزارشِ نو — تازه در ساعتِ فیکِ همان لحظه
    const refresh = utils.getByRole("button", { name: "به‌روزرسانی گزارش" });
    await act(async () => {
      fireEvent.click(refresh);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(utils.queryByTestId("teacher-stale-hint")).toBeNull(); // فوری خاموش — نه در تیکِ بعدی
  });

  it("unmount cleans the polite tick — zero timers survive", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(T0);
    stubFetchWith(iso(T0 - 60_000));
    const utils = await openPanel();
    expect(vi.getTimerCount()).toBeGreaterThan(0); // تیک زنده است
    utils.unmount();
    expect(vi.getTimerCount()).toBe(0); // پاکسازیِ کامل — هیچ تایمری جا نمیماند
  });

  it("no analytics event fired for staleness — the hint is a read-side label, not a learning action", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(T0);
    stubFetchWith(iso(T0 - 6 * 60_000));
    const { trackEvent } = await import("@/lib/analytics");
    const spy = trackEvent as ReturnType<typeof vi.fn>;
    await openPanel();
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    const names = spy.mock.calls.map((c) => String(c[0]));
    expect(names).not.toContain("teacher_stale");
    for (const n of names) expect(n).not.toContain("stale");
  });
});
