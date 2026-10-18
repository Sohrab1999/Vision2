import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r343 — گاردِ «تست گرامر و نگارش درس سوم - پایه دهم» جزوهٔ دهم (ص۱۳۸-۱۴۰، کلیدِ چاپیِ ص۲۸۳-۲۸۶)
// بیست‌ویکمین گروه / بانکِ ۷۴: ۴۶ MCQ به الگوی r341/r339 — هر آیتم ترجمهٔ چاپیِ «ترجمه تست» خود جزوه را دارد.
// کلیدِ چاپی ۴۶/۴۶ هم‌رأی با پیش‌پرکردنِ معنایی — صفر واگرایی. داوری‌های رندر ۶۰۰-۱۲۰۰۰dpi:
// سربرگ با ارقامِ فارسیِ «۲۸۳ تا ۲۸۶» (واصفِ «تا») + سطرِ سطحِ دوگانهٔ «"متوسط" و "استاندارد"» (یگانه در خانواده)؛
// چاپ‌غلطِ «درحایل» (Q43) — یِ بی‌نقطه در ۱۲۰۰۰dpi، دومین عضوِ خانوادهٔ «حایل» (r341)؛
// برچسب‌های قرمزِ کنکورِ شاخه+سال با ارقامِ فارسی: (زبان ۹۳)/(هنر ۹۴)/(تجربی ۹۶ - با تغییر)/(هنر ۱۴۰۰)؛
// Q7-d کادرِ بدونِ پرانتز؛ Q4-a/Q41-a/Q42-c اسلشِ چسبیده؛ تیره‌ها: ۷۳ ران/۷۳ جای‌خالی، استانداردِ ۲۲ با
// استثناهای Q7=۱۵+۲۲ / Q35=۱۷+۱۷ / Q37=۲۰+۱۹ / Q41=۱۵+۱۳ / Q42=۱۹+۱۹ (شمارشِ لایه حاکم — r338).

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string;
    gram8?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// نرمال‌سازیِ موتورِ چهارگزینه‌ای: کوچک‌سازی + آپاستروف + فروپاشیِ فاصله
const norm = (s: string) =>
  s.toLowerCase().replaceAll("’", "'").split(/\s+/).filter(Boolean).join(" ");

// کلیدِ چاپیِ ص۲۸۳-۲۸۶ (رونویسیِ رندر — گریدِ حرفی؛ Q1-16=ccdaabbcabbcdbdc، Q17-22=bdbbbb،
// Q23-27=ababb، Q28-33=ccbddd، Q34-37=bbba، Q38-40=dbb، Q41-44=acaa، Q45-46=da)
const KEY_GRID = "ccdaabbcabbcdbdcbdbbbbababbccbdddbbbadbbacaada";
// کلیدها به شکلِ واژهٔ گزینه (قفلِ دوگانه: اندیس + واژه)
const KEY_WORDS = [
  "were playing / started", "were making", "wanted", "While /was watching", "Were / came",
  "has / are having", "was tasting / tasted", "were searching", "was having / went", "was singing / when",
  "weighs", "wasn’t working / called", "love / don’t want", "talked", "hit / was playing",
  "don’t need / on my own", "themselves", "myself", "herself", "you",
  "was weaving / was fixing", "yourselves", "remembers / looks", "were talking", "he",
  "Do you know / appears", "himself", "them / they / me", "was packing / her", "me",
  "matters", "himself / smells", "Were / walked", "is being", "want / costs",
  "is sitting", "were talking / came", "were practicing / themselves", "wishes / has", "made / laughed",
  "themselves/ themselves", "is looking/ her", "I am teaching", "was raining", "your / yourselves",
  "started",
];

const B74 = bank.lessons.find((l) => l.lesson === 74)!;

describe("jozve tests-g10 gwr8 (r343 تست گرامر و نگارش درس سوم — pp138-140, key pp283-286)", () => {
  it("gram8 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram8).toBeTruthy();
    const s = bank.source.gram8!;
    expect(s.exam).toContain("ص۱۳۸-۱۴۰");
    expect(s.header).toContain("۲۸۳ تا ۲۸۶"); // ارقامِ فارسی با واصفِ «تا»
    expect(s.header).toContain("متوسط");
    expect(s.header).toContain("استاندارد");
    expect(s.keyPages).toBe("283-286");
    expect(s.keyVerification).toContain("46/46");
    expect(s.extractedRound).toBe("r343");
    expect(s.pattern).toContain("r341");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("درحایل"))).toBe(true); // چاپ‌غلطِ خانوادهٔ «حایل»
    expect(s.printQuirks.some((q) => q.includes("سؤاالت"))).toBe(true); // نهمین تجزیهٔ لیگاتور
    expect(s.printQuirks.some((q) => q.includes("شروع"))).toBe(true); // «رسی وع» لایه
    expect(s.printQuirks.some((q) => q.includes("پرسرعت"))).toBe(true); // مؤلفه‌های همبندِ ۹۰۰۰dpi
    expect(s.printQuirks.some((q) => q.includes("هنر ۱۴۰۰"))).toBe(true); // برچسب‌های کنکور
    expect(s.printQuirks.some((q) => q.includes("d"))).toBe(true); // کادرِ بدونِ پرانتزِ Q7-d
  });

  it("bank 74 shape: 46 MCQ grammar with translations, ids g10-l74-N", () => {
    expect(B74.count).toBe(46);
    expect(B74.level).toContain("متوسط و استاندارد");
    expect(B74.title).toContain("ص۱۳۸-۱۴۰");
    B74.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l74-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("grammar");
      expect(q.options.length, q.id).toBe(4);
      expect(q.translation, q.id).toBeTruthy();
      expect(q.question, q.id).not.toContain("[bank:");
    });
    // تیره‌های ۲۲تاییِ استاندارد با استثناهای عینِ چاپ (شمارشِ لایه حاکم — r338)
    const blankRuns = (s: string) => [...s.matchAll(/-{6,}/g)].map((m) => m[0].length);
    expect(blankRuns(B74.questions[6].question)).toEqual([15, 22]); // Q7
    expect(blankRuns(B74.questions[34].question)).toEqual([17, 17]); // Q35
    expect(blankRuns(B74.questions[36].question)).toEqual([20, 19]); // Q37
    expect(blankRuns(B74.questions[40].question)).toEqual([15, 13]); // Q41
    expect(blankRuns(B74.questions[41].question)).toEqual([19, 19]); // Q42
    expect(blankRuns(B74.questions[27].question)).toEqual([22, 22, 22]); // Q28 سه‌جای‌خالی
    const total = B74.questions.reduce((s: number, q: TQ) => s + blankRuns(q.question).reduce((a: number, b: number) => a + b, 0), 0);
    expect(total).toBe(1562); // ۷۳ رانِ لایه
    // برچسب‌های قرمزِ کنکورِ درون‌ساقه با ارقامِ فارسی
    expect(B74.questions[42].question).toContain("(زبان ۹۳)");
    expect(B74.questions[43].question).toContain("(هنر ۹۴)");
    expect(B74.questions[44].question).toContain("(تجربی ۹۶ - با تغییر)");
    expect(B74.questions[45].question).toContain("(هنر ۱۴۰۰)");
  });

  it("MCQ keys locked to the printed grid pp283-286: index + option-word, verbatim option order", () => {
    B74.questions.forEach((q, i) => {
      expect(q.answer, `B74-Q${i + 1} grid letter`).toBe("abcd".indexOf(KEY_GRID[i]));
      expect(norm(q.options[q.answer]), `B74-Q${i + 1} word`).toBe(norm(KEY_WORDS[i]));
    });
    // ترتیبِ عینِ چاپِ گزینه‌ها + اسلش‌های چسبیده
    expect(B74.questions[3].options).toEqual(["While /was watching", "When / watched", "As / watched", "While / were watching"]);
    expect(B74.questions[40].options[0]).toBe("themselves/ themselves");
    expect(B74.questions[41].options[2]).toBe("is looking/ her");
    expect(B74.questions[11].options[2]).toBe("wasn’t working / called");
    expect(B74.questions[12].options).toEqual(["are loving / aren’t wanting", "are loving / don’t want", "love / aren’t wanting", "love / don’t want"]);
  });

  it("stems verbatim from the print: attached dashes, space-dot-I, same very moment, typographic apostrophes", () => {
    expect(B74.questions[15].question).toContain("any help .I can do my homework");
    expect(B74.questions[20].question).toContain("As I---------------------- a jacket");
    expect(B74.questions[45].question).toContain("at the same very moment");
    expect(B74.questions[2].question).toContain("but I didn’t.");
    expect(B74.questions[26].question).toContain("his son’s birthday.");
    expect(B74.questions[13].question).toContain("they wouldn’t listen to me");
    expect(B74.questions[41].question).toContain("she hasn’t found anything yet");
    // دیالوگ‌های A/B با گیومهٔ تایپوگرافیک
    expect(B74.questions[21].question).toContain("A: “Can we have this delicious sweet?” B: “Yes sure, please help");
    expect(B74.questions[35].question).toContain("B: “She is very busy and");
  });

  it("translations verbatim: درحایل print-typo, spaced/joined periods, layer-noise resolved to clean print", () => {
    // چاپ‌غلطِ «درحایل» — عینِ چاپ محفوظ (خانوادهٔ «حایل» r341)
    expect(B74.questions[42].translation).toContain("درحایل که در ایتالیا تدریس می کنم");
    // نقطه‌گذاریِ ناسازگارِ خودِ چاپ
    expect(B74.questions[5].translation).toContain("دو برادر دارد . علی و رضا،");
    expect(B74.questions[15].translation).toContain("ندارم.خودم به تنهایی");
    expect(B74.questions[21].translation).toContain("ب: بله .البته، لطفا از خودتان پذیرایی کنید.");
    expect(B74.questions[35].translation).toContain("مینا الان کجا است ؟ ب: او خیلی مشغول است و پشت میز نشسته است .");
    // نویزهای لایه → چاپِ تمیز (رندر حاکم)
    expect(B74.questions[0].translation).toContain("باران شروع به باریدن کرد.");
    expect(B74.questions[14].translation).toContain("ماشین پرسرعت به برادر کوچکم زد ، او مشغول");
    expect(B74.questions[25].translation).toContain("می دانی چه اتفاقی افتاده است؟ جین امروز");
    expect(B74.questions[27].translation).toContain("من سعی کردم که به آنها بفهمانم که مشکلی وجود دارد اما آنها توجهی به من نکردند.");
    expect(B74.questions[22].translation).toContain("خیلی افسرده و ناراحت به نظر می آید.");
    expect(B74.questions[32].translation).toContain("آیا علی و رویا داشتند بدمینتون بازی می کردند");
    expect(B74.questions[34].translation).toContain("ماشینی که ماه بعد می خواهی آن را بخری خیلی هزینه اش بالاست");
    expect(B74.questions[43].translation).toContain("تمایلی نداشتیم حتی برای یک پیاده روی کوتاه بیرون برویم.");
    expect(B74.questions[45].translation).toContain("تا سوالات را بر روی تخته بنویسد");
    // خلوصِ فارسیِ ۴۶ ترجمه (بدونِ لاتین — قاعدهٔ r324/r325)
    B74.questions.forEach((q) => {
      expect(/[a-zA-Z]/.test(q.translation), q.id).toBe(false);
    });
  });

  it("file shape: 74 banks, 951 items, unique ids", () => {
    expect(bank.grade).toBe(10);
    expect(bank.lessons).toHaveLength(74);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(951);
    const ids = bank.lessons.flatMap((l: TL) => l.questions.map((q: TQ) => q.id));
    expect(ids.length).toBe(951);
    expect(new Set(ids).size).toBe(951);
    expect(ids).toContain("g10-l74-1");
    expect(ids).toContain("g10-l74-46");
  });
});
