import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r362 — گاردِ دو خانوادهٔ تستِ گ۹ (لطفی بوکان) → tests-g9.json
// «تست گرامری» ص۲۸: ۳ MCQ با کلیدِ ستارهٔ دنبالهٔ گزینه (there are* / there is* / there are not*)
// + ۴ آیتمِ تایپیِ is/are (بلنکِ چاپی = کادرِ خالی؛ کلیدِ ساختاری از دستورِ خود چاپ:
// «درجاهای خالی فعل مناسب is یا are قرار دهید» → is/are/is/are) + ۳ MCQِ بی‌کلیدِ چاپی =
// ساقه‌های یتیمِ مستند (قراردادِ r358: ساقه وارد بانک نمی‌شود و کلید ساخته نمی‌شود).
// «تست واژگان» ص۹۸-۱۰۱: ۵۰ MCQ با کلیدِ «N-x» تک‌ستونهٔ ص۱۰۱ — سربرگِ «هفتم تا نهم»
// ولی محتوا دقیقاً همین ۵۰تایی (کوئیرکِ مستند). تایپوهای چاپی verbatim.
type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number; title?: string;
  lessons: TL[];
  source: {
    g9tests?: {
      extractedRound: string; families: number; examPages: string; keyPages: string;
      sections: number; items: number; orphanStems: number; printQuirkCount: number;
      printQuirks: string[]; orphanStemList: { question: string; options: string[]; note: string }[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g9.json", "utf8"),
) as unknown as TBank;

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;

// کلیدِ چاپیِ ۵۰تاییِ ص۱۰۱ — رونوشتِ حرف‌به‌حرف (۵ سطرِ ۱۰تایی)
const KEY1_10 = "abbadccbaa";
const KEY11_20 = "bbdabdbcac";
const KEY21_30 = "abadcbbcac";
const KEY31_40 = "ddbadcdaab";
const KEY41_50 = "bcaddbdada";
const FULL_KEY = KEY1_10 + KEY11_20 + KEY21_30 + KEY31_40 + KEY41_50;

describe("r362 — receipt & shape", () => {
  it("receipt g9tests: r362, 2 families, 57 items, 3 orphan stems, 12 printQuirks", () => {
    const rec = bank.source.g9tests!;
    expect(rec).toBeTruthy();
    expect(rec.extractedRound).toBe("r362");
    expect(rec.families).toBe(2);
    expect(rec.examPages).toBe("گرامری 28؛ واژگان 98-101");
    expect(rec.keyPages).toContain("101");
    expect(rec.sections).toBe(2);
    expect(rec.items).toBe(57);
    expect(rec.orphanStems).toBe(3);
    expect(rec.printQuirkCount).toBe(12);
    expect(rec.printQuirks).toHaveLength(12);
    // کوئیرک‌های کلیدی در خودِ رسید ثبت‌اند
    expect(rec.printQuirks[0]).toContain("هفتم تا نهم");
    expect(rec.printQuirks[2]).toContain("ستاره");
    expect(rec.printQuirks[2]).toContain("r358");
  });

  it("file shape: grade 9, r362..r368 banks, unique ids", () => {
    expect(bank.grade).toBe(9);
    // r363 — شش بانکِ «تمرین‌های مکالمه»؛ r364 — هفت بانکِ «سؤالات امتحانی درس اول»؛
    // r365 — هفت بانکِ «درس دوم»؛ r366 — شش بانکِ «درس سوم»؛
    // r367 — هفت بانکِ «درس چهارم»؛ r368 — نه بانکِ «درس پنجم» (۴۴ بانک در کل)
    expect(bank.lessons).toHaveLength(44);
    expect(bank.lessons.map((l) => l.count)).toEqual([7, 50, 11, 9, 8, 10, 9, 8, 4, 2, 4, 3, 7, 5, 4, 8, 2, 4, 2, 3, 3, 2, 4, 6, 6, 2, 4, 6, 3, 2, 3, 2, 4, 6, 4, 10, 4, 2, 3, 3, 2, 2, 2, 3]);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids).toHaveLength(248);
    expect(new Set(ids).size).toBe(248);
    expect(ids.slice(0, 7)).toEqual([
      "g9-l1-1", "g9-l1-2", "g9-l1-3", "g9-l1-4", "g9-l1-5", "g9-l1-6", "g9-l1-7",
    ]);
    expect(ids[7]).toBe("g9-l2-1");
    expect(ids[56]).toBe("g9-l2-50");
  });

  it("latin purity: no Persian characters inside any question or option (بانک‌های r362/r363)", () => {
    // r364 — قفل به بانک‌های ۱-۸ محدود شد؛ بانک‌های امتحانیِ ۹-۱۵ ساقه‌های با برچسبِ فارسیِ چاپی دارند
    // (س۴ «سوالی :/منفی:») — قاعدهٔ خودشان در گاردِ r364 است (گزینه‌ها لاتین‌محض می‌مانند)
    for (const l of bank.lessons.filter((x) => x.lesson <= 8)) {
      for (const q of l.questions) {
        expect(q.question, q.id).not.toMatch(/[\u0600-\u06FF]/);
        for (const o of q.options) expect(o, q.id).not.toMatch(/[\u0600-\u06FF]/);
      }
    }
  });
});

describe("r362 — bank 1: تست گرامری ص۲۸", () => {
  it("shape: 3 MCQ + 4 typed, category grammar", () => {
    const l = L(1);
    expect(l.title).toBe("تست گرامری (ص۲۸) — there is/are");
    expect(l.level).toBe("چهارگزینه‌ای و تایپی");
    const mcq = l.questions.filter((q) => !q.kind);
    const typed = l.questions.filter((q) => q.kind === "typed");
    expect(mcq).toHaveLength(3);
    expect(typed).toHaveLength(4);
    // ترتیبِ چاپ: ۳ MCQ نخست، سپس ۴ تایپی
    expect(l.questions.slice(0, 3).every((q) => !q.kind)).toBe(true);
    expect(l.questions.slice(3).every((q) => q.kind === "typed")).toBe(true);
  });

  it("star keys verbatim: Q1=d/three are, Q2=d/there is, Q3=b/there are not", () => {
    const [q1, q2, q3] = L(1).questions;
    expect(q1.options).toEqual(["There is", "it is", "it has", "there are"]);
    expect(q1.answer).toBe(3);
    expect(q2.options[3]).toBe("there is");
    expect(q2.answer).toBe(3);
    expect(q3.options).toEqual(["it is not", "there are not", "there doesn’t", "they are not"]);
    expect(q3.answer).toBe(1);
    // هیچ گزینه‌ای ستاره ندارد — ستاره فقط نشانگرِ کلید بود
    for (const q of [q1, q2, q3]) for (const o of q.options) expect(o).not.toContain("*");
  });

  it("typed items: dash stand-in + structural is/are/is/are with accepted arrays", () => {
    const typed = L(1).questions.filter((q) => q.kind === "typed");
    const answers = typed.map((t) => t.options[t.answer]);
    expect(answers).toEqual(["is", "are", "is", "are"]);
    // r363 — باگِ تک‌گزینه‌ای: options حالا [is، are] است و answer اندیسِ کلید؛
    // accepted[0] باید با options[answer] بخواند نه options[0]
    expect(typed.every((t) => t.accepted?.length === 1 && t.accepted[0] === t.options[t.answer])).toBe(true);
    expect(typed.every((t) => t.options.length === 2 && t.options[0] === "is" && t.options[1] === "are")).toBe(true);
    expect(typed.every((t) => t.placeholder === "is or are…")).toBe(true);
    expect(typed[0].question).toBe("There ------- a whiteboard on the wall.");
    expect(typed[1].question).toBe("There ------- 8 chairs in the classroom.");
    expect(typed[2].question).toBe("There ------- a computer on the desk.");
    expect(typed[3].question).toBe("There ------- two windows in the room.");
  });

  it("orphan stems: three unkeyed MCQs documented in receipt, absent from bank", () => {
    const rec = bank.source.g9tests!;
    expect(rec.orphanStemList).toHaveLength(3);
    expect(rec.orphanStemList[0].question).toContain("He is an");
    expect(rec.orphanStemList[0].options).toEqual(["Rude", "brave", "quit", "angry"]);
    expect(rec.orphanStemList[1].options).toEqual(["A student", "a student", "students", "students."]);
    expect(rec.orphanStemList[2].question).toContain("A picture in the classroom");
    expect(rec.orphanStemList.every((o) => o.note.length > 0)).toBe(true);
    // هیچ‌کدام در بانک نیستند
    const stems = L(1).questions.map((q) => q.question);
    for (const o of rec.orphanStemList) expect(stems).not.toContain(o.question);
  });
});

describe("r362 — bank 2: تست واژگان ص۹۸-۱۰۱", () => {
  it("shape: 50 MCQ, four options each, category vocab, ids g9-l2-N", () => {
    const l = L(2);
    expect(l.title).toBe("تست واژگان ۵۰تایی (ص۹۸-۱۰۱)");
    expect(l.level).toBe("چهارگزینه‌ای");
    expect(l.questions).toHaveLength(50);
    expect(l.questions.every((q) => q.category === "vocab")).toBe(true);
    expect(l.questions.every((q) => q.options.length === 4)).toBe(true);
    expect(l.questions.every((q) => q.answer >= 0 && q.answer <= 3)).toBe(true);
    expect(l.questions.every((q) => !q.kind)).toBe(true);
  });

  it("printed key lock: full 50-letter key from p101 verbatim", () => {
    const got = L(2).questions.map((q) => "abcd"[q.answer]).join("");
    expect(got).toBe(FULL_KEY);
  });

  it("semantic locks: V1=began/V2=toll/V36=envelope-stamp/V44=generouse/V45=withdraw/V50=hands and knee", () => {
    const Q = (n: number) => L(2).questions[n - 1];
    expect(Q(1).options[0]).toBe("began");
    expect(Q(1).answer).toBe(0);
    expect(Q(2).options[1]).toBe("toll");
    expect(Q(2).answer).toBe(1);
    expect(Q(36).options[2]).toBe("envelope / stamp");
    expect(Q(36).answer).toBe(2);
    expect(Q(44).options[3]).toBe("generouse"); // تایپوی چاپی verbatim
    expect(Q(44).answer).toBe(3);
    expect(Q(45).options[3]).toBe("take / withdraw");
    expect(Q(45).answer).toBe(3);
    expect(Q(50).options[0]).toBe("hands and knee");
    expect(Q(50).answer).toBe(0);
  });

  it("print typos verbatim: ususlly/timetabels/hopping/quit/pleseant/voulantry/reveloution + missing apostrophes", () => {
    const Q = (n: number) => L(2).questions[n - 1];
    expect(Q(9).question).toContain("ususlly");
    expect(Q(19).options[3]).toBe("timetabels");
    expect(Q(23).question).toContain("hopping");
    expect(Q(37).question).toContain("quit and shy");
    expect(Q(37).options[1]).toBe("pleseant");
    expect(Q(39).question).toContain("Alice s father");
    expect(Q(39).options[2]).toBe("voulantry");
    expect(Q(47).options[3]).toBe("reveloution");
    expect(Q(21).question).toContain("Arent you");
    expect(Q(31).question).toContain("Minas father want");
    expect(Q(22).question).toContain("The Smith are");
    // شماره‌گذاریِ بدونِ فاصله در ساقه نمی‌نشیند (پارسر می‌برد) ولی متنِ پس از شماره verbatim است
    expect(Q(5).question).toMatch(/^The teacher wanted/);
    expect(Q(15).question).toMatch(/^Iran is a country/);
  });

  it("slash-pair options verbatim: V36/V43/V45/V49 + both1&2 quirk pair", () => {
    const Q = (n: number) => L(2).questions[n - 1];
    expect(Q(36).options).toEqual([
      "stamp / envelope", "stamp / interview", "envelope / stamp", "envelope / interview",
    ]);
    expect(Q(43).options[0]).toBe("preparing / setting");
    expect(Q(49).options[3]).toBe("received /relevant"); // بدونِ فاصله پس از اسلش — عینِ چاپ
    expect(Q(29).options[2]).toBe("both 1&2");
    expect(Q(44).options[2]).toBe("both1&2"); // ناهم‌خوانیِ فاصله بین دو «both» چاپی
  });
});
