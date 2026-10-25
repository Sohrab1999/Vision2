// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۶ — بندِ ① پیشنهادِ ۲۴۵: پالسِ زرشکی + حبابِ آموزشیِ نشانگرِ
// سرِ ضمیمه — ایدئومِ درِ هدر (r244/r245) قابلِ حمل شد. قراردادهایی که
// قفل می‌شوند:
//   ① بی‌رسیدن = هیچ (پیش‌فرضِ صادقانه — نه پالس، نه حباب)
//   ② مسیرِ پرچم: درخواستِ قبل از mount → بعد از mount پالس + حباب با
//     role=status و pointer-events-none و متنِ قرارداد
//   ③ چرخهٔ عمر: پالس ۱٫۶ثانیه‌ای، حباب ۳٫۶ثانیه‌ای — هر دو واقعاً می‌میرند
//   ④ پرچمِ کهنه (بیش از ۲ثانیه) دیرتر پالسِ کاذب نمی‌سازد
//   ⑤ مسیرِ رویدادِ زنده: نشانگرِ سوارشده با PULSE_APPENDIX_PILL_EVENT
//     پالس می‌گیرد؛ پالسِ نو عمرِ حباب را نوسازی می‌کند
//   ⑥ کلیکِ رویِ خودِ نشانگر حباب را زودتر می‌برد (یادگیرنده خودش آمده)
//   ⑦ helperِ مشترکِ openAppendixDoor: رویِ خودِ ضمیمه رویدادِ زنده و
//     هیچ ناوبری؛ از جای دیگر پرچم + ناوبریِ فوری — منطقِ رفت در یک نقطه
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import AppendixResumePill from "@/components/study/lesson/appendix-resume-pill";
import {
  writeAppendixResume,
  clearAppendixResume,
} from "@/lib/bg-reading";
import {
  PULSE_APPENDIX_PILL_EVENT,
  requestAppendixPillHint,
  peekAppendixPillHint,
  ackAppendixPillHint,
  openAppendixDoor,
} from "@/lib/resume-loop-doors";
import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const phonRec: AppendixResumeItem = {
  scope: "phonetics",
  id: "ʌ",
  title: "/ʌ/",
  hint: "cup — love",
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  ackAppendixPillHint(); // پرچمِ معلقِ تستِ قبلی را سوزندان
  useStudy.setState({
    view: { type: "appendix" },
    known: {},
    results: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("پالس + حبابِ نشانگرِ ضمیمه — r246 ①", () => {
  it("① بی‌رسیدن = هیچ: نشانگرِ عادی نه data-pulsing دارد نه حباب", () => {
    act(() => {
      writeAppendixResume(phonRec);
    });
    render(<AppendixResumePill onGo={() => {}} />);
    const pill = screen.getByTestId("appendix-resume-pill");
    expect(pill).not.toHaveAttribute("data-pulsing");
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
  });

  it("② مسیرِ پرچم: درخواستِ قبل از mount → بعد از mount پالس + حبابِ role=status بی‌گیرِ ماوس با متنِ قرارداد", () => {
    act(() => {
      writeAppendixResume(phonRec);
      requestAppendixPillHint(); // پرنده: قبل از ناوبری پرچم را می‌گذارد
    });
    render(<AppendixResumePill onGo={() => {}} />);
    // مصرف با یک ماکروتسک به تعویق می‌افتد (قانونِ set-state-in-effect)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("appendix-resume-pill")).toHaveAttribute("data-pulsing", "true");
    const hint = screen.getByTestId("appendix-resume-pill-hint");
    expect(hint).toHaveAttribute("role", "status");
    // بی‌اثر برِ ماوس — هرگز کلیک نمی‌دزدد (قراردادِ حبابِ درِ هدرِ r245)
    expect(hint.className).toContain("pointer-events-none");
    expect(hint.className).toContain("absolute");
    // «چه‌کار» را می‌گوید: کلیک + کلیکِ راست (پاک‌کردن) — قراردادِ نشانگر
    expect(hint.textContent).toContain("کلیک: پرش به همین موضوع");
    expect(hint.textContent).toContain("کلیکِ راست: پاک‌کردنِ نشانگر");
  });

  it("③ چرخهٔ عمر: پالس بعد از ۱٫۶ثانیه می‌میرد، حباب بعد از ۳٫۶ثانیه", () => {
    act(() => {
      writeAppendixResume(phonRec);
      requestAppendixPillHint();
    });
    render(<AppendixResumePill onGo={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    const pill = screen.getByTestId("appendix-resume-pill");
    expect(pill).toHaveAttribute("data-pulsing", "true");
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(pill).not.toHaveAttribute("data-pulsing");
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument(); // حباب هنوز زنده

    act(() => {
      vi.advanceTimersByTime(2100); // مجموع ۳٫۷ثانیه از رسیدن
    });
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
  });

  it("④ پرچمِ کهنه (بیش از ۲ثانیه) دیرتر پالسِ کاذب نمی‌سازد — نگاهِ بدونِ عارضه، اقرارِ جدا (درسِ StrictMode)", () => {
    act(() => {
      requestAppendixPillHint();
      vi.advanceTimersByTime(2500); // درخواست کهنه شد
      writeAppendixResume(phonRec);
    });
    render(<AppendixResumePill onGo={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId("appendix-resume-pill")).not.toBeNull();
    expect(screen.getByTestId("appendix-resume-pill")).not.toHaveAttribute("data-pulsing");
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
    // نگاه، بدونِ عارضه است — پرچمِ کهنه هنوز آن‌جاست تا اقرارِ جدا پاکش کند
    expect(peekAppendixPillHint()).toBe(false); // کهنه است
    ackAppendixPillHint();
    expect(peekAppendixPillHint()).toBe(false);
  });

  it("④ب دو-بارِ mount (شکلِ StrictMode): پرچم در mountِ اول خورده نمی‌شود — دومین mountِ واقعی پالس می‌گیرد", () => {
    act(() => {
      writeAppendixResume(phonRec);
      requestAppendixPillHint();
    });
    // mountِ اول — StrictMode آن را همان‌جا unmount می‌کند (تایمرِ مصرف با cleanup لغو می‌شود)
    const { unmount } = render(<AppendixResumePill onGo={() => {}} />);
    unmount();
    // پرچم هنوز معلق است — نگاهِ بدونِ عارضه آن را نخورده
    expect(peekAppendixPillHint()).toBe(true);
    // mountِ دوم (remountِ واقعیِ StrictMode یا رسیدنِ دوباره) پالس + حباب می‌گیرد
    render(<AppendixResumePill onGo={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("appendix-resume-pill")).toHaveAttribute("data-pulsing", "true");
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();
    // اقرار شده — mountِ بعدی دیگر پالسِ کاذب نمی‌گیرد
    expect(peekAppendixPillHint()).toBe(false);
  });

  it("⑤ مسیرِ رویدادِ زنده: نشانگرِ سوارشده با رویداد پالس می‌گیرد و پالسِ نو عمرِ حباب را نوسازی می‌کند", () => {
    act(() => {
      writeAppendixResume(phonRec);
    });
    render(<AppendixResumePill onGo={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();

    // رسیدنِ در — رویدادِ زنده (نشانگر همین حالا سوار است)
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_APPENDIX_PILL_EVENT));
    });
    expect(screen.getByTestId("appendix-resume-pill")).toHaveAttribute("data-pulsing", "true");
    const hint = screen.getByTestId("appendix-resume-pill-hint");

    // ۲ ثانیه گذشت — پالس مُرد؛ ۱ ثانیه به انقضای حباب مانده...
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId("appendix-resume-pill")).not.toHaveAttribute("data-pulsing");
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();

    // پالسِ نو — نوسازی: ۲٫۲ ثانیه از پالسِ دوم یعنی ۴٫۲ از اولی؛ حباب باید زنده بماند
    act(() => {
      window.dispatchEvent(new CustomEvent(PULSE_APPENDIX_PILL_EVENT));
    });
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();
    expect(hint).toBeInTheDocument();

    // انقضای واقعی: ۳٫۷ ثانیه از پالسِ دوم
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
  });

  it("⑥ کلیکِ رویِ خودِ نشانگر حباب را زودتر می‌برد و پرشِ onGo انجام می‌شود", () => {
    const onGo = vi.fn();
    act(() => {
      writeAppendixResume(phonRec);
      requestAppendixPillHint();
    });
    render(<AppendixResumePill onGo={onGo} />);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("appendix-resume-pill"));
    expect(onGo).toHaveBeenCalledWith("phonetics", "ʌ");
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
    // حتی بعد از گذشتِ زمانِ طبیعیِ حباب، چیزی برنمی‌گردد (تایمرِ لغوشده)
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
  });
});

describe("helperِ مشترکِ openAppendixDoor — منطقِ رفت در یک نقطه — r246 ①", () => {
  it("⑦ رویِ خودِ ضمیمه: رویدادِ زنده می‌فرستد و هرگز ناوبری نمی‌کند", () => {
    const setView = vi.fn();
    const listener = vi.fn();
    window.addEventListener(PULSE_APPENDIX_PILL_EVENT, listener);
    openAppendixDoor(setView, true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(setView).not.toHaveBeenCalled();
    window.removeEventListener(PULSE_APPENDIX_PILL_EVENT, listener);
  });

  it("⑧ از جای دیگر: پرچمِ یک‌بارمصرف می‌گذارد + ناوبریِ فوریِ view به ضمیمه", () => {
    const setView = vi.fn();
    openAppendixDoor(setView, false);
    expect(setView).toHaveBeenCalledWith({ type: "appendix" });
    // پرچم تازه است — نخستین mount بعد از این ناوبری آن را می‌بیند
    expect(peekAppendixPillHint()).toBe(true);
    ackAppendixPillHint();
    expect(peekAppendixPillHint()).toBe(false); // اقرارشده
  });
});
