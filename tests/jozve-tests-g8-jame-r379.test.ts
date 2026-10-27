/**
 * r379 — گاردِ خانوادهٔ هشتمِ کارتِ تستِ پایهٔ هشتم (بیرونِ نقشهٔ درس‌به‌درس):
 * «نمونه سؤالات امتحانی ترم اول و دوم» (جلدِ pdf-p73) — آزمونِ چاپیِ دارایِ لایهٔ
 * «آزمون پایانی نیمسال دوم» (pdf-p89-91) → ۳ بانکِ تازه/۱۸ آیتم در tests-g8.json
 * (مجموع: ۱۹ بانک/۷۰ آیتم — نقشهٔ g8familyMap اکنون ۸/۸)
 *
 * نکاتِ راند: (۱) کشفِ راند — سربرگِ تک‌خطیِ «نمونه سواالت امتحانی ترم اول و دوم» در ص۷۳
 * با جست‌وجوی دوسطریِ درس‌ها (الگویِ r373) نمی‌گرفت چون «درس» ندارد؛ ص۷۴-۸۸ اسکنِ
 * تصویری‌اند و تنها آزمونِ لایه‌دارِ خانواده ص۸۹-۹۱ است (۵ سکشن/۱۰ نمره/۶۰ دقیقه —
 * طراح: حسن لطفی، دبیرستان هشت شهریور بوکان، ۱۴۰۱-۱۴۰۰).
 * (۲) ل۱۷: هشت MCQِ سه‌گزینه‌ای با نشانه‌های A/B/C درون‌خطی/خطِ جدا (الگویِ RTL)؛ چاپ
 * سه کلیدِ پیاپیِ C/C/C (South/England/can) داشت که با چرخشِ q4/q5/q6 منحل شد —
 * گزینه‌ها همان سه‌تاییِ چاپِ هر آیتم‌اند، فقط چینش.
 * (۳) ل۱۸: متنِ ۵ بلنکه با بانکِ ۵ برچسبِ چاپیِ تصاویر (mechanic/chess/fields/backache/rainy
 * — رندر-فقط) با لنگرهای درس‌درون (ص۴۰ ناهماهنگ / ص۳۵ ردیفِ chess / ص۴۳-۵۴ fields / ص۳۶ backache ستاره‌دار / ص۵۱ rainy ستاره‌دار).
 * (۴) ل۱۹: جدولِ درک‌متنِ «Tom Anderson» — گزینه‌ها از پنج سلولِ خودِ متن با یک‌نقش‌به‌خانه
 * (الگویِ r378-بانک۱۶)؛ ساقه‌ها متنِ لاتین + درخواستِ فارسیِ خانه — استثنایِ ششمِ خلوصِ لاتین.
 * (۵) س۱/س۳ تصویری با داوریِ کاملِ رندر مستثنی شدند؛ ص۷۴-۸۸ اسکنِ خارجِ لایه در رسید ثبت شد.
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

const rec = g8.source.g8jame as {
  extractedRound: string; section: string; examPages: string; examMeta: string; keyPages: string;
  sectionsTotal: number; sectionsExtracted: number; sectionsSkipped: number;
  items: number; bankCounts: number[]; optionRotation: string; keyPolicy: string; engineNote: string;
  derivedKeys: Record<string, string[]>; anchorPages: Record<string, number>;
  skippedSections: string[]; printQuirks: string[]; scansNote: string;
};
const map = g8.source.g8familyMap as {
  extractedRound: string; lastUpdatedRound?: string;
  families: { lesson: string; pdfPage: number; round: string | null; status: string }[];
  note: string;
};

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r379) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p89 = slicePage(89);
const p90 = slicePage(90);
const p91 = slicePage(91);
const cellSplit = (l: string) => l.trim().split(/\s{2,}/).filter(Boolean);
const normStem = (raw: string) =>
  raw.replace(/\s{2,}/g, " ").replace(/[….]{4,}/g, "-------");

describe("r379 — رسیدِ g8jame و نقشهٔ خانواده‌ها (۸/۸)", () => {
  it("رسید: r379، جلدِ ص۷۳ + آزمونِ چاپیِ ص۸۹-۹۱، ۵ سکشن/۳ استخراج/۲ مستثنی، ۱۸ آیتم در [8,5,5]", () => {
    expect(rec.extractedRound).toBe("r379");
    expect(rec.section).toContain("ترم اول و دوم");
    expect(rec.examPages).toContain("pdf-p73");
    expect(rec.examPages).toContain("pdf-p89-91");
    expect(rec.examPages).toContain("ص۷۴-۸۸");
    expect(rec.examMeta).toContain("آزمون پایانی نیمسال دوم");
    expect(rec.examMeta).toContain("حسن لطفی");
    expect(rec.examMeta).toContain("هشت شهریور");
    expect(rec.examMeta).toContain("۱۴۰۱-۱۴۰۰");
    expect(rec.examMeta).toContain("۶۰ دقیقه");
    expect(rec.sectionsTotal).toBe(5);
    expect(rec.sectionsExtracted).toBe(3);
    expect(rec.sectionsSkipped).toBe(2);
    expect(rec.items).toBe(18);
    expect(rec.bankCounts).toEqual([8, 5, 5]);
    expect(rec.keyPolicy).toContain("there is");
    expect(rec.engineNote).toContain("پنج‌گزینه‌ای");
    expect(rec.derivedKeys.S2).toEqual([
      "It is hot", "I have a headache", "It is in the South.", "He is from England",
      "Yes, I can", "I play football as a hobby", "On Mondays", "there is",
    ]);
    expect(rec.derivedKeys.S4).toEqual(["mechanic", "rainy", "fields", "chess", "backache"]);
    expect(rec.derivedKeys.S5).toEqual(["Tom Anderson", "Spanish", "swimming", "12", "read books"]);
    expect(rec.skippedSections).toHaveLength(3);
    expect(rec.skippedSections.some((s) => s.includes("ضربدر"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("آشپز"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("OCR"))).toBe(true);
  });

  it("چرخشِ ضدِ سه‌کلیدِ پیاپی مستند + لنگرهای پنج‌واژه‌ایِ س۴ با صفحاتِ لایه", () => {
    expect(rec.optionRotation).toContain("C/C/C");
    expect(rec.optionRotation).toContain("[0,1,2,1,0,2,0,1]");
    expect(rec.optionRotation).toContain("[2,0,4,1,3]");
    expect(rec.optionRotation).toContain("[0,4,3,2,1]");
    expect(rec.anchorPages).toEqual({ mechanic: 40, chess: 35, fields: 54, backache: 36, rainy: 51 });
  });

  it("کوئیرک‌های چاپی: «جمالت»، «plying»، بی‌فاصله‌های «1-There»/«4-I walk»، نقطه‌های آغازینِ RTL، ageِ کوچک، آپاستروفِ 06.00", () => {
    expect(rec.printQuirks.some((s) => s.includes("جمالت"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("plying"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("1-There"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("4-I walk"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("نقطهٔ آغازین"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("age"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("06.00"))).toBe(true);
  });

  it("نقشهٔ ۸ خانوادهٔ g8: خانوادهٔ هشتمِ «جامعِ ترم اول و دوم» (ص۷۳) با r379 افزوده شد — null=۰", () => {
    expect(map.families).toHaveLength(8);
    expect(map.families.map((f) => f.pdfPage)).toEqual([18, 27, 35, 41, 50, 60, 72, 73]);
    expect(map.families[7].lesson).toContain("جامع");
    expect(map.families[7].round).toBe("r379");
    expect(map.families[7].status).toContain("۳ بانک/۱۸ آیتم");
    expect(map.families[7].status).toContain("ص۷۴-۸۸");
    expect(map.families.filter((f) => f.round === null)).toHaveLength(0);
    expect(map.lastUpdatedRound).toBe("r379");
    expect(map.note).toContain("r369");
    expect(map.note).toContain("r379");
  });
});

describe("r379 — بازتولیدِ لایهٔ ص۸۹-۹۱ (ضدِ رونویسیِ دستی)", () => {
  it("سربرگِ آزمون در لایه: عنوان، طراح، دبیرستان، اداره‌ها و سالِ ۱۴۰۱", () => {
    const a = p89.join("\n");
    expect(a).toContain("آزمون پایانی نیمسال دوم");
    expect(a).toContain("حسن لطفی");
    expect(a).toContain("هشت شهریور");
    expect(a).toContain("آذربایجان غربی");
    expect(a).toContain("زبان انگلیسی پایه هشتم");
    expect(a).toContain("1401");
  });

  it("چهار ساقهٔ س۱ (تصویریِ مستثنی) verbatim — با «1-There» بی‌فاصله و تایپوی «plying»", () => {
    const flat = p89
      .filter((l) => l.trim().startsWith("1-There") || l.trim().startsWith("3-I watch"))
      .flatMap(cellSplit);
    expect(flat).toEqual([
      "1-There is a bridge.", "2-He can take photos.",
      "3-I watch TV in my free time.", "4-He is good at plying football.",
    ]);
  });

  it("هشت ساقهٔ س۲ verbatim از لایه (با نقطه‌چینِ چاپ) و سربرگِ دومِ «.بنویسید»", () => {
    const exp = [
      "How is the weather?................", "What's the matter?...............",
      "Where is Ahvaz?...............", "Where is he from?.............",
      "Can you play chess?.............", "What's your hobby?..............",
      "What days do you go to the library?................",
      "Is there a metro system in your city?  Yes…………….",
    ];
    const both = p89.concat(p90).join("\n");
    for (const s of exp) expect(both, s).toContain(s);
    expect(p89.some((l) => l.trim() === ".بنویسید")).toBe(true);
    expect(p89.some((l) => l.includes("از میان جوابهای داده شده"))).toBe(true);
  });

  it("بازجوشِ سه‌گزینه‌های س۲ از نشانه‌های A/B/C (درون‌خطی و خطِ جدا) — همانِ رسیدِ derivedKeys.S2", () => {
    // منطقِ تجزیه‌گرِ اسکریپت: نشانه → سطلِ فعال؛ خانهٔ بدونِ نشانه → ادامهٔ سطل
    const nums = [1, 2, 3, 4, 5, 6, 7, 8];
    const bothLines = p89.concat(p90);
    const sIdx = bothLines.findIndex((l) => l.includes("از میان جوابهای داده شده"));
    const eIdx = bothLines.findIndex((l) => l.includes("با استفاده از تصاویر"));
    const block = bothLines.slice(sIdx, eIdx);
    const stems: Record<number, string> = {};
    const frags: Record<number, string[]> = {};
    let cur: number | null = null;
    for (const l of block) {
      const t = l.trim();
      // فیلترِ سرحدیِ صفحه: مارکر/فوتر/شمارهٔ صفحه (پیوستِ p89→p90 در برشِ ترکیبی)
      if (t.startsWith("<<<PAGE") || t.includes("جزوه کامل زبان") || t.includes("دکتر حسن لطفی") || /^\d+$/.test(t) || !t)
        continue;
      const m = t.match(/^(\d)-\s+(.*)$/);
      if (m && nums.includes(Number(m[1]))) {
        cur = Number(m[1]);
        stems[cur] = m[2].trim();
        frags[cur] = [];
        continue;
      }
      if (cur !== null && t) frags[cur].push(l);
    }
    const parsed: Record<number, Record<string, string>> = {};
    for (const n of nums) {
      const buckets: Record<string, string[]> = { A: [], B: [], C: [] };
      let cursor: string | null = null;
      for (const line of frags[n])
        for (const c of cellSplit(line)) {
          const mm = c.match(/^([ABC])\)\s*(.*)$/);
          if (mm) {
            cursor = mm[1];
            if (mm[2].trim()) buckets[cursor].push(mm[2].trim());
          } else {
            expect(cursor, `${n}: orphan fragment ${c}`).not.toBeNull();
            buckets[cursor as string].push(c);
          }
        }
      parsed[n] = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.join(" ")]));
    }
    expect(parsed[1]).toEqual({ A: "It is hot", B: "It is in the west", C: "It is over there" });
    expect(parsed[2]).toEqual({ A: "I am from Tehran", B: "I have a headache", C: "I go to school" });
    expect(parsed[3]).toEqual({ A: "It is hot in summer", B: "It is rainy", C: "It is in the South." });
    expect(parsed[4]).toEqual({ A: "He is a mechanic", B: "He can draw", C: "He is from England" });
    expect(parsed[5]).toEqual({ A: "Yes, I am", B: "Yes, he is", C: "Yes, I can" });
    expect(parsed[6]).toEqual({ A: "I play football as a hobby", B: "I am good", C: "I can search the web" });
    expect(parsed[7]).toEqual({ A: "On Mondays", B: "At 06.00 o'clock", C: "In the morning" });
    expect(parsed[8]).toEqual({ A: "It is", B: "there is", C: "there are" });
    // ساقه‌های نرمال‌شده = ساقه‌های بانکِ ۱۷
    for (const n of nums)
      expect(normStem(stems[n])).toBe(L(17).questions[n - 1].question);
  });

  it("چهار ساقهٔ س۳ (تصویریِ مستثنی) + سربرگش در ص۹۰", () => {
    const s = p90.findIndex((l) => l.includes("با استفاده از تصاویر"));
    const e = p90.findIndex((l) => l.includes("متن زیر دارای تصاویری"));
    const seg = p90.slice(s, e);
    expect(seg.some((l) => l.includes("به سواالت زیر جواب دهید"))).toBe(true);
    const flat = seg.filter((l) => /^[1-4]-\s/.test(l.trim()))
      .map((l) => l.trim().split("-").slice(1).join("-").trim());
    expect(flat).toEqual([
      "How is the weather?  It is …………………….",
      "What do you do as a hobby?  I ………………………………",
      "Is he good at playing tennis?  No, he is good at……………………….",
      "He has a Flu. He should………………………….",
    ]);
  });

  it("پنج ساقهٔ س۴ verbatim + سربرگش؛ نرمالِ نقطه‌چینِ مختلط به «-------»", () => {
    const s = p90.findIndex((l) => l.includes("متن زیر دارای تصاویری"));
    const seg = p90.slice(s);
    expect(seg.some((l) => l.includes("کلمات مناسب را در جاهای خالی بگذارید"))).toBe(true);
    const flat = seg.filter((l) => /^[1-5]-/.test(l.trim()))
      .map((l) => l.trim().split("-").slice(1).join("-").trim());
    expect(flat).toEqual([
      "Hello. I am Ali. I am a …………...………………. and I am from Iran.",
      "It is a ……………………. and cloudy country in winter.",
      "there are many ………………......, restaurant and famous buildings.",
      "I walk in a park in my free time. I play …………….………... as a hobby.",
      "Today, I have a ………...……………… and I should rest at home.",
    ]);
    const norm = flat.map(normStem);
    expect(norm).toEqual(L(18).questions.map((it) => it.question));
  });

  it("متنِ سه‌خطیِ س۵ و پنج ستونِ جدول — بازجوشِ متن = متنِ ساقه‌های بانکِ ۱۹", () => {
    expect(p91.some((l) => l.includes("جدول زیر را با توجه به متن کامل کنید"))).toBe(true);
    const pas = p91
      .filter((l) => l.trim().startsWith("Hi. My name is Tom") ||
        l.trim().startsWith("student. I can search") || l.trim().startsWith("time. I like swimming"))
      .map((l) => l.trim().replace(/\s{2,}/g, " ")).join(" ");
    expect(pas).toBe(
      "Hi. My name is Tom Anderson. I am 12 years old. I am Spanish. I am a " +
      "student. I can search the Web very well. I usually read books in my free " +
      "time. I like swimming as my hobby.",
    );
    const i = p91.findIndex((l) => l.trim() === "Name");
    const cols = p91.slice(i, i + 8).map((l) => l.trim()).filter(Boolean).slice(0, 5);
    expect(cols).toEqual(["Name", "Nationality", "Hobby", "age", "Free time"]);
    for (const it of L(19).questions) expect(it.question.startsWith(pas + " — «")).toBe(true);
  });

  it("لنگرهای پنج‌واژه‌ایِ س۴ روی صفحاتِ رسید (ناهماهنگِ ص۴۰ / ردیفِ chess ص۳۵ / fields ص۵۴ / backache* ص۳۶ / rainy* ص۵۱)", () => {
    const pg = (p: number) => slicePage(p).join("\n");
    expect(pg(40)).toContain("school – backache – mechanic – zucchini");
    expect(pg(35)).toContain("Speak – read – type – chess");
    expect(pg(54)).toContain("Are there any fields?");
    expect(pg(36)).toMatch(/backache\*/);
    expect(pg(51)).toMatch(/rainy\*/);
  });
});

describe("r379 — بانک ۱۷ (جامع/س۲): هشت MCQِ سه‌گزینه‌ای با چرخشِ ضدِ سه‌کلیدِ پیاپی", () => {
  const bank = L(17);

  it("عنوان و شکل: سه‌گزینه‌ای، ۸ آیتم، بدونِ تایپی", () => {
    expect(bank.title).toContain("امتحانی جامع");
    expect(bank.title).toContain("ص۸۹");
    expect(bank.level).toBe("سه‌گزینه‌ای");
    expect(bank.count).toBe(8);
    for (const it of bank.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
      expect(it.options.length).toBe(3);
      expect(new Set(it.options).size).toBe(3);
    }
  });

  it("ساقه‌ها نقطه‌چینِ چاپ → «-------» چسبیده؛ ساقهٔ ق۸ «Yes-------» میانی", () => {
    expect(bank.questions.map((it) => it.question)).toEqual([
      "How is the weather?-------",
      "What's the matter?-------",
      "Where is Ahvaz?-------",
      "Where is he from?-------",
      "Can you play chess?-------",
      "What's your hobby?-------",
      "What days do you go to the library?-------",
      "Is there a metro system in your city? Yes-------",
    ]);
  });

  it("گزینه‌های هر آیتم همان سه‌تاییِ چاپ است (برابرِ مجموعه با بازجوشِ لایه) با کلیدهای [0,1,2,1,0,2,0,1]", () => {
    const printSets = [
      ["It is hot", "It is in the west", "It is over there"],
      ["I am from Tehran", "I have a headache", "I go to school"],
      ["It is hot in summer", "It is rainy", "It is in the South."],
      ["He is a mechanic", "He can draw", "He is from England"],
      ["Yes, I am", "Yes, he is", "Yes, I can"],
      ["I play football as a hobby", "I am good", "I can search the web"],
      ["On Mondays", "At 06.00 o'clock", "In the morning"],
      ["It is", "there is", "there are"],
    ];
    bank.questions.forEach((it, i) => {
      expect([...it.options].sort(), it.id).toEqual([...printSets[i]].sort());
    });
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 1, 2, 1, 0, 2, 0, 1]);
    expect(keyed(17)).toEqual(rec.derivedKeys.S2);
    // بدونِ دوکلیدِ پیاپی
    for (let i = 1; i < bank.questions.length; i++)
      expect(bank.questions[i].answer).not.toBe(bank.questions[i - 1].answer);
    // ق۷ و ق۸ با ترتیبِ چاپ (A/A و A/B)
    expect(bank.questions[6].options).toEqual(printSets[6]);
    expect(bank.questions[7].options).toEqual(printSets[7]);
  });
});

describe("r379 — بانک ۱۸ (جامع/س۴): تکمیل متن با بانکِ ۵ برچسبِ چاپیِ تصاویر", () => {
  const bank = L(18);
  const POOL = ["mechanic", "chess", "fields", "backache", "rainy"];

  it("عنوان و شکل: پنج‌گزینه‌ای، ۵ آیتم، هر گزینه‌مجموع = کلِ بانک", () => {
    expect(bank.title).toContain("بانک تصویری");
    expect(bank.title).toContain("ص۹۰");
    expect(bank.level).toBe("پنج‌گزینه‌ای");
    expect(bank.count).toBe(5);
    for (const it of bank.questions) {
      expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
      expect(it.options.length).toBe(5);
      expect([...it.options].sort(), it.id).toEqual([...POOL].sort());
    }
  });

  it("کلیدها به ترتیبِ خانه‌های متن [mechanic,rainy,fields,chess,backache] با اندیس‌های [2,0,4,1,3] — پنج‌چینشِ متمایز", () => {
    expect(keyed(18)).toEqual(["mechanic", "rainy", "fields", "chess", "backache"]);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 0, 4, 1, 3]);
    expect(new Set(bank.questions.map((it) => it.options.join("|"))).size).toBe(5);
  });

  it("یکتاییِ کلیدِ هر بلنک با دستورِ گرامری/معنایی (شغل/آب‌وهوا/مکان/بازی/بیماری) در رسید", () => {
    expect(rec.keyPolicy).toContain("a/mechanic");
    expect(rec.keyPolicy).toContain("rainy");
    expect(rec.keyPolicy).toContain("play/chess");
    expect(rec.keyPolicy).toContain("have a/backache");
  });
});

describe("r379 — بانک ۱۹ (جامع/س۵): جدولِ درک‌متن با گزینه‌های هم‌متنِ یک‌نقش‌به‌خانه", () => {
  const bank = L(19);
  const UNIVERSE = ["Tom Anderson", "Spanish", "swimming", "12", "read books"];

  it("عنوان و شکل: پنج‌گزینه‌ای، ۵ آیتم، گزینه‌ها = کلِ پنج سلولِ متن", () => {
    expect(bank.title).toContain("درک‌متن");
    expect(bank.title).toContain("ص۹۱");
    expect(bank.level).toBe("پنج‌گزینه‌ای");
    for (const it of bank.questions) {
      expect(it.options.length).toBe(5);
      expect([...it.options].sort(), it.id).toEqual([...UNIVERSE].sort());
    }
  });

  it("پنج ساقه = پنج ستونِ چاپ به ترتیبِ لایه؛ کلیدها همان پنج سلول با اندیس‌های [0,4,3,2,1]", () => {
    const cols = bank.questions.map((it) => it.question.match(/«(.+?)» در جدولِ متن/)![1]);
    expect(cols).toEqual(["Name", "Nationality", "Hobby", "age", "Free time"]);
    expect(keyed(19)).toEqual(UNIVERSE);
    expect(bank.questions.map((it) => it.answer)).toEqual([0, 4, 3, 2, 1]);
    expect(new Set(bank.questions.map((it) => it.options.join("|"))).size).toBe(5);
  });

  it("شکلِ ثابتِ ساقهٔ دوبخشیِ لاتین+فارسی (استثنایِ ششمِ خلوصِ لاتین — پوششِ اختصاصی همین گارد)", () => {
    const re = /^Hi\. My name is Tom Anderson\. .+ — «(Name|Nationality|Hobby|age|Free time)» در جدولِ متن: -------$/;
    for (const it of bank.questions)
      expect(it.question, it.id).toMatch(re);
  });
});

describe("r379 — پیمان‌های سراسریِ فایل (پس از الحاقِ سه بانک)", () => {
  it("شکلِ فایل: ۱۹ بانک/[4,3,3,2,5,3,1,4,4,4,2,1,4,2,4,6,8,5,5]/۷۰ id یکتا — ids[52]=g8-l17-1 و ids[69]=g8-l19-5", () => {
    expect(g8.lessons).toHaveLength(19);
    expect(g8.lessons.map((l) => l.count)).toEqual(
      [4, 3, 3, 2, 5, 3, 1, 4, 4, 4, 2, 1, 4, 2, 4, 6, 8, 5, 5],
    );
    const ids = g8.lessons.flatMap((b) => b.questions.map((q) => q.id));
    expect(ids).toHaveLength(70);
    expect(new Set(ids).size).toBe(70);
    expect(ids[52]).toBe("g8-l17-1");
    expect(ids[59]).toBe("g8-l17-8");
    expect(ids[60]).toBe("g8-l18-1");
    expect(ids[64]).toBe("g8-l18-5");
    expect(ids[65]).toBe("g8-l19-1");
    expect(ids[69]).toBe("g8-l19-5");
    for (const b of g8.lessons) expect(b.count).toBe(b.questions.length);
  });

  it("نشت‌سنجِ سکشن‌های تصویریِ مستثنی: ساقه‌های س۱/س۳ و کلیدهای داوری (snowy/cooking) غایب‌اند", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "There is a bridge.", "He can take photos.", "plying football", // چهار ساقهٔ س۱ (ساقهٔ کامل — «take photo*» خودِ واژهٔ ستاره‌دارِ درس ۲ است)
      "باتوجه به تصاویر", "با استفاده از تصاویر", // سربرگ‌های تصویری
      "No, he is good at", "He has a Flu", // ساقه‌های س۳ (کلیدهای داوریِ snowy/cooking عامِ جزوه‌اند — l15/l19 خودشان دارند؛ نشت‌سنج فقط نشانهٔ انحصاری می‌خواهد)
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("خلوصِ لاتینِ بانک‌های تازه: ل۱۷/ل۱۸ ساقه‌وگزینهٔ لاتینِ خالص؛ ل۱۹ فقط گزینه‌های لاتین (ساقهٔ دوبخشی در گاردِ خودش)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192\u2019]+$/;
    for (const it of L(17).questions) {
      expect(latinPunct.test(it.question), `q17 stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `q17 option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(18).questions) {
      expect(latinPunct.test(it.question), `q18 stem ${it.id}`).toBe(true);
      for (const o of it.options) expect(latinPunct.test(o), `q18 option ${it.id}: ${o}`).toBe(true);
    }
    for (const it of L(19).questions)
      for (const o of it.options) expect(latinPunct.test(o), `q19 option ${it.id}: ${o}`).toBe(true);
  });

  it("هر ۱۸ آیتمِ تازه MCQ بدونِ تایپی‌اند (قراردادِ r363)", () => {
    for (const bn of [17, 18, 19])
      for (const it of L(bn).questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
      }
  });
});
