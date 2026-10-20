// @vitest-environment jsdom
// ------------------------------------------------------------------
// پیمان‌های r414 — ردیف‌هایِ «پوشش شش جزوه» در کارنامه اکنون دکمه‌اند:
//   ① هر شش پایه دقیقاً یک دکمهٔ ردیفی دارند (حتی پوششِ صفر — دعوت به شروع)
//   ② نامِ درسترس: «باز کردن جزوهٔ X در کتابخانه — پوشش Y٪»
//   ③ کلیک → onClose یک‌بار + setView به { type: "book", grade } (پرشِ کتابخانه)
//   ④ tooltipِ r413 («N بانک از M — S سشن، بهترین P٪») روی کلِ ردیف نشسته
//   ⑤ مترهای aria ردیف‌ها دست‌نخورده (رگرسیونِ r413)
// الگوی seed هم‌الگوی weekly-report/jozve-coverage: setState مستقیم.
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

// g10 دو بانک + g7 یک بانک + g11 یک سشنِ گرامر (همان بذرِ E2Eِ r413)
const SEED_RESULTS = {
  "jozve-g10-l1": R(80),
  "jozve-g10-l5": R(60),
  "jozve-g7-l3": R(50),
  "jozve-g11-gram-l1": R(70),
};

describe("ردیف‌هایِ کلیک‌پذیرِ پوشش شش جزوه — کامپوننت (r414)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ results: SEED_RESULTS, view: { type: "home" } });
  });

  it("هر شش پایه یک دکمهٔ ردیفی دارند — حتی پوششِ صفر (دعوت به شروع)", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const rows = await screen.findAllByRole("button", { name: /باز کردن جزوهٔ .* در کتابخانه/ });
    expect(rows.length).toBe(6);
    for (const g of ["هفتم", "هشتم", "نهم", "دهم", "یازدهم", "دوازدهم"]) {
      expect(screen.getByRole("button", { name: new RegExp(`باز کردن جزوهٔ ${g} در کتابخانه`) })).toBeInTheDocument();
    }
    // پوششِ صفر هم دکمه است — با پوشش ۰٪ در نام
    expect(screen.getByRole("button", { name: /جزوهٔ هشتم .* — پوشش ۰٪/ })).toBeInTheDocument();
  });

  it("کلیکِ ردیفِ دهم → onClose یک‌بار + view به book/grade=10 می‌رود", async () => {
    const onClose = vi.fn();
    render(<ReportCard open onClose={onClose} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ دهم در کتابخانه/ });
    fireEvent.click(row);
    expect(onClose).toHaveBeenCalledTimes(1);
    const view = useStudy.getState().view;
    expect(view.type).toBe("book");
    expect(view.type === "book" && view.grade).toBe(10);
  });

  it("کلیکِ ردیفِ صفر (هشتم) هم پرش می‌کند — و پوششِ مترِ aria دست‌نخورده مانده", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ هشتم در کتابخانه/ });
    fireEvent.click(row);
    expect(useStudy.getState().view).toEqual({ type: "book", grade: 8 });
    // رگرسیونِ r413: شش مترِ aria همچنان روی ردیف‌ها حاضرند
    const meters = screen.getAllByRole("meter");
    expect(meters.length).toBe(6);
    const g7meter = screen.getByRole("meter", { name: "پوشش جزوهٔ هفتم" });
    expect(g7meter).toHaveAttribute("aria-valuenow", "5"); // ۱ بانک از ۲۰
  });

  it("tooltipِ r413 روی کلِ ردیف نشسته («N بانک از M — S سشن، بهترین P٪»)", async () => {
    render(<ReportCard open onClose={() => {}} />);
    const row = await screen.findByRole("button", { name: /باز کردن جزوهٔ یازدهم در کتابخانه/ });
    expect(row).toHaveAttribute("title", "۰ بانک از ۱۰۸ — ۱ سشن، بهترین ۷۰٪");
    const g10 = screen.getByRole("button", { name: /باز کردن جزوهٔ دهم در کتابخانه/ });
    expect(g10).toHaveAttribute("title", "۲ بانک از ۱۰۰ — ۲ سشن، بهترین ۸۰٪");
  });
});
