import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r321 — گاردِ شست‌وشوی ۲۰ ترجمهٔ چاپیِ «پاسخنامهٔ تمرین و دستگریمی آموزش گرامر کلمات ربط» (ص۱۹۲)
// به بانکِ دستگریمیِ «کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)» از grammar-g12-topic.json.
// لایهٔ OCR ص۱۹۲ نویزِ سنگین دارد (شگرم/مهماب/میر نم/خوایه) — رندرِ ۱۶۰۰-۳۶۰۰dpi حاکم (الگوی r316-r320).
// کارِ نیمه‌کارهٔ جلسهٔ موازیِ r321 (پروب‌ها + زوم‌ها) تکمیل شد — پروتکل r303.

type TQ = { id: string; n: number; question: string; options: string[]; answer: number; kind?: string; translation?: string };
type TWash = {
  round: string; pages: string; section: string; method: string; items: number;
  supersedes: string; keyAgree: number; layerNoiseFixes: string[];
  printQuirks: string[]; printErrata: string[];
  correctedRound?: string;
  q18Arbitration?: { round: string; method: string; print: string; english: string; verdict: string; supersedes: string };
};
type TLesson = { lesson: number; title: string; count: number; questions: TQ[]; source?: { translationsWashed?: TWash } };
type TBank = { grade: number; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/grammar-g12-topic.json", "utf8"),
) as unknown as TBank;
const les = bank.lessons.find((l) => l.title.startsWith("کلمات ربط — دستگرمی، پاسخ تایپی (ص۴۸)"))!;
const w = les.source!.translationsWashed!;

// رونویسیِ چشمیِ مستقل از رندر (۳۰۰dpi کامل + ۱۶۰۰dpi خطِ کامل Q18 + ۲۴۰۰-۳۶۰۰dpi زومِ واژه)
const TRANSCRIPT: Record<number, string> = {
  1: "او روزنامه میخواند اما خواندن کتاب را دوست ندارد.",
  2: "فوتبال بازی کردن در پارک در فصل زمستان سرگرم کننده است اما بهتره در گرمای تابستان باشد.",
  3: "من هر یکشنبه به پارک میروم چونکه دوست دارم اردکها را در دریاچه تماشا کنم.",
  4: "من به مهمانی رفت و از آن لذت بردم.",
  5: "او نه تنیس را دوست داره و نه پینگ پونگ. صادقانه بگم، او فقط فوتبال را دوست دارد.",
  6: "نه وظیفه منه و نه او. فقط وظیفه علی است که اتاق را تمیز کند.",
  7: "چای دوست داری یا قهوه؟",
  8: "این سوپ گرم و خوشمزه است.",
  9: "بهترین دوستم و خانواده اش اهل اسپانیا هستند.",
  10: "من میخوام برم بخوابم بنابراین دارم دندانهایم را مسواک میزنم.",
  11: "آنها خیلی فقیر هستند. آنها تلویزیون یا رادیو ندارند.",
  12: "ما باید به سینما بریم یا در خانه بمانیم.",
  13: "من همیشه یک کتاب برای خریدن میخرم با وجود این به نظر نمیرسه یک صفحه از آن را ورق بزنم.",
  14: "او خیلی جوان است با وجود این خیلی با تجربه است.",
  15: "او هر بعد از ظهر به باشگاه تنیس میرود چونکه عاشق تنیس بازی کردن است.",
  16: "او به مدرسه نیامد چونکه مریض بود.",
  17: "ما از فیلم خسته شدیم بنابراین سینما را ترک کردیم.",
  18: "صندلیهای زیادی وجود داشت بنابراین تو مجبور خواهی بود که بایستی.",
  19: "من هر جمعه به پارک میروم و به آواز خواندن پرندگان گوش میکنم.",
  20: "او شنا کردن را دوست دارد اما نمیداند چطور شنا کند.",
};
const KEY_PRINT = "bbfannoraannoryyffssab"
  .split("")
  .map((_, i) => ["but", "but", "for", "and", "nor", "nor", "or", "and", "and", "so", "nor", "or", "yet", "yet", "for", "for", "so", "so", "and", "but"][i]);

const FA = /[\u0600-\u06FF]/;

describe("jozve connector wash g12 (r321 print-verbatim translations of p192 key)", () => {
  it("wash receipt: round/pages/method/items/supersedes/keyAgree + noise fixes/quirks/errata", () => {
    expect(w.round).toBe("r321");
    expect(w.pages).toBe("192");
    expect(w.method).toContain("visual transcription");
    expect(w.method).toContain("3600dpi");
    expect(w.items).toBe(20);
    expect(w.supersedes).toContain("normalized");
    expect(w.keyAgree).toBe(20);
    expect(w.layerNoiseFixes.length).toBeGreaterThanOrEqual(8);
    expect(w.printQuirks.length).toBeGreaterThanOrEqual(10);
    // r322: اراتومِ فرضیِ Q18 رد شد (رندرِ ۴۰۰۰dpi + ساقهٔ انگلیسی) — printErrata خالی شد
    expect(w.printErrata.length).toBe(0);
    expect(w.correctedRound).toBe("r322");
  });

  it("all 20 translations verbatim-locked to the independent print transcript, Persian-pure", () => {
    expect(les.questions).toHaveLength(20);
    for (const q of les.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.translation, `${q.id} present`).toBe(TRANSCRIPT[q.n]);
      expect(FA.test(q.translation!), `${q.id} Persian`).toBe(true);
      expect(/[A-Za-z]{3,}/.test(q.translation!), `${q.id} no Latin leak`).toBe(false);
    }
  });

  it("layer-noise fixes locked: سرگرم/مهمانی/میزنم/بایستی (نه غلط‌های لایه)", () => {
    expect(TRANSCRIPT[2]).toContain("سرگرم کننده");
    expect(TRANSCRIPT[2]).not.toContain("شگرم");
    expect(TRANSCRIPT[4]).toContain("مهمانی");
    expect(TRANSCRIPT[4]).not.toContain("مهماب");
    expect(TRANSCRIPT[10]).toContain("مسواک میزنم");
    expect(TRANSCRIPT[10]).not.toContain("میر نم");
    expect(TRANSCRIPT[18]).toContain("مجبور خواهی بود");
    expect(TRANSCRIPT[18]).toContain("بایستی");
    expect(TRANSCRIPT[18]).not.toContain("خوایه");
    expect(TRANSCRIPT[18]).not.toContain("نبود");
    expect(TRANSCRIPT[6]).toContain("علی");
    expect(TRANSCRIPT[6]).toContain("تمیز");
  });

  it("Q18 arbitration (r322): خوانشِ «نبود» رد شد — چاپ «خواهی بود» با ساقهٔ انگلیسی هم‌رأی است", () => {
    const arb = w.q18Arbitration!;
    expect(arb.round).toBe("r322");
    expect(arb.method).toContain("4000dpi");
    expect(arb.print).toContain("خواهی بود");
    expect(arb.verdict).toContain("no print erratum");
    expect(arb.supersedes).toContain("r321 printErrata");
    // ساقهٔ انگلیسی دست‌نخورده: "There are no more chairs available, --- you will have to stand."
    const q18 = les.questions.find((q) => q.n === 18)!;
    expect(q18.question).toContain("no more chairs");
    expect(q18.options[q18.answer]).toBe("so");
    expect(q18.translation).toContain("خواهی بود");
  });

  it("all 20 keys locked to the printed letter key of p192 (۲۰/۲۰)", () => {
    les.questions.forEach((q, i) => {
      expect(q.options[q.answer], `Q${q.n} key`).toBe(KEY_PRINT[i]);
    });
  });
});
