// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۷ — بندهای ①+② پیشنهادِ ۲۴۶:
//   ① خانوادهٔ resumeDoor به نتیجهٔ آزمون جامع و کنکور رسید — همان
//     AppendixResumeRow بینِ کارتِ نتیجه (گواهی) و مرور؛ opt-inِ هر
//     مصرف‌کننده، پیش‌فرضِ بقیه دست‌نخورده.
//   ② حبابِ آموزشیِ چیپِ «مسیر اخیر» نشانگرِ ضمیمه — قراردادِ
//     «پرش ≠ نوشتن» (r239) که فقط در تولتیپ ساکن بود، حالا لحظهٔ
//     استفاده از نزدیک گفته می‌شود: بعد از پرشِ چیپ، statusِ گذرای
//     ۳٫۶ثانیه‌ای تأیید می‌کند نشانگر عوض نشده. قراردادها:
//     ① نتیجه با resumeDoor + رکورد: ردیف حاضر (شکلِ گواهیِ آزمون)
//     ② سیم‌کشی: exam-view و konkur-view واقعاً resumeDoor می‌دهند
//     ③ کلیکِ چیپ: پرشِ onGo + حبابِ role=status بی‌گیرِ ماوس با متنِ
//        قرارداد — و رکوردِ دست‌نخورده (پرش ≠ نوشتن، از نزدیک)
//     ④ عمرِ ۳٫۶ثانیه‌ای واقعی
//     ⑤ نوسازیِ عمر با پرشِ دوم
//     ⑥ استقلالِ حباب‌ها: رسیدنِ نشانگر (پرچم) حبابِ چیپ را روشن نمی‌کند
//        و پرشِ چیپ حبابِ رسیدن را — هر حباب فقط درسِ خودش را می‌گوید
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import AppendixResumePill from "@/components/study/lesson/appendix-resume-pill";
import QuizResult from "@/components/study/quiz/quiz-result";
import {
  writeAppendixResume,
  readAppendixResume,
} from "@/lib/bg-reading";
import { requestAppendixPillHint } from "@/lib/resume-loop-doors";
import { useStudy } from "@/lib/study-store";
import type { AppendixResumeItem } from "@/lib/bg-reading";
import type { QuizQuestion as QQ } from "@/lib/study-types";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const verbRec: AppendixResumeItem = {
  scope: "verbs",
  id: "eat",
  title: "eat — ate — eaten",
  hint: "خوردن",
};
const grammarRec: AppendixResumeItem = {
  scope: "grammar",
  id: "t-present-simple",
  title: "حال ساده",
  hint: "ص ۲۳",
};

const q: QQ = {
  id: "q-r247-1",
  category: "vocab",
  question: "They ___ football on Fridays.",
  options: ["play", "plays", "played", "playing"],
  answer: 0,
  translation: "آن‌ها جمعه‌ها فوتبال بازی می‌کنند.",
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
  useStudy.setState({
    view: { type: "appendix" },
    known: {},
    results: {},
    mistakes: {},
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

describe("خانوادهٔ resumeDoor — نتیجهٔ آزمون جامع و کنکور — r247 ①", () => {
  it("① نتیجه با گواهی (شکلِ آزمون جامع) + resumeDoor + رکورد: ردیف بینِ گواهی و مرور", () => {
    act(() => {
      writeAppendixResume(grammarRec);
    });
    render(
      <QuizResult
        title="آزمون جامع پایان ترم"
        questions={[q]}
        answers={[0]}
        correctCount={1}
        certificate
        gradeLabel="پایهٔ یازدهم"
        resumeDoor
        onRestart={() => {}}
        onExit={() => {}}
      />,
    );
    const row = screen.getByTestId("results-resume-row");
    expect(row).toHaveTextContent("ادامهٔ مطالعه از «حال ساده»");
    const container = row.parentElement!;
    expect(Array.from(container.children).indexOf(row)).toBe(1); // بعد از گواهی
    fireEvent.click(row);
    expect(useStudy.getState().view).toMatchObject({ type: "appendix", topicId: "t-present-simple" });
  });

  it("② سیم‌کشی: exam-view و konkur-view واقعاً resumeDoor می‌دهند (گاردِ منبع)", () => {
    const exam = readFileSync(join(process.cwd(), "src/components/study/exam/exam-view.tsx"), "utf8");
    const konkur = readFileSync(join(process.cwd(), "src/components/study/exam/konkur-view.tsx"), "utf8");
    expect(exam).toMatch(/resumeDoor\b/);
    expect(konkur).toMatch(/resumeDoor\b/);
  });
});

describe("حبابِ «پرش ≠ نوشتن» چیپِ «مسیر اخیر» — r247 ②", () => {
  it("③ کلیکِ چیپ: پرشِ onGo + حبابِ role=status بی‌گیرِ ماوس با متنِ قرارداد + رکوردِ دست‌نخورده", () => {
    act(() => {
      writeAppendixResume(verbRec); // قدیمی‌تر → چیپ
      writeAppendixResume(grammarRec); // آخرین نوشتن = رکوردِ اصلی
    });
    const onGo = vi.fn();
    render(<AppendixResumePill onGo={onGo} />);
    const chip = screen.getByTestId("appendix-recent-chip-verbs-eat");
    expect(screen.queryByTestId("appendix-recent-chip-hint")).toBeNull(); // پیش‌فرضِ هیچ

    const before = JSON.stringify(readAppendixResume());
    fireEvent.click(chip);
    expect(onGo).toHaveBeenCalledWith("verbs", "eat");
    // پرش ≠ نوشتن — رکورد همان «حال ساده» ماند
    expect(JSON.stringify(readAppendixResume())).toBe(before);

    const hint = screen.getByTestId("appendix-recent-chip-hint");
    expect(hint).toHaveAttribute("role", "status");
    expect(hint.getAttribute("data-chip-hinting")).toBe("true");
    expect(hint.className).toContain("pointer-events-none");
    // r247 — متنِ لایه-بی‌طرفِ صادق از JUMP_VS_WRITE_FA (سه لایه رسیدنِ
    // لنگردار را «دیدن» می‌دانند؛ جملهٔ کهنه برایشان نادرست بود)
    expect(hint.textContent).toContain("پرش ≠ نوشتنِ دستی");
    expect(hint.textContent).toContain("از خواندنِ واقعی");
  });

  it("④ عمرِ ۳٫۶ثانیه‌ای واقعی — بعدش هیچ", () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    render(<AppendixResumePill onGo={() => {}} />);
    fireEvent.click(screen.getByTestId("appendix-recent-chip-verbs-eat"));
    expect(screen.getByTestId("appendix-recent-chip-hint")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(screen.queryByTestId("appendix-recent-chip-hint")).toBeNull();
  });

  it("⑤ نوسازیِ عمر: پرشِ دوم در ثانیهٔ ۳ — حباب تا ۳٫۹ثانیه از اولی زنده می‌ماند", () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    render(<AppendixResumePill onGo={() => {}} />);
    const chip = screen.getByTestId("appendix-recent-chip-verbs-eat");
    fireEvent.click(chip);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(chip); // پرشِ دوم — عمر نوسازی شد
    act(() => {
      vi.advanceTimersByTime(900); // ۳٫۹ از اولی ولی ۰٫۹ از دومی
    });
    expect(screen.getByTestId("appendix-recent-chip-hint")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2800); // ۳٫۷ از دومی
    });
    expect(screen.queryByTestId("appendix-recent-chip-hint")).toBeNull();
  });

  it("⑥ استقلالِ حباب‌ها: رسیدنِ نشانگر (پرچم) حبابِ چیپ را نمی‌سازد و پرشِ چیپ حبابِ رسیدن را", () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
      requestAppendixPillHint(); // رسیدنِ یک در — پرچمِ حبابِ نشانگر
    });
    render(<AppendixResumePill onGo={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(1); // پرچم مصرف شد → حبابِ رسیدن
    });
    expect(screen.getByTestId("appendix-resume-pill-hint")).toBeInTheDocument();
    expect(screen.queryByTestId("appendix-recent-chip-hint")).toBeNull(); // حبابِ چیپ نه

    // حالا برعکس: حبابِ رسیدن را بگذار بمیرد، بعد پرشِ چیپ — فقط حبابِ چیپ
    act(() => {
      vi.advanceTimersByTime(3700);
    });
    fireEvent.click(screen.getByTestId("appendix-recent-chip-verbs-eat"));
    expect(screen.getByTestId("appendix-recent-chip-hint")).toBeInTheDocument();
    expect(screen.queryByTestId("appendix-resume-pill-hint")).toBeNull();
  });

  it("⑦ متنِ صادق از ثابتِ مشترکِ JUMP_VS_WRITE_FA میفاید — یک منبع، صفرِ نسخهٔ دستیِ کهنه", () => {
    const pillSrc = readFileSync(join(process.cwd(), "src/components/study/lesson/appendix-resume-pill.tsx"), "utf8");
    const headerSrc = readFileSync(join(process.cwd(), "src/components/study/shell/header-resume-button.tsx"), "utf8");
    const homeSrc = readFileSync(join(process.cwd(), "src/components/study/home/home-appendix-history.tsx"), "utf8");
    const profileSrc = readFileSync(join(process.cwd(), "src/components/study/profile/profile-popover.tsx"), "utf8");
    // همهٔ مصرفنندهها از ثابتِ مشترک میخوانند
    expect(pillSrc).toContain("JUMP_VS_WRITE_FA");
    expect(headerSrc).toContain("JUMP_VS_WRITE_FA");
    expect(homeSrc).toContain("JUMP_VS_WRITE_FA");
    expect(profileSrc).toContain("JUMP_VS_WRITE_FA");
    // جملهٔ دستیِ کهنه (نادرست برایِ سه لایه) دیگر در هیچجا نیست
    expect(pillSrc).not.toContain("را عوض نمیکند");
    expect(headerSrc).not.toContain("را عوض نمیکند");
    expect(homeSrc).not.toContain("را عوض نمیکند");
    expect(profileSrc).not.toContain("را عوض نمیکند");
  });
});
