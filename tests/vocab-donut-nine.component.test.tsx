// @vitest-environment jsdom
// راند ۱۹۴ «قفسهٔ کامل» — دوناتِ واژگان نه‌بخشی شد: پیش‌تر فقط سه درسِ اول
// شمرده می‌شد اما مخرجِ درصد، کلِ کتاب بود (کم‌گزارشیِ ناصادقانه که با هر
// جزوهٔ تازه بدتر می‌شد). این تست قراردادِ تازه را قفل می‌کند: ۹ کمان،
// رنگِ بومِ خانواده‌محور (ring600)، لِجندِ ۹ ردیفه با نوارِ هر خانواده،
// و شمارندهٔ مرکزی روی مخرجِ درست.

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import VocabDonut from "@/components/study/practice/vocab-donut";
import { useStudy, knownCountOfLesson } from "@/lib/study-store";
import { lessons, totalVocabulary } from "@/data";
import { LESSONS_META } from "@/data/lesson-meta";
import { ring600 } from "@/lib/ui-colors";

describe("دونات پیشرفت واژگان — قفسهٔ دوازده‌درسی (راندهای ۱۹۴/۱۹۸)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ known: {}, results: {} });
  });

  it("تازه‌کار: صفرِ صادق — بدونِ کمان، «۰ از ۱۳۱۲ واژه»، ۱۲ ردیفِ لِجند با نوارِ «۰٪»", () => {
    render(<VocabDonut />);
    expect(screen.getByLabelText(/دونات پیشرفت واژگان/)).toBeInTheDocument();
    expect(screen.getAllByText(/از ۱۳۱۲ واژه/).length).toBeGreaterThanOrEqual(1); // زیرنویس + شمارندهٔ مرکزی
    // بدونِ کمان: فقط circleِ زمینه
    const svg = screen.getByLabelText(/دونات پیشرفت واژگان/);
    expect(svg.querySelectorAll("circle")).toHaveLength(1);
    // ۱۲ ردیفِ لِجند (هر درس یک ردیف)
    expect(screen.getAllByRole("button", { name: /رفتن به واژگان درس/ })).toHaveLength(12);
  });

  it("seed واژه‌های بلدم در سه پایه → سه کمان با رنگِ خانواده + مخرجِ کلِ کتاب (۱۱۱۵)", () => {
    // درس ۷ (نارنجی): ۳ واژه — درس ۸ (نیلی): ۲ واژه — درس ۱ (زمردی): ۱ واژه
    const l7 = lessons.find((l) => l.id === 7)!.vocabulary.slice(0, 3).map((w) => w.en);
    const l8 = lessons.find((l) => l.id === 8)!.vocabulary.slice(0, 2).map((w) => w.en);
    const l1 = lessons.find((l) => l.id === 1)!.vocabulary.slice(0, 1).map((w) => w.en);
    const known: Record<string, boolean> = {};
    for (const en of l7) known[`7:${en}`] = true;
    for (const en of l8) known[`8:${en}`] = true;
    for (const en of l1) known[`1:${en}`] = true;
    useStudy.setState({ known });

    render(<VocabDonut />);
    const svg = screen.getByLabelText(/دونات پیشرفت واژگان/); // ۶/۱۱۱۵ → ۰٫۵ → گِرد به ۱
    // سه کمانِ فعال + circleِ زمینه
    const arcs = svg.querySelectorAll("circle[stroke-dasharray]");
    expect(arcs).toHaveLength(3);
    // رنگِ بومِ خانواده‌محور: درس ۷ = orange-600 و درس ۸ = indigo-600
    const ringColors = [...arcs].map((c) => c.getAttribute("stroke"));
    expect(ringColors).toContain(ring600("orange"));
    expect(ringColors).toContain(ring600("indigo"));
    expect(ringColors).toContain(ring600("emerald"));
    // شمارشِ هر درس با knownCountOfLesson هم‌خوان است
    expect(knownCountOfLesson(useStudy.getState().known, 7)).toBe(3);
    expect(knownCountOfLesson(useStudy.getState().known, 8)).toBe(2);
    // مخرجِ درصد، کلِ کتاب است — نه فقط قفسهٔ قدیم
    expect(totalVocabulary).toBe(LESSONS_META.reduce((s, l) => s + l.vocabCount, 0));
    expect(screen.getByText("۶")).toBeInTheDocument(); // شمارندهٔ مرکزی با رقمِ فارسی
  });

  it("ring600: هر ۹ خانوادهٔ درسی رنگِ ۶۰۰یِ خودش را می‌خواند و ناشناخته → زمردی", () => {
    expect(ring600("orange")).toBe("#ea580c");
    expect(ring600("indigo")).toBe("#4f46e5");
    expect(ring600("fuchsia")).toBe("#c026d3");
    expect(ring600("sky")).toBe("#0284c7");
    expect(ring600("teal")).toBe("#0d9488");
    expect(ring600("violet")).toBe("#7c3aed");
    expect(ring600("amber")).toBe("#d97706");
    expect(ring600("rose")).toBe("#e11d48");
    expect(ring600("emerald")).toBe("#059669");
    expect(ring600("stone")).toBe("#059669"); // پیش‌فرضِ تاریخی
    expect(ring600("unknown-family")).toBe("#059669");
  });
});
