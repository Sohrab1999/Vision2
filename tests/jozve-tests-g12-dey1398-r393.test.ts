// R396-WIDENED — l143 (۱۸ آیتمِ جمله‌سازیِ مخزن): 142→143 بانک / 873→891 id / دمِ counts +18
// R395-WIDENED — l142 (۲۲ آیتمِ تایپیِ مخزنِ افعال): 141→142 بانک / 851→873 id / دمِ counts +22
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r393 — برگهٔ پانزدهمِ نهایی‌ها: دی ۱۳۹۸ (ص۲۵۱-۲۵۶، کلیدِ ص۲۵۷-۲۵۸، ۲۲/۱۰/۹۸)
// ۱۴ بانک/۴۶ آیتم (l115-l128) — هفت بانکِ تایپی/ترکیبیِ تازه (مجموعِ تایپی‌های نهایی‌ها = ۱۸) +
// دو نخستِ tests-g12: نخستین بانکِ ناهماهنگِ یگانه (l121) و نخستین بانکِ ترتیبِ حروفِ پاراگراف (l126) +
// هم‌خانوادگیِ gt-l93-l104 (r292) با افزودهٔ ق۱۰-۱۴ که دوقلو ندارد.
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
// دوقلوی gt آپاستروفِ خمیدهٔ لایه (U+2019) را نگه داشته و خانوادهٔ tests-g12 به راستِ ASCII نرمال می‌کند —
// ترازیابی‌ها روی شکلِ نرمال‌شده سنجیده می‌شوند (الگویِ printQuirkِ آپاستروفِ r392).
const A = (s: string) => s.replace(/\u2019/g, "'");
const src = bank.source as Record<string, Record<string, unknown>>;
const r15 = src.g12nahaie15 as Record<string, unknown>;

const DEF_B = [
  "a book in which you record",
  "help somebody remember something",
  "in a quiet way",
  "the rise and fall of the sea",
  "to find a solution or arrive at an answer to",
];
const WORD_BANK = ["shared", "cooling", "radiation", "effectively", "replaced"];
const TREE_ORDER = [
  "c / e / f / a / b / d",
  "c / f / e / a / b / d",
  "c / e / f / a / d / b",
  "e / c / f / a / b / d",
];
const EC_HEAD = "Many countries now think that cars that burn fossil fuels";
const EARS_HEAD = "The size and shape of your ears show your character";

describe("r393 — رسیدِ برگهٔ دی ۱۳۹۸ (g12nahaie15)", () => {
  it("رسید: r393 / ۵۶ ردیف / ۴۶ استخراج / ۱۰ مستثنی / ۱۴ بانک [3,2,3,2,4,4,4,4,4,2,4,1,5,4]", () => {
    expect(r15.extractedRound).toBe("r393");
    expect(r15.sectionsTotal).toBe(56);
    expect(r15.sectionsExtracted).toBe(46);
    expect(r15.sectionsSkipped).toBe(10);
    expect(r15.items).toBe(46);
    expect(r15.bankCounts).toEqual([3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4]);
  });

  it("متاِمتحان: ۲۲/۱۰/۹۸ + presentation-forms + QRهای گوشهٔ بالا + بزرگ‌ترین برگه (۶ صفحه)", () => {
    const meta = String(r15.examMeta);
    expect(meta).toContain("۲۲/۱۰/۹۸");
    expect(meta).toContain("presentation-forms");
    expect(meta).toContain("aee.medu.ir");
    expect(meta).toContain("Audio file (MP3)");
    expect(meta).toContain("دیماه ۱۳۹۸");
    const pages = String(r15.examPages);
    expect(pages).toContain("pdf-p251-256");
    expect(pages).toContain("pdf-p257-258");
    expect(pages).toContain("بزرگ‌ترین برگهٔ استخراج‌شده");
  });

  it("کلید: دوبخشی‌های چاپی + قالبِ مختلطِ پرانتزی/مورب + بدونِ کلیدِ بریده", () => {
    const kv = String(r15.keyVerification);
    expect(kv).toContain("11. They are interested in soccer.");
    expect(kv).toContain("31. had learned /learnt");
    expect(kv).toContain("38.  She/ Her father is watching the DVD");
    expect(kv).toContain("17. ( c )");
    expect(kv).toContain("25. c/ coal");
    expect(kv).toContain("28. a / generate");
    expect(kv).toContain("43.  ( c / e  / f / a  / b / d )");
    expect(kv).toContain("51. False 52. False");
    expect(kv).toContain("56. (a )");
    // «بدونِ کلیدِ بریده/استنتاجی» در keyPages زندگی می‌کند
    expect(String(r15.keyPages)).toContain("بدونِ کلیدِ بریده/استنتاجی");
  });

  it("paperMap: ۱۶ برگه استخراج شد، ۱ برگه باقی است", () => {
    const pm = String(r15.paperMap);
    expect(pm).toContain("۱۶ برگه استخراج شد، ۱ برگه باقی است");
    expect(pm).toContain("دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸) ← این راند");
    expect(pm).toContain("لایه‌خراب ص۲۷۷-۲۸۴");
  });

  it("کوئیرک‌های چاپ: Zoheh/have meet/RTL/نرمه گوش/اسلشِ چسبیده/…", () => {
    const pq = r15.printQuirks as string[];
    expect(pq.length).toBeGreaterThanOrEqual(17);
    const joined = pq.join(" | ");
    expect(joined).toContain("Zoheh's mother");
    expect(joined).toContain("have meet");
    expect(joined).toContain("آرتیفکتِ RTL");
    expect(joined).toContain("نرمه گوش");
    expect(joined).toContain("had learned /learnt");
    expect(joined).toContain("خلوصِ لاتین");
  });

  it("سرشماریِ دوقلو (gt-l93-l104) + افزودهٔ ق۱۰-۱۴ + مخزنِ ۸۹ ردیفی", () => {
    const tc = String(r15.twinCensus);
    expect(tc).toContain("grammar-g12-topic.json (l93-l104، ۴۱ آیتم)");
    expect(tc).toContain("ق۱۰-۱۴");
    expect(tc).toContain("Sara/Andy");
    expect(tc).toContain("ناهماهنگِ یگانهٔ tests-g12");
    const fn = String(r15.futureNote);
    expect(fn).toContain("۸۹ ردیف");
    expect(fn).toContain("لایه‌خرابِ ص۲۷۷-۲۸۴");
  });
});

describe("r393 — بانک‌های l115-l118 (شنیداری‌ها + تصویری)", () => {
  it("l115: ۳ ردیفِ ترکیبی — دو mcqِ سه‌گزینه‌ایِ چاپی (با Zohehِ وفادار) + تایپیِ q9", () => {
    const b = L(115);
    expect(b.count).toBe(3);
    expect(b.level).toBe("ترکیبی");
    expect(b.questions.map((it) => it.kind)).toEqual([undefined, undefined, "typed"]);
    expect(b.questions[0].options).toEqual(["Mina's mother", "her close friend", "Maryam's sister"]);
    expect(b.questions[0].answer).toBe(1);
    expect(b.questions[1].options).toEqual(["Mina's mother", "Zoheh's mother", "Maryam's sister"]);
    expect(b.questions[1].answer).toBe(2); // کلیدِ چاپیِ c — با غلطِ چاپیِ Zoheh
    expect(b.questions[2].accepted).toEqual(["She lives in another neighborhood."]);
  });

  it("l116: شنیداریِ بازِ ساقه‌دار — دوبخشیِ چاپیِ q11 (interested in / crazy about)", () => {
    const b = L(116);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions[0].question).toBe("Where did Michelle's father study?");
    expect(b.questions[0].accepted).toEqual(["He studied in Canada."]);
    expect(b.questions[1].question).toBe("What are Michelle's brothers interested in?");
    expect(b.questions[1].accepted).toEqual([
      "They are interested in soccer.",
      "They are crazy about soccer.",
    ]);
  });

  it("l117: کلوژِ Sara/Andy — special/vacation/hope با دیالوگِ کانادا و جودو", () => {
    const b = L(117);
    expect(b.count).toBe(3);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["special"], ["vacation"], ["hope"]]);
    expect(b.questions[0].question).toBe("Andy: Did you do anything ------- this year?");
    expect(b.questions[1].question).toBe("Andy: I went to Canada for a ------- It was terrific.");
    expect(b.questions[2].question).toBe("Sara: That's great. And I ------- next year is even better.");
    // کلوژِ متفاوتِ Sara از شهریور (l103 Sara/Nurse) — بدونِ تداخل
    expect(L(103).questions[5].question).toContain("Sara: I guess I have only seen his name");
  });

  it("l118: تصویریِ خودبسنده — balcony/monolingual با حرفِ توپرِ چسبیده (الگویِ l104)", () => {
    const b = L(118);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["balcony"], ["monolingual"]]);
    expect(b.questions[0].question).toBe("He is sitting in the b------- and drinking tea.");
    expect(b.questions[1].question).toBe("My brother always uses a m------- dictionary.");
  });
});

describe("r393 — بانک‌های l119-l121 (تعریف + بانک + ناهماهنگِ یگانه)", () => {
  it("l119: تعریف‌یابیِ پنج‌گزینه‌ای — ستونِ B چاپیِ a-e، کلیدهای c/d/e/b، اضافیِ هرگز-کلیدِ a", () => {
    const b = L(119);
    expect(b.count).toBe(4);
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(DEF_B);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 3, 4, 1]);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "in a quiet way",
      "the rise and fall of the sea",
      "to find a solution or arrive at an answer to",
      "help somebody remember something",
    ]);
    expect(b.questions.map((it) => it.question)).toEqual(["calmly", "tide", "figure out", "remind"]);
    // a اضافیِ چاپ هرگز کلید نشده
    for (const it of b.questions) expect(it.answer).not.toBe(0);
  });

  it("l120: بانکِ پنج‌واژه‌ای به ترتیبِ چاپ — effectively/shared/replaced/cooling + radiationِ اضافی", () => {
    const b = L(120);
    expect(b.count).toBe(4);
    expect(b.level).toBe("پنج‌گزینه‌ای");
    for (const it of b.questions) expect(it.options).toEqual(WORD_BANK);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 0, 4, 1]);
    expect(b.questions.map((it) => it.options[it.answer])).toEqual([
      "effectively",
      "shared",
      "replaced",
      "cooling",
    ]);
    expect(b.questions[3].question).toBe(
      "Wind towers are natural air ---------------systems and can be used instead of electrical air conditioners."
    );
    // radiation اضافیِ چاپ هرگز کلید نشده
    for (const it of b.questions) expect(it.answer).not.toBe(2);
  });

  it("l121: نخستین بانکِ ناهماهنگِ یگانهٔ tests-g12 — کلیدهای coal/resource/confusing/generate", () => {
    const b = L(121);
    expect(b.count).toBe(4);
    expect(b.level).toBe("چهارگزینه‌ای");
    for (const it of b.questions)
      expect(it.question).toBe("Find the word which does not go with the other three.");
    expect(b.questions[0].options).toEqual(["water", "tree", "coal", "sun"]);
    expect(b.questions[1].options).toEqual(["pollution", "waste", "garbage", "resource"]);
    expect(b.questions[2].options).toEqual(["effective", "useful", "confusing", "helpful"]);
    expect(b.questions[3].options).toEqual(["generate", "use up", "absorb", "digest"]);
    expect(b.questions.map((it) => it.answer)).toEqual([2, 3, 2, 0]);
  });
});

describe("r393 — بانک‌های l122-l125 (فعل + گرامر + مرتب‌کردن + ربط)", () => {
  it("l122: فعلِ تایپی با دوبخشیِ چاپیِ learned/learnt", () => {
    const b = L(122);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([
      ["has bought"],
      ["were killed"],
      ["had learned", "had learnt"],
      ["be sent"],
    ]);
    expect(b.questions[0].question).toBe(
      "I think Mina --------------- a new mobile phone, hasn't she? (to buy)"
    );
    expect(b.questions[3].question).toBe(
      "The letter must --------------- to the company immediately. (to send)"
    );
  });

  it("l123: گرامر با چینشِ دیداریِ a-d — کلیدهای had met/would/which/is collected (با have meetِ چاپی)", () => {
    const b = L(123);
    expect(b.count).toBe(4);
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions.map((it) => it.answer)).toEqual([2, 0, 2, 3]);
    expect(b.questions[0].options).toEqual(["meet", "have meet", "had met", "would meet"]);
    expect(b.questions[1].options).toEqual(["would", "will", "may", "had"]);
    expect(b.questions[2].options).toEqual(["whose", "who", "which", "whom"]);
    expect(b.questions[3].options).toEqual(["should collect", "collect", "collected", "is collected"]);
    expect(b.questions[3].question).toBe(
      "A: When do they collect the waste every night? B: The waste --------------- about at 9."
    );
  });

  it("l124: مرتب‌کردنِ تایپی — خامِ چاپِ وفادار + دوبخشیِ ضمیریِ q38", () => {
    const b = L(124);
    expect(b.count).toBe(2);
    expect(b.level).toBe("تایپی");
    expect(b.questions[0].question).toBe("went/ my brother/ to the library/ at all/ he/ didn't/ but/ study.");
    expect(b.questions[0].accepted).toEqual(["My brother went to the library, but he didn't study at all."]);
    expect(b.questions[1].question).toBe("watching/ bought/ her father/ is/ the DVD/ has/ she/ that/.");
    expect(b.questions[1].accepted).toEqual([
      "She is watching the DVD that her father has bought.",
      "Her father is watching the DVD that she has bought.",
    ]);
  });

  it("l125: ربطِ تایپی — کلیدهای چاپیِ or/so/but/and (همان توالیِ l111ِ شهریور، ساقه‌های متفاوت)", () => {
    const b = L(125);
    expect(b.count).toBe(4);
    expect(b.level).toBe("تایپی");
    expect(b.questions.map((it) => it.accepted)).toEqual([["or"], ["so"], ["but"], ["and"]]);
    expect(b.questions[0].question).toBe("He can buy the dictionary, --------------- he can borrow it from the library.");
    expect(b.questions[3].question).toBe("Ali bought a new coat, --------------- he wore it for two years .");
    // تضادِ سالم: همین توالی در l111 با ساقه‌های متفاوت
    expect(L(111).questions[0].question).toBe("You can buy a shirt ------- you can save your money.");
  });
});

describe("r393 — بانک‌های l126-l128 (درخت‌ها + دو خوانداری)", () => {
  it("l126: نخستین بانکِ ترتیبِ حروفِ پاراگراف — گزینهٔ ۱ = کلیدِ چاپِ c/e/f/a/b/d", () => {
    const b = L(126);
    expect(b.count).toBe(1);
    expect(b.level).toBe("چهارگزینه‌ای");
    expect(b.questions[0].options).toEqual(TREE_ORDER);
    expect(b.questions[0].answer).toBe(0);
    expect(b.questions[0].question).toBe(
      "Order the six mixed-up sentences into a meaningful paragraph and write the correct letter order."
    );
  });

  it("l127: خوانداریِ خودروی الکتریکیِ ترکیبی — ۳ تایپیِ مدل‌دار + دو False؛ متنِ کامل در ساقه", () => {
    const b = L(127);
    expect(b.count).toBe(5);
    expect(b.level).toBe("ترکیبی");
    for (const it of b.questions) expect(it.question.startsWith(EC_HEAD)).toBe(true);
    expect(b.questions[0].kind).toBe("typed");
    expect(b.questions[0].accepted).toEqual([
      "They don't make the air dirty and unclean because they don't burn gasoline in the engine.",
    ]);
    expect(b.questions[1].accepted).toEqual(["The electric car is usually plugged in at night."]);
    expect(b.questions[2].accepted).toEqual([
      "People use hybrid cars because hybrid cars combine the benefits of gasoline engines and electric motors.",
    ]);
    expect(b.questions[3].options).toEqual(["True", "False"]);
    expect(b.questions[3].answer).toBe(1);
    expect(b.questions[4].options).toEqual(["True", "False"]);
    expect(b.questions[4].answer).toBe(1);
  });

  it("l128: خوانداریِ گوش‌ها — کلیدهای d/c/b/a با نقطه‌گذاریِ وفادارِ گزینه‌ها؛ متنِ کامل در ساقه", () => {
    const b = L(128);
    expect(b.count).toBe(4);
    for (const it of b.questions) expect(it.question.startsWith(EARS_HEAD)).toBe(true);
    expect(b.questions[0].options).toEqual([
      "our ears will not change in size",
      "our ears will be the same size.",
      "our ears will get colder",
      "our ears will not change in shape.",
    ]);
    expect(b.questions.map((it) => it.answer)).toEqual([3, 2, 1, 0]);
    expect(b.questions[1].options[2]).toBe("he/she may get angry easily");
    expect(b.questions[2].options[1]).toBe("the size, color and shape");
    expect(b.questions[3].options[0]).toBe("When they are cold");
  });
});

describe("r393 — ترازیابیِ کلیدِ رسمیِ بین‌خانواده‌ای (tests-g12 ↔ grammar-topic r292)", () => {
  it("l115 ↔ gt-l93: ق۷-۹ هم‌نوعِ mcq/mcq/typed با کلیدهای همسان", () => {
    expect(A(L(115).questions[0].options[L(115).questions[0].answer])).toBe(
      A(GT(93).questions[0].options[GT(93).questions[0].answer])
    );
    expect(A(L(115).questions[1].options[L(115).questions[1].answer])).toBe(
      A(GT(93).questions[1].options[GT(93).questions[1].answer])
    );
    expect(L(115).questions[2].accepted).toEqual(GT(93).questions[2].accepted);
  });

  it("l118/l122/l124/l125 ↔ gt-l94/l98/l100/l101: acceptedها ردیف‌به‌ردیف (شاملِ دوبخشی‌ها)", () => {
    expect(L(118).questions.map((it) => it.accepted)).toEqual(
      GT(94).questions.map((it) => it.accepted)
    );
    expect(L(122).questions.map((it) => it.accepted)).toEqual(
      GT(98).questions.map((it) => it.accepted)
    );
    expect(L(124).questions.map((it) => it.accepted!.map(A))).toEqual(
      GT(100).questions.map((it) => it.accepted!.map(A))
    );
    expect(L(125).questions.map((it) => it.accepted)).toEqual(
      GT(101).questions.map((it) => it.accepted)
    );
  });

  it("l119/l121/l123/l128 ↔ gt-l95/l97/l99/l104: کلیدهای واژگان و گرامر همسان", () => {
    expect(L(119).questions.map((it) => it.options[it.answer])).toEqual(
      GT(95).questions.map((it) => it.options[it.answer])
    );
    expect(L(121).questions.map((it) => it.answer)).toEqual(
      GT(97).questions.map((it) => it.answer)
    );
    expect(L(121).questions.map((it) => it.options)).toEqual(
      GT(97).questions.map((it) => it.options)
    );
    expect(L(123).questions.map((it) => it.options[it.answer])).toEqual(
      GT(99).questions.map((it) => it.options[it.answer])
    );
    expect(L(128).questions.map((it) => it.options[it.answer])).toEqual(
      GT(104).questions.map((it) => it.options[it.answer])
    );
  });

  it("l120 ↔ gt-l96 (واگراییِ رندر: mcq ما در برابرِ تایپیِ دوقلو) — کلیدها واژه‌به‌واژه همسان", () => {
    expect(L(120).questions.map((it) => it.options[it.answer])).toEqual(
      GT(96).questions.map((it) => it.accepted![0])
    );
  });

  it("l126 ↔ gt-l102: ترتیبِ درخت‌ها — هر چهار گزینه و کلید همسان", () => {
    expect(L(126).questions[0].options).toEqual(GT(102).questions[0].options);
    expect(L(126).questions[0].answer).toBe(GT(102).questions[0].answer);
  });

  it("l127 ↔ gt-l103: تایپی‌های q48-49 و False/Falseِ q51-52 همسان؛ q50 واگراییِ مستند (تایپیِ ما ↔ mcqِ ساختگیِ دوقلو) با کلیدِ مشترک", () => {
    expect(L(127).questions[0].accepted!.map(A)).toEqual(GT(103).questions[0].accepted!.map(A));
    expect(L(127).questions[1].accepted).toEqual(GT(103).questions[1].accepted);
    expect(L(127).questions[3].options[L(127).questions[3].answer]).toBe(
      GT(103).questions[3].options[GT(103).questions[3].answer]
    );
    expect(L(127).questions[4].options[L(127).questions[4].answer]).toBe(
      GT(103).questions[4].options[GT(103).questions[4].answer]
    );
    // کلیدِ مشترکِ q50 در هر دو رندر
    expect(GT(103).questions[2].options[0]).toContain(
      "hybrid cars combine the benefits of gasoline engines and electric motors"
    );
  });

  it("افزودهٔ r393 فراتر از دوقلو: ق۱۰-۱۴ ساقه‌دارند ولی در gt-l93-l104 نیستند", () => {
    const gtIds = gt.lessons
      .filter((l) => l.lesson >= 93 && l.lesson <= 104)
      .flatMap((l) => l.questions.map((q) => q.question));
    expect(gtIds.join(" ")).not.toContain("Michelle's father");
    expect(gtIds.join(" ")).not.toContain("Did you do anything");
  });
});

describe("r393 — پیمان‌های سراسریِ فایل", () => {
  it("شکلِ فایل: ۱۲۸ بانک/[…,4,6,4,4,3,2,3,2,4,4,4,4,4,2,4,1,5,4]/۷۹۷ id یکتا — الگویِ g12-l1..l128", () => {
    expect(bank.lessons)./* R395-WIDENED */ /* R396-WIDENED */ toHaveLength(143);
    expect(bank.lessons.map((l) => l.count)).toEqual([
      100, 100, 100, 6, 7, 6, 10, 4, 6, 8, 4, 4, 4, 4, 4, 5, 7, 4, 4, 4, 2, 5, 7, 4, 4, 4, 2, 2, 7,
      4, 3, 3, 4, 2, 6, 7, 4, 4, 4, 4, 2, 6, 4, 6, 8, 4, 4, 4, 4, 6, 6, 3, 3, 6, 4, 4, 4, 4, 4, 1,
      2, 1, 2, 3, 3, 4, 4, 4, 4, 4, 3, 1, 3, 2, 3, 3, 5, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 2,
      4, 8, 2, 4, 3, 3, 4, 4, 4, 3, 3, 8, 2, 4, 3, 3, 4, 4, 2, 4, 6, 4, 4,
      3, 2, 3, 2, 4, 4, 4, 4, 4, 2, 4, 1, 5, 4, 4, 4, 4, 4, 3, 3, 4, 4, 2, 6, 6, 4, 6,
      22,
      18,
    ]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(891);
    expect(new Set(ids).size).toBe(891);
    expect(ids[751]).toBe("g12-l115-1");
    expect(ids[754]).toBe("g12-l116-1");
    expect(ids[756]).toBe("g12-l117-1");
    expect(ids[759]).toBe("g12-l118-1");
    expect(ids[761]).toBe("g12-l119-1");
    expect(ids[765]).toBe("g12-l120-1");
    expect(ids[769]).toBe("g12-l121-1");
    expect(ids[773]).toBe("g12-l122-1");
    expect(ids[777]).toBe("g12-l123-1");
    expect(ids[781]).toBe("g12-l124-1");
    expect(ids[783]).toBe("g12-l125-1");
    expect(ids[787]).toBe("g12-l126-1");
    expect(ids[788]).toBe("g12-l127-1");
    expect(ids[793]).toBe("g12-l128-1");
    expect(ids[796]).toBe("g12-l128-4");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("MCQ-خالصِ l119/l120/l121/l123/l126/l128 و تایپیِ خالصِ l116/l117/l118/l122/l124/l125", () => {
    for (const bn of [119, 120, 121, 123, 126, 128])
      for (const it of L(bn).questions) {
        expect(it.translation, `${it.id} must have no translation`).toBeUndefined();
        expect(it.kind, `${it.id} must be MCQ`).toBeUndefined();
        expect(it.accepted, `${it.id} must not carry accepted`).toBeUndefined();
        expect(it.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(new Set(it.options).size, it.id).toBe(it.options.length);
      }
    for (const bn of [116, 117, 118, 122, 124, 125])
      for (const it of L(bn).questions) expect(it.kind).toBe("typed");
    // بانک‌های ترکیبیِ l115/l127: هر آیتم یا mcqِ خالص یا تایپیِ با accepted
    for (const bn of [115, 127])
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

  it("نشت‌سنجِ ردیف‌های مستثنیِ راند: مدل‌های صوتیِ ق۱-۶/stemهای ق۴۴-۴۷ غایب‌اند", () => {
    const forbidden = [
      "do exercise", // مدلِ صوتیِ ق۱
      "dishwasher", // مدلِ صوتیِ ق۲
      // «renewable energy» و «at the top of each page» از نشت‌سنجِ این راند حذف شدند — در l33/l32 موجودند
      // (الگویِ «Solar power» در r391/ر392)
      "sun or sunshine", // مدلِ صوتیِ ق۵
      "You can carry it everywhere", // مدلِ صوتیِ ق۶
      "They lead a hard life", // stemِ چاپِ ق۴۴ (Doctors)
      "Examples of fruits are apples", // stemِ چاپِ ق۴۵
      "We depend on forests for our survival", // stemِ چاپِ ق۴۶
      "Avicenna was one of the most famous Iranian", // stemِ چاپِ ق۴۷
      "Ghanoon in medicine", // دادهٔ چاپِ ق۴۷
      "نرمه گوش", // واژه‌نویسیِ فارسیِ حذف‌شده از متنِ گوش‌ها
    ];
    const all = bank.lessons
      .flatMap((b2) => b2.questions)
      .map((q) => q.question + " " + q.options.join(" ") + " " + (q.accepted ?? []).join(" "))
      .join(" \n ")
      .toLowerCase();
    for (const s of forbidden) expect(all).not.toContain(s.toLowerCase());
  });

  it("خلوصِ لاتین: بدونِ حروفِ presentation-form و کنترلِ نامرئی در l115-l128", () => {
    for (const bn of [115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128])
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
