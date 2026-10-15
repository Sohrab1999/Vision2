// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۳۰ — گاردهایِ «لایهٔ جدولِ تلفظ (IPA)»: کارت‌های واک از ضمیمه
// به کامپوننتِ خودش مهاجرت کردند (الگویِ استخراجِ r223/r229) و سه لایه
// گرفتند:
//   ① جست‌وجوی زندهٔ دوزبانه — نشانهٔ IPA + نامِ فارسی + واژه‌های نمونه؛
//      چیپِ «N نتیجه» + دکمهٔ پاک‌کردن؛ صفرِ صادقانه
//   ② فیلترِ گروه — «همه / صدادار / بی‌صدا» با شمارشِ همیشه از
//      «فهرستِ رندرشده» (قراردادِ صداقتِ r227–r229): گروهِ بی‌نتیجه و
//      چیپش رندر نمی‌شوند؛ «همه» همیشه هست
//   ③ روخوانیِ واژهٔ نمونهٔ هر واک — ۴۴ دکمه؛ نشانهٔ IPA روخوانی
//      نمی‌شود (تصمیمِ صداقت)
// شمارش‌هایِ سخت‌پین‌شده از دادهٔ منجمد (۴۴ واک = ۲۰ + ۲۴) می‌آیند —
// نه از خودِ پیاده‌سازی.
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";

import PhoneticsTable from "@/components/study/lesson/phonetics-table";
import { vowelPhonemes, consonantPhonemes } from "@/data/appendix";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const TOTAL = vowelPhonemes.length + consonantPhonemes.length;

describe("phonetics-r230 — هدر، ترتیبِ جزوه و روخوانی", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("هدر: «۴۴ واک»ِ پین‌شده + نشانِ هر گروه (۲۰/۲۴) + چیپ‌هایِ فیلتر با شمارشِ داده", () => {
    render(<PhoneticsTable />);
    // پینِ سختِ دادهٔ منجمد — تغییرِ داده باید گارد را بیدار کند
    expect(TOTAL).toBe(44);
    expect(screen.getByText(`${fa(44)} واک`)).toBeTruthy();
    const vowels = screen.getByRole("group", { name: "حروف صدادار (Vowels)" });
    const cons = screen.getByRole("group", { name: "حروف بی‌صدا (Consonants)" });
    expect(within(vowels).getByText(`${fa(20)} واک`)).toBeTruthy();
    expect(within(cons).getByText(`${fa(24)} واک`)).toBeTruthy();
    // چیپ‌هایِ فیلتر: همه / صدادار / بی‌صدا با شمارش
    const chips = within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getAllByRole("button");
    expect(chips.map((c) => (c.textContent ?? "").replace(/\s+/g, ""))).toEqual([
      `همه${fa(44)}`,
      `صدادار${fa(20)}`,
      `بی‌صدا${fa(24)}`,
    ]);
  });

  it("ترتیبِ عینِ جزوه: دنبالهٔ نشانه‌هایِ هر گروه = دنبالهٔ داده — هیچ مرتب‌سازیِ جعلی", () => {
    render(<PhoneticsTable />);
    const vowels = screen.getByRole("group", { name: "حروف صدادار (Vowels)" });
    const renderedSymbols = within(vowels)
      .getAllByText(/^\/.+\/$/u)
      .map((el) => el.textContent ?? "");
    expect(renderedSymbols).toEqual(vowelPhonemes.map((p) => `/${p.symbol}/`));
    const cons = screen.getByRole("group", { name: "حروف بی‌صدا (Consonants)" });
    const consSymbols = within(cons)
      .getAllByText(/^\/.+\/$/u)
      .map((el) => el.textContent ?? "");
    expect(consSymbols).toEqual(consonantPhonemes.map((p) => `/${p.symbol}/`));
    // نمونه‌ها هم عینِ چاپِ جزوه: نخستین کارتِ صدادار «arm, father» است
    expect(within(vowels).getAllByText(/^\/.+\/$/u)[0]!.textContent).toBe("/ɑː/");
    expect(screen.getByText("arm, father")).toBeTruthy();
  });

  it("روخوانی: دقیقاً ۴۴ دکمه (یک دکمه برای واژهٔ نمونهٔ هر واک) — نشانهٔ IPA روخوانی نمی‌شود", () => {
    render(<PhoneticsTable />);
    const speaks = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speaks).toHaveLength(44);
    // کارتِ «æ» (cat, black): فقط یک دکمهٔ روخوانی — روی رشتهٔ نمونه
    const vowels = screen.getByRole("group", { name: "حروف صدادار (Vowels)" });
    const aeCard = within(vowels).getByText("/æ/").closest("div.rounded-xl")!;
    expect(within(aeCard as HTMLElement).getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(1);
    expect(within(aeCard as HTMLElement).getByText("cat, black")).toBeTruthy();
  });
});

describe("phonetics-r230 — جست‌وجوی دوزبانه و فیلترِ گروه", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("جست‌وجوی انگلیسیِ «father»: ۱ نتیجه — گروهِ بی‌نتیجه و چیپش حذف می‌شوند (فهرستِ رندرشده)", () => {
    render(<PhoneticsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در جدول تلفظ"), {
      target: { value: "father" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(1)} نتیجه`);
    // فقط گروهِ صدادار رندر می‌شود؛ بی‌صداها نه کارت دارند نه چیپ
    expect(screen.queryByRole("group", { name: "حروف بی‌صدا (Consonants)" })).toBeNull();
    expect(screen.getByRole("group", { name: "حروف صدادار (Vowels)" })).toBeTruthy();
    const chips = within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getAllByRole("button");
    expect(chips.map((c) => (c.textContent ?? "").replace(/\s+/g, ""))).toEqual([
      `همه${fa(1)}`,
      `صدادار${fa(1)}`,
    ]);
  });

  it("جست‌وجوی فارسیِ «دندان»: ۲ نتیجه (θ و ð) — فقط گروهِ بی‌صدا می‌ماند", () => {
    render(<PhoneticsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در جدول تلفظ"), {
      target: { value: "دندان" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(2)} نتیجه`);
    expect(screen.queryByRole("group", { name: "حروف صدادار (Vowels)" })).toBeNull();
    const cons = screen.getByRole("group", { name: "حروف بی‌صدا (Consonants)" });
    expect(within(cons).getByText("ص چسبیده به دندان")).toBeTruthy();
    expect(within(cons).getByText("ض چسبیده به دندان")).toBeTruthy();
    expect(within(cons).getAllByText(/^\/.+\/$/u)).toHaveLength(2);
  });

  it("فیلترِ گروهِ «بی‌صدا»: ۲۴ کارت — گروهِ صدادار حذف؛ aria-pressed صادق", () => {
    render(<PhoneticsTable />);
    fireEvent.click(within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getByRole("button", { name: /بی‌صدا/ }));
    expect(screen.queryByRole("group", { name: "حروف صدادار (Vowels)" })).toBeNull();
    const cons = screen.getByRole("group", { name: "حروف بی‌صدا (Consonants)" });
    expect(within(cons).getAllByText(/^\/.+\/$/u)).toHaveLength(24);
    expect(within(cons).getByText(`${fa(24)} واک`)).toBeTruthy();
    const chips = within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getAllByRole("button");
    const consChip = chips.find((c) => (c.textContent ?? "").includes("بی‌صدا"))!;
    expect(consChip.getAttribute("aria-pressed")).toBe("true");
    // برگشت به «همه» هر دو گروه را برمی‌گرداند
    fireEvent.click(within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getByRole("button", { name: /همه/ }));
    expect(screen.getByRole("group", { name: "حروف صدادار (Vowels)" })).toBeTruthy();
  });

  it("ترکیبِ فیلتر + جست‌وجو: «صدادار» با «lab» = حالتِ خالیِ پیرنگ‌دار؛ «نمایش همهٔ گروه‌ها» فیلتر را می‌شوید نه جست‌وجو را", () => {
    render(<PhoneticsTable />);
    fireEvent.click(within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getByRole("button", { name: /صدادار/ }));
    fireEvent.change(screen.getByLabelText("جست‌وجو در جدول تلفظ"), {
      target: { value: "lab" },
    });
    // «lab» فقط در نمونهٔ «b» (bad, lab) است — در صدادارها هیچ
    expect(
      screen.getByText("واکی برایِ «lab» در گروهِ «صدادار» پیدا نشد."),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("نمایش همهٔ گروه‌ها"));
    // جست‌وجو زنده مانده: ۱ نتیجه در بی‌صداها؛ فیلتر به «همه» برگشته
    expect(screen.getByRole("status").textContent).toContain(`${fa(1)} نتیجه`);
    const cons = screen.getByRole("group", { name: "حروف بی‌صدا (Consonants)" });
    expect(within(cons).getByText(`${fa(1)} واک`)).toBeTruthy();
    expect(within(cons).getByText("bad, lab")).toBeTruthy();
  });

  it("صفرِ صادقانه در «همه»: «zzz» = حالتِ خالی با پیام و پاک‌کننده — پاک‌کردن برمی‌گرداند ۴۴", () => {
    render(<PhoneticsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در جدول تلفظ"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText(`واکی برایِ «zzz» در فهرستِ ${fa(44)}تایی پیدا نشد.`)).toBeTruthy();
    expect(screen.queryByRole("group", { name: "حروف صدادار (Vowels)" })).toBeNull();
    expect(screen.queryByRole("group", { name: "حروف بی‌صدا (Consonants)" })).toBeNull();
    // در صفرِ کامل فقط «همه» چپ می‌ماند (راهِ برگشت)
    const chips = within(screen.getByRole("group", { name: "فیلتر گروه واک‌ها" })).getAllByRole("button");
    expect(chips.map((c) => (c.textContent ?? "").replace(/\s+/g, ""))).toEqual([`همه${fa(0)}`]);
    // دکمهٔ متن‌دارِ حالتِ خالی — همه‌چیز برمی‌گردد
    fireEvent.click(screen.getByText("پاک‌کردن جست‌وجو"));
    expect((screen.getByLabelText("جست‌وجو در جدول تلفظ") as HTMLInputElement).value).toBe("");
    expect(screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(44);
  });

  it("دکمهٔ پاک‌کردنِ داخلِ ورودی + نکتهٔ کهرباییِ جزوه محفوظ — و هیچ چرخشِ استوری", () => {
    render(<PhoneticsTable />);
    const input = screen.getByLabelText("جست‌وجو در جدول تلفظ") as HTMLInputElement;
    // بی‌جست‌وجو: هیچ دکمهٔ پاک‌کردنی نیست
    expect(screen.queryByRole("button", { name: "پاک‌کردن جست‌وجو" })).toBeNull();
    fireEvent.change(input, { target: { value: "sing" } });
    expect(screen.getByRole("status").textContent).toContain("نتیجه");
    // نکتهٔ کهربایی عینِ جزوه حفظ شده
    expect(screen.getByText(/International Phonetic Alphabet/)).toBeTruthy();
    // Xِ ورودی (titleِ همان) — فیلتر خالی می‌شود
    fireEvent.click(document.querySelector('button[title="پاک‌کردن جست‌وجو"]')!);
    expect((screen.getByLabelText("جست‌وجو در جدول تلفظ") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("status")).toBeNull();
    // هیچ چرخشِ استوری — جست‌وجو و فیلتر کاملاً محلی‌اند
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});
