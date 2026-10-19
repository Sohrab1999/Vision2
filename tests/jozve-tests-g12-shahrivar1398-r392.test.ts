import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r392 — برگهٔ چهاردهمِ نهایی‌ها: شهریور ۱۳۹۸ (ص۲۴۴-۲۴۸، کلیدِ ص۲۴۹-۲۵۰، ۱۲/۶/۱۳۹۸)
// ۱۲ بانک/۴۸ آیتم (l103-l114) — شش بانکِ تایپیِ تازه (l104/l106/l107/l108/l110/l111؛ مجموعِ تایپی‌های
// نهایی‌ها = ۱۱) + دو نخستین بانکِ ترکیبی (l103/l113) + نخستین بانکِ نقش‌محورِ استخراج‌شده (l112) +
// نخستین acceptedِ سه‌عضویِ نهایی‌ها (l108-4: would/might/could) + هم‌خانوادگیِ gt-l81-l92 (r292)
// با افزودهٔ ق۱۰-۱۴ که دوقلو ندارد.
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
const r14 = src.g12nahaie14 as Record<string, unknown>;

const DEF_B = [
  "to change in form or character",
  "to put things in a neat, attractive, or useful order",
  "to suddenly decide to do something",
  "to stop being angry with someone",
  "for all time",
];
const ROLES = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const VOC_HEAD = "Suppose that you have a very small vocabulary.";
const EN_HEAD = "What do people need to light their homes and drive cars? Energy!";

describe("r392 — رسیدِ برگهٔ شهریور ۱۳۹۸ (g12nahaie14)", () => {
  it("رسید: r392 / ۵۶ ردیف / ۴۸ استخراج / ۸ مستثنی / ۱۲ بانک [8,2,4,3,3,4,4,2,4,6,4,4]", () => {
    expect(r14.extractedRound).toBe("r392");
    expect(r14.sectionsTotal).toBe(56);
    expect(r14.sectionsExtracted).toBe(48);
    expect(r14.sectionsSkipped).toBe(8);
    expect(r14.items).toBe(48);
    expect(r14.bankCounts).toEqual([8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4]);
  });

  it("متاِمتحان: ۱۲/۶/۱۳۹۸ + presentation-forms + QRهای گوشهٔ بالا + شنیداریِ ۶سؤالی", () => {
    const meta = String(r14.examMeta);
    expect(meta).toContain("۱۲/۶/۱۳۹۸");
    expect(meta).toContain("presentation-forms");
    expect(meta).toContain("پاسخ نامه دارد");
    expect(meta).toContain("aee.medu.ir");
    expect(meta).toContain("Audio file (MP3)");
    const pages = String(r14.examPages);
    expect(pages).toContain("pdf-p244-248");
    expect(pages).toContain("pdf-p249-250");
  });

  it("کلید: سه‌گانهٔ would/might/could + جدولِ نقشِ فوتبال + False/Trueِ ۵۱/۵۲ + بدونِ کلیدِ بریده", () => {
    const kv = String(r14.keyVerification);
    expect(kv).toContain("30. would/ might/ could give");
    expect(kv).toContain("Topic=45");
    expect(kv).toContain("51. b/ False");
    expect(kv).toContain("52. a/ True");
    expect(kv).toContain("56. a/ turn");
    expect(kv).toContain("پاسخ سوال ۳ تا ۶ پیشنهادی است");
    // نخستین برگهٔ بدونِ هیچ کلیدِ بریده یا استنتاجی
    expect(kv).not.toContain("بریده");
  });

  it("paperMap: ۱۵ برگه استخراج شد، ۲ برگه باقی است", () => {
    const pm = String(r14.paperMap);
    expect(pm).toContain("۱۵ برگه استخراج شد، ۲ برگه باقی است");
    expect(pm).toContain("شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸) ← این راند");
    expect(pm).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶");
  });

  it("کوئیرک‌های چاپ: ۱۵ داوری (سه‌گانهٔ ۳۰/دو کلیدِ متفاوتِ ربط/اسلشِ چسبیده/…) و آپاستروف‌ها", () => {
    const pq = r14.printQuirks as string[];
    expect(pq.length).toBeGreaterThanOrEqual(15);
    const joined = pq.join(" | ");
    expect(joined).toContain("would/ might/ could give");
    expect(joined).toContain("37. or 38. so 39. but 40. and");
    expect(joined).toContain("آرتیفکتِ RTL");
    expect(joined).toContain("Concluding است (نه Topic)");
    expect(joined).toContain("آپاستروف‌های خمیده");
  });

  it("سرشماریِ دوقلو (gt-l81-l92) + افزودهٔ ق۱۰-۱۴ + مخزنِ ۸۳ ردیفی", () => {
    const tc = String(r14.twinCensus);
    expect(tc).toContain("grammar-g12-topic.json (l81-l92، ۴۳ آیتم)");
    expect(tc).toContain("ق۱۰-۱۱");
    expect(tc).toContain("ق۱۲-۱۴");
    const fn = String(r14.futureNote);
    expect(fn).toContain("۸۳ ردیف");
    expect(fn).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶");
  });
});

describe("r392 — بانک‌های l103-l107 (شنیداریِ ترکیبی + تایپی‌ها + تعریف)", () => {
  it("l103: ۸ ردیفِ ترکیبی — دو mcqِ سه‌گزینه‌ایِ چاپی + شش تایپیِ شنیداری (ساقه‌های باز + کلوژِ Sara/Nurse)", () => {
    const b = L(103);
    expect(b.count).toBe(8);
    expect(b.level).toBe("ترکیبی");
    expect(b.questions.map((it) => it.kind)).toEqual([
      undefined, undefined, "typed", "typed", "typed", "typed", "typed", "typed",
    ]);
    expect(b.questions[0].options).toEqual(["playing volleyball", "taking photographs", "picnic"]);
    expect(b.questions[0].answer).toBe(2);
    expect(b.questions[1].options).toEqual(["in the morning", "at midnight", "in the evening"]);
    expect(b.questions[1].answer).toBe(0);
    expect(b.questions[2].accepted).toEqual(["They flew their kites."]);
    expect(b.questions[3].question).toBe("How was the street at night?");
    expect(b.questions[3].accepted).toEqual(["It was dark and quiet."]);
    expect(b.questions[4].accepted).toEqual(["The driver waved him."]);
    expect(b.questions[5].question).toBe(
      "Sara: I guess I have only seen his name in my English book, but I'm not ------- about it."
    );
    expect(b.questions[5].accepted).toEqual(["sure"]);
    expect(b.questions[6].accepted).toEqual(["life"]);
    expect(b.questions[7].question).toBe(
      "Nurse: Dr. Gharib was born in Tehran in 1288. After receiving his diploma, he went ------- to study medicine."
    );
    expect(b.questions[7].accepted).toEqual(["abroad"]);
    for (const it of b.questions) {
      if (it.kind === "typed") {
        expect(it.options).toEqual([it.accepted![0]]);
        expect(it.answer).toBe(0);
      }
    }
  });

  it("l104: ۲ ردیفِ تایپیِ تصویریِ خودبسنده (pigeons/consume — الگویِ l94)", () => {
    const b = L(104);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["pigeons"], ["consume"]]);
    expect(b.questions[0].question).toBe(
      "My grandfather feeds the ------- in the park every morning."
    );
    expect(b.questions[1].question).toBe("The new light bulbs ------- less electricity.");
    for (const it of b.questions) {
      expect(it.options).toEqual([it.accepted![0]]);
      expect(it.answer).toBe(0);
    }
  });

  it("l105: تعریف‌یابیِ پنج‌گزینه‌ای — ستونِ B چاپیِ a-e، کلیدهای e/a/d/b، اضافیِ هرگز-کلیدِ c", () => {
    const b = L(105);
    expect(b.count).toBe(4);
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(DEF_B);
    expect(b.questions.map((it) => it.answer)).toEqual([4, 0, 3, 1]);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "for all time",
      "to change in form or character",
      "to stop being angry with someone",
      "to put things in a neat, attractive, or useful order",
    ]);
    expect(b.questions[1].question).toBe("Those sofas convert into bed.");
    // c اضافیِ چاپ هرگز کلید نشده
    for (const it of b.questions) expect(it.answer).not.toBe(2);
  });

  it("l106: بانکِ چاپِ چهارواژه‌ایِ تایپی — effectively/share/origin + generousِ اضافیِ چاپ", () => {
    const b = L(106);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["effectively"], ["share"], ["origin"]]);
    expect(b.questions[0].question).toBe(
      "Being able to communicate ------- is one of the most important life skills"
    ); // بدونِ نقطهٔ پایانیِ چاپ — وفادار
    for (const it of b.questions) {
      expect(it.options).toEqual([it.accepted![0]]);
      expect(it.answer).toBe(0);
    }
  });

  it("l107: ۳ ردیفِ تایپیِ حرف‌اول — d-------/i-------/d------- با حرفِ توپرِ چسبیده", () => {
    const b = L(107);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["diary"], ["introduction"], ["demand"]]);
    expect(b.questions[0].question).toBe(
      "I have recorded my thoughts and feelings on my d------- every day for 10 years."
    );
    expect(b.questions[1].question).toBe(
      "This book has only a two-page i-------. It is about the writer and his success."
    );
    expect(b.questions[2].question).toBe("Nowadays d------- for organic food is increasing.");
  });
});

describe("r392 — بانک‌های l108-l111 (فعلِ سه‌گانه + گرامر + جمله‌سازی + ربط)", () => {
  it("l108: ۴ ردیفِ تایپیِ فعل — نخستین acceptedِ سه‌عضویِ نهایی‌ها (would/might/could give)", () => {
    const b = L(108);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["be spent"],
      ["arrived"],
      ["came"],
      ["would give", "might give", "could give"], // سه‌گانهٔ چاپیِ «30. would/ might/ could give»
    ]);
    expect(b.questions[0].question).toBe(
      "I think more money should ------- on education. ( to spend )"
    );
    expect(b.questions[2].question).toBe(
      "Last night my father ------- home very late, didn't he? ( to come )"
    );
    expect(b.questions[3].question).toBe(
      "If we found two hundred dollars, we ------- it to the police station. ( to give )"
    );
  });

  it("l109: گرامر با چینشِ دیداریِ a-d — کلیدهای was taught/because/whom/into", () => {
    const b = L(109);
    expect(b.count).toBe(4);
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 3, 0]);
    expect(b.questions[0].options).toEqual(["had taught", "was taught", "taught", "will be taught"]);
    expect(b.questions[1].options).toEqual(["before", "although", "because", "when"]);
    expect(b.questions[2].options).toEqual(["where", "what", "which", "whom"]);
    expect(b.questions[3].options).toEqual(["into", "on", "up", "over"]);
    expect(b.questions[3].question).toBe("Aida burst ------- tears when she saw her score.");
  });

  it("l110: جمله‌سازیِ تایپی — خامِ چاپِ وفادار (/which چسبیده و فاصلهٔ دوبل) + دو ترتیبِ چاپِ ق۳۵", () => {
    const b = L(110);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions[0].question).toBe("very fast / the dog / is / can /which /runs / brown.");
    expect(b.questions[0].accepted).toEqual([
      "The dog which can run very fast is brown.",
      "The dog which is brown can run very fast.",
    ]);
    expect(b.questions[1].question).toBe(
      "employed /  during / a lot of / the last five years / have been / workers."
    );
    expect(b.questions[1].accepted).toEqual([
      "A lot of workers have been employed during the last five years.",
    ]);
  });

  it("l111: ربطِ تایپی — کلیدهای چاپیِ or/so/but/and (متمایز از mcqِ so/and/but/orِ خردادِ l100)", () => {
    const b = L(111);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["or"], ["so"], ["but"], ["and"]]);
    expect(b.questions[0].question).toBe("You can buy a shirt ------- you can save your money.");
    expect(b.questions[1].question).toBe(
      "There was nothing at home to eat ------- I went to a restaurant."
    );
    // تضادِ سالم با l100: ساقه‌های متفاوت، هر دو عینِ چاپِ خود
    expect(L(100).questions[0].options[L(100).questions[0].answer]).toBe("so");
    expect(b.questions[0].accepted![0]).toBe("or");
  });
});

describe("r392 — بانک‌های l112-l114 (نقش‌ها + دو خوانداری)", () => {
  it("l112: نخستین بانکِ نقش‌محورِ استخراج‌شده — سه‌گزینه‌ایِ [1,1,1,0,2,1] با کلیدِ جدولیِ چاپ", () => {
    const b = L(112);
    expect(b.count).toBe(6);
    expect(b.level).toBe("سه‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(ROLES);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 1, 1, 0, 2, 1]);
    expect(b.questions[3].question).toBe(
      "There are many popular sports in my country, but the most popular one is football."
    );
    expect(b.questions[4].question).toBe("Football is really a national sport in my country.");
  });

  it("l113: خوانداریِ واژگانِ ترکیبی — ق۴۸ تایپی + مترادفِ suppose + False/True؛ متنِ کامل در ساقه", () => {
    const b = L(113);
    expect(b.count).toBe(4);
    expect(b.level).toBe("ترکیبی");
    for (const it of b.questions) expect(it.question.startsWith(VOC_HEAD)).toBe(true);
    expect(b.questions[0].kind).toBe("typed");
    expect(b.questions[0].accepted).toEqual(["That word may stop my understanding of the passage."]);
    expect(b.questions[1].question).toContain('the word "suppose"');
    expect(b.questions[1].options).toEqual(["believe", "accept", "understand", "imagine"]);
    expect(b.questions[1].answer).toBe(3);
    expect(b.questions[2].options).toEqual(["True", "False"]);
    expect(b.questions[2].answer).toBe(1);
    expect(b.questions[3].options).toEqual(["True", "False"]);
    expect(b.questions[3].answer).toBe(0);
    // ق۴۹ به مخزن رفت — مدلفش در بانک‌ها نیست
    expect(b.questions[0].question).not.toContain("If we have");
  });

  it("l114: خوانداریِ انرژی — fossil fuels/wind-solar/goal/spin؛ متنِ کامل در ساقه", () => {
    const b = L(114);
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.question.startsWith(EN_HEAD)).toBe(true);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 1, 0]);
    expect(b.questions[0].options).toEqual(["the wind", "plants", "fossil fuels", "the sun"]);
    expect(b.questions[1].options).toEqual([
      "solar power and electricity",
      "wind power and solar power",
      "fossil fuels and wind power",
      "electricity and fossil fuels",
    ]);
    expect(b.questions[3].question).toContain('the word "spin"');
  });
});

describe("r392 — ترازیابیِ کلیدِ رسمیِ بین‌خانواده‌ای (tests-g12 ↔ grammar-topic r292)", () => {
  it("l103 ↔ gt-l81: ق۷-۹ هم‌نوعِ mcq/mcq/typed با کلیدهای همسان", () => {
    expect(L(103).questions[0].options[L(103).questions[0].answer]).toBe(
      GT(81).questions[0].options[GT(81).questions[0].answer]
    );
    expect(L(103).questions[1].options[L(103).questions[1].answer]).toBe(
      GT(81).questions[1].options[GT(81).questions[1].answer]
    );
    expect(L(103).questions[2].accepted).toEqual(GT(81).questions[2].accepted);
  });

  it("l104/l106/l107/l108 ↔ gt-l82/l84/l85/l86: acceptedها ردیف‌به‌ردیف (شاملِ سه‌گانهٔ would/might/could)", () => {
    expect(L(104).questions.map((it) => it.accepted)).toEqual(
      GT(82).questions.map((it) => it.accepted)
    );
    expect(L(106).questions.map((it) => it.accepted)).toEqual(
      GT(84).questions.map((it) => it.accepted)
    );
    expect(L(107).questions.map((it) => it.accepted)).toEqual(
      GT(85).questions.map((it) => it.accepted)
    );
    expect(L(108).questions.map((it) => it.accepted)).toEqual(
      GT(86).questions.map((it) => it.accepted)
    );
  });

  it("l105/l109/l112/l114 ↔ gt-l83/l87/l90/l92: کلیدهای واژگان و گرامر و نقش‌ها همسان", () => {
    expect(L(105).questions.map((it) => it.options[it.answer])).toEqual(
      GT(83).questions.map((it) => it.options[it.answer])
    );
    expect(L(109).questions.map((it) => it.options[it.answer])).toEqual(
      GT(87).questions.map((it) => it.options[it.answer])
    );
    expect(L(112).questions.map((it) => it.answer)).toEqual(
      GT(90).questions.map((it) => it.answer)
    );
    expect(L(114).questions.map((it) => it.options[it.answer])).toEqual(
      GT(92).questions.map((it) => it.options[it.answer])
    );
  });

  it("l110/l111 ↔ gt-l88/gt-l89: جمله‌سازی و ربطِ تایپیِ همسان (کلیدِ ربطِ or/so/but/and)", () => {
    expect(L(110).questions.map((it) => it.accepted)).toEqual(
      GT(88).questions.map((it) => it.accepted)
    );
    expect(L(111).questions.map((it) => it.accepted)).toEqual(
      GT(89).questions.map((it) => it.accepted)
    );
  });

  it("l113 ↔ gt-l91: ق۴۸ تایپی + کلیدهای ق۵۰-۵۲ همسان", () => {
    expect(L(113).questions[0].accepted).toEqual(GT(91).questions[0].accepted);
    expect(L(113).questions.slice(1).map((it) => it.options[it.answer])).toEqual(
      GT(91).questions.slice(1).map((it) => it.options[it.answer])
    );
  });

  it("افزودهٔ r392 فراتر از دوقلو: ق۱۰-۱۴ ساقه‌دارند ولی در gt-l81-l92 نیستند", () => {
    const gtIds = gt.lessons
      .filter((l) => l.lesson >= 81 && l.lesson <= 92)
      .flatMap((l) => l.questions.map((q) => q.question));
    expect(gtIds.join(" ")).not.toContain("How was the street at night");
    expect(gtIds.join(" ")).not.toContain("Dr. Gharib was born in Tehran in 1288");
  });
});

describe("r392 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۱۱۴ بانک/[…,4,8,2,4,3,3,4,4,4,3,3,8,2,4,3,3,4,4,2,4,6,4,4]/۷۵۱ id یکتا — الگویِ g12-l1..l114", () => {
    expect(bank.lessons).toHaveLength(128);
    expect(bank.lessons.map((l) => l.count)).toEqual([
      100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7,
      4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1,
      2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2,
      4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4,
    ]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(797);
    expect(new Set(ids).size).toBe(797);
    expect(ids[703]).toBe("g12-l103-1");
    expect(ids[711]).toBe("g12-l104-1");
    expect(ids[713]).toBe("g12-l105-1");
    expect(ids[717]).toBe("g12-l106-1");
    expect(ids[720]).toBe("g12-l107-1");
    expect(ids[723]).toBe("g12-l108-1");
    expect(ids[727]).toBe("g12-l109-1");
    expect(ids[731]).toBe("g12-l110-1");
    expect(ids[733]).toBe("g12-l111-1");
    expect(ids[737]).toBe("g12-l112-1");
    expect(ids[743]).toBe("g12-l113-1");
    expect(ids[747]).toBe("g12-l114-1");
    expect(ids[750]).toBe("g12-l114-4");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("MCQ-خالصِ l105/l109/l112/l114 و تایپیِ خالصِ l104/l106/l107/l108/l110/l111", () => {
    for (const bn of [105, 109, 112, 114])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    for (const bn of [104, 106, 107, 108, 110, 111])
      for (const it of L(bn).questions) expect(it.kind).toBe("typed");
    // بانک‌های ترکیبیِ l103/l113: هر آیتم یا mcqِ خالص یا تایپیِ با accepted
    for (const bn of [103, 113])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        if (it.kind === "typed") {
          expect(it.accepted!.length, it.id).toBeGreaterThanOrEqual(1);
        } else {
          expect(it.kind, `${it.id} must be mcq or typed`).toBeUndefined();
          expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        }
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنیِ راند: مدل‌های صوتیِ ق۱-۶/bulletهای smoking/مدلِ ق۴۹/خامِ پاراگرافِ نقش غایب‌اند", () => {
    const forbidden = [
      "take temperature", // مدلِ صوتیِ r391 — اطمینان از عدمِ نشتِ بین‌برگه‌ای
      "We can carry it", // مدلِ صوتیِ ق۳
      "I would found a company", // مدلِ صوتیِ ق۴
      "I feel proud or happy", // مدلِ صوتیِ ق۵
      "The foods which contain fat", // مدلِ صوتیِ ق۶
      "causing diseases such as lung cancer", // bulletِ چاپِ ق۴۱ (smoking)
      "increasing stress and depression", // bulletِ چاپِ ق۴۱
      "If we have a good vocabulary", // مدلِ چاپِ ق۴۹ — مخزن (متنِ ساقه «If you have» دارد)
      "how does having a good vocabulary influence", // ساقهٔ ق۴۹
    ];
    const all = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question + " " + q.options.join(" "))
      .join(" \n ")
      .toLowerCase();
    for (const s of forbidden) expect(all).not.toContain(s.toLowerCase());
  });

  it("خلوصِ لاتین: بدونِ حروفِ presentation-form و کنترلِ نامرئی در l103-l114", () => {
    for (const bn of [103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114])
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
