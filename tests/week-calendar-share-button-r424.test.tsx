// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r424 — «دکمهٔ هم‌رسانیِ بومیِ کارتِ تقویمِ هفته» — دوقلویِ r306 برای
// جفتِ تقویمِ هفته. قفلها:
//  · بانکِ مخلوط: دکمهٔ Share2 درونِ خودِ نوار، کنارِ دروازهٔ دانلود —
//    با ariaِ شمارندهٔ همان نوار و titleِ کامل
//  · پایِ سبز: blobِ واقعی → رویدادِ week_calendar_share یکبار (gated بر
//    blob — قراردادِ r306) + shareImageFile با Fileِ vision2-review-week.png
//    + توستِ گویشِ خودِ درگاه («📨 تقویمِ هفته هم‌رسانی شد»)
//  · پایِ failed: شیت رد شد → رویدادِ ساختهشده پابرجاست (r306) + پیامِ
//    صادقانهٔ «هم‌رسانی ممکن نشد» — وامگیرِ imageFailToast نیست
//  · cancelled: لغوِ کاربر ساکت است — هیچ توستی (قراردادِ share-card)
//  · بیِ بوم: blobِ تهی → هیچ رویدادی (r344)، هیچ شیتی؛ توستِ صادقِ
//    خانواده میماند (قراردادِ r287/r306 — outcome از failed میماند)
//  · کمربندوبندِ مشترک: کلیکِ هم‌رسانی در اثنایِ کارِ بوم (imgBusy) هیچ؛
//    کلیکِ دوم در اثنایِ شیتِ باز هم — یک شیت در هر لحظه
//  · گاردِ r236 ارثی: هفتهٔ تماماً دور → دکمهٔ هم‌رسانی هم غایب
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";

const { blobSpy, weekCalSpy, shareSpy, toastSpy, trackSpy } = vi.hoisted(() => ({
  blobSpy: vi.fn(),
  weekCalSpy: vi.fn(),
  shareSpy: vi.fn(),
  toastSpy: vi.fn(),
  trackSpy: vi.fn(),
}));

vi.mock("@/lib/result-image", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/result-image")>();
  return { ...actual, buildWeekCalendarBlob: blobSpy, downloadWeekCalendarImage: weekCalSpy };
});
vi.mock("@/lib/share-card", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/share-card")>();
  return { ...actual, shareImageFile: (...args: unknown[]) => shareSpy(...(args as [])) };
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

const shareBtn = () =>
  screen.queryByLabelText(`هم‌رسانی تصویرِ تقویمِ هفته — ${faNum(3)} موردِ بازگشت در ${faNum(3)} روز`);
const saveBtn = () =>
  screen.queryByLabelText(`ذخیرهٔ تصویرِ تقویمِ هفته — ${faNum(3)} موردِ بازگشت در ${faNum(3)} روز`);
const seedLadder = () =>
  useStudy.setState({
    drillMistakes: {
      verbs: { go: dueEntry(), come: graceEntry(), see: graceEntry({ ok: 2, wrong: 3 }) },
    },
  });

describe("weekly-report r424 — دکمهٔ هم‌رسانیِ کارتِ تقویمِ هفته", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
    blobSpy.mockReset();
    weekCalSpy.mockReset();
    shareSpy.mockReset();
    toastSpy.mockReset();
    trackSpy.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("بانکِ مخلوط: دکمهٔ هم‌رسانی درونِ نوار، کنارِ دروازهٔ دانلود — aria و titleِ خانواده", () => {
    seedLadder();
    render(<ReportCard open onClose={() => {}} />);
    expect(shareBtn()).toBeTruthy();
    expect(saveBtn()).toBeTruthy(); // دو دروازهٔ یک ارزیابی — کنارِ هم
    expect(shareBtn()!.getAttribute("title")).toBe("هم‌رسانیِ کارتِ تقویمِ هفته با شیتِ خودِ سیستم");
    expect(shareBtn()!.hasAttribute("disabled")).toBe(false);
  });

  it("پایِ سبز: رویدادِ week_calendar_share یکبار (gated بر blob) + Fileِ نامدار + توستِ گویشِ خودِ درگاه", async () => {
    seedLadder();
    blobSpy.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    shareSpy.mockResolvedValue("shared");
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(shareBtn()!);
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        title: "📨 تقویمِ هفته هم‌رسانی شد",
        description: "کارت با شیتِ خودِ سیستم فرستاده شد.",
        duration: 3000,
      });
    });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("week_calendar_share");
    expect(shareSpy).toHaveBeenCalledTimes(1);
    const req = shareSpy.mock.calls[0][0] as { file: File; title: string; text: string };
    expect(req.file.name).toBe("vision2-review-week.png");
    expect(req.file.type).toBe("image/png");
    expect(req.title).toBe("تقویمِ هفتهٔ پیشِ رو — وب‌کتاب ویژن ۲");
    expect(req.text).toBe(`تقویمِ مرورِ هفتهٔ پیشِ رو: ${faNum(3)} موردِ بازگشت در ${faNum(3)} روز`);
  });

  it("پایِ failed: شیت رد شد — رویدادِ blobِ ساختهشده پابرجا (r306) + پیامِ صادقانه، وامگیرِ imageFailToast نیست", async () => {
    seedLadder();
    blobSpy.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    shareSpy.mockResolvedValue("failed");
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(shareBtn()!);
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith({
        title: "هم‌رسانی ممکن نشد",
        description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.",
        duration: 3000,
      });
    });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("week_calendar_share");
  });

  it("cancelled: لغوِ کاربر ساکت است — هیچ توستی؛ رویدادِ blob پابرجاست", async () => {
    seedLadder();
    blobSpy.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    shareSpy.mockResolvedValue("cancelled");
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(shareBtn()!);
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy).not.toHaveBeenCalled();
    expect(trackSpy).toHaveBeenCalledTimes(1);
  });

  it("بیِ بوم: blobِ تهی — هیچ رویدادی، هیچ شیتی؛ توستِ صادقِ خانواده (قراردادِ r287/r306 — outcome از failed میماند)", async () => {
    seedLadder();
    blobSpy.mockResolvedValue(null);
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(shareBtn()!);
    await waitFor(() => expect(blobSpy).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 10)); // تسمهٔ میکروتسکهایِ ادامهٔ گیت — برسد به تهی
    // r344 — هیچ رویدادی بیگیت نیست: blobِ تهی رویدادی ندارد
    expect(trackSpy).not.toHaveBeenCalled();
    expect(shareSpy).not.toHaveBeenCalled();
    // قراردادِ خانوادهٔ share-card (r287/r306): outcome از "failed" میماند —
    // پیامِ صادقانهٔ «هم‌رسانی ممکن نشد» همان است؛ بیِ وامِ imageFailToast.
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).toHaveBeenCalledWith({
      title: "هم‌رسانی ممکن نشد",
      description: "می‌توانی عکس را ذخیره کنی و خودت بفرستی.",
      duration: 3000,
    });
  });

  it("کمربندوبندِ مشترک: هم‌رسانی در اثنایِ کارِ بوم هیچ؛ کلیکِ دوم در اثنایِ شیت هم — یک کار در هر لحظه", async () => {
    seedLadder();
    let release!: (v: boolean) => void;
    weekCalSpy.mockReturnValue(new Promise<boolean>((res) => (release = res)));
    render(<ReportCard open onClose={() => {}} />);
    fireEvent.click(saveBtn()!); // بوم مشغول شد
    fireEvent.click(shareBtn()!); // imgBusy — هیچ نباید بکند
    expect(blobSpy).not.toHaveBeenCalled();
    release(true);
    await waitFor(() => expect(weekCalSpy).toHaveBeenCalledTimes(1));
    // حالا نوبتِ شیت: دو کلیکِ پیاپی در اثنایِ شیتِ باز — یکبار
    let releaseShare!: (v: "shared") => void;
    blobSpy.mockResolvedValue(new Blob(["png"], { type: "image/png" }));
    shareSpy.mockReturnValue(new Promise<"shared">((res) => (releaseShare = res)));
    fireEvent.click(shareBtn()!);
    fireEvent.click(shareBtn()!);
    releaseShare("shared");
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    // رویدادِ share دقیقاً یکبار — releaseِ دروازهٔ دانلودِ بالادستِ خودش
    // week_calendar_image را مجازانه روشن کرده است (gated بر okِ خودش).
    const shareEvents = trackSpy.mock.calls.filter((c) => c[0] === "week_calendar_share");
    const imageEvents = trackSpy.mock.calls.filter((c) => c[0] === "week_calendar_image");
    expect(shareEvents.length).toBe(1);
    expect(imageEvents.length).toBe(1);
  });

  it("هفتهٔ تماماً دور: دکمهٔ هم‌رسانی هم غایب — r236 ارثی از خودِ نوار", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { run: graceFar() }, // grace8 — بیرونِ پنجرهٔ ۷روزه
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    expect(screen.queryByLabelText(/هم‌رسانی تصویرِ تقویمِ هفته/)).toBeNull();
    expect(screen.queryByLabelText(/این هفته چیزی برنمیگردد/)).toBeTruthy();
  });
});
