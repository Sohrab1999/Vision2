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
  placeholder?: string;
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const COMP = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] as const;

// کلیدهای چاپی ص۱۹۵-۱۹۶ — عیناً از «کلید آزمون تشریحی جامع درس اول»
const K_VOC: Record<number, string> = {
  1: "failures", 2: "dedicated", 3: "forgive", 4: "boosts",
  5: "temperature", 6: "advice", 7: "shared", 8: "honored",
};
const VOC_BANK = ["boosts", "forgive", "failures", "calmly", "advice", "honored", "temperature", "dedicated", "shared"];
const K_TAG: Record<number, string> = { 1: "will he", 2: "wasn't she", 3: "does he", 4: "hasn't she" };
const K_PASS: Record<number, string> = { 1: "was discovered", 2: "has been stolen", 3: "are used", 4: "were broken" };
const K_SENT: Record<number, string> = {
  1: "My mother makes pancakes every morning.",
  2: "Pancakes are made every morning.",
  3: "The mechanics have repaired the cars.",
  4: "The cars have been repaired.",
};
const K_CONN: Record<number, string> = { 1: "but", 2: "and", 3: "so", 4: "or" };
const CLOZE_BANK = ["brought", "injuries", "fight", "dedicated", "burnt", "caught"];
const K_CLZ: Record<number, string> = { 1: "caught", 2: "dedicated", 3: "burnt", 4: "brought", 5: "fight", 6: "injuries" };
const OPEN_KEYS: Record<number, string> = {
  1: "It can lead not only to great personal happiness but also to respect from others who appreciate the work you do.",
  2: "The important point is that we continue to give to those who are more in need than ourselves.",
};

describe("jozve topic grammar bank g12 — comprehensive exam lesson 1 (r289 extraction receipt)", () => {
  it("bank shape: two hundred twenty-seven lessons, comprehensive exam adds 13 banks / 59 items (family 1283)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 227 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = { 24: 8, 25: 4, 26: 4, 27: 4, 28: 4, 29: 4, 30: 4, 31: 4, 32: 4, 33: 4, 34: 6, 35: 5, 36: 4 };
    const levels: Record<number, string> = { 25: "استاندارد", 27: "استاندارد", 32: "استاندارد", 36: "استاندارد" };
    for (const n of COMP) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("جامع");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(24).questions.every((q) => q.id === `g12-comp-v${q.n}`)).toBe(true);
    expect(L(34).questions.every((q) => q.id === `g12-comp-clz${q.n}`)).toBe(true);
    // آزمون جامع: ۵۹ آیتم در ۱۳ بانک — خانواده: ۵۱۵ + ۵۹ = ۵۷۴
    const compTotal = COMP.reduce((a, n) => a + L(n).count, 0);
    expect(compTotal).toBe(59);
    expect(bank.lessons.reduce((a, l) => a + l.count, 0)).toBe(1283);
  });

  it("typed vocab bank 24: all 8 printed keys (p195), closed 9-word bank scaffolds, calmly is the printed extra word", () => {
    for (const q of L(24).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_VOC[q.n]]);
      expect(norm(q.options[q.answer]), q.id).toBe(norm(K_VOC[q.n]));
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.options, q.id).toHaveLength(4);
      // داربست = استخرِ بستهٔ بانک ۹تایی چاپی — هیچ داربست بیرون از بانک
      for (const o of q.options) expect(VOC_BANK, `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBe("fill in the blank with the word bank…");
      expect(FA.test(q.question), q.id).toBe(false);
    }
    // هشت کلیدِ متمایز؛ «calmly» واژهٔ اضافهٔ چاپی است (۹ واژه − ۸ کلید = ۱ اضافه)
    const keys = L(24).questions.map((q) => q.accepted![0]);
    expect(new Set(keys).size).toBe(8);
    expect(keys, "calmly must remain the extra word").not.toContain("calmly");
  });

  it("mcq collocations bank 25: faithful FIVE printed options (a-e) — documented deviation from the 4-option contract", () => {
    const opts = ["speakers", "temperature", "food", "meal", "wind"]; // a..e به ترتیب چاپ
    const answers: Record<number, number> = { 1: 2, 2: 4, 3: 0, 4: 1 }; // c / e / a / b
    const stems = ["fast", "strong", "native", "take"];
    for (const q of L(25).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(opts); // ۵ گزینهٔ چاپی — انحرافِ مستند (source.comprehensive.fiveOptions)
      expect(q.answer, q.id).toBe(answers[q.n]);
      expect(q.question, q.id).toBe(stems[q.n - 1]);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("typed definitions bank 26: printed keys hug/sofa/diary/distinguished, regard is the extra word, closed pool", () => {
    const keys = ["hug", "sofa", "diary", "distinguished"];
    const stemPrefix: Record<number, string> = {
      1: "To hold someone close to your body",
      2: "A long, soft seat with a back",
      3: "A book in which you record",
      4: "Used to describe a respected and admired person",
    };
    for (const q of L(26).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([keys[q.n - 1]]);
      expect(q.question, q.id).toMatch(new RegExp(`^${stemPrefix[q.n]}`));
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(keys, `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBe("write the word from the bank…");
    }
    expect(L(26).questions.map((q) => q.accepted![0]).sort(), "regard must remain extra").not.toContain("regard");
  });

  it("passive MCQ bank 27: printed grid a/b/d/a + semantic traps locked (plural rooms, habitual allow, workers built)", () => {
    const locks: Record<number, { ans: number; opt: string; stemPart: string }> = {
      1: { ans: 0, opt: "were damaged", stemPart: "Two of the rooms" },
      2: { ans: 1, opt: "are taken", stemPart: "by my mother every day" },
      3: { ans: 3, opt: "is allowed", stemPart: "whenever he needs" },
      4: { ans: 0, opt: "have built", stemPart: "The workers" },
    };
    for (const q of L(27).questions) {
      const lk = locks[q.n];
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(lk.ans);
      expect(q.options[q.answer], q.id).toBe(lk.opt);
      expect(q.question, q.id).toContain(lk.stemPart);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("typed tags bank 28: printed keys with polarity arbitration (won't→will he, never→does he) and closed tag pool", () => {
    for (const q of L(28).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_TAG[q.n]]);
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(Object.values(K_TAG), `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBeUndefined(); // استنتاجِ خودکار: «type the tag question…»
      expect(q.question.trim().endsWith("?"), q.id).toBe(true);
    }
    // داوری قطبیت — قفلِ معنایی
    expect(L(28).questions[0].question).toMatch(/won't sell/); // منفی‌ساز → تگ مثبت
    expect(L(28).questions[2].question).toMatch(/never speaks/); // قیدِ منفی → تگ مثبت
    expect(L(28).questions[1].question).toMatch(/was weaving/); // مثبتِ گذشته → تگ منفی
    expect(L(28).questions[3].question).toMatch(/has passed/); // مثبتِ حال کامل → تگ منفی
  });

  it("typed passive bank 29: printed keys for the three tenses, verb hints printed in stems, closed pool", () => {
    const hints: Record<number, string> = { 1: "(discover)", 2: "(steal)", 3: "(use)", 4: "(break)" };
    for (const q of L(29).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_PASS[q.n]]);
      expect(q.question, q.id).toContain(hints[q.n]);
      for (const o of q.options) expect(Object.values(K_PASS), `${q.id}:${o}`).toContain(o);
      expect(q.placeholder, q.id).toBe("write the passive form…");
    }
    // داوری زمانی: کشفِ چاپی → گذشتهٔ ساده؛ دزدیِ تازه → حال کامل؛ قاعده → حال ساده؛ دیشب → گذشتهٔ ساده
    expect(L(29).questions[1].question).toMatch(/I'm going to call the police/);
    expect(L(29).questions[3].question).toMatch(/last night/);
  });

  it("sentence-building bank 30 and word-order bank 33: accepted sentences verbatim from p196, scramble tokens ⊆ answer words", () => {
    // درس ۳۰ — فرم Active/Passive با پسوندِ صریح؛ توکن‌های بهم‌ریخته ⊆ واژه‌های کلید
    for (const q of L(30).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_SENT[q.n]]);
      expect(q.question, q.id).toMatch(q.n % 2 === 1 ? /— Active:/ : /— Passive:/);
      expect(q.placeholder, q.id).toBe("write the full sentence…");
      const answerNorm = norm(K_SENT[q.n]);
      if (q.n % 2 === 1) {
        // Active: هر توکنِ بهم‌ریختهٔ چاپی باید در جملهٔ کلید حضور داشته باشد
        const tokens = q.question.split("—")[0].split("/").map((t) => norm(t)).filter((t) => t && t !== "," && t !== ".");
        for (const t of tokens) expect(answerNorm, `${q.id} token «${t}»`).toContain(t);
      } else {
        // Passive: تحوّلِ مجهول، فعل و عامل را تغییر می‌دهد — فقط محتوای پایدارِ چاپی رسید می‌شود
        const kept: Record<number, string[]> = { 2: ["pancakes", "every morning"], 4: ["the cars", "repaired"] };
        for (const t of kept[q.n]) expect(answerNorm, `${q.id} kept «${t}»`).toContain(t);
      }
      for (const o of q.options) expect(Object.values(K_SENT), `${q.id}:${o}`).toContain(o);
    }
    // درس ۳۳ — مرتب‌کردن کلمات
    const stems33: Record<number, string> = {
      1: "My brother went to the library, but he didn't study at all.",
      2: "This shirt is not comfortable, so I rarely wear it.",
      3: "That book is expensive, so I can't buy it.",
      4: "I like spaghetti, but my mother hates it.",
    };
    for (const q of L(33).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([stems33[q.n]]);
      expect(q.placeholder, q.id).toBe("write the complete sentence…");
      const tokens = q.question.split("/").map((t) => norm(t)).filter((t) => t && t !== "," && t !== ".");
      const answerNorm = norm(stems33[q.n]);
      for (const t of tokens) expect(answerNorm, `${q.id} token «${t}»`).toContain(t);
    }
  });

  it("connectives bank 31 (closed pool) and six-blank cloze bank 34 (Hassan Omidzadeh passage, printed ---N--- markers)", () => {
    for (const q of L(31).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_CONN[q.n]]);
      const wrongs = q.options.filter((_, i) => i !== q.answer);
      expect([...wrongs].sort(), q.id).toEqual(["and", "but", "or", "so"].filter((w) => w !== K_CONN[q.n]).sort());
      expect((q.question.match(new RegExp(BLANK, "g")) ?? []).length, q.id).toBe(1);
      expect(q.placeholder, q.id).toBeUndefined(); // استنتاجِ خودکار: «fill in the blank… (e.g. and)»
    }
    for (const q of L(34).questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([K_CLZ[q.n]]);
      expect(q.question, q.id).toContain(`(---${q.n}---)`);
      expect(q.question.match(/\(---\d---\)/g) ?? [], q.id).toHaveLength(1);
      expect(q.question, q.id).not.toMatch(BLANK);
      expect(q.options, q.id).toHaveLength(4);
      for (const o of q.options) expect(CLOZE_BANK, `${q.id}:${o}`).toContain(o);
    }
    // رسیدِ متن: حسن عمیدزاده، معلمِ شفتِ گیلان — قفلِ سرنخ‌ها
    expect(L(34).questions[0].question).toMatch(/In the February of 1997/);
    expect(L(34).questions[5].question).toMatch(/died on July 18, 2012/);
  });

  it("reading bank 35: two open typed questions keyed verbatim from p196 + synonym b + True/False with printed-key tension receipt", () => {
    const l35 = L(35);
    expect(l35.questions[0].kind).toBe("typed");
    expect(l35.questions[1].kind).toBe("typed");
    for (const n of [1, 2]) {
      const q = l35.questions[n - 1];
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toEqual([OPEN_KEYS[n]]);
      expect(q.placeholder, q.id).toBeUndefined(); // «type your answer…» خودکار
      expect(q.options, q.id).toHaveLength(2); // داربستِ حداقلیِ دوکلیدی — جعلِ گزینه ممنوع
    }
    // متعرّفِ معنایی — کلید چاپی b
    const syn = l35.questions[2];
    expect(syn.kind).toBeUndefined();
    expect(syn.question).toContain("“benefit”");
    expect(syn.options[syn.answer]).toBe("advantage");
    // درست/نادرست — کلیدهای چاپی a/a (بخش ۵ با رسیدِ تنش)
    for (const n of [4, 5]) {
      const q = l35.questions[n - 1];
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toEqual(["True", "False"]);
      expect(q.answer, q.id).toBe(0); // a=True طبق کلید چاپی ص۱۹۶
    }
    expect(l35.questions[4].question).toMatch(/All people feel great personal happiness/);
  });

  it("reading MCQ bank 36: printed grid d/c/b/a with passage-derived locks (ears do not change shape)", () => {
    const locks: Record<number, { ans: number; opt: string }> = { 1: { ans: 3, opt: "our ears will not change in shape" }, 2: { ans: 2, opt: "he/she may get angry easily" }, 3: { ans: 1, opt: "the size, color and shape" }, 4: { ans: 0, opt: "When they are cold." } };
    for (const q of L(36).questions) {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBe(locks[q.n].ans);
      expect(q.options[q.answer], q.id).toBe(locks[q.n].opt);
      expect(FA.test(q.question), q.id).toBe(false);
    }
  });

  it("id uniqueness across the whole 227-bank family (1283 ids) + comprehensive banks introduce zero new stem collisions", () => {
    const all = bank.lessons.flatMap((l) => l.questions);
    const ids = new Set(all.map((q) => q.id));
    expect(ids.size).toBe(1283);
    const stems = new Set(
      bank.lessons
        .filter((l) => l.lesson < 24)
        .flatMap((l) => l.questions.map((q) => norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "))))
    );
    for (const n of COMP) {
      for (const q of L(n).questions) {
        const key = norm(q.question.replace(/-+/g, " ").replace(/\(---\d---\)/g, " "));
        expect(stems.has(key), `new stem collision: ${q.id}`).toBe(false);
      }
    }
  });

  it("provenance: source.comprehensive receipt (r289) + prior blocks frozen + kind purity of the new banks", () => {
    const cp = bank.source.comprehensive as Record<string, unknown> | undefined;
    expect(cp).toBeTruthy();
    expect(cp?.extractedRound).toBe(289);
    expect(String(cp?.pages)).toContain("55");
    expect(String(cp?.pages)).toContain("58");
    expect(String(cp?.questions)).toContain("59");
    expect(String(cp?.visualAbsent)).toContain("Match the pictures");
    expect(String(cp?.fiveOptions)).toContain("۵ گزینه");
    expect(String(cp?.tfReceipt)).toContain("All people");
    // بلوک‌های پیشین منجمد
    expect((bank.source.diagnostic as Record<string, unknown>).extractedRound).toBe(287);
    expect((bank.source.diagnosticS89 as Record<string, unknown>).extractedRound).toBe(288);
    expect((bank.source.stats as Record<string, number>).questions).toBe(88);
    // خلوصِ kinds — تایپی‌ها / mcqها / بانکِ مختلطِ ریدینگ
    for (const n of [24, 26, 28, 29, 30, 31, 33, 34]) {
      expect(L(n).questions.every((q) => q.kind === "typed"), L(n).title).toBe(true);
    }
    for (const n of [25, 27, 32, 36]) {
      expect(L(n).questions.every((q) => q.kind === undefined), L(n).title).toBe(true);
    }
    const l35 = L(35);
    expect(l35.questions.filter((q) => q.kind === "typed")).toHaveLength(2);
    expect(l35.questions.filter((q) => q.kind === undefined)).toHaveLength(3);
  });
});
