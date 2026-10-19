import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r395 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ نخست: شکلِ فعل (l142، ۲۲ آیتم)
// نخستین بانکِ گردآوریِ درون‌خانوادگی از «مخزنِ ۸۹ ردیفی» (futureNoteهای g12nahaie1..16):
// ۲۲ ردیفِ افعالیِ ۹ برگه (r381/r382/r383/r384/r385/r386/r388-ناشنوایان/r388m/r389) —
// کلیدها عینِ چاپِ راستی‌آزمایی‌شده؛ دوتاییِ had got/gotten و سه‌گانهٔ might/would/could choose؛
// پس از این بانک مخزن از ۸۹ به ۶۷ ردیف می‌رسد (۱۷ جمله‌سازی + ۵۰ پاسخِ مدل برای قسطِ دوم/سوم).
type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  placeholder?: string;
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf8")
);
const L = (n: number): TLesson => {
  const b = bank.lessons.find((x) => x.lesson === n);
  if (!b) throw new Error(`bank l${n} not found`);
  return b;
};

describe("r395 — شکلِ فایل پس از بانکِ l142", () => {
  it("۱۴۲ بانک / ۸۷۳ id یکتا / دمِ counts +22 / همخوانیِ count با questions — r396 آن را به ۱۴۳/۸۹۱ گستراند", () => {
    expect(bank.lessons).toHaveLength(143);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts).toHaveLength(143);
    expect(counts.slice(-2)).toEqual([22, 18]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(891);
    expect(new Set(ids).size).toBe(891);
    expect(ids[850]).toBe("g12-l141-6");
    expect(ids[851]).toBe("g12-l142-1");
    expect(ids[872]).toBe("g12-l142-22");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("رسیدِ g12typedres1: سرشمارِ مصرفِ ۹ برگه + باقیِ ۶۷ ردیفِ مخزن", () => {
    const r = bank.source.g12typedres1 as {
      extractedRound: string;
      items: number;
      bankCounts: Record<string, number>;
      reservoirCensus: { consumedHere: Record<string, string>; remaining: string };
    };
    expect(r).toBeTruthy();
    expect(r.extractedRound).toBe("r395");
    expect(r.items).toBe(22);
    expect(r.bankCounts).toEqual({ l142: 22 });
    expect(Object.keys(r.reservoirCensus.consumedHere)).toHaveLength(9);
    expect(r.reservoirCensus.remaining).toContain("۶۷ ردیف");
  });
});

describe("r395 — پیمان‌های محتواییِ l142", () => {
  const b = L(142);

  it("تایپیِ خالص: ۲۲ آیتمِ kind=typed، بدونِ ترجمه، خانهٔ ۱۵خط، options=[accepted[0]]", () => {
    expect(b.title).toBe("مرورِ تایپیِ نهایی‌ها — شکلِ فعل (قسمتِ افعالِ مخزنِ ۸۹ ردیفی)");
    expect(b.level).toBe("تایپی");
    expect(b.count).toBe(22);
    for (const it of b.questions) {
      expect(it.kind, it.id).toBe("typed");
      expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
      expect(it.category, it.id).toBe("grammar");
      expect(it.answer, it.id).toBe(0);
      expect(it.options, it.id).toEqual([it.accepted![0]]);
      expect(it.accepted!.length, it.id).toBeGreaterThanOrEqual(1);
      expect(it.question, it.id).toContain("---------------");
      // هیچ بازماندهٔ نقطه‌چینِ چاپی نباید مانده باشد
      expect(it.question, it.id).not.toContain("…");
      expect(it.question, it.id).not.toContain("....");
    }
  });

  it("کلیدهای چاپیِ ۲۲گانه — شاملِ دوتاییِ had got/gotten و سه‌گانهٔ might/would/could choose", () => {
    const q = (i: number) => b.questions[i - 1];
    expect(q(1).accepted).toEqual(["be kept"]); // r381 — داوری ۳۰۰dpi همان راند
    expect(q(2).accepted).toEqual(["had studied"]);
    expect(q(3).accepted).toEqual(["would tell"]);
    expect(q(4).accepted).toEqual(["had seen"]); // r382
    expect(q(5).accepted).toEqual(["had got", "had gotten"]); // r383 — دوتاییِ چاپ
    expect(q(6).accepted).toEqual(["was broken"]); // r384
    expect(q(7).accepted).toEqual(["had paid"]); // r385
    expect(q(8).accepted).toEqual(["had studied"]); // r386 — تکرارِ بین‌برگه‌ایِ موجه
    expect(q(9).accepted).toEqual(["is spoken"]);
    expect(q(10).accepted).toEqual(["was found"]); // r388 ناشنوایان
    expect(q(11).accepted).toEqual(["forgets"]);
    expect(q(12).accepted).toEqual(["got"]);
    expect(q(13).accepted).toEqual(["been made"]);
    expect(q(14).accepted).toEqual(["have been invited"]); // r388m — مکالمهٔ Babak/Ali
    expect(q(15).accepted).toEqual(["was said"]);
    expect(q(16).accepted).toEqual(["decides"]);
    expect(q(17).accepted).toEqual(["might choose", "would choose", "could choose"]);
    expect(q(18).accepted).toEqual(["increasingly"]); // r389 انسانی
    expect(q(19).accepted).toEqual(["collect"]);
    expect(q(20).accepted).toEqual(["has been discovered"]);
    expect(q(21).accepted).toEqual(["were invented"]);
    expect(q(22).accepted).toEqual(["were"]);
  });

  it("ساقه‌های شاخص: پیشوندِ گوینده به الگویِ l136، «china» کوچکِ چاپ، ترتیبِ ۹برگه‌ای", () => {
    const q = (i: number) => b.questions[i - 1].question;
    expect(q(1)).toBe("The meat must --------------- in a freezer. (to keep)");
    expect(q(5)).toBe("She was upset because she --------------- a bad score. (get)");
    expect(q(8)).toBe("Joe --------------- Chinese before he moved to china. (study)");
    expect(q(10)).toBe("The robber --------------- by the police last week. (to find)");
    expect(q(14)).toBe("Ali: You --------------- (invite) to his birthday party, haven't you?");
    expect(q(17)).toBe(
      "Babak: You are right! But if he told us sooner we --------------- (choose) a better gift to buy."
    );
    expect(q(20)).toBe(
      "A: Is there any medicine for the disease? B: A new medicine --------------- by the doctors to cure it since last month. (discover)"
    );
    // ترتیبِ برگه‌ها: ۳تاییِ r381 → تک‌ردیف‌های r382/r383/r384/r385 → دوتاییِ r386 →
    // چهارگانهٔ ناشنوایان → چهارگانهٔ مکالمه → پنج‌گانهٔ r389
    expect(q(4).indexOf("I knew I")).toBeGreaterThanOrEqual(0);
    expect(q(9)).toContain("Tajikistan and Afghanistan");
    expect(q(13)).toContain("cure cancer");
    expect(q(22)).toBe("They would travel all over the world if they --------------- rich. (be)");
  });
});
