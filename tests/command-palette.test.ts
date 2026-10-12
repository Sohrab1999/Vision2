// Task 66 «فرمان‌یاب» — قرارداد موتور خالص جست‌وجوی پالت فرمان.
// Task 67 — فرمان‌های عمق‌دار درس (lessonTabCommands) + تجزیهٔ شناسه + «اخیر».
import { describe, it, expect } from "vitest";
import {
  normalizeFa,
  scoreCommand,
  filterCommands,
  COMMAND_GROUPS,
  PALETTE_TABS,
  faDigits,
  lessonTabCommands,
  parseLessonTabId,
  mergeRecent,
  type CommandDef,
} from "@/lib/command-palette";

const cmds: CommandDef[] = [
  { id: "nav-home", label: "خانه", group: "ناوبری", hint: "برگشت به جلد کتاب", keywords: ["home"] },
  { id: "nav-dictionary", label: "دیکشنری واژگان", group: "ناوبری", hint: "جست‌وجوی ۶۳۳+ واژه", keywords: ["dictionary", "vocab"] },
  { id: "nav-exam", label: "آزمون جامع", group: "ناوبری", hint: "ارزیابی پایانی", keywords: ["exam"] },
  { id: "lesson-1", label: "درس ۱ — انسان‌ها", group: "درس‌ها", hint: "۲۰۴ واژه", keywords: ["understanding people", "lesson 1"] },
  { id: "lesson-2", label: "درس ۲ — سبک زندگی سالم", group: "درس‌ها", hint: "۱۶۰ واژه", keywords: ["a healthy lifestyle", "lesson 2"] },
  { id: "lesson-3", label: "درس ۳ — هنر و فرهنگ", group: "درس‌ها", hint: "۱۵۵ واژه", keywords: ["art and culture", "lesson 3"] },
  { id: "act-rush", label: "چالش برق‌آسا", group: "تمرین و چالش", hint: "تست ۶۰ ثانیه‌ای", keywords: ["rush"] },
  { id: "tool-theme", label: "حالت شب", group: "ابزارها", hint: "تغییر پوسته", keywords: ["dark", "light", "theme"] },
  { id: "nav-review", label: "داشبورد مرور", group: "ناوبری", hint: "برنامهٔ SRS", keywords: ["review", "srs"] },
];

describe("normalizeFa", () => {
  it("ی/ك عربی را فارسی می‌کند", () => {
    expect(normalizeFa("كتاب يک")).toBe("کتاب یک");
  });

  it("ارقام فارسی و عربی را لاتین می‌کند", () => {
    expect(normalizeFa("درس ۲")).toBe("درس 2");
    expect(normalizeFa("درس ٤")).toBe("درس 4");
  });

  it("نیم‌فاصله و کاراکترهای نامرئی را حذف می‌کند", () => {
    expect(normalizeFa("واژه‌های\u200bمن")).toBe("واژههایمن");
  });

  it("همزهٔ ترکیبی (کسرهٔ اضافه) را حذف می‌کند — تسک ۶۷", () => {
    expect(normalizeFa("دیکتهٔ")).toBe("دیکته");
    expect(normalizeFa("مکالمهٔ درس ۲")).toBe(normalizeFa("مکالمه درس ۲"));
  });

  it("حروف بزرگ لاتین را کوچک و فاصله‌ها را می‌فشارد", () => {
    expect(normalizeFa("  A   Healthy  Lifestyle ")).toBe("a healthy lifestyle");
  });

  it("نوبه‌خود (idempotent) است", () => {
    const once = normalizeFa("درس ۲ — هنر و Culture");
    expect(normalizeFa(once)).toBe(once);
  });
});

describe("scoreCommand", () => {
  it("پرس‌وجوی خالی یعنی «همه» — امتیاز ۰", () => {
    expect(scoreCommand("", cmds[0])).toBe(0);
    expect(scoreCommand("   ", cmds[0])).toBe(0);
  });

  it("تطبیق کامل برچسب > پیشوند > زیررشته", () => {
    const exact: CommandDef = { id: "x", label: "دیکشنری", group: "ناوبری" };
    const prefix: CommandDef = { id: "y", label: "دیکشنری واژگان", group: "ناوبری" };
    const sub: CommandDef = { id: "z", label: "مینی دیکشنری جیبی", group: "ناوبری" };
    const sExact = scoreCommand("دیکشنری", exact);
    const sPrefix = scoreCommand("دیکشنری", prefix);
    const sSub = scoreCommand("دیکشنری", sub);
    expect(sExact).toBeGreaterThan(sPrefix);
    expect(sPrefix).toBeGreaterThan(sSub);
  });

  it("کلیدواژه‌ها شرکت می‌کنند — پرس‌وجوی لاتین روی برچسب فارسی", () => {
    expect(scoreCommand("dictionary", cmds.find((c) => c.id === "nav-dictionary")!)).toBeGreaterThan(0);
    expect(scoreCommand("exam", cmds.find((c) => c.id === "nav-exam")!)).toBeGreaterThan(0);
  });

  it("توضیح (hint) با وزن کمتر هم جست‌وجو می‌شود", () => {
    const r = scoreCommand("پوسته", cmds.find((c) => c.id === "tool-theme")!);
    expect(r).toBeGreaterThan(0);
  });

  it("گروه با وزن کمین هم یافتنی است", () => {
    expect(scoreCommand("درس‌ها", cmds.find((c) => c.id === "lesson-1")!)).toBeGreaterThan(0);
  });

  it("معنای AND — توکن بدون نتیجه کل فرمان را می‌اندازد", () => {
    expect(scoreCommand("درس شب", cmds.find((c) => c.id === "lesson-1")!)).toBe(-1);
  });

  it("ترتیب توکن‌ها بی‌اثر است", () => {
    const a = scoreCommand("درس 2", cmds.find((c) => c.id === "lesson-2")!);
    const b = scoreCommand("2 درس", cmds.find((c) => c.id === "lesson-2")!);
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
  });

  it("رقم فارسی پرس‌وجو با رقم برچسب تطبیق می‌شود", () => {
    expect(scoreCommand("درس ۲", cmds.find((c) => c.id === "lesson-2")!)).toBeGreaterThan(0);
  });

  it("نیم‌فاصلهٔ برچسب با فاصلهٔ پرس‌وجو یکی می‌شود", () => {
    // برچسب با نیم‌فاصله: «واژه‌های من»
    const c: CommandDef = { id: "mw", label: "واژه‌های من", group: "ناوبری" };
    expect(scoreCommand("واژه های", c)).toBeGreaterThan(0);
  });

  it("زیردنباله کمتر از تطبیق مستقیم امتیاز می‌گیرد", () => {
    const direct = scoreCommand("مرور", cmds.find((c) => c.id === "nav-review")!);
    const loose = scoreCommand("مور", cmds.find((c) => c.id === "nav-review")!);
    expect(direct).toBeGreaterThan(loose);
    expect(loose).toBeGreaterThan(0);
  });

  it("پاداش پوشش کامل برچسب — فرمانی که همهٔ توکن‌ها در برچسبش است جلو می‌زند", () => {
    const inLabel: CommandDef = { id: "a", label: "داشبورد مرور هوشمند", group: "ناوبری" };
    const inKw: CommandDef = { id: "b", label: "خانه", group: "ناوبری", keywords: ["داشبورد مرور"] };
    expect(scoreCommand("داشبورد مرور", inLabel)).toBeGreaterThan(
      scoreCommand("داشبورد مرور", inKw),
    );
  });
});

describe("filterCommands", () => {
  it("پرس‌وجوی خالی ترتیب ورودی را حفظ می‌کند", () => {
    expect(filterCommands(cmds, "").map((c) => c.id)).toEqual(cmds.map((c) => c.id));
  });

  it("نتیجه‌ای نیست وقتی هیچ‌چیز نمی‌خوابد", () => {
    expect(filterCommands(cmds, "زززز")).toEqual([]);
  });

  it("سقف بعد از مرتب‌سازی اعمال می‌شود — بهترین‌ها می‌مانند", () => {
    const many: CommandDef[] = Array.from({ length: 20 }, (_, i) => ({
      id: `c${i}`,
      label: `واژهٔ شمارهٔ ${i}`,
      group: "ناوبری",
    }));
    const out = filterCommands(many, "شماره", 5);
    expect(out).toHaveLength(5);
    // «شمارهٔ» در همه هست — رتبه‌بندی باید نزولی امتیاز/ورودی باشد
    expect(out.every((c) => many.includes(c))).toBe(true);
  });

  it("تساوی امتیازها ترتیب ورودی را نگه می‌دارد (پایداری)", () => {
    const tie: CommandDef[] = [
      { id: "a", label: "آزمون الف", group: "ناوبری" },
      { id: "b", label: "آزمون ب", group: "ناوبری" },
    ];
    expect(filterCommands(tie, "آزمون").map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("چندتوکنی: فرمانی که هر دو توکن را قوی دارد جلوتر است", () => {
    const out = filterCommands(cmds, "مرور srs");
    expect(out[0]?.id).toBe("nav-review");
  });

  it("جست‌وجوی گروهی — «درس‌ها» هر سه درس را می‌آورد", () => {
    const out = filterCommands(cmds, "درس‌ها");
    expect(out.map((c) => c.id)).toEqual(["lesson-1", "lesson-2", "lesson-3"]);
  });

  it("جست‌وجوی گروهی فرمان‌های عمق‌دار — «بخش» همه را می‌آورد و ناوبری را می‌اندازد (AND)", () => {
    const all = [...cmds, ...lessonTabCommands(lessonMeta)];
    const out = filterCommands(all, "بخش", 24);
    expect(out).toHaveLength(24);
    expect(out.every((c) => c.group === "بخش‌های درس")).toBe(true);
  });
});

describe("COMMAND_GROUPS", () => {
  it("ترتیب ثابت گروه‌ها بدون تکرار", () => {
    expect(new Set(COMMAND_GROUPS).size).toBe(COMMAND_GROUPS.length);
    expect(COMMAND_GROUPS[0]).toBe("ناوبری");
  });

  it("گروه «بخش‌های درس» (تسک ۶۷) بلافاصله بعد از «درس‌ها» می‌آید", () => {
    expect(COMMAND_GROUPS).toContain("بخش‌های درس");
    expect(COMMAND_GROUPS.indexOf("بخش‌های درس")).toBe(COMMAND_GROUPS.indexOf("درس‌ها") + 1);
  });
});

// ─── تسک ۶۷: فرمان‌های عمق‌دار درس ───

const lessonMeta = [
  { id: 1, titleEn: "Understanding People", titleFa: "فهمیدن مردم" },
  { id: 2, titleEn: "A Healthy Lifestyle", titleFa: "یک شیوهٔ زندگی سالم" },
  { id: 3, titleEn: "Art and Culture", titleFa: "هنر و فرهنگ" },
];

describe("lessonTabCommands", () => {
  it("۳ درس × (۷ تب + فلش‌کارت هوشمند) = ۲۴ فرمان با شناسهٔ یکتا", () => {
    const out = lessonTabCommands(lessonMeta);
    expect(PALETTE_TABS).toHaveLength(7);
    expect(out).toHaveLength(24);
    expect(new Set(out.map((c) => c.id)).size).toBe(24);
  });

  it("همه در گروه «بخش‌های درس» هستند و برچسب «درس N» با رقم فارسی دارند", () => {
    const out = lessonTabCommands(lessonMeta);
    expect(out.every((c) => c.group === "بخش‌های درس")).toBe(true);
    expect(out.every((c) => /درس [۱۲۳]/.test(c.label))).toBe(true);
    expect(out.find((c) => c.id === "ltab-2-dictation")?.label).toBe("دیکتهٔ درس ۲");
  });

  it("کلیدواژهٔ لاتین عنوان درس — «culture» هر ۸ فرمان درس ۳ را می‌آورد", () => {
    const out = filterCommands(lessonTabCommands(lessonMeta), "culture", 24);
    expect(out).toHaveLength(8);
    expect(out.every((c) => c.id.startsWith("ltab-3-") || c.id === "lesson-smart-3")).toBe(true);
  });
});

describe("جست‌وجوی عمق‌دار — پرش به تب درس", () => {
  const deep = lessonTabCommands(lessonMeta);

  it("«دیکتهٔ درس ۲» فقط دیکتهٔ درس ۲ را برمی‌گرداند", () => {
    const out = filterCommands(deep, "دیکتهٔ درس ۲", 12);
    expect(out.map((c) => c.id)).toEqual(["ltab-2-dictation"]);
  });

  it("«واژگان درس ۱» واژگان همان درس را بالای لیست می‌گذارد", () => {
    const out = filterCommands(deep, "واژگان درس ۱", 12);
    expect(out[0]?.id).toBe("ltab-1-vocab");
  });

  it("«هوشمند درس ۳» فرمان نیت SRS را می‌یابد", () => {
    const out = filterCommands(deep, "هوشمند درس ۳", 12);
    expect(out).toContainEqual(expect.objectContaining({ id: "lesson-smart-3" }));
  });
});

describe("parseLessonTabId", () => {
  it("شناسهٔ معتبر را تجزیه می‌کند", () => {
    expect(parseLessonTabId("ltab-2-dictation")).toEqual({ lesson: 2, tab: "dictation" });
    expect(parseLessonTabId("ltab-10-vocab")).toEqual({ lesson: 10, tab: "vocab" });
  });

  it("شناسهٔ نامعتبر → null", () => {
    expect(parseLessonTabId("nav-home")).toBeNull();
    expect(parseLessonTabId("lesson-smart-2")).toBeNull();
    expect(parseLessonTabId("ltab--")).toBeNull();
    expect(parseLessonTabId("ltab-x-vocab")).toBeNull();
    expect(parseLessonTabId("ltab-0-vocab")).toBeNull();
    expect(parseLessonTabId("ltab-3-")).toBeNull();
  });
});

describe("faDigits", () => {
  it("اعداد را با ارقام فارسی نشان می‌دهد", () => {
    expect(faDigits(2)).toBe("۲");
    expect(faDigits("12")).toBe("۱۲");
  });
});

describe("mergeRecent", () => {
  it("جلو می‌برد و تکرار را حذف می‌کند", () => {
    expect(mergeRecent(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });

  it("به سقف (پیش‌فرض ۵) بریده می‌شود", () => {
    expect(mergeRecent(["a", "b", "c", "d", "e"], "f")).toEqual(["f", "a", "b", "c", "d"]);
    expect(mergeRecent(["a", "b", "c", "d", "e"], "f", 3)).toEqual(["f", "a", "b"]);
  });

  it("پیش‌فرض خالی هم امن است", () => {
    expect(mergeRecent([], "x")).toEqual(["x"]);
  });
});
