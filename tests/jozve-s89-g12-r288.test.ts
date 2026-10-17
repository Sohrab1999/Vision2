import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";
const POOL = ["and", "or", "but", "so"];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const l22 = L(22), l23 = L(23);

// کلیدهای چاپی ص۱۹۴ — عیناً از گرید دوسطری بخش ۸ و فهرست ۴تایی بخش ۹
const K8: Record<number, string> = {
  1: "so", 2: "and", 3: "so", 4: "or", 5: "or", 6: "and",
  7: "but", 8: "or", 9: "so", 10: "but", 11: "and", 12: "but",
};
const K9: Record<number, string> = { 1: "and", 2: "or", 3: "but", 4: "so" };

// تکه‌های verbatim بخش ۹ از متنِ پیوستهٔ Amin (هر تکه دقیقاً یک خالیِ شماره‌دار)
const S9_STEMS: Record<number, string> = {
  1: "Amin is a student, (---1---) he goes to a school near his house.",
  2: "He can come home by taxi, (---2---) he can come on foot.",
  3: "He usually gets back on time, (---3---) yesterday he came home late because one of his friends got sick,",
  4: "yesterday he came home late because one of his friends got sick, (---4---) Amin waited until his friend’s father arrived.",
};

describe("jozve topic grammar bank g12 — diagnostic sections 8/9, exam completed (r288 extraction receipt)", () => {
  it("bank shape: twenty-three lessons, sections 8/9 complete the printed exam at 110 items", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 153 }, (_, i) => i + 1)
    );
    const counts = [27, 61, 30, 50, 20, 20, 40, 20, 15, 20, 40, 22, 20, 20, 8, 8, 8, 15, 15, 20, 20];
    counts.forEach((c, i) => expect(bank.lessons[i].questions).toHaveLength(c));
    for (const [l, c] of [[l22, 12], [l23, 4]] as const) {
      expect(l.count, l.title).toBe(c);
      expect(l.questions, l.title).toHaveLength(c);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: c }, (_, i) => i + 1));
    }
    expect(l22.questions.every((q) => q.id === `g12-dconn-${q.n}`)).toBe(true);
    expect(l23.questions.every((q) => q.id === `g12-dcloze-${q.n}`)).toBe(true);
    // آزمون تشریحی کامل: ۹۴ (r287) + ۱۶ (r288) = ۱۱۰ آیتم در ۹ بخش
    const diagnosticTotal = [15, 16, 17, 18, 19, 20, 21, 22, 23]
      .reduce((a, n) => a + L(n).count, 0);
    expect(diagnosticTotal).toBe(110);
    // جمع خانواده: ۴۹۹ + ۱۶ = ۵۱۵
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1042); // ۵۱۵ + ۵۹ آزمون جامع r289
  });

  it("typed bank 22 (complete with connectives): all 12 printed keys from the two-column p194 grid, closed-pool scaffolds, single blank", () => {
    for (const q of l22.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K8[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K8[q.n]));
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.options, q.id).toHaveLength(4);
      // داربست = سه واژهٔ دیگرِ استخرِ بستهٔ {and, or, but, so} — هیچ داربست بیرون از استخر
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect([...wrongs].sort(), q.id).toEqual(POOL.filter((w) => w !== K8[q.n]).sort());
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
    }
    // رسیدِ توزیعِ متوازنِ کاملِ چاپی: so۳/and۳/or۳/but۳
    const dist: Record<string, number> = {};
    for (const q of l22.questions) dist[q.accepted![0]] = (dist[q.accepted![0]] ?? 0) + 1;
    expect(dist).toEqual({ so: 3, and: 3, or: 3, but: 3 });
  });

  it("typed bank 23 (four-blank passage): printed numbered markers (---N---), four verbatim windows of the Amin text, one blank each", () => {
    for (const q of l23.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K9[q.n]]);
      expect(q.question, q.id).toBe(S9_STEMS[q.n]); // verbatim — بدونِ هیچ بازنویسی
      expect(q.question, q.id).toContain(`(---${q.n}---)`);
      expect(q.question.match(/\(---\d---\)/g) ?? [], q.id).toHaveLength(1); // فقط خالیِ خودش
      expect(q.question, q.id).not.toMatch(BLANK); // خالیِ ۱۵خطّی در متنِ پیوسته نیست
      expect(q.options, q.id).toHaveLength(4);
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect([...wrongs].sort(), q.id).toEqual(POOL.filter((w) => w !== K9[q.n]).sort());
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id}:${o}`).toBe(false);
      for (const a of q.accepted ?? []) expect(FA.test(a), `${q.id}:${a}`).toBe(false);
    }
    // رسیدِ توزیع: هر چهار واژه یک‌بار
    expect(l23.questions.map((q) => q.accepted![0])).toEqual(["and", "or", "but", "so"]);
  });

  it("semantic arbitration of printed keys — result-so / contrast-but / warning-or / list-and traps locked", () => {
    const lock = (lesson: TLesson, n: number, key: string, stemRe: RegExp) => {
      const q = lesson.questions[n - 1];
      expect(q.accepted![0], `l${lesson.lesson}-q${n}`).toBe(key);
      expect(q.question, `l${lesson.lesson}-q${n}`).toMatch(stemRe);
    };
    // بخش ۸ — داوری معناییِ کامل انجام شد؛ قفلِ شش سرنخِ حسی
    lock(l22, 1, "so", /The early bird catches the worm/); // نتیجه
    lock(l22, 3, "so", /There was no bread at home/); // نتیجه
    lock(l22, 4, "or", /You should pay the price/); // هشدارِ جایگزین
    lock(l22, 7, "but", /The glass fell down to the floor/); // تضاد
    lock(l22, 10, "but", /My sister loves apples/); // تضاد
    lock(l22, 11, "and", /The class was hot/); // افزودگی
    // بخش ۹ — متنِ پیوسته
    lock(l23, 1, "and", /Amin is a student/);
    lock(l23, 2, "or", /come home by taxi/); // جایگزینِ رفت‌وآمد
    lock(l23, 3, "but", /usually gets back on time/); // تضاد با «دیروز دیر آمد»
    lock(l23, 4, "so", /got sick/); // نتیجه
  });

  it("id uniqueness across the whole 153-bank family (1042 ids) + sections 8/9 introduce zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1042);
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 22)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " ").replace(/\(---------------\)/g, " "))))
    );
    for (const l of [l22, l23]) {
      for (const q of l.questions) {
        const key = norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "));
        expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
      }
    }
  });

  it("provenance: source.diagnosticS89 receipt (r288) + r287 diagnostic block frozen + exam-completion receipt in deferred", () => {
    const s89 = bank.source.diagnosticS89 as Record<string, unknown> | undefined;
    expect(s89).toBeTruthy();
    expect(s89?.extractedRound).toBe(288);
    expect(String(s89?.pages)).toContain("54");
    expect(String(s89?.pages)).toContain("194");
    expect(String(s89?.questions)).toContain("16");
    expect(String(s89?.keyBalance)).toContain("so۳/and۳/or۳/but۳");
    expect(String(s89?.examComplete)).toContain("۱۱۰");
    // بلوک r287 دست‌نخورده ماند — فقط deferred صادقانه به‌روز شد
    const dg = bank.source.diagnostic as Record<string, unknown>;
    expect(dg.extractedRound).toBe(287);
    expect(String(dg.questions)).toContain("94");
    expect(String(dg.deferred)).toContain("r288");
    const stats = bank.source.stats as Record<string, number>;
    expect(stats.questions).toBe(88);
    // خلوص خانواده: ۲۲/۲۳ تایپی، ۱۵-۱۹ و ۲۱ تایپی، ۲۰ mcq، بانک‌های ۱-۱۴ طبق قرارداد
    for (const l of [l22, l23, L(15), L(16), L(17), L(18), L(19), L(21)]) {
      expect(l.questions.every((q) => q.kind === "typed"), l.title).toBe(true);
    }
    expect(L(20).questions.every((q) => q.kind === undefined)).toBe(true);
    for (const l of bank.lessons.filter((x) => x.lesson < 15)) {
      const isTyped = l.lesson === 12 || l.lesson === 13;
      for (const q of l.questions) {
        if (isTyped) expect(q.kind, q.id).toBe("typed");
        else expect(q.kind, q.id).toBeUndefined();
      }
    }
  });
});
