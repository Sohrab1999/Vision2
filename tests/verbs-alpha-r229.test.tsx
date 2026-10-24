// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۲۹ — گاردهایِ «لایهٔ مرجعِ افعال بی‌قاعده»: جدول از ضمیمه به
// کامپوننتِ خودش مهاجرت کرد (الگویِ استخراجِ r223) و سه لایه گرفت:
//   ① جست‌وجوی دوزبانهٔ زنده — سه شکلِ انگلیسی + معنیِ فارسی؛ چیپِ
//      «N نتیجه» + دکمهٔ پاک‌کردن؛ صفرِ صادقانه
//   ② فهرستِ الفباییِ پرش — چیپِ هر حرف با شمارش، همیشه از «فهرستِ
//      رندرشده» (قراردادِ صداقتِ r227/r228): حرفِ بی‌روی رندر نمی‌شود؛
//      کلیک = اسکرولِ محلی به لنگرِ سطرِ حرف — بدونِ چرخشِ استور
//   ③ جداکنندهٔ حرف داخلِ جدول (لنگرِ iv-letter-X) + تلفظِ هر سه ستون
// شمارش‌هایِ سخت‌پین‌شده از دادهٔ منجمد (۸۷ فعل) می‌آیند — نه از خودِ
// پیاده‌سازی.
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import IrregularVerbsTable from "@/components/study/lesson/irregular-verbs-table";
import { irregularVerbs } from "@/data/appendix";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

/** گروه‌بندیِ موردِ انتظار از خودِ داده — سنجشِ ساختار، نه کپیِ پیاده‌سازی */
const expectedLetters = (rows: typeof irregularVerbs) => {
  const m = new Map<string, number>();
  for (const v of rows) {
    const L = v.base.charAt(0).toUpperCase();
    m.set(L, (m.get(L) ?? 0) + 1);
  }
  return m;
};

describe("verbs-alpha-r229 — فهرستِ الفباییِ پرش", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("هدر: ۸۷ فعلِ پین‌شده + چیپ‌هایِ الفبایی = دقیقاً حروفِ داده با شمارشِ خودشان", () => {
    render(<IrregularVerbsTable />);
    // پینِ سختِ دادهٔ منجمد
    expect(screen.getByText(`${fa(87)} فعل`)).toBeTruthy();
    const chips = within(screen.getByRole("group", { name: "پرش الفبایی افعال بی‌قاعده" })).getAllByRole("button");
    const expected = expectedLetters(irregularVerbs);
    expect(chips).toHaveLength(expected.size);
    for (const chip of chips) {
      const letter = (chip.textContent ?? "").trim()[0]!;
      expect(chip.getAttribute("aria-label")).toBe(
        `پرش به فعل‌های حرفِ ${letter} (${fa(expected.get(letter) ?? -1)} فعل)`,
      );
    }
  });

  it("جداکنندهٔ حرف: هر گروه لنگرِ iv-letter-X با شمارشِ «N فعل» دارد — مجموعِ ردیف‌ها = ۸۷", () => {
    render(<IrregularVerbsTable />);
    const allRows = screen.getAllByRole("row");
    const expected = expectedLetters(irregularVerbs);
    const dividerRows = allRows.filter((r) => r.id.startsWith("iv-letter-"));
    expect(dividerRows).toHaveLength(expected.size);
    let verbRows = 0;
    for (const [letter, count] of expected) {
      const div = document.getElementById(`iv-letter-${letter}`)!;
      expect(div.tagName).toBe("TR");
      expect(div.textContent).toContain(`${letter}`);
      expect(div.textContent).toContain(`${fa(count)} فعل`);
      verbRows += count;
    }
    expect(allRows.length - dividerRows.length - 1 /* thead */).toBe(verbRows);
    expect(verbRows).toBe(87);
  });

  it("کلیکِ چیپِ حرف B: scrollIntoView یک‌بار روی لنگر — بدونِ چرخشِ استور", async () => {
    render(<IrregularVerbsTable />);
    const expected = expectedLetters(irregularVerbs);
    fireEvent.click(
      screen.getByRole("button", { name: `پرش به فعل‌های حرفِ B (${fa(expected.get("B")!)} فعل)` }),
    );
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1),
    );
    // لنگرِ هدف واقعاً در سند است (سطرِ حرفِ B)
    expect(document.getElementById("iv-letter-B")).toBeTruthy();
    // هیچ چرخشِ استوری — پرش کاملاً محلی
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });

  it("همهٔ ردیف‌ها دکمهٔ تلفظِ هر سه ستونِ انگلیسی را دارند — ردیفِ «رفتن» سه روخوانی", () => {
    render(<IrregularVerbsTable />);
    // خانهٔ فارسیِ «رفتن» دقیقاً همین است (زیررشته‌ی «گرفتن» در سایرِ ردیف‌ها نمی‌خورد)
    const goRow = screen
      .getAllByRole("row")
      .find((r) =>
        [...r.querySelectorAll("td")].some((td) => (td.textContent ?? "").trim() === "رفتن"),
      )!;
    const speaks = within(goRow).getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speaks).toHaveLength(3); // go / went / gone
    // کلِ جدول: هر ردیفِ فعل ۳ دکمهٔ تلفظ
    const allRows = screen.getAllByRole("row");
    const verbRows = allRows.filter((r) => !r.id.startsWith("iv-letter-")).slice(1);
    let totalSpeaks = 0;
    for (const r of verbRows) {
      totalSpeaks += within(r).getAllByRole("button", { name: "روخوانی متن انگلیسی" }).length;
    }
    expect(totalSpeaks).toBe(87 * 3);
  });
});

describe("verbs-alpha-r229 — جست‌وجوی دوزبانه", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("جست‌وجوی انگلیسیِ «eat»: ۱ نتیجه (eat/ate/eaten) — «be» بیرون می‌ماند و چیپ‌ها از فهرستِ رندرشده می‌آیند", () => {
    render(<IrregularVerbsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در افعال بی‌قاعده"), {
      target: { value: "eat" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(1)} نتیجه`);
    // «رفتن» (be) نیست — «خوردن» (eat) هست
    expect(screen.queryByText("بودن")).toBeNull();
    expect(screen.getByText("خوردن")).toBeTruthy();
    // چیپ‌ها فقط حروفِ رندرشده: فقط E
    const chips = within(screen.getByRole("group", { name: "پرش الفبایی افعال بی‌قاعده" })).getAllByRole("button");
    expect(chips.map((c) => (c.textContent ?? "").trim()[0])).toEqual(["E"]);
    // جداکننده: فقط iv-letter-E
    expect(document.getElementById("iv-letter-E")).toBeTruthy();
    expect(document.getElementById("iv-letter-B")).toBeNull();
  });

  it("جست‌وجوی فارسیِ «خوردن»: ۳ نتیجه (eat + fall + swing) — چیپ‌ها دقیقاً [E, F, S]", () => {
    render(<IrregularVerbsTable />);
    fireEvent.change(screen.getByLabelText("جست‌وجو در افعال بی‌قاعده"), {
      target: { value: "خوردن" },
    });
    expect(screen.getByRole("status").textContent).toContain(`${fa(3)} نتیجه`);
    expect(screen.getByText("خوردن")).toBeTruthy();
    expect(screen.getByText("زمین خوردن، سقوط کردن")).toBeTruthy();
    expect(screen.getByText("تاب خوردن، نوسان داشتن")).toBeTruthy();
    const chips = within(screen.getByRole("group", { name: "پرش الفبایی افعال بی‌قاعده" })).getAllByRole("button");
    expect(chips.map((c) => (c.textContent ?? "").trim()[0])).toEqual(["E", "F", "S"]);
    expect(document.getElementById("iv-letter-F")).toBeTruthy();
  });

  it("صفرِ صادقانه: «zzz» = حالتِ خالی با پیام و پاک‌کننده — چیپ و جدول حذف؛ پاک‌کردن برمی‌گرداند ۸۷", () => {
    render(<IrregularVerbsTable />);
    const input = screen.getByLabelText("جست‌وجو در افعال بی‌قاعده") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "zzz" } });
    // هیچ چیزی ساخته نشده: نه چیپ، نه جدول، نه جداکننده
    expect(screen.queryByRole("group", { name: "پرش الفبایی افعال بی‌قاعده" })).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("فعلِ «zzz» در فهرستِ ۸۷تایی پیدا نشد.")).toBeTruthy();
    // پاک‌کردن (دکمهٔ متن‌دارِ حالتِ خالی — Xِ ورودی aria-labelِ همان را دارد): همه‌چیز برمی‌گردد
    fireEvent.click(screen.getByText("پاک‌کردن جست‌وجو"));
    expect((screen.getByLabelText("جست‌وجو در افعال بی‌قاعده") as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("group", { name: "پرش الفبایی افعال بی‌قاعده" })).toBeTruthy();
    expect(screen.getAllByRole("row").filter((r) => !r.id.startsWith("iv-letter-"))).toHaveLength(87 + 1);
  });

  it("دکمهٔ پاک‌کردنِ داخلِ ورودی: با جست‌وجوی فعال دیده می‌شود و فیلتر را خالی می‌کند", () => {
    render(<IrregularVerbsTable />);
    const input = screen.getByLabelText("جست‌وجو در افعال بی‌قاعده") as HTMLInputElement;
    // بی‌جست‌وجو: هیچ دکمهٔ پاک‌کردنی نیست (نه Xِ ورودی، نه حالتِ خالی)
    expect(screen.queryByRole("button", { name: "پاک‌کردن جست‌وجو" })).toBeNull();
    fireEvent.change(input, { target: { value: "go" } });
    expect(screen.getByRole("status").textContent).toContain("نتیجه");
    // دکمهٔ X ورودی (titleِ همان) — فیلتر خالی می‌شود
    const clear = document.querySelector('button[title="پاک‌کردن جست‌وجو"]')!;
    expect(clear).toBeTruthy();
    fireEvent.click(clear);
    expect((screen.getByLabelText("جست‌وجو در افعال بی‌قاعده") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
