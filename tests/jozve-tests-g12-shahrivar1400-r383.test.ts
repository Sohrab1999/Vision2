/**
 * r383 — گاردِ برگهٔ چهارمِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ شهریور ۱۴۰۰ (pdf-p322-326)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p327-328) → ۷ بانکِ تازه/۲۸ آیتم در tests-g12.json
 * (مجموع: ۲۸ بانک/۴۲۱ آیتم)
 *
 * نکاتِ راند: (۱) دومین برگه با تایپوگرافیِ presentation-forms (الگویِ r382) — تاریخِ چاپیِ
 * سالمِ ۲۴/۰۶/۱۴۰۰ با «نوبت شهریور ماه سال 1400» در سربرگ. (۲) نشانگرِ «21.They» چسبیده
 * و کلیدِ «13.history» چسبیده — دو کوئیرکِ جدیدِ چسبیدگی. (۳) بلوک‌های درهمِ س۱۱ (۳۳/۳۴)
 * و س۱۵ (۴۷/۴۸) با داوریِ رندرِ ۳۰۰dpi خوانده شدند — چهارمین تکرارِ درسِ r380-ق۳۲.
 * (۴) «38. ( c )» سومین بار (r380/r382/r383). (۵) کلیدِ س۱۰ «had got/gotten» — نخستین
 * کلیدِ دوگانه (دو شکلِ مجاز). (۶) ق۴۳ بدونِ نقطهٔ پایانیِ چاپ. (۷) «51..» نشانگرِ دودانه.
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

const rec = bank.source.g12nahaie4 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r383) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p322 = slicePage(322);
const p323 = slicePage(323);
const p324 = slicePage(324);
const p325 = slicePage(325);
const p326 = slicePage(326);
const p327 = slicePage(327);
const p328 = slicePage(328);
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

describe("r383 — رسیدِ g12nahaie4 (نهاییِ شهریور ۱۴۰۰ با کلیدِ رسمی)", () => {
  it("رسید: r383، ص۳۲۲-۳۲۶ + راهنمای تصحیحِ ص۳۲۷-۳۲۸، ۵۵ ردیف/۲۸ استخراج/۲۷ مستثنی، ۲۸ آیتم در [5,7,4,4,4,2,2]", () => {
    expect(rec.extractedRound).toBe("r383");
    expect(rec.section).toContain("شهریور ۱۴۰۰");
    expect(rec.section).toContain("برگهٔ چهارم");
    expect(rec.examPages).toContain("pdf-p322-326");
    expect(rec.examPages).toContain("327-328");
    expect(rec.examMeta).toContain("شهریور ۱۴۰۰");
    expect(rec.examMeta).toContain("۲۴/۰۶/۱۴۰۰");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۸ صبح");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("12. medicine");
    expect(rec.keyVerification).toContain("27. spoil");
    expect(rec.keyVerification).toContain("38. ( c )");
    expect(rec.keyVerification).toContain("49. or 50. but");
    expect(rec.keyVerification).toContain("Sara had never seen a bear before she went to the zoo.");
    expect(rec.keyVerification).toContain("You should remind your children that all living creatures are parts of our world");
    expect(rec.sectionsTotal).toBe(55);
    expect(rec.sectionsExtracted).toBe(28);
    expect(rec.sectionsSkipped).toBe(27);
    expect(rec.items).toBe(28);
    expect(rec.bankCounts).toEqual([5, 7, 4, 4, 4, 2, 2]);
    expect(rec.keyPolicy).toContain("l22");
    expect(rec.keyPolicy).toContain("[2,4,0,3,1]");
    expect(rec.keyPolicy).toContain("سمانتیک");
    expect(rec.engineNote).toContain("پاسخِ خانهٔ");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: برگهٔ چهارم تأیید شد (شهریور ۱۴۰۰ ص۳۲۲-۳۲۸) + futureNoteِ مخزنِ تایپیِ ۲۷ردیفی", () => {
    expect(rec.paperMap).toContain("شهریور ۱۴۰۰");
    expect(rec.paperMap).toContain("۲۴/۰۶/۱۴۰۰");
    expect(rec.paperMap).toContain("ص۲۲۸-۳۲۱");
    expect(rec.futureNote).toContain("had got/gotten");
    expect(rec.futureNote).toContain("۲۷ ردیف");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/بازِ تایپی/تولیدی) + داوریِ رندرِ س۵", () => {
    expect(rec.skippedSections).toHaveLength(9);
    expect(rec.skippedSections.some((s) => s.includes("1.False(b)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("7.(c)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("A friend in need"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("زغالِ گاری+بشکه+کپسولِ گاز→c"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("ترسیمِ توربین‌های بادی→d"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("had got/gotten"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("51.. …..and I make an omelet."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Wind towers"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۳۰۰dpi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("21.They"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("13.history"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("That's"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("yesterday.."))).toBe(true);
  });
});

describe("r383 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const a322 = p322.join("\n");
    expect(a322).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن");
    expect(a322).toContain("aee.medu.ir");
    expect(a322).toContain("24");
    expect(p327.join("\n")).toContain("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    const full = [...p327, ...p328].join("\n").replace(/\s{2,}/g, " ");
    for (const kf of [
      "1. False (b)", "2.True (a)", "5. (b)", "8. (b)", "11. (c)",
      "12. medicine", "13.history", "16. take", "17. (c)", "20. (e)",
      "21. variety", "24. (a)", "27. spoil", "31. (c)", "32. had got/gotten",
      "36. (a) True", "38. ( c )", "40. portable device", "43. (b)", "46. (a) True",
      "49. or", "50. but", "51..", "and I make an omelet.",
    ])
      expect(full, kf).toContain(kf);
    // فرگمنت‌های واقعیِ لایه برای بلوک‌های درهمِ س۱۱ و س۱۵ (کلیدِ کامل فقط از رندر)
    for (const frag of ["went to the zoo", "fore", "a bear", "had never seen", "Sara",
      "were at home", "oom", "would clean", "My sister",
      "in your yard or in your favorite park", "You can do th",
      "of our world and are", "that all living creatures are part",
      "You should remind your children", "valuable in the natural environment"])
      expect(full, frag).toContain(frag);
  });

  it("کلوژِ «پزشکانِ ایران» س۴ (ص۳۲۲) — بازجوشِ نرمال = پیشوندِ ساقه‌های l22 با خانه‌های 12-16 + آپاستروفِ مخلوط", () => {
    const passage = normStem(joinSeg(p322, "Sara: It is so good", "exciting trip!", false, true));
    expect(passage).toContain("rich in-------(12)------- .");
    expect(passage).toContain("Back in -------(13)-------, we can mention Avicenna");
    expect(passage).toContain("That's so nice");
    for (const it of L(22).questions) expect(it.question.startsWith(passage + " — پاسخِ خانهٔ (")).toBe(true);
    expect(L(22).questions.map((it) => it.question.match(/خانهٔ \((\d+)\)/)![1])).toEqual(
      ["12", "13", "14", "15", "16"],
    );
  });

  it("متن‌های خوانداری (خودرویِ برقی ص۳۲۴ / فرهنگِ لغت ص۳۲۵ / احترام به طبیعت ص۳۲۵) — بازجوش = پیشوندِ ساقه‌ها", () => {
    const cars = normStem(joinSeg(p324, "Many countries now think", "instead.", false, true));
    expect(cars).toContain("12 or 24 batteries, or more, are needed to power the car");
    expect(cars).toContain("portable devices you carry around every day");
    for (const it of L(25).questions) expect(it.question.startsWith(cars + " — ")).toBe(true);
    const dictread = normStem(joinSeg(p325, "It is very important for students", "stand for.", false, true));
    expect(dictread).toContain("Choose the Right Dictionary");
    expect(dictread).toContain("Learn the Abbreviations");
    for (const it of L(26).questions) expect(it.question.startsWith(dictread + " — ")).toBe(true);
    const nature = normStem(joinSeg(p325, "Respect is not only for people", "in the natural environment.", false, true));
    expect(nature).toContain("blueness of the sky");
    for (const it of L(27).questions) expect(it.question.startsWith(nature + " — ")).toBe(true);
  });
});

describe("r383 — بانک l22 (س۴): کلوژِ پنج‌گزینه‌ای با استخرِ کلیدِ رسمی", () => {
  const b = L(22);
  const UNI = ["medicine", "history", "Persian", "life", "take"];

  it("شکل: پنج‌گزینه‌ای، ۵ آیتم، هر گزینه‌مجموع = کلِ استخر", () => {
    expect(b.title).toContain("نهایی شهریور ۱۴۰۰");
    expect(b.title).toContain("س۴");
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.options.length).toBe(5);
      expect([...it.options].sort(), it.id).toEqual([...UNI].sort());
    }
  });

  it("کلیدهای چاپی [medicine,history,Persian,life,take] با پنجمین چینشِ متمایزِ [2,4,0,3,1]", () => {
    expect(keyed(22)).toEqual(UNI);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 4, 0, 3, 1]);
  });
});

describe("r383 — بانک l23 (س۶-س۸): بانکِ اضافی‌دار، تعریف‌یابی، اصطلاح", () => {
  const b = L(23);
  const POOL = ["absorb", "variety", "forgive", "arrange"];
  const DEFS = ["the part at the beginning of a book that gives a general idea of what it is about",
    "a book in which you record your thoughts or feelings or what has happened every day",
    "cry suddenly",
    "in a way that is successful and achieves what you want"];

  it("شکل: ۷ آیتم MCQ بدونِ تایپی", () => {
    expect(b.count).toBe(7);
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
    }
  });

  it("ق۱-۳: گزینه‌ها = بانکِ ۴واژه‌ایِ چاپ؛ forgive (اضافیِ چاپی) هرگز کلید — کلیدهای [variety,arrange,absorb]", () => {
    for (const it of b.questions.slice(0, 3)) {
      expect([...it.options].sort(), it.id).toEqual([...POOL].sort());
      expect(it.options[it.answer], it.id).not.toBe("forgive");
    }
    expect(keyed(23).slice(0, 3)).toEqual(["variety", "arrange", "absorb"]);
    expect(b.questions.map((it) => it.answer).slice(0, 3)).toEqual([1, 3, 0]);
  });

  it("ق۴-۶: گزینه‌ها = چهار تعریفِ چاپیِ ستون B؛ کلیدهای چاپی (a)/(d)/(b) — تعریفِ اضافیِ (c) هرگز کلید", () => {
    for (const it of b.questions.slice(3, 6)) {
      expect([...it.options].sort(), it.id).toEqual([...DEFS].sort());
      expect(it.options[it.answer], it.id).not.toBe(DEFS[2]);
    }
    expect(keyed(23).slice(3, 6)).toEqual([DEFS[0], DEFS[3], DEFS[1]]);
    for (const it of b.questions.slice(3, 6))
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
  });

  it("ق۷: اصطلاحِ «too many cooks s - - - - the broth» با کلیدِ چاپی spoil و چهارِ هم‌شکلِ ۵حرفیِ s-دار", () => {
    const it = b.questions[6];
    expect(it.question).toContain("“too many cooks s - - - - the broth”.");
    expect(it.options).toEqual(["spoil", "spice", "spare", "shine"]);
    for (const o of it.options) expect(o).toMatch(/^s[a-z]{4}$/);
    expect(it.answer).toBe(0);
  });
});

describe("r383 — بانک l24 (س۹): گرامر با گزینه‌های چاپی و کلیدِ رسمی", () => {
  const b = L(24);

  it("چهار ساقهٔ verbatim با گزینه‌های چاپی و کلیدهای رسمی [have you, which, should be called, could ask]", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(24)).toEqual(["have you", "which", "should be called", "could ask"]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0, 2, 2]);
    expect(b.questions[0].options).toEqual(["haven’t you", "haven’t I", "does your homework", "have you"]);
    expect(b.questions[1].options).toEqual(["which", "who", "where", "whom"]);
    expect(b.questions[2].options).toEqual(["may call", "have called", "should be called", "are calling"]);
    expect(b.questions[3].options).toEqual(["may ask", "were asked", "could ask", "were asking"]);
  });

  it("ق۱ دوبخطیِ A/B بازجوش، دونقطهٔ چاپِ ق۲۹، و دو cِ پیاپیِ چاپ (۳۰/۳۱) وفادارانه حفظ شد", () => {
    expect(b.questions[0].question).toBe("You haven’t done your homework, -------?");
    expect(b.questions[1].question).toBe("A: What did you find? B: I found the keys ------- I lost yesterday..");
    expect(rec.keyPolicy).toContain("دو cِ پیاپی");
  });
});

describe("r383 — بانک l25 (س۱۳): خوانداریِ خودروی برقی با متنِ کامل در ساقه", () => {
  const b = L(25);

  it("دو درست/غلط + دو چهارگزینه‌ای با کلیدهای چاپی [True, False, stored on, roll]", () => {
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 1, 2, 1]);
    expect(b.questions[0].question).toContain("cars that use fossil fuels should be replaced by electric cars.");
    expect(b.questions[2].options).toEqual(["consumed by", "replaced in", "stored on", "polluted"]);
    expect(b.questions[3].options).toEqual(["produce", "roll", "carry", "deal"]);
  });
});

describe("r383 — بانک l26 (س۱۴): خوانداریِ فرهنگِ لغت", () => {
  const b = L(26);

  it("دو درست/غلط + دو چهارگزینه‌ای با کلیدهای چاپی [False, True, entry, confusing] — ق۴۳ بدونِ نقطهٔ پایانی", () => {
    expect(b.count).toBe(4);
    for (const it of b.questions.slice(0, 2)) expect(it.options).toEqual(["True", "False"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 1, 0]);
    expect(b.questions[2].options).toEqual(["learner’s dictionary", "entry", "part of speech", "origin"]);
    expect(b.questions[3].options).toEqual(["confusing", "boring", "surprising", "easy"]);
    expect(b.questions[2].question.endsWith("find its -------")).toBe(true);
  });
});

describe("r383 — بانک l27 (س۱۵): خوانداریِ احترام به طبیعت", () => {
  const b = L(27);

  it("دو درست/غلط با کلیدهای چاپی [False, True]", () => {
    expect(b.count).toBe(2);
    for (const it of b.questions) expect(it.options).toEqual(["True", "False"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0]);
  });
});

describe("r383 — بانک l28 (س۱۶): حروفِ ربط با بانکِ چاپی (but, and, so, or)", () => {
  const b = L(28);

  it("دو ساقهٔ verbatim؛ گزینه‌ها = بانکِ چاپی به ترتیبِ دستور؛ کلیدهای [or, but] در اندیس‌های [3,0]", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(28)).toEqual(["or", "but"]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toBe("I go out tonight, -------I take a rest at home.");
    expect(b.questions[1].question).toBe("Mary studies a lot , -------she can’t pass the exam.");
  });
});

describe("r383 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۳۵ بانک/[…,2,2,7,4,3,3,4,2,6]/۴۵۰ id یکتا — الگویِ g12-l1..l35 (r384 هفت بانکِ خرداد ۱۴۰۰ را افزود)", () => {
    expect(bank.lessons).toHaveLength(71);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(594);
    expect(new Set(ids).size).toBe(594);
    expect(ids[393]).toBe("g12-l22-1");
    expect(ids[398]).toBe("g12-l23-1");
    expect(ids[405]).toBe("g12-l24-1");
    expect(ids[409]).toBe("g12-l25-1");
    expect(ids[413]).toBe("g12-l26-1");
    expect(ids[417]).toBe("g12-l27-1");
    expect(ids[419]).toBe("g12-l28-1");
    expect(ids[420]).toBe("g12-l28-2");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنی: شنیداریِ صوتیِ س۱-س۳، تصویریِ س۵، بازِ تایپیِ س۱۰-س۱۲ و ۴۰/۴۷/۴۸، تصویریِ س۱۷ و تولیدیِ س۱۸-س۱۹ غایب‌اند", () => {
    // r384 درسِ مهم: جملهٔ «make an omelet» در برگهٔ خواهرِ خرداد ۱۴۰۰ (l34) سؤالِ متنیِ
    // عادی با کلیدِ چاپی است و درست استخراج شده — پس نشت‌سنجِ r383 فقط بانک‌های خودِ
    // این راند (۲۲-۲۸) را می‌پیماید
    const all = bank.lessons.filter((b2) => b2.lesson >= 22 && b2.lesson <= 28).flatMap((b2) => b2.questions);
    for (const forbidden of [
      "A friend in need, is a friend indeed", // س۳ (شنیداریِ صوتی)
      "flew kites", // س۲ (شنیداریِ صوتی)
      "saved some money to buy", // س۳ ق۹
      "Hamid sits on the sofa and watches TV all the time", // س۵ اضافیِ چاپی
      "Wind turbines are used to produce electricity from wind power", // س۵ گزینهٔ d (تصویری)
      "had got/gotten", // س۱۰ (بازِ تایپی)
      "make an omelet", // س۱۷ (تصویری-کلید)
      "Wind towers", // س۱۹
      "Topic sentence", // س۱۸
      "Hafez", // س۱۸
      "flying kites", // س۲
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l23 (ق۱-۳/۷) و l24/l25/l26/l27/l28 ساقهٔ لاتینِ خالص؛ l22 و l23 (ق۴-۶) ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(23).questions.slice(0, 3), L(23).questions[6]]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(23).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [24, 25, 26, 27, 28]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of L(22).questions) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
