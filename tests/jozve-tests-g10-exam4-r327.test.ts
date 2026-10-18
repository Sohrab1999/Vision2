import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r327 — گاردِ «تست واژگان درس دوم — سطح متوسط» جزوهٔ دهم (ص۸۷-۸۸، کلید و ترجمهٔ چاپی ص۲۵۹-۲۶۰)
// پنجمین/یازدهمین بانکِ درس‌محورِ پایهٔ دهم — ۴۰ MCQ با ترجمهٔ چاپیِ «ترجمه تست» در فیلد translation
// (الگوی r320/r324/r325). کلیدِ حرفی از گریدِ چاپِ ص۲۵۹-۲۶۰ — ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی، صفر واگرایی.
// کشفِ ویژهٔ راند: سطرِ گزینه‌های چاپِ Q3 و Q4 گزینهٔ چهارم را هم «c.» برچسب زده؛ کلیدِ چاپِ Q4 «(d)» است و
// ترجمهٔ چاپی «جمع آوری» حاکمیتِ collecting (اندیسِ d) را تأیید می‌کند — ناسازگاریِ درونیِ خودِ چاپ، مستند.
// زوم‌های ۲۶۰۰-۸۰۰۰dpi: هری پاتر (Q13)، پتر (Q19)، زردنگ (Q22)، لیوان (Q31)، عنصری (عامل) (Q36)،
// مطالی (Q37)، گیاهان (Q39)، بررسی/نوشتهاید (Q24)، خودت/می دهد (Q30)، می کند (Q12/Q18)، می بایستی (Q38)،
// می کشد (Q40)، کره ی/سیاره ی جدای (Q16/Q7).

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
    exam4?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; translations: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// کلیدِ حرفیِ چاپِ ص۲۵۹-۲۶۰ (۴۰ حرف، ۴ سطرِ ۱۰تایی)
const KEY_LETTERS =
  "bacddbabad" + "bcdcbbcbad" + "aabacdabab" + "abcabadabb";
// واژهٔ کلید هر آیتم (حرفِ چاپ → گزینه) — قفلِ دوم مستقل
const KEY_WORDS = [
  "near", "drops", "wonders", "collecting", "microbe", "sign", "Mercury", "pump", "liquids", "paint",
  "orbit", "observatory", "abroad", "delicious", "worst", "telescope", "cell", "carrying", "interesting", "suitable",
  "donated", "Plasma", "complete", "check", "compare", "described", "bacteria", "blood", "attack", "actually",
  "thousand", "clear", "exercise", "abroad", "in terms of", "element", "material", "modern", "hints", "planet",
];

// ترجمه‌های چاپی — رونویسیِ رندر (۳۰۰dpi کامل + ۲۶۰۰-۸۰۰۰dpi جراحی)
const TRANSCRIPT: Record<number, string> = {
  1: "وقتی که ما به نزدیک روستا آمدیم، صداهایی را شنیدیم.",
  2: "دیروز اولین قطرات باران روی زمین افتاد و ما هم خیلی لذت بردیم.",
  3: "تاکنون شما عجایب سیارات دیگر را کشف کردهاید؟",
  4: "او برای جمع آوری فنجانهای قهوهای قدیمی اطراف دفتر را گشت.",
  5: "یک موجود زنده خیلی کوچک که با چشمانتان نمیتوانید ببینید و میتواند بیماریهایی را بوجود آورد میکروب نامیده می شود.",
  6: "گریه کردن به عنوان یک نشانه ضعف میان بعضی افراد در وضعیتهای بد دیده می شود.",
  7: "این سیاره ی کوچک در منظومه شمسی، نزدیکترین سیاره به خورشید است و گاهی اوقات با چشم، درست بعد از غروب آفتاب، قابل رؤیت است. آن سیاره عطارد است.",
  8: "اگر باران سنگین ببارد این دستگاه آب را از زیر زمین پمپاژ می کند.",
  9: "وقتی که شما سرما میخورید یا آنفولانزا دارید، بهتر است مایعات زیادی بنوشید.",
  10: "تعطیلات به او فرصت داد که اتاق را رنگ بزند.",
  11: "ماهواره هر دوره زمان یک مدار را کامل می کند.",
  12: "یک ساختمان ویژه که دانشمندان در آن ماه، ستارهها، آب و هوا و غیره را تماشا می کند رصدخانه نامیده می شود.",
  13: "این کتابها در مورد هری پاتر هم در داخل و هم درخارج خیلی محبوب و جالب بودهاند.",
  14: "مزه آن نان قهوهای خانگی خیلی مطبوع است. به عبارت دیگر خیلی خوشمزه است.",
  15: "بدترین و وحشتناک ترین چیزی که میتواند اتفاق بیافتد، چیست؟",
  16: "جزئیات سطح کره ی ماه، فقط از طریق یک تلسکوپ میتوانند دیده شوند.",
  17: "کوچکترین قسمت یک موجود زنده که می تواند به طور مستقل وجود داشته باشد، سلول نامیده می شود.",
  18: "هواپیماهای زیادی وجود دارند که افراد بیشتری را نسبت به قبل، حمل می کند.",
  19: "زمانیکه او کمی پتر شود، دیدن اینکه چه رخ میدهد، (برایش) جالب خواهد بود.",
  20: "این مداد شمعیها برای استفاده در آب و هوای خیلی گرم مناسب نیستند.",
  21: "او پارسال صد هزار دلار به تحقیقات سرطان بیمارستان نیویورک اهدا کرد.",
  22: "پلاسما قسمت مایع زردنگ خون است که شامل سلولهای خونی هست.",
  23: "پلیس کنترل کامل موقعیت (وضعیت) را در دست داشت.",
  24: "بهتر است یک تماس تلفنی برقرار شود که بررسی شود (که آیا) شما برای شخص درستی (نامه) نوشتهاید.",
  25: "چطور زندگی در بریتانیا با ایالات متحده مقایسه می شود؟",
  26: "روش دیگر برای حل مسأله، در بخش سوم کتاب توصیف شده است.",
  27: "دارو علیه دسته ای از باکتری ها موثر است.",
  28: "پلیس قطرات کوچکی از خون را در آپارتمان پیدا کرده و سرانجام قاتل را شناسایی کردند.",
  29: "پدربزرگم دو سال پیش، بعد از رنج بردن از یک حمله قلبی شدید، فوت کرد.",
  30: "آنها همیشه میگویند که زمان چیزها را تغییر می دهد. اما در واقع شما بایستی خودت آنها را تغییر دهی.",
  31: "لیوان (بر روی زمین) افتاد و به هزار تکه (تبدیل) شد.",
  32: "آنها تلویزیونی با تصویری واضح و صدایی با کیفیت بالا دارند.",
  33: "تلاش کن تا (انجام) چند تمرین منظم به کارهای(مرتب) روزانه ات را اضافه کنی.",
  34: "در میان اعضای خانواده ما، خواهر کوچکترم تنها کسی بود که به خارج از کشور مسافرت کرد.",
  35: "اشتباه است که به فلوریدا فقط برحسب جاذبههای توریستی فکر کنیم.",
  36: "مذهب عنصری (عامل) بود که کشور را به دو گروه تقسیم کرد.",
  37: "او با خواندن روزنامهها، از دهه ۱۹۹۰ مطالی را برای رمانش جمع آوری کرد.",
  38: "اگر قرار است چنین شرکتهایی در دنیای مدرن رقابت کنند، می بایستی تغییر کنند.",
  39: "بگذار برای شما چند نکته مفید در مورد مراقبت کردن از گیاهان خانگی را بگویم.",
  40: "چه مدت برای سیاره مشتری، طول می کشد تا یک چرخش کامل دور خورشید، داشته باشد؟",
};

const L11 = bank.lessons.find((l) => l.lesson === 11)!;
const LET = "abcd";

describe("jozve tests-g10 exam4 (r327 متوسط — p87-88, key+translations pp259-260)", () => {
  it("exam4 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.exam4).toBeTruthy();
    const s = bank.source.exam4!;
    expect(s.exam).toContain("سطح متوسط");
    expect(s.header).toContain("۲۵۹-۲۶۰");
    expect(s.keyPages).toBe("259-260");
    expect(s.keyVerification).toContain("40/40");
    expect(s.extractedRound).toBe("r327");
    expect(s.pattern).toContain("r324");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(15);
    expect(s.printQuirks.some((q) => q.includes("Q3") && q.includes("Q4"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("جمع آوری"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("زردنگ"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("مطالی"))).toBe(true);
  });

  it("bank 11 shape: 40 MCQ, 4 unique options each, no typed fields", () => {
    expect(L11.count).toBe(40);
    expect(L11.questions).toHaveLength(40);
    L11.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("40 answers locked letter-by-letter to the printed key grid pp259-260", () => {
    L11.questions.forEach((q, i) => {
      expect(LET[q.answer], `Q${q.n} letter`).toBe(KEY_LETTERS[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(KEY_WORDS[i]);
    });
  });

  it("40 printed translations locked verbatim to the render transcript", () => {
    L11.questions.forEach((q) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSCRIPT[q.n]);
    });
  });

  it("Persian purity: no Latin letters in translations (Persian digits OK)", () => {
    L11.questions.forEach((q) => {
      expect(/[A-Za-z]/.test(q.translation!), `Q${q.n}: ${q.translation}`).toBe(false);
    });
  });

  it("print quirks visible in data: Q3/Q4 double-c, Q19 «پتر», Q22 «زردنگ», Q30 «خودت», Q37 «مطالی», Q31 «لیوان»", () => {
    const byN = (n: number) => L11.questions[n - 1];
    // Q3: گزینهٔ چهارم types؛ ساقه با نقطه نه علامت سؤال
    expect(byN(3).options).toEqual(["powers", "signs", "wonders", "types"]);
    expect(byN(3).question.endsWith("planets.")).toBe(true);
    // Q4: کلید d = collecting (برچسبِ چاپ c بود — ناسازگاریِ درونیِ چاپ)
    expect(LET[byN(4).answer]).toBe("d");
    expect(byN(4).options[byN(4).answer]).toBe("collecting");
    expect(byN(4).translation).toContain("جمع آوری");
    // کوئیرک‌های ترجمهٔ عینِ چاپ
    expect(byN(19).translation).toContain("پتر شود");
    expect(byN(22).translation).toContain("زردنگ");
    expect(byN(30).translation).toContain("خودت آنها");
    expect(byN(37).translation).toContain("مطالی");
    expect(byN(31).translation).toContain("لیوان");
    expect(byN(13).translation).toContain("هری پاتر");
    expect(byN(36).translation).toContain("عنصری (عامل)");
    expect(byN(27).translation).toContain("موثر");
    // الگوی می‌ها: چسبیده و جدای هر دو در داده
    expect(byN(9).translation).toContain("میخورید");
    expect(byN(8).translation).toContain("می کند");
    expect(byN(38).translation).toContain("می بایستی");
    expect(byN(7).translation).toContain("سیاره ی");
    expect(byN(16).translation).toContain("کره ی");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(605);
  });
});
