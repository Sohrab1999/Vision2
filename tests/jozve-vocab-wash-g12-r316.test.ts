import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r316 — شست‌وشوی ۱۰۰ ترجمهٔ چاپیِ «۱۰۰ تست واژگان درس سوم» (l3) از
// «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان» ص۲۱۵-۲۱۸ — الگوی r315/r313.
// چاپِ جزوه حاکم است؛ رسیدِ source.translationsWashed جای translationRestorations (r274) را گرفت.

type TQ = {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
};
type TLesson = {
  lesson: number;
  title: string;
  count: number;
  source: {
    file: string;
    questionPages: string;
    keyGrid: string;
    translationsWashed?: {
      round: string;
      pages: string;
      section: string;
      method: string;
      items: number;
      supersedes: string;
      printQuirks: string[];
    };
  };
  questions: TQ[];
};
type TBank = { grade: string; source: unknown; answerArbitration: unknown; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g12.json", "utf8"),
) as unknown as TBank;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;
const FA = /[\u0600-\u06FF]/;

describe("jozve vocab wash g12-l3 (r316 print-verbatim wash receipt)", () => {
  it("wash receipt: round/pages/method/items/supersedes present", () => {
    const w = l3.source.translationsWashed!;
    expect(w.round).toBe("r316");
    expect(w.pages).toBe("215-218");
    expect(w.method).toContain("visual transcription");
    expect(w.items).toBe(100);
    expect(w.supersedes).toContain("translationRestorations");
    expect(w.printQuirks.length).toBeGreaterThanOrEqual(20);
  });

  it("old r274 restoration receipt is gone from lesson 3 (superseded), lesson 2 untouched", () => {
    expect((l3 as unknown as { translationRestorations?: unknown }).translationRestorations).toBeUndefined();
    const l2 = bank.lessons.find((l) => l.lesson === 2)!;
    expect((l2 as unknown as { translationRestorations?: { count: number } }).translationRestorations?.count).toBe(4);
  });

  it("all 100 translations present, Persian-pure, no Latin leak beyond the two printed brand names", () => {
    expect(l3.questions).toHaveLength(100);
    for (const q of l3.questions) {
      expect(q.translation && q.translation.trim().length > 10, `translation of ${q.id}`).toBe(true);
      expect(FA.test(q.translation!), `Persian translation of ${q.id}`).toBe(true);
      const clean = q.translation!.replace(/iGoogle|NPR/g, "");
      expect(/[A-Za-z]{3,}/.test(clean), `Latin leaked in translation of ${q.id}`).toBe(false);
    }
  });

  it("letter-by-letter locks of the washed print translations (spot anchors incl. former layer corruptions)", () => {
    const tr = (n: number) => l3.questions.find((q) => q.n === n)!.translation!;
    // قفل‌های ناحیه‌ای که ترجمهٔ قدیمیِ لایه‌آلوده تفاوت آشکار داشت:
    expect(tr(1)).toBe("پس از اتمام خواندن رمان، کتاب را به درستی در قفسه ش سر جای خودش گذاشتم.");
    expect(tr(2)).toContain("نیتروژن به نیترات در خاک تبدیل می شود");
    expect(tr(10)).toBe("اقتصاد بازار به معنای همکاری صلح آمیز و تبادل صلح آمیز کالا و خدمات است.");
    expect(tr(20)).toContain("آمادگی جسمانی");
    expect(tr(20)).toContain("هولة کمتر و سبزیجات بیشتری");
    expect(tr(22)).toContain("می خواهید برد که یک وعدة غذایی");
    expect(tr(24)).toContain("مصری ها نوشیدنی های الکلی مصرف نمی کنند");
    expect(tr(27)).toContain("به خانه می آید");
    expect(tr(30)).toContain("همهٔ ۴۳۴ بیمار");
    expect(tr(40)).toContain("هنگامیکه شنید پسرهایش از یکدیگر عذر خواهی کردند");
    expect(tr(42)).toContain("بسیاری از رودخانه ها خیلی آلوده شده اند");
    expect(tr(43)).toContain("۲۵ درصد از جمعیت جهان، ۸۰ درصد از منابع این سیاره");
    expect(tr(44)).toBe("تشعشع (اشعه) بمب از طریق هوا پخش شد و هزاران نفر کشته شدند.");
    expect(tr(46)).toContain("در عوض (باید) داخل خطوط بمانند");
    expect(tr(48)).toContain("چیزهایی که سایر پستانداران را می کشند، غلبه کنیم");
    expect(tr(54)).toContain("درایو سی دی شما پایین کشیده شده است");
    expect(tr(56)).toContain("کلوچه ها برای هضم بسیار مفید هستند");
    expect(tr(58)).toContain("مصرف کننده قهوه الکل است");
    expect(tr(58)).toContain("به کبدش وارد کرده است");
    expect(tr(60)).toBe("تنها بخش ساندویچ که من دوست ندارم گوجه فرنگی است، اما بوقلمون، کاهو و سس مایونز خوب هستند.");
    expect(tr(61)).toContain("حدود ۱۳۰۰۰ انواع گل رز قابل شناسایی");
    expect(tr(62)).toContain("به اندازة ارزش غذایی، به نوع (گوناگونی) و طعم فکر کنید");
    expect(tr(65)).toContain("هنرهای الکتریکی");
    expect(tr(65)).not.toContain("الکترونیک آرتس");
    expect(tr(65)).toContain("داستان های خبری را با دوستان خود به اشتراک بگذارید");
    expect(tr(67)).toContain("با دردی که در اثر سرطان می کشد، انجام داد");
    expect(tr(68)).toBe("یک مزیت آموزشی بالقوه در این که اجازه دهیم تصاویر داستان بگویند، به جای گفته شدن کلمه وجود دارد.");
    expect(tr(70)).toContain("افزایش آگاهی و درک مشکلات خود بحث می کنند");
    expect(tr(72)).toContain("در بعد از ظهر ۸ مه، ۲۰۰۵، هوجینتائو، رئیس جمهور چین");
    expect(tr(72)).toContain("صفرمراد نیازوف ملاقات کرد");
    expect(tr(74)).toContain("در بیشتر مواقع، بریتانیا نقش مهمی در سازماندهی منابع جهانی قدرت، حق در خاورمیانه");
    expect(tr(75)).toContain("زوج واقعاً خوشبختی هستیم");
    expect(tr(76)).toContain("دیوارهایی دارند که گرما را جذب کنند");
    expect(tr(80)).toContain("در فواصل کوتاهی");
    expect(tr(87)).toContain("به آرامی هضم شود");
    expect(tr(88)).toContain("انشای انگلیسی خودم می ترسم");
    expect(tr(92)).toContain("برادرزاده محبوبم را دوست دارم");
    expect(tr(98)).toContain("منابع پاکتر انرژی ادامه دهیم");
    expect(tr(99)).toContain("مقدار چربی موجود در غذایش را کاهش دهد");
  });

  it("answer keys untouched by the wash (print headers 100% agree with JSON — r316 arbitration)", () => {
    // کلیدها از گریدِ ص۲۱۸ در راندِ اصلی آمده و r316 دوباره با هدرهای چاپی ص۲۱۵-۲۱۸ سنجید: صفر واگرایی.
    const spots: Array<[number, number]> = [
      [1, 0], [10, 2], [22, 1], [30, 2], [44, 2], [48, 1], [60, 1], [65, 1],
      [68, 0], [74, 0], [75, 0], [80, 1], [87, 2], [88, 2], [98, 3], [100, 0],
    ];
    for (const [n, ans] of spots) {
      expect(l3.questions.find((q) => q.n === n)!.answer, `answer of Q${n}`).toBe(ans);
    }
    expect(bank.answerArbitration).toBeTruthy();
  });
});
