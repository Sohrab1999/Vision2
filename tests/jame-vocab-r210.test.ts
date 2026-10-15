import { describe, expect, it } from "vitest";
import { lessons } from "@/data";
import { TOTAL_VOCABULARY, LESSONS_META } from "@/data/lesson-meta";

// راند ۲۱۰ — «واژگانِ جامع» ادامهٔ فرمانِ استخراجِ دقیق: جدول‌های واژگانِ
// سه جزوهٔ جامع (دهم/یازدهم/دوازدهم) با پارسرِ run-stream استخراج و با
// سه‌لایهٔ تعمیر (gold بین‌جزوه‌ای، گیتِ توکنِ تأییدشده، بازنویسی‌های
// آموخته‌شده + اووررایدِ دستی) به درس‌های مرتبط پیوست شد:
//   جامع دهم → درس‌های ۷-۹ (Vision 1) + کلیدِ پایه هفتم → درس ۱۰
//   جامع یازدهم → درس ۱-۳، جامع دوازدهم → درس ۴-۶
// قرارداد: هیچ ردیفِ تعمیرنشده (سوپِ گلیف) وارد نشده؛ رسوب در
// booklet-extract/jame*-residue.txt برای راندهای بعدیِ کرون مانده است.

const COUNTS: Record<number, number> = {
  2: 233, 4: 232, 5: 200, 6: 149, 7: 100, 8: 140, 9: 176, 10: 922,
};

function vocabOf(id: number) {
  return lessons.find((l) => l.id === id)!.vocabulary;
}

function findWord(id: number, en: string) {
  return vocabOf(id).find((w) => w.en.toLowerCase() === en.toLowerCase());
}

describe("واژگانِ جامعِ گیت‌شده (راند ۲۱۰)", () => {
  it("پینِ شمارش: درس‌های هدف و مجموعِ کتاب ۳۵۶۶", () => {
    for (const [id, count] of Object.entries(COUNTS)) {
      expect(vocabOf(Number(id)).length).toBe(count);
    }
    expect(TOTAL_VOCABULARY).toBe(3566);
    expect(LESSONS_META.reduce((s, l) => s + l.vocabCount, 0)).toBe(
      TOTAL_VOCABULARY
    );
  });

  it("نمونه‌های تعمیرشده: از gold و بازنویسی‌های آموخته‌شده", () => {
    expect(findWord(7, "lose")!.fa).toBe("از دست دادن، گم کردن، باختن"); // «باختر ز» → باختن
    expect(findWord(7, "orally")!.fa).toBe("به طور شفاهی"); // «شفایه» → شفاهی
    expect(findWord(4, "A.D")!.fa).toBe("بعد از میلاد مسیح، میلادی"); // «میالد»
    expect(findWord(5, "advance")!.fa).toBe("پیشرفت، پیشرفت کردن"); // «پیشر فت»
    expect(findWord(5, "accessible")!.fa).toBe("قابل دسترسی"); // «دسی س»
    expect(findWord(6, "basis")!.fa).toBe("اساس- اصل");
    expect(findWord(9, "ashamed")!.fa).toBe("شرمنده، خجالت‌زده"); // «رسی منده»
    expect(findWord(10, "ache")!.fa).toBe("درد");
  });

  it("فیکس‌های باگِ دادهٔ ۲۰۹: لامپ/پس از/علاقه — گلیفِ خراب دیگر در درس ۱۰ نیست", () => {
    expect(findWord(10, "lamp")!.fa).toBe("لامپ، چراغ، فانوس");
    expect(findWord(10, "after")!.fa).toBe("پس از، بعد از");
    expect(findWord(10, "rice and kebab")!.fa).toContain("علاقه");
    expect(findWord(10, "lamp")!.fa).not.toContain("المپ");
  });

  it("هیچ الگوی خرابیِ شناخته‌شده‌ای در هیچ fa از ۱۲ درس نیست", () => {
    const broken = [
      "المپ", "عالقه", "اخالق", "تالش", "رسال", "پش از", "خیی", "مرصف",
      "پیشر فت", "ساختر", "رفتر", "داشتر", "شفایه",
      "دخیر", "میالد", "زمات", "کیم", "ییح", "رسحال",
    ];
    // الگوهای دوتاییِ «ر ز/ت ز» فقط وقتی خراب‌اند که «ز» تنها باشد
    // (نه در «دستور زبان») — با مرزِ توکن می‌سنجیم
    const finalN = [/ر ز(?=$|[\s)،؛])/, /ت ز(?=$|[\s)،؛])/];
    for (const l of lessons) {
      for (const w of l.vocabulary) {
        for (const b of broken) {
          expect(`${l.id}:${w.en}:${w.fa}`).not.toContain(b);
        }
        for (const re of finalN) {
          expect(re.test(w.fa)).toBe(false);
        }
      }
    }
  });

  it("نامِ مؤلف/ناشرِ جامع‌ها هرگز وارد نشده (فرمانِ مالک)", () => {
    for (const l of lessons) {
      for (const w of l.vocabulary) {
        expect(w.fa).not.toContain("جمال احمدی");
        expect(w.fa).not.toContain("احمدی و همکاران");
        expect(w.fa).not.toContain("لطفی");
        expect(w.fa).not.toContain("جزوه");
      }
    }
  });

  it("سلامتِ داده: بدونِ تکرارِ درون‌درسی و بدونِ تهی در درس‌های لمس‌شده", () => {
    for (const id of [2, 4, 5, 6, 7, 8, 9, 10]) {
      const seen = new Set<string>();
      for (const w of vocabOf(id)) {
        expect(w.en.trim().length).toBeGreaterThan(0);
        expect(w.fa.trim().length).toBeGreaterThan(0);
        expect(seen.has(w.en.trim().toLowerCase())).toBe(false);
        seen.add(w.en.trim().toLowerCase());
      }
    }
  });
});
