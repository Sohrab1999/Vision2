import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r324 — گاردِ «تست واژگان درس اول — بخش اول، سطح آموزشی» جزوهٔ دهم (ص۵۲-۵۳، کلید و ترجمهٔ چاپی ص۲۴۳-۲۴۴)
// دومین بانکِ درس‌محورِ پایهٔ دهم — ۴۰ MCQ با ترجمهٔ چاپیِ «ترجمه تست» در فیلد translation (الگوی r320/r321).
// کلیدِ حرفی از گریدِ چاپِ ص۲۴۳-۲۴۴ — ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی، صفر واگرایی.
// زوم‌های ۵۰۰۰-۸۰۰۰dpi برای ۱۴ نقطهٔ سرنوشت‌ساز (ایجاد/اینجا/پایمان/شصت/تولد/برج/خاص/انرا/سرزمین/معلم مان/...).

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[];
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
    exam2?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; translations: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// کلیدِ حرفیِ چاپِ ص۲۴۳-۲۴۴ (۴۰ حرف، ۴ سطرِ ۱۰تایی)
const KEY_LETTERS =
  "bbcddbaaab" + "bbcaabbacc" + "bbdbcbabba" + "dbbaabbacc";
// واژهٔ کلید هر آیتم (حرفِ چاپ → گزینه) — قفلِ دوم مستقل
const KEY_WORDS = [
  "a few", "alive", "amazing", "appropriate", "average", "based on", "boring", "common", "consider", "destroy",
  "creation", "blank", "destroying", "divides in to", "earth", "endangered", "especially", "lifespan", "knowledge", "instead",
  "injured", "increasing", "human", "hoping", "hear", "future", "for example", "forest", "tourists", "type",
  "anymore", "orally", "voluntary", "wonderful", "tower", "take care of", "tiger", "schedule", "strategy", "save",
];
// تصحیح: Q18 (حرف a) واژهٔ کلیدش lifespan است نه average — average فقط واژهٔ درونِ ساقه است

// ترجمه‌های چاپی — رونویسیِ رندر (۳۰۰dpi کامل + ۲۰۰۰-۸۰۰۰dpi جراحی)
const TRANSCRIPT: Record<number, string> = {
  1: "تام تماس گرفت که بگوید او چند دقیقه دیگر آنجا خواهد بود.",
  2: "آن یک تصادف بد بود. آنها خوش شانس هستند که زنده هستند.",
  3: "شگفت انگیز است که چند وقت یکبار شما رانندگیای می بینید که از موبایل استفاده می کنند.",
  4: "دولت باید یک سیستم آموزشی که برای نیازهای دانش آموزان مناسب تر باشد توسعه دهد.",
  5: "متوسط هزینه فیلم سازی تا ۲۵٪ افزایش یافته است.",
  6: "نمایش تلویزیونی براساس رخدادهای زندگی واقعی فقرا در جامعه مان بود.",
  7: "سبک نوشتاری او الان کسل کننده و منسوخ است و بسیاری از مردم از آن لذت نمی برند.",
  8: "ما برای رسیدن به هدف مشترکمان نیاز است که با همدیگر کار کنیم.",
  9: "با در نظر گرفتن سنش، سلامتی او خیلی خوب است.",
  10: "اگر ما به نابودی مناطق روستانی ادامه بدهیم حیوانات خیلی زیادی در آینده نزدیک منقرض خواهند شد.",
  11: "امروزه ایجاد شغلهای جدید برای افراد بیکار، برای بیشتر کشورها سخت است.",
  12: "اسم کاملت را در فضای خالی در پایین صفحه بنویس.",
  13: "جمعیت کوالای وحشی در معرض انقراض است.",
  14: "اینجا رودخانه به سه آبراه تقسیم می شود و ما باید از آبراه یک برای ماهیگیری برویم.",
  15: "بعد از یک هفته در دریا، احساس اینکه زمین مسطح دوباره زیر پایمان هست خوب بود.",
  16: "مارمولکها به عنوان گونه های در معرض خطر (انقراض) طبقه بندی شده اند.",
  17: "من هرگز پیاده روی های طولانی را بویژه در ایام زمستان دوست ندارم.",
  18: "یک دستگاه تلویزیون متوسط طول عمر شصت ساله دارد.",
  19: "برای ما خیلی ضروری است که دانش مان را درباره کنترل تولد افزایش دهیم.",
  20: "هلن نخواست هنر بخواند در عوض او تصمیم گرفت خلبان شود.",
  21: "تصادف ماشین وحشتناک هفته گذشته، او را به طور جدی مجروح کرد.",
  22: "معلم مان خیلی نگران است چونکه غیبت هایت در کلاس ها در حال افزایش است.",
  23: "بدن انسان یک دستگاه خیلی پیچیده است و یک از عجایب خلقت است.",
  24: "امتحان انگلیسی سخت بود، اما او هنوز امیدوار است نمره خوبی بگیرد.",
  25: "ما بهتر بود می شنیدیم آنچه که آنها مجبور بودند در مورد آن پروژه مهم بگویند.",
  26: "ما قادر بوده ایم این سرزمین را از توسعه نجات بدهیم (جلوی توسعه انرا بگیریم) و آنرا برای نسل های آینده نگه داریم.",
  27: "بسیاری از کشورها، به عنوان مثال مکزیک و ژاپن زلزله های زیادی دارند.",
  28: "منطقه بزرگی از خشکی که به طور پر پشتی با درختان و بوته ها و غیره پوشیده شده است و درختانش در نزدیک هم رشد می کنند جنگل است.",
  29: "کمبریج همیشه در تابستان پر از توریست است.",
  30: "نوع خاص از کتاب وجود دارد که او از آن لذت می برد؟",
  31: "من نمیخواهم دیگر شما را ببینم چونکه شما بد با من رفتار کردید.",
  32: "مهم است که بین یادگیری زبان انگلیسی بصورت شفاهی از یادگیری آن از طریق خواندن کتابها، تمایز قایل شویم.",
  33: "سازمان به شدت متکی به کمک داوطلبانه بود.",
  34: "ماشین های دورنگار یک اختراع شگفت انگیز در آن زمان بودند.",
  35: "آنها در یک برج ده طبقه در مرکز شهر زندگی می کردند.",
  36: "او چهارده سالش است، به اندازه کافی بزرگ هست که از خودش مراقبت کند.",
  37: "ببر حیوان وحشی بزرگی است که خطوط سیاه و زرد روی بدنش دارد.",
  38: "چطور او می تواند همه چیز را در برنامه شلوغش بگنجاند.",
  39: "جو یک متخصص در استراتژی نظامی است.",
  40: "شرایطش بحرانی بود، اما دکترها قادر بودند او را نجات دهند.",
};

const L5 = bank.lessons.find((l) => l.lesson === 5)!;
const LET = "abcd";

describe("jozve tests-g10 exam2 (r324 آموزشی — p52-53, key+translations pp243-244)", () => {
  it("exam2 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.exam2).toBeTruthy();
    const s = bank.source.exam2!;
    expect(s.exam).toContain("سطح آموزشی");
    expect(s.header).toContain("۲۴۳-۲۴۴");
    expect(s.keyPages).toBe("243-244");
    expect(s.keyVerification).toContain("40/40");
    expect(s.extractedRound).toBe("r324");
    expect(s.pattern).toContain("r320");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(6);
    expect(s.printQuirks.some((q) => q.includes("Q12"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("Q20"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("پشتی"))).toBe(true);
  });

  it("bank 5 shape: 40 MCQ, 4 unique options each, no typed fields", () => {
    expect(L5.count).toBe(40);
    expect(L5.questions).toHaveLength(40);
    L5.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("40 answers locked letter-by-letter to the printed key grid pp243-244", () => {
    L5.questions.forEach((q, i) => {
      expect(LET[q.answer], `Q${q.n} letter`).toBe(KEY_LETTERS[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(KEY_WORDS[i]);
    });
  });

  it("40 printed translations locked verbatim to the render transcript", () => {
    L5.questions.forEach((q) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSCRIPT[q.n]);
    });
  });

  it("Persian purity: no Latin letters in translations (Persian digits OK)", () => {
    L5.questions.forEach((q) => {
      expect(/[A-Za-z]/.test(q.translation!), `Q${q.n}: ${q.translation}`).toBe(false);
    });
  });

  it("print quirks visible in data: Q12 «the from», Q20 «pilot art», Q28 «پشتی», Q13 انقراض-with-key-c", () => {
    const byN = (n: number) => L5.questions[n - 1];
    expect(byN(12).question).toContain("bottom of the from");
    expect(byN(20).question).toContain("become a pilot art");
    expect(byN(28).translation).toContain("پر پشتی");
    expect(LET[byN(13).answer]).toBe("c");
    expect(byN(13).options[byN(13).answer]).toBe("destroying");
    expect(byN(13).translation).toContain("انقراض");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(482);
  });
});
