/**
 * r371 — گاردِ «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس سوم (pdf-p65) + درس چهارم (pdf-p74+p75)
 * → ۶ بانک/۲۴ آیتمِ تازه در tests-g7.json (جمعِ فایل: ۱۰ بانک/۴۴ آیتم)
 *
 * نکاتِ زیرساختیِ راند: (۱) س۱/س۲ ستونِ مشترکِ مشتقِ چاپی دارند — پاسخِ هر آیتم از ساقهٔ چاپی
 * + دستورِ «en/ten» یا «اعداد به حروف» مشتق می‌شود و حواس‌پرت‌ها = پاسخ‌های دیگرِ همان سکشن؛
 * چینشِ per-item (کلیدها 0,3,2,1) تا الگویِ قطرِ اصلی حدس‌زدنی نباشد. (۲) ساقه‌های س۱ از
 * خودِ لایهٔ متنی استخراج شدند (نه بازنویسیِ دستی) — گارد همان توکن‌های لایه را بازتولید می‌کند.
 * (۳) س۶ نخستین ساقهٔ فارسیِ کارتِ هفتم است (عینِ خطِ چاپ) — خلوصِ لاتینِ r370 به بانک‌های
 * ۱-۴ scope شد و این گارد خلوصِ لاتینِ بانک‌های ۵/۶/۷/۹/۱۰ را جدا برقرار می‌کند.
 * (۴) دو حذفِ آیتمیِ دوکلیدیِ ص۷۵-س۲ (س۳ uncle؛ س۵ moter) — سه هرگز-کلید قفل می‌شوند.
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

const rec3 = g7.source.g7exam3 as {
  extractedRound: string; section: string; examPages: string; sectionsTotal: number;
  sectionsExtracted: number; sectionsSkipped: number; items: number; bankCounts: number[];
  keyPolicy: string; engineNote: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const rec4 = g7.source.g7exam4 as typeof rec3 & { wordBank: string[]; extraWords: string[] };
const map = g7.source.g7familyMap as {
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
};

// ————— بازتولیدِ ساقه‌های لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r371) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g7.txt"), "utf-8").split("\n");
const p65Start = layer.findIndex((l) => l.trim() === "<<<PAGE 65>>>");
const p65End = layer.findIndex((l, i) => i > p65Start && l.trim().startsWith("<<<PAGE"));
const stemsFromLayer: string[] = [];
for (const line of layer.slice(p65Start, p65End))
  for (const tok of line.split(/\s+/))
    if (/^(Sev|Elev|Nine|Six)[….]+$/.test(tok)) stemsFromLayer.push(tok);

describe("r371 — رسیدهای g7exam3 / g7exam4", () => {
  it("receipt3: خانوادهٔ درس سوم — ۶ سکشن، ۴ بانک/۱۳ آیتم", () => {
    expect(rec3.extractedRound).toBe("r371");
    expect(rec3.section).toContain("درس سوم");
    expect(rec3.examPages).toContain("pdf-p65");
    expect(rec3.sectionsTotal).toBe(6);
    expect(rec3.sectionsExtracted).toBe(4);
    expect(rec3.sectionsSkipped).toBe(2);
    expect(rec3.items).toBe(13);
    expect(rec3.bankCounts).toEqual([4, 4, 4, 1]);
    expect(rec3.derivedKeys.S1).toHaveLength(4);
    expect(rec3.derivedKeys.S2).toHaveLength(4);
    expect(rec3.derivedKeys.S3).toHaveLength(4);
  });

  it("receipt3: س۴/س۵ مستثنی — کلیدِ غیرچاپی و کلیدِ تصویری + سکشنِ بی‌شماره", () => {
    expect(rec3.skippedSections.some((s) => s.startsWith("س۴") && s.includes("Sunday"))).toBe(true);
    expect(rec3.skippedSections.some((s) => s.includes("بی‌شماره") && s.includes("آذر"))).toBe(true);
    expect(rec3.skippedSections.some((s) => s.includes("۶ شمع"))).toBe(true);
    // سکشنِ پنجم در چاپ بی‌شماره است (۱/۲/۳/۴ سپس ۶)
    expect(rec3.skippedSections.some((s) => s.includes("بی‌شماره است"))).toBe(true);
  });

  it("receipt3: quirks — Hoe، lowercase، ساقهٔ لایه‌محور، نخستین ساقهٔ فارسی", () => {
    expect(rec3.printQuirks.some((s) => s.includes("Hoe"))).toBe(true);
    expect(rec3.printQuirks.some((s) => s.includes("lowercase"))).toBe(true);
    expect(rec3.printQuirks.some((s) => s.includes("لایهٔ متنی استخراج"))).toBe(true);
    expect(rec3.printQuirks.some((s) => s.includes("نخستین ساقهٔ فارسی"))).toBe(true);
    expect(rec3.engineNote).toContain("Nineteen");
    expect(rec3.engineNote).toContain("0,3,2,1");
  });

  it("receipt4: خانوادهٔ درس چهارم — ۷ سکشنِ دوصفحه‌ای، ۲ بانک/۱۱ آیتم", () => {
    expect(rec4.extractedRound).toBe("r371");
    expect(rec4.section).toContain("درس چهارم");
    expect(rec4.examPages).toContain("pdf-p74");
    expect(rec4.examPages).toContain("pdf-p75");
    expect(rec4.sectionsTotal).toBe(7);
    expect(rec4.sectionsExtracted).toBe(2);
    expect(rec4.sectionsSkipped).toBe(5);
    expect(rec4.items).toBe(11);
    expect(rec4.bankCounts).toEqual([4, 7]);
    expect(rec4.wordBank).toEqual(["Mechanic", "birthday", "Mrs", "florist", "housewife", "Bahman", "meet"]);
    expect(rec4.extraWords).toEqual(["Mechanic", "florist", "housewife"]);
  });

  it("receipt4: پنج مستثنیِ تصویری/تولیدی + دو حذفِ آیتمیِ دوکلیدی", () => {
    expect(rec4.skippedSections.filter((s) => s.startsWith("ص۷۴"))).toHaveLength(3);
    expect(rec4.skippedSections.filter((s) => s.startsWith("ص۷۵-س۱"))).toHaveLength(1);
    expect(rec4.skippedSections.filter((s) => s.startsWith("ص۷۵-س۴"))).toHaveLength(1);
    expect(rec4.skippedSections.some((s) => s.includes("س۳ حذفِ آیتمی") && s.includes("uncle"))).toBe(true);
    expect(rec4.skippedSections.some((s) => s.includes("س۵ حذفِ آیتمی") && s.includes("moter"))).toBe(true);
  });

  it("receiptMap: خانواده‌های ۶۵/۷۴ به r371 منتقل شدند", () => {
    const f3 = map.families.find((f) => f.pdfPage === 65);
    const f4 = map.families.find((f) => f.pdfPage === 74);
    expect(f3?.round).toBe("r371");
    expect(f3?.status).toContain("۱۳ آیتم");
    expect(f4?.round).toBe("r371");
    expect(f4?.status).toContain("دوصفحه‌ای");
  });
});

describe("r371 — بانکِ ۵: تکمیل اعداد با en/ten (س۱، ص۶۵)", () => {
  const COL = ["Seven", "Eleven", "Nineteen", "Sixteen"];
  const PREFIX = ["Sev", "Elev", "Nine", "Six"];

  it("چهار ساقه = عینِ توکن‌های لایهٔ p65 (بازتولیدِ ضدِ رونویسی)", () => {
    expect(stemsFromLayer).toHaveLength(4);
    L(5).questions.forEach((it, i) => expect(it.question).toBe(stemsFromLayer[i]));
    expect(stemsFromLayer.map((s) => s.replace(/[….]/g, ""))).toEqual(PREFIX);
  });

  it("گزینه‌ها هر بار جای‌بهجاییِ کاملِ ستونِ چاپی‌اند و کلید از ساقه می‌سازد", () => {
    L(5).questions.forEach((it, i) => {
      expect([...it.options].sort()).toEqual([...COL].sort());
      const key = it.options[it.answer];
      expect(key.startsWith(PREFIX[i]), `${it.id}: ${key}.startsWith(${PREFIX[i]})`).toBe(true);
      // هیچ گزینهٔ دیگری با ساقه نمی‌سازد
      it.options.forEach((o, oi) => {
        if (oi !== it.answer) expect(o.startsWith(PREFIX[i]), `${it.id} distractor ${o}`).toBe(false);
      });
    });
  });

  it("چینشِ per-item: کلیدها [0,3,2,1] — الگویِ قطر حدس‌زدنی نیست", () => {
    expect(L(5).questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
  });
});

describe("r371 — بانکِ ۶: عدد به حروف (س۲، ص۶۵)", () => {
  const COL = ["Ten", "Five", "Twenty", "Forty-one"];

  it("چهار ساقهٔ رقمیِ چاپی (10/5/20/41) با فرمتِ پیکانِ کارتِ هفتم", () => {
    const stems = ["10 → -------", "5 → -------", "20 → -------", "41 → -------"];
    expect(L(6).questions.map((it) => it.question)).toEqual(stems);
  });

  it("ستونِ مشترکِ مشتقِ چاپی — کلیدِ هر آیتم یکتا و حواس‌پرت‌ها = پاسخ‌های دیگرِ سکشن", () => {
    L(6).questions.forEach((it) => {
      expect([...it.options].sort()).toEqual([...COL].sort());
      expect(it.options[it.answer]).toBeTruthy();
    });
    const keyed = L(6).questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4); // نگاشتِ یک‌به‌یکِ رقم→واژه
    expect(L(6).questions.map((it) => it.answer)).toEqual([0, 3, 2, 1]);
    expect(keyed).toEqual(["Ten", "Five", "Twenty", "Forty-one"]);
  });
});

describe("r371 — بانکِ ۷: پاسخ از ستون راست (س۳، ص۶۵)", () => {
  const COL = ["I am 13 years old.", "my name is saro.", "it is in Bahman.", "my last name is lotfi."];

  it("ستونِ چاپیِ a-d verbatim — پاسخ‌های lowercase چاپ حفظ شد", () => {
    for (const it of L(7).questions) expect(it.options).toEqual(COL);
    expect(COL[1]).toBe("my name is saro.");
    expect(COL[3]).toBe("my last name is lotfi.");
    expect(COL[1]).not.toBe(COL[1].toUpperCase()); // دست‌نخورده — نه سنجشِ case، سندِ verbatim
  });

  it("ساقه‌ها verbatim با غلطِ تایپیِ چاپِ «Hoe» — کلیدها [1,3,0,2] و نگاشتِ یک‌به‌یک", () => {
    const stems = [
      "What is your first name? ( ------- )",
      "What is your last name? ( ------- )",
      "Hoe old are you? ( ------- )",
      "What is your birthday? ( ------- )",
    ];
    expect(L(7).questions.map((it) => it.question)).toEqual(stems);
    expect(L(7).questions.map((it) => it.answer)).toEqual([1, 3, 0, 2]);
    const keyed = L(7).questions.map((it) => it.options[it.answer]);
    expect(new Set(keyed).size).toBe(4);
    expect(keyed).toEqual(["my name is saro.", "my last name is lotfi.", "I am 13 years old.", "it is in Bahman."]);
  });
});

describe("r371 — بانکِ ۸: جمعه به انگلیسی (س۶، ص۶۵) — نخستین ساقهٔ فارسیِ کارتِ هفتم", () => {
  it("ساقهٔ فارسیِ چاپ + سه‌گزینه‌ای با کلیدِ Friday", () => {
    const it = q(8, 1);
    expect(it.question).toBe("جمعه به انگلیسی چه می شود؟ ( ------- )");
    expect(it.options).toEqual(["Friday", "Saturday", "Tuesday"]);
    expect(it.answer).toBe(0);
    expect(it.options[it.answer]).toBe("Friday");
    expect(L(8).questions).toHaveLength(1);
  });
});

describe("r371 — بانکِ ۹: تکمیل جمله با بانک واژه (ص۷۵-س۲) — نخستین هفت‌گزینه‌ایِ کارتِ هفتم", () => {
  const COL = ["Mechanic", "birthday", "Mrs", "florist", "housewife", "Bahman", "meet"];
  const NEVER_KEY = ["Mechanic", "florist", "housewife"];

  it("ستونِ مشترکِ هفت‌تاییِ چاپی در هر چهار آیتم", () => {
    expect(L(9).questions).toHaveLength(4);
    for (const it of L(9).questions) expect(it.options).toEqual(COL);
  });

  it("ساقه‌ها با جای‌بانِ ( ------- ) — کلیدها [2,1,5,6]", () => {
    const stems = ["She is ( ------- ) Ahmadi.", "Happy ( ------- ) to you.", "Day ( ------- ), Esfand.", "Nice to ( ------- ) you."];
    expect(L(9).questions.map((it) => it.question)).toEqual(stems);
    expect(L(9).questions.map((it) => it.answer)).toEqual([2, 1, 5, 6]);
    const keyed = L(9).questions.map((it) => it.options[it.answer]);
    expect(keyed).toEqual(["Mrs", "birthday", "Bahman", "meet"]);
  });

  it("سه هرگز-کلیدِ دوکلیدی (Mechanic/florist/housewife) قفل است — حذفِ س۳/س۵", () => {
    for (const it of L(9).questions)
      expect(NEVER_KEY).not.toContain(it.options[it.answer]);
  });
});

describe("r371 — بانکِ ۱۰: مذکر و مونث (ص۷۵-س۳)", () => {
  const HE = ["Father", "brother", "grandfather", "uncle"]; // مذکر → He (0)
  const SHE = ["mother", "sister", "grangmoter"]; // مونث → She (1)

  it("هفت آیتمِ دوگزینه‌ایِ ثابتِ [He, She] با ساقهٔ verbatimِ چاپ", () => {
    expect(L(10).questions).toHaveLength(7);
    expect(L(10).questions.map((it) => it.question)).toEqual([
      "Father → -------", "mother → -------", "sister → -------", "brother → -------",
      "grandfather → -------", "grangmoter → -------", "uncle → -------",
    ]);
    for (const it of L(10).questions) expect(it.options).toEqual(["He", "She"]);
    // «grangmoter» غلطِ تایپیِ چاپ برایِ grandmother — verbatim قفل
    expect(q(10, 6).question).toContain("grangmoter");
    expect(q(10, 6).question).not.toContain("grandmother");
  });

  it("کلیدها [0,1,1,0,0,1,0] — دقیقاً بر اساسِ مذکر/مونثِ واژه", () => {
    expect(L(10).questions.map((it) => it.answer)).toEqual([0, 1, 1, 0, 0, 1, 0]);
    L(10).questions.forEach((it) => {
      const word = it.question.replace(" → -------", "");
      if (HE.includes(word)) expect(it.options[it.answer]).toBe("He");
      if (SHE.includes(word)) expect(it.options[it.answer]).toBe("She");
    });
  });

  it("بانکِ ۱۰ grammar است (تنها بانکِ غیرِ vocabِ فایلِ g7)", () => {
    for (const it of L(10).questions) expect(it.category).toBe("grammar");
  });
});

describe("r371 — پیمان‌های سراسریِ بانک‌های تازه", () => {
  it("بدونِ آیتمِ تایپی در بانک‌های ۵-۱۰ (قراردادِ r363 در g7)", () => {
    for (const b of g7.lessons.filter((x) => x.lesson >= 5))
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });

  it("خلوصِ لاتینِ بانک‌های ۵/۶/۷/۹/۱۰ — بانکِ ۸ (فارسیِ چاپ) تنها استثناست (r372: بانک‌های ۱۳/۱۴ ساقهٔ فارسی دارند — گاردِ خودش)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const b of g7.lessons.filter((x) => x.lesson >= 5 && x.lesson <= 10 && x.lesson !== 8))
      for (const it of b.questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
  });

  it("هیچ آیتمی از سکشن‌های مستثنیِ r371 (تصویری/تولیدی) نشت نکرده است — بانک‌های ۵-۱۰ (r372: Azar در بانک ۱۲ لنگرِ چاپیِ ص۸۴ دارد)", () => {
    const all = g7.lessons.filter((x) => x.lesson >= 5 && x.lesson <= 10).flatMap((b) => b.questions);
    for (const forbidden of ["Sunday", "Four", "تصویر", "Painter", "Pilot", "farmer", "Akbari", "Amani", "Mina", "Football", "nurse"])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("شمارشِ نهاییِ فایل: ۲۰ بانک (r373: +۵ — پایانِ g7) — ۲۴ آیتمِ r371 در بانک‌های ۵-۱۰", () => {
    expect(g7.lessons).toHaveLength(20);
    const newItems = g7.lessons.filter((b) => b.lesson >= 5 && b.lesson <= 10).flatMap((b) => b.questions);
    expect(newItems).toHaveLength(24);
    const ids = newItems.map((it) => it.id);
    expect(new Set(ids).size).toBe(24);
  });
});
