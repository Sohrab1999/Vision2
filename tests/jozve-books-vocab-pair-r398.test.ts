// r398 — رسیدِ جفت‌سازیِ کورپوس‌محورِ جداولِ واژگانِ g10/g11/g12
// «مرتب» — ادامهٔ r397: جدول‌های دوستونیِ «لغات کلیدی» که در r397 ازپیش‌ادغام مانده بودند
// (W1 M1 W2 M2 در یک خط، معنیِ شکسته/جابه‌جا) اکنون از دلِ کورپوسِ r265 با ماشینِ حالتِ
// خط‌به‌خط بازجفت شدند؛ نثرِ نشتی‌کرده به سکشن‌های یادداشت منتقل شد؛ Collocations هم
// به قالبِ «word — meaning» بازآرایش شد. هیچ خط محتوایی دور ریخته نمی‌شود.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = { 10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json") };
const index = jozve("index.json");

const TABLES = [
  { g: 10, key: "لغات کلیدی پایه هفتم", rows: 200, notes: 11 },
  { g: 10, key: "لغات کلیدی پایه هشتم", rows: 179, notes: 14 },
  { g: 10, key: "لغات کلیدی پایه نهم", rows: 320, notes: 123 },
  { g: 10, key: "لغات کلیدی و تکمییل درس یکم", rows: 154, notes: 23 },
  { g: 10, key: "لغات کلیدی و تکمییل درس دوم", rows: 248, notes: 35 },
  { g: 10, key: "لغات کلیدی و تکمییل درس سوم", rows: 179, notes: 32 },
  { g: 10, key: "لغات کلیدی و تکمییل درس چهارم", rows: 187, notes: 28 },
  { g: 11, key: "لغات کلیدی و تکمییل درس اول", rows: 201, notes: 19 },
  { g: 11, key: "لغات کلیدی و تکمییل درس دوم", rows: 231, notes: 31 },
  { g: 11, key: "لغات کلیدی و تکمییل درس سوم", rows: 199, notes: 25 },
  { g: 12, key: "لغات کلیدی و تکمییل درس اول", rows: 270, notes: 44 },
  { g: 12, key: "لغات کلیدی و تکمییل درس دوم", rows: 359, notes: 51 },
  { g: 12, key: "لغات کلیدی و تکمییل درس سوم", rows: 268, notes: 165 },
];

const findVocab = (g: number, key: string) => {
  for (const ch of docs[g].chapters) {
    for (const s of ch.sections) {
      if (s.type === "vocab" && (s.title || "").includes(key)) return s;
    }
  }
  return null;
};

const findNotesAfter = (g: number, key: string) => {
  for (const ch of docs[g].chapters) {
    const idx = ch.sections.findIndex((s: any) => s.type === "vocab" && (s.title || "").includes(key));
    if (idx >= 0) {
      const nxt = ch.sections[idx + 1];
      return nxt && nxt.type === "notes" ? nxt : null;
    }
  }
  return null;
};

describe("r398 — جفت‌سازیِ کورپوس‌محورِ جداولِ واژگانِ گ۱۰-گ۱۲", () => {
  it("هر ۱۳ جدول با فرمتِ «word — meaning» و متادیتای pairedFrom بازجفت شده", () => {
    for (const t of TABLES) {
      const sec = findVocab(t.g, t.key);
      expect(sec, `${t.key} در g${t.g} هست`).toBeTruthy();
      expect(sec.lines.length, `ردیف‌های ${t.key}`).toBe(t.rows);
      expect(sec.pairedFrom, `${t.key} ردِ کورپوس دارد`).toMatch(/r398/);
      for (const l of sec.lines) {
        expect(l, `خطِ جدولِ ${t.key}`).toContain(" — ");
      }
    }
  });

  it("ردیف‌های رسید — سخت‌ترین جفت‌هایِ r397 درست شدند", () => {
    const g10l1 = findVocab(10, "لغات کلیدی و تکمییل درس یکم");
    const map = new Map(g10l1.lines.map((l: string) => [l.split(" — ")[0], l]));
    // در r397: «based on بر اساس ،بر طبق go hunting ر / به شکار ز / رفت» — معنیِ شکسته
    expect(map.get("go hunting")).toBe("go hunting — به شکار رفتن");
    expect(map.get("based on")).toBe("based on — بر اساس، بر طبق");
    // در r397: «be going to رز / داشت قصد graph …» — معنی جابه‌جا به همسایه
    expect(map.get("be going to")).toBe("be going to — قصد داشتن");
    expect(map.get("graph")).toContain("نمودار");
    expect(map.get("average")).toContain("میانگین"); // پالایشِ «میانگیر ن»

    const g12l3 = findVocab(12, "لغات کلیدی و تکمییل درس سوم");
    const m12 = new Map(g12l3.lines.map((l: string) => [l.split(" — ")[0], l]));
    expect(m12.get("absence")).toBe("absence — غیبت - فقدان");
    expect(m12.get("fond")).toContain("علاقمند"); // پالایشِ «عالقمند»

    const g10l4 = findVocab(10, "لغات کلیدی و تکمییل درس چهارم");
    const m10 = new Map(g10l4.lines.map((l: string) => [l.split(" — ")[0], l]));
    expect(m10.get("Egypt")).toBe("Egypt — کشور مصر"); // پالایشِ «مرص»
  });

  it("نثرِ نشتی‌کرده از جدول به سکشنِ یادداشتِ همان فصل منتقل شده — هیچ خطی دور ریخته نشده", () => {
    for (const t of TABLES) {
      const notes = findNotesAfter(t.g, t.key);
      expect(notes, `یادداشتِ ${t.key}`).toBeTruthy();
      expect(notes.lines.length, `خط‌های نثرِ ${t.key}`).toBe(t.notes);
      expect(notes.source).toContain("r398");
    }
  });

  it("پالایشِ لا↔ال در جداولِ تازه اعمال شده — شکل‌های شکسته بازنمی‌گردند", () => {
    for (const t of TABLES) {
      const sec = findVocab(t.g, t.key);
      const joined = sec.lines.join("\n");
      expect(joined, `باال در ${t.key}`).not.toMatch(/باال[ ی]/);
      expect(joined, `سواال در ${t.key}`).not.toContain("سواال");
      expect(joined, `تالش در ${t.key}`).not.toContain("تالش");
    }
  });

  it("Collocations پایهٔ دوازدهم به قالبِ واژه‌نامه بازآرایش شد", () => {
    const coll = findVocab(12, "Collocations Persian Meanings");
    expect(coll).toBeTruthy();
    expect(coll.lines[0]).toBe("not surprisingly — جای تعجب نیست");
    expect(coll.lines.filter((l: string) => l.includes(" — ")).length).toBe(92);
  });

  it("index.json با شمارِ خط‌های تازه سند‌ها تطبیق دارد", () => {
    for (const t of TABLES) {
      const grade = index.grades.find((x: any) => x.grade === t.g);
      let counted = 0;
      for (const ch of grade.chapters) {
        for (const s of ch.sections) {
          if (s.type === "vocab" && s.title.includes(t.key)) counted = s.lines;
        }
      }
      expect(counted, `index برای ${t.key}`).toBe(t.rows);
    }
  });
});
