/**
 * r386 — گاردِ برگهٔ هفتمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ دی ۱۳۹۹، کلیهٔ رشته‌ها (pdf-p301-305)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p306-307) → ۸ بانکِ تازه/۴۰ آیتم در tests-g12.json
 * (مجموع: ۵۰ بانک/۵۲۱ آیتم)
 *
 * نکاتِ راند: (۱) پنجمین برگهٔ presentation-forms با سربرگِ دوفاصله‌ایِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن» (الگویِ r383؛
 * چسبیدگیِ r385 اینجا نیست). (۲) خانه‌های کلوژِ شنیداری بدونِ پرانتزِ چاپی («……8…..») — gapify به
 * «------- (N) -------» استاندارد تبدیل کرد. (۳) هفت کلیدِ پرانتز-فاصله‌دار: سه‌تاییِ پیاپیِ «1. ( a )
 * 2. ( b ) 3. ( d )» + «42. ( a )»/«43. ( d )»/«48. ( c )»/«49. ( d )». (۴) برخوردِ بین‌برگه‌ای:
 * گزینهٔ d س۶ عینِ ساقهٔ r385-l36-1؛ «I have kept a diary» اینجا کلیدِ ۲۱ است و در r385 اضافیِ چاپی
 * بود؛ س۱۲ (Mina/John) هفتمین تکرارِ درسِ r380-ق۳۲ — John عینِ r384 و Mina دوقلویِ Roya.
 * (۵) l43/l44 کلوژهای شنیداریِ چاپ با استخرِ خودِ کلیدِ رسمی و چرخش‌های تازهٔ [1,2,3,2]/[0,2,4,0,3,5]
 * (الگویِ r381-l9/r383-l22). (۶) l45 حرفِ اولِ هم‌شکل (s+++++/w+++). (۷) l50 سومین بانکِ
 * شش‌گزینه‌ایِ مرتب‌سازی (پاراگرافِ کانادا، کلیدهای چاپی c,f,a,b,d,e).
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

const rec = bank.source.g12nahaie7 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r386) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p301 = slicePage(301);
const p302 = slicePage(302);
const p303 = slicePage(303);
const p304 = slicePage(304);
const p305 = slicePage(305);
const p306 = slicePage(306);
const p307 = slicePage(307);
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
const gapify = (raw: string) => raw.replace(/[….]+\s*(\d{1,2})\s*[….]+/g, (_m, n) => `------- (${n}) -------`);

describe("r386 — رسیدِ g12nahaie7 (نهاییِ دی ۱۳۹۹ با کلیدِ رسمی)", () => {
  it("رسید: r386، ص۳۰۱-۳۰۵ + راهنمای تصحیحِ ص۳۰۶-۳۰۷، ۶۲ ردیف/۴۰ استخراج/۲۲ مستثنی، ۴۰ آیتم در [4,6,8,4,4,4,4,6]", () => {
    expect(rec.extractedRound).toBe("r386");
    expect(rec.section).toContain("دی ۱۳۹۹");
    expect(rec.section).toContain("برگهٔ هفتم");
    expect(rec.section).toContain("کلیهٔ رشته‌ها");
    expect(rec.examPages).toContain("pdf-p301-305");
    expect(rec.examPages).toContain("306-307");
    expect(rec.examMeta).toContain("دی ماه");
    expect(rec.examMeta).toContain("۰۱/۱۱/۹۹");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۱۰ صبح");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("1. ( a )");
    expect(rec.keyVerification).toContain("8. generated");
    expect(rec.keyVerification).toContain("30. symbol");
    expect(rec.keyVerification).toContain("36. had studied");
    expect(rec.keyVerification).toContain("Mina was upset because she had gotten a bad score.");
    expect(rec.keyVerification).toContain("42. ( a )");
    expect(rec.keyVerification).toContain("48. ( c )");
    expect(rec.keyVerification).toContain("50. world");
    expect(rec.sectionsTotal).toBe(62);
    expect(rec.sectionsExtracted).toBe(40);
    expect(rec.sectionsSkipped).toBe(22);
    expect(rec.items).toBe(40);
    expect(rec.bankCounts).toEqual([4, 6, 8, 4, 4, 4, 4, 6]);
    expect(rec.keyPolicy).toContain("forgive");
    expect(rec.keyPolicy).toContain("[2,5,0,1,3,4]");
    expect(rec.engineNote).toContain("gapify");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: نقشهٔ ۱۷برگه‌ای — هفت برگه استخراج/۱۰ باقی + دی ۱۳۹۹ ← این راند", () => {
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
    expect(rec.paperMap).toContain("دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ (۰۱/۱۱/۹۹) ← این راند");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]");
    expect(rec.futureNote).toContain("۴۶ ردیف");
    expect(rec.futureNote).toContain("۱۰ برگه باقی است");
    expect(rec.futureNote).toContain("۳۹/John عینِ r384");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تولیدی/تصویری/بازِ تایپی/چیپ‌ها)", () => {
    expect(rec.skippedSections).toHaveLength(9);
    expect(rec.skippedSections.some((s) => s.includes("Who are our elders"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("4.False (B)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("He would go to the park."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("mother’s lap"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("عینِ ساقهٔ r385-l36-1"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("had studied"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Mina was upset"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("jump into to"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("The number of the planets"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("1. ( a )"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("gapify"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("a)True"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("move به Barcelona".slice(0, 5)))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("حروفِ بزرگ"))).toBe(true);
  });
});

describe("r386 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms دوفاصله‌ای و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const p301raw = p301.join("\n");
    expect(p301raw).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن"); // دوفاصلهٔ چاپ — در joinSeg فرومی‌ریزد
    const p301join = joinSeg(p301, "ﺑﺎﺳﻤﻪ");
    expect(p301join).toContain("1399");
    expect(p301join).toContain("aee.medu.ir");
    expect(p301join).toContain("01 / 11 / 99");
    const keyjoin = joinSeg(p306, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p307, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. ( a )", "2. ( b )", "3. ( d )",
      "4. False (B)", "5. True (A)", "6. False (B)", "7. False (B)",
      "8. generated", "9. opposite", "10. clean", "11. remind",
      "12. worst", "13. choose", "14. terrible", "15. right", "16. teenagers", "17. enjoy",
      "18. He would go to the park.", "19. They can play one of their thinking games.",
      "20. (b)", "21.(e)", "22. (d)", "23. (c)",
      "24. dedicated", "25. recommend", "26. replaced",
      "27. (c)", "28. (d)", "29. (a)",
      "30. symbol", "31. worm",
      "32. (b)", "33. (c)", "34. (a)", "35. (b)",
      "36. had studied", "37. is spoken",
      "38. Mina was upset because she had gotten a bad score.",
      "39. John could fix the car if he were at home.",
      "40. (a) True", "41. (b) False", "42. ( a )", "43. ( d )",
      "44. Quickly before they jump into to the next lesson.",
      "45. They must have a native language dictionary.",
      "46. (b) False", "47. (a) True", "48. ( c )", "49. ( d )",
      "50. world", "51. creating",
      "52. but", "53. so", "54. and", "55. or",
      "(c) There are several reasons why Canada is one of the best countries in the world.",
      "(f) First, Canada has an excellent health care system.",
      "(a) Therefore, many patients are easily cured in hospitals in Canada.",
      "(b) Second, it has a high standard of education for young people.",
      "(d) In addition, there are many chances for them to get a good job.",
      "(e) As a result, many people like to live in Canada.",
    ]) expect(keyjoin).toContain(kf);
  });

  it("خانه‌های چاپِ کلوژ بدونِ پرانتزند؛ gapify به الگویِ استاندارد می‌رسد", () => {
    const raw301 = p301.join("\n");
    expect(raw301).toContain("How might it be ……8….. from wind?");
    expect(raw301).toContain("works the ……9….. of a fan");
    expect(raw301).toContain("…10….. energy");
    expect(raw301).toContain("……11….. me of what I read");
    expect(raw301).toContain("…12…… .");
    expect(raw301).toContain("…15…. about that!");
    const wt = normStem(gapify(joinSeg(p301, "Emad: Daddy", "buildings.", true, true)));
    expect(wt).toContain("How might it be ------- (8) ------- from wind?");
    expect(wt).toContain("It is a type of ------- (10) ------- energy.");
    expect(wt).toContain("Yazd’s buildings.");
  });

  it("بلوکِ درهمِ س۱۲: فرگمنت‌های واقعیِ چاپِ سؤال؛ پاسخِ مدلِ کامل فقط در کلیدِ چاپی", () => {
    const p303join = joinSeg(p303, "ﺑﺎﺳﻤﻪ");
    for (const frag of ["had gotten/ was/ a bad score/ she/ Mina/ upset/ because",
                        "fix / the car /if / were / John/ at home",
                        "36. Joe ………..Chinese before he moved to china. (study)",
                        "37. Persian ………………in Iran, Tajikistan and Afghanistan. (speak)"])
      expect(p303join).toContain(frag);
    const keyjoin = joinSeg(p307, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    expect(keyjoin).toContain("38. Mina was upset because she had gotten a bad score.");
    expect(keyjoin).toContain("39. John could fix the car if he were at home.");
  });

  it("متنِ هر دو خوانداری در لایه (فرهنگِ لغت/پیکاسو) + جملاتِ مرتب‌سازیِ س۱۶ با کوئیرکِ کوچک‌نویسی", () => {
    const dict = normStem(joinSeg(p303, "For English teachers, a dictionary is essential", "figure it out.", true, true));
    expect(dict).toContain("at least three dictionaries available");
    expect(dict).toContain("they should clear up the confusion quickly");
    const pic = normStem(joinSeg(p304, "Pablo Picasso was a distinguished artist.", "He died on April 8, 1973.", true, true));
    expect(pic).toContain("his family move to Barcelona"); // move بدونِ d — عینِ چاپ
    expect(pic).toContain("the old Teachings of");
    expect(pic).toContain("Blue period works");
    const p305join = joinSeg(p305, "Writing", "health care system", true, true);
    for (const s of ["therefore, many patients are easily cured in hospitals in Canada",
                     "second, it has a high standard of education for young people",
                     "there are several reasons why Canada is one of the best countries in the world",
                     "in addition there are many chances for them to get a good job",
                     "as a result, many people like to live in Canada",
                     "first, Canada has an excellent health care system"])
      expect(p305join).toContain(s);
  });

  it("هستهٔ مشترکِ بین‌برگه‌ای: گزینهٔ d س۶ عینِ ساقهٔ r385-l36-1 و Mina دوقلویِ Royaِ r384 (لمِ omelet)", () => {
    expect(L(36).questions[0].question).toBe("Oil, coal and natural gas are three common ------- fuels.");
    expect(bank.lessons.flatMap((b) => b.questions).some((q2) => q2.question.includes("Mina was upset"))).toBe(false);
    // Roya در بانک‌ها هم نیست (ردیفِ r384 تایپی/مستثنی بود) — دوقلوها هر دو بیرونِ بانک‌ها
    expect(bank.lessons.flatMap((b) => b.questions).some((q2) => q2.question.includes("Roya was upset"))).toBe(false);
  });
});

describe("r386 — بانک‌های کلوژِ شنیداریِ چاپ l43/l44 (الگویِ r381-l9/r383-l22)", () => {
  const UNI43 = ["generated", "opposite", "clean", "remind"];
  const UNI44 = ["worst", "choose", "terrible", "right", "teenagers", "enjoy"];

  it("l43 (س۳ توربینِ بادی): چهارگزینه‌ای، استخرِ کلیدِ رسمی، چرخشِ تازهٔ [1,2,3,2]", () => {
    const b = L(43);
    expect(b.title).toContain("توربینِ بادی");
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions).toHaveLength(4);
    for (const it of b.questions) {
      expect([...it.options].sort(), it.id).toEqual([...UNI43].sort());
      expect(it.question).toContain("— پاسخِ خانهٔ (");
      expect(it.question).toContain("Emad: Daddy, look at those big fans!");
      expect(it.question).toContain("wind turbines");
    }
    expect(keyed(43)).toEqual(UNI43);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 3, 2]);
    const ans = b.questions.map((it) => it.answer);
    for (let i = 1; i < ans.length; i++) expect(ans[i], `adjacent key run at ${i}`).not.toBe(ans[i - 1]);
    expect(new Set(b.questions.map((it) => it.options.join("|"))).size).toBe(4);
  });

  it("l44 (س۴ برنامه‌های تلویزیونی): شش‌گزینه‌ای، چرخشِ تازهٔ [0,2,4,0,3,5] — متمایز از r381-l9", () => {
    const b = L(44);
    expect(b.title).toContain("شنیداریِ چاپ");
    expect(b.level).toBe("شش‌گزینه‌ای");
    expect(b.questions).toHaveLength(6);
    for (const it of b.questions) {
      expect([...it.options].sort(), it.id).toEqual([...UNI44].sort());
      expect(it.question).toContain("The programs on TV these days are the ------- (12) -------");
      expect(it.question).toContain("You're ------- (15) ------- about that!");
    }
    expect(keyed(44)).toEqual(UNI44);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 2, 4, 0, 3, 5]);
    const ans = b.questions.map((it) => it.answer);
    for (let i = 1; i < ans.length; i++) expect(ans[i], `adjacent key run at ${i}`).not.toBe(ans[i - 1]);
    expect(new Set(b.questions.map((it) => it.options.join("|"))).size).toBe(6);
    expect(b.questions.map((it) => it.options.join("|"))).not.toEqual(
      ["late", "office", "quiet", "walking", "wondered", "suddenly"]);
  });
});

describe("r386 — بانک l45 (س۷-س۹): بانکِ اضافی‌دار، تعریف‌یابی، حرفِ اولِ هم‌شکل", () => {
  const b = L(45);
  const POOL = ["dedicated", "replaced", "forgive", "recommend"];
  const DEFS = ["the amount of a product or service that people want",
                "the part at the beginning of a book that gives a general idea of what it is about",
                "be grateful for",
                "take something in, especially gradually"];

  it("س۷: سه ساقهٔ verbatim با بانکِ چاپیِ چهارواژه‌ای — اضافیِ هرگز-کلیدِ forgive", () => {
    expect(keyed(45).slice(0, 3)).toEqual(["dedicated", "recommend", "replaced"]);
    expect(b.questions.slice(0, 3).map((it) => it.answer)).toEqual([0, 3, 1]);
    for (const it of b.questions.slice(0, 3)) {
      expect(it.options).toEqual(POOL);
      expect(it.options[it.answer]).not.toBe("forgive");
    }
    expect(b.questions[0].question).toBe("A: Mrs. Ahmadi is very friendly and helpful. B: I know! She is known as a ------- teacher, too.");
    expect(b.questions[1].question).toBe("A: What kind of dictionary do you-------? B: A learner’s dictionary.");
    expect(b.questions[2].question).toBe("Her sister carefully -------the china plate on the shelf.");
  });

  it("س۸: تعریف‌یابی A/B — ستون B به ترتیبِ چاپ، اضافیِ «the part at the beginning» هرگز-کلید", () => {
    expect(keyed(45).slice(3, 6)).toEqual([DEFS[2], DEFS[3], DEFS[0]]);
    for (const it of b.questions.slice(3, 6)) {
      expect(it.options).toEqual(DEFS);
      expect(it.options[it.answer]).not.toBe(DEFS[1]);
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
  });

  it("س۹: حرفِ اولِ هم‌شکل — چهارِ ۶حرفیِ s-دار و چهارِ ۴حرفیِ w-دار", () => {
    const q30 = b.questions[6];
    expect(q30.question).toBe("I think O is the s - - - - - for Oxygen. I am not sure!");
    expect(q30.options).toEqual(["symbol", "system", "simply", "single"]);
    expect(q30.answer).toBe(0);
    for (const o of q30.options) expect(o).toMatch(/^s[a-z]{5}$/);
    const q31 = b.questions[7];
    expect(q31.question).toBe("I always try to wake up and start work early because I know that “the early bird catches the w- - -.”");
    expect(q31.options).toEqual(["worm", "warm", "wind", "wave"]);
    expect(q31.answer).toBe(0);
    for (const o of q31.options) expect(o).toMatch(/^w[a-z]{3}$/);
  });
});

describe("r386 — بانک l46 (س۱۰): گرامر با گزینه‌های verbatimِ چاپ", () => {
  const b = L(46);

  it("چهار ساقهٔ verbatim؛ کلیدهای چاپی [b,c,a,b]؛ «My» بزرگِ چاپ و «parents-------» چسبیده", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(46)).toEqual(["hasn’t she", "which", "must be obeyed", "would be"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 0, 1]);
    expect(b.questions[0].options).toEqual(["didn’t she", "hasn’t she", "didn’t you", "has she"]);
    expect(b.questions[1].options).toEqual(["where", "who", "which", "whom"]);
    expect(b.questions[2].options).toEqual(["must be obeyed", "should obey", "are obeying", "has been obeyed"]);
    expect(b.questions[3].options).toEqual(["can be", "would be", "are", "must be"]);
    expect(b.questions[0].question).toBe("Your sister has passed the exam, -------?");
    expect(b.questions[1].question).toBe("A: Are you writing the letter to your father? B: No, My brother is writing the letter ------- I will send to my father tomorrow.");
    expect(b.questions[3].question).toBe("My parents-------healthier if they lived in a village.");
  });
});

describe("r386 — بانک‌های خوانداری l47/l48: هر آیتم متنِ کاملِ چاپی را در ساقه دارد", () => {
  it("l47 (س۱۳ فرهنگِ لغت): کلیدهای [True,False,a,students] — پرانتزهای فاصله‌دارِ ۴۲/۴۳", () => {
    const b = L(47);
    expect(b.title).toContain("فرهنگِ لغت");
    expect(keyed(47)).toEqual(["True", "False", "Dictionaries are essential for language learning.", "students"]);
    for (const it of b.questions) {
      expect(it.question).toContain("For English teachers, a dictionary is essential");
      expect(it.question).toContain("they can use this dictionary to figure it out.");
    }
    expect(b.questions[1].question).toContain("Students must have more than four dictionaries to learn English");
    expect(b.questions[2].options).toEqual([
      "Dictionaries are essential for language learning.",
      "Bilingual dictionaries are the most important types of dictionaries.",
      "All of the students cannot figure out what they read.",
      "Monolingual dictionaries are the most expensive dictionaries.",
    ]);
    expect(b.questions[3].question).toContain("What does the underlined word “they” in paragraph 2 refer to?");
  });

  it("l48 (س۱۴ پیکاسو): کلیدهای [False,True,پدر,one day] — «move به Barcelona» و «to------- .» وفادارانه", () => {
    const b = L(48);
    expect(b.title).toContain("پیکاسو");
    expect(keyed(48)).toEqual(["False", "True", "Picasso’s father", "one day"]);
    for (const it of b.questions) {
      expect(it.question).toContain("Pablo Picasso was a distinguished artist.");
      expect(it.question).toContain("He died on April 8, 1973.");
    }
    expect(b.questions[2].question).toContain("refers to------- .");
    expect(b.questions[3].question).toContain("It took -------for Picasso to finish his exam");
    expect(b.questions[2].options).toEqual(["Picasso", "his son", "Picasso’s father", "the teacher"]);
    expect(b.questions[3].options).toEqual(["a few years", "more than a day", "only one month", "one day"]);
  });
});

describe("r386 — بانک l49 (س۱۵): حروفِ ربط با بانکِ چاپی (but, and, so, or)", () => {
  const b = L(49);

  it("چهار ساقهٔ verbatim؛ کلیدهای چاپی [but, so, and, or] در [0,2,1,3]؛ ویرگولِ فضادارِ ق۵۳", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(49)).toEqual(["but", "so", "and", "or"]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 2, 1, 3]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toBe("Sepideh likes spaghetti,------- her grandmother hates spaghetti.");
    expect(b.questions[1].question).toBe("These shoes are not comfortable , ------- I will not buy them.");
    expect(b.questions[2].question).toBe("He went to the restaurant ------- ordered food.");
    expect(b.questions[3].question).toBe("We can go by bus, ------- we can take a taxi.");
  });
});

describe("r386 — بانک l50 (س۱۶): سومین بانکِ شش‌گزینه‌ایِ مرتب‌سازی (پاراگرافِ کانادا)", () => {
  const b = L(50);

  it("شش آیتمِ شش‌گزینه‌ای با گزینه‌های a-f به ترتیبِ چاپ؛ کلیدهای چاپی [c,f,a,b,d,e] در [2,5,0,1,3,4]", () => {
    expect(b.title).toContain("مرتب‌سازیِ پاراگرافِ کانادا");
    expect(b.level).toBe("شش‌گزینه‌ای");
    expect(b.questions).toHaveLength(6);
    const CAN = [
      "therefore, many patients are easily cured in hospitals in Canada",
      "second, it has a high standard of education for young people",
      "there are several reasons why Canada is one of the best countries in the world",
      "in addition there are many chances for them to get a good job",
      "as a result, many people like to live in Canada",
      "first, Canada has an excellent health care system",
    ];
    expect(keyed(50)).toEqual([CAN[2], CAN[5], CAN[0], CAN[1], CAN[3], CAN[4]]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 5, 0, 1, 3, 4]);
    for (const it of b.questions) {
      expect(it.options).toEqual(CAN);
      expect(new Set(it.options).size).toBe(6);
      expect(it.question).toContain("مرتب‌سازیِ پاراگرافِ کانادا (س۱۶، ص۳۰۵)");
      expect(it.question).toContain("جملاتِ درهم‌ریختهٔ a تا f");
    }
    expect(b.questions[0].question).toContain("جایگاهِ ۵۶ (جملهٔ آغازینِ پاراگراف)");
    expect(b.questions[5].question).toContain("جایگاهِ ۶۱ (پایان‌بندیِ پاراگراف)");
  });
});

describe("r386 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۵۰ بانک/[…,7,4,4,4,4,2,6,4,6,8,4,4,4,4,6]/۵۲۱ id یکتا — الگویِ g12-l1..l50", () => {
    expect(bank.lessons).toHaveLength(50);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(521);
    expect(new Set(ids).size).toBe(521);
    expect(ids[481]).toBe("g12-l43-1");
    expect(ids[485]).toBe("g12-l44-1");
    expect(ids[491]).toBe("g12-l45-1");
    expect(ids[499]).toBe("g12-l46-1");
    expect(ids[503]).toBe("g12-l47-1");
    expect(ids[507]).toBe("g12-l48-1");
    expect(ids[511]).toBe("g12-l49-1");
    expect(ids[515]).toBe("g12-l50-1");
    expect(ids[520]).toBe("g12-l50-6");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ راندیِ ردیف‌های مستثنی (دامنه: بانک‌های ۴۳-۵۰ — درسِ omelet): شنیداریِ س۱-س۲/س۵، تصویریِ س۶، بازِ تایپیِ س۱۰-س۱۲ و ۴۴/۴۵/۵۰/۵۱ و چیپ‌های س۱۷ غایب‌اند", () => {
    const mine = bank.lessons.filter((b2) => b2.lesson >= 43 && b2.lesson <= 50).flatMap((b2) => b2.questions);
    expect(mine).toHaveLength(40);
    for (const forbidden of [
      "Who are our elders", // س۱ (شنیداریِ صوتی)
      "get in the plane on time", // س۲ (شنیداریِ صوتی)
      "forgetful person", // س۲ (شنیداریِ صوتی)
      "Where would he go if it were sunny", // س۵ (شنیداریِ تولیدی)
      "He would go to the park", // س۵ کلیدِ مدل
      "thinking games", // س۵ کلیدِ مدل
      "mother’s lap", // س۶ اضافیِ چاپی (تصویری)
      "Hamid sits on the sofa", // س۶ تصویری (در r383 هم اضافیِ چاپی بود — دامنه‌راندی)
      "I have kept a diary", // س۶ تصویری (در r385 اضافیِ چاپی بود — دامنه‌راندی)
      "avoid foods that contain", // س۶ تصویری
      "before he moved to china", // س۱۰ (بازِ تایپی — china کوچکِ چاپ)
      "Tajikistan", // س۱۰ (بازِ تایپی)
      "Mina was upset", // س۱۲ پاسخِ مدل (دوقلویِ r384-Roya)
      "John could fix the car", // س۱۲ پاسخِ مدل (عینِ r384)
      "When should teachers clear up", // ردیفِ ۴۴ (تایپی)
      "Picasso is famous for", // ردیفِ ۵۱ (تایپی)
      "Artists from everywhere in the", // ردیفِ ۵۰ (تایپی)
      "The number of the planets", // س۱۷ چیپ
      "order of distance from the Sun", // س۱۷ چیپ
      "largest and smallest planets", // س۱۷ چیپ
    ])
      for (const it of mine) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l45 (ق۱-۳/۷-۸) و l46/l47/l48/l49 ساقهٔ لاتینِ خالص؛ l45 (ق۴-۶) و l50 و l43/l44 ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(45).questions.slice(0, 3), ...L(45).questions.slice(6, 8)]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(45).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [46, 47, 48, 49]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const bn of [43, 44, 50]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
  });
});
