import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import {
  sanitizeDuelHistory,
  duelLedgerDigest,
  duelWinStreak,
  duelBestScore,
  duelPerennialRival,
  duelTopRival,
  duelVerifiedCount,
  duelVerifiedWins,
  duelQuickThinkers,
  isQuickThinkRecord,
} from "@/lib/duel-history";
import { percent } from "@/lib/domain/percent";
import { resolveStar } from "@/lib/my-words-resolve";

/**
 * r323 — «قهرمان در سطح‌های دیگر»: شخصیتِ r322 + دفترچهٔ نبرد + سابقهٔ آزمون.
 *
 * پیشنهادِ ②ِ r322: شخصیتِ قهرمان باید پیمایش‌های سطحِ دیگر را هم ببیند.
 * رانندهٔ این راند سه سطحِ تازه را با دادهٔ واقعی سنجید — هر سه پاک (suspects=[]
 * و h_bugs=0 در هر ۸ مرحله):
 *   A. duel-setup با دفترچهٔ واقعی (۶ رکورد: ۳ برد/۲ باخت/۱ مساوی، ۳ داورگواه،
 *      یک فورفیت، یک رکوردِ فکردار) + کاویدن (جست‌وجوی نرمال‌شده «امیرمحمد»=۲،
 *      فقطِ داورگواه=۳، مرتب‌سازی بیشترین امتیاز) در روشن/تاریک/دسکتاپ.
 *   B. آزمونِ جامع با سابقه — صفحهٔ اصلی (دو ModeCard با بهترین ۹۰٪/۸۴٪) و
 *      مودِ «پایان ترم» (۶ دکمهٔ پایه، دوتای دهم/یازدهم با «بهترین»).
 *   C. واژه‌های منِ پُر — درسِ ابزاری: فهرست از starredWords میخواند نه known؛
 *      ۱۰ ستاره = ۱۰ ردیفِ واقعی (starRows=10).
 * دو درسِ تایپیِ راند: ① ZWNJِ نامرئی — «واژههای من» در اسکریپتِ r319 نیم‌فاصله
 * داشت و در انتخابگرِ تایپی نمیآید؛ تطبیقِ بی‌نیمفاصله (replace(/\u200c/g,''))
 * همان کاری که خودِ app در normalizeDuelQuery میکند. ② چیپِ «فکرِ میانگین»
 * در aria-label است نه innerText — پروبِ attribute نه متن.
 */

const personaJson = execSync(`node ${join(process.cwd(), "scripts", "r323-persona.js")} champion`, {
  encoding: "utf8",
});
const persona = JSON.parse(personaJson) as {
  state: {
    userName: string;
    duelWins: number;
    duelLosses: number;
    duelTies: number;
    duelHistory: unknown[];
    starredWords: string[];
    results: Record<string, { correct: number; total: number; percent: number; at: string }>;
  };
  version: number;
};

const driverSh = readFileSync(join(process.cwd(), "scripts", "qa-r323-persona-levels.sh"), "utf8");

describe("r323 persona — duel ledger must survive the real sanitizer untouched", () => {
  const records = sanitizeDuelHistory(persona.state.duelHistory);

  it("all six records survive sanitizeDuelHistory (shape lock — a malformed seed would silently shrink)", () => {
    expect(persona.state.duelHistory).toHaveLength(6);
    expect(records).toHaveLength(6);
  });

  it("counters match the ledger digest (3 برد / 2 باخت / 1 مساوی)", () => {
    expect(duelLedgerDigest(records)).toEqual({ win: 3, loss: 2, tie: 1 });
    expect(persona.state.duelWins).toBe(3);
    expect(persona.state.duelLosses).toBe(2);
    expect(persona.state.duelTies).toBe(1);
  });

  it("career math: streak=1 (loss breaks the chain), best=1240", () => {
    expect(duelWinStreak(records)).toBe(1);
    expect(duelBestScore(records)).toBe(1240);
  });

  it("perennial rival = «سینا» (2 duels); top rival = first-seen winner — the long name is its own group", () => {
    const perennial = duelPerennialRival(records);
    expect(perennial).toEqual({ opponent: "سینا", duels: 2, win: 1, loss: 1, tie: 0 });
    const top = duelTopRival(records);
    expect(top).toEqual({ opponent: "امیر محمد رضایی نژاد", wins: 1 });
  });

  it("verified subset is honest: 3 signed receipts, 2 of them wins", () => {
    expect(duelVerifiedCount(records)).toBe(3);
    expect(duelVerifiedWins(records)).toBe(2);
  });

  it("exactly one quick-think record qualifies (gates: seen≥3, answered≥5, rate≥0.8, avg≤1500ms)", () => {
    expect(records[0].think).toBeDefined();
    expect(isQuickThinkRecord(records[0])).toBe(true);
    expect(duelQuickThinkers(records)).toBe(1);
  });

  it("one forfeit record survives (the «ضربهٔ فنی» chip renders only from reason)", () => {
    expect(records.filter((r) => r.reason === "forfeit")).toHaveLength(1);
  });
});

describe("r323 persona — exam history keys (exam-view reads bests from these)", () => {
  const cases: Array<[string, number, number]> = [
    ["exam", 36, 40],
    ["exam-mistakes", 3, 10],
    ["final", 42, 50],
    ["final-10", 38, 50],
    ["final-11", 44, 50],
  ];

  it.each(cases)("results[%s] is a valid row with percent recomputed from domain", (key, correct, total) => {
    const r = persona.state.results[key];
    expect(r).toBeDefined();
    expect(r.correct).toBe(correct);
    expect(r.total).toBe(total);
    expect(percent(r.correct, r.total)).toBe(r.percent);
  });
});

describe("r323 persona — starredWords is what my-words actually renders", () => {
  it("every starred key resolves to a live word (stale-key guard)", () => {
    expect(persona.state.starredWords).toHaveLength(10);
    for (const key of persona.state.starredWords) {
      expect(resolveStar(key)).not.toBeNull();
    }
  });

  it("stars span three lessons and include the dangerous words (risk chips render on rows)", () => {
    const lessons = new Set(persona.state.starredWords.map((k) => Number(k.slice(0, k.indexOf(":")))));
    expect([...lessons].sort()).toEqual([1, 2, 3]);
    expect(persona.state.starredWords).toContain("2:addiction");
    expect(persona.state.starredWords).toContain("1:ability");
  });
});

describe("r323 driver — the lessons are locked in the tool", () => {
  it("click_tool matches ZWNJ-stripped text (the invisible-ZWNJ typo r319 warned about)", () => {
    // متنِ فایلِ بش دو بک‌اسلش دارد (escape در درونِ evalِ دو‌نقل‌قولی)
    expect(driverSh).toContain("replace(/\\\\u200c/g,'')");
    // و الگویِ شکست‌خوردهٔ r323-اجرا۱ دیگر در click_tool نیست
    const clickTool = driverSh.slice(driverSh.indexOf("click_tool()"), driverSh.indexOf("dispatch()"));
    expect(clickTool).not.toMatch(/x\.textContent\?\.includes\("\$1"\)/);
  });

  it("think-chip probe is attribute-based, not innerText", () => {
    expect(driverSh).toMatch(/role=\\"img\\"/);
    expect(driverSh).toMatch(/imgs\.some\(a=>a&&a\.includes\('فکرِ میانگین'\)\)/);
  });

  it("exam coverage is two-phase: main ModeCards + final-mode grade buttons", () => {
    expect(driverSh).toMatch(/exam-main-390/);
    expect(driverSh).toMatch(/exam-final-mode-390/);
    expect(driverSh).toMatch(/final-exam-card/);
    expect(driverSh).toMatch(/button\[aria-pressed\]/);
    expect(driverSh).toMatch(/بهترین نتیجه: ۹۰٪/);
    expect(driverSh).toMatch(/بهترین نتیجه: ۸۴٪/);
  });

  it("ledger cave machinery is exercised: normalized search, verified-only, sort", () => {
    expect(driverSh).toMatch(/HTMLInputElement\.prototype/); // fillِ React-سازگار (درسِ r321)
    expect(driverSh).toMatch(/امیرمحمد/); // جست‌وجوی نرمال‌شده — ۲ رکورد
    expect(driverSh).toMatch(/رسیدِ امضاشده/); // «فقط داورگواه» با title
    expect(driverSh).toMatch(/مرتب‌سازی نبردها/);
    expect(driverSh).toMatch(/duel-cave-search/);
    expect(driverSh).toMatch(/duel-cave-verified-sorted/);
  });

  it("my-words probe reads starRows (the list source is starredWords — locked after run-1's NO-rows lesson)", () => {
    expect(driverSh).toMatch(/starRows/);
    expect(driverSh).toMatch(/aria-label\*=\\"حذف\\"/);
    expect(driverSh).toMatch(/my-words-full-390/);
  });

  it("eight audited stages across light/dark/desktop", () => {
    const stages = driverSh.match(/stage "[^"]+"/g) ?? [];
    expect(stages).toHaveLength(8);
    expect(driverSh).toMatch(/duel-ledger-light-390/);
    expect(driverSh).toMatch(/duel-ledger-dark-390/);
    expect(driverSh).toMatch(/duel-ledger-desktop-1280/);
  });
});
