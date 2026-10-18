import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r349 — گاردِ «تست گرامر و نگارش درس چهارم - پایه دهم» سطحِ استاندارد (ص۱۶۷-۱۶۹، کلیدِ چاپیِ ص۲۹۵-۲۹۹)
// سی‌امین گروهِ کارتِ دهم / بانکِ ۹۶ — ۵۷ MCQ با ترجمهٔ چاپیِ «ترجمه تست» در هر آیتم (الگوی r343/r341).
// داوری‌های رندرِ ۹۰۰-۱۶۰۰dpi (۳۰ برش):
// سربرگِ آزمون «تست گرامر و نگارش "درس چهارم- پایه دهم"» قرمز در گیومه روی نوارِ سبز + «سطح: "استاندارد"»
// تک‌سطحِ نقل‌قولی + «(پاسخنامه صفحه: ۲۹۵ - ۲۹۹)» ارقامِ فارسی با دونقطه (الگوی r347/r348)؛
// سربرگِ کلید «پاسخنامه تستهای استاندارد و سخت گرامر و نگارش "درس چهارم- پایه دهم" (سؤالات: صفحه ۱۶۷ - ۱۶۹)» —
// «سؤاالت» لایه = پانزدهمین تجزیهٔ لیگاتور؛ گیومهٔ سربارِ لایه بر «سخت"» نویز؛
// جای‌خالی‌ها تیره‌چینِ سبز (خط‌چین) — Q2 رانِ [۱۰،۴] لایه = یک خط در رندر → ۱۴ تیرهٔ یکپارچه؛
// حروفِ گزینه‌ها کادرِ آبیِ روشن؛ شماره‌ها قرمز؛
// چاپ‌غلط‌های عینِ چاپ: Q28 «bust station»، Q37 «will regret»، Q46-d «the slowestly»، Q13-b «Can we going»،
// Q55 «to whether»، Q14 «She/He»؛ اسلش‌های تک‌فاصله‌شده: Q3-b «can’t /must»، Q18-d «couldn’t/ at»، Q31-b «at/ on»؛
// تیره‌های چسبیده: Q19 به Tehran، Q35 ویرگول، Q39/Q40 نقطه، Q46 تعجب؛
// Q26 «10: 30» فاصله‌دار (رندر حاکم بر لایه) + گیومهٔ سربارِ «"B:»؛ Q47 دوسطری تخت‌شده؛ Q43 گیومهٔ بستهٔ A نیامده؛
// Q15 «Yes. don’t worry» دِ کوچک؛ برچسب‌های کنکور: (هنر ۹۵)/(تجربی ۹۸)/(ریاضی ۹۸)؛
// Q24 تک‌واگراییِ کلیدِ خانواده: کلیدِ چاپی d «in / on» حاکم بر پیش‌پرکردنِ «at Norouz» (r344)؛
// نویزهای لایه→چاپِ تمیز: «الله»→لاله، «قلت»→قلب، «جک»=Jack، «بکتن»→بکنی، «میر نان»→میزان، «رسی ایط»→شرایط…

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string;
    gram9?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B = bank.lessons.find((l) => l.lesson === 96)!;

// گریدِ کلیدِ چاپیِ ص۲۹۵-۲۹۹ (رونویسیِ رندر — ۵۷ حرف)
const PRINT_KEY =
  "a d c b d a a b a d d b a c b b d d d c a d b d a c a d b b a c d b c c a c c a c d a d a c b d c a b c b b d b a".split(" ");

const STEMS_QUIRK: [number, string][] = [
  [28, "bust station"], [37, "will regret"], [55, "to whether"], [14, "He didn’t become tired"],
  [15, "Yes. don’t worry"], [19, "Tehran. It"], [26, "10: 30"], [26, "\"B: “Oh, it’s late."],
  [46, "----------------!"], [35, "-------------------,"], [39, "-------------------. It attracts"],
  [40, "------------------. She takes care"], [52, "It’s an order"], [25, "Friday mornings"],
];
const OPTION_QUIRKS: [number, number, string][] = [
  [3, 1, "can’t /must"], [18, 3, "couldn’t/ at"], [31, 1, "at/ on"],
  [13, 1, "Can we going"], [46, 3, "the slowestly"], [25, 0, "On"], [39, 2, "beautiful / -"],
];
const TRANS_QUIRKS: [number, string][] = [
  [1, "لابد"], [3, "ورزش بکنی ،"], [4, "معلم گفت:"], [5, "قرآن کریم"], [6, "جک امکان نداره"],
  [6, "گرسنه باشی"], [11, "گم شده است ."], [12, "برف بیارد"], [14, "اصلا خسته نمی شد ."],
  [17, "سمیرا"], [18, "اتفاقی که در کنسرت"], [19, "شهر تمیزی"], [20, "دویست کیلو"],
  [24, "روز طبیعت"], [26, "عجله بکنی"], [28, "ایستگاه اتوبوس"], [29, "الف : جین ،"],
  [30, "بیست و نهم اوت"], [31, "خیلی کمی"], [33, "برچسب هم روی بطری"], [34, "مشکلات"],
  [34, "دسترسی"], [36, "پشت میز"], [37, "۱۴۰۵"], [38, "توانایی شمردن"], [40, "اخیرا"],
  [42, "زیبایی رفتار بکنی"], [45, "خیریه"], [47, "تعطیلات"], [47, "حتما الان"],
  [48, "لاله"], [48, "سکته قلب"], [49, "بالای کوه"], [50, "شگفت انگیزی"],
  [52, "یکی یکی"], [52, "پایین"], [52, "چیه"], [53, "سرد"], [53, "خوبی"],
  [54, "لطفاً"], [54, "آنچه"], [55, "میزان"], [55, "شرایط"], [55, "متفاوت"],
  [56, "استراحت"], [56, "طولانی"], [57, "عصبانی"], [57, "بنابراین تو باید اول از او اجازه بگیری"],
];

describe("jozve tests-g10 l4gwr (r349 تست گرامر و نگارش درس چهارم استاندارد — pp167-169, key pp295-299)", () => {
  it("gram9 receipt complete: header, key pages, round, pattern, quirks, Q24 divergence", () => {
    expect(bank.source.gram9).toBeTruthy();
    const s = bank.source.gram9!;
    expect(s.exam).toContain("ص۱۶۷-۱۶۹");
    expect(s.header).toContain("۲۹۵ - ۲۹۹"); // ارقامِ فارسی با دونقطه — الگوی r347/r348
    expect(s.header).toContain("استاندارد");
    expect(s.printQuirks.join(" ")).toContain("سؤاالت"); // پانزدهمین تجزیهٔ لیگاتور — سربرگِ کلید
    expect(s.keyPages).toBe("295-299");
    expect(s.keyVerification).toContain("56/57");
    expect(s.keyVerification).toContain("Q24");
    expect(s.extractedRound).toBe("r349");
    expect(s.pattern).toContain("r343");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(17);
    expect(s.printQuirks.join(" ")).toContain("bust station");
    expect(s.printQuirks.join(" ")).toContain("لاله");
    expect(s.printQuirks.join(" ")).toContain("in / on");
  });

  it("bank shape: 57 MCQ, category grammar, unique ids g10-l96-1..57, translations everywhere", () => {
    expect(B.title).toBe("استاندارد — تست گرامر و نگارش درس چهارم (ص۱۶۷-۱۶۹)");
    expect(B.level).toBe("استاندارد — چهارگزینه‌ای");
    expect(B.count).toBe(57);
    expect(B.questions).toHaveLength(57);
    B.questions.forEach((q, i) => {
      expect(q.n).toBe(i + 1);
      expect(q.id).toBe(`g10-l96-${i + 1}`);
      expect(q.category).toBe("grammar");
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThanOrEqual(3);
      expect(q.translation).toBeTruthy();
      // هر ساقه دست‌کم یک جای‌خالیِ ۶+ تیره دارد (سؤالِ بدونِ خط‌چین ندارد)
      expect(q.question).toMatch(/-{6,}/);
    });
  });

  it("print key grid locked: 57 letters match data answers in order", () => {
    B.questions.forEach((q, i) => {
      expect("abcd"[q.answer]).toBe(PRINT_KEY[i]);
    });
    // تکیه‌گاه‌های نمونهٔ رندرشده
    expect(B.questions[0].answer).toBe(0); // Q1 must
    expect(B.questions[1].answer).toBe(3); // Q2 may
    expect(B.questions[23].answer).toBe(3); // Q24 in / on — کلیدِ حاکمِ r344
    expect(B.questions[54].answer).toBe(3); // Q55 differently
    expect(B.questions[55].answer).toBe(1); // Q56 must need
    expect(B.questions[56].answer).toBe(0); // Q57 you should
  });

  it("verbatim stems with print quirks: bust station / will regret / attached dashes / 10: 30", () => {
    for (const [n, frag] of STEMS_QUIRK) {
      expect(B.questions[n - 1].question).toContain(frag);
    }
    expect(B.questions[27].question).not.toContain("bus station");
    expect(B.questions[36].question).not.toContain("retire");
    // برچسب‌های کنکور با ارقامِ فارسی
    expect(B.questions[54].question).toContain("(هنر ۹۵)");
    expect(B.questions[55].question).toContain("(تجربی ۹۸)");
    expect(B.questions[56].question).toContain("(ریاضی ۹۸)");
    // گزینه‌های عینِ چاپ
    for (const [n, oi, frag] of OPTION_QUIRKS) {
      expect(B.questions[n - 1].options[oi]).toBe(frag);
    }
    // جای‌خالیِ Q2: ۱۴ تیرهٔ یکپارچه (رانِ [۱۰،۴] لایه = یک خطِ خط‌چین در رندر)
    expect(B.questions[1].question).toContain("she -------------- be in her office");
    // شمارشِ تیره‌ها: ۱۵۰۷ تیره در ۸۷ رانِ داده (۸۸ رانِ لایه منهای ادغامِ Q2 [۱۰،۴]→۱۴)
    const total = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].reduce((a, m) => a + m[0].length, 0), 0);
    expect(total).toBe(1507);
    const runs = B.questions.reduce(
      (s, q) => s + [...q.question.matchAll(/-{6,}/g)].length, 0);
    expect(runs).toBe(87);
  });

  it("translations verbatim: لاله/قلب، جک، ۱۴۰۵ فارسی، میزان/شرایط، محاورهٔ چاپ، بدونِ لاتین", () => {
    for (const [n, frag] of TRANS_QUIRKS) {
      expect(B.questions[n - 1].translation).toContain(frag);
    }
    expect(B.questions[47].translation).not.toContain("الله");
    expect(B.questions[47].translation).not.toContain("قلت");
    expect(B.questions[36].translation).toContain("بازنشسته می شود");
    // رقمِ فارسیِ ۱۴۰۵ در ترجمه، رقمِ لاتینِ 1405 در ساقه
    expect(B.questions[36].translation).toMatch(/۱۴۰۵/);
    expect(B.questions[36].translation).not.toMatch(/1405/);
    // خلوصِ فارسی (قاعدهٔ r324/r325)
    B.questions.forEach((q, i) => {
      expect(/[a-zA-Z]/.test(q.translation!)).toBe(false);
    });
    // گپِ دیالوگِ ترجمه‌ها تک‌فاصله (قرینهٔ r343)
    expect(B.questions[1].translation).toContain("کجا است؟ ب: مطمئن نیستم");
    expect(B.questions[46].translation).toContain("دزدیدند. ب: اوه نه");
  });

  it("file shape after r349: 98 banks, 1466 items, unique ids, group registered", () => {
    expect(bank.lessons).toHaveLength(98);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(1466);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1466);
    // وکتورِ دنباله: بانکِ ۹۶ با ۵۷
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(92);
    expect(tail.slice(-3, -2)).toEqual([57]);
    expect(tail.slice(-10, -3)).toEqual([16, 12, 13, 2, 4, 6, 6]); // جامعِ چهارم — r348
  });
});
