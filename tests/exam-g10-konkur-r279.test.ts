// r279 — گارد بانک‌های کنکوری دهم با کلید گرید چاپی (۱۰۰ گرامر + ۳۶۰ واژگان)
// منبع: جزوهٔ جامع دهم — سؤال‌ها ص۱۷۲-۱۷۶ (گرامر) و ص۱۷۸-۱۹۴ (واژگان)؛
// کلیدها: گرید چاپی «پاسخنامه تستهای گرامر درس یک تا چهار» + «پاسخنامه کلیدی ۳۶۰تست واژگان»
// در c20/sec54 خودِ g10.json. پارسر: scripts/extract-g10-konkur-r279.py
// رسید: booklet-extract/g10-konkur-r279.json (شامل خطاهای چاپی و بازچینی‌ها)

import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { examBankG10 } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";

const R279_START = 405; // g10-405..g10-862
const base = examBankG10.slice(R279_START - 1);
const receipt = JSON.parse(
  readFileSync("booklet-extract/g10-konkur-r279.json", "utf-8"),
) as { meta: Record<string, unknown>; bank: Array<Record<string, unknown>> };

const byNum = (bankNo: number) => base[bankNo - R279_START];
const find = (needle: string): QuizQuestion => {
  const hit = base.find((q) => q.question.includes(needle));
  expect(hit, `question containing «${needle}»`).toBeDefined();
  return hit!;
};

describe("g10 konkur banks r279 (printed grid keys)", () => {
  it("bank grew exactly by the receipt count, ids continuous g10-405..g10-862", () => {
    expect(examBankG10.length).toBe(862);
    expect(base.length).toBe(receipt.meta && (receipt.meta as { stats: { kept: number } }).stats.kept);
    base.forEach((q, i) => expect(q.id).toBe(`g10-${R279_START + i}`));
    // دو ساقهٔ تکراری حذف شدند: گرامر Q96 و واژگان Q58 → گرامر ۹۹تا اولِ رده
    const grammars = base.filter((q) => q.category === "grammar");
    expect(grammars.length).toBe(99);
    expect(grammars.map((q) => q.id)).toEqual(
      Array.from({ length: 99 }, (_, i) => `g10-${R279_START + i}`),
    );
    expect(base.length - 99).toBe(359); // واژگان
  });

  it("grid fidelity: first/last rows of both printed grids are locked", () => {
    // گرید گرامر (سطر اول: «1 b 11 d 21 b …» / سطر آخر: «… 100 b»)
    expect(find("He -------------------- in the garden, but I’m not sure").answer).toBe(1); // 1 b → may be
    expect(find("they increase the number of the houses next year").answer).toBe(2); // 2 c → Will
    expect(find("it wasn’t surprising that he -------------------- very tired").answer).toBe(1); // 100 b → looked
    // گرید واژگان (سطر اول: «1 a 41 c 81 a …» / سطر آخر: «… 360 d»)
    expect(find("so we went to the park").answer).toBe(0); // 1 a → instead
    expect(find("when they stop smoking").answer).toBe(3); // 2 d → gain
    // سطر آخرِ گرید واژگان: «… 359 b 360 d»
    expect(find("Hamadan has many interesting historical").answer).toBe(3); // 360 d → sites
    expect(find("A -------------------- is one of the seven areas of land").answer).toBe(3); // 113 d → continent
  });

  it("semantic locks: answers are the semantically valid options", () => {
    expect(find("He -------------------- in the garden").options[1]).toBe("may be");
    expect(find("they increase the number of the houses").options[2]).toBe("Will");
    expect(find("so we went to the park").options[0]).toBe("instead");
    expect(find("when they stop smoking").options[3]).toBe("gain");
    // گزینهٔ سوم «find» — کلید گرید a
    expect(find("I became very nervous when I couldn’t").answer).toBe(0);
    // خطای چاپی Q174 (گزینهٔ چهارم تکراری «suitably») — کلید c=honestly سالم است
    const q174 = find("Tell me --------------------, Kate");
    expect(q174.options[2]).toBe("honestly");
    expect(q174.answer).toBe(2);
    // بازچینیِ معناییِ رسیددار Q236: گرید «a/rapidly» ناممکن بود؛ c=slowly
    const q236 = find("The opposite of “quickly”");
    expect(q236.options[2]).toBe("slowly");
    expect(q236.answer).toBe(2);
  });

  it("quote typography repairs are locked (zero word changes)", () => {
    expect(find("Can you finish painting all the rooms today").question).toBe(
      "A: “Can you finish painting all the rooms today?” B: “Sorry. -------------------- not.”",
    );
    expect(find("Are you going to play tennis next Friday").question).toBe(
      "A: “Are you going to play tennis next Friday?” B: “I can’t. I -------------------- my mother in hospital.”",
    );
    // هیچ کوتیشنِ ASCII در هیچ ساقهٔ جدیدی نمانده باشد
    for (const q of base) expect(q.question.includes('"'), q.id).toBe(false);
  });

  it("honest absence of translations (printed grid carries none)", () => {
    for (const q of base) expect(q.translation, q.id).toBeUndefined();
  });

  it("4-option integrity + errata duplicate allowed only for the receipted Q174", () => {
    for (const q of base) {
      expect(q.options.length, q.id).toBe(4);
      expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
    }
    const dupped = base.filter((q) => new Set(q.options).size !== 4);
    expect(dupped.length).toBe(1); // فقط vocab-360/Q174 — رسیدِ errata
    expect(dupped[0].question).toContain("Kate");
    expect(dupped[0].options[3]).toBe("suitably"); // عینِ چاپ خود جزوه
  });

  it("receipt file carries the full provenance chain", () => {
    const meta = receipt.meta as {
      stats: { grammar: number; vocab: number; parsed: number; kept: number; r213_agree: number; r213_disagree: number };
      errata: Array<{ ref: string }>;
      answerRepairs: Array<{ ref: string; from: number; to: number }>;
      quoteRepairs: Array<{ ref: string }>;
    };
    expect(meta.stats.parsed).toBe(460);
    expect(meta.stats.kept).toBe(458);
    expect(meta.stats.grammar).toBe(100);
    expect(meta.stats.vocab).toBe(360);
    expect(meta.stats.r213_agree).toBe(288);
    expect(meta.stats.r213_disagree).toBe(3);
    expect(meta.errata.map((e) => e.ref)).toContain("vocab-360/Q174");
    expect(meta.answerRepairs[0]).toMatchObject({ ref: "vocab-360/Q236", from: 0, to: 2 });
    expect(meta.quoteRepairs.map((e) => e.ref)).toEqual(["grammar-100/Q32", "vocab-360/Q78"]);
  });
});
