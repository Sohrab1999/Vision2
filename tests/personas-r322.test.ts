import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lessons } from "@/data";
import { SKILL_DEFS } from "@/lib/skill-stats";

/**
 * r322 — «شخصیت‌های داده»: پنل‌های hasProgress در حالتِ پُر سنجیده شدند.
 *
 * درسِ r321: بزرگترین کورسوها شرطی‌اند — پنلی که فقط برای یادگیرندهٔ دارایِ
 * پیشرفت رندر میشود با seed تازه هرگز دیده نمیشود. رانندهٔ این راند شخصیتِ
 * «قهرمان» را تزریق میکند (۳۰ واژه + نتایج + SRS سرآمد + واژه‌های خطرناک +
 * هفت روز تاریخچه) و در همان نخستین اجرا دو باگ واقعی بیرون کشید:
 * ۱) ردیفِ متای «واژه‌های خطرناک» چهار chipِ بدونِ wrap داشت که تا ۹px از
 *    کادر min-w-0 بیرون میزدند — نخستین suspectِ واقعیِ شکارِ basis-صفر
 *    در حالتِ پُر (r319 همین پنل را با known:{book:true} خالی دیده بود).
 * ۲) chipِ SRS «مستحکم‌شده» در دسکتاپ (نیمعرضِ lg:grid-cols-2) تا ۱۱px
 *    بیرون میزد — U+200C فرصتِ شکستِ سطر نمیسازد؛ موبایلِ تمامعرض سالم بود.
 * و یک یافتهٔ ابزاری: درخشِ متحرکِ badge-shine در یک ران over=203 میداد و در
 * رانِ بعد صفر — ناپایدارِ زمانی با امضای قطعی؛ کلاسِ مشروعِ ششم (sheen_bleed).
 */

const personaJs = readFileSync(join(process.cwd(), "scripts", "r322-persona.js"), "utf8");
const driverSh = readFileSync(join(process.cwd(), "scripts", "qa-r322-personas.sh"), "utf8");
const sweepJs = readFileSync(join(process.cwd(), "scripts", "r317-sweep.js"), "utf8");
const dangerTsx = readFileSync(join(process.cwd(), "src", "components", "study", "practice", "danger-words.tsx"), "utf8");
const srsTsx = readFileSync(join(process.cwd(), "src", "components", "study", "practice", "srs-panel.tsx"), "utf8");

// واکشیِ واژه‌های seed از متنِ اسکریپت (اسکریپت مستقل از import است — node خام)
const seedWords = (lesson: number): string[] => {
  const m = personaJs.match(new RegExp(`${lesson}:\\s*\\[([^\\]]+)\\]`));
  if (!m) throw new Error(`persona lesson-${lesson} word list not found`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};

describe("persona seed — keys must resolve to live vocabulary (stale-key guard)", () => {
  // word-risk واژهٔ stale را drop میکند؛ seed باید فقط کلیدِ زنده بدهد
  it.each([1, 2, 3])("every lesson-%i seeded word exists in the real lesson data", (lesson) => {
    const lessonWords = new Set(
      lessons.find((l) => l.id === lesson)!.vocabulary.map((w) => w.en.toLowerCase()),
    );
    for (const w of seedWords(lesson)) {
      expect(lessonWords.has(w.toLowerCase())).toBe(true);
    }
  });

  it("seed has enough known words to flip hasProgress on every surface", () => {
    // ۳۰ واژه: دونات با سه درسِ پر، دوناتِ کلِ کتاب درصدِ واقعی میگیرد
    const counts = [1, 2, 3].map((l) => seedWords(l).length);
    for (const c of counts) expect(c).toBeGreaterThanOrEqual(10);
  });

  it("danger words respect the word-risk threshold (seen>=2 or mistakes>=2)", () => {
    // word-risk.ts: اگر seen<2 && mistakes<2 باشد واژه برندِ «خطرناک» نمیگیرد
    const mistakesBlock = personaJs.match(/wordMistakes = \{([\s\S]*?)\};/)![1];
    const seenBlock = personaJs.match(/wordSeen = \{([\s\S]*?)\};/)![1];
    const mistakes = [...mistakesBlock.matchAll(/"([^"]+)":\s*(\d+)/g)];
    const seen = new Map([...seenBlock.matchAll(/"([^"]+)":\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
    expect(mistakes.length).toBeGreaterThanOrEqual(4); // فهرستِ خطرناکِ واقعیِ چندردیفی
    for (const [, key, count] of mistakes) {
      expect(Number(count)).toBeGreaterThanOrEqual(1);
      expect(seen.get(key) ?? 0).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("persona seed — store contracts (persist schema shape)", () => {
  it("result keys match resultKey format and every category maps to a skill", () => {
    const block = personaJs.match(/const results = \{([\s\S]*?)\};/)![1];
    // کلیدِ نقلقولی ("1:vocab") و بدونِ نقلقول (rush) هر دو — لیتِ JS
    const keys = [...block.matchAll(/"?([A-Za-z0-9:_-]+)"?:\s*\{/g)].map((m) => m[1]);
    expect(keys).toContain("1:vocab");
    expect(keys).toContain("rush"); // مهارتِ جهانی — بدونِ درس
    for (const k of keys) {
      const matched = SKILL_DEFS.some((def) => def.match(k));
      expect(matched).toBe(true);
    }
  });

  it("every QuizResult carries percent-consistent counters and an ISO date", () => {
    const block = personaJs.match(/const results = \{([\s\S]*?)\};/)![1];
    const entries = [...block.matchAll(/\{ correct: (\d+), total: (\d+), percent: (\d+), at: isoAt\((\d+)[,)]/g)];
    expect(entries.length).toBeGreaterThanOrEqual(8);
    for (const [, correct, total, percent] of entries) {
      expect(Math.round((Number(correct) / Number(total)) * 100)).toBeCloseTo(Number(percent), 0);
    }
  });

  it("history covers the full week with today included (chart + heatmap windows)", () => {
    const block = personaJs.match(/const week = \[([\s\S]*?)\];/)![1];
    const rows = [...block.matchAll(/\{ reviews:/g)];
    expect(rows.length).toBe(7);
    // دو نقطهٔ دورتر برای نقشهٔ حرارتیِ ۳۰روزه
    expect(personaJs).toContain("for (const ago of [14, 21, 28])");
    // dayKey از فرمولِ todayStr پیروی میکند: YYYY-MM-DD محلی
    expect(personaJs).toContain("padStart(2");
  });
});

describe("r322 fixes — the two real findings", () => {
  it("danger-words meta row wraps instead of bleeding past min-w-0", () => {
    // پیشتر: mt-1 flex items-center gap-2 — چهار chip تا ۹px بیرون میزد
    expect(dangerTsx).toContain("mt-1 flex flex-wrap items-center gap-x-2 gap-y-1");
    expect(dangerTsx).not.toContain('className="mt-1 flex items-center gap-2"');
    expect(dangerTsx).toContain("r322 — ردیفِ متایِ ردیف");
  });

  it("srs chips shrink with min-w-0 and swap to the short ZWNJ-bound label at lg", () => {
    expect(srsTsx).toContain("min-w-0 rounded-xl border border-white/60");
    expect(srsTsx).toContain('<span className="lg:hidden">{c.label}</span>');
    expect(srsTsx).toContain('<span className="hidden lg:inline">{c.short ?? c.label}</span>');
    expect(srsTsx).toContain('title={c.label}');
    // فقط برچسبِ نیمفاصلهدار فرمِ کوتاه میگیرد — بقیه در همهجا کامل میمانند
    expect(srsTsx).toContain('short: "مستحکم"');
    const shorts = [...srsTsx.matchAll(/short: "/g)].length;
    expect(shorts).toBe(1);
  });
});

describe("classifier class 6 — sheen_bleed (deterministic signature of a time-transient bleed)", () => {
  it("sheen_bleed joins the horizontal legitimate classes after deco_bleed", () => {
    expect(sweepJs).toContain('"sheen_bleed"');
    const order = sweepJs.indexOf('"deco_bleed"');
    const sheen = sweepJs.indexOf('"sheen_bleed"');
    expect(sheen).toBeGreaterThan(order); // آخرین حلقهٔ زنجیره — قبل از h_off
  });

  it("signature reads the ::after pseudo (querySelectorAll is blind to pseudo-elements)", () => {
    expect(sweepJs).toContain('getComputedStyle(el, "::after")');
    expect(sweepJs).toContain('ps.position === "absolute"');
    expect(sweepJs).toContain('ps.animationName !== "none"');
    // قفلِ والد: فقط کارتِ overflow:hidden — تزئینِ بریدهشده به عمد
    expect(sweepJs).toContain('cs.overflowX !== "hidden"');
  });

  it("sheen_bleed stays horizontal-only (translateX never inflates scrollHeight)", () => {
    // شاخهٔ عمودی بدونِ sheen — دو شاخهٔ sr_only الگویِ محور-محور است
    expect(sweepJs.split('"sheen_bleed"').length - 1).toBe(1);
  });
});

describe("driver qa-r322-personas.sh — persona mount probe and stage coverage", () => {
  it("seeds the champion persona and probes all five progress-gated panels", () => {
    expect(driverSh).toContain("r322-persona.js\" champion");
    // رشتههایِ eval در فایل escapeشده‌اند (\") — سنجاق بر همان متنِ واقعی
    for (const marker of [
      '[aria-label="فعالیت هفتگی"]', // WeeklyChart
      '[aria-label="پیشرفت واژگان"]', // VocabDonut
      '[aria-label="داشبورد مرور هوشمند"]', // SrsPanel
      '[aria-label="تحلیل مهارت‌ها"]', // SkillPanel
      "واژه‌های خطرناک", // DangerWords (text marker)
    ]) {
      expect(driverSh).toContain(marker.replaceAll('"', '\\"'));
    }
  });

  it("covers five stages across three phases (light data+month+dialog / dark / desktop)", () => {
    for (const stage of ["home-champion", "home-month", "danger-flashcards", "home-champion-dark", "home-champion-desktop"]) {
      expect(driverSh).toContain(stage);
    }
    expect(driverSh).toContain("۳۰ روزه"); // نمای ماهانه — نقشهٔ حرارتی با داده
    expect(driverSh).toContain("فلش‌کارت همین‌ها"); // دیالوگِ واقعیِ تمرینِ خطر
  });
});
