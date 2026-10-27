// @vitest-environment jsdom
// ------------------------------------------------------------------
// r414 — «SRSِ دریل» — قفلهایِ نما: نیمهٔ دیگرِ حلقه + چیپِ سررسید.
//
// قراردادهایِ نما:
//  · پایانِ جلسهٔ کامل (نه مرور): پاسخِ درستِ پایههایِ خطادار ok میگیرد
//    (فقط ردیفِ موجود — پایهٔ بیخطا ردیف نمیسازد)؛ مسلطدهنده از
//    سررسید بیرون میماند ولی در بانک است
//  · معرفی: بی‌سررسید هیچ؛ با سررسید چیپِ زمردیِ «N موردِ سررسید» —
//    شمارش صادقانه از مسلطدهندهها میگذرد؛ در فازِ run هیچ
//  · چیپِ خطایِ r413 پابرجاست — دو چیپ، دو حقیقت (ثبتشده ≠ سررسید)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { countDrillDue, type DrillMistakeBank } from "@/lib/drill-mistakes";
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";

const TODAY = todayStr();

const openVerbsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
};

const startDrill = () => {
  render(<AppendixView />);
  openVerbsTab();
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
};

const runFullSession = (pattern: (i: number) => number) => {
  for (let i = 0; i < 10; i++) {
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[pattern(i) % 4]);
    fireEvent.click(
      i === 9
        ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

/** نمرهٔ صادقِ صفحهٔ نتیجه — «N درست از ۱۰» */
const resultCorrect = (): number => {
  const el = screen.getByText(/درست از/);
  return Number((el.textContent || "").match(/([۰-۹]+) درست از/)![1].replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
};

const runReplay = () => {
  const btn = screen.getByRole("button", { name: "مرور اشتباههای تمرین" });
  const n = Number(btn.textContent!.match(/\(([۰-۹]+)\)/)![1].replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
  fireEvent.click(btn);
  for (let i = 0; i < n; i++) {
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[1]);
    fireEvent.click(
      i === n - 1
        ? screen.getByRole("button", { name: /دیدن نتیجه/ })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

describe("appendix-drill-view r414 — SRSِ دریل", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("پایانِ جلسهٔ کامل: پاسخِ درستِ پایهٔ خطادار ok میگیرد — پایهٔ بیخطا ردیف نمیسازد", () => {
    // بذرِ بانک با یک پایهٔ مشخص؛ الگویِ پاسخ قاطی است — از خودِ استور میخوانیم
    const bank: DrillMistakeBank = { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } };
    useStudy.setState({ drillMistakes: { verbs: bank } });
    startDrill();
    runFullSession((i) => i % 4);
    const after = useStudy.getState().drillMistakes["verbs"]!;
    // «go» اگر درست پاسخ شده ok=1 (و lastOkDay=امروز)؛ اگر نادرست wrong=3 و lastDay=امروز
    const go = after["go"];
    expect(go).toBeDefined(); // ردیف هرگز حذف نمیشود
    const wasCorrect = go.ok === 1;
    if (wasCorrect) {
      expect(go.lastOkDay).toBe(TODAY);
      expect(go.wrong).toBe(2);
    } else {
      expect(go.wrong).toBe(3);
      expect(go.lastDay).toBe(TODAY);
    }
    // هر پایهٔ تازهای که از پاسخِ درست آمده باشد نباید ساخته شده باشد
    for (const [base, e] of Object.entries(after)) {
      if (base !== "go") expect(e.wrong).toBeGreaterThanOrEqual(1); // فقط از نادرستها میآید
    }
  });

  it("مرورِ اشتباهها (r401) به ok هم عبور نمیکند — زیرِجلسه از هر دو در عبور است", () => {
    useStudy.setState({
      drillMistakes: { verbs: { go: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } },
    });
    startDrill();
    runFullSession((i) => i % 4);
    const afterFull = useStudy.getState().drillMistakes["verbs"]!;
    if (screen.queryByRole("button", { name: "مرور اشتباههای تمرین" })) {
      runReplay();
      expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
      expect(useStudy.getState().drillMistakes["verbs"]).toEqual(afterFull); // هیچ ردیفی جابهجا نشد
    }
  });

  it("معرفی: بی‌سررسید هیچ؛ با سررسید چیپِ زمردی — مسلطدهنده شمرده نمیشود", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // سررسید
          come: { wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-21" }, // مسلط — بی شمارش
          see: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" }, // امروز — هنوز سررسید نیست
        },
      },
    });
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    const due = countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY);
    expect(due).toBe(1); // فقط go
    expect(
      screen.getByLabelText(`سررسیدهای مرور این تمرین: ${faNum(1)} مورد`),
    ).toBeTruthy();
    // چیپِ خطایِ r413 در همان معرفی: سه ردیفِ ثبتشده (مسلط هم میشمارد — دو حقیقتِ جدا)
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۳ مورد ثبتشده")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull(); // فازِ run
  });

  it("بی‌بانک: چیپِ سررسید و چیپِ خطا هیچ رندر نمیکند — ادعایِ صفرِ صادق", () => {
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull();
    expect(screen.queryByLabelText(/بانک خطاهای این تمرین/)).toBeNull();
  });

  it("چیپِ سررسید مالِ بانکِ خودش است — سررسیدِ بانکِ دیگر نشت نمیکند", () => {
    useStudy.setState({
      drillMistakes: { phonemes: { "æ": { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } },
    });
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull();
  });
});
