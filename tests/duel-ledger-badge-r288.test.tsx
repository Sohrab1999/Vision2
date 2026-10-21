// ------------------------------------------------------------------
// r288 «نشان‌های نبردی روی کارتِ کارنامهٔ دفترچه» — بندِ ② راندِ ۲۸۷:
//   ① سلامتِ رجیستریِ خانواده: DUEL_BADGE_IDS ده عضوِ یکتا و همگی عضوِ
//     BADGES — منبعِ یگانهٔ «کدام نشانها نبردی‌اند»
//   ② ارزیابیِ واحد: دو برد مقابلِ یک حریفِ واحد → «شکارچیِ رقیب» در
//     خانواده — و نشانِ همگانیِ بازِ همان کاربر («اولین قدم») هرگز وارد
//     خانواده نمیشود (اصلِ خودسازگاریِ شمارنده — پادزهرِ دامِ r287)
//   ③ پلهٔ بالاتر قفل میماند: دو برد ≠ «کابوسِ رقیب» (سه برد) — زیرمجموعهٔ
//     ریاضیِ ۳⇒۲ در جهتِ منفی هم قفل است
//   ④ دفترچهٔ تهی → خانوادهٔ تهی (خطِ صادقِ باند، نه حذفِ باند)
//   ⑤ قفلِ ساختاری: چهار کارت از یک نقاش (هفته‌نامه/رسمی/نبرد/دفترچه) —
//     فقط فراخوانِ دفترچه سرصفه/شمارندهٔ خانواده میفرستد؛ هر سه فراخوانِ
//     قدیمی عیناً رندرِ قبل را میگیرند (سازگاریِ با عقبِ نقاشِ واحد)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BADGES, DUEL_BADGE_IDS, duelFamilyBadges, buildEvalInput, unlockedBadgeIds } from "@/lib/achievements";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished" as const,
  opponent: "سینا",
  opponentColor: "rose" as const,
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

// ورودیِ ارزیابی از خودِ فروشگاه (پیشفرضها) + همان چیزی که آزمون تعریف میکند
const evalWith = (over: {
  history?: StudyHistoryPatch;
  duelHistory?: DuelRecord[];
}) => {
  const st = useStudy.getState();
  return buildEvalInput({
    known: st.known,
    results: st.results,
    history: over.history ?? {},
    dayStat: st.dayStat,
    streak: 0,
    bestStreak: 0,
    mistakes: st.mistakes,
    duelHistory: over.duelHistory,
  });
};
type StudyHistoryPatch = ReturnType<typeof useStudy.getState>["history"];

describe("خانوادهٔ نبرد در رجیستری (r288)", () => {
  it("DUEL_BADGE_IDS: ده عضوِ یکتا و همگی عضوِ BADGES — هیچ ردیفِ مرده", () => {
    expect(DUEL_BADGE_IDS).toHaveLength(10);
    expect(new Set(DUEL_BADGE_IDS).size).toBe(10);
    const ids = new Set(BADGES.map((b) => b.id));
    for (const id of DUEL_BADGE_IDS) expect(ids.has(id)).toBe(true);
  });

  it("دو برد مقابلِ یک حریفِ واحد → شکارچیِ رقیب در خانواده؛ اولین قدمِ همگانیِ باز غایب", () => {
    const input = evalWith({
      // نشانِ همگانیِ باز: نخستین فعالیت — در گرید میآید، در باندِ خانواده نه
      history: { "2026-10-13": { quizzes: 2, reviews: 1 } },
      duelHistory: [
        rec({ id: "a1", opponent: "آرش ر", myScore: 1200 }),
        rec({ id: "a2", opponent: "آرش ر", myScore: 1100 }),
      ],
    });
    const unlocked = unlockedBadgeIds(input);
    expect(unlocked.has("rival-hunter")).toBe(true);
    expect(unlocked.has("first-step")).toBe(true); // نشانِ همگانی هم باز است
    const family = duelFamilyBadges(unlocked);
    expect(family.map((b) => b.id)).toEqual(["rival-hunter"]);
    expect(family.map((b) => b.title)).toEqual(["شکارچیِ رقیب"]);
    expect(family.map((b) => b.tier)).toEqual(["silver"]);
  });

  it("دو برد ≠ کابوسِ رقیب — پلهٔ سه‌بردی در جهتِ منفی هم قفل است", () => {
    const input = evalWith({
      duelHistory: [
        rec({ id: "b1", opponent: "آرش ر" }),
        rec({ id: "b2", opponent: "آرش ر" }),
        rec({ id: "b3", opponent: "سینا" }), // حریفِ دیگر — در شمارشِ «یک حریف» نمیآید
      ],
    });
    const unlocked = unlockedBadgeIds(input);
    expect(unlocked.has("rival-hunter")).toBe(true);
    expect(unlocked.has("rival-nightmare")).toBe(false);
    expect(duelFamilyBadges(unlocked).map((b) => b.id)).toEqual(["rival-hunter"]);
  });

  it("دفترچهٔ تهی → خانوادهٔ تهی (خطِ صادقِ باند، نه حذفِ باند)", () => {
    const input = evalWith({});
    const family = duelFamilyBadges(unlockedBadgeIds(input));
    expect(family).toEqual([]);
  });

  it("قفلِ ساختاری: چهار کارت از یک نقاش — فقط دفترچه سرصفهٔ خانواده میفرستد", () => {
    const src = readFileSync(join(process.cwd(), "src/lib/result-image.ts"), "utf8");
    // ① چهار فراخوانِ واقعیِ نقاش (تعریفِ تابع `drawBadgeBand(` نمیشمارد)
    const calls = src.match(/drawBadgeBand\(ctx/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(4);
    // ② فقط یک فراخوان سرصفهٔ خانواده میفرستد — سه فراخوانِ قدیمی بدونِ پارامترهایِ نوی رندرِ قبل را میگیرند
    expect((src.match(/header:/g) ?? []).length).toBe(1);
    expect(src).toContain('header: "نشان‌های نبردی"');
    expect((src.match(/total: DUEL_BADGE_IDS\.length/g) ?? []).length).toBe(1);
    // ③ هر دو خطِ صادقِ بی‌نشان سرِ جای خودند: پیشفرضِ همگانی + خطِ خانوادهٔ نبرد
    expect(src).toContain("هنوز نشانی باز نشده — با ادامهٔ تمرین روزانه نشان‌ها همین‌جا هم می‌آیند.");
    expect(src).toContain("هنوز نشانی نبردی باز نشده — نخستین پیروزی، نخستین نشان را میآورد.");
    // ④ کارتِ دفترچه روی بومِ ۷۶۰ باز میشود (ناحیهٔ باند — الگویِ r287)
    expect(src).toContain("openBattleCard(family, 760)");
  });
});
