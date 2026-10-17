import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r317 — شست‌وشوی ۱۰۰ ترجمهٔ چاپیِ «۱۰۰ تست واژگان درس دوم» (l2) از
// «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان» ص۱۹۸-۲۰۲ — الگوی r316.
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
      keyArbitration?: string;
      printQuirks: string[];
    };
  };
  questions: TQ[];
};
type TBank = { grade: string; source: unknown; answerArbitration: unknown; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g12.json", "utf8"),
) as unknown as TBank;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;
const FA = /[\u0600-\u06FF]/;

describe("jozve vocab wash g12-l2 (r317 print-verbatim wash receipt)", () => {
  it("wash receipt: round/pages/method/items/supersedes/keyArbitration present", () => {
    const w = l2.source.translationsWashed!;
    expect(w.round).toBe("r317");
    expect(w.pages).toBe("198-202");
    expect(w.section).toContain("درس دوم");
    expect(w.method).toContain("visual transcription");
    expect(w.items).toBe(100);
    expect(w.supersedes).toContain("r274 quick layer translations");
    expect(w.keyArbitration).toContain("zero divergence");
    expect(w.printQuirks.length).toBeGreaterThanOrEqual(30);
  });

  it("old r274 restoration receipt is gone from lesson 2 (superseded), lesson 3 wash receipt untouched", () => {
    expect((l2 as unknown as { translationRestorations?: unknown }).translationRestorations).toBeUndefined();
    expect(l3.source.translationsWashed?.round).toBe("r316");
  });

  it("all 100 translations present, Persian-pure, no Latin leak beyond the printed abbreviations", () => {
    expect(l2.questions).toHaveLength(100);
    for (const q of l2.questions) {
      expect(q.translation && q.translation.trim().length > 10, `translation of ${q.id}`).toBe(true);
      expect(FA.test(q.translation!), `Persian translation of ${q.id}`).toBe(true);
      const clean = q.translation!.replace(/W\.H\.O|cm/g, "");
      expect(/[A-Za-z]{3,}/.test(clean), `Latin leaked in translation of ${q.id}`).toBe(false);
    }
  });

  it("letter-by-letter locks of the washed print translations (spot anchors incl. former layer corruptions)", () => {
    const tr = (n: number) => l2.questions.find((q) => q.n === n)!.translation!;
    // قفل‌های ناحیه‌ای که ترجمهٔ قدیمیِ لایه‌آلوده تفاوت آشکار داشت:
    expect(tr(1)).toBe("دکتر خانوادگی من توصیه کرد که باید ورزش بیشتری را انجام دهم و برای بهتر شدن باید دست از سیگار کشیدن بردارم.");
    expect(tr(3)).toContain("تاثیرگذارترین ابزارهای پیشرفت فرهنگ");
    expect(tr(4)).toContain("تلاش کرده اند تا کشف کنند امواج در کجا شروع می شوند");
    expect(tr(6)).toContain("باید ۳۰ دقیقه تنفس");
    expect(tr(7)).toContain("فکر کردم امکانش هست از ماشین شما");
    expect(tr(9)).toContain("پیشنهاد می شوند، اعتیاد آورند");
    expect(tr(12)).toContain("دستاوردهای شما را برجسته کند");
    expect(tr(13)).toContain("اشتباهات وحشتناکش، شرکت قادر نبود از همهٔ منابع موجودش");
    expect(tr(14)).toContain("کمیته پیشنهادات متعددی برای بهبود استانداردهای آموزشی");
    expect(tr(15)).toContain("قالب های سازنده اساسی که جهان ما از آنها ساخته میشود");
    expect(tr(17)).toContain("کمی شوکه مانده بود، چند روز طول کشید تا متوجه شود چه اتفاقی برایش افتاده بود");
    expect(tr(18)).toContain("(سالاریوم) گفته می شد");
    expect(tr(18)).toContain("منشاء کلمه حقوق است");
    expect(tr(23)).toContain("به عنوان یک آهنربا برای افرادی که به دنبال شهرت و ثروت");
    expect(tr(25)).toContain("سالمون و انواع متعددی از غذا های دیگر");
    expect(tr(25)).toContain("اما آن دراصل به خاطر استیک و خرچنگش شناخته شده است");
    expect(tr(26)).toContain("قدیمترین خاطرات در تصوراتش پدیدار شد و او به یاد ایامی افتاد");
    expect(tr(27)).toContain("ساختمان درحال سوختن بودو رابرت گوشی تلفن را فوراً برداشت");
    expect(tr(29)).toContain("درمان سرطان دست یافته اند");
    expect(tr(32)).toContain("سوپی را که سفارش داده بود به خاطر حشره ای که داخلش بود");
    expect(tr(35)).toContain("تبلیغات تلویزیونی یکی از مؤثرترین، موفق ترین و محبوب ترین");
    expect(tr(37)).toContain("علامت اختصاری cm برای سانتی متر استفاده کنید");
    expect(tr(39)).toContain("چنین دستمزد کمی را به کسی که مهارت بالایی دارد. این توهین محسوب می شود");
    expect(tr(40)).toContain("سینا خیلی عاقلانه حزب را ترک کرد");
    expect(tr(42)).toContain("به طور فزاینده‌ای به تلویزیون وابسته هستند");
    expect(tr(45)).toContain("تا به قرن ها پیش بیشتر مرتبط با هنر باشد");
    expect(tr(46)).toContain("یوگای هاتا بر مرحلۀ فیزیکی تمرکز می کند");
    expect(tr(49)).toContain("وجود نداشت، رامان ناگهانی تصمیم به سفر گرفت");
    expect(tr(51)).toContain("باعث ویرانی کل زندگی بشر برروی زمین خواهد شد");
    expect(tr(53)).toContain("اما نمیدونم چطور در دسترس هست");
    expect(tr(54)).toContain("هورمون های زنانه به بدن کمک می کند تا در مقابل برخی عفونت ها دفاع کند");
    expect(tr(56)).toContain("زلزله باعث ویرانی های سنگینی شده بود به طوریکه پل دیگر قابل استفاده نبود");
    expect(tr(57)).toContain("درطبیعت جای خودش را دارد و بوم شناسی دانشی است");
    expect(tr(58)).toContain("ضروریست که روزها را تشخیص دهیم و بفهمیم هنگامیکه آنها شروع و تمام می شوند");
    expect(tr(60)).toContain("برای هدف متن می خوانیم حتی اگر فقط بخاطر لذت محض باشد");
    expect(tr(61)).toContain("از طریق گوش گیرها بازتاب ها را می شنوند");
    expect(tr(63)).toContain("نتایجی که در پی آن ها حاصل می شوند از پیش به ما اطلاع داده شده اند");
    expect(tr(66)).toContain("افزایش بازدهی عمومی مان افراد جوان اما ماهر را استخدام کنیم");
    expect(tr(67)).toContain("یک قاتل فراری را در خودش جا داده، محاصره کردند. متأسفانه تلاششان نتیجه بخش نبود");
    expect(tr(68)).toContain("می توانند تکی یا به صورت ترکیبی رخ دهند");
    expect(tr(69)).toContain("نتیجهٔ کل جنگ بعید است که تحت تأثیر آنچه او، به عنوان یک فرد");
    expect(tr(70)).toContain("با خودم فکر میکردم بدون کمک شما مهربانان الان در این کشور غریب");
    expect(tr(74)).toContain("توسط قلهٔ یخی بسیار بزرگی پوشیده شده است که ۷۰ درصد از آب تازه");
    expect(tr(75)).toContain("بهترین پرش در رقابت را داشته است");
    expect(tr(76)).toContain("ممکنه از نمادهای بین المللی فونتیک که معمولاً در اول دیکشنریها");
    expect(tr(77)).toContain("وضعیت اقتصادی وحشتناک را مدیریت کند: در غیر این صورت");
    expect(tr(78)).toContain("وسایل ارزان تر نقلیه برای دانشجویان بین المللی در ملبورن است");
    expect(tr(79)).toContain("بزرگانش قصد دارند کلیسا را موقتاً به مدرسه تبدیل کنند");
    expect(tr(82)).toContain("ثابت کردن اینکه موفق شدن حتی بدون تکنولوژی پیشرفته ممکن است");
    expect(tr(83)).toContain("آن چیزیست که مردم بعنوان یک کامپیوتر می دانند");
    expect(tr(84)).toContain("ظاهری ساده، مرتب و اتاق های بزرگی در داخل داشت");
    expect(tr(86)).toContain("بیش از ۲۰ سال و همچنین هزاران دلار صرف تحقیق در خصوص ریشۀ لغات کرد");
    expect(tr(88)).toContain("نیاز داره که توصیه های مفیدی به او داده شود");
    expect(tr(90)).toContain("سه قدم آن طرف تر روی صندلی بنشانید");
    expect(tr(91)).toContain("بیشتر زلزله های مخرب در مکان های کم جمعیت رخ می دهند");
    expect(tr(92)).toContain("همه فایل ها را به ترتیب حروف الفبا قرار دهیم");
    expect(tr(96)).toContain("درباره ی زمان فعل ها قبول شود");
    expect(tr(99)).toContain("کل اوقاتم در دبیرستان، یک روز به طور ویژه");
    expect(tr(100)).toContain("واقعاً اشتباه فاحشی انجام داده ای، من اصرار دارم");
  });

  it("answer keys untouched by the wash (print headers 84/100 + 10x10 grid 100/100 — zero divergence)", () => {
    // کلیدها از گریدِ c14/sec1 در راندِ اصلی آمده؛ r317 دوباره با هدرهای چاپی ص۱۹۸-۲۰۲ و گریدِ ۱۰×۱۰ِ ص۲۰۲ سنجید: صفر واگرایی.
    const spots: Array<[number, number]> = [
      [1, 1], [2, 1], [13, 0], [22, 1], [30, 1], [39, 0], [44, 0], [51, 0],
      [60, 1], [68, 2], [74, 0], [82, 2], [87, 3], [90, 1], [97, 1], [100, 3],
    ];
    for (const [n, ans] of spots) {
      expect(l2.questions.find((q) => q.n === n)!.answer, `answer of Q${n}`).toBe(ans);
    }
    expect(bank.answerArbitration).toBeTruthy();
  });
});
