import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r311 — گاردِ «آزمون تشریحی واژگان درس اول» جزوهٔ جامع یازدهم
// ص۱۶-۱۸، کلید واژه‌ایِ چاپی ص۱۷۶ — ۴ بانک / ۵۷ آیتم (l25..l28):
//   l25 جای خالی از بانک واژه (۱۶ تایپی، دو بانک ۹تایی با مزاحم)
//   l26 جدول کلمه با حرف اول (۸ تایپی)  l27 تعریف‌ها (۸ تایپی)
//   l28 MCQ ۲۵تستی با نگاشتِ واژه→حرف (کلید چاپی واژه‌محور است)
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  kind?: "mcq" | "typed";
  accepted?: string[];
  placeholder?: string;
  translation?: string;
}
interface BankLesson {
  lesson: number;
  title: string;
  level?: string;
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: Record<string, unknown>;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = /-{5,}/;

const l25 = bank.lessons.find((l) => l.lesson === 25)!;
const l26 = bank.lessons.find((l) => l.lesson === 26)!;
const l27 = bank.lessons.find((l) => l.lesson === 27)!;
const l28 = bank.lessons.find((l) => l.lesson === 28)!;

// رونویسیِ چاپیِ کلید ص۱۷۶ (رسیدِ وفاداری)
const KEY_S1 = ["mistake", "abilities", "communication", "suggestion", "despite", "impossible", "society", "regions", "communicate", "choose", "suggested", "exist", "Imagine", "range", "disappearing", "decided"];
const KEY_S2 = ["century", "continents", "loaves", "native", "society", "learner", "deaf", "confident"];
const KEY_S3 = ["specific", "make up", "foreigner", "ability", "range", "parking lot", "synonym", "sign language"];
const KEY_S4 = ["means", "died", "besides", "populations", "explanation", "society", "fluent", "percent", "improvements", "consider", "mainly", "despite", "exchange", "impossible", "exist", "available", "explain", "meet", "surprising", "abilities", "range", "percent", "matter", "mental", "absolutely"];
const BOX_A = ["society", "despite", "regions", "mistake", "specific", "communication", "suggestion", "impossible", "abilities"];
const BOX_B = ["exist", "decided", "range", "communicate", "suggested", "disappearing", "varied", "imagine", "choose"];
const BOX_3 = ["sign language", "foreigner", "synonym", "make up", "specific", "range", "despite", "ability", "parking lot"];

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

describe("jozve descriptive vocab g11 lesson-1 (r311 extraction receipt)", () => {
  it("bank shape: lessons 25..28 appended after r309's l24 — counts 16/8/8/25", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson).slice(-6)).toEqual([37, 38, 39, 40, 41, 42]); // r354: l37..l42 (تشریحی گرامر د۱) الحاق شد
    expect(l25.count).toBe(16);
    expect(l26.count).toBe(8);
    expect(l27.count).toBe(8);
    expect(l28.count).toBe(25);
    for (const [les, size] of [[l25, 16], [l26, 8], [l27, 8], [l28, 25]] as const) {
      expect(les.questions, `l${les.lesson}`).toHaveLength(size);
      expect(les.questions.map((q) => q.n), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => i + 1)
      );
    }
    expect(l25.title).toBe("تشریحی واژگان — جای خالی از بانک واژه (ص۱۶)");
    expect(l28.title).toBe("تشریحی واژگان — تست چهارگزینه‌ای (ص۱۷-۱۸)");
    expect(l25.level).toBe("تشریحی — تایپی");
    expect(l28.level).toBe("تشریحی — چهارگزینه‌ای");
  });

  it("ids: g11-l25-1..16, g11-l26/27-1..8, g11-l28-1..25 — unique across the whole bank, total 600", () => {
    for (const [les, size] of [[l25, 16], [l26, 8], [l27, 8], [l28, 25]] as const) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(40 + 40 + 40 + 22 + 20 + 20 + 361 + 57 + 114 + 68); // +۵۷: تشریحی درس اول (r311)؛ +۱۱۴: تشریحی درس دوم/سوم (r312)؛ +۶۸: تشریحی گرامر د۱ (r354)
  });

  it("typed purity (l25/l26/l27): kind=typed, accepted[0]=options[answer], answer=0, placeholder set, English purity, healthy blank/hint", () => {
    for (const les of [l25, l26, l27]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.answer, q.id).toBe(0);
        expect(q.accepted, q.id).toHaveLength(1);
        expect(norm(q.accepted![0]), q.id).toBe(norm(q.options[0]));
        expect(q.placeholder, q.id).toBeTypeOf("string");
        expect(q.placeholder!.length, q.id).toBeGreaterThan(10);
        expect(FA.test(q.question), q.id).toBe(false); // [bank: …] انگلیسی است
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
        expect(q.category, q.id).toBe("vocab");
      }
    }
    for (const q of l25.questions) expect(BLANK.test(q.question), `${q.id} «${q.question}»`).toBe(true);
    for (const q of l26.questions) {
      // جدول حرف اول: «c _ _ _ _ _ _» — حرفِ لاتین + خط‌زیرین؛ در میانهٔ ساقه هم می‌آید
      // (q1 «C _ _ …» آغازین است، بقیه میانی — مثلاً «… biggest c _ _ _ _ _ _ _ _ _ .»)
      expect(/[A-Za-z](?:\s+_)+/.test(q.question), `${q.id} hint: ${q.question}`).toBe(true);
    }
    for (const q of l27.questions) expect(/\(-{5,}\)/.test(q.question), q.id).toBe(true);
  });

  it("l25 print fidelity: stem answers = KEY_S1; every [bank: …] lists its box words in booklet order; options = the box", () => {
    l25.questions.forEach((q, i) => {
      const box = i < 8 ? BOX_A : BOX_B;
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_S1[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/);
      expect(m, q.id).toBeTruthy();
      const banks = m![1].split("/").map((w) => norm(w));
      expect(banks, `bank of ${q.id}`).toEqual(box.map(norm));
      expect(new Set(q.options.map(norm)), q.id).toEqual(new Set(box.map(norm)));
    });
    // مزاحم‌های چاپی هر بانک واژه
    expect(norm(BOX_A.filter((w) => !KEY_S1.slice(0, 8).map(norm).includes(norm(w))).join())).toBe("specific");
    expect(norm(BOX_B.filter((w) => !KEY_S1.slice(8).map(norm).includes(norm(w))).join())).toBe("varied");
  });

  it("l26 print fidelity: accepted = KEY_S2; the hinted first letter matches the key", () => {
    l26.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_S2[i]));
      const hint = q.question.match(/([A-Za-z])(?:\s+_)+/)!;
      expect(hint, `${q.id} hint: ${q.question}`).toBeTruthy();
      expect(hint[1].toLowerCase(), q.id).toBe(KEY_S2[i][0].toLowerCase());
    });
  });

  it("l27 print fidelity: accepted = KEY_S3; bank bracket = BOX_3; parenthetical blank intact", () => {
    l27.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_S3[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/);
      expect(m, q.id).toBeTruthy();
      expect(m![1].split("/").map(norm), q.id).toEqual(BOX_3.map(norm));
      expect(/\(-{5,}\)/.test(q.question), q.id).toBe(true);
    });
    expect(norm(BOX_3.filter((w) => !KEY_S3.map(norm).includes(norm(w))).join())).toBe("despite");
  });

  it("l28 printed-key fidelity: keyed option word = booklet's own word-key (ص۱۷۶), unique word→letter mapping", () => {
    l28.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(norm(q.options[q.answer]), `${q.id} key`).toBe(norm(KEY_S4[i]));
      expect(BLANK.test(q.question), q.id).toBe(true);
      expect(FA.test(q.question), q.id).toBe(false);
    });
    // توزیعِ حروفِ کلید (a:5 b:8 c:6 d:6) — قفلِ چاپ
    const dist = l28.questions.reduce<Record<string, number>>((a, q) => {
      const L = "abcd"[q.answer];
      return { ...a, [L]: (a[L] ?? 0) + 1 };
    }, {});
    expect(dist).toEqual({ a: 5, b: 8, c: 6, d: 6 });
  });

  it("no translations in the four descriptive banks — the booklet printed none (honest absence, pattern r278/r309)", () => {
    for (const les of [l25, l26, l27, l28]) {
      for (const q of les.questions) {
        expect(q.translation, q.id).toBeUndefined();
        expect("translation" in q, q.id).toBe(false);
      }
    }
    const src = bank.source as { descVocab1?: Record<string, unknown> };
    expect(src.descVocab1).toBeTruthy();
    expect(src.descVocab1!["questionPages"]).toBe("16-18");
    expect(src.descVocab1!["keyPage"]).toBe("176");
    expect(src.descVocab1!["extractedRound"]).toBe("r311");
    const hunt = src.descVocab1!["duplicateHunt"] as { duplicates: unknown[] };
    expect(hunt.duplicates).toEqual([]);
  });

  it("dup-hunt: no stem of l25..l28 equals any stem of the pre-existing banks (normalized)", () => {
    const strip = (s: string) => norm(s.replace(/\[bank:[^\]]+\]/g, "").replace(/-{5,}/g, " ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " "));
    const oldStems = new Set(
      bank.lessons.filter((l) => l.lesson < 25).flatMap((l) => l.questions.map((q) => strip(q.question)))
    );
    for (const les of [l25, l26, l27, l28]) {
      for (const q of les.questions) {
        expect(oldStems.has(strip(q.question)), `${q.id} duplicates an older stem`).toBe(false);
      }
    }
  });
});
