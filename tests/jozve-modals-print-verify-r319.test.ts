import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r319 — گاردِ «تصدیقِ چاپ‌محورِ کلید» سه بانکِ افعال ناقص/معلوم‌مجهول (ص۲۲۴).
// الگوی r316-r318 (نیمهٔ کلید): رونویسیِ چشمیِ مستقل از رندرِ واقعی (۳۰۰dpi کامل + ۱۴۰۰dpi ناحیه)
// — ۸۰/۸۰ حرف قفل شد؛ ۷۹ موافق، C-Q10 چاپ=b = خطای چاپ (حکمِ r269/r282: c می‌ماند).

type TQ = { id: string; n: number; question: string; options: string[]; answer: number; translation?: string };
type TL = {
  lesson: number; title: string; count: number; questions: TQ[];
};
type TReceipt = {
  round: string; page: string; method: string; items: number; agree: number;
  transcripts: { A: string; B: string; C: string };
  printErratum: { family: string; n: number; print: string; json: string; cellZoom: string; reason: string };
};
type TBank = {
  source: { modals?: { extractedRound?: number; printVerification?: TReceipt; translations?: string } };
  lessons: TL[];
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/grammar-g12-topic.json", "utf8"),
) as unknown as TBank;
const l5 = bank.lessons.find((l) => l.lesson === 5)!;
const l6 = bank.lessons.find((l) => l.lesson === 6)!;
const l7 = bank.lessons.find((l) => l.lesson === 7)!;
const pv = bank.source.modals!.printVerification!;
const LET = "abcd";

describe("jozve modals print-verify g12 (r319 print-verbatim key confirmation)", () => {
  it("printVerification receipt: round/page/method/items=80/agree=79 + transcripts 20/20/40", () => {
    expect(pv.round).toBe("r319");
    expect(pv.page).toBe("224");
    expect(pv.method).toContain("visual transcription");
    expect(pv.method).toContain("1400dpi");
    expect(pv.items).toBe(80);
    expect(pv.agree).toBe(79);
    expect(pv.transcripts.A).toHaveLength(20);
    expect(pv.transcripts.B).toHaveLength(20);
    expect(pv.transcripts.C).toHaveLength(40);
    // r282 receipt untouched
    expect(bank.source.modals!.extractedRound).toBe(282);
  });

  it("all 80 keys locked letter-by-letter to the independent print transcript (C-Q10 = documented erratum, checked separately)", () => {
    for (const [les, fam, n] of [[l5, "A", 20], [l6, "B", 20], [l7, "C", 40]] as const) {
      expect(les.questions).toHaveLength(n);
      const tr = pv.transcripts[fam];
      les.questions.forEach((q, i) => {
        if (fam === "C" && q.n === 10) return; // اراتومِ چاپ: transcript=b ولی JSON=c — تستِ سوم
        expect(LET[q.answer], `${fam}-Q${q.n}`).toBe(tr[i]);
      });
    }
  });

  it("C-Q10 print erratum: grid says b, JSON keeps c (must have been painted) with recorded reason", () => {
    expect(pv.printErratum.family).toBe("C");
    expect(pv.printErratum.n).toBe(10);
    expect(pv.printErratum.print).toBe("b");
    expect(pv.printErratum.json).toBe("c");
    expect(pv.printErratum.reason).toContain("must have been painted");
    const q10 = l7.questions.find((q) => q.n === 10)!;
    expect(LET[q10.answer]).toBe("c");
    // گزینه‌ها عینِ چاپِ ص۱۵۱
    expect(q10.options).toEqual([
      "must have painted",
      "should have been painted",
      "must have been painted",
      "should have painted",
    ]);
    expect(q10.question).toContain("What a beautiful painting!");
  });

  it("bank counts intact (20/20/40) and honest absence of translations preserved", () => {
    for (const les of [l5, l6, l7]) {
      for (const q of les.questions) expect(q.translation, q.id).toBeUndefined();
    }
    expect(bank.source.modals!.translations).toContain("چاپ نشده");
  });
});
