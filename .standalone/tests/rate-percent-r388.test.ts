// ------------------------------------------------------------------
// r388 — «قدمِ نرخ→درصد یک نام گرفت» — مالک‌ها: src/lib/domain/percent.ts
// (محاسبه) + src/lib/time-fa.ts (قالبِ percentFa).
//
// سه حکمی که این فایل قفل میکند:
//  ① زیرگروهِ بایتهمسانِ سرشماریِ «درصدِ فارسی»: قدمِ «نرخِ ۰..۱ → درصدِ
//     نمایشی» (Math.round(rate*100)) که در ۳ سایتِ نما (weekly-report ×۲:
//     آستانهٔ correctRate + نرخِ زندهٔ qw.rate؛ danger-words ×۱: d.rate)
//     بایتبه‌بایت تکرار شده بود — بدونِ هیچ گاردی: نرخِ نامتناهی بیصدا
//     «NaN٪» رندر میکرد (همان کلاسِ باگِ «NaN ماه پیش» r385) و نرخِ >۱
//     از سقفِ ۱۰۰ میگذشت. percentFromRate: نامتناهی → ۰، گردِ Math.round،
//     سقف/کفِ ۰..۱۰۰.
//  ② قالبِ «faNum(n)٪» یک مالک دارد (percentFa در time-fa — برادرِ secFa)
//     و دوقلویِ محلیِ weekly-digest (faPercent) مُرد؛ بقیهٔ ~۹۵ سایتِ
//     قالبِ «٪» گویشِ دامنهایِ عمدی میمانند (حکمِ کامل در domain/percent —
//     سابقهٔ P8-مسیرِ B: مستند، بدونِ سوییپِ مکانیکیِ بیاثر).
//  ③ گویشهایِ مستثنا دستنخورده میمانند: بومِ share-image (dialectِ r288 —
//     pct از پارامترهایِ خودِ بوم)، آستانهٔ «داغ» رویِ خودِ نرخ (دامنه،
//     نه نمایش)، pctFaِ اعشاریِ dictionary-view، قدمِ clampِ badges.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { percent, percentFromRate } from "@/lib/domain/percent";
import { faNum, percentFa } from "@/lib/time-fa";
import { percentFa as percentFaViaTheme } from "@/lib/study-theme";
import { buildDuelRecord, DUEL_QUICK_THINK } from "@/lib/duel-history";
import { duelWeekQuickProfile, DUEL_QUICK_WEEK } from "@/lib/weekly-digest";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
};

describe("r388 — percentFromRate: مالکِ قدمِ نرخ→درصد", () => {
  it("قالبِ استاندارد — همان قدمِ بایتهمسانِ سه نما", () => {
    expect(percentFromRate(0)).toBe(0);
    expect(percentFromRate(0.5)).toBe(50);
    expect(percentFromRate(0.8)).toBe(80);
    expect(percentFromRate(2 / 3)).toBe(67);
    expect(percentFromRate(1)).toBe(100);
  });

  it("گاردِ نامتناهی — دیگر هیچ نرخی «NaN٪» رندر نمیکند (کلاسِ r385)", () => {
    expect(percentFromRate(NaN)).toBe(0);
    expect(percentFromRate(Infinity)).toBe(0);
    expect(percentFromRate(-Infinity)).toBe(0);
    // و قالبِ نهایی هم ارقامِ فارسی است — هیچ «NaN»ی به متنِ فارسی درز نمیکند
    expect(percentFa(percentFromRate(NaN))).toBe("۰٪");
  });

  it("سقف و کف — نرخِ خارج از ۰..۱ به بازه میچسبد", () => {
    expect(percentFromRate(-0.25)).toBe(0);
    expect(percentFromRate(1.5)).toBe(100);
    expect(percentFromRate(99)).toBe(100);
  });

  it("مرزهایِ گردِ Math.round — با قدمِ دستیِ قدیم بایتبه‌بایت موافق", () => {
    // Math.round(99.5)=100 و Math.round(12.5)=13 — رفتارِ قدیمِ نماها عیناً
    for (const rate of [0.125, 0.995, 0.115, 0.345, 0.965]) {
      expect(percentFromRate(rate)).toBe(Math.round(rate * 100));
    }
  });

  it("قراردادِ برادر — percent (بخش از کل) دستنخورده: گاردِ مخرج و سقف", () => {
    expect(percent(1, 0)).toBe(0);
    expect(percent(NaN, 10)).toBe(0);
    expect(percent(150, 100)).toBe(100);
    expect(percent(2, 3)).toBe(67);
  });
});

describe("r388 — percentFa: مالکِ قالبِ «٪»", () => {
  it("قالبِ دقیق: faNum + علامتِ فارسیِ ٪ — هیچ رقمِ لاتینی", () => {
    for (const n of [0, 4, 12, 50, 67, 80, 100]) {
      expect(percentFa(n)).toBe(`${faNum(n)}٪`);
      expect(percentFa(n)).not.toMatch(/[0-9%]/);
    }
    expect(percentFa(80)).toBe("۸۰٪");
  });

  it("مسیرِ نما (study-theme re-export) همان تابعِ مالک است — دو نام برای یک تابع نیست", () => {
    expect(percentFaViaTheme).toBe(percentFa);
  });
});

describe("r388 — موافقتِ دادهٔ زنده: نرخِ دایجست هم از مالک میگذرد", () => {
  // پنجرهٔ واجدِ گیت: ۳ نبردِ فکردار، seen ≥ ۹، answered ≥ ۱۵، rate ≥ ۰٫۸،
  // avgMs ≤ سقفِ نقره — با نمونههایِ فکرِ واقعیِ رکورد.
  const now = Date.now();
  const rec = (msAgo: number, correct: number, answered: number, thinks: number[]) =>
    buildDuelRecord(
      {
        reason: "finished",
        winner: "me-sid",
        total: answered,
        startedAt: now - msAgo - 60_000,
        players: [
          { sid: "me-sid", name: "من", color: "emerald", score: correct * 10, correct, answered },
          { sid: "opp-sid", name: "حریف", color: "rose", score: 10, correct: 1, answered },
        ],
      },
      "me-sid",
      now - msAgo,
      now - msAgo,
      null,
      thinks
    )!;

  it("پروفایلِ هفتهٔ واجد — rate از buildDuelRecord تا نمایش با مالک موافق است", () => {
    // ۳ رکورد در ۷ روز: جمعِ answered=21، correct=18 → rate=6/7≈0.857؛
    // seen=9 (۳+۳+۳ نمونهٔ فکر) — گیتِ minSeen رد نمیشود
    const records = [
      rec(0, 6, 7, [700, 900, 1100]),
      rec(86_400_000, 6, 7, [800, 1000, 1200]),
      rec(2 * 86_400_000, 6, 7, [900, 1100, 1300]),
    ];
    const todayKey = records[0].day;
    const qw = duelWeekQuickProfile(records, todayKey);
    expect(qw).not.toBeNull();
    expect(qw!.answered).toBe(21);
    expect(qw!.correct).toBe(18);
    // موافقتِ قدم — مالک همان گردِ قدیم را میدهد؛ قالبِ نهایی «۸۶٪» است
    expect(percentFromRate(qw!.rate)).toBe(Math.round(qw!.rate * 100));
    expect(percentFa(percentFromRate(qw!.rate))).toBe("۸۶٪");
    // آستانهٔ گیت هم از مسیرِ مالک میخواند — correctRate=0.8 → «۸۰٪»
    expect(DUEL_QUICK_WEEK.correctRate).toBe(DUEL_QUICK_THINK.correctRate);
    expect(percentFa(percentFromRate(DUEL_QUICK_WEEK.correctRate))).toBe("۸۰٪");
  });

  it("هفتهٔ بی‌نبرد → nullِ صادق میماند — مالک هیچ صفرِ ساختگی نمیسازد", () => {
    expect(duelWeekQuickProfile([], "1400-01-01")).toBeNull();
    expect(duelWeekQuickProfile(undefined, "1400-01-01")).toBeNull();
  });
});

describe("r388 — قفلهایِ سورس: قدمِ دستی مُرد، گویشها زندهاند", () => {
  const weekly = read("src/components/study/reports/weekly-report.tsx");
  const danger = read("src/components/study/practice/danger-words.tsx");
  const digest = read("src/lib/weekly-digest.ts");
  const owner = read("src/lib/domain/percent.ts");
  const timeFa = read("src/lib/time-fa.ts");
  const theme = read("src/lib/study-theme.ts");
  const resultImage = read("src/lib/result-image.ts");

  it("weekly-report: هر دو سایت (آستانه + نرخِ زنده) از مالک میخوانند", () => {
    expect(weekly).toContain('from "@/lib/domain/percent"');
    expect(weekly).toContain("percentFromRate(DUEL_QUICK_WEEK.correctRate)");
    expect(weekly).toContain("percentFromRate(qw.rate)");
    expect(weekly).toContain("percentFa");
    // قدمِ دستیِ قدیم extinct است
    expect(weekly).not.toContain("Math.round(DUEL_QUICK_WEEK.correctRate * 100)");
    expect(weekly).not.toContain("Math.round(qw.rate * 100)");
  });

  it("danger-words: ratePct از مالک؛ آستانهٔ «داغ» رویِ خودِ نرخ میماند (دامنه)", () => {
    expect(danger).toContain('from "@/lib/domain/percent"');
    expect(danger).toContain("percentFromRate(d.rate)");
    expect(danger).not.toContain("Math.round(d.rate * 100)");
    expect(danger).toMatch(/d\.rate >= 0\.5/);
    // نمایش از قالبِ مالک — «۵۰٪ خطا» نه «faNum(x)٪»
    expect(danger).toContain("percentFa(ratePct)");
    expect(danger).not.toContain("faNum(ratePct)}٪");
  });

  it("weekly-digest: دوقلویِ محلیِ faPercent مرد — percentFa از مالک", () => {
    expect(digest).not.toMatch(/function faPercent/);
    expect(digest).toContain("percentFa");
    expect(digest).toContain('from "./study-theme"');
  });

  it("مالکِ محاسبه خالص و بیواردات میماند — قراردادِ سیمِ سهسرویسی", () => {
    const importLines = owner.split("\n").filter((l) => /^import\b/.test(l.trim()));
    expect(importLines).toEqual([]);
    expect(owner).toContain("export function percent(");
    expect(owner).toContain("export function percentFromRate(");
  });

  it("percentFa در مالکِ قالبِ فارسی زندگی میکند و study-theme بازنشر میکند", () => {
    expect(timeFa).toContain("export function percentFa(");
    expect(theme).toContain('export { faNum, timeAgoFa, percentFa } from "@/lib/time-fa"');
  });

  it("بومِ share-image گویشِ r288 را نگه میداشت — با حاشیهٔ متقابلِ r388", () => {
    // وارداتی از مالک نیست (حاشیه فقط «حکم» را نام میبرد، قرض نمیگیرد)
    expect(resultImage).not.toMatch(/import\s*\{[^}]*percentFromRate/);
    expect(resultImage).not.toMatch(/import\s*\{[^}]*percentFa/);
    expect(resultImage).toMatch(/r388/);
    // قالبِ بومِ پارامتری زنده است
    expect(resultImage).toContain("faNum(Math.round(pct * 100))");
  });

  it("سوییپِ کلِ estate: هیچ «Math.round(x.rate * 100)»ی در components نمیماند", () => {
    const offenders: string[] = [];
    for (const f of walk("src/components")) {
      const src = readFileSync(f, "utf8");
      if (/Math\.round\(\s*\w+\.rate\s*\*\s*100\s*\)/.test(src)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
