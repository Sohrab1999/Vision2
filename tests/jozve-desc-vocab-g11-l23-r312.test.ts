import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r312 — گاردِ «آزمون تشریحی واژگان درس دوم و درس سوم» جزوهٔ جامع یازدهم
// درس دوم: ص۵۴-۵۶، کلید واژه‌ای چاپی ص۱۸۴ — ۴ بانک (l29..l32)
// درس سوم: ص۸۸-۹۰، کلید واژه‌ای چاپی ص۱۹۳ — ۴ بانک (l33..l36)
// هر درس: بانک‌واژه ۱۶ تایپی + حرف‌اول ۸ تایپی + تعریف ۸ تایپی + ۲۵ MCQ
// =====================================================================

interface BankQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  kind?: "mcq" | "typed";
  accepted?: string[];
  placeholder?: string;
  translation?: string;
}
interface BankLesson {
  lesson: number;
  title: string;
  level?: string;
  count: number;
  questions: BankQuestion[];
}
interface Bank {
  grade: number;
  source: Record<string, unknown>;
  lessons: BankLesson[];
}

const bank: Bank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g11.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = /-{5,}/;

const L2 = [29, 30, 31, 32].map((n) => bank.lessons.find((l) => l.lesson === n)!);
const L3 = [33, 34, 35, 36].map((n) => bank.lessons.find((l) => l.lesson === n)!);
const [l29, l30, l31, l32] = L2;
const [l33, l34, l35, l36] = L3;

// رونویسیِ چاپیِ کلید ص۱۸۴ (رسیدِ وفاداری — گرید ۴×۴ و ۵×۵ رندرِ pdftoppm)
const KEY_L2_S1 = ["unhealthy", "forbidden", "weight", "details", "lifestyle", "effective", "depression", "particular", "enable", "avoid", "influencing", "decreased", "contains", "socialize", "prevent", "disagree"];
const KEY_L2_S2 = ["couch", "harmful", "patient", "forget", "after", "habit", "part", "vary"];
const KEY_L2_S3 = ["addict", "specialist", "oil", "homeless", "cure", "creative", "despite", "carrot"];
const KEY_L2_S4 = ["balanced", "relationship", "effects", "impatient", "disagree", "improves", "pressure", "particular", "cancer", "avoid", "calm", "retiring", "healthy", "influence", "contains", "emotional", "tastes", "towards", "topic", "harmful", "habits", "took care of", "hanging out", "properly", "emotional"];
const BOX_L2_A = ["details", "miracle", "depression", "particular", "effective", "weight", "unhealthy", "lifestyle", "forbidden"];
const BOX_L2_B = ["prevent", "socialize", "contains", "avoid", "disagree", "enable", "discussed", "influencing", "decreased"];
const BOX_L2_3 = ["homeless", "despite", "laughter", "specialist", "carrot", "creative", "cure", "addict", "oil"];

// رونویسیِ چاپیِ کلید ص۱۹۳ — «Prize»/«Souvenir» با حرف بزرگ چاپ شده‌اند (عینِ چاپ)
const KEY_L3_S1 = ["craftsmen", "promised", "diversity", "product", "includes", "economy", "identity", "customs", "income", "amused", "appreciate", "imagination", "satisfied", "metals", "unique", "attempted"];
const KEY_L3_S2 = ["poet", "homeland", "neighbor", "pack", "workshop", "income", "Prize", "Souvenir"];
const KEY_L3_S3 = ["discount", "painting", "humankind", "custom", "photography", "lend", "appreciate", "shocked"];
const KEY_L3_S4 = ["includes", "handshake", "whenever", "economy", "along", "bowing", "other", "amused", "confused", "depend", "diversity", "achieve", "attitude", "appreciate", "calligraphy", "weave", "sociable", "advise", "combination", "decorative", "reflect", "get along with", "vast", "handicrafts", "antonyms"];
const BOX_L3_A = ["product", "identity", "craftsmen", "economy", "promised", "diversity", "instance", "includes", "customs"];
const BOX_L3_B = ["attempted", "unique", "income", "touching", "satisfied", "amused", "metals", "imagination", "appreciate"];
const BOX_L3_3 = ["lend", "appreciate", "photography", "humankind", "economy", "custom", "discount", "painting", "shocked"];

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

describe("jozve descriptive vocab g11 lessons 2+3 (r312 extraction receipt)", () => {
  it("bank shape: lessons 29..36 appended after r311's l28 — counts 16/8/8/25 × 2", () => {
    expect(bank.grade).toBe(11);
    expect(bank.lessons.map((l) => l.lesson).slice(-6)).toEqual([37, 38, 39, 40, 41, 42]); // r354: l37..l42 الحاق شد — دنبالهٔ l29..l36 در برابر [-14:-6] می‌ماند
    for (const [les, size] of [[l29, 16], [l30, 8], [l31, 8], [l32, 25], [l33, 16], [l34, 8], [l35, 8], [l36, 25]] as const) {
      expect(les.count, `l${les.lesson}`).toBe(size);
      expect(les.questions, `l${les.lesson}`).toHaveLength(size);
      expect(les.questions.map((q) => q.n), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => i + 1)
      );
    }
    expect(l29.title).toBe("تشریحی واژگان د۲ — جای خالی از بانک واژه (ص۵۴)");
    expect(l33.title).toBe("تشریحی واژگان د۳ — جای خالی از بانک واژه (ص۸۸)");
    expect(l29.level).toBe("تشریحی — تایپی");
    expect(l32.level).toBe("تشریحی — چهارگزینه‌ای");
  });

  it("ids: g11-l29..l36-N unique across the whole bank — total 782 items", () => {
    for (const [les, size] of [[l29, 16], [l30, 8], [l31, 8], [l32, 25], [l33, 16], [l34, 8], [l35, 8], [l36, 25]] as const) {
      expect(les.questions.map((q) => q.id), `l${les.lesson}`).toEqual(
        Array.from({ length: size }, (_, i) => `g11-l${les.lesson}-${i + 1}`)
      );
    }
    const all = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(600 + 114 + 68); // ۶۰۰ (r311) + ۱۱۴ (r312) + ۶۸ (r354 — تشریحی گرامر د۱)
    expect(bank.lessons).toHaveLength(42);
  });

  it("typed purity (six typed banks): kind=typed, accepted[0]=options[0], answer=0, placeholder, English purity", () => {
    for (const les of [l29, l30, l31, l33, l34, l35]) {
      for (const q of les.questions) {
        expect(q.kind, q.id).toBe("typed");
        expect(q.answer, q.id).toBe(0);
        expect(q.accepted, q.id).toHaveLength(1);
        expect(norm(q.accepted![0]), q.id).toBe(norm(q.options[0]));
        expect(q.placeholder, q.id).toBeTypeOf("string");
        expect(q.placeholder!.length, q.id).toBeGreaterThan(10);
        expect(FA.test(q.question), q.id).toBe(false);
        expect(FA.test(q.options.join(" ")), q.id).toBe(false);
        expect(q.category, q.id).toBe("vocab");
      }
    }
    for (const q of [...l29.questions, ...l33.questions]) expect(BLANK.test(q.question), q.id).toBe(true);
    for (const q of [...l30.questions, ...l34.questions]) {
      expect(/[A-Za-z]\s*(?:_\s*)+/.test(q.question), `${q.id} hint: ${q.question}`).toBe(true);
    }
    for (const q of [...l31.questions, ...l35.questions]) {
      expect(/\(\s*\)\.?$|\(\s*\)/.test(q.question), `${q.id} paren blank: ${q.question}`).toBe(true);
    }
  });

  it("lesson-2 print fidelity: stems keyed to ص۱۸۴ grid; [bank: …] = printed boxes in booklet order", () => {
    l29.questions.forEach((q, i) => {
      const box = i < 8 ? BOX_L2_A : BOX_L2_B;
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L2_S1[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/)!;
      expect(m[1].split("/").map(norm), `bank of ${q.id}`).toEqual(box.map(norm));
      expect(new Set(q.options.map(norm)), q.id).toEqual(new Set(box.map(norm)));
    });
    expect(norm(BOX_L2_A.filter((w) => !KEY_L2_S1.slice(0, 8).map(norm).includes(norm(w))).join())).toBe("miracle");
    expect(norm(BOX_L2_B.filter((w) => !KEY_L2_S1.slice(8).map(norm).includes(norm(w))).join())).toBe("discussed");
    l30.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L2_S2[i]));
      const hint = q.question.match(/([A-Za-z])\s*(?:_\s*)+/)!;
      expect(hint[1].toLowerCase(), q.id).toBe(KEY_L2_S2[i][0].toLowerCase());
      // پرانتزِ الگو در چاپ طبیعی است — لایهٔ RTL معکوس می‌داد؛ بازسازی شد
      expect(q.question, q.id).toContain("(");
    });
    l31.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L2_S3[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/)!;
      expect(m[1].split("/").map(norm), q.id).toEqual(BOX_L2_3.map(norm));
    });
    expect(norm(BOX_L2_3.filter((w) => !KEY_L2_S3.map(norm).includes(norm(w))).join())).toBe("laughter");
  });

  it("lesson-3 print fidelity: stems keyed to ص۱۹۳ grid; Prize/Souvenir printed capitalized — kept verbatim", () => {
    l33.questions.forEach((q, i) => {
      const box = i < 8 ? BOX_L3_A : BOX_L3_B;
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L3_S1[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/)!;
      expect(m[1].split("/").map(norm), `bank of ${q.id}`).toEqual(box.map(norm));
    });
    expect(norm(BOX_L3_A.filter((w) => !KEY_L3_S1.slice(0, 8).map(norm).includes(norm(w))).join())).toBe("instance");
    expect(norm(BOX_L3_B.filter((w) => !KEY_L3_S1.slice(8).map(norm).includes(norm(w))).join())).toBe("touching");
    l34.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L3_S2[i]));
      const hint = q.question.match(/([A-Za-z])\s*(?:_\s*)+/)!;
      expect(hint[1].toLowerCase(), q.id).toBe(KEY_L3_S2[i][0].toLowerCase());
    });
    // وفاداریِ حرف‌به‌حرف به چاپِ حرف‌بزرگِ ص۱۹۳
    expect(l34.questions[6].accepted![0]).toBe("Prize");
    expect(l34.questions[7].accepted![0]).toBe("Souvenir");
    l35.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), q.id).toBe(norm(KEY_L3_S3[i]));
      const m = q.question.match(/\[bank: ([^\]]+)\]/)!;
      expect(m[1].split("/").map(norm), q.id).toEqual(BOX_L3_3.map(norm));
    });
    expect(norm(BOX_L3_3.filter((w) => !KEY_L3_S3.map(norm).includes(norm(w))).join())).toBe("economy");
  });

  it("MCQ fidelity (l32/l36): keyed option word = printed word-key, unique mapping, locked letter distribution", () => {
    for (const [les, KEY] of [[l32, KEY_L2_S4], [l36, KEY_L3_S4]] as const) {
      les.questions.forEach((q, i) => {
        expect(q.kind, q.id).toBeUndefined();
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(norm(q.options[q.answer]), `${q.id} key`).toBe(norm(KEY[i]));
        expect(FA.test(q.question), q.id).toBe(false);
        expect(q.question.length, q.id).toBeGreaterThan(10);
      });
    }
    // توزیعِ حروفِ کلید — قفلِ چاپ (از گریدِ ۵×۵ ص۱۸۴/ص۱۹۳)
    const dist = (les: BankLesson) =>
      les.questions.reduce<Record<string, number>>((a, q) => {
        const L = "abcd"[q.answer];
        return { ...a, [L]: (a[L] ?? 0) + 1 };
      }, {});
    expect(dist(l32)).toEqual({ a: 6, b: 7, c: 6, d: 6 });
    expect(dist(l36)).toEqual({ a: 5, b: 8, c: 6, d: 6 });
    // Q12 درس دوم: خانهٔ چهارم بدونِ «d.» چاپ شده — بازسازیِ مستند
    const q12 = l32.questions[11];
    expect(q12.options).toEqual(["producing", "preventing", "retiring", "calling back"]);
    expect("abcd"[q12.answer]).toBe("c");
  });

  it("print-quirk receipts recorded in source.descVocab2 (disagree/discussed errata, OPT_FIX, capitals, RTL parens)", () => {
    const src = bank.source as { descVocab2?: Record<string, unknown> };
    expect(src.descVocab2).toBeTruthy();
    expect(src.descVocab2!["questionPages"]).toBe("54-56 / 88-90");
    expect(src.descVocab2!["keyPages"]).toBe("184 / 193");
    expect(src.descVocab2!["extractedRound"]).toBe("r312");
    const quirks = src.descVocab2!["printQuirks"] as string[];
    expect(quirks.length).toBeGreaterThanOrEqual(4);
    expect(quirks.join(" ")).toContain("disagree");
    expect(quirks.join(" ")).toContain("calling back");
    const unused = src.descVocab2!["unusedBoxWords"] as Record<string, Record<string, string[]>>;
    expect(unused.L2.s1boxB).toEqual(["discussed"]);
    expect(unused.L3.s1boxA).toEqual(["instance"]);
    const hunt = src.descVocab2!["duplicateHunt"] as { duplicates: { new: string; old: string; oldLesson: number }[] };
    expect(hunt.duplicates).toEqual([{ new: "g11-l33-6", old: "g11-l5-12", oldLesson: 5 }]);
  });

  it("no translations in the eight descriptive banks — the booklet printed none (honest absence)", () => {
    for (const les of [...L2, ...L3]) {
      for (const q of les.questions) {
        expect(q.translation, q.id).toBeUndefined();
        expect("translation" in q, q.id).toBe(false);
      }
    }
  });

  it("dup-hunt: exactly one documented in-booklet reuse — l33-6 == l5-12 with equal key (pattern r309)", () => {
    const strip = (s: string) => norm(s.replace(/\[bank:[^\]]+\]/g, "").replace(/-{5,}/g, " ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " "));
    const oldStems = new Map(
      bank.lessons.filter((l) => l.lesson < 29).flatMap((l) => l.questions.map((q) => [strip(q.question), q] as const))
    );
    const dups: { id: string; oldId: string }[] = [];
    for (const les of [...L2, ...L3]) {
      for (const q of les.questions) {
        const old = oldStems.get(strip(q.question));
        if (old) dups.push({ id: q.id, oldId: old.id });
      }
    }
    // بازاستفادهٔ چاپیِ خود جزوه: ساقهٔ بخش تشریحیِ درس سوم عیناً در بانک تکمیلی ص۹۳ چاپ شده
    expect(dups).toEqual([{ id: "g11-l33-6", oldId: "g11-l5-12" }]);
    // گاردِ برابریِ بین‌بانکی: ساقه + کلید هر دو سر برابر بماند
    const l5q12 = bank.lessons.find((l) => l.lesson === 5)!.questions.find((q) => q.id === "g11-l5-12")!;
    const l33q6 = l33.questions.find((q) => q.id === "g11-l33-6")!;
    expect(strip(l5q12.question), "stem parity").toBe(strip(l33q6.question));
    expect(l5q12.options[l5q12.answer], "key parity").toBe(l33q6.accepted![0]);
  });
});
