// @vitest-environment jsdom
// تسک ۱۷۴ «نقشهٔ پوشش» — کامپوننت: رندرِ سه درس، چیپِ بهترین٪، شکافِ صادق،
// و مونتاژ در کارنامه (report-card). الگوی due-pill.component (راند ۷۵):
// jsdomِ داک‌بلاکی + storeِ واقعی با setState + بدون fetch.

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CoverageMapSection from "@/components/study/reports/coverage-map";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";

describe("نقشهٔ پوشش — کامپوننت (Task 174)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ results: {}, known: {} });
  });

  it("تازه‌کار: شش درس، هر سی‌وشش چیپِ خط‌چینِ «—»، شکافِ درس ۱ «تست واژگان»، چیپِ جمع صفر", () => {
    render(<CoverageMapSection />);
    expect(screen.getByLabelText("نقشهٔ پوشش مهارت‌ها")).toBeInTheDocument();
    expect(screen.getAllByText("تست واژگان —").length).toBeGreaterThanOrEqual(6);
    expect(screen.getAllByText(/گامِ بعدی: تست واژگان/).length).toBe(6);
    expect(screen.getByText(/۰ از ۳۶ تلاش‌شده/)).toBeInTheDocument();
  });

  it("بهترینِ ثبت‌شده: چیپِ زمردیِ «۸۵٪» در درس ۱ و شکافِ جابه‌جا شده به «دیکته»", () => {
    useStudy.setState({
      results: { "1:vocab": { correct: 17, total: 20, percent: 85, at: "2026-10-14" } },
    });
    render(<CoverageMapSection />);
    expect(screen.getByText("تست واژگان ۸۵٪")).toBeInTheDocument();
    expect(screen.getAllByText(/گامِ بعدی: تست واژگان/).length).toBe(5); // درس‌های ۲ تا ۶
    expect(screen.getByText(/گامِ بعدی: دیکته این درس/)).toBeInTheDocument();
    expect(screen.getByText(/۱ از ۳۶ تلاش‌شده/)).toBeInTheDocument();
  });

  it("همه‌پوشیده: شش ستونِ پر درس ۱ → «همهٔ مهارت‌های این درس تلاش شده»", () => {
    const results: Record<string, { correct: number; total: number; percent: number; at: string }> = {};
    for (const k of ["vocab", "dictation", "listening", "writing", "vocab-konkuri", "grammar"]) {
      results[`1:${k}`] = { correct: 5, total: 10, percent: 50, at: "2026-10-14" };
    }
    useStudy.setState({ results });
    render(<CoverageMapSection />);
    expect(screen.getByText(/همهٔ مهارت‌های این درس تلاش شده/)).toBeInTheDocument();
    expect(screen.getByText(/۶ از ۳۶ تلاش‌شده/)).toBeInTheDocument();
  });

  it("مونتاژ در کارنامه: ReportCard بخشِ نقشه را داخلِ دیالوگ نشان می‌دهد", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.getByLabelText("نقشهٔ پوشش مهارت‌ها")).toBeInTheDocument();
  });
});
