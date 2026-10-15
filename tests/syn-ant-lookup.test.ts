// ------------------------------------------------------------------
// Task 203 — قراردادهای خالصِ «دیکشنریِ جفت‌آگاه»:
//   ① buildSynAntIndex — نمایهٔ دوطرفهٔ جدول‌های SYN/ANT جزوه: هر ردیف
//      هم سرِ ردیف و هم همتا کلید می‌سازد (borrow ↔ lend از هر دو سو)
//   ② synAntPairsFor — برای واژهٔ بی‌جفت آرایهٔ خالی، نه undefined؛
//      کلید بی‌حساس به بزرگیِ حرف
//   ③ matchesViaPairs — جستجوی ازراهِجفت؛ عبارت‌ها سالم می‌مانند
//   ④ پوششِ همهٔ ۱۲ درس، ترتیبِ قطعی (مترادف→متضاد، الفبایی)، بدونِ تکرار
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";

import { lessons } from "@/data";
import {
  buildSynAntIndex,
  synAntPairsFor,
  matchesViaPairs,
  normalizePairWord,
} from "@/lib/syn-ant-lookup";

const index = buildSynAntIndex(lessons);

describe("buildSynAntIndex — نمایهٔ دوطرفه", () => {
  it("جفتِ واقعیِ جزوه از هر دو سو پیدا می‌شود: fast ↔ quick و borrow ↔ lend", () => {
    // سرِ ردیفِ مترادفِ درس ۱
    const fast = synAntPairsFor(index, "fast");
    expect(fast.some((p) => p.kind === "syn" && p.other === "quick")).toBe(true);
    // سمتِ همتا — «quick» هم «fast» را می‌بیند
    const quick = synAntPairsFor(index, "quick");
    expect(quick.some((p) => p.kind === "syn" && p.other === "fast")).toBe(true);
    // متضادِ درس ۳ از هر دو جهت
    expect(synAntPairsFor(index, "borrow").some((p) => p.kind === "ant" && p.other === "lend")).toBe(true);
    expect(synAntPairsFor(index, "lend").some((p) => p.kind === "ant" && p.other === "borrow")).toBe(true);
  });

  it("کلید بی‌حساس به بزرگیِ حرف و فاصلهٔ حاشیه است", () => {
    expect(synAntPairsFor(index, "FAST")).toEqual(synAntPairsFor(index, "fast"));
    expect(synAntPairsFor(index, "  Borrow ")).toEqual(synAntPairsFor(index, "borrow"));
    expect(normalizePairWord(" Quick ")).toBe("quick");
  });

  it("همهٔ ردیف‌های جزوه نمایه شده‌اند: پوششِ کاملِ جدول‌ها در ۱۲ درس", () => {
    let synRows = 0;
    let antRows = 0;
    for (const lesson of lessons) {
      synRows += lesson.synonyms.length;
      antRows += lesson.antonyms?.length ?? 0;
      // هر درسِ سرِ ردیف از نمایه پیدا می‌شود
      for (const row of lesson.synonyms) {
        expect(index.has(normalizePairWord(row.en))).toBe(true);
      }
      for (const row of lesson.antonyms ?? []) {
        expect(index.has(normalizePairWord(row.en))).toBe(true);
      }
    }
    // واقعیتِ فعلیِ جزوه‌ها — هر تغییرِ داده باید این پین را به‌روز کند
    expect(synRows).toBe(298);
    expect(antRows).toBe(179);
    // هر ردیفِ مترادف حداقل دو کلید دارد (سر + همتا)
    expect(index.size).toBeGreaterThanOrEqual(synRows + antRows);
  });

  it("ورودی‌ها سالم‌اند: lessonId در بازهٔ ۱..۱۲، همتای غیرخالی، ترتیبِ قطعی (مترادف→متضاد، الفبایی)", () => {
    for (const [key, list] of index) {
      expect(key).toBe(normalizePairWord(key));
      expect(list.length).toBeGreaterThan(0);
      for (const p of list) {
        expect(p.other.trim().length).toBeGreaterThan(0);
        expect(p.lessonId).toBeGreaterThanOrEqual(1);
        expect(p.lessonId).toBeLessThanOrEqual(12);
        expect(p.fa.length).toBeGreaterThan(0);
      }
      const kinds = list.map((p) => (p.kind === "syn" ? 0 : 1));
      expect([...kinds].sort((a, b) => a - b)).toEqual(kinds); // مترادف‌ها اول
      for (let i = 1; i < list.length; i++) {
        if (list[i].kind === list[i - 1].kind) {
          expect(list[i - 1].other.localeCompare(list[i].other)).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("بدونِ تکرار: (kind، other، lessonId) یکتاست", () => {
    for (const list of index.values()) {
      const seen = new Set(list.map((p) => `${p.kind}|${p.other}|${p.lessonId}`));
      expect(seen.size).toBe(list.length);
    }
  });

  it("عبارت‌های چندکلمه‌ای سالم می‌مانند: «in addition to» همتای besides است", () => {
    const besides = synAntPairsFor(index, "besides");
    expect(besides.some((p) => p.kind === "syn" && p.other === "in addition to")).toBe(true);
  });

  it("واژهٔ بی‌جفت آرایهٔ خالی می‌دهد، نه undefined", () => {
    expect(synAntPairsFor(index, "zzz-not-a-word")).toEqual([]);
    expect(synAntPairsFor(index, "")).toEqual([]);
  });
});

describe("matchesViaPairs — جستجوی ازراهِجفت", () => {
  it("«lend» کارتِ «borrow» را می‌آورد و برعکس", () => {
    expect(matchesViaPairs(index, "borrow", "lend")).toBe(true);
    expect(matchesViaPairs(index, "lend", "borrow")).toBe(true);
  });

  it("تطبیقِ جزئی و بی‌حساس به حرف: LEN و en هم می‌خوانند", () => {
    expect(matchesViaPairs(index, "borrow", "LEN")).toBe(true);
    expect(matchesViaPairs(index, "borrow", "en")).toBe(true);
  });

  it("پرس‌وجوی خالی هرگز نمی‌خواند؛ واژهٔ بی‌جفت هم نه", () => {
    expect(matchesViaPairs(index, "borrow", "")).toBe(false);
    expect(matchesViaPairs(index, "zzz-not-a-word", "lend")).toBe(false);
  });

  it("جفتِ متضادِ واقعیِ درس ۸ هم می‌خواند؛ عبارتِ بی‌ربط نه", () => {
    // fast ↔ slow در جدولِ متضادِ درس ۸ ردیفِ واقعی است — جستجو باید بخواند
    expect(matchesViaPairs(index, "fast", "quick")).toBe(true);
    expect(matchesViaPairs(index, "fast", "slow")).toBe(true);
    expect(matchesViaPairs(index, "borrow", "quick")).toBe(false);
  });
});
