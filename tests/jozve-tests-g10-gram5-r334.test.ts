import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r334 — گاردِ «۲۰ تست دستگریمی گرامر و نگارش» جزوهٔ دهم (ص۹۹-۱۰۰، کلیدِ توضیح‌دار ص۲۶۵-۲۶۶)
// دوازدهمین گروه / سی‌اُمین بانکِ درس‌محورِ پایهٔ دهم — ۲۰ MCQ با ترجمهٔ چاپی (الگوی r332).
// کلید چاپی ۲۰/۲۰ صفر واگرایی. داوری‌های رندر ۵-۲۲x: سربرگِ بی‌عنوان («سطح تستها: "صرفاً آموزشی" ، "ساده"»)،
// Q12 کلید (a) با رندرِ ص۲۶۶ حاکم (لایه «b» شناور نویز)، Q13-c در لایه با d یکسان شده بود
// (چاپ: nice black small metal)، Q14-a در لایه جابه‌جا (چاپ: beautiful wooden old)،
// Q2 «I expected is to be» لغزشِ چاپی، بالانویس‌های زندگی/قرمز/سیاه/قدیمی/آلمانی/less than با گپِ لایه.

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
    gram5?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const D21 = "-".repeat(21);
const D17 = "-".repeat(17);
const D15 = "-".repeat(15);

// —— کلیدِ چاپیِ ص۲۶۵-۲۶۶ (اندیسِ صفر-مبنا + واژهٔ کلید)
const KEYS_IDX = [3, 1, 1, 0, 1, 1, 2, 0, 1, 2, 2, 0, 3, 1, 3, 2, 0, 3, 3, 1];
const KEYS_WORDS = [
  "bad", "more expensive", "the best", "the worst", "worse",
  "the best", "cheaper", "the worst", "more expensive", "heavier than",
  "the worst", "pretty big brown Asian", "nice small black metal", "beautiful old wooden",
  "expensive big old", "the most", "long green silk", "nice German / more",
  "the cheapest", "less",
];
const TRANSLATIONS = [
  "دستخط او به اندازه دستخط من بد نیست.",
  "ماشین او ارزان بود. انتظار داشتم از ماشین من گران تر باشد.",
  "اتاق خیلی خوبیه، بهترین اتاق در این هتل است.",
  "بیمارستان خیلی افتضاحیه. بدترین بیمارستان در این شهر است.",
  "نگران نباش. امتحان خیلی سخت بود. نمره تو خیلی بد نبود. میتوانست از این هم بدتر باشد.",
  "غذای خیلی خوشمزه ایه، بهترین غذا در این رستوران است.",
  "هتل ما از همه هتل های دیگر شهر ارزان تر است.",
  "تجربه خیلی بدی بود. بدترین تجربه زندگی‌ام بود.",
  "ماشین قرمز از ماشین سیاه گران تر است.",
  "مرد ۷۰ کیلو وزن دارد. زن ۶۷ کیلو وزن دارد. مرد از زن سنگین وزن تر است.",
  "رابرت به خوبی نمی نویسد. او بدترین دستخط کلاس را دارد.",
  "برادرم یک گربه آسیای قهوه ای بزرگ قشنگ داره.",
  "در خانه ما یک جعبه فلزی سیاه کوچک زیبا وجود دارد.",
  "آنها در یک خانه چوبی قدیمی زیبا زندگی میکنند.",
  "دوستم هرگز به برادرش اجازه نمیدهد که ماشین قدیمی بزرگ گران قیمتش را براند.",
  "کدام ورزش به نسبت همه ورزش های دیگر المپیک خطرناکترین است؟",
  "آیا آن خانم قدبلند به آن پیراهن ابریشیمی سبز نگاه کرد؟",
  "آن دوچرخه آلمانی قشنگ از آن موتور سیکلت گران تر است.",
  "وسایل ارزان زیادی در این مغازه وجود دارد اما کیک ارزانترین آنهاست.",
  "من وقت کمتری از اون چیزی که برای تمام کردن آن کار لازمه، را دارم.",
];

const L30 = bank.lessons.find((l) => l.lesson === 30)!;

describe("jozve tests-g10 gram5 (r334 ۲۰ تست دستگریمی گرامر و نگارش — pp99-100, key pp265-266)", () => {
  it("gram5 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram5).toBeTruthy();
    const s = bank.source.gram5!;
    expect(s.exam).toContain("دستگرمی");
    expect(s.header).toContain("صرفاً آموزشی");
    expect(s.keyPages).toBe("265-266");
    expect(s.keyVerification).toContain("20/20");
    expect(s.extractedRound).toBe("r334");
    expect(s.pattern).toContain("r332");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(15);
    expect(s.printQuirks.some((q) => q.includes("صرفاً"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("دستگریمی"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("I expected is to be"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("جم رساک"))).toBe(true);
  });

  it("bank shape: 20 MCQ, translation per item, categories grammar, no kind/accepted", () => {
    expect(L30.count).toBe(20);
    expect(L30.questions).toHaveLength(20);
    L30.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
      expect(q.translation, q.id).toBeTruthy();
    });
    expect(L30.title).toContain("ص۹۹-۱۰۰");
    expect(L30.level).toContain("چهارگزینه‌ای");
  });

  it("all 20 keys locked to print (index + word) — zero divergence", () => {
    L30.questions.forEach((q, i) => {
      expect(q.answer, `Q${i + 1} idx`).toBe(KEYS_IDX[i]);
      expect(q.options[q.answer], `Q${i + 1} word`).toBe(KEYS_WORDS[i]);
      expect(q.translation, `Q${i + 1} tr`).toBe(TRANSLATIONS[i]);
    });
  });

  it("stems verbatim: blank runs, Q2 print slip, Q12-15/17/18 adjective-order options", () => {
    expect(L30.questions[0].question).toBe(`Her handwriting is not as ${D21} as my handwriting.`);
    expect(L30.questions[1].question).toBe(
      `His car was very cheap. I expected is to be ${D21} than my car.`,
    );
    expect(L30.questions[3].question).toBe(
      `It’s a terrible hospital. It’s ${D21} hospital in the city.`,
    );
    expect(L30.questions[11].question).toBe(`My brother has a ${D15} cat.`);
    expect(L30.questions[11].options).toEqual([
      "pretty big brown Asian", "pretty big Asian brown", "big pretty brown Asian", "big brown pretty Asian",
    ]);
    expect(L30.questions[12].options).toEqual([
      "small nice metal black", "small nice black metal", "nice black small metal", "nice small black metal",
    ]);
    expect(L30.questions[13].options).toEqual([
      "beautiful wooden old", "beautiful old wooden", "old beautiful wooden", "wooden beautiful old",
    ]);
    expect(L30.questions[16].options).toEqual([
      "long green silk", "green long silk", "silk long green", "long silk green",
    ]);
    expect(L30.questions[17].question).toBe(
      `That ${D15} bicycle is ${D17} expensive than this motorcycle.`,
    );
    expect(L30.questions[17].options).toEqual([
      "German nice / most", "nice German / most", "German nice / more", "nice German / more",
    ]);
    L30.questions.forEach((q) => {
      expect(q.question).toMatch(/-{10,}/); // جای‌خالیِ خط‌چین در همهٔ ساقه‌ها
    });
  });

  it("print quirks visible in data:Machine/Asia/colloquial translations/Persian digits/superlative forms", () => {
    expect(L30.questions[8].translation).toContain("ماشین قرمز از ماشین سیاه");
    expect(L30.questions[11].translation).toContain("گربه آسیای قهوه ای بزرگ قشنگ داره");
    expect(L30.questions[9].translation).toContain("مرد ۷۰ کیلو وزن دارد. زن ۶۷ کیلو وزن دارد.");
    expect(L30.questions[7].translation).toContain("بدترین تجربه زندگی‌ام بود");
    expect(L30.questions[13].translation).toContain("چوبی قدیمی زیبا زندگی میکنند");
    expect(L30.questions[17].translation).toContain("آن دوچرخه آلمانی قشنگ از آن موتور سیکلت");
    expect(L30.questions[19].translation).toContain("اون چیزی که برای تمام کردن آن کار لازمه");
    expect(L30.questions[15].options[2]).toBe("the most");
    expect(L30.questions[18].options[3]).toBe("the cheapest");
    expect(L30.questions[19].options[1]).toBe("less");
  });

  it("ids unique across the whole 502-item family (r334 gram5 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(951);
  });
});
