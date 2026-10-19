// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
/**
 * r387 — گاردِ برگهٔ هشتمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ شهریور ۱۳۹۹، تمام رشته‌ها (pdf-p285-290)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p291-292) → ۹ بانکِ تازه/۳۸ آیتم در tests-g12.json
 * (مجموع: ۵۹ بانک/۵۵۹ آیتم)
 *
 * نکاتِ راند: (۱) ششمین برگهٔ presentation-forms با سربرگِ دوفاصله‌ایِ «ﺳﺆاﻻت  اﻣﺘﺤﺎن» (الگویِ
 * r383/r386). (۲) خانه‌های کلوژِ شنیداری بدونِ پرانتزِ چاپی با دنباله‌های مختلط («…9…….»/«…13..….»)
 * — gapify به «------- (N) -------» استاندارد تبدیل کرد. (۳) شش کلیدِ پرانتز-فاصله‌دار: سه‌تاییِ
 * پیاپیِ «1. ( a ) 2. ( c ) 3. ( c )» + «35. ( d )»/«36. ( a )»/«41. ( b )»/«42. ( d )» — یازدهم تا
 * چهاردهمین بارِ درسِ r380-ق۳۸. (۴) برخوردهای بین‌برگه‌ایِ دوقلو: omelet (r384-l34-1 با فاصله /
 * اینجا با اتصالِ ویرگولی) و dictionary-expensive (r385-l41-2 با اتصال به I / اینجا با اتصال به
 * ویرگول) — هر سه رندرِ وفادارِ برگهٔ خود؛ «Plants absorb carbon dioxide» عینِ ساقهٔ r386-l45-5
 * (ستونِ تعریفِ متفاوت). (۵) l51 کلوژِ شنیداریِ چاپ با استخرِ خودِ کلیدِ رسمی و چرخشِ تازهٔ
 * [2,0,3,1,2,0] (الگویِ r381-l9/r383-l22/r386-l43-l44). (۶) l53 حرفِ اولِ هم‌شکل (h+++++/s++++/p+++++)
 * — «s - - - - phones» در لایه هم ۴ خط دارد (خوانشِ نخستِ سه‌خطی اشتباه بود؛ رندر تأیید کرد).
 * (۷) l56 متنِ لایه‌آشفته (ران‌های توپُر/زیرخط‌دارِ «becam»+«e»+«they») با بازجوشِ داوری‌شدهٔ
 * ۳۰۰dpi — پیمان: فرگمنت‌های خام در لایه، متنِ پیوسته نیست. (۸) دوبلِ Trueِ چاپ در کلیدِ ۳۹/۴۰.
 * (۹) این برگه سکشنِ مرتب‌سازیِ شش‌گزینه‌ای ندارد (نخستین برگهٔ بدونِ آن بینِ نهایی‌های g12).
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

const rec = bank.source.g12nahaie8 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r387) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p285 = slicePage(285);
const p286 = slicePage(286);
const p287 = slicePage(287);
const p288 = slicePage(288);
const p289 = slicePage(289);
const p291 = slicePage(291);
const p292 = slicePage(292);
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

describe("r387 — رسیدِ g12nahaie8 (نهاییِ شهریور ۱۳۹۹ با کلیدِ رسمی)", () => {
  it("رسید: r387، ص۲۸۵-۲۹۰ + راهنمای تصحیحِ ص۲۹۱-۲۹۲، ۶۷ ردیف/۳۸ استخراج/۲۹ مستثنی، ۳۸ آیتم در [6,3,3,6,4,4,4,4,4]", () => {
    expect(rec.extractedRound).toBe("r387");
    expect(rec.section).toContain("شهریور ۱۳۹۹");
    expect(rec.section).toContain("برگهٔ هشتم");
    expect(rec.section).toContain("تمام رشته‌ها");
    expect(rec.examPages).toContain("pdf-p285-290");
    expect(rec.examPages).toContain("291-292");
    expect(rec.examMeta).toContain("شهریورماه");
    expect(rec.examMeta).toContain("۱۳/۰۶/۹۹");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۸ صبح");
    expect(rec.examMeta).toContain("۴۸");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("1. ( a )");
    expect(rec.keyVerification).toContain("2. ( c )");
    expect(rec.keyVerification).toContain("9. volleyball");
    expect(rec.keyVerification).toContain("15. ( b  )");
    expect(rec.keyVerification).toContain("25. ( b)");
    expect(rec.keyVerification).toContain("39. (a) True 40. (a) True");
    expect(rec.keyVerification).toContain("43. means");
    expect(rec.keyVerification).toContain("44. founding");
    expect(rec.keyVerification).toContain("49. …so he passed it.");
    expect(rec.keyVerification).toContain("51- c");
    expect(rec.keyVerification).toContain("didn`t she?");
    expect(rec.sectionsTotal).toBe(67);
    expect(rec.sectionsExtracted).toBe(38);
    expect(rec.sectionsSkipped).toBe(29);
    expect(rec.items).toBe(38);
    expect(rec.bankCounts).toEqual([6, 3, 3, 6, 4, 4, 4, 4, 4]);
    expect(rec.keyPolicy).toContain("forever");
    expect(rec.keyPolicy).toContain("[2,0,3,1,2,0]");
    expect(rec.engineNote).toContain("gapify");
    expect(rec.engineNote).toContain("بازجوش");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: نقشهٔ ۱۷برگه‌ای — هشت برگه استخراج/۹ باقی + شهریور ۱۳۹۹ ← این راند", () => {
    expect(rec.paperMap).toContain("۱۷ برگه");
    expect(rec.paperMap).toContain("دی ۱۳۹۷ ص۲۲۹-۲۳۳");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۸ ص۲۳۷-۲۴۱");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۸ ص۲۴۴-۲۴۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵");
    expect(rec.paperMap).toContain("خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴");
    expect(rec.paperMap).toContain("لایه‌خراب ص۲۷۷-۲۸۴");
    expect(rec.paperMap).toContain("شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ (۱۳/۰۶/۹۹) ← این راند");
    expect(rec.paperMap).toContain("ویژهٔ ناشنوایان ص۲۹۳-۲۹۸");
    expect(rec.paperMap).toContain("دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]");
    expect(rec.futureNote).toContain("۵۲ ردیف");
    expect(rec.futureNote).toContain("۹ برگه باقی است");
    expect(rec.futureNote).toContain("means");
    expect(rec.futureNote).toContain("founding");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تولیدی/تصویری/مدل/چیپ‌ها)", () => {
    expect(rec.skippedSections).toHaveLength(12);
    expect(rec.skippedSections.some((s) => s.includes("Amin/Behzad"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("He left his jacket on the bus."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("It is at 6:30."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("The sofa converts into bed."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("A cheetah is an animal"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("(would ,could ,might)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("38.Yes"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("so he passed it"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Smoking"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Ferdowsi"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("healthy lifestyle"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("gapify"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("توپُر/زیرخط‌دار"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("won`t"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("دوبلِ True"))).toBe(true);
  });
});

describe("r387 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms دوفاصله‌ای و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const p285raw = p285.join("\n");
    expect(p285raw).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن"); // دوفاصلهٔ چاپ — در joinSeg فرومی‌ریزد
    const p285join = joinSeg(p285, "ﺑﺎﺳﻤﻪ");
    expect(p285join).toContain("1399");
    expect(p285join).toContain("aee.medu.ir");
    expect(p285join).toContain("13 / 06 / 99");
    expect(p285join).toContain("8ﺻﺒﺢ");
    expect(p285join).toContain("ﺷﻬﺮﯾﻮرﻣﺎه");
    const keyjoin = joinSeg(p291, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ") + " " + joinSeg(p292, "راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    for (const kf of [
      "1. ( a )", "2. ( c )", "3. ( c )",
      "4. He left his jacket on the bus.", "5. False ( b)", "6. True (a)",
      "7. It is at 6:30.", "8. She may bring a birthday card.",
      "9. volleyball", "10. team", "11. fun", "12. play", "13. twice", "14. games",
      "15. ( b )", "16.( d )", "17. ( a )", "18. ( c )",
      "19. arrange", "20. demand", "21. repeatedly",
      "22. hearing", "23. smart", "24. pollute",
      "25. ( b)", "26. ( c )", "27. ( b )", "28. ( d )", "29. ( c )", "30. ( a )",
      "33. (a) True", "34. (b) False", "35. ( d )", "36. ( a )",
      "39. (a) True", "40. (a) True", "41. ( b )", "42. ( d )",
      "43. means", "44. founding",
      "45. and", "46. or", "47. but", "48. so",
      "49. …so he passed it.",
      "51- c", "52- a", "53- d", "54- e", "55- j", "56- h", "57- f", "58- g",
      "59. There are some workers and teachers who work in the village.",
      "60. The girl wrote a letter, didn`t she?",
      "61. Everything in the garden was brown because it hadn`t rained.",
      "62. The parents should be called by the teacher.",
    ]) expect(keyjoin).toContain(kf);
    // پاسخِ مدلِ س۹ آشفته است؛ راهنمای فارسیِ معلم «which» سالم دارد
    expect(keyjoin).not.toContain("1. which");
    expect(p291.some((l) => l.trim() === "hich")).toBe(true);
    expect(p291.some((l) => l.trim() === "w")).toBe(true);
    expect(keyjoin).toContain("(would ,could ,might)");
  });

  it("خانه‌های چاپِ کلوژ بدونِ پرانتزند با دنباله‌های مختلط؛ gapify به الگویِ استاندارد می‌رسد", () => {
    const raw285 = p285.join("\n");
    expect(raw285).toContain("is…9…….");
    expect(raw285).toContain("Are you on a ……10…… .?");
    expect(raw285).toContain("a lot of …11…... .");
    expect(raw285).toContain("about …13..…. a week");
    expect(raw285).toContain("video …14……. is a sport?");
    const nick = normStem(gapify(joinSeg(p285, "Do you play any sports, Nick?", "not sure about that", true, true)));
    expect(nick).toContain("my favorite sport is------- (9) ------- A: Really?"); // نقطهٔ پایانی در دنبالهٔ خانه — gapify گرسنه
    expect(nick).toContain("Are you on a ------- (10) ------- .?");
    expect(nick).toContain("It is a lot of ------- (11) ------- .");
    expect(nick).toContain("How often do you ------- (12) -------?");
    expect(nick).toContain("about ------- (13) ------- a week");
    expect(nick).toContain("playing video ------- (14) ------- is a sport?");
    expect(nick).toContain("Umm, I am not sure about that.");
  });

  it("متنِ احترام در لایه + خوانداریِ انسان‌های نخستین لایه‌آشفته دارد: فرگمنت‌های خام هست، متنِ پیوسته نیست — بازجوشِ ۳۰۰dpi", () => {
    const respect = normStem(joinSeg(p287, "Respect is a way of acting well", "a sign of respect.", true, true));
    for (const frag of ["You respect those who are important to you.",
                        "they may feel sad or angry",
                        "Besides bringing you into the world",
                        "wash the dishes, clean the kitchen after dinner or clean the rooms",
                        "any of these small things can be a sign of respect."])
      expect(respect).toContain(frag);
    // پیمانِ آشفتگیِ س۱۲: ران‌های جدا (توپُر/زیرخط‌دار) ترتیبِ لایه را شکسته‌اند
    const p287raw = p287.join("\n");
    for (const frag of ["they cut trees",
                        "e skillful at changing their environment. To provide themselves with fuel",
                        "becam",
                        "and made fires. Parts of forests were changed to lands",
                        "Fire also provided the means for cooking plants",
                        "founding the cities and living in larger groups."])
      expect(p287raw).toContain(frag);
    const HUMANS = ("When early humans hunted and collected food, they could not control their environment. " +
      "They could live in their environment like other animals. When humans learned to make fire, however, " +
      "they became skillful at changing their environment. To provide themselves with fuel, they cut trees " +
      "and made fires. Parts of forests were changed to lands to increase the growth of grass and to provide " +
      "a greater area for the animals that humans ate as their food. This improvement ended in farming and " +
      "also keeping animals as sources of human food. Fire also provided the means for cooking plants " +
      "which were not used before. After meeting the simple need for food, early humans began to follow " +
      "other goals such as founding the cities and living in larger groups.");
    expect(p287raw).not.toContain(HUMANS); // متنِ پیوسته فقط محصولِ بازجوشِ داوری‌شدهٔ ۳۰۰dpi است
    // ساقه‌های بانکِ l56 از همین بازجوش می‌آیند
    for (const it of L(56).questions) expect(it.question).toContain(HUMANS);
  });

  it("برخوردهای بین‌برگه‌ایِ دوقلو: omelet و dictionary-expensive با اتصالِ ویرگولیِ این برگه، و absorbِ هم‌ساقه با r386", () => {
    // omelet: r384-l34-1 «morning, ------- I» / اینجا «morning,------- I» — هر دو وفادارِ برگهٔ خود
    expect(L(34).questions[0].question).toBe("I get up early in the morning, ------- I make an omelet myself.");
    expect(L(57).questions[0].question).toBe("I get up early in the morning,------- I make an omelet myself.");
    // dictionary-expensive: r385-l41-2 «expensive, -------I» / اینجا «expensive,------- I»
    expect(L(41).questions[1].question).toBe("That dictionary is expensive, -------I can’t buy it.");
    expect(L(57).questions[3].question).toBe("That dictionary is expensive,------- I can’t buy it.");
    // absorb: ساقهٔ عینِ r386-l45-5 ولی ستونِ تعریفِ متفاوت («to take...» با to در برابرِ بی‌to)
    expect(L(45).questions[4].question).toContain("«Plants absorb carbon dioxide.»");
    expect(L(58).questions[1].question).toContain("«Plants absorb carbon dioxide.»");
    expect(L(58).questions[1].options[0]).toBe("to take something in, especially gradually");
    expect(L(45).questions[4].options[3]).toBe("take something in, especially gradually");
  });

  it("بانکِ l51 (س۴): کلوژِ شنیداریِ چاپ با استخرِ کلیدِ رسمی و چرخشِ تازهٔ [2,0,3,1,2,0]", () => {
    const b = L(51);
    expect(b.title).toContain("کلوژِ شنیداریِ گفت‌وگو (س۴، ص۲۸۵)");
    expect(b.questions).toHaveLength(6);
    expect(keyed(51)).toEqual(["volleyball", "team", "fun", "play", "twice", "games"]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 3, 1, 2, 0]);
    const ans = b.questions.map((it) => it.answer);
    for (let i = 1; i < ans.length; i++) expect(ans[i]).not.toBe(ans[i - 1]);
    expect(new Set(b.questions.map((it) => it.options.join("|"))).size).toBe(6);
    for (const it of b.questions) {
      expect(it.question).toContain("— پاسخِ خانهٔ (");
      expect(new Set(it.options).size).toBe(4);
      expect(it.options.every((o) => ["volleyball", "team", "fun", "play", "twice", "games"].includes(o))).toBe(true);
    }
  });

  it("بانکِ l52 (س۶): بانکِ چاپیِ چهارواژه‌ای به ترتیبِ چاپ — اضافیِ هرگز-کلیدِ forever", () => {
    const b = L(52);
    expect(keyed(52)).toEqual(["arrange", "demand", "repeatedly"]);
    for (const it of b.questions) {
      expect(it.options).toEqual(["repeatedly", "forever", "demand", "arrange"]);
      expect(it.options[it.answer]).not.toBe("forever");
    }
    expect(b.questions[0].question).toBe("We’ll need to------- the chairs around the table.");
    expect(b.questions[1].question).toBe("The -------for organic food is increasing these days.");
    expect(b.questions[2].question).toBe("I have told Mohsen-------to talk politely to his teacher.");
  });

  it("بانکِ l53 (س۷): حرفِ اولِ هم‌شکلِ مهندسی‌شده — h+++++/s++++/p+++++ و «s - - - -» چهارخطیِ چاپ", () => {
    const b = L(53);
    expect(b.questions[0].question).toBe("They have to speak louder, because their grandmother is hard of h- - - - - -.");
    expect(b.questions[1].question).toBe("There are some free dictionaries for PCs and apps for s - - - - phones.");
    expect(b.questions[2].question).toBe("We should not build factories near rivers because they p - - - - - - the rivers.");
    expect(keyed(53)).toEqual(["hearing", "smart", "pollute"]);
    for (const o of b.questions[0].options) expect(o).toMatch(/^h[a-z]{6}$/);
    for (const o of b.questions[1].options) expect(o).toMatch(/^s[a-z]{4}$/);
    for (const o of b.questions[2].options) expect(o).toMatch(/^p[a-z]{6}$/);
  });

  it("بانکِ l54 (س۸): گرامر با گزینه‌های verbatimِ چاپ (بک‌تیکِ won`t) و کلیدهای [b,c,b,d,c,a]", () => {
    const b = L(54);
    expect(b.questions[0].question).toBe("They will buy a new house, -------?");
    expect(b.questions[0].options).toEqual(["won`t he", "won`t they", "will they", "will he"]);
    expect(b.questions[2].question).toBe("Hafez ------- to be as one of the most famous Persian poet of all time.");
    expect(b.questions[3].question).toBe("A: What is the problem? B: The windows -------by the boys.");
    expect(b.questions[5].question).toBe("My job has become ------- difficult because of my illness.");
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 1, 3, 2, 0]);
    expect(keyed(54)).toEqual(["won`t they", "which", "is known", "have been broken", "could read", "increasingly"]);
  });

  it("بانک‌های خوانداری l55/l56: هر آیتم متنِ کاملِ چاپی را در ساقه دارد؛ کلیدهای چاپی [a,b,d,a]/[a,a,b,d]", () => {
    expect(L(55).questions.map((it) => it.answer)).toEqual([0, 1, 3, 0]);
    expect(keyed(55)).toEqual(["True", "False", "respect", "reflects"]);
    expect(L(55).questions[2].question).toContain("We show our-------by being polite to those we care for.");
    expect(L(56).questions.map((it) => it.answer)).toEqual([0, 0, 1, 3]); // دوبلِ Trueِ چاپ در ۳۹/۴۰
    expect(keyed(56)).toEqual(["True", "True", "humans", "the life of early humans"]);
    expect(L(56).questions[2].question).toContain("What does “they” in line 3 refer to?");
    expect(L(56).questions[3].question).toContain("It is about------- .");
  });

  it("بانکِ l57 (س۱۳): حروفِ ربط با بانکِ چاپی (but, and, so, or) و کلیدهای چاپی [and,or,but,so] در [1,3,0,2]", () => {
    const b = L(57);
    expect(b.questions[1].question).toBe("We can eat our lunch at the restaurant,------- we can have it at home.");
    expect(b.questions[2].question).toBe("They wanted to call you,------- they did not have your phone number.");
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3, 0, 2]);
    expect(keyed(57)).toEqual(["and", "or", "but", "so"]);
    for (const it of b.questions) expect(it.options).toEqual(["but", "and", "so", "or"]);
  });

  it("بانک‌های l58/l59 (س۱۶): تعریف‌یابی و اصطلاحات به ترتیبِ چاپِ ستون B — اضافی‌های هرگز-کلید (b/i)", () => {
    const DEFS = ["to take something in, especially gradually", "cry suddenly",
                  "a book in which you record your thoughts or feelings or what has happened every day",
                  "to suddenly decide to do something", "to finish something"];
    expect(L(58).questions.map((it) => it.answer)).toEqual([2, 0, 3, 4]);
    expect(keyed(58)).toEqual([DEFS[2], DEFS[0], DEFS[3], DEFS[4]]);
    for (const it of L(58).questions) {
      expect(it.options).toEqual(DEFS);
      expect(it.options[it.answer]).not.toBe(DEFS[1]);
      expect(it.question).toContain("تعریفِ ستون B برای واژهٔ");
    }
    const IDMS = ["When you get money quickly, like by winning it, it’s easy to spend it or lose it quickly as well.",
                  "When two people cooperate with each other, they come up with better ideas.",
                  "You have to practice a skill a lot to become good at it.",
                  "People like to spend time with those who are similar to them.",
                  "You soon forget people or things that are no longer visible or present."];
    expect(L(59).questions.map((it) => it.answer)).toEqual([4, 2, 0, 1]);
    expect(keyed(59)).toEqual([IDMS[4], IDMS[2], IDMS[0], IDMS[1]]);
    for (const it of L(59).questions) {
      expect(it.options).toEqual(IDMS);
      expect(it.options[it.answer]).not.toBe(IDMS[3]);
      expect(it.question).toContain("مفهوم و تعریفِ ضرب‌المثلِ");
    }
    expect(L(59).questions[2].question).toContain("«Easy come, easy go»");
  });
});

describe("r387 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۵۹ بانک/[…,4,6,8,4,4,4,4,6,6,3,3,6,4,4,4,4,4]/۵۵۹ id یکتا — الگویِ g12-l1..l59", () => {
    expect(bank.lessons)./* R395-WIDENED */ toHaveLength(142);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6, 22],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(873);
    expect(new Set(ids).size).toBe(873);
    expect(ids[521]).toBe("g12-l51-1");
    expect(ids[527]).toBe("g12-l52-1");
    expect(ids[530]).toBe("g12-l53-1");
    expect(ids[533]).toBe("g12-l54-1");
    expect(ids[539]).toBe("g12-l55-1");
    expect(ids[543]).toBe("g12-l56-1");
    expect(ids[547]).toBe("g12-l57-1");
    expect(ids[551]).toBe("g12-l58-1");
    expect(ids[555]).toBe("g12-l59-1");
    expect(ids[558]).toBe("g12-l59-4");
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

  it("نشت‌سنجِ راندیِ ردیف‌های مستثنی (دامنه: بانک‌های ۵۱-۵۹ — درسِ omelet): شنیداریِ س۱-س۳، تصویریِ س۵، تولیدیِ س۹-س۱۰ و ۳۷/۳۸ و س۱۴-س۱۵ و س۱۷-س۱۸ غایب‌اند", () => {
    const mine = bank.lessons.filter((b2) => b2.lesson >= 51 && b2.lesson <= 59).flatMap((b2) => b2.questions);
    expect(mine).toHaveLength(38);
    for (const forbidden of [
      "Amin is really tired", // س۱ (شنیداریِ صوتی)
      "Where did Alex leave his jacket", // س۲ (شنیداریِ صوتی)
      "It is at 6:30", // س۳ کلیدِ مدل
      "birthday card", // س۳ کلیدِ مدل
      "The mother is hugging", // س۵ تصویری
      "sits in the balcony", // س۵ تصویری
      "circled the dictionary entry", // س۵ تصویری
      "Solar panels change solar power", // س۵ تصویری
      "The sofa converts into bed", // س۵ اضافیِ چاپی
      "A cheetah is an animal", // س۹ (تولیدیِ موصولی)
      "If I had wings", // س۱۰ (تولیدیِ شرطی)
      "What is the easiest way", // ردیفِ ۳۷ (پاسخِ مدل)
      "Saeed studied hard", // س۱۴ (تصویری-ربط)
      "so he passed it", // س۱۴ کلیدِ چاپی
      "Smoking", // س۱۵ (تولیدی)
      "risk of death", // س۱۵ (تولیدی)
      "There are some workers and teachers", // س۱۷ پاسخِ مدل (تایپی)
      "The girl wrote a letter", // س۱۷ پاسخِ مدل (تایپی)
      "Everything in the garden", // س۱۷ پاسخِ مدل (تایپی)
      "The parents should be called", // س۱۷ پاسخِ مدل (تایپی)
      "Ferdowsi", // س۱۸ (تولیدیِ تصویری)
      "Watching TV", // س۱۸ (تولیدیِ تصویری)
      "Clean energy", // س۱۸ (تولیدیِ تصویری)
      "healthy lifestyle", // س۱۸ چیپ
      "Eat fewer snacks", // س۱۸ چیپ
    ])
      for (const it of mine) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l52/l53/l54/l55/l56/l57 ساقهٔ لاتینِ خالص؛ l58 (تعریف) و l59 (اصطلاح) ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const bn of [52, 53, 54, 55, 56, 57]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const bn of [58, 59]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of L(51).questions) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
