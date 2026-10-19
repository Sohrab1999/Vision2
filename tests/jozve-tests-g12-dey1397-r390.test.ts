import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r390 — برگهٔ دوازدهمِ نهایی‌ها: دی ۱۳۹۷ (ص۲۲۹-۲۳۳، کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶)
// ۹ بانک/۳۲ آیتم (l84-l92) — دومین بانکِ تایپیِ بخشِ نهایی‌ها (l88) +
// نخستین رندرِ دی۹۷-شنیداری در کل پروژه (l84) + هم‌خانوادگیِ بین‌خانواده‌ایِ gt-l59-68 (r292).
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
const r12 = src.g12nahaie12 as Record<string, unknown>;

const BRAIN =
  "The brain is more active at night than during the day. Most part of the brain is ------- (7) -------. When the brain does not have good and ------- (8) ------- food, it becomes smaller.";
const WIND =
  "Engineers design and make machines that measure wind and ------- (17) ------- wind into energy. They develop wind turbines that ------- (18) ------- electricity by considering the Earth's surface, wind direction, average outside temperature, the ------- (19) ------- by and on 'birds and insects, and the great forces on the ------- (20) -------";
const DEF_B = [
  "well-known .",
  "in a quiet way",
  "to finish something",
  "to take something in, especially gradually",
  "the amount of a product or service that people want",
];
const COLL_B = ["temperature", "the train", "a mistake", "no pains", "the needs"];
const CONN_OPTS = ["and", "or", "but", "so"];
const DICT_HEAD = "Just imagine how many English dictionaries there are in the world.";
const TEACH_HEAD = "Teachers are an essential part of our lives.";

describe("r390 — رسیدِ برگهٔ دی ۱۳۹۷ (g12nahaie12)", () => {
  it("رسید: r390 / ۱۶ سکشن / ۶۴ ردیف / ۳۲ آیتم / ۹ بانک [2,4,4,4,4,4,4,2,4]", () => {
    expect(r12.extractedRound).toBe("r390");
    expect(r12.sectionsTotal).toBe(64);
    expect(r12.sectionsExtracted).toBe(32);
    expect(r12.sectionsSkipped).toBe(32);
    expect(r12.items).toBe(32);
    expect(r12.bankCounts).toEqual([2, 4, 4, 4, 4, 4, 4, 2, 4]);
  });

  it("متاِمتحان: داوطلبِ آزادِ دیماه ۹۷ + یادداشتِ «سوالات پاسخنامه ندارد.» + تاریخِ ۹۷/۱۰/۱۲", () => {
    const meta = String(r12.examMeta);
    expect(meta).toContain("۹۷/۱۰/۱۲");
    expect(meta).toContain("داوطلبان آزاد و بزرگسال");
    expect(meta).toContain("سوالات پاسخنامه ندارد");
    expect(meta).toContain("presentation-forms");
    const pages = String(r12.examPages);
    expect(pages).toContain("pdf-p229-233");
    expect(pages).toContain("pdf-p234-236");
  });

  it("کلیدِ سربرگِ قدیمی: قالبِ «1 .a/ next week» و «33 .(c) who» و «25: d» + دوبلِ Trueِ ۵۸/۵۹", () => {
    const kv = String(r12.keyVerification);
    expect(kv).toContain("1 .a/ next week");
    expect(kv).toContain("33 .(c) who");
    expect(kv).toContain("25: d");
    expect(kv).toContain("29 . can open 30. would sell 31 .be paid 32 . had not washed");
    expect(kv).toContain(".59 (a) True");
    expect(kv).toContain("Horses are farm animals");
  });

  it("paperMap: ۱۳ برگه استخراج شد، ۴ برگه باقی است + نقشهٔ کامل", () => {
    const pm = String(r12.paperMap);
    expect(pm).toContain("۱۳ برگه استخراج شد، ۴ برگه باقی است");
    expect(pm).toContain("دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ ← این راند");
    expect(pm).toContain("خرداد ۱۳۹۸ ص۲۳۷-۲۴۱");
  });

  it("کوئیرک‌های چاپ: ۱۶ داوریِ 300dpi (lime/e d. no pains/d: didn't she/'birds/…)", () => {
    const pq = r12.printQuirks as string[];
    expect(pq.length).toBeGreaterThanOrEqual(16);
    const joined = pq.join(" | ");
    expect(joined).toContain("first lime");
    expect(joined).toContain("e d. no pains");
    expect(joined).toContain("didn't she");
    expect(joined).toContain("'birds");
    expect(joined).toContain("well-known .");
    expect(joined).toContain("you teachers");
  });

  it("سرشماریِ دوقلوی بین‌خانواده‌ای + مخزنِ تایپیِ ۷۵ ردیفی", () => {
    const tc = String(r12.twinCensus);
    expect(tc).toContain("grammar-g12-topic.json (l59-68، ۴۲ آیتم)");
    expect(tc).toContain("l84");
    const fn = String(r12.futureNote);
    expect(fn).toContain("۷۵ ردیف");
    expect(fn).toContain("مرتب‌سازیِ پاراگرافی");
  });
});

describe("r390 — بانک‌های l84-l87 (شنیداریِ چاپ + واژگان + تعریف + هم‌نشین)", () => {
  it("l84: کلوژِ شنیداریِ مغز — ۲ ردیف با استخرِ دومکلیدیِ water/healthy (چرخشِ ترتیب)", () => {
    const b = L(84);
    expect(b.count).toBe(2);
    expect(b.level).toBe("چهارگزینه‌ای");
    for (const it of b.questions) {
      expect(it.question).toContain(BRAIN);
      expect(it.question).toMatch(/— پاسخِ خانهٔ \([78]\): -------$/);
    }
    expect(b.questions[0].options).toEqual(["water", "healthy"]);
    expect(b.questions[1].options).toEqual(["healthy", "water"]);
    expect(b.questions[0].answer).toBe(0);
    expect(b.questions[1].answer).toBe(0);
    expect(b.questions[0].id).toBe("g12-l84-1");
    expect(b.questions[1].id).toBe("g12-l84-2");
  });

  it("l85: کلوژِ توربینِ بادی — ۵ گزینهٔ چاپی، کلید convert/generate/effect/turbine، اضافیِ هرگز-کلیدِ renewable", () => {
    const b = L(85);
    expect(b.count).toBe(4);
    const keyed = b.questions.map((it) => it.options[it.answer]);
    expect(keyed).toEqual(["convert", "generate", "effect", "turbine"]);
    for (const it of b.questions) {
      expect(it.options).toEqual(["generate", "renewable", "convert", "turbine", "effect"]);
      expect(it.question).toContain(WIND);
    }
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 4, 3]);
    expect(new Set(b.questions.map((it) => it.answer)).has(1)).toBe(false); // renewable هرگز کلید نیست
  });

  it("l86: تعریف‌یابی — ستون B با نقطهٔ سرگردانِ «well-known .»، کلیدهای b/a/e/c، اضافیِ هرگز-کلیدِ d", () => {
    const b = L(86);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "in a quiet way",
      "well-known .",
      "the amount of a product or service that people want",
      "to finish something",
    ]);
    for (const it of b.questions) expect(it.options).toEqual(DEF_B);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 4, 2]);
    expect(b.questions.map((it) => it.question)).toEqual([
      "تعریفِ ستون B برای واژهٔ «calmly»: -------",
      "تعریفِ ستون B برای واژهٔ «Distinguished»: -------",
      "تعریفِ ستون B برای واژهٔ «Demand»: -------",
      "تعریفِ ستون B برای واژهٔ «Use up»: -------",
    ]);
  });

  it("l87: هم‌نشین‌ها — ستون B چاپی، کلیدهای d/c/e/a، اضافیِ هرگز-کلیدِ «the train»", () => {
    const b = L(87);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "no pains",
      "a mistake",
      "the needs",
      "temperature",
    ]);
    for (const it of b.questions) expect(it.options).toEqual(COLL_B);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 2, 4, 0]);
  });
});

describe("r390 — بانکِ تایپیِ l88 (دومین بانکِ تایپیِ بخشِ نهایی‌ها)", () => {
  it("l88: ۴ ردیفِ kind=typed با accepted عینِ کلیدِ چاپیِ سربرگ (شکلِ کشیده)", () => {
    const b = L(88);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.kind)).toEqual(["typed", "typed", "typed", "typed"]);
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["can open"],
      ["would sell"],
      ["be paid"],
      ["had not washed"],
    ]);
    for (const it of b.questions) {
      expect(it.options).toEqual([it.accepted![0]]);
      expect(it.answer).toBe(0);
      expect(it.placeholder).toBeUndefined();
    }
    expect(b.questions[0].question).toBe("The little boy ------- the box, can't he? (to open )");
    expect(b.questions[3].question).toBe(
      "My mother was very angry with my sister because she ------- the dishes. (not to wash)"
    );
  });

  it("ترازیابیِ بین‌خانواده‌ای: acceptedِ l88 == gt-l62 (r292) ردیف‌به‌ردیف", () => {
    const ours = L(88).questions.map((it) => it.accepted![0]);
    const theirs = GT(62).questions.map((it) => it.accepted![0]);
    expect(ours).toEqual(theirs);
  });
});

describe("r390 — بانک‌های l89-l92 (گرامر + ربط + دو خوانداری)", () => {
  it("l89: ۴ تستِ گرامر — کلید who/was posted/didn't she/out با کوئیرک‌های چاپِ وفادار", () => {
    const b = L(89);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 3, 1]);
    expect(b.questions[0].question).toBe("The man ------- is wearing glasses is Reza's uncle.");
    expect(b.questions[2].options).toEqual(["did he", "did she", "didn't he", "didn't she"]);
    expect(b.questions[3].question).toBe("I couldn't figure ------- What they were talking about."); // W بزرگِ چاپ
    expect(b.questions[1].options).toEqual(["was posted", "posted", "was posting", "has posted"]);
  });

  it("l90: حروفِ ربط — ترتیبِ چاپِ راهنما (and/or/but/so)، کلیدهای but/so/and/or", () => {
    const b = L(90);
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.options).toEqual(CONN_OPTS);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual(["but", "so", "and", "or"]);
    expect(b.questions[0].question).toBe("Mrs. Tehrani likes fish, ------- her grandmother hates it.");
    expect(b.questions[2].question).toBe("The woman washed the dishes, ------- her daughter dried them.");
  });

  it("l91: خوانداریِ فرهنگ‌لغت‌ها — دوبلِ Trueِ چاپ (۵۸/۵۹ هر دو True)", () => {
    const b = L(91);
    expect(b.count).toBe(2);
    for (const it of b.questions) {
      expect(it.question.startsWith(DICT_HEAD)).toBe(true);
      expect(it.options).toEqual(["True", "False"]);
      expect(it.answer).toBe(0);
    }
    expect(b.questions[1].question).toContain(
      "You can correct your pronunciation by using an electronic dictionary."
    );
  });

  it("l92: خوانداریِ معلمان — limeِ چاپی و کوتیشنِ مخلوطِ «then» وفادار می‌مانند؛ کلیدهای c/d/False/False", () => {
    const b = L(92);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 3, 1, 1]);
    expect(b.questions[0].question).toContain("essential in the first lime mean?");
    expect(b.questions[1].question).toContain('What does the word "then” refer to?');
    expect(b.questions[1].options).toEqual(["subjects", "classes", "teachers", "students' names"]);
    for (const it of b.questions.slice(2)) {
      expect(it.question.startsWith(TEACH_HEAD)).toBe(true);
      expect(it.options).toEqual(["True", "False"]);
    }
  });
});

describe("r390 — ترازیابیِ کلیدِ رسمیِ بین‌خانواده‌ای (tests-g12 ↔ grammar-topic r292)", () => {
  it("l85 ↔ gt-l59: همان چهار کلیدِ convert/generate/effect/turbine", () => {
    const ours = L(85).questions.map((it) => it.options[it.answer]);
    const theirs = GT(59).questions.map((it) => it.accepted![0]);
    expect(ours).toEqual(theirs);
  });

  it("l86/l87 ↔ gt-l60/gt-l61: جفت‌های واژه-تعریف/هم‌نشینِ همسان (با تفاوتِ نقطهٔ سرگردانِ چاپِ ما)", () => {
    const ours86 = L(86).questions.map((it) => it.options[it.answer]);
    const theirs86 = GT(60).questions.map((it) => it.options[it.answer]);
    expect(ours86.map((w) => w.replace(" .", ""))).toEqual(theirs86); // «well-known .» چاپی ↔ «well-known» شسته‌شدهٔ gt
    expect(ours86).not.toEqual(theirs86); // وفاداریِ چاپِ ما حفظ شده
    const ours87 = L(87).questions.map((it) => it.options[it.answer]);
    const theirs87 = GT(61).questions.map((it) => it.options[it.answer]);
    expect(ours87).toEqual(theirs87);
  });

  it("l89/l90 ↔ gt-l63/gt-l65: کلیدهای گرامر و ربط همسان", () => {
    const ours89 = L(89).questions.map((it) => it.options[it.answer]);
    const theirs89 = GT(63).questions.map((it) => it.options[it.answer]);
    expect(ours89).toEqual(theirs89);
    const ours90 = L(90).questions.map((it) => it.options[it.answer]);
    const theirs90 = GT(65).questions.map((it) => it.accepted![0]);
    expect(ours90).toEqual(theirs90);
  });
});

describe("r390 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۹۲ بانک/[…,3,3,5,4,4,4,4,4,2,2,4,4,4,4,4,4,4,2,4]/۶۶۵ id یکتا — الگویِ g12-l1..l92", () => {
    expect(bank.lessons).toHaveLength(141);
    expect(bank.lessons.map((l) => l.count)).toEqual([
      100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7,
      4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1,
      2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4,
      2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(851);
    expect(new Set(ids).size).toBe(851);
    expect(ids[633]).toBe("g12-l84-1");
    expect(ids[635]).toBe("g12-l85-1");
    expect(ids[639]).toBe("g12-l86-1");
    expect(ids[643]).toBe("g12-l87-1");
    expect(ids[647]).toBe("g12-l88-1");
    expect(ids[651]).toBe("g12-l89-1");
    expect(ids[655]).toBe("g12-l90-1");
    expect(ids[659]).toBe("g12-l91-1");
    expect(ids[661]).toBe("g12-l92-1");
    expect(ids[664]).toBe("g12-l92-4");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("MCQ-خالصِ l84-l87 و l89-l92: بی‌ترجمه/بی‌kind/بی‌accepted و گزینه‌های یکتا؛ l88 تنها تایپیِ تازه", () => {
    for (const bn of [84, 85, 86, 87, 89, 90, 91, 92])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    for (const it of L(88).questions) expect(it.kind).toBe("typed");
  });

  it("نشت‌سنجِ ردیف‌های مستثنیِ راند: شنیداریِ صوتی/سپیکینگ/جمله‌سازیِ خام و پاراگرافِ اسب‌ها غایب‌اند", () => {
    const forbidden = [
      "When is her birthday",
      "next Monday",
      "What color was the dress",
      "Did her mother like the dress",
      "Cooking is easy for her",
      "Her older sister helps her cook",
      "duties of children",
      "what do you write on it",
      "Individual sports or team sports",
      "types of clean energy",
      "carry everywhere",
      "favorite school subject",
      "a bag I always", // ق۳۷ خامِ جمله‌سازی (مدلِ چاپیِ key متنِ بانک نیست)
      "she Mina", // ق۳۸ خام
      "Horses are farm animals", // پاراگرافِ اسب‌ها = کاندیدِ ثبت‌شده؛ رندرِ نقش‌محورش در gt-l66 است
    ];
    const all = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question + " " + q.options.join(" "))
      .join(" \n ")
      .toLowerCase();
    for (const s of forbidden) expect(all).not.toContain(s.toLowerCase());
  });

  it("خلوصِ لاتین: بدونِ حروفِ presentation-form و کنترلِ نامرئی در l84-l92", () => {
    for (const bn of [84, 85, 86, 87, 88, 89, 90, 91, 92])
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
