import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r341 — گاردِ «۲۰ تست گرامر و نگارش درس سوم» جزوهٔ دهم (ص۱۳۴، کلیدِ توضیح‌دار و ترجمهٔ چاپیِ ص۲۷۹-۲۸۰)
// نوزدهمین گروه / شصت‌وششُمین بانکِ درس‌محورِ پایهٔ دهم — ۲۰ MCQ با ترجمهٔ چاپی (الگوی r334/r330).
// کلید چاپی ۲۰/۲۰ صفر واگرایی. داوری‌های رندر ۴-۱۲هزارdpi: سربرگِ «سطح: "آموزشی"» با ارقامِ فارسیِ
// «۲۷۹ - ۲۸۰»؛ چاپ‌غلطِ تکرارشوندهٔ «حایل» (Q1/Q3/Q5 — یِ بلندِ بی‌نقطه؛ لایه و رندر هم‌رأی — پدیدهٔ هنگامیک)؛
// «بِ» لایه = تجزیهٔ لیگاتورِ «یی» (سینمایی/صدایی/تنهایی/لباسهای — کشفِ راند)؛
// Q3 «منزل» بالانویسِ لایه («مین نل») → درون‌خطیِ تمیز؛ «می رفت/می رسید/می شوید» فاصله‌دار و
// «مسواک میکند» چسبیده (ناسازگاریِ خودِ چاپ)؛ Q13 «تمیز ن کنیم» نِ تک‌افتاده + «مهمه»؛
// Q18 «همکلاسیهایت/درخواست» چسبیده (شکافِ ۱-۳pt)؛ Q19 «واقعاً» فتحتانان؛ Q20 «پسری» (لایه «پسی»)؛
// Q16 توضیحِ کلید با «!!!!» پس از پرانتز؛ Q2 پایانِ «بود. "» — گیومه‌پایانِ ناسازگار.

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
    gram7?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const D18 = "-".repeat(18);
const D22 = "-".repeat(22);
const D20 = "-".repeat(20);
const D17 = "-".repeat(17);

// —— کلیدِ چاپیِ ص۲۷۹-۲۸۰ (اندیسِ صفر-مبنا + واژهٔ کلید)
const KEYS_IDX = [1, 2, 1, 0, 1, 1, 0, 1, 2, 0, 2, 2, 3, 2, 1, 1, 3, 0, 0, 1];
const KEYS_WORDS = [
  "was studying", "raised", "was driving", "saw", "was walking",
  "turned", "saw", "came", "heard", "was watching / arrived",
  "when", "while", "ourselves", "themselves", "ourselves",
  "himself", "himself", "yourselves", "need", "looked",
];
const TRANSLATIONS = [
  "دیروز در حایل که مشغول مطالعه کردن بودم، برادرم زنگ زد.",
  "زمانیکه دستم را بالا بردم، معلم در حال صحبت کردن بود.",
  "درخت بر روی ماشین پدرم افتاد، درحایل که به سمت منزل در حال رانندگی کردن بود.",
  "ما مشغول خوردن شام در رستوران بودیم زمانیکه یکی از دوستان قدیمی ام را دیدیم.",
  "دیروز خواهر کوچیکم مقداری شکلات خورد در حایل که پیاده به مدرسه می رفت.",
  "زمانیکه آقای سعیدی رادیو را در ماشینش روشن کرد، در حال رانندگی کردن به سمت خانه بود.",
  "در حالیکه او مشغول شنا کردن در رودخانه بود، یک ماهی بزرگ سیاه را دید.",
  "نارین مشغول تماشای یک فیلم سینمایی در مورد نیوتن بود زمانیکه من وارد شدم.",
  "در حالیکه زهرا در امتداد خیابان در حال قدم زدن بود، صدایی را در پشت سرش شنید.",
  "رامان مشغول تماشای تلویزیون بود زمانیکه ما رسیدیم.",
  "زمانیکه آنها برای پیاده روی به بیرون رفتند، خورشید در آسمان در حال درخشیدن بود.",
  "در حالیکه آنها مشغول جر و بحث کردن بودند، پدرشان به خانه وارد شد.",
  "بیا خودمان همه ساختمان را تمیز ن کنیم. مهمه که به همدیگر کمک کنیم.",
  "سارا و مینا خودشان به تنهایی خانه را مرتب کردند.",
  "شب گذشته من و مریم همه ظرفها را خودمان شستیم.",
  "پدر پری قصد دارد که خودش هفته آینده ماشینش را تعمیر کند.",
  "برادر کوچک من هر روز صبح خودش به تنهایی صورتش را می شوید و دندانهایش را مسواک میکند.",
  "اگه تو و همکلاسیهایت نمیتوانید خودتان به تنهایی این تمرین را انجام دهید از معلم درخواست کمک کنید.",
  "من واقعاً به لباسهای جدید برای زمستان آینده نیاز دارم.",
  "اون پسری که نزدیک برادرت ایستاده بود، به نظر خیلی خسته می رسید.",
];

const L66 = bank.lessons.find((l) => l.lesson === 66)!;

describe("jozve tests-g10 gram7 (r341 ۲۰ تست گرامر و نگارش درس سوم — p134, key pp279-280)", () => {
  it("gram7 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram7).toBeTruthy();
    const s = bank.source.gram7!;
    expect(s.exam).toContain("درس سوم");
    expect(s.header).toContain("آموزشی");
    expect(s.header).toContain("۲۷۹ - ۲۸۰");
    expect(s.keyPages).toBe("279-280");
    expect(s.keyVerification).toContain("20/20");
    expect(s.extractedRound).toBe("r341");
    expect(s.pattern).toContain("r334");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(15);
    expect(s.printQuirks.some((q) => q.includes("حایل"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("لیگاتورِ «یی»"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("!!!!"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("سؤاالت"))).toBe(true);
  });

  it("bank shape: 20 MCQ, translation per item, categories grammar, no kind/accepted", () => {
    expect(L66.count).toBe(20);
    expect(L66.questions).toHaveLength(20);
    L66.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
      expect(q.translation, q.id).toBeTruthy();
    });
    expect(L66.title).toContain("ص۱۳۴");
    expect(L66.level).toContain("چهارگزینه‌ای");
  });

  it("all 20 keys locked to print (index + word) — zero divergence", () => {
    L66.questions.forEach((q, i) => {
      expect(q.answer, `Q${i + 1} idx`).toBe(KEYS_IDX[i]);
      expect(q.options[q.answer], `Q${i + 1} word`).toBe(KEYS_WORDS[i]);
      expect(q.translation, `Q${i + 1} tr`).toBe(TRANSLATIONS[i]);
    });
  });

  it("stems verbatim: printed blank runs (18/22/36/20/17), typographic apostrophes, Q10 double blank", () => {
    expect(L66.questions[0].question).toBe(`While I ${D18} yesterday, my brother called.`);
    expect(L66.questions[2].question).toBe(
      `A tree fell on my father’s car while he ${D18} home yesterday.`,
    );
    expect(L66.questions[8].question).toBe(
      `While Zahra was walking along the street, she ${D22} a noise behind her.`,
    );
    expect(L66.questions[9].question).toBe(
      `Raman ${D18} television at 8 o’clock yesterday when we ${D18}.`,
    );
    expect(L66.questions[10].question).toBe(
      `The sun was shining in the sky ${D20} they went out for a walk.`,
    );
    expect(L66.questions[12].question).toBe(
      `Let’s clean all the building ${D18}. It’s important to help each other.`,
    );
    expect(L66.questions[15].question).toBe(
      `Pari’s father is going to repair his car ${D18} next week.`,
    );
    expect(L66.questions[17].question).toBe(
      `If you and your classmates can’t do this exercise by ${D18}, ask the teacher for help.`,
    );
    expect(L66.questions[18].question).toBe(`I really ${D17} some new clothes for next winter.`);
    expect(L66.questions[19].question).toBe(
      `That boy who was standing next to your brother ${D17} very tired.`,
    );
    // طولِ تیره‌ها = شمارشِ لایهٔ ص۱۳۴ (Q9=۲۲، Q10=۳۶ دوجای‌خالی، Q11=۲۰، Q19/Q20=۱۷، بقیه ۱۸)
    const blanks = [18, 18, 18, 18, 18, 18, 18, 18, 22, 36, 20, 18, 18, 18, 18, 18, 18, 18, 17, 17];
    L66.questions.forEach((q, i) => {
      expect(q.question.split("-").length - 1, q.id).toBe(blanks[i]);
    });
  });

  it("translation quirks locked: حایل ×3, یی-decomposition, spaced می-verbs vs joined میکند, تمیز ن کنیم, joined همکلاسیهایت/درخواست", () => {
    expect(L66.questions[0].translation).toContain("در حایل");
    expect(L66.questions[2].translation).toContain("درحایل");
    expect(L66.questions[4].translation).toContain("در حایل");
    expect(L66.questions[7].translation).toContain("سینمایی");
    expect(L66.questions[8].translation).toContain("صدایی");
    expect(L66.questions[13].translation).toContain("تنهایی");
    expect(L66.questions[16].translation).toContain("تنهایی");
    expect(L66.questions[17].translation).toContain("تنهایی");
    expect(L66.questions[18].translation).toContain("لباسهای");
    expect(L66.questions[18].translation).toContain("واقعاً");
    expect(L66.questions[4].translation).toContain("می رفت");
    expect(L66.questions[19].translation).toContain("می رسید");
    expect(L66.questions[16].translation).toContain("می شوید");
    expect(L66.questions[16].translation).toContain("مسواک میکند");
    expect(L66.questions[12].translation).toContain("تمیز ن کنیم");
    expect(L66.questions[12].translation).toContain("مهمه");
    expect(L66.questions[17].translation).toContain("همکلاسیهایت");
    expect(L66.questions[17].translation).toContain("درخواست");
    expect(L66.questions[19].translation).toContain("پسری");
    expect(L66.questions[2].translation).toContain("منزل");
    expect(L66.questions[3].translation).toContain("قدیمی ام");
    expect(L66.questions[10].translation).toContain("بیرون");
    // خلوصِ فارسی — بدونِ حرفِ لاتین در هیچ ترجمه
    L66.questions.forEach((q) => {
      expect(/[A-Za-z]/.test(q.translation!), q.id).toBe(false);
    });
  });

  it("options locked: Q10 slash pairs, Q13-18 reflexive pronoun sets, Q19/Q20 state-verb forms", () => {
    expect(L66.questions[9].options).toEqual([
      "was watching / arrived", "watched / are arriving", "is watching / were arriving", "watches / were arrive",
    ]);
    expect(L66.questions[12].options).toEqual(["by myself", "yourselves", "themselves", "ourselves"]);
    expect(L66.questions[13].options).toEqual(["ourselves", "yourselves", "themselves", "herself"]);
    expect(L66.questions[16].options).toEqual(["yourself", "herself", "myself", "himself"]);
    expect(L66.questions[17].options).toEqual(["yourselves", "himself", "herself", "yourself"]);
    expect(L66.questions[18].options).toEqual(["need", "needed", "am needing", "was needing"]);
    expect(L66.questions[19].options).toEqual(["was looking", "looked", "is looking", "looks"]);
    expect(L66.questions[10].options).toEqual(["as", "while", "when", "so"]);
    expect(L66.questions[11].options).toEqual(["when", "because", "while", "so"]);
  });

  it("ids unique across the whole 848-item family (r341 gram7 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(1130);
    expect(new Set(ids).size).toBe(1130);
  });
});
