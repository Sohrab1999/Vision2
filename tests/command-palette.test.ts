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

// ------------------------------------------------------------------
// Task 69 — فرمان‌های پارامتری: «آزمون ۲۰» → آزمون جامع ۲۰ سؤالی
// ------------------------------------------------------------------
import {
  PARAM_SPECS,
  parseQueryNumber,
  snapToValues,
  expandParameterized,
  commandFromParamId,
} from "@/lib/command-palette";
import { readCountPrefill, writeCountPrefill, clearCountPrefill } from "@/lib/nav-prefill";

describe("parseQueryNumber", () => {
  it("ارقام لاتین را می‌خواند", () => {
    expect(parseQueryNumber("آزمون 20")).toBe(20);
  });

  it("ارقام فارسی و عربی را هم می‌خواند", () => {
    expect(parseQueryNumber("آزمون ۲۰")).toBe(20);
    expect(parseQueryNumber("كنكور ٢٠")).toBe(20);
  });

  it("عدد چسبیده به واژه را هم می‌گیرد", () => {
    expect(parseQueryNumber("آزمون20")).toBe(20);
  });

  it("نخستین عدد چندعددی را برمی‌دارد", () => {
    expect(parseQueryNumber("هدف ۵ از ۱۰")).toBe(5);
  });

  it("بدون عدد → null", () => {
    expect(parseQueryNumber("آزمون جامع")).toBeNull();
    expect(parseQueryNumber("")).toBeNull();
  });
});

describe("snapToValues", () => {
  const V = [10, 20, 30] as const;

  it("مقدار دقیق سر جایش می‌ماند", () => {
    expect(snapToValues(20, V)).toBe(20);
  });

  it("به نزدیک‌ترین می‌چسبد", () => {
    expect(snapToValues(5, V)).toBe(10);
    expect(snapToValues(24, V)).toBe(20);
    expect(snapToValues(28, V)).toBe(30);
  });

  it("تساوی فاصله → پایین‌تر", () => {
    expect(snapToValues(15, V)).toBe(10);
    expect(snapToValues(25, V)).toBe(20);
  });

  it("خارج از بازه هم می‌چسبد (کاربر همیشه نتیجه می‌گیرد)", () => {
    expect(snapToValues(200, V)).toBe(30);
    expect(snapToValues(1, V)).toBe(10);
  });
});

describe("expandParameterized", () => {
  it("«آزمون ۲۰» دقیقاً یک فرمان آزمون می‌سازد", () => {
    const out = expandParameterized("آزمون ۲۰");
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("exam-count-20");
    expect(out[0]!.label).toBe("آزمون جامع ۲۰ سؤالی");
    expect(out[0]!.group).toBe("تمرین و چالش");
  });

  it("«کنکور ۳۰» و «شبیه‌ساز ۱۰» هر دو شبیه‌ساز می‌دهند", () => {
    expect(expandParameterized("کنکور ۳۰")[0]!.id).toBe("konkur-count-30");
    expect(expandParameterized("شبیه‌ساز 10")[0]!.id).toBe("konkur-count-10");
  });

  it("«هدف روزانه ۱۵» فرمان فوری هدف می‌دهد", () => {
    const out = expandParameterized("هدف روزانه ۱۵");
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("daily-goal-15");
    expect(out[0]!.group).toBe("ابزارها");
  });

  it("بدون عدد یا بدون ماشه خالی است", () => {
    expect(expandParameterized("آزمون جامع")).toEqual([]);
    expect(expandParameterized("درس ۲")).toEqual([]); // «درس» ماشه نیست
    expect(expandParameterized("۲۰")).toEqual([]); // عدد تنها، بدون ماشه
    expect(expandParameterized("")).toEqual([]);
  });

  it("عدد خارج از مقادیر به نزدیک‌ترین می‌چسبد", () => {
    expect(expandParameterized("آزمون 25")[0]!.id).toBe("exam-count-20");
    expect(expandParameterized("آزمون ۲۰۰")[0]!.id).toBe("exam-count-30");
    expect(expandParameterized("هدف 12")[0]!.id).toBe("daily-goal-10");
  });

  it("ماشهٔ لاتین هم کار می‌کند", () => {
    expect(expandParameterized("exam 20")[0]!.id).toBe("exam-count-20");
    expect(expandParameterized("goal 5")[0]!.id).toBe("daily-goal-5");
  });

  it("خروجی برای همان پرس‌وجو با امتیازدهی استاندارد پیدا می‌شود", () => {
    const out = expandParameterized("آزمون ۲۰");
    expect(scoreCommand("آزمون ۲۰", out[0]!)).toBeGreaterThan(0);
    // در فیلتر استاندارد روی نمونهٔ پایه هم بالا می‌آید
    const filtered = filterCommands([...cmds, ...out], "آزمون ۲۰", 5);
    expect(filtered[0]!.id).toBe("exam-count-20");
  });

  it("حافظهٔ ماشه‌ها سالم است: هر spec مقادیر صعودی و کلید یکتا دارد", () => {
    const keys = new Set(PARAM_SPECS.map((s) => s.key));
    expect(keys.size).toBe(PARAM_SPECS.length);
    for (const s of PARAM_SPECS) {
      expect(s.values.length).toBeGreaterThan(0);
      expect([...s.values]).toEqual([...s.values].sort((a, b) => a - b));
      expect(s.triggers.length).toBeGreaterThan(0);
    }
  });
});

describe("commandFromParamId — احیای «اخیر»", () => {
  it("شناسهٔ معتبر را به فرمان کامل بازمی‌گرداند (گردش کامل با گسترش)", () => {
    const built = expandParameterized("آزمون ۲۰")[0]!;
    const revived = commandFromParamId(built.id);
    expect(revived).not.toBeNull();
    expect(revived!.id).toBe("exam-count-20");
    expect(revived!.label).toBe(built.label);
    expect(revived!.group).toBe(built.group);
    expect(commandFromParamId("konkur-count-10")!.label).toBe("شبیه‌ساز کنکور ۱۰ تستی");
    expect(commandFromParamId("daily-goal-15")!.label).toBe("هدف روزانه: ۱۵ فعالیت");
  });

  it("شناسهٔ ناشناخته/نامعتبر → null", () => {
    expect(commandFromParamId("exam-count-77")).toBeNull(); // عدد خارج از مقادیر
    expect(commandFromParamId("exam-count")).toBeNull(); // بدون عدد
    expect(commandFromParamId("nav-home")).toBeNull(); // فرمان عادی
    expect(commandFromParamId("ltab-1-vocab")).toBeNull(); // قلمروِ تجزیه‌گر دیگر
    expect(commandFromParamId("")).toBeNull();
  });
});

describe("nav-prefill — پل sessionStorage", () => {
  // محیط node است — window ساختگی با sessionStorage درون‌حافظه‌ای
  const mem = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    sessionStorage: {
      getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
      setItem: (k: string, v: string) => void mem.set(k, String(v)),
      removeItem: (k: string) => void mem.delete(k),
    },
  };

  it("می‌نویسد و می‌خواند؛ بعد از پاک‌کردن null می‌دهد", () => {
    writeCountPrefill("t-key", 20);
    expect(readCountPrefill("t-key", [10, 20, 30])).toBe(20);
    clearCountPrefill("t-key");
    expect(readCountPrefill("t-key", [10, 20, 30])).toBeNull();
  });

  it("مقدار خارج از مقادیر مجاز را رد می‌کند (دفاعی)", () => {
    writeCountPrefill("t-key2", 77);
    expect(readCountPrefill("t-key2", [10, 20, 30])).toBeNull();
    expect(readCountPrefill("t-key3", [10, 20, 30])).toBeNull(); // کلید غایب
  });
});

// ------------------------------------------------------------------
// Task 71 — صفت زمان: «آزمون ۲۰ بدون زمان» / «کنکور ۳۰ با زمان»
// ------------------------------------------------------------------
import { parseQueryTiming, parseParamCommandId, TIMING_LABEL } from "@/lib/command-palette";
import { readFlagPrefill, writeFlagPrefill, clearFlagPrefill } from "@/lib/nav-prefill";

describe("parseQueryTiming", () => {
  it("«بدون زمان» فاصله‌دار را می‌گیرد", () => {
    expect(parseQueryTiming("آزمون ۲۰ بدون زمان")).toBe("untimed");
  });

  it("شکل چسبیده (حذف نیم‌فاصله) را هم می‌گیرد", () => {
    expect(parseQueryTiming("آزمون ۲۰ بی‌زمان")).toBe("untimed");
    expect(parseQueryTiming("کنکور ۱۰ بی‌تایم")).toBe("untimed");
    expect(parseQueryTiming("آزمون ۱۰ بدون‌تایمر")).toBe("untimed");
  });

  it("«بدون تایمر» و ماشه‌های لاتین", () => {
    expect(parseQueryTiming("آزمون ۱۰ بدون تایمر")).toBe("untimed");
    expect(parseQueryTiming("exam 20 untimed")).toBe("untimed");
    expect(parseQueryTiming("exam 20 no timer")).toBe("untimed");
  });

  it("ماشه‌های با-زمان", () => {
    expect(parseQueryTiming("کنکور ۳۰ با زمان")).toBe("timed");
    expect(parseQueryTiming("آزمون ۱۰ تایم‌دار")).toBe("timed");
    expect(parseQueryTiming("konkur 20 timed")).toBe("timed");
  });

  it("بدون صفت → null", () => {
    expect(parseQueryTiming("آزمون ۲۰")).toBeNull();
    expect(parseQueryTiming("هدف روزانه ۱۵")).toBeNull();
    expect(parseQueryTiming("")).toBeNull();
  });

  it("مرزواژه: «بدون زماندار» به «بدون زمان» نمی‌خوابد", () => {
    expect(parseQueryTiming("آزمون بدون زماندار")).toBeNull();
  });
});

describe("expandParameterized — صفت زمان", () => {
  it("«آزمون ۲۰ بدون زمان» فقط یک فرمان بی‌زمان می‌دهد", () => {
    const out = expandParameterized("آزمون ۲۰ بدون زمان");
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("exam-count-20-untimed");
    expect(out[0]!.label).toBe("آزمون جامع ۲۰ سؤالی، بدون زمان");
    expect(out[0]!.hint).toContain("تایمر خاموش");
  });

  it("«کنکور ۳۰ با زمان» صفت timed می‌دهد", () => {
    const out = expandParameterized("کنکور ۳۰ با زمان");
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("konkur-count-30-timed");
    expect(out[0]!.hint).toContain("تایمر روشن");
  });

  it("«آزمون ۲۰» بدون صفت، بدون پسوند سر جایش (رفت‌برگشت Task 69)", () => {
    expect(expandParameterized("آزمون ۲۰")[0]!.id).toBe("exam-count-20");
    expect(expandParameterized("شبیه‌ساز 10")[0]!.id).toBe("konkur-count-10");
    expect(expandParameterized("هدف 12")[0]!.id).toBe("daily-goal-10");
  });

  it("صفت برای خانوادهٔ بی‌زمان نادیده گرفته می‌شود (هدف فوری می‌ماند)", () => {
    const out = expandParameterized("هدف روزانه ۱۵ بدون زمان");
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe("daily-goal-15");
  });

  it("صفت بدون عدد → پیش‌فرض کوچک‌ترین مقدار مجاز", () => {
    expect(expandParameterized("آزمون بدون زمان")[0]!.id).toBe("exam-count-10-untimed");
    expect(expandParameterized("کنکور تایم‌دار")[0]!.id).toBe("konkur-count-10-timed");
    // خانوادهٔ بی‌زمان بدون عدد همچنان هیچ — «هدف بدون زمان» بی‌معناست
    expect(expandParameterized("هدف بدون زمان")).toEqual([]);
  });

  it("عدد خارج از مقادیر با صفت هم می‌چسبد", () => {
    expect(expandParameterized("آزمون ۲۰۰ بدون زمان")[0]!.id).toBe("exam-count-30-untimed");
  });

  it("خروجی صفت‌دار با امتیازدهی استاندارد هم پیدا و صدرنشین است", () => {
    const out = expandParameterized("آزمون ۲۰ بدون زمان");
    expect(scoreCommand("آزمون ۲۰ بدون زمان", out[0]!)).toBeGreaterThan(0);
    const filtered = filterCommands(
      [...out, { id: "exam-count-20", label: "آزمون جامع ۲۰ سؤالی", group: "تمرین و چالش" }],
      "آزمون ۲۰ بدون زمان",
      5
    );
    expect(filtered[0]!.id).toBe("exam-count-20-untimed");
  });
});

describe("parseParamCommandId", () => {
  it("شناسهٔ خالی و صفت‌دار را می‌پارسد", () => {
    expect(parseParamCommandId("exam-count-20")!.timing).toBeNull();
    expect(parseParamCommandId("exam-count-20")!.n).toBe(20);
    expect(parseParamCommandId("exam-count-20-untimed")!.timing).toBe("untimed");
    expect(parseParamCommandId("konkur-count-30-timed")!.timing).toBe("timed");
    expect(parseParamCommandId("exam-count-20-untimed")!.spec.key).toBe("exam-count");
  });

  it("پسوند ناشناخته و صفت روی خانوادهٔ بی‌زمان → null", () => {
    expect(parseParamCommandId("exam-count-20-bogus")).toBeNull();
    expect(parseParamCommandId("daily-goal-15-untimed")).toBeNull();
    expect(parseParamCommandId("exam-count-77-untimed")).toBeNull();
  });

  it("بازسازی «اخیر» برچسب صفت‌دار را زنده می‌کند", () => {
    expect(commandFromParamId("exam-count-20-untimed")!.label).toBe("آزمون جامع ۲۰ سؤالی، بدون زمان");
    expect(commandFromParamId("konkur-count-30-timed")!.label).toBe("شبیه‌ساز کنکور ۳۰ تستی، با زمان");
    expect(commandFromParamId("exam-count-20")!.label).toBe("آزمون جامع ۲۰ سؤالی");
    expect(commandFromParamId("exam-count-20-x")).toBeNull();
  });

  it("نگهبان: فقط آزمون و کنکور صفت زمان دارند و برچسب‌ها قراردادی‌اند", () => {
    for (const s of PARAM_SPECS) {
      if (s.supportsTiming) expect(["exam-count", "konkur-count"]).toContain(s.key);
      // خانواده‌های بی‌زمان: هدفِ فوری + تمرین هوشمند (ذاتاً بی‌تایمر — Task 74)
      else expect(["daily-goal", "smart-count"]).toContain(s.key);
    }
    expect(TIMING_LABEL.untimed).toBe("بدون زمان");
    expect(TIMING_LABEL.timed).toBe("با زمان");
  });
});

describe("nav-prefill — پرچم زمان (Task 71)", () => {
  it("بولی می‌نویسد و می‌خواند؛ پاک‌کردن → null", () => {
    writeFlagPrefill("t-flag", false);
    expect(readFlagPrefill("t-flag")).toBe(false);
    writeFlagPrefill("t-flag", true);
    expect(readFlagPrefill("t-flag")).toBe(true);
    clearFlagPrefill("t-flag");
    expect(readFlagPrefill("t-flag")).toBeNull();
    expect(readFlagPrefill("t-flag-missing")).toBeNull();
  });
});

// ------------------------------------------------------------------
// Task 72 — باگ snap در فیلتر استاندارد: گسترشِ اسنپ‌شده («آزمون ۱۵»
// → برچسب «۱۰ سؤالی») توکن «۱۵» را در متن نداشت و فیلتر AND حذفش می‌کرد.
// این describe ترکیبِ گسترش+فیلتر را قفل می‌کند — چاه نابینای تستِ راند ۶۹/۷۱.
// ------------------------------------------------------------------
describe("snap در فیلتر استاندارد — ترکیب گسترش+فیلتر (باگ راند ۷۲)", () => {
  it("«آزمون ۱۵» پس از snap به ۱۰ در فیلتر AND دیده می‌شود (رتبهٔ ۱)", () => {
    const expanded = expandParameterized("آزمون ۱۵");
    expect(expanded).toHaveLength(1);
    expect(expanded[0]!.id).toBe("exam-count-10");
    const hits = filterCommands(expanded, "آزمون ۱۵");
    expect(hits).toHaveLength(1);
    expect(hits[0]!.id).toBe("exam-count-10");
  });

  it("«هدف ۱۲» snap به ۱۰ و قابل‌یافتن در فیلتر", () => {
    const expanded = expandParameterized("هدف ۱۲");
    expect(expanded[0]!.id).toBe("daily-goal-10");
    expect(filterCommands(expanded, "هدف ۱۲")[0]!.id).toBe("daily-goal-10");
  });

  it("«کنکور ۲۵ بدون زمان» — snap (تساوی ۲۵→۲۰) + صفت هم‌زمان", () => {
    const expanded = expandParameterized("کنکور ۲۵ بدون زمان");
    expect(expanded[0]!.id).toBe("konkur-count-20-untimed");
    expect(filterCommands(expanded, "کنکور ۲۵ بدون زمان")[0]!.id).toBe("konkur-count-20-untimed");
  });

  it("نوار اعداد پراکنده — «کاربر همیشه نتیجه می‌گیرد» در فیلتر واقعی", () => {
    for (const n of [3, 7, 12, 15, 18, 25, 50, 99, 200]) {
      const q = `آزمون ${faDigits(n)}`;
      const expanded = expandParameterized(q);
      expect(expanded).toHaveLength(1);
      const hits = filterCommands(expanded, q);
      expect(hits[0]?.id).toBe(expanded[0]!.id);
      expect(hits[0]!.id).toMatch(/^exam-count-(10|20|30)$/);
    }
  });

  it("کلیدواژهٔ عدد خام به شناسهٔ دیسپچ نمی‌چسبد — قرارداد شناسه دست‌نخورده", () => {
    const expanded = expandParameterized("آزمون ۱۵");
    expect(expanded[0]!.id).toBe("exam-count-10");
    expect(expanded[0]!.keywords).toContain("15");
    expect(parseParamCommandId(expanded[0]!.id)?.n).toBe(10);
    // احیای «اخیر» با همان شناسهٔ canonical بدون کلیدواژهٔ خام کار می‌کند
    expect(commandFromParamId(expanded[0]!.id)?.label).toContain(faDigits(10));
  });

  it("مقدار دقیق بدون کلیدواژهٔ اضافه — کلیدواژه‌ها همان قرارداد قبلی", () => {
    const expanded = expandParameterized("آزمون ۲۰");
    expect(expanded[0]!.keywords).not.toContain("20"); // rawN === n → اضافه نمی‌شود
    expect(filterCommands(expanded, "آزمون ۲۰")[0]!.id).toBe("exam-count-20");
  });
});

// ------------------------------------------------------------------
// Task 74 — خانوادهٔ چهارم «تمرین هوشمند N» + فیکس صفتِ نادیده‌شده:
// صفتِ زمان روی خانوادهٔ بی‌زمان («هدف ۱۵ بدون زمان») گسترش می‌شد اما
 // توکن‌های «بدون/زمان» در فیلتر AND جایی نمی‌خوابیدند و نتیجهٔ فوری
// حذف می‌شد — هم‌الگوی باگ راند ۷۲ (این‌بار برای صفت، نه عدد).
// ------------------------------------------------------------------
describe("تمرین هوشمند پارامتری + صفت نادیده‌شده (Task 74)", () => {
  it("«تمرین هوشمند ۱۵» دقیقاً یک فرمان می‌دهد و در فیلتر واقعی صدرنشین است", () => {
    const expanded = expandParameterized("تمرین هوشمند ۱۵");
    expect(expanded).toHaveLength(1);
    expect(expanded[0]!.id).toBe("smart-count-15");
    expect(expanded[0]!.label).toBe("تمرین هوشمند ۱۵ سؤالی");
    expect(expanded[0]!.group).toBe("تمرین و چالش");
    expect(filterCommands([...cmds, ...expanded], "تمرین هوشمند ۱۵", 5)[0]!.id).toBe("smart-count-15");
  });

  it("snap با مقادیر [۱۰/۱۵/۲۰] نما هم‌خوان است و در فیلتر پیدا می‌شود", () => {
    // ۱۲ → ۱۰ (فاصلهٔ ۲ در برابر ۳)؛ ۱۷ → ۱۵؛ ۱۸ → ۲۰
    for (const [typed, expected] of [
      ["۱۲", 10],
      ["۱۷", 15],
      ["۱۸", 20],
    ] as const) {
      const q = `تمرین هوشمند ${typed}`;
      const expanded = expandParameterized(q);
      expect(expanded[0]!.id).toBe(`smart-count-${expected}`);
      expect(filterCommands(expanded, q)[0]!.id).toBe(`smart-count-${expected}`);
    }
  });

  it("ماشهٔ تنک («تمرین ۲۰») و لاتین («smart 20») هم کار می‌کند", () => {
    expect(expandParameterized("تمرین ۲۰")[0]!.id).toBe("smart-count-20");
    expect(expandParameterized("smart 20")[0]!.id).toBe("smart-count-20");
    // مقدار دقیق → کلیدواژهٔ عدد خام اضافه نمی‌شود
    expect(expandParameterized("تمرین ۲۰")[0]!.keywords).not.toContain("20");
  });

  it("ماشهٔ بدون عدد خالی است — nav-smart مستقل سر جایش", () => {
    expect(expandParameterized("تمرین هوشمند")).toEqual([]);
    expect(expandParameterized("تمرین")).toEqual([]);
    expect(expandParameterized("هوشمند")).toEqual([]);
  });

  it("قرارداد شناسه: بدون پسوند صفت؛ پارسر و احیای «اخیر» سالم", () => {
    const p = parseParamCommandId("smart-count-15");
    expect(p!.n).toBe(15);
    expect(p!.timing).toBeNull();
    expect(p!.spec.key).toBe("smart-count");
    expect(parseParamCommandId("smart-count-15-untimed")).toBeNull(); // بی‌تایمر ذاتی
    expect(parseParamCommandId("smart-count-77")).toBeNull();
    expect(commandFromParamId("smart-count-15")!.label).toBe("تمرین هوشمند ۱۵ سؤالی");
    expect(commandFromParamId("smart-count-20")!.hint).toContain("بدون تایمر");
  });

  it("فیکس صفت نادیده‌شده: «هدف ۱۵ بدون زمان» در فیلتر واقعی حذف نمی‌شود", () => {
    const expanded = expandParameterized("هدف ۱۵ بدون زمان");
    expect(expanded).toHaveLength(1);
    expect(expanded[0]!.id).toBe("daily-goal-15"); // بدون پسوند — خانوادهٔ بی‌زمان
    expect(expanded[0]!.keywords).toContain("بدون زمان"); // صفت فقط کلیدواژه
    expect(filterCommands(expanded, "هدف ۱۵ بدون زمان")).toHaveLength(1);
    expect(filterCommands(expanded, "هدف ۱۵ بدون زمان")[0]!.id).toBe("daily-goal-15");
  });

  it("فیکس صفت نادیده‌شده: «تمرین هوشمند ۱۵ بدون تایمر» و «۱۲ با زمان» هر دو می‌آیند", () => {
    const untimed = expandParameterized("تمرین هوشمند ۱۵ بدون تایمر");
    expect(untimed[0]!.id).toBe("smart-count-15");
    expect(untimed[0]!.keywords).toContain("بدون زمان");
    expect(filterCommands(untimed, "تمرین هوشمند ۱۵ بدون تایمر")[0]!.id).toBe("smart-count-15");

    const timed = expandParameterized("تمرین هوشمند ۱۲ با زمان");
    expect(timed[0]!.id).toBe("smart-count-10"); // snap + صفت نادیده
    expect(timed[0]!.keywords).toContain("با زمان");
    expect(filterCommands(timed, "تمرین هوشمند ۱۲ با زمان")[0]!.id).toBe("smart-count-10");
  });

  it("جدا‌سازی: «تمرین دیکته ۵» گسترش ماشه‌ای دارد اما در فیلتر AND حذف می‌شود", () => {
    // نیت کاربر دیکته است نه تمرین هوشمند — نتیجهٔ کاذب پارامتری ممنوع
    const expanded = expandParameterized("تمرین دیکته ۵");
    expect(expanded[0]!.id).toBe("smart-count-10"); // گسترش ماشه‌محور است
    expect(filterCommands(expanded, "تمرین دیکته ۵")).toHaveLength(0);
  });
});
