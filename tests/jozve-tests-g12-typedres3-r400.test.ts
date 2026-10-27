import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

// r400 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ سوم (پایانی): پاسخ‌هایِ مدل (l144، ۵۱ آیتم)
// سومین بانکِ گردآوریِ درون‌خانوادگی از «مخزنِ ۹۱ ردیفیِ جزئی» (رسیدهای g12typedres1/2):
// ۵۱ ردیفِ «پاسخِ مدلِ» خوانداری/واژه‌نامه/شنیداری از ۱۲ برگه (r380-r393) — با این بانک
// مخزنِ ۹۱ ردیفی (۲۲ افعال l142 + ۱۸ جمله‌سازی l143 + ۵۱ مدل l144) کامل مصرف می‌شود.
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
const L = (n: number): TLesson => {
  const b = bank.lessons.find((x) => x.lesson === n);
  if (!b) throw new Error(`bank l${n} not found`);
  return b;
};

describe("r400 — شکلِ فایل پس از بانکِ l144", () => {
  it("۱۴۴ بانک / ۹۴۲ id یکتا / دمِ counts +51 / همخوانیِ count با questions", () => {
    expect(bank.lessons).toHaveLength(144);
    const counts = bank.lessons.map((l) => l.count);
    expect(counts).toHaveLength(144);
    expect(counts.slice(-3)).toEqual([22, 18, 51]);
    const ids = bank.lessons.flatMap((b2) => b2.questions.map((q) => q.id));
    expect(ids).toHaveLength(942);
    expect(new Set(ids).size).toBe(942);
    expect(ids[891]).toBe("g12-l144-1");
    expect(ids[941]).toBe("g12-l144-51");
    for (const b2 of bank.lessons) expect(b2.count).toBe(b2.questions.length);
  });

  it("رسیدِ g12typedres3: سرشمارِ مصرفِ ۱۲ برگه + باقیِ صفرِ مخزن", () => {
    const r = bank.source.g12typedres3 as {
      extractedRound: string;
      items: number;
      bankCounts: Record<string, number>;
      reservoirCensus: { consumedHere: Record<string, string>; remaining: string };
    };
    expect(r).toBeTruthy();
    expect(r.extractedRound).toBe("r400");
    expect(r.items).toBe(51);
    expect(r.bankCounts).toEqual({ l144: 51 });
    expect(Object.keys(r.reservoirCensus.consumedHere)).toHaveLength(12);
    expect(r.reservoirCensus.remaining).toContain("صفر");
  });
});

describe("r400 — پیمان‌های محتواییِ l144", () => {
  const b = L(144);

  it("تایپیِ خالص: ۵۱ آیتمِ kind=typed، بدونِ ترجمه، options=[accepted[0]]", () => {
    expect(b.title).toBe("مرورِ تایپیِ نهایی‌ها — پاسخ‌هایِ مدل (قسمتِ سومِ مخزنِ ۸۹ ردیفی)");
    expect(b.level).toBe("تایپی");
    expect(b.count).toBe(51);
    expect(b.questions).toHaveLength(51);
    for (const q of b.questions) {
      expect(q.kind, q.id).toBe("typed");
      expect(q.accepted, q.id).toBeTruthy();
      expect(q.accepted!.length, q.id).toBeGreaterThanOrEqual(1);
      expect(q.options, q.id).toEqual([q.accepted![0]]);
      expect(q.answer, q.id).toBe(0);
      expect(q.translation, q.id).toBeUndefined();
      expect(q.placeholder, q.id).toBeUndefined();
    }
    expect(b.questions.map((q) => q.n)).toEqual(Array.from({ length: 51 }, (_, i) => i + 1));
  });

  it("سهمِ ۱۲ برگه: r380×4، r381×7، r382×5، r383×3، r384×4، r385×2، r386×4، r387×2، r390×6، r391×7، r392×1، r393×6", () => {
    // سرشمار با محدوده‌های n (ترتیبِ استخراجِ r380→r393)
    const ranges: [string, number, number][] = [
      ["r380", 1, 4], ["r381", 5, 11], ["r382", 12, 16], ["r383", 17, 19],
      ["r384", 20, 23], ["r385", 24, 25], ["r386", 26, 29], ["r387", 30, 31],
      ["r390", 32, 37], ["r391", 38, 44], ["r392", 45, 45], ["r393", 46, 51],
    ];
    const expected: Record<string, number> = {};
    for (const [paper, a, z] of ranges) expected[paper] = z - a + 1;
    expect(Object.values(expected).reduce((x, y) => x + y, 0)).toBe(51);
    // هر محدوده باید با nهایِ واقعی بخواند
    for (const [, a, z] of ranges) {
      for (let n = a; n <= z; n++) expect(b.questions[n - 1].n, `n=${n}`).toBe(n);
    }
  });

  it("ردیف‌هایِ رسیدِ چاپِ مستقیم — عینِ کلید", () => {
    const A = (n: number) => L(144).questions[n - 1].accepted!;
    expect(A(1)).toEqual(["He asked him if he could drive him home."]); // r380-ق۴۳
    expect(A(3)).toEqual(["It refers to words."]); // r380-ق۴۷
    expect(A(8)).toEqual(["Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels."]); // r381-ق۴۷
    expect(A(13)).toEqual(["paying attention during lessons and following classroom rules."]); // r382-ق۴۳
    expect(A(16)).toEqual(["Because they can cause brain problems."]); // r382-ق۴۸
    expect(A(17)).toEqual(["portable device"]); // r383-ق۴۰
    expect(A(22)).toEqual(["entry"]); // r384-ق۴۲
    expect(A(23)).toEqual(["collocations"]); // r384-ق۴۳
    expect(A(25)).toEqual(["Solar collectors collect heat by absorbing sunlight."]); // r385-ق۴۳
    expect(A(26)).toEqual(["Quickly before they jump into to the next lesson."]); // r386-ق۴۴ — تایپوی چاپ وفادار
    expect(A(30)).toEqual(["means"]); // r387-ق۴۳
    expect(A(31)).toEqual(["founding"]); // r387-ق۴۴
    expect(A(36)).toEqual(["One language is used in it."]); // r390-ق۵۷
    expect(A(45)).toEqual(["If we have a good vocabulary, we are more interested in reading."]); // r392-ق۴۹
    expect(A(46)).toEqual(["do exercise"]); // r393-ق۱ شنیداری
    expect(A(51)).toEqual(["You can carry it everywhere."]); // r393-ق۶ شنیداری
  });

  it("دوتایی‌هایِ چاپی و بازسازی‌هایِ عمودیِ کلیدِ قدیمی", () => {
    const A = (n: number) => L(144).questions[n - 1].accepted!;
    // r380-ق۴۴ — چاپِ «(John was upset ) because…» → دو شکل
    expect(A(2)).toEqual([
      "John was upset because he had lost his documents.",
      "because he had lost his documents.",
    ]);
    // r381-ق۵۲ — چاپِ «We / You spend…» → دو شکل
    expect(A(9)).toEqual([
      "We spend about one-third (1/3) of our lives in sleep.",
      "You spend about one-third (1/3) of our lives in sleep.",
    ]);
    // r391-ق۳۵ — دو ترتیبِ چاپیِ «یا»دار
    expect(A(38)).toEqual([
      "Everything in the garden was brown because it hadn't rained for months.",
      "Everything is brown in the garden because it hadn't rained for months.",
    ]);
    // r391-ق۳۶
    expect(A(39)).toEqual([
      "The woman who lives next door is a famous professor.",
      "The woman who is a famous professor lives next door.",
    ]);
    // بازسازی‌هایِ عمودی (پایین-به-بالا) — عینِ خوانشِ نهایی
    expect(A(4)).toEqual(["A dictionary which explains the meanings of technical words."]); // r380-ق۴۸
    expect(A(5)).toEqual(["I would travel to the future."]); // r381-ق۳۹
    expect(A(11)).toEqual(["We are still confused or think we are missing important information."]); // r381-ق۵۸
    expect(A(15)).toEqual(["televisions, computers, online games, phones."]); // r382-ق۴۷
    expect(A(18)).toEqual(["You can do this in your yard or in your favorite park."]); // r383-ق۴۷
    expect(A(19)).toEqual([
      "You should remind your children that all living creatures are parts of our world and are valuable in the natural environment.",
    ]); // r383-ق۴۸ — «parts» با پشتوانهٔ خطِ کورپوس
    expect(A(42)).toEqual(["By using a talking dictionary, we are able to look the words up in a few minutes."]); // r391-ق۵۳
    expect(A(43)).toEqual([
      "Seeing specific words used in a sentence can provide more context and help you better understand proper usage.",
    ]); // r391-ق۵۴ — con+text
    expect(A(41)).toEqual([
      "The important point is that we continue to give to those who are more in need than ourselves.",
    ]); // r391-ق۴۹
  });

  it("ردیف‌هایِ which و شنیداری — ساقه‌هایِ صادقانه", () => {
    const Q = (n: number) => L(144).questions[n - 1];
    expect(Q(20).accepted).toEqual(["which"]); // r384-ق۳۴ ostrich
    expect(Q(20).question).toContain("An ostrich is a bird");
    expect(Q(20).question).toContain("whom, who یا which"); // دستورِ چاپیِ فارسیِ همان بخش
    expect(Q(24).accepted).toEqual(["which"]); // r385-ق۳۴ horse
    expect(Q(24).question).toContain("A horse is an animal");
    // شنیداری‌های r393 — ساقهٔ فارسیِ شش‌گانه
    for (let n = 46; n <= 51; n++) {
      expect(/\p{Script=Arabic}/u.test(Q(n).question), `l144-${n} فارسی`).toBe(true);
      expect(Q(n).question).toContain("دی ۱۳۹۸");
      expect(Q(n).question).toContain("شنیداری");
    }
    expect(Q(46).accepted).toEqual(["do exercise"]);
    expect(Q(50).accepted).toEqual(["sun or sunshine"]);
  });

  it("دسته‌ها: ۴۴ vocab و ۷ grammar؛ q1=vocab (الگویِ بانک‌های خوانداری l138/139)", () => {
    const cats = b.questions.map((q) => q.category);
    expect(cats.filter((c) => c === "grammar")).toHaveLength(7);
    expect(cats.filter((c) => c === "vocab")).toHaveLength(44);
    expect(cats[0]).toBe("vocab");
    expect(cats[4]).toBe("grammar"); // r381-ق۳۹
    expect(cats[19]).toBe("grammar"); // r384-ق۳۴
    expect(cats[31]).toBe("grammar"); // r390-ق۳۷ چیپ‌ها
    expect(cats[37]).toBe("grammar"); // r391-ق۳۵ چیپ‌ها
  });

  it("سیم‌کشیِ کارتِ دوازدهم: دکمهٔ سومِ گروه «مرورِ تایپیِ نهایی‌ها» در jozve-view", () => {
    const src = readFileSync(
      path.join(process.cwd(), "src/components/study/jozve/jozve-view.tsx"),
      "utf8"
    );
    expect(src).toContain(
      '{ lesson: 144, title: "مرورِ تایپیِ نهایی‌ها — پاسخ‌هایِ مدل (قسمتِ سومِ مخزنِ ۸۹ ردیفی)", count: 51, group: "مرورِ تایپیِ نهایی‌ها" }'
    );
  });

  it("چیپ‌هایِ مرتب‌کردنیِ r390/r391 — عینِ چاپ با « / »", () => {
    const Q = (n: number) => L(144).questions[n - 1];
    expect(Q(32).question).toBe("very heavy / a bag I always / which / my brother / seems / carries .");
    expect(Q(33).question).toBe("well,/ should/ so /has /study / tonight / tomorrow / an exam / she Mina.");
    expect(Q(38).question).toBe("rained / brown / for months / everything / because / hadn't / in the garden / was / it.");
    expect(Q(39).question).toBe("famous / lives / the woman / professor / next door / is / who / a.");
  });
});
