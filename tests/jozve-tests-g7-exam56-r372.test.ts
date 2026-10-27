/**
 * r372 — گاردِ «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس پنجم (pdf-p84) + درس ششم (pdf-p90)
 * → ۵ بانک/۲۲ آیتمِ تازه در tests-g7.json (جمعِ فایل: ۱۵ بانک/۶۶ آیتم)
 *
 * نکاتِ زیرساختیِ راند: (۱) بانکِ ۱۱ پنج‌گزینه‌ایِ مشترکِ چاپیِ a-e است با اضافیِ چاپیِ
 * «It's in Farvardin.» — هرگز-کلید. (۲) ساقه‌های بانک‌های ۱۱/۱۲/۱۵ از خودِ لایهٔ متنی
 * استخراج شدند (نه بازنویسیِ دستی) — گارد همان را بازتولید می‌کند (ضدِ رونویسی).
 * (۳) بانک‌های ۱۳/۱۴ کلیدهای لنگردارِ جدولِ واژگانِ درس پنجمِ خودِ جزوه (ص۷۶-۷۷) دارند و
 * ساقهٔ فارسی — خلوصِ لاتین به بانک‌های ۱۱/۱۲/۱۵ scope می‌شود (سابقهٔ r371-بانک۸).
 * (۴) بانکِ ۱۵ هشت‌گزینه‌ای است با بانکِ چاپیِ رندر-فقط (کادرِ بنفش)؛ «I am … the bank.»
 * حذفِ آیتمیِ نقصِ چاپ (هیچ واژه‌ای از بانک نمی‌پذیرد) و reading/washing هرگز-کلیدند.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

type Q = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[];
};
type Bank = { lesson: number; title: string; level?: string; count: number; questions: Q[] };
type Doc = { grade: number; title: string; lessons: Bank[]; source: Record<string, Record<string, unknown>> };

const g7 = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g7.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = g7.lessons.find((x) => x.lesson === n);
  expect(b, `bank g7-l${n} missing`).toBeDefined();
  return b as Bank;
};
const q = (bn: number, n: number) => L(bn).questions[n - 1];

const rec5 = g7.source.g7exam5 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; columnA: string[]; columnB: string[];
  extraAnswer: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const rec6 = g7.source.g7exam6 as typeof rec5 & {
  wordBank: string[]; wordBankSource: string; keyPolicy: string; engineNote: string;
};
const map = g7.source.g7familyMap as {
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
};

// ————— بازتولیدِ ساقه‌های لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r372) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g7.txt"), "utf-8").split("\n");
const slice = (p: number) => {
  const s = layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
  const e = layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
  return layer.slice(s, e);
};
const norm = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[….]{3,}/g, "-------")
    .replace(/-------(?=[A-Za-z])/g, "------- ");

const S1_RE = /^\s*([1-4])\.\s*(.+?)\s*\(([^)]+)\)\s*$/;
const s1Stems: Record<string, string> = {};
for (const line of slice(84)) {
  const m = S1_RE.exec(line);
  if (m) s1Stems[m[1]] = norm(`${m[1]}. ${m[2]} (-------)`);
}
const PAIR_RE = /^\s*([a-d])\)\s*(.+?)\s*B\)\s*(.+?)\s*$/;
const pairs: Record<string, [string, string]> = {};
for (const line of slice(90)) {
  const m = PAIR_RE.exec(line);
  if (m && line.includes("…")) pairs[m[1]] = [norm(m[2]), norm(m[3])];
}

// ————— لنگرِ جدولِ واژگانِ درس پنجم (ص۷۶-۷۷) — کلیدهای بانک‌های ۱۳/۱۴ —————
const p76 = slice(76).join("\n");
const p77 = slice(77).join("\n");

describe("r372 — رسیدهای g7exam5 / g7exam6", () => {
  it("receipt5: خانوادهٔ درس پنجم — ۵ سکشن، ۴ بانک/۱۶ آیتم", () => {
    expect(rec5.extractedRound).toBe("r372");
    expect(rec5.section).toContain("درس پنجم");
    expect(rec5.examPages).toContain("pdf-p84");
    expect(rec5.keyPages).toContain("هیچ پاسخنامهٔ چاپی");
    expect(rec5.sectionsTotal).toBe(5);
    expect(rec5.sectionsExtracted).toBe(4);
    expect(rec5.sectionsSkipped).toBe(1);
    expect(rec5.items).toBe(16);
    expect(rec5.bankCounts).toEqual([4, 4, 4, 4]);
    expect(rec5.columnA).toHaveLength(4);
    expect(rec5.columnB).toEqual([
      "She is my teacher, Mrs Amini.",
      "He is sixteen years old.",
      "Great, thanks",
      "It's in Farvardin.",
      "He is a worker.",
    ]);
    expect(rec5.extraAnswer).toContain("Farvardin");
    expect(rec5.derivedKeys.S1).toHaveLength(4);
    expect(rec5.derivedKeys.S2).toHaveLength(4);
    expect(rec5.derivedKeys.S4).toHaveLength(4);
    expect(rec5.derivedKeys.S5).toHaveLength(4);
  });

  it("receipt5: س۳ تصویریِ مستثنی + quirks — isyour، لایه‌محور، ساقهٔ فارسی، استنتاجِ suit", () => {
    expect(rec5.skippedSections.some((s) => s.startsWith("س۳") && s.includes("Backpack-Thirteen-Engineer-Thirty-Nurse"))).toBe(true);
    expect(rec5.skippedSections.some((s) => s.includes("اضافی = Thirty"))).toBe(true);
    expect(rec5.printQuirks.some((s) => s.includes("isyour"))).toBe(true);
    expect(rec5.printQuirks.some((s) => s.includes("لایهٔ متنی ص۸۴ استخراج"))).toBe(true);
    expect(rec5.printQuirks.some((s) => s.includes("ساقهٔ فارسی"))).toBe(true);
    expect(rec5.printQuirks.some((s) => s.includes("trousers"))).toBe(true);
  });

  it("receipt6: خانوادهٔ درس ششم — ۳ سکشن، ۱ بانک/۶ آیتم + بانکِ ۸ واژه‌ایِ رندر-فقط", () => {
    expect(rec6.extractedRound).toBe("r372");
    expect(rec6.section).toContain("درس ششم");
    expect(rec6.examPages).toContain("pdf-p90");
    expect(rec6.sectionsTotal).toBe(3);
    expect(rec6.sectionsExtracted).toBe(1);
    expect(rec6.sectionsSkipped).toBe(2);
    expect(rec6.items).toBe(6);
    expect(rec6.bankCounts).toEqual([6]);
    expect(rec6.wordBank).toEqual(["where", "bedroom", "reading", "she's", "washing", "what", "doing", "watching"]);
    expect(rec6.wordBankSource).toContain("فقط در رندر");
    expect(rec6.keyPolicy).toContain("bedroom");
    expect(rec6.engineNote).toContain("1,2,3,4,5,7");
  });

  it("receipt6: حذفِ آیتمیِ b-B (نقصِ چاپ) + دو مستثنیِ تصویری", () => {
    expect(rec6.skippedSections.some((s) => s.includes("حذفِ آیتمی") && s.includes("the bank"))).toBe(true);
    expect(rec6.skippedSections.some((s) => s.startsWith("س۲") && s.includes("تصاویر"))).toBe(true);
    expect(rec6.skippedSections.some((s) => s.startsWith("س۳") && s.includes("تصویری-کلید"))).toBe(true);
  });

  it("receiptMap: خانواده‌های ۸۴/۹۰ به r372 منتقل شدند — دو خانوادهٔ ۹۷/۱۰۳ باقی", () => {
    const f5 = map.families.find((f) => f.pdfPage === 84);
    const f6 = map.families.find((f) => f.pdfPage === 90);
    expect(f5?.round).toBe("r372");
    expect(f5?.status).toContain("۱۶ آیتم");
    expect(f6?.round).toBe("r372");
    expect(f6?.status).toContain("حذفِ آیتمی");
    expect(map.families.filter((f) => f.round === "r372")).toHaveLength(2);
    // r373 — هفتم/هشتم (۹۷/۱۰۳) — نقشه ۸/۸ تکمیل شد
    expect(map.families.filter((f) => f.round === "r373")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(0);
  });

  it("لنگرِ لایه: کلیدهای بانک‌های ۱۳/۱۴ در جدولِ واژگانِ درس پنجم (ص۷۶-۷۷) چاپی‌اند", () => {
    for (const anchor of ["yellow*", "blue*", "black*", "brown*", "suit*", "trousers*"])
      expect(p76.includes(anchor), `p76 anchor ${anchor}`).toBe(true);
    for (const anchor of ["shoes*", "chador*", "scarf*"])
      expect(p77.includes(anchor), `p77 anchor ${anchor}`).toBe(true);
    expect(p76.includes("واژگان و نکات گرامری درس پنجم")).toBe(true);
  });
});

describe("r372 — بانکِ ۱۱: پاسخ از ستون B (س۱، ص۸۴) — پنج‌گزینه‌ایِ چاپیِ a-e", () => {
  const COL = ["She is my teacher, Mrs Amini.", "He is sixteen years old.", "Great, thanks", "It's in Farvardin.", "He is a worker."];

  it("چهار ساقه = نرمالِ عینِ خطوطِ لایهٔ ص۸۴ (بازتولیدِ ضدِ رونویسی)", () => {
    expect(Object.keys(s1Stems).sort()).toEqual(["1", "2", "3", "4"]);
    L(11).questions.forEach((it, i) => expect(it.question).toBe(s1Stems[String(i + 1)]));
    // غلطِ فاصله‌گذاریِ چاپ «isyour» verbatim
    expect(s1Stems["4"]).toContain("isyour");
    expect(s1Stems["4"]).not.toContain("is your");
    // «Great, thanks» بدونِ نقطهٔ چاپی
    expect(COL[2]).not.toContain(".");
  });

  it("گزینه‌ها = جای‌بهجاییِ کاملِ ستونِ چاپیِ ۵تایی؛ کلیدها [0,3,2,1] یک‌به‌یک", () => {
    const bank = L(11);
    expect(bank.questions).toHaveLength(4);
    bank.questions.forEach((it) => expect([...it.options].sort()).toEqual([...COL].sort()));
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
    const keyed = bank.questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4);
    expect(keyed).toEqual(["Great, thanks", "He is a worker.", "She is my teacher, Mrs Amini.", "He is sixteen years old."]);
  });

  it("اضافیِ چاپیِ «It's in Farvardin.» هرگز کلید نیست", () => {
    for (const it of L(11).questions) expect(it.options[it.answer]).not.toBe("It's in Farvardin.");
  });
});

describe("r372 — بانکِ ۱۲: کامل‌کردن فرم (س۲، ص۸۴) — نگاشتِ یک‌به‌یکِ چاپ‌لنگردار", () => {
  const COL = ["Reza", "Pakzad", "Azar", "waiter"];

  it("چهار ساقه = فیلدهای چاپیِ فرم + ستونِ مشترکِ مشتق", () => {
    const bank = L(12);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "First name: -------", "Last name: -------", "Month of birth: -------", "Job: -------",
    ]);
    bank.questions.forEach((it) => expect([...it.options].sort()).toEqual([...COL].sort()));
  });

  it("کلیدها [0,3,2,1] — نگاشتِ یکتا (Reza/Pakzad/Azar/waiter)", () => {
    const bank = L(12);
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
    const keyed = bank.questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4);
    expect(keyed).toEqual(["Reza", "Pakzad", "Azar", "waiter"]);
  });
});

describe("r372 — بانکِ ۱۳: رنگ‌ها به انگلیسی (س۴، ص۸۴) — لنگردارِ جدولِ ص۷۶", () => {
  const COL = ["yellow", "blue", "black", "brown"];

  it("چهار ساقهٔ فارسیِ چاپ‌وفادار («قهوه ای» با فاصلهٔ کاملِ چاپ)", () => {
    expect(L(13).questions.map((it) => it.question)).toEqual([
      "زرد به انگلیسی: -------", "آبی به انگلیسی: -------", "سیاه به انگلیسی: -------", "قهوه ای به انگلیسی: -------",
    ]);
    expect(q(13, 4).question).toContain("قهوه ای"); // نه «قهوه‌ای» — verbatim چاپ
    expect(q(13, 4).question).not.toContain("قهوه\u200cای");
  });

  it("ستونِ لنگردارِ [yellow, blue, black, brown] با کلیدهای [0,3,2,1] یک‌به‌یک", () => {
    const bank = L(13);
    bank.questions.forEach((it) => expect([...it.options].sort()).toEqual([...COL].sort()));
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
    const keyed = bank.questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4);
    expect(keyed).toEqual(["yellow", "blue", "black", "brown"]);
  });
});

describe("r372 — بانکِ ۱۴: پوشاک به انگلیسی (س۵، ص۸۴) — لنگردارِ جدولِ ص۷۶-۷۷", () => {
  const COL = ["shoes", "chador", "suit", "scarf"];

  it("چهار ساقهٔ فارسیِ چاپ‌وفادار («کت و شلوار» verbatim)", () => {
    expect(L(14).questions.map((it) => it.question)).toEqual([
      "کفش به انگلیسی: -------", "چادر به انگلیسی: -------", "کت و شلوار به انگلیسی: -------", "روسری به انگلیسی: -------",
    ]);
  });

  it("ستونِ لنگردارِ [shoes, chador, suit, scarf] با کلیدهای [0,3,2,1] یک‌به‌یک — شکلِ lowercaseِ جدول", () => {
    const bank = L(14);
    bank.questions.forEach((it) => expect([...it.options].sort()).toEqual([...COL].sort()));
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
    const keyed = bank.questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4);
    expect(keyed).toEqual(["shoes", "chador", "suit", "scarf"]);
    // شکلِ جمعِ چاپ (ص۷۷: shoes* کفش) — نه shoe
    expect(q(14, 1).options[q(14, 1).answer]).toBe("shoes");
  });
});

describe("r372 — بانکِ ۱۵: کامل‌کردن با بانک واژه (س۱، ص۹۰) — هشت‌گزینه‌ایِ دومِ کارتِ هفتم", () => {
  const WB = ["where", "bedroom", "reading", "she's", "washing", "what", "doing", "watching"];
  const NEVER_KEY = ["reading", "washing"];

  it("شش آیتم با ساقه‌های لایه‌ایِ ص۹۰ (بازتولیدِ ضدِ رونویسی) — verbatim چاپ", () => {
    expect(L(15).questions).toHaveLength(6);
    const expectedStems = [
      pairs["a"][1], pairs["b"][0], pairs["c"][0], pairs["c"][1], pairs["d"][0], pairs["d"][1],
    ];
    expect(expectedStems).toEqual([
      "I am in the -------", "What are you -------?", "------- Is he?", "------- in the living room.",
      "------- is he doing.", "she is ------- TV.",
    ]);
    L(15).questions.forEach((it, i) => expect(it.question).toBe(expectedStems[i]));
    // Is بزرگِ چاپی در c و نقطهٔ پایانیِ چاپی در d
    expect(q(15, 3).question).toContain("Is he?");
    expect(q(15, 5).question).toContain("doing.");
  });

  it("گزینه‌های هر آیتم = جای‌بهجاییِ کاملِ بانکِ ۸ واژه‌ای؛ کلید در جایگاهِ [1,2,3,4,5,7]", () => {
    const bank = L(15);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 2, 3, 4, 5, 7]);
    bank.questions.forEach((it) => {
      expect([...it.options].sort()).toEqual([...WB].sort());
      expect(new Set(it.options).size).toBe(8); // بدونِ تکرار
      // کلید = عینِ واژهٔ بانک (lowercase چاپ) در جایگاهِ answer
      expect(WB.includes(it.options[it.answer]), `${it.id} key in bank`).toBe(true);
      it.options.forEach((o) => expect(WB.includes(o), `${it.id} option ${o}`).toBe(true));
    });
  });

  it("کلیدها عینِ شکلِ بانکِ چاپی (lowercase) و منطقِ جای‌گذاریِ یکتا", () => {
    const keyed = L(15).questions.map((it) => it.options[it.answer]);
    expect(keyed).toEqual(["bedroom", "doing", "where", "she's", "what", "watching"]);
    // هرگز-کلید: reading/washing — دو واژهٔ بی‌مصرفِ بانک (ب-B حذف شد)
    for (const it of L(15).questions) expect(NEVER_KEY).not.toContain(it.options[it.answer]);
  });

  it("نشتِ آیتمِ حذف‌شده: هیچ «bank»ی در بانکِ ۱۵ نیست", () => {
    for (const it of L(15).questions) {
      expect(it.question.includes("bank"), `${it.id} stem`).toBe(false);
      expect(it.options.some((o) => o.includes("bank")), `${it.id} options`).toBe(false);
    }
  });
});

describe("r372 — پیمان‌های سراسریِ بانک‌های تازه", () => {
  it("بدونِ آیتمِ تایپی در بانک‌های ۱۱-۱۵ (قراردادِ r363 در g7 — r373: بانک‌های ۱۶-۲۰ گاردِ خودش)", () => {
    for (const b of g7.lessons.filter((x) => x.lesson >= 11 && x.lesson <= 15))
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });

  it("خلوصِ لاتینِ بانک‌های ۱۱/۱۲/۱۵ — بانک‌های ۱۳/۱۴ (ساقهٔ فارسیِ دستورِ چاپ) تنها استثنا (r373: بانکِ ۱۶ برچسبِ فارسی دارد — گاردِ خودش)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const b of g7.lessons.filter((x) => x.lesson >= 11 && x.lesson <= 15 && x.lesson !== 13 && x.lesson !== 14))
      for (const it of b.questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
  });

  it("هیچ آیتمی از سکشن‌های مستثنی (تصویری/تولیدی) نشت نکرده است — r373: scope به ۱۱-۱۵", () => {
    const all = g7.lessons.filter((x) => x.lesson >= 11 && x.lesson <= 15).flatMap((b) => b.questions);
    for (const forbidden of [
      "Backpack", "Thirteen", "Engineer", "Thirty", "Nurse", // خ۵-س۳ (تصویری)
      "clock", "table", "comb", "mirror", "newspaper", "television", "radio", "computer", // خ۶-س۳ (تصویری-کلید)
      "the bank", // حذفِ آیتمیِ b-B
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("شمارشِ نهایی: ۲۲ آیتمِ r372 با idهای یکتا و الگویِ g7-l11..15 — r373: scope به ۱۱-۱۵", () => {
    const newItems = g7.lessons.filter((b) => b.lesson >= 11 && b.lesson <= 15).flatMap((b) => b.questions);
    expect(newItems).toHaveLength(22);
    const ids = newItems.map((it) => it.id);
    expect(new Set(ids).size).toBe(22);
    expect(ids[0]).toBe("g7-l11-1");
    expect(ids[4]).toBe("g7-l12-1");
    expect(ids[8]).toBe("g7-l13-1");
    expect(ids[12]).toBe("g7-l14-1");
    expect(ids[16]).toBe("g7-l15-1");
    expect(ids[21]).toBe("g7-l15-6");
  });
});
