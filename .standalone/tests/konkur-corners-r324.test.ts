import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

/**
 * r324 — «قهرمان در گوشهٔ کنکور»: شخصیتِ r323 + دادهٔ کاملِ بانکِ ۳۶۰تایی.
 *
 * پیشنهادِ ②ِ r323: سه کورسو که تا امروز فقط «خالی» دیده بودند — گوشهٔ کنکور
 * (bestCover/bestHard + نقشهٔ ۳۶۰خانهای + پنلِ تستهای سخت با بنرِ SRS)، CTAِ
 * «مرور اشتباهات آزمون جامع» و زبانههایِ کارنامهٔ درس. ده مرحلهٔ ممیزی همه پاک
 * (h_bugs=0 · v_cand=0 · suspects=[]) — و در همان مسیر:
 *
 * ۱) باگِ واقعیِ راند: پیلِ روزِ «اوجِ هفته» در نمودارِ هفتگی تا ۴px له میشد —
 *    دامِ flex-basis-صفر رویِ محورِ عمودی: بودجهٔ ستون ۱۶۳px در ظرفِ ۱۴۸px و
 *    میلههایِ روزِ اوج (min-content=116) جمعنشدنی — کلِ کسریِ ۱۵px رویِ پیل
 *    میریخت (سنجشِ زنده: kids=[16,116,4]). ترمیم: میلهها ۱۱۶→۹۶ (بودجهٔ
 *    کاملِ ۱۴۳ ≤ ۱۴۸) + shrink-0 رویِ پیل — زنده تأیید: هر ۷ ستون [16,96,19].
 * ۲) کشفِ ساختاری: زبانهٔ «تست‌ها»ی درس فقط سه دسته دارد (vocab/vocab-konkuri/
 *    grammar) — نتیجهٔ دیکته/مترادف کارتِ تست ندارند؛ چیپِ «بهترین نتیجه»ی
 *    مترادف در زبانهٔ خودش با faNum است (برخلافِ کارتِ تست که لاتین چاپ میکند).
 * ۳) پیشنهادِ ③ِ r323 اجرا شد: بنجلهایِ over≤3 که جمع شده بودند کلاسِ مشروع
 *    گرفتند — truncate_slack · leading_none · ping_wave — و دوقلویِ عمودیِ
 *    transform (translateYِ whileInViewِ سکو از خطِ پایه) هم امضا گرفت.
 */

const persona = JSON.parse(
  execSync(`node ${join(process.cwd(), "scripts", "r324-persona.js")}`, { encoding: "utf8" }),
) as {
  state: {
    userName: string;
    results: Record<string, { correct: number; total: number; percent: number }>;
    konkurSeen: Record<string, boolean>;
    konkurWrong: Record<string, boolean>;
    mistakes: Record<string, number>;
    srs: Record<string, { level: number; dueAt: number }>;
    duelHistory: unknown[];
    starredWords: string[];
  };
};

const cornersSh = readFileSync(join(process.cwd(), "scripts", "qa-r324-champion-corners.sh"), "utf8");
const lbSh = readFileSync(join(process.cwd(), "scripts", "qa-r324-leaderboard-real.sh"), "utf8");
const testsTab = readFileSync(join(process.cwd(), "src", "components", "study", "lesson", "lesson-tests-tab.tsx"), "utf8");
const synantTab = readFileSync(join(process.cwd(), "src", "components", "study", "lesson", "syn-ant-tab.tsx"), "utf8");
const weeklyChart = readFileSync(join(process.cwd(), "src", "components", "study", "practice", "weekly-chart.tsx"), "utf8");

describe("r324 persona — the champion meets the full 360-question bank", () => {
  it("seeds exactly 96 seen / 8 wrong of the exam bank", () => {
    const seen = Object.keys(persona.state.konkurSeen);
    const wrong = Object.keys(persona.state.konkurWrong);
    expect(seen.length).toBe(96);
    expect(wrong.length).toBe(8);
    // همهٔ خطاها داخلِ دیدهشدهها هستند — مسلط = ۹۶−۸ = ۸۸ (لجندِ زنده)
    for (const id of wrong) expect(persona.state.konkurSeen[id]).toBe(true);
    // شناسههای بانکِ واقعی: x-1..x-360 (Q("x-N", ...) در src/data/exam.ts)
    for (const id of [...seen, ...wrong]) expect(id).toMatch(/^x-(?:[1-9]\d?|1\d{2}|2\d{2}|3[0-5]\d|360)$/);
  });

  it("carries all three konkur records that light the ModeCards and the fifth hero KPI", () => {
    const r = persona.state.results;
    expect(r["0:konkur"]).toMatchObject({ correct: 28, total: 30, percent: 93 });
    expect(r["0:konkur-hard"]).toMatchObject({ correct: 7, total: 12, percent: 58 });
    expect(r["0:konkur-cover"]).toMatchObject({ correct: 19, total: 20, percent: 95 });
  });

  it("keeps the hard set at 8 unique — mistakes 0:x-* overlap konkurWrong (hardIdsOf semantics)", () => {
    const fromMistakes = Object.keys(persona.state.mistakes)
      .filter((k) => k.startsWith("0:"))
      .map((k) => k.slice(2));
    const hard = new Set([...Object.keys(persona.state.konkurWrong), ...fromMistakes]);
    expect(hard.size).toBe(8); // پنلِ «تستهای سخت من»: «۸ تست سختِ باز داری»
    expect(persona.state.mistakes["0:x-5"]).toBe(3);
    expect(persona.state.mistakes["0:x-23"]).toBe(2);
    // CTAِ مرور اشتباهات آزمون جامع با همین دو کلید روشن میشود
  });

  it("queues two exam-bank SRS questions under q: keys (srsQuestionDueIds contract)", () => {
    const qEntries = Object.entries(persona.state.srs).filter(([k]) => k.startsWith("q:"));
    expect(qEntries.length).toBe(2);
    for (const [, v] of qEntries) expect(v.dueAt).toBeLessThanOrEqual(Date.now());
    // واژههای SRSِ r322 دستنخورده — ویجتهای واژگان نباید آلوده شوند
    const wordSrs = Object.keys(persona.state.srs).filter((k) => !k.startsWith("q:"));
    expect(wordSrs.length).toBeGreaterThanOrEqual(6);
  });

  it("passes the r323 champion base through untouched", () => {
    expect(persona.state.userName).toBe("آرش-قهرمان");
    expect(persona.state.duelHistory.length).toBe(6);
    expect(persona.state.starredWords.length).toBe(10);
  });
});

describe("r324 discovery — the lesson tests tab has exactly three categories", () => {
  it("categoryInfo is vocab / vocab-konkuri / grammar — no dictation or syn-ant cards", () => {
    // کشفِ راند: پروبِ انتظارِ دیکته داشت و اپ درست بود — «دیکته» و «مترادف و
    // متضاد» زبانههایِ خودشان را دارند؛ کارتِ تستِ آنها وجود ندارد.
    expect(testsTab).toContain('key: "vocab"');
    expect(testsTab).toContain('key: "vocab-konkuri"');
    expect(testsTab).toContain('key: "grammar"');
    expect(testsTab).not.toContain('key: "dictation"');
    expect(testsTab).not.toContain('key: "synant"');
  });

  it("the tests-tab best line prints Latin digits while the syn-ant chip is faNum'd", () => {
    // کارتِ تست: `{best.percent}٪ ({best.correct}/{best.total})` — لاتین
    expect(testsTab).toContain("بهترین نتیجه: {best.percent}٪ ({best.correct}/{best.total})");
    // زبانهٔ مترادف و متضاد: `بهترین نتیجه: {faNum(best.percent)}٪` — فارسیرقم
    expect(synantTab).toContain("بهترین نتیجه: {faNum(best.percent)}٪");
    expect(synantTab).toContain('resultKey(lesson.id, "synant")');
  });
});

describe("r324 bug — the peak-day weekday pill was crushed to 4px (vertical flex-basis-zero)", () => {
  it("the weekly chart column budget is honest: bars 96, total 143 <= 148", () => {
    // بودجهٔ کهنه: 16+4+116+8+19 = 163 > 148 — کسریِ ۱۵px رویِ پیلِ تنها
    // جمعنشدنیِ روزِ اوج میریخت (min-contentِ میلهها = ۱۱۶).
    expect(weeklyChart).toContain("style={{ height: 96 }}");
    // یکمنبع: هم مقیاسِ میلهها و هم خطِ «هدف روزانه» از ۹۶ میخوانند
    expect(weeklyChart.match(/\* 96/g)?.length).toBe(2);
    expect(weeklyChart).not.toContain("* 116");
    expect(weeklyChart).not.toContain("height: 116");
  });

  it("the weekday pill is shrink-0 — the label can never be the flex absorber again", () => {
    // ترمیمِ r321 (عرض) + ترمیمِ r324 (ارتفاع): پیلِ روز با کلاسِ shrink-0
    expect(weeklyChart).toContain("mt-2 max-w-full shrink-0 truncate rounded-full px-1 py-0.5");
    // حرفِ ابتدایِ رسمیِ تقویمها (قفلِ r321) سرِ جایش است
    expect(weeklyChart).toContain("FA_WEEKDAY_INITIAL[d.weekday]");
  });

  it("documents the mechanism where it was fixed", () => {
    expect(weeklyChart).toContain("r324 — بودجهٔ صادقِ ستون");
    expect(weeklyChart).toContain("برچسبِ نامرئیِ روزِ اوج");
  });
});

describe("r324 drivers — ten audited stages across two scripts", () => {
  it("corners driver covers the konkur family, the mistakes CTA and the lesson report tabs", () => {
    for (const stage of [
      "konkur-light-390",
      "konkur-hard-panel-390",
      "konkur-dark-390",
      "konkur-desktop-1280",
      "exam-mistakes-cta-390",
      "lesson1-tests-390",
      "lesson3-tests-390",
      "lesson3-synant-390",
    ]) {
      expect(cornersSh).toContain(`stage "${stage}"`);
    }
    // شخصیتِ r324 (نه r323) تزریق میشود
    expect(cornersSh).toContain("r324-persona.js");
    // زبانهٔ «تست‌ها» بی‌نیمفاصله پیدا میشود (درسِ ZWNJ — replace(/\\u200c/g,''))
    expect(cornersSh).toContain("click_tab_safe 'تستها'");
    expect(cornersSh).toContain("replace(/\\\\u200c/g,'')");
    // پروبِ نقشه: ۳۶۰ خانه + رکوردهای سه مد
    expect(cornersSh).toContain("cells: document.querySelectorAll");
    expect(cornersSh).toContain("recCover");
  });

  it("leaderboard driver reads both real-data tabs behind the dimension tablist", () => {
    expect(lbSh).toContain('aria-label=\\"انتخاب نوع جدول\\"');
    expect(lbSh).toContain('stage "leaderboard-exams-real-390"');
    expect(lbSh).toContain('stage "leaderboard-duels-real-390"');
    // پیشنیازِ دوئلِ واقعی صریح است؛ خالیبودنِ زبانهٔ نبردها پروب میشود
    expect(lbSh).toContain("qa-r321-duel-audit.sh");
    expect(lbSh).toContain("realDuelers");
    expect(lbSh).toContain("weekly");
  });
});
