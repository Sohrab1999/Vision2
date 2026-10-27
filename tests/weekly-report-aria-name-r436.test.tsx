// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r436 — «ariaِ نام در دکمهٔ دانلودِ تقویمِ هفته» — پیشنهادِ ②ِ r435.
//
// تنها دروازهٔ خروجیِ هفته که دنبالهٔ پس از هفته را در aria گفت
// نمیکرد، دکمهٔ CSVِ هفته بود؛ کاربرِ صفحه‌خوان فقط شمارِ درونِ پنجره
// را میشنید در حالی که پروندهای که میگیرد سطرِ دنباله دارد (r421) و
 // نما و toast از r434/r435 «چه» را هم میگویند. این راند:
//  · ariaِ دکمه پس از قفلِ r421 («…CSV — N ردیفِ این هفته») جملهٔ
//    «نزدیکترین بازگشت پس از هفته: …» را میگیرد — از هِلپرِ مشترکِ
//    afterWeekNaming (تکمن-source با toastِ r435؛ عینِ خانوادهٔ
//    r433/r434: تکبانکِ شناخته «تمرینِ X»، چندبانکِ همروز «N مورد در
//    M بانک» (r425)، بانکِ ناشناس شمارِ صادق (r236))
//  · بیِ دنباله: aria دقیقاً همان r421 — هیچ وعدهای افزوده نمیشود
//  · titleِ دکمه (توصیفِ ساختارِ پرونده) و toastِ r435 دستنخوردهاند
// ایدئومِ بذر از r434/r435 است.
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { consonantPhonemes, vowelPhonemes } from "@/data/appendix";

// =========================================================== jsdom locks

const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

/** درنفسِ دور — ok=4 نردبانِ ۸روزه؛ با lastOkDayِ امروز بیرونِ پنجره میماند */
const graceFar = () => ({ wrong: 5, ok: 4, lastDay: YESTERDAY, lastOkDay: daysAgoKey(0) });
const dueEntry = () => ({ wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" });

const weekCsvButton = () => screen.getByLabelText(/دانلود تقویم هفتهٔ پیشِ رو CSV/);

describe("r436 view — ariaِ دکمهٔ دانلودِ هفته نامِ نزدیکترین را میگوید", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  afterEach(() => {
    cleanup();
  });

  it("تکبانکِ شناخته: r421 + جملهٔ نام — «؛ نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر»", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), run: graceFar() }, // امروز + پس از هفته
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(weekCsvButton().getAttribute("aria-label")).toBe(
      `دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(1)} ردیفِ این هفته؛ نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ${faNum(8)} روزِ دیگر`,
    );
    // titleِ دکمه: توصیفِ ساختارِ پرونده — دستنخورده
    expect(weekCsvButton().getAttribute("title")).toBe(
      "تقویمِ هفتهٔ پیشِ رو — از سررسیدِ امروز تا ۶ روزِ دیگر، روزبهروز با جمعِ روزانه؛ ردیفهایِ دورتر یک سطرِ پس از هفته دارند",
    );
  });

  it("چندبانکِ همروزِ نزدیک: گویشِ «۲ مورد در ۲ بانک» — عینِ r425", () => {
    useStudy.setState({
      drillMistakes: {
        phonemes: { [SYM]: graceFar() },
        verbs: { go: dueEntry(), run: graceFar() },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(weekCsvButton().getAttribute("aria-label")).toBe(
      `دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(1)} ردیفِ این هفته؛ نزدیکترین بازگشت پس از هفته: ${faNum(2)} مورد در ${faNum(2)} بانک، ${faNum(8)} روزِ دیگر`,
    );
  });

  it("بانکِ ناشناس: شمارِ صادق — نه کلیدِ خام نه نامِ برساخته (r236)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() },
        "ghost-bank": { zz: graceFar() },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const aria = weekCsvButton().getAttribute("aria-label") || "";
    expect(aria).toBe(
      `دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(1)} ردیفِ این هفته؛ نزدیکترین بازگشت پس از هفته: ${faNum(1)} مورد، ${faNum(8)} روزِ دیگر`,
    );
    expect(aria).not.toContain("ghost");
    expect(aria).not.toContain("zz");
  });

  it("بیِ دنباله: aria دقیقاً همان r421 — هیچ جمله و وعدهای نیست", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: dueEntry() } }, // فقط امروز — بیِ دورتر
    });
    render(<ReportCard open onClose={() => {}} />);
    const aria = weekCsvButton().getAttribute("aria-label") || "";
    expect(aria).toBe(`دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(1)} ردیفِ این هفته`);
    expect(aria).not.toContain("پس از هفته");
  });

  it("سندِ منبع: جمله از هِلپرِ مشترک میخورد — دقیقاً یک گویش در سورس، دو مصرف", () => {
    const src = readFileSync(join(process.cwd(), "src/components/study/reports/weekly-report.tsx"), "utf8");
    expect(src).toContain("const afterWeekNaming = (");
    expect(src).toContain("description: weekToastDescription(weekAgenda, afterWeekTail),"); // r435 — دستنخورده
    expect(src).toContain("${afterWeekTail ? `؛ ${afterWeekNaming(weekAgenda, afterWeekTail)}` : \"\"}"); // r436
    // تکمن-source — دقیقاً یک بار در سورس (r435 lock ادامه دارد)
    expect((src.match(/نزدیکترین بازگشت پس از هفته: /g) ?? []).length).toBe(1);
    // پیشوندِ قفلشدهٔ r421 سرِ جایش است
    expect(src).toContain("دانلود تقویم هفتهٔ پیشِ رو CSV — ${faNum(weekAgenda.itemCount)} ردیفِ این هفته");
  });
});
