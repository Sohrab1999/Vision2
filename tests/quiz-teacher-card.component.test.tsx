// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 118 — the teacher card (PNG) buttons on the quiz-teacher panel:
//   ① «ذخیرهٔ کارتِ معلم» always renders once the review exists, and
//     hands downloadTeacherCardImage the REAL session outcome (review +
//     correct/total/percent/userName + honest source)
//   ② «هم‌رسانی» renders only when canShareImageFiles() is really true
//   ③ share click → buildTeacherCardBlob → blobToFile(vision2-teacher.png)
//     → shareImageFile with the honest Persian outcome text
//   ④ outcomes: shared → success toast, cancelled → full silence,
//     failed / null blob → error toast
//   ⑤ download failure → honest error toast
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

vi.mock("@/lib/result-image", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/result-image")>()),
  downloadTeacherCardImage: (...args: unknown[]) => cardImage(...args),
  buildTeacherCardBlob: (...args: unknown[]) => buildBlob(...args),
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
  toast: (...args: unknown[]) => toastSpy(...args),
  useToast: () => ({ toast: toastSpy }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

import QuizTeacher from "@/components/study/quiz/quiz-teacher";

const IDS = ["l1:q1", "l1:q2", "l2:q1"];
const ANSWERS: (number | undefined)[] = [1, 0, undefined];

const AI_BODY = {
  fingerprint: "x",
  intro: "در این جلسه ۱ از ۳ سؤال درست بود و مسیرِ رشدت روشن است.",
  strength: "در «واژگان» دقتِ خوبی داشتی.",
  advice: "گرامرِ حالِ استمراری را مرور کن.",
  source: "ai",
  cached: false,
};

const pngBlob = () => new Blob(["pngdata"], { type: "image/png" });

async function renderDone(body: unknown = AI_BODY) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => body });
  render(
    <QuizTeacher ids={IDS} answers={ANSWERS} correct={1} total={3} userName="آرش" />
  );
  fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
  await waitFor(() => expect(screen.getByText(AI_BODY.intro)).toBeInTheDocument());
}

const saveBtn = () => screen.getByRole("button", { name: "ذخیرهٔ عکس نظر معلم" });
const shareBtn = () => screen.getByRole("button", { name: "هم‌رسانی عکس نظر معلم" });

beforeEach(() => {
  cleanup();
  toastSpy.mockReset();
  canShareSpy.mockReset().mockReturnValue(true);
  shareSpy.mockReset();
  buildBlob.mockReset();
  cardImage.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("کارتِ معلم (Task 118)", () => {
  it("ذخیره always renders in done state and ships the real session outcome", async () => {
    cardImage.mockResolvedValue(true);
    await renderDone();
    expect(saveBtn()).toBeInTheDocument();
    fireEvent.click(saveBtn());
    await waitFor(() => expect(cardImage).toHaveBeenCalledTimes(1));
    const opts = cardImage.mock.calls[0][0] as {
      review: { intro: string; strength: string; advice: string };
      correct: number;
      total: number;
      percent: number;
      userName?: string;
      source?: string;
    };
    expect(opts.review).toEqual({ intro: AI_BODY.intro, strength: AI_BODY.strength, advice: AI_BODY.advice });
    expect(opts.correct).toBe(1);
    expect(opts.total).toBe(3);
    expect(opts.percent).toBe(33); // domain percentOf — one source of truth
    expect(opts.userName).toBe("آرش");
    expect(opts.source).toBe("ai");
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("ذخیره شد") }))
    );
  });

  it("download failure → the honest error toast", async () => {
    cardImage.mockResolvedValue(false);
    await renderDone();
    fireEvent.click(saveBtn());
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "خطا در ساخت تصویر" }))
    );
  });

  it("هم‌رسانی renders only with real canShare({files}) support", async () => {
    canShareSpy.mockReturnValue(false);
    await renderDone();
    expect(screen.queryByRole("button", { name: "هم‌رسانی عکس نظر معلم" })).not.toBeInTheDocument();
    expect(saveBtn()).toBeInTheDocument(); // the save path survives — honest degradation
  });

  it("share click → named PNG File + honest Persian outcome text → success toast", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("shared");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));

    expect(buildBlob).toHaveBeenCalledTimes(1);
    const req = shareSpy.mock.calls[0][0] as { file: File; title: string; text: string };
    expect(req.file.name).toBe("vision2-teacher.png");
    expect(req.file.type).toBe("image/png");
    expect(req.file.size).toBe(pngBlob().size);
    expect(req.title).toBe("معلمِ کارنامه — وب‌کتاب ویژن ۲");
    // Persian digits from the same faNum map — ۳۳٪ (۱ از ۳)
    expect(req.text).toBe("🎓 نظرِ معلم دربارهٔ کارنامه‌ام: ۳۳٪ (۱ از ۳)");

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("هم‌رسانی شد") }))
    );
  });

  it("cancelled → complete silence — a user cancel is not an event", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("cancelled");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(shareBtn()).not.toBeDisabled());
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("failed share → the fallback guidance toast", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("failed");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "هم‌رسانی ممکن نشد" }))
    );
  });

  it("null blob → no share call, the honest failure toast", async () => {
    buildBlob.mockResolvedValue(null);
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(expect.objectContaining({ title: "هم‌رسانی ممکن نشد" }))
    );
    expect(shareSpy).not.toHaveBeenCalled();
  });

  it("the offline fallback keeps its honest provenance on the card too", async () => {
    cardImage.mockResolvedValue(true);
    await renderDone({ ...AI_BODY, source: "fallback", cached: false });
    expect(screen.getByText("حالت آفلاین")).toBeInTheDocument();
    fireEvent.click(saveBtn());
    await waitFor(() => expect(cardImage).toHaveBeenCalledTimes(1));
    expect(cardImage.mock.calls[0][0].source).toBe("fallback");
  });
});
