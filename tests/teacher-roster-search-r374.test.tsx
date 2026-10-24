// @vitest-environment jsdom
// ------------------------------------------------------------------
// r374 — «جست‌وجوی زندهٔ فهرستِ کلاس» — بندِ ②ِ پیشنهادِ r373: معلمِ
// کلاسِ ۸۰نفره (و بزرگتر) در ردیفها دنبالِ دانشآموز میگردد. قراردادها:
//   • فیلترِ سمتِ کلاینت رویِ sortedRoster — صفرِ درخواستِ نو؛ ترتیبِ
//     مرتبسازیِ فعلیِ معلم دستنخورده (فیلتر بعدِ مرتبسازی)
//   • normalizeFa تکمنبعِ پالتِ فرمان: ي/ی و ك/ک و نیمفاصله و ارقامِ
//     عربی یکسان میشوند — «سارا» با هر صفحهکلیدی پیدا میشود؛
//     «بلیت‌آزمای» با «بلیت آزمای» یکی میشوند
//   • چندواژگانی: «سارا ب» یعنی هر دو توکن (AND)
//   • شمارندهٔ صادق با واژگانِ خانواده («N یادگیرنده یافت شد» —
//     همان «N واژه یافت شد»ِ دیکشنری) + aria-live
//   • دو خالیِ صادقانه: کلاسِ خالی ≠ جست‌وجویِ بیجواب — هیچ
//     ردیفِ دروغگو
//   • سرشماریِ سربرگ دستنخورده: «یادگیرندگان (M)» همیشه کلِ کلاس
//   • صداقتِ دفتر: فیلترِ نما هرگز دامنهٔ دفترِ کامل را تنگ نمیکند —
//     openable از report.roster میآید نه visibleRoster
//   • دیالوگِ جزئیات زیرِ فیلتر زنده میماند؛ صفرِ رویدادِ تحلیلیِ نو
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import type { RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const rowOf = (name: string, attempts: number, handle?: string): RosterRow => ({
  name,
  color: "emerald",
  attempts,
  avgPercent: attempts > 0 ? 73 : null,
  bestPercent: attempts > 0 ? 90 : null,
  lessons: attempts > 0 ? 2 : 0,
  lastActive: attempts > 0 ? "2026-10-24T08:30:00.000Z" : null,
  weakest: attempts > 0 ? { category: "quiz", avgPercent: 73 } : null,
  handle,
});

const HOUR = 3600_000;
const now = Date.now();
const day = (i: number) => new Date(now - i * 86_400_000).toISOString().slice(0, 10);

const reportPayload = (roster: RosterRow[]) => ({
  ok: true,
  generatedAt: new Date(now).toISOString(),
  summary: {
    learners: roster.length,
    attempts: roster.reduce((s, r) => s + r.attempts, 0),
    avgPercent: 73,
    last24h: 1,
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 1, avgPercent: 73 })),
  },
  roster,
});

const fixture = () => [
  rowOf("سارا", 5, "h-sara"),
  rowOf("سارا بلیت‌آزمای QA", 2, "h-sara-b"),
  rowOf("سارا QA", 9, "h-sara-qa"),
  rowOf("علی", 0), // بیتلاش، بی-handle — ردیفِ خواندنی
  rowOf("آرش", 3, "h-arash"),
];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.unstubAllGlobals();
  toastSpy.mockClear();
  cleanup();
});

const openPanel = async (roster: RosterRow[] = fixture()) => {
  sessionStorage.setItem("vision2-teacher-code", "edu-1404");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).includes("/api/teacher/report")) {
        return new Response(JSON.stringify(reportPayload(roster)), { status: 200 });
      }
      return new Response(JSON.stringify({ ok: true, learner: { name: "آرش" } }), { status: 200 });
    })
  );
  const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
  const utils = render(<TeacherView />);
  await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
  return utils;
};

const type = (utils: ReturnType<typeof render>, q: string) => {
  fireEvent.change(utils.getByTestId("teacher-search-input"), { target: { value: q } });
};

const rowNames = (utils: ReturnType<typeof render>) =>
  (utils.getAllByTestId("teacher-row") as HTMLElement[]).map((el) =>
    (el.querySelector("span.truncate") as HTMLElement).textContent
  );

describe("r374 — جست‌وجوی زندهٔ فهرستِ کلاس", () => {
  it("① قفلِ منبع: normalizeFa از تکمنبعِ پالت — بی transition-all؛ دفتر از report.roster تغذیه میشود نه فیلترِ نما؛ بی رویدادِ نو", () => {
    const src = read("src/components/study/teacher/teacher-view.tsx");
    expect(src).toContain('import { normalizeFa } from "@/lib/command-palette"');
    expect(src).not.toContain("transition-all");
    // صداقتِ دفترِ کامل: دامنهٔ دفتر همیشه کلِ گزارش است — فیلترِ نما هرگز آن را تنگ نمیکند
    expect(src).toContain("report.roster.filter((r) => r.attempts > 0");
    // ردیفهایِ نما از فیلترِ زنده میآیند
    expect(src).toContain("visibleRoster.map(");
    // صفرِ رویدادِ تحلیلیِ نو — یک فیلترِ خواندنی، کنشِ یادگیری نیست
    expect(src).toContain('trackEvent("teacher_open")');
    expect(src).toContain('trackEvent("teacher_csv")');
    expect(src).toContain('trackEvent("teacher_class_csv")');
    expect(src).not.toContain("teacher_search");
    // سه testidِ قراردادی
    expect(src).toContain('data-testid="teacher-search-input"');
    expect(src).toContain('data-testid="teacher-search-clear"');
    expect(src).toContain('data-testid="teacher-search-count"');
  });

  it("② فیلترِ زنده + شمارندهٔ صادق — سرشماریِ سربرگ کلِ کلاس میماند؛ ترتیبِ مرتبسازی محفوظ", async () => {
    const utils = await openPanel();
    // پیشفرض: مرتبسازیِ تلاشِ نزولی — ۹، ۵، ۳، ۲، ۰
    expect(rowNames(utils)).toEqual(["سارا QA", "سارا", "آرش", "سارا بلیت‌آزمای QA", "علی"]);
    type(utils, "سارا");
    await waitFor(() => expect(utils.getByTestId("teacher-search-count")).toBeDefined());
    expect(rowNames(utils)).toEqual(["سارا QA", "سارا", "سارا بلیت‌آزمای QA"]);
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۳ یادگیرنده یافت شد");
    // سرشماریِ سربرگ دستنخورده — همیشه کلِ کلاس
    expect(utils.getByText("یادگیرندگان (۵)")).toBeDefined();
    // دکمهٔ پاکسازی ظاهر شده
    expect(utils.getByTestId("teacher-search-clear")).toBeDefined();
  });

  it("③ صفحهکلیدِ عربی هم پیدا میکند — «بليت» با يِ عربی، همان «بلیت» (normalizeFa تکمنبع)", async () => {
    const utils = await openPanel();
    type(utils, "بليت"); // يِ عربی — نامِ ردیف یِ فارسی دارد
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا بلیت‌آزمای QA"]));
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۱ یادگیرنده یافت شد");
  });

  it("④ نیمفاصله با فاصله یکی میشود — «بلیت آزمای» (با فاصله) همان «بلیت‌آزمای» (با نیمفاصله)", async () => {
    const utils = await openPanel();
    type(utils, "بلیت آزمای");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا بلیت‌آزمای QA"]));
  });

  it("⑤ چندواژگانی (AND) — «سارا ب» فقط سارایِ بلیت‌آزمای؛ «سارا qa» هر دو QA؛ ردیفِ بیتلاش هیچوقت دکمه نمیشود", async () => {
    const utils = await openPanel();
    type(utils, "سارا ب");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا بلیت‌آزمای QA"]));
    // هر دو ردیفِ QA راست میگویند «qa» دارند — AND هر دو توکن را میخواهد، نه «دقیقاً یک نتیجه»
    type(utils, "سارا qa");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا QA", "سارا بلیت‌آزمای QA"]));
    // ردیفِ «علی» (بیتلاش) حتی در فیلترِ خودش، دکمه نمیشود — همان قراردادِ r353
    type(utils, "علی");
    await waitFor(() => expect(rowNames(utils)).toEqual(["علی"]));
    expect(utils.getAllByTestId("teacher-row").every((el) => el.getAttribute("data-teacher-open") !== "true")).toBe(true);
  });

  it("⑥ خالیِ صادقانهٔ جست‌وجو — صفرِ ردیف، «۰ یادگیرنده یافت شد»، بی ردیفِ دروغگو", async () => {
    const utils = await openPanel();
    type(utils, "ناموجودکامل");
    await waitFor(() => expect(utils.getByTestId("teacher-search-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-search-empty").textContent).toContain("یادگیری با این نام یافت نشد");
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۰ یادگیرنده یافت شد");
    expect(utils.queryAllByTestId("teacher-row")).toHaveLength(0);
  });

  it("⑦ پاکسازی با دکمه و با Escape — هر دو کلِ فهرست را برمی‌گردانند و شمارنده میمیرد", async () => {
    const utils = await openPanel();
    type(utils, "سارا");
    await waitFor(() => expect(rowNames(utils)).toHaveLength(3));
    fireEvent.click(utils.getByTestId("teacher-search-clear"));
    await waitFor(() => expect(rowNames(utils)).toHaveLength(5));
    expect(utils.queryByTestId("teacher-search-count")).toBeNull();
    expect(utils.queryByTestId("teacher-search-clear")).toBeNull();
    // دوباره، این بار با Escape
    type(utils, "سارا");
    await waitFor(() => expect(rowNames(utils)).toHaveLength(3));
    fireEvent.keyDown(utils.getByTestId("teacher-search-input"), { key: "Escape" });
    await waitFor(() => expect(rowNames(utils)).toHaveLength(5));
    expect(utils.queryByTestId("teacher-search-count")).toBeNull();
  });

  it("⑧ دیالوگِ جزئیات زیرِ فیلتر زنده میماند — کلیکِ ردیفِ فیلترشده، handleِ خودش را میخواهد", async () => {
    const utils = await openPanel();
    type(utils, "آرش");
    await waitFor(() => expect(rowNames(utils)).toEqual(["آرش"]));
    const openBtn = utils
      .getAllByTestId("teacher-row")
      .find((el) => el.getAttribute("data-teacher-open") === "true");
    expect(openBtn).toBeDefined();
    fireEvent.click(openBtn as HTMLElement);
    await waitFor(() => {
      const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
        .map((c) => String(c[0]))
        .filter((u) => u.includes("/api/teacher/learner"));
      expect(calls.some((u) => u.includes("handle=h-arash"))).toBe(true);
    });
  });

  it("⑨ کلاسِ خالی — خالیِ صادقانهٔ دیگری: «هنوز یادگیری در این کلاس نیست» ≠ جست‌وجویِ بیجواب", async () => {
    const utils = await openPanel([]);
    await waitFor(() => expect(utils.getByTestId("teacher-roster-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-roster-empty").textContent).toContain("هنوز یادگیری در این کلاس نیست");
    // جست‌وجو در کلاسِ خالی همچنان بیجوابِ صادق است — نه ردیفِ خالیِ بیپیام
    type(utils, "سارا");
    await waitFor(() => expect(utils.getByTestId("teacher-search-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۰ یادگیرنده یافت شد");
  });

  it("⑩ مرتبسازیِ دستیِ معلم زیرِ فیلتر هم حاکم است — کلیدِ «نام» با فیلترِ «سارا» الفبایی میماند (ادعای داده‌محور، نه حدسِ collation)", async () => {
    const utils = await openPanel();
    fireEvent.click(utils.getByTestId("teacher-sort-name"));
    await waitFor(() => {
      const names = rowNames(utils);
      expect(names).toEqual([...names].sort((a, b) => (a as string).localeCompare(b as string, "fa")));
    });
    type(utils, "سارا");
    await waitFor(() => {
      const names = rowNames(utils);
      expect(names).toHaveLength(3);
      // ترتیبِ همان کلیدِ الفباییِ فارسی در میانِ فیلترشدهها — داده‌محور
      expect(names).toEqual([...names].sort((a, b) => (a as string).localeCompare(b as string, "fa")));
    });
  });
});
