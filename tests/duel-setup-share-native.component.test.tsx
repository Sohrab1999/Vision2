// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 102 «هم‌رسانیِ کارنامهٔ نبردها» — آیکنِ کنارِ دکمهٔ عکس در duel-setup:
//   ① فقط با پشتیبانیِ واقعیِ canShare({files}) و دفترچهٔ پُر رندر می‌شود
//   ② کلیک → buildDuelLedgerBlob با تجمیعِ صادقِ کلِ دفترچه + نامِ کاربر
//   ③ shareImageFile با Fileِ vision2-duels.png و متنِ آمارِ صادق (ارقامِ فارسی)
//   ④ چرخهٔ busy؛ shared → تُستِ موفق، cancelled → سکوت، failed → تُستِ خطا
//   ⑤ دفترچهٔ خالی یا بی‌پشتیبانی → بدونِ دکمه (نه دکمهٔ مرده)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

const { toastSpy, canShareSpy, shareSpy, buildBlob, ledgerImage } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  canShareSpy: vi.fn(() => true),
  shareSpy: vi.fn(),
  buildBlob: vi.fn(),
  ledgerImage: vi.fn(),
}));

vi.mock("@/lib/result-image", () => ({
  downloadDuelLedgerImage: (...args: unknown[]) => ledgerImage(...args),
  buildDuelLedgerBlob: (...args: unknown[]) => buildBlob(...args),
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

import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-13",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1000,
  oppScore: 800,
  myCorrect: 9,
  oppCorrect: 7,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

const renderSetup = () =>
  render(
    <DuelSetup
      conn="online"
      createRoom={() => {}}
      joinRoom={() => {}}
      joinInput=""
      setJoinInput={() => {}}
      joinBusy={false}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

const SAVE_LABEL = "گرفتن عکس کارنامهٔ نبردها";
const SHARE_LABEL = "هم‌رسانی کارنامهٔ نبردها";
const btn = () => screen.getByRole("button", { name: SHARE_LABEL });
const pngBlob = () => new Blob(["pngdata"], { type: "image/png" });

describe("هم‌رسانیِ کارنامهٔ نبردها (Task 102)", () => {
  beforeEach(() => {
    cleanup();
    toastSpy.mockReset();
    canShareSpy.mockReset().mockReturnValue(true);
    shareSpy.mockReset();
    buildBlob.mockReset();
    ledgerImage.mockReset();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [], userName: "" });
  });

  it("دفترچهٔ خالی → بخشِ تاریخچه رندر نمی‌شود و دکمهٔ هم‌رسانی هم نیست", () => {
    renderSetup();
    expect(screen.queryByRole("button", { name: SHARE_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: SAVE_LABEL })).not.toBeInTheDocument();
  });

  it("بی‌پشتیبانی → بدونِ دکمهٔ هم‌رسانی؛ دکمهٔ ذخیرهٔ همیشگی هست", () => {
    canShareSpy.mockReturnValue(false);
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();
    expect(screen.queryByRole("button", { name: SHARE_LABEL })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: SAVE_LABEL })).toBeInTheDocument();
  });

  it("کلیک → buildBlob با تجمیعِ کلِ دفترچه + نامِ کاربر؛ share با فایلِ نام‌دار و متنِ آمارِ صادق", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("shared");
    useStudy.setState({
      userName: "میلاد",
      duelHistory: [
        rec({ id: "d1", outcome: "win", myScore: 1200, opponent: "امیرمحمد" }),
        rec({ id: "d2", outcome: "loss", myScore: 600, opponent: "سینا" }),
        rec({ id: "d3", outcome: "win", myScore: 900, opponent: "امیر محمد" }),
      ],
    });
    renderSetup();
    expect(btn()).toBeInTheDocument();
    fireEvent.click(btn());
    await waitFor(() => expect(shareSpy).toHaveBeenCalledTimes(1));

    expect(buildBlob).toHaveBeenCalledTimes(1);
    const arg = buildBlob.mock.calls[0][0];
    expect(arg.stats.total).toBe(3);
    expect(arg.stats.win).toBe(2);
    expect(arg.stats.winRate).toBe(67);
    expect(arg.stats.topRival).toEqual({ opponent: "امیرمحمد", wins: 2 });
    expect(arg.userName).toBe("میلاد");

    const req = shareSpy.mock.calls[0][0] as { file: File; title: string; text: string };
    expect(req.file.name).toBe("vision2-duels.png");
    expect(req.file.type).toBe("image/png");
    expect(req.title).toBe("کارنامهٔ نبردها — وب‌کتاب ویژن ۲");
    expect(req.text).toBe("۲ برد از ۳ نبرد · نرخِ برد ۶۷٪");

    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0].title).toContain("هم‌رسانی شد");
  });

  it("حینِ هم‌رسانیِ ناتمام دکمه معلول است؛ پس از پایان آزاد می‌شود", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    let resolve!: (v: "shared") => void;
    shareSpy.mockImplementation(() => new Promise<"shared">((res) => (resolve = res)));
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();
    fireEvent.click(btn());
    expect(btn()).toBeDisabled();
    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    resolve("shared");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("لغوِ کاربر (cancelled) → سکوت کامل", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("cancelled");
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(shareSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy).not.toHaveBeenCalled();
  });

  it("failed → تُستِ خطا با راهِ جایگزین (ذخیره)", async () => {
    buildBlob.mockResolvedValue(pngBlob());
    shareSpy.mockResolvedValue("failed");
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();
    fireEvent.click(btn());
    await waitFor(() => expect(toastSpy).toHaveBeenCalledTimes(1));
    expect(toastSpy.mock.calls[0][0].title).toBe("هم‌رسانی ممکن نشد");
    expect(toastSpy.mock.calls[0][0].description).toContain("ذخیره");
    await waitFor(() => expect(btn()).not.toBeDisabled());
  });

  it("کارتِ نساخته (blob null) → share فراخوانی نمی‌شود و مسیرِ خطا می‌رود", async () => {
    buildBlob.mockResolvedValue(null);
    useStudy.setState({ duelHistory: [rec({ id: "d1" })] });
    renderSetup();
    fireEvent.click(btn());
    await waitFor(() => expect(btn()).not.toBeDisabled());
    expect(shareSpy).not.toHaveBeenCalled();
    expect(toastSpy).toHaveBeenCalledTimes(1);
    expect(toastSpy.mock.calls[0][0].title).toBe("هم‌رسانی ممکن نشد");
  });
});
