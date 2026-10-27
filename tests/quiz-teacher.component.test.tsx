// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 117 «معلمِ کارنامه» — launcher component contract on the result
// screen:
//   ① launcher renders with the honest byline
//   ② click → POST carries ids + raw indices ONLY (question text never ships)
//   ③ loading state is announced while the teacher reads
//   ④ done → the three sections render + honest provenance chip
//      (آماده cached / تازه fresh / حالت آفلاین fallback)
//   ⑤ server 400 → the server's Persian message verbatim + retry
//   ⑥ retry works after an error
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";

const { trackMock, fetchMock } = vi.hoisted(() => ({
  trackMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: (name: string) => trackMock(name),
}));

import QuizTeacher from "@/components/study/quiz/quiz-teacher";

const IDS = ["l1:q1", "l1:q2", "l2:q1"];
const ANSWERS: (number | undefined)[] = [1, 0, undefined];

const AI_BODY = {
  fingerprint: "x",
  intro: "در این جلسه ۱ از ۳ سؤال درست بود و مسیرِ رشدت روشن است.",
  strength: "در «واژگان» دقتِ خوبی داشتی.",
  advice: "گرامرِ حالِ استمراری را مرور کن.",
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

describe("QuizTeacher", () => {
  it("renders the launcher with the honest byline", () => {
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    expect(screen.getByLabelText("معلمِ کارنامه")).toBeInTheDocument();
    expect(screen.getByText("نظرِ معلم را بخواه")).toBeInTheDocument();
    expect(screen.getByText(/صادق، بر اساسِ پاسخ‌های واقعی/)).toBeInTheDocument();
  });

  it("ships ids + raw indices only — question text never travels", async () => {
    fetchOk(AI_BODY);
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { ids: string[]; answers: (number | null)[] };
    expect(body.ids).toEqual(IDS);
    expect(body.answers).toEqual([1, 0, null]); // undefined → null
    // the security posture: no Persian/English question prose in the payload
    expect(String(init.body)).not.toContain("goes");
    expect(String(init.body)).not.toContain("football");
    expect(trackMock).toHaveBeenCalledWith("exam_review_start");
  });

  it("announces the reading state while the teacher works", async () => {
    let resolveFetch: (v: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((res) => (resolveFetch = res)));
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    expect(screen.getByText(/معلم دارد کارنامه‌ات را می‌خواند/)).toBeInTheDocument();
    resolveFetch({ ok: true, status: 200, json: async () => AI_BODY });
    await waitFor(() => expect(screen.getByText(/نظرِ معلم/)).toBeInTheDocument());
  });

  it("renders the three sections with the fresh chip on a new generation", async () => {
    fetchOk(AI_BODY);
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() => expect(screen.getByText(AI_BODY.intro)).toBeInTheDocument());
    expect(screen.getByText(AI_BODY.strength)).toBeInTheDocument();
    expect(screen.getByText(AI_BODY.advice)).toBeInTheDocument();
    expect(screen.getByText("تازه")).toBeInTheDocument();
    expect(screen.queryByText("آماده")).not.toBeInTheDocument();
  });

  it("marks a cache hit honestly with the آماده chip", async () => {
    fetchOk({ ...AI_BODY, cached: true, source: "ai" });
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() => expect(screen.getByText("آماده")).toBeInTheDocument());
  });

  it("marks the offline fallback honestly", async () => {
    fetchOk({ ...AI_BODY, source: "fallback", cached: false });
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() => expect(screen.getByText("حالت آفلاین")).toBeInTheDocument());
  });

  it("shows the server's Persian 400 message verbatim (out-of-bank session)", async () => {
    fetchOk({ ok: false, code: "bad_request", error: "این جلسه سؤال‌هایی بیرون از بانکِ وب‌کتاب دارد؛ معلمِ کارنامه فقط جلسه‌های بانکِ خودِ کتاب را داوری می‌کند." }, false, 400);
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() =>
      expect(screen.getByText(/بیرون از بانکِ وب‌کتاب دارد/)).toBeInTheDocument()
    );
    expect(screen.getByLabelText("تلاش دوباره برای گرفتن نظر معلم")).toBeInTheDocument();
  });

  it("recovers through the retry after a network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<QuizTeacher ids={IDS} answers={ANSWERS} />);
    fireEvent.click(screen.getByLabelText("نظرِ معلم را برای این جلسه بخواه"));
    await waitFor(() => expect(screen.getByText(/بازخورد ساخته نشد/)).toBeInTheDocument());
    fetchOk(AI_BODY);
    fireEvent.click(screen.getByLabelText("تلاش دوباره برای گرفتن نظر معلم"));
    await waitFor(() => expect(screen.getByText(AI_BODY.intro)).toBeInTheDocument());
  });
});
