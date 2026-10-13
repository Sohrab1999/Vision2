// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 107 «ریتمِ نبرد» — لابیِ duel-setup:
//   ① سه چیپِ ریتم (سریع/معمول/آرام) با برچسبِ ثانیهٔ فارسی رندر می‌شود
//   ② پیش‌فرض «معمول» فشرده است (aria-pressed) — نه هیچ‌کدام، نه هر سه
//   ③ کلیکِ «سریع» فشردگی را جابه‌جا می‌کند (choosePace با ۸۰۰۰ صدا زده می‌شود)
//   ④ گروه با role=group + برچسبِ فارسیِ درست در دسترس است
//   ⑤ کارتِ «چطور کار می‌کند» سه ریتم را صادقانه توضیح می‌دهد (۸/۱۵/۲۵)
// ------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastSpy }),
}));

import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

const baseProps = () => ({
  conn: "online" as const,
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  joinInput: "",
  setJoinInput: vi.fn(),
  joinBusy: false,
  createBusy: false,
  paceChoices: DUEL_PACES,
  chosenPace: DEFAULT_PACE_MS,
  choosePace: vi.fn(),
});

describe("duel-setup — انتخابِ ریتمِ نبرد (Task 107)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [] });
  });

  it("۱. سه چیپ با برچسبِ فارسی: سریع ۸ / معمول ۱۵ / آرام ۲۵ ثانیه", () => {
    render(<DuelSetup {...baseProps()} />);
    const group = screen.getByRole("group", { name: "انتخاب سرعت هر سؤال" });
    expect(group).toBeInTheDocument();
    expect(screen.getByText("سریع")).toBeInTheDocument();
    expect(screen.getByText("معمول")).toBeInTheDocument();
    expect(screen.getByText("آرام")).toBeInTheDocument();
    expect(screen.getAllByText("۸ ثانیه").length).toBeGreaterThan(0);
    expect(screen.getAllByText("۱۵ ثانیه").length).toBeGreaterThan(0);
    expect(screen.getAllByText("۲۵ ثانیه").length).toBeGreaterThan(0);
  });

  it("۲. پیش‌فرض فقط «معمول» فشرده است (aria-pressed=true)", () => {
    render(<DuelSetup {...baseProps()} />);
    expect(screen.getByRole("button", { name: /معمول/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /سریع/ })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /آرام/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("۳. کلیکِ «سریع» → choosePace(8000)؛ کلیکِ «آرام» → choosePace(25000)", () => {
    const choosePace = vi.fn();
    render(<DuelSetup {...baseProps()} choosePace={choosePace} />);
    fireEvent.click(screen.getByRole("button", { name: /سریع/ }));
    expect(choosePace).toHaveBeenCalledWith(8_000);
    fireEvent.click(screen.getByRole("button", { name: /آرام/ }));
    expect(choosePace).toHaveBeenCalledWith(25_000);
  });

  it("۴. ریتمِ برگزیدهٔ خارج از پیش‌فرض همان چیپ را فشرده می‌کند (حالتِ کنترل‌شده)", () => {
    render(<DuelSetup {...baseProps()} chosenPace={25_000} />);
    expect(screen.getByRole("button", { name: /آرام/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /معمول/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("۵. توضیحِ «چطور کار می‌کند» سه ریتم را صادقانه می‌گوید — نه فقط پانزده ثانیه", () => {
    render(<DuelSetup {...baseProps()} />);
    expect(screen.getByText("۲. ده سؤال، سه ریتم")).toBeInTheDocument();
    expect(screen.getByText(/۸، ۱۵ یا ۲۵ ثانیه برای هر سؤال/)).toBeInTheDocument();
  });
});
