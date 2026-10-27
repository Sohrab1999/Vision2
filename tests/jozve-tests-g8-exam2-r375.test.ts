/**
 * r375 — گاردِ خانوادهٔ دومِ کارتِ تستِ پایهٔ هشتم: «نمونه سؤالات امتحانی درس دوم» (pdf-p27)
 * → ۴ بانکِ تازه/۱۱ آیتم در tests-g8.json (مجموع: ۷ بانک/۲۱ آیتم)
 *
 * نکاتِ راند: (۱) بانکِ ۴ فرگمنت‌های رندر-فقط دارد (لایه بینِ تیترِ س۱ و «2)» خالی است) —
 * گارد «عدمِ حضورِ فرگمنت در لایه» را اثبات و لنگرهای واژگانی (Go shopping* و library*) را
 * بازتولید می‌کند؛ گزینه‌ها واژهٔ کامل‌اند نه حرف (بلنکِ میانیِ چندحرفی — تفاوت با g7-بانک۱۷).
 * (۲) بانکِ ۵ پنج‌گزینه‌ایِ بدونِ اضافی است (۵ واژه/۵ بلنک — برخلافِ r374-بانک۲ دواضعی) و
 * هر پنج کلیدش لنگرِ درس‌درون دارد — گارد همهٔ پنج لنگر را از لایه بازتولید می‌کند.
 * (۳) بانکِ ۶ آیتمِ ۳ ساقهٔ فارسیِ چاپ («شروع کردن») دارد — استثنای خلوصِ لاتینِ ساقه‌ها.
 * (۴) بانکِ ۷ تنها ردیفِ دومِ ناهماهنگ را دارد — ردیفِ ۱ دوکلیدیِ مستثنی (midnight/sunset).
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

const g8 = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public/jozve/tests-g8.json"), "utf-8"),
) as Doc;

const L = (n: number) => {
  const b = g8.lessons.find((x) => x.lesson === n);
  expect(b, `bank g8-l${n} missing`).toBeDefined();
  return b as Bank;
};
const keyed = (bn: number) => L(bn).questions.map((it) => it.options[it.answer]);

const rec = g8.source.g8exam2 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; wordBank: string[]; wordBankSource: string;
  keyPolicy: string; engineNote: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const map = g8.source.g8familyMap as {
  extractedRound: string; lastUpdatedRound?: string;
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  note: string;
};

// ————— بازتولیدِ لایهٔ ص۲۷ (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r375) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const p27Start = layer.findIndex((l) => l.trim() === "<<<PAGE 27>>>");
const p27End = layer.findIndex((l, i) => i > p27Start && l.trim().startsWith("<<<PAGE"));
const p27 = layer.slice(p27Start, p27End);
const head = layer.slice(0, p27Start).join("\n");

const norm = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[….]{3,}/g, "-------")
    .replace(/-------(?=[A-Za-z])/g, "------- ");

const bankFromLayer = p27
  .map((l) => /\((Mountain[^)]*)\)/.exec(l))
  .filter(Boolean)
  .map((m) => m![1].split("–").map((w) => w.trim()))[0];
const stemsFromLayer: Record<string, string> = {};
for (const line of p27) {
  const m = /^([1-5])\)\s*(.+?)\s*$/.exec(line.trim());
  if (m && (line.includes("…") || line.includes("...")) && !/\([^)]*\)\s*$/.test(line.trim())) {
    stemsFromLayer[m[1]] = norm(`${m[1]}) ${m[2]}`);
  }
}
const s3FromLayer: { stem: string; opts: string[] }[] = [];
for (const line of p27) {
  const m = /^([1-3])\)\s*(.+?)\s*\(([^)]+)\)\s*$/.exec(line.trim());
  if (m && line.includes("…")) {
    s3FromLayer.push({
      stem: norm(`${m[1]}) ${m[2]}`).replace(/ $/, ""),
      opts: m[3].split(/\s[-–]\s/).map((w) => w.trim()),
    });
  }
}
const s4RowsFromLayer = p27
  .filter((l) => /^(Midday|Monday)\b/.test(l.trim()))
  .map((l) => norm(l.trim().split(/\s{2,}/)[0]));

describe("r375 — رسیدِ g8exam2 + نقشهٔ g8familyMap", () => {
  it("رسید: ۵ سکشن → ۴ استخراج/۱ مستثنی، ۱۱ آیتم در [2,5,3,1]، بانکِ بدونِ اضافی", () => {
    expect(rec.extractedRound).toBe("r375");
    expect(rec.examPages).toContain("pdf-p27");
    expect(rec.sectionsTotal).toBe(5);
    expect(rec.sectionsExtracted).toBe(4);
    expect(rec.sectionsSkipped).toBe(1);
    expect(rec.items).toBe(11);
    expect(rec.bankCounts).toEqual([2, 5, 3, 1]);
    expect(rec.wordBank).toEqual(["Mountain", "know", "pronunciation", "relax", "relative"]);
    expect(rec.wordBankSource).toContain("بدونِ اضافی");
    expect(rec.keyPolicy).toContain("نکته۲");
    expect(rec.engineNote).toContain("رندر-فقط");
    expect(rec.derivedKeys.S1).toEqual(["shopping", "library"]);
    expect(rec.derivedKeys.S2).toEqual(["relax", "pronunciation", "Mountain", "relative", "know"]);
    expect(rec.derivedKeys.S3).toEqual(["Friday", "Lessons", "start"]);
    expect(rec.derivedKeys.S4).toEqual(["midday"]);
    expect(rec.skippedSections).toHaveLength(3);
    expect(rec.skippedSections[0]).toContain("T____sd__y");
    expect(rec.skippedSections[0]).toContain("سه شنبه");
    expect(rec.skippedSections[1]).toContain("midnight");
    expect(rec.skippedSections[1]).toContain("sunset");
    expect(rec.skippedSections[2]).toContain("He's relaxing");
    expect(rec.skippedSections[2]).toContain("Sam is watching TV");
    expect(rec.printQuirks.some((s) => s.includes("thursday"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("Mountain"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("study"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("Sunday’s"))).toBe(true);
  });

  it("نقشهٔ ۸ خانوادهٔ g8 — r374=۱ و r375=۱ و r376=۲ و r377=۲ و r378=۱ و r379=۱ (جامع — گاردِ خودش) و null=۰؛ درس دوم به‌روز شد", () => {
    expect(map.families).toHaveLength(8);
    expect(map.families.map((f) => f.pdfPage)).toEqual([18, 27, 35, 41, 50, 60, 72, 73]);
    expect(map.families.filter((f) => f.round === "r374")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === "r375")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === "r376")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === "r377")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === "r378")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === "r379")).toHaveLength(1);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(0);
    expect(map.lastUpdatedRound).toBe("r379");
    expect(map.families[1].status).toContain("۴ بانک/۱۱ آیتم");
    expect(map.note).toContain("r369");
  });

  it("بازتولیدِ لایه: بانکِ چاپی، پنج ساقهٔ س۲، سه ساقه+ستونِ س۳، دو ردیفِ س۴ (ضدِ رونویسی)", () => {
    expect(bankFromLayer).toEqual(["Mountain", "know", "pronunciation", "relax", "relative"]);
    expect(Object.keys(stemsFromLayer).sort()).toEqual(["1", "2", "3", "4", "5"]);
    expect(stemsFromLayer["1"]).toBe("1) I stay at home and ------- on Fridays.");
    expect(stemsFromLayer["2"]).toBe('2) What is the correct ------- for " study"?');
    expect(stemsFromLayer["3"]).toBe("3) I climb a ------- on Sunday’s morning.");
    expect(stemsFromLayer["4"]).toBe("4) We visit our ------- on thursday.");
    expect(stemsFromLayer["5"]).toBe("5) That is fine. I will let her -------");
    expect(s3FromLayer).toHaveLength(3);
    expect(s3FromLayer[0]).toEqual({ stem: "1) ------- is the weekend.", opts: ["Saturday", "wednesday", "Friday"] });
    expect(s3FromLayer[1]).toEqual({ stem: "2) I study my ------- in the morning.", opts: ["Lessons", "well", "library"] });
    expect(s3FromLayer[2]).toEqual({ stem: "3) What is شروع کردن in English? It is -------", opts: ["help", "start", "stay"] });
    expect(s4RowsFromLayer).toEqual([
      "Midday – midnight – sunset – noon",
      "Monday – Sunday – midday – Friday",
    ]);
  });

  it("لنگرهای درس‌درونِ هر پنج کلیدِ س۲ + لنگرهای س۱/س۳/س۴ در لایهٔ پیش از ص۲۷", () => {
    expect(head).toMatch(/Go shopping\*/);
    expect(head).toMatch(/library\*/);
    expect(head).toMatch(/relax\*/);
    expect(head).toMatch(/I stay at home and relax\./);
    expect(head).toMatch(/climb a mountain\*/);
    expect(head).toMatch(/Visit relative\*/);
    expect(head).toMatch(/I visit my relatives\./);
    expect(head).toMatch(/I’ll let her know/);
    expect(head).toMatch(/The correct pronunciation is ‘study’\./);
    expect(head).toMatch(/study lesson\*/);
    expect(head).toMatch(/start/);
    expect(head).toMatch(/شروع/);
    expect(head).toMatch(/noon \(midday\)/);
    expect(head).toMatch(/weekend\*/);
    // واژه‌های دوکلیدیِ مستثنی هم در فهرست‌اند (مستندسازیِ دلیلِ استثنا)
    expect(head).toMatch(/Tuesday\*/);
    expect(head).toMatch(/Thursday\*/);
    expect(head).toMatch(/sunset\*/);
    expect(head).toMatch(/midnight\*/);
  });
});

describe("r375 — بانکِ ۴: خ۲/س۱ فرگمنت‌های رندر-فقط (چهارگزینه‌ای)", () => {
  it("فرگمنت‌ها در لایه نیستند (اثباتِ رندر-فقط)؛ گزینه‌ها واژهٔ کامل؛ فقط یک گزینه با شکلِ فرگمنت می‌سازد", () => {
    const bank = L(4);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "go sh-------ing",
      "go to l-------br-------y",
    ]);
    for (const line of p27) {
      expect(line).not.toContain("sh-------");
      expect(line).not.toContain("br-------");
    }
    expect(bank.questions[0].options).toEqual(["shopping", "weekend", "relative", "mountain"]);
    expect(bank.questions[0].answer).toBe(0);
    expect(bank.questions[1].options).toEqual(["Saturday", "pronunciation", "library", "weekend"]);
    expect(bank.questions[1].answer).toBe(2);
    expect(keyed(4)).toEqual(["shopping", "library"]);
  });

  it("کلیدها با شکلِ فرگمنت سازگارند و واژه‌های مزاحم ناسازگارند", () => {
    const fits = (frag: string, w: string) => {
      // sh-------ing → sh + حروفِ + ing
      if (frag === "go sh-------ing") return /^sh[a-z]+ing$/.test(w);
      // l-------br-------y → l + حروفِ + br + حروفِ + y
      return /^l[a-z]*br[a-z]+y$/.test(w);
    };
    for (const it of L(4).questions) {
      const matches = it.options.filter((o) => fits(it.question, o));
      expect(matches, `${it.id}: exactly one shape-fit`).toEqual([it.options[it.answer]]);
    }
  });
});

describe("r375 — بانکِ ۵: خ۲/س۲ بانکِ چاپیِ بدونِ اضافی (پنج‌گزینه‌ای)", () => {
  const B5 = ["Mountain", "know", "pronunciation", "relax", "relative"];

  it("ساقه‌های «1)» چاپی verbatim؛ هر گزینه‌مجموعه جای‌بهجاییِ کاملِ بانک؛ کلیدها [1,3,0,2,4]", () => {
    const bank = L(5);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "1) I stay at home and ------- on Fridays.",
      '2) What is the correct ------- for " study"?',
      "3) I climb a ------- on Sunday’s morning.",
      "4) We visit our ------- on thursday.",
      "5) That is fine. I will let her -------",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 3, 0, 2, 4]);
    expect(keyed(5)).toEqual(["relax", "pronunciation", "Mountain", "relative", "know"]);
    for (const it of bank.questions) {
      expect([...it.options].sort()).toEqual([...B5].sort());
    }
  });

  it("بدونِ اضافی: هر واژهٔ بانک دقیقاً یک‌بار کلید است (۵ واژه/۵ بلنک)", () => {
    const keys = keyed(5);
    expect([...keys].sort()).toEqual([...B5].sort());
  });

  it("کوئیرک‌های چاپی verbatim: thursday کوچک، Mountain بزرگ، « study» فاصله‌دار، Sunday’s خمیده", () => {
    const qs = L(5).questions.map((it) => it.question);
    expect(L(5).questions[2].options).toContain("Mountain");
    expect(keyed(5)).toContain("Mountain");
    expect(qs[3]).toContain("thursday");
    expect(qs[1]).toContain('" study"');
    expect(qs[2]).toContain("Sunday’s");
    expect(qs.some((s) => s.includes("Thursday"))).toBe(false);
  });
});

describe("r375 — بانکِ ۶: خ۲/س۳ گزینهٔ صحیح (سه‌گزینه‌ایِ درون‌چاپی)", () => {
  it("ستون‌های چاپی verbatim (wednesday کوچک)؛ کلیدها Friday/Lessons/start در [2,0,1]", () => {
    const bank = L(6);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "1) ------- is the weekend.",
      "2) I study my ------- in the morning.",
      "3) What is شروع کردن in English? It is -------",
    ]);
    expect(bank.questions.map((it) => it.options)).toEqual([
      ["Saturday", "wednesday", "Friday"],
      ["Lessons", "well", "library"],
      ["help", "start", "stay"],
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 0, 1]);
    expect(keyed(6)).toEqual(["Friday", "Lessons", "start"]);
  });

  it("ساقهٔ فارسیِ آیتمِ ۳ با گزینه‌های لاتینِ خالص (الگویِ g7-بانک۸/r374-بانک۳)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    const it3 = L(6).questions[2];
    expect(it3.question).toContain("شروع کردن");
    for (const o of it3.options) expect(latinPunct.test(o), `option of ${it3.id}`).toBe(true);
  });
});

describe("r375 — بانکِ ۷: خ۲/س۴ کلمهٔ ناهماهنگ (ردیفِ ۲ چاپی)", () => {
  it("ردیفِ دومِ چاپ verbatim؛ گزینه‌ها به ترتیبِ ردیف؛ کلید midday", () => {
    const bank = L(7);
    expect(bank.questions.map((it) => it.question)).toEqual(["Monday – Sunday – midday – Friday"]);
    const it = bank.questions[0];
    expect(it.question.split(" – ")).toEqual([...it.options]);
    expect(it.options).toEqual(["Monday", "Sunday", "midday", "Friday"]);
    expect(it.answer).toBe(2);
    expect(keyed(7)).toEqual(["midday"]);
  });

  it("ردیفِ ۱ دوکلیدیِ مستثنی: هیچ آیتمی از کارتِ g8 کلید یا گزینه‌ای از واژه‌هایش ندارد", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of ["Midday", "sunset", "midnight", "noon"]) {
      for (const it of all) {
        expect(
          it.options.some((o) => o.includes(forbidden)),
          `${it.id} option contains ${forbidden}`,
        ).toBe(false);
      }
    }
  });
});

describe("r375 — پیمان‌های سراسریِ فایل (پس از الحاقِ ۴ بانک)", () => {
  it("file shape: grade 8، نوزده بانک (r375=بانک‌های ۴-۷)، شمارهای بانک‌های ۱-۷ [4,3,3,2,5,3,1]، ۷۰ آیتمِ یکتا با الگویِ g8-l1..19", () => {
    expect(g8.grade).toBe(8);
    expect(g8.title).toContain("پایه هشتم");
    expect(g8.lessons).toHaveLength(19);
    expect(g8.lessons.slice(0, 7).map((l) => l.count)).toEqual([4, 3, 3, 2, 5, 3, 1]);
    const ids = g8.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(ids[0]).toBe("g8-l1-1");
    expect(ids[3]).toBe("g8-l1-4");
    expect(ids[4]).toBe("g8-l2-1");
    expect(ids[7]).toBe("g8-l3-1");
    expect(ids[10]).toBe("g8-l4-1");
    expect(ids[12]).toBe("g8-l5-1");
    expect(ids[17]).toBe("g8-l6-1");
    expect(ids[19]).toBe("g8-l6-3");
    expect(ids[20]).toBe("g8-l7-1");
    for (const b of g8.lessons) expect(b.count).toBe(b.questions.length);
  });

  it("بدونِ آیتمِ تایپی در کلِ g8 (قراردادِ r363)", () => {
    for (const b of g8.lessons)
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });

  it("خلوصِ لاتین: همهٔ گزینه‌ها لاتین‌اند؛ ساقه‌ها لاتین به‌جز بانک‌های ۳ و ۶ و ۱۲ و ۱۴ (ساقهٔ فارسیِ چاپ) — بانکِ ۱۶ دورویی است (پوششِ اختصاصی در گاردِ r378)", () => {
    // \u2019 = آپاستروفِ خمیدهٔ «Sunday’s» — کوئیرکِ verbatimِ چاپ (رسید: printQuirks)
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019]+$/;
    for (const b of g8.lessons)
      for (const it of b.questions) {
        if (b.lesson === 16) continue; // بانکِ دوطرفهٔ جدولِ ترجمه: ساقه/گزینهٔ فارسی و لاتینِ هم‌زمان — گاردِ r378
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
        if (b.lesson !== 3 && b.lesson !== 6 && b.lesson !== 12 && b.lesson !== 14 && b.lesson !== 19) {
          expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        }
      }
  });

  it("هیچ آیتمی از سکشن/آیتم‌های مستثنی نشت نکرده است", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "He's relaxing", "Sam is watching", // س۵ تصویری
      "T____sd", // فرگمنتِ Tuesday (تصویری-کلید)
      "Midday – midnight", // ردیفِ ۱ دوکلیدیِ س۴
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
    // واژهٔ Tuesday (کلیدِ تصویریِ مستثنی) به‌هیچ‌عنوان در کارت نیست
    for (const it of all) expect(it.options).not.toContain("Tuesday");
  });
});
