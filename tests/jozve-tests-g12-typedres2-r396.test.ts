// R400-WIDENED — l144 (۵۱ آیتمِ پاسخِ مدلِ مخزن): 143→144 بانک / 891→942 id / دمِ counts +51
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r396 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ دوم: جمله‌سازی (l143، ۱۸ آیتم)
// دومین بانکِ گردآوریِ درون‌خانوادگی از «مخزنِ ۸۹ ردیفی»: ۱۸ ردیفِ مرتب‌کردنِ کلمات از ۸ برگه —
// کلیدهای عمودیِ قدیمی (r382/383/384) با خوانشِ پایین-به-بالا + تأییدِ دوقلوی تمیز (r386-ق۳۸)
// بازسازی شدند؛ r385-ق۳۲/۳۳ با کشفِ این راند جمله‌سازی شناخته شدند (نه پاسخِ مدل).
// با این بانک همهٔ ردیف‌های جمله‌سازیِ مخزن مصرف شد — مخزن ۶۷ → ۵۱ ردیفِ پاسخِ مدل.
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

describe("r396 — شکلِ فایل پس از بانکِ l143", () => {
  it("۱۴۳ بانک / ۸۹۱ id یکتا / دمِ counts +18 / همخوانیِ count با questions", () => {
    expect(bank.lessons)./* R400-WIDENED */ toHaveLength(144);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts)./* R400-WIDENED */ toHaveLength(144);
    expect(counts.slice(-3)).toEqual([22, 18, 51]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(942);
    expect(new Set(ids).size).toBe(942);
    expect(ids[872]).toBe("g12-l142-22");
    expect(ids[873]).toBe("g12-l143-1");
    expect(ids[890]).toBe("g12-l143-18");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("رسیدِ g12typedres2: مصرفِ ۸ برگه / کشفِ r385 / باقیِ ۵۱ ردیفِ مدل", () => {
    const r = bank.source.g12typedres2 as {
      extractedRound: string;
      items: number;
      bankCounts: Record<string, number>;
      reservoirCensus: { consumedHere: Record<string, string>; remaining: string };
    };
    expect(r).toBeTruthy();
    expect(r.extractedRound).toBe("r396");
    expect(r.items).toBe(18);
    expect(r.bankCounts).toEqual({ l143: 18 });
    expect(Object.keys(r.reservoirCensus.consumedHere)).toHaveLength(8);
    expect(r.reservoirCensus.consumedHere["r385-khordad1400m"]).toContain("جمله‌سازی");
    expect(r.reservoirCensus.remaining).toContain("۵۱ ردیف");
  });
});

describe("r396 — پیمان‌های محتواییِ l143", () => {
  const b = L(143);

  it("تایپیِ خالص: ۱۸ آیتمِ kind=typed، بدونِ ترجمه، ساقه = چیپ‌های خام با « / »", () => {
    expect(b.title).toBe("مرورِ تایپیِ نهایی‌ها — جمله‌سازی (قسمتِ دومِ مخزنِ ۸۹ ردیفی)");
    expect(b.level).toBe("تایپی");
    expect(b.count).toBe(18);
    for (const it of b.questions) {
      expect(it.kind, it.id).toBe("typed");
      expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
      expect(it.category, it.id).toBe("grammar");
      expect(it.answer, it.id).toBe(0);
      expect(it.options, it.id).toEqual([it.accepted![0]]);
      expect(it.question, it.id).toContain("/");
      // هیچ ساقه‌ای خانهٔ خط‌چین ندارد (چیپ‌ها هستند، نه کلوژ)
      expect(it.question, it.id).not.toContain("---------------");
    }
  });

  it("مدل‌های چاپیِ ۱۸گانه — شاملِ دوتاییِ چاپیِ r381-ق۳۸", () => {
    const q = (i: number) => b.questions[i - 1];
    expect(q(1).accepted).toEqual([
      "When the teacher came to the class, the students had done their homework.",
      "The students had done their homework when the teacher came to the class.",
    ]);
    expect(q(2).accepted).toEqual(["The baby had fallen asleep when I got home."]);
    expect(q(3).accepted).toEqual(["John could rest if he had more time."]);
    expect(q(4).accepted).toEqual(["Sara had never seen a bear before she went to the zoo."]);
    expect(q(5).accepted).toEqual(["My sister would clean her room if she were at home."]);
    expect(q(6).accepted).toEqual(["Roya was upset because she had gotten a bad score."]);
    expect(q(7).accepted).toEqual(["John could fix the car if he were at home."]);
    expect(q(8).accepted).toEqual(["Joe had already learned Chinese when he moved to China."]);
    expect(q(9).accepted).toEqual(["They would buy a house if they were you."]);
    expect(q(10).accepted).toEqual(["Mina was upset because she had gotten a bad score."]);
    expect(q(11).accepted).toEqual(["There are some workers and teachers who work in the village."]);
    expect(q(12).accepted).toEqual(["The girl wrote a letter, didn't she?"]);
    expect(q(13).accepted).toEqual(["Everything in the garden was brown because it hadn't rained."]);
    expect(q(14).accepted).toEqual(["The parents should be called by the teacher."]);
    expect(q(15).accepted).toEqual(["Mina would help you with your homework if she had more free time."]);
    expect(q(16).accepted).toEqual(["My mother was angry with my brother because he hadn't washed his hands."]);
    expect(q(17).accepted).toEqual(["The students bought some useful books which their teacher suggested."]);
    expect(q(18).accepted).toEqual(["Can water be converted into ice in cold weather?"]);
  });

  it("چیپ‌های شاخص: چسب‌های چاپیِ وفادار و ترتیبِ ۸برگه‌ای", () => {
    const q = (i: number) => b.questions[i - 1].question;
    expect(q(1)).toBe("the teacher / had done / the students / their homework / when / came to the class /. /");
    expect(q(2)).toBe("got home / had fallen/ The baby/ asleep/ when /I/. /");
    expect(q(7)).toBe("the car / were at home /if / he / could fix/ John  /. /"); // دوفاصلهٔ چاپ
    expect(q(9)).toBe("you /if / They / a house /  would buy / they were /./"); // دوفاصلهٔ چاپ
    expect(q(11)).toBe("work / some workers / who /and teachers/ in the village / there are /."); // چسبِ «who /and»
    expect(q(18)).toBe("cold weather / into / converted / water / in / ice / be / can / ?");
    // ترتیبِ برگه‌ها: r381 → r382×2 → r383×2 → r384×2 → r385×2 → r386 → r387×4 → r388m×4
    expect(q(6)).toContain("Roya");
    expect(q(10)).toContain("Mina/ upset");
    expect(q(14)).toContain("by the teacher");
  });
});
