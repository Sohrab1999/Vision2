// Task 117 «معلمِ کارنامه» — pure contract of the session digest,
// the strict three-section parser and the honest fallback teacher.

import { describe, it, expect } from "vitest";
import {
  reviewFingerprint,
  normalizeAnswer,
  buildSessionDigest,
  parseReview,
  fallbackReview,
  WRONG_DETAIL_CAP,
  type TeacherQuestionLike,
} from "@/lib/exam-teacher";

const q = (id: string, answer: number, category = "vocab", options = ["a", "b", "c", "d"]): TeacherQuestionLike => ({
  id,
  category,
  question: `Q-${id}`,
  options,
  answer,
});

describe("reviewFingerprint", () => {
  it("is order-insensitive but answer-sensitive", () => {
    const a = [
      { id: "1:x", ans: 0 },
      { id: "1:y", ans: 2 },
    ];
    const b = [
      { id: "1:y", ans: 2 },
      { id: "1:x", ans: 0 },
    ];
    expect(reviewFingerprint(a)).toBe(reviewFingerprint(b));
    expect(reviewFingerprint(a)).not.toBe(reviewFingerprint([{ id: "1:x", ans: 0 }, { id: "1:y", ans: 1 }]));
  });

  it("distinguishes unanswered (null) from a real index", () => {
    const answered = reviewFingerprint([{ id: "1:x", ans: 0 }]);
    const blank = reviewFingerprint([{ id: "1:x", ans: null }]);
    expect(answered).not.toBe(blank);
    expect(blank).toContain("-");
  });
});

describe("normalizeAnswer", () => {
  it("keeps valid indices and degrades junk to unanswered", () => {
    const four = q("1:x", 0);
    expect(normalizeAnswer(2, four)).toBe(2);
    expect(normalizeAnswer(null, four)).toBeNull();
    expect(normalizeAnswer(9, four)).toBeNull(); // out of range
    // r403 WIDENED — -1 is the typed-wrong sentinel (lib/typed-answer.ts):
    // the learner DID answer, so it survives as its own state instead of
    // being read as «بی‌پاسخ»; other negatives still degrade to null
    expect(normalizeAnswer(-1, four)).toBe(-1);
    expect(normalizeAnswer(-2, four)).toBeNull();
    expect(normalizeAnswer(1.5, four)).toBeNull();
  });
});

describe("buildSessionDigest", () => {
  it("computes correctness from the bundled key, not client claims", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0), ans: 0 },
      { q: q("1:b", 2), ans: 1 },
      { q: q("1:c", 3), ans: null },
    ]);
    expect(d.total).toBe(3);
    expect(d.correct).toBe(1);
    expect(d.wrong).toBe(2);
    expect(d.answered).toBe(2);
    expect(d.unanswered).toBe(1);
    expect(d.percent).toBe(33);
  });

  it("aggregates per category in first-seen order", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0, "grammar"), ans: 0 },
      { q: q("1:b", 2, "grammar"), ans: 0 },
      { q: q("1:c", 3, "vocab"), ans: 3 },
    ]);
    expect(d.perCategory).toEqual([
      { category: "grammar", total: 2, correct: 1 },
      { category: "vocab", total: 1, correct: 1 },
    ]);
  });

  it("caps the wrong-question detail and counts the rest", () => {
    const many = Array.from({ length: WRONG_DETAIL_CAP + 3 }, (_, i) => ({
      q: q(`1:w${i}`, 0),
      ans: 1,
    }));
    const d = buildSessionDigest(many);
    expect(d.wrongDetail).toHaveLength(WRONG_DETAIL_CAP);
    expect(d.wrongExtra).toBe(3);
  });

  it("truncates long question text with the ellipsis", () => {
    const long: TeacherQuestionLike = {
      id: "1:long",
      category: "vocab",
      question: "x".repeat(200),
      options: ["a", "b"],
      answer: 1,
    };
    const d = buildSessionDigest([{ q: long, ans: 0 }]);
    expect(d.wrongDetail[0].text.length).toBeLessThanOrEqual(91);
    expect(d.wrongDetail[0].text.endsWith("…")).toBe(true);
  });

  it("carries the chosen option text (or null for the unanswered)", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0), ans: 1 },
      { q: q("1:b", 0), ans: null },
    ]);
    expect(d.wrongDetail[0].chosen).toBe("b");
    expect(d.wrongDetail[1].chosen).toBeNull();
    expect(d.wrongDetail.every((w) => w.correct === "a")).toBe(true);
  });
});

const GOOD_REVIEW =
  "در این جلسه ۸ از ۱۰ سؤال درست بود و روندت رو به بهبود است.\n" +
  "نقطهٔ قوت: در «واژگان» بهترین عملکرد را داشتی — ۵ پاسخ درست از ۶.\n" +
  "تمرینِ پیشنهادی: فلش‌کارت‌های درس اول را مرور کن و به دو سؤالِ بی‌پاسخ برگرد.";

describe("parseReview", () => {
  it("parses the documented three-section format", () => {
    const r = parseReview(GOOD_REVIEW);
    expect(r).not.toBeNull();
    expect(r!.intro).toContain("۸ از ۱۰");
    expect(r!.strength).toContain("واژگان");
    expect(r!.advice).toContain("فلش‌کارت");
  });

  it("accepts ZWNJ and plain-space marker variants", () => {
    const zwnj = "خوب بودی.\nنقطه\u200cقوت: تمرکزت عالی بود.\nتمرین\u200cپیشنهادی: فردا مرور کن.";
    expect(parseReview(zwnj)).toMatchObject({ intro: "خوب بودی.", strength: "تمرکزت عالی بود." });
    const plain = "خوب بودی.\nنقطه قوت: دقیقی.\nتمرین پیشنهادی: ادامه بده.";
    expect(parseReview(plain)).toMatchObject({ strength: "دقیقی.", advice: "ادامه بده." });
  });

  it("strips markdown noise around the sections", () => {
    const md = "**جلسهٔ خوبی بود.**\nنقطهٔ قوت: #پایداری\nتمرینِ پیشنهادی: _مرورِ روزانه_.";
    const r = parseReview(md);
    expect(r!.intro).toBe("جلسهٔ خوبی بود.");
    expect(r!.strength).toBe("پایداری");
    expect(r!.advice).toBe("مرورِ روزانه.");
  });

  it("returns null for missing, reordered or empty sections", () => {
    expect(parseReview("فقط یک جملهٔ بی‌ساختار")).toBeNull();
    expect(parseReview("مقدمه\nنقطهٔ قوت: خوب\n")).toBeNull(); // advice missing
    expect(parseReview("مقدمه\nتمرینِ پیشنهادی: اول\nنقطهٔ قوت: بعد")).toBeNull(); // wrong order
    expect(parseReview("مقدمه\nنقطهٔ قوت: \nتمرینِ پیشنهادی: چیزی")).toBeNull(); // empty section
  });
});

describe("fallbackReview", () => {
  it("celebrates a perfect session honestly", () => {
    const d = buildSessionDigest(
      Array.from({ length: 4 }, (_, i) => ({ q: q(`1:p${i}`, 1), ans: 1 }))
    );
    const r = fallbackReview(d);
    expect(r.intro).toContain("بی‌لک");
    expect(r.intro).toContain("۴");
    expect(r.strength).toContain("تسلط کامل");
    expect(r.advice).toContain("واژه‌های من");
  });

  it("tells the mixed truth with the real best/worst skill", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0, "grammar"), ans: 0 },
      { q: q("1:b", 0, "grammar"), ans: 0 },
      { q: q("1:c", 0, "grammar"), ans: 1 },
      { q: q("1:d", 0, "vocab"), ans: 1 },
      { q: q("1:e", 0, "vocab"), ans: 1 },
    ]);
    const r = fallbackReview(d);
    expect(r.intro).toContain("۲ از ۵");
    expect(r.intro).toContain("۴۰");
    expect(r.strength).toContain("گرامر");
    expect(r.advice).toContain("واژگان");
  });

  it("never hides the unanswered", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0), ans: 0 },
      { q: q("1:b", 0), ans: null },
      { q: q("1:c", 0), ans: null },
    ]);
    const r = fallbackReview(d);
    expect(r.intro).toContain("۲ سؤال بی‌پاسخ ماند");
  });

  it("stays honest when nothing was correct", () => {
    const d = buildSessionDigest([
      { q: q("1:a", 0), ans: 1 },
      { q: q("1:b", 0), ans: 2 },
    ]);
    const r = fallbackReview(d);
    expect(r.intro).toContain("۰ از ۲");
    expect(r.strength).not.toContain("«");
  });

  it("is deterministic for the same stats regardless of row order (pure)", () => {
    const rows = [
      { q: q("1:a", 0, "grammar"), ans: 0 },
      { q: q("1:b", 0, "vocab"), ans: 1 },
    ];
    const r1 = fallbackReview(buildSessionDigest(rows));
    const r2 = fallbackReview(buildSessionDigest([...rows].reverse()));
    expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
  });
});
