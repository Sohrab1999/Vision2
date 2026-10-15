// @vitest-environment jsdom
// ------------------------------------------------------------------
// Round 207 — the «جفت‌دار» lens grows its drill bar:
//   ① hidden under the «همه» filter (the bar is the lens's own tool)
//   ② appears when the جفت‌دار filter activates
//   ③ scope text follows the lesson filter (همهٔ درس‌ها vs درس N)
//   ④ «شروع دریل» opens the QuizEngine with a booklet-pair stem
//   ⑤ the result key contract rides 0:synant (labels/theme in
//      home-constants map it to «دریل جفت‌ها» violet)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { useStudy } from "@/lib/study-store";
import { globalResultLabel, globalResultTheme } from "@/components/study/home/home-constants";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({ known: {}, starredWords: [] });
});

function clickPairedChip() {
  const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
  fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
}

import { within } from "@testing-library/react";

describe("DictionaryView — دریلِ جفت‌ها (راند ۲۰۷)", () => {
  it("the bar is hidden while the plain «همه» filter is active", () => {
    render(<DictionaryView />);
    expect(screen.queryByTestId("pairs-drill-bar")).toBeNull();
  });

  it("the bar appears under the جفت‌دار lens with the all-lessons scope text", () => {
    render(<DictionaryView />);
    clickPairedChip();
    const bar = screen.getByTestId("pairs-drill-bar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent("دریل جفت‌ها");
    expect(bar).toHaveTextContent("همهٔ ۱۲ درس");
    // lesson-filter scope text comes later (the lens is lesson-agnostic here)
    expect(screen.getByRole("button", { name: "شروع دریل جفت‌ها" })).toBeInTheDocument();
  });

  it("the scope text follows the lesson filter (درس ۳)", () => {
    render(<DictionaryView />);
    clickPairedChip();
    fireEvent.click(screen.getByRole("button", { name: "درس ۳: هنر و فرهنگ" }));
    const bar = screen.getByTestId("pairs-drill-bar");
    expect(bar).toHaveTextContent("درس ۳");
    expect(bar).not.toHaveTextContent("همهٔ ۱۲ درس");
  });

  it("«شروع دریل» opens the QuizEngine with a booklet-pair stem", () => {
    render(<DictionaryView />);
    clickPairedChip();
    fireEvent.click(screen.getByRole("button", { name: "شروع دریل جفت‌ها" }));
    // the session title rides the dialog + the engine
    expect(screen.getAllByText(/دریل جفت‌ها — همهٔ درس‌ها/).length).toBeGreaterThan(0);
    // at least one pair stem is rendered (syn or ant wording)
    const stems = screen.queryAllByText(/کدام واژه (هم‌معنی|متضاد)ِ/);
    expect(stems.length).toBeGreaterThan(0);
  });

  it("the result key contract is mapped in home-constants (label + violet theme)", () => {
    expect(globalResultLabel["0:synant"]).toBe("دریل جفت‌ها");
    expect(globalResultTheme["0:synant"]).toBe("violet");
  });
});
