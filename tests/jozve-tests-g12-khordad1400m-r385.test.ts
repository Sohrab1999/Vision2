/**
 * r385 — گاردِ برگهٔ ششمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ خرداد ۱۴۰۰، واریانتِ رشتهٔ
 * ریاضی-فیزیک و علوم تجربی (pdf-p308-312)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p313-314) → ۷ بانکِ تازه/۳۱ آیتم در tests-g12.json
 * (مجموع: ۴۲ بانک/۴۸۱ آیتم)
 *
 * نکاتِ راند: (۱) چهارمین برگهٔ presentation-forms — با اﻣﺘﺤﺎنِ چسبیده (الگویِ r382/r383).
 * (۲) برخوردِ بین‌برگه‌ایِ بی‌خطر: هستهٔ متنِ خورشیدیِ س۱۴ عیناً در انتهای متنِ انرژیِ
 * r382-ل۱۹ هست (با «Different kinds» به‌جای «Different types» و ادامهٔ بلندتر) و کلیدِ
 * س۱۷ عینِ r382-س۱۷ است (هر دو مستثنی). (۳) «I have kept a diary» اضافیِ چاپیِ س۵ِ این
 * برگه — در r383-ل۲۳-۶ به‌عنوانِ ساقهٔ تعریفِ «diary» مشروع است (درسِ omelet؛ نشت‌سنجِ
 * راندی شد). (۴) بلوکِ درهمِ س۱۱ (۳۲/۳۳) با داوریِ رندرِ ۳۰۰dpi خوانده شد — ششمین تکرارِ
 * درسِ r380-ق۳۲. (۵) دو کلیدِ پرانتز-فاصله‌دار در یک صفحه: «37. ( c )» و «42. ( a )» + «47 .(d)»
 * با نقطهٔ قبل از شماره. (۶) نقطه‌چینِ چسبیده به واژهٔ بعدی در ق۴۲/۴۷/۴۹ («-------in»).
 * (۷) l42 دومین بانکِ شش‌گزینه‌ایِ مرتب‌سازیِ مخزن (پاراگرافِ ارتباطات، کلیدهای چاپی c,f,b,d,e,a) —
 * d و e دو نیمهٔ یک جمله‌اند که وفادارانه جدا ماندند.
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

const rec = bank.source.g12nahaie6 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r385) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p308 = slicePage(308);
const p309 = slicePage(309);
const p310 = slicePage(310);
const p311 = slicePage(311);
const p312 = slicePage(312);
const p313 = slicePage(313);
const p314 = slicePage(314);
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

describe("r385 — رسیدِ g12nahaie6 (نهاییِ خرداد ۱۴۰۰ ریاضی-تجربی با کلیدِ رسمی)", () => {
  it("رسید: r385، ص۳۰۸-۳۱۲ + راهنمای تصحیحِ ص۳۱۳-۳۱۴، ۵۷ ردیف/۳۱ استخراج/۲۶ مستثنی، ۳۱ آیتم در [7,4,4,4,4,2,6]", () => {
    expect(rec.extractedRound).toBe("r385");
    expect(rec.section).toContain("خرداد ۱۴۰۰");
    expect(rec.section).toContain("برگهٔ ششم");
    expect(rec.section).toContain("ریاضی");
    expect(rec.examPages).toContain("pdf-p308-312");
    expect(rec.examPages).toContain("313-314");
    expect(rec.examMeta).toContain("خرداد");
    expect(rec.examMeta).toContain("۱۹/۰۳/۱۴۰۰");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۸ صبح");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("1. False (b)");
    expect(rec.keyVerification).toContain("26. speak");
    expect(rec.keyVerification).toContain("31. had paid");
    expect(rec.keyVerification).toContain("37. ( c )");
    expect(rec.keyVerification).toContain("47 .(d)");
    expect(rec.keyVerification).toContain("48. and 49. so");
    expect(rec.keyVerification).toContain("Joe had already learned Chinese when he moved to China.");
    expect(rec.keyVerification).toContain("They would buy a house if they were you.");
    expect(rec.sectionsTotal).toBe(57);
    expect(rec.sectionsExtracted).toBe(31);
    expect(rec.sectionsSkipped).toBe(26);
    expect(rec.items).toBe(31);
    expect(rec.bankCounts).toEqual([7, 4, 4, 4, 4, 2, 6]);
    expect(rec.keyPolicy).toContain("suppose");
    expect(rec.keyPolicy).toContain("[2,5,1,3,4,0]");
    expect(rec.engineNote).toContain("مرتب‌سازی");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: نقشهٔ ۱۷برگه‌ای — شش برگه استخراج/۱۱ باقی + برگهٔ لایه‌خراب و ناشنوایان", () => {
    expect(rec.paperMap).toContain("۱۷ برگه");
    expect(rec.paperMap).toContain("دی ۱۳۹۷ ص۲۲۹-۲۳۳");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۸ ص۲۳۷-۲۴۱");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۸ ص۲۴۴-۲۴۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴");
    expect(rec.paperMap).toContain("لایه‌خراب ص۲۷۷-۲۸۴");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۹ ص۲۸۵-۲۹۰");
    expect(rec.paperMap).toContain("ویژهٔ ناشنوایان ص۲۹۳-۲۹۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۹ ص۳۰۱-۳۰۵");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]");
    expect(rec.futureNote).toContain("۳۹ ردیف");
    expect(rec.futureNote).toContain("۱۱ برگه باقی است");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/بازِ تایپی/تولیدی) + داوریِ رندرِ س۵", () => {
    expect(rec.skippedSections).toHaveLength(10);
    expect(rec.skippedSections.some((s) => s.includes("1.False(b)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("9.around"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("15.listen"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("کارخانهٔ آلاینده"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("کبوترهای پارک→d"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("had paid"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("but he had to read it"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Different types of sport"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("37. ( c )"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("47 .(d)"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("-------in"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۳۰۰dpi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("دو نیمهٔ یک جمله"))).toBe(true);
  });
});

describe("r385 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const p308join = joinSeg(p308, "ﺑﺎﺳﻤﻪ");
    expect(p308join).toContain("ﺳﺆاﻻت");
    expect(p308join).toContain("1400");
    expect(p308join).toContain("ﺧﺮداد");
    expect(p308join).toContain("رﯾﺎﺿﯽ");
    expect(p308join).toContain("aee.medu.ir");
    const keyjoin = joinSeg(p313, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p314, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. False (b)", "2. False (b)", "3. True (a)", "4. True (a)",
      "9. around", "10. social", "11. land", "12. protect",
      "14. True (a)", "16. (e)", "17.(d)", "18. (a)", "19. (c)",
      "20. fossil", "21. use up", "22. distinguished",
      "23. (d)", "24. (c)", "25. (b)", "26. speak",
      "27. (b)", "28. (d)", "29. (a)", "30. (d)", "31. had paid",
      "35. (a) True", "36. (a) True", "37. ( c )", "38. ( b)",
      "39. (a) True", "40. (b) False", "41. ( b)", "42. ( a )",
      "43. Solar collectors collect heat by absorbing sunlight.",
      "44. (a) True", "45. (b) False", "46. (c)", "47 .(d)",
      "48. and", "49. so", "but he had to read it",
      "(c) The new century has brought big changes in communication.",
      "(f). Cell phones are important in these changes.",
      "(b) Most of these cell phones can help you have video calls.",
      "(d) But some people do not have such phones",
      "(e) because they are very expensive.",
      "(a) In short, communication can depend on technology.",
    ]) expect(keyjoin).toContain(kf);
  });

  it("بلوکِ درهمِ س۱۱: فرگمنت‌های واقعیِ لایه؛ کلیدِ کامل فقط با داوریِ رندر", () => {
    const keyjoin = joinSeg(p313, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const frag of ["moved to China", "Chinese", "learn", "already", "Joe",
                        "you.", "they were", "a house", "would buy", "They"])
      expect(keyjoin).toContain(frag);
    // کلیدِ کامل در لایه نیست (سطرشکنِ RTL) — فقط در رسیدِ داوری‌شده
    expect(keyjoin).not.toContain("Joe had already learned Chinese");
    expect(keyjoin).not.toContain("They would buy a house");
  });

  it("متنِ هر سه خوانداری در لایه (نوجوانان دوصفحه‌ای) + جملاتِ مرتب‌سازیِ س۱۸", () => {
    const dict = normStem(joinSeg(p310, "A dictionary is a book that explains", "entered English from Persian.", true, true));
    expect(dict).toContain("alphabetical order");
    expect(dict).toContain("‘pajamas’, ‘bazaar’ and ‘paradise’");
    const solar = normStem(joinSeg(p311, "The most common type of clean energy", "space stations.", true, true));
    expect(solar).toContain("reaches the earth");
    expect(solar).toContain("big shiny panels on the roof");
    const teens = normStem(
      joinSeg(p311, "For many people, their teenage years", "they can buy their own", true, true) + " " +
      joinSeg(p312, "cars. After finishing high school", "lives.", true, true),
    );
    expect(teens).toContain("from 13 to 19");
    expect(teens).toContain("they can buy their own cars. After finishing high school");
    expect(teens).toContain("parents are the best support in their lives");
    const p312join = joinSeg(p312, "Writing", "Sport");
    for (const s of ["In short, communication can depend on technology",
                     "Most of these cell phones can help you have video calls",
                     "The new century has brought big changes in communication.",
                     "But some people do not have such phones",
                     "because they are very expensive.",
                     "Cell phones are important in these changes"])
      expect(p312join).toContain(s);
  });

  it("هستهٔ مشترکِ بین‌برگه‌ای: متنِ خورشیدیِ این برگه در r382-ل۱۹ نیز هست (لمِ r384-بند۵)", () => {
    // r382 متنِ انرژی (دی ۱۴۰۰) با دو جملهٔ آغازینِ یکسان شروعِ بخشِ خورشیدی می‌شود
    const l19 = L(19).questions[0].question;
    expect(l19).toContain("The most common type of clean energy is the solar power.");
    // تفاوتِ چاپ: «Different types» در r382، «Different kinds» در این برگه
    expect(L(39).questions[0].question).toContain("Different kinds of materials");
    expect(l19).toContain("Different types of materials");
  });
});

describe("r385 — بانک l36 (س۶-س۸): واژگان و تعریف و اصطلاح", () => {
  const b = L(36);

  it("س۶: سه ساقهٔ verbatim با بانکِ چاپیِ چهارواژه‌ای (suppose, use up, distinguished, fossil) — اضافیِ هرگز-کلید", () => {
    expect(b.title).toContain("واژگان و تعریف و اصطلاح");
    expect(keyed(36).slice(0, 3)).toEqual(["fossil", "use up", "distinguished"]);
    expect(b.questions.slice(0, 3).map((it) => it.answer)).toEqual([3, 1, 2]);
    for (const it of b.questions.slice(0, 3)) {
      expect(it.options).toEqual(["suppose", "use up", "distinguished", "fossil"]);
      expect(it.question).not.toContain("suppose");
    }
    expect(b.questions[0].question).toBe("Oil, coal and natural gas are three common ------- fuels.");
    expect(b.questions[1].question).toBe("Don’t ------- all the milk, we need some for breakfast.");
    expect(b.questions[2].question).toBe("Dr. Gharib was known as a ------- university professor in our country.");
  });

  it("س۷: تعریف‌یابی A/B — ستون B به ترتیبِ چاپ، اضافیِ «to put things in a neat» هرگز-کلید", () => {
    expect(keyed(36).slice(3, 6)).toEqual(["to suddenly decide to do something", "to stop being angry with someone", "to take the place of somebody or something"]);
    for (const it of b.questions.slice(3, 6)) {
      expect(it.options).toEqual(["to put things in a neat, attractive, or useful order", "to take the place of somebody or something", "to stop being angry with someone", "to suddenly decide to do something"]);
      expect(it.options[it.answer]).not.toBe("to put things in a neat, attractive, or useful order");
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
  });

  it("س۸: اصطلاحِ «Actions s - - - - louder than words» — چهارِ ۵حرفیِ s-دار، کلیدِ speak", () => {
    const it = b.questions[6];
    expect(it.question).toBe("Just saying that you will do something doesn’t mean much. You know that “Actions s - - - - louder than words”.");
    expect(it.options).toEqual(["speak", "spend", "sound", "stand"]);
    expect(it.answer).toBe(0);
    for (const o of it.options) expect(o).toMatch(/^s[a-z]{4}$/);
  });
});

describe("r385 — بانک l37 (س۹): گرامر با گزینه‌های verbatimِ چاپ", () => {
  const b = L(37);

  it("چهار ساقهٔ verbatim؛ کلیدهای چاپی [b,d,a,d]؛ tag-question با نامِ چاپیِ Hamid در گزینه‌ها", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(37)).toEqual(["does he", "which", "may be made", "could earn"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3, 0, 3]);
    expect(b.questions[0].options).toEqual(["did Hamid", "does he", "doesn’t Hamid", "isn’t he"]);
    expect(b.questions[1].options).toEqual(["whom", "who", "where", "which"]);
    expect(b.questions[2].options).toEqual(["may be made", "will make", "is making", "has made"]);
    expect(b.questions[3].options).toEqual(["will earn", "were earned", "earned", "could earn"]);
    expect(b.questions[0].question).toBe("Hamid doesn’t say a bad word, -------?");
    expect(b.questions[1].question).toBe("A: What did she do last Friday? B: She watched the film ------- was very interesting.");
    expect(b.questions[2].question).toBe("A: Guess what we have for dinner! B: A fish salad ------- for dinner by the cook.");
    expect(b.questions[3].question).toBe("A: I do not have a good job and cannot earn enough money. B: If you had a good job, you ------- a lot of money.");
  });
});

describe("r385 — بانک‌های خوانداری l38/l39/l40: هر آیتم متنِ کاملِ چاپی را در ساقه دارد", () => {
  it("l38 (س۱۳ لغت‌نامه): کلیدهای [True,True,c,b] — دوبلِ Trueِ چاپ در ۳۵/۳۶", () => {
    const b = L(38);
    expect(b.title).toContain("لغت‌نامه");
    expect(keyed(38)).toEqual(["True", "True", "They tell about famous people.", "words"]);
    for (const it of b.questions) {
      expect(it.question).toContain("A dictionary is a book that explains the meanings of words");
      expect(it.question).toContain("entered English from Persian.");
    }
    expect(b.questions[2].question).toContain("What do dictionaries of biography explain?");
    expect(b.questions[2].options).toEqual([
      "These dictionaries explain the meanings of technical words.",
      "Dictionaries of biography explain IPA.",
      "They tell about famous people.",
      "They translate words from one language to another.",
    ]);
    expect(b.questions[3].question).toContain("What does “them” in the first line of paragraph 3 refer to?");
  });

  it("l39 (س۱۴ خورشیدی): کلیدهای [True,False,b,a] — «to------- .» و «-------in» وفادارانه", () => {
    const b = L(39);
    expect(b.title).toContain("خورشیدی");
    expect(keyed(39)).toEqual(["True", "False", "get the most sunshine", "materials"]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 1, 1, 0]);
    for (const it of b.questions) {
      expect(it.question).toContain("The most common type of clean energy is the solar power.");
      expect(it.question).toContain("houses and even space stations.");
    }
    expect(b.questions[2].question).toContain("to------- .");
    expect(b.questions[3].question).toContain("different -------in building the houses");
  });

  it("l40 (س۱۵ نوجوانان): کلیدهای [True,False,teenagers,support] — متنِ دوصفحه‌ایِ بازجوش در ساقه", () => {
    const b = L(40);
    expect(b.title).toContain("نوجوانان");
    expect(keyed(40)).toEqual(["True", "False", "teenagers", "support"]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 1, 2, 3]);
    for (const it of b.questions) {
      expect(it.question).toContain("their teenage years – from 13 to 19");
      expect(it.question).toContain("parents are the best support in their lives.");
    }
    expect(b.questions[2].question).toContain("have a lot to share with-------");
    expect(b.questions[3].question).toContain("the best-------for teenagers.");
  });
});

describe("r385 — بانک l41 (س۱۶): حروفِ ربط با بانکِ چاپی (but, and, so, or)", () => {
  const b = L(41);

  it("دو ساقهٔ verbatim؛ کلیدهای [and, so] در اندیس‌های [1,2]؛ «-------I» چسبیده در ق۴۹", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(41)).toEqual(["and", "so"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toBe("We went to the restaurant ------- ordered food.");
    expect(b.questions[1].question).toBe("That dictionary is expensive, -------I can’t buy it.");
  });
});

describe("r385 — بانک l42 (س۱۸): دومین بانکِ شش‌گزینه‌ایِ مرتب‌سازی (پاراگرافِ ارتباطات)", () => {
  const b = L(42);

  it("شش آیتمِ شش‌گزینه‌ای با گزینه‌های a-f به ترتیبِ چاپ؛ کلیدهای چاپی [c,f,b,d,e,a] در [2,5,1,3,4,0]", () => {
    expect(b.title).toContain("مرتب‌سازیِ پاراگرافِ ارتباطات");
    expect(b.level).toBe("شش‌گزینه‌ای");
    expect(b.questions).toHaveLength(6);
    const COMM = [
      "In short, communication can depend on technology.",
      "Most of these cell phones can help you have video calls.",
      "The new century has brought big changes in communication.",
      "But some people do not have such phones",
      "because they are very expensive.",
      "Cell phones are important in these changes.",
    ];
    expect(keyed(42)).toEqual([COMM[2], COMM[5], COMM[1], COMM[3], COMM[4], COMM[0]]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 5, 1, 3, 4, 0]);
    for (const it of b.questions) {
      expect(it.options).toEqual(COMM);
      expect(new Set(it.options).size).toBe(6);
      expect(it.question).toContain("مرتب‌سازیِ پاراگرافِ ارتباطات (س۱۸، ص۳۱۲)");
      expect(it.question).toContain("جملاتِ درهم‌ریختهٔ a تا f");
    }
    expect(b.questions[0].question).toContain("جایگاهِ ۵۱ (جملهٔ آغازینِ پاراگراف)");
    expect(b.questions[5].question).toContain("جایگاهِ ۵۶ (پایان‌بندیِ پاراگراف)");
  });
});

describe("r385 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۴۲ بانک/[…,7,4,3,3,4,2,6,7,4,4,4,4,2,6]/۴۸۱ id یکتا — الگویِ g12-l1..l42", () => {
    expect(bank.lessons).toHaveLength(83);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(633);
    expect(new Set(ids).size).toBe(633);
    expect(ids[450]).toBe("g12-l36-1");
    expect(ids[457]).toBe("g12-l37-1");
    expect(ids[461]).toBe("g12-l38-1");
    expect(ids[465]).toBe("g12-l39-1");
    expect(ids[469]).toBe("g12-l40-1");
    expect(ids[473]).toBe("g12-l41-1");
    expect(ids[475]).toBe("g12-l42-1");
    expect(ids[480]).toBe("g12-l42-6");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ راندیِ ردیف‌های مستثنی (دامنه: بانک‌های ۳۶-۴۲ — درسِ omelet): شنیداریِ س۱-س۴، تصویریِ س۵، بازِ تایپیِ س۱۰-س۱۲، تصویریِ س۱۷ و تولیدیِ س۱۹ غایب‌اند", () => {
    const mine = bank.lessons.filter((b2) => b2.lesson >= 36 && b2.lesson <= 42).flatMap((b2) => b2.questions);
    expect(mine).toHaveLength(31);
    for (const forbidden of [
      "Roya will go to the gym", // س۱ (شنیداریِ صوتی)
      "Rasoul and his family", // س۲ (شنیداریِ صوتی)
      "The environment means different things", // س۳ (شنیداریِ کلوژ)
      "Promising others can make our world", // س۴ (شنیداریِ صوتی)
      "I have kept a diary for twelve years", // س۵ اضافیِ چاپی (در r383-l23-6 مشروع — دامنه‌راندی)
      "gave me some money back", // س۱۰ (بازِ تایپی)
      "Joe had already learned Chinese", // س۱۱ پاسخِ مدل (تایپی)
      "They would buy a house", // س۱۱ پاسخِ مدل (تایپی)
      "A horse is an animal", // س۱۲ (تایپی/تولیدی)
      "but he had to read it", // س۱۷ (تصویری-کلید) — عینِ r382-س۱۷ (هر دو مستثنی)
      "Different types of sport", // س۱۹ چیپ
      "Good physical shape", // س۱۹ چیپ
      "Healthier heart", // س۱۹ چیپ
    ])
      for (const it of mine) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l36 (ق۱-۳/۷) و l37/l38/l39/l40/l41 ساقهٔ لاتینِ خالص؛ l36 (ق۴-۶) و l42 ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(36).questions.slice(0, 3), L(36).questions[6]]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(36).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [37, 38, 39, 40, 41]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of [...L(42).questions]) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
