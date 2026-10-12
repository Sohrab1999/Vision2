// Task 66 «فرمان‌یاب» — قرارداد موتور خالص جست‌وجوی پالت فرمان.
import { describe, it, expect } from "vitest";
import {
  normalizeFa,
  scoreCommand,
  filterCommands,
  COMMAND_GROUPS,
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
});

describe("COMMAND_GROUPS", () => {
  it("ترتیب ثابت گروه‌ها بدون تکرار", () => {
    expect(new Set(COMMAND_GROUPS).size).toBe(COMMAND_GROUPS.length);
    expect(COMMAND_GROUPS[0]).toBe("ناوبری");
  });
});
