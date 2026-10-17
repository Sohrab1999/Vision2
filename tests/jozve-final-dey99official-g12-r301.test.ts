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
const FIN99DEY = [191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208] as const;

// کلیدهای چاپیِ «راهنمای تصحیح دی ۹۹» ص۳۰۶-۳۰۷ — عیناً
const TF_LETTERS = "ab";
const G_LETTERS = "abcd";
const PIC_LETTERS = "abcde";
const K_L1: Record<number, string> = { 1: "a", 2: "b", 3: "d" };
const K_L2TF: Record<number, string> = { 1: "b", 2: "a", 3: "b", 4: "b" }; // B/A/B/B
const K_PIC: Record<number, string> = { 1: "b", 2: "e", 3: "d", 4: "c" }; // a اضافهٔ چاپی — جای نخست
const K_DEF: Record<number, string> = { 1: "c", 2: "d", 3: "a" }; // b اضافه — جای دوم
const K_G: Record<number, string> = { 1: "b", 2: "c", 3: "a", 4: "b" };
const K_R1TF: Record<number, string> = { 1: "a", 2: "b" }; // True / False
const K_R1M: Record<number, string> = { 3: "a", 4: "d" };
const K_R2TF: Record<number, string> = { 1: "b", 2: "a" }; // False / True
const K_R2M: Record<number, string> = { 3: "c", 4: "d" };

describe("jozve topic grammar bank g12 — official nationwide dey 99 exam (r301 extraction receipt)", () => {
  it("bank shape: two hundred forty-seven lessons, dey 99 official adds 18 banks / 61 items (family 1339)", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(
      Array.from({ length: 247 }, (_, i) => i + 1)
    );
    const counts: Record<number, number> = {
      191: 3, 192: 4, 193: 4, 194: 6, 195: 2, 196: 4, 197: 3, 198: 3, 199: 2,
      200: 4, 201: 2, 202: 2, 203: 4, 204: 2, 205: 4, 206: 2, 207: 4, 208: 6,
    };
    const levels: Record<number, string> = {
      191: "استاندارد", 192: "استاندارد", 196: "استاندارد", 198: "استاندارد",
      200: "استاندارد", 203: "استاندارد", 205: "استاندارد",
    };
    for (const n of FIN99DEY) {
      const l = L(n);
      expect(l.count, l.title).toBe(counts[n]);
      expect(l.questions, l.title).toHaveLength(counts[n]);
      expect(l.questions.map((q) => q.n), l.title).toEqual(Array.from({ length: counts[n] }, (_, i) => i + 1));
      expect(l.title, l.title).toContain("نهایی سراسری دی ۹۹");
      expect(l.level, l.title).toBe(levels[n] ?? "آموزشی — ورود آزاد");
    }
    expect(L(191).questions.map((q) => q.id)).toEqual([
      "g12-fin99dey-l1m1", "g12-fin99dey-l1m2", "g12-fin99dey-l1m3",
    ]);
    expect(L(208).questions.map((q) => q.id)).toEqual([
      "g12-fin99dey-ord1", "g12-fin99dey-ord2", "g12-fin99dey-ord3",
      "g12-fin99dey-ord4", "g12-fin99dey-ord5", "g12-fin99dey-ord6",
    ]);
    // آزمون رسمی سراسری دی ۹۹: ۶۱ آیتم در ۱۸ بانک — خانواده: ۱۱۶۶ + ۶۱ = ۱۲۲۷
    const total = bank.lessons.reduce((s, l) => s + l.count, 0);
    expect(total).toBe(1339);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1339);
  });

  it("provenance: source.final99dey registered — second official-source round, near-complete key 61/62, whole listening playable", () => {
    const src = bank.source.final99dey as Record<string, unknown>;
    expect(src).toBeTruthy();
    expect(src.pages).toBe("301-305");
    expect(String(src.keyPages)).toContain("306-307");
    expect(src.banks).toBe(18);
    expect(src.questions).toBe(61);
    expect(src.keys).toBe(61);
    expect(src.sections).toBe(17);
    expect(src.extractedRound).toBe(301);
    expect(src.audioFilesAbsent).toBe(true); // بخشِ شنیداری هست؛ فایلِ صوتی در دسترس نیست
    expect(String(src.titlePrinted)).toContain("دی ماه سال ۱۳۹۹");
    expect(String(src.branchVariant)).toContain("شش‌جمله‌ای");
    expect(String(src.branchVariant)).toContain("کلیدِ تقریباً کامل");
    const open = src.openWritingAbsent as Record<string, unknown>;
    expect(String(open.items)).toContain("Solar system");
    const receipts = String(src.receipts);
    expect(receipts).toContain("اشاره به کلمه"); // یادداشتِ اغماضِ املا
  });

  it("listening file 1 (191): elders theme — keys a/b/d", () => {
    const qs = L(191).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["a", "b", "d"]);
    expect(String(qs[0].question)).toContain("Who are our elders?");
    expect(qs[1].options).toEqual(["accept and learn", "love and care", "forgive and remember", "learn an answer"]);
    expect(String((bank.source.final99dey as Record<string, unknown>).receipts).length).toBeGreaterThan(0);
  });

  it("listening file 2 T/F (192): keys B/A/B/B with printed backtick in 6 — passport story", () => {
    const qs = L(192).questions;
    expect(qs.map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a", "b", "b"]);
    expect(String(qs[2].question)).toContain("He didn`t have to come back home.");
  });

  it("wind-turbine dialogue (193): numbered printed blanks …8…-…11… — generated/opposite/clean/remind", () => {
    const qs = L(193).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["generated", "opposite", "clean", "remind"]);
    expect(String(qs[0].question)).toContain("…8…---------------");
    expect(String(qs[3].question)).toContain("Yazd’s buildings");
    for (const q of qs) expect(String(q.placeholder)).toContain("fill in the blank");
  });

  it("TV dialogue (194): six numbered blanks — worst/choose/terrible/right/teenagers/enjoy", () => {
    const qs = L(194).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["worst", "choose", "terrible", "right", "teenagers", "enjoy"]);
    expect(String(qs[0].question)).toContain("…12…---------------");
    expect(String(qs[5].question)).toContain("There is nothing for older people to");
  });

  it("listening open Q&A (195): FULL printed sentence keys — He would go to the park / thinking games", () => {
    const qs = L(195).questions;
    expect(qs[0].accepted).toEqual(["He would go to the park."]);
    expect(qs[1].accepted).toEqual(["They can play one of their thinking games."]);
    expect(String(qs[0].question)).toContain("if it were sunny?"); // شرطیِ نوع دوم
  });

  it("picture vocab (196): five printed sentences with extra (a) in FIRST position — family first — keys b/e/d/c", () => {
    const qs = L(196).questions;
    expect(qs.every((q) => q.options.length === 5)).toBe(true);
    expect(qs.map((q) => PIC_LETTERS[q.answer])).toEqual(["b", "e", "d", "c"]);
    expect(qs[0].options[0]).toBe("My little sister sits on my mother’s lap all the time."); // اضافه
    expect(String(qs[0].question)).toContain("با توجه به تصاویر");
  });

  it("pool bank (197): printed pool dedicated/replaced/forgive/recommend (forgive extra) — keys dedicated/recommend/replaced", () => {
    const qs = L(197).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["dedicated", "replaced", "forgive", "recommend"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["dedicated", "recommend", "replaced"]);
    expect(String(qs[1].question)).toContain("A learner’s dictionary");
  });

  it("definitions (198): extra (b) in second position — keys c/d/a", () => {
    const qs = L(198).questions;
    expect(qs.every((q) => q.options.length === 4)).toBe(true);
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["c", "d", "a"]);
    expect(qs[0].options[1]).toContain("the part at the beginning of a book"); // اضافه
  });

  it("own knowledge (199): printed letter-gaps s-/w- — symbol / worm (early bird proverb)", () => {
    const qs = L(199).questions;
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["symbol", "worm"]);
    expect(String(qs[0].question)).toContain("I think O is the s --------------- for Oxygen");
    expect(String(qs[1].question)).toContain("the early bird catches the w ---------------");
    for (const q of qs) expect(String(q.placeholder)).toContain("first letter");
  });

  it("grammar (200): tag/relative/passive/conditional — keys b/c/a/b; capital-M «My brother» faithful", () => {
    const qs = L(200).questions;
    expect(qs.map((q) => G_LETTERS[q.answer])).toEqual(["b", "c", "a", "b"]);
    expect(String(qs[1].question)).toContain("No, My brother is writing the letter");
    expect(qs[0].options[1]).toBe("hasn’t she");
  });

  it("verb forms (201): printed hints (study)/(speak) — had studied / is spoken; lowercase «china» faithful", () => {
    const qs = L(201).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["had studied", "is spoken"]);
    expect(String(qs[0].question)).toContain("before he moved to china. (study)");
    expect(String(qs[1].question)).toContain("Tajikistan and Afghanistan. (speak)");
    for (const q of qs) expect(String(q.placeholder)).toContain("پرانتز");
  });

  it("word order (202): two full-sentence keys with printed bar marks (0.25)×4 and (0.5)(0.5) documented in receipts", () => {
    const qs = L(202).questions;
    expect(qs[0].accepted).toEqual(["Mina was upset because she had gotten a bad score."]);
    expect(qs[1].accepted).toEqual(["John could fix the car if he were at home."]);
    expect(String(qs[0].question)).toContain("had gotten / was / a bad score / she / Mina / upset / because");
  });

  it("dictionary reading (203/204): True/False/a/d + full-sentence keys with faithful double «into to» and no-printed-? stem", () => {
    const r1 = L(203).questions;
    expect(r1.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["a", "b"]);
    expect(r1.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["a", "d"]);
    expect(String(r1[1].question)).not.toContain("?");
    const qa = L(204).questions;
    expect(qa[0].accepted?.[0]).toContain("Quickly before they jump into to the next lesson");
    expect(qa[1].accepted?.[0]).toBe("They must have a native language dictionary.");
  });

  it("NEW Picasso reading (205/206): family-fresh text — False/True/c/d + world/creating; faithful «Picasso’ first paining»", () => {
    const r2 = L(205).questions;
    expect(r2.slice(0, 2).map((q) => TF_LETTERS[q.answer])).toEqual(["b", "a"]);
    expect(r2.slice(2).map((q) => G_LETTERS[q.answer])).toEqual(["c", "d"]);
    expect(String(r2[3].question)).toContain("It took --------------- for Picasso to finish his exam");
    const cl = L(206).questions;
    expect(cl.map((q) => q.accepted?.[0])).toEqual(["world", "creating"]);
    expect(String(cl[0].question)).toContain("Picasso’ first paining in modern Art");
    // نو بودنِ متن: هیچ ساقه‌ای از این بانک در بانک‌های قبلی خانواده نیست
    const earlier = bank.lessons.filter((l) => l.lesson < 205).flatMap((l) => l.questions.map((q) => q.question));
    for (const q of cl) expect(earlier.includes(q.question), q.id).toBe(false);
    for (const q of r2) expect(earlier.includes(q.question), q.id).toBe(false);
  });

  it("connectives (207): same pool but/and/so/or — keys but/so/and/or; printed space-before-comma 53 faithful", () => {
    const qs = L(207).questions;
    for (const q of qs) expect(q.options, q.id).toEqual(["but", "and", "so", "or"]);
    expect(qs.map((q) => q.accepted?.[0])).toEqual(["but", "so", "and", "or"]);
    expect(String(qs[1].question)).toContain("not comfortable , --------------- I will not buy them");
  });

  it("NEW six-slot paragraph ordering (208): first in family (r296/299/300 were four-slot) — guide keys c/f/a/b/d/e as position sentences", () => {
    const qs = L(208).questions;
    expect(qs.every((q) => q.kind === "typed")).toBe(true);
    expect(qs).toHaveLength(6);
    expect(qs[0].accepted).toEqual(["There are several reasons why Canada is one of the best countries in the world."]);
    expect(qs[1].accepted).toEqual(["First, Canada has an excellent health care system."]);
    expect(qs[2].accepted).toEqual(["Therefore, many patients are easily cured in hospitals in Canada."]);
    expect(qs[3].accepted).toEqual(["Second, it has a high standard of education for young people."]);
    expect(qs[4].accepted).toEqual(["In addition, there are many chances for them to get a good job."]);
    expect(qs[5].accepted).toEqual(["As a result, many people like to live in Canada."]);
    expect(String(qs[0].question)).toContain("جملهٔ نخست (Topic) پاراگراف کانادا");
    expect(String(qs[5].question)).toContain("جملهٔ پایانی (Concluding) پاراگراف کانادا");
    for (const q of qs) expect(String(q.placeholder)).toContain("بنویسید");
  });

  it("typed answer normalization: every accepted variant of banks 191-208 round-trips; apostrophe variants interchangeable", () => {
    for (const n of FIN99DEY) {
      for (const q of L(n).questions) {
        if (q.kind === "typed") {
          for (const a of q.accepted ?? []) {
            expect(normalizeTypedAnswer(a), `${q.id} :: ${a}`).toBeTruthy();
          }
        }
      }
    }
    expect(normalizeTypedAnswer("had studied")).toBe(normalizeTypedAnswer("HAD STUDIED"));
    expect(normalizeTypedAnswer("He would go to the park.")).toBe(
      normalizeTypedAnswer("he would go to the park")
    );
  });

  it("kind purity + collision: no id overlaps with lessons <191; typed sanity (accepted head ∈ options except ordering bank); ids all g12-fin99dey-*", () => {
    for (const n of FIN99DEY) {
      const qs = L(n).questions;
      for (const q of qs) expect(q.id.startsWith("g12-fin99dey-"), q.id).toBe(true);
      const kinds = new Set(qs.map((q) => q.kind ?? "mcq"));
      if (kinds.size === 1 && kinds.has("mcq")) {
        for (const q of qs) expect(q.options[q.answer], q.id).toBeTruthy();
      }
      for (const q of qs) {
        if (q.kind === "typed") {
          expect(q.accepted?.length ?? 0, q.id).toBeGreaterThan(0);
          if (n !== 208 && n !== 202) expect(q.options, q.id).toContain(q.accepted?.[0]);
          expect(q.placeholder, q.id).toBeTruthy();
        }
      }
    }
    const newIds = new Set(FIN99DEY.flatMap((n) => L(n).questions.map((q) => q.id)));
    const oldIds = bank.lessons.filter((l) => l.lesson < 191).flatMap((l) => l.questions.map((q) => q.id));
    for (const id of oldIds) expect(newIds.has(id), id).toBe(false);
  });
});
