import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// r314 — گاردِ خانوادهٔ «۷۲ تست آموزش گرامر جمله‌های شرطی و کنکوری» جزوهٔ دوازدهم
// بدنه: PDF ص۹۶-۹۹ (۷۲ سؤالِ پیوسته) — کلید: ص۲۰۷-۲۱۰ (بلوکِ توضیحیِ ۱-۵۰ + گریدِ ۵۱-۷۲)
// سربرگِ خودِ جزوه (ص۲۰۷) ابهامِ «ص۱۰۶-۱۱۰؟» handoff r313 را حل کرد: «(صفحه: 96 تا 99)».
// داوریِ چهارلایه: Pass A (pdfplumberِ آینه‌ای) / Pass B (g12.txt — برای ۳۰/۳۲ رأیِ نیاورد
//   به‌دلیلِ دو-تکه‌شدنِ رقم) / Pass C (fitz بلوک‌به‌بلوکِ لنگری) / گریدِ دوصدا (fitz×چشمی).
// ترجمه‌ها: ۵۰ خطِ قرمز با رونویسیِ چشمیِ ۶۰۰-۱۴۰۰dpi (الگوی r313) — آیتم‌های ۵۱-۷۲ گریدِ
//   خالص‌اند: غیبتِ صادقانهٔ ترجمه. بانک‌ها: ۴×۱۸ (l327..l330، ids g12-cond-1..72).
// =====================================================================

interface GQuestion {
  id: string;
  n: number;
  type?: string;
  category?: string;
  question: string;
  options: string[];
  answer: number;
  translation?: string;
}
interface GLesson {
  lesson: number;
  title: string;
  count?: number;
  questions: GQuestion[];
}
interface GBank {
  source: {
    condSentences?: {
      round: string;
      title: string;
      bodyPages: string;
      keyPages: string;
      items: number;
      translated: number;
      honestAbsence: string;
      method: string;
      printQuirks: Record<number, string>;
      banks: string;
    };
  };
  lessons: GLesson[];
}

const bank: GBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const FA = /[\u0600-\u06FF]/;
const letter = (q: GQuestion) => "abcd"[q.answer];

const l327 = bank.lessons.find((l) => l.lesson === 327)!;
const l328 = bank.lessons.find((l) => l.lesson === 328)!;
const l329 = bank.lessons.find((l) => l.lesson === 329)!;
const l330 = bank.lessons.find((l) => l.lesson === 330)!;
const newLessons = [l327, l328, l329, l330];
const allNew = newLessons.flatMap((l) => l.questions);

// داوریِ سوم/چهارم — کلیدِ حرفیِ ۷۲ آیتم (بلوک‌های توضیحیِ fitz + گریدِ چشمیِ انتهای ص۲۱۰)
const KEYS: Record<number, string> = {
  1: "c", 2: "a", 3: "d", 4: "c", 5: "a", 6: "c", 7: "c", 8: "d", 9: "c", 10: "d",
  11: "d", 12: "a", 13: "d", 14: "c", 15: "b", 16: "b", 17: "c", 18: "d", 19: "a", 20: "b",
  21: "c", 22: "c", 23: "a", 24: "b", 25: "d", 26: "a", 27: "a", 28: "d", 29: "c", 30: "b",
  31: "c", 32: "b", 33: "b", 34: "c", 35: "a", 36: "d", 37: "c", 38: "b", 39: "a", 40: "c",
  41: "b", 42: "d", 43: "a", 44: "b", 45: "c", 46: "d", 47: "a", 48: "b", 49: "c", 50: "a",
  51: "d", 52: "a", 53: "b", 54: "b", 55: "d", 56: "c", 57: "b", 58: "a", 59: "c", 60: "d",
  61: "a", 62: "b", 63: "d", 64: "c", 65: "c", 66: "d", 67: "a", 68: "d", 69: "a", 70: "d",
  71: "a", 72: "a",
};

// رونویسیِ چشمیِ دستیِ ۵۰ خطِ قرمزِ «ترجمه:» (رندر ۶۰۰-۱۴۰۰dpi ص۲۰۷-۲۱۰ — قفلِ حرف‌به‌حرف)
const TRANSCRIPT: Record<number, string> = {
  1: "اگر دوست صمیمیش نبودی، من به تو هیچ چیزی در مورد او به تو نمیگفتم.",
  2: "اگه من جای تو بودم، آن کت را نمیخریدم، خیلی گران بود.",
  3: "اگه یک باغ بزرگی داشتی، چکار میکردی؟",
  4: "اگه ما کلید نداشتیم، چکار میکردیم؟",
  5: "اگر آنها اینجا بودند، ماشینشان را قرض میگرفتم.",
  6: "اگه خیلی زیاد غذا نمیخوردی، چاق نمیشدی.",
  7: "اگه تو انگشت نداشتی، چطور میتوانستی بنویسی؟",
  8: "اگه من جای تو بودم، آن ریسک را نمیکردم.",
  9: "اگه میخواهی یک کشور یا ملتی را به خوبی بشناسی، باید هنر آن را مطالعه کنی.",
  10: "اگه به سختی تلاش کرده بودم، قادر میشدم که از سیگار کشیدن دست بکشم.",
  11: "اگه او تصمیم میگیره آن شغل را قبول کنه،و برای بقیه عمرش پشیمان خواهد شد.",
  12: "اگه داری برای آن شغل درخواست میدی، نصیحت من اینه: آن را فراموش کن.",
  13: "اگه میخواهد که امتحاناتش را پاس کنه، او به زودی این کیفیت را خواهد داشت که مثل یک وکیل کار کنه.",
  14: "اگه میخواهی یاری رسان باشی، تو مجبور خواهی بود حقیقت را به من بگویی.",
  15: "اگه من در رقابت برنده بشوم، به عنوان یک کادو یک ماشین اسباب بازی خیلی بزرگی برایت خواهم خرید.",
  16: "اگه برایت یک ماشین بزرگ میخریدم، تو خیلی خوشحال میشدی؟",
  17: "اگه به اندازه او ثروتمند بودم، به یک خانه جدید اسباب کشی میکردم.",
  18: "اگه ما برایت یک پرستار بچه پیدا کنیم، آیا برای شام با ما میآمدی؟",
  19: "اگه قادر باشم به سختی تلاش خواهم کرد که بیایم و شام را در خانه شما بخورم.",
  20: "اگه جای تو بودم، خیلی به شدت کار میکردم تا اینکه پول بیشتری را کسب کنم.",
  21: "اگه می دانستم چطور شنا کنم، من سعی می کردم آن مرد را نجات دهم.",
  22: "من کاملاً مطمئن هستم که اگر جنیفر جای تو بود همان کار (وظیفه) را به شیوهٔ ای متفاوت انجام میداد.",
  23: "اگه دوباره زود بروی، رئیس عصبانی خواهد شد. پس اول از او درخواست اجازه کن.",
  24: "اگه آنها آن شغل سخت را به تو پیشنهاد می دادند، آیا آن را قبول میکردی؟",
  25: "اگه آنها عجله نمیکردند در امتحاناتشان موفق میشدند.",
  26: "اگه من به اندازه کافی سیب داشتم یک کیک سیب میپختم",
  27: "من فکر کنم همه چیز درست خواهد شد. اما اگه مشکلی وجود داشت با من تماس بگیر، باشه؟",
  28: "این سوپ خیلی خوب نیست. اگه نمکین نبود، بهتر میشد.",
  29: "اگه هیچ کسی به من کمک نکنه، من دوچرخه را خودم تعمیر خواهم کرد.",
  30: "تو همیشه خسته هستی. اگه خیلی دیر نمی خوابیدی، تو انقدر خسته نمی شدی.",
  31: "از یک هواپیما به بیرون می پریدی اگر یک چتر نجات داشت؟",
  32: "اگر او تجربه کافی برای آن شغل داشت، رئیس می توانست او را استخدام کند.",
  33: "خانه ای شبیه به یک کاخ می خریدم اگر مرد پولداری بودم اما من فقیر هستم.",
  34: "اگر من می توانستم خیلی خوب انگلیسی صحبت کنم، دنبال شغلی در شرکت های خارجی می گشتم.",
  35: "اگر مجبور نبودم کار کنم، با تو به پارک تفریحی می آمدم.",
  36: "اگر علی و رضا بزرگتر بودند، آنها در تیم فوتبال ما بازی می کردند.",
  37: "همه آن امتحان را قبول می شدند اگر سوالات به اندازه کافی آسان بودند.",
  38: "اگر او پولدارتر بود، در یک خانه بزرگتر زندگی می کرد.",
  39: "تاکسی دیر کرده است. اگر فرهاد مصاحبه شغلی اش را ازدست بدهد، او صاحب کار جدیدی نخواهد شد.",
  40: "اگر هوا خوب بشه، ما فوتبال بازی خواهیم کرد.",
  41: "کجا زندگی می کردی اگر می توانستی هرجای دنیا زندگی کنی؟",
  42: "اگر علی وقت آزاد کافی برای تمرین کردن داشت، او گیتاریست خوبی می شد.",
  43: "اگر من جای تو بودم، منتظر نمی ماندنم. فوراً می رفتتم.",
  44: "شما شغل بهتری به دست می آوردید اگر می توانستید از یک رایانه استفاده کنید.",
  45: "پدربزرگت می توانست این روزنامه را بهتر بخواند اگر عینکش را زده بود.",
  46: "اگر از من می خواست که با او ازدواج کنم، \"بله\" می گفتم.",
  47: "اگر مادربزرگم سیگار نمی کشید، او خیلی سالمتر می بود.",
  48: "جلوی خیلی از مشکلات سلامتی می توانست گرفته شود اگر مردم بهتر غذا می خوردند. (غذاهای بهتری می خوردند.)",
  49: "اگر شما به من مقداری پول قرض بدهید، من قبل از آخر همین ماه به شما آن را برخواهم گرداند.",
  50: "شما تصادفات خیلی زیادی نمی کردید اگر با دقت بیشتری رانندگی می کردید.",
};

describe("jozve g12 conditional-sentence banks (r314 extraction receipt)", () => {
  it("bank shape: lessons 327..330 of exactly 18 questions each, ids g12-cond-1..72 in order", () => {
    for (const l of newLessons) {
      expect(l.questions, `l${l.lesson}`).toHaveLength(18);
      expect(l.count, `l${l.lesson} count`).toBe(18);
      expect(l.level, `l${l.lesson} level`).toContain("کنکوری");
    }
    const ns = allNew.map((q) => q.n);
    expect(ns).toEqual(Array.from({ length: 72 }, (_, i) => i + 1));
    for (const q of allNew) expect(q.id, q.id).toBe(`g12-cond-${q.n}`);
    expect(l327.title).toContain("بانک ۱");
    expect(l327.title).toContain("ص۹۶");
    expect(l330.title).toContain("ص۹۸-۹۹");
  });

  it("purity: 4 unique non-empty options, valid answer, English-pure stem+options, sane blank", () => {
    for (const q of allNew) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.options.every((o) => o.trim().length > 0), q.id).toBe(true);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(FA.test(q.question), q.id).toBe(false);
      for (const o of q.options) expect(FA.test(o), `${q.id} opt`).toBe(false);
      // خالیِ سالم — به‌جز ساقه‌های دستورِ چاپی (item 68: Which of the following...)
      if (!/^Which of the following/.test(q.question)) {
        expect(q.question, q.id).toMatch(/(?:^|\s)-{5,}(?=$|[\s,.!?;:'”"])/);
      }
    }
    // دقیقاً یک ساقهٔ دستوریِ بی‌خالی — عینِ چاپ
    const instruction = allNew.filter((q) => !q.question.includes("-")).map((q) => q.n);
    expect(instruction).toEqual([68]);
  });

  it("keys are print-faithful: every answer matches the independent key transcript (explanatory blocks + letter grid)", () => {
    for (const q of allNew) {
      expect(letter(q), `Q${q.n}`).toBe(KEYS[q.n]);
    }
    // توزیعِ چاپی — کل: a:19/b:15/c:20/d:18
    const dist: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    for (const q of allNew) dist[letter(q)] += 1;
    expect(dist).toEqual({ a: 19, b: 15, c: 20, d: 18 });
    // توزیعِ هر بانک (قفلِ ساختاری)
    const bankDist = (l: GLesson) => {
      const d: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
      for (const q of l.questions) d[letter(q)] += 1;
      return d;
    };
    expect(bankDist(l327)).toEqual({ a: 3, b: 2, c: 7, d: 6 });
    expect(bankDist(l328)).toEqual({ a: 5, b: 5, c: 5, d: 3 });
    expect(bankDist(l329)).toEqual({ a: 5, b: 6, c: 4, d: 3 });
    expect(bankDist(l330)).toEqual({ a: 6, b: 2, c: 4, d: 6 });
  });

  it("semantic arbitration: keys pin the exact option the grammar logic (and the jozve's own explanation) names", () => {
    const q = (n: number) => allNew.find((x) => x.n === n)!;
    expect(q(1).options[q(1).answer]).toBe("wouldn’t"); // شرطی نوع دوم (were)
    expect(q(3).options[q(3).answer]).toBe("will / do"); // شرطی نوع اول
    expect(q(7).options[q(7).answer]).toBe("could"); // شرح: شکل دوم افعال ناقص
    expect(q(9).options[q(9).answer]).toBe("want / should");
    expect(q(13).options[q(13).answer]).toBe("she’ll"); // شرحِ خودِ جزوه: شرطی نوع اول
    expect(q(14).options[q(14).answer]).toBe("will have");
    expect(q(17).options[q(17).answer]).toBe("were");
    expect(q(21).options[q(21).answer]).toBe("would try");
    expect(q(22).options[q(22).answer]).toBe("were"); // شرح: جای was از were
    expect(q(26).options[q(26).answer]).toBe("could bake");
    expect(q(27).options[q(27).answer]).toBe("there is / I’ll call");
    expect(q(30).options[q(30).answer]).toBe("didn’t go");
    expect(q(31).options[q(31).answer]).toBe("Would / had");
    expect(q(32).options[q(32).answer]).toBe("had / could");
    expect(q(33).options[q(33).answer]).toBe("would buy / were"); // «اما من فقیر هستم»
    expect(q(35).options[q(35).answer]).toBe("didn’t have"); // would come
    expect(q(39).options[q(39).answer]).toBe("misses"); // won’t have — شرطی نوع اول
    expect(q(40).options[q(40).answer]).toBe("is / will play"); // شرح: حذفِ b/d/a
    expect(q(43).options[q(43).answer]).toBe("wouldn’t / would go");
    expect(q(46).options[q(46).answer]).toBe("asked / say"); // «بله می گفتم»
    expect(q(47).options[q(47).answer]).toBe("didn’t / would be"); // شرح: حذفِ would/will/could
    expect(q(50).options[q(50).answer]).toBe("wouldn’t have");
  });

  it("r314 wash: items 1..50 carry the printed Persian translation verbatim to the red-line transcript; 51..72 honest absence", () => {
    for (const q of allNew) {
      if (q.n <= 50) {
        expect(q.translation, q.id).toBe(TRANSCRIPT[q.n]);
        expect(FA.test(q.translation!), `${q.id} Persian`).toBe(true);
        expect(q.translation!.length, q.id).toBeGreaterThan(20);
      } else {
        expect(q.translation, `${q.id} grid item has no printed translation`).toBeUndefined();
      }
    }
    // هیچ نویسهٔ لاتینی درونِ ترجمه‌ها (برخلاف r313 که DVDهایی داشت)
    const latin = allNew.filter((q) => q.translation && /[A-Za-z]{2,}/.test(q.translation!));
    expect(latin).toEqual([]);
    // شدتِ پوشش: ۵۰ ترجمه — رسیدِ غیبتِ صادقانه برای ۲۲ گریدی
    const washed = allNew.filter((q) => q.translation).length;
    expect(washed).toBe(50);
  });

  it("source receipt: condSentences registered with pages, method, honestAbsence and printQuirks", () => {
    const r = bank.source.condSentences!;
    expect(r.round).toBe("r314");
    expect(r.title).toContain("جملات شرطی");
    expect(r.bodyPages).toBe("96-99");
    expect(r.keyPages).toContain("207-210");
    expect(r.keyPages).toContain("گرید");
    expect(r.items).toBe(72);
    expect(r.translated).toBe(50);
    expect(r.honestAbsence).toContain("۵۱-۷۲");
    expect(r.method).toContain("pdfplumber");
    expect(r.method).toContain("g12.txt");
    expect(r.method).toContain("fitz");
    expect(r.banks).toContain("l327..l330");
    // رسیدهای چاپیِ کلیدی
    expect(r.printQuirks[10]).toContain("rice"); // ناسازگاریِ درون‌جزوه‌ایِ شرح/ترجمه
    expect(r.printQuirks[7]).toContain("توانستی"); // خوانشِ اصلاح‌شده با زومِ ۱۳۰۰dpi
    expect(r.printQuirks[39]).toContain("ازدست");
    expect(r.printQuirks[43]).toContain("ماندنم");
    expect(r.printQuirks[46]).toContain("بله");
    expect(r.printQuirks[26]).toContain("نقطه");
    expect(Object.keys(r.printQuirks)).toHaveLength(13);
  });

  it("no stem overlap with the neighbouring families (tenses l3/l4, relatives l1/l2, and the whole prior bank)", () => {
    const norm = (s: string) =>
      s
        .replace(/-+/g, " ")
        .replace(/[^\w\s]/g, " ")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .join(" ");
    const newSet = new Set(allNew.map((q) => norm(q.question)));
    for (const les of bank.lessons) {
      if (les.lesson >= 327 && les.lesson <= 330) continue;
      for (const q of les.questions) {
        expect(newSet.has(norm(q.question)), `${q.id} vs g12-cond`).toBe(false);
      }
    }
  });

  it("ids are globally unique across the 1659-question topic bank (330 lessons)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(1659);
    expect(bank.lessons).toHaveLength(330);
  });

  it("UI manifest: four conditional buttons with their own group sit between l2 (p89-91) and l3 (p142) in booklet order", () => {
    const tsx = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    const block = tsx.slice(
      tsx.indexOf("GRADE_GRAMMAR_TOPIC"),
      tsx.indexOf("const topicCache")
    );
    const order = [
      ...block.matchAll(
        /lesson: (\d+), title: "([^"]+)", count: (\d+)(?:, group: "([^"]+)")?/g
      ),
    ].map(([, les, title, count, group]) => ({
      lesson: Number(les),
      title,
      count: Number(count),
      group: group as string | undefined,
    }));
    const idx = (les: number) => order.findIndex((o) => o.lesson === les);
    expect(order.map((o) => o.lesson).slice(0, 4)).toEqual([325, 326, 1, 2]);
    expect(idx(327)).toBeGreaterThan(idx(2));
    expect(idx(327)).toBeLessThan(idx(3));
    expect(order[idx(327)].group).toBe("آزمون گرامر جمله‌های شرطی");
    expect(order[idx(330)].group).toBe("آزمون گرامر جمله‌های شرطی");
    for (const [les, count] of [[327, 18], [328, 18], [329, 18], [330, 18]] as const) {
      expect(order[idx(les)].count).toBe(count);
    }
    expect(order[idx(327)].title).toContain("بانک ۱");
    expect(order[idx(330)].title).toContain("ص۹۸-۹۹");
  });
});
