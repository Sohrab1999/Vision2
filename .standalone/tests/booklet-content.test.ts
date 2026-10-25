// ------------------------------------------------------------------
// راند ۲۰۹ — «جزوه در دسترس»: گاردهای دادهٔ استخراج‌شدهٔ جزوه‌ها
//   ① هر سه پایهٔ ۷/۸/۹ درس‌های کتاب درسی دارند و هر درس بخش دارد
//   ② قراردادِ بدونِ-ساختگی: هیچ رشته‌ای نامِ مؤلف/ناشر/تماس ندارد
//   ③ پین‌های ترمیمِ لیگاتور «لا» — کلاس/سلام/فوتبال درست، کالس/سالم غایب
//   ④ ساختارِ هر بخش سالم است (ردیف‌ها/خط‌ها/پاراگراف‌ها غیرخالی)
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { hasBooklet, bookletSections, bookletSectionCount, bookletVocabCount } from "@/data/booklet-content";
import { grade7Booklet } from "@/data/booklet/grade7";
import { grade8Booklet } from "@/data/booklet/grade8";
import { grade9Booklet } from "@/data/booklet/grade9";
import { BOOKLET_KIND_LABEL } from "@/lib/booklet-types";

// نامِ مؤلف/ناشر و نشانه‌های تماس — طبق درخواستِ صریحِ مالک حذف می‌شوند
const FORBIDDEN = [/لطفی/, /بوکان/, /lotfi/i, /موبایل/, /تلگرام/, /اینستا/, /0914\d{7,}/];

function allStrings(): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  for (const data of [grade7Booklet, grade8Booklet, grade9Booklet]) walk(data);
  return out;
}

describe("booklet data — presence & shape", () => {
  it("lessons 10-12 have booklet data; other lessons do not", () => {
    expect(hasBooklet(10)).toBe(true);
    expect(hasBooklet(11)).toBe(true);
    expect(hasBooklet(12)).toBe(true);
    expect(hasBooklet(1)).toBe(false);
    expect(hasBooklet(9)).toBe(false);
  });

  it("every grade has its Prospect lessons with at least one section each", () => {
    // Prospect 1-3: هفتم ۸ درس، هشتم ۷ درس، نهم ۶ درس (از سرصفحه‌های جزوه)
    expect(Object.keys(grade7Booklet).length).toBeGreaterThanOrEqual(7);
    expect(Object.keys(grade8Booklet).length).toBeGreaterThanOrEqual(6);
    expect(Object.keys(grade9Booklet).length).toBeGreaterThanOrEqual(5);
    for (const data of [grade7Booklet, grade8Booklet, grade9Booklet]) {
      for (const secs of Object.values(data)) {
        expect(secs.length).toBeGreaterThan(0);
        for (const s of secs) {
          expect(BOOKLET_KIND_LABEL[s.kind]).toBeTruthy();
          if (s.kind === "vocab") expect(s.rows.length).toBeGreaterThan(0);
          if (s.kind === "dialogue" || s.kind === "practice") expect(s.lines.length).toBeGreaterThan(0);
          if (s.kind === "notes") expect(s.paras.length).toBeGreaterThan(0);
          if (s.kind === "exam") expect(s.items.length).toBeGreaterThan(0);
          if (s.kind === "verbs") expect(s.rows.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("bookletSections returns sections sorted by textbook lesson and counts agree", () => {
    const secs = bookletSections(10);
    expect(secs.length).toBe(bookletSectionCount(10));
    expect(secs.length).toBeGreaterThan(20);
    expect(bookletVocabCount(10)).toBeGreaterThan(100);
  });

  it("every vocab row and dialogue line carries both sides", () => {
    for (const secs of [bookletSections(10), bookletSections(11), bookletSections(12)]) {
      for (const s of secs) {
        if (s.kind === "vocab") {
          for (const r of s.rows) {
            expect(r.en.trim().length).toBeGreaterThan(0);
            expect(r.fa.trim().length).toBeGreaterThan(0);
          }
        }
        if (s.kind === "dialogue") {
          for (const l of s.lines) {
            expect(l.en.trim().length).toBeGreaterThan(0);
            expect(l.fa.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

describe("booklet data — the no-fabrication & scrub contract", () => {
  it("no author/publisher/contact string leaks into the bundle", () => {
    const strings = allStrings();
    expect(strings.length).toBeGreaterThan(1000);
    for (const s of strings) {
      for (const re of FORBIDDEN) expect(re.test(s)).toBe(false);
    }
  });

  it("lam-alef restoration pins — restored forms present, corrupted forms absent", () => {
    const joined = allStrings().join(" ");
    // ترمیم‌شده‌های کلیدی
    expect(joined).toContain("کلاس");
    expect(joined).toContain("سلام");
    expect(joined).toContain("فوتبال");
    expect(joined).toContain("مکالمه");
    // شکل‌های خرابِ شناخته‌شده نباید در خروجی نهایی بمانند
    expect(joined).not.toContain("کالس");
    expect(joined).not.toContain("سالم "); // سالمِ خراب (سلام) — با مرزِ واژه
    expect(joined).not.toContain("فوتبلا");
    expect(joined).not.toContain("جمالت");
    expect(joined).not.toContain("سواالت");
  });

  it("grade-7 lesson-1 keeps its known booklet content (honesty pin)", () => {
    const l1 = grade7Booklet[1];
    expect(l1).toBeTruthy();
    const vocab = l1.find((s) => s.kind === "vocab");
    expect(vocab && vocab.kind === "vocab").toBe(true);
    const welcome = vocab!.rows.find((r) => r.en.toLowerCase() === "welcome");
    expect(welcome).toBeTruthy();
    expect(welcome!.fa).toContain("خوش آمد");
    const dialogue = l1.find((s) => s.kind === "dialogue");
    expect(dialogue && dialogue.kind === "dialogue").toBe(true);
    expect(dialogue!.lines.some((l) => /what.?s your name/i.test(l.en))).toBe(true);
  });

  it("grade-9 general verbs table rides its first lesson", () => {
    const any = bookletSections(12);
    const verbs = any.find((s) => s.kind === "verbs");
    expect(verbs).toBeTruthy();
    expect(verbs && verbs.kind === "verbs" ? verbs.rows.length : 0).toBeGreaterThan(50);
  });
});
