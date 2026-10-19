/**
 * r380 — گاردِ نخستین آزمونِ نهاییِ وزارتیِ پروژه:
 * «سؤالات امتحان نهایی» زبان انگلیسی (۳) — نوبتِ خرداد ۱۴۰۲ (pdf-p336-340)
 * با کلیدِ رسمیِ چاپیِ «راهنمای تصحيح» (pdf-p341-342) → ۴ بانکِ تازه/۲۹ آیتم در tests-g12.json
 * (مجموع: ۷ بانک/۳۲۹ آیتم)
 *
 * نکاتِ راند: (۱) کشفِ راند — بخشِ چهارمِ جزوه («آزمونهای از دی ماه 1397 تا شهریور 1401
 * نهابی با کلید») برگه‌های نهاییِ واقعیِ وزارت را با لایهٔ کامل دارد و برای نخستین‌بار
 * کلیدِ چاپیِ رسمی (راهنمای تصحيح) — ۲۶ کلید از ۲۸ آیتم عینِ چاپ است.
 * (۲) ل۴: کلوژِ شنیداریِ «احترام به سالمندان» که متنش عیناً در برگه چاپ است (خانه‌های
 * ۱۱-۱۶) — استخرِ شش‌واژه‌ایِ خودِ کلیدِ رسمی، هر واژه دقیقاً یک خانه.
 * (۳) ل۶: ق۲۸ (tag question) کلیدِ چاپی «(d) is he» داشت که استنتاجِ خالی می‌لغزاند و
 * ق۳۲ کلیدِ خلاصه‌نویسی‌شدهٔ رسمی «fallen» = «had fallen»؛ ق۳۵ (کلیدِ ردیف در لایه
 * نیفتاده) با استنتاجِ ساختاریِ who.
 * (۴) ردیف‌های ۱-۳ شنیداری (صوتی-کلید)، ۵/۱۶ تصویری، ۱۱ بی‌کلیدِ لایه، ۱۷-۲۰ تولیدی —
 * همه با کلیدهای چاپیِ حفظ‌شده در رسید برای پشتیبانیِ آینده.
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

const rec = bank.source.g12nahaie1 as {
  extractedRound: string; section: string; examPages: string; examMeta: string;
  keyPages: string; keyVerification: string; sectionsTotal: number; sectionsExtracted: number;
  sectionsSkipped: number; items: number; bankCounts: number[]; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; skippedSections: string[]; printQuirks: string[];
  futureNote: string; bookletFile: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r380) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g12.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p336 = slicePage(336);
const p337 = slicePage(337);
const p338 = slicePage(338);
const p339 = slicePage(339);
const p341 = slicePage(341);
const p342 = slicePage(342);
const joinSeg = (pages: string[], startFrag: string, endFrag?: string, afterStart = false) => {
  let s = pages.findIndex((l) => l.includes(startFrag));
  expect(s, startFrag).toBeGreaterThanOrEqual(0);
  let e = -1;
  if (endFrag) {
    e = pages.findIndex((l, i) => i > (afterStart ? s : -1) && l.includes(endFrag));
  }
  const seg = pages.slice(s, e < 0 ? undefined : e).map((l) => l.trim()).filter(Boolean);
  return seg.join(" ").replace(/\s{2,}/g, " ");
};
const normStem = (raw: string) => raw.replace(/\s{2,}/g, " ").replace(/[….]{4,}/g, "-------");

describe("r380 — رسیدِ g12nahaie1 (نهاییِ خرداد ۱۴۰۲ با کلیدِ رسمی)", () => {
  it("رسید: r380، ص۳۳۶-۳۴۰ + راهنمای تصحيحِ ص۳۴۱-۳۴۲، ۲۰ ردیف/۱۰ استخراج/۸ مستثنی، ۲۹ آیتم در [6,7,6,10]", () => {
    expect(rec.extractedRound).toBe("r380");
    expect(rec.section).toContain("خرداد ۱۴۰۲");
    expect(rec.examPages).toContain("pdf-p336-340");
    expect(rec.examPages).toContain("341-342");
    expect(rec.examMeta).toContain("خرداد ۱۴۰۲");
    expect(rec.examMeta).toContain("۱۲۰ دقیقه");
    expect(rec.examMeta).toContain("aee.medu.ir");
    expect(rec.keyPages).toContain("راهنمای تصحیح");
    expect(rec.keyVerification).toContain("21. effectively");
    expect(rec.keyVerification).toContain("28. (d)");
    expect(rec.keyVerification).toContain("fallen");
    expect(rec.keyVerification).toContain("International Phonetic Alphabet");
    expect(rec.sectionsTotal).toBe(20);
    expect(rec.sectionsExtracted).toBe(10);
    expect(rec.sectionsSkipped).toBe(8);
    expect(rec.items).toBe(29);
    expect(rec.bankCounts).toEqual([6, 7, 6, 10]);
    expect(rec.keyPolicy).toContain("ق۳۵");
    expect(rec.keyPolicy).toContain("had fallen");
    expect(rec.engineNote).toContain("غیبتِ صادقانه");
    expect(rec.bookletFile).toContain("دوازدهم");
  });

  it("کلیدهای چاپیِ ردیف‌های مستثنی در رسید حفظ شدند (شنیداری/تصویری/تولیدی) + فرصتِ تایپی", () => {
    expect(rec.skippedSections).toHaveLength(5);
    expect(rec.skippedSections.some((s) => s.includes("1.False(b)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("17.(c)"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("50. so"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("دست‌نویس"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Solar energy"))).toBe(true);
    expect(rec.futureNote).toContain("kind=typed");
  });

  it("کوئیرک‌های چاپی: ارقامِ معکوسِ RTL، «Oh ,yes»، بلنک‌های چسبیده، گیومهٔ مختلط، «نهابی»", () => {
    expect(rec.printQuirks.some((s) => s.includes("٥٢/٣٠/١٠٤١"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("Oh ,yes"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("چسبیده"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("مخلوطِ گیومه"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("نهابی"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("( c )"))).toBe(true);
  });
});

describe("r380 — بازتولیدِ لایه (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ آزمون و راهنمای تصحيح در لایه + ۴۳ فرگمنتِ کلیدِ چاپی", () => {
    const a336 = p336.join("\n");
    expect(a336).toContain("سؤاﻻت  امتحان");
    expect(a336).toContain("aee.medu.ir");
    expect(p341.join("\n")).toContain("راهنماي تصحيح");
    const full = [...p336, ...p337, ...p338, ...p339, ...p341, ...p342].join("\n");
    for (const kf of [
      "1. False (b)", "21. effectively", "23. replaced", "24. (c)", "27. early, worm",
      "28. (d)", "31. (c)", "36. (a) True", "42. (a)", "46. (b) False", "50. so",
    ])
      expect(full, kf).toContain(kf);
    expect(p342.join("\n")).toContain("International Phonetic");
  });

  it("کلوژِ سالمندان (ردیف ۴) با شش خانهٔ چاپی (11)-(16) — بازجوش = متنِ ساقه‌های ل۴", () => {
    const elders = joinSeg(p336, "Do you know why it is important", "پايان آزمون شنيداري");
    for (const frag of ["……(11)……others.", "…….(13)……. in life", "……(16)….. them"])
      expect(elders, frag).toContain(frag);
    for (const it of L(4).questions) expect(it.question.startsWith(elders + " — پاسخِ خانهٔ (")).toBe(true);
    expect(L(4).questions.map((it) => it.question.match(/خانهٔ \((\d+)\)/)![1])).toEqual(
      ["11", "12", "13", "14", "15", "16"],
    );
  });

  it("ساقه‌های واژگان/گرامر verbatim از لایه (نرمالِ نقطه‌چین → ------- چسبیده)", () => {
    const i27 = p337.findIndex((l) => l.includes("wake up and start work"));
    const s27 = normStem(p337[i27].trim().split(".", 1)[1] === "" ? "" : p337[i27].trim().split(".").slice(1).join(".").trim() + " " + p337[i27 + 1].trim());
    expect(s27).toBe(L(5).questions[6].question);
    const i28 = p338.findIndex((l) => l.includes("Hamid has not come"));
    const s28 = normStem(p338[i28].trim().split(".").slice(1).join(".").trim() + " " + p338[i28 + 1].trim());
    expect(s28).toBe(L(6).questions[0].question);
    expect(s28).toContain("Oh ,yes");
  });

  it("متن‌های خوانداری (hydro از ص۳۳۸ / Mike و dictionary از ص۳۳۹) — بازجوش = پیشوندِ ساقه‌ها", () => {
    const hydro = joinSeg(p338, "Many countries have used the energy in moving water", "True/False");
    expect(hydro).toContain("“hydroelectric power” or “hydropower”");
    for (const it of L(7).questions.slice(0, 5)) expect(it.question.startsWith(hydro + " — ")).toBe(true);
    const mike = joinSeg(p339, "Last night Mike left work late", "Choose the best answer", true);
    expect(mike).toContain("his suitcase in his car");
    for (const it of L(7).questions.slice(5, 7)) expect(it.question.startsWith(mike + " — ")).toBe(true);
    const dict = joinSeg(p339, "A dictionary is a book which explains", "True/False");
    expect(dict).toContain("Latin ‘dictio’ (‘saying’)");
    for (const it of L(7).questions.slice(7, 9)) expect(it.question.startsWith(dict + " — ")).toBe(true);
  });
});

describe("r380 — بانک l4 (ردیف ۴): کلوژِ شش‌گزینه‌ای با استخرِ کلیدِ رسمی", () => {
  const b = L(4);
  const UNI = ["forgive", "knowledge", "faced", "respecting", "feel", "appreciate"];

  it("شکل: شش‌گزینه‌ای، ۶ آیتم، هر گزینه‌مجموع = کلِ استخرِ کلیدِ چاپی", () => {
    expect(b.title).toContain("نهایی خرداد ۱۴۰۲");
    expect(b.title).toContain("س۴");
    expect(b.level).toBe("شش‌گزینه‌ای");
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.options.length).toBe(6);
      expect([...it.options].sort(), it.id).toEqual([...UNI].sort());
    }
  });

  it("کلیدهای چاپی به ترتیبِ خانه‌ها [forgive,knowledge,faced,respecting,feel,appreciate] با اندیس‌های [0,2,4,1,3,5] — هر واژه یک نقش", () => {
    expect(keyed(4)).toEqual(UNI);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 2, 4, 1, 3, 5]);
    expect(new Set(b.questions.map((it) => it.options.join("|"))).size).toBeGreaterThanOrEqual(4);
  });
});

describe("r380 — بانک l5 (ردیف‌های ۶-۸): بانکِ اضافی‌دار، تعریف‌یابی، اصطلاح", () => {
  const b = L(5);
  const POOL = ["communicative", "replaced", "suppose", "effectively"];
  const DEFS = ["the rise and fall of the sea", "take something in, especially gradually",
    "put things in a neat, attractive, or useful order", "tell somebody that something is good"];

  it("شکل: ۷ آیتم MCQ بدونِ تایپی", () => {
    expect(b.count).toBe(7);
    for (const it of b.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
    }
  });

  it("ق۱-۳: گزینه‌ها = بانکِ ۴واژه‌ایِ چاپ؛ suppose (اضافیِ چاپی) هرگز کلید نیست — کلیدهای [effectively,communicative,replaced]", () => {
    for (const it of b.questions.slice(0, 3)) {
      expect([...it.options].sort(), it.id).toEqual([...POOL].sort());
      expect(it.options[it.answer], it.id).not.toBe("suppose");
    }
    expect(keyed(5).slice(0, 3)).toEqual(["effectively", "communicative", "replaced"]);
    expect(b.questions.map((it) => it.answer).slice(0, 3)).toEqual([1, 3, 0]);
  });

  it("ق۴-۶: گزینه‌ها = چهار تعریفِ چاپیِ ستون B؛ کلیدهای چاپی (c)/(d)/(a) — تعریفِ اضافیِ (b) هرگز کلید", () => {
    for (const it of b.questions.slice(3, 6)) {
      expect([...it.options].sort(), it.id).toEqual([...DEFS].sort());
      expect(it.options[it.answer], it.id).not.toBe(DEFS[1]);
    }
    expect(keyed(5).slice(3, 6)).toEqual([DEFS[2], DEFS[3], DEFS[0]]);
  });

  it("ق۷: اصطلاحِ «the e - - - - bird catches the w - - -» با کلیدِ چاپی early/worm و جفت‌های هم‌شکل", () => {
    const it = b.questions[6];
    expect(it.question).toContain("“the e - - - - bird catches the w - - - ”");
    expect(it.options).toEqual(["eager / work", "earth / wind", "early / worm", "earn / warm"]);
    expect(it.answer).toBe(2);
  });
});

describe("r380 — بانک l6 (ردیف‌های ۹-۱۰ و ۱۲): گرامر با کلیدِ رسمی", () => {
  const b = L(6);

  it("شش ساقهٔ verbatim با گزینه‌های چاپی و کلیدهای رسمی [is he, whom, has been translated, should be done, had fallen, who]", () => {
    expect(b.title).toContain("گرامر");
    expect(keyed(6)).toEqual([
      "is he", "whom", "has been translated", "should be done", "had fallen", "who",
    ]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 1, 0, 2, 2, 1]);
    expect(b.questions[0].options).toEqual(["has he", "have I", "hasn’t Hamid", "is he"]);
    expect(b.questions[1].options).toEqual(["which", "whom", "whose", "where"]);
    expect(b.questions[2].options).toEqual(["has been translated", "had translated", "may translate", "were translated"]);
    expect(b.questions[3].options).toEqual(["must do", "were done", "should be done", "are doing"]);
    expect(b.questions[4].options).toEqual(["fell", "was falling", "had fallen", "falls"]);
    expect(b.questions[5].options).toEqual(["whom", "who", "which"]);
  });

  it("ق۳۲ با کلیدِ خلاصه‌نویسی‌شدهٔ رسمی («fallen» = had fallen) و ق۳۵ استنتاجیِ مستند (تنها آیتمِ بی‌کلیدِ لایه)", () => {
    expect(rec.keyPolicy).toContain("had fallen");
    expect(rec.keyPolicy).toContain("ق۳۵");
    expect(b.questions[4].question).toContain("(fall)");
    expect(b.questions[5].question).toContain("ضمیرِ موصولیِ مناسب (whom / who / which)");
  });
});

describe("r380 — بانک l7 (ردیف‌های ۱۳-۱۵): خوانداری با متنِ کامل در ساقه", () => {
  const b = L(7);

  it("۱۰ آیتم با کلیدهای رسمی — شامل دو درست/غلط و IPA", () => {
    expect(b.count).toBe(10);
    expect(keyed(7)).toEqual([
      "True", "running water / electricity", "hydropower", "water", "Hydropower",
      "experienced", "waved", "True", "False", "International Phonetic Alphabet",
    ]);
    expect(b.questions.map((it) => it.answer)).toEqual([0, 0, 2, 1, 3, 3, 0, 0, 1, 0]);
  });

  it("گزینه‌های چاپی verbatim (با دوفاصلهٔ «Different  sources» و قیدِ اضافیِ متن‌محورِ ق۲)", () => {
    expect(b.questions[4].options).toEqual([
      "Different  sources of energy", "Converting electricity",
      "Electrical air conditioner", "Hydropower",
    ]);
    expect(b.questions[1].options).toEqual([
      "running water / electricity", "clouds / rain", "turbines / generators", "water cycle / electricity",
    ]);
    for (const it of b.questions.filter((x) => ["g12-l7-1", "g12-l7-8", "g12-l7-9"].includes(x.id)))
      expect(it.options).toEqual(["True", "False"]);
  });
});

describe("r380 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۳۵ بانک/[…,2,2,7,4,3,3,4,2,6]/۴۵۰ id یکتا — الگویِ g12-l1..l35 (r381-r384 بانک‌های شهریور ۱۴۰۱ و دی ۱۴۰۰ و شهریور ۱۴۰۰ و خرداد ۱۴۰۰ را افزودند)", () => {
    expect(bank.lessons).toHaveLength(128);
    expect(bank.lessons.map((l) => l.count)).toEqual(
      [100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7, 4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1, 2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2, 4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4, 3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4],
    );
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(797);
    expect(new Set(ids).size).toBe(797);
    expect(ids[300]).toBe("g12-l4-1");
    expect(ids[305]).toBe("g12-l4-6");
    expect(ids[306]).toBe("g12-l5-1");
    expect(ids[312]).toBe("g12-l5-7");
    expect(ids[313]).toBe("g12-l6-1");
    expect(ids[318]).toBe("g12-l6-6");
    expect(ids[319]).toBe("g12-l7-1");
    expect(ids[328]).toBe("g12-l7-10");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("بانک‌های نهایی ترجمه ندارند (غیبتِ صادقانه) و MCQِ خالص‌اند (قراردادِ کارتِ g12)", () => {
    for (const bn of [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 95, 96, 99, 100, 101, 102, 105, 109, 112, 114, 119, 120, 121, 123, 126, 128])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنی (دامنه‌راندی: بانک‌های ۴-۷): ساقه‌های شنیداریِ محض و تولیدی و تصویری غایب‌اند", () => {
    // تعمیلِ درسِ omelet (r384/r387): «Try to avoid foods that contain» اکنون عینِ ساقهٔ چاپیِ
    // l70-4 برگهٔ خرداد ۱۳۹۹ [r388] است — نشت‌سنجِ r380 به بانک‌های خودش محدود می‌شود
    const all = bank.lessons.filter((b2) => b2.lesson >= 4 && b2.lesson <= 7).flatMap((b2) => b2.questions);
    for (const forbidden of [
      "They went to the museum", "Samira has been to the museum", // ردیف ۱ (شنیداری)
      "What did Mehran want to buy", "A friend in need", // ردیف ۲ (شنیداری)
      "What was Sara doing in the bookstore", // ردیف ۳ (شنیداری)
      "Try to avoid foods that contain", "Wind towers are natural", // ردیف ۵ (تصویری)
      "the driving test / were excited", // ردیف ۱۱ (بی‌کلیدِ لایه)
      "Topic sentence", // ردیف ۱۹-۲۰ (تولیدی)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ بانک‌های تازه: l5 (ق۱-۳/۷) و l6 (ق۱-۵) ساقهٔ لاتینِ خالص؛ تعریف‌یابیِ l5 و l4/l7 ساقهٔ ترکیبی با گزینه‌های لاتین", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019\u201c\u201d\u2018]+$/;
    for (const it of [...L(5).questions.slice(0, 3), L(5).questions[6]]) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(5).questions.slice(3, 6)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(6).questions.slice(0, 5)) {
      expect(latinPunct.test(it.question), `stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(6).questions.slice(5)) {
      expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
    for (const bn of [4]) {
      for (const it of L(bn).questions) {
        expect(/\p{Script=Arabic}/u.test(it.question), `Persian ask in ${it.id}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
      }
    }
    // l7: ساقه‌ها تمام‌لاتین‌اند (متنِ چاپی + ساقهٔ چاپی — بدونِ درخواستِ فارسی)
    for (const it of L(7).questions) {
      expect(latinPunct.test(it.question), `latin stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `option ${it.id}: ${o}`).toBe(true);
    }
  });
});
