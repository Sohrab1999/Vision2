// R396-WIDENED — l143 (۱۸ آیتمِ جمله‌سازیِ مخزن): 142→143 بانک / 873→891 id / دمِ counts +18
// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
/**
 * r389 — گاردِ برگهٔ یازدهمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۹ انسانی-معارف (pdf-p268-274)
 * با کلیدِ رسمیِ «راهنمای تصحيح» (pdf-p275-276) → ۱۲ بانکِ تازه/۳۹ آیتم
 * (l72=۱/l73=۳/l74=۲/l75=۳/l76=۳/l77=۵/l78=۴/l79=۴/l80=۴/l81=۴/l82=۴/l83=۲).
 * دوقلویِ چاپِ ریاضی-تجربیِ r388 — درسِ برگهٔ ناشنوایان: دو ردیفِ ضرب‌المثلِ س۱۴-ب
 * (Out of sight→i و Practice makes perfect→j) دوقلویِ بایتیِ l59-1/l59-2 → مستثنی.
 * نخستین بانکِ تایپیِ بخشِ نهایی‌ها: l74 (kind=typed، accepted عینِ کلیدِ چاپیِ responding/personal).
 * دومین رندرِ پاراگرافیِ حروفِ ربط: l81 (خانه‌های چسبیده وفادار ماندند؛ ساقهٔ ۵۳ ویرگولِ پایانی، ۵۴ خانه-آغاز).
 * دومین تکرارِ کوئیرکِ «٦٤.» (کلیدِ ۴۶ با ارقامِ فارسیِ وارونه — الگویِ r388).
 * کلیدِ ۴۳ با پرانتزِ سرگردانِ چاپ («(a) True)»)؛ کلیدِ ۳۹ با «in١٢٩١» ارقامِ چسبیده؛ کلیدِ ۹ آشفته.
 * تعریفِ h س۱۴-الف دوخطیِ چاپ («…leads to»/«bad results.») — بازجوش با فاصله.
 * رسیدِ g12nahaie11.
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

const r11 = bank.source.g12nahaie11 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r389) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p268 = slicePage(268);
const p271 = slicePage(271);
const p272 = slicePage(272);
const p273 = slicePage(273);
const p275 = slicePage(275);
const p276 = slicePage(276);
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
const gapToPlain = (s: string) => s.replace(/\s*\((?:5[1234])\)\s*[….]+/g, "-------");

describe("r389 — رسیدِ g12nahaie11 (نهاییِ خرداد ۱۳۹۹ انسانی-معارف)", () => {
  it("رسید: r389، ص۲۶۸-۲۷۴ + راهنمای تصحیحِ ص۲۷۵-۲۷۶، ۶۲ ردیف/۳۹ استخراج/۲۳ مستثنی، ۳۹ آیتم در [1,3,2,3,3,5,4,4,4,4,4,2]", () => {
    expect(r11.extractedRound).toBe("r389");
    expect(r11.section).toContain("برگهٔ یازدهم");
    expect(r11.section).toContain("انسانی");
    expect(r11.examPages).toContain("pdf-p268-274");
    expect(r11.examPages).toContain("275-276");
    expect(r11.examMeta).toContain("انسانی–علوم و معارف اسلامی");
    expect(r11.examMeta).toContain("۰۷/۰۴/۹۹");
    expect(r11.examMeta).toContain("۱۲۰ دقیقه");
    expect(r11.examMeta).toContain("۸ صبح");
    expect(r11.examMeta).toContain("۱۶ سکشن/۶۲ ردیف");
    expect(r11.keyPages).toContain("راهنمای تصحیح");
    expect(r11.keyVerification).toContain("1. ( d )");
    expect(r11.keyVerification).toContain("5. (d) 6. (b) 7. (a)");
    expect(r11.keyVerification).toContain("10. responding 11. personal");
    expect(r11.keyVerification).toContain("15. ( d ) 16. ( a ) 17. ( b  ) 18. ( e )");
    expect(r11.keyVerification).toContain("19. dedicated 20. conditioner 21. alphabetically");
    expect(r11.keyVerification).toContain("22. forever 23. contain 24. lap");
    expect(r11.keyVerification).toContain("25. ( a ) 26. (b) 27. (a ) 28. (c) 29. ( d )");
    expect(r11.keyVerification).toContain("30. increasingly 31. collect 32. has been discovered");
    expect(r11.keyVerification).toContain("35. (b) 36. (c) 37. ( a) True 38. (b) False");
    expect(r11.keyVerification).toContain("in١٢٩١");
    expect(r11.keyVerification).toContain("(a) True)");
    expect(r11.keyVerification).toContain("٦٤.");
    expect(r11.keyVerification).toContain("47. ( c ) 48. ( d ) 49. ( a  ) 50. ( b  )");
    expect(r11.keyVerification).toContain("51. and 52. or 53. but 54. so");
    expect(r11.keyVerification).toContain("d i/e h/c f/b j");
    expect(r11.sectionsTotal).toBe(62);
    expect(r11.sectionsExtracted).toBe(39);
    expect(r11.sectionsSkipped).toBe(23);
    expect(r11.items).toBe(39);
    expect(r11.bankCounts).toEqual([1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2]);
    expect(r11.keyPolicy).toContain("introduction, dedicated, alphabetically, conditioner");
    expect(r11.keyPolicy).toContain("f++++++/c++++++/l++");
    expect(r11.engineNote).toContain("نخستین بانکِ تایپیِ بخشِ نهایی‌ها");
    expect(r11.engineNote).toContain("kind=typed");
    expect(r11.engineNote).toContain("دومین رندرِ پاراگرافی");
    expect(r11.bookletFile).toContain("دوازدهم");
  });

  it("paperMapِ r11: دوازده برگه استخراج/۵ باقی + انسانیِ خرداد ← این راند؛ کوئیرکِ «٦٤.» دومین تکرار", () => {
    expect(r11.paperMap).toContain("۱۷ برگه");
    expect(r11.paperMap).toContain("خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶");
    expect(r11.paperMap).toContain("۱۲ برگه استخراج شد، ۵ برگه باقی است");
    expect(r11.paperMap).toContain("برگهٔ لایه‌خراب ص۲۷۷-۲۸۴");
    expect(r11.paperMap).toContain("دی ۱۳۹۷ ص۲۲۹-۲۳۳");
    expect(r11.futureNote).toContain("۶۹ ردیف");
    expect(r11.futureNote).toContain("l74 نخستین بانکِ تایپیِ شپ‌شدهٔ بخشِ نهایی‌هاست");
  });

  it("پیمانِ سربرگ: presentation-forms با دوفاصلهٔ «ﺳﺆاﻻت  اﻣﺘﺤﺎن»، تاریخِ ۰۷/۰۴/۹۹، «8 ﺻﺒﺢ» فاصله‌دار، انسانی-معارف", () => {
    // دوفاصلهٔ سربرگ فقط در سطحِ سطر زنده است (join فشرده‌اش می‌کند — الگویِ r388)
    expect(p268.some((l) => l.includes("ﺳﺆاﻻت  اﻣﺘﺤﺎن"))).toBe(true);
    const p268join = joinSeg(p268, "ﺑﺎﺳﻤﻪ");
    expect(p268join).toContain("07 / 04 / 99");
    expect(p268join).toContain("8 ﺻﺒﺢ");
    expect(p268join).toContain("اﻧﺴﺎﻧﯽ");
    expect(p268join).toContain("ﻣﻌﺎرف");
    expect(p268join).toContain("aee.medu.ir");
  });

  it("پیمانِ کلیدِ خام: ۶۴ فرگمنت، «٦٤.» خطِ مستقل با شکستِ سطرِ energy، پرانتزِ سرگردانِ ۴۳، دوفاصله‌های ۱۷/۵۰، ارقامِ چسبیدهٔ ۳۹", () => {
    const keyjoin = joinSeg(p275, "راﻫﻨﻤﺎي") + " " + joinSeg(p276, "راﻫﻨﻤﺎي");
    expect(keyjoin).toContain("2. False ( b)");
    expect(keyjoin).toContain("3. Because she can’t hear well.");
    expect(keyjoin).toContain("4. It might be something as simple as an infection / more serious.");
    expect(keyjoin).toContain("10. responding 11. personal");
    expect(keyjoin).toContain("12. Yes, it does. It takes him a lot of time to answer the emails.");
    expect(keyjoin).toContain("45. The energy is stored in their roots,/ fruits,/ and leaves.");
    expect(keyjoin).toContain("61. (a) The woman who bought that apartment was talking to the neighbors in the yard.");
    expect(keyjoin).toContain("62. (a) He could be a good runner if he had more free time to practice.");
    expect(keyjoin).not.toContain("46.");
    // «٦٤.» خطِ مستقل با ادامهٔ wind/energy در سطرِ بعد
    const kv = p276.find((l) => l.trim().startsWith("٦٤."));
    expect(kv).toBeDefined();
    expect(kv!.trim()).toBe("٦٤. Three forms of renewable energy are: solar energy, water energy and wind");
    expect(p276.some((l) => l.trim() === "energy")).toBe(true);
    // پرانتزِ سرگردانِ کلیدِ ۴۳ — سطرِ خودش
    expect(p276.some((l) => l.trim() === "43. (a) True)")).toBe(true);
    // دوفاصله‌های درون-پرانتزِ ۱۷/۵۰ (keyjoin فشرده‌شان می‌کند — پیمان روی لایهٔ خام)
    expect(p275.some((l) => l.trim() === "17. ( b  )")).toBe(true);
    expect(p276.some((l) => l.trim() === "50. ( b  )")).toBe(true);
    // کلیدِ ۳۹ با ارقامِ فارسیِ چسبیده
    expect(p275.some((l) => l.includes("in١٢٩١"))).toBe(true);
    // جدولِ عمودیِ ۵۷-۶۰ — حروفِ تک‌خطیِ مستقل
    for (const letter of ["d", "i", "e", "h", "c", "f", "b", "j"])
      expect(p276.some((l) => l.trim() === letter), letter).toBe(true);
    // کلیدِ ۹ آشفته (ران‌های جدا)
    for (const frag of ["movie", "to finish watching", "electricity", "nough", "e", "She needed"])
      expect(p275.some((l) => l.trim() === frag), frag).toBe(true);
  });

  it("پیمان‌های لایهٔ خامِ برگه: ساقه‌های حرفِ ربطِ انتهاییِ س۱۱، «d) b & c»، تعریفِ h دوخطی، پاراگرافِ امین با خانه‌های چسبیده", () => {
    for (const frag of ["47. You can use mobile dictionary, or", "48. The roads were covered with ice, so",
      "49. I wanted to call you, but", "50. I went to the window, and"])
      expect(p272.some((l) => l.trim() === frag), frag).toBe(true);
    expect(p268.some((l) => l.includes("d) b & c"))).toBe(true);
    expect(p273.some((l) => l.trim() === "h. When there are too many people trying to lead and give their opinions, it’s confusing and leads to")).toBe(true);
    expect(p273.some((l) => l.trim() === "bad results.")).toBe(true);
    const amin = joinSeg(p272, "Amin is a student", "father arrived.", true, true);
    expect(amin).toContain("(51)");
    expect(amin).toContain("(54)");
    const aminNorm = normStem(gapToPlain(amin));
    expect(aminNorm).toContain("Amin is a student,-------he goes to a school near his house.");
    expect(aminNorm).toContain("got sick,------- Amin waited until his friend’s father arrived.");
    // متنِ خورشید: بازجوشِ دو بک‌تیک و شکست‌های سطر
    const solar = joinSeg(p271, "All of our energy", "using them.", true, true);
    expect(solar).toContain("sun`s energy");
    expect(solar).toContain("Three forms of renewable energy are: solar energy, water energy and wind energy.");
  });

  it("سکشن‌های مستثنی با کلیدِ چاپیِ حفظ‌شده: صوتی/تصویری/تایپی/تولیدی — ۱۱ مدخل/۲۳ ردیف", () => {
    expect(r11.skippedSections).toHaveLength(11);
    expect(r11.skippedSections.join(" ")).toContain("free apps");
    expect(r11.skippedSections.join(" ")).toContain("Out of sight→i و Practice makes perfect→j");
    expect(r11.skippedSections.join(" ")).toContain("Firefighters");
    expect(r11.skippedSections.join(" ")).toContain("30. increasingly/31. collect/32. has been discovered/33. were invented/34. were");
  });

  it("printQuirks: ۱۶ کوئیرکِ ثبت‌شده — چسبیدگی‌های a/an، «When speaker»، «keep here cool»، TFِ ناهمگون، «٦٤.»", () => {
    expect(r11.printQuirks.length).toBe(16);
    expect(r11.printQuirks.join(" ")).toContain("a/an-------");
    expect(r11.printQuirks.join(" ")).toContain("When speaker");
    expect(r11.printQuirks.join(" ")).toContain("keep here cool");
    expect(r11.printQuirks.join(" ")).toContain("a)True  b)False");
    expect(r11.printQuirks.join(" ")).toContain("٦٤.");
  });
});

describe("r389 — بانک‌های l72-l74 (شنیداریِ چاپ + نخستین تایپی)", () => {
  it("بانکِ l72 (س۱): تک‌ردیفِ کلوژِ دادزدن — کلیدِ چاپیِ 1. ( d ) با آپاستروفِ خمیده", () => {
    const b = L(72);
    expect(b.title).toContain("گفت‌وگوی داد");
    expect(b.count).toBe(1);
    expect(b.questions[0].question).toBe("A: Why is the man shouting? B: Because ------- .");
    expect(b.questions[0].options).toEqual(["he is very angry", "he is far from the woman", "she can’t hear at all", "she can’t hear clearly"]);
    expect(b.questions[0].answer).toBe(3);
  });

  it("بانکِ l73 (س۲): کلوژِ باتری — گزینه‌های ردیفیِ خودشان با «b & c» و چسبیدگیِ a/an؛ کلیدهای [low,rechargeable,outlet]", () => {
    const b = L(73);
    expect(b.count).toBe(3);
    expect(b.questions[0].question).toBe("A: What was the problem with the woman’s computer? B: The battery was ------- .");
    expect(b.questions[1].question).toBe("The woman said the battery of her computer was ------- .");
    expect(b.questions[2].question).toBe("A: What was she looking for? B: She was looking for a/an------- .");
    expect(b.questions[1].options).toEqual(["replaceable", "rechargeable", "convertible", "b & c"]);
    expect(keyed(73)).toEqual(["low", "rechargeable", "outlet"]);
  });

  it("بانکِ l74 (س۳): نخستین بانکِ تایپیِ نهایی‌ها — kind=typed با accepted عینِ کلید؛ «When speaker» مفردِ چاپ؛ تضادِ a/anِ ق۷/ق۱۱", () => {
    const b = L(74);
    expect(b.level).toBe("تایپی");
    expect(b.count).toBe(2);
    for (const it of b.questions) {
      expect(it.kind).toBe("typed");
      expect(it.accepted).toHaveLength(1);
      expect(it.options).toEqual(it.accepted);
      expect(it.translation).toBeUndefined();
    }
    expect(b.questions[0].question).toBe("When speaker looks at his inbox, he gets stuck into reading and ------- to emails.");
    expect(b.questions[0].accepted).toEqual(["responding"]);
    expect(b.questions[1].question).toBe("He has a/an ------- email account and an account for work.");
    expect(b.questions[1].accepted).toEqual(["personal"]);
    // تضادِ چاپی: ق۷ «a/an-------» چسبیده در برابرِ ق۱۱ «a/an -------» فاصله‌دار
    expect(L(73).questions[2].question).toContain("a/an-------");
    expect(b.questions[1].question).toContain("a/an -------");
  });
});

describe("r389 — بانک‌های l75-l77 (واژگان/حرفِ اول/گرامر)", () => {
  it("بانکِ l75 (س۵): بانکِ چاپِ چهارواژه‌ای — اضافیِ introduction هرگز-کلید؛ «keep here cool» چاپ", () => {
    const b = L(75);
    expect(b.count).toBe(3);
    for (const it of b.questions) expect(it.options).toEqual(["introduction", "dedicated", "alphabetically", "conditioner"]);
    expect(keyed(75)).toEqual(["dedicated", "conditioner", "alphabetically"]);
    expect(b.questions[1].question).toBe("A: How do you keep this room cool? B: We use a perfect air ------- to keep here cool.");
    expect(b.questions[2].question).toContain("The books are arranged ------- by authors’ names.");
  });

  it("بانکِ l76 (س۶): سه سه‌تاییِ هم‌شکلِ مهندسی‌شده f++++++/c++++++/l++ — کلیدهای [forever,contain,lap]", () => {
    const b = L(76);
    expect(b.count).toBe(3);
    expect(b.questions[0].question).toBe("You should tell him the truth one day. You can’t keep it a secret f- - - - - -.");
    expect(b.questions[1].question).toBe("In order to be healthy, try to avoid foods that c - - - - - - a lot of fat.");
    expect(b.questions[2].question).toBe("The baby enjoys sitting on her mother`s l - - .");
    for (const o of b.questions[0].options) expect(o).toMatch(/^f[a-z]{6}$/);
    for (const o of b.questions[1].options) expect(o).toMatch(/^c[a-z]{6}$/);
    for (const o of b.questions[2].options) expect(o).toMatch(/^l[a-z]{2}$/);
    expect(b.questions[0].options).toEqual(["forever", "further", "fortune", "failure"]);
    expect(b.questions[1].options).toEqual(["contain", "collect", "combine", "compare"]);
    expect(b.questions[2].options).toEqual(["lap", "leg", "lip", "low"]);
    expect(keyed(76)).toEqual(["forever", "contain", "lap"]);
  });

  it("بانکِ l77 (س۷): گرامر ۵تایی — بک‌تیک‌های tagِ ۲۸؛ چسبیدگی‌های -------more و very-------,؛ کلیدهای [a,b,a,c,d]", () => {
    const b = L(77);
    expect(b.count).toBe(5);
    expect(b.questions[0].question).toBe("A: Where is his car? B: The car ------- is parked there belongs to him.");
    expect(b.questions[1].question).toBe("A: Can she get a good mark now? B: No, but she could get a good score if she -------more.");
    expect(b.questions[2].question).toBe("There is a new building in the neighborhood. The workers-------it very well.");
    expect(b.questions[3].question).toBe("Their sister bought a new dress at a very low price, -------?");
    expect(b.questions[4].question).toBe("He is not very-------, thus he doesn’t feel comfortable to talk to people.");
    expect(b.questions[3].options).toEqual(["doesn`t she", "don`t they", "didn`t she", "didn`t they"]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 1, 0, 2, 3]);
    expect(keyed(77)).toEqual(["which", "studied", "have built", "didn`t she", "communicative"]);
  });
});

describe("r389 — بانک‌های l78-l81 (خوانداری‌ها/ستون‌ها/پاراگراف)", () => {
  it("بانکِ l78 (س۹): خوانداریِ انیشتین — متنِ کامل در هر ساقه؛ کلیدهای [b,c,True,False]", () => {
    const b = L(78);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 0, 1]);
    expect(keyed(78)).toEqual(["American citizen", "health problems", "True", "False"]);
    for (const it of b.questions) {
      expect(it.question).toContain("Albert Einstein, a physicist, was born on March 14, 1879, in Germany.");
      expect(it.question).toContain("Swiss Patent Office in 1902");
      expect(it.question).toContain("— ");
    }
    expect(b.questions[0].question).toContain("— Before the World War II, Einstein left Germany and became a/an------- .");
    expect(b.questions[1].question).toContain("— He died because of his -------"); // نقطهٔ چاپ داخلِ رانِ نقطه‌چین
    expect(b.questions[2].question).toContain("— His job helped him to think about his theory.");
  });

  it("بانکِ l79 (س۱۰): خوانداریِ انرژیِ خورشید — متنِ سه‌پاراگرافی؛ کلیدهای [c,b,True,False]؛ ردیف‌ها تازه (l39 دوقلو نیست)", () => {
    const b = L(79);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 0, 1]);
    expect(keyed(79)).toEqual(["renewable sources of energy", "the importance of energy for human life and where energy comes from", "True", "False"]);
    for (const it of b.questions) {
      expect(it.question).toContain("All of our energy comes from the sun which is our nearest star.");
      expect(it.question).toContain("Fossil fuels are known as non-renewable sources of energy");
      expect(it.question).toContain("— ");
    }
    expect(b.questions[0].question).toContain("— What does “they” in paragraph3, line 2 refer to?");
    // ساقه‌های l39 (متنِ کوتاه‌تر) با این بانک اشتراکِ بایتی ندارند
    for (const it of L(39).questions)
      for (const fresh of b.questions) expect(it.question).not.toBe(fresh.question);
  });

  it("بانکِ l80 (س۱۱): جملهٔ مناسبِ ستون‌ها — ساقه‌ها با حرفِ ربطِ انتهاییِ چاپی + خانهٔ رندرِ الحاقی؛ بک‌تیکِ didn`t؛ کلیدهای [c,d,a,b]", () => {
    const b = L(80);
    expect(b.count).toBe(4);
    const B = ["I didn`t have your number.", "I looked out.", "you can buy a pocket one.", "it was not safe to drive."];
    for (const it of b.questions) expect(it.options).toEqual(B);
    expect(b.questions[0].question).toBe("You can use mobile dictionary, or -------");
    expect(b.questions[1].question).toBe("The roads were covered with ice, so -------");
    expect(b.questions[2].question).toBe("I wanted to call you, but -------");
    expect(b.questions[3].question).toBe("I went to the window, and -------");
    expect(b.questions.map((it) => it.answer)).toEqual([2, 3, 0, 1]);
    expect(keyed(80)).toEqual([B[2], B[3], B[0], B[1]]);
  });

  it("بانکِ l81 (س۱۲): دومین رندرِ پاراگرافیِ حروفِ ربط — امین؛ کلیدهای [and,or,but,so]؛ ویرگولِ پایانیِ ۵۳ و خانه-آغازِ ۵۴", () => {
    const b = L(81);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3, 0, 2]);
    expect(keyed(81)).toEqual(["and", "or", "but", "so"]);
    for (const it of b.questions) expect(it.options).toEqual(["but", "and", "so", "or"]);
    expect(b.questions[0].question).toBe("Amin is a student,-------he goes to a school near his house.");
    expect(b.questions[1].question).toBe("He can come home by taxi,------- he can come on foot.");
    expect(b.questions[2].question).toBe("He usually gets back on time,------- yesterday he came home late because one of his friends got sick,");
    expect(b.questions[3].question).toBe("------- Amin waited until his friend’s father arrived.");
  });
});

describe("r389 — بانک‌های l82-l83 (تعریف‌یابی/اصطلاحات + دوقلوسنجی)", () => {
  it("بانکِ l82 (س۱۴-الف): تعریف‌یابی به ترتیبِ چاپِ ستون B — اضافیِ a (cry suddenly — اکویِ r387-l58) هرگز-کلید", () => {
    const DEFS = ["cry suddenly", "the amount of a product or service that people want",
      "in a way that is successful and achieves what you want", "stop being angry with someone",
      "an arrangement in a particular order"];
    const b = L(82);
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 4, 2, 1]);
    expect(keyed(82)).toEqual([DEFS[3], DEFS[4], DEFS[2], DEFS[1]]);
    for (const it of b.questions) {
      expect(it.options).toEqual(DEFS);
      expect(it.options[it.answer]).not.toBe(DEFS[0]);
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
    expect(b.questions[0].question).toContain("«forgive»");
    expect(b.questions[1].question).toContain("«combination»");
    expect(b.questions[2].question).toContain("«effectively»");
    expect(b.questions[3].question).toContain("«demand»");
  });

  it("بانکِ l83 (س۱۴-ب): فقط دو ردیفِ تازه — Too many cooks→h (تعریفِ دوخطیِ بازجوش) و Birds of a feather→f؛ اضافیِ g هرگز-کلید", () => {
    const IDMS = ["People like to spend time with those who are similar to them.",
      "When two people cooperate with each other, they come up with better ideas.",
      "When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.",
      "You soon forget people or things that are no longer visible or present.",
      "You have to practice a skill a lot to become good at it."];
    const b = L(83);
    expect(b.count).toBe(2);
    expect(keyed(83)).toEqual([IDMS[2], IDMS[0]]);
    for (const it of b.questions) {
      expect(it.options).toEqual(IDMS);
      expect(it.options[it.answer]).not.toBe(IDMS[1]);
      expect(it.question).toContain("مفهوم و تعریفِ ضرب‌المثلِ");
    }
    expect(b.questions[0].question).toContain("«Too many cooks spoil the broth»");
    expect(b.questions[1].question).toContain("«Birds of a feather flock together»");
  });

  it("دوقلوهای مستثنی: Out of sight و Practice makes perfect فقط در l59 — کلیدهای i/j حفظ‌شده؛ hِ این برگه با «and give their opinions» متمایز از l23", () => {
    const l59 = L(59);
    expect(l59.questions.map((it) => it.question)).toContain("مفهوم و تعریفِ ضرب‌المثلِ «Out of sight, out of mind»: -------");
    expect(l59.questions.map((it) => it.question)).toContain("مفهوم و تعریفِ ضرب‌المثلِ «Practice makes perfect»: -------");
    for (const b of bank.lessons.filter((x) => x.lesson >= 72))
      for (const it of b.questions) {
        expect(it.question.includes("Out of sight"), `${it.id}`).toBe(false);
        expect(it.question.includes("Practice makes perfect"), `${it.id}`).toBe(false);
      }
    // تعریفِ hِ l83 با نسخهٔ l23 (تعریف-به-ضرب‌المثل) هم‌بایتی نیست
    expect(L(23).questions[6].question).toContain("When there are too many people trying to lead, it’s confusing");
    expect(L(83).questions[0].options[2]).toBe("When there are too many people trying to lead and give their opinions, it’s confusing and leads to bad results.");
  });
});

describe("r389 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۸۳ بانک/[…,4,4,1,2,1,2,3,3,4,4,4,4,4,3,1,3,2,3,3,5,4,4,4,4,4,2]/۶۳۳ id یکتا — الگویِ g12-l1..l83", () => {
    expect(bank.lessons)./* R395-WIDENED */ /* R396-WIDENED */ toHaveLength(143);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6, 22, 18],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(891);
    expect(new Set(ids).size).toBe(891);
    expect(ids[594]).toBe("g12-l72-1");
    expect(ids[595]).toBe("g12-l73-1");
    expect(ids[598]).toBe("g12-l74-1");
    expect(ids[600]).toBe("g12-l75-1");
    expect(ids[603]).toBe("g12-l76-1");
    expect(ids[606]).toBe("g12-l77-1");
    expect(ids[610]).toBe("g12-l77-5");
    expect(ids[611]).toBe("g12-l78-1");
    expect(ids[615]).toBe("g12-l79-1");
    expect(ids[619]).toBe("g12-l80-1");
    expect(ids[623]).toBe("g12-l81-1");
    expect(ids[627]).toBe("g12-l82-1");
    expect(ids[631]).toBe("g12-l83-1");
    expect(ids[632]).toBe("g12-l83-2");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهاییِ MCQ ترجمه ندارند و kind تایپی ندارند (l74 استثنای پیمان‌شدهٔ typed)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102, 105, 109, 112, 114, 119, 120, 121, 123, 126, 128, 129, 132, 135, 141])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
    // l74: تایپیِ خالص بدونِ ترجمه
    for (const it of L(74).questions) {
      expect(it.translation).toBeUndefined();
      expect(it.kind).toBe("typed");
    }
  });

  it("نشت‌سنجِ راندی (دامنه: بانک‌های ۷۲-۸۳): صوتی/تصویری/تایپی/تولیدیِ برگهٔ انسانی غایب‌اند", () => {
    const mine = bank.lessons.filter((b2) => b2.lesson >= 72 && b2.lesson <= 83).flatMap((b2) => b2.questions);
    expect(mine).toHaveLength(39);
    for (const forbidden of [    // R395-LEGIT — 5 رشته با بانکِ l142 (مخزنِ افعالِ نهایی‌ها) مشروع شد و از نشت‌سنج حذف شد (الگویِ Solar power): "His job became"→g12-l142-18، "increasingly"→g12-l142-18، "has been discovered"→g12-l142-20، "were invented"→g12-l142-21، "waste every night"→g12-l142-19

      "should see a doctor", // س۱ ردیفِ ۲ (صوتی)
      "repeat themselves", // س۱ ردیفِ ۳
      "simple as an infection", // س۱ کلیدِ ۴
      "running low", // س۲ کلیدِ ۸
      "finish watching the movie", // س۲ کلیدِ ۹ (آشفته)
      "unwanted emails", // س۳ ردیفِ ۱۳
      "organized approach", // س۳ کلیدِ ۱۴
      "free apps", // س۴ تصویری
      "hugging your child", // س۴ تصویری
      "Teenagers who help others", // س۴ اضافیِ چاپی
      "Hydropower is produced", // س۴ تصویری
      "Tides can usually happen", // س۴ تصویری
      // س۸ تایپیِ ۳۰
      // س۸ تایپی
      // س۸ تایپی
      // س۸ تایپی
      // س۸ تایپیِ ۳۱
      "There are some plants which grow", // س۱۳ تولیدیِ Plants
      "Vitamin D", // س۱۳ تولیدی
      "sunshine vitamin", // س۱۳ تولیدی
      "talking / to the neighbors", // س۱۵ گروهِ ۶۱a
      "had / happy / after", // س۱۵ گروهِ ۶۱b
      "good runner if he had more free time", // س۱۵ پاسخِ مدلِ ۶۲a
      "must be informed about the result", // س۱۵ پاسخِ مدلِ ۶۲b
      "Omidzadeh", // س۱۶-ج تصویری
      "Light bulbs", // س۱۶-ج تصویری
      "Firefighters", // س۱۶-د
      "Keeping others safe", // س۱۶-د چیپ
      "being always ready", // س۱۶-د چیپ
      "wearing uniform", // س۱۶-د چیپ
    ])
      for (const it of mine) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l72/l73/l75-l81 ساقهٔ لاتینِ خالص؛ l82/l83 ساقهٔ ترکیبی با گزینه‌های لاتین؛ l74 لاتینِ خالص", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018˝]+$/;
    for (const bn of [72, 73, 74, 75, 76, 77, 78, 79, 80, 81]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const bn of [82, 83]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
  });
});
