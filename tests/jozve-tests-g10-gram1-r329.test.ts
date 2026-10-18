import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r329 — گاردِ «آزمون تشریحی گرامر درس اول» جزوهٔ دهم (ص۵۹-۶۰، کلید چاپی ص۲۴۸)
// هفتمین/سیزدهم تا شانزدهمین بانکِ درس‌محورِ پایهٔ دهم — نخستین آزمونِ گرامرِ درس‌محور:
// ۴ بانک/۳۷ آیتم (۱۵ تایپیِ جای خالی + ۷ تایپیِ جمله‌سازی + ۵ تایپیِ پاسخ کوتاه + ۱۰ MCQ).
// نرمال‌سازِ r285: اسلش→فاصله («are / going to») و حذفِ نقطه‌گذاریِ پایانی — طراحی‌شده عیناً برای این کلیدها.
// اراتوم‌های مستند: بخش۴-Q9 گزینهٔ c «'m going o» بدون t (۵۰۰۰dpi)؛ گزینهٔ d «willn't»؛ ساقهٔ بخش۱-Q10 با «؟».

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
    gram1?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// —— کلیدِ چاپیِ ص۲۴۸
// بخش ۱ (گرید ۱۵تایی — عین چاپ، اسلشِ دوبلانک حفظ شده)
const S1_KEYS = [
  "am going to", "am going to", "will", "are / going to", "will",
  "will", "will", "will", "am going to", "will",
  "will", "will", "is going to", "will", "are going to",
];
// بخش ۲ (۷ جملهٔ کامل) و بخش ۳ (۵ جملهٔ کامل)
const S2_KEYS = [
  "Are they going to buy a house soon?",
  "We are not going to watch TV tonight.",
  "I don’t think I will go out tonight.",
  "Where will you be this time next year?",
  "I am going to make a phone call.",
  "Are they going to visit a museum this weekend?",
  "Will our family buy a new car next year?",
];
const S3_KEYS = [
  "They are going to eat lunch in a restaurant.",
  "I am going to wash my car.",
  "He will travel to Paris by plane next week.",
  "They are going to play volleyball tomorrow.",
  "They will visit Yazd next summer.",
];
// بخش ۴ — کلید واژه‌ای چاپ → گزینه (اندیس)
const S4_KEYS: { word: string; idx: number }[] = [
  { word: "to arrive", idx: 2 },
  { word: "is going to fall", idx: 3 },
  { word: "is going to", idx: 0 },
  { word: "won’t", idx: 2 },
  { word: "'m going to", idx: 1 },
  { word: "will", idx: 3 },
  { word: "will", idx: 1 },
  { word: "are going", idx: 3 },
  { word: "will", idx: 3 },
  { word: "will", idx: 1 },
];

const L13 = bank.lessons.find((l) => l.lesson === 13)!;
const L14 = bank.lessons.find((l) => l.lesson === 14)!;
const L15 = bank.lessons.find((l) => l.lesson === 15)!;
const L16 = bank.lessons.find((l) => l.lesson === 16)!;

describe("jozve tests-g10 gram1 (r329 تشریحی گرامر درس اول — p59-60, key p248)", () => {
  it("gram1 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram1).toBeTruthy();
    const s = bank.source.gram1!;
    expect(s.exam).toContain("گرامر درس اول");
    expect(s.header).toContain("۲۴۸");
    expect(s.keyPages).toBe("248");
    expect(s.keyVerification).toContain("37/37");
    expect(s.extractedRound).toBe("r329");
    expect(s.pattern).toContain("r323");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("are / going to"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("'m going o"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("willn't") || q.includes("willn’t"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("واژه‌ای"))).toBe(true);
  });

  it("four banks shape: 15/7/5/10, typed kinds with accepted+placeholder, MCQ plain", () => {
    expect(L13.count).toBe(15);
    expect(L14.count).toBe(7);
    expect(L15.count).toBe(5);
    expect(L16.count).toBe(10);
    [L13, L14, L15].forEach((L) => {
      L.questions.forEach((q) => {
        expect(q.kind, q.id).toBe("typed");
        expect(q.accepted, q.id).toBeTruthy();
        expect(q.accepted!.length, q.id).toBeGreaterThanOrEqual(1);
        expect(q.placeholder, q.id).toBeTruthy();
        expect(q.category, q.id).toBe("grammar");
      });
    });
    L16.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
    });
  });

  it("section 1: 15 accepted locked verbatim to the printed grid p248 (slash form kept)", () => {
    L13.questions.forEach((q, i) => {
      expect(q.accepted![0], `S1-Q${q.n}`).toBe(S1_KEYS[i]);
      // options[0] = کلید چاپ (داربستِ مرور)؛ answer همیشه ۰
      expect(q.answer, q.id).toBe(0);
      expect(q.options, q.id).toHaveLength(4);
    });
  });

  it("sections 2+3: 12 sentence keys locked verbatim to p248", () => {
    L14.questions.forEach((q, i) => {
      expect(q.accepted![0], `S2-Q${q.n}`).toBe(S2_KEYS[i]);
      expect(q.answer, q.id).toBe(0);
    });
    L15.questions.forEach((q, i) => {
      expect(q.accepted![0], `S3-Q${q.n}`).toBe(S3_KEYS[i]);
      expect(q.answer, q.id).toBe(0);
    });
  });

  it("section 4: 10 MCQ answers locked to the printed word-keys via options[answer]", () => {
    L16.questions.forEach((q, i) => {
      expect(q.options[q.answer], `S4-Q${q.n}`).toBe(S4_KEYS[i].word);
      expect(q.answer, `S4-Q${q.n} idx`).toBe(S4_KEYS[i].idx);
    });
  });

  it("print quirks visible in data: S4-Q9 «'m going o», S4-Q4 «willn't», S1-Q10 «camera?», S1-Q4 double blank", () => {
    // اراتوم گزینهٔ c ساقهٔ ۹ — عین چاپ، کلید will (d) دست‌نخورده
    expect(L16.questions[8].options[2]).toBe("'m going o");
    expect(LETANS(L16.questions[8])).toBe(3);
    expect(L16.questions[8].options[3]).toBe("will");
    // گزینهٔ d ساقهٔ ۴ — willn't عین چاپ
    expect(L16.questions[3].options[3]).toBe("willn’t");
    expect(L16.questions[3].options[2]).toBe("won’t");
    expect(LETANS(L16.questions[3])).toBe(2);
    // ساقهٔ بخش۱-Q10 با «؟» عین چاپ
    expect(L13.questions[9].question).toContain("this camera?");
    // دوبلانکِ بخش۱-Q4 + اسلشِ کلید
    expect(L13.questions[3].question).toContain("What time --------------- you --------------- leave tomorrow?");
    expect(L13.questions[3].accepted![0]).toBe("are / going to");
    // جملات کلید با آپاستروف راست‌خمیده
    expect(L14.questions[2].accepted![0]).toBe("I don’t think I will go out tonight.");
    expect(L15.questions[0].question).toContain("( restaurant )");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(734);
  });
});

function LETANS(q: TQ): number {
  return q.answer;
}
