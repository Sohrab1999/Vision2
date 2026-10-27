import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r322 — گاردِ داوریِ Q18ِ بانکِ «کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)»
// اختلافِ خوانشِ دو سشن: r321 «مجبور نبود» + اراتومِ فرضی — r322 «مجبور خواهی بود».
// سه‌رأیِ r269: رندرِ تازهٔ ۴۰۰۰dpi (/tmp/r322-q18-4000.png) + ساقهٔ انگلیسی
// ("you will have to stand") + لایهٔ «خوایه» ≈ خواهی — حکم: چاپ «خواهی بود»؛ اراتومِ چاپی وجود ندارد.
// اصلاحِ ترجمه + پاک‌سازیِ printErrata + رسیدِ q18Arbitration (پارسر: scripts/jozve-connector-q18-arb-r322.py).

type TQ = { id: string; n: number; question: string; options: string[]; answer: number; kind?: string; translation?: string };
type TArb = {
  round: string; issue: string; method: string; print: string; english: string;
  layer: string; verdict: string; supersedes: string; evidence: string;
};
type TWash = {
  round: string; items: number; keyAgree: number; printErrata: string[];
  correctedRound?: string; q18Arbitration?: TArb;
};
type TLesson = { lesson: number; title: string; count: number; questions: TQ[]; source?: { translationsWashed?: TWash } };
type TBank = { grade: number; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/grammar-g12-topic.json", "utf8"),
) as unknown as TBank;
const les = bank.lessons.find((l) => l.title.startsWith("کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)"))!;
const w = les.source!.translationsWashed!;
const q18 = les.questions.find((q) => q.n === 18)!;

const Q18_PRINT = "صندلیهای زیادی وجود داشت بنابراین تو مجبور خواهی بود که بایستی.";

describe("jozve connector Q18 arbitration g12 (r322)", () => {
  it("Q18 translation locked print-verbatim to the 4000dpi reading, old reading gone", () => {
    expect(q18.translation).toBe(Q18_PRINT);
    expect(q18.translation).toContain("خواهی بود");
    expect(q18.translation).not.toContain("نبود");
    expect(q18.translation).not.toContain("خوایه");
    expect(/[\u0600-\u06FF]/.test(q18.translation!)).toBe(true);
    expect(/[A-Za-z]{3,}/.test(q18.translation!)).toBe(false);
  });

  it("arbitration receipt: round/method/verdict/supersedes + refuted erratum removed", () => {
    expect(w.correctedRound).toBe("r322");
    const arb = w.q18Arbitration!;
    expect(arb.round).toBe("r322");
    expect(arb.method).toContain("three-vote");
    expect(arb.method).toContain("4000dpi");
    expect(arb.print).toContain("خواهی بود");
    expect(arb.english).toContain("will have to stand");
    expect(arb.layer).toContain("خوایه");
    expect(arb.verdict).toContain("no print erratum");
    expect(arb.supersedes).toContain("r321 printErrata");
    expect(w.printErrata).toHaveLength(0);
    expect(w.round).toBe("r321"); // خودِ wash دست‌نخورده — اصلاحِ r322 فیلدِ جدا دارد
    expect(w.items).toBe(20);
    expect(w.keyAgree).toBe(20);
  });

  it("sibling items untouched (r321 transcript intact) + key column unchanged", () => {
    expect(les.questions).toHaveLength(20);
    const q1 = les.questions.find((q) => q.n === 1)!;
    const q2 = les.questions.find((q) => q.n === 2)!;
    const q10 = les.questions.find((q) => q.n === 10)!;
    expect(q1.translation).toBe("او روزنامه میخواند اما خواندن کتاب را دوست ندارد.");
    expect(q2.translation).toContain("سرگرم کننده است اما بهتره");
    expect(q10.translation).toContain("مسواک میزنم");
    // کلید حرفیِ چاپِ ص۱۹۲ — ثابت (Q18 = so)
    expect(q18.options[q18.answer]).toBe("so");
    expect(q2.options[q2.answer]).toBe("but");
  });
});
