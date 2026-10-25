// @vitest-environment jsdom
// ------------------------------------------------------------------
// r375 — «جست‌وجو از نام فراتر میرود» — امتدادِ طبیعیِ r374: دامنهٔ
// جست‌وجوی فهرستِ کلاس = نام + برچسبِ فارسیِ ضعیف‌ترین مهارت. قراردادها:
//   • معلم «شنیداری» تایپ میکند و ضعیف‌هایِ شنیداری را میبیند —
//     همان برچسبی که در ردیف میبیند (skillLabel از COVERAGE_SKILLS)
//   • «سارا گرامر» تقاطعِ دو توکن است — توکنها رویِ هیزمِ یکپارچهٔ
//     (نام + مهارت) میافتند؛ ANDِ r374 دستنخورده
//   • یکسانسازیِ دوطرفه: «شنيداری» با يِ عربی هم همان است — هر دو
//     سمتِ مقایسه normalizeFa میگیرند
//   • «واژگان» هم تست واژگان را میگیرد هم واژگانِ کنکوری —
//     semanticsِ زیررشته، همان که سربرگ میبیند
//   • عددِ درصد عمداً بیرونِ دامنه — «۷۳» جوابِ صادق ندارد (نیمهجوابِ
//     مبهم ممنوع)؛ بیتلاشِ بی‌مهارت فقط با نامش پیدا میشود
//   • سرشماری، شمارندهٔ aria-live، خالیِ صادقانه، دفترِ کامل —
//     همهٔ قراردادهایِ r374 دستنخورده
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

const rowOf = (name: string, attempts: number, weakest?: { category: string; avgPercent: number }, handle?: string): RosterRow => ({
  name,
  color: "emerald",
  attempts,
  avgPercent: attempts > 0 ? 73 : null,
  bestPercent: attempts > 0 ? 90 : null,
  lessons: attempts > 0 ? 2 : 0,
  lastActive: attempts > 0 ? "2026-10-24T08:30:00.000Z" : null,
  weakest: weakest ?? null,
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
  rowOf("سارا", 5, { category: "listening", avgPercent: 41 }, "h-sara"),
  rowOf("سارا دوم", 3, { category: "grammar", avgPercent: 38 }, "h-sara2"),
  rowOf("علی", 4, { category: "vocab", avgPercent: 55 }, "h-ali"),
  rowOf("مریم", 0), // بیتلاش — بی weakest، بی handle
  rowOf("آرش", 2, { category: "vocab-konkuri", avgPercent: 60 }, "h-arash"),
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

describe("r375 — جست‌وجو از نام فراتر میرود (نام + ضعیف‌ترین مهارت)", () => {
  it("① قفلِ منبع: هیزم = نام + skillLabel؛ placeholder و aria و hintهای نو؛ بی رویدادِ نو؛ دفتر همچنان از report.roster", () => {
    const src = read("src/components/study/teacher/teacher-view.tsx");
    // دامنهٔ نو در هیزمِ تطبیق
    expect(src).toContain('normalizeFa(r.name + (r.weakest ? " " + skillLabel(r.weakest.category) : ""))');
    // رابطِ نو برای معلم
    expect(src).toContain("نامِ یادگیرنده یا مهارتِ ضعیف…");
    expect(src).toContain("هم نام، هم ضعیف‌ترین مهارت");
    expect(src).toContain("نام یا مهارت دیگری را امتحان کن");
    // قراردادهایِ r374 پابرجا
    expect(src).not.toContain("transition-all");
    expect(src).toContain("report.roster.filter((r) => r.attempts > 0");
    expect(src).toContain("visibleRoster.map(");
    expect(src).toContain('trackEvent("teacher_open")');
    expect(src).not.toContain("teacher_search");
  });

  it("② جست‌وجوی مهارت — «شنیداری» فقط سارایِ شنیداری-ضعیف را میآورد؛ شمارنده و سرشماری صادق", async () => {
    const utils = await openPanel();
    type(utils, "شنیداری");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا"]));
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۱ یادگیرنده یافت شد");
    expect(utils.getByText("یادگیرندگان (۵)")).toBeDefined();
  });

  it("③ يِ عربی در مهارت هم — «شنيداری» همان نتیجه (هر دو سمت normalizeFa)", async () => {
    const utils = await openPanel();
    type(utils, "شنيداری");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا"]));
  });

  it("④ تقاطعِ نام و مهارت — «سارا گرامر» فقط سارایِ دوم (توکنها رویِ هیزمِ یکپارچه)", async () => {
    const utils = await openPanel();
    type(utils, "سارا گرامر");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا دوم"]));
    // و «سارا» تنها هر دو سارا را میآورد — ANDِ r374 دستنخورده
    type(utils, "سارا");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا", "سارا دوم"]));
  });

  it("⑤ زیررشته رویِ برچسب — «واژگان» هم تست واژگان را میگیرد هم واژگانِ کنکوری", async () => {
    const utils = await openPanel();
    type(utils, "واژگان");
    await waitFor(() => expect(rowNames(utils)).toEqual(["علی", "آرش"]));
    // برچسبِ کاملِ کنکوری هم خودش را میآورد
    type(utils, "واژگان کنکوری");
    await waitFor(() => expect(rowNames(utils)).toEqual(["آرش"]));
  });

  it("⑥ بیتلاشِ بی‌مهارت فقط با نامش — «گرامر» مریم را نمیگیرد؛ «مریم» خودش را میآورد", async () => {
    const utils = await openPanel();
    type(utils, "گرامر");
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا دوم"]));
    type(utils, "مریم");
    await waitFor(() => expect(rowNames(utils)).toEqual(["مریم"]));
  });

  it("⑦ عددِ درصد بیرونِ دامنه — «۷۳» (درصدِ فیکسچر) خالیِ صادقانه دارد نه نیمهجواب", async () => {
    const utils = await openPanel();
    type(utils, "۷۳");
    await waitFor(() => expect(utils.getByTestId("teacher-search-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۰ یادگیرنده یافت شد");
    expect(utils.getByTestId("teacher-search-empty").textContent).toContain("نام یا مهارت دیگری را امتحان کن");
  });

  it("⑧ پاکسازی و Escape زیرِ جست‌وجویِ مهارت — بازگشتِ کامل", async () => {
    const utils = await openPanel();
    type(utils, "دیکته");
    await waitFor(() => expect(utils.getByTestId("teacher-search-empty")).toBeDefined());
    fireEvent.click(utils.getByTestId("teacher-search-clear"));
    await waitFor(() => expect(rowNames(utils)).toHaveLength(5));
    type(utils, "شنیداری");
    await waitFor(() => expect(rowNames(utils)).toHaveLength(1));
    fireEvent.keyDown(utils.getByTestId("teacher-search-input"), { key: "Escape" });
    await waitFor(() => expect(rowNames(utils)).toHaveLength(5));
  });

  it("⑨ رفعِ نشتِ زنده — «rush» برچسبِ فارسیِ خودش را میگیرد («چالش برق‌آسا») و با جست‌وجو پیدا میشود", async () => {
    // دو ردیفِ واقعیِ دیسک: weakest.category=rush — قبلاً «rush · ۳۰٪» خام چاپ میشد
    const roster = [
      rowOf("یادگیرنده", 1, { category: "rush", avgPercent: 30 }, "h-rush1"),
      rowOf("یادگیرنده", 1, { category: "rush", avgPercent: 20 }, "h-rush2"),
      rowOf("علی", 4, { category: "vocab", avgPercent: 55 }, "h-ali"),
    ];
    const utils = await openPanel(roster);
    // ردیفِ rush برچسبِ فارسی دارد — کلیدِ خام به معلم نمیرسد
    await waitFor(() => {
      const texts = utils.getAllByTestId("teacher-row").map((el) => el.textContent);
      expect(texts.some((t) => t?.includes("چالش برق‌آسا"))).toBe(true);
      expect(texts.some((t) => t?.includes("rush"))).toBe(false);
    });
    // و برچسبِ فارسی، جست‌وجوپذیر است — معلم «چالش» می‌نویسد و ضعیف‌هایِ چالش میآیند
    type(utils, "چالش برق‌آسا");
    await waitFor(() => expect(rowNames(utils)).toHaveLength(2));
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۲ یادگیرنده یافت شد");
  });

  it("⑩ قفلِ تکمنبعیِ برچسب — سه نسخهٔ دوقلو مردهاند؛ همه از teacherSkillLabel میخوانند", () => {
    const lib = read("src/lib/teacher-skill-label.ts");
    // ترتیبِ حل: پوشش → دستهٔ شناختهشدهٔ بیرونِ پوشش → کلیدِ خام
    expect(lib).toContain("COVERAGE_SKILLS.find((s) => s.key === key)?.label ?? TEACHER_CATEGORY_EXTRA[key] ?? key");
    expect(lib).toContain('rush: "چالش برق‌آسا"');
    expect(lib).toContain('"spell-rush": "دیکتهٔ برق‌آسا"');
    // سه فایلِ مصرف، هیچ تعریفِ محلیِ قدیمیای نمیماند
    for (const f of [
      "src/components/study/teacher/teacher-view.tsx",
      "src/components/study/teacher/teacher-detail.tsx",
      "src/lib/teacher-learner-csv.ts",
    ]) {
      const src = read(f);
      expect(src).toContain("teacherSkillLabel");
      expect(src).not.toContain("COVERAGE_SKILLS.find((s) => s.key === key)?.label ?? key");
    }
    // دیالوگ و نما هر دو از همان lib میخوانند
    expect(read("src/components/study/teacher/teacher-detail.tsx")).toContain('from "@/lib/teacher-skill-label"');
    expect(read("src/lib/teacher-learner-csv.ts")).toContain('from "./teacher-skill-label"');
  });
});
