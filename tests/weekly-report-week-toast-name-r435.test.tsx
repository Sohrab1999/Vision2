// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r435 — «گویشِ نام در toastِ دانلودِ تقویمِ هفته» — پیشنهادِ ②ِ r434.
//
// توستِ لحظهٔ دانلود روایتگرِ همان هفتهای است که ذخیره میشود؛ از r434
// نما (دنبالهٔ «+N پس از هفته» و نوارِ «این هفته آرام است») «چه» را هم
// میگوید — toast هم به همان خانوادهٔ گویش میپیوندد تا لحظهٔ خروج از
// نما نامِ نزدیکترین بازگشتِ پس از هفته گم نشود:
//  · تکبانکِ شناخته → «نزدیکترین بازگشت پس از هفته: تمرینِ X، ۸ روزِ دیگر.»
//  · چندبانکِ همروز → «…: ۲ مورد در ۲ بانک، ۸ روزِ دیگر.» (گویشِ r425)
//  · بانکِ ناشناس → «…: ۱ مورد، ۸ روزِ دیگر.» (r236 — نه کلیدِ خام نه
//    نامِ برساخته)
//  · هفتهٔ تمام و کمال (بیِ دنباله) → بیِ جمله — وعدهٔ بیپشتوانه ممنوع
//    (r236)
//  · عنوانِ toast و مسیرِ شکستِ r398 دستنخوردهاند؛ خودِ پرونده هم
//    (قراردادِ سطریِ r421) دستنخورده میماند
// ایدئومِ توست از r398 (پروبِ useToast) و بذرِ انبار از r434 است.
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { useEffect } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import ReportCard from "@/components/study/reports/report-card";
import { useToast } from "@/hooks/use-toast";
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

type Toasts = ReturnType<typeof useToast>["toasts"];

function ToastProbe({ onToasts }: { onToasts: (t: Toasts) => void }) {
  const s = useToast();
  useEffect(() => {
    onToasts(s.toasts);
  }, [s.toasts, onToasts]);
  return null;
}

/** دانلودِ واقعیِ CSV در jsdom: دُمِ مالک با URLِ خلط‌شده زنده میماند
    (ایدئومِ r398) — anchor واقعی کلیک میشود ولی چیزی دانلود نمیکند */
const stubDownload = () => {
  vi.stubGlobal(
    "URL",
    Object.assign(Object.create(URL), {
      createObjectURL: vi.fn(() => "blob:mock-r435"),
      revokeObjectURL: vi.fn(),
    }),
  );
  const origAppend = document.body.appendChild.bind(document.body);
  vi.spyOn(document.body, "appendChild").mockImplementation(((el: Node) => {
    if ((el as HTMLAnchorElement).download) {
      (el as HTMLAnchorElement).click = () => {};
    }
    return origAppend(el);
  }) as typeof document.body.appendChild);
};

const weekCsvButton = () => screen.getByLabelText(/دانلود تقویم هفتهٔ پیشِ رو CSV/);

describe("r435 view — toastِ دانلودِ هفته نامِ نزدیکترین را میگوید", () => {
  let seen: Toasts = [];

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
    seen = [];
    render(<ToastProbe onToasts={(t) => { seen = t; }} />);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("تکبانکِ شناخته: پایه + جملهٔ نام — «تمرینِ افعال بی‌قاعده، ۸ روزِ دیگر»", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), run: graceFar() }, // امروز + پس از هفته
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    stubDownload();
    fireEvent.click(weekCsvButton());
    // itemCount فقط ردیفهایِ درونِ پنجره را میشمارد (r421) — سطرِ دورتر
    // «ردیف» اینجا نیست؛ «چه» را جملهٔ خودش میگوید. TOAST_LIMIT=۱ —
    // توستِ تازه جانشینِ هر توستِ قبلی است؛ seen[0] همین راند است.
    expect(seen).toHaveLength(1);
    expect(seen[0].title).toBe("🗓 تقویمِ هفتهٔ پیشِ رو ذخیره شد"); // عنوانِ r421 دستنخورده
    expect(seen[0].duration).toBe(3000);
    expect(seen[0].description).toBe(
      `${faNum(1)} ردیف در ${faNum(1)} روزِ پیشِ رو — آمادهٔ اکسل. نزدیکترین بازگشت پس از هفته: تمرینِ افعال بی‌قاعده، ${faNum(8)} روزِ دیگر.`,
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
    stubDownload();
    fireEvent.click(weekCsvButton());
    expect(seen[0].description).toBe(
      `${faNum(1)} ردیف در ${faNum(1)} روزِ پیشِ رو — آمادهٔ اکسل. نزدیکترین بازگشت پس از هفته: ${faNum(2)} مورد در ${faNum(2)} بانک، ${faNum(8)} روزِ دیگر.`,
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
    stubDownload();
    fireEvent.click(weekCsvButton());
    expect(seen[0].description).toBe(
      `${faNum(1)} ردیف در ${faNum(1)} روزِ پیشِ رو — آمادهٔ اکسل. نزدیکترین بازگشت پس از هفته: ${faNum(1)} مورد، ${faNum(8)} روزِ دیگر.`,
    );
    expect(seen[0].description).not.toContain("ghost");
    expect(seen[0].description).not.toContain("zz");
  });

  it("هفتهٔ تمام و کمال (بیِ دنباله): پایهی خالص — هیچ وعدهای افزوده نمیشود", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: dueEntry() } }, // فقط امروز — بیِ دورتر
    });
    render(<ReportCard open onClose={() => {}} />);
    stubDownload();
    fireEvent.click(weekCsvButton());
    expect(seen[0].description).toBe(`${faNum(1)} ردیف در ${faNum(1)} روزِ پیشِ رو — آمادهٔ اکسل.`);
    expect(seen[0].description).not.toContain("پس از هفته");
  });

  it("شکستِ ساختِ فایل: جفتِ نامدارِ r398 — گویشِ موفقیت نام میگوید؛ شکست نام میگوید", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: dueEntry(), run: graceFar() } },
    });
    render(<ReportCard open onClose={() => {}} />);
    // این jsdom createObjectURL دارد — شکست با تزریقِ صریحِ r398 قفل میشود
    vi.stubGlobal(
      "URL",
      Object.assign(Object.create(URL), {
        createObjectURL: vi.fn(() => { throw new TypeError("injected"); }),
        revokeObjectURL: vi.fn(),
      }),
    );
    // r454 — TOAST_LIMIT=3: توستهایِ کهنِ تستهایِ پیشین در سبد میمانند
    // (سقفِ ۳) — قراردادِ «دقیقاً یک توست در این راند» با تفاضلِ id سنجیده
    // میشود (اسنپ‌شات پیشِ کلیک!)؛ تازهترین همیشه سرِ فهرست است.
    const beforeIds = new Set(seen.map((t) => t.id));
    fireEvent.click(weekCsvButton());
    const fresh = seen.filter((t) => !beforeIds.has(t.id));
    expect(fresh).toHaveLength(1);
    expect(seen[0].id).toBe(fresh[0].id);
    expect(seen[0].title).toBe("خطا در ساخت فایل"); // مالکِ r398 — گویشِ شکست دستنخورده
    expect(seen[0].description).toBe("لطفاً دوباره تلاش کن.");
    expect(seen[0].duration).toBe(3000);
  });

  it("سندِ منبع: توست از هِلپرِ خالص میخورد و عنوانِ r398 سرِ جایش است", () => {
    // سندِ دستی نیست — هِلپرِ خالصِ ماژولی، تکمن-source (عینِ ایدئومِ r433)
    // خودِ قفلهایِ بالا رفتارِ واقعی را زنده داوری میکنند؛ اینجا فقط
    // سیمکشیِ منبع قفل میشود.
    const src = readFileSync(join(process.cwd(), "src/components/study/reports/weekly-report.tsx"), "utf8");
    expect(src).toContain("const weekToastDescription = (");
    expect(src).toContain("description: weekToastDescription(weekAgenda, afterWeekTail),");
    expect(src).toContain('title: "🗓 تقویمِ هفتهٔ پیشِ رو ذخیره شد"');
    // جملهٔ نام در هِلپر است — نه دستی در دروازه
    expect(src).toContain("نزدیکترین بازگشت پس از هفته: ");
    expect((src.match(/نزدیکترین بازگشت پس از هفته: /g) ?? []).length).toBe(1);
  });
});
