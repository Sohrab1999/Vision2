// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
/**
 * r381 — گاردِ برگهٔ دومِ بخشِ نهایی‌ها:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ شهریور ۱۴۰۱ (pdf-p343-347)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحیح» (pdf-p348-349) → ۸ بانکِ تازه/۳۸ آیتم در tests-g12.json
 * (مجموع: ۱۵ بانک/۳۶۷ آیتم — آخرین برگهٔ جزوهٔ دوازدهم؛ ص۳۴۹ = آخرین صفحه)
 *
 * نکاتِ راند: (۱) کشفِ راند — بخشِ چهارم ~۱۵ برگهٔ نهاییِ دارایِ لایه و کلیدِ چاپی دارد
 * (ص۲۲۷-۳۴۹؛ نقشهٔ paperMap) — r380 برگهٔ چهاردهم و r381 برگهٔ پانزدهم/آخر را پوشاند.
 * (۲) بلوک‌های کلیدِ RTLِ درهم (س۱۰ و ق۵۸) فقط با داوریِ رندرِ ۳۰۰dpi حل شدند:
 * «35. be kept 36. had studied 37. would tell» و «58. we are still confused or think
 * we are missing important information.» — درسِ r380-ق۳۲ تکرار شد.
 * (۳) بانک‌های کلوژِ l8/l9 با استخرِ واژگانیِ خودِ کلیدِ رسمی و چرخش‌های تازه
 * ([2,1,0,3] و [3,1,5,0,2,4] — غیر از [0,2,4,1,3,5]ِ r380) — الگویِ r380-l4.
 * (۴) حروفِ ربطِ l15 برخلافِ ردیفِ ۱۶ِ r380 تصویری نیست — بانکِ چاپیِ خودش
 * (and/or/but/so) با هر واژه دقیقاً یک‌بارِ کلید.
 * (۵) کلیدهای درست/غلطِ l12 سمانتیک‌اند — چاپِ (b,b,a,b) با دو Falseِ پیاپی حفظ شد.
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

const rec = bank.source.g12nahaie2 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; paperMap: string; skippedSections: string[];
  printQuirks: string[]; futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r381) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p343 = slicePage(343);
const p344 = slicePage(344);
const p345 = slicePage(345);
const p346 = slicePage(346);
const p347 = slicePage(347);
const p348 = slicePage(348);
const p349 = slicePage(349);
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
const normStem = (raw: string) => raw.replace(/\s{2,}/g, " ").replace(/[….]{4,}/g, "-------");

describe("r381 — رسیدِ g12nahaie2 (نهاییِ شهریور ۱۴۰۱ با کلیدِ رسمی)", () => {
  it("رسید: r381، ص۳۴۳-۳۴۷ + راهنمای تصحیحِ ص۳۴۸-۳۴۹، ۶۶ ردیف/۳۸ استخراج/۲۸ مستثنی، ۳۸ آیتم در [4,6,8,4,4,4,4,4]", () => {
    expect(rec.extractedRound).toBe("r381");
    expect(rec.section).toContain("شهریور ۱۴۰۱");
    expect(rec.section).toContain("آخرین برگه");
    expect(rec.examPages).toContain("pdf-p343-347");
    expect(rec.examPages).toContain("348-349");
    expect(rec.examMeta).toContain("شهریور ۱۴۰۱");
    expect(rec.examMeta).toContain("۲۱/۰۶/۱۴۰۱");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("aee.medu.ir");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("9. recommend");
    expect(rec.keyVerification).toContain("13. late");
    expect(rec.keyVerification).toContain("31. (b) whom");
    expect(rec.keyVerification).toContain("59. so 60. or 61. and 62. but");
    expect(rec.keyVerification).toContain("be kept");
    expect(rec.keyVerification).toContain("we are still confused or think");
    expect(rec.sectionsTotal).toBe(66);
    expect(rec.sectionsExtracted).toBe(38);
    expect(rec.sectionsSkipped).toBe(28);
    expect(rec.items).toBe(38);
    expect(rec.bankCounts).toEqual([4, 6, 8, 4, 4, 4, 4, 4]);
    expect(rec.keyPolicy).toContain("l8=[2,1,0,3]");
    expect(rec.keyPolicy).toContain("l9=[3,1,5,0,2,4]");
    expect(rec.keyPolicy).toContain("سمانتیک");
    expect(rec.engineNote).toContain("پاسخِ خانهٔ");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("نقشهٔ paperMap: ~۱۵ برگهٔ بخشِ چهارم (ص۲۲۷-۳۴۹) با رنج‌های صفحه — و futureNoteِ برگه‌های باقی", () => {
    expect(rec.paperMap).toContain("ص۲۲۷");
    expect(rec.paperMap).toContain("ص۳۴۹");
    expect(rec.paperMap).toContain("خرداد ۱۴۰۲");
    expect(rec.paperMap).toContain("شهریور ۱۴۰۱");
    expect(rec.paperMap).toContain("~۱۵ برگه");
    expect(rec.futureNote).toContain("ص۲۲۸-۳۳۵");
    expect(rec.futureNote).toContain("بانکِ تایپی");
    expect(rec.futureNote).toContain("آخرین صفحهٔ جزوه");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/بازِ تایپی/تولیدی) + داوریِ رندرِ س۵", () => {
    expect(rec.skippedSections).toHaveLength(7);
    expect(rec.skippedSections.some((s) => s.includes("1.(b) False"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("5.(c) badminton"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("بادگیرِ یزد→d"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("ذره‌بین"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("be kept / had studied / would tell"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("I would travel to the future"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("نگارشِ تولیدی"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("۳۰۰dpi"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("5/."))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("in access"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("نمره موفق باشید40"))).toBe(true);
  });
});

describe("r381 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ آزمون و راهنمای تصحیح در لایه + فرگمنت‌های کلیدِ چاپی + امضای پایانی", () => {
    const a343 = p343.join("\n");
    expect(a343).toContain("سؤاالت  امتحان");
    expect(a343).toContain("نوبت شهریور ماه");
    expect(a343).toContain("سال1401");
    expect(a343).toContain("aee.medu.ir");
    expect(p348.join("\n")).toContain("راهنمای تصحیح");
    expect(p349.join("\n")).toContain("راهنمای تصحیح");
    const full = [...p348, ...p349].join("\n").replace(/\s{2,}/g, " ");
    for (const kf of [
      "1. (b) False", "5. (c) badminton", "9. recommend", "12. pocket", "17. wondered",
      "19. (d)", "23. turbine", "26. (b)", "29. burst", "31. (b) whom", "34. (d) hadn’t played",
      "41. (b) False", "45. solar energy", "48. (a) True", "50. (c) 6.5", "53. (b) False",
      "55. (d) to improve reading understanding", "57. the meaning of the word",
      "59. so", "62. but",
    ])
      expect(full, kf).toContain(kf);
    expect(full).toContain("جمع نمره40");
    // فرگمنت‌های واقعیِ لایه برای بلوک‌های درهمِ س۱۰ و ق۵۸ (کلیدِ کامل فقط از رندر)
    for (const frag of ["had studied 37.", "still conf", "used or think", "are missing important information"])
      expect(full, frag).toContain(frag);
  });

  it("کلوژِ مکالمهٔ س۳ (ص۳۴۳) — بازجوشِ نرمال = پیشوندِ ساقه‌های l8 با خانه‌های 9-12", () => {
    const dialogue = normStem(joinSeg(p343, "Majid: Excuse me", "Majid: Thanks", false, true) + " ");
    expect(dialogue).toContain("9) Mr. Iranmehr: First, I ------- a learner’s dictionary.");
    expect(dialogue).toContain("12) Mr. Iranmehr: Yes, a ------- dictionary.");
    for (const it of L(8).questions) expect(it.question.startsWith(dialogue.trim() + " — پاسخِ خانهٔ (")).toBe(true);
    expect(L(8).questions.map((it) => it.question.match(/خانهٔ \((\d+)\)/)![1])).toEqual(["9", "10", "11", "12"]);
  });

  it("کلوژِ «Last night» س۴ (ص۳۴۳) — بازجوش = پیشوندِ ساقه‌های l9 با خانه‌های 13-18", () => {
    const lastnight = normStem(joinSeg(p343, "Last night, I left work", "آزمون شن"));
    expect(lastnight).toContain("------- (13) ------- at around 9 p.m.");
    expect(lastnight).toContain("------- (18) ------- , I remembered.");
    for (const it of L(9).questions) expect(it.question.startsWith(lastnight + " — پاسخِ خانهٔ (")).toBe(true);
    expect(L(9).questions.map((it) => it.question.match(/خانهٔ \((\d+)\)/)![1])).toEqual(
      ["13", "14", "15", "16", "17", "18"],
    );
  });

  it("متن‌های خوانداری (خورشیدی ص۳۴۵ / خواب و واژه‌نامه ص۳۴۶-۳۴۷) — بازجوش = پیشوندِ ساقه‌ها", () => {
    const solar = normStem(joinSeg(p345, "Solar energy is the most effective", "True/False"));
    expect(solar).toContain("10,000 times greater");
    for (const it of L(12).questions) expect(it.question.startsWith(solar + " — ")).toBe(true);
    const sleep = normStem(joinSeg(p346, "Sleep is essential for all people", "True/False"));
    expect(sleep).toContain("121 days a year");
    for (const it of L(13).questions) expect(it.question.startsWith(sleep + " — ")).toBe(true);
    const iLk = p346.findIndex((l) => l.includes("Looking up words"));
    const iFt = p346.findIndex((l) => l.includes("ادامه سواالت در صفحه"));
    const iRs = p347.findIndex((l) => l.includes("aee.medu.ir"));
    const iTf = p347.findIndex((l) => l.includes("True/False"));
    const seg = [...p346.slice(iLk, iFt), ...p347.slice(iRs + 1, iTf)].map((l) => l.trim()).filter(Boolean);
    const dictpass = normStem(seg.join(" "));
    expect(dictpass).toContain("learner’s dictionaries");
    for (const it of L(14).questions) expect(it.question.startsWith(dictpass + " — ")).toBe(true);
  });
});

describe("r381 — بانک l8 (س۳): کلوژِ چهارگزینه‌ای با استخرِ کلیدِ رسمی", () => {
  const b = L(8);
  const UNI = ["recommend", "monolingual", "elementary", "pocket"];

  it("شکل: چهارگزینه‌ای، ۴ آیتم، هر گزینه‌مجموع = کلِ استخر", () => {
    expect(b.title).toContain("نهایی شهریور ۱۴۰۱");
    expect(b.title).toContain("س۳");
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.options.length).toBe(4);
      expect([...it.options].sort(), it.id).toEqual([...UNI].sort());
    }
  });

  it("کلیدهای چاپی [recommend,monolingual,elementary,pocket] با چرخشِ تازهٔ [2,1,0,3]", () => {
    expect(keyed(8)).toEqual(UNI);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 0, 3]);
  });
});

describe("r381 — بانک l9 (س۴): کلوژِ شش‌گزینه‌ای «Last night»", () => {
  const b = L(9);
  const UNI = ["late", "office", "quiet", "walking", "wondered", "suddenly"];

  it("شکل: شش‌گزینه‌ای، ۶ آیتم، هر گزینه‌مجموع = کلِ استخرِ شش‌واژه‌ای", () => {
    expect(b.level).toBe("شش‌گزینه‌ای");
    for (const it of b.questions) {
      expect(it.options.length).toBe(6);
      expect([...it.options].sort(), it.id).toEqual([...UNI].sort());
    }
  });

  it("کلیدهای چاپی [late,office,quiet,walking,wondered,suddenly] با چرخشِ تازهٔ [3,1,5,0,2,4] — بدونِ تکرارِ مجاور", () => {
    expect(keyed(9)).toEqual(UNI);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 1, 5, 0, 2, 4]);
    const ans = b.questions.map((it) => it.answer);
    for (let i = 1; i < ans.length; i++) expect(ans[i], `adjacent key run at ${i}`).not.toBe(ans[i - 1]);
  });
});

describe("r381 — بانک l10 (س۶-س۸): بانکِ اضافی‌دار، تعریف‌یابی، حرفِ اول", () => {
  const b = L(10);
  const POOL = ["identify", "shouted", "diary", "turbine"];
  const DEFS = ["to change in a form", "to be grateful for", "to have something inside", "to think and believe"];

  it("شکل: ۸ آیتم MCQ بدونِ تایپی", () => {
    expect(b.count).toBe(8);
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
    }
  });

  it("ق۱-۳: گزینه‌ها = بانکِ ۴واژه‌ایِ چاپ؛ diary (اضافیِ چاپی) هرگز کلید — کلیدهای [turbine,identify,shouted]", () => {
    for (const it of b.questions.slice(0, 3)) {
      expect([...it.options].sort(), it.id).toEqual([...POOL].sort());
      expect(it.options[it.answer], it.id).not.toBe("diary");
    }
    expect(keyed(10).slice(0, 3)).toEqual(["turbine", "identify", "shouted"]);
    expect(b.questions.map((it) => it.answer).slice(0, 3)).toEqual([3, 0, 1]);
  });

  it("ق۴-۶: گزینه‌ها = چهار تعریفِ چاپیِ ستون B؛ کلیدهای چاپی (b)/(d)/(c) — تعریفِ اضافیِ (a) هرگز کلید", () => {
    for (const it of b.questions.slice(3, 6)) {
      expect([...it.options].sort(), it.id).toEqual([...DEFS].sort());
      expect(it.options[it.answer], it.id).not.toBe(DEFS[0]);
    }
    expect(keyed(10).slice(3, 6)).toEqual([DEFS[1], DEFS[3], DEFS[2]]);
    for (const it of b.questions.slice(3, 6))
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
  });

  it("ق۷-۸: حرفِ اولِ چاپی (b----/f----) با جفتِ [burst,flock] — کلیدهای [0,1]", () => {
    expect(b.questions[6].question).toContain("b - - - - into tears");
    expect(b.questions[7].question).toContain("f - - - - together");
    expect(b.questions[6].options).toEqual(["burst", "flock"]);
    expect(b.questions[7].options).toEqual(["burst", "flock"]);
    expect(b.questions[6].answer).toBe(0);
    expect(b.questions[7].answer).toBe(1);
  });
});

describe("r381 — بانک l11 (س۹): گرامر با گزینه‌های چاپی و کلیدِ رسمی", () => {
  const b = L(11);

  it("چهار ساقهٔ verbatim با گزینه‌های چاپی و کلیدهای رسمی [whom, is spoken, does she, hadn’t played]", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(11)).toEqual(["whom", "is spoken", "does she", "hadn’t played"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 2, 0, 3]);
    expect(b.questions[0].options).toEqual(["which", "whom", "who", "whose"]);
    expect(b.questions[1].options).toEqual(["speaks", "is speaking", "is spoken", "has spoken"]);
    expect(b.questions[2].options).toEqual(["does she", "doesn’t she", "does he", "doesn’t he"]);
    expect(b.questions[3].options).toEqual(["didn’t play", "wasn’t playing", "hasn’t played", "hadn’t played"]);
  });

  it("ساقه‌ها نقطه‌چینِ چاپ → «-------» چسبیده (الگویِ r379/r380)", () => {
    expect(b.questions[0].question).toContain("The boy ------- you invited arrived very late.");
    expect(b.questions[2].question).toContain("politely, -------?");
  });
});

describe("r381 — بانک l12 (س۱۴): خوانداریِ خورشیدی با متنِ کامل در ساقه", () => {
  const b = L(12);

  it("چهار درست/غلط با کلیدهای چاپی (b,b,a,b) — چرخشِ سمانتیکِ ناپذیر حفظ شد", () => {
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.options).toEqual(["True", "False"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 1, 0, 1]);
    expect(b.questions[0].question).toContain("Solar energy comes from the Earth.");
    expect(b.questions[3].question).toContain("All countries use solar energy to generate electricity.");
  });
});

describe("r381 — بانک l13 (س۱۵): خوانداریِ خواب", () => {
  const b = L(13);

  it("دو درست/غلط + دو چهارگزینه‌ای با کلیدهای رسمی [True, False, 6.5, lives less]", () => {
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 1, 2, 1]);
    expect(b.questions[2].options).toEqual(["9 to 10", "10 to 12", "6.5", "16"]);
    expect(b.questions[3].options).toEqual(["lives longer", "lives less", "eats more", "gets older"]);
    expect(b.questions[0].question).toContain("Food is less important than sleep.");
  });
});

describe("r381 — بانک l14 (س۱۶): خوانداریِ واژه‌نامه", () => {
  const b = L(14);

  it("دو درست/غلط + دو چهارگزینه‌ای با کلیدهای رسمی [False, True, to improve reading understanding, word]", () => {
    expect(b.count).toBe(4);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 0, 3, 0]);
    expect(b.questions[2].options).toEqual([
      "to miss important information", "to guess the meaning of the word",
      "to read the whole sentence", "to improve reading understanding",
    ]);
    expect(b.questions[3].options).toEqual(["word", "dictionary", "context", "meaning"]);
    expect(b.questions[3].question).toContain("What does \"it\" in paragraph one refer to-------");
  });
});

describe("r381 — بانک l15 (س۱۷): حروفِ ربط با بانکِ چاپی (and, or, but, so)", () => {
  const b = L(15);

  it("چهار ساقهٔ verbatim؛ گزینه‌ها = بانکِ چاپی؛ کلیدهای [so, or, and, but] در اندیس‌های [3,1,0,2] — هر واژه یک‌بار", () => {
    expect(b.title).toContain("حروفِ ربط");
    expect(keyed(15)).toEqual(["so", "or", "and", "but"]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 1, 0, 2]);
    for (const it of b.questions) expect([...it.options].sort()).toEqual(["and", "but", "or", "so"]);
    expect(b.questions[0].question).toContain("You lost the game! ------- if you want to succeed");
    expect(b.questions[3].question).toContain("My brother is a rich man, ------- my sister is poor.");
  });
});

describe("r381 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۳۵ بانک/[…,2,2,7,4,3,3,4,2,6]/۴۵۰ id یکتا — الگویِ g12-l1..l35 (r382/r383/r384 بانک‌های دی ۱۴۰۰ و شهریور ۱۴۰۰ و خرداد ۱۴۰۰ را افزودند)", () => {
    expect(bank.lessons)./* R395-WIDENED */ toHaveLength(142);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6, 22],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(873);
    expect(new Set(ids).size).toBe(873);
    expect(ids[329]).toBe("g12-l8-1");
    expect(ids[333]).toBe("g12-l9-1");
    expect(ids[339]).toBe("g12-l10-1");
    expect(ids[347]).toBe("g12-l11-1");
    expect(ids[351]).toBe("g12-l12-1");
    expect(ids[355]).toBe("g12-l13-1");
    expect(ids[359]).toBe("g12-l14-1");
    expect(ids[363]).toBe("g12-l15-1");
    expect(ids[366]).toBe("g12-l15-4");
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

  it("نشت‌سنجِ ردیف‌های مستثنی: شنیداریِ صوتیِ س۱/س۲، تصویریِ س۵، بازِ تایپیِ س۱۰-س۱۳ و ۴۵-۴۷/۵۲/۵۷، تولیدیِ س۱۸-س۱۹ غایب‌اند", () => {
    const all = bank.lessons.flatMap((b2) => b2.questions);
    for (const forbidden of [    // R395-LEGIT — 2 رشته با بانکِ l142 (مخزنِ افعالِ نهایی‌ها) مشروع شد و از نشت‌سنج حذف شد (الگویِ Solar power): "The meat must"→g12-l142-1، "If I knew the answer"→g12-l142-3

      "They played volleyball and had a sandwich", // س۱ (شنیداریِ صوتی)
      // r392 — سه رشتهٔ زیر با استخراجِ مشروعِ l103-3 (کلیدِ رسمیِ «They flew their kites.») و
      // l112 (نخستین بانکِ نقش‌محورِ tests-g12) مشروع شدند — حذف از نشت‌سنج (الگویِ Solar power در r391)
      "He likes to play", "badminton", "offline and online", // س۲ (شنیداریِ صوتی)
      "Absence makes the heart grow fonder", "magnifying glass", "Teenagers who help", // س۵ (تصویری)
      "time machine", "A Forest is a place", // س۱۰-س۱۳ (باز)
      "the teacher / had done", // س۱۱ (چیپ‌های درهم)
      "are produced to work for a long time", "What do solar technologies deliver", // ردیف ۴۵-۴۷
      "We / You spend", // ردیف ۵۲
      "The part of speech helps you find", // ردیف ۵۷
      // r392 — "Topic sentence"/"Concluding" با l112 مشروع شدند (الگویِ Solar power)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l10 (ق۱-۳/۷-۸) و l11/l15 ساقهٔ لاتینِ خالص؛ l8/l9/l10 (ق۴-۶) ساقهٔ ترکیبی با گزینه‌های لاتین؛ l12/l13/l14 تمام‌لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(10).questions.slice(0, 3), ...L(10).questions.slice(6)]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(10).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(11).questions) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [8, 9]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    // l12/l13/l14: ساقه‌ها تمام‌لاتین‌اند (متنِ چاپی + ساقهٔ چاپی — بدونِ درخواستِ فارسی)
    for (const bn of [12, 13, 14]) {
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    for (const it of L(15).questions) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
