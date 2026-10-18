import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r340 — گاردِ «آزمون تشریحی گرامر درس سوم» جزوهٔ دهم (ص۱۳۱-۱۳۳، کلیدِ چاپیِ ص۲۷۷-۲۷۸)
// هشتمین بانک‌بندیِ سکشن‌به‌سکشن (الگوی r337): ۸ بانک / ۵۴ آیتمِ تایپیِ گرامری.
// ۵۴/۵۴ کلیدِ چاپی — صفر واگرایی؛ واریانت‌های پرانتزیِ چاپ (we (I)/students (They)/brother (He)/post (do))
// در accepted (الگوی r336-S9)؛ کلیدهای اسلش‌دار با فاصلهٔ یکنواختِ « / » بازسازی شدند (ناسازگاریِ اسلشِ چاپ).
// داوری‌های رندر: سربرگِ ۶۰۰dpi با ارقامِ فارسیِ «۲۷۷ - ۲۷۸»؛ «No, I----.» و «let ----in.» چسبیده؛
// S3-Q6 «too tired» بدونِ نقطه؛ S2-Q7 «the window/» چسبیده؛ «at 19» رقمِ لاتین؛ «8:00 o’clock».

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string;
    l3gram?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// کلیدهای چاپیِ ص۲۷۷-۲۷۸ (رونویسیِ رندر — نرمال‌سازی: کوچک‌سازی + اسلش→فاصله + حذفِ پرانتز + فروپاشیِ فاصله)
const norm = (s: string) =>
  s.toLowerCase().replaceAll("’", "'").replaceAll("/", " ")
    .replaceAll("(", "").replaceAll(")", "").split(/\s+/).filter(Boolean).join(" ");

const KEYS_58 = [
  "was talking/arrived", "rang/was writing", "was sleeping/ stole", "went/was waiting",
  "started/were having", "was sitting", "weren’t listening/ told", "were studying/called",
  "doing/working", "wasn’t listening",
];
const KEYS_60 = ["was/were", "were", "was/didn’t", "while", "Were/wasn’t/was", "Did/was", "was"];
const KEYS_61 = ["were/c", "Was/e", "Was/d", "were/b", "was/a"];
const KEYS_63 = [
  "himself", "herself", "themselves", "ourselves", "myself",
  "ourselves", "itself", "myself", "themselves", "yourself",
];
const KEYS_64 = ["myself fixed it", "his hair himself", "post (do) it myself", "himself told me", "phone him yourself"];

const S1 = bank.lessons.find((l) => l.lesson === 58)!;
const S2 = bank.lessons.find((l) => l.lesson === 59)!;
const S3 = bank.lessons.find((l) => l.lesson === 60)!;
const S4 = bank.lessons.find((l) => l.lesson === 61)!;
const S5 = bank.lessons.find((l) => l.lesson === 62)!;
const S6 = bank.lessons.find((l) => l.lesson === 63)!;
const S7 = bank.lessons.find((l) => l.lesson === 64)!;
const S8 = bank.lessons.find((l) => l.lesson === 65)!;

describe("jozve tests-g10 l3gram (r340 آزمون تشریحی گرامر درس سوم — pp131-133, key pp277-278)", () => {
  it("l3gram receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.l3gram).toBeTruthy();
    const s = bank.source.l3gram!;
    expect(s.exam).toContain("ص۱۳۱-۱۳۳");
    expect(s.header).toContain("۲۷۷ - ۲۷۸"); // ارقامِ فارسیِ چاپ (برخلافِ r339 با لاتین)
    expect(s.header).toContain("۱۳۱ تا ۱۳۳");
    expect(s.header).toContain("تسی یچ"); // ششمین تحریفِ لایه — رندر حاکم
    expect(s.keyPages).toBe("277-278");
    expect(s.keyVerification).toContain("۵۴/۵۴");
    expect(s.extractedRound).toBe("r340");
    expect(s.pattern).toContain("r337");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("the window/"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("No, I----."))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("let ----in."))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("too tired"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("at 19"))).toBe(true);
  });

  it("eight banks shape: 10/7/7/5/5/10/5/5 typed grammar items, placeholders present", () => {
    const shapes = [S1, S2, S3, S4, S5, S6, S7, S8].map((l) => l.count);
    expect(shapes).toEqual([10, 7, 7, 5, 5, 10, 5, 5]);
    [S1, S2, S3, S4, S5, S6, S7, S8].forEach((l) => {
      expect(l.level).toContain("تشریحی");
      l.questions.forEach((q) => {
        expect(q.kind, q.id).toBe("typed");
        expect(q.category, q.id).toBe("grammar");
        expect(q.answer, q.id).toBe(0);
        expect(q.accepted, q.id).toBeTruthy();
        expect(q.accepted!.length, q.id).toBeGreaterThan(0);
        expect(q.placeholder, q.id).toBeTruthy();
      });
    });
  });

  it("S1 verb-form keys locked to the printed grid p277 (slash-spacing normalized, apostrophes curly)", () => {
    S1.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `S1-Q${i + 1}`).toBe(norm(KEYS_58[i]));
      expect(q.options[0], `S1-Q${i + 1} verbatim print key`).toBe(q.accepted![0]);
    });
    expect(S1.questions[6].accepted![0]).toBe("weren’t listening / told");
    expect(S1.questions[0].accepted![0]).toBe("was talking / arrived");
  });

  it("S3 multi-blank slash keys locked incl. three-blank Q5; S4 two-part keys were/c…Was/d verbatim", () => {
    S3.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `S3-Q${i + 1}`).toBe(norm(KEYS_60[i]));
    });
    expect(S3.questions[4].accepted![0]).toBe("Were / wasn’t / was");
    expect(S3.questions[4].question).toMatch(/No, I-+\./); // تیرهٔ چسبیده به I بدونِ فاصله — عینِ چاپ (تیرهٔ BL یکنواخت)
    expect(S3.questions[5].question.endsWith("too tired")).toBe(true); // بدونِ نقطهٔ پایانی
    S4.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `S4-Q${i + 1}`).toBe(norm(KEYS_61[i]));
      // شکلِ بازسازی‌شدهٔ یکنواختِ «X / Y» با حفظِ حروفِ بزرگِ چاپِ Was در Q2/Q3
      expect(q.accepted![0], `S4-Q${i + 1} verbatim`).toBe(["were / c", "Was / e", "Was / d", "were / b", "was / a"][i]);
    });
    // ستونِ B درونِ ساقه (موتورِ تایپی گزینه رندر نمی‌کند — ساقهٔ خودبسنده؛ الگوی r337-L52)
    S4.questions.forEach((q) => {
      expect(q.question).toContain("a. Because he was late.");
      expect(q.question).toContain("e. No, he wasn’t.");
    });
  });

  it("S5 full-sentence keys with printed paren variants in accepted (we (I)/students (They)/brother (He)); S6 reflexives locked", () => {
    expect(S5.questions[0].accepted).toEqual([
      "They were having dinner when we arrived.", "They were having dinner when I arrived.",
    ]);
    expect(S5.questions[1].accepted![1]).toBe("They were doing their homework when the teacher came in.");
    expect(S5.questions[3].accepted![1]).toBe("He was studying English at 8:00 o’clock yesterday.");
    expect(S5.questions[2].question).toContain("at 19 yesterday evening"); // رقمِ لاتین — عینِ چاپ
    S6.questions.forEach((q, i) => {
      expect(norm(q.accepted![0]), `S6-Q${i + 1}`).toBe(KEYS_63[i]);
    });
    expect(S6.questions[8].question).toMatch(/let -+in\./); // تیرهٔ چسبیده به in بدونِ فاصله — عینِ چاپ
  });

  it("S7 emphatic answers incl. printed (do) variant triple; S2/S8 sentence keys locked to p277/p278", () => {
    S7.questions.forEach((q, i) => {
      // S7-Q3 کلیدِ چاپی «post (do) it myself» — accepted[0] شکلِ پایه است و عینِ چاپ عضوِ سومِ لیست
      const base = ["myself fixed it", "his hair himself", "post it myself", "himself told me", "phone him yourself"][i];
      expect(norm(q.accepted![0]), `S7-Q${i + 1}`).toBe(norm(base));
    });
    expect(S7.questions[2].accepted).toEqual(["post it myself", "do it myself", "post (do) it myself"]);
    expect(S7.questions[4].question).toContain("Why can’t you"); // آپاستروفِ خمیدهٔ چاپ
    S2.questions.forEach((q, i) => {
      const printed = [
        "We were playing outside while he was studying his lessons.",
        "They were trying hard to save the injured bird.",
        "I was reading a book when my father came in.",
        "It was raining so we didn’t go out.",
        "Was it snowing when you got up?",
        "What were you doing at three o’clock yesterday?",
        "The boys broke the window when they were playing football.",
      ][i];
      expect(norm(q.accepted![0]), `S2-Q${i + 1}`).toBe(norm(printed));
    });
    expect(S2.questions[6].question).toContain("the window/"); // اسلشِ چسبیده — عینِ چاپ
    S8.questions.forEach((q, i) => {
      const printed = [
        "The scientists themselves did the experiment.",
        "My mother cleaned the room by herself.",
        "I did my homework myself.",
        "We baked a big cake for ourselves.",
        "They themselves painted the walls.",
      ][i];
      expect(norm(q.accepted![0]), `S8-Q${i + 1}`).toBe(norm(printed));
    });
  });

  it("ids unique across the whole 828-item family (r340 l3gram appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(951);
    expect(new Set(ids).size).toBe(951);
  });
});
