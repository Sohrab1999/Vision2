import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r335 — گاردِ «تستهای "کنکوری" و "تألیف" گرامر و نگارش» جزوهٔ دهم (ص۱۰۱-۱۰۴، کلیدِ توضیح‌دار ص۲۶۷-۲۷۱)
// سیزدهمین گروه / سی‌ویکمین بانکِ درس‌محورِ پایهٔ دهم — ۴۵ MCQ با ترجمهٔ چاپی (الگوی r332/r334) + ۲۵ برچسبِ قرمزِ کنکور.
// کلید چاپی ۴۵/۴۵ صفر واگرایی. داوری‌های رندر ۵-۳۰x:
// برچسب‌ها «تجربی/انسانی/هنر» (لایه تجرب/انساب/هی = تحریفِ یِ پایانی)، ترجمهٔ Q10 بدونِ «ژاپنی» (لغزشِ چاپی)،
// Q11 «نظرآسان» چسبیده، Q12 «قبأل» vs Q22 «قبلا»، Q14 «زیبای»، Q19 «زیبا» دوبار، Q20 «یک یک» +
// رندر ۲۰x «نخی/صورتی/دخترم» (۵x «نچ/صورب/دخیم» می‌نمود!)، Q4/6/7 «بیشی» (رندر ۳۰x)،
// Q23 «زد زیر خنده» دو زد، Q26 «پس» بدونِ ر، Q37 «داره»، Q39/Q44 «نقطهٔ قرمز»، Q44 «سریعتی»،
// ارجاعِ چاپیِ «تست شماره ۸» در ۱۴ مدخلِ کوتاه (جم رساک در مدخلِ ۲ — ناهماهنگیِ خودِ چاپ).

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
    gram6?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const D = (n: number) => "-".repeat(n);

// —— کلیدِ چاپیِ ص۲۶۷-۲۷۱ (اندیسِ صفر-مبنا + واژهٔ کلید)
const KEYS_IDX = [1, 3, 1, 3, 2, 0, 3, 1, 0, 2, 3, 0, 3, 1, 2, 0, 1, 0, 0, 0, 1, 3, 0, 3, 2, 2, 2, 3, 2, 0, 3, 1, 1, 2, 0, 1, 0, 2, 0, 3, 2, 3, 0, 3, 1];
const KEYS_WORDS = [
  "the fastest cars", "big old green stone", "a more generous", "nice big German wooden",
  "the worst thing", "wonderful big old Italian wooden", "only a little more than", "as well as",
  "than any other secretary", "beautiful big white Japanese", "as", "as",
  "and more efficient", "beautiful small Egyptian", "big brown Iranian wood", "little old red",
  "the largest", "lovely long gray", "beautiful long green", "small, pink, cotton",
  "beautiful big blue plastic", "beautiful large brown wooden", "frightened sister", "the earliest",
  "as talkative as", "tall / as tall", "more expensive / the most expensive", "nice long American",
  "bigger than / the biggest", "the fastest", "wonderful old golden", "the worst",
  "generous tall young Italian", "healthier", "hot / hotter than", "cheaper than",
  "the fattest", "far", "the biggest / bigger than", "dangerous / the most dangerous",
  "the hardest / more difficult", "nice small old wooden", "selfish / the most important",
  "fast big new sports", "the most powerful / than",
];
const TRANSLATIONS = [
  "به نظر رسید که این قطار مدرن، به اندازه سریعترین ماشینها، سریع باشد شاید هم سریعتر!",
  "به نظر نمی‌رسید یخچال سنگی سبز قدیمی بزرگی را که من خریده ام، مورد پسند همسرم باشد.",
  "من باید بگم که تا به حال مردی را سخاوتمندتر از پیتر در تمام زندگیم ندیدم.",
  "خانه چوبی آلمانی بزرگ قشنگی که در انتهای خیابانه، خانه ای است که آنها بیشی از ۳۰ ساله که در آن زندگی میکنند.",
  "متاسفم که این را میگم اما از همه بدتر (بدترین چیز) این است که آنها با این الگوی رفتاری بزرگ شده اند.",
  "در واقع هدیه تولدی که من بیشی از همه دوست دارم، یک ساعت دیواری چوب ایتالیایی قدیمی بزرگ شگفت‌انگیزه.",
  "مردم فقط کمی بیشی از دو قرن گذشته شروع کردن به فهمیدن اینکه نیروی برق چگونه کار می کند.",
  "کاترین درس را برای کلاس به خوبی یک معلم با تجربه توضیح داد.",
  "دختر تازه استخدام شده، از هر منشی دیگری که آنها تا به حال دیده اند کارآمد تر (مؤثرتر) است.",
  "او اخیرأ یک ماشین سفید بزرگ قشنگ خریده است.",
  "این تمرین، به آن اندازه ای که فکر می کردم، به نظرآسان نمی رسید.",
  "برای من این شغل برای انجام دادن به اندازه شغلی که من قبأل داشتم، سخت است.",
  "در آن گنجه تعدادی فنجان چای مصری کوچک زیبای وجود دارد که برای موقعیت های خاص استفاده می شوند.",
  "آن کمد قهوه ای رنگ چوب بزرگ ایرانی خیلی گران قیمت است.",
  "ماری همیشه دوست داشته است که یک ماشین قدیمی کوچک قرمز رنگ را براند.",
  "در حال حاضر رقابت ده هزارمتری بزرگترین رقابت پیاده روی برگزار شده در بازی های المپیک است.",
  "دوست من در کف اتاق خوابش یک قالیچه زیبای بلند قهوه ای پشمی دارد.",
  "آیا آن خانم در آن لباس بلند زیبای سبز رنگ ابریشمی زیبا به نظر نمی رسید؟",
  "الف: می توانم کمکتان بکنم ؟ ب: بله من دنبال یک یک لباس نخی صورتی کوچک برای دخترم می گردم.",
  "من واقعا از آن توپ آبی زیبای بزرگ پلاستیگی که داییم در روز تولدم به من داد خوشم آمد.",
  "من هرگز آن میز زیبای بزرگ قهوه ای رنگ چوب که قبلا بر روی آن غذا می خوردیم را فراموش نکرده ام.",
  "کارلوس هنگامی که از پشت بوته ها بیرون پرید بر سر خواهر ترسیده اش داد زد و زد زیر خنده.",
  "چونکه طراحی ارتباط خیلی زیادی با ارتباط برقرار کردن دارد احتمالا اولین شکل (هنری) بوده است که توسعه پیدا کرده است.",
  "او به اندازه تعدادی از دوستانم پرحرف نیست اما آنچه که می گوید غالبا اصیل تر از آنچه است که شما معمولا می شنوید.",
  "محسن یک پس خیلی قد بلند است. او الان هم قد احمد شده است.",
  "این دوچرخه از دوچرخه تو گران قیمت تر است. به نظر من این دوچرخه گران قیمت ترین دوچرخه در دنیا است.",
  "او قصد دارد فردا یک ماشین خوب دراز آمریکایی بخرد.",
  "قاره اروپا از قاره آسیا بزرگی نیست. در حقیقت آسیا بزرگترین قاره در جهان است.",
  "یوزپلنگ ها سریعترین حیوانات بر روی کره زمین هستند. آنها می توانند خیلی سریع بروند و طعمه شان را شکار بکنند.",
  "او ساعت قدیمی طلایی شگفت انگیزش را به دخترش داد. آن ساعت هدیه مادربزرگ مرحومش بود.",
  "در کلاس ما جک بدترین دستخط را دارد. (دستخط او) قابل خواندن نیست.",
  "آن مردان سخاوتمند قدبلند جوان ایتالیایی قصد دارند ماه بعد به خانه(کشور) خود بازگردند.",
  "یک ورزشکار غالبا از یک شخص معمولی که خیلی ورزش نمی کند سالم تر است.",
  "تابستان امسال خیلی گرم بود. حتی گرمتر از تابستان قبل بود.",
  "سفر های داخلی از سفرهای خارجی ارزان تر هستند. بنابراین تو برای سفر کردن به مشهد پول زیادی نیاز نداری.",
  "نیما داره چاق تر و چاق تر می شود. او به تازگی به چاق ترین دانش آموز کلاس تبدیل شده است.",
  "ما می توانیم در دو ساعت به خانه حمید برویم چونکه از اینجا خیلی دور نیست.",
  "سیاره مشتری بزرگترین سیاره ها است. یعنی اینکه این سیاره از هر سیاره دیگری در منظومه شمسی بزرگتر است.",
  "بیماری های خطرناک در طول تاریخ تا الان وجود داشته اند، اما به نظر من ویروس کرونا خطرناک ترین بوده است.",
  "من معتقدم که این مسئله سخت ترین مسئله درس ما است. حتی از آن مسئله هایی که معلم پرسید هم سخت تر است.",
  "آنها در یک کلبه زیبای کوچک قدیمی چوبی اقامت داشتند.",
  "او خیلی خودخواه است. او فکر می کند مهمترین آدم در دنیا است.",
  "سام امسال می خواهد یک اسب سریعتی بزرگ جدید ورزشی بخرد.",
  "محمد علی یکی از قدرمندترین بوکسورها بود. او از بیشتر رقیبانش قوی تر بود.",
];

const L31 = bank.lessons.find((l) => l.lesson === 31)!;

describe("jozve tests-g10 gram6 (r335 کنکوری/تألیف گرامر و نگارش — pp101-104, key pp267-271)", () => {
  it("gram6 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram6).toBeTruthy();
    const s = bank.source.gram6!;
    expect(s.exam).toContain("کنکوری");
    expect(s.header).toContain("۲۶۷");
    expect(s.keyPages).toBe("267-271");
    expect(s.keyVerification).toContain("45/45");
    expect(s.extractedRound).toBe("r335");
    expect(s.pattern).toContain("r332");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(20);
    expect(s.printQuirks.some((q) => q.includes("انسانی"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("ژاپنی"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("بیشی"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("یک یک"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("جم رساک"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("تست شماره ۸"))).toBe(true);
  });

  it("bank shape: 45 MCQ, 44 translations (Q13 none — print-verbatim), categories grammar, no kind/accepted", () => {
    expect(L31.count).toBe(45);
    expect(L31.questions).toHaveLength(45);
    L31.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
    });
    expect(L31.questions[12].translation, "Q13").toBeUndefined();
    L31.questions.forEach((q, i) => {
      if (i !== 12) expect(q.translation, q.id).toBeTruthy();
    });
    expect(L31.title).toContain("ص۱۰۱-۱۰۴");
    expect(L31.level).toContain("چهارگزینه‌ای");
  });

  it("all 45 keys locked to print (index + word) — zero divergence", () => {
    L31.questions.forEach((q, i) => {
      expect(q.answer, `Q${i + 1} idx`).toBe(KEYS_IDX[i]);
      expect(q.options[q.answer], `Q${i + 1} word`).toBe(KEYS_WORDS[i]);
      if (i !== 12) expect(q.translation, `Q${i + 1} tr`).toBe(TRANSLATIONS[i > 12 ? i - 1 : i]);
    });
  });

  it("stems verbatim: blank runs, red konkur tags, Q13 tag, Q20 dialogue, Q38/Q39 attached dashes", () => {
    expect(L31.questions[0].question).toBe(
      `The modern train appeared to be going as fast as, perhaps even faster than ${D(14)}. (تجربی خارج ۹۸)`,
    );
    expect(L31.questions[1].question).toBe(
      `The ${D(19)} refrigerator that I have bought didn’t seem nice to my wife. (انسانی ۹۸- نظام قدیم)`,
    );
    expect(L31.questions[2].question).toContain("I haven't seen"); // آپاستروفِ صاف
    expect(L31.questions[3].question).toBe(
      `The ${D(17)} house at the end of the street is one they have been living in for over thirty years. (انسانی خارج ۹۸ - نظام قدیم)`,
    );
    expect(L31.questions[6].question).toBe(
      `People began to understand how electricity works ${D(17)} two centuries ago. (ریاضی ۹۸- نظام قدیم)`,
    );
    expect(L31.questions[11].question).toBe(
      `To me, this job is as difficult to do ${D(20)} the one I already had. (هنر ۹۹)`,
    );
    expect(L31.questions[12].question).toBe(
      `Modern motorcycles are lighter, faster, ${D(14)} than motorcycles of thirty years ago. (کنکور زبان ۹۹)`,
    );
    expect(L31.questions[12].options).toEqual([
      "more efficient", "or as efficient", "and efficient", "and more efficient",
    ]);
    expect(L31.questions[19].question).toBe(
      `A: “Can I help you?”  B”: Yes, I am looking for a ${D(22)} dress for my daughter.” (انسانی ۹۴)`,
    );
    expect(L31.questions[19].options).toEqual([
      "small, pink, cotton", "small, cotton, pink", "pink, small, cotton", "cotton, small, pink",
    ]);
    expect(L31.questions[37].question).toBe(
      `We can go Hamid’s home in two hours. It is not very ${D(19)}from here.`,
    );
    expect(L31.questions[38].question).toBe(
      `Jupiter is ${D(22)} planet of all. It means it’s ${D(15)}every planet in the solar system.`,
    );
    // adjective-order options locked verbatim (Q2/Q4/Q6/Q10/Q22/Q33/Q42/Q44)
    expect(L31.questions[1].options).toEqual([
      "old big stone green", "green old stone big", "stone green big old", "big old green stone",
    ]);
    expect(L31.questions[3].options).toEqual([
      "wooden nice big German", "nice big wooden German", "big nice German wooden", "nice big German wooden",
    ]);
    expect(L31.questions[5].options).toEqual([
      "wonderful big old Italian wooden", "big old wonderful Italian wooden",
      "wonderful big old wooden Italian", "old wonderful big Italian wooden",
    ]);
    expect(L31.questions[9].options).toEqual([
      "white beautiful Japanese big", "beautiful white big Japanese",
      "beautiful big white Japanese", "Japanese big beautiful white",
    ]);
    expect(L31.questions[21].options).toEqual([
      "beautiful brown large wooden", "large wooden beautiful brown",
      "beautiful large wooden brown", "beautiful large brown wooden",
    ]);
    expect(L31.questions[32].options).toEqual([
      "tall young generous Italian", "generous tall young Italian",
      "young generous Italian tall", "generous young tall Italian",
    ]);
    expect(L31.questions[41].options).toEqual([
      "old small nice wooden", "nice old wooden small", "wooden nice old small", "nice small old wooden",
    ]);
    expect(L31.questions[43].options).toEqual([
      "sports big fast new", "new big sports fast", "fast new big sports", "fast big new sports",
    ]);
  });

  it("critical print quirks present in data: بیشی/یک یک/پس/سریعتی/قبأل/نظرآسان/زد زیر خنده", () => {
    const all = L31.questions.map((q) => `${q.question} ${q.translation ?? ""}`).join("\n");
    expect(all).toContain("بیشی از ۳۰ ساله"); // Q4
    expect(all).toContain("کمی بیشی از دو قرن"); // Q7
    expect(all).toContain("یک یک لباس نخی صورتی"); // Q20
    expect(all).toContain("محسن یک پس خیلی قد"); // Q26 — بدونِ ر
    expect(all).toContain("اسب سریعتی بزرگ جدید ورزشی"); // Q44
    expect(all).toContain("قبأل داشتم"); // Q12 — با أ
    expect(all).toContain("قبلا بر روی آن غذا"); // Q22 — تمیز
    expect(all).toContain("به نظرآسان نمی رسید"); // Q11 — چسبیده
    expect(all).toContain("داد زد و زد زیر خنده"); // Q23 — دو زد
    expect(all).toContain("اخیرأ یک ماشین سفید"); // Q10 — بدونِ ژاپنی
    expect(all).toContain("زیبای وجود دارد"); // Q14
    expect(all).toContain("ابریشمی زیبا"); // Q19 — زیبای دوبار
    expect(all).toContain("داره چاق تر"); // Q37 — محاوره
    expect(all).toContain("توپ آبی زیبای بزرگ پلاستیگی"); // Q21 — گِ چاپی
    expect(all).toContain("خانه(کشور)"); // Q33
    expect(all).toContain("اولین شکل (هنری)"); // Q24
  });

  it("no duplicate ids across the whole family (547)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(1346);
    expect(new Set(ids).size).toBe(1346);
  });
});
