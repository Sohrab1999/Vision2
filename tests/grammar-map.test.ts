// متروی گرامر — تست قراردادهای خالص پیشرفت (Task 39)
import { describe, it, expect } from "vitest";
import { lessons } from "@/data";
import { GRAMMAR_LINES, type GrammarLineColor } from "@/data/grammar-map";
import { GRAMMAR_MICRO_LESSONS } from "@/data/grammar-lessons";
import { LINE_COLORS } from "@/lib/grammar-theme";
import {
  GRAMMAR_GREEN,
  STATION_QUIZ_MIN,
  PROBE_LENGTH,
  stationKey,
  probeKey,
  bestPercent,
  stationStatus,
  lineStats,
  mapSummary,
  lessonGrammarPool,
  stationQuestions,
  lineProbe,
  lineProbePool,
  probeRecommendation,
  seededPicks,
  type PercentMap,
} from "@/lib/grammar-progress";

const R = (percent: number) => ({ percent });
const station = (lineId: number, idx: number) =>
  GRAMMAR_LINES.find((l) => l.id === lineId)!.stations[idx];
const line = (id: number) => GRAMMAR_LINES.find((l) => l.id === id)!;

describe("متروی گرامر — کلیدها", () => {
  it("کلید ایستگاه و کلید آزمون شناخت قالب ثابت دارند", () => {
    expect(stationKey("g-order")).toBe("g:g-order");
    expect(probeKey(3)).toBe("g:probe:l3");
  });

  it("bestPercent برای کلید غایب null و برای موجود عدد است", () => {
    const results: PercentMap = { "g:g-order": R(60) };
    expect(bestPercent(results, "g:g-order")).toBe(60);
    expect(bestPercent(results, "g:missing")).toBeNull();
    expect(bestPercent({}, "g:any")).toBeNull();
  });
});

describe("متروی گرامر — قفل و رنگ ایستگاه", () => {
  it("ایستگاه اول هر خط بدون هیچ نتیجه‌ای باز است", () => {
    expect(stationStatus(line(2), 0, {})).toBe("open");
    expect(stationStatus(line(6), 0, {})).toBe("open");
  });

  it("سبز شدن در آستانهٔ ۸۰٪ رخ می‌دهد — مرز ۷۹/۸۰ دقیق است", () => {
    const id = stationKey("g-count");
    expect(stationStatus(line(2), 0, { [id]: R(79) })).toBe("open");
    expect(stationStatus(line(2), 0, { [id]: R(80) })).toBe("green");
  });

  it("ایستگاه دوم تا قبلی سبز نشود قفل است؛ با سبز شدن قبلی باز می‌شود", () => {
    const line2 = line(2);
    expect(stationStatus(line2, 1, { [stationKey("g-count")]: R(79) })).toBe("locked");
    expect(stationStatus(line2, 1, { [stationKey("g-count")]: R(80) })).toBe("open");
    expect(stationStatus(line2, 1, {})).toBe("locked");
  });

  it("زنجیرهٔ سه‌ایستگاهی: سبز شدن دومی سومی را باز می‌کند نه چهارمی را", () => {
    const line2 = line(2);
    const results: PercentMap = {
      [stationKey("g-count")]: R(90),
      [stationKey("g-uncount")]: R(85),
    };
    expect(stationStatus(line2, 2, results)).toBe("open");
    expect(stationStatus(line2, 3, results)).toBe("locked");
  });

  it("نتیجهٔ پایین‌تر از آستانهٔ قبلی، وضعیت بعدی را قفل نگه می‌دارد (تسلط یعنی ماندگاریِ نمره)", () => {
    const line2 = line(2);
    const results: PercentMap = {
      [stationKey("g-count")]: R(80),
      [stationKey("g-uncount")]: R(50),
    };
    expect(stationStatus(line2, 1, results)).toBe("open");
    expect(stationStatus(line2, 2, results)).toBe("locked");
  });
});

describe("متروی گرامر — جمع‌های پیشرفت", () => {
  it("lineStats فقط سبزهای ≥ آستانه را می‌شمارد", () => {
    const line2 = line(2);
    const results: PercentMap = {
      [stationKey("g-count")]: R(100),
      [stationKey("g-uncount")]: R(79),
    };
    expect(lineStats(line2, results)).toEqual({ green: 1, total: 5, percent: 20 });
  });

  it("mapSummary روی همهٔ خط‌ها جمع می‌زند و در نقشهٔ خالی صفر می‌ماند", () => {
    expect(mapSummary({})).toEqual({ green: 0, total: 43, percent: 0 });
    const results: PercentMap = {
      [stationKey("g-order")]: R(90),
      [stationKey("g-present-perfect")]: R(80),
      [stationKey("g-count")]: R(10),
    };
    expect(mapSummary(results)).toEqual({ green: 2, total: 43, percent: 5 });
  });
});

describe("متروی گرامر — سؤال‌های ایستگاه و آزمون شناخت", () => {
  it("سؤال‌های ترجیحی به همان ترتیبِ تعریف می‌آیند", () => {
    const qs = stationQuestions(station(1, 0));
    expect(qs.map((q) => q.id)).toEqual(["l1-g14", "l1-g15", "l1-g16", "l1-g17", "l1-g18"]);
  });

  it("ایستگاه کم‌سؤال تا حداقل مجاز از استخر درس پر می‌شود و بدون تکرار می‌ماند", () => {
    const qs = stationQuestions(station(6, 0)); // پیشوندها — بدون سؤال اختصاصی
    expect(qs.length).toBeGreaterThanOrEqual(STATION_QUIZ_MIN);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
    expect(qs.every((q) => q.category === "grammar")).toBe(true);
  });

  it("ایستگاه پرِسؤال از حداقل بزرگ‌تر می‌شود و ترتیبش نمی‌شکند", () => {
    const qs = stationQuestions(station(5, 0)); // شرطی نوع اول — ۹ سؤال ترجیحی
    expect(qs.length).toBe(9);
    expect(qs[0].id).toBe("l3-g1");
  });

  it("آزمون شناخت خط ≤ ۵ سؤال یکتا از درس‌های همان خط است و با کلید روز قطعی است", () => {
    const l5 = line(5);
    const pool = lineProbePool(l5);
    expect(pool.every((q) => q.id.startsWith("l3-"))).toBe(true);
    const a = lineProbe(l5, "2026-10-11");
    const b = lineProbe(l5, "2026-10-11");
    const c = lineProbe(l5, "2026-10-12");
    expect(a.length).toBeLessThanOrEqual(PROBE_LENGTH);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(new Set(a.map((q) => q.id)).size).toBe(a.length);
    // کلید روز دیگر → نمونهٔ متفاوت (استخر ۱۵تایی، انتخاب ۵تایی)
    expect(a.map((q) => q.id).join()).not.toBe(c.map((q) => q.id).join());
  });

  it("seededPicks روی آرایهٔ کوتاه کپی همان آرایه است", () => {
    expect(seededPicks([1, 2], 5, "x")).toEqual([1, 2]);
  });
});

describe("متروی گرامر — پیشنهاد بعد از آزمون شناخت", () => {
  it("سه شاخهٔ پیام: مسیر باز / پایهٔ خوب / شروع از اول", () => {
    const l5 = line(5);
    expect(probeRecommendation(l5, 100, {})).toContain("مسیر باز");
    expect(probeRecommendation(l5, 60, {})).toContain("پایه‌ات خوب است");
    expect(probeRecommendation(l5, 20, {})).toContain("از ایستگاه اول");
    expect(probeRecommendation(l5, 80, {})).toContain("مسیر باز");
  });

  it("خطِ کامل سبز پیام گواهی می‌دهد", () => {
    const l3 = line(3);
    const results: PercentMap = { [stationKey("g-present-perfect")]: R(92) };
    expect(probeRecommendation(l3, 100, results)).toContain("گواهی");
  });
});

describe("متروی گرامر — درستیِ دادهٔ ایستگاه‌ها", () => {
  it("همهٔ ایستگاه‌ها id یکتا و سکشنِ در محدودهٔ کتاب دارند", () => {
    const ids = new Set<string>();
    for (const l of GRAMMAR_LINES) {
      for (const s of l.stations) {
        expect(ids.has(s.id)).toBe(false);
        ids.add(s.id);
        const grammar = lessons[s.lesson - 1].grammar;
        expect(s.section).toBeGreaterThanOrEqual(0);
        expect(s.section).toBeLessThan(grammar.length);
      }
    }
    expect(ids.size).toBe(43);
  });

  it("هر quizIds ارجاع‌شده در بانک همان درس واقعاً وجود دارد", () => {
    for (const l of GRAMMAR_LINES) {
      for (const s of l.stations) {
        const pool = new Set(lessonGrammarPool(s.lesson).map((q) => q.id));
        for (const id of s.quizIds) expect(pool.has(id)).toBe(true);
      }
    }
  });

  it("آستانهٔ تسلط ۸۰ است و آزمون شناخت ۵ سؤالی", () => {
    expect(GRAMMAR_GREEN).toBe(80);
    expect(PROBE_LENGTH).toBe(5);
  });
});

describe("متروی گرامر — خط‌های شش‌پایه (راندهای ۱۹۶/۱۹۸)", () => {
  it("نقشه ۱۴ خط و ۴۳ ایستگاه دارد و هر ۱۲ درسِ قفسه ایستگاه دارند", () => {
    expect(GRAMMAR_LINES).toHaveLength(14);
    const byLesson = [
      ...new Set(GRAMMAR_LINES.flatMap((l) => l.stations.map((s) => s.lesson))),
    ].sort((a, b) => a - b);
    expect(byLesson).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("خط مجهول هفت‌ایستگاهی است: چهار ایستگاه درس ۴ و سه ایستگاه درس ۵", () => {
    const l7 = line(7);
    expect(l7.fa).toBe("خط مجهول");
    expect(l7.color).toBe("sky");
    expect(l7.stations.map((s) => s.lesson)).toEqual([4, 4, 4, 4, 5, 5, 5]);
    expect(l7.stations.map((s) => s.section)).toEqual([0, 1, 2, 3, 0, 1, 2]);
  });

  it("خط‌های نقل قول، حال/ربط، گذشته/مقایسه و آینده تک‌درسه و سه‌ایستگاهی‌اند", () => {
    expect(line(8).color).toBe("fuchsia");
    expect(line(8).stations.map((s) => s.lesson)).toEqual([6, 6, 6]);
    expect(line(9).color).toBe("lime");
    expect(line(9).stations.map((s) => s.lesson)).toEqual([7, 7, 7]);
    expect(line(10).color).toBe("indigo");
    expect(line(10).stations.map((s) => s.lesson)).toEqual([8, 8, 8]);
    expect(line(11).color).toBe("cyan");
    expect(line(11).stations.map((s) => s.lesson)).toEqual([9, 9, 9]);
  });

  it("خط‌های متوسطهٔ اول تک‌درسه و سه‌ایستگاهی‌اند (راند ۱۹۸)", () => {
    const l12 = line(12);
    expect(l12.fa).toBe("خط معرفی و اشاره");
    expect(l12.color).toBe("pink");
    expect(l12.stations.map((s) => s.lesson)).toEqual([10, 10, 10]);
    expect(l12.stations.map((s) => s.section)).toEqual([0, 1, 2]);
    expect(l12.stations.map((s) => s.id)).toEqual(["g-be-intro", "g-demonstratives", "g-possessive-jobs"]);
    expect(line(13).color).toBe("blue");
    expect(line(13).stations.map((s) => s.lesson)).toEqual([11, 11, 11]);
    expect(line(13).stations.map((s) => s.id)).toEqual(["g-nationalities", "g-can-ability", "g-there-advice"]);
    expect(line(14).color).toBe("purple");
    expect(line(14).stations.map((s) => s.lesson)).toEqual([12, 12, 12]);
    expect(line(14).stations.map((s) => s.id)).toEqual(["g-personality-adj", "g-present-progressive", "g-past-narrative"]);
  });

  it("هر رنگِ مصرفی خط، پالتِ کاملِ LINE_COLORS دارد (بدون حفره)", () => {
    for (const l of GRAMMAR_LINES) {
      const c = LINE_COLORS[l.color as GrammarLineColor];
      expect(c, l.fa).toBeDefined();
      expect(c.solid).toContain("bg-");
      expect(c.border).toContain("border-");
    }
  });

  it("ایستگاه اول هر خط تازه باز و دومش قفل است (همان قرارداد زنجیره)", () => {
    for (const id of [7, 8, 9, 10, 11, 12, 13, 14]) {
      expect(stationStatus(line(id), 0, {})).toBe("open");
      expect(stationStatus(line(id), 1, {})).toBe("locked");
    }
  });

  it("آزمون شناخت خط مجهول فقط از بانک درس‌های ۴ و ۵ می‌آید", () => {
    const pool = lineProbePool(line(7));
    expect(pool.length).toBeGreaterThanOrEqual(PROBE_LENGTH);
    expect(
      pool.every((q) => q.id.startsWith("l4-") || q.id.startsWith("l5-"))
    ).toBe(true);
  });

  it("درس‌های ۹۰ثانیه‌ای هر ۴۳ ایستگاه را با ترتیبِ نقشه پوشش می‌دهند", () => {
    const stationIds = GRAMMAR_LINES.flatMap((l) => l.stations.map((s) => s.id));
    expect(GRAMMAR_MICRO_LESSONS.map((l) => l.stationId)).toEqual(stationIds);
  });
});
