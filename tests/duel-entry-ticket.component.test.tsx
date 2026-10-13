// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 112 «بلیتِ ورود» — دو-گامی شدنِ دکمهٔ «ساخت اتاق نبرد»:
//   ① آرام: Swords + «ساخت اتاق نبرد» + فعال
//   ② createBusy: چرخ‌ندهٔ Loader2 + «در حالِ گرفتنِ بلیت…» + غیرفعال + aria-busy
//   ③ joinBusy همچنان مستقل کار می‌کند (دو چرخهٔ busy باهم قفل نمی‌شوند)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DUEL_PACES, DEFAULT_PACE_MS } from "@/lib/duel-pace";

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

import DuelSetup from "@/components/study/duel/duel-setup";

const CREATE_LABEL = "ساخت اتاق نبرد";
const BUSY_LABEL = "در حالِ گرفتنِ بلیت…";

const renderSetup = (over: { createBusy?: boolean; joinBusy?: boolean } = {}) =>
  render(
    <DuelSetup
      conn="online"
      createRoom={() => {}}
      joinRoom={() => {}}
      joinInput=""
      setJoinInput={() => {}}
      joinBusy={over.joinBusy ?? false}
      createBusy={over.createBusy ?? false}
      nameDraft=""
      setNameDraft={() => {}}
      paceChoices={DUEL_PACES}
      chosenPace={DEFAULT_PACE_MS}
      choosePace={() => {}}
    />
  );

const createBtn = () => screen.getByRole("button", { name: new RegExp(`(${CREATE_LABEL})|(${BUSY_LABEL})`) });

beforeEach(() => {
  cleanup();
});

describe("duel-setup — entry ticket busy cycle", () => {
  it("idle: enabled with the Swords label, no aria-busy", () => {
    renderSetup();
    const b = createBtn();
    expect(b).toBeEnabled();
    expect(b).toHaveTextContent(CREATE_LABEL);
    expect(b).toHaveAttribute("aria-busy", "false");
    expect(b.querySelector(".animate-spin")).toBeNull();
  });

  it("createBusy: disabled, spinner, honest ticket label, aria-busy=true", () => {
    renderSetup({ createBusy: true });
    const b = createBtn();
    expect(b).toBeDisabled();
    expect(b).toHaveTextContent(BUSY_LABEL);
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b.querySelector(".animate-spin")).not.toBeNull();
  });

  it("joinBusy leaves the create button alone (independent cycles)", () => {
    renderSetup({ joinBusy: true });
    expect(createBtn()).toBeEnabled();
    expect(createBtn()).toHaveTextContent(CREATE_LABEL);
  });
});
