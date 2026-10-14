// @vitest-environment jsdom
// تسک ۱۷۵ «گریدِ حرارتیِ پوشش» — کامپوننت: ماتریسِ ARIA-جدول، سلولِ سردِ
// خط‌چین، نوارِ حرارت از بهترینِ درصد، لِجند، چیپِ میانگین، و مونتاژ در
// کارنامه. الگویِ coverage-map.component (۱۷۴): jsdomِ داک‌بلاکی + storeِ
// واقعی با setState + بدونِ fetch.

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CoverageHeatmapSection from "@/components/study/reports/coverage-heatmap";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";

describe("نمایِ حرارتیِ پوشش — کامپوننت (Task 175)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ results: {}, known: {} });
  });

  it("تازه‌کار: ۵۴ سلولِ سردِ «—» (نُه درس × شش مهارت)، ۷ سرستون (درس + ۶ مهارتِ کوتاه)، لِجند و میانگینِ «—»", () => {
    render(<CoverageHeatmapSection />);
    expect(screen.getByLabelText("نمایِ حرارتیِ پوشش مهارت‌ها")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    expect(screen.getByRole("columnheader", { name: "درس" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "کنکوری" })).toBeInTheDocument();
    const cells = screen.getAllByRole("cell");
    expect(cells).toHaveLength(54);
    expect(cells.every((c) => c.textContent === "—")).toBe(true);
    expect(screen.getByText("تلاش نشده")).toBeInTheDocument(); // لِجندِ سرد
    expect(screen.getByText("عالی")).toBeInTheDocument(); // لِجندِ داغ
    expect(screen.getByText(/میانگینِ بهترین‌ها: —/)).toBeInTheDocument();
  });

  it("بهترینِ ۸۵٪ → سلولِ «۸۵» با نوارِ strong (فیروزه) و میانگینِ ۸۵٪", () => {
    useStudy.setState({
      results: { "1:vocab": { correct: 17, total: 20, percent: 85, at: "2026-10-14" } },
    });
    render(<CoverageHeatmapSection />);
    const cells = screen.getAllByRole("cell");
    const hot = cells.find((c) => c.textContent === "۸۵");
    expect(hot).toBeDefined();
    expect(hot!.className).toContain("bg-teal-50");
    expect(hot!.className).not.toContain("bg-emerald-600");
    expect(screen.getByText(/میانگینِ بهترین‌ها: ۸۵٪/)).toBeInTheDocument();
    expect(cells.filter((c) => c.textContent === "—")).toHaveLength(53);
  });

  it("۹۵٪ → نوارِ elite (زمردِ توپُر) و میانگینِ (۸۵+۹۵)/۲ = ۹۰٪", () => {
    useStudy.setState({
      results: {
        "1:vocab": { correct: 17, total: 20, percent: 85, at: "2026-10-14" },
        "1:dictation": { correct: 19, total: 20, percent: 95, at: "2026-10-14" },
      },
    });
    render(<CoverageHeatmapSection />);
    const elite = screen.getAllByRole("cell").find((c) => c.textContent === "۹۵");
    expect(elite).toBeDefined();
    expect(elite!.className).toContain("bg-emerald-600");
    expect(screen.getByText(/میانگینِ بهترین‌ها: ۹۰٪/)).toBeInTheDocument();
  });

  it("کم‌ترین: ۳۰٪ → نوارِ faint (سنگِ کم‌رنگ) — نه سردِ خط‌چین", () => {
    useStudy.setState({
      results: { "2:vocab": { correct: 3, total: 10, percent: 30, at: "2026-10-14" } },
    });
    render(<CoverageHeatmapSection />);
    const faint = screen.getAllByRole("cell").find((c) => c.textContent === "۳۰");
    expect(faint).toBeDefined();
    expect(faint!.className).toContain("bg-stone-100");
  });

  it("مونتاژ در کارنامه: ReportCard نمایِ حرارتی را زیرِ نقشه نشان می‌دهد", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.getByLabelText("نمایِ حرارتیِ پوشش مهارت‌ها")).toBeInTheDocument();
    expect(screen.getByLabelText("نقشهٔ پوشش مهارت‌ها")).toBeInTheDocument(); // ۱۷۴ دست‌نخورده
  });
});
