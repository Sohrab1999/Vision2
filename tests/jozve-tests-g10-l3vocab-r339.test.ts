import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r339 — گاردِ «متوسط — تست واژگان درس سوم» جزوهٔ دهم (ص۱۲۳-۱۲۴، کلید و ترجمهٔ چاپی ص۲۷۵-۲۷۶)
// هفدهمین بانکِ درس‌محورِ پایهٔ دهم — ۴۰ MCQ با ترجمهٔ چاپیِ «ترجمه تست» در فیلد translation (الگوی r324/r325).
// کلیدِ حرفی از گریدِ چاپِ ص۲۷۵-۲۷۶ — ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی، صفر واگرایی.
// داوری‌های رندر: Q22 «حقیقتی» (۳۶۰۰dpi) + Q33 «اعتقاد» (۵۲۰۰dpi؛ خوانشِ «اعتماد» غلط بود) +
// Q37 «هنگامیک» چاپ‌غلطِ عینِ چاپ + Q21 «(PBHU)» و «فرمود:» کولون‌دار + Q24 «در 4شنبه» رقمِ لاتین.

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
    l3vocab?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; translations: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// گریدِ حرفیِ چاپِ ص۲۷۵-۲۷۶ (۴۰ حرف، ۴ سطرِ ۱۰تایی — Q1-28 در ص۲۷۵، Q29-40 در ص۲۷۶)
const KEY_LETTERS =
  "cabadbdbaa" + "bbbaabbbaa" + "bbbbcabbbc" + "abccbbccaa";
// واژهٔ کلید هر آیتم (حرفِ چاپ → گزینه) — قفلِ دوم مستقل
const KEY_WORDS = [
  "favorite", "airplane", "famous", "useful", "medicine", "sooner", "energetic", "experiment", "success", "invented",
  "solving", "poems", "grave", "gave up", "thinker", "facts", "quit", "gained", "patients", "value",
  "Seek", "grow up", "modern", "unfortunately", "attend", "key", "getting around", "reciting", "publish", "translate",
  "jump out", "medicine", "belief", "passed away", "weak", "cradle", "suddenly", "interest", "knowledge", "develop",
];

// ترجمه‌های چاپی — رونویسیِ رندر (۳۰۰dpi کامل ×۴ صفحه + ۳۶۰۰-۵۲۰۰dpi جراحی)
const TRANSCRIPT: Record<number, string> = {
  1: "جک در حالیکه پدرش مشغول تماشای فیلم مورد علاقهاش در اتاق نشیمن بود، به خانه رسید.",
  2: "ما قصد داریم تابستان امسال با هواپیما به روسیه مسافرت کنیم. من پرواز کردن را دوست دارم.",
  3: "من درحال خواندن کتابی هستم که در مورد دانشمندان بزرگ ایرانی مشهور مانند ابوعلی سینا و رازی هست.",
  4: "آن رمان چنان مفید بود که من چیزهای جالب زیادی از آن یاد گرفتم.",
  5: "او در دانشگاه تهران پزشکی می خواند. او دوست دارد، دکتر بشود.",
  6: "الف: \"چه کسی زودتر به مدرسه آمد، تو یا دوستت؟\" ب: \"من اول آمدم.\"",
  7: "برادرم خیلی پر انرژی است. او همیشه ورزش می کند.",
  8: "آنها در آزمایشگاه روی سلولهای خونی آزمایش انجام می دهند.",
  9: "پشتکار و توکل بر خدا برای همه موفقیت می آورد.",
  10: "توماس ادیسون اولین لامپ را اختراع کرد و بعد از آن مشهور شد.",
  11: "معلمم خیلی یاری رسان است. او در حل مسائل فیزیک به من کمک می کند.",
  12: "پدرم هر سال چند شعر حافظ را در شب یلدا می خواند.",
  13: "قبر عمویم در بهشت زهرا است و من بعضی اوقات به آنجا می روم.",
  14: "او کارش را با ناراحتی ترک کرد و فوراً بیرون رفت.",
  15: "یک متفکر شخصی است که وقت زیادی به فکر کردن در مورد ایده ها و مسائل مهم صرف می کند.",
  16: "بسیاری از مردم سخت تلاش می کنند که حقایق در مورد جهان را پیدا کنند.",
  17: "من هرگز تحقیق کردن را رها نمی کنم. \"رها کردن\" مترادف \"ترک کردن\" است.",
  18: "او سرانجام پول زیادی از اختراع بزرگش بدست آورد.",
  19: "خواهر کوچکترم به پزشکی و کمک به بیماران علاقه مند است.",
  20: "ارزش علم برای همه واضح است. آن (علم) باعث می شود زندگی مان بهتر شود.",
  21: "پیامبر اکرم (درود خدا بر او باد) اینچنین فرمود: \"زگهواره تا گور دانش بجوی.\"",
  22: "این حقیقتی است که بچه ها معمولاً به سرعت رشد می کنند و همه این (حقیقت) را دوست دارند.",
  23: "عکس گرفتن با دوربین مدرن خیلی لذت بخش است.",
  24: "متاسفانه، جان پارسال یکی از چشمهایش را در 4شنبه سوری از دست داد. \"متاسفانه\" هم معنی: بطور تاسف بار.",
  25: "دوستم پارسال به خاطر بیماریش به مدت سه ماه در مدرسه حضور نیافت.",
  26: "پشتکار کلید موفقیت همه در جهان است.",
  27: "ویروس کرونا به سرعت در جهان در حال گسترش است و افراد زیادی مریض می شوند.",
  28: "خواندن و تلاوت قرآن کریم برای ما در هر سنی خیلی مهم و ضروری است",
  29: "بعضی از نویسندگان بزرگ، هر سال کتابهایشان را منتشر می کنند.",
  30: "با یادگیری یک زبان جدید ما می توانیم بعضی کتابها را به آن زبان ترجمه کنیم.",
  31: "آتش نشانان برای خاموش کردن آتش، همیشه به سرعت از ماشین هایشان بیرون می پرند.",
  32: "من برای کمر دردم باید مقداری دارو بخورم.",
  33: "کلید موفقیت دانش آموزان، داشتن اعتقاد به خودشان است.",
  34: "پدر بزرگم در سال 1397 به علت بیماری اش به رحمت خدا رفت.",
  35: "من با یک قلب ضعیف، مشکلاتی در دویدن دارم.",
  36: "این بچه کوچک که در گهواره خوابیده، خیلی زیباست.",
  37: "دیشب هنگامیک ساعت 11 در اتاق خوابم خوابیده بودم، ناگهان یک صدای بلندی شنیدم و به سرعت بیدار شدم.",
  38: "به عنوان یک معلم انگلیسی، من علاقه زیادی به تدریس انگلیسی دارم.",
  39: "او هیچ دانشی در مورد فضا ندارد. او می خواهد بزودی چیزهایی در مورد آن را یاد بگیرد.",
  40: "کشورمان به توسعه نوع جدیدی از انرژی برای آینده نیاز دارد.",
};

const L57 = bank.lessons.find((l) => l.lesson === 57)!;
const LET = "abcd";

describe("jozve tests-g10 l3vocab (r339 متوسط — p123-124, key+translations pp275-276)", () => {
  it("l3vocab receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.l3vocab).toBeTruthy();
    const s = bank.source.l3vocab!;
    expect(s.exam).toContain("متوسط");
    expect(s.header).toContain("۲۷۵-۲۷۶");
    expect(s.header).toContain("سؤاالت"); // تجزیهٔ لایگِچرِ لایه — رندر حاکم: «سؤالات»
    expect(s.keyPages).toBe("275-276");
    expect(s.keyVerification).toContain("۴۰/۴۰");
    expect(s.extractedRound).toBe("r339");
    expect(s.pattern).toContain("r324/r325");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(10);
    expect(s.printQuirks.some((q) => q.includes("PBHU"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("هنگامیک"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("اعتقاد"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("4شنبه"))).toBe(true);
  });

  it("bank 57 shape: 40 MCQ, 4 unique options each, no typed fields", () => {
    expect(L57.count).toBe(40);
    expect(L57.questions).toHaveLength(40);
    expect(L57.title).toContain("ص۱۲۳-۱۲۴");
    L57.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("40 answers locked letter-by-letter to the printed key grid pp275-276", () => {
    L57.questions.forEach((q, i) => {
      expect(LET[q.answer], `Q${q.n} letter`).toBe(KEY_LETTERS[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(KEY_WORDS[i]);
    });
  });

  it("40 printed translations locked verbatim to the render transcript", () => {
    L57.questions.forEach((q) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSCRIPT[q.n]);
    });
  });

  it("Persian purity: no Latin letters in translations (Persian digits OK)", () => {
    L57.questions.forEach((q) => {
      expect(/[A-Za-z]/.test(q.translation!), `Q${q.n}: ${q.translation}`).toBe(false);
    });
  });

  it("print quirks visible in data: Q21 PBHU, Q37 short-blank normalized, Q7 straight apostrophe, Q22/Q33 render arbitration", () => {
    const byN = (n: number) => L57.questions[n - 1];
    expect(byN(21).question).toContain("(PBHU)");
    expect(byN(2).question).toContain("travel to Russian");
    expect(byN(15).question).toContain("is a someone who");
    expect(byN(1).question).toContain("film at the living room");
    expect(byN(37).question.match(/-------------------/g)?.length).toBe(1); // نرمال‌شده به تیرهٔ استاندارد ۱۹تایی
    expect(byN(7).question).toContain("He's"); // آپاستروفِ مستقیمِ چاپ
    expect(byN(24).question).toContain('"Sadly"'); // گیومهٔ مستقیمِ چاپ
    expect(byN(22).translation).toContain("حقیقتی است");
    expect(byN(33).translation).toContain("اعتقاد");
    expect(byN(37).translation).toContain("هنگامیک");
    expect(byN(24).translation).toContain("در 4شنبه سوری");
    expect(byN(28).translation!.endsWith("ضروری است")).toBe(true); // بدونِ نقطهٔ پایانی — عینِ چاپ
    expect(byN(33).translation!.endsWith("است.")).toBe(true);
    expect(byN(31).translation).toContain("ماشین هایشان بیرون می پرند");
    expect(byN(21).translation).toContain("فرمود:");
  });

  it("ids unique across the whole 828-item family (r339 l3vocab appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(951);
  });
});
