// @vitest-environment jsdom
// ------------------------------------------------------------------
// پیمان‌های r415 — «ادامه از بانک M» در ردیف‌هایِ پوششِ کارنامه:
//   ① ردیفِ شروع‌شده (سشن > ۰ و بانکی مانده): نامِ درسترس با پسوندِ
//      «ادامه از بانک M» + چیپِ دومینِ دیده‌شده زیرِ ردیف
//   ② کلیکِ همان ردیف → view = { type: "book", grade, bank: M } —
//      book-view خودش از عنوانِ بانک به درسِ میزبان می‌رسد
//   ③ ردیفِ تازه‌وارد (بدونِ سشن): بدونِ پسوند — همان پرشِ سادهٔ r414
//   ④ رگرسیونِ r414: نامِ پایه، پوشش، tooltip و شش مترِ aria دست‌نخورده
// بذرِ همان E2E: g10 دو بانک (l1,l5) + g7 یک بانک (l3) + g11 گرامر.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import type { QuizResult } from "@/lib/study-types";
import ReportCard from "@/components/study/reports/report-card";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const R = (percent: number): QuizResult => ({
  percent,
  correct: Math.round(percent / 10),
  total: 10,
  at: "2026-10-20T10:00:00.000Z",
});

const SEED_RESULTS = {
  "jozve-g10-l1": R(80),
  "jozve-g10-l5": R(60),
  "jozve-g7-l3": R(50),
  "jozve-g11-gram-l1": R(70),
};

describe("ادامه از بانک — ردیف‌هایِ پوشش (r415)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ results: SEED_RESULTS, view: { type: "home" } });
  });

  it("ردیفِ دهم: پسوندِ «ادامه از بانک ۲» (اولینِ پوشیده‌نشده از {1,5}) + چیپِ دومین", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ دهم در کتابخانه/ });
    expect(row).toHaveAccessibleName(/ادامه از بانک ۲/);
    // چیپِ زیرِ ردیف — هم‌متنِ نام، دیده‌شده برای چشم هم
    expect(screen.getByText("ادامه از بانک ۲")).toBeInTheDocument();
  });

  it("کلیکِ ردیفِ دهم → view = { type: book, grade: 10, bank: 2 }", async () => {
    const onClose = vi.fn();
    render(<ReportCard open onClose={onClose} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ دهم در کتابخانه/ });
    fireEvent.click(row);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(useStudy.getState().view).toEqual({ type: "book", grade: 10, bank: 2 });
  });

  it("ردیفِ گرامر-فقط (یازدهم): ادامه از بانک ۱ — سشن هست، بانکِ تست نیست", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ یازدهم در کتابخانه/ });
    expect(row).toHaveAccessibleName(/ادامه از بانک ۱/);
    fireEvent.click(row);
    expect(useStudy.getState().view).toEqual({ type: "book", grade: 11, bank: 1 });
  });

  it("ردیفِ تازه‌وارد (هشتم): بدونِ پسوندِ ادامه — پرشِ سادهٔ r414 حفظ شده", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ هشتم در کتابخانه/ });
    expect(row).toHaveAccessibleName(/باز کردن جزوهٔ هشتم در کتابخانه — پوشش ۰٪$/);
    fireEvent.click(row);
    expect(useStudy.getState().view).toEqual({ type: "book", grade: 8 });
  });

  it("رگرسیونِ r414: tooltipِ سرِ ردیف و شش مترِ aria دست‌نخورده", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const g10 = await screen.findByRole("button", { name: /باز کردن جزوهٔ دهم در کتابخانه/ });
    expect(g10).toHaveAttribute("title", "۲ بانک از ۱۰۰ — ۲ سشن، بهترین ۸۰٪");
    expect(screen.getAllByRole("meter").length).toBe(6);
    expect(screen.getByRole("meter", { name: "پوشش جزوهٔ هفتم" })).toHaveAttribute("aria-valuenow", "5");
  });
});
