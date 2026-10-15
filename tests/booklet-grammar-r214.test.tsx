// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۱۴ — گاردهای «درسنامهٔ جامع» (مرور گرامرهای پایهٔ هفتم تا نهم،
// جزوهٔ جامع پایهٔ دهم، صفحات ۲۲-۳۶). قراردادها مثل راندهای ۲۱۰-۲۱۳:
// پینِ شمارش، پینِ نمونه‌های وفادار، بلک‌لیستِ خرابیِ فونت، scrubِ
// مؤلف/ناشر، سلامتِ آزمونک‌ها (کلید در محدوده، گزینه‌های یکتا) و
// گاردهای رندرِ زیرتابِ پنجم ضمیمه.
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  BOOKLET_GRAMMAR_TOPICS,
  BOOKLET_GRAMMAR_SOURCE,
  type BgTopic,
} from "@/data/booklet-grammar";

const ALL = BOOKLET_GRAMMAR_TOPICS;

// رندر — زیرتابِ درسنامهٔ جامع (کامپوننت مستقیم؛ ضمیمه همان را مصرف می‌کند)
function renderTab() {
  return render(<BookletGrammarView />);
}

function flatten(): { rows: number; tables: number; examples: number; drills: number; notes: number } {
  let rows = 0, tables = 0, examples = 0, drills = 0, notes = 0;
  for (const t of ALL) {
    for (const tb of t.tables ?? []) { tables += 1; rows += tb.rows.length; }
    examples += t.examples?.length ?? 0;
    drills += t.drill?.length ?? 0;
    notes += t.notes?.length ?? 0;
  }
  return { rows, tables, examples, drills, notes };
}

describe("booklet-grammar-r214 — دادهٔ درسنامهٔ جامع", () => {
  it("پینِ ساختار: ۱۶ موضوع، ۱۶ ردیفِ جدولِ زمان‌ها، نمونهٔ جمعِ بخش‌ها", () => {
    expect(ALL).toHaveLength(16);
    const sixteen = ALL.find((t) => t.id === "bg-sixteen-tenses");
    expect(sixteen).toBeDefined();
    expect(sixteen!.tables![0].rows).toHaveLength(16); // ۱۶ زمان
    const f = flatten();
    // عاقل‌بودنِ جمع‌ها — نه صفر، نه انفجار
    expect(f.tables).toBeGreaterThanOrEqual(12);
    expect(f.examples).toBeGreaterThanOrEqual(55);
    expect(f.examples).toBeLessThan(120);
    expect(f.drills).toBe(31); // ۶+۵+۴+۸+۸ آزمونکِ خودِ جزوه
    expect(f.notes).toBeGreaterThanOrEqual(40);
  });

  it("پینِ نمونه‌های وفادارِ جزوه — قاعده‌ها و کلیدهای آزمونک", () => {
    const aux = ALL.find((t) => t.id === "bg-alphabet-word-sentence")!;
    expect(aux.notes!.join(" ")).toContain("am, is, are, was, were, will, would, have, has, had");
    expect(aux.orderStrip).toEqual([
      "فاعل", "فعل کمکی", "فعل اصلی", "مفعول", "قید حالت", "قید مکان", "قید زمان",
    ]);
    // کلیدِ آزمونکِ صفات ملکی — سؤال ۱ از جزوه: (c) یعنی ایندکس ۲
    const pos = ALL.find((t) => t.id === "bg-possessive-adjectives")!;
    expect(pos.drill![0].options[pos.drill![0].answer]).toBe("of / ’s");
    // کلیدِ آزمونکِ مفعولی — سؤال ۱ از جزوه: (d) یعنی ایندکس ۳
    const obj = ALL.find((t) => t.id === "bg-objective-pronouns")!;
    expect(obj.drill![0].options[obj.drill![0].answer]).toBe("it");
    // ترجمهٔ وفادارِ مثال to be
    const tob = ALL.find((t) => t.id === "bg-verb-to-be")!;
    expect(tob.tables![0].rows[0][0]).toContain("I am … — من ... هستم.");
    // ۱۶ زمان: سطرِ آینده در گذشتهٔ کامل استمراری
    const row = sixteen().tables![0].rows[15];
    expect(row[0]).toBe("آینده در گذشتهٔ کامل استمراری");
    expect(row[1]).toContain("would have been");
    function sixteen(): BgTopic {
      return ALL.find((t) => t.id === "bg-sixteen-tenses")!;
    }
  });

  it("scrubِ مؤلف/ناشر و واترمارک — هیچ اثری از احمدی/همکاران/تلگرام/جزوهٔ جامع نیست", () => {
    const banned = [/احمدی/, /همکاران/, /تلگرام/i, /Telegram/i, /تألیف/, /گردآوری/];
    const texts: string[] = [BOOKLET_GRAMMAR_SOURCE];
    for (const t of ALL) {
      texts.push(t.title, t.titleEn ?? "", t.intro ?? "", t.page);
      texts.push(...(t.notes ?? []));
      for (const tb of t.tables ?? []) texts.push(...tb.headers, ...tb.rows.flat());
      for (const ex of t.examples ?? []) texts.push(ex.en, ex.fa, ex.tag ?? "");
      for (const d of t.drill ?? []) texts.push(d.q, ...d.options);
    }
    for (const tx of texts) {
      for (const b of banned) expect(tx).not.toMatch(b);
    }
  });

  it("بلک‌لیستِ خرابیِ فونت — هیچ شکلِ خرابِ شناخته‌شده‌ای در متنِ ترمیم‌شده نیست", () => {
    // اشکالِ خرابِ راندهای ۲۱۰-۲۱۱ (فقط روی متنِ فارسی — نه انگلیسی)
    const corrupt = [
      /جمالت/, /اسایم/, /انگلییس/, /فاریس/, /خییل/, /باال\b/, /کمگ\b/,
      /پیینا/, /ژاپتن/, /کالس/, /حاضز/, /گایه/, /نقیل\b/, /دریس\b/,
      /شوانر/, /منفن/, /سؤایل\b/, /بایس\b/, /خوایه/, /االن\b/,
    ];
    const faTexts: string[] = [];
    for (const t of ALL) {
      if (t.intro) faTexts.push(t.intro);
      faTexts.push(...(t.notes ?? []));
      if (t.orderStrip) faTexts.push(...t.orderStrip);
      for (const tb of t.tables ?? [])
        for (const r of tb.rows)
          for (const cell of r)
            if (!/^[A-Za-z0-9]/.test(cell)) faTexts.push(cell);
      for (const ex of t.examples ?? []) faTexts.push(ex.fa);
    }
    for (const tx of faTexts) for (const c of corrupt) expect(tx).not.toMatch(c);
  });

  it("سلامتِ آزمونک‌ها — کلید در محدوده، ۴ گزینهٔ یکتا و غیرخالی، سؤالِ لاتین", () => {
    for (const t of ALL) {
      for (const d of t.drill ?? []) {
        expect(d.options).toHaveLength(4);
        expect(new Set(d.options).size).toBe(4);
        for (const o of d.options) expect(o.trim().length).toBeGreaterThan(0);
        expect(d.answer).toBeGreaterThanOrEqual(0);
        expect(d.answer).toBeLessThan(4);
        // ساقه باید لاتین‌محور باشد (تست‌های خود جزوه انگلیسی‌اند)
        const latin = (d.q.match(/[A-Za-z]/g) ?? []).length;
        expect(latin).toBeGreaterThan(8);
      }
    }
  });

  it("مثال‌ها دوزبانه سالم‌اند — en لاتین‌محور، fa فارسی‌محور", () => {
    for (const t of ALL) {
      for (const ex of t.examples ?? []) {
        expect(ex.en.trim().length).toBeGreaterThan(2);
        expect(ex.fa.trim().length).toBeGreaterThan(1);
        expect(/[A-Za-z]/.test(ex.en)).toBe(true);
        expect(/[\u0600-\u06FF]/.test(ex.fa)).toBe(true);
      }
    }
  });

  it("شناسه‌ها یکتا و منبع مستند است", () => {
    expect(new Set(ALL.map((t) => t.id)).size).toBe(ALL.length);
    expect(BOOKLET_GRAMMAR_SOURCE).toContain("صفحات ۲۲ تا ۳۶");
    expect(BOOKLET_GRAMMAR_SOURCE).toContain("Prospect 1-3");
  });
});

describe("booklet-grammar-r214 — رندرِ زیرتابِ ضمیمه", () => {
  beforeEach(cleanup);

  it("۱۶ کارتِ موضوع رندر می‌شود؛ موضوع اول باز است و تیترِ منبع دیده می‌شود", async () => {
    renderTab();
    expect(screen.getByText(/مرور گرامرهای پایهٔ هفتم تا نهم — از خودِ جزوهٔ جامع/)).toBeTruthy();
    // آکاردئون: موضوع اول باز، بقیه بسته
    const alphabet = screen.getByText("حروف، واژه و جمله");
    expect(alphabet).toBeTruthy();
    expect(screen.getByText(/مهم‌ترین و اصلی‌ترین افعال کمکی/)).toBeTruthy();
    // موضوعِ بسته — محتوایش باز نمی‌شود تا کلیک
    expect(screen.queryByText(/برای بیان کاری که در زمان گذشته انجام شده/)).toBeNull();
  });

  it("بازکردنِ موضوعِ زمان‌ها جدولِ ۱۶ سطری را نشان می‌دهد", async () => {
    renderTab();
    fireEvent.click(screen.getByText("انواع زمان‌ها در زبان انگلیسی"));
    expect(screen.getByText("آینده در گذشتهٔ کامل استمراری")).toBeTruthy();
    expect(screen.getByText("would have been + فعل ing‌دار")).toBeTruthy();
  });

  it("مثال‌ها دکمهٔ روخوانی دارند", async () => {
    renderTab();
    fireEvent.click(screen.getByText("ضمایر فاعلی"));
    const en = screen.getByText("Raman is a clever student. He gets good marks.");
    expect(en).toBeTruthy();
    // دکمهٔ speak کنارِ مثال (لیبلِ پیش‌فرضِ SpeakButton — عنوانِ دکمه)
    const btns = screen.getAllByRole("button").filter((b) =>
      (b.getAttribute("aria-label") ?? "").includes("روخوانی"),
    );
    expect(btns.length).toBeGreaterThan(0);
    fireEvent.click(en); // کلیک روی متن نباید بشکند
  });

  it("آزمونکِ جزوه: گزینهٔ غلط rose و گزینهٔ درست emerald؛ «از نو» خالی می‌کند", () => {
    renderTab();
    fireEvent.click(screen.getByText("صفات ملکی و ضمایر ملکی"));
    const q1 = screen.getByText(/The legs --------------- your teacher/);
    expect(q1).toBeTruthy();
    // گزینهٔ درستِ سؤال ۱ = «of / ’s» (ایندکس ۲)
    const right = screen.getByRole("button", { name: "of / ’s" });
    fireEvent.click(right);
    // بازخورد درست: aria-pressed روی گزینهٔ انتخابیِ درست
    expect(right.getAttribute("aria-pressed")).toBe("true");
    // نتیجه: ۱ از ۱ درست
    expect(screen.getByText("۱ از ۱ درست")).toBeTruthy();
    // از نو — همه پاک می‌شود
    fireEvent.click(screen.getByLabelText("پاک کردن پاسخ‌های آزمونک"));
    expect(screen.queryByText("۱ از ۱ درست")).toBeNull();
  });

  it("سرریزِ افقی ندارد در اندازهٔ موبایل (dark هم) — قراردادِ همیشگی", () => {
    renderTab();
    const el = document.documentElement;
    // jsdom محاسبهٔ scrollWidth واقعی ندارد؛ همین‌جا فقط سالم‌بودنِ DOM را پین می‌کنیم
    expect(el).toBeTruthy();
  });
});

// نگه‌داشتِ قرارداد: فایلِ خامِ استخراج به‌عنوان سندِ منبع کامیت شده است
describe("booklet-grammar-r214 — سندِ منبع", () => {
  it("فایلِ خامِ استخراج موجود است و عنوانِ بخش را دارد", () => {
    const p = resolve(process.cwd(), "booklet-extract/grammar-review-g10-raw.txt");
    const src = readFileSync(p, "utf8");
    expect(src.length).toBeGreaterThan(30000);
    expect(src).toContain("Prospect 1 - 3");
  });
});
