// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 102 «هم‌رسانی» در صفحهٔ پایان نبرد — Web Share API Level 2:
//   ① دکمه فقط با پشتیبانیِ واقعیِ canShare({files}) رندر می‌شود
//   ② کلیک → buildDuelDoneBlob با همان EndPayloadِ صادقِ «عکسِ این نبرد»
//   ③ shareImageFile با Fileِ نام‌دار vision2-duel-<outcome>.png + متنِ ریبون
//   ④ چرخهٔ busy؛ نتیجه‌ها: shared → تُستِ موفق، cancelled → سکوت، failed → تُستِ خطا
//   ⑤ کارتِ نساخته (blob null) → بدونِ فراخوانیِ share + مسیرِ خطا
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { toastSpy, canShareSpy, shareSpy, buildBlob, doneImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  canShareSpy: vi.fn(() => true),
  shareSpy: vi.fn(),
  buildBlob: vi.fn(),
  doneImage: vi.fn(),
}));

vi.mock("@/lib/result-image", () => ({
  downloadDuelDoneImage: (...args: unknown[]) => doneImage(...args),
  buildDuelDoneBlob: (...args: unknown[]) => buildBlob(...args),
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

import DuelDone from "@/components/study/duel/duel-done";
import type { EndPayload } from "@/components/study/duel/duel-types";

const player = (sid: string, name: string, score: number, correct: number) => ({
  sid,
  name,
  color: "#a8a29e",
  qi: 10,
  score,
  correct,
  answered: 10,
  done: true,
  disconnected: false,
});

const renderDone = (winner: string | null = "s1") =>
  render(
    <DuelDone
      endData={{
        reason: "finished",
        winner,
        total: 10,
        startedAt: 1_000_000,
        players: [player("s1", "من", 999, 8), player("s2", "سینا", 1150, 9)],
      }}
      mySid="s1"
      myFinishAt={1_000_000 + 95_000}
      oppConnected
      rematchVotes={0}
      rematch={() => {}}
      leaveRoom={() => {}}
    />
  );

const btn = () => screen.getByRole("button", { name: "هم‌رسانی" });
const pngBlob = () => new Blob(["pngdata"], { type: "image/png" });

describe("هم‌رسانیِ بومیِ نبرد (Task 102)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    canShareSpy.mockReset().mockReturnValue(true);
    shareSpy.mockReset();
    buildBlob.mockReset();
    doneImage.mockReset();
  });

  it("canShare({files}) واقعی → دکمهٔ «هم‌رسانی» کنارِ «عکسِ این نبرد»", () => {
    buildBlob.mockResolvedValue(pngBlob());
    renderDone();
    expect(btn()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /عکسِ این نبرد/ })).toBeInTheDocument();
  });

  it("کلیک → buildBlob با قراردادِ همان EndPayload (تفکیکِ ۹۹) + share با فایلِ نام‌دار و متنِ ریبونِ صادق", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("shared");
    renderDone();
    fireEvent.click(btn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));

    // همان قراردادِ کارتِ «عکسِ این نبرد» — یک حقیقت، دو بستر
    expect(buildBlob).toHaveBeenCalledTimes(1);
    const card = buildBlob.mock.calls[0][0];
    expect(card.outcome).toBe("win");
    expect(card.myScore).toBe(999);
    expect(card.oppScore).toBe(1150);
    expect(card.base).toBe(800);
    expect(card.bonus).toBe(199);
    expect(card.durationSec).toBe(95);
    expect(card.receipt).toBe(false);

    const req = shareSpy.mock.calls[0][0] as { file: File; title: string; text: string };
    expect(req.file.name).toBe("vision2-duel-win.png");
    expect(req.file.type).toBe("image/png");
    expect(req.file.size).toBe(pngBlob().size);
    expect(req.title).toBe("نبرد واژگان — وب‌کتاب ویژن ۲");
    expect(req.text).toBe("پیروزی در نبرد! ۹۹۹ به ۱۱۵۰");

    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0].title).toContain("هم‌رسانی شد");
  });

  it("حینِ هم‌رسانیِ ناتمام دکمه معلول است و پس از پایان آزاد می‌شود", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    let resolve!: (v: "shared") => void;
    shareSpy.mockImplementation(() => new Promise<"shared">((res) => (resolve = res)));
    renderDone();
    fireEvent.click(btn());
    expect(btn()).toBeDisabled();
    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    resolve("shared");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("لغوِ کاربر (cancelled) → سکوت کامل — نه تُستِ خطا نه تُستِ موفق", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("cancelled");
    renderDone();
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(shareSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("failed → تُستِ خطا با راهِ جایگزین (ذخیره)", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("failed");
    renderDone();
    fireEvent.click(btn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy.mock.calls[0][0].title).toBe("هم‌رسانی ممکن نشد");
    expect(toastSpy.mock.calls[0][0].description).toContain("ذخیره");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("کارتِ نساخته (blob null) → share فراخوانی نمی‌شود و مسیرِ خطا می‌رود", async () => {
    buildBlob.mockResolvedValue(null);
    shareSpy.mockResolvedValue("shared");
    renderDone();
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(shareSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0].title).toBe("هم‌رسانی ممکن نشد");
  });

  it("بدونِ پشتیبانی (canShare false) → دکمه در کار نیست — نه دکمهٔ مرده", () => {
    canShareSpy.mockReturnValue(false);
    renderDone();
    expect(screen.queryByRole("button", { name: "هم‌رسانی" })).not.toBeInTheDocument();
    // دکمهٔ ذخیرهٔ همیشگی سرِ جایش است
    expect(screen.getByRole("button", { name: /عکسِ این نبرد/ })).toBeInTheDocument();
  });

  it("مساوی: متنِ ریبون و نامِ فایل از نتیجهٔ صادق می‌آید", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("cancelled");
    render(
      <DuelDone
        endData={{
          reason: "forfeit",
          winner: null,
          total: 10,
          startedAt: 1_000_000,
          players: [player("s1", "من", 500, 5), player("s2", "امیر", 500, 5)],
        }}
        mySid="s1"
        myFinishAt={0}
        oppConnected={false}
        rematchVotes={0}
        rematch={() => {}}
        leaveRoom={() => {}}
      />
    );
    fireEvent.click(btn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));
    const req = shareSpy.mock.calls[0][0] as { file: File; text: string };
    expect(req.file.name).toBe("vision2-duel-tie.png");
    expect(req.text).toBe("مساوی — رقابت نزدیک ۵۰۰ به ۵۰۰");
    expect(toastSpy).not.toHaveBeenCalled();
  });
});
