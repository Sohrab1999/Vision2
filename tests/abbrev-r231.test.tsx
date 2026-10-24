// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۳۱ — گاردهایِ «لایهٔ نشانه‌های اختصاری»: کارت‌ها از ضمیمه به
// کامپوننتِ خودش مهاجرت کردند (الگویِ استخراجِ r230) و دو لایه گرفتند:
//   ① جست‌وجوی زندهٔ دوزبانه — نماد + شکلِ کامل + معنیِ فارسی؛ چیپِ
//      «N نتیجه» + دکمهٔ پاک‌کردن؛ صفرِ صادقانه
//   ② روخوانیِ شکلِ کامل — ۱۳ دکمه؛ نماد عمداً روخوانی نمی‌شود (تصمیمِ
//      صداقت — همان ایدئومِ r230)
// شمارش‌هایِ سخت‌پین‌شده از دادهٔ منجمد (۱۳ نشانه) می‌آیند — نه از خودِ
// پیاده‌سازی.
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";

import AbbreviationsTable from "@/components/study/lesson/abbreviations-table";
import { abbreviations } from "@/data/appendix";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const TOTAL = abbreviations.length;

describe("abbrev-r231 — هدر، ترتیبِ جزوه و روخوانی", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("هدر: «۱۳ نشانه»ِ پین‌شده + هر ۱۳ کارت با نمادِ خودش به ترتیبِ جزوه", () => {
    render(<AbbreviationsTable />);
    // پینِ سختِ دادهٔ منجمد — تغییرِ داده باید گارد را بیدار کند
    expect(TOTAL).toBe(13);
    expect(screen.getByText(`${fa(13)} نشانه`)).toBeTruthy();
    const syms = [...document.querySelectorAll("span.en-text.h-9")].map(
      (el) => el.textContent ?? "",
    );
    expect(syms).toEqual(abbreviations.map((a) => a.sym));
    // نمادِ نخستین و آخرین کارت — سرِ واژگانِ جزوه
    expect(syms[0]).toBe("n");
    expect(syms[syms.length - 1]).toBe("ant");
  });

  it("روخوانی: دقیقاً ۱۳ دکمه (یکی روی شکلِ کاملِ هر نشانه) — نماد روخوانی نمی‌شود", () => {
    render(<AbbreviationsTable />);
    const speaks = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speaks).toHaveLength(13);
    // کارتِ «n»: فقط یک دکمه — روی «(noun)» نه نماد
    const nCard = screen.getByText("n", { selector: "span.en-text.h-9" }).closest("div")!;
    expect(within(nCard as HTMLElement).getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(1);
    expect(within(nCard as HTMLElement).getByText("(noun)")).toBeTruthy();
    expect(within(nCard as HTMLElement).getByText("اسم")).toBeTruthy();
  });
});

describe("abbrev-r231 — جست‌وجوی دوزبانه", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("جست‌وجوی انگلیسیِ «verb»: ۳ نتیجه (v، adv، phr.v) — زیررشته‌ایِ صادقانه در نماد و شکلِ کامل", () => {
    render(<AbbreviationsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری"), {
      target: { value: "verb" },
    });
    // «verb» در (verb) و (adverb) و (phrasal verb) — زیررشته‌ایِ واقعی
    expect(screen.getByRole("status").textContent).toContain(`${fa(3)} نتیجه`);
    const syms = [...document.querySelectorAll("span.en-text.h-9")].map((el) => el.textContent ?? "");
    expect(syms).toEqual(["v", "adv", "phr.v"]);
  });

  it("جست‌وجوی فارسیِ «حرف»: ۲ نتیجه (pre و conj) — زیررشته‌ایِ صادقانه", () => {
    render(<AbbreviationsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری"), {
      target: { value: "حرف" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(2)} نتیجه`);
    expect(screen.getByText("حرف اضافه")).toBeTruthy();
    expect(screen.getByText("حرف ربط")).toBeTruthy();
    const syms = [...document.querySelectorAll("span.en-text.h-9")].map((el) => el.textContent ?? "");
    expect(syms).toEqual(["pre", "conj"]);
  });

  it("جست‌وجوی نمادِ «phr»: ۱ نتیجه — نماد و شکلِ کاملِ همان کارت", () => {
    render(<AbbreviationsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری"), {
      target: { value: "phr" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(1)} نتیجه`);
    const syms = [...document.querySelectorAll("span.en-text.h-9")].map((el) => el.textContent ?? "");
    expect(syms).toEqual(["phr.v"]);
    expect(screen.getByText("(phrasal verb)")).toBeTruthy();
  });

  it("صفرِ صادقانه: «zzz» = حالتِ خالی با پیام و پاک‌کننده — پاک‌کردن برمی‌گرداند ۱۳", () => {
    render(<AbbreviationsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText(`نشانه‌ای برایِ «zzz» در فهرستِ ${fa(13)}تایی پیدا نشد.`)).toBeTruthy();
    expect(document.querySelectorAll("span.en-text.h-9")).toHaveLength(0);
    // دکمهٔ متن‌دارِ حالتِ خالی — همه‌چیز برمی‌گردد
    fireEvent.click(screen.getByText("پاک‌کردن جست‌وجو"));
    expect((screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری") as HTMLInputElement).value).toBe("");
    expect(document.querySelectorAll("span.en-text.h-9")).toHaveLength(13);
    expect(screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(13);
  });

  it("دکمهٔ پاک‌کردنِ داخلِ ورودی + هیچ چرخشِ استوری", () => {
    render(<AbbreviationsTable />);
    const input = screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری") as HTMLInputElement;
    // بی‌جست‌وجو: هیچ دکمهٔ پاک‌کردنی نیست
    expect(screen.queryByRole("button", { name: "پاک‌کردن جست‌وجو" })).toBeNull();
    fireEvent.change(input, { target: { value: "syn" } });
    expect(screen.getByRole("status").textContent).toContain("نتیجه");
    // Xِ ورودی (titleِ همان) — فیلتر خالی می‌شود
    fireEvent.click(document.querySelector('button[title="پاک‌کردن جست‌وجو"]')!);
    expect((screen.getByLabelText("جست‌وجو در نشانه‌های اختصاری") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("status")).toBeNull();
    // هیچ چرخشِ استوری — جست‌وجو کاملاً محلی است
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});
