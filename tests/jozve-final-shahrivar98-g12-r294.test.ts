import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizeTypedAnswer } from "../src/lib/typed-answer";

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
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\//g, " ")
    .replace(/[\s?؟.!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const FIN98SH = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92] as const;

// کلیدهای چاپی راهنمای تصحیح ص۲۴۹-۲۵۰ — عیناً
const LIS_MCQ_KEYS: Record<number, string> = { 1: "c", 2: "a" }; // ۷/۸ — سه‌گزینه‌ایِ چاپ
const DEF_LETTERS = "abcde";
const K_DEF: Record<number, string> = { 1: "e", 2: "a", 3: "d", 4: "b" }; // c اضافهٔ چاپی
const BANK_WORDS = ["origin", "generous", "effectively", "share"];
const K_BANK: Record<number, string> = { 1: "effectively", 2: "share", 3: "origin" }; // generous اضافهٔ چاپی
const G_LETTERS = "abcd";
const K_G: Record<number, string> = { 1: "b", 2: "c", 3: "d", 4: "a" }; // چاپ وارونهٔ d,c,b,a
const K_CONN: Record<number, string> = { 1: "or", 2: "so", 3: "but", 4: "and" };
const ROLE_OPTIONS = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const K_ROLE: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 0, 5: 2, 6: 1 }; // جدول ص۲۵۰: Topic=۴۵ / Concluding=۴۶

describe("jozve topic grammar bank g12 — final exam شهریور ۹۸ (r294 extraction receipt)", () => {
  it("bank shape: two hundred twenty-seven lessons, final shahrivar 98 adds 12 banks / 44 items (family 1283)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 227 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      81: 3, 82: 2, 83: 4, 84: 3, 85: 3, 86: 4, 87: 4, 88: 2, 89: 4, 90: 6, 91: 4, 92: 4,
    };
    const levels: Record<number, string> = {
      81: "استاندارد", 83: "استاندارد", 87: "استاندارد", 90: "استاندارد", 91: "استاندارد", 92: "استاندارد",
    };
    for (const n of FIN98SH) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی شهریور ۹۸");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(81).questions.every((q) => q.id === `g12-fin98sh-lis${q.n}`)).toBe(true);
    expect(L(90).questions.every((q) => q.id === `g12-fin98sh-role${q.n}`)).toBe(true);
    // آزمون نهایی شهریور ۹۸: ۴۴ آیتم در ۱۲ بانک — خانواده: ۷۷۱ + ۴۴ = ۸۱۴ (۸۱۵ آیتمِ چاپی منهای ۵ غیبتِ صادقانه: ۱-۶، ۹؟ نه — ۹ هست؛ غیبت‌ها: ۱-۶ + ۱۰ + ۱۱ + ۴۱ + ۴۹)
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1283);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1283);
  });

  it("provenance: source.final98sh registered with honest absences (printed-less listening stems + open paragraph + unreconstructable 49)", () => {
    const src = bank.source.final98sh as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("244-248");
    expect(src.keyPages).toBe("249-250");
    expect(src.banks).toBe(12);
    expect(src.questions).toBe(44);
    expect(src.sections).toBe(16);
    expect(src.extractedRound).toBe(294);
    const audio = src.audioAbsent as Record<string, unknown>;
    expect(String(audio.section)).toContain("۱-۶");
    expect(String(audio.printedKey)).toContain("I would found a company");
    expect(String(audio.printedKey)).toContain("They flew their kites");
    expect(String(audio.printedKey)).toContain("The driver waved him");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.note)).toContain("causing diseases such as lung cancer");
    expect(String(open.note)).toContain("being addictive and difficult for smokers to quit");
  });

  it("listening with printed text (81): two three-option MCQs + one typed keyed by p249", () => {
    const qs = L(81).questions;
    expect(qs[0].options).toEqual(["playing volleyball", "taking photographs", "picnic"]);
    expect(DEF_LETTERS.slice(0, 3)[qs[0].answer]).toBe(LIS_MCQ_KEYS[1]); // c/ picnic
    expect(qs[1].options).toEqual(["in the morning", "at midnight", "in the evening"]);
    expect(DEF_LETTERS.slice(0, 3)[qs[1].answer]).toBe(LIS_MCQ_KEYS[2]); // a/ in the morning
    expect(qs[2].kind).toBe("typed");
    expect(qs[2].accepted).toEqual(["They flew their kites."]); // کلیدِ جمله‌کاملِ چاپیِ راهنما
    expect(String(qs[2].question)).toContain("What did they do in the afternoon?");
  });

  it("picture vocab (82): two typed with self-sufficient printed stems (pigeons / consume)", () => {
    const qs = L(82).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["pigeons"]);
    expect(String(qs[0].question)).toContain("feeds the --------------- in the park");
    expect(qs[1].accepted).toEqual(["consume"]);
    expect(String(qs[1].question)).toContain("less electricity");
  });

  it("definitions (83): five printed options a..e with faithful letter keys e/a/d/b (c extra)", () => {
    const qs = L(83).questions;
    expect(qs.map((q) => q.options.length)).toEqual([5, 5, 5, 5]);
    expect(qs.map((q) => DEF_LETTERS[q.answer])).toEqual(["e", "a", "d", "b"]);
    expect(qs[0].options).toContain("for all time"); // e
    expect(qs[1].options).toContain("to change in form or character"); // a
    expect(qs[2].options).toContain("to stop being angry with someone"); // d
    expect(qs[3].options).toContain("to put things in a neat, attractive, or useful order"); // b
    expect(qs[0].options).toContain("to suddenly decide to do something"); // c — اضافهٔ چاپی حاضر در ستون
    expect(String(qs[0].question)).toContain("No one can live forever");
    expect(String(qs[3].question)).toContain("arrange the chairs around the table");
  });

  it("vocab bank-fill (84): printed bank of four words, generous is the printed extra, keys faithful", () => {
    const qs = L(84).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_BANK[q.n]]);
      expect(q.options, q.id).toEqual(BANK_WORDS); // بانکِ کاملِ چاپی عیناً در options
      expect(q.options).toContain(K_BANK[q.n]);
    }
    const used = qs.map((q) => K_BANK[q.n]);
    expect(new Set(used).size).toBe(3);
    expect(BANK_WORDS.filter((w) => !used.includes(w))).toEqual(["generous"]); // اضافهٔ چاپی
    expect(String(qs[2].question)).toContain("the story behind them");
  });

  it("knowledge completion (85): first-letter printed hints kept attached — diary / introduction / demand", () => {
    const qs = L(85).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["diary"]);
    expect(String(qs[0].question)).toContain("on my d——————— every day for 10 years");
    expect(qs[1].accepted).toEqual(["introduction"]);
    expect(String(qs[1].question)).toContain("a two-page i———————");
    expect(qs[2].accepted).toEqual(["demand"]);
    expect(String(qs[2].question)).toContain("Nowadays d——————— for organic food");
    for (const q of qs) {
      expect(q.options[0], q.id).toBe(q.accepted?.[0]);
      expect(q.placeholder, q.id).toContain("printed first letter"); // حرفِ چاپیِ نخست در راهنما
    }
  });

  it("verb forms (86): four typed with printed verb hints; item 30 carries the FIRST triple printed key", () => {
    const qs = L(86).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual(["be spent"]);
    expect(qs[1].accepted).toEqual(["arrived"]);
    expect(qs[2].accepted).toEqual(["came"]);
    expect(qs[3].accepted).toEqual(["would give", "might give", "could give"]); // «would/ might/ could give» — نخستین سه‌واریانته
    for (const q of qs) expect(String(q.question)).toContain("( to"); // راهنمای فعل چاپی
    expect(String(qs[2].question)).toContain("didn’t he?");
    expect(String(qs[3].question)).toContain("two hundred dollars");
  });

  it("grammar MCQs (87): reversed print d,c,b,a remapped to natural a-d; keys b/c/d/a from guide", () => {
    const qs = L(87).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "d", "a"]);
    expect(qs[0].options).toEqual(["had taught", "was taught", "taught", "will be taught"]); // d چاپی آخرِ طبیعی
    expect(qs[1].options).toEqual(["before", "although", "because", "when"]);
    expect(qs[2].options).toEqual(["where", "what", "which", "whom"]);
    expect(qs[3].options).toEqual(["into", "on", "up", "over"]);
    expect(String(qs[2].question)).toContain("my sister met in the hospital");
  });

  it("word order (88): item 35 dual full-sentence keys (second variant split across OCR lines); item 36 single", () => {
    const qs = L(88).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs[0].accepted).toEqual([
      "The dog which can run very fast is brown.",
      "The dog which is brown can run very fast.",
    ]);
    expect(qs[1].accepted).toEqual([
      "A lot of workers have been employed during the last five years.",
    ]);
    for (const q of qs) {
      // پوششِ واژه‌سطحِ دوسویه علیه واریانتِ نخست (الگوی r292/r293)
      const scrambleWords = String(q.question)
        .split(/[\s/]+/)
        .map((t) => t.replace(/[^\w\s'-]/g, "").trim())
        .filter(Boolean)
        .map((t) => norm(t));
      const primaryWords = norm(q.accepted?.[0] ?? "")
        .split(" ")
        .map((w) => w.replace(/[^\w'-]/g, ""))
        .filter(Boolean);
      for (const w of primaryWords) {
        if (q.n === 1 && w === "run") continue; // تنشِ چاپی: بهم‌ریخته «runs» دارد — رسید source.final98sh
        expect(scrambleWords, `${q.id} answer word "${w}"`).toContain(w);
      }
      // پوششِ دوسویه برای واریانتِ دومِ ۳۵ («run» برابر «runs» ناهم‌ریشه نیست — تنشِ واریانتِ چاپی، رسید source.final98sh)
      if (q.n === 1 && q.accepted && q.accepted.length > 1) {
        const variantWords = norm(q.accepted[1])
          .split(" ")
          .map((w) => w.replace(/[^\w'-]/g, ""))
          .filter(Boolean)
          .filter((w) => !scrambleWords.includes(w));
        expect(variantWords, q.id).toEqual(["run"]); // فقط این یک واکره — بهم‌ریخته «runs» دارد
      }
    }
    expect(String(qs[0].question)).toContain("very fast / the dog / is / can /which /runs / brown");
    expect(String(qs[1].question)).toContain("employed /  during / a lot of / the last five years");
  });

  it("connectives (89): closed printed pool {and, or, but, so}, keys or/so/but/and", () => {
    const qs = L(89).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    for (const q of qs) {
      expect(q.accepted, q.id).toEqual([K_CONN[q.n]]);
      expect([...q.options].sort()).toEqual(["and", "but", "or", "so"]);
    }
    expect(String(qs[0].question)).toContain("You can buy a shirt");
    expect(String(qs[3].question)).toContain("translated a lot of story books");
  });

  it("paragraph ordering (90): FIRST order-into-paragraph section — six three-option MCQs keyed by p250 descriptor table (Topic=45, Concluding=46)", () => {
    const qs = L(90).questions;
    for (const q of qs) {
      expect(q.options, q.id).toEqual(ROLE_OPTIONS);
      expect(q.answer, q.id).toBe(K_ROLE[q.n]);
    }
    expect(K_ROLE[4]).toBe(0); // Topic — ۴۵ «but the most popular one is football»
    expect(K_ROLE[5]).toBe(2); // Concluding — ۴۶ «Football is really a national sport»
    expect(String(qs[3].question)).toContain("the most popular one is football");
    expect(String(qs[0].question)).toContain("playing at school or in the street");
    // بدنهٔ چاپیِ هر شش جمله عیناً درون‌اپ است
    expect(String(qs[1].question)).toContain("a famous team");
    expect(String(qs[2].question)).toContain("In high schools");
    expect(String(qs[5].question)).toContain("when they are very young");
  });

  it("reading vocabulary (91): one typed verbatim (48) + synonym MCQ d + False/True keyed a-letters", () => {
    const qs = L(91).questions;
    expect(qs[0].kind).toBe("typed");
    expect(qs[0].accepted).toEqual(["That word may stop my understanding of the passage."]); // عینِ چاپِ راهنما
    expect(String(qs[0].question)).toContain("come across an unfamiliar word");
    expect(qs[1].options).toEqual(["believe", "accept", "understand", "imagine"]);
    expect(qs[1].answer).toBe(3); // d/ imagine
    expect(qs[2].options).toEqual(["True", "False"]);
    expect(qs[2].answer).toBe(1); // ۵۱ b/ False
    expect(qs[3].options).toEqual(["True", "False"]);
    expect(qs[3].answer).toBe(0); // ۵۲ a/ True
    expect(String(qs[3].question)).toContain("guessed from the text");
  });

  it("reading energy (92): four MCQs keyed c/b/b/a by p250", () => {
    const qs = L(92).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "b", "b", "a"]);
    expect(qs[0].options).toEqual(["the wind", "plants", "fossil fuels", "the sun"]);
    expect(qs[1].options).toEqual(["solar power and electricity", "wind power and solar power",
      "fossil fuels and wind power", "electricity and fossil fuels"]);
    expect(qs[2].options).toEqual(["to replace the sun and wind with man-made energy sources",
      "to remove pollution from the air as quickly as possible",
      "to stop destroying fossils from long ago",
      "to create electricity without creating pollution"]);
    expect(qs[3].options).toEqual(["turn", "run", "fly", "climb"]);
    expect(String(qs[3].question)).toContain("spin");
  });

  it("typed engine: normalizeTypedAnswer accepts the triple printed key and both word-order variants", () => {
    expect(normalizeTypedAnswer("Would give")).toBe(normalizeTypedAnswer("would give"));
    expect(normalizeTypedAnswer("Might give")).toBe(normalizeTypedAnswer("might give"));
    expect(normalizeTypedAnswer("Could give")).toBe(normalizeTypedAnswer("could give"));
    expect(normalizeTypedAnswer("The dog which is brown can run very fast.")).toBe(
      normalizeTypedAnswer("the dog which is brown can run very fast")
    );
    expect(normalizeTypedAnswer("A lot of workers have been employed during the last five years.")).toBe(
      normalizeTypedAnswer("a lot of workers have been employed during the last five years")
    );
    expect(normalizeTypedAnswer("DIARY")).toBe(normalizeTypedAnswer("diary"));
  });

  it("no stem collision: fin98sh ids are fresh and unseen in lessons <81", () => {
    const earlyIds = new Set(
      bank.lessons.filter((l) => l.lesson < 81).flatMap((l) => l.questions.map((q) => q.id))
    );
    const fresh = L(81).questions.concat(...FIN98SH.slice(1).map((n) => L(n).questions)).map((q) => q.id);
    for (const id of fresh) expect(earlyIds.has(id), id).toBe(false);
    expect(fresh.every((id) => id.startsWith("g12-fin98sh-"))).toBe(true);
  });

  it("dual-key integrity: every accepted array is non-empty and its head is present in options for typed", () => {
    for (const n of [81, 82, 84, 85, 86, 88, 89]) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          expect(q.accepted?.length, q.id).toBeGreaterThan(0);
          expect(q.options, q.id).toContain(q.accepted?.[0]);
        }
      }
    }
  });

  it("faithful oddities receipt: seven honest oddities are locked in the shipped data", () => {
    // ۹: ساقهٔ چاپی بدونِ گزینه — تایپی با کلیدِ جمله‌کامل
    expect(L(81).questions[2].accepted).toEqual(["They flew their kites."]);
    // ۱۷-۲۰: کلیدِ حرفیِ e/a/d/b با c اضافهٔ چاپی
    expect(L(83).questions[0].options).toHaveLength(5);
    // ۲۴-۲۶: حرفِ نخستِ چاپی چسبیده — «———————» بازسازی درون‌اپ
    expect(String(L(85).questions[0].question)).toContain("d———————");
    // ۳۰: نخستین کلیدِ سه‌واریانتهٔ چاپ
    expect(L(86).questions[3].accepted).toEqual(["would give", "might give", "could give"]);
    // ۳۱-۳۴: چاپ وارونه — گزینهٔ d چاپی در جایگاهِ آخرِ طبیعی
    expect(L(87).questions[0].options[3]).toBe("will be taught");
    expect(L(87).questions[0].options[0]).toBe("had taught"); // a طبیعی
    // ۳۵: واریانت دومِ دوسطریِ OCR — هر دو واریانتِ راهنما accepted
    expect(L(88).questions[0].accepted?.[1]).toContain("The dog which is brown can run very fast.");
    // ۴۲-۴۷: نخستین «مرتب‌کردن در قالب پاراگراف» — جدولِ Descriptor ص۲۵۰
    expect(L(90).questions[4].answer).toBe(2); // Concluding=۴۶
  });
});
