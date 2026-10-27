// r403 — پیمان‌هایِ گسترشِ بانکِ معلم/توضیح + سنتینلِ تایپیِ -1
//
// سه باگِ واقعیِ همین راند:
//  ۱) /api/explain و /api/exam-review فقط ۴۹۰ سؤالِ درس‌ها/آزمونِ جامع را
//     می‌شناختند — هر سشنِ جزوه‌ای (g7-g12) با ۴۰۴/«بیرون از بانک» رد می‌شد.
//  ۲) سنتینلِ «پاسخِ تایپیِ نادرستِ بی‌گزینه» (-1) در reviewSchema با min(0)
//     ۴۰۰ می‌شد — «نظرِ معلم» برای سشنِ تایپیِ دارایِ خطا می‌شکست.
//  ۳) حروفِ گزینه تا g بود؛ خانوادهٔ ۹گزینه‌ایِ «بانک واژه» «undefined» چاپ می‌کرد.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildExplainPrompt,
  findQuestion,
  optionLetter,
} from "@/lib/explain-source";
import { findQuestionAny, wideQuestionIndex } from "@/lib/teacher-bank.server";
import { JOZVE_BANK_FILES, loadJozveQuestions } from "@/lib/jozve-bank";
import {
  buildSessionDigest,
  fallbackReview,
  normalizeAnswer,
  reviewFingerprint,
  type TeacherQuestionLike,
} from "@/lib/exam-teacher";
import { reviewSchema } from "@/lib/api/validate";
import { letters } from "@/components/study/quiz/quiz-constants";

const jozve = () => loadJozveQuestions();

/** live recount straight from the public JSON files (same source of truth) */
function recountJozveFromFiles(): number {
  let n = 0;
  for (const f of JOZVE_BANK_FILES) {
    const parsed = JSON.parse(
      readFileSync(path.join(process.cwd(), "public", "jozve", f), "utf8")
    ) as { lessons?: { questions?: unknown[] }[] };
    for (const L of parsed.lessons ?? []) n += (L.questions ?? []).length;
  }
  return n;
}

const tq = (id: string, options = ["a", "b", "c", "d"], answer = 0): TeacherQuestionLike => ({
  id,
  category: "vocab",
  question: `stem ${id}`,
  options,
  answer,
});

describe("r403 — jozve bank widening (explain + teacher)", () => {
  it("loads all nine files with the file-truth count", () => {
    expect(JOZVE_BANK_FILES).toHaveLength(9);
    expect(jozve()).toHaveLength(6222);
    expect(jozve().length).toBe(recountJozveFromFiles());
  });

  it("every jozve question passes the hard shape-guard (id/options/answer)", () => {
    const seen = new Set<string>();
    for (const q of jozve()) {
      expect(q.id.length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.question.length).toBeGreaterThan(0);
      seen.add(q.id);
    }
    // first-wins index: no duplicate ids inside the library
    expect(seen.size).toBe(jozve().length);
  });

  it("findQuestionAny resolves the original bank AND every jozve namespace", () => {
    expect(findQuestion("l1-v1")).toBeDefined(); // bundled lesson1 (client-safe index)
    for (const id of [
      "g7-l1-1",
      "g8-l1-1",
      "g9-l1-1",
      "g10-l1-1", // 9-option word-bank family
      "g11-l25-1",
      "g12-l1-1",
      "g11-gram-l1-1",
      "g11-kgram-l1-1",
      "g12-rel-1", // topic grammar
      "g12-l142-1", // typed review bank
    ]) {
      const q = findQuestionAny(id);
      expect(q, id).toBeDefined();
      expect(q!.options.length).toBeGreaterThan(0);
    }
  });

  it("widened index = bundled live truth (r456: 2708 lessons + 360 exam + 862 konkur) + jozve 6222, no id collision", () => {
    expect(wideQuestionIndex().size).toBe(2708 + 360 + 862 + 6222);
  });

  it("GUARD — explain-source stays client-safe (no fs, no jozve-bank import)", () => {
    // r403 lesson: importing node:fs here 500s the whole home page (client bundle)
    const src = readFileSync(path.join(process.cwd(), "src/lib/explain-source.ts"), "utf8");
    expect(src).not.toContain('"./jozve-bank"');
    expect(src).not.toContain('"node:fs"');
    const teacher = readFileSync(path.join(process.cwd(), "src/lib/teacher-bank.server.ts"), "utf8");
    expect(teacher).toContain("jozve-bank");
  });
});

describe("r403 — typed-wrong sentinel -1 in the teacher contract", () => {
  it("normalizeAnswer keeps -1 but still degrades other garbage to null", () => {
    expect(normalizeAnswer(-1, tq("x"))).toBe(-1);
    expect(normalizeAnswer(-2, tq("x"))).toBeNull();
    expect(normalizeAnswer(99, tq("x"))).toBeNull();
    expect(normalizeAnswer(1.5, tq("x"))).toBeNull();
    expect(normalizeAnswer(null, tq("x"))).toBeNull();
    expect(normalizeAnswer(2, tq("x"))).toBe(2);
  });

  it("digest counts -1 as answered+wrong with typedWrong detail — never بی‌پاسخ", () => {
    const digest = buildSessionDigest([
      { q: tq("q1"), ans: 0 }, // correct
      { q: tq("q2"), ans: -1 }, // typed wrong
      { q: tq("q3"), ans: null }, // truly skipped
    ]);
    expect(digest.total).toBe(3);
    expect(digest.answered).toBe(2);
    expect(digest.unanswered).toBe(1);
    expect(digest.correct).toBe(1);
    expect(digest.wrong).toBe(2);
    const typedRow = digest.wrongDetail.find((w) => w.typedWrong);
    expect(typedRow).toBeDefined();
    expect(typedRow!.chosen).toBeNull();
    expect(typedRow!.text).toBe("stem q2");
    const skippedRow = digest.wrongDetail.find((w) => !w.typedWrong);
    expect(skippedRow!.chosen).toBeNull();
  });

  it("fallbackReview for an all-typed-wrong session never claims بی‌پاسخ", () => {
    const digest = buildSessionDigest([
      { q: tq("q1", ["a", "b"], 0), ans: -1 },
      { q: tq("q2", ["a", "b"], 0), ans: -1 },
    ]);
    expect(digest.unanswered).toBe(0);
    expect(digest.wrong).toBe(2);
    const review = fallbackReview(digest);
    expect(review.intro).not.toContain("بی‌پاسخ");
    expect(review.intro).toContain("۰");
  });

  it("fingerprint distinguishes typed-wrong (-1) from unanswered (null)", () => {
    expect(reviewFingerprint([{ id: "q", ans: -1 }])).toBe("q:-1");
    expect(reviewFingerprint([{ id: "q", ans: null }])).toBe("q:-");
    expect(reviewFingerprint([{ id: "q", ans: -1 }])).not.toBe(
      reviewFingerprint([{ id: "q", ans: null }])
    );
  });

  it("reviewSchema accepts the -1 sentinel and rejects other negatives", () => {
    const ok = reviewSchema.safeParse({ ids: ["g12-l142-1"], answers: [-1] });
    expect(ok.success).toBe(true);
    const bad = reviewSchema.safeParse({ ids: ["g12-l142-1"], answers: [-2] });
    expect(bad.success).toBe(false);
    const bad2 = reviewSchema.safeParse({ ids: ["g12-l142-1"], answers: [1.5] });
    expect(bad2.success).toBe(false);
  });
});

describe("r403 — option letters to i + honest explain prompt", () => {
  it("letters now covers nine options", () => {
    expect(letters).toHaveLength(9);
    expect(letters[7]).toBe("h");
    expect(letters[8]).toBe("i");
  });

  it("optionLetter spans a..i and stays safe beyond", () => {
    expect(optionLetter(0)).toBe("a");
    expect(optionLetter(8)).toBe("i");
    expect(optionLetter(9)).toBe("#10");
  });

  it("the 9-option word-bank family is TYPED — its prompt shows the model answer", () => {
    const q = findQuestionAny("g10-l1-1")!;
    expect(q.options).toHaveLength(9);
    expect(q.kind).toBe("typed");
    const prompt = buildExplainPrompt(q);
    expect(prompt).toContain("تایپی");
    expect(prompt).toContain("پاسخِ مدل");
    expect(prompt).not.toContain("undefined");
  });

  it("explain prompt for a synthetic 9-option MCQ letters h/i — no undefined", () => {
    const prompt = buildExplainPrompt({
      id: "synthetic-9",
      category: "vocab",
      question: "Pick one of nine.",
      options: ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9"],
      answer: 8,
    });
    expect(prompt).toContain("۹گزینه‌ای");
    expect(prompt).toContain("h) w8");
    expect(prompt).toContain("i) w9  ← کلید درست");
    expect(prompt).not.toContain("undefined");
  });

  it("explain prompt for a typed question introduces the model answer honestly", () => {
    const q = findQuestionAny("g12-l142-1")!;
    expect(q.kind).toBe("typed");
    const prompt = buildExplainPrompt(q);
    expect(prompt).toContain("تایپی");
    expect(prompt).toContain("پاسخِ مدل");
    expect(prompt).not.toContain("گزینه‌ای");
  });
});
