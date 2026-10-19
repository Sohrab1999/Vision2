// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r394 — برگهٔ شانزدهمِ نهایی‌ها: خرداد ۱۳۹۹ داوطلبانِ آزادِ خارجِ از کشور (ص۲۷۷-۲۸۲، کلیدِ ص۲۸۳-۲۸۴، ۱۳۹۹/۳/۳۱)
// همان «لایه‌خرابِ» paperMap — لایهٔ لاتینِ بدنه سالم بود و هویتِ برگه با خوانشِ دیداریِ رندر محقق شد.
// ۱۳ بانک/۵۴ آیتم (l129-l141) — دومین بانکِ نقش‌محورِ استخراج‌شده (l141) + سومین توالیِ ربطِ متمایز (l140) +
// هم‌خانوادگیِ gt-l138-l153 (r292 با عنوانِ نادرستِ «شهریور ۹۹»). با این راند بخشِ نهایی‌ها کامل شد: ۱۷ از ۱۷.
type TQuestion = {
  id: string;
  n: number;
  category: string;
  kind?: "mcq" | "typed";
  question: string;
  options: string[];
  answer: number;
  accepted?: string[];
  placeholder?: string;
  translation?: string;
};
type TLesson = { lesson: number; title: string; level: string; count: number; questions: TQuestion[] };
type TBank = { grade: number; source: Record<string, unknown>; lessons: TLesson[] };

const bank: TBank = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/tests-g12.json"), "utf8")
);
const gt: { lessons: TLesson[] } = JSON.parse(
  readFileSync(path.join(process.cwd(), "public/jozve/grammar-g12-topic.json"), "utf8")
);

const L = (n: number) => bank.lessons.find((l) => l.lesson === n)!;
const GT = (n: number) => gt.lessons.find((l) => l.lesson === n)!;
// دوقلوی gt آپاستروفِ خمیدهٔ لایه (U+2019) را نگه داشته و خانوادهٔ tests-g12 به راستِ ASCII نرمال می‌کند.
const A = (s: string) => s.replace(/\u2019/g, "'");
const src = bank.source as Record<string, Record<string, unknown>>;
const r16 = src.g12nahaie16 as Record<string, unknown>;

const DEF_B = [
  "To put things in a useful order",
  "To cry suddenly",
  "To take something in",
  "Many different types of things or people",
  "Birds of a feather flock together",
];
const ROLES = ["Topic sentence", "Supporting sentence", "Concluding sentence"];
const ENV_HEAD = "For many environmentalists, the world seems to be getting worse";
const BABY_HEAD = "Everyone knows that when a child is born, he cannot speak.";
const SUP_MID = "Have you ever wished to become a superhuman?";

describe("r394 — رسیدِ برگهٔ خرداد ۱۳۹۹ خارج از کشور (g12nahaie16)", () => {
  it("رسید: r394 / ۵۲ سؤالِ شماره‌دار / ۴۸ استخراج / ۴ مستثنی / ۱۳ بانک [4,4,4,4,3,3,4,4,2,6,6,4,6] / ۵۴ آیتم", () => {
    expect(r16.extractedRound).toBe("r394");
    expect(r16.sectionsTotal).toBe(52);
    expect(r16.sectionsExtracted).toBe(48);
    expect(r16.sectionsSkipped).toBe(4);
    expect(r16.items).toBe(54);
    expect(r16.bankCounts).toEqual([4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6]);
  });

  it("متاِمتحان: هویتِ کشف‌شده — خرداد ۱۳۹۹ خارج از کشور (۱۳۹۹/۳/۳۱) + سربرگِ mojibake + QRها", () => {
    const meta = String(r16.examMeta);
    expect(meta).toContain("خردادماه ۱۳۹۹");
    expect(meta).toContain("خارجِ از کشور");
    expect(meta).toContain("۱۳۹۹/۳/۳۱");
    expect(meta).toContain("mojibake");
    expect(meta).toContain("خوانشِ دیداری");
    expect(meta).toContain("Audio file (MP3)");
    expect(meta).toContain("کلیهٔ رشته‌های نظری");
    const pages = String(r16.examPages);
    expect(pages).toContain("pdf-p277-282");
    expect(pages).toContain("pdf-p283-284");
  });

  it("کلید: غلطِ املاییِ unseccessfully در خودِ کلید + جمله‌های ۳۵/۳۶ + جدولِ نقش‌ها + بدونِ کلیدِ بریده", () => {
    const kv = String(r16.keyVerification);
    expect(kv).toContain("28. unseccessfully");
    expect(kv).toContain("35. If my uncle passed his driving test, he could drive a car.");
    expect(kv).toContain("36. My mother wants to buy this, which is the golden watch.");
    expect(kv).toContain("c: Topic sentence");
    expect(kv).toContain("a: concluding");
    expect(kv).toContain("49. and 50. so 51. or");
    expect(kv).toContain("52. but");
    // r394-fix: ادعای «سومین برگهٔ پیاپیِ بدونِ کلیدِ بریده» در keyPolicy ساکن است (نه keyVerification)
    expect(String(r16.keyPolicy)).toContain("سومین برگهٔ پیاپی");
  });

  it("paperMap: ۱۷ برگه استخراج شد، ۰ برگه باقی است — بخشِ نهایی‌ها کامل شد", () => {
    const pm = String(r16.paperMap);
    expect(pm).toContain("۱۷ برگه استخراج شد، ۰ برگه باقی است");
    expect(pm).toContain("بخشِ نهایی‌های دارایِ لایه کامل شد");
    expect(pm).toContain("خرداد ۱۳۹۹ خارج از کشور ص۲۷۷-۲۸۲ + کلید ص۲۸۳-۲۸۴ ← این راند");
    expect(pm).toContain("لایه‌خرابِ");
  });

  it("کوئیرک‌های چاپ: mojibake/unseccessfully/environmental population/a dِ جدا/…", () => {
    const pq = r16.printQuirks as string[];
    expect(pq.length).toBeGreaterThanOrEqual(16);
    const joined = pq.join(" | ");
    expect(joined).toContain("mojibake");
    expect(joined).toContain("unseccessfully");
    expect(joined).toContain("environmental population");
    expect(joined).toContain("«a d-------»");
    // r394-fix: «spared no pains» یادداشتِ هم‌خانوادگیِ twinCensus است (پنجمین تکرار) — نه کوئیرکِ چاپ
    expect(String(r16.twinCensus)).toContain("spared no pains");
  });

  it("سرشماریِ دوقلو (gt-l138-l153 با عنوانِ نادرستِ شهریور ۹۹) + مخزنِ ۸۹ ردیفی", () => {
    const tc = String(r16.twinCensus);
    expect(tc).toContain("gt-l138-l153");
    expect(tc).toContain("عنوانِ نادرستِ");
    expect(tc).toContain("پنجمین تکرار");
    const fn = String(r16.futureNote);
    expect(fn).toContain("۸۹ ردیف");
    expect(fn).toContain("۱۷ از ۱۷");
  });
});

describe("r394 — بانک‌های l129-l134 (شنیداری‌ها + واژگان)", () => {
  it("l129: شنیداریِ بخشِ الف — چاپِ چهارگزینه‌ایِ کاملِ ق۲/۳ (دوقلو سه‌گزینه‌ای رندر کرده بود)", () => {
    const b = L(129);
    expect(b.count).toBe(4);
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions.map((it) => it.answer)).toEqual([3, 2, 0, 2]);
    expect(b.questions[0].options).toEqual(["pencils", "dictionaries", "notebooks", "pens"]);
    expect(b.questions[1].options).toEqual(["pen", "pencil", "dictionary", "notebook"]);
    expect(b.questions[2].options).toEqual(["score", "dictionary", "scarf", "notebook"]);
    expect(b.questions[3].options).toEqual(["lazy", "busy", "clever", "funny"]);
    // گزینهٔ چهارمِ چاپیِ بازگردانده — دوقلو نداشت
    expect(GT(138).questions[1].options).toHaveLength(3);
    expect(b.questions[1].options).toHaveLength(4);
  });

  it("l130: کلوژِ سوپرهیومن — متنِ کامل در ساقه با جای خالیِ نشانه‌گذاری‌شده", () => {
    const b = L(130);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["wonderful"], ["minds"], ["invisible"], ["visit"],
    ]);
    expect(b.questions[0].question).toBe(SUP_MID + " It is said that superhuman has --------------- abilities, for example He can fly or read people's (6) .............. He may become (7) ............. or sometimes very strong to help others. Do you like to (8) ............. a superhuman?");
    expect(b.questions[1].question).toContain("read people's --------------- He may become (7)");
    expect(b.questions[3].question).toContain("Do you like to --------------- a superhuman?");
  });

  it("l131: کلوژِ خودروهای برقی — developed/batteries/benefit/goals با چسبیدگیِ چاپِ q10", () => {
    const b = L(131);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["developed"], ["batteries"], ["benefit"], ["goals"],
    ]);
    expect(b.questions[1].question).toBe("Electricity is stored in ---------------on the electric cars.");
    expect(b.questions[3].question).toBe(
      "Hybrid cars are designed to meet different --------------- , such as better fuel economy or more power."
    );
  });

  it("l132: تعریف‌یابیِ پنج‌گزینه‌ای — ستونِ B چاپیِ a-e، کلیدهای d/e/a/b، اضافیِ هرگز-کلیدِ c", () => {
    const b = L(132);
    expect(b.count).toBe(4);
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(DEF_B);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 4, 0, 1]);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "Many different types of things or people",
      "Birds of a feather flock together",
      "To put things in a useful order",
      "To cry suddenly",
    ]);
    // c اضافیِ چاپ هرگز کلید نشده
    for (const it of b.questions) expect(it.answer).not.toBe(2);
    expect(b.questions[3].question).toBe(
      "The children burst into tears on hearing of the death of their grandfather."
    );
  });

  it("l133: بانکِ چهارواژه‌ایِ تایپی — cooling/dedicated/combination + forgiveِ اضافی؛ پنجمین spared-no-pains", () => {
    const b = L(133);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["cooling"], ["dedicated"], ["combination"]]);
    expect(b.questions[0].question).toBe(
      "Wind towers are natural air --------------- systems and can be used instead of electrical air conditioners."
    );
    expect(b.questions[1].question).toContain("he spared no pains to help people");
    expect(b.questions[2].question).toBe(
      ".As a great artist, he has used a --------------- of paints in his works."
    );
    // فاصله‌دار در برابرِ چسبیدهٔ دی ۹۸ (l120-4)
    expect(L(120).questions[3].question).toContain("---------------systems");
    expect(b.questions[0].question).toContain("--------------- systems");
  });

  it("l134: دانشِ خودِ حرف‌اول — a d-------ِ دیداری + diary/demand/absorb", () => {
    const b = L(134);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["diary"], ["demand"], ["absorb"]]);
    expect(b.questions[0].question).toBe(
      "A book which you record your thoughts or feelings or what has happened every day is called a d-------."
    );
    expect(b.questions[1].question).toBe("Nowadays d------- for organic food is increasing");
    expect(b.questions[2].question).toBe("Plants a------- carbon dioxide from the air.");
  });
});

describe("r394 — بانک‌های l135-l141 (گرامر + مکالمه + خوانداری‌ها + ربط + نقش‌ها)", () => {
  it("l135: گرامر با چینشِ دیداریِ a-d — کلیدهای who/unsuccessfully/was discovered/had lost", () => {
    const b = L(135);
    expect(b.count).toBe(4);
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 1, 1]);
    expect(b.questions[0].options).toEqual(["which", "when", "who", "whose"]);
    expect(b.questions[1].options).toEqual(["success", "unsuccessfully", "succeed", "unsuccessful"]);
    expect(b.questions[2].question).toBe(
      "Alcohol --------------- by an Iranian scientist called Razi many years ago."
    );
    expect(b.questions[3].options).toEqual(["to lose", "had lost", "was lost", "would lose"]);
  });

  it("l136: مکالمهٔ Jack/Kevin با پیشوندِ گوینده — seems/had decided/would go/is served", () => {
    const b = L(136);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["seems"], ["had decided"], ["would go"], ["is served"],
    ]);
    expect(b.questions[0].question).toBe("Jack: It --------------- rather cold today, doesn't it? (to seem)");
    expect(b.questions[1].question).toBe(
      "Kevin: Yes, I --------------- to go swimming before I left home. (to decide)"
    );
    expect(b.questions[2].question).toBe(
      "Jack: It's a pity! If it were fine, we --------------- swimming today. (to go)"
    );
    expect(b.questions[3].question).toBe(
      "Jack: I know a restaurant in which special seafood --------------- (to serve)"
    );
  });

  it("l137: مرتب‌کردنِ تایپی — خامِ چاپِ وفادار با مدل‌های کلید", () => {
    const b = L(137);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions[0].question).toBe("if/ could / he / a car/ my uncle /his driving test / passed/ drive.");
    expect(b.questions[0].accepted).toEqual(["If my uncle passed his driving test, he could drive a car."]);
    expect(b.questions[1].question).toBe("my mother/ this / the golden watch / is / which/ to buy/ wants/.");
    expect(b.questions[1].accepted).toEqual(["My mother wants to buy this, which is the golden watch."]);
  });

  it("l138: خوانداریِ محیط‌زیستِ ترکیبی — ۲ mcq + ۲ T/F + ۲ تایپی؛ متنِ کامل در ساقه (با environmental populationِ چاپی)", () => {
    const b = L(138);
    expect(b.count).toBe(6);
    expect(b.level).toBe("ترکیبی");
    for (const it of b.questions) expect(it.question.startsWith(ENV_HEAD)).toBe(true);
    expect(b.questions.map((it) => it.kind)).toEqual([
      undefined, undefined, undefined, undefined, "typed", "typed",
    ]);
    expect(b.questions[0].answer).toBe(2);
    expect(b.questions[1].answer).toBe(2);
    expect(b.questions[2].options).toEqual(["True", "False"]);
    expect(b.questions[2].answer).toBe(1);
    expect(b.questions[3].answer).toBe(0);
    expect(b.questions[4].accepted).toEqual(["They think that the world seems to be getting worse."]);
    expect(b.questions[5].accepted).toEqual([
      "They believe that energy and natural resources have become more than they were in the past.",
    ]);
  });

  it("l139: خوانداریِ نوزادِ ترکیبی — ۲ mcq + ۲ T/F + ۲ تایپی؛ متنِ کامل در ساقه", () => {
    const b = L(139);
    expect(b.count).toBe(6);
    expect(b.level).toBe("ترکیبی");
    for (const it of b.questions) expect(it.question.startsWith(BABY_HEAD)).toBe(true);
    expect(b.questions[0].options).toEqual(["his facial expressions", "crying", "saying difficult words", "gestures"]);
    expect(b.questions[1].options).toEqual(["remind", "copy", "change", "respect"]);
    expect(b.questions.map((it) => it.answer)).toEqual([1, 1, 0, 1, 0, 0]);
    expect(b.questions[4].accepted).toEqual(["A baby can show his feeling by crying."]);
    expect(b.questions[5].accepted).toEqual([
      "When he gets older he can choose proper words and expressions to say what he wants.",
    ]);
  });

  it("l140: ربطِ تایپی — کلیدهای چاپیِ and/so/or/but (سومین توالیِ متمایزِ نهایی‌ها)", () => {
    const b = L(140);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["and"], ["so"], ["or"], ["but"]]);
    expect(b.questions[0].question).toBe("They went to the park yesterday, --------------- they had a wonderful time.");
    expect(b.questions[2].question).toBe("You can buy a car, --------------- you can save your money.");
    // ساقهٔ نزدیکِ l125-3ِ دی ۹۸ (مبنای یک → questions[2]) با کلیدِ یکسانِ but
    expect(L(125).questions[2].accepted![0]).toBe("but");
    expect(b.questions[3].accepted![0]).toBe("but");
    // سه توالیِ متمایز
    expect(L(100).questions.map((it) => it.options[it.answer])).toEqual(["so", "and", "but", "or"]);
    expect(L(111).questions.map((it) => it.accepted![0])).toEqual(["or", "so", "but", "and"]);
  });

  it("l141: دومین بانکِ نقش‌محورِ استخراج‌شده — آب با کلیدِ جدولیِ چاپ [2,1,0,1,1,1]", () => {
    const b = L(141);
    expect(b.count).toBe(6);
    expect(b.level).toBe("سه‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(ROLES);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 1, 0, 1, 1, 1]);
    expect(b.questions[0].question).toBe("Thus, water is very important to our life and our planet.");
    expect(b.questions[2].question).toBe("Water is the most essential element in our life.");
    expect(b.questions[5].question).toBe("Water is also essential for animals, birds, insects, etc");
    // نخستین بانکِ نقش‌محور (فوتبال l112) همچنان سر جایش
    expect(L(112).count).toBe(6);
  });
});

describe("r394 — ترازیابیِ کلیدِ رسمیِ بین‌خانواده‌ای (tests-g12 ↔ grammar-topic r292)", () => {
  it("l129/l132/l135 ↔ gt-l138/l142/l145: کلیدهای mcq همسان (با نرمال‌سازِ آپاستروف)", () => {
    expect(L(129).questions.map((it) => A(it.options[it.answer]))).toEqual(
      GT(138).questions.map((it) => A(it.options[it.answer]))
    );
    expect(L(132).questions.map((it) => it.options[it.answer])).toEqual(
      GT(142).questions.map((it) => it.options[it.answer])
    );
    expect(L(135).questions.map((it) => it.options[it.answer])).toEqual(
      GT(145).questions.map((it) => it.options[it.answer])
    );
  });

  it("l130/l131/l133/l134/l136/l137/l140 ↔ gt-l139/l140/l143/l144/l146/l147/l152: acceptedها ردیف‌به‌ردیف", () => {
    expect(L(130).questions.map((it) => it.accepted)).toEqual(
      GT(139).questions.map((it) => it.accepted)
    );
    expect(L(131).questions.map((it) => it.accepted)).toEqual(
      GT(140).questions.map((it) => it.accepted)
    );
    expect(L(133).questions.map((it) => it.accepted)).toEqual(
      GT(143).questions.map((it) => it.accepted)
    );
    expect(L(134).questions.map((it) => it.accepted)).toEqual(
      GT(144).questions.map((it) => it.accepted)
    );
    expect(L(136).questions.map((it) => it.accepted)).toEqual(
      GT(146).questions.map((it) => it.accepted)
    );
    expect(L(137).questions.map((it) => it.accepted)).toEqual(
      GT(147).questions.map((it) => it.accepted)
    );
    expect(L(140).questions.map((it) => it.accepted)).toEqual(
      GT(152).questions.map((it) => it.accepted)
    );
  });

  it("l138/l139 ↔ gt-l148+gt-l149/gt-l150+gt-l151: کلیدهای mcq و acceptedهای تایپی همسان", () => {
    expect(L(138).questions.slice(0, 4).map((it) => it.options[it.answer])).toEqual(
      GT(148).questions.map((it) => it.options[it.answer])
    );
    expect(L(138).questions.slice(4).map((it) => it.accepted)).toEqual(
      GT(149).questions.map((it) => it.accepted)
    );
    expect(L(139).questions.slice(0, 4).map((it) => it.options[it.answer])).toEqual(
      GT(150).questions.map((it) => it.options[it.answer])
    );
    expect(L(139).questions.slice(4).map((it) => it.accepted)).toEqual(
      GT(151).questions.map((it) => it.accepted)
    );
  });

  it("l141 ↔ gt-l153: نقش‌های آب — هر شش کلید همسان", () => {
    expect(L(141).questions.map((it) => it.answer)).toEqual(
      GT(153).questions.map((it) => it.answer)
    );
    expect(L(141).questions.map((it) => it.question)).toEqual(
      GT(153).questions.map((it) => A(it.question))
    );
  });

  it("واگراییِ مستند: ق۱۳-۱۶ تصویری در فایلِ ما نیست (ساقهٔ فارسیِ دوقلو دنبال نشد) ولی در gt هست", () => {
    const ourAll = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question)
      .join(" \n ");
    expect(ourAll).not.toContain("با توجه به تصاویر");
    expect(ourAll).not.toContain("I always use monolingual");
    const gtPics = gt.lessons.find((l) => l.lesson === 141)!;
    expect(gtPics.questions[0].question).toContain("با توجه به تصاویر");
  });
});

describe("r394 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۱۴۱ بانک/[…,4,6,4,4,3,2,3,2,4,4,4,4,4,2,4,1,5,4,4,4,4,4,3,3,4,4,2,6,6,4,6]/۸۵۱ id یکتا", () => {
    expect(bank.lessons)./* R395-WIDENED */ toHaveLength(142);
    expect(bank.lessons.map((l) => l.count)).toEqual([
      100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7,
      4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1,
      2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2,
      4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4,
      3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4,
      4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6,
      22,
    ]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(873);
    expect(new Set(ids).size).toBe(873);
    expect(ids[797]).toBe("g12-l129-1");
    expect(ids[801]).toBe("g12-l130-1");
    expect(ids[805]).toBe("g12-l131-1");
    expect(ids[809]).toBe("g12-l132-1");
    expect(ids[813]).toBe("g12-l133-1");
    expect(ids[816]).toBe("g12-l134-1");
    expect(ids[819]).toBe("g12-l135-1");
    expect(ids[823]).toBe("g12-l136-1");
    expect(ids[827]).toBe("g12-l137-1");
    expect(ids[829]).toBe("g12-l138-1");
    expect(ids[835]).toBe("g12-l139-1");
    expect(ids[841]).toBe("g12-l140-1");
    expect(ids[845]).toBe("g12-l141-1");
    expect(ids[850]).toBe("g12-l141-6");
    expect(ids[851]).toBe("g12-l142-1");
    expect(ids[872]).toBe("g12-l142-22");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("MCQ-خالصِ l129/l132/l135/l141 و تایپیِ خالصِ l130/l131/l133/l134/l136/l137/l140", () => {
    for (const bn of [129, 132, 135, 141])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    for (const bn of [130, 131, 133, 134, 136, 137, 140])
      for (const it of L(bn).questions) expect(it.kind).toBe("typed");
    // بانک‌های ترکیبیِ l138/l139: هر آیتم یا mcqِ خالص یا تایپیِ با accepted
    for (const bn of [138, 139])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        if (it.kind === "typed") {
          expect(it.accepted!.length, it.id).toBeGreaterThanOrEqual(1);
        } else {
          expect(it.kind, `${it.id} must be mcq or typed`).toBeUndefined();
          expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        }
      }
  });

  it("نشت‌سنجِ ردیف‌های مستثنیِ راند: ساقه‌های تصویریِ ق۱۳-۱۶ و داده‌های دکتر غریب غایب‌اند", () => {
    const forbidden = [
      // r394-fix: «shiny panels» حذف شد — متنِ خورشیدیِ مشروعِ راندهای قبل (سنتِ Solar power)
      // r394-fix: «use wind to generate electricity» حذف شد — l94-2 (دی ۱۴۰۱) همین عبارت را مشروع رندر کرده
      "feeds the pigeons", // stemِ چاپِ ق۱۴
      "University of Paris", // دادهٔ چاپِ س۱۵ (دکتر غریب)
      "July 5, 1909", // دادهٔ چاپِ س۱۵
      "January 20, 1975", // دادهٔ چاپِ س۱۵
      "با توجه به تصاویر", // ساقهٔ فارسیِ رندرِ دوقلو — در خانوادهٔ ما ممنوع
    ];
    const all = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question + " " + q.options.join(" ") + " " + (q.accepted ?? []).join(" "))
      .join(" \n ")
      .toLowerCase();
    for (const s of forbidden) expect(all).not.toContain(s.toLowerCase());
  });

  it("خلوصِ لاتین: بدونِ حروفِ presentation-form و کنترلِ نامرئی در l129-l141", () => {
    for (const bn of [129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141])
      for (const it of L(bn).questions) {
        const txt = it.question + it.options.join("");
        for (const ch of txt) {
          const code = ch.codePointAt(0)!;
          const bad =
            (code >= 0xfb50 && code <= 0xfdff) ||
            (code >= 0xfe70 && code <= 0xfeff) ||
            (code < 0x20 && code !== 0x0a);
          expect(bad, `${it.id} char U+${code.toString(16)}`).toBe(false);
        }
      }
  });
});
