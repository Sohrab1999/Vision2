// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 208 — «حسابِ جفت‌ها» on the official print report (ledger 207-②).
// Same honesty contract as the task-176 coverage section, applied to the
// 477 booklet pair rows:
//   ① fresh learner: section present with «۰ از ۴۷۷ دیده‌شده» + honest
//      empty state — and NO fabricated table
//   ② both-ends seed: chip «۲ از ۴۷۷»، summary کامل=۱/نیمه=۱، per-lesson
//      rows show the seen counts + percentages in Persian digits
//   ③ starred-only seed: seen counts, knownBoth stays ۰ — the summary
//      never inflates
//   ④ untried lessons keep the honest «—» (no fabricated zeros on paper)
// Fixture honesty: only two booklet rows involve accept/reject/refuse —
// L3 accept→reject and L4 accept→refuse (probed from the data layer).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, within } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import OfficialReport from "@/components/study/reports/official-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

beforeEach(() => {
  cleanup();
  useStudy.setState({
    known: {},
    results: {},
    srs: {},
    mistakes: {},
    history: {},
    dayHistory: {},
    streak: 0,
    bestStreak: 0,
    starredWords: [],
    wordSeen: {},
  });
});

const renderReport = () => render(<OfficialReport open onClose={() => {}} />);
const pairsSection = () => document.querySelector("section.or-pairs") as HTMLElement | null;

describe("OfficialReport — بخشِ جفت‌های مترادف و متضاد (round 208)", () => {
  it("fresh learner: chip «۰ از ۴۷۷ دیده‌شده» + honest empty state, no table", () => {
    renderReport();
    const section = pairsSection();
    expect(section).not.toBeNull();
    expect(section).toHaveTextContent("جفت‌های مترادف و متضاد");
    expect(section).toHaveTextContent("۰ از ۴۷۷ دیده‌شده");
    expect(section).toHaveTextContent("هنوز هیچ جفتی دیده نشده");
    expect(section!.querySelector("table")).toBeNull();
  });

  it("both-ends seed: «۲ از ۴۷۷»، کامل=۱/نیمه=۱، rows L3/L4 seen with Persian pct", () => {
    useStudy.setState({ known: { "3:accept": true, "3:reject": true } as never });
    renderReport();
    const section = pairsSection()!;
    expect(section).toHaveTextContent("۲ از ۴۷۷ دیده‌شده");
    expect(section).toHaveTextContent("کامل (هر دو سر بلد):");
    expect(section).toHaveTextContent("نیمه (فقط یک سر بلد):");
    const table = section.querySelector("table")!;
    const l3row = within(table).getByText("درس ۳").closest("tr")!;
    const l4row = within(table).getByText("درس ۴").closest("tr")!;
    expect(l3row).toHaveTextContent("۱۲۳"); // rows of L3 (richest lesson)
    expect(l3row).toHaveTextContent("۱"); // seen
    expect(l3row).toHaveTextContent("۱٪"); // round(1/123*100)
    expect(l4row).toHaveTextContent("۳۴");
    expect(l4row).toHaveTextContent("۱");
    expect(l4row).toHaveTextContent("۳٪"); // round(1/34*100)
  });

  it("starred-only seed: seen counts, knownBoth stays ۰ — no inflation", () => {
    useStudy.setState({ starredWords: ["3:accept"] });
    renderReport();
    const section = pairsSection()!;
    expect(section).toHaveTextContent("۲ از ۴۷۷ دیده‌شده");
    // the «کامل» figure must read ۰ — a star is not knowledge
    const summary = within(section).getByText("کامل (هر دو سر بلد):").parentElement as HTMLElement;
    expect(summary).toHaveTextContent("۰");
  });

  it("untried lessons keep the honest «—» next to tried ones", () => {
    useStudy.setState({ known: { "3:accept": true, "3:reject": true } as never });
    renderReport();
    const table = pairsSection()!.querySelector("table")!;
    const l1row = within(table).getByText("درس ۱").closest("tr")!;
    expect(l1row).toHaveTextContent("—");
    const l3row = within(table).getByText("درس ۳").closest("tr")!;
    expect(l3row).not.toHaveTextContent("—");
  });
});
