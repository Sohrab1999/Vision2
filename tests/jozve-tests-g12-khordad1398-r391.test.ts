import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r391 — برگهٔ سیزدهمِ نهایی‌ها: خرداد ۱۳۹۸ (ص۲۳۷-۲۴۱، کلیدِ ص۲۴۲-۲۴۳، ۱۳/۳/۱۳۹۸)
// ۱۰ بانک/۳۸ آیتم (l93-l102) — سه بانکِ تایپیِ تازه (l94/l97/l98؛ مجموعِ تایپی‌های نهایی‌ها = ۵) +
// نخستین گزینهٔ درون‌ساقه‌ایِ مخزن (ق۷: Wind/Coal) + کلیدِ بریدهٔ چاپیِ «26. hu» → hug +
// هم‌خانوادگیِ بین‌خانواده‌ایِ gt-l69-l80 (r292).
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
type TBank = { grade: number; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf8")
);
const gt: { lessons: TLesson[] } = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const GT = (n: number) => gt.lessons.find((l) => l.lesson === n)!;
const src = bank.source as Record<string, Record<string, unknown>>;
const r13 = src.g12nahaie13 as Record<string, unknown>;

const DEF_B = [
  "the rise and fall of the sea",
  "in a quiet way",
  "a book in which you record your thoughts and feelings",
  "to change in form or character",
  "in a way that is successful and achieves what you want",
];
const BANK4 = ["combination", "compile", "dedicated", "consume"];
const CONN = ["and", "or", "but", "so"];
const CHARITY_HEAD =
  "Some people prefer to provide help and support directly to those in need.";
const DICTADV_HEAD = "A dictionary is a collection of words ranging from letters A-Z.";

describe("r391 — رسیدِ برگهٔ خرداد ۱۳۹۸ (g12nahaie13)", () => {
  it("رسید: r391 / ۵۸ ردیف / ۳۸ استخراج / ۲۰ مستثنی / ۱۰ بانک [8,2,4,3,3,4,4,4,3,3]", () => {
    expect(r13.extractedRound).toBe("r391");
    expect(r13.sectionsTotal).toBe(58);
    expect(r13.sectionsExtracted).toBe(38);
    expect(r13.sectionsSkipped).toBe(20);
    expect(r13.items).toBe(38);
    expect(r13.bankCounts).toEqual([8, 2, 4, 3, 3, 4, 4, 4, 3, 3]);
  });

  it("متاِمتحان: ۱۳/۳/۱۳۹۸ + presentation-formsِ دوفاصله‌ای + «پاسخ نامه دارد» + شنیداریِ ۶سؤالی", () => {
    const meta = String(r13.examMeta);
    expect(meta).toContain("۱۳/۳/۱۳۹۸");
    expect(meta).toContain("presentation-forms");
    expect(meta).toContain("پاسخ نامه دارد");
    expect(meta).toContain("aee.medu.ir");
    const pages = String(r13.examPages);
    expect(pages).toContain("pdf-p237-241");
    expect(pages).toContain("pdf-p242-243");
  });

  it("کلید: «26. hu» بریدهٔ چاپ + جدولِ Descriptorِ آب + دوبلِ Trueِ ۵۱/۵۲ + سه جفت‌کلید", () => {
    const kv = String(r13.keyVerification);
    expect(kv).toContain("26. hu");
    expect(kv).toContain("ترتیب قرار گرفتن جملات supporting مهم نیست");
    expect(kv).toContain("52. (a) True");
    expect(kv).toContain("29. would/ could go");
    expect(kv).toContain("56. c/ part of speech");
    expect(kv).toContain("57. a / out of reach");
  });

  it("paperMap: ۱۴ برگه استخراج شد، ۳ برگه باقی است", () => {
    const pm = String(r13.paperMap);
    expect(pm).toContain("۱۴ برگه استخراج شد، ۳ برگه باقی است");
    expect(pm).toContain("خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸) ← این راند");
    expect(pm).toContain("شهریور ۱۳۹۸ ص۲۴۴-۲۴۸");
  });

  it("کوئیرک‌های چاپ: ۱۵ داوری (hu/درون‌ساقه‌ایِ Wind-Coal/سه‌گزینه‌ای‌ها/چینشِ a-d/…)", () => {
    const pq = r13.printQuirks as string[];
    expect(pq.length).toBeGreaterThanOrEqual(15);
    const joined = pq.join(" | ");
    expect(joined).toContain("26. hu");
    expect(joined).toContain("درون‌ساقه‌ای");
    expect(joined).toContain("سه‌گزینه‌ای");
    expect(joined).toContain("آرتیفکتِ RTL");
    expect(joined).toContain("Supporting (نه Topic)");
  });

  it("سرشماریِ دوقلو (gt-l69-l80) + مخزنِ تایپیِ ۸۲ ردیفی + کاندیدِ آب", () => {
    const tc = String(r13.twinCensus);
    expect(tc).toContain("grammar-g12-topic.json (l69-l80، ۵۲ آیتم)");
    expect(tc).toContain("چهارمین تکرار");
    const fn = String(r13.futureNote);
    expect(fn).toContain("۸۲ ردیف");
    expect(fn).toContain("پاراگرافِ آب");
  });
});

describe("r391 — بانک‌های l93-l96 (شنیداریِ متن‌چاپ + تصویریِ تایپی + تعریف + بانک)", () => {
  it("l93: ۸ ردیف — ق۱ درون‌ساقه‌ایِ [wind, coal] و سه‌گزینه‌ای‌های چاپیِ ق۱۲-۱۴ وفادار", () => {
    const b = L(93);
    expect(b.count).toBe(8);
    const keyed = b.questions.map((it) => it.options[it.answer]);
    expect(keyed).toEqual([
      "wind",
      "do not pollute the earth",
      "is reduced",
      "it was a secret",
      "to buy a new mobile phone",
      "air pollution",
      "big cities",
      "diseases",
    ]);
    expect(b.questions[0].question).toBe("Which one is clean energy? Wind or Coal? -------.");
    expect(b.questions[0].options).toEqual(["wind", "coal"]);
    expect(b.questions[5].options).toEqual(["heart attack", "human's life", "air pollution"]);
    expect(b.questions[6].options).toEqual(["big cities", "roads", "highways"]);
    expect(b.questions[7].options).toEqual(["reasons", "diseases", "ways"]);
    expect(b.questions[3].question).toBe(
      "Bijan didn't tell Mehran about the problem because -------."
    );
  });

  it("l94: ۲ ردیفِ تایپی — acceptedِ تک/دوبخشیِ چاپ (hard / wind turbines+turbines)", () => {
    const b = L(94);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.kind)).toEqual(["typed", "typed"]);
    expect(b.questions[0].accepted).toEqual(["hard"]);
    expect(b.questions[1].accepted).toEqual(["wind turbines", "turbines"]);
    for (const it of b.questions) {
      expect(it.options).toEqual([it.accepted![0]]);
      expect(it.answer).toBe(0);
    }
    expect(b.questions[0].question).toBe(
      "We have to speak louder, because my grandfather is ------- of hearing."
    );
    expect(b.questions[1].question).toBe(
      "In opposite to fans, ------- (s) use wind to generate electricity."
    );
  });

  it("l95: تعریف‌یابیِ جمله‌دار — ستون B چاپی، کلیدهای e/c/a/d، اضافیِ هرگز-کلیدِ b", () => {
    const b = L(95);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "in a way that is successful and achieves what you want",
      "a book in which you record your thoughts and feelings",
      "the rise and fall of the sea",
      "to change in form or character",
    ]);
    for (const it of b.questions) expect(it.options).toEqual(DEF_B);
    expect(b.questions.map((it) => it.answer)).toEqual([4, 2, 0, 3]);
    expect(b.questions[3].question).toContain("«We can convert some sofas into a bed.»");
    expect(b.questions[1].question).toContain("واژهٔ «diary»");
  });

  it("l96: بانکِ چاپِ ۴واژه‌ای — کلیدهای consume/combination/dedicated، compileِ هرگز-کلید + چهارمینِ spared-no-pains", () => {
    const b = L(96);
    expect(b.count).toBe(3);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "consume",
      "combination",
      "dedicated",
    ]);
    for (const it of b.questions) expect(it.options).toEqual(BANK4);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0, 2]);
    expect(b.questions[2].question).toBe(
      "Dr. Gharib was regarded as a ------- physician and he spared no pains to help sick people."
    );
  });
});

describe("r391 — بانک‌های تایپیِ l97/l98 (حرف‌اول + شکلِ فعلِ مکالمه)", () => {
  it("l97: ۳ ردیفِ تایپیِ حرف‌اول — ساقه‌های a-------/s-------/h------- با حرفِ چسبیده", () => {
    const b = L(97);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.kind)).toEqual(["typed", "typed", "typed"]);
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["absorb"],
      ["symbol", "sign"],
      ["hug"], // کلیدِ بریدهٔ چاپِ «hu» — تکمیلِ معنایی هم‌سو با gt-l73
    ]);
    expect(b.questions[0].question).toBe("Plants a------- carbon dioxide from the air.");
    expect(b.questions[1].question).toBe("H is the chemical s------- for hydrogen.");
    expect(b.questions[2].question).toBe(
      "In Germany people usually h------- each other when they meet."
    );
  });

  it("l98: ۴ ردیفِ تایپیِ مکالمه — acceptedِ دوبخشیِ would/could go + پرانتزهای فاصله‌دارِ چاپ", () => {
    const b = L(98);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["seems"],
      ["had decided"],
      ["would go", "could go"],
      ["are served"],
    ]);
    expect(b.questions[0].question).toBe("It ------- rather cold today, doesn't it? ( to seem)");
    expect(b.questions[3].question).toBe(
      "I know a restaurant in which a variety of sea foods ------- . ( to serve)"
    );
  });
});

describe("r391 — بانک‌های l99-l102 (گرامر + ربط + دو خوانداری)", () => {
  it("l99: گرامر با چینشِ دیداریِ a-d — کلیدهای which/may be produced/communicative/into", () => {
    const b = L(99);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3, 2, 0]);
    expect(b.questions[0].options).toEqual(["whom", "which", "who", "whose"]);
    expect(b.questions[1].options).toEqual([
      "was produced",
      "produce",
      "may produce",
      "may be produced",
    ]);
    expect(b.questions[2].options).toEqual([
      "communicate",
      "communication",
      "communicative",
      "to communicate",
    ]);
    expect(b.questions[3].question).toBe(
      "I did not read the introduction and jumped ------- the next part."
    );
  });

  it("l100: حروفِ ربط — ترتیبِ چاپ (and/or/but/so)، کلیدهای so/and/but/or + ضرب‌المثلِ early bird", () => {
    const b = L(100);
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.options).toEqual(CONN);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual(["so", "and", "but", "or"]);
    expect(b.questions[0].question).toBe(
      "The early bird catches the worm, ------- if you want to succeed, wake up and start work early."
    );
  });

  it("l101: خوانداریِ نیکوکاری — مترادفِ benefit + دوبلِ Trueِ چاپ", () => {
    const b = L(101);
    expect(b.count).toBe(3);
    for (const it of b.questions) expect(it.question.startsWith(CHARITY_HEAD)).toBe(true);
    expect(b.questions[0].question).toContain('the word "benefit"?');
    expect(b.questions[0].options).toEqual(["experience", "advantage", "choice", "effect"]);
    expect(b.questions[0].answer).toBe(1);
    for (const it of b.questions.slice(1)) {
      expect(it.options).toEqual(["True", "False"]);
      expect(it.answer).toBe(0);
    }
  });

  it("l102: خوانداریِ فرهنگ‌لغت — ضمیرِ (it)/متضادِ available/False", () => {
    const b = L(102);
    expect(b.count).toBe(3);
    for (const it of b.questions) expect(it.question.startsWith(DICTADV_HEAD)).toBe(true);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 1]);
    expect(b.questions[1].question).toContain('the underlined word "available"?');
    expect(b.questions[1].options).toEqual(["out of reach", "valuable", "repetitive", "accessible"]);
  });
});

describe("r391 — ترازیابیِ کلیدِ رسمیِ بین‌خانواده‌ای (tests-g12 ↔ grammar-topic r292)", () => {
  it("l93 ↔ gt-l69: ق۱ (wind) + کلیدهای هفت‌گانهٔ ق۸-۱۴ همسان", () => {
    expect(L(93).questions[0].options[0]).toBe(GT(69).questions[0].accepted![0]);
    const ours = L(93).questions.slice(1).map((it) => it.options[it.answer]);
    const theirs = GT(69).questions.slice(1).map((it) => it.options[it.answer]);
    expect(ours).toEqual(theirs);
  });

  it("l94/l97/l98 ↔ gt-l70/gt-l73/gt-l74: acceptedها ردیف‌به‌ردیف (شاملِ hugِ تکمیل‌شده)", () => {
    expect(L(94).questions.map((it) => it.accepted)).toEqual(
      GT(70).questions.map((it) => it.accepted)
    );
    expect(L(97).questions.map((it) => it.accepted)).toEqual(
      GT(73).questions.map((it) => it.accepted)
    );
    expect(L(98).questions.map((it) => it.accepted)).toEqual(
      GT(74).questions.map((it) => it.accepted)
    );
  });

  it("l95/l96/l99/l100 ↔ gt-l71/gt-l72/gt-l75/gt-l77: کلیدهای واژگان و گرامر همسان", () => {
    expect(L(95).questions.map((it) => it.options[it.answer])).toEqual(
      GT(71).questions.map((it) => it.options[it.answer])
    );
    expect(L(96).questions.map((it) => it.options[it.answer])).toEqual(
      GT(72).questions.map((it) => it.accepted![0])
    );
    expect(L(99).questions.map((it) => it.options[it.answer])).toEqual(
      GT(75).questions.map((it) => it.options[it.answer])
    );
    expect(L(100).questions.map((it) => it.options[it.answer])).toEqual(
      GT(77).questions.map((it) => it.accepted![0])
    );
  });

  it("l101/l102 ↔ gt-l79/gt-l80: ردیف‌های کلیددارِ خوانداری‌ها همسان", () => {
    const ours101 = L(101).questions.map((it) => it.options[it.answer]);
    const theirs101 = GT(79).questions.slice(2).map((it) => it.options[it.answer]);
    expect(ours101).toEqual(theirs101);
    const ours102 = L(102).questions.map((it) => it.options[it.answer]);
    const theirs102 = GT(80).questions.slice(3).map((it) => it.options[it.answer]);
    expect(ours102).toEqual(theirs102);
  });

  it("کاندیدِ پاراگرافِ آب: جدولِ کلید ↔ gt-l78 (Topic=44/Supporting=42,43,47,46/Concluding=45)", () => {
    const roles = GT(78).questions.map((it) => it.answer);
    expect(roles).toEqual([1, 1, 0, 2, 1, 1]); // Supporting/Supporting/Topic/Concluding/Supporting/Supporting
    expect(GT(78).questions[2].question).toBe(
      "Water is the most essential element in our life."
    );
  });
});

describe("r391 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۱۰۲ بانک/[…,2,4,4,4,4,4,4,2,4,8,2,4,3,3,4,4,4,3,3]/۷۰۳ id یکتا — الگویِ g12-l1..l102", () => {
    expect(bank.lessons).toHaveLength(141);
    expect(bank.lessons.map((l) => l.count)).toEqual([
      100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7,
      4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1,
      2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2,
      4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6,
    ]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(851);
    expect(new Set(ids).size).toBe(851);
    expect(ids[665]).toBe("g12-l93-1");
    expect(ids[673]).toBe("g12-l94-1");
    expect(ids[675]).toBe("g12-l95-1");
    expect(ids[679]).toBe("g12-l96-1");
    expect(ids[682]).toBe("g12-l97-1");
    expect(ids[685]).toBe("g12-l98-1");
    expect(ids[689]).toBe("g12-l99-1");
    expect(ids[693]).toBe("g12-l100-1");
    expect(ids[697]).toBe("g12-l101-1");
    expect(ids[700]).toBe("g12-l102-1");
    expect(ids[702]).toBe("g12-l102-3");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("MCQ-خالصِ l93/l95/l96/l99-l102 و تایپیِ خالصِ l94/l97/l98", () => {
    for (const bn of [93, 95, 96, 99, 100, 101, 102])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    for (const bn of [94, 97, 98])
      for (const it of L(bn).questions) expect(it.kind).toBe("typed");
  });

  it("نشت‌سنجِ ردیف‌های مستثنیِ راند: bulletهای save-our-Earth/پاراگرافِ آب/خامِ جمله‌سازی/مدل‌های صوتیِ ق۱-۶ غایب‌اند", () => {
    const forbidden = [
      "Plant trees",
      "Use less fossil fuels",
      "Change waste to energy",
      "rained / brown", // ق۳۵ خام
      "famous / lives", // ق۳۶ خام
      "We cannot think of life without water", // پاراگرافِ آب = کاندیدِ ثبت‌شده (gt-l78)
      "huge resources of water",
      "most valuable liquid",
      "take temperature", // مدلِ صوتیِ ق۱ (ساقهٔ چاپی ندارد)
      "save our Earth",
    ];
    const all = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question + " " + q.options.join(" "))
      .join(" \n ")
      .toLowerCase();
    for (const s of forbidden) expect(all).not.toContain(s.toLowerCase());
  });

  it("خلوصِ لاتین: بدونِ حروفِ presentation-form و کنترلِ نامرئی در l93-l102", () => {
    for (const bn of [93, 94, 95, 96, 97, 98, 99, 100, 101, 102])
      for (const it of L(bn).questions) {
        const txt = it.question + it.options.join("");
        for (const ch of txt) {
          const code = ch.codePointAt(0)!;
          const bad =
            (code >= 0xfb50 && code <= 0xfdff) ||
            (code >= 0xfe70 && code <= 0xfeff) ||
            (code < 0x20 && code !== 0x0a);
          expect(bad, `${it.id} char U+${code.toString(16)}`).toBe(false);
        }
      }
  });
});
