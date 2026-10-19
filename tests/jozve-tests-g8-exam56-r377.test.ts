/**
 * r377 — گاردِ جفتِ خانوادهٔ پنجم و ششمِ کارتِ تستِ پایهٔ هشتم:
 * «نمونه سؤالات امتحانی درس پنجم» (pdf-p50) + «درس ششم» (pdf-p60)
 * → ۳ بانکِ تازه/۱۰ آیتم در tests-g8.json (مجموع: ۱۵ بانک/۴۶ آیتم)
 *
 * نکاتِ راند: (۱) بانکِ ۱۳ فرگمنت‌های لایه‌ایِ شکل‌یگانه دارد (برخلافِ r376-بانک۱۰ که
 * رندر-فقط بود) — شکلِ هر فرگمنت در کلِ گزینه‌ها یگانه است (قفلِ regexی)؛ فرگمنتِ اول
 * با A بزرگ چاپ («Airp – rt») و آخری با hyphen ساده («pal - ce») — هر دو verbatim.
 * (۲) بانکِ ۱۴ پرسشِ صِ چاپیِ س۴ ص۵۰ را به «ذ» وارونه می‌کند (۷ واژهٔ چاپی = ۵ ص + ۲ ذ —
 * پرسشِ ص تک‌کلیدی نمی‌شود)؛ هر دو کلید چاپ‌لنگردارند: brother در فهرستِ ذِ ص۵۹، this
 * دوبل (دیالوگِ ص۵۶ + فهرستِ ص۵۹)؛ South در هر دو سؤال تکرار می‌شود (تنها راهِ
 * چهارگزینه‌کردن از ۷ واژه — در رسیدِ engineNote/keyPolicy مستند).
 * (۳) بانکِ ۱۵ چهار ناهماهنگِ verbatimِ ص۶۰ با تایپوی چاپیِ «einter» (winter) در ساقه —
 * و «winter» نباید در هیچ‌جای فایل باشد. story* ص۶۱ لنگرِ بین‌درسی (الگویِ r376-morning*).
 * (۴) چهار سکشنِ تصویریِ مستثنی (س۱/س۳ ص۵۰ و س۱/س۲ ص۶۰) — بانک‌های واژه‌شان در لایه چاپ‌اند
 * ولی هیچ‌کدام نباید در آیتم‌ها نشت کرده باشند (ازجمله بانکِ قطب‌نما و «Suuny»).
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

const rec = g8.source.g8exam56 as {
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

// ————— بازتولیدِ لایه (ضدِ رونویسیِ دستی — همان منطقِ اسکریپتِ r377) —————
const layer = fs.readFileSync(path.join(process.cwd(), "booklet-extract/g8.txt"), "utf-8").split("\n");
const pgStart = (p: number) => layer.findIndex((l) => l.trim() === `<<<PAGE ${p}>>>`);
const pgEnd = (s: number) => layer.findIndex((l, i) => i > s && l.trim().startsWith("<<<PAGE"));
const slicePage = (p: number) => {
  const s = pgStart(p);
  return layer.slice(s, pgEnd(s));
};
const p50 = slicePage(50);
const p60 = slicePage(60);
const head50 = layer.slice(0, pgStart(50)).join("\n");           // لنگرهای ص۴۲/۴۳
const mid5060 = layer.slice(pgStart(50), pgStart(60)).join("\n"); // ص۵۰-۵۹ (لنگرهای درس ششم + تلفظ)
const after60 = layer.slice(pgStart(60)).join("\n");             // ص۶۰ به بعد (story* ص۶۱)

describe("r377 — رسیدِ g8exam56 و نقشهٔ خانواده‌ها", () => {
  it("رسید: r377، دو صفحهٔ ۵۰/۶۰، ۷ سکشن/۳ استخراج/۴ مستثنی، ۱۰ آیتم در [4,2,4]", () => {
    expect(rec.extractedRound).toBe("r377");
    expect(rec.section).toContain("درس پنجم");
    expect(rec.section).toContain("درس ششم");
    expect(rec.examPages).toContain("pdf-p50");
    expect(rec.examPages).toContain("pdf-p60");
    expect(rec.sectionsTotal).toBe(7);
    expect(rec.sectionsExtracted).toBe(3);
    expect(rec.sectionsSkipped).toBe(4);
    expect(rec.items).toBe(10);
    expect(rec.bankCounts).toEqual([4, 2, 4]);
    expect(rec.wordBank).toEqual(["South", "brother", "math", "three", "toothache", "thirty", "this"]);
    expect(rec.keyPolicy).toContain("وارونه");
    expect(rec.engineNote).toContain("Airp");
    expect(rec.derivedKeys["S2-l5"]).toEqual(["airport", "cinema", "shrine", "palace"]);
    expect(rec.derivedKeys["S4-l5"]).toEqual(["brother", "this"]);
    expect(rec.derivedKeys["S3-l6"]).toEqual(["weather", "River", "story", "hot"]);
    expect(rec.skippedSections).toHaveLength(4);
    expect(rec.skippedSections.some((s) => s.includes("قطب‌نما"))).toBe(true);
    expect(rec.skippedSections.some((s) => s.includes("Suuny"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("einter"))).toBe(true);
    expect(rec.printQuirks.some((s) => s.includes("Suuny"))).toBe(true);
  });

  it("نقشهٔ ۷ خانوادهٔ g8 — r377=۲ (درس پنجم/ششم) و null=۱ (فقط درس هفتم pdf-p72)", () => {
    expect(map.families).toHaveLength(7);
    expect(map.families.map((f) => f.pdfPage)).toEqual([18, 27, 35, 41, 50, 60, 72]);
    expect(map.families.filter((f) => f.round === "r377")).toHaveLength(2);
    expect(map.families.filter((f) => f.round === null)).toHaveLength(1);
    expect(map.families[4].round).toBe("r377");
    expect(map.families[5].round).toBe("r377");
    expect(map.families[6].round).toBe(null);
    expect(map.lastUpdatedRound).toBe("r377");
    expect(map.families[4].status).toContain("۲ بانک/۶ آیتم");
    expect(map.families[5].status).toContain("۱ بانک/۴ آیتم");
    expect(map.note).toContain("r369");
  });
});

describe("r377 — بانک ۱۳ (خ۵/س۲): فرگمنت‌های لایه‌ایِ شکل‌یگانه", () => {
  const bank = L(13);

  it("چهار فرگمنتِ verbatimِ لایه — ساقه‌ها دقیقاً خطِ چاپِ ص۵۰ (با A بزرگ و hyphenِ آخر)", () => {
    const fragLine = p50.find((l) => l.includes("Airp")) ?? "";
    const frags = fragLine.trim().split(/\s{2,}/).filter(Boolean);
    expect(frags).toEqual(["Airp – rt", "cin – ma", "shr – ne", "pal - ce"]);
    expect(bank.questions.map((it) => it.question)).toEqual(frags);
  });

  it("قفلِ شکل: فرگمنتِ هر سؤال در گزینه‌های خودش دقیقاً کلیدش را می‌سازد و در کلِ چهارواژهٔ سکشن یگانه است", () => {
    const shapes = [
      [/^airp[a-z]{0,2}rt$/, "airport"],
      [/^cin[a-z]{0,2}ma$/, "cinema"],
      [/^shr[a-z]{0,2}ne$/, "shrine"],
      [/^pal[a-z]{0,2}ce$/, "palace"],
    ] as const;
    const sectionWords = ["airport", "cinema", "shrine", "palace"];
    for (const [rx, word] of shapes)
      expect(sectionWords.filter((w) => rx.test(w))).toEqual([word]);
    bank.questions.forEach((it, i) => {
      const [rx, word] = shapes[i];
      expect(it.options[it.answer]).toBe(word);
      expect(it.options.filter((o) => rx.test(o.toLowerCase())), `${it.id}`).toEqual([word]);
    });
  });

  it("کلیدها airport/cinema/shrine/palace با لنگرِ ستاره‌دارِ واژگانِ درس پنجم (ص۴۲/۴۳)", () => {
    expect(keyed(13)).toEqual(["airport", "cinema", "shrine", "palace"]);
    for (const anchor of [/airport\*/, /cinema\*/, /shrine\*/, /south\*/])
      expect(head50).toMatch(anchor);
    expect(head50).toMatch(/palace\*/);
  });

  it("گزینه‌های هر سؤال دقیقاً چهار واژهٔ خودِ سکشن‌اند (بی‌واژهٔ بیرونی — بی‌tape/airport-proxy)", () => {
    for (const it of bank.questions) expect([...it.options].sort()).toEqual(["airport", "cinema", "palace", "shrine"]);
    expect(bank.questions.map((it) => it.answer)).toEqual([2, 0, 3, 1]);
  });
});

describe("r377 — بانک ۱۴ (خ۵/س۴): دو تلفظِ وارونه‌شدهٔ th به «ذ»", () => {
  const bank = L(14);
  const STEM = "در کدام کلمه حرف th صدای \"ذ\" می دهد.";

  it("ساقهٔ فارسیِ وارونه‌شده در هر دو آیتم — و ساقهٔ سه‌خطیِ چاپِ ص۵۰ در لایه بازتولید می‌شود", () => {
    expect(bank.questions.map((it) => it.question)).toEqual([STEM, STEM]);
    const i4 = p50.findIndex((l) => l.includes("حرفth"));
    const three = p50.slice(i4, i4 + 6).map((l) => l.trim()).filter(Boolean).slice(0, 3);
    expect(three.join(" ")).toContain("حرفth");
    expect(three.join(" ")).toContain("صدای");
    expect(three.join(" ")).toContain("می دهد");
    expect(p50.slice(i4, i4 + 6).join(" ")).toContain("ص"); // پرسشِ چاپی «ص» است — وارونه‌سازیِ مستند
  });

  it("کلیدها brother/this — هر دو چاپ‌لنگردار: فهرستِ ذِ ص۵۹ + دیالوگِ /ð/ ص۵۶", () => {
    expect(keyed(14)).toEqual(["brother", "this"]);
    expect(mid5060).toContain("mother – father – brother – with – this – they – there –that – the – weather");
    expect(mid5060).toContain("it’s /ð/"); // «in ‘there’, ‘this’, and ‘they’» — دوبلِ this
  });

  it("هر ۷ واژهٔ چاپیِ فهرستِ س۴ دست‌کم یک بار گزینه‌اند (South تکراریِ مستند) و پرسشِ «ص» تک‌کلیدی نمی‌شد", () => {
    const used = new Set(bank.questions.flatMap((it) => it.options));
    const expected = ["South", "brother", "math", "three", "toothache", "thirty", "this"];
    expect([...used].sort()).toEqual([...expected].sort());
    expect(used.size).toBe(7);
    const thLine = p50.find((l) => l.trim().startsWith("South –")) ?? "";
    expect(thLine.trim().split(/\s[-–]\s/)).toHaveLength(7);
    // فقط ۲ واژهٔ غیرِ ص‌دار در فهرست چاپی است — پس ۴ گزینهٔ «همه غیرِ ص به‌جز یکی» ناممکن
    const nonSad = ["brother", "this"].filter((w) => thLine.includes(w));
    expect(nonSad).toHaveLength(2);
  });

  it("گزینه‌ها: ق1 [brother, South, math, three] با کلید در اندیس ۲؛ ق2 [this, toothache, thirty, South] با کلید ۰", () => {
    expect(bank.questions[0].options).toEqual(["South", "math", "brother", "three"]);
    expect(bank.questions[0].answer).toBe(2);
    expect(bank.questions[1].options).toEqual(["this", "toothache", "thirty", "South"]);
    expect(bank.questions[1].answer).toBe(0);
    // لنگرِ ص‌بودنِ south/three هم چاپی است (دیالوگِ /θ/ ص۵۶)
    expect(mid5060).toContain("it’s /θ/"); // «In ‘north’, ‘south’, ‘thank’, and ‘three’»
  });
});

describe("r377 — بانک ۱۵ (خ۶/س۳): چهار ناهماهنگِ verbatimِ ص۶۰", () => {
  const bank = L(15);

  it("چهار ردیفِ verbatimِ لایه (با تایپوی چاپیِ einter) — گزینه‌ها به ترتیبِ ردیف", () => {
    const rows = p60
      .filter((l) => /^(Father|River|Wet|Icy)\b/.test(l.trim()) && l.includes("…"))
      .map((l) => l.trim().split(/\s{2,}/)[0]);
    expect(rows).toEqual([
      "Father – mother – brother – weather",
      "River – summer – einter – fall",
      "Wet – rainy – snowy – story",
      "Icy – snowy – cold – hot",
    ]);
    expect(bank.questions.map((it) => it.question)).toEqual(rows);
    for (const it of bank.questions) expect(it.question.split(" – ")).toEqual([...it.options]);
  });

  it("کلیدها weather/River/story/hot — ناهماهنگِ دسته‌ای هر ردیف", () => {
    expect(keyed(15)).toEqual(["weather", "River", "story", "hot"]);
    expect(bank.questions.map((it) => it.answer)).toEqual([3, 0, 3, 3]);
  });

  it("لنگرهای ستاره‌دارِ واژگان: درس ششم ص۵۱ (weather/river/summer/fall/wet/rainy/snowy/icy/hot) + story* ص۶۱ بین‌درسی", () => {
    for (const anchor of [/weather\*/, /river\*/, /summer\*/, /fall\*/, /wet\*/, /rainy\*/, /snowy\*/, /icy\*/, /hot\*/])
      expect(mid5060).toMatch(anchor);
    expect(after60).toMatch(/story\*/);
  });

  it("تایپوی «einter» در ساقه verbatim است اما «winter» در کلِ فایل نیست (رونویسیِ خیرِ اصلاح‌شده ممنوع)", () => {
    expect(bank.questions[1].question).toContain("einter");
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const it of all) {
      expect(it.question.includes("winter"), `${it.id}`).toBe(false);
      expect(it.options.some((o) => o.includes("winter")), `${it.id}`).toBe(false);
    }
  });
});

describe("r377 — پیمان‌های سراسریِ فایل (پس از الحاقِ ۳ بانک)", () => {
  it("رسیدِ خانواده‌های ۵/۶: عنوانِ گروه‌های سیم‌کشیِ jozve-view با شمارنده‌ها هم‌خوان است", () => {
    // سیم‌کشی: بانک‌های ۱۳/۱۴ گروهِ «سؤالات امتحانی درس پنجم» و ۱۵ گروهِ «سؤالات امتحانی درس ششم»
    expect(L(13).title).toContain("درس پنجم");
    expect(L(14).title).toContain("درس پنجم");
    expect(L(15).title).toContain("درس ششم");
    expect(L(13).title).toContain("ص۵۰");
    expect(L(15).title).toContain("ص۶۰");
  });

  it("هیچ آیتمی از سکشن‌های تصویریِ مستثنی نشت نکرده است (بانکِ س۱ ص۵۰، قطب‌نما، بانک‌های س۱/س۲ ص۶۰)", () => {
    const all = g8.lessons.flatMap((b) => b.questions);
    for (const forbidden of [
      "zoo", "metro system", // بانکِ س۱ ص۵۰ + س۲ ص۶۰
      "south west", "north west", "south east", "north east", // بانکِ قطب‌نمای س۳ ص۵۰
      "Suuny", "windy", // بانکِ س۱ ص۶۰
      "farm", // بانکِ س۲ ص۶۰
      "کلمات مربوط به تصاویر", "جهت های جغرافیایی", // تیترهای سکشن‌های تصویری
    ])
      for (const it of all) {
        expect(it.question.includes(forbidden), `${it.id} stem contains ${forbidden}`).toBe(false);
        expect(it.options.some((o) => o.includes(forbidden)), `${it.id} option contains ${forbidden}`).toBe(false);
      }
  });

  it("بانک‌های تازه بدونِ تایپی و با گزینه‌های ≥۲ (قراردادِ r363)", () => {
    for (const bn of [13, 14, 15])
      for (const it of L(bn).questions) {
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length).toBeGreaterThanOrEqual(2);
        expect(it.options.length, `${it.id} 4-option`).toBe(4);
      }
  });

  it("خلوصِ لاتینِ گزینه‌های بانک‌های ۱۳/۱۵ — بانکِ ۱۴ ساقهٔ فارسیِ چاپ دارد (استثنایِ چهارمِ کارت)", () => {
    const latinPunct = /^[\x20-\x7E\u200c…–—\u2192]+$/;
    for (const bn of [13, 15])
      for (const it of L(bn).questions) {
        expect(latinPunct.test(it.question), `question of ${it.id}: ${it.question}`).toBe(true);
        for (const o of it.options) expect(latinPunct.test(o), `option of ${it.id}`).toBe(true);
      }
    for (const o of L(14).questions.flatMap((it) => it.options))
      expect(latinPunct.test(o), `option of bank14`).toBe(true);
    expect(L(14).questions.every((it) => it.question.includes("ذ"))).toBe(true);
  });
});
