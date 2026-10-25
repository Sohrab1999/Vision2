// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۲ — «تمرین هوشمند» جزئیاتِ راندش را گرفت:
// ① صداقتِ پیامِ نو (lib/smart-practice.ts): در شاخهٔ diagnostic جملهٔ
//    «تازه شروع کرده‌ای؛ یک جلسهٔ سنجشِ ترکیبی می‌سازم…» تقریباً همان
//    جعبهٔ 🌱 نما بود — کاربرِ نو یک پیام را دو بار پشتِ هم می‌خواند.
//    حالا شاخهٔ diagnostic هم دستورِ جلسه را از خودِ parts می‌گوید
//    (تک‌منبعِ زنده) و وعدهٔ سوگیریِ پس از نخستین نتیجه را می‌افزاید —
//    صادق به‌ساخت: بانک خطا و مهارت‌هایِ ضعیف پیشِ پرکننده می‌نشینند.
// ② a11yِ انتخابگرِ طولِ جلسه: گروهِ نام‌دار + aria-pressed (ایدئومِ
//    posGrade ضمیمه) — سه دکمه پیشتر فقط با رنگ انتخاب را اعلام می‌کردند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSmartPlan } from "@/lib/smart-practice";
import { questionIndex } from "@/lib/explain-source";
import { TOTAL_QUESTIONS } from "@/data/lesson-meta";
import { faNum } from "@/lib/study-theme";
import SmartPracticeView from "@/components/study/practice/smart-practice-view";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const DIAG_TAIL = "پس از نخستین نتیجه، جلسه‌ها به سویِ ضعف‌هایِ تو سوگیری می‌گیرند.";

describe("smart practice r272 — ① صداقتِ پیامِ نو در شاخهٔ diagnostic", () => {
  it("کاربرِ نو: reasoning با دستورِ جلسه آغاز می‌شود و وعدهٔ سوگیری دارد — هرگز تکرارِ جعبهٔ 🌱 نیست", () => {
    const plan = buildSmartPlan({ results: {}, mistakes: {}, target: 10 });
    expect(plan.diagnostic).toBe(true);
    expect(plan.reasoning.startsWith("دستور این جلسه:")).toBe(true);
    expect(plan.reasoning).toContain("۱۰ سؤال سنجش از همهٔ درس‌ها");
    expect(plan.reasoning).toContain(DIAG_TAIL);
    // شمارهٔ بانک از تک‌منبعِ زنده می‌آید — هرگز رشتهٔ منجمد
    expect(plan.reasoning).toContain(faNum(TOTAL_QUESTIONS));
    // و جملهٔ قدیمیِ تکرارِ جعبهٔ 🌱 از خروجی رفته است
    expect(plan.reasoning).not.toContain("تازه شروع کرده‌ای");
  });

  it("سه اندازه، سه دستورِ زنده — شمارنده از همان diagCountِ چیپ می‌آید", () => {
    for (const target of [10, 15, 20] as const) {
      const plan = buildSmartPlan({ results: {}, mistakes: {}, target });
      expect(plan.diagnostic).toBe(true);
      expect(plan.pool.length).toBe(target);
      const mix = plan.mix.find((m) => m.label === "سنجش ترکیبی");
      expect(mix?.count).toBe(target);
      expect(plan.reasoning).toContain(`${faNum(target)} سؤال سنجش از همهٔ درس‌ها`);
      expect(plan.reasoning).toContain(DIAG_TAIL);
    }
  });

  it("شاخهٔ غیر-diagnostic دست‌نخورده — فرمولِ بانکِ خطا + تثبیت سرِ جای خودش است", () => {
    const ids = [...questionIndex().keys()].slice(0, 2);
    const mistakes = Object.fromEntries(ids.map((id) => [`0:${id}`, 2]));
    const plan = buildSmartPlan({ results: {}, mistakes, target: 10 });
    expect(plan.diagnostic).toBe(false);
    expect(plan.reasoning.startsWith("دستور این جلسه:")).toBe(true);
    expect(plan.reasoning).toContain("۲ سؤال از بانک خطا");
    expect(plan.reasoning).toContain("۸ سؤال تثبیتی از همهٔ درس‌ها");
    // ترتیبِ دو جزء: بانک خطا پیشِ پرکننده
    expect(plan.reasoning.indexOf("۲ سؤال از بانک خطا")).toBeLessThan(
      plan.reasoning.indexOf("۸ سؤال تثبیتی از همهٔ درس‌ها")
    );
    expect(plan.reasoning.endsWith("سوالیِ کتاب.")).toBe(true);
  });
});

describe("smart practice r272 — ② a11yِ انتخابگرِ طولِ جلسه", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      known: {},
      srs: {},
      mistakes: {},
      results: {},
      starredWords: [],
    } as never);
  });

  it("گروهِ نام‌دار با سه دکمه؛ انتخاب با aria-pressed اعلام می‌شود — نه فقط با رنگ", async () => {
    render(<SmartPracticeView />);
    const group = await screen_group("طول جلسهٔ تمرین هوشمند");
    const b10 = within(group).getByRole("button", { name: "۱۰ سؤال" });
    const b15 = within(group).getByRole("button", { name: "۱۵ سؤال" });
    const b20 = within(group).getByRole("button", { name: "۲۰ سؤال" });
    expect(b10).toHaveAttribute("aria-pressed", "true");
    expect(b15).toHaveAttribute("aria-pressed", "false");
    expect(b20).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(b15);
    expect(b15).toHaveAttribute("aria-pressed", "true");
    expect(b10).toHaveAttribute("aria-pressed", "false");
  });

  it("نمایِ نو: جعبهٔ 🌱 حالت را می‌گوید و خطِ ✨ دستور را — دو پیامِ متفاوت، یک تکرارِ ممنوع", async () => {
    const { container } = render(<SmartPracticeView />);
    await findText(/هنوز نتیجه‌ای ثبت نشده/); // جعبهٔ حالت — دست‌نخورده
    const recipe = await findText(/دستور این جلسه:/); // خطِ دستور — متنِ نو
    expect(recipe.textContent).toContain("۱۰ سؤال سنجش از همهٔ درس‌ها");
    expect(recipe.textContent).toContain(DIAG_TAIL);
    expect(container.textContent).not.toContain("تازه شروع کرده‌ای");
  });
});

describe("smart practice r272 — ③ قفل‌هایِ منبع", () => {
  it("lib: جملهٔ تکرارِ 🌱 از منبع رفته؛ هر دو شاخه فرمولِ مشترک دارند؛ دنبالهٔ سوگیری فقط در شاخهٔ diagnostic است", () => {
    const src = read("src/lib/smart-practice.ts");
    expect(src).not.toContain("تازه شروع کرده‌ای");
    // فرمولِ مشترکِ دو شاخه — دقیقاً دو بار (ترتیبی/حرف‌به‌حرفِ تمپلیت)
    expect(src.split("— چیده‌شده از بانک ${faNum(TOTAL_QUESTIONS)} سوالیِ کتاب").length - 1).toBe(2);
    // دنبالهٔ وعده — فقط در شاخهٔ diagnostic (بعد از «کتاب» با نقطه‌ویرگول)
    expect(src).toContain("سوالیِ کتاب؛ پس از نخستین نتیجه، جلسه‌ها به سویِ ضعف‌هایِ تو سوگیری می‌گیرند.");
    expect(src).toContain("سوالیِ کتاب.`");
  });

  it("view: گروهِ نام‌دار + aria-pressed در منبع؛ جعبهٔ 🌱 دست‌نخورده؛ فضای نامِ a11y پاک", () => {
    const src = read("src/components/study/practice/smart-practice-view.tsx");
    expect(src).toContain('role="group" aria-label="طول جلسهٔ تمرین هوشمند"');
    expect(src).toContain("aria-pressed={size === n}");
    // جعبهٔ حالتِ نو — متنِ قدیمی سرِ جایش است
    expect(src).toContain("هنوز نتیجه‌ای ثبت نشده");
    // فضای نامِ a11y: هر aria-labelِ این نما بی-«جزوه»
    for (const m of src.matchAll(/aria-label="([^"]+)"/g)) {
      expect(m[1]).not.toContain("جزوه");
    }
  });
});

/* کمکی‌هایِ کوچک — خواناییِ پرده‌هایِ بالا */
import { screen, waitFor } from "@testing-library/react";
function screen_group(name: string): Promise<HTMLElement> {
  return waitFor(() => screen.getByRole("group", { name }));
}
function findText(re: RegExp): Promise<HTMLElement> {
  return waitFor(() => screen.getAllByText(re)[0]);
}
