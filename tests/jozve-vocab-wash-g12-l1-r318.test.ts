import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r318 — شست‌وشوی ۱۰۰ ترجمهٔ چاپیِ «۱۰۰ تست واژگان درس اول» (l1) از
// «پاسخنامه کلیدی و ترجمهٔ ۱۰۰ تست واژگان — درس اول» ص۱۸۱-۱۸۴ — الگوی r316/r317.
// چاپِ جزوه حاکم است؛ خانوادهٔ واژگانِ دوازدهم حالا ۳۰۰/۳۰۰ چاپ‌محور است.

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
      q75Recovered?: string;
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
const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const FA = /[\u0600-\u06FF]/;

describe("jozve vocab wash g12-l1 (r318 print-verbatim wash receipt)", () => {
  it("wash receipt: round/pages/method/items/supersedes/q75/keyArbitration present", () => {
    const w = l1.source.translationsWashed!;
    expect(w.round).toBe("r318");
    expect(w.pages).toBe("181-184");
    expect(w.method).toContain("visual transcription");
    expect(w.method).toContain("English-stem triple arbitration");
    expect(w.items).toBe(100);
    expect(w.supersedes).toContain("r274");
    expect(w.q75Recovered).toContain("۷۴");
    expect(w.keyArbitration).toContain("Q74");
    expect(w.keyArbitration).toContain("Q79");
    expect(w.printQuirks.length).toBeGreaterThanOrEqual(30);
  });

  it("old r274 restoration receipt is gone from lesson 1 (superseded) — l2/l3 receipts untouched", () => {
    expect((l1 as unknown as { translationRestorations?: unknown }).translationRestorations).toBeUndefined();
    const l2 = bank.lessons.find((l) => l.lesson === 2)!;
    const l3 = bank.lessons.find((l) => l.lesson === 3)!;
    expect(l2.source.translationsWashed?.round).toBe("r317");
    expect(l3.source.translationsWashed?.round).toBe("r316");
  });

  it("all 100 translations present, Persian-pure, no Latin leak", () => {
    expect(l1.questions).toHaveLength(100);
    for (const q of l1.questions) {
      expect(q.translation && q.translation.trim().length > 10, `translation of ${q.id}`).toBe(true);
      expect(FA.test(q.translation!), `Persian translation of ${q.id}`).toBe(true);
      expect(/[A-Za-z]{3,}/.test(q.translation!), `Latin leaked in translation of ${q.id}`).toBe(false);
    }
  });

  it("Q75 translation recovered from the duplicated printed 74 (former honest absence)", () => {
    const q75 = l1.questions.find((q) => q.n === 75)!;
    expect(q75.translation).toBe(
      "دانش آموزان به شدت تحت فشار بودند تا از مقررات مدرسه درباره ی نپوشیدن شلوار جین پیروی کنند. وگرنه، نمی توانستند کلاس بیایند.",
    );
    // کلیدِ Q75: سه‌رأی (گرید b + کلیدِ درون‌خطیِ بلوکِ دومِ ۷۴ + JSON b=pressure)
    expect(q75.answer).toBe(1);
    expect(q75.options[1]).toBe("pressure");
  });

  it("letter-by-letter locks of the washed print translations (spot anchors incl. former layer corruptions)", () => {
    const tr = (n: number) => l1.questions.find((q) => q.n === n)!.translation!;
    // قفل‌های ناحیه‌ای که ترجمهٔ قدیمیِ لایه‌آلوده تفاوت آشکار داشت:
    expect(tr(1)).toBe("اولین تلاش آن ها برای فتح کردن اورست با شکست مواجه شد.");
    expect(tr(2)).toContain("احترام بگذارند");
    expect(tr(4)).toContain("چگونه از شما قدردانی کنم");
    expect(tr(9)).toContain("منتهی شد"); // لایه: منتیه شد
    expect(tr(10)).toContain("کلاس زبان"); // لایه: کالس
    expect(tr(12)).toContain("سوالات معنی داری"); // لایه: معناداری — ساقهٔ meaningful
    expect(tr(13)).toContain("۱۵۰۰ شغل"); // رقمِ فارسیِ چاپی
    expect(tr(14)).toContain("یک زمان برای شام بیرون برویم"); // لایه: زماب + بیرون
    expect(tr(17)).toContain("کامپیوتر اپل"); // لایه: ابل — ساقهٔ Apple
    expect(tr(17)).toContain("موسوم به ادوب"); // ساقهٔ Adobe
    expect(tr(18)).toContain("به جای یخ در قطب شمال"); // خوانشِ اولیه: بخ — ساقهٔ ice
    expect(tr(19)).toContain("پرستارانی که از سالمندان"); // خوانشِ اولیه: پرسکوانی/سالیمندان
    expect(tr(21)).toContain("حداکثر ۲۰۰ شغل"); // ساقهٔ up to 200 — خوانشِ اولیه: حداقل
    expect(tr(22)).toBe("راننده باید با علامت زرد مکث کند و با یک علامت قرمز به توقف کامل برسد."); // خوانشِ اولیه: رزومه/مک
    expect(tr(25)).toContain("هیچ تلاشی"); // لایه: تالشی
    expect(tr(27)).toContain("اطلاعیه ی شما را دریافت کردیم"); // لایه: اطالعیه
    expect(tr(29)).toContain("اگر بلافاصله کتاب را به من برسانید"); // خوانشِ اولیه: یادداشت — ساقهٔ immediately
    expect(tr(31)).toContain("کوالاها"); // لایه: کواالها
    expect(tr(33)).toContain("جین در حالی که"); // ساقهٔ Jane — خوانشِ اولیه: چنین
    expect(tr(37)).toContain("تصادف های بیشتر"); // خوانشِ اولیه: تصادفات های
    expect(tr(37)).toContain("گنجایش ترافیک سنگین"); // خوانشِ اولیه: ترافیکی
    expect(tr(42)).toContain("یک نفرمان شاغل است"); // خوانشِ اولیه: یک نفر
    expect(tr(42)).toContain("امسال دو سفر تعطیلات"); // خوانشِ اولیه: اصلاح
    expect(tr(43)).toContain("تعجبی ندارد که"); // بازسازی به ساقهٔ Not surprisingly
    expect(tr(43)).toContain("هیتلر و وکلای مهاجرت نازی ها"); // خوانشِ چشمکی: کالّی — لایه: وکالی
    expect(tr(44)).toContain("میراث فرهنگی"); // لایه: میر اث/ر میاث
    expect(tr(44)).toContain("خانواده ی وانگ"); // ساقهٔ Wang — خوانشِ اولیه: وانگز
    expect(tr(46)).toContain("نمی بخشیدم"); // لایه: نیم بخشیدم
    expect(tr(48)).toContain("مکالمه ی معنی داری"); // لایه: معت داری — رندر ۲۴۰۰dpi
    expect(tr(50)).toContain("سرباز شریف"); // لایه: شیف
    expect(tr(51)).toContain("بخشی از میراث ملی"); // لایه: ر میاث
    expect(tr(52)).toContain("موادی را تولید می کند"); // خوانشِ اولیه: مودای
    expect(tr(52)).toContain("می توانند سلامت"); // خوانشِ اولیه: می تواند
    expect(tr(53)).toContain("زن با خردی می نگرم"); // ساقهٔ regard — خوانشِ اولیه: می نکرم
    expect(tr(54)).toContain("سالمندان و افراد ناتوان که بیمه درمانی ندارند"); // خوانشِ اولیه: سالخوردان/بیهوده
    expect(tr(56)).toContain("تشخیص دادن نقاشی اصلی و کپی"); // خوانشِ اولیه: تفاوتی
    expect(tr(57)).toContain("سه میلیون دلار"); // لایه: دالر
    expect(tr(59)).toContain("از خودگذشتگی دارد"); // لایه: خودگذشتگ
    expect(tr(60)).toBe("من روی مبل نشسته بودم و در حال خوردن یک غذای آماده و سریع بودم."); // ساقهٔ sofa/fast
    expect(tr(61)).toContain("خبر... همه چیز خیلی بهوهم اتفاق افتاد"); // عین چاپ ۳۴۰۰dpi — لایه: خیر/یهوبی
    expect(tr(63)).toContain("خاله مان وارد شد. از دیدن ما خوشحال شد"); // سه‌رأی
    expect(tr(64)).toContain("بیرون کشیدن بازخورد"); // لایه: ربیون
    expect(tr(66)).toContain("برای کاری که انجام داد تنبیه شود"); // ساقهٔ for what he did
    expect(tr(67)).toContain("به ندرت با هم"); // لایه: طالق/ندرت
    expect(tr(68)).toContain("نقاشی هایش از طبیعت معروف بود"); // ساقهٔ paintings of nature
    expect(tr(69)).toContain("افراد مسن دارای تجربه و دانش زیادی"); // بازیابیِ جملهٔ کامل
    expect(tr(70)).toContain("چیزی غیر عادی در رفتار پدرش"); // خوانشِ اولیه: چینی/برداش
    expect(tr(72)).toBe("جلال آل احمد یک نویسنده ی برجسته در ایران است."); // لایه: جالل ال احمد
    expect(tr(73)).toContain("فریاد می زنند"); // لایه: فریاد یم زنند
    expect(tr(73)).toContain("اختلافات را ندارند"); // لایه: اختالفات
    expect(tr(74)).toContain("کیسه ی هوا نتوانسته بود از دخترش"); // لایه: کیسه
    expect(tr(77)).toContain("در حالی که پدرم بیرون سر کار بود"); // لایه: درحالی
    expect(tr(78)).toContain("قدر شناسی را در فرزندانشان ترغیب کنند"); // لایه: شناش — رندر ۲۴۰۰dpi
    expect(tr(80)).toContain("نعمت هایی که در زندگی تان"); // لایه: نعمت ی هاب
    expect(tr(81)).toContain("همانطور که می دانم"); // لایه: هماطور (r274)
    expect(tr(88)).toContain("دفترچه ی یادداشتم نوشته ام"); // JSON: خاطراتم — رندر حاکم
    expect(tr(88)).toContain("ملاقات کردم"); // لایه: مالقات
    expect(tr(91)).toContain("آن دفعه کاملا بخشیده باشد"); // لایه: اندفعه/کامال
    expect(tr(93)).toContain("به نشانه ی قدردانی اش یک کیک پخت"); // لایه: قدرداب
    expect(tr(94)).toContain("فقدان اخلاقیات نوشت"); // لایه: اخالقیات
    expect(tr(96)).toContain("۳۶۰ صفحه دارد"); // رقمِ فارسیِ چاپی
    expect(tr(99)).toContain("چیزهایی که تمایل نداری"); // خوانشِ اولیه: نداری
    expect(tr(100)).toBe("انجام دادن کاری که باعث ایجاد تفاوت در جامعه هیجان انگیز می باشد."); // عین چاپ ۲۴۰۰dpi
  });

  it("print-verbatim errata kept: Q61 «خبر... بهوهم» and Q83 «موجب شود»", () => {
    const tr = (n: number) => l1.questions.find((q) => q.n === n)!.translation!;
    expect(tr(61)).toContain("خبر..."); // English stem: "No, ..." — print error kept with receipt
    expect(tr(61)).toContain("بهوهم"); // OCR layer read «یهوبی» — visual 3400dpi governs
    expect(tr(83)).toContain("موجب شود"); // English stem: elicit — booklet's own rendering kept
    const quirks = l1.source.translationsWashed!.printQuirks.join(" ");
    expect(quirks).toContain("Q61");
    expect(quirks).toContain("Q83");
  });

  it("answer keys untouched by the wash (Q74/Q79 grid slips arbitrated toward inline+JSON)", () => {
    // گریدِ ص۱۸۴: Q74 چاپِ «c» و Q79 چاپِ «b» لغزشِ گرافِ کلید است؛ کلیدِ درون‌خطی + JSON + ساقهٔ انگلیسی حاکم.
    const spots: Array<[number, number]> = [
      [1, 1], [8, 1], [22, 0], [30, 3], [43, 2], [48, 1], [60, 0], [61, 1],
      [74, 1], [75, 1], [79, 0], [87, 3], [88, 1], [92, 3], [99, 0], [100, 2],
    ];
    for (const [n, ans] of spots) {
      expect(l1.questions.find((q) => q.n === n)!.answer, `answer of Q${n}`).toBe(ans);
    }
    // Q74: protect تنها معنای ممکن — گزینهٔ c (cause) نامعقول است
    const q74 = l1.questions.find((q) => q.n === 74)!;
    expect(q74.options).toEqual(["report", "protect", "cause", "take"]);
    // Q79: ترجمهٔ چاپیِ خودِ آیتم «مسئولیت پذیری» = گزینهٔ a
    const q79 = l1.questions.find((q) => q.n === 79)!;
    expect(q79.options[0]).toBe("responsibility");
    expect(bank.answerArbitration).toBeTruthy();
  });

  it("vocabulary family 300/300 print-verbatim (l1/l2/l3 all washed) — بانک‌های نهاییِ r380 ترجمهٔ چاپی ندارند (غیبتِ صادقانه)", () => {
    for (const les of bank.lessons.filter((x) => x.lesson <= 3)) {
      expect(les.source.translationsWashed, `wash receipt of l${les.lesson}`).toBeTruthy();
      expect(les.questions.every((q) => q.translation && q.translation.length > 10)).toBe(true);
    }
  });
});
