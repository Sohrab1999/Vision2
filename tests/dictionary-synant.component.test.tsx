// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 203 — کارتِ واژهٔ جفت‌آگاه در دیکشنری:
//   ① کارتِ «borrow» چیپِ متضادِ «↔ lend» جزوه را دارد
//   ② کارتِ «absolutely» چیپِ مترادفِ «≈ surely» را دارد
//   ③ واژهٔ بی‌جفت چیپی ندارد — نه صفرِ ساختگی
//   ④ جستجوی «lend» کارتِ «borrow» را می‌آورد (جفت‌ها هم جستجو می‌شوند)
//   ⑤ کلیکِ چیپ همتا را روخوانی می‌کند (speak با همتا صدا زده می‌شود)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { buildSynAntIndex, synAntPairsFor } from "@/lib/syn-ant-lookup";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

import { speak } from "@/lib/speak";

const index = buildSynAntIndex(lessons);

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [] });
  vi.mocked(speak).mockClear();
});

describe("DictionaryView — جفت‌چیپ‌های جزوه", () => {
  it("کارتِ borrow چیپِ «↔ lend» دارد (متضادِ واقعیِ درس ۳)", async () => {
    render(<DictionaryView />);
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "borrow" } });
    const chips = await screen.findAllByRole("button", { name: /متضادِ borrow: lend — روخوانی/ });
    expect(chips.length).toBeGreaterThan(0);
    expect(chips[0]).toHaveTextContent("lend");
    expect(chips[0]).toHaveTextContent("↔");
  });

  it("کارتِ absolutely چیپِ «≈ surely» دارد (مترادفِ واقعیِ درس ۱ — روی هر دو کارتِ هم‌نام)", async () => {
    render(<DictionaryView />);
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "absolutely" } });
    const chips = await screen.findAllByRole("button", { name: /مترادفِ absolutely: surely — روخوانی/ });
    expect(chips.length).toBeGreaterThanOrEqual(1); // درس ۱ و ۴ هر دو کارتِ «absolutely» دارند
    expect(chips[0]).toHaveTextContent("surely");
    expect(chips[0]).toHaveTextContent("≈");
  });

  it("واژهٔ بی‌جفت در کارتِ خودش هیچ چیپی ندارد — نه صفرِ ساختگی", () => {
    const index = buildSynAntIndex(lessons);
    const bare = lessons
      .flatMap((l) => l.vocabulary)
      .find((w) => !index.has(w.en.trim().toLowerCase())); // نه سرِ ردیف، نه همتا
    expect(bare).toBeDefined();
    render(<DictionaryView />);
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: bare!.en } });
    // کارتِ خودِ واژه (شناخته‌شده با جفتِ en+fa) چیپ ندارد — کارت‌های دیگر ممکن است داشته باشند
    const enSpans = screen.getAllByText(bare!.en, { selector: "[dir='ltr']" });
    const ownCard = enSpans
      .map((s) => s.closest("div.rounded-xl"))
      .find((c) => c && c.textContent?.includes(bare!.fa));
    expect(ownCard).toBeDefined();
    expect(ownCard!.querySelector(".dict-pair-chip")).toBeNull();
  });

  it("جستجوی «lend» کارتِ «borrow» را هم می‌آورد — جفت‌ها هم جستجو می‌شوند", () => {
    render(<DictionaryView />);
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "lend" } });
    const borrowCards = screen.getAllByText("borrow", { selector: "[dir='ltr']" });
    expect(borrowCards.length).toBeGreaterThan(0);
  });

  it("کلیکِ چیپ، همتا را روخوانی می‌کند", async () => {
    render(<DictionaryView />);
    fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "absolutely" } });
    const chips = await screen.findAllByRole("button", { name: /مترادفِ absolutely: surely — روخوانی/ });
    fireEvent.click(chips[0]);
    expect(vi.mocked(speak)).toHaveBeenCalledWith("surely", 0.95);
  });
});
