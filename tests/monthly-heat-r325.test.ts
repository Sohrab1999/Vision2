import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { storyById } from "@/data/hill-stories";

/**
 * r325 — «تقویمِ ۳۰روزهٔ پُر»: نمایِ ماهانهٔ نقشهٔ حرارتی در حالتِ پُر.
 *
 * پیشنهادِ ②ِ r324: رنگآماریِ ۳۰ خانه هرگز در حالتِ پُر سنجیده نشده بود —
 * r322 در همین نما فقط چهار badge-cardِ درخش را دید (کلاسِ sheen_bleed).
 * شخصیتِ r325 (بر پایهٔ r324) هر ۳۰ روز را فعال میسازد با پوششِ ۷/۸/۸/۷ِ
 * چهار باند و یک روزِ سه‌رقمی (۱۱۹) برایِ لبهٔ رقمِ درونِ خانهٔ ~۲۹px.
 *
 * باگِ واقعیِ راند (نخستین یافتهٔ «کنتراست» در این پروژه، نه هندسه):
 *   رقمِ درونِ خانه سفیدِ ۹۰٪ ثابت بود — سنجشِ زندهٔ WCAG با رزولورِ بومی
 *   (بومِ 1×1؛ پارسرِ rgb-فقط رنگهایِ lab()/oklch()ِ Tailwind v4 را سیاه
 *   میخواند و حکمِ غلط میساخت — minCR=21 روشن و 2.3 تاریک، هر دو پژوهشِ
 *   ابزاری):
 *   روشن: emerald-200 = ۱٫۲۴ و emerald-400 = ۱٫۷۹ — ۱۵ خانه از ۳۰ نامرئی
 *   (کمفعالیتها = رایجترینِ حالتِ یادگیرندهٔ واقعی)
 *   تاریک: نگاشتِ وارونهٔ باندها emerald-800 را به #22c55e روشن میبرد →
 *   ۲٫۰۹ و emerald-600 → ۲٫۹۵ (پرمایهترین روزها بدترین خوانایی)
 * ترمیم: heatInk جفتی با heat (≤7 → text-emerald-900؛ >7 → text-white +
 * dark:text-emerald-950) + قاعدهٔ `.dark .heat-cell.bg-emerald-{200,400} span`
 * در globals کنارِ بازنگشتهایِ همین باندها — چون هستهٔ .dark متنِ
 * emerald-900 را به emerald-300 (#6ee7b7) بازنگاشت میکند و با specificitiِ
 * ۰,۲,۰ بر dark:text-white غلبه میکرد (سنجشِ زنده: rgb(110,231,183) با
 * وجودِ dark:text-white). پسااصلاحِ زنده — هر هشت ترکیبِ تم×باند:
 *   روشن ۷٫۵۳/۴٫۹۷/۳٫۶۵/۷٫۶۱ · تاریک ۹٫۱۱/۵٫۰۲/۴٫۶۱/۶٫۶۶ — low: []
 *
 * پیشنهادِ ③ِ r324 هم اجرا شد: --since-hours=N در qa-db-cleanup-r101.cjs —
 * پنجرهٔ QA به ساعتِ راند وابسته بود و راندهای بلند (مانند خودِ r324)
 * رخدادهایشان را بیرونِ پنجره جا میگذاشتند.
 */

const persona = JSON.parse(
  execSync(`node ${join(process.cwd(), "scripts", "r325-persona.js")}`, { encoding: "utf8" }),
) as {
  state: {
    history: Record<string, { day: string; reviews: number; quizzes: number }>;
    libraryDone: Record<string, { score: number; total: number; day: string }>;
    konkurSeen: Record<string, boolean>;
    duelHistory: unknown[];
    known: Record<string, boolean>;
  };
};

const weeklyChart = readFileSync(
  join(process.cwd(), "src", "components", "study", "practice", "weekly-chart.tsx"),
  "utf8",
);
const globalsCss = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
const driver = readFileSync(join(process.cwd(), "scripts", "qa-r325-monthly.sh"), "utf8");
const cleanup = readFileSync(join(process.cwd(), "scripts", "qa-db-cleanup-r101.cjs"), "utf8");

describe("r325 persona — every one of the 30 cells holds data", () => {
  it("seeds exactly 30 unique active days in the last 30 days", () => {
    const keys = Object.keys(persona.state.history);
    expect(keys.length).toBe(30);
    expect(new Set(keys).size).toBe(30);
    const now = Date.now();
    for (const k of keys) {
      expect(k).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const age = (now - new Date(`${k}T12:00:00`).getTime()) / 86400000;
      expect(age).toBeGreaterThanOrEqual(-1); // امروز یا گذشته
      expect(age).toBeLessThan(31);
      expect(persona.state.history[k].reviews + persona.state.history[k].quizzes).toBeGreaterThanOrEqual(1);
    }
  });

  it("covers all four heat bands 7/8/8/7 (the pattern lastNDays colors by)", () => {
    // lastNDays total = reviews + quizzes (day-engine.ts:186) — words/dictation/rush نمی‌شمارند
    const totals = Object.values(persona.state.history).map((d) => d.reviews + d.quizzes);
    const band = (t: number) => (t <= 3 ? 1 : t <= 7 ? 2 : t <= 12 ? 3 : 4);
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
    for (const t of totals) counts[band(t)]++;
    expect(counts[1]).toBe(7);
    expect(counts[2]).toBe(8);
    expect(counts[3]).toBe(8);
    expect(counts[4]).toBe(7);
  });

  it("carries exactly one 3-digit day (۱۱۹) for the in-cell number edge", () => {
    const big = Object.values(persona.state.history).filter((d) => d.reviews + d.quizzes >= 100);
    expect(big.length).toBe(1);
    expect(big[0].reviews + big[0].quizzes).toBe(119);
  });

  it("keeps the monthTotal/avg accounting the panel header will print", () => {
    const total = Object.values(persona.state.history).reduce((s, d) => s + d.reviews + d.quizzes, 0);
    expect(total).toBe(357); // header: میانگین روزانه: ۱۲ (357/30 = 11.9)
  });

  it("seeds three real hill stories so the 30-day story chip is full", () => {
    const entries = Object.entries(persona.state.libraryDone);
    expect(entries.length).toBe(3);
    for (const [id, e] of entries) {
      // شناسههای واقعیِ کتابخانه — sanitizeِ کلیدِ بیگانه را می‌ریزد
      expect(storyById(id)).toBeDefined();
      expect(e.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.total).toBeGreaterThan(0);
    }
    // دو داستانِ دور (۹ و ۲۰ روزِ پیش) بیرونِ پنجرهٔ هفتگیاند — چیپِ هفته = ۱
    const now = Date.now();
    const week = entries.filter(
      ([, e]) => (now - new Date(`${e.day}T12:00:00`).getTime()) / 86400000 <= 7,
    );
    expect(week.length).toBe(1);
  });

  it("inherits the r324 champion fields it was built on", () => {
    expect(Object.keys(persona.state.konkurSeen).length).toBe(96);
    expect(persona.state.duelHistory.length).toBe(6);
    expect(Object.keys(persona.state.known).length).toBe(36);
  });
});

describe("r325 fix — the heat-cell ink pairs with its band in both themes", () => {
  it("replaces the constant white/90 with the band-paired heatInk", () => {
    expect(weeklyChart).toContain("const heatInk = (n: number): string => {");
    // باندِ کم: جوهرِ تیره در روشن (هستهٔ .dark آن را برایِ تاریک بازنگاشت میکند)
    expect(weeklyChart).toContain('if (n <= 7) return "text-emerald-900";');
    // باندِ بالا: سفید در روشن، تیرهٔ عمیق در تاریک
    expect(weeklyChart).toContain('return "text-white dark:text-emerald-950";');
    // سفیدِ ثابتِ کهنه کاملاً از رندرِ خانه حذف شده
    expect(weeklyChart).not.toContain("font-black text-white/90");
    // مصرفِ واقعی در spanِ خانه
    expect(weeklyChart).toContain("${heatInk(d.total)}");
  });

  it("keeps the dark band remaps and the white-ink rule side by side in globals", () => {
    // چهار بازنگشتِ زمینهٔ تاریک — منبعِ نگاشتِ وارونهای که باگِ تاریک را میساخت
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-200 { background-color: #14532d; }");
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-400 { background-color: #15803d; }");
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-600 { background-color: #16a34a; }");
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-800 { background-color: #22c55e; }");
    // جوهرِ سفیدِ باندهایِ پایین (۰,۳,۰ — بر بازنگشتِ ۰,۲,۰ِ هسته غلبه میکند)
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-200 span,");
    expect(globalsCss).toContain(".dark .heat-cell.bg-emerald-400 span { color: #ffffff; }");
  });

  it("locks the WCAG math the live probe used (synthetic pairs)", () => {
    const lum = ([r, g, b]: [number, number, number]) => {
      const f = (v: number) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const l1 = lum(a), l2 = lum(b);
      const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
      return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
    };
    expect(ratio([0, 0, 0], [255, 255, 255])).toBe(21);
    // سفیدِ ۹۰٪ رویِ emerald-200 — همان باگِ روشن (سنجشِ زنده: ۱٫۲۴)
    const emerald200: [number, number, number] = [167, 243, 208];
    expect(ratio([255, 255, 255], emerald200)).toBeLessThan(2);
    // جوهرِ ترمیمشده رویِ همان زمینه: emerald-900 (#064e3b) — ≥ 4.5
    expect(ratio([6, 78, 59], emerald200)).toBeGreaterThan(4.5);
    // تاریک: سفید رویِ بازنگشتِ emerald-800 (#22c55e) — باگِ ۲٫۰۹؛ تیرهٔ عمیق ≥ 4.5
    const remapped800: [number, number, number] = [34, 197, 94];
    expect(ratio([255, 255, 255], remapped800)).toBeLessThan(2.5);
    expect(ratio([2, 44, 34], remapped800)).toBeGreaterThan(4.5);
  });
});

describe("r325 tooling — canvas probe, driver stages, and the cleanup window flag", () => {
  it("resolves colors natively (canvas getImageData) — rgb-only parsing misjudged lab()/oklch()", () => {
    // درسِ راند: پارسرِ rgb-فقط minCR=21 (روشن) و 2.3 (تاریک) خواند — هر دو پژوهشِ ابزاری
    expect(driver).toContain("getContext(\"2d\",{willReadFrequently:true})");
    expect(driver).toContain("getImageData(0,0,1,1)");
    expect(driver).toContain("willReadFrequently");
  });

  it("pins the month-view driver: tab click, band probe, three-digit Range edge, three stages", () => {
    expect(driver).toContain("۳۰ روزه");
    expect(driver).toContain("bg-emerald-\\d+");
    expect(driver).toContain("createRange()");
    expect(driver).toContain("month-light-390");
    expect(driver).toContain("month-dark-390");
    expect(driver).toContain("month-desktop-1280");
    expect(driver).toContain("r325-persona.js");
  });

  it("gives the cleanup script a --since-hours window for long rounds (r324 ③)", () => {
    expect(cleanup).toContain('--since-hours=');
    expect(cleanup).toContain('hours === 1 ? "<60m"');
    // پیشفرض همچنان ۱ ساعت — راندهایِ عادی رفتارِ کهنه دارند
    expect(cleanup).toContain("hours * 60 * 60 * 1000");
  });
});
