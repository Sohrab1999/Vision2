// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r423 — «دکمهٔ کارتِ تصویریِ تقویمِ هفته» — قفلهایِ نمایِ کارنامه.
//
// دکمه درونِ خودِ نوارِ r422 زندگی میکند (نوارِ ساکن، پرترهاش خودش
// میشود) — قفلها:
//  · بیِ بانکِ خطا: نوار غایب و دکمه هم غایب (r236 ارثی)
//  · بانکِ مخلوط: دکمه با ariaِ شمارندهٔ همان نوار حاضر است
//  · پایِ سبز: ساختِ موفق (true) → توستِ گویشِ خودِ درگاه («🖼 عکسِ
//    تقویمِ هفته ذخیره شد» + «هفت خانهٔ پیشِ رو آمادهٔ فرستادن است.»)
//    + رویدادِ week_calendar_image یکبار — gated بر ok (قراردادِ
//    r287/288؛ هیچ رویدادی بیگیت نیست)
//  · پایِ سرخ: ساختِ ناکام (false) → مالکِ نامدارِ r397 (imageFailToast)
//    جفتِ خانواده را میسوزاند + هیچ رویدادی نیست (قاعدهٔ r344)
//  · کمربندوبند: imgBusyِ مشترکِ خانواده — کلیکِ دوم در اثنایِ کارِ بوم
//    هیچ نداند (دروازهٔ هفته‌نامه و تقویمِ هفته یک کمربند دارند)
//  · گاردِ دکمهٔ بیپنجره: هفتهٔ تماماً دور → نوارِ آرام است، دکمه غایب
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";

const { weekCalSpy, toastSpy, trackSpy } = vi.hoisted(() => ({
  weekCalSpy: vi.fn(),
  toastSpy: vi.fn(),
  trackSpy: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/result-image")>();
  return { ...actual, downloadWeekCalendarImage: weekCalSpy };
});
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toasts: [], toast: toastSpy, dismiss: vi.fn() }),
  toast: (...args: unknown[]) => toastSpy(...args),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

const TODAY = daysAgoKey(0);
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});
const graceEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});
const graceFar = (over: Record<string, unknown> = {}) => ({
  wrong: 5,
  ok: 4,
  lastDay: YESTERDAY,
  lastOkDay: TODAY,
  ...over,
});

const saveBtn = () => screen.queryByLabelText(`ذخیرهٔ تصویرِ تقویمِ هفته — ${faNum(3)} موردِ بازگشت در ${faNum(3)} روز`);

describe("weekly-report r423 — دکمهٔ کارتِ تصویریِ تقویمِ هفته", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
    weekCalSpy.mockReset();
    toastSpy.mockReset();
    trackSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("بیِ بانکِ خطا: دکمه غایب — r236 ارثی از خودِ نوار", () => {
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.queryByLabelText(/ذخیرهٔ تصویرِ تقویمِ هفته/)).toBeNull();
  });

  it("بانکِ مخلوط: دکمه درونِ نوار با ariaِ شمارندهٔ همان نوار", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(), // امروز
          come: graceEntry(), // فردا
          see: graceEntry({ ok: 2, wrong: 3 }), // پسفردا
          run: graceFar(), // پس از هفته
        },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(saveBtn()).toBeTruthy();
    expect(saveBtn()!.getAttribute("title")).toBe(
      "تصویرِ تقویمِ هفتهٔ پیشِ رو — همان هفت خانه به‌صورتِ کارتِ PNGِ همرسانی",
    );
  });

  it("پایِ سبز: توستِ گویشِ خودِ درگاه + رویدادِ week_calendar_image یکبار", async () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), come: graceEntry(), see: graceEntry({ ok: 2, wrong: 3 }) },
      },
    });
    weekCalSpy.mockResolvedValue(true);
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(saveBtn()!);
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        title: "🖼 عکسِ تقویمِ هفته ذخیره شد",
        description: "هفت خانهٔ پیشِ رو آمادهٔ فرستادن است.",
        duration: 3000,
      });
    });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("week_calendar_image");
    expect(weekCalSpy).toHaveBeenCalledTimes(1);
  });

  it("پایِ سرخ: مالکِ نامدارِ r397 جفتِ خانواده را میسوزاند + هیچ رویدادی نیست (r344)", async () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), come: graceEntry(), see: graceEntry({ ok: 2, wrong: 3 }) },
      },
    });
    weekCalSpy.mockResolvedValue(false);
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(saveBtn()!);
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        title: "خطا در ساخت تصویر",
        description: "لطفاً دوباره تلاش کن.",
        duration: 3000,
      });
    });
    expect(trackSpy).not.toHaveBeenCalled();
  });

  it("کمربندوبندِ خانواده: کلیک در اثنایِ کارِ بوم هیچ نمیداند — یک کمربند با دروازهٔ هفته‌نامه", async () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), come: graceEntry(), see: graceEntry({ ok: 2, wrong: 3 }) },
      },
    });
    let release!: (v: boolean) => void;
    weekCalSpy.mockReturnValue(new Promise<boolean>((res) => (release = res)));
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(saveBtn()!);
    fireEvent.click(saveBtn()!); // دوم — imgBusy است
    release(true);
    await waitFor(() => expect(weekCalSpy).toHaveBeenCalledTimes(1));
    // هیچ توستی دوبار نیست — کلیکِ دوم اصلاً گیت را باز نکرد
    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it("هفتهٔ تماماً دور: سطرِ آرام است — دکمه غایب (وعدهٔ بیپشتوانه، r236)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { run: graceFar() }, // grace8 — بیرونِ پنجرهٔ ۷روزه
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.queryByLabelText(/ذخیرهٔ تصویرِ تقویمِ هفته/)).toBeNull();
    expect(screen.queryByLabelText(/این هفته چیزی برنمیگردد/)).toBeTruthy();
  });
});
