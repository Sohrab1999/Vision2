// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 98 «دفترچهٔ قابلِ کاویدن» — نوارِ جست‌وجو/فیلتر روی پنلِ «آخرین نبردها»:
//   ① پیش‌فرض ۵ ردیف + دکمهٔ «نمایش همهٔ N نبرد» (باز/بسته)
//   ② جست‌وجوی نامِ حریف → ردیف‌های تنگ‌شده + خطِ «N نبرد یافت شد · W برد، L باخت، T مساوی»
//   ③ چیپِ نتیجه + سوییچِ «فقط داورگواه» (aria-pressed)
//   ④ حالتِ خالیِ صادق + «پاک‌کردن فیلترها»
// الگوی رندر هم‌الگوی shield-test تسک ۹۶: seed مستقیمِ store.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";
import type { DuelRecord } from "@/lib/duel-history";

const SIG = "a".repeat(64);

const rec = (over: Partial<DuelRecord>): DuelRecord => ({
  id: "d" + Math.random().toString(36).slice(2, 8),
  day: "2026-10-12",
  outcome: "win",
  reason: "finished",
  opponent: "سینا",
  opponentColor: "rose",
  myScore: 1200,
  oppScore: 950,
  myCorrect: 8,
  oppCorrect: 6,
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
    />
  );

const rows = () => screen.queryAllByText(/از ۱۰ درست/).length;

const searchBox = () => screen.getByLabelText("جست‌وجو در تاریخچهٔ نبردها") as HTMLInputElement;

describe("دفترچهٔ قابلِ کاویدن (Task 98)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ duelWins: 3, duelLosses: 1, duelTies: 1, duelHistory: [] });
  });

  it("پیش‌فرض ۵ ردیف؛ «نمایش همهٔ N نبرد» باز می‌کند و «نمایش کمتر» برمی‌گرداند", () => {
    useStudy.setState({
      duelHistory: Array.from({ length: 8 }, (_, i) =>
        rec({ id: "d" + i, opponent: i % 2 ? "سینا" : "امیر" })
      ),
    });
    renderSetup();

    expect(rows()).toBe(5);
    const expander = screen.getByRole("button", { name: /نمایش همهٔ ۸ نبرد/ });
    expect(expander).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(expander);
    expect(rows()).toBe(8);
    expect(screen.getByRole("button", { name: /نمایش کمتر/ })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: /نمایش کمتر/ }));
    expect(rows()).toBe(5);
  });

  it("جست‌وجوی نام → فقط ردیف‌های همان حریف + خطِ شمارشِ «یافت شد»", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d3", opponent: "امیرمحمد", outcome: "win" }),
        rec({ id: "d2", opponent: "سینا", outcome: "loss" }),
        rec({ id: "d1", opponent: "امیر رضا", outcome: "tie" }),
      ],
    });
    renderSetup();

    fireEvent.change(searchBox(), { target: { value: "امیر" } });
    expect(rows()).toBe(2);
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("۲ نبرد یافت شد");
    expect(status.textContent).toContain("۱ برد");
    expect(status.textContent).toContain("۱ مساوی");
    // پاک‌کنندهٔ داخلِ جعبهٔ جست‌وجو همه را برمی‌گرداند
    fireEvent.click(screen.getByLabelText("پاک‌کردن جست‌وجو"));
    expect(searchBox().value).toBe("");
    expect(rows()).toBe(3);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("نرمالِ نیم‌فاصله: پرس‌وجوی فاصله‌دار «امیر محمد» رکوردِ «امیرمحمد» را می‌یابد", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1", opponent: "امیرمحمد" })] });
    renderSetup();

    fireEvent.change(searchBox(), { target: { value: "امیر محمد" } });
    expect(rows()).toBe(1);
  });

  it("چیپِ نتیجه + سوییچِ «فقط داورگواه» — AND با aria-pressed صادق", () => {
    useStudy.setState({
      duelHistory: [
        rec({ id: "d4", opponent: "سینا", outcome: "win", receiptSig: SIG }),
        rec({ id: "d3", opponent: "امیر", outcome: "win" }),
        rec({ id: "d2", opponent: "سینا", outcome: "loss", receiptSig: SIG }),
        rec({ id: "d1", opponent: "امیر", outcome: "loss" }),
      ],
    });
    renderSetup();

    fireEvent.click(screen.getByRole("button", { name: "برد" }));
    expect(rows()).toBe(2); // دو برد از چهار
    expect(screen.getByRole("button", { name: "برد" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /فقط داورگواه/ }));
    expect(rows()).toBe(1); // فقط بردِ رسیددارِ سینا
    expect(screen.getByRole("button", { name: /فقط داورگواه/ })).toHaveAttribute("aria-pressed", "true");
    // سپرِ همان ردیف روی صفحه است
    expect(screen.getAllByRole("img", { name: "داورگواه" })).toHaveLength(1);
  });

  it("بی‌نتیجه → حالتِ خالیِ صادق + «پاک‌کردن فیلترها» بازمی‌گرداند", () => {
    useStudy.setState({ duelHistory: [rec({ id: "d1", opponent: "سینا" })] });
    renderSetup();

    fireEvent.change(searchBox(), { target: { value: "ناموجود" } });
    expect(screen.getByText("نبردی با این مشخصات پیدا نشد.")).toBeInTheDocument();
    expect(screen.queryByText(/از ۱۰ درست/)).not.toBeInTheDocument();

    // دو دکمهٔ «پاک‌کردن فیلترها» روی صفحه‌اند (نوارِ ابزار + حالتِ خالی) — از حالتِ خالی کلیک می‌کنیم
    const clears = screen.getAllByRole("button", { name: /پاک‌کردن فیلترها/ });
    expect(clears).toHaveLength(2);
    fireEvent.click(clears[1]);
    expect(searchBox().value).toBe("");
    expect(rows()).toBe(1);
    expect(screen.queryByText("نبردی با این مشخصات پیدا نشد.")).not.toBeInTheDocument();
  });
});
