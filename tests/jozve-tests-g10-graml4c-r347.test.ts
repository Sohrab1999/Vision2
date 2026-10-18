import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r347 — گاردِ ادامهٔ خانوادهٔ درس چهارم دهم: تمرین حروف اضافه (ص۱۵۸) + آزمون تشریحی گرامر
// (ص۱۶۱-۱۶۲، کلید ص۲۹۰) + ۲۰ تست آموزشی (ص۱۶۳، کلیدِ توضیح‌دار و ترجمهٔ چاپی ص۲۹۱-۲۹۲).
// بانک‌های ۸۲-۸۸ (۶۸ آیتم) — tests-g10 = ۱۱۳۰ در ۸۸ بانک.
// کشفِ چاپ‌خطایِ کلیدی: کلیدِ ص۲۹۰ بخشِ ۶ برای تمرینِ ص۱۵۸ ۱۲ سطر می‌زند (۹-۱۲ شبح + آیتم ۵ واگرا:
// ص۲۹۰ on در برابرِ Answer Keyِ درون‌صفحه‌ای in) — کلیدِ درون‌صفحه‌ای حاکم (قاعدهٔ r344).
// داوری‌های رندر ۹۰۰-۸۰۰۰dpi: «آسانی» با یِ نکره + غلطِ چاپیِ «نیپرسید» (Q11 — سومین عضوِ خانوادهٔ
// درحایل r343)، «دستگریمی» سربرگِ کلید در برابرِ «آموزشی» سربرگِ آزمون، «شهریورماه ماه ۹۹»،
// «مطمئن»، «سرکار»، «میروم»، «کنی/بگیرم/بگیری»، محاورهٔ چاپیِ «داره/میشه/نمیدونم/میتونم».
// تیره‌شماری: S1 ده×۳۳، S2 ده×۱۸، S3 پنج×۲۵، S5 ده‌تایی (دوتایی ۱۰+۱۰)، تمرین ۱۴، ص۱۶۳ طبق وکتور.
// کلید: S1=ababaabbab، MCQ=dcdccbcdbadcbbaacab — صفر واگرایی.

type TQ = {
  id: string; n: number; category: string; kind?: string; question: string; options: string[];
  answer: number; translation?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string;
    g10l4c?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printErrata: string[]; printQuirks: string[];
      layerDecompositions: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

const B82 = bank.lessons.find((l) => l.lesson === 82)!;
const B83 = bank.lessons.find((l) => l.lesson === 83)!;
const B84 = bank.lessons.find((l) => l.lesson === 84)!;
const B85 = bank.lessons.find((l) => l.lesson === 85)!;
const B86 = bank.lessons.find((l) => l.lesson === 86)!;
const B87 = bank.lessons.find((l) => l.lesson === 87)!;
const B88 = bank.lessons.find((l) => l.lesson === 88)!;

describe("jozve tests-g10 g10l4c receipt (r347 pp158/161-163, keys pp290-292)", () => {
  it("g10l4c receipt complete: header, key pages, round, pattern, errata, quirks", () => {
    expect(bank.source.g10l4c).toBeTruthy();
    const s = bank.source.g10l4c!;
    expect(s.exam).toContain("ص۱۵۸");
    expect(s.exam).toContain("ص۱۶۱-۱۶۲");
    expect(s.exam).toContain("ص۱۶۳");
    expect(s.header).toContain("۲۹۰"); // ارقامِ فارسیِ ارجاعِ ص۱۶۱
    expect(s.header).toContain("۲۹۱ - ۲۹۲"); // ارقامِ فارسی با خط‌تیره
    expect(s.header).toContain("۱۶۱ و ۱۶۲"); // واصفِ «و» + لایهٔ مخلوطِ «1۶1»
    expect(s.header).toContain("دستگریمی"); // سربرگِ کلید
    expect(s.header).toContain("آموزشی"); // سربرگِ آزمون — ناسازگاریِ چاپ
    expect(s.keyPages).toBe("158 (درون‌صفحه‌ای), 290, 291-292");
    expect(s.keyVerification).toContain("۲۰/۲۰");
    expect(s.keyVerification).toContain("۱۰/۱۰");
    expect(s.keyVerification).toContain("۸/۸");
    expect(s.extractedRound).toBe("r347");
    expect(s.printErrata.length).toBeGreaterThanOrEqual(9);
    expect(s.printErrata.some((q) => q.includes("۱۲سطری"))).toBe(true); // شبح‌های ۹-۱۲
    expect(s.printErrata.some((q) => q.includes("«in the world» درست است"))).toBe(true); // واگراییِ آیتم ۵
    expect(s.printErrata.some((q) => q.includes("نیپرسید"))).toBe(true); // غلطِ چاپ Q11
    expect(s.printErrata.some((q) => q.includes("آسانی"))).toBe(true); // یِ نکره
    expect(s.printErrata.some((q) => q.includes("شهریورماه ماه ۹۹"))).toBe(true); // «ماه» تکراری
    expect(s.printErrata.some((q) => q.includes("Telegram"))).toBe(true); // غیبتِ پاصفحه
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(8);
    expect(s.printQuirks.some((q) => q.includes("فاصلهٔ دوگانه"))).toBe(true); // سیستماتیکِ ص۱۶۳
    expect(s.printQuirks.some((q) => q.includes("Q2=۳۱"))).toBe(true); // گپ‌های گفتگو
    expect(s.printQuirks.some((q) => q.includes("داره"))).toBe(true); // محاورهٔ چاپی
    expect(s.layerDecompositions.length).toBeGreaterThanOrEqual(1);
    expect(s.layerDecompositions[0]).toContain("دستگریم ـگ رامر");
  });
});

describe("jozve tests-g10 bank 82 — drill prepositions p158 (typed, on-page Answer Key)", () => {
  it("bank 82 shape: 8 typed items, ids g10-l82-N, grammar, accepted = on-page key", () => {
    expect(B82.count).toBe(8);
    expect(B82.title).toContain("ص۱۵۸");
    B82.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l82-${i + 1}`);
      expect(q.n, q.id).toBe(i + 1);
      expect(q.category, q.id).toBe("grammar");
      expect(q.kind, q.id).toBe("typed");
      expect(q.answer, q.id).toBe(0);
      expect(q.accepted, q.id).toEqual([q.options[0]]);
      expect(q.placeholder, q.id).toContain("(on / in / at)");
    });
  });

  it("bank 82 keys locked to printed on-page Answer Key (p158) — 8/8", () => {
    expect(B82.questions.map((q) => q.accepted![0])).toEqual([
      "in / in", "in / in", "in / in", "On / at", "in", "in", "on", "on",
    ]);
  });

  it("bank 82 stems verbatim: 14-dash blanks with inline (on / in / at) options", () => {
    const vec = B82.questions.map((q) => {
      const runs = [...q.question.matchAll(/-{2,}/g)].map((m) => m[0].length);
      return runs.length > 1 ? runs : runs[0];
    });
    expect(vec).toEqual([[14, 14], [14, 14], [14, 14], [14, 14], 14, 14, 14, 14]);
    expect(B82.questions[3].question).toContain("(On / In / At) Friday night I went to bed"); // کپیتالِ آغازینِ چاپ
    expect(B82.questions[2].question).toContain("(on / in / at) 1320."); // ارقامِ لاتینِ چاپ
    expect(B82.questions[4].question).toContain("longest river");
  });
});

describe("jozve tests-g10 bank 83 — S1 two-option can/could p161 (bank-76 pattern)", () => {
  it("bank 83 shape: 10 two-option MCQ, ids g10-l83-N, 33-dash blanks", () => {
    expect(B83.count).toBe(10);
    B83.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l83-${i + 1}`);
      expect(q.category, q.id).toBe("grammar");
      expect(q.options, q.id).toHaveLength(2);
      expect(q.kind, q.id).toBeUndefined();
      expect(q.question, q.id).toContain("-".repeat(33));
    });
  });

  it("bank 83 keys locked to printed key grid p290 — ababaabbab", () => {
    expect(B83.questions.map((q) => "ab"[q.answer]).join("")).toBe("ababaabbab");
  });

  it("bank 83 stems carry print-verbatim option parens", () => {
    expect(B83.questions[0].question).toContain("(can’t hear / couldn’t hear)");
    expect(B83.questions[9].question).toContain("(can’t eat / couldn’t eat)");
    expect(B83.questions[3].question).toContain("I ---------------------------------. (can’t sleep");
  });
});

describe("jozve tests-g10 banks 84-87 — tashrihi grammar sections p161-162 (r340 pattern)", () => {
  it("bank 84 shape: 10 typed with can/may/should/must bank tag + r338 rotation", () => {
    expect(B84.count).toBe(10);
    B84.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l84-${i + 1}`);
      expect(q.kind, q.id).toBe("typed");
      expect(q.question, q.id).toContain("[bank: can / may / should / must]");
      expect(q.question, q.id).toContain("-".repeat(18));
      expect(q.options, q.id).toEqual(expect.arrayContaining(["can", "may", "should", "must"]));
      expect(q.options![0], q.id).toBe(q.accepted![0]);
    });
    expect(B84.questions.map((q) => q.accepted![0])).toEqual([
      "must", "should", "may", "can", "should", "must", "must", "can", "may", "must",
    ]);
    // گپ‌های گفتگوی چاپی (اندازه‌گیریِ span): Q3=۱۱ و Q9=۲۱ فاصله
    expect(B84.questions[2].question).toContain("tonight?           B:");
    expect(B84.questions[8].question).toContain("brother?                     B:");
  });

  it("bank 85 shape: 5 typed error-corrections with 25-dash empty parens + printed fixes", () => {
    expect(B85.count).toBe(5);
    B85.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l85-${i + 1}`);
      expect(q.kind, q.id).toBe("typed");
      expect(q.question, q.id).toContain("(" + "-".repeat(25) + ")");
      expect(q.options![1], q.id).not.toBe(q.accepted![0]);
    });
    expect(B85.questions.map((q) => q.accepted![0])).toEqual([
      "tell", "do", "shouldn’t", "couldn’t", "should be",
    ]);
    expect(B85.questions[0].options![1]).toBe("told");
    expect(B85.questions[4].options![1]).toBe("be should"); // عینِ چاپِ ص۱۶۱
    expect(B85.questions[2].question).toContain("You should listen to loud music."); // جملهٔ غلطِ چاپ
  });

  it("bank 86 shape: 5 typed sentence-buildings (bank-59 pattern) with printed keys", () => {
    expect(B86.count).toBe(5);
    B86.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l86-${i + 1}`);
      expect(q.kind, q.id).toBe("typed");
      expect(q.options![0], q.id).toBe(q.accepted![0]);
      expect(q.options, q.id).toHaveLength(4);
    });
    expect(B86.questions[0].accepted![0]).toBe("students should learn about saving wildlife."); // s کوچکِ چاپ
    expect(B86.questions[4].accepted![0]).toBe("We should not listen to loud music.");
    expect(B86.questions[0].question).toBe("should / wildlife / students / about / learn / saving.");
  });

  it("bank 87 shape: 10 typed time-prepositions, 10-dash blanks, duals 10+10", () => {
    expect(B87.count).toBe(10);
    B87.questions.forEach((q) => {
      expect(q.kind).toBe("typed");
      expect(q.question).toContain("[bank: in / at / on]");
    });
    const vec = B87.questions.map((q) => {
      const runs = [...q.question.matchAll(/-{2,}/g)].map((m) => m[0].length);
      return runs.length > 1 ? runs : runs[0];
    });
    expect(vec).toEqual([10, 10, 10, 10, 10, [10, 10], 10, 10, [10, 10], [10, 10]]);
    expect(B87.questions.map((q) => q.accepted![0])).toEqual([
      "in", "on", "at", "at", "at", "at / in", "on", "on", "in / at", "at / on",
    ]);
    expect(B87.questions[7].question).toContain("Neil Armstrong");
  });
});

describe("jozve tests-g10 bank 88 — 20 educational MCQ p163 with printed translations (r346 pattern)", () => {
  it("bank 88 shape: 20 MCQ, ids g10-l88-N, grammar, every item carries printed translation", () => {
    expect(B88.count).toBe(20);
    expect(B88.title).toContain("ص۱۶۳");
    B88.questions.forEach((q, i) => {
      expect(q.id, q.id).toBe(`g10-l88-${i + 1}`);
      expect(q.category, q.id).toBe("grammar");
      expect(q.options, q.id).toHaveLength(4);
      expect(typeof q.translation, q.id).toBe("string");
      expect(q.translation!.length, q.id).toBeGreaterThan(15);
    });
  });

  it("bank 88 keys locked to printed grids pp291-292 — 20/20 zero divergence", () => {
    // گرید به‌صورتِ فهرستِ صریحِ حرف‌به‌حرفِ گریدهای چاپی (درسِ r343/r346: رشتهٔ دست‌نویسِ طولانی ممنوع)
    const PRINT_GRID = [
      "d", "c", "d", "c", "c", "b", "c", "d", // ص۲۹۱: گریدهای ۱-۸
      "b", "a", "d", "c", // ص۲۹۱: گریدهای ۹-۱۲
      "b", "b", "c", // ص۲۹۱: گریدهای ۱۳-۱۵
      "a", "a", "c", "a", "b", // ص۲۹۲: گریدهای ۱۶-۲۰
    ].join("");
    expect(B88.questions.map((q) => "abcd"[q.answer]).join("")).toBe(PRINT_GRID);
  });

  it("bank 88 stems verbatim: dash vector + double-space + dialogue gaps (31/19/24/17)", () => {
    const vec = B88.questions.map((q) => {
      const runs = [...q.question.matchAll(/-{2,}/g)].map((m) => m[0].length);
      return runs.length > 1 ? runs : runs[0];
    });
    expect(vec).toEqual([19, 17, 18, 17, 19, 21, 17, 17, 17, 17, 17, 17, 15, 12, 16, 16,
      [14, 14], [15, 14], [15, 13], [14, 13]]);
    // فاصلهٔ دوگانهٔ سیستماتیکِ پیش از خالی
    expect(B88.questions[2].question).toContain("you  ------------------ use my books.");
    expect(B88.questions[5].question).toContain("passengers  ---------------------");
    // گپ‌های گفتگوی چاپی (لایه — لاتین)
    expect(B88.questions[1].question).toContain("in class?”                               B:");
    expect(B88.questions[4].question).toContain("I do?”                   B:");
    expect(B88.questions[6].question).toContain("at home?”                        B:");
    expect(B88.questions[7].question).toContain('pen?”                 B:');
    // خالیِ درونِ گیومهٔ Q8
    expect(B88.questions[7].question).toContain("A: “ ----------------- I borrow your pen?”");
    // ارقامِ لاتینِ Q16
    expect(B88.questions[15].question).toContain("Shahrivar 22, 1400");
  });

  it("bank 88 translations verbatim: print typos, colloquial, spaced suffixes", () => {
    expect(B88.questions[0].translation).toBe(
      "وقتیکه بچه بودم میتوانستم به آسان از درختان بالا بروم اما الان نمیتوانم.",
    );
    expect(B88.questions[1].translation).toContain("چرا علی در کلاس نیست؟   - نمیدونم. شاید امروز مریض باشد.");
    expect(B88.questions[2].translation).toContain("وقتی در خانه نیستم"); // یِ چاپی (لایه «وقت  در»)
    expect(B88.questions[2].translation).toContain("استفاده کنی."); // «کتن» لایه
    expect(B88.questions[3].translation).toContain("ترک کنی. وقتی که تکالیفت را انجام دادی");
    expect(B88.questions[4].translation).toContain("- داره برای اتوبوس دیرم میشه. چکار باید بکنم؟"); // محاورهٔ چاپ
    expect(B88.questions[4].translation).toContain("میتوانی تاکسی بگیری."); // تجزیهٔ «میتوابن/تاکیس»
    expect(B88.questions[5].translation).toContain("پاسپورت هایشان"); // پسوندِ فاصله‌دار
    expect(B88.questions[6].translation).toContain("– چرا رامان در خانه نیست؟"); // خطِ بلندِ چاپ
    expect(B88.questions[6].translation).toContain("مطمئن نیستم"); // همزه (لایه «مطمیی ن»)
    expect(B88.questions[7].translation).toContain("میتونم (اجازه دارم) خودکارت را قرض بگیرم؟"); // محاوره + پرانتز
    expect(B88.questions[8].translation).toContain("رمان های جالب را به خوبی مینویسد."); // تجزیهٔ «جالت» + «خوبی»
    expect(B88.questions[9].translation).toContain("راننده سریعی است. او همیشه به سرعت"); // تجزیهٔ «رسییع»
    expect(B88.questions[10].translation).toBe(
      "معلم سوال آسانی را نیپرسید. من آن را به سختی جواب دادم.",
    ); // غلطِ چاپِ «نیپرسید» + «آسانی» — عینِ چاپ
    expect(B88.questions[11].translation).toContain("همه سؤالات آنها را مؤدبانه جواب داد."); // همزه‌ها
    expect(B88.questions[12].translation).toContain("به پارک میروم."); // چسبیده (لایه «میر وم»)
    expect(B88.questions[13].translation).toContain("در سرکار بودم، یک تماس تلفنی مهم داشتم."); // تجزیهٔ «رس کار/تلفتن»
    expect(B88.questions[14].translation).toContain("بچه ها در خانه بودند."); // پسوندِ فاصله‌دار
    expect(B88.questions[15].translation).toContain("در ۲۲ شهریورماه ماه ۹۹ از مازندران"); // ارقامِ فارسی + «ماه» تکراری
    expect(B88.questions[16].translation).toContain("عموزاده های خود را ملاقات خواهند کرد.");
    expect(B88.questions[17].translation).toContain("در خرداد ماه دعوت کنی؟"); // «کتن» لایه
    expect(B88.questions[19].translation).toContain("سال آینده در تعطیلات ما در کشور کره");
  });
});

describe("jozve tests-g10 file shape after r347 (88 banks / 1130 items)", () => {
  it("file shape: 88 banks, 1130 items, unique ids", () => {
    expect(bank.lessons.length).toBe(88);
    expect(bank.lessons.reduce((s: number, l: { count: number }) => s + l.count, 0)).toBe(1130);
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(ids.length).toBe(1130);
    expect(new Set(ids).size).toBe(1130);
  });

  it("family shape vector extended: r326/r338 +7 members (8,10,10,5,5,10,20) — 82 members", () => {
    const tail = bank.lessons.slice(6).map((l) => l.count);
    expect(tail.length).toBe(82);
    expect(tail.slice(-7)).toEqual([8, 10, 10, 5, 5, 10, 20]); // بانک‌های ۸۲-۸۸ — r347
    expect(tail.slice(-12, -7)).toEqual([16, 8, 8, 25, 40]); // خانوادهٔ درس چهارمِ قبلی
  });
});
