/**
 * r384 — گاردِ برگهٔ پنجمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ خرداد ۱۴۰۰، واریانتِ رشتهٔ
 * ادبیات و علوم انسانی-علوم و معارف اسلامی (pdf-p315-319)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p320-321) → ۷ بانکِ تازه/۲۹ آیتم در tests-g12.json
 * (مجموع: ۳۵ بانک/۴۵۰ آیتم)
 *
 * نکاتِ راند: (۱) سومین برگهٔ presentation-forms — با شکستگیِ «اﻣ ﺘﺤﺎن» در سربرگ (برخلافِ
 * اﻣﺘﺤﺎنِ چسبیدهٔ r382/r383). (۲) کشفِ راند: نقشهٔ کاملِ ۱۷برگه‌ایِ بخشِ ۴ (ص۲۲۸-۳۴۹) —
 * جفتِ دی ۱۳۹۷ با کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶، جفت‌های دوگانهٔ خردادِ ۹۹/۱۴۰۰ (ریاضی-تجربی
 * و انسانی)، ویژهٔ ناشنوایانِ شهریور ۹۹، و برگهٔ لایه‌خرابِ ص۲۷۷-۲۸۴. (۳) بلوکِ درهمِ س۱۱
 * (۳۲/۳۳) با داوریِ رندرِ ۳۰۰dpi خوانده شد — پنجمین تکرارِ درسِ r380-ق۳۲. (۴) «37. ( b )»
 * چهارمین بار. (۵) ق۴۶ «cities.………… .» — نقطه+نقطه‌چین+نقطه — پس از norm «cities------- .».
 * (۶) l35 نخستین بانکِ شش‌گزینه‌ایِ مرتب‌سازیِ مخزن (پاراگرافِ مورچه‌ها، کلیدهای چاپی d,a,c,b,f,e).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[];
};
type Bank = { lesson: number; title: string; level?: string; count: number; questions: Q[] };
type Doc = { grade: number; lessons: Bank[]; source: Record<string, Record<string, unknown>> };

const bank = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = bank.lessons.find((x) => x.lesson === n);
  expect(b, `bank g12-l${n} missing`).toBeDefined();
  return b as Bank;
};
const keyed = (bn: number) => L(bn).questions.map((it) => it.options[it.answer]);

const rec = bank.source.g12nahaie5 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r384) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p315 = slicePage(315);
const p316 = slicePage(316);
const p317 = slicePage(317);
const p318 = slicePage(318);
const p319 = slicePage(319);
const p320 = slicePage(320);
const p321 = slicePage(321);
const joinSeg = (pages: string[], startFrag: string, endFrag?: string, afterStart = false, incl = false) => {
  let s = pages.findIndex((l) => l.includes(startFrag));
  expect(s, startFrag).toBeGreaterThanOrEqual(0);
  let e = -1;
  if (endFrag) {
    e = pages.findIndex((l, i) => i > (afterStart ? s : -1) && l.includes(endFrag));
  }
  const seg = pages.slice(s, e < 0 ? undefined : incl ? e + 1 : e).map((l) => l.trim()).filter(Boolean);
  return seg.join(" ").replace(/\s{2,}/g, " ");
};
const normStem = (raw: string) =>
  raw.replace(/…/g, "...").replace(/\s{2,}/g, " ").replace(/[….]{4,}/g, "-------");

describe("r384 — رسیدِ g12nahaie5 (نهاییِ خرداد ۱۴۰۰ انسانی با کلیدِ رسمی)", () => {
  it("رسید: r384، ص۳۱۵-۳۱۹ + راهنمای تصحیحِ ص۳۲۰-۳۲۱، ۵۷ ردیف/۲۹ استخراج/۲۸ مستثنی، ۲۹ آیتم در [7,4,3,3,4,2,6]", () => {
    expect(rec.extractedRound).toBe("r384");
    expect(rec.section).toContain("خرداد ۱۴۰۰");
    expect(rec.section).toContain("برگهٔ پنجم");
    expect(rec.section).toContain("انسانی");
    expect(rec.examPages).toContain("pdf-p315-319");
    expect(rec.examPages).toContain("320-321");
    expect(rec.examMeta).toContain("خرداد");
    expect(rec.examMeta).toContain("۱۸/۰۳/۱۴۰۰");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۸ صبح");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("3. sister");
    expect(rec.keyVerification).toContain("26. come");
    expect(rec.keyVerification).toContain("31. was broken");
    expect(rec.keyVerification).toContain("37. ( b )");
    expect(rec.keyVerification).toContain("48. and 49. but");
    expect(rec.keyVerification).toContain("Roya was upset because she had gotten a bad score.");
    expect(rec.keyVerification).toContain("John could fix the car if he were at home.");
    expect(rec.sectionsTotal).toBe(57);
    expect(rec.sectionsExtracted).toBe(29);
    expect(rec.sectionsSkipped).toBe(28);
    expect(rec.items).toBe(29);
    expect(rec.bankCounts).toEqual([7, 4, 3, 3, 4, 2, 6]);
    expect(rec.keyPolicy).toContain("effectively");
    expect(rec.keyPolicy).toContain("[3,0,2,1,5,4]");
    expect(rec.engineNote).toContain("مرتب‌سازی");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: نقشهٔ کاملِ ۱۷برگه‌ایِ بخشِ ۴ — پنج برگه استخراج/۱۲ باقی + برگهٔ لایه‌خراب", () => {
    expect(rec.paperMap).toContain("۱۷ برگه");
    expect(rec.paperMap).toContain("دی ۱۳۹۷ ص۲۲۹-۲۳۳");
    expect(rec.paperMap).toContain("کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۸ ص۲۳۷-۲۴۱");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۸ ص۲۴۴-۲۴۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴");
    expect(rec.paperMap).toContain("لایه‌خراب ص۲۷۷-۲۸۴");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۹ ص۲۸۵-۲۹۰");
    expect(rec.paperMap).toContain("ویژهٔ ناشنوایان ص۲۹۳-۲۹۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۹ ص۳۰۱-۳۰۵");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۲");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱");
    expect(rec.futureNote).toContain("۳۴ ردیف");
    expect(rec.futureNote).toContain("۱۲ برگه باقی است");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/بازِ تایپی/تولیدی) + داوریِ رندرِ س۵", () => {
    expect(rec.skippedSections).toHaveLength(10);
    expect(rec.skippedSections.some((s) => s.includes("1.True(a)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("3.sister"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("8.famous"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("صفارزاده"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("(16) پدرِ عصبانی به پسر"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("توربین‌های بادی→e"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("was broken"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("or you should wash the dishes"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Natural home of animals"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("اﻣ ﺘﺤﺎن"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۳۰۰dpi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("cities.………… ."))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("37. ( b )"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("a)."))).toBe(true);
  });
});

describe("r384 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const p315join = joinSeg(p315, "ﺑﺎﺳﻤﻪ");
    expect(p315join).toContain("ﺳﺆاﻻت");
    expect(p315join).toContain("1400");
    expect(p315join).toContain("ﺧﺮداد");
    expect(p315join).toContain("اﻧﺴﺎﻧﯽ");
    expect(p315join).toContain("aee.medu.ir");
    const keyjoin = joinSeg(p320, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p321, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. True (a)", "2. False (b)", "3. sister",
      "8. famous", "9. final", "10. taken", "11. lived",
      "13.True (a)", "16. (d)", "17. (e)", "18. (c)", "19. (b)",
      "20. absorb", "21. introduction", "22. hugged",
      "23. (d)", "24. (c)", "25. (b)", "26. come",
      "27. (c)", "28. (a)", "29. (c)", "30. (b)", "31. was broken",
      "35. (a) True", "36. (b) False", "37. ( b )", "38. They feel honored.",
      "41. (b)", "42. entry", "43. collocations",
      "44. (a) True", "45. (a) True", "46. (c)", "47.(a)",
      "48. and", "49. but", "or you should wash the dishes",
      "(d) Ants are hardworking insects.", "(a) Throughout the summer",
      "(c) Whenever they find sweet", "(b) they stick to the sweet",
      "(f) Thus, in this way", "(e) As a result",
    ]) expect(keyjoin).toContain(kf);
  });

  it("بلوکِ درهمِ س۱۱: فرگمنت‌های واقعیِ لایه؛ کلیدِ کامل فقط با داوریِ رندر", () => {
    const keyjoin = joinSeg(p320, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const frag of ["score", "a bad", "had gotten", "was upset", "Roya",
                        "were at home", "could fix", "the car", "John"])
      expect(keyjoin).toContain(frag);
    // کلیدِ کامل در لایه نیست (سطرشکنِ RTL) — فقط در رسیدِ داوری‌شده
    expect(keyjoin).not.toContain("Roya was upset because she had gotten");
  });

  it("متنِ هر سه خوانداری در لایه + جملاتِ مرتب‌سازیِ س۱۸", () => {
    const e = normStem(joinSeg(p317, "It is very important for us to respect", "appreciate their love and respect them.", true, true));
    expect(e).toContain("elders were not born elders; they were kids like us");
    const dict = normStem(joinSeg(p318, "A good dictionary gives the user information", "expand your vocabulary.", true, true));
    expect(dict).toContain("Read the Guide Words");
    expect(dict).toContain("Look for Collocations");
    const hy = normStem(joinSeg(p318, "Hydropower is a type of renewable energy", "they are saved for future.", true, true));
    expect(hy).toContain("endless system");
    const p319join = joinSeg(p319, "Writing", "Forests");
    for (const s of ["Throughout the summer, they collect food", "they stick to the sweet",
                     "Whenever they find sweet lying on the floor,", "Ants are hardworking insects.",
                     "As a result, they are known as helpful", "Thus, in this way, they clean the floor"])
      expect(p319join).toContain(s);
  });
});

describe("r384 — بانک l29 (س۶-س۸): واژگان و تعریف و اصطلاح", () => {
  const b = L(29);

  it("س۶: سه ساقهٔ verbatim با بانکِ چاپیِ چهارواژه‌ای (hugged, introduction, absorb, effectively) — اضافیِ هرگز-کلید", () => {
    expect(b.title).toContain("واژگان و تعریف و اصطلاح");
    expect(keyed(29).slice(0, 3)).toEqual(["absorb", "introduction", "hugged"]);
    expect(b.questions.slice(0, 3).map((it) => it.answer)).toEqual([2, 1, 0]);
    for (const it of b.questions.slice(0, 3)) {
      expect(it.options).toEqual(["hugged", "introduction", "absorb", "effectively"]);
      expect(it.question).not.toContain("effectively");
    }
    expect(b.questions[0].question).toBe("Plants ------- carbon dioxide.");
    expect(b.questions[1].question).toBe("This book has only a two-page ------- .");
    expect(b.questions[2].question).toBe("My uncle went to his son and ------- him.");
  });

  it("س۷: تعریف‌یابی A/B — ستون B به ترتیبِ چاپ، اضافیِ «cry suddenly» هرگز-کلید", () => {
    expect(keyed(29).slice(3, 6)).toEqual(["in a quiet way", "the rise and fall of the sea", "for all time"]);
    for (const it of b.questions.slice(3, 6)) {
      expect(it.options).toEqual(["cry suddenly", "for all time", "the rise and fall of the sea", "in a quiet way"]);
      expect(it.options[it.answer]).not.toBe("cry suddenly");
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
  });

  it("س۸: اصطلاحِ «Easy c - - - , easy go» — چهارِ ۴حرفیِ c-دار، کلیدِ come", () => {
    const it = b.questions[6];
    expect(it.question).toBe("A: When you get money quickly, it’s easy to spend it or lose it quickly as well. B: You know that “Easy c - - - , easy go”.");
    expect(it.options).toEqual(["come", "cost", "care", "calm"]);
    expect(it.answer).toBe(0);
    for (const o of it.options) expect(o).toMatch(/^c[a-z]{3}$/);
  });
});

describe("r384 — بانک l30 (س۹): گرامر با گزینه‌های verbatimِ چاپ", () => {
  const b = L(30);

  it("چهار ساقهٔ verbatim؛ کلیدهای چاپی [c,a,c,b]؛ «didn’t we» حواس‌پرترِ چاپ در ق۲۷", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(30)).toEqual(["didn’t they", "whom", "had eaten", "must be obeyed"]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 2, 1]);
    expect(b.questions[0].options).toEqual(["do they", "didn’t we", "didn’t they", "don’t you"]);
    expect(b.questions[1].options).toEqual(["whom", "when", "where", "which"]);
    expect(b.questions[2].options).toEqual(["am eating", "will eat", "had eaten", "eat"]);
    expect(b.questions[3].options).toEqual(["may obey", "must be obeyed", "obeyed", "has obeyed"]);
    expect(b.questions[0].question).toBe("They invited you to their party, ------- ?");
    expect(b.questions[1].question).toBe("A: What did the students want to do? B: They wanted to talk to the teacher ------- Ali met before.");
    expect(b.questions[2].question).toBe("I ------- lunch before I went out.");
    expect(b.questions[3].question).toBe("A: How can we have better streets? B: The traffic rules ------- by everyone.");
  });
});

describe("r384 — بانک‌های خوانداری l31/l32/l33: هر آیتم متنِ کاملِ چاپی را در ساقه دارد", () => {
  it("l31 (س۱۳ بزرگ‌ترها): کلیدهای [True,False,parents] — کلیدِ «( b )» چهارمین کوئیرک", () => {
    const b = L(31);
    expect(b.title).toContain("احترام به بزرگ‌ترها");
    expect(keyed(31)).toEqual(["True", "False", "parents"]);
    for (const it of b.questions) {
      expect(it.question).toContain("It is very important for us to respect our elders");
      expect(it.question).toContain("appreciate their love and respect them.");
    }
    expect(b.questions[2].question).toContain("What does “they” in the third line of paragraph 2 refer to?");
    expect(b.questions[2].options).toEqual(["future generations", "parents", "teachers", "lives"]);
  });

  it("l32 (س۱۴ فرهنگِ لغت): کلیدهای [False,True,guide words] — متن با سه نکتهٔ راهنما در ساقه", () => {
    const b = L(32);
    expect(b.title).toContain("فرهنگِ لغت");
    expect(keyed(32)).toEqual(["False", "True", "guide words"]);
    for (const it of b.questions) {
      expect(it.question).toContain("A good dictionary gives the user information");
      expect(it.question).toContain("expand your vocabulary.");
    }
    expect(b.questions[2].question).toBe(
      `${b.questions[2].question.split(" — ")[0]} — According to the passage, ------- are the two words at the top of each page that show the first and last entries on the page.`,
    );
    expect(b.questions[2].options).toEqual(["definitions", "guide words", "pronunciations", "spellings"]);
  });

  it("l33 (س۱۵ آبی‌برق): کلیدهای [True,True,clean,saved] — دوبلِ Trueِ چاپ در ۴۴/۴۵", () => {
    const b = L(33);
    expect(b.title).toContain("آبی‌برق");
    expect(keyed(33)).toEqual(["True", "True", "clean", "saved"]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 0, 2, 0]);
    for (const it of b.questions) {
      expect(it.question).toContain("Hydropower is a type of renewable energy");
      expect(it.question).toContain("they are saved for future.");
    }
    expect(b.questions[2].question).toContain("to keep the cities------- .");
    expect(b.questions[3].question).toContain("they are ------- for future.");
  });
});

describe("r384 — بانک l34 (س۱۶): حروفِ ربط با بانکِ چاپی (but, and, so, or)", () => {
  const b = L(34);

  it("دو ساقهٔ verbatim؛ کلیدهای [and, but] در اندیس‌های [1,0]", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(34)).toEqual(["and", "but"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toBe("I get up early in the morning, ------- I make an omelet myself.");
    expect(b.questions[1].question).toBe("There is snow in the street, ------- it’s not too cold.");
  });
});

describe("r384 — بانک l35 (س۱۸): نخستین بانکِ شش‌گزینه‌ایِ مرتب‌سازی (پاراگرافِ مورچه‌ها)", () => {
  const b = L(35);

  it("شش آیتمِ شش‌گزینه‌ای با گزینه‌های a-f به ترتیبِ چاپ؛ کلیدهای چاپی [d,a,c,b,f,e] در [3,0,2,1,5,4]", () => {
    expect(b.title).toContain("مرتب‌سازیِ پاراگرافِ مورچه‌ها");
    expect(b.level).toBe("شش‌گزینه‌ای");
    expect(b.questions).toHaveLength(6);
    const ANTS = [
      "Throughout the summer, they collect food for the winter season.",
      "they stick to the sweet and carry it to their home.",
      "Whenever they find sweet lying on the floor,",
      "Ants are hardworking insects.",
      "As a result, they are known as helpful and active insects.",
      "Thus, in this way, they clean the floor.",
    ];
    expect(keyed(35)).toEqual([ANTS[3], ANTS[0], ANTS[2], ANTS[1], ANTS[5], ANTS[4]]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0, 2, 1, 5, 4]);
    for (const it of b.questions) {
      expect(it.options).toEqual(ANTS);
      expect(new Set(it.options).size).toBe(6);
      expect(it.question).toContain("مرتب‌سازیِ پاراگرافِ مورچه‌ها (س۱۸، ص۳۱۹)");
      expect(it.question).toContain("جملاتِ درهم‌ریختهٔ a تا f");
    }
    expect(b.questions[0].question).toContain("جایگاهِ ۵۱ (جملهٔ آغازینِ پاراگراف)");
    expect(b.questions[5].question).toContain("جایگاهِ ۵۶ (پایان‌بندیِ پاراگراف)");
  });
});

describe("r384 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۳۵ بانک/[…,2,2,7,4,3,3,4,2,6]/۴۵۰ id یکتا — الگویِ g12-l1..l35", () => {
    expect(bank.lessons).toHaveLength(114);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(751);
    expect(new Set(ids).size).toBe(751);
    expect(ids[421]).toBe("g12-l29-1");
    expect(ids[428]).toBe("g12-l30-1");
    expect(ids[432]).toBe("g12-l31-1");
    expect(ids[435]).toBe("g12-l32-1");
    expect(ids[438]).toBe("g12-l33-1");
    expect(ids[442]).toBe("g12-l34-1");
    expect(ids[444]).toBe("g12-l35-1");
    expect(ids[449]).toBe("g12-l35-6");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102, 105, 109, 112, 114])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنی (دامنه‌راندی: بانک‌های ۲۹-۳۵ — درسِ omelet): شنیداریِ صوتیِ س۱-س۴، تصویریِ س۵، بازِ تایپیِ س۱۰-س۱۲ و ۳۸/۴۲/۴۳، تصویریِ س۱۷ و تولیدیِ س۱۹ غایب‌اند", () => {
    // r387: «wash the dishes» (کلیدِ تصویری-کلیدِ س۱۷ این برگه) اکنون در متنِ چاپیِ خوانداریِ
    // احترامِ برگهٔ شهریور ۱۳۹۹ (l55-r387) هم هست — برخوردِ مشروعِ بین‌برگه‌ای؛ نشت‌سنجِ این
    // راند به بانک‌های خودش (۲۹-۳۵) محدود شد — همان تعمیمِ r383 (۲۲-۲۸) و r385 (۳۶-۴۲)
    const all = bank.lessons.filter((b2) => b2.lesson >= 29 && b2.lesson <= 35).flatMap((b2) => b2.questions);
    for (const forbidden of [
      "Zohreh has invited everyone but Mina", // س۱ (شنیداریِ صوتی)
      "Holy Defense", // س۲ گزینهٔ c (شنیداریِ صوتی)
      "Asadi Tusi", // س۳ (شنیداریِ کلوژ)
      "Saffarzadeh", // س۴ (شنیداریِ درست/غلط)
      "Iran is rich in oil resources", // س۵ اضافیِ چاپی
      "by that boy yesterday", // س۱۰ (بازِ تایپی)
      "Roya was upset", // س۱۱ پاسخِ مدل (تایپی)
      "could fix the car", // س۱۱ پاسخِ مدل (تایپی)
      "An ostrich", // س۱۲ (تایپی/تولیدی)
      "They feel honored.", // ردیف ۳۸ (تایپی) — با نقطه؛ متنِ خوانداریِ l31 «They feel honored when» دارد
      "wash the dishes", // س۱۷ (تصویری-کلید)
      "Natural home of animals", // س۱۹ چیپ
      "Source of fresh air", // س۱۹ چیپ
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l29 (ق۱-۳/۷) و l30/l31/l32/l33/l34 ساقهٔ لاتینِ خالص؛ l29 (ق۴-۶) و l35 ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(29).questions.slice(0, 3), L(29).questions[6]]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(29).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [30, 31, 32, 33, 34]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of [...L(35).questions]) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
