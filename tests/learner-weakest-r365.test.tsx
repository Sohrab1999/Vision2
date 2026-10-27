// @vitest-environment jsdom
// ------------------------------------------------------------------
// r365 — «ضعیفترینِ مهارت» در کارنامهٔ یادگیرنده — همزادِ CSVِ نخستین
// ردیفِ «مهارتها — ضعیفترینِ اول» که دیالوگ از r353 نشان میدهد.
//
// قفلهایِ این فایل:
//   • قطعیت با قاعدهٔ خودِ سرور (pickWeakest): کمترینِ میانگین،
//     تساوی ⇒ نامِ صعودی — قفلِ همخوانیِ دو موتور (کارنامه/رستر)
//   • صداقتها: bySkillِ تهی ⇒ هیچ؛ ردیفِ بدنام از نامزدی حذف
//     (میانگینِ بیتلاش میانگین نیست — تلاشِ صفر نامزد نیست)؛
//     میانگینِ صفر واقعی است و چاپ میشود
//   • هر سطح به گویشِ خودش: CSV با learnerSkillLabel و ASCII؛
//     دیالوگ با skillLabel و faNum — از یک موتور (weakestSkillMeta)
//   • دفترِ کامل بدونِ تغییرِ خط دنبال میرود (قرضِ بایت‌به‌بایتِ r363)
//   • رجیستریِ ۵۲ دستنخورده — ضعیفترین مهارت خواندنی است نه گزارششدنی
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import TeacherView from "@/components/study/teacher/teacher-view";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/study-store", () => ({
  useStudy: (sel: (s: { setView: (v: unknown) => void }) => unknown) => sel({ setView: vi.fn() }),
}));
import {
  buildLearnerCardCsv,
  weakestSkillMeta,
  weakestSkillRow,
  LEARNER_CARD_TITLE,
  LEARNER_SUMMARY_COLUMNS,
} from "@/lib/teacher-learner-csv";
import { buildClassLedgerCsv, LEDGER_TITLE } from "@/lib/teacher-class-ledger";
import { pickWeakest } from "@/lib/teacher-report";
import type { LearnerDetail } from "@/lib/teacher-report";
import { faNum } from "@/lib/study-theme";
import { EVENT_NAMES, EVENT_CATEGORIES } from "@/lib/analytics-events";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const HOUR = 3600 * 1000;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString().slice(0, 10);

const skill = (category: string, attempts: number, avgPercent: number, bestPercent = 70) => ({
  category,
  attempts,
  avgPercent,
  bestPercent,
});

const fullDetail: LearnerDetail = {
  name: "آرش",
  color: "emerald",
  joinedAt: iso(9 * 86_400_000),
  attempts: 12,
  avgPercent: 55,
  bestPercent: 80,
  lessons: 2,
  lastActive: iso(HOUR),
  byDay: Array.from({ length: 14 }, (_, i) => ({
    day: day(13 - i),
    attempts: i === 10 ? 4 : i === 11 ? 5 : i === 12 ? 3 : 0,
  })),
  bySkill: [skill("dictation", 5, 40, 60), skill("vocab", 4, 75, 90), skill("grammar", 3, 52, 70)],
  byLesson: [
    { lesson: 1, attempts: 9, avgPercent: 60 },
    ...Array.from({ length: 11 }, (_, i) => ({ lesson: i + 2, attempts: 0, avgPercent: null })),
  ],
  recent: [{ category: "dictation", lesson: 1, percent: 45, createdAt: iso(HOUR) }],
};

const emptyDetail: LearnerDetail = {
  ...fullDetail,
  name: "نگار",
  attempts: 0,
  avgPercent: null,
  bestPercent: null,
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: 0 })),
  bySkill: [],
  recent: [],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------
// ① موتور — قطعیت و صداقت
// ---------------------------------------------------------------
describe("weakestSkillMeta — قطعیت با قاعدهٔ سرور", () => {
  it("① کمترینِ میانگین برنده است؛ تساوی ⇒ نامِ صعودی (قطعی، قفلِ تستی)", () => {
    const m = weakestSkillMeta([skill("vocab", 4, 75), skill("dictation", 5, 40), skill("grammar", 3, 52)]);
    expect(m).toEqual({ category: "dictation", attempts: 5, avgPercent: 40 });
    const tie = weakestSkillMeta([skill("writing", 2, 50), skill("dictation", 3, 50), skill("grammar", 1, 70)]);
    expect(tie!.category).toBe("dictation"); // dictation < grammar < writing — lexical
  });

  it("② میانگینِ صفر واقعی است — چاپ میشود نه پنهان", () => {
    const m = weakestSkillMeta([skill("vocab", 4, 75), skill("listening", 2, 0)]);
    expect(m).toEqual({ category: "listening", attempts: 2, avgPercent: 0 });
    expect(weakestSkillRow([skill("vocab", 4, 75), skill("listening", 2, 0)])).toBe(
      "ضعیفترینِ مهارت,شنیداری · میانگین 0٪ در 2 تلاش"
    );
  });

  it("③ تهی/غایب/زباله ⇒ null — بی‌مهارت، «ضعیفترین» هم وجود ندارد", () => {
    expect(weakestSkillMeta([])).toBeNull();
    expect(weakestSkillMeta(undefined)).toBeNull();
    expect(weakestSkillMeta(null)).toBeNull();
    expect(weakestSkillRow([])).toBeNull();
  });

  it("④ ردیفِ بدنام از نامزدی حذف میشود: تلاشِ صفر/NaN/منفی، میانگینِ NaN/منفی، دستهٔ تهی — همهِ بدنام ⇒ null", () => {
    const mixed = [
      skill("dictation", 0, 40), // بیتلاش — میانگینِ بیتلاش میانگین نیست
      skill("", 3, 40), // دستهٔ تهی
      skill("vocab", Number.NaN, 40), // تلاشِ NaN
      skill("grammar", -4, 40), // تلاشِ منفی
      skill("listening", 2, Number.NaN), // میانگینِ NaN
      skill("writing", 2, -10), // میانگینِ منفی
      skill("reading", 3, 61), // تنها نامزدِ سالم — برندهٔ اجباری
    ];
    expect(weakestSkillMeta(mixed)).toEqual({ category: "reading", attempts: 3, avgPercent: 61 });
    expect(weakestSkillMeta([skill("vocab", 0, 50)])).toBeNull(); // همهِ بدنام ⇒ هیچ
    expect(weakestSkillMeta([null, undefined, {}] as never)).toBeNull(); // زبالهٔ ساختاری
  });

  it("⑤ همخوانیِ دو موتور: کارنامه (r365) و رسترِ سرور (pickWeakest) هرگز دو نامزد نمیشوند", () => {
    const cases = [
      [skill("dictation", 5, 40), skill("vocab", 4, 75)],
      [skill("writing", 2, 50), skill("dictation", 3, 50)],
      [skill("grammar", 1, 0), skill("vocab", 9, 30)],
    ];
    for (const c of cases) {
      const rosterShape = c.map((s) => ({ userId: "u", category: s.category, avgPercent: s.avgPercent }));
      expect(weakestSkillMeta(c)!.category).toBe(pickWeakest(rosterShape)!.category);
    }
  });
});

// ---------------------------------------------------------------
// ② کارنامه — جایِ سطر و گویشِ خانواده
// ---------------------------------------------------------------
describe("buildLearnerCardCsv — ضعیفترینِ مهارت در ناحیهٔ متای سربرگ", () => {
  it("⑥ ترتیب: … هفتهٔ فعال ← پرکارترین ← ضعیفترینِ مهارت ← جداکننده ← روند — متنِ بایت‌دقیق", () => {
    const csv = buildLearnerCardCsv(fullDetail);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(LEARNER_CARD_TITLE);
    expect(lines[1]).toBe(LEARNER_SUMMARY_COLUMNS.join(","));
    expect(lines[3]).toContain("هفتهٔ فعال");
    expect(lines[4]).toContain("پرکارترینِ روز");
    expect(lines[5]).toBe("ضعیفترینِ مهارت,دیکته · میانگین 40٪ در 5 تلاش"); // برچسبِ رجیستری + ASCII
    expect(lines[6]).toBe(""); // جداکننده
    expect(lines[7]).toBe("روندِ 14 روز");
  });

  it("⑦ بی‌مهارت ⇒ غیبتِ صادق — هیچ «ضعیفترین» در کارنامه؛ بخشهایِ بعدی سالم", () => {
    const csv = buildLearnerCardCsv(emptyDetail);
    expect(csv).not.toContain("ضعیفترینِ مهارت");
    expect(csv).toContain("مهارتها — ضعیفترینِ اول"); // خودِ بخش با سرستونِ صادق میماند (r354)
    const s = csv.split("\r\n");
    expect(s[4]).toBe(""); // بیپرکارترینِ r363 پابرجا — مستقیم به جداکننده
    expect(s[5]).toBe("روندِ 14 روز");
  });

  it("⑧ کلیدِ ناشناخته ⇒ خودش (صداقتِ pulseLabel) — و گویشِ CRLFِ خالص", () => {
    const csv = buildLearnerCardCsv({ ...fullDetail, bySkill: [skill("mystery-skill", 2, 33)] });
    expect(csv).toContain("ضعیفترینِ مهارت,mystery-skill · میانگین 33٪ در 2 تلاش");
    const full = buildLearnerCardCsv(fullDetail);
    expect(full.replace(/\r\n/g, "")).not.toContain("\n");
    expect(full.endsWith("\r\n")).toBe(true);
  });

  it("⑨ دفترِ کامل دنبال میآید — کارنامهٔ درونِ دفتر سطر را دارد؛ دفتر حتی یک خط عوض نشد", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T10:15:00.000Z",
      byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 5 ? 3 : 0 })),
      roster: [
        { name: "آرش", color: "emerald", attempts: 12, avgPercent: 55, bestPercent: 80, lessons: 2, lastActive: iso(HOUR), weakest: null, handle: "a".repeat(16) },
      ],
      details: [fullDetail],
    });
    const lines = out.split("\r\n");
    expect(lines[0]).toBe(LEDGER_TITLE);
    const cardWeakest = lines.findIndex((l) => l === "ضعیفترینِ مهارت,دیکته · میانگین 40٪ در 5 تلاش");
    expect(cardWeakest).toBeGreaterThan(lines.findIndex((l) => l.startsWith("نام,رنگ"))); // درونِ کارنامهٔ آرش
    // رسترِ کلاس ستونِ weakestِ خودش را دارد (r352) — با کارنامه اشتباه نمیشود
    expect(lines.filter((l) => l.startsWith("ضعیفترینِ مهارت,"))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------
// ③ نیمهٔ دیدنی — چیپِ «ضعیفترین» کنارِ عنوانِ بخشِ مهارتها
// ---------------------------------------------------------------
describe("TeacherDetailDialog — چیپِ ضعیفترین", () => {
  it("⑩ قفلِ ساختاری: چیپ از weakestSkillMeta میخواند + گویشِ faNum + بی‌رویدادِ نو + بی‌transition-all + [باگِ a11yِ r353 بسته شد]", () => {
    const detail = read("src/components/study/teacher/teacher-detail.tsx");
    expect(detail).toContain('data-testid="teacher-detail-weakest"');
    expect(detail).toContain("weakestSkillMeta(detail.bySkill)"); // همان موتورِ سطرِ CSV — نه محاسبهٔ موازی
    expect(detail).toContain("ضعیفترین:");
    expect(detail).not.toContain("transition-all");
    expect(detail).not.toContain('trackEvent("weakest_skill")');
    // r365 — عنوانِ پنهانِ فازها: DialogContent در loading/missing/auth/net
    // بی‌عنوان نمیماند (خطایِ رادیکسِ از r353) و در ready دوتایی نمیشود
    expect(detail).toContain('phase !== "ready"');
    expect(detail).toContain('DialogTitle className="sr-only"');
    expect(detail).toContain('DialogDescription className="sr-only"');
    const card = read("src/lib/teacher-learner-csv.ts");
    expect(card).not.toContain("trackEvent"); // کتابخانهٔ CSV گزارشگر نیست
  });

  it("⑪ رندرِ زنده: دیالوگ ⇒ چیپ با برچسبِ رجیستری و ارقامِ فارسی — ۴۰٪", async () => {
    const learnerPayload = { ok: true, windowDays: 14, learner: fullDetail };
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (typeof url === "string" && url.includes("/api/teacher/learner")) {
          return { ok: true, status: 200, json: async () => learnerPayload };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            generatedAt: new Date(now).toISOString(),
            summary: {
              learners: 1, attempts: 12, avgPercent: 55, last24h: 2,
              byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 1 ? 3 : 0 })),
              byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 0, avgPercent: null })),
            },
            roster: [
              { name: "آرش", color: "emerald", attempts: 12, avgPercent: 55, bestPercent: 80, lessons: 2, lastActive: iso(HOUR), weakest: null, handle: "a".repeat(16) },
            ],
          }),
        };
      })
    );
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    const { default: TeacherViewLazy } = await import("@/components/study/teacher/teacher-view");
    const utils = render(<TeacherViewLazy />);
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
    fireEvent.click(utils.getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(utils.getByTestId("teacher-detail-cards")).toBeDefined());
    const chip = utils.getByTestId("teacher-detail-weakest");
    expect(chip.textContent).toBe(`ضعیفترین: دیکته · ${faNum(40)}٪`); // گویشِ دیالوگ — CSV همزادِ ASCII دارد
  });
});

// ---------------------------------------------------------------
// ④ رجیستری
// ---------------------------------------------------------------
describe("رجیستریِ r365", () => {
  it("⑫ رجیستریِ ۵۲ دستنخورده — ضعیفترین مهارت رویدادِ تحلیلی ندارد", () => {
    expect(EVENT_NAMES).toHaveLength(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    expect(EVENT_NAMES).not.toContain("weakest_skill");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });
});
