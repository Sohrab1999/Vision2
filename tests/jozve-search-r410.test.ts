import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  buildHighlightRegex,
  makeSnippet,
  normSearchText,
  scoreHaystack,
  searchTerms,
} from "@/lib/jozve-search";
import {
  jozveSearchCorpusSize,
  searchJozve,
} from "@/lib/jozve-search.server";
import { jozveSearchQuerySchema } from "@/lib/api/validate";

// ------------------------------------------------------------------
// پیمان‌های r410 — «جست‌وجو در کتاب‌ها» (موتور خالص + کورپوس واقعی + سیم).
// ------------------------------------------------------------------

describe("normSearchText — هم‌ارزهای نویسه‌ای", () => {
  it("ی/ك/أ/آ عربی به فارسیِ پایه می‌رسند", () => {
    expect(normSearchText("يادگيري كامل")).toBe("یادگیری کامل");
    expect(normSearchText("أَحمد آقای ابراهیم")).toBe("احمد اقای ابراهیم");
  });

  it("ارقام فارسی/عربی به لاتین می‌رسند", () => {
    expect(normSearchText("درس ۲")).toBe("درس 2");
    expect(normSearchText("١٢٣")).toBe("123");
  });

  it("نیم‌فاصله و نویسه‌های جهت حذف می‌شوند", () => {
    expect(normSearchText("نیم\u200cفاصله")).toBe("نیمفاصله");
  });

  it("اعراب و کشیده حذف می‌شوند", () => {
    expect(normSearchText("حَــالِ کَامِل")).toBe("حال کامل");
  });
});

describe("searchTerms — تقسیمِ پرس‌وجو", () => {
  it("واژه‌های کوتاه‌تر از ۲ نویسه حذف و سقفِ ۸ جمله رعایت می‌شود", () => {
    expect(searchTerms("a من library")).toEqual(["من", "library"]);
    expect(searchTerms("واحد دو سه چهار پنج شش هفت هشت نه ده")).toHaveLength(8);
  });

  it("پرس‌وجوی نقطه‌گذاریِ خالص خالی است", () => {
    expect(searchTerms("؟ ! ،")).toEqual([]);
  });
});

describe("scoreHaystack — AND سخت و امتیاز", () => {
  it("با یک جملهٔ غایب null می‌دهد (حذفِ رکورد)", () => {
    expect(scoreHaystack("حال کامل است", "", ["حال", "گذشته"], "")).toBeNull();
  });

  it("عبارتِ کامل بیشتر از جملاتِ پراکنده امتیاز دارد", () => {
    const scattered = scoreHaystack("حالی کامل است", "", ["حال", "کامل"], "حال کامل") ?? -1;
    expect(scattered).toBeGreaterThanOrEqual(0);
    const phrase = scoreHaystack("زمان حال کامل است", "", ["حال", "کامل"], "حال کامل") ?? 0;
    expect(phrase).toBeGreaterThan(scattered);
  });

  it("جمله در عنوان، امتیازِ اضافه می‌دهد (جمله باید در متن هم باشد تا رکورد بماند)", () => {
    const withTitle = scoreHaystack("درس گرامر", "گرامر حال کامل", ["گرامر"], "");
    const withoutTitle = scoreHaystack("درس گرامر", "", ["گرامر"], "");
    expect(withTitle).not.toBeNull();
    expect(withoutTitle).not.toBeNull();
    expect(withTitle!).toBeGreaterThan(withoutTitle!);
  });
});

describe("buildHighlightRegex / makeSnippet — هایلایتِ هم‌ارز روی متن خام", () => {
  it("ی/ي و ک/ك و آ/ا در متنِ خام هم شیده می‌شوند", () => {
    const re = buildHighlightRegex(["یادگیری"]);
    expect(re).not.toBeNull();
    expect("یادگيري کلمه".match(re!)).not.toBeNull();
    expect("یادگیری".match(buildHighlightRegex(["یادگیرى"])!)).not.toBeNull();
  });

  it("نیم‌فاصلهٔ متنِ خام با پرس‌وجوی جداشده می‌نشیند (زنجیرهٔ \u200c? اختیاری)", () => {
    // «حال کامل» — جمله‌ها جدا هستند؛ هر جمله جداگانه هایلایت می‌شود
    const re = buildHighlightRegex(["کامل"]);
    expect("حال کامل".match(re!)).toEqual(["کامل"]);
    const reZwnj = buildHighlightRegex(["نیمفاصله"]);
    expect("نیم\u200cفاصله".match(reZwnj!)).not.toBeNull();
  });

  it("makeSnippet برشِ زمینه می‌سازد و بدونِ نشست برشِ ساده می‌دهد", () => {
    const long = "x".repeat(200) + " گرامر حال کامل " + "y".repeat(200);
    const snip = makeSnippet(long, ["کامل"]);
    expect(snip).toContain("حال کامل");
    expect(snip.length).toBeLessThan(200);
    const plain = makeSnippet("بدونِ هیچ تطبیقی اینجا", ["کامل"]);
    expect(plain.startsWith("بدونِ هیچ")).toBe(true);
  });
});

describe("کورپوسِ واقعی — jozve-search.server", () => {
  const size = jozveSearchCorpusSize();

  it("هر ۶ کتاب و ۶٬۲۲۲ سؤالِ جزوه ایندکس شده‌اند (r411: + ۱٬۶۷۴ باندل در فایلِ پیمانِ خودش)", () => {
    expect(size.text).toBeGreaterThan(30_000);
    // r411 — سؤالِ جزوه (۶٬۲۲۲) + باندل (۱٬۶۷۴) = ۷٬۸۹۶؛ سهمِ جزوه‌ای پین می‌ماند
    expect(size.question).toBeGreaterThanOrEqual(7_896);
  });

  it("«حال کامل» از چند کتاب نتیجه می‌دهد (پراکنده‌سازیِ میانِ اسناد)", () => {
    const r = searchJozve("حال کامل", { limit: 12 });
    expect(r.total).toBeGreaterThan(20);
    const docs = new Set(r.results.map((x) => x.doc));
    expect(docs.size).toBeGreaterThanOrEqual(3);
    // متنوع‌سازی: هیچ سندی بیش از نیمی از فهرست را نگرفته
    const counts = new Map<string, number>();
    for (const x of r.results) counts.set(x.doc, (counts.get(x.doc) ?? 0) + 1);
    expect(Math.max(...counts.values())).toBeLessThanOrEqual(6);
  });

  it("«passive» سؤالِ بانک هم می‌آورد با شناسه و کلیدِ معتبر", () => {
    const r = searchJozve("passive", { limit: 12, kind: "question" });
    expect(r.results.length).toBeGreaterThan(0);
    for (const x of r.results) {
      expect(x.kind).toBe("question");
      expect(x.questionId).toBeTruthy();
      expect(x.options?.length).toBeGreaterThan(1);
      expect(x.answer ?? -1).toBeLessThan(x.options!.length);
    }
  });

  it("فیلترِ پایه فقط همان کتاب را می‌دهد", () => {
    const r = searchJozve("حال کامل", { limit: 20, grade: 11 });
    expect(r.results.length).toBeGreaterThan(0);
    for (const x of r.results) expect(x.grade).toBe(11);
  });

  it("AND سخت: هر نتیجه هر دو جمله را دارد", () => {
    const r = searchJozve("آزمون نهایی", { limit: 10 });
    for (const x of r.results) {
      const hay = normSearchText(`${x.text} ${x.bankTitle ?? x.chapterTitle ?? ""} ${x.snippet}`);
      expect(hay.includes(normSearchText("آزمون"))).toBe(true);
      expect(hay.includes(normSearchText("نهایی"))).toBe(true);
    }
  });

  it("جمله‌بندیِ نیم‌فاصله‌ایِ متنِ خام با پرس‌وجوی جداشده می‌نشیند (نرمال‌سازیِ موتور)", () => {
    // یک رکوردِ واقعیِ نیم‌فاصله‌دار از جزوهٔ یازدهم پیدا کن
    const r = searchJozve("شگفت انگیز", { limit: 5 });
    expect(r.results.length).toBeGreaterThan(0);
  });

  it("سیمِ پرس‌وجوی کوتاه را می‌رد و سقفِ limit را رعایت می‌کند", () => {
    expect(searchJozve("ح", {}).total).toBe(0);
    const r = searchJozve("حال کامل", { limit: 5 });
    expect(r.results.length).toBeLessThanOrEqual(5);
  });
});

describe("jozveSearchQuerySchema — قراردادِ سیم", () => {
  it("پرس‌وجوی کوتاه‌تر از ۲ نویسه رد می‌شود", () => {
    expect(jozveSearchQuerySchema.safeParse({ q: "ح" }).success).toBe(false);
  });

  it("پایه و نوع و سقف coerce می‌شوند و خارج از بازه رد می‌شوند", () => {
    const ok = jozveSearchQuerySchema.safeParse({ q: "حال کامل", grade: "11", kind: "text", limit: "12" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.grade).toBe(11);
      expect(ok.data.limit).toBe(12);
    }
    expect(jozveSearchQuerySchema.safeParse({ q: "حال کامل", grade: 6 }).success).toBe(false);
    expect(jozveSearchQuerySchema.safeParse({ q: "حال کامل", kind: "audio" }).success).toBe(false);
    expect(jozveSearchQuerySchema.safeParse({ q: "حال کامل", limit: 99 }).success).toBe(false);
  });
});

describe("گاردِ client-safe — موتورِ خالص بدون node:fs", () => {
  it("lib/jozve-search.ts هیچ importِ node:fs یا fetch ندارد (کامنت‌ها بی‌طرف)", () => {
    const src = readFileSync(path.join(process.cwd(), "src/lib/jozve-search.ts"), "utf8");
    // فقط خط‌های import — اشارهٔ متنی در کامنت، وابستگی نیست
    const imports = src
      .split("\n")
      .filter((l) => l.trim().startsWith("import "))
      .join("\n");
    expect(imports).not.toContain("node:fs");
    expect(imports).not.toContain("readFileSync");
    expect(imports).not.toContain("fetch");
    expect(imports.trim()).toBe(""); // ماژول خالص — هیچ importی ندارد
  });
});
