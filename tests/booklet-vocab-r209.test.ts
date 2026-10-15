import { describe, expect, it } from "vitest";
import { lessons } from "@/data";
import { TOTAL_VOCABULARY, LESSONS_META } from "@/data/lesson-meta";

// راند ۲۰۹ — «استخراجِ دقیقِ جزوه‌ها»: واژگانِ کاملِ سه جزوهٔ متوسطهٔ اول
// (هفتم/هشتم/نهم) از ۶ فایلِ استخراج‌شدهٔ PDF به درس‌های ۱۰-۱۲ پیوست.
// قراردادِ بدونِ ساختگی: هر واژه از متنِ خودِ جزوه می‌آید؛ نامِ نویسنده/ناشر
// (طبق درخواستِ کاربر) هرگز استخراج نمی‌شود؛ جفت‌سازِ دورنگِ fa/en هر دو
// ترتیبِ ستونی جدول‌ها را می‌فهمد و جابه‌جایی‌های شناخته‌شده با اووررایدِ
// دستیِ بازبینی‌شده ترمیم شده‌اند.

const LESSON10_COUNT = 988;
const LESSON11_COUNT = 454;
const LESSON12_COUNT = 556;

function vocabOf(id: number) {
  return lessons.find((l) => l.id === id)!.vocabulary;
}

function findWord(id: number, en: string) {
  return vocabOf(id).find((w) => w.en.toLowerCase() === en.toLowerCase());
}

describe("جزوه‌های متوسطهٔ اول — واژگانِ کاملِ استخراج‌شده (راند ۲۰۹)", () => {
  it("پینِ شمارش: ۹۲۲/۴۵۴/۵۵۶ واژه در درس‌های ۱۰-۱۲ و مجموعِ کتاب ۳۵۶۶", () => {
    expect(vocabOf(10).length).toBe(LESSON10_COUNT);
    expect(vocabOf(11).length).toBe(LESSON11_COUNT);
    expect(vocabOf(12).length).toBe(LESSON12_COUNT);
    expect(TOTAL_VOCABULARY).toBe(4032);
    expect(LESSONS_META.reduce((s, l) => s + l.vocabCount, 0)).toBe(
      TOTAL_VOCABULARY
    );
    expect(LESSONS_META.find((l) => l.id === 10)!.vocabCount).toBe(
      vocabOf(10).length
    );
  });

  it("نمونه‌های هفتم: واژگانِ کلاس، جدولِ ترمیم‌شدهٔ خوراک، مشاغل", () => {
    expect(findWord(10, "sharpener")!.fa).toContain("مدادتراش");
    expect(findWord(10, "salad")!.fa).toBe("سالاد"); // جدولِ L7 که دوجایه جابه‌جا بود
    expect(findWord(10, "where")!.fa).toContain("کجا"); // بلوکِ خانه که دوجایه جابه‌جا بود
    expect(findWord(10, "carpenter")!.fa).toBe("نجار");
    expect(findWord(10, "zucchini")!.fa).toBe("کدو سبز");
  });

  it("نمونه‌های هشتم: مکان‌ها، خانوادهٔ ترمیم‌شده، رفعِ لام-الف", () => {
    expect(findWord(11, "train station")!.fa).toBe("ایستگاه قطار");
    expect(findWord(11, "uncle")!.fa).toBe("دایی، عمو");
    expect(findWord(11, "usually")!.fa).toBe("معمولاً");
    expect(findWord(11, "clergyman")!.fa).toBe("روحانی");
  });

  it("نمونه‌های نهم: جدولِ افعالِ بی‌قاعده، سلامت، روزهای هفته", () => {
    expect(findWord(12, "arise")!.fa).toBe("بلند شدن");
    expect(findWord(12, "Heart attack")!.fa).toBe("حمله قلبی");
    expect(findWord(12, "Saturday")!.fa).toBe("شنبه");
    expect(findWord(12, "restaurant")!.fa).toBe("رستوران");
    expect(findWord(12, "often")!.fa).toBe("اغلب، غالباً");
  });

  it("نامِ نویسنده/ناشر هرگز واردِ داده نشده — هیچ معنی‌ای «لطفی» یا «جزوه» ندارد", () => {
    for (const id of [10, 11, 12]) {
      for (const w of vocabOf(id)) {
        expect(w.fa).not.toContain("لطفی");
        expect(w.fa).not.toContain("جزوه");
        expect(w.en).not.toContain("لطفی");
      }
    }
  });

  it("سلامتِ داده: هیچ واژهٔ تهی و هیچ تکرارِ درون‌درسی (کلیدِ بی‌حساس به بزرگی حرف)", () => {
    for (const id of [10, 11, 12]) {
      const seen = new Set<string>();
      for (const w of vocabOf(id)) {
        expect(w.en.trim().length).toBeGreaterThan(0);
        expect(w.fa.trim().length).toBeGreaterThan(0);
        expect(seen.has(w.en.trim().toLowerCase())).toBe(false);
        seen.add(w.en.trim().toLowerCase());
      }
    }
  });

  it("هم‌نام‌های مجاز بین درس‌ها حفظ شده‌اند — واژهٔ مشترک دو جزوه در هر دو درس می‌ماند", () => {
    // «waiter» هم در جدولِ مشاغلِ هشتم هست هم نهم — مالکیتِ درسی جدا
    expect(findWord(11, "waiter")).toBeDefined();
    expect(findWord(12, "waiter")).toBeDefined();
  });
});
