import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r310 — گاردِ دو بانکِ باقی‌ماندهٔ خانوادهٔ «ضمایر موصولی» جزوهٔ دوازدهم
// درس ۳۲۵ = ۲۰ تست دستگرمی (ص۸۶، کلید توضیحی ص۲۰۳-۲۰۴)
// درس ۳۲۶ = ۱۱ تست حذف/زبان تخصیص (ص۸۷، کلید توضیحی ص۲۰۵-۲۰۶)
// کلید = «N - ( گزینهX)» چاپی خود جزوه — سه داوریِ r310:
//   Pass A (لایهٔ pdfplumberِ آینه‌ایِ RTL) / Pass B (لایهٔ g12.txt) / رونویسیِ چشمی (SECOND).
// r313 — شست‌وشوی ترجمه‌ها: هر ۳۱ آیتم ترجمهٔ چاپیِ «ترجمه:» را دارد؛ قفلِ حرف‌به‌حرفِ رونویسیِ
//   چشمیِ خطوطِ قرمز (TRANSCRIPT) + داوریِ چهارمِ کلید از لایهٔ fitz (پارسرِ scripts/jozve-translations-wash-r313.py).
// l1/l2 (ص۸۸-۹۱) دست‌نخورده — خانوادهٔ ضمایر موصولی اکنون ص۸۶ تا ص۹۱ را کامل پوشش می‌دهد.
// =====================================================================

interface GQuestion {
  id: string;
  n: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface GLesson {
  lesson: number;
  title: string;
  level: string;
  count: number;
  questions: GQuestion[];
}
interface GBank {
  grade?: number;
  source: {
    booklet?: string;
    relDrill?: {
      family: string;
      round: string;
      arbitration: { passA: string; passB: string; third: string };
      deferredTranslations?: string;
      translationsWashed?: {
        round: string;
        pages: string;
        items: number;
        method: string;
        fourthArbitration: string;
        printQuirks: string[];
      };
      duplicateHunt?: string;
    };
  };
  lessons: GLesson[];
}

const bank: GBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const letter = (q: GQuestion) => "abcd"[q.answer];

const l325 = bank.lessons.find((l) => l.lesson === 325)!;
const l326 = bank.lessons.find((l) => l.lesson === 326)!;
const newLessons = [l325, l326];

// رونویسیِ دستیِ چاپِ چهار صفحهٔ کلید (رندر pdftoppm — داوریِ سومِ مستقل از دو Pass)
const SECOND: Record<number, Record<number, string>> = {
  325: {
    1: "d", 2: "b", 3: "b", 4: "a", 5: "a", 6: "c", 7: "a", 8: "d", 9: "b", 10: "c",
    11: "a", 12: "d", 13: "a", 14: "b", 15: "c", 16: "b", 17: "d", 18: "a", 19: "a", 20: "d",
  },
  326: {
    1: "b", 2: "b", 3: "a", 4: "b", 5: "c", 6: "c", 7: "b", 8: "b", 9: "c", 10: "a", 11: "b",
  },
};

// r313 — رونویسیِ چشمیِ دستیِ ۳۱ خطِ قرمزِ «ترجمه:» (رندر pdftoppm ص۲۰۳-۲۰۶؛ ۱۵۰/۳۰۰/۶۰۰dpi)
// قفلِ حرف‌به‌حرف — هر انحرافِ JSON از چاپ، این گارد را می‌شکند (الگوی SECONDِ خودِ r310).
const TRANSCRIPT: Record<number, Record<number, string>> = {
  325: {
    1: "دانش آموزان با معلمی که جان قبلاً ملاقات کرده بود، صحبت کردند.",
    2: "من نامه ای را دریافت کردم که توسط یکی از دانش آموزان نوشته شده بود.",
    3: "او به من سنگهایی را داد که او از استرالیا آورده بود.",
    4: "مکانیکی که خیلی ماهر است، یک تصادف داشت.",
    5: "دانش آموزی که والدینش هر دو معلم هستند، برنده جایزه اول در رقابت شد.",
    6: "رمانی که پدرم هفته گذشته برایم خرید، واقعا سرگرم کننده بود.",
    7: "هنرپیشه ای که قبلاً با اصغر فرهادی کار کرده بود، در مورد نقش با او تماس گرفت.",
    8: "این معلمی بود که به من گفت پسرم در کلاس رفتار بدی داشته است.",
    9: "خواهرم که من خیلی دوستش دارم,برایم در سر کار,گلهایی فرستاد.",
    10: "او دختری است که هفته گذشته ماشینش را با درخت برخورد کرد.",
    11: "آنها جعبه هایی هستند که ماه گذشته برای ما فرستاده شدند.",
    12: "او DVDهایی را که پدرش خریده بود، تماشا کرد.",
    13: "ما تعدادی کتاب خریدیم که معلم پیشنهاد داده بود.",
    14: "من دوستانی دارم که عاشق من هستند. آنها برای من یک مهمانی تولد دیدنی گرفتند.",
    15: "مرد جوانی که زندگی برادرمان را در آن تصادف ماشین نجات داد خیلی شجاع است.",
    16: "این یک راه دیگر برای گفتن آن (موضوع) است. من درباره ماشینی که آنجا پارک شده بود، حرف میزنم.",
    17: "خوبی، من باید بگویم که پول برای او اهمیتی ندارد.",
    18: "من مردی را که در همسایگی ما زندگی میکند را دیدم.",
    19: "جالب. ما داریم در مورد ماشینی که سقف قرمز رنگی دارد حرف میزنیم.",
    20: "این بهترین ماشینی است که تا به حال داشته ام. چرا این (سؤال) را پرسیدی؟",
  },
  326: {
    1: "دکتری که دیروز آن پسربچه را معاینه کرد (معاینه میکرد) خیلی پیر بود.",
    2: "عکسهای منتشر شده در روزنامه، فوق العاده بودند.",
    3: "تو خوش شانسی هستی که در یک کلاسی هستی که توسط چنین معلم محترمی تدریس میشود",
    4: "آیا این مقاله عالی در باره اقتصاد بومی که شنبه گذشته در روزنامه چاپ شده بود را خواندی؟",
    5: "موضوعات بحث شده در آن کتاب خیلی برای دانش آموزان آقای کاظمی جالب هستند.",
    6: "در سراسر دنیا، افرادی وجود دارند که خشکی، دریا و هوا را آلوده میکنند.",
    7: "دیواری که دور خانه را احاطه کرده، از چوب و آهن ساخته شده است.",
    8: "تعداد زیادی از افرادی که به مهمانی دعوت شده بودند، سر وقت نیامدند.",
    9: "اسم مردی که توسط پلیس دستگیر شد، چی بود؟",
    10: "آنها گفتند که آزمایشات انجام گرفته توسط دانشآموزان دانشگاه شیراز خیلی موفقیت آمیز بودند.",
    11: "پدرم ماشین آبی بزرگی دارد که در بیرون خانه پارک شده است.",
  },
};

describe("jozve g12 relative-clause drill/reduction banks (r310 extraction receipt)", () => {
  it("bank shape: lessons 325/326 of exactly 20/11 questions with semantic id prefixes", () => {
    expect(l325.count).toBe(20);
    expect(l326.count).toBe(11);
    expect(l325.questions.map((q) => q.n)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(l326.questions.map((q) => q.n)).toEqual(Array.from({ length: 11 }, (_, i) => i + 1));
    expect(l325.questions.every((q) => q.id.startsWith("g12-reldrill-"))).toBe(true);
    expect(l326.questions.every((q) => q.id.startsWith("g12-relreduce-"))).toBe(true);
    expect(l325.level).toContain("دستگرمی");
    expect(l326.level).toContain("دشوار");
  });

  it("every new question: category grammar, 4 unique non-empty options, valid answer, English-pure stem+options, sane blank", () => {
    for (const l of newLessons) {
      for (const q of l.questions) {
        expect(q.category, q.id).toBe("grammar");
        expect(q.options, q.id).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(3);
        expect(FA.test(q.question), q.id).toBe(false);
        for (const o of q.options) expect(FA.test(o), `${q.id} opt`).toBe(false);
        expect(q.question, q.id).toMatch(/(?:^|\s)-{5,}(?=$|[\s,.!?;:'”"])/);
      }
    }
  });

  it("keys are print-faithful: every answer matches the SECOND visual transcript of the four key pages", () => {
    for (const l of newLessons) {
      const grid = SECOND[l.lesson];
      for (const q of l.questions) {
        expect(letter(q), `${l.lesson}/Q${q.n}`).toBe(grid[q.n]);
      }
    }
    // توزیعِ حروفِ چاپی (قفلِ ساختاری — درس ۳۲۶ بدونِ d است و این عینِ چاپ است)
    const dist = (l: GLesson) => {
      const d: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
      for (const q of l.questions) d[letter(q)] += 1;
      return d;
    };
    expect(dist(l325)).toEqual({ a: 7, b: 5, c: 3, d: 5 });
    expect(dist(l326)).toEqual({ a: 2, b: 6, c: 3, d: 0 });
  });

  it("semantic arbitration: keys pin the exact option the jozve's own explanation names", () => {
    const q = (l: GLesson, n: number) => l.questions.find((x) => x.n === n)!;
    // درس ۳۲۵ — شرحِ خودِ جزوه
    expect(q(l325, 1).options[q(l325, 1).answer]).toBe("whom"); // مرجعِ انسان + نقش مفعولی
    expect(q(l325, 5).options[q(l325, 5).answer]).toBe("whose"); // رابطهٔ مالکیت (The student --- parents)
    // درس ۳۲۶ — مفعول‌حذفی / شکل سوم فعل و فعل ing
    expect(q(l326, 1).options[q(l326, 1).answer]).toBe("examining");
    expect(q(l326, 2).options[q(l326, 2).answer]).toBe("published");
    expect(q(l326, 3).options[q(l326, 3).answer]).toBe("taught");
    expect(q(l326, 7).options[q(l326, 7).answer]).toBe("surrounding");
    expect(q(l326, 10).options[q(l326, 10).answer]).toBe("conducted");
  });

  it("family coverage: the relative-clause family now spans p86..p91 with l1/l2 untouched", () => {
    const l1 = bank.lessons.find((l) => l.lesson === 1)!;
    const l2 = bank.lessons.find((l) => l.lesson === 2)!;
    expect(l1.questions).toHaveLength(27);
    expect(l2.questions).toHaveLength(61);
    expect(l1.questions[0].id).toBe("g12-rel-1");
    // بدونِ هم‌پوشانیِ ساقه با l1/l2 (ص۸۶/۸۷ متنِ تازه است)
    const oldSet = new Set([...l1.questions, ...l2.questions].map((q) => q.question));
    for (const l of newLessons) {
      for (const q of l.questions) expect(oldSet.has(q.question), q.id).toBe(false);
    }
  });

  it("r313 wash: all 31 items carry the printed Persian translation, verbatim to the red-line visual transcript", () => {
    for (const l of newLessons) {
      for (const q of l.questions) {
        expect(q.translation, q.id).toBe(TRANSCRIPT[l.lesson][q.n]);
        expect(FA.test(q.translation!), `${q.id} Persian`).toBe(true);
        expect(q.translation!.length, q.id).toBeGreaterThan(20);
      }
    }
    // تنها نویسهٔ لاتینِ چاپیِ درونِ ترجمه‌ها = DVDهایی (l325-12)
    const latin = newLessons
      .flatMap((l) => l.questions)
      .filter((q) => /[A-Za-z]{3,}/.test(q.translation!));
    expect(latin.map((q) => q.id)).toEqual(["g12-reldrill-12"]);
    // لنگرهای معناییِ رونویسی (فارسیِ خرابِ لایهٔ متنی جای آنها را نمی‌گیرد)
    const q = (l: GLesson, n: number) => l.questions.find((x) => x.n === n)!;
    expect(q(l325, 1).translation).toContain("قبلاً ملاقات");
    expect(q(l325, 14).translation).toContain("دیدنی"); // عینِ چاپ — ساقه last night دارد (printErrata r309)
    expect(q(l326, 11).translation).toContain("آبی بزرگی");
    expect(q(l326, 3).translation!.endsWith("میشود")).toBe(true); // بدونِ نقطهٔ پایانی — عینِ چاپ
  });

  it("r313 receipt: deferredTranslations removed, translationsWashed registered with pages+method+printQuirks", () => {
    const receipt = bank.source.relDrill!;
    expect(receipt.family).toBe("relative-clauses-drill-and-reduction-g12");
    expect(receipt.round).toBe("r310");
    expect(receipt.deferredTranslations, "wash completed in r313").toBeUndefined();
    const w = receipt.translationsWashed!;
    expect(w.round).toBe("r313");
    expect(w.pages).toBe("203-206");
    expect(w.items).toBe(31);
    expect(w.method).toContain("pdftoppm");
    expect(w.fourthArbitration).toContain("fitz");
    expect(w.printQuirks.some((q) => q.includes("l325-14"))).toBe(true);
    // گاردهای ماندگارِ r310
    expect(receipt.arbitration.third).toContain("pdftoppm");
    expect(receipt.duplicateHunt).toContain("r277");
  });

  it("ids are globally unique across the 1659-question topic bank", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(1659);
  });

  it("UI manifest: the two new buttons sit before l1/l2 in GRADE_GRAMMAR_TOPIC (booklet order p86/p87 < p88)", () => {
    const tsx = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    const block = tsx.slice(
      tsx.indexOf("GRADE_GRAMMAR_TOPIC"),
      tsx.indexOf("const topicCache")
    );
    const order = [...block.matchAll(/lesson: (\d+), title: "([^"]+)", count: (\d+)/g)].map(
      ([, les, title, count]) => ({ lesson: Number(les), title, count: Number(count) })
    );
    expect(order.slice(0, 4).map((o) => o.lesson)).toEqual([325, 326, 1, 2]);
    expect(order[0].title).toContain("دستگرمی");
    expect(order[1].title).toContain("زبان تخصیص");
    expect(order[0].count).toBe(20);
    expect(order[1].count).toBe(11);
  });
});
