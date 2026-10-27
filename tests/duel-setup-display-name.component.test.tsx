// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 131 «نامِ نمایشیِ نبرد» — فیلدِ لابی روی heroِ setup:
//   ① ورودی با aria-label + maxLength={24} + value=nameDraft (کنترل‌شده)
//   ② تایپ → setNameDraft با همان مقدار (برشِ ۲۴ روی خودِ onChange است —
//      قراردادِ منبع، اینجا فقط عبورِ صادق)
//   ③ placeholder = «پیش‌فرض: <resolveِ پروفایل>» — با نامِ seed شده و
//      بدونِ آن (فالبکِ «یادگیرنده»)
//   ④ پانوشتِ صادق: «فقط برای همین نبرد… — پروفایل تغییر نمی‌کند»
// الگوی رندر: seed مستقیمِ store (هم‌الگوی shield/share tests).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";
import DuelSetup from "@/components/study/duel/duel-setup";
import { useStudy } from "@/lib/study-store";

const renderSetup = (over: { nameDraft?: string } = {}) =>
  render(
    <DuelSetup
      conn="online"
      createRoom={() => {}}
      joinRoom={() => {}}
      joinInput=""
      setJoinInput={() => {}}
      joinBusy={false}
      createBusy={false}
      nameDraft={over.nameDraft ?? ""}
      setNameDraft={() => {}}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

const NAME_INPUT = "نام نمایشی در این نبرد";

describe("نامِ نمایشیِ نبرد — فیلدِ لابی (Task 131)", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({ userName: "", duelWins: 0, duelLosses: 0, duelTies: 0, duelHistory: [] });
  });

  it("renders the controlled input with aria-label and maxLength=24", () => {
    renderSetup({ nameDraft: "علی" });
    const input = screen.getByLabelText(NAME_INPUT) as HTMLInputElement;
    expect(input).toHaveAttribute("maxLength", "24");
    expect(input.value).toBe("علی");
  });

  it("typing forwards the draft to setNameDraft (controlled pass-through)", () => {
    let sent = "";
    render(
      <DuelSetup
        conn="online"
        createRoom={() => {}}
        joinRoom={() => {}}
        joinInput=""
        setJoinInput={() => {}}
        joinBusy={false}
        createBusy={false}
        nameDraft={sent}
        setNameDraft={(v) => {
          sent = v;
        }}
        paceChoices={DUEL_PACES}
        chosenPace={DEFAULT_PACE_MS}
        choosePace={() => {}}
      />
    );
    const input = screen.getByLabelText(NAME_INPUT) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "a" } });
    expect(sent).toBe("a");
  });

  it("placeholder shows the seeded profile name as the default", () => {
    useStudy.setState({ userName: "سینا" });
    renderSetup();
    expect(screen.getByLabelText(NAME_INPUT)).toHaveAttribute("placeholder", "پیش‌فرض: سینا");
  });

  it("placeholder falls back to «یادگیرنده» when the profile is empty", () => {
    renderSetup();
    expect(screen.getByLabelText(NAME_INPUT)).toHaveAttribute("placeholder", "پیش‌فرض: یادگیرنده");
  });

  it("carries the honest display-only footnote", () => {
    renderSetup();
    expect(screen.getByText(/فقط برای همین نبرد نشان داده می‌شود/)).toBeInTheDocument();
  });
});
