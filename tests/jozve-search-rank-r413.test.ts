import { describe, expect, it } from "vitest";
import { searchJozve } from "@/lib/jozve-search.server";

// ------------------------------------------------------------------
// پیمان‌های r413 — «رتبه‌بندیِ phraseHit-اول»: عبارتِ پیوسته روی متنِ
// خام یک‌بار در حلقهٔ امتیازدهی محاسبه می‌شود و در ترتیبِ درون‌سندی
// tie-breakِ صریح است — هم‌امتیازها، رکوردِ عبارت‌دار جلوتر می‌افتد.
// ------------------------------------------------------------------

describe("searchJozve — tie-breakِ phraseHit در ترتیبِ درون‌سندی", () => {
  it("در هر گروهِ سند، هیچ رکوردِ بی‌عبارتی با امتیازِ ≤ جلوی رکوردِ عبارت‌دار نمی‌ایستد", () => {
    const r = searchJozve("حال کامل", { limit: 60 });
    expect(r.results.length).toBeGreaterThan(0);
    // بازسازیِ ترتیبِ درون‌سندی: نتایجِ هر doc به ترتیبِ پاسخ می‌آیند
    const perDoc = new Map<string, { score: number; phraseHit: boolean }[]>();
    for (const x of r.results) {
      const arr = perDoc.get(x.doc) ?? [];
      arr.push({ score: x.score, phraseHit: x.phraseHit === true });
      perDoc.set(x.doc, arr);
    }
    for (const [doc, arr] of perDoc) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[j].phraseHit && !arr[i].phraseHit) {
            // تنها جای مجازِ نقطهٔ عبارت‌دار پس از بی‌عبارت: امتیازِ اکیداً بیشتر
            expect(
              arr[i].score,
              `doc=${doc} — نتیجهٔ ${i} (score=${arr[i].score}) نباید جلوی عبارت‌دارِ ${j} (score=${arr[j].score}) بایستد`,
            ).toBeGreaterThan(arr[j].score);
          }
        }
      }
    }
  });

  it("امتیاز، پیش‌فرضِ ترتیب می‌ماند — عبارت‌دارِ کم‌امتیازتر جلو نمی‌پرد", () => {
    const r = searchJozve("passive voice", { limit: 60 });
    const perDoc = new Map<string, number[]>();
    for (const x of r.results) {
      const arr = perDoc.get(x.doc) ?? [];
      arr.push(x.score);
      perDoc.set(x.doc, arr);
    }
    for (const arr of perDoc.values()) {
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeLessThanOrEqual(arr[i - 1]!);
      }
    }
  });

  it("پرچمِ سیم همانِ محاسبهٔ حلقهٔ امتیازدهی است — همیشه true وقتی هست", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    for (const x of r.results) {
      if (x.phraseHit !== undefined) expect(x.phraseHit).toBe(true);
    }
  });

  it("تک‌واژه — نه پرچم، نه اثرِ ترتیبی (رفتارِ r412 دست‌نخورده)", () => {
    const r = searchJozve("library", { limit: 10, kind: "question" });
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.results.every((x) => !x.phraseHit)).toBe(true);
  });

  it("شکلِ پاسخ سالم — فیلدهایِ قدیمی سرِ جایشان", () => {
    const r = searchJozve("صفت ملکی", { limit: 5 });
    for (const x of r.results) {
      expect(typeof x.kind).toBe("string");
      expect(typeof x.doc).toBe("string");
      expect(typeof x.bookTitle).toBe("string");
      expect(typeof x.text).toBe("string");
      expect(typeof x.snippet).toBe("string");
      expect(typeof x.score).toBe("number");
    }
  });
});
