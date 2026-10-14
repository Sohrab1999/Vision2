// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 192 — نبضِ زندهٔ حریف در کارتِ «همهٔ سؤال‌هایت تمام شد» (duel-play):
//   ① حریفِ زندهٔ ناتمام → ماژولِ پیشرفت: نام، امتیاز، «سؤال X از N · Y درست»
//     و سلولِ pulse روی خانهٔ جاری (همان زبانِ HUD)
//   ② حریفِ تمام‌کرده → جملهٔ «حریف هم تمام کرد» بدونِ ماژول
//   ③ حریفِ قطع‌شده/غایب → جملهٔ سادهٔ قبلی بدونِ ماژول
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import DuelPlay from "@/components/study/duel/duel-play";
import type { PublicPlayer } from "@/components/study/duel/duel-types";

const me: PublicPlayer = {
  sid: "s1",
  name: "من",
  color: "#a8a29e",
  qi: 10,
  score: 999,
  correct: 8,
  answered: 10,
  done: true,
  disconnected: false,
};

const opp = (over: Partial<PublicPlayer>): PublicPlayer => ({
  sid: "s2",
  name: "سینا",
  color: "#fda4af",
  qi: 4,
  score: 450,
  correct: 3,
  answered: 4,
  done: false,
  disconnected: false,
  ...over,
});

const renderPlay = (o: PublicPlayer | null) =>
  render(
    <DuelPlay
      me={me}
      opp={o}
      total={10}
      cur={null}
      curQ={null}
      correctIdx={-1}
      qi={10}
      picked={-1}
      feedback="none"
      myDone
      oppLeft={false}
      answer={() => {}}
      timeLeft={1000}
      paceMs={15000}
    />
  );

describe("کارتِ انتظارِ duel-play (Task 192)", () => {
  beforeEach(() => cleanup());

  it("حریفِ زندهٔ ناتمام → ماژولِ پیشرفت با نام، امتیاز و شمارشِ فارسی", () => {
    renderPlay(opp({}));
    const text = document.body.textContent ?? "";
    expect(text).toContain("همهٔ سؤال‌هایت تمام شد!");
    expect(text).toContain("منتظر حریف می‌مانیم تا مسابقه تمام شود…");
    expect(text).toContain("سؤال ۵ از ۱۰ · ۳ درست"); // qi=4 → سؤال پنجم
    expect(text).toContain("۴۵۰"); // امتیازِ زنده
    expect(text).toContain("سینا");
  });

  it("سلولِ جاریِ حریف در ماژول pulse دارد (همان زبانِ HUD)", () => {
    const { container } = renderPlay(opp({ qi: 4, correct: 3, answered: 4 }));
    const mod = container.querySelector('[aria-label="پیشرفت زندهٔ سینا"]');
    expect(mod).not.toBeNull();
    const pulse = mod!.querySelectorAll(".animate-pulse");
    expect(pulse).toHaveLength(1); // خانهٔ qi=4
    expect(pulse[0]).toHaveClass("bg-fuchsia-400");
  });

  it("حریفِ تمام‌کرده → جملهٔ جمع‌بندی، بدونِ ماژولِ پیشرفت", () => {
    const { container } = renderPlay(opp({ done: true, qi: 10, answered: 10 }));
    expect(document.body.textContent ?? "").toContain("حریف هم تمام کرد — منتظر جمع‌بندی داور…");
    expect(container.querySelector('[aria-label^="پیشرفت زندهٔ"]')).toBeNull();
  });

  it("حریفِ قطع‌شده → جملهٔ ساده، بدونِ ماژول", () => {
    const { container } = renderPlay(opp({ disconnected: true }));
    expect(document.body.textContent ?? "").toContain("منتظر حریف می‌مانیم تا مسابقه تمام شود…");
    expect(container.querySelector('[aria-label^="پیشرفت زندهٔ"]')).toBeNull();
  });

  it("بدونِ حریف → جملهٔ ساده، بدونِ ماژول", () => {
    const { container } = renderPlay(null);
    expect(document.body.textContent ?? "").toContain("منتظر حریف می‌مانیم تا مسابقه تمام شود…");
    expect(container.querySelector('[aria-label^="پیشرفت زندهٔ"]')).toBeNull();
  });
});
