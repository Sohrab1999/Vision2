import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r346 — گاردِ «متوسط — تست واژگان درس چهارم» جزوهٔ دهم (ص۱۵۱-۱۵۲، کلید و ترجمهٔ چاپیِ ص۲۸۸-۲۸۹):
// بانکِ ۸۱ — ۴۰ MCQ واژگانِ متوسط به الگوی r339/r343 (هر آیتم با ترجمهٔ چاپیِ «ترجمه تست»).
// داوری‌های رندر ۹۰۰-۳۰۰۰dpi: سربرگِ آزمون «تست واژگان "درس چهارم - پایه دهم"» + «سطح: "متوسط"» +
// «(پاسخنامه صفحه: ۲۸۸ - ۲۸۹)» ارقامِ فارسی با خط‌تیره؛ سربرگِ کلید «(سؤالات: صفحه ۱۵۱ تا ۱۵۲)» ارقامِ
// فارسی با «تا» (لایه لاتین 151/152)؛ گریدهای «N. گزینه (x) : ترجمه تست: "..."» با ارقامِ فارسی +
// کلیدواژهٔ سرخِ زیرخط‌دار + جداکنندهٔ خط‌چینِ بنفش + جعبهٔ «Note:» خالیِ ص۲۸۹.
// کشف‌های تجزیهٔ لایه: جلوئی→جلوی، سنت،،→سنت، اعتقاد، رسوم، بین ما شان→تفاوت های مابین شان، بیشی→بیشتر،
// رسگریم→سرگرمی (ن/م)، احی ام→احترام، داخیل→داخلی، مؤ جهی→موجهی، دالر/دالیل→دلار/دلیل، احتمایل→احتمال،
// آموزشگاهای→آموزشگاههای، مد نر→مدرن، مسئولنه→مسئولانه، ب ارزش→بی ارزش، ُدِیب→دُبی (ضمه)، نخت→تخت (۳۰۰۰dpi).
// کوئیرک‌های ساقه: Q11 «11.The» چسبیده، Q14 دو فاصله بعد کاما، Q24 «couldn't» مستقیم، Q35/Q39 بدونِ
// نقطهٔ پایانی، Q40 «---- .» فاصله‌دار، Q1 «summer vacations» جمع، Q19 «Corona Virus»، Q22 «some of people».
// تیره‌شماری: ۴۰ ران = ۸۲۶ تیره — استاندارد ۲۳ (استثناها: Q3=۲۰، Q4/5/8/38=۱۸، Q7=۷، Q15/20/23/31=۱۶،
// Q22=۲۲، Q25/33/40=۱۹، Q28=۱۳، Q37/39=۲۱). کلید: ۴۰/۴۰ با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    vocab40l4?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B81 = bank.lessons.find((l) => l.lesson === 81)!;

describe("jozve tests-g10 vocab40l4 receipt (r346 تست واژگان درس چهارم — pp151-152, key pp288-289)", () => {
  it("vocab40l4 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.vocab40l4).toBeTruthy();
    const s = bank.source.vocab40l4!;
    expect(s.exam).toContain("ص۱۵۱-۱۵۲");
    expect(s.header).toContain("تست واژگان");
    expect(s.header).toContain("۲۸۸ - ۲۸۹"); // ارقامِ فارسی با خط‌تیره
    expect(s.header).toContain("۱۵۱ تا ۱۵۲"); // ارقامِ فارسی با واصفِ «تا» (لایه لاتین)
    expect(s.header).toContain("متوسط");
    expect(s.keyPages).toBe("288-289");
    expect(s.keyVerification).toContain("۴۰/۴۰");
    expect(s.keyVerification).toContain("Note:"); // جعبهٔ خالیِ ص۲۸۹
    expect(s.extractedRound).toBe("r346");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(9);
    expect(s.printQuirks.some((q) => q.includes("۸۲۶"))).toBe(true); // تیره‌شماری
    expect(s.printQuirks.some((q) => q.includes("11.The"))).toBe(true); // چسبیدگیِ شماره
    expect(s.printQuirks.some((q) => q.includes("couldn't"))).toBe(true); // آپوستروفِ مستقیم
    expect(s.printQuirks.some((q) => q.includes("بدونِ نقطهٔ پایانی"))).toBe(true); // Q35/Q39
    expect(s.printQuirks.some((q) => q.includes("مابین شان"))).toBe(true); // تجزیهٔ «بین ما شان»
    expect(s.printQuirks.some((q) => q.includes("سرگرمی"))).toBe(true); // تجزیهٔ «رسگریم»
    expect(s.printQuirks.some((q) => q.includes("Telegram"))).toBe(true); // غیبتِ پاصفحه
    expect(s.printQuirks.some((q) => q.includes("تخت جمشید"))).toBe(true); // ردِ «نخت»
  });
});

describe("jozve tests-g10 l4vocab40 bank 81 shape (r346 — p151-152)", () => {
  it("bank 81 shape: 40 MCQ, ids g10-l81-N, category vocab, every item carries printed translation", () => {
    expect(B81.count).toBe(40);
    expect(B81.level).toContain("متوسط");
    expect(B81.title).toContain("ص۱۵۱-۱۵۲");
    expect(B81.questions.length).toBe(40);
    B81.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l81-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("vocab");
      expect(q.options, q.id).toHaveLength(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThanOrEqual(3);
      expect(typeof q.translation, q.id).toBe("string");
      expect(q.translation!.length, q.id).toBeGreaterThan(15);
    });
  });

  it("bank 81 keys locked to printed grid pp288-289 — 40/40 zero divergence", () => {
    // خودِ گریدِ چاپی — حرفِ کلیدِ هر آیتم عینِ گریدِ ص۲۸۸-۲۸۹
    const keys = B81.questions.map((q) => "abcd"[q.answer]).join("");
    expect(keys).toBe("dbcacabdbacdabbcadacbbdbdabacaccdbabaaba");
  });

  it("bank 81 stems verbatim: standard 23-dash blanks with print-verbatim exceptions", () => {
    const lens = B81.questions.map((q) => {
      const m = q.question.match(/-{2,}/);
      return m ? m[0].length : 0;
    });
    expect(lens).toEqual([
      23, 23, 20, 18, 18, 23, 7, 18, 23, 23, 23, 23, 23, 23, 16, 23, 23, 23, 23,
      16, 23, 22, 16, 23, 19, 23, 23, 13, 23, 23, 16, 23, 19, 23, 23, 23, 21, 18, 21, 19,
    ]);
    expect(lens.reduce((s, x) => s + x, 0)).toBe(826);
    // کوئیرک‌های عینِ چاپ
    expect(B81.questions[6].question).toContain("for other people is ------- of that person or people."); // Q7 دوسطری + ۷تیره
    expect(B81.questions[27].question).toContain("The foreign ------------- complained that he’s been held"); // Q28 ۱۳تیره
    expect(B81.questions[13].question).toContain("such as films,  TV performances"); // Q14 دو فاصله
    expect(B81.questions[23].question).toContain("We searched a lot but couldn't -----------------------"); // Q24 مستقیم
    expect(B81.questions[34].question).toBe(
      "I was so ----------------------- and warm in my bed. I didn’t want to get up at all",
    ); // Q35 بدونِ نقطهٔ پایانی
    expect(B81.questions[38].question).toBe(
      "We never eat --------------------- food because it is a packaged food that has low value for health",
    ); // Q39 بدونِ نقطهٔ پایانی
    expect(B81.questions[39].question).toContain("three month tourist ------------------- ."); // Q40 نقطهٔ فاصله‌دار
    expect(B81.questions[0].question).toContain("for his summer vacations on Wednesday."); // Q1 جمع
    expect(B81.questions[18].question).toContain("because of Corona Virus."); // Q19 کپیتال
    expect(B81.questions[21].question).toContain("for some of people around the world."); // Q22 دستورِ چاپ
    expect(B81.questions[10].question).toContain("The two products looked quite ----------------------- and I got confused."); // Q11 — دیتا بدونِ شماره
  });
});

describe("jozve tests-g10 l4vocab40 translations verbatim (r346 — printed key pp288-289)", () => {
  it("translations carry print micro-punctuation and spacing quirks", () => {
    expect(B81.questions[0].translation).toBe("او قصد دارد برای تعطیلات تابستانی اش در چهارشنبه به آمریکا پرواز کند.");
    expect(B81.questions[3].translation).toContain("فعالیتی. آنجا بیابان است."); // «آنجا» چسبیده
    expect(B81.questions[5].translation).toContain("تنش های بین المللی زیادی"); // فاصله‌محور
    expect(B81.questions[7].translation).toContain("حیاط جلوی بزرگ"); // تجزیهٔ «جلوئی»
    expect(B81.questions[7].translation).toContain("(رؤیای من)");
    expect(B81.questions[8].translation).toContain("به سنت، اعتقاد، رسوم و راه شان"); // تجزیهٔ «سنت،،»
    expect(B81.questions[13].translation).toContain("سرگرمی های زنده ای"); // تجزیهٔ «رسگریم»
    expect(B81.questions[15].translation).toContain("زندگی درونی (داخلی) اش"); // تجزیهٔ «داخیل»
    expect(B81.questions[19].translation).toContain("بچه الگوی طبیعی پیشرفت"); // عینِ چاپ
    expect(B81.questions[22].translation).toContain('من برای کار "جین" که برای پیشرفت'); // گیومهٔ درونی
    expect(B81.questions[24].translation).toContain("مسافرت می کند، در حقیقت او یک زائر است."); // ویرگولِ چاپ
    expect(B81.questions[25].translation).toContain("در آموزشگاههای زبان"); // تجزیهٔ «آموزشگاهای»
    expect(B81.questions[26].translation).toContain('شهر "دُبی" برای درآمد بیشترش'); // ضمهٔ چاپی
    expect(B81.questions[29].translation).toContain("همیشه یک احتمال وجود دارد"); // تجزیهٔ «احتمایل»
    expect(B81.questions[31].translation).toContain("تفاوت های مابین شان مقایسه کرده اید."); // تجزیه + «کرده اید.»
    expect(B81.questions[34].translation).toContain("من نخواستم اصلاً بلند شوم."); // تنوین
    expect(B81.questions[35].translation).toContain("بیشتر بیابان است بدون هیچ گونه (زمین) کشاورزی."); // تجزیهٔ «بیشی»
    expect(B81.questions[36].translation).toContain("روش مسئولانه تری برخورد"); // تجزیهٔ «مسئوالنه»
    expect(B81.questions[38].translation).toContain("غذای هله هوله (بی ارزش) نمی خوریم"); // تجزیهٔ «ب ارزش»
    expect(B81.questions[39].translation).toBe("او تقاضای ویزای تحصیلی سه ماهه کرد."); // نقطهٔ پایانیِ تمیز
  });
});

describe("jozve tests-g10 file shape after r346 (95 banks / 1189 items)", () => {
  it("file shape: 95 banks, 1189 items, unique ids", () => {
    expect(bank.lessons.length).toBe(95);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1189);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(1189);
    expect(new Set(ids).size).toBe(1189);
  });

  it("family shape vector extended: r326/r338 +7 members (8,10,10,5,5,10,20) — 89 members", () => {
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(89);
    expect(tail.slice(-8, -7)).toEqual([20]); // بانکِ ۸۸ — آخرین عضو
    expect(tail.slice(-19, -15)).toEqual([16, 8, 8, 25]); // خانوادهٔ tashrihi4 درسِ چهارم (پیش از r347)
  });
});
