import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { normalizeTypedAnswer } from "../src/lib/typed-answer";

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
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; family: string; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const FIN1400DEY = [266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284] as const;

// کلیدهای چاپیِ «راهنمای تصحیح دی ۱۴۰۰» ص۳۳۴-۳۳۵ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "a", 2: "b", 3: "a", 4: "b" }; // True/False/True/False
const K_L2: Record<number, string> = { 1: "b", 2: "a" }; // False / True
const K_PIC: Record<number, string> = { 1: "e", 2: "a", 3: "c", 4: "b" }; // d اضافهٔ چاپی — جای چهارم (نخستین در خانواده)
const K_DEF: Record<number, string> = { 1: "c", 2: "a", 3: "d" }; // b اضافه — جای دوم
const K_G: Record<number, string> = { 1: "d", 2: "a", 3: "a", 4: "c" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "a" }; // True / True
const K_R1M: Record<number, string> = { 3: "c", 4: "d" };
const K_R2TF: Record<number, string> = { 1: "b", 2: "a" }; // False / True
const K_R3TF: Record<number, string> = { 1: "b", 2: "b" }; // False / False

describe("jozve topic grammar bank g12 — official nationwide dey 1400 exam (r305 extraction receipt)", () => {
  it("bank shape: three hundred four lessons, dey 1400 adds 19 banks / 51 items (family 1494)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 304 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      266: 4, 267: 3, 268: 4, 269: 5, 270: 4, 271: 3, 272: 3, 273: 1,
      274: 4, 275: 1, 276: 2, 277: 1, 278: 5, 279: 2, 280: 2, 281: 2,
      282: 2, 283: 2, 284: 1,
    };
    const levels: Record<number, string> = {
      266: "استاندارد", 270: "استاندارد", 272: "استاندارد", 274: "استاندارد",
      279: "استاندارد", 281: "استاندارد",
    };
    for (const n of FIN1400DEY) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری دی ۱۴۰۰");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(266).questions.map((q) => q.id)).toEqual([
      "g12-fin1400dey-l1tf1", "g12-fin1400dey-l1tf2", "g12-fin1400dey-l1tf3", "g12-fin1400dey-l1tf4",
    ]);
    expect(L(284).questions.map((q) => q.id)).toEqual(["g12-fin1400dey-cx1"]);
    // آزمون رسمی سراسری دی ۱۴۰۰: ۵۱ آیتم در ۱۹ بانک — خانواده: ۱۳۹۰ + ۵۱ = ۱۴۴۱
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1494);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1494);
  });

  it("provenance: source.final1400dey registered — sixth official-source round, four multi-blank keys, four-example (0/25) list, Arabic-yeh header", () => {
    const src = bank.source.final1400dey as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("329-333");
    expect(String(src.keyPages)).toContain("334-335");
    expect(src.banks).toBe(19);
    expect(src.questions).toBe(51);
    expect(src.keys).toBe(51);
    expect(src.sections).toBe(19);
    expect(src.extractedRound).toBe(305);
    expect(src.audioFilesAbsent).toBe(true); // بخشِ شنیداری هست؛ فایلِ صوتی در دسترس نیست
    expect(String(src.titlePrinted)).toContain("دي ماه سال ۱۴۰۰"); // «ي عربی» چاپی — وفاداریِ یونی‌کدی
    expect(String(src.titlePrinted)).toContain("کلیهٔ رشته‌ها");
    expect(String(src.branchVariant)).toContain("چندخالی");
    expect(String(src.branchVariant)).toContain("چهارم‌جای");
    expect(String(src.branchVariant)).toContain("Audio file (PDF)");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Saadi Shirazi");
    expect(String(open.items)).toContain("Sport");
    const receipts = String(src.receipts);
    expect(receipts).toContain("arrived, took"); // کلیدِ دولایهٔ ۷
    expect(receipts).toContain("r299-۴۶"); // ساقهٔ ۵۰ عینِ r299
  });

  it("listening file 1 (266): Omid/wind energy T/F — keys a/b/a/b", () => {
    const qs = L(266).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b", "a", "b"]);
    expect(String(qs[0].question)).toContain("Wind is a type of clean energy resource.");
    expect(String(qs[2].question)).toContain("natural air cooling system");
  });

  it("listening file 2 (267): museum T/F + FIRST dual-blank key «arrived, took» with two printed gaps", () => {
    const qs = L(267).questions;
    expect(qs.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    const dual = qs[2];
    expect(dual.kind).toBe("typed");
    expect(dual.accepted).toEqual(["arrived, took"]);
    expect(String(dual.question)).toContain("their mothers --------------- and --------------- them home.");
    expect(String(dual.placeholder)).toContain("دو واژهٔ کلید");
  });

  it("listening file 3 (268): TWO dual-blank keys (walk , rain / stay, rest) + gym + full-sentence «Health is more important.»", () => {
    const qs = L(268).questions;
    expect(qs[0].accepted).toEqual(["walk, rain", "walk , rain"]); // ویرگولِ فاصله‌دارِ چاپی — دو واریانت
    expect(String(qs[0].question)).toContain("she had to --------------- home in ---------------");
    expect(qs[1].accepted?.[0]).toBe("gym");
    expect(qs[2].accepted).toEqual(["stay, rest"]);
    expect(String(qs[2].question)).toContain("stay at --------------- and take a ---------------");
    expect(qs[3].accepted).toEqual(["Health is more important."]);
    expect(String(qs[3].question)).toContain("What is more important according to Mobina?");
  });

  it("dictionary listening text (269): parenthesized-less printed markers ……12……-……16…… — information/order/definition/imagine/choice", () => {
    const qs = L(269).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["information", "order", "definition", "imagine", "choice"]);
    expect(String(qs[0].question)).toContain("get ……12……..--------------- about words");
    expect(String(qs[4].question)).toContain("the correct …..16……---------------");
    for (const q of qs) expect(String(q.placeholder)).toContain("fill in the blank");
  });

  it("picture vocab (270): extra (d) in FOURTH position — first in family — keys e/a/c/b", () => {
    const qs = L(270).questions;
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["e", "a", "c", "b"]);
    expect(qs[0].options[3]).toBe("C is the symbol for carbon."); // اضافه — جای چهارم
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("pool bank (271): printed pool shouted/born/demand/introduction (shouted extra FIRST) — keys born/introduction/demand; two-page stem is third family reuse", () => {
    const qs = L(271).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["shouted", "born", "demand", "introduction"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["born", "introduction", "demand"]);
    expect(String(qs[1].question)).toContain("This book has only a two-page");
    // رسیدِ بازاستفادهٔ سوم: ساقهٔ ۲۲ با r303-pool2 و r304-def1 هم‌چاپ است
    const r303Pool2 = bank.lessons.find((l) => l.lesson === 233)!.questions.find((q) => q.id === "g12-fin1400khh-pool2")!;
    const twoPagePrefix = "This book has only a two-page";
    expect(r303Pool2.question.startsWith(twoPagePrefix)).toBe(true);
    expect(String(qs[1].question).startsWith(twoPagePrefix)).toBe(true);
  });

  it("definitions (272): extra (b) finish something in SECOND position — keys c/a/d", () => {
    const qs = L(272).questions;
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "a", "d"]);
    expect(qs[0].options[1]).toBe("finish something"); // اضافه — جای دوم
    expect(String(qs[1].question)).toContain("XY and YX");
  });

  it("own knowledge (273): TWO simultaneous letter-gaps s----/m--- — «Out of sight, out of mind» with spaced-comma guide key", () => {
    const qs = L(273).questions;
    expect(qs[0].accepted).toEqual(["sight, mind", "sight , mind"]);
    expect(String(qs[0].question)).toContain("Out of s ---------------, out of m ---------------");
    expect(String(qs[0].placeholder)).toContain("s و m");
  });

  it("grammar (274): tag/relative/passive/past-passive — keys d/a/a/c; faithful B-response «No, I haven’t.»", () => {
    const qs = L(274).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["d", "a", "a", "c"]);
    expect(String(qs[0].question)).toContain("B: No, I haven’t.");
    expect(qs[2].options[0]).toBe("should be informed");
    expect(qs[3].options[2]).toBe("were opened");
  });

  it("verb form (275): printed hint (see) — had seen", () => {
    const qs = L(275).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["had seen"]);
    expect(String(qs[0].question)).toContain("that man somewhere before. (see)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("word order (276): grids 33/34 — The-baby-asleep + John-second-conditional", () => {
    const qs = L(276).questions;
    expect(qs[0].accepted).toEqual(["The baby had fallen asleep when I got home."]);
    expect(qs[1].accepted).toEqual(["John could rest if he had more time."]);
    expect(String(qs[0].question)).toContain("got home / had fallen/ The baby/ asleep/ when /I/. /");
    expect(String(qs[1].question)).toContain("John/ he/ if / more time / had / could rest  /./");
  });

  it("relative pronoun (277): printed guide key «which» + explanatory note — multi-modal single-slot pattern", () => {
    const qs = L(277).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["which"]);
    expect(String(qs[0].question)).toContain("They bought a house");
    for (const q of qs) expect(String(q.placeholder)).toContain("دارای فعل");
  });

  it("NEW clean-energy reading (278): family-fresh text — True/True/c/d + full-sentence key 40 with (0/5)×2 marks", () => {
    const r1 = L(278).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "a"]);
    expect(r1.slice(2, 4).map((q) => G_LETTERS[q.answer])).toEqual(["c", "d"]);
    expect(String(r1[2].question)).toContain("nonrenewable means that they");
    expect(r1[3].options).toEqual(["design", "wind", "plant", "radiation"]);
    expect(r1[4].kind).toBe("typed");
    expect(r1[4].accepted).toEqual([
      "Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine.",
    ]);
    const earlier = bank.lessons.filter((l) => l.lesson < 278).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r1) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW respect-teachers reading (279/280): family-fresh text — False/True + printed dotted keys 43/44", () => {
    const r2 = L(279).questions;
    expect(r2.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(String(r2[0].question)).toContain("teachers were always teachers");
    const comp = L(280).questions;
    expect(comp[0].accepted).toEqual(["paying attention during lessons and following classroom rules"]);
    expect(comp[1].accepted).toEqual(["go far beyond their duties"]);
    const earlier = bank.lessons.filter((l) => l.lesson < 279).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r2) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of comp) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("NEW technology-health reading (281/282): family-fresh text — False/False + four-example (0/25)×4 key 47 + full-sentence 48", () => {
    const r3 = L(281).questions;
    expect(r3.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "b"]);
    expect(String(r3[1].question)).not.toContain("…"); // بدونِ نقطهٔ پایانیِ چاپی در ۴۶
    const qa = L(282).questions;
    expect(qa[0].accepted?.[0]).toBe("televisions, computers, online games, phones");
    expect(qa[1].accepted?.[0]).toBe("Because they can cause brain problems");
    expect(qa[1].accepted?.[1]).toBe("they can cause brain problems");
    const earlier = bank.lessons.filter((l) => l.lesson < 281).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of r3) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of qa) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (283): and/or — stem 50 is the documented fourth cross-round occurrence (r286-l14 origin, r299-46, r300)", () => {
    const qs = L(283).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["and", "or"]);
    expect(String(qs[1].question)).toContain("We can eat our lunch at the restaurant");
    // رسیدِ بازاستفاده: ساقهٔ ۵۰ عینِ conn2ِ r299 است (و ریشه در تمرینِ چاپیِ r286-l14)
    const r286Conn = bank.lessons.find((l) => l.lesson === 14)!.questions.find((q) => q.id === "g12-conn-2")!;
    const r299Conn = bank.lessons.find((l) => l.lesson === 167)!.questions.find((q) => q.id === "g12-fin99sho-conn2")!;
    expect(r286Conn.question).toBe(r299Conn.question);
    expect(String(qs[1].question)).toBe(r299Conn.question);
  });

  it("compound with picture (284): half-sentence key «but he had to read it» identical to r302-50 — stem prints «is» not «was»", () => {
    const cx = L(284).questions;
    expect(cx[0].accepted?.[0]).toBe("The book is boring, but he had to read it.");
    expect(cx[0].accepted?.[1]).toBe("but he had to read it");
    expect(String(cx[0].question)).toContain("The book is boring");
    expect(String(cx[0].question)).toContain("(read )");
    // موازیِ خانواده: کلیدِ نیمه‌جمله‌ایِ r302-50 عیناً همین است
    const r302Cx = bank.lessons.find((l) => l.lesson === 226)!.questions.find((q) => q.id === "g12-fin1400khr-cx1");
    expect(String(r302Cx?.accepted?.[1] ?? "")).toContain("but he had to read it");
  });

  it("typed answer normalization: every accepted variant of banks 266-284 round-trips; comma-spacing variants interchangeable by list", () => {
    for (const n of FIN1400DEY) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    // دو واریانتِ ویرگولِ فاصله‌دار هر دو مسیرِ پذیرش دارند (فهرستِ accepted)
    expect(normalizeTypedAnswer("walk, rain")).toBe("walk, rain");
    expect(normalizeTypedAnswer("walk , rain")).toBe("walk , rain");
    expect(normalizeTypedAnswer("sight, mind")).toBe(normalizeTypedAnswer("SIGHT, MIND"));
  });

  it("kind purity + collision: no id overlaps with lessons <266; typed sanity (accepted head ∈ options except word-order bank 276); ids all g12-fin1400dey-*", () => {
    for (const n of FIN1400DEY) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin1400dey-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 276) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN1400DEY.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 266).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
