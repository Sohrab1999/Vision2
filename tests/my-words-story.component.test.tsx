// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 116 «داستانِ واژه‌های من» — launcher component contract:
//   ① <4 stars → hint text, dictionary CTA, no forge button
//   ② ≥4 stars → forge button; click → POST with the star keys (ids only!)
//   ③ done → the story renders with highlighted target words + Persian summary
//   ④ cached chip vs fresh chip vs offline chip — honest provenance
//   ⑤ error → honest Persian error line, forge stays available
//   ⑥ read-aloud toggles speak() and its stop twin
//   ⑦ the 20-key cap: only the first 20 filtered stars travel
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { speakMock, stopSpeakMock, trackMock, fetchMock } = vi.hoisted(() => ({
  speakMock: vi.fn(
    async (_text: string, _speed?: number, _onEnd?: () => void, _onError?: () => void) => () => {}
  ),
  stopSpeakMock: vi.fn(),
  trackMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/speak", () => ({
  speak: (text: string, speed?: number, onEnd?: () => void, onError?: () => void) =>
    speakMock(text, speed, onEnd, onError),
  stopSpeaking: () => stopSpeakMock(),
  setSpeakRateScale: () => {},
  getSpeakRateScale: () => 1,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: (name: string) => trackMock(name),
}));

import MyWordsStory from "@/components/study/practice/my-words-story";
import type { ResolvedStar } from "@/lib/my-words-resolve";

const star = (key: string, en: string, fa: string): ResolvedStar =>
  ({
    key,
    lessonId: Number(key.slice(0, key.indexOf(":"))),
    en,
    fa,
    word: { en, fa },
    color: "emerald" as const,
    titleFa: "درس",
  }) as ResolvedStar;

const FOUR = [star("1:ability", "ability", "توانایی"), star("1:absent", "absent", "غایب"), star("2:actor", "actor", "بازیگر"), star("2:achieve", "achieve", "به دست آوردن")];

const AI_BODY = {
  story: "Sara had the ability to fix the bus. The driver was absent that morning. She chose to achieve the repair with the actor.",
  summary: "داستان دربارهٔ توانایی سارا بود.",
  source: "ai" as const,
  cached: false,
  words: FOUR.map((s) => ({ key: s.key, en: s.en, fa: s.fa })),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof global.fetch;
});

describe("MyWordsStory", () => {
  it("hides the forge button below the 4-word floor and offers the dictionary instead", () => {
    render(<MyWordsStory stars={FOUR.slice(0, 2)} />);
    expect(screen.queryByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" })).not.toBeInTheDocument();
    expect(screen.getByText(/دست‌کم ۴ واژه نشان کن/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /رفتن به دیکشنری/ })).toBeInTheDocument();
  });

  it("posts the star KEYS only — never the word text", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => AI_BODY });
    render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/story");
    const sent = JSON.parse(init.body);
    expect(sent.keys).toEqual(["1:ability", "1:absent", "2:actor", "2:achieve"]);
    expect(JSON.stringify(sent)).not.toContain("توانایی"); // Persian text never ships
  });

  it("renders the tale with highlighted words, the Persian summary and the fresh chip", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => AI_BODY });
    const { container } = render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(screen.getByText("داستان تو")).toBeInTheDocument());
    expect(container.querySelector("[data-ai-story]")).not.toBeNull();
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(4); // all four targets light up
    expect(marks[0].textContent).toMatch(/ability/i);
    expect(screen.getByText(/داستان دربارهٔ توانایی سارا بود/)).toBeInTheDocument();
    expect(screen.getByText("تازه")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "روخوانی داستان" })).toBeInTheDocument();
  });

  it("labels provenance honestly: cached vs offline", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...AI_BODY, cached: true }) });
    const { unmount } = render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(screen.getByText("آماده")).toBeInTheDocument());
    unmount();

    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ...AI_BODY, source: "fallback" }) });
    render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(screen.getByText("حالت آفلاین")).toBeInTheDocument());
  });

  it("shows the honest Persian error on failure and lets the learner retry", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(screen.getByText(/داستان ساخته نشد/)).toBeInTheDocument());
    // forge button back — the loader is gone
    expect(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" })).toBeInTheDocument();
  });

  it("caps the travelling keys at 20", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => AI_BODY });
    const many = Array.from({ length: 25 }, (_, i) => star(`1:w${i}`, `w${i}`, `ف${i}`));
    render(<MyWordsStory stars={many} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.keys.length).toBe(20);
  });

  it("read-aloud calls speak() once and the stop twin on the second click", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => AI_BODY });
    render(<MyWordsStory stars={FOUR} />);
    fireEvent.click(screen.getByRole("button", { name: "ساخت داستان با واژه‌های نشان‌شده" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "روخوانی داستان" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "روخوانی داستان" }));
    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock.mock.calls[0][0]).toContain("ability");
    fireEvent.click(screen.getByRole("button", { name: "توقف روخوانی داستان" }));
    expect(stopSpeakMock).toHaveBeenCalledTimes(1);
  });
});
