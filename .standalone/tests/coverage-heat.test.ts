// تسک ۱۷۵ «گریدِ حرارتیِ پوشش» — خالص: طبقه‌بندِ نوار، جدولِ یخ‌زده،
// سیم‌کشیِ دوسویهٔ برچسبِ کوتاه، و خلاصهٔ ماتریس. الگویِ quick-week (۱۱۳):
// مرزها هم از HEAT_BANDS خودش خوانده می‌شوند هم با عددِ صریح قفل‌اند.

import { describe, it, expect } from "vitest";
import {
  HEAT_BANDS,
  HEAT_COLD,
  COVERAGE_SKILL_SHORT,
  classifyHeat,
  heatSummary,
  type HeatSummary,
} from "@/lib/coverage-heat";
import { COVERAGE_SKILLS, type CoverageLesson } from "@/lib/coverage-map";

function cell(best: number | null) {
  return { key: "vocab", label: "تست واژگان", best, at: best !== null ? "2026-10-14" : null };
}
function lesson(best: number | null, n = 6): CoverageLesson {
  const cells = Array.from({ length: n }, (_, i) => ({ ...cell(best), key: `k${i}` }));
  return {
    id: 1,
    title: "درس",
    color: "emerald",
    known: 0,
    wordTotal: 10,
    wordPct: 0,
    cells,
    gap: null,
    covered: best !== null,
  };
}

describe("classifyHeat — مرزهایِ نوار", () => {
  it("مرزهایِ صریح: ۰/۴۹ نوپا، ۵۰/۷۴ درِ حالِ رشد، ۷۵/۸۹ خوب، ۹۰/۱۰۰ عالی", () => {
    expect(classifyHeat(0)).toBe("faint");
    expect(classifyHeat(49)).toBe("faint");
    expect(classifyHeat(50)).toBe("warming");
    expect(classifyHeat(74)).toBe("warming");
    expect(classifyHeat(75)).toBe("strong");
    expect(classifyHeat(89)).toBe("strong");
    expect(classifyHeat(90)).toBe("elite");
    expect(classifyHeat(100)).toBe("elite");
  });

  it("مرزها از HEAT_BANDS خودش هم درست‌اند (تک‌قرارداد) — هر نوار از min خودش و زیرِ minِ قبلی", () => {
    for (let i = 0; i < HEAT_BANDS.length; i++) {
      expect(classifyHeat(HEAT_BANDS[i].min)).toBe(HEAT_BANDS[i].id);
      if (i > 0) expect(classifyHeat(HEAT_BANDS[i].min - 1)).toBe(HEAT_BANDS[i - 1].id);
    }
  });

  it("سردِ صادقانه: تهی/undefined/NaN/Infinity → cold، هرگز صفرِ ساختگی", () => {
    expect(classifyHeat(null)).toBe("cold");
    expect(classifyHeat(undefined)).toBe("cold");
    expect(classifyHeat(Number.NaN)).toBe("cold");
    expect(classifyHeat(Number.POSITIVE_INFINITY)).toBe("cold");
    expect(classifyHeat(Number.NEGATIVE_INFINITY)).toBe("cold");
    expect(HEAT_COLD.id).toBe("cold");
  });

  it("بیرونِ ۰..۱۰۰ گیرِ کران: −۵ → نوپا، ۱۲۰ → عالی", () => {
    expect(classifyHeat(-5)).toBe("faint");
    expect(classifyHeat(120)).toBe("elite");
  });
});

describe("HEAT_BANDS و COVERAGE_SKILL_SHORT — ساختارِ یخ‌زده", () => {
  it("جدولِ نوارها صعودیِ اکید رویِ min و منجمد است", () => {
    expect(Object.isFrozen(HEAT_BANDS)).toBe(true);
    for (let i = 1; i < HEAT_BANDS.length; i++) {
      expect(HEAT_BANDS[i].min).toBeGreaterThan(HEAT_BANDS[i - 1].min);
    }
  });

  it("سیم‌کشیِ دوسویه: هر کلیدِ COVERAGE_SKILLS برچسبِ کوتاه دارد و برعکس", () => {
    for (const sk of COVERAGE_SKILLS) {
      expect(typeof COVERAGE_SKILL_SHORT[sk.key]).toBe("string");
      expect(COVERAGE_SKILL_SHORT[sk.key].length).toBeGreaterThan(0);
    }
    const skillKeys = COVERAGE_SKILLS.map((s) => s.key);
    for (const k of Object.keys(COVERAGE_SKILL_SHORT)) {
      expect(skillKeys).toContain(k);
    }
    expect(Object.keys(COVERAGE_SKILL_SHORT).length).toBe(COVERAGE_SKILLS.length);
  });

  it("r316 — بودجهٔ ۳۴pxِ سرستونِ موبایل: هر شش مقدار قفلِ دقیق است (واحدِ بودجه پیکسل است نه نویسه)", () => {
    // سنجشِ qa-r316-overflow-sweep: خانهٔ سرستون در ۳۹۰ با کپِ عنوانِ ۶۴px = ۳۴px؛
    // پهنایِ سنجیدهشده در ۹.۵pxِ font-black: واژگان ۳۲ ✓ · دیکته ۲۶ ✓ ·
    // شنیداری ۴۰ ✗ → شنوا · نگارش ۳۱ ✓ · کنکوری ۳۵ ✗ → کنکور · گرامر ۲۶ ✓
    // (نکتهٔ بودجه: شمارشِ نویسه گمراه‌کننده است — واژگان ۶ نویسه ولی ۳۲px
    // جا میشود، کنکوری ۶ نویسه و ۳۵px بیرون میزند؛ واحدِ درست پیکسل است و
    // تغییرِ هر برچسبی باید با سنجشِ دوباره همراه شود)
    expect(COVERAGE_SKILL_SHORT).toEqual({
      vocab: "واژگان",
      dictation: "دیکته",
      listening: "شنوا",
      writing: "نگارش",
      "vocab-konkuri": "کنکور",
      grammar: "گرامر",
    });
  });
});

describe("heatSummary — خلاصهٔ ماتریس", () => {
  it("بدونِ درس: صفرِ صادق و میانگینِ null", () => {
    const s = heatSummary([]);
    expect(s).toEqual<HeatSummary>({ totalCells: 0, attemptedCells: 0, avgBest: null });
  });

  it("همه‌سلولِ سرد: total حساب می‌شود، attempted صفر، میانگینِ null", () => {
    const s = heatSummary([lesson(null), lesson(null)]);
    expect(s.totalCells).toBe(12);
    expect(s.attemptedCells).toBe(0);
    expect(s.avgBest).toBeNull();
  });

  it("مخلوط: میانگینِ گردِ شده فقط رویِ تلاش‌شده‌ها (۸۵+۹۵)/۲=۹۰", () => {
    const a = lesson(85);
    const b = lesson(95);
    const s = heatSummary([a, b]);
    expect(s.totalCells).toBe(12);
    expect(s.attemptedCells).toBe(12);
    expect(s.avgBest).toBe(90);
  });

  it("گردِ بانکیِ ساده: ۸۴ و ۸۵ → ۸۵ (میانگینِ ۸۴٫۵)", () => {
    const s = heatSummary([lesson(84, 1), lesson(85, 1)]);
    expect(s.avgBest).toBe(85);
  });

  it("خلوص: ورودی را جهش نمی‌دهد (DeepFreeze)", () => {
    const L = lesson(70);
    Object.freeze(L);
    L.cells.forEach((c) => Object.freeze(c));
    expect(() => heatSummary([L])).not.toThrow();
    expect(L.cells[0].best).toBe(70);
  });
});
