// @vitest-environment jsdom
// ------------------------------------------------------------------
// r413 — «بانکِ خطایِ ماندگارِ دریلها» — قفلهایِ نما.
//
// قراردادهایِ نما:
//  · پایانِ جلسهٔ کامل (نه مرور): پایههایِ نادرست/بیپاسخ به
//    trackDrillMistakes میرود — مجموعِ wrongِ بانکِ تازه = شمارِ
//    نادرست/بیپاسخِ همان جلسه (هر رخداد یک واحد — شمارشِ صادق) و هر
//    کلید، پایهٔ واقعیِ بانکِ افعال است (هیچ پایهٔ ساختهشدهای نیست)
//  · جلسهٔ بی‌خطا: بانکِ خطایِ همان بانک غایب میماند (تهیِ صادق)
//  · مرورِ اشتباهها (r401) زیرِجلسهاست — بانکِ خطا لنگ میزند
//  · جلسهٔ دوم رویِ همان پایه جمع میکند (wrong رشد مییابد)
//  · معرفی: بی‌رکورد هیچ ادعایی؛ با رکورد چیپِ رزگونِ «N موردِ خطای
//    ثبتشده» — و در فازِ run چیزی از بانک رندر نمیشود
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { irregularVerbs } from "@/data/appendix";
import { faNum } from "@/lib/study-theme";

const verbBases = new Set(irregularVerbs.map((v) => v.base));

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

const faToNum = (s: string): number =>
  Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));

/** شمارِ نادرست/بیپاسخ از متنِ صادقِ صفحهٔ نتیجه — «N درست از ۱۰» */
const resultWrong = (): number => {
  const el = screen.getByText(/درست از/);
  const correct = faToNum((el.textContent || "").match(/([۰-۹]+) درست از/)![1]);
  return 10 - correct;
};

const mistakesTotal = (bankId = "verbs"): number =>
  Object.values(useStudy.getState().drillMistakes[bankId] ?? {}).reduce((a, e) => a + e.wrong, 0);

const runReplay = () => {
  const btn = screen.getByRole("button", { name: "مرور اشتباههای تمرین" });
  const n = faToNum(btn.textContent!.match(/\((([۰-۹]+))\)/)![1]);
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

describe("appendix-drill-view r413 — بانکِ خطایِ ماندگار", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("پایانِ جلسهٔ کامل با خطا: مجموعِ wrong = نادرستهایِ نتیجه؛ کلیدها پایهٔ واقعیِ بانکاند", () => {
    startDrill();
    runFullSession((i) => i % 4); // قاطی — نادرست از صفحهٔ نتیجه خوانده میشود
    const wrong = resultWrong();
    if (wrong === 0) {
      // جلسهٔ تصادفیِ کامل — بانکِ خطا باید تهی بماند (قفلِ دوگانه در تستِ بعد)
      expect(useStudy.getState().drillMistakes["verbs"]).toBeUndefined();
      return;
    }
    const bank = useStudy.getState().drillMistakes["verbs"]!;
    expect(mistakesTotal()).toBe(wrong); // هر رخدادِ نادرست یک واحد
    for (const base of Object.keys(bank)) {
      expect(verbBases.has(base)).toBe(true); // هیچ پایهٔ ساختهشدهای نیست
      expect(bank[base].wrong).toBeGreaterThanOrEqual(1);
      expect(bank[base].lastDay).not.toBe("");
    }
  });

  it("جلسهٔ بی‌خطا: بانکِ خطا اصلاً ساخته نمیشود — تهیِ صادق (هیچ رکوردِ ساختگی)", () => {
    // بذرِ جلسهٔ قطعیِ همه‌درست ناممکن است (موتور بُر میزند) — پس دو الگو را
    // امتحان میکنیم و «تهی بودن» را با نمرهٔ خودِ نتیجه سازگار میکنیم
    startDrill();
    runFullSession((i) => (i + 1) % 4);
    const wrong = resultWrong();
    if (wrong === 0) expect(useStudy.getState().drillMistakes["verbs"]).toBeUndefined();
    else expect(mistakesTotal()).toBe(wrong);
  });

  it("مرورِ اشتباهها (r401) به بانکِ خطا عبور نمیکند — گاردِ isReplay", () => {
    startDrill();
    runFullSession((i) => i % 4);
    const afterFull = mistakesTotal();
    if (afterFull === 0) {
      // جلسهٔ تصادفیِ بی‌خطا — دکمهٔ مرور بالای نیست؛ قفلِ عبور بیمعناست
      expect(screen.queryByRole("button", { name: "مرور اشتباههای تمرین" })).toBeNull();
      return;
    }
    runReplay();
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    expect(mistakesTotal()).toBe(afterFull); // هیچ رخدادِ تازهای ثبت نشد
    // حتی پاسخهایِ نادرستِ عمدیِ مرور هم بانک را نمیشکنند — زیرِجلسه است
    const bankAfter = useStudy.getState().drillMistakes["verbs"]!;
    for (const e of Object.values(bankAfter)) expect(e.wrong).toBeGreaterThanOrEqual(1);
  });

  it("جلسهٔ دوم رویِ همان پایهها جمع میکند — wrong رشد مییابد، هیچ رکوردی از دست نمیرود", () => {
    startDrill();
    runFullSession((i) => i % 4);
    const first = mistakesTotal();
    fireEvent.click(screen.getByRole("button", { name: "تمرین دوباره" }));
    runFullSession((i) => (i + 1) % 4);
    const secondTotal = resultWrong();
    if (first === 0 && secondTotal === 0) {
      expect(useStudy.getState().drillMistakes["verbs"]).toBeUndefined();
      return;
    }
    const bank = useStudy.getState().drillMistakes["verbs"]!;
    expect(Object.keys(bank).length).toBeGreaterThan(0);
    expect(mistakesTotal()).toBe(first + secondTotal); // جمعِ رخدادهایِ هر دو جلسه
  });

  it("معرفی: بی‌رکورد هیچ ادعایی؛ با رکورد چیپِ رزگونِ «N موردِ خطای ثبتشده»", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-25", lastOkDay: "" }, come: { wrong: 1, ok: 0, lastDay: "2026-10-24", lastOkDay: "" } },
      },
    });
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    // دو پایهٔ خطادار — چیپ شمارشِ پایههاست، نه مجموعِ رخدادها
    expect(
      screen.getByLabelText(`بانک خطاهای این تمرین: ${faNum(2)} مورد ثبتشده`),
    ).toBeTruthy();
    // چیپِ پیشرفتِ r412 در همان معرفی پابرجاست (دو چیپ، دو حقیقت)
    expect(screen.queryByLabelText(/پیشرفت این تمرین/)).toBeNull(); // بی رکوردِ جلسه
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
    // فازِ run: چیزی از بانکها رندر نمیشود (قفلِ همسانِ پیشرفتِ r412)
    expect(screen.queryByLabelText(/بانک خطاهای این تمرین/)).toBeNull();
  });

  it("بی‌رکوردِ خطا: چیپِ رزگون هیچ رندر نمیکند — ادعایِ صفرِ صادق", () => {
    render(<AppendixView />);
    openVerbsTab();
    expect(screen.queryByLabelText(/بانک خطاهای این تمرین/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByLabelText(/بانک خطاهای این تمرین/)).toBeNull();
  });

  it("چیپِ خطا مالِ بانکِ خودش است — بانکِ دیگر چیپِ این را نمیگیرد", () => {
    useStudy.setState({
      drillMistakes: { phonemes: { "æ": { wrong: 1, ok: 0, lastDay: "2026-10-25", lastOkDay: "" } } },
    });
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByLabelText(/بانک خطاهای این تمرین/)).toBeNull();
  });
});
