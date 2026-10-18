import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r328 — گاردِ «تست واژگان درس دوم — بخش دوم، سطح استاندارد» جزوهٔ دهم (ص۸۹-۹۰، کلید و ترجمهٔ چاپی ص۲۶۱-۲۶۳)
// ششمین/دوازدهمین بانکِ درس‌محورِ پایهٔ دهم — ۴۰ MCQ با ترجمهٔ چاپیِ «ترجمه تست» در فیلد translation
// (الگوی r320/r324/r325/r327). کلیدِ حرفی از گریدِ چاپِ ص۲۶۱-۲۶۳ — ۴۰/۴۰ هم‌رأی با پیش‌پرکردنِ معنایی، صفر واگرایی.
// کشفِ ویژهٔ راند: در کلیدِ چاپیِ Q40، سطرِ glossها (طول عمر/برنامه/طبیعت/علاقه) و هایلایتِ «طول»
// کپیِ اشتباه از Q40ِ «استاندارد درس اول» (r325) است — ترجمهٔ جمله («کاهش پیدا کرد») و کلیدِ (a) با decreased
// سازگارند (اراتای چاپ، مستند در printQuirks — کلید دست‌نخورده). گزینهٔ d ساقهٔ Q40 هم «observe» بدون d چاپ شده.
// زوم‌های ۲۲۰۰-۸۰۰۰dpi: خلبان گفته (Q3)، عمده‌ی (Q2)، نبستند (Q12)، قطرات (Q20)، می شود (Q21)،
// دسری/به طوربا دقت (Q27)، [آن] (Q29)، هوایی (Q35)، دانشگاهه (Q36)، معلمی (Q37)، هایگ/اجازه ی (Q38)، مضر (Q39)، رصد کردن (Q17).

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
    exam5?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; translations: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// کلیدِ حرفیِ چاپِ ص۲۶۱-۲۶۳ (۴۰ حرف، ۴ سطرِ ۱۰تایی)
const KEY_LETTERS =
  "bbbdacaacd" + "caadcbacad" + "cacbacdabd" + "dcabacadba";
// واژهٔ کلید هر آیتم (حرفِ چاپ → گزینه) — قفلِ دوم مستقل
const KEY_WORDS = [
  "carefully", "disease", "expect", "strange", "situation", "suitable", "based on", "useful", "powerful", "observing",
  "terrible", "stronger", "experience", "practice", "wonders", "donate", "defend", "detail", "clearing", "drops",
  "expression", "hints", "in terms of", "materials", "quality", "element", "actually", "appropriate", "stream", "brave",
  "deep", "create", "delicious", "difficult", "different", "choose", "experience", "dangerous", "protect", "decreased",
];

// ترجمه‌های چاپی — رونویسیِ رندر (۳۰۰dpi کامل + ۲۲۰۰-۸۰۰۰dpi جراحی)
const TRANSCRIPT: Record<number, string> = {
  1: "اگر به این موسیقی عالی با دقت گوش بدهید، می توانید صدای فلوت را در موسیقی زمینه بشنوید.",
  2: "کودکان در برابر بیماری‌های عمده‌ی دوران کودکی واکسینه شدند.",
  3: "خلبان گفته: کاپیتان شما صحبت می کند. ما انتظار داریم که در حدود یک ساعت آینده در فرودگاه لندن فرود بیاییم.",
  4: "عجیبه. مطمئن هستم که عینکم را در کیفم گذاشته‌ام، اما آنجا نیستند.",
  5: "موقعیت سختی است و نمی دانم برای این که مشکلم را حل بکنم، چیکار بکنم.",
  6: "دنبال یک هدیه روز تولد برای مادرم گشتم، اما چیز مناسبی پیدا نکردم.",
  7: "آخرین پروژه او فیلمی است که بر اساس زندگی یک ستارهٔ موسیقی قرن نوزدهم است.",
  8: "احتمالاً یک چاقوی خوب، یکی از پرکاربرد و مفیدترین چیزهایی است که میتوانید در آشپزخانه داشته باشید.",
  9: "کیفیت تصویر بد است زیرا سیگنال تلویزیون به اندازه کافی قوی نیست.",
  10: "پروژهٔ تحقیق در حال مشاهده (رصد) کردن تغییرات جمعیت محلی بوده است.",
  11: "یک سر درد بسیار بد داشتم، اما به کنسرت رفتم.",
  12: "اگر این ها کافی نبستند، من می توانم به تو مسکن های قوی تری بدهم.",
  13: "کار کردن در آن کارخانه، برای \"آن\" ماه ها سخت بود، اما تجربه خوبی براش بود.",
  14: "باید قبل از این که امتحان رانندگی ماشین را بدهید، یک بار بیشتر پارک کردن ماشین را تمرین کنید.",
  15: "با تمام شگفتی‌های تکنولوژی مدرن، چرا هیچکس ایده ای برای سفر در زمان نداشته است؟",
  16: "واتیکان قبول کرده است که ۸۰ هزار دلار برای کمک اضطراری به کشورهایی که درگیر جنگ شده‌اند، اهدا کند.",
  17: "از رئیس جمهور پرسیده شد که چطور توانست از سیاستی که موجب افزایش بیکاری شده، دفاع کند؟",
  18: "او تمام جزئیات آنچه را که آن ها با او در بیمارستان کرده‌ند، به من گفت.",
  19: "پائول به همسایهٔ سالخورده اش به وسیلهٔ تمیز کردن برف از حیاط خانه اش کمک کرد.",
  20: "قطرات کوچک رنگی در کف آشپزخانه بود و ما مجبور بودیم که پاکشان کنیم.",
  21: "آن یک عبارتی بود که قبلاً نشنیده بود و در شگفت بود که معنی آن چه می شود.",
  22: "او به طور غیر مستقیم بارها به رییس گفته است که اگر ترفیع درجه نگیرد، از کار انصراف میدهد.",
  23: "ما سعی میکنیم که آن چه را که بهترین است از لحاظ کیفیت محصولات مان، برای مشتری‌هایمان انجام بدهیم.",
  24: "قیمت‌های محصولات به وسیلهٔ قیمت مواد اولیه و همچنین هزینهٔ تولید کنترل می شود.",
  25: "الف: \"او به کیفیت علاقه مند نیست. تمام چیزی که او برایش مهم است، پول در آوردن است.\"",
  26: "داشتن یک درآمد دوم، یک عنصر مهم برای خریداران خانه است.",
  27: "من در واقع دیگه دسری نمی خواستم، اما جولیا مجبورم کرد.",
  28: "فکر می کردم که نظراتش خیلی مناسب آن زمان نبودند.",
  29: "اگر [آن] دارو مستقیماً به جریان خون تزریق شود، سریع تر عمل می کند.",
  30: "یک تصمیم شجاعانه بود که از کارش انصراف بدهد و کسب و کار خودش را راه بیندازد.",
  31: "او بعد از استفاده ی بیش از حد قرص های خواب آور، به یک کمای عمیق رفت.",
  32: "به عنوان والدین، ما باید تلاش کنیم تا یک محیط پایدار خانگی برای فرزندانمان بسازیم تا در آن رشد کنند.",
  33: "می توانم برای نهار شما، جوجه در سس مخصوص خودمان را پیشنهاد دهم. واقعاً خوشمزه است.",
  34: "خیلی چیزها برای خانم ها این را سخت می کند که به درجات بالا در تجارت در آمریکا برسند.",
  35: "کلمهٔ flight دو معنی متفاوت دارد: یک سفر هوایی، و عمل فرار کردن.",
  36: "زندگی انسان‌ها خیلی چیزهای مختلفی دارد برای انتخاب کردن؛ مانند شغل، رشتهٔ دانشگاهه، و ....",
  37: "ما به کسی نیاز داریم که در امر بازاریابی و معلمی تجربه دارد، و فکر کنم الکس تنها فرد برای این کار است.",
  38: "والدین او به او اجازه ی بازی کردن هایگ روی یخ را نخواهند داد چون فکر میکنند که خیلی خطرناک است.",
  39: "این مهم است که از پوستتان در برابر تاثیرات مضر خورشید محافظت کنید.",
  40: "در طول ۱۹۸۰، مقدار ازون در استراتوسفر بالای اروپا حدوداً ۸ درصد کاهش پیدا کرد.",
};

const L12 = bank.lessons.find((l) => l.lesson === 12)!;
const LET = "abcd";

describe("jozve tests-g10 exam5 (r328 استاندارد درس دوم — p89-90, key+translations pp261-263)", () => {
  it("exam5 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.exam5).toBeTruthy();
    const s = bank.source.exam5!;
    expect(s.exam).toContain("سطح استاندارد");
    expect(s.header).toContain("۲۶۱ تا ۲۶۳");
    expect(s.keyPages).toBe("261-263");
    expect(s.keyVerification).toContain("40/40");
    expect(s.extractedRound).toBe("r328");
    expect(s.pattern).toContain("r325");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(25);
    expect(s.printQuirks.some((q) => q.includes("خلبان گفته"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("هایگ"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("Q40") && q.includes("طول عمر"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("Drop a hint"))).toBe(true);
  });

  it("bank 12 shape: 40 MCQ, 4 unique options each, no typed fields", () => {
    expect(L12.count).toBe(40);
    expect(L12.questions).toHaveLength(40);
    L12.questions.forEach((q, i) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("40 answers locked letter-by-letter to the printed key grid pp261-263", () => {
    L12.questions.forEach((q, i) => {
      expect(LET[q.answer], `Q${q.n} letter`).toBe(KEY_LETTERS[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(KEY_WORDS[i]);
    });
  });

  it("40 printed translations locked verbatim to the render transcript", () => {
    L12.questions.forEach((q) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSCRIPT[q.n]);
    });
  });

  it("Persian purity: no Latin letters in translations except the printed «flight» gloss of Q35", () => {
    L12.questions.forEach((q) => {
      if (q.n === 35) {
        expect(q.translation, `Q${q.n}`).toContain("flight");
        return;
      }
      expect(/[A-Za-z]/.test(q.translation!), `Q${q.n}: ${q.translation}`).toBe(false);
    });
  });

  it("print quirks visible in data: Q40 d=observe, Q3 «the pilot said», Q19 «from yard», Q29 bracket, Q38 «هایگ», Q27 «دسری»", () => {
    const byN = (n: number) => L12.questions[n - 1];
    // Q40: گزینهٔ d چاپ «observe» بدون d — عین چاپ؛ کلید a = decreased و ترجمه «کاهش پیدا کرد»
    expect(byN(40).options).toEqual(["decreased", "attacked", "happened", "observe"]);
    expect(LET[byN(40).answer]).toBe("a");
    expect(byN(40).options[byN(40).answer]).toBe("decreased");
    expect(byN(40).translation).toContain("کاهش پیدا کرد");
    // ساقه‌های کوئیرک‌دارِ عین چاپ
    expect(byN(3).question).toContain('time”. the pilot said.');
    expect(byN(19).question).toContain("from yard of her house");
    // کوئیرک‌های ترجمهٔ عینِ چاپ
    expect(byN(2).translation).toContain("عمده‌ی");
    expect(byN(12).translation).toContain("نبستند");
    expect(byN(13).translation).toContain('"آن"');
    expect(byN(20).translation).toContain("قطرات");
    expect(byN(21).translation).toContain("می شود");
    expect(byN(27).translation).toContain("دسری");
    expect(byN(29).translation).toContain("[آن]");
    expect(byN(31).translation).toContain("استفاده ی");
    expect(byN(36).translation).toContain("دانشگاهه");
    expect(byN(37).translation).toContain("معلمی");
    expect(byN(38).translation).toContain("هایگ");
    expect(byN(38).translation).toContain("اجازه ی");
    expect(byN(39).translation).toContain("مضر");
    // الگوی می‌ها: چسبیده و جدای هر دو در داده
    expect(byN(23).translation).toContain("میکنیم");
    expect(byN(22).translation).toContain("میدهد");
    expect(byN(29).translation).toContain("می کند");
    expect(byN(28).translation).toContain("می کردم");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1586);
  });
});
