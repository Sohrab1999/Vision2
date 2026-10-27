// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 119 «معلمِ هفته» — the weekly band's teacher panel contract:
//   ① an empty week renders NO launcher (the one verdict gate —
//     same evaluator the route re-runs, never two faces)
//   ② click → POST carries the aggregate stats shape ONLY (the raw
//     dayHistory never travels — the week is localStorage-local)
//   ③ done → the three sections render + honest provenance chip
//     (تازه fresh / آماده cached / حالت آفلاین fallback)
//   ④ server 400 → the server's Persian message verbatim + retry
//   ⑤ retry recovers through the same launcher
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { trackMock, fetchMock, toastMock } = vi.hoisted(() => ({
  trackMock: vi.fn(),
  fetchMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: (name: string) => trackMock(name),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

import WeekTeacher from "@/components/study/reports/week-teacher";
import type { WeekTeacherStats } from "@/lib/week-teacher";

const WEEK: WeekTeacherStats = {
  activities: 23,
  reviews: 12,
  quizzes: 2,
  words: 5,
  dictation: 1,
  rush: 3,
  activeDays: 4,
  goalDays: 3,
  prevActivities: 18,
  bestDay: 12,
  duels: 4,
  duelWins: 3,
  duelBest: 1150,
  thinkAvgMs: 1200,
  quickWeek: true,
  streak: 6,
};

const EMPTY: WeekTeacherStats = {
  activities: 0, reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0,
  activeDays: 0, goalDays: 0, prevActivities: 0, bestDay: null,
  duels: null, duelWins: 0, duelBest: 0, thinkAvgMs: null, quickWeek: false, streak: 0,
};

const AI_BODY = {
  fingerprint: "week-v1:x",
  intro: "هفتهٔ پرکار بودی و روندت رو به بالا است.",
  strength: "«مرور لغت» ستونِ این هفته‌ات بود.",
  advice: "یک دیکتهٔ کوتاه به روزهایت اضافه کن.",
  source: "ai",
  cached: false,
};

function fetchOk(body: unknown, ok = true, status = 200) {
  fetchMock.mockResolvedValue({
    ok,
    status,
    json: async () => body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  cleanup();
});

describe("WeekTeacher", () => {
  it("renders nothing for an empty week — the honest verdict gate", () => {
    const { container } = render(<WeekTeacher stats={EMPTY} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByLabelText("معلمِ هفته")).not.toBeInTheDocument();
  });

  it("renders the launcher for a week with activity", () => {
    render(<WeekTeacher stats={WEEK} />);
    expect(screen.getByLabelText("معلمِ هفته")).toBeInTheDocument();
    expect(screen.getByText("نظرِ معلم را بخواه")).toBeInTheDocument();
    expect(screen.getByText(/بر اساسِ اعدادِ همین هفته‌نامه/)).toBeInTheDocument();
  });

  it("ships the aggregate stats shape only — never the raw dayHistory", async () => {
    fetchOk(AI_BODY);
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toBe("/api/week-review");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.activities).toBe(23);
    expect(body.duels).toBe(4);
    expect(body.quickWeek).toBe(true);
    // the security posture: no day/date keys, no history blob in the payload
    expect(String(init.body)).not.toContain("dayHistory");
    expect(String(init.body)).not.toContain("history");
    expect(String(init.body)).not.toContain("T00:00:00");
    expect(trackMock).toHaveBeenCalledWith("week_review_start");
  });

  it("renders the three sections with the fresh chip on a new generation", async () => {
    fetchOk(AI_BODY);
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(screen.getByText(AI_BODY.intro)).toBeInTheDocument());
    expect(screen.getByText(AI_BODY.strength)).toBeInTheDocument();
    expect(screen.getByText(AI_BODY.advice)).toBeInTheDocument();
    expect(screen.getByText("تازه")).toBeInTheDocument();
    expect(toastMock).toHaveBeenCalledTimes(1); // fresh only — cached/fallback stay silent
  });

  it("marks a cache hit honestly with the آماده chip — and stays silent", async () => {
    fetchOk({ ...AI_BODY, cached: true, source: "ai" });
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(screen.getByText("آماده")).toBeInTheDocument());
    expect(screen.queryByText("تازه")).not.toBeInTheDocument();
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("marks the offline fallback honestly", async () => {
    fetchOk({ ...AI_BODY, source: "fallback", cached: false });
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(screen.getByText("حالت آفلاین")).toBeInTheDocument());
    expect(toastMock).not.toHaveBeenCalled();
  });

  it("shows the server's Persian 400 message verbatim (empty-week race)", async () => {
    fetchOk({ ok: false, code: "bad_request", error: "این هفته هیچ فعالیت و نبردی برای داوری ندارد — معلمِ هفته هفتهٔ خالی را قضاوت نمی‌کند." }, false, 400);
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(screen.getByText(/هفتهٔ خالی را قضاوت نمی‌کند/)).toBeInTheDocument());
    expect(screen.getByLabelText("تلاش دوباره برای داوری هفته")).toBeInTheDocument();
  });

  it("recovers through the retry after a network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<WeekTeacher stats={WEEK} />);
    fireEvent.click(screen.getByLabelText("نظر معلم را برای این هفته بخواه"));
    await waitFor(() => expect(screen.getByText(/داوریِ هفته ساخته نشد/)).toBeInTheDocument());
    fetchOk(AI_BODY);
    fireEvent.click(screen.getByLabelText("تلاش دوباره برای داوری هفته"));
    await waitFor(() => expect(screen.getByText(AI_BODY.intro)).toBeInTheDocument());
  });
});
