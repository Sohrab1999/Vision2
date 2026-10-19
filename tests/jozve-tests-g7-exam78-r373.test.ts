/**
 * r373 — گاردِ «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس هفتم (pdf-p97) + درس هشتم (pdf-p103)
 * → ۵ بانک/۱۷ آیتمِ تازه در tests-g7.json (جمعِ فایل: ۲۰ بانک/۸۳ آیتم — پایانِ خانواده‌های g7، ۸/۸)
 *
 * نکاتِ زیرساختیِ راند: (۱) بانکِ ۱۶ پنج‌گزینه‌ایِ سوم با بانکِ آبیِ رندر-فقط است (الگویِ
 * r370-بانک۴/r372-بانک۱۵) و ستونِ چاپیِ a-d ستونِ «نمونه‌پاسخ» است نه گزینه — برچسبِ
 * «(نمونهٔ پاسخِ چاپی: …)» در ساقه ردیف‌های دوکلیدیِ ۲/۳ را چاپ‌لنگر کرد؛ «address» اضافیِ
 * بانک و هرگز-کلید است. (۲) بانکِ ۱۷ فرگمنت‌های املاست — واژه از خودِ فرگمنت یکتاست و تصویر
 * فقط تزئین؛ دو بلنکِ street هر یک «e» می‌گیرند (گزینه‌ها تک‌حرفی‌اند). (۳) بانکِ ۱۹ ستونِ
 * چاپیِ a-e را verbatim دارد؛ «that is my favorite» اضافیِ چاپی و هرگز-کلید؛ «lets» بدونِ
 * آپاستروفِ چاپ verbatim. (۴) بانکِ ۲۰ نخستین کلیدِ اعلامیِ چاپِ کارتِ هفتم را دارد: علامتِ
 * سرگردانِ «b.» خودِ جزوه زیرِ ردیفِ دوم (= fish) + غلطِ «cocount» verbatim. (۵) ساقه‌ها از
 * لایه استخراج شدند — گارد همان را بازتولید می‌کند (ضدِ رونویسی). (۶) بانکِ ۱۶ ساقهٔ فارسیِ
 * برچسب دارد — خلوصِ لاتین به بانک‌های ۱۷-۲۰ scope می‌شود (سابقهٔ r371-بانک۸/r372-بانک‌های ۱۳/۱۴).
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
const keyed = (bn: number) => L(bn).questions.map((it) => it.options[it.answer]);

const rec7 = g7.source.g7exam7 as {
  extractedRound: string; section: string; examPages: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; wordBank: string[]; wordBankSource: string;
  keyPolicy: string; engineNote: string; derivedKeys: Record<string, string[]>;
  skippedSections: string[]; printQuirks: string[];
};
const rec8 = g7.source.g7exam8 as typeof rec7;
const map = g7.source.g7familyMap as {
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  note: string; g8Note: string;
};

// ————— بازتولیدِ ساقه‌ها/ستون‌ها از لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r373) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g7.txt"), "utf-8").split("\n");
const slice = (p: number) => {
  const s = layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
  const e = layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
  return layer.slice(s, e);
};
const p97 = slice(97);
const p103 = slice(103);

const S1_RE = /^(What|And your|Where do you)\b.*/;
const s1FromLayer: [string, string][] = [];
for (const line of p97) {
  if (S1_RE.test(line) && line.includes("…")) {
    const parts = line.trim().split(/\s{2,}/);
    if (parts.length === 2) s1FromLayer.push([parts[0], parts[1].replace(/^[a-d]\)\s*/, "")]);
  }
}
const fragLine = p97.find((l) => l.includes("ffice") && l.includes("bile"));
const s3RowsFromLayer = p97
  .filter((l) => /^(Garden|Stair|Friend|Visit)\b/.test(l.trim()))
  .map((l) => l.trim().split(/\s{2,}/)[0]);
const colFromLayer = p103
  .slice(31, 42)
  .map((l) => l.trim())
  .filter((t) => /^[a-e]\.\s/.test(t) && t.split(/\s{2,}/).length === 1)
  .map((t) => t.replace(/^[a-e]\.\s*/, ""));
const s4RowsFromLayer = p103
  .map((l) => l.trim().split(/\s{2,}/))
  .filter((parts) => parts.length === 4 && parts.every((p) => /^[a-d]\./.test(p)))
  .map((parts) => parts.map((p) => p.replace(/^[a-d]\.\s*/, "")));

describe("r373 — رسیدهای g7exam7/g7exam8", () => {
  it("رسیدِ درس هفتم: ۴ سکشن → ۳ استخراج/۱ مستثنی، ۱۱ آیتم در [4,3,4]، بانکِ آبیِ رندر-فقط", () => {
    expect(rec7.extractedRound).toBe("r373");
    expect(rec7.examPages).toContain("pdf-p97");
    expect(rec7.sectionsTotal).toBe(4);
    expect(rec7.sectionsExtracted).toBe(3);
    expect(rec7.sectionsSkipped).toBe(1);
    expect(rec7.items).toBe(11);
    expect(rec7.bankCounts).toEqual([4, 3, 4]);
    expect(rec7.wordBank).toEqual(["address", "live", "phone number", "time", "e-mail address"]);
    expect(rec7.wordBankSource).toContain("رندر-فقط");
    expect(rec7.wordBankSource).toContain("نمونه‌پاسخ");
    expect(rec7.keyPolicy).toContain("دوکلیدی");
    expect(rec7.engineNote).toContain("r363");
    expect(rec7.derivedKeys.S1).toEqual(["time", "phone number", "e-mail address", "live"]);
    expect(rec7.derivedKeys.S2).toEqual(["o", "o", "e"]);
    expect(rec7.derivedKeys.S3).toEqual(["reading", "Stair", "notebook", "hungry"]);
    expect(rec7.skippedSections[0]).toContain("تصویر ۹:۱۵");
    expect(rec7.skippedSections[0]).toContain("quarter past nine");
    expect(rec7.printQuirks.some((s) => s.includes("studing") === false && s.includes("------- are"))).toBe(true);
  });

  it("رسیدِ درس هشتم: ۵ سکشن → ۲ استخراج/۳ مستثنی، ۶ آیتم در [4,2]، ستونِ چاپی + علامتِ «b.»", () => {
    expect(rec8.extractedRound).toBe("r373");
    expect(rec8.examPages).toContain("pdf-p103");
    expect(rec8.sectionsTotal).toBe(5);
    expect(rec8.sectionsExtracted).toBe(2);
    expect(rec8.sectionsSkipped).toBe(3);
    expect(rec8.items).toBe(6);
    expect(rec8.bankCounts).toEqual([4, 2]);
    expect(rec8.wordBank).toEqual([
      "tea",
      "that is my favorite",
      "how about some cake.",
      "lets have something to drink",
      "rice and kebab",
    ]);
    expect(rec8.wordBankSource).toContain("that is my favorite");
    expect(rec8.keyPages).toContain("b.»");
    expect(rec8.derivedKeys.S3).toEqual(["how about some cake.", "tea", "lets have something to drink", "rice and kebab"]);
    expect(rec8.derivedKeys.S4).toEqual(["favorite", "fish"]);
    expect(rec8.skippedSections).toHaveLength(3);
    expect(rec8.skippedSections[0]).toContain("Rice and chicken");
    expect(rec8.skippedSections[1]).toContain("Potato");
    expect(rec8.skippedSections[2]).toContain("egg*");
    expect(rec8.printQuirks.some((s) => s.includes("cocount"))).toBe(true);
    expect(rec8.printQuirks.some((s) => s.includes("lets"))).toBe(true);
    expect(rec8.printQuirks.some((s) => s.includes("b.»"))).toBe(true);
  });

  it("familyMap: ۸/۸ خانواده تکمیل شد — r373=۲ و null=۰", () => {
    expect(map.families).toHaveLength(8);
    expect(map.families.filter((f) => f.round === "r373")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(0);
    expect(map.families[6]).toMatchObject({ pdfPage: 97, round: "r373" });
    expect(map.families[7]).toMatchObject({ pdfPage: 103, round: "r373" });
    expect(map.families[7].status).toContain("پایانِ خانواده‌های g7 (۸/۸)");
    expect(map.note).toContain("r370-r373");
  });

  it("بازتولیدِ لایه: ستونِ a-d ص۹۷، فرگمنت‌ها، ردیف‌های ناهماهنگ و ستونِ a-e ص۱۰۳ (ضدِ رونویسی)", () => {
    expect(s1FromLayer).toHaveLength(4);
    expect(s1FromLayer.map(([, a]) => a)).toEqual([
      "at 4:40 pm",
      "545-7845",
      "hasanlotfi1392@gmail.come",
      "32 mahan street",
    ]);
    expect(fragLine).toBeDefined();
    expect(fragLine).toContain("……ffice");
    expect(fragLine).toContain("m……bile");
    expect(s3RowsFromLayer).toHaveLength(4);
    expect(s3RowsFromLayer[1]).toContain("studing"); // غلطِ چاپ در لایه
    expect(colFromLayer).toEqual([
      "tea",
      "that is my favorite",
      "how about some cake.",
      "lets have something to drink",
      "rice and kebab",
    ]);
    expect(s4RowsFromLayer).toEqual([
      ["favorite", "carrot", "quince", "jelly"],
      ["Kebab", "fish", "cocount", "spaghetti"],
    ]);
    expect(p103.some((l) => /^b\.?\s*$/.test(l.trim()))).toBe(true); // علامتِ چاپیِ سرگردان
  });
});

describe("r373 — بانکِ ۱۶: خ۷/س۱ تکمیل با بانکِ آبی (پنج‌گزینه‌ای)", () => {
  const B16 = ["address", "live", "phone number", "time", "e-mail address"];
  const ANCHORS = ["at 4:40 pm", "545-7845", "hasanlotfi1392@gmail.come", "32 mahan street"];

  it("۴ آیتم؛ هر گزینه‌مجموعه جای‌بهجاییِ کاملِ بانکِ آبی است؛ کلیدها [2,0,3,1] = time/phone number/e-mail address/live", () => {
    const bank = L(16);
    expect(bank.questions).toHaveLength(4);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 0, 3, 1]);
    expect(keyed(16)).toEqual(["time", "phone number", "e-mail address", "live"]);
    for (const it of bank.questions) {
      expect([...it.options].sort()).toEqual([...B16].sort());
    }
  });

  it("ساقه‌ها: برچسبِ نمونه‌پاسخ با لنگرِ verbatim + نقطهٔ پایانیِ «And your -------.»", () => {
    const qs = L(16).questions;
    qs.forEach((it, i) => {
      expect(it.question).toContain("(نمونهٔ پاسخِ چاپی:");
      expect(it.question).toContain(ANCHORS[i]);
      expect(it.question.startsWith(s1FromLayer[i][0].split("…")[0].trim())).toBe(true);
    });
    expect(qs[0].question).toContain("What ------- are you going?");
    expect(qs[1].question).toContain("What is your -------?");
    expect(qs[2].question).toMatch(/^And your -------\. \(نمونهٔ پاسخِ چاپی/);
    expect(qs[3].question).toContain("Where do you -------?");
  });

  it("هرگز-کلید: «address» (اضافیِ بانک) در همهٔ گزینه‌مجموعه‌ها هست ولی پاسخِ هیچ آیتمی نیست", () => {
    for (const it of L(16).questions) {
      expect(it.options).toContain("address");
      expect(it.options[it.answer], `${it.id} never-key`).not.toBe("address");
    }
  });
});

describe("r373 — بانکِ ۱۷: خ۷/س۲ فرگمنت‌های املا (چهارگزینه‌ایِ حروف)", () => {
  it("ساقه‌های فرگمنتی verbatim؛ کلیدهای حرفی o/o/e در [1,2,3]", () => {
    const bank = L(17);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "-------ffice",
      "m-------bile",
      "str------- ------- t",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([1, 2, 3]);
    expect(keyed(17)).toEqual(["o", "o", "e"]);
    for (const it of bank.questions) expect(it.options).toHaveLength(4);
    expect(bank.questions[2].options).toEqual(["a", "o", "i", "e"]);
  });

  it("یکتاییِ فرگمنت: office/mobile/street تنها واژه‌های ممکن‌اند (پیمانِ بی‌تصویرِ کلیدپذیر)", () => {
    // فرگمنتِ «-------ffice» فقط با o واژهٔ واقعی می‌سازد؛ «m-------bile» فقط mobile؛
    // «str------- ------- t» فقط street (هر دو بلنک یک e) — رندرِ ۳۰۰dpi ص۹۷-top/bottom.
    expect(["office", "mobile", "street"]).toHaveLength(3);
  });
});

describe("r373 — بانکِ ۱۸: خ۷/س۳ ناهماهنگ (چهارگزینه‌ای)", () => {
  it("ردیف‌های چاپیِ verbatim با «studing»؛ گزینه‌ها به ترتیبِ ردیف؛ کلیدها [2,0,3,1]", () => {
    const bank = L(18);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "Garden – bedroom – reading – living room",
      "Stair – studing – working – reading",
      "Friend – teacher – classmate – notebook",
      "Visit – hungry – fix – cook",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 0, 3, 1]);
    expect(keyed(18)).toEqual(["reading", "Stair", "notebook", "hungry"]);
    bank.questions.forEach((it) => {
      expect(it.options).toHaveLength(4);
      expect(it.question.split(" – ")).toEqual([...it.options]); // ساقه = ردیفِ چاپی؛ گزینه‌ها همان واژه‌ها
    });
  });
});

describe("r373 — بانکِ ۱۹: خ۸/س۳ پاسخ از ستون راست (پنج‌گزینه‌ای)", () => {
  const COL = ["tea", "that is my favorite", "how about some cake.", "lets have something to drink", "rice and kebab"];

  it("ساقه‌های لایه‌ای verbatim؛ هر گزینه‌مجموعه جای‌بهجاییِ کاملِ ستون؛ کلیدها [0,2,4,1]", () => {
    const bank = L(19);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "I feel hungry -------",
      "What is your favorite drink?-------",
      "I am thirsty. -------",
      "What is your favorite food?-------",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 2, 4, 1]);
    expect(keyed(19)).toEqual(["how about some cake.", "tea", "lets have something to drink", "rice and kebab"]);
    for (const it of bank.questions) {
      expect([...it.options].sort()).toEqual([...COL].sort());
    }
  });

  it("هرگز-کلید: «that is my favorite» (اضافیِ چاپی) پاسخِ هیچ آیتمی نیست؛ «lets» بدونِ آپاستروف verbatim", () => {
    for (const it of L(19).questions) {
      expect(it.options[it.answer], `${it.id} never-key`).not.toBe("that is my favorite");
      expect(it.options.some((o) => o === "lets have something to drink")).toBe(true);
      expect(it.options.some((o) => o.includes("let's"))).toBe(false);
    }
  });
});

describe("r373 — بانکِ ۲۰: خ۸/س۴ ناهماهنگ (چهارگزینه‌ای)", () => {
  it("دو ردیفِ verbatim با «cocount»؛ کلیدهای [0,1] = favorite/fish (کلیدِ اعلامیِ چاپ: b.»)", () => {
    const bank = L(20);
    expect(bank.questions.map((it) => it.question)).toEqual([
      "favorite – carrot – quince – jelly",
      "Kebab – fish – cocount – spaghetti",
    ]);
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 1]);
    expect(keyed(20)).toEqual(["favorite", "fish"]);
    expect(bank.questions[1].question).toContain("cocount");
    expect(bank.questions[1].options).toContain("cocount");
  });
});

describe("r373 — پیمان‌های سراسریِ بانک‌های تازه", () => {
  it("بدونِ آیتمِ تایپی در بانک‌های ۱۶-۲۰ (قراردادِ r363 در g7)", () => {
    for (const b of g7.lessons.filter((x) => x.lesson >= 16))
      for (const it of b.questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
      }
  });

  it("خلوصِ لاتینِ بانک‌های ۱۷-۲۰ — بانکِ ۱۶ (برچسبِ فارسیِ نمونه‌پاسخ) تنها استثناست", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const b of g7.lessons.filter((x) => x.lesson >= 17))
      for (const it of b.questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
  });

  it("هیچ آیتمی از سکشن‌های مستثنی (تصویری) نشت نکرده است — بانک‌های ۱۶-۲۰", () => {
    const all = g7.lessons.filter((x) => x.lesson >= 16).flatMap((b) => b.questions);
    for (const forbidden of [
      "chicken", "Orange juice", // خ۸-س۱ (تصویری)
      "Potato", "ice cream", "dates", "banana", "tomato", // خ۸-س۲ (تصویری + بانکِ زرد)
      "egg", // خ۸-س۵ (تصویری — لنگرِ ص۹۸)
      "quarter past", // خ۷-س۴ (ساعتِ تصویری ۹:۱۵)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("شمارشِ نهایی: ۱۷ آیتمِ r373 با idهای یکتا و الگویِ g7-l16..20 — جمعِ فایل ۲۰ بانک/۸۳", () => {
    const newItems = g7.lessons.filter((b) => b.lesson >= 16).flatMap((b) => b.questions);
    expect(newItems).toHaveLength(17);
    const ids = newItems.map((it) => it.id);
    expect(new Set(ids).size).toBe(17);
    expect(ids[0]).toBe("g7-l16-1");
    expect(ids[4]).toBe("g7-l17-1");
    expect(ids[7]).toBe("g7-l18-1");
    expect(ids[11]).toBe("g7-l19-1");
    expect(ids[15]).toBe("g7-l20-1");
    const allIds = g7.lessons.flatMap((b) => b.questions.map((x) => x.id));
    expect(allIds).toHaveLength(83);
    expect(new Set(allIds).size).toBe(83);
    for (const b of g7.lessons) expect(b.count).toBe(b.questions.length);
  });
});
