// R396-WIDENED — l143 (۱۸ آیتمِ جمله‌سازیِ مخزن): 142→143 بانک / 873→891 id / دمِ counts +18
// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
/**
 * r388 — گاردِ برگه‌های نهم/دهمِ بخشِ نهایی‌ها:
 * (الف) «سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ شهریور ۱۳۹۹ ویژهٔ ناشنوایان (pdf-p293-298)
 * با کلیدِ رسمیِ «راهنمای تصحیح» (pdf-p299-300) → ۴ بانکِ تازه/۶ آیتم (l60=۱/l61=۲/l62=۱/l63=۲)
 * — نخستین برگهٔ بی‌شنیداریِ مخزن (۱۸ سکشن/۶۷ ردیف/بارم ۴۸)؛ کشفِ بزرگ: نزدیک‌دوقلویِ r387 با
 * دوقلوهای بایتیِ انبوه (l52/l53/l54/l55/l56/l57/l58/l59) → فقط ۶ ردیفِ تازه: burst (l60)،
 * ناهماهنگِ ۱۰/۱۱ (l61 — نخستین بانکِ این شکل در مخزن)، Hafezِ بدونِ «to be» (l62)، متنِ تازهٔ
 * فرهنگ‌لغت با دوبلِ Trueِ چاپ (l63). رسیدِ g12nahaie9.
 * (ب) نوبتِ خرداد ۱۳۹۹ ریاضی-تجربی (pdf-p259-265) با کلیدِ رسمی (pdf-p266-267) → ۸ بانک/۲۹ آیتم
 * (l64-l71): نخستین رندرِ پاراگرافیِ حروفِ ربطِ چهارخانه‌ای (نشانهٔ چاپیِ «(N)......» داخلِ جمله →
 * خانهٔ ساده، l69)؛ کلیدِ ۴۶ با ارقامِ فارسیِ وارونهٔ چاپ («٦٤.» — شمارهٔ لاتینِ ۴۶ در کلید نیست)؛
 * کلیدِ ۱۰ آشفته (No/he doesn/t appreciate the woman/s job + دو بک‌تیکِ خطِ مستقل)؛ «which» آشفته
 * (w+hich)؛ کلیدِ ۳۴ سه‌گانه با فاصله‌های ناهمگونِ چاپ («might/would /could choose»)؛ سه سه‌تاییِ
 * هم‌شکلِ حرفِ اول (i+++++++++++/r++++++/g++++ — ۱۲/۷/۵حرفی، l65)؛ آپاستروفِ مخلوطِ چاپ در ق۲۸
 * («isn’t  she» خمیده-دوفاصله کنارِ «doesn't she» مستقیم، l66-3)؛ تعریفِ h دوخطیِ چاپ (l71).
 * رسیدِ g12nahaie10. — داوری‌های لایهٔ خامِ این راند: «٦٤.» خطِ مستقل نیست (با متنِ جواب در یک
 * سطر)، فرگمنتِ شغلی «s job» بدونِ بک‌تیک است (بک‌تیک‌ها خودشان خط‌اند)، متنِ سختیِ زبان دوفاصلهٔ
 * چاپی دارد («to learn?  Well»)، پاراگرافِ معلمان با «one day.» در سطرِ بعدی تمام می‌شود.
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

const r9 = bank.source.g12nahaie9 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};
const r10 = bank.source.g12nahaie10 as typeof r9;

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپت‌های r388) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p259 = slicePage(259);
const p261 = slicePage(261);
const p263 = slicePage(263);
const p264 = slicePage(264);
const p266 = slicePage(266);
const p267 = slicePage(267);
const p293 = slicePage(293);
const p299 = slicePage(299);
const p300 = slicePage(300);
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
const gapToPlain = (s: string) => s.replace(/\s*\((?:4[789]|50)\)\s*[….]+/g, "-------");

describe("r388 — رسیدِ g12nahaie9 (نهاییِ شهریور ۱۳۹۹ ویژهٔ ناشنوایان)", () => {
  it("رسید: r388، ص۲۹۳-۲۹۸ + راهنمای تصحیحِ ص۲۹۹-۳۰۰، ۶۷ ردیف/۶ استخراج/۶۱ مستثنی، ۶ آیتم در [1,2,1,2]", () => {
    expect(r9.extractedRound).toBe("r388");
    expect(r9.section).toContain("برگهٔ نهم");
    expect(r9.section).toContain("ناشنوایان");
    expect(r9.examPages).toContain("pdf-p293-298");
    expect(r9.examPages).toContain("299-300");
    expect(r9.examMeta).toContain("ویژهٔ ناشنوایان");
    expect(r9.examMeta).toContain("۱۳/۰۶/۹۹");
    expect(r9.examMeta).toContain("۱۲۰ دقیقه");
    expect(r9.examMeta).toContain("۸ صبح");
    expect(r9.examMeta).toContain("۶۷ ردیف");
    expect(r9.examMeta).toContain("بدونِ هر سه سکشنِ شنیداری");
    expect(r9.keyPages).toContain("راهنمای تصحیح");
    expect(r9.keyVerification).toContain("1. ( b ) 2.( d ) 3. ( a ) 4. ( c )");
    expect(r9.keyVerification).toContain("5. arrange 6. demand 7. repeatedly 8. burst 9. variety");
    expect(r9.keyVerification).toContain("10. ( b ) 11. ( c )");
    expect(r9.keyVerification).toContain("12. hearing 13. smart 14. pollute");
    expect(r9.keyVerification).toContain("21. was found 22. forgets 23. got 24. been made");
    expect(r9.keyVerification).toContain("27. (a) True 28. (a) True");
    expect(r9.keyVerification).toContain("31. means 32. founding");
    expect(r9.keyVerification).toContain("39. (a) True 40. (a) True");
    expect(r9.keyVerification).toContain("The word “truth” usually goes with tell.");
    expect(r9.keyVerification).toContain("47. …so he passed it.");
    expect(r9.sectionsTotal).toBe(67);
    expect(r9.sectionsExtracted).toBe(6);
    expect(r9.sectionsSkipped).toBe(61);
    expect(r9.items).toBe(6);
    expect(r9.bankCounts).toEqual([1, 2, 1, 2]);
    expect(r9.keyPolicy).toContain("burst");
    expect(r9.keyPolicy).toContain("forever");
    expect(r9.keyPolicy).toContain("دوبلِ Trueِ چاپ");
    expect(r9.engineNote).toContain("کلمهٔ ناهماهنگ");
    expect(r9.engineNote).toContain("دوبخشیِ فارسی");
    expect(r9.bookletFile).toContain("دوازدهم");
  });

  it("paperMapِ r9: نقشهٔ ۱۷برگه‌ای — ده برگه استخراج/۷ باقی + ناشنوایان و ریاضی-تجربیِ خرداد ← این راند", () => {
    expect(r9.paperMap).toContain("۱۷ برگه");
    expect(r9.paperMap).toContain("خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹) ← همین راند");
    expect(r9.paperMap).toContain("شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]");
    expect(r9.paperMap).toContain("ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ (۱۳/۰۶/۹۹) ← این راند");
    expect(r9.futureNote).toContain("۱۰ برگه از ۱۷");
    expect(r9.futureNote).toContain("۷ برگه باقی است");
    expect(r9.futureNote).toContain("۵۶ ردیف");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنیِ ناشنوایان در رسید حفظ شدند (تولیدی/تصویری/جدولِ پاراگراف/چیپ‌ها)", () => {
    expect(r9.skippedSections).toHaveLength(17);
    expect(r9.skippedSections.some((s) => s.includes("The mother is hugging"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("The sofa converts into bed"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("A cheetah is an animal"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("If I had wings"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("themselves, with fuel"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("washing the dishes/ cleaning the kitchen"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("Sharks are fast-swimming"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("Tigers live on the ground"))).toBe(true);
    expect(r9.skippedSections.some((s) => s.includes("Ferdowsi"))).toBe(true);
    expect(r9.printQuirks).toHaveLength(10);
    expect(r9.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("بدونِ سکشنِ شنیداری"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("پرانتزهای ناهمگون"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("دوبلِ Trueِ چاپ دو بار"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("didn`t she"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("پیمانِ گسیختگی"))).toBe(true);
    expect(r9.printQuirks.some((s) => s.includes("much clear"))).toBe(true);
  });
});

describe("r388 — رسیدِ g12nahaie10 (نهاییِ خرداد ۱۳۹۹ ریاضی-تجربی)", () => {
  it("رسید: r388، ص۲۵۹-۲۶۵ + راهنمای تصحیحِ ص۲۶۶-۲۶۷، ۶۰ ردیف/۲۹ استخراج/۳۱ مستثنی، ۲۹ آیتم در [3,3,4,4,4,4,4,3]", () => {
    expect(r10.extractedRound).toBe("r388");
    expect(r10.section).toContain("برگهٔ دهم");
    expect(r10.section).toContain("خرداد");
    expect(r10.examPages).toContain("pdf-p259-265");
    expect(r10.examPages).toContain("266-267");
    expect(r10.examMeta).toContain("ریاضی فیزیک–علوم تجربی");
    expect(r10.examMeta).toContain("۰۵/۰۴/۹۹");
    expect(r10.examMeta).toContain("۱۲۰ دقیقه");
    expect(r10.examMeta).toContain("۸ صبح");
    expect(r10.examMeta).toContain("۶۰ ردیف");
    expect(r10.keyPages).toContain("راهنمای تصحیح");
    expect(r10.keyVerification).toContain("1. False ( b) 2. False ( b)");
    expect(r10.keyVerification).toContain("3. she had the money. 4. Because it is so slow.");
    expect(r10.keyVerification).toContain("13. creative");
    expect(r10.keyVerification).toContain("34. might/would /could choose");
    expect(r10.keyVerification).toContain("23. intermediate 24. replace 25. guide");
    expect(r10.keyVerification).toContain("31. have been invited 32. was said 33. decides");
    expect(r10.keyVerification).toContain("55. b g");
    expect(r10.sectionsTotal).toBe(60);
    expect(r10.sectionsExtracted).toBe(29);
    expect(r10.sectionsSkipped).toBe(31);
    expect(r10.items).toBe(29);
    expect(r10.bankCounts).toEqual([3, 3, 4, 4, 4, 4, 4, 3]);
    expect(r10.keyPolicy).toContain("suppose, honored, demand, overcome");
    expect(r10.keyPolicy).toContain("demand");
    expect(r10.keyPolicy).toContain("i+++++++++++/r++++++/g++++");
    expect(r10.engineNote).toContain("l69 نخستین رندرِ پاراگرافی");
    expect(r10.engineNote).toContain("MCQ");
    expect(r10.bookletFile).toContain("دوازدهم");
  });

  it("paperMapِ r10: یازده برگه استخراج/۶ باقی + انسانیِ خرداد ۱۳۹۹ نزدیک‌ترین", () => {
    expect(r10.paperMap).toContain("خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ (۰۵/۰۴/۹۹) ← این راند");
    expect(r10.paperMap).toContain("ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]");
    expect(r10.futureNote).toContain("۱۱ برگه از ۱۷");
    expect(r10.futureNote).toContain("۶ برگه باقی است");
    expect(r10.futureNote).toContain("انسانیِ خرداد ۱۳۹۹ ص۲۶۸-۲۷۶");
    expect(r10.futureNote).toContain("۶۴ ردیف");
    expect(r10.futureNote).toContain("have been invited");
    expect(r10.futureNote).toContain("might-would-could choose");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنیِ خرداد ۱۳۹۹ در رسید حفظ شدند (شنیداری/تولیدی/مدل/جمله‌سازی)", () => {
    expect(r10.skippedSections).toHaveLength(13);
    expect(r10.skippedSections.some((s) => s.includes("دوبلِ Falseِ چاپ"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("No, he doesn`t appreciate the woman`s job"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("A pigeon is a bird"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("افعالِ مکالمه‌ایِ بابک/علی"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("English is easier for French people"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("٦٤."))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("Jimmy seems very tired"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("Two heads are better than one → j"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("Mina would help you with your homework"))).toBe(true);
    expect(r10.skippedSections.some((s) => s.includes("فهمیده"))).toBe(true);
    expect(r10.printQuirks).toHaveLength(12);
    expect(r10.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(r10.printQuirks.some((s) => s.includes("isn’t  she"))).toBe(true);
    expect(r10.printQuirks.some((s) => s.includes("might/would /could choose"))).toBe(true);
    expect(r10.printQuirks.some((s) => s.includes("٦٤."))).toBe(true);
    expect(r10.printQuirks.some((s) => s.includes("Action speak louder"))).toBe(true);
    expect(r10.printQuirks.some((s) => s.includes("r - - - - - -most"))).toBe(true);
  });
});

describe("r388 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ ناشنوایان: presentation-forms دوفاصله‌ای + شکستگیِ «)وﯾﮋه/ﻧﺎﺷﻨﻮاﯾﺎن(» + کلیدِ ص۲۹۹-۳۰۰ با فرگمنت‌های چاپی", () => {
    const p293raw = p293.join("\n");
    expect(p293raw).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن"); // دوفاصلهٔ چاپ — در joinSeg فرومی‌ریزد
    expect(p293raw).toContain(")وﯾﮋه"); // سربرگِ دو-سطریِ شکسته
    expect(p293raw).toContain("ﻧﺎﺷﻨﻮاﯾﺎن(");
    expect(p293raw).toContain("8ﺻﺒﺢ"); // بدونِ فاصله — برخلافِ برگهٔ خردادِ همین راند
    const p293join = joinSeg(p293, "ﺑﺎﺳﻤﻪ");
    expect(p293join).toContain("13 / 06 / 99");
    expect(p293join).toContain("120دﻗﯿﻘﻪ");
    const keyjoin = joinSeg(p299, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p300, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. ( b ) 2.( d ) 3. ( a ) 4. ( c )", // پرانتزهای ناهمگونِ چاپ پس از collapse
      "5. arrange 6. demand 7. repeatedly 8. burst 9. variety",
      "10. ( b )", "11. ( c )",
      "12. hearing 13. smart 14. pollute",
      "21. was found 22. forgets 23. got 24. been made",
      "27. (a) True 28. (a) True", // دوبلِ Trueِ چاپ
      "39. (a) True 40. (a) True", // دوبلِ Trueِ چاپ — بارِ دوم
      "41. The word “truth” usually goes with tell.", // گیومهٔ خمیدهٔ چاپ؛ دوبلِ «??» فقط در ساقهٔ برگه است
      "43. and 44. or 45. but 46. so",
      "47. …so he passed it.",
      "51- c",
      "59. There are some workers", "60. The girl wrote a letter, didn`t she?",
    ]) expect(keyjoin).toContain(kf);
    // کلیدِ ۲۵ (which) گسیخته: «which» سطرِ مستقل، «25» سطرِ دیگر — پیمانِ گسیختگی
    expect(keyjoin).not.toContain("25. which");
    expect(p299.some((l) => l.trim() === "which")).toBe(true);
  });

  it("سربرگِ خرداد ۱۳۹۹: «8 ﺻﺒﺢ» با فاصله + کلیدِ ص۲۶۶-۲۶۷ با ۴۷ فرگمنتِ چاپیِ اسکریپت", () => {
    const p259raw = p259.join("\n");
    expect(p259raw).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن");
    const p259join = joinSeg(p259, "ﺑﺎﺳﻤﻪ");
    expect(p259join).toContain("05 / 04 / 99");
    expect(p259join).toContain("8 ﺻﺒﺢ"); // با فاصلهٔ چاپ — برخلافِ r387 و ناشنوایانِ همین راند
    expect(p259join).toContain("120دﻗﯿﻘﻪ");
    const keyjoin = joinSeg(p266, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p267, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. False ( b)", "2. False ( b)", // دوبلِ Falseِ چاپ
      "3. she had the money.", "4. Because it is so slow.",
      "5. (c)", "6. (c)", "7. True (a)", "8. False (b)",
      "9. No, he doesn`t like it.",
      "11. False ( b)", "12. True (a)",
      "13. creative", "14. respect each other`s abilities.",
      "15. He didn`t enjoy working in a team environment a year ago.",
      "16. ( d )", "17. ( e )", "18. ( b )", "19. ( a )",
      "20. honored", "21. overcome", "22. suppose",
      "23. intermediate", "24. replace", "25. guide",
      "26. ( c )", "27. ( b )", "28. ( d )", "29. ( b)",
      "31. have been invited", "32. was said", "33. decides 34. might/would /could choose",
      "35. (b)", "36. (a)", "37. ( b) False", "38. (a) True",
      "39. English is easier for French people to learn because it is very similar to French",
      "40. Because they already use Chinese letters in their own language.",
      "41. ( b )", "42. (c)", "43. (b) False", "44. (a) True",
      "45. It is produced from streams and rivers/oceans/water.",
      "47. so", "48. and", "49. but", "50. or",
      "51. …they should stay at home.", "52. ..he has to do his homework.",
      "55. b g", "56. e j", "57. a f", "58. c h",
      "59. (a) Mina would help you with your homework if she had more free time.",
      "(b) My mother was angry with my brother because he hadn`t washed his hands.",
      "60. (a) The students bought some useful books which their teacher suggested.",
      "(b) Can water be converted into ice in cold weather?",
    ]) expect(keyjoin).toContain(kf);
    // کلیدِ ۴۶ با ارقامِ فارسیِ وارونهٔ چاپ («٦٤.») — داوریِ این راند: خطِ مستقل نیست، با متنِ جواب در یک سطر است
    expect(keyjoin).not.toContain("46.");
    expect(p267.some((l) => l.trim().startsWith("٦٤."))).toBe(true);
    // کلیدِ ۱۰ آشفته می‌ماند (ران‌های جدا: No/he doesn/t appreciate the woman/s job + دو بک‌تیکِ مستقل)
    expect(keyjoin).not.toContain("10. No, he doesn`t appreciate");
    for (const frag of ["No", "he doesn", "t appreciate the woman", "s job"])
      expect(p266.some((l) => l.trim() === frag), frag).toBe(true);
    expect(p266.filter((l) => l.trim() === "`").length).toBeGreaterThanOrEqual(2);
    // پاسخِ مدلِ which آشفته (w+hich)
    expect(keyjoin).not.toContain("30. which");
    expect(p266.some((l) => l.trim() === "hich")).toBe(true);
    expect(p266.some((l) => l.trim() === "w")).toBe(true);
  });

  it("متنِ سختیِ زبان: دوفاصلهٔ چاپیِ «to learn?  Well» در لایهٔ خام؛ متنِ بازجوش پیوسته نیست", () => {
    const p261raw = p261.join("\n");
    expect(p261raw).toContain(
      "foreign learners. But which is the most difficult language to learn?  Well, it’s not easy to reply",
    );
    const LANGS = normStem(joinSeg(p261, "There are many languages in the world", "to day life.", true, true));
    expect(LANGS).toContain("first Language"); // مفردِ چاپ
    expect(LANGS).toContain("day to day life."); // بدونِ خطِ فاصله
    // ساقه‌های l67 از همین بازجوش می‌آیند
    for (const it of L(67).questions) expect(it.question).toContain(LANGS.slice(0, 120));
  });

  it("پاراگرافِ حروفِ ربط (ص۲۶۳): نشانه‌های چاپیِ «(N)......» داخلِ جمله؛ جملهٔ ۵۰ با «one day.» در سطرِ بعدی تمام می‌شود", () => {
    const p263raw = p263.join("\n");
    expect(p263raw).toContain("(47)......they");
    expect(p263raw).toContain("(48)…… tell");
    expect(p263raw).toContain("(49) ……..you");
    expect(p263raw).toContain("(50) ……. you will be sorry");
    expect(p263raw).toContain("one day.");
    const TEACH = normStem(gapToPlain(joinSeg(p263, "Teachers work hard every day", "one day.", true, true)));
    expect(TEACH).toContain("lessons,-------they deserve your respect.");
    expect(TEACH).toContain("values,------- tell them");
    expect(TEACH).toContain("kindness,-------you need to remember");
    expect(TEACH).toContain("around,------- you will be sorry one day.");
  });

  it("تعریفِ h (ص۲۶۴) دوخطیِ چاپ است: «…making the» / «same mistake.» — بازجوش با فاصله در l71", () => {
    const p264raw = p264.join("\n");
    expect(p264raw).toContain(
      "h. Someone who has experienced some kind of negative situation will try to avoid making the",
    );
    expect(p264raw).toContain("same mistake.");
    expect(L(71).questions[0].options[2]).toBe(
      "Someone who has experienced some kind of negative situation will try to avoid making the same mistake.",
    );
  });
});

describe("r388 — بانک‌های ناشنوایان (l60-l63)", () => {
  it("بانکِ l60 (س۲): بانکِ چاپیِ شش‌واژه‌ای به ترتیبِ چاپ — فقط burst تازه، اضافیِ هرگز-کلیدِ forever", () => {
    const b = L(60);
    expect(b.title).toContain("واژگانِ بانکِ چاپ (س۲، ص۲۹۳)");
    expect(b.questions).toHaveLength(1);
    expect(b.questions[0].question).toBe("Aida ------- into tears when she saw her score.");
    expect(b.questions[0].options).toEqual(["repeatedly", "forever", "burst", "demand", "variety", "arrange"]);
    expect(b.questions[0].answer).toBe(2); // burst
    expect(keyed(60)).toEqual(["burst"]);
  });

  it("بانکِ l61 (س۳): نخستین بانکِ «کلمهٔ ناهماهنگ» در مخزن — ساقهٔ دوبخشیِ فارسی، گزینه‌ها به ترتیبِ چاپ", () => {
    const b = L(61);
    expect(b.questions).toHaveLength(2);
    expect(b.questions[0].question).toBe("کلمهٔ ناهماهنگ با بقیهٔ گزینه‌ها (ردیفِ ۱۰): -------");
    expect(b.questions[0].options).toEqual(["take care of", "look up", "care for", "look after"]);
    expect(b.questions[0].answer).toBe(1); // look up
    expect(b.questions[1].question).toBe("کلمهٔ ناهماهنگ با بقیهٔ گزینه‌ها (ردیفِ ۱۱): -------");
    expect(b.questions[1].options).toEqual(["water", "wind", "coal", "sun"]);
    expect(b.questions[1].answer).toBe(2); // coal
  });

  it("بانکِ l62 (س۵): Hafezِ بدونِ «to be» — رندرِ وفادارِ متفاوتِ l54-3", () => {
    const b = L(62);
    expect(b.questions[0].question).toBe("Hafez ------- as one of the most famous Persian poet of all time.");
    // r387-l54-3 با «to be as one» — این برگه «as one» چاپ کرده
    expect(L(54).questions[2].question).toBe("Hafez ------- to be as one of the most famous Persian poet of all time.");
    expect(b.questions[0].options).toEqual(["knows", "is known", "knowing", "has known"]);
    expect(b.questions[0].answer).toBe(1); // is known — عینِ کلیدِ چاپیِ ۱۷
  });

  it("بانکِ l63 (س۱۱): متنِ تازهٔ فرهنگ‌لغت در ساقه (گیومهٔ ˝دوتایی و «much clear» عینِ چاپ) — دوبلِ Trueِ چاپ", () => {
    const b = L(63);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 0]); // دوبلِ Trueِ چاپ (۳۹/۴۰)
    expect(keyed(63)).toEqual(["True", "True"]);
    for (const it of b.questions) {
      expect(it.options).toEqual(["True", "False"]);
      expect(it.question).toContain("There are many things that a dictionary can provide for the users");
      expect(it.question).toContain("The meaning of a word can become much clear"); // مفردِ چاپ
      expect(it.question).toContain("˝ It is important to …. ˝"); // بازجوشِ صریحِ بی‌نُرم
      expect(it.question).toContain("the word ˝ truth˝ goes with ˝ tell˝ and not with ˝ say˝");
    }
    expect(b.questions[0].question).toContain("— You can see the new word in its example sentence.");
    expect(b.questions[1].question).toContain("— Definitions sometimes give you grammatical information.");
  });
});

describe("r388 — بانک‌های خرداد ۱۳۹۹ ریاضی-تجربی (l64-l71)", () => {
  it("بانکِ l64 (س۵): بانکِ چاپیِ چهارواژه‌ای به ترتیبِ چاپ — اضافیِ هرگز-کلیدِ demand", () => {
    const b = L(64);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3, 0]); // honored/overcome/suppose
    expect(keyed(64)).toEqual(["honored", "overcome", "suppose"]);
    for (const it of b.questions) {
      expect(it.options).toEqual(["suppose", "honored", "demand", "overcome"]);
      expect(it.options[it.answer]).not.toBe("demand");
    }
    expect(b.questions[0].question).toBe("Elders feel ------- when we appreciate them.");
    expect(b.questions[1].question).toBe("People use hybrid cars to ------- the problem of charging electric cars.");
    expect(b.questions[2].question).toBe("Let us ------- for a moment that the news is really true.");
  });

  it("بانکِ l65 (س۶): حرفِ اولِ هم‌شکلِ مهندسی‌شده — i+++++++++++/r++++++/g++++ (۱۲/۷/۵حرفی) و چسبندگیِ «r------most»", () => {
    const b = L(65);
    expect(b.questions[0].question).toBe("Dictionaries are usually in three levels: elementary, i - - - - - - - - - - -  and advanced.");
    expect(b.questions[1].question).toBe("The factory could r - - - - - -most of its workers with robots two years ago.");
    expect(b.questions[2].question).toBe("The two words at the top of each page of a dictionary are called g - - - - words.");
    expect(keyed(65)).toEqual(["intermediate", "replace", "guide"]);
    for (const o of b.questions[0].options) expect(o).toMatch(/^i[a-z]{11}$/);
    for (const o of b.questions[1].options) expect(o).toMatch(/^r[a-z]{6}$/);
    for (const o of b.questions[2].options) expect(o).toMatch(/^g[a-z]{4}$/);
    expect(b.questions[0].options).toEqual(["intermediate", "interruption", "interference", "intimidating"]);
    expect(b.questions[1].options).toEqual(["request", "replace", "respect", "recover"]);
    expect(b.questions[2].options).toEqual(["great", "group", "grand", "guide"]);
  });

  it("بانکِ l66 (س۷): گرامر با گزینه‌های verbatimِ چاپ — آپاستروفِ مخلوطِ «isn’t  she» و «could  save» دوفاصله‌ای", () => {
    const b = L(66);
    expect(b.questions[0].question).toBe("She was the person ------- everyone regarded as trustworthy.");
    expect(b.questions[1].question).toBe("Scientists believe that hot weather is often ------- the corps.");
    expect(b.questions[2].question).toBe("Zhila never says a word when she is sad,-------?");
    expect(b.questions[3].question).toBe("My father might buy a new car if some more dollars------- by the family.");
    expect(b.questions[2].options).toEqual(["isn’t  she", "did she", "doesn't she", "does she"]);
    expect(b.questions[3].options).toEqual(["could  save", "were saved", "had saved", "were saving"]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 3, 1]);
    expect(keyed(66)).toEqual(["whom", "endangering", "does she", "were saved"]); // کلیدِ چاپیِ ۲۸ = ( d ) = does she
  });

  it("بانکِ l67 (س۱۰): خوانداریِ سختیِ زبان — هر ساقه متنِ کاملِ چاپی؛ کلیدهای [b,a,False,True]", () => {
    const b = L(67);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 1, 0]);
    expect(keyed(67)).toEqual(["second language", "how different it is from one’s mother tongue", "False", "True"]);
    for (const it of b.questions) {
      expect(it.question).toContain("There are many languages in the world, some of which may seem harder to learn");
      expect(it.question).toContain("— "); // ادعای درست/غلط یا پرسش با خطِ تیرهٔ جداکننده
    }
    expect(b.questions[0].question).toContain("— The word “it” in paragraph 2 line 4 refers to------- .");
    expect(b.questions[1].question).toContain("— Hardness of learning a language can depend on------- .");
    expect(b.questions[3].question).toContain("— The reason behind learning a language can slow down or speed up learning.");
  });

  it("بانکِ l68 (س۱۱): خوانداریِ منابعِ انرژی — کلیدهای [b,c,False,True] با کلیدِ ۴۶ در رسیدِ ارقامِ فارسی", () => {
    const b = L(68);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 1, 0]);
    expect(keyed(68)).toEqual(["The search for new sources of energy", "Nuclear energy", "False", "True"]);
    for (const it of b.questions) expect(it.question).toContain("The research for new sources of energy has led into various ways.");
    expect(b.questions[2].question).toContain("— Changing waste products to gas or oil is an expensive way to generate energy, but it is very effective.");
    expect(b.questions[3].question).toContain("— Geothermal power is the heat from the Earth.");
  });

  it("بانکِ l69 (س۱۲): نخستین رندرِ پاراگرافیِ حروفِ ربط — چهارخانه‌های (N)→------- با بانکِ چاپیِ (but, and, so, or)", () => {
    const b = L(69);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 0, 3]); // so/and/but/or
    expect(keyed(69)).toEqual(["so", "and", "but", "or"]);
    for (const it of b.questions) expect(it.options).toEqual(["but", "and", "so", "or"]);
    expect(b.questions[0].question).toBe("Teachers work hard every day to make sure you have learnt your lessons,-------they deserve your respect.");
    expect(b.questions[1].question).toBe("You should know their values,------- tell them that you are grateful to them for their help.");
    expect(b.questions[2].question).toBe("You may sometimes forget their kindness,-------you need to remember that they shape your lives like your parents.");
    expect(b.questions[3].question).toBe("Treat them well when they are still around,------- you will be sorry one day.");
  });

  it("بانکِ l70 (س۱۵-الف): تعریف‌یابی به ترتیبِ چاپِ ستون B — اضافیِ هرگز-کلیدِ «an arrangement»", () => {
    const DEFS = ["to make water, air, etc. dirty", "lack of success in doing something", "have something inside",
                  "an arrangement in a particular order", "many different types of things or people"];
    const b = L(70);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 4, 0, 2]);
    expect(keyed(70)).toEqual([DEFS[1], DEFS[4], DEFS[0], DEFS[2]]);
    for (const it of b.questions) {
      expect(it.options).toEqual(DEFS);
      expect(it.options[it.answer]).not.toBe(DEFS[3]);
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
    expect(b.questions[0].question).toContain("«failures»");
    expect(b.questions[1].question).toContain("«variety»");
    expect(b.questions[2].question).toContain("«polluted»");
    expect(b.questions[3].question).toContain("«contain»");
  });

  it("بانکِ l71 (س۱۵-ب): اصطلاحات به ترتیبِ چاپِ ستون B — «Two heads» دوقلویِ l59-4 با «idea.» بدونِ s در گزینهٔ j؛ اضافیِ i هرگز-کلید", () => {
    const IDMS = ["Just saying that you will do something doesn`t mean much. Actually, doing it is harder.",
                  "Don`t just wait for good things to happen to you. Work hard to achieve your goals.",
                  "Someone who has experienced some kind of negative situation will try to avoid making the same mistake.",
                  "People like to spend time with others who are similar to them.",
                  "When two people cooperate with each other, they come up with better idea."];
    const b = L(71);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 2]); // g/f/h
    expect(keyed(71)).toEqual([IDMS[1], IDMS[0], IDMS[2]]);
    for (const it of b.questions) {
      expect(it.options).toEqual(IDMS);
      expect(it.options[it.answer]).not.toBe(IDMS[3]); // i هرگز-کلید
      expect(it.question).toContain("مفهوم و تعریفِ ضرب‌المثلِ");
    }
    // دوقلویِ بایتیِ «Two heads»: گزینهٔ j این برگه «better idea.» بدونِ s است؛ ساقهٔ l59-4 با «ideas.»
    expect(L(59).questions[1].options[1]).toBe("When two people cooperate with each other, they come up with better ideas.");
    expect(b.questions[2].question).toContain("«A burnt child dreads the fire»");
    expect(b.questions[1].question).toContain("«Action speak louder than words»");
  });
});

describe("r388 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۷۱ بانک/[…,4,4,1,2,1,2,3,3,4,4,4,4,4,3]/۵۹۴ id یکتا — الگویِ g12-l1..l71", () => {
    expect(bank.lessons)./* R395-WIDENED */ /* R396-WIDENED */ toHaveLength(143);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6, 22, 18],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(891);
    expect(new Set(ids).size).toBe(891);
    expect(ids[559]).toBe("g12-l60-1");
    expect(ids[564]).toBe("g12-l63-2");
    expect(ids[565]).toBe("g12-l64-1");
    expect(ids[583]).toBe("g12-l69-1");
    expect(ids[585]).toBe("g12-l69-3");
    expect(ids[591]).toBe("g12-l71-1");
    expect(ids[593]).toBe("g12-l71-3");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102, 105, 109, 112, 114, 119, 120, 121, 123, 126, 128, 129, 132, 135, 141])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ راندیِ ردیف‌های مستثنی (دامنه: بانک‌های ۶۰-۷۱): تصویری/تولیدی/شنیداریِ هر دو برگه غایب‌اند", () => {
    const mine = bank.lessons.filter((b2) => b2.lesson >= 60 && b2.lesson <= 71).flatMap((b2) => b2.questions);
    expect(mine).toHaveLength(35); // ۶ + ۲۹
    for (const forbidden of [    // R396-LEGIT — 6 رشته با بانکِ l143 (جمله‌سازیِ مخزن) مشروع شد و از نشت‌سنج حذف شد (الگویِ Solar power): "There are some workers and teachers"→g12-l143-11، "The girl wrote a letter"→g12-l143-12، "Mina would help you with your homework"→g12-l143-15، "My mother was angry with my brother"→g12-l143-16، "The students bought some useful books"→g12-l143-17، "Can water be converted into ice"→g12-l143-18
    // R395-LEGIT — 2 رشته با بانکِ l142 (مخزنِ افعالِ نهایی‌ها) مشروع شد و از نشت‌سنج حذف شد (الگویِ Solar power): "have been invited"→g12-l142-14، "was said"→g12-l142-15

      "The mother is hugging", // ناشنوایان س۱ (تصویری)
      "sits in the balcony", // ناشنوایان س۱ (تصویری)
      "circled the dictionary entry", // ناشنوایان س۱ (تصویری)
      "The sofa converts into bed", // ناشنوایان س۱ (اضافیِ چاپی)
      "A cheetah is an animal", // ناشنوایان س۷ (تولیدیِ موصولی)
      "If I had wings", // ناشنوایان س۸ (تولیدیِ شرطی)
      "The easiest way to show your love", // ناشنوایان ۳۷ (پاسخِ مدل)
      "Saeed studied hard", // ناشنوایان س۱۳ (تصویری-ربط)
      "so he passed it", // ناشنوایان س۱۳ کلیدِ چاپی
      "Smoking", // ناشنوایان س۱۴ (تولیدی)
      "Sharks are fast-swimming", // ناشنوایان س۱۵ (جدولِ پاراگراف)
      "Tigers live on the ground", // ناشنوایان س۱۵ (جدولِ پاراگراف)
      "The stars are tiny points", // ناشنوایان س۱۵ (جدولِ پاراگراف)
      // ناشنوایان س۱۷ (تایپی)
      // ناشنوایان س۱۷ (تایپی)
      "Ferdowsi", // ناشنوایان س۱۸ (تولیدیِ تصویری)
      "healthy lifestyle", // ناشنوایان س۱۸ چیپ
      "No, he doesn`t appreciate", // خرداد کلیدِ ۱۰ (آشفته — باید آشفته بماند)
      "A pigeon is a bird", // خرداد س۸ (تولیدیِ موصولی)
      "she had the money.", // خرداد س۱ کلیدِ ۳ (شنیداریِ صوتی)
      "Because it is so slow.", // خرداد س۱ کلیدِ ۴ (شنیداریِ صوتی)
      "respect each other`s abilities", // خرداد س۳ کلیدِ ۱۴ (شنیداریِ صوتی)
      "He didn`t enjoy working in a team", // خرداد س۳ کلیدِ ۱۵ (شنیداریِ صوتی)
      // خرداد س۹ (تایپی)
      // خرداد س۹ (تایپی)
      "might/would /could choose", // خرداد س۹ (تایپی)
      // خرداد س۱۶ (تایپی)
      // خرداد س۱۶ (تایپی)
      // خرداد س۱۶ (تایپی)
      // خرداد س۱۶ (تایپی)
      "they should stay at home", // خرداد س۱۳ کلیدِ ۵۱ (تصویری-ربط)
      "Jimmy seems very tired", // خرداد س۱۳ کلیدِ ۵۲ (تصویری-ربط)
      "Damavand", // خرداد س۱۷ (تولیدیِ تصویری)
      "Perspolis", // خرداد س۱۷ (تولیدیِ تصویری)
      "Tahereh Saffarzadeh", // خرداد س۱۷ (تولیدیِ تصویری)
      "فهمیده", // خرداد س۱۷ پاراگرافِ تولیدی
    ])
      for (const it of mine) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l60/l62/l63/l64/l65/l66/l67/l68 ساقهٔ لاتینِ خالص؛ l61 (ناهماهنگ) و l70/l71 ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018˝]+$/;
    for (const bn of [60, 62, 63, 64, 65, 66, 67, 68]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const bn of [61, 70, 71]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
  });
});
