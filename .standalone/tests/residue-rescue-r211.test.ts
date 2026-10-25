import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { lessons } from "@/data";
import { TOTAL_VOCABULARY, LESSONS_META } from "@/data/lesson-meta";

// راند ۲۱۱ — «نجاتِ رسوب»: هر ۴۶۶ ردیفِ پارک‌شدهٔ گیتِ سخت‌گیرِ راندِ ۲۱۰
// با داوریِ دستیِ ردیف‌به‌ردیف نجات یافت و به درس‌های مرتبط پیوست:
//   ① هشدارهای مثبتِ کاذب — واژه‌های سالمِ فارسی که پیکرهٔ کوچک نمی‌شناخت
//     (امشب، هزار، کوه، دیوار، تحویل، ...) با وایت‌لیستِ تأییدشدهٔ در-بافت
//   ② سوپِ گلیف — بازنویسیِ دستیِ پاک (زماتز→زمان، عنرص→عنصر، چوت→چوبی)
//   ۶۶ ردیفِ هم‌نام با مدخل‌های موجود (دو املای en) با dedupe رد شدند.
// قراردادِ بدونِ ساختگی: هر ردیفِ نجات‌یافته یا عینِ جزوه است (keep) یا
// بازنویسیِ دستیِ بازبینی‌شده (ROW) — هیچ ردیفی بدونِ عبور از گیتِ توکن
// وارد نشده؛ فایل‌های رسوب حالا خالی‌اند.

const COUNTS_R211: Record<number, number> = {
  2: 234, 4: 341, 5: 303, 6: 246, 7: 105, 8: 169, 9: 232, 10: 988,
};

function vocabOf(id: number) {
  return lessons.find((l) => l.id === id)!.vocabulary;
}

function findWord(id: number, en: string) {
  return vocabOf(id).find((w) => w.en.toLowerCase() === en.toLowerCase());
}

describe("نجاتِ رسوبِ جامع‌ها (راند ۲۱۱)", () => {
  it("پینِ شمارش: درس‌های رشدیافته و مجموعِ کتاب ۴۰۳۲ (+۴۶۶ از رسوب)", () => {
    for (const [id, count] of Object.entries(COUNTS_R211)) {
      expect(vocabOf(Number(id)).length).toBe(count);
    }
    expect(vocabOf(1).length).toBe(204);
    expect(vocabOf(3).length).toBe(200);
    expect(vocabOf(11).length).toBe(454);
    expect(vocabOf(12).length).toBe(556);
    expect(TOTAL_VOCABULARY).toBe(4032);
    expect(LESSONS_META.reduce((s, l) => s + l.vocabCount, 0)).toBe(
      TOTAL_VOCABULARY
    );
    for (const [id, count] of Object.entries(COUNTS_R211)) {
      expect(LESSONS_META.find((l) => l.id === Number(id))!.vocabCount).toBe(
        count
      );
    }
  });

  it("هشدارهای مثبتِ کاذب: واژه‌های سالمِ جزوه عیناً حفظ شده‌اند (keep)", () => {
    expect(findWord(7, "tonight")!.fa).toBe("امشب");
    expect(findWord(8, "thousand")!.fa).toBe("هزار");
    expect(findWord(8, "rock")!.fa).toBe("سنگ، صخره");
    expect(findWord(8, "monkey")!.fa).toBe("میمون");
    expect(findWord(8, "Saturn")!.fa).toBe("سیاره زحل");
    expect(findWord(4, "agreement")!.fa).toBe("توافق، موافقت، قرارداد");
    expect(findWord(6, "delivery")!.fa).toBe("تحویل");
    expect(findWord(6, "lettuce")!.fa).toBe("کاهو");
  });

  it("بازنویسی‌های دستیِ سوپِ گلیف: هر ردیفِ ROW ترمیمِ تأییدشده دارد", () => {
    expect(findWord(8, "element")!.fa).toBe("عنصر"); // «عنرص»
    expect(findWord(8, "wooden")!.fa).toBe("چوبی"); // «چوت»
    expect(findWord(9, "offline")!.fa).toBe(
      "بدون اتصال به اینترنت، آفلاین"
    ); // «اینیر نت ، آف الین»
    expect(findWord(9, "wide")!.fa).toBe("گسترده، وسیع، عریض، پهن");
    expect(findWord(9, "safe")!.fa).toBe("ایمن، بی خطر");
    expect(findWord(2, "social services")!.fa).toBe("خدمات اجتماعی");
    expect(findWord(4, "divorce")!.fa).toBe("طلاق، جدایی"); // «طالق، جدات»
    expect(findWord(4, "authority")!.fa).toBe("صلاحیت، اختیار، اقتدار");
    expect(findWord(5, "basement")!.fa).toBe("زیرزمین"); // «زیر زمیر»
    expect(findWord(5, "veterinarian")!.fa).toBe("دامپزشک"); // «دامیی شک»
    expect(findWord(5, "lobster")!.fa).toBe("خرچنگ دریایی");
    expect(findWord(6, "idiom")!.fa).toBe("اصطلاح"); // «اصطالح»
    expect(findWord(6, "chemistry")!.fa).toBe("شیمی"); // «شییم»
    expect(findWord(6, "gasoline")!.fa).toBe("بنزین"); // «بی ین»
    expect(findWord(6, "proverb")!.fa).toBe("ضرب المثل"); // «رص ب المثل»
    expect(findWord(6, "Egyptian")!.fa).toBe("مصری (اهل کشور مصر)");
    expect(findWord(10, "geography")!.fa).toBe("جغرافیا"); // «جغرافز»
    expect(findWord(10, "timetable")!.fa).toBe("برنامه زمانی، جدول زمانی");
  });

  it("الگوهای خرابیِ تازه‌ترمیم‌شده دیگر در هیچ fa از ۱۲ درس نیست", () => {
    const broken = [
      "زماتز", "چوت", "عنرص", "نگرات", "سالمت", "دمپات", "نشستر",
      "جغرافز", "گرویه", "خییل", "سی زیجات", "حاضز", "دوربت", "منتشی",
      "پیغمی", "فروختر", "گشتر", "عالقمند", "توهیر", "مکانیگ", "قایط",
    ];
    for (const l of lessons) {
      for (const w of l.vocabulary) {
        for (const b of broken) {
          expect(`${l.id}:${w.en}:${w.fa}`).not.toContain(b);
        }
      }
    }
  });

  it("نامِ مؤلف/ناشر در هیچ ردیفِ نجات‌یافته نیست (فرمانِ مالک)", () => {
    for (const id of Object.keys(COUNTS_R211)) {
      for (const w of vocabOf(Number(id))) {
        expect(w.fa).not.toContain("جمال احمدی");
        expect(w.fa).not.toContain("لطفی");
        expect(w.fa).not.toContain("جزوه");
      }
    }
  });

  it("رسوب تمام شده: هر شش فایلِ residue حالا خالی‌اند", () => {
    for (const g of [7, 8, 9, 10, 11, 12]) {
      const p = resolve(
        process.cwd(),
        `booklet-extract/jame${g}-residue.txt`
      );
      const rows = readFileSync(p, "utf-8")
        .split("\n")
        .filter((l) => l.trim().length > 0 && l.includes("\t"));
      expect(rows).toHaveLength(0);
    }
  });
});
