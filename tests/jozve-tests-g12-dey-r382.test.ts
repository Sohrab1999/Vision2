/**
 * r382 — گاردِ برگهٔ سومِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ دی ۱۴۰۰ (pdf-p329-333)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p334-335) → ۶ بانکِ تازه/۲۶ آیتم در tests-g12.json
 * (مجموع: ۲۱ بانک/۳۹۳ آیتم)
 *
 * نکاتِ راند: (۱) نخستین برگه با تایپوگرافیِ presentation-forms در لایه (ﺳﺆاﻻت) و
 * نشانگرِ «1.» با نقطه — سالِ دقیقِ دو برگهٔ paperMap تأیید شد (ص۳۲۲-۳۲۸ = شهریور ۱۴۰۰،
 * ص۳۲۹-۳۳۵ = دی ۱۴۰۰). (۲) «…» در این برگه ۲-۳نویسه‌ای چاپ شده — norm_stem اکنون
 * «…» را می‌گسترد تا رانِ نقطه‌ها به «-------» بچسبد (کوئیرکِ جدیدِ راند).
 * (۳) بلوک‌های درهمِ س۱۱ (۳۳/۳۴) و ق۴۷ با داوریِ رندرِ ۳۰۰dpi خوانده شدند —
 * سومین تکرارِ درسِ r380-ق۳۲. (۴) «38. ( c )» با فاصله‌های چاپی (همان کوئیرکِ r380).
 * (۵) ساعتِ شروعِ ۱۰ صبح — تنها برگه با این ساعت.
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

const rec = bank.source.g12nahaie3 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r382) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p329 = slicePage(329);
const p330 = slicePage(330);
const p331 = slicePage(331);
const p332 = slicePage(332);
const p333 = slicePage(333);
const p334 = slicePage(334);
const p335 = slicePage(335);
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

describe("r382 — رسیدِ g12nahaie3 (نهاییِ دی ۱۴۰۰ با کلیدِ رسمی)", () => {
  it("رسید: r382، ص۳۲۹-۳۳۳ + راهنمای تصحیحِ ص۳۳۴-۳۳۵، ۵۵ ردیف/۲۶ استخراج/۲۹ مستثنی، ۲۶ آیتم در [5,7,4,4,4,2]", () => {
    expect(rec.extractedRound).toBe("r382");
    expect(rec.section).toContain("دی ۱۴۰۰");
    expect(rec.section).toContain("برگهٔ سوم");
    expect(rec.examPages).toContain("pdf-p329-333");
    expect(rec.examPages).toContain("334-335");
    expect(rec.examMeta).toContain("دی ۱۴۰۰");
    expect(rec.examMeta).toContain("۲۰/۱۰/۱۴۰۰");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("۱۰ صبح");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("12. information");
    expect(rec.keyVerification).toContain("27. sight , mind");
    expect(rec.keyVerification).toContain("38. ( c )");
    expect(rec.keyVerification).toContain("49. and 50. or");
    expect(rec.keyVerification).toContain("The baby had fallen asleep when I got home.");
    expect(rec.keyVerification).toContain("televisions, computers, online games, phones");
    expect(rec.sectionsTotal).toBe(55);
    expect(rec.sectionsExtracted).toBe(26);
    expect(rec.sectionsSkipped).toBe(29);
    expect(rec.items).toBe(26);
    expect(rec.bankCounts).toEqual([5, 7, 4, 4, 4, 2]);
    expect(rec.keyPolicy).toContain("l16");
    expect(rec.keyPolicy).toContain("[1,2,0,1,3]");
    expect(rec.keyPolicy).toContain("سمانتیک");
    expect(rec.engineNote).toContain("Always remember");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("paperMap: سالِ دقیقِ دو برگه تأیید شد (شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ / دی ۱۴۰۰ ص۳۲۹-۳۳۵) + futureNoteِ مخزنِ تایپی", () => {
    expect(rec.paperMap).toContain("شهریور ۱۴۰۰");
    expect(rec.paperMap).toContain("دی ۱۴۰۰");
    expect(rec.paperMap).toContain("ص۲۲۸-۳۲۱");
    expect(rec.futureNote).toContain("had seen");
    expect(rec.futureNote).toContain("۲۱ ردیف");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/بازِ تایپی/تولیدی) + داوریِ رندرِ س۵", () => {
    expect(rec.skippedSections).toHaveLength(9);
    expect(rec.skippedSections.some((s) => s.includes("1.True(a)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("7.arrived, took"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("11.Health is more important."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("مادر با کودکِ دامنی→e"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("لامپ‌های کم‌مصرف→a"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("had seen"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("…but he had to read it."))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Saadi Shirazi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("presentation-forms"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۳۰۰dpi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("reaches the earth.."))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۱۰ صبح"))).toBe(true);
  });
});

describe("r382 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ presentation-forms و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی", () => {
    const a329 = p329.join("\n");
    expect(a329).toContain("ﺳﺆاﻻت  اﻣﺘﺤﺎن");
    expect(a329).toContain("aee.medu.ir");
    expect(p334.join("\n")).toContain("راﻫﻨﻤﺎي ﺗﺼﺤﯿﺢ");
    const full = [...p334, ...p335].join("\n").replace(/\s{2,}/g, " ");
    for (const kf of [
      "1. True (a)", "7. arrived, took", "12. information", "16. choice", "17. (e)",
      "21. born", "24. (c)", "27. sight , mind", "31. (c)", "32. had seen",
      "36. (a) True", "38. ( c )", "42. (a) True", "45. (b) False", "49. and", "50. or",
    ])
      expect(full, kf).toContain(kf);
    // فرگمنت‌های واقعیِ لایه برای بلوک‌های درهمِ س۱۱ و ق۴۷ (کلیدِ کامل فقط از رندر)
    for (const frag of ["got hom", "had fallen", "could res", "had more time",
      "phones", "online games", "computers,", "televisions"])
      expect(full, frag).toContain(frag);
  });

  it("کلوژِ «فرهنگ لغت» س۴ (ص۳۲۹) — بازجوشِ نرمال = پیشوندِ ساقه‌های l16 با خانه‌های 12-16", () => {
    const passage = normStem(joinSeg(p329, "A dictionary is one of the most important tools", "skillful.", false, true));
    expect(passage).toContain("-------12------- about words");
    expect(passage).toContain("alphabetical ...13-------, so it will be easy");
    for (const it of L(16).questions) expect(it.question.startsWith(passage + " — پاسخِ خانهٔ (")).toBe(true);
    expect(L(16).questions.map((it) => it.question.match(/خانهٔ \((\d+)\)/)![1])).toEqual(
      ["12", "13", "14", "15", "16"],
    );
  });

  it("متن‌های خوانداری (انرژی ص۳۳۱ / معلمان ص۳۳۲ / فناوریِ دوصفحه‌ای ص۳۳۲+۳۳۳) — بازجوش = پیشوندِ ساقه‌ها", () => {
    const energy = normStem(joinSeg(p331, "Energy is the ability to do work", "the year.", false, true));
    expect(energy).toContain("wind, water, sunshine, tides, and plants");
    for (const it of L(19).questions) expect(it.question.startsWith(energy + " — ")).toBe(true);
    const teachers = normStem(joinSeg(p332, "It is very important for us to respect our teachers", "love and attempt.", false, true));
    expect(teachers).toContain("They were once students like us");
    for (const it of L(20).questions.slice(0, 2)) expect(it.question.startsWith(teachers + " — ")).toBe(true);
    const tech = normStem(
      joinSeg(p332, "Many Scientists believe", "over the years.", false, true) + " " +
      joinSeg(p333, "Always remember that your health", "once you have lost it.", false, true),
    );
    expect(tech).toContain("kill more people than smoking");
    expect(tech).toContain("Always remember that your health");
    for (const it of L(20).questions.slice(2)) expect(it.question.startsWith(tech + " — ")).toBe(true);
  });
});

describe("r382 — بانک l16 (س۴): کلوژِ پنج‌گزینه‌ای با استخرِ کلیدِ رسمی", () => {
  const b = L(16);
  const UNI = ["information", "order", "definition", "imagine", "choice"];

  it("شکل: پنج‌گزینه‌ای، ۵ آیتم، هر گزینه‌مجموع = کلِ استخر", () => {
    expect(b.title).toContain("نهایی دی ۱۴۰۰");
    expect(b.title).toContain("س۴");
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.options.length).toBe(5);
      expect([...it.options].sort(), it.id).toEqual([...UNI].sort());
    }
  });

  it("کلیدهای چاپی [information,order,definition,imagine,choice] با چرخشِ تازهٔ [1,2,0,1,3]", () => {
    expect(keyed(16)).toEqual(UNI);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 0, 1, 3]);
  });
});

describe("r382 — بانک l17 (س۶-س۸): بانکِ اضافی‌دار، تعریف‌یابی، اصطلاح", () => {
  const b = L(17);
  const POOL = ["shouted", "born", "demand", "introduction"];
  const DEFS = ["an arrangement in a particular order", "finish something", "many times",
    "all the people of about the same age within a society"];

  it("شکل: ۷ آیتم MCQ بدونِ تایپی", () => {
    expect(b.count).toBe(7);
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
    }
  });

  it("ق۱-۳: گزینه‌ها = بانکِ ۴واژه‌ایِ چاپ؛ shouted (اضافیِ چاپی) هرگز کلید — کلیدهای [born,introduction,demand]", () => {
    for (const it of b.questions.slice(0, 3)) {
      expect([...it.options].sort(), it.id).toEqual([...POOL].sort());
      expect(it.options[it.answer], it.id).not.toBe("shouted");
    }
    expect(keyed(17).slice(0, 3)).toEqual(["born", "introduction", "demand"]);
    expect(b.questions.map((it) => it.answer).slice(0, 3)).toEqual([1, 3, 2]);
  });

  it("ق۴-۶: گزینه‌ها = چهار تعریفِ چاپیِ ستون B؛ کلیدهای چاپی (c)/(a)/(d) — تعریفِ اضافیِ (b) هرگز کلید", () => {
    for (const it of b.questions.slice(3, 6)) {
      expect([...it.options].sort(), it.id).toEqual([...DEFS].sort());
      expect(it.options[it.answer], it.id).not.toBe(DEFS[1]);
    }
    expect(keyed(17).slice(3, 6)).toEqual([DEFS[2], DEFS[0], DEFS[3]]);
    for (const it of b.questions.slice(3, 6))
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
  });

  it("ق۷: اصطلاحِ «Out of s - - - -, out of m - - -» با کلیدِ چاپی sight/mind و جفت‌های هم‌شکلِ s----/m---", () => {
    const it = b.questions[6];
    expect(it.question).toContain("“Out of s - - - -, out of m - - -”.");
    expect(it.options).toEqual(["sight / mind", "sound / mood", "scale / mark", "skill / most"]);
    expect(it.answer).toBe(0);
  });
});

describe("r382 — بانک l18 (س۹): گرامر با گزینه‌های چاپی و کلیدِ رسمی", () => {
  const b = L(18);

  it("چهار ساقهٔ verbatim با گزینه‌های چاپی و کلیدهای رسمی [have you, whom, should be informed, were opened]", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(18)).toEqual(["have you", "whom", "should be informed", "were opened"]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0, 0, 2]);
    expect(b.questions[0].options).toEqual(["haven’t you", "haven’t I", "has it", "have you"]);
    expect(b.questions[1].options).toEqual(["whom", "when", "where", "which"]);
    expect(b.questions[2].options).toEqual(["should be informed", "have informed", "are informing", "is informed"]);
    expect(b.questions[3].options).toEqual(["opens", "were opening", "were opened", "can open"]);
  });

  it("ق۱ دوبخطیِ A/B بازجوش و دو aِ پیاپیِ چاپ (۲۹/۳۰) وفادارانه حفظ شد", () => {
    expect(b.questions[0].question).toBe("A: You haven’t done your homework, -------? B: No, I haven’t.");
    expect(rec.keyPolicy).toContain("دو aِ پیاپی");
  });
});

describe("r382 — بانک l19 (س۱۳): خوانداریِ انرژی با متنِ کامل در ساقه", () => {
  const b = L(19);

  it("دو درست/غلط + دو چهارگزینه‌ای با کلیدهای چاپی [True, True, aren’t replaced, radiation]", () => {
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 0, 2, 3]);
    expect(b.questions[2].options).toEqual(["cannot be consumed", "can be replaced", "aren’t replaced", "are polluted"]);
    expect(b.questions[3].options).toEqual(["design", "wind", "plant", "radiation"]);
    expect(b.questions[3].question).toContain("reaches the earth..");
  });
});

describe("r382 — بانک l20 (س۱۴-س۱۵): خوانداریِ معلمان و فناوری", () => {
  const b = L(20);

  it("چهار درست/غلط با کلیدهای چاپی [False, True, False, False] — ق۴۶ بدونِ علامتِ سؤالِ چاپ", () => {
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.options).toEqual(["True", "False"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 1, 1]);
    expect(b.questions[0].question).toContain("teachers were always teachers.");
    expect(b.questions[3].question).toContain("— Mobile phones can cure memory loss in some people");
  });
});

describe("r382 — بانک l21 (س۱۶): حروفِ ربط با بانکِ چاپی (but, and, so, or)", () => {
  const b = L(21);

  it("دو ساقهٔ verbatim؛ گزینه‌ها = بانکِ چاپی به ترتیبِ دستور؛ کلیدهای [and, or] در اندیس‌های [1,3]", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(21)).toEqual(["and", "or"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 3]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toContain("Reza and Saeed went swimming last week, ------- they had a nice time.");
    expect(b.questions[1].question).toContain("We can eat our lunch at the restaurant, -------we can have it at home.");
  });
});

describe("r382 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۳۵ بانک/[…,2,2,7,4,3,3,4,2,6]/۴۵۰ id یکتا — الگویِ g12-l1..l35 (r383 هفت بانکِ شهریور ۱۴۰۰ و r384 هفت بانکِ خرداد ۱۴۰۰ را افزودند)", () => {
    expect(bank.lessons).toHaveLength(59);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(559);
    expect(new Set(ids).size).toBe(559);
    expect(ids[367]).toBe("g12-l16-1");
    expect(ids[372]).toBe("g12-l17-1");
    expect(ids[379]).toBe("g12-l18-1");
    expect(ids[383]).toBe("g12-l19-1");
    expect(ids[387]).toBe("g12-l20-1");
    expect(ids[391]).toBe("g12-l21-1");
    expect(ids[392]).toBe("g12-l21-2");
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
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنی: شنیداریِ صوتیِ س۱-س۳، تصویریِ س۵، بازِ تایپیِ س۱۰-س۱۲ و ۴۰/۴۳/۴۴/۴۷/۴۸، تولیدیِ س۱۷-س۱۹ غایب‌اند", () => {
    const all = bank.lessons.flatMap((b2) => b2.questions);
    for (const forbidden of [
      "Wind is a type of clean energy", // س۱ (شنیداریِ صوتی)
      "Zahra has caught a terrible flu", "Health is more important", // س۳ (شنیداریِ صوتی)
      "C is the symbol for carbon", "My little sister sits", // س۵ (تصویری)
      "(see)", "They bought a house", // س۱۰-س۱۲ (بازِ تایپی)
      "What do Iranians use", // ردیف ۴۰
      "Because they can cause brain problems", // ردیف ۴۸
      "he had to read it", "Electric Cars", "Saadi Shirazi", // س۱۷-س۱۹
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l17 (ق۱-۳/۷) و l18/l19/l20/l21 ساقهٔ لاتینِ خالص؛ l16 و l17 (ق۴-۶) ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(17).questions.slice(0, 3), L(17).questions[6]]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(17).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [18, 19, 20, 21]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of L(16).questions) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
