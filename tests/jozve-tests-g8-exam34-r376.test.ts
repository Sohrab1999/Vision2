/**
 * r376 — گاردِ جفتِ خانوادهٔ سوم و چهارمِ کارتِ تستِ پایهٔ هشتم:
 * «نمونه سؤالات امتحانی درس سوم» (pdf-p35) + «درس چهارم» (pdf-p41)
 * → ۵ بانکِ تازه/۱۵ آیتم در tests-g8.json (مجموع: ۱۲ بانک/۳۶ آیتم)
 *
 * نکاتِ راند: (۱) بانکِ ۸ بانکِ چاپیِ تک‌اضافی دارد (۵ واژه/۴ بلنک — take هرگز-کلید؛
 * برخلافِ r375-بانک۵ بدونِ اضافی) با سه لنگرِ جدولی + type مشتقِ چاپی (بیرونِ واژگان،
 * دو بار چاپ در خودِ ص۳۵). (۲) بانکِ ۱۰ فرگمنت‌های رندر-فقط دارد (لایه بینِ تیترِ س۴
 * و س۵ خالی — پنجمین نمونه) با قفلِ شکلِ فرگمنت و گزینه‌های اصطلاحِ کامل؛ «tape» شکلِ
 * t-------p------- را می‌سازد اما بیرونِ محدودهٔ واژگانِ جزوه است و گزینه نشد.
 * (۳) بانکِ ۱۲ نخستین ساقهٔ تمام‌فارسیِ کارت است (تلفظ ch) — ساقهٔ سه‌خطیِ بریدهٔ RTL
 * با فاصله‌بندیِ بازساخته (الگویِ r373 re-join؛ مقایسه بدونِ فاصله/نقطه).
 * (۴) نقطهٔ چاپیِ «nurse.» از ردیفِ س۳ ص۴۱ حذف شد — قراردادِ ردیف‌های ناهماهنگِ کارت.
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

const rec = g8.source.g8exam3 as {
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

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r376) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const p35Start = layer.findIndex((l) => l.trim() === "<<<PAGE 35>>>");
const p35End = layer.findIndex((l, i) => i > p35Start && l.trim().startsWith("<<<PAGE"));
const p35 = layer.slice(p35Start, p35End);
const p41Start = layer.findIndex((l) => l.trim() === "<<<PAGE 41>>>");
const p41End = layer.findIndex((l, i) => i > p41Start && l.trim().startsWith("<<<PAGE"));
const p41 = layer.slice(p41Start, p41End);
const head35 = layer.slice(0, p35Start).join("\n");
const mid = layer.slice(p35Start, p41Start).join("\n");

const norm = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[….]{3,}/g, "-------")
    .replace(/-------(?=[A-Za-z])/g, "------- ");

const bankFromLayer = p35
  .map((l) => /\((Cook[^)]*)\)/.exec(l))
  .filter(Boolean)
  .map((m) => m![1].split("–").map((w) => w.trim()))[0];
const stemsFromLayer: Record<string, string> = {};
for (const line of p35) {
  const m = /^([1-4])\)\s*(.+?)\s*$/.exec(line.trim());
  if (m && (line.includes("…") || line.includes("...")) && !/\([^)]*\)\s*$/.test(line.trim())) {
    stemsFromLayer[m[1]] = norm(`${m[1]}) ${m[2]}`);
  }
}
const rows35FromLayer = p35
  .filter((l) => /^(Swimming|Badminton|Speak|Playing)\b/.test(l.trim()) && l.includes("…"))
  .map((l) => norm(l.trim().split(/\s{2,}/)[0]));
const rows41FromLayer = p41
  .filter((l) => /^(Health|Sneeze)\b/.test(l.trim()) && l.includes("…"))
  .map((l) => norm(l.trim().split(/\s{2,}/)[0]));
const opt41FromLayer = p41
  .map((l) => /^school\b/.test(l.trim()) ? l.trim() : null)
  .filter(Boolean);
// ساقهٔ سه‌خطیِ س۵ ص۴۱ (RTL quirk) — re-join و مقایسهٔ بدونِ فاصله/نقطه (الگویِ r373)
const i5l = p41.findIndex((l) => l.trim() === "5)");
const pronLayerJoined = p41
  .slice(i5l + 1, i5l + 9)
  .map((l) => l.trim())
  .filter(Boolean)
  .slice(0, 3)
  .join(" ");
const stripDotSpace = (s: string) => s.replace(/[\s.]/g, "");

describe("r376 — رسیدِ g8exam3 + نقشهٔ g8familyMap", () => {
  it("رسید: ۱۰ سکشن → ۵ استخراج/۵ مستثنی، ۱۵ آیتم در [4,4,4,2,1]، بانکِ تک‌اضافی", () => {
    expect(rec.extractedRound).toBe("r376");
    expect(rec.examPages).toContain("pdf-p35");
    expect(rec.examPages).toContain("pdf-p41");
    expect(rec.sectionsTotal).toBe(10);
    expect(rec.sectionsExtracted).toBe(5);
    expect(rec.sectionsSkipped).toBe(5);
    expect(rec.items).toBe(15);
    expect(rec.bankCounts).toEqual([4, 4, 4, 2, 1]);
    expect(rec.wordBank).toEqual(["Cook", "do", "type", "speak", "take"]);
    expect(rec.wordBankSource).toContain("تک‌اضافی");
    expect(rec.wordBankSource).toContain("take");
    expect(rec.keyPolicy).toContain("مشتقِ چاپی");
    expect(rec.engineNote).toContain("رندر-فقط");
    expect(rec.engineNote).toContain("tape");
    expect(rec.derivedKeys.S2).toEqual(["do", "speak", "Cook", "type"]);
    expect(rec.derivedKeys["S3-l3"]).toEqual(["buying", "draw", "chess", "morning"]);
    expect(rec.derivedKeys.S4).toEqual(["make tea", "draw a picture", "ride a horse", "type"]);
    expect(rec.derivedKeys["S3-l4"]).toEqual(["Health", "nurse"]);
    expect(rec.derivedKeys["S5-l4"]).toEqual(["school"]);
    expect(rec.skippedSections).toHaveLength(5);
    expect(rec.skippedSections[0]).toContain("play tennis");
    expect(rec.skippedSections[0]).toContain("search the Web");
    expect(rec.skippedSections[1]).toContain("Yes, I am");
    expect(rec.skippedSections[1]).toContain("No, he can't");
    expect(rec.skippedSections[4]).toContain("running nose");
    expect(rec.printQuirks.some((s) => s.includes("classmate"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("nurse"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes('صدای" ک"'))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("امالی"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("m-------ke"))).toBe(true);
  });

  it("نقشهٔ ۸ خانوادهٔ g8 — r376=۲ (درس سوم و چهارم) و r374=۱ و r375=۱ و r377=۲ و r378=۱ و r379=۱ (جامع — گاردِ خودش) و null=۰", () => {
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
    expect(map.families[2].status).toContain("۳ بانک/۱۲ آیتم");
    expect(map.families[3].status).toContain("۲ بانک/۳ آیتم");
    expect(map.note).toContain("r369");
  });

  it("بازتولیدِ لایه: بانکِ چاپی، چهار ساقهٔ س۲، چهار ردیفِ س۳ ص۳۵، دو ردیفِ ص۴۱، ستونِ س۵ ص۴۱", () => {
    expect(bankFromLayer).toEqual(["Cook", "do", "type", "speak", "take"]);
    expect(Object.keys(stemsFromLayer).sort()).toEqual(["1", "2", "3", "4"]);
    expect(stemsFromLayer["1"]).toBe("1) How do you ------- a hard puzzle?");
    expect(stemsFromLayer["2"]).toBe("2) All my classmate can ------- English well.");
    expect(stemsFromLayer["3"]).toBe("3) What do you need to ------- some food?");
    expect(stemsFromLayer["4"]).toBe("4) I like to learn how to ------- fast.");
    expect(rows35FromLayer).toEqual([
      "Swimming – running – buying – riding",
      "Badminton – ping pong – draw – tennis",
      "Speak – read – type – chess",
      "Playing – doing – speaking – morning",
    ]);
    expect(rows41FromLayer).toEqual([
      "Health – sore eyes – headache – measles",
      "Sneeze – cough – mumps – nurse.", // نقطهٔ چاپ — در کارت حذف می‌شود
    ]);
    expect(opt41FromLayer).toEqual(["school – chair – teacher - toothache"]);
    expect(pronLayerJoined).toContain("در کدام کلمه حرفch");
    expect(pronLayerJoined).toContain('صدای" ک"');
    expect(pronLayerJoined).toContain(".می دهد");
  });

  it("لنگرهای درس‌درون: خ۳ پیش از ص۳۵ (جدولِ ص۲۸/۲۹ + تمرین‌ها) و خ۴ در ص۳۵-۴۰ (جدولِ ص۳۶/۳۷)", () => {
    expect(head35).toMatch(/\btea\b/);
    expect(head35).toMatch(/Can he do a puzzle\?/);
    expect(head35).toMatch(/\bspeak\b/);
    expect(head35).toMatch(/Is she good at cooking\?/);
    expect(head35).toMatch(/\bhorse\b/);
    expect(head35).toMatch(/Can you ride a bicycle\?/);
    expect(head35).toMatch(/\bchess\b/);
    expect(head35).toMatch(/\bbadminton\b/); // لایهٔ جدولیِ ص۲۸: «بدمینتون بازی/کردن/*/badminton/play» — ستاره جدا از واژه
    expect(head35).toMatch(/Ali can play tennis well\./);
    expect(head35).toMatch(/morning\*/);
    expect(head35).toMatch(/Go to school\*/);
    expect(head35).toMatch(/drawing book/);
    expect(mid).toMatch(/health\*/);
    expect(mid).toMatch(/measles\*/);
    expect(mid).toMatch(/Sore eyes\*/);
    expect(mid).toMatch(/headache\*/);
    expect(mid).toMatch(/cough\*/);
    expect(mid).toMatch(/nurse\*/);
    expect(mid).toMatch(/mumps\*/);
    expect(mid).toMatch(/sneeze\*/);
    expect(mid).toMatch(/toothache\*/);
  });
});

describe("r376 — بانکِ ۸: خ۳/س۲ بانکِ چاپیِ تک‌اضافی (پنج‌گزینه‌ای)", () => {
  const B5 = ["Cook", "do", "type", "speak", "take"];

  it("ساقه‌های «1)» چاپی verbatim؛ هر گزینه‌مجموعه جای‌بهجاییِ کاملِ بانک؛ کلیدها [1,3,0,2]", () => {
    const bank = L(8);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "1) How do you ------- a hard puzzle?",
      "2) All my classmate can ------- English well.",
      "3) What do you need to ------- some food?",
      "4) I like to learn how to ------- fast.",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 3, 0, 2]);
    expect(keyed(8)).toEqual(["do", "speak", "Cook", "type"]);
    for (const it of bank.questions) {
      expect([...it.options].sort()).toEqual([...B5].sort());
    }
  });

  it("take اضافیِ چاپی است و هرگز کلید نیست؛ کوئیرک‌های verbatim: Cook بزرگ و classmate بدونِ s", () => {
    const bank = L(8);
    for (const it of bank.questions) expect(keyed(8)).not.toContain("take");
    expect(bank.questions[2].options).toContain("Cook");
    expect(bank.questions[1].question).toContain("All my classmate");
    expect(bank.questions[1].question).not.toContain("classmates");
  });
});

describe("r376 — بانکِ ۹: خ۳/س۳ چهار ناهماهنگِ چاپی", () => {
  it("ردیف‌ها verbatim؛ گزینه‌ها به ترتیبِ چاپ؛ کلیدها buying/draw/chess/morning", () => {
    const bank = L(9);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "Swimming – running – buying – riding",
      "Badminton – ping pong – draw – tennis",
      "Speak – read – type – chess",
      "Playing – doing – speaking – morning",
    ]);
    for (const it of bank.questions) {
      expect(it.question.split(" – ")).toEqual([...it.options]);
    }
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 2, 3, 3]);
    expect(keyed(9)).toEqual(["buying", "draw", "chess", "morning"]);
  });
});

describe("r376 — بانکِ ۱۰: خ۳/س۴ فرگمنت‌های رندر-فقط (چهارگزینه‌ایِ اصطلاحِ کامل)", () => {
  it("فرگمنت‌ها در لایه نیستند (اثباتِ رندر-فقط: ناحیهٔ س۴-س۵ خالی)؛ کلیدها و ترتیب گزینه‌ها", () => {
    const bank = L(10);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "m-------ke t-------a",
      "dr-------w a pict-------re",
      "r-------de a h-------rse",
      "t-------p-------",
    ]);
    // ناحیهٔ بینِ تیترِ س۴ و س۵ فقط شمارهٔ سکشن و خطوط خالی است
    const i4 = p35.findIndex((l) => l.includes("امالی کلمات ناقص"));
    const i5 = p35.findIndex((l) => l.includes("پاسخ کامل"));
    for (const l of p35.slice(i4 + 1, i5)) {
      expect(l.trim() === "" || l.trim() === "5").toBe(true);
    }
    expect(bank.questions.map((it) => it.options)).toEqual([
      ["take photos", "make tea", "make a cake", "tell stories"],
      ["do a puzzle", "make tea", "ride a horse", "draw a picture"],
      ["do a puzzle", "make tea", "ride a horse", "tell stories"],
      ["type", "make", "take", "tell"],
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 3, 2, 0]);
    expect(keyed(10)).toEqual(["make tea", "draw a picture", "ride a horse", "type"]);
  });

  it("قفلِ شکل: فقط کلید با الگویِ فرگمنت می‌سازد؛ tape عمداً در هیچ گزینه‌ای نیست", () => {
    const fits = (frag: string, w: string) => {
      if (frag === "m-------ke t-------a") return /^m[a-z]+ke t[a-z]+a$/.test(w);
      if (frag === "dr-------w a pict-------re") return /^dr[a-z]+w a pict[a-z]+re$/.test(w);
      if (frag === "r-------de a h-------rse") return /^r[a-z]+de a h[a-z]+rse$/.test(w);
      return /^t[a-z]+p[a-z]+$/.test(w); // t-------p-------
    };
    for (const it of L(10).questions) {
      const matches = it.options.filter((o) => fits(it.question, o));
      expect(matches, `${it.id}: exactly one shape-fit`).toEqual([it.options[it.answer]]);
    }
    const allOptions = g8.lessons.flatMap((b) => b.questions).flatMap((it) => it.options);
    expect(allOptions).not.toContain("tape");
  });

  it("لنگرهای بانک ۱۰: Make tea (جدولِ ص۲۸)، drawing book (ص۲۹)، horse (ص۲۹) در لایهٔ پیش از ص۳۵", () => {
    expect(head35).toMatch(/\btea\b/);
    expect(head35).toMatch(/\bmake\b/);
    expect(head35).toMatch(/drawing book/);
    expect(head35).toMatch(/\bhorse\b/);
    // type لنگرِ لایه‌ای ندارد اما در خودِ ص۳۵ دو بار چاپ است (بانکِ س۲ + ردیفِ س۳)
    expect(p35.join("\n")).toMatch(/\btype\b/);
  });
});

describe("r376 — بانکِ ۱۱: خ۴/س۳ دو ناهماهنگِ چاپی", () => {
  it("ردیف‌ها verbatim (نقطهٔ «nurse.» حذفِ قراردادی)؛ کلیدها Health/nurse", () => {
    const bank = L(11);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "Health – sore eyes – headache – measles",
      "Sneeze – cough – mumps – nurse",
    ]);
    for (const it of bank.questions) {
      expect(it.question.split(" – ")).toEqual([...it.options]);
    }
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 3]);
    expect(keyed(11)).toEqual(["Health", "nurse"]);
  });

  it("لنگرهای جدولِ بیماری‌های خ۴ (ص۳۶/۳۷): هر شش واژهٔ هر دو ردیف در لایه ستاره‌دارِ چاپ‌اند", () => {
    expect(mid).toMatch(/health\*/);
    expect(mid).toMatch(/Sore eyes\*/);
    expect(mid).toMatch(/headache\*/);
    expect(mid).toMatch(/measles\*/);
    expect(mid).toMatch(/sneeze\*/);
    expect(mid).toMatch(/cough\*/);
    expect(mid).toMatch(/mumps\*/);
    expect(mid).toMatch(/nurse\*/);
  });
});

describe("r376 — بانکِ ۱۲: خ۴/س۵ تلفظِ ch (ساقهٔ تمام‌فارسیِ چاپ)", () => {
  it("ساقهٔ بازساخته با لایه برابر است (بدونِ فاصله/نقطه)؛ گزینه‌ها چاپی؛ کلید school", () => {
    const bank = L(12);
    expect(bank.questions.map((it) => it.question)).toEqual(['در کدام کلمه حرف ch صدای "ک" می دهد.']);
    const it = bank.questions[0];
    expect(stripDotSpace(it.question)).toBe(stripDotSpace(pronLayerJoined));
    expect(it.options).toEqual(["school", "chair", "teacher", "toothache"]);
    expect(it.answer).toBe(0);
    expect(keyed(12)).toEqual(["school"]);
  });
});

describe("r376 — پیمان‌های سراسریِ فایل (پس از الحاقِ ۵ بانک — اکنون ۱۶ بانک با r378)", () => {
  it("file shape: grade 8، نوزده بانک، شمارها [4,3,3,2,5,3,1,4,4,4,2,1,4,2,4,6,8,5,5]، ۷۰ آیتمِ یکتا با الگویِ g8-l1..19", () => {
    expect(g8.grade).toBe(8);
    expect(g8.title).toContain("پایه هشتم");
    expect(g8.lessons).toHaveLength(19);
    expect(g8.lessons.map((l) => l.count)).toEqual([4, 3, 3, 2, 5, 3, 1, 4, 4, 4, 2, 1, 4, 2, 4, 6, 8, 5, 5]);
    const ids = g8.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(ids[0]).toBe("g8-l1-1");
    expect(ids[21]).toBe("g8-l8-1");
    expect(ids[25]).toBe("g8-l9-1");
    expect(ids[29]).toBe("g8-l10-1");
    expect(ids[33]).toBe("g8-l11-1");
    expect(ids[35]).toBe("g8-l12-1");
    expect(ids[36]).toBe("g8-l13-1");
    expect(ids[40]).toBe("g8-l14-1");
    expect(ids[42]).toBe("g8-l15-1");
    expect(ids[46]).toBe("g8-l16-1");
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

  it("خلوصِ لاتین: گزینه‌ها همگی لاتین؛ ساقه‌ها لاتین به‌جز بانک‌های ۳ و ۶ و ۱۲ و ۱۴ (ساقهٔ فارسیِ چاپ) — بانکِ ۱۶ دورویی است (پوششِ اختصاصی در گاردِ r378)", () => {
    // \u2019 = آپاستروفِ خمیدهٔ «Sunday’s» — کوئیرکِ verbatimِ چاپ (رسید: printQuirks)
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019]+$/;
    for (const b of g8.lessons)
      for (const it of b.questions) {
        if (b.lesson === 16) continue; // بانکِ دوطرفهٔ جدولِ ترجمه — گاردِ r378
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
        if (b.lesson !== 3 && b.lesson !== 6 && b.lesson !== 12 && b.lesson !== 14 && b.lesson !== 19) {
          expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        }
      }
  });

  it("هیچ آیتمی از سکشن/آیتم‌های مستثنی نشت نکرده است", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "Are you good at swimming", // س۵ ص۳۵ تصویری
      "Can he ride a bicycle", // س۵ ص۳۵ تصویری
      "اصطلاح مربوط به هر تصویر", // س۱ ص۳۵/ص۴۱ تصویری
      "برای هر تصویر", // س۴ ص۴۱ تصویری
      "sore eyes – fever", // بانکِ س۴ ص۴۱ (تصویری-کلید)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });
});
