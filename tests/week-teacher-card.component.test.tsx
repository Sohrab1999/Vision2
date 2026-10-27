// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 121 — the week card (PNG) buttons on the week-teacher panel:
//   ① «ذخیرهٔ کارتِ هفته» exists only once the verdict really exists
//   ② it hands downloadWeekCardImage the REAL review + stats + honest source
//   ③ «هم‌رسانی» renders only when canShareImageFiles() is really true
//   ④ share click → buildWeekCardBlob → blobToFile(vision2-week-teacher.png)
//     → shareImageFile with the honest Persian goal-days text
//   ⑤ outcomes: shared → success toast, cancelled → full silence,
//     failed / null blob → error toast
//   ⑥ download failure → honest error toast
// jsdom has no canvas: @/lib/result-image is mocked (pure helpers live
// in week-card.test.ts — here only the wiring).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastSpy, canShareSpy, shareSpy, buildBlob, cardImage, fetchMock } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  canShareSpy: vi.fn(() => true),
  shareSpy: vi.fn(),
  buildBlob: vi.fn(),
  cardImage: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/result-image", () => ({
  downloadWeekCardImage: (...args: unknown[]) => cardImage(...args),
  buildWeekCardBlob: (...args: unknown[]) => buildBlob(...args),
}));

vi.mock("@/lib/share-card", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/share-card")>();
  return {
    ...actual,
    canShareImageFiles: () => canShareSpy(),
    shareImageFile: (req: { file: File; title: string; text: string }) => shareSpy(req),
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

import WeekTeacher from "@/components/study/reports/week-teacher";
import { useStudy } from "@/lib/study-store";
import type { WeekTeacherStats } from "@/lib/week-teacher";

const STATS: WeekTeacherStats = {
  activities: 23,
  reviews: 12,
  quizzes: 2,
  words: 5,
  dictation: 1,
  rush: 3,
  activeDays: 3,
  goalDays: 3,
  prevActivities: 18,
  bestDay: 12,
  duels: 3,
  duelWins: 2,
  duelBest: 1100,
  thinkAvgMs: 1000,
  quickWeek: true,
  streak: 6,
};

const REVIEW_BODY = {
  intro: "این هفته ۲۳ فعالیت و ۳ نبرد در دفترت ثبت شد؛ ۳ روز از ۷ روز فعال بودی.",
  strength: "«مرور لغت» ستونِ این هفته‌ات بود — ۱۲ بار.",
  advice: "یک دیکتهٔ کوتاه گوش کن تا ستونِ دومِ هفته شود.",
  source: "ai",
  cached: true,
};

const pngBlob = () => new Blob(["pngdata"], { type: "image/png" });

async function renderDone(body: unknown = REVIEW_BODY) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => body });
  render(<WeekTeacher stats={STATS} />);
  fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "ذخیرهٔ عکس نظر معلم هفته" })).toBeInTheDocument()
  );
}

const saveBtn = () => screen.getByRole("button", { name: "ذخیرهٔ عکس نظر معلم هفته" });
const shareBtn = () => screen.getByRole("button", { name: "هم‌رسانی عکس نظر معلم هفته" });

beforeEach(() => {
  cleanup();
  toastSpy.mockReset();
  canShareSpy.mockReset().mockReturnValue(true);
  shareSpy.mockReset();
  buildBlob.mockReset();
  cardImage.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  useStudy.setState({ userName: "آرش" });
});

describe("WeekTeacher — week card buttons (task 121)", () => {
  it("hides the card buttons until the verdict actually exists", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => REVIEW_BODY });
    render(<WeekTeacher stats={STATS} />);
    expect(screen.queryByRole("button", { name: "ذخیرهٔ عکس نظر معلم هفته" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(saveBtn()).toBeInTheDocument());
  });

  it("hands downloadWeekCardImage the real verdict payload", async () => {
    cardImage.mockResolvedValue(true);
    await renderDone();
    fireEvent.click(saveBtn());
    await waitFor(() => expect(cardImage).toHaveBeenCalledTimes(1));
    const arg = cardImage.mock.calls[0][0];
    expect(arg.review.intro).toBe(REVIEW_BODY.intro);
    expect(arg.stats).toEqual(STATS);
    expect(arg.userName).toBe("آرش");
    expect(arg.source).toBe("ai");
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining("ذخیره") })
    );
  });

  it("hides native share when the browser really cannot share files", async () => {
    canShareSpy.mockReturnValue(false);
    await renderDone();
    expect(saveBtn()).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "هم‌رسانی عکس نظر معلم هفته" })).not.toBeInTheDocument();
  });

  it("shares a named PNG file with the honest Persian goal text", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("shared");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    const req = shareSpy.mock.calls[0][0];
    expect(req.file.name).toBe("vision2-week-teacher.png");
    expect(req.file.type).toBe("image/png");
    expect(req.text).toBe("🗓 داوریِ معلم برای این هفته: ۳ از ۷ روزِ هدف کامل");
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining("هم‌رسانی") })
    );
    expect(cardImage).not.toHaveBeenCalled();
  });

  it("stays fully silent when the user cancels the share sheet", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("cancelled");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("toasts an error when the share fails", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("failed");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "هم‌رسانی ممکن نشد" })
    );
  });

  it("never calls the share sheet with a null blob", async () => {
    buildBlob.mockResolvedValue(null);
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(shareSpy).not.toHaveBeenCalled();
  });

  it("toasts an honest error when the card render fails", async () => {
    cardImage.mockResolvedValue(false);
    await renderDone();
    fireEvent.click(saveBtn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalled());
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "خطا در ساخت تصویر" })
    );
  });
});
