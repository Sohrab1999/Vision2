import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r281 — گاردِ بانک «مرور زمان‌ها» جزوهٔ دوازدهم (درس ۳ و ۴ خانوادهٔ موضوعی r280)
// بخش اول: ۳۰ تست ص۱۴۲-۱۴۳ (سطح متوسط) — کلید توضیحی «-Nگزینه (X)» ص۲۲۰-۲۲۳
// بخش دوم: ۵۰ تست ص۱۴۳-۱۴۵ (سطح استاندارد) — کلید گرید چاپی c15/sec23
// نکته‌های وفاداری: PDF بعد از «38» نقطه ندارد؛ خود جزوه Q14 بخش اول را در
// بخش دوم هم چاپ کرده (Q38). ترجمه‌ها: بخش اول OCR به‌هم‌ریخته، بخش دوم غایب.
// =====================================================================

interface TQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface TLesson {
  lesson: number;
  title: string;
  level: string;
  count: number;
  questions: TQuestion[];
}
interface TBank {
  grade: number;
  family: string;
  source: {
    extractedRound: number;
    tenses?: {
      pages: string;
      part1: {
        questions: number;
        pages: string;
        keyType: string;
        translations?: string;
        translationsWashed?: {
          round: string;
          pages: string;
          items: number;
          method: string;
          printQuirks: Record<string, string>;
        };
      };
      part2: { questions: number; pages: string; keyType: string; translations: string };
      spotLocks: { part1: Record<string, string>; part2: Record<string, string> };
      printedDuplicate: { part1: number; part2: number; note: string };
      extractedRound: number;
    };
  };
  lessons: TLesson[];
}

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const BLANK = "---------------";

// r315 — رونویسیِ چشمیِ دستیِ ۳۰ خطِ قرمزِ «ترجمه:» (رندر ۳۰۰-۳۰۰۰dpi ص۲۲۰-۲۲۳ — قفلِ حرف‌به‌حرف)
const TRANSCRIPT: Record<number, string> = {
  1: "من ۳ روز قبل خواستم او را ببینم. از آن روز، دو بار به او زنگ زده ام.",
  2: "زمانیکه آقای سعیدی رادیو را در ماشینش روشن کرد، در حال رانندگی کردن به سمت خانه بود.",
  3: "من از وقتیکه به این شهر نقل مکان کرده ام، دو کتاب شعر را نوشته ام.",
  4: "ـ آیا آن نامه را برایم نوشتی؟ - شرمنده. کاملاً فراموشش کردم. به زودی آن را خواهم نوشت.",
  5: "من تا به حال دو بار این امتحان را داده ام. امیدوارم که در آن قبول بشوم.",
  6: "خواهر بزرگترم بعد از اینکه مادرم بهش دارو داد، حالش بهتر شد.",
  7: "درخت بر روی ماشین پدرم افتاد، درحالی که به سمت منزل در حال رانندگی کردن بود.",
  8: "او هفته گذشته پیشنهاد یک شغلی را در لندن دریافت کرد اما هنوز درباره اینکه چه چیزی در مورد آن انجام دهد، تصمیم نگرفته است.",
  9: "رامان دیروز یک پاکت نامه و یک تمبر را از اداره پست خرید.",
  10: "او تا زمانیکه مشاورش در زندان مشکل را برایش توضیح نداد، آن را نفهمیده بود.",
  11: "من تصمیم گرفته ام یک مهمانی تولد بگیرم. قراره تعداد زیادی از دوستانم را برای چهارشنبه آینده دعوت کنم.",
  12: "زمانیکه ما وارد شدیم، رامان مشغول تماشای تلویزیون بود.",
  13: "مادرم بیسکویتها را دو ساعت قبل بر روی میز گذاشت.",
  14: "آنها ناراحت بودند از آنجاییکه من قبل از اینکه آنها شهر را ترک کنند، به دیدنشان نرفته بودم.",
  15: "معمولاً قبل از اینکه پری و برادر کوچکش به تختخواب بروند، مادرشان یک داستان کوتاه را برای آنها میخوانند.",
  16: "من تا قبل از اینکه به چین سفر کنم، به هیچ کشور آسیایی نرفته بودم.",
  17: "من فکر میکنم که عمویت به تو، پولی، را که لازم داری، قرض خواهد داد. او مرد ثروتمندی است.",
  18: "ما مشغول خوردن شام در رستوران بودیم زمانیکه یکی از دوستان قدیمییم را دیدیم.",
  19: "ـ مایلیذ چیزی برای خوردن بخورید؟ - نه متشکرم. من تازه یک ساندویــج خورده ام.",
  20: "ـ چرا آن همه رنگ را خریدی؟ - قصد دارم اتاق خوابم را فردا رنگ آمیزی کنم.",
  21: "در حالیکه او مشغول خواندن روزنامه بود، سگش در کنار او دراز کشیده بود.",
  22: "زمانیکه مری وارد شد من بازی تنیس را با مایک تمام کرده بودم.",
  23: "سارا چونکه همه تکالیفش را انجام داده بود، خیلی خسته بود.",
  24: "ـ پنجره های اتاقت کثیف هستند. ـ میدونم. قراره بعداً آنها را بشویم.",
  25: "زمانیکه تو به من زنگ زدی، من بیشتر قسمتهای کتاب را نوشته بودم.",
  26: "ـ من هیچ پولی ندارم. ـ واقعاً؟ نگران نباش. من بهت کمی(پول) قرض خواهم داد.",
  27: "آنها همه بازیهای دیگر را به آسانی برده اند از زمانیکه بازی فوتبال را به آلمان باختند.",
  28: "این دومین بار است که من بخاطر اشتباهات تو در چنین وضعیت سختی قرار گرفته ام.",
  29: "دیروز در همین مواقع، در حالی که مشغول مطالعه کردن بودم، برادرم زنگ زد و ما را برای شام دعوت کرد.",
  30: 'ما فکر میکنیم که "رامان" گران قیمت ترین ماشین اسپرتی را که ما تا به حال در این شهر دیده ایم، دارد.',
};

const l1 = bank.lessons.find((l) => l.lesson === 1)!;
const l2 = bank.lessons.find((l) => l.lesson === 2)!;
const l3 = bank.lessons.find((l) => l.lesson === 3)!;
const l4 = bank.lessons.find((l) => l.lesson === 4)!;
const fresh = [...l3.questions, ...l4.questions];

describe("jozve topic grammar bank g12 — tenses (r281 extraction receipt)", () => {
  it("bank shape: four lessons, tenses added as exactly 30/50 with continuous printed numbering", () => {
    expect(bank.lessons.map((l) => l.lesson)).toEqual(Array.from({ length: 330 }, (_, i) => i + 1)); // r282-r286 بانک‌های ۵..۱۴، r287 هفت بانک تشریحی (۱۵-۲۱) و r288 بخش‌های ۸/۹ (۲۲-۲۳) را افزودند؛ r289-r291 آزمون‌های جامع درس اول تا سوم (۲۴-۵۸) و r292-r307 آزمون‌های نهایی دی ۹۷، خرداد ۹۸، شهریور ۹۸، دی ۹۸، خرداد ۹۹ (دو واریانتِ رشته‌ای)، شهریور ۹۹ (چاپِ جزوه + چاپِ رسمیِ سراسری + ویژهٔ ناشنوایان)، دی ۹۹، خرداد ۱۴۰۰ (دو واریانتِ رشته‌ای)، شهریور ۱۴۰۰، دی ۱۴۰۰، خرداد ۱۴۰۱ و شهریور ۱۴۰۱ (۵۹-۳۲۴) را افزودند
    // درس‌های r280 دست‌نخورده
    expect(l1.questions).toHaveLength(27);
    expect(l2.questions).toHaveLength(61);
    expect(l3.count).toBe(30);
    expect(l4.count).toBe(50);
    expect(l3.questions.map((q) => q.n)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(l4.questions.map((q) => q.n)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
    expect(l3.questions.every((q) => q.id === `g12-tense1-${q.n}`)).toBe(true);
    expect(l4.questions.every((q) => q.id === `g12-tense2-${q.n}`)).toBe(true);
    expect(bank.source.extractedRound).toBe(280); // پروانهٔ فایل از r280
    expect(bank.source.tenses?.extractedRound).toBe(281);
    expect(bank.source.tenses?.part1.questions).toBe(30);
    expect(bank.source.tenses?.part2.questions).toBe(50);
  });

  it("every new question: four unique English options, valid answer, canonical blank, clean spacing", () => {
    for (const q of fresh) {
      expect(q.options, `${q.id} options`).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} unique options`).toBe(4);
      expect(q.answer, `${q.id} answer in 0..3`).toBeGreaterThanOrEqual(0);
      expect(q.answer, `${q.id} answer in 0..3`).toBeLessThanOrEqual(3);
      expect(q.category).toBe("grammar");
      expect(FA.test(q.question), `${q.id} stem english`).toBe(false);
      for (const o of q.options) {
        expect(FA.test(o), `${q.id} option "${o}" english`).toBe(false);
      }
      expect(q.question, `${q.id} has blank`).toContain(BLANK);
      expect(q.question, `${q.id} no glued blank`).not.toMatch(/[^\s]-{15}/);
      expect(q.question, `${q.id} no long raw run`).not.toMatch(/-{16,}/);
      expect(q.question, `${q.id} no double space`).not.toMatch(/\s{2,}/);
      expect(q.options.join("|"), `${q.id} options clean`).not.toMatch(/\s{2,}/);
    }
    // ساقه‌های دوخالیِ شناخته‌شدهٔ این خانواده (P1: 1,10 / P2: 22,25,44,45,47,48)
    const twoBlanks = fresh.filter((q) => q.question.split(BLANK).length - 1 === 2);
    expect(twoBlanks.length).toBeGreaterThanOrEqual(6);
  });

  it("key fidelity: explanation keys (part1) and printed grid (part2) locked on spot rows", () => {
    // قفل‌های معنایی بخش اول — کلید توضیحی خود جزوه
    const p1: [number, string, RegExp][] = [
      [1, "c", /three days ago/],
      [4, "a", /I completely forgot/],
      [8, "d", /an offer for a job in London/],
      [17, "b", /He is a rich man/],
      [30, "a", /most expensive sport car/],
    ];
    for (const [n, letter, stemRe] of p1) {
      const q = l3.questions.find((x) => x.n === n)!;
      expect(q.question, `P1-Q${n} stem`).toMatch(stemRe);
      expect("abcd"[q.answer], `P1-Q${n} letter`).toBe(letter);
    }
    // قفل‌های معنایی بخش دوم — گرید چاپی (سطرهای ابتدایی/میانی/انتهایی)
    const p2: [number, string, RegExp][] = [
      [4, "b", /Alex was very tired/],
      [8, "c", /she [\s\S]*in Isfahan before/],
      [10, "b", /haven't been to Sweden/],
      [33, "d", /completely dry/],
      [50, "c", /most boring film/],
    ];
    for (const [n, letter, stemRe] of p2) {
      const q = l4.questions.find((x) => x.n === n)!;
      expect(q.question, `P2-Q${n} stem`).toMatch(stemRe);
      expect("abcd"[q.answer], `P2-Q${n} letter`).toBe(letter);
    }
    // رسیدِ spotLocks با خود بانک هم‌خوان است
    for (const [n, letter] of Object.entries(bank.source.tenses!.spotLocks.part1)) {
      expect("abcd"[l3.questions.find((x) => x.n === Number(n))!.answer], `spot P1-Q${n}`).toBe(letter);
    }
    for (const [n, letter] of Object.entries(bank.source.tenses!.spotLocks.part2)) {
      expect("abcd"[l4.questions.find((x) => x.n === Number(n))!.answer], `spot P2-Q${n}`).toBe(letter);
    }
  });

  it("printed duplicate kept faithfully: part1 Q14 == part2 Q38 with the same grid-consistent answer", () => {
    const q14 = l3.questions.find((x) => x.n === 14)!;
    const q38 = l4.questions.find((x) => x.n === 38)!;
    expect(q38.question).toBe(q14.question);
    expect(q38.options).toEqual(q14.options);
    expect("abcd"[q38.answer]).toBe("abcd"[q14.answer]);
    expect(q38.options[q38.answer]).toBe("had not gone");
    expect(bank.source.tenses?.printedDuplicate).toEqual({
      part1: 14,
      part2: 38,
      note: expect.stringContaining("وفادار"),
    });
  });

  it("r315 wash: all 30 part-1 items carry the printed Persian translation verbatim to the red-line transcript; part-2 keeps honest absence", () => {
    // r315 — بستنِ رسیدِ موکولِ r281: ۳۰ ترجمهٔ چاپیِ ص۲۲۰-۲۲۳ با رونویسیِ چشمی (الگوی r313)
    for (const q of l3.questions) {
      expect(q.translation, q.id).toBe(TRANSCRIPT[q.n]);
      expect(FA.test(q.translation!), `${q.id} Persian`).toBe(true);
      expect(q.translation!.length, q.id).toBeGreaterThan(20);
    }
    for (const q of l4.questions) {
      expect(q.translation, `${q.id} grid part keeps honest absence`).toBeUndefined();
    }
    const receipt = bank.source.tenses!.part1.translationsWashed!;
    expect(receipt.round).toBe("r315");
    expect(receipt.pages).toBe("220-223");
    expect(receipt.items).toBe(30);
    expect(receipt.method).toContain("r313");
    expect(receipt.printQuirks["10"]).toContain("زندان");
    expect(receipt.printQuirks["19"]).toContain("ساندوی");
    expect(receipt.printQuirks["18"]).toContain("قدیمییم");
  });

  it("honest absence reasons: part-1 receipt replaced by the wash, part-2 keeps the printed-absence reason", () => {
    expect(bank.source.tenses!.part1.translations).toBeUndefined();
    expect(bank.source.tenses!.part1.translationsWashed).toBeDefined();
    expect(bank.source.tenses!.part2.translations).toContain("چاپ نشده");
  });

  it("ID uniqueness across the whole topic bank (r280 + r281 = 168 questions)", () => {
    const all = [...l1.questions, ...l2.questions, ...fresh];
    expect(all).toHaveLength(168);
    expect(new Set(all.map((q) => q.id)).size).toBe(168);
  });

  it("level split matches the booklet headers: lesson3 متوسط، lesson4 استاندارد", () => {
    expect(l3.title).toContain("متوسط");
    expect(l4.title).toContain("استاندارد");
    expect(l3.level).toBe("متوسط");
    expect(l4.level).toBe("استاندارد");
    // P2-Q38 ساقه‌اش بعد از «38» بی‌نقطه بود — سلامتش یعنی شماره‌یابِ انتظاری کار کرده
    const q38 = l4.questions.find((x) => x.n === 38)!;
    expect(q38.question).toMatch(/^They were upset because I/);
  });
});
