// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 120 — the story card (PNG) buttons on the my-words story panel:
//   ① «ذخیرهٔ کارتِ داستان» exists only once a story really exists
//   ② it hands downloadStoryCardImage the REAL story payload + honest source
//   ③ «هم‌رسانی» renders only when canShareImageFiles() is really true
//   ④ share click → buildStoryCardBlob → blobToFile(vision2-story.png)
//     → shareImageFile with the honest highlighted-words Persian text
//   ⑤ outcomes: shared → success toast, cancelled → full silence,
//     failed / null blob → error toast
//   ⑥ download failure → honest error toast
// jsdom has no canvas: @/lib/result-image is mocked (the pure wrap
// contract lives in story-card.test.ts — here only the wiring).
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
  downloadStoryCardImage: (...args: unknown[]) => cardImage(...args),
  buildStoryCardBlob: (...args: unknown[]) => buildBlob(...args),
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

vi.mock("@/lib/speak", () => ({
  speak: vi.fn(() => Promise.resolve(vi.fn())),
  stopSpeaking: vi.fn(),
}));

import MyWordsStory from "@/components/study/practice/my-words-story";
import { useStudy } from "@/lib/study-store";
import type { ResolvedStar } from "@/lib/my-words-resolve";

const WORDS = [
  { key: "1:ability", en: "ability", fa: "توانایی" },
  { key: "2:journey", en: "journey", fa: "سفر" },
  { key: "3:brave", en: "brave", fa: "شجاع" },
  { key: "4:discover", en: "discover", fa: "کشف‌کردن" },
];

const STARS = WORDS.map((w) => ({ key: w.key, en: w.en, fa: w.fa })) as unknown as ResolvedStar[];

const STORY =
  "The brave girl set out on a journey to discover the sea. Her ability to listen made every wave a friend.";
const SUMMARY = "دختری شجاع با تواناییِ شنیدن، دریا را کشف می‌کند.";

const AI_BODY = {
  story: STORY,
  summary: SUMMARY,
  source: "ai",
  cached: false,
  words: WORDS,
};

const pngBlob = () => new Blob(["pngdata"], { type: "image/png" });

async function renderDone(body: unknown = AI_BODY) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => body });
  render(<MyWordsStory stars={STARS} />);
  fireEvent.click(screen.getByLabelText("ساخت داستان با واژه‌های نشان‌شده"));
  await waitFor(() => expect(screen.getByRole("button", { name: "ذخیرهٔ عکس داستان" })).toBeInTheDocument());
}

const saveBtn = () => screen.getByRole("button", { name: "ذخیرهٔ عکس داستان" });
const shareBtn = () => screen.getByRole("button", { name: "هم‌رسانی عکس داستان" });

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

describe("MyWordsStory — story card buttons (task 120)", () => {
  it("hides the card buttons until a story actually exists", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => AI_BODY });
    render(<MyWordsStory stars={STARS} />);
    expect(screen.queryByRole("button", { name: "ذخیرهٔ عکس داستان" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("ساخت داستان با واژه‌های نشان‌شده"));
    await waitFor(() => expect(saveBtn()).toBeInTheDocument());
  });

  it("hands downloadStoryCardImage the real story payload", async () => {
    cardImage.mockResolvedValue(true);
    await renderDone();
    fireEvent.click(saveBtn());
    await waitFor(() => expect(cardImage).toHaveBeenCalledTimes(1));
    const arg = cardImage.mock.calls[0][0];
    expect(arg.story).toBe(STORY);
    expect(arg.summary).toBe(SUMMARY);
    expect(arg.words).toEqual(WORDS);
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
    expect(screen.queryByRole("button", { name: "هم‌رسانی عکس داستان" })).not.toBeInTheDocument();
  });

  it("shares a named PNG file with the honest Persian highlight text", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("shared");
    await renderDone();
    fireEvent.click(shareBtn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    const req = shareSpy.mock.calls[0][0];
    expect(req.file.name).toBe("vision2-story.png");
    expect(req.file.type).toBe("image/png");
    // brave + journey + discover + ability = ۴ جایِ نشان‌شدهٔ واقعی
    expect(req.text).toBe("📖 داستانی با واژه‌های خودم — ۴ واژهٔ برجسته");
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
