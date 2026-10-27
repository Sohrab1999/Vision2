// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 140 «دفترِ زنجیرهٔ مأموریت‌ها» — چیپ رویِ پنلِ واقعی.
// قراردادهایی که قفل می‌شوند:
//   ① چیپ فقط از streak>=۲ ظاهر می‌شود (honest absence — تک‌روز و
//     زنجیرهٔ تهی هیچ المانی نمی‌سازند)
//   ② تساوی aria-label == title (قراردادِ freezeBadgeMeta/goalChipMeta)
//   ③ تاریخ از dayHistory می‌آید — چیپ حتی وقتی امروزِ ناقص است از
//     راهِ دیروز زنده می‌ماند
//   ④ نوارِ پاداش با زنجیرهٔ ≥۲ عددِ واقعی را ادعا می‌کند؛ وگرنه
//     همان «زنجیره‌ات امن است!» قدیمی — هر دو شاخه قفل می‌شود
// الگوی seed هم‌الگوی due-pill/goal-chip: setState مستقیم روی store
// واقعی (skipHydration) + vi.mock برای toast.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { useStudy, todayStr, daysAgoKey } from "@/lib/study-store";
import DailyQuests from "@/components/study/practice/daily-quests";

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

/** روزِ کاملِ پنج‌گانه — هر پنج هدف برآورده */
const perfect = (day: string) => ({ day, reviews: 10, words: 5, quizzes: 3, dictation: 1, rush: 1, stories: 0 });
/** روزِ چهار‌پنجم */
const fourOfFive = (day: string) => ({ ...perfect(day), rush: 0 });

describe("چیپ زنجیرهٔ مأموریت‌ها — کامپوننت (Task 140)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({
      srs: {},
      view: { type: "home" },
      dayStat: { day: todayStr(), reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 0 },
      dayHistory: {},
    });
  });

  it("سه روزِ پیاپی + امروزِ کامل → چیپ با «زنجیرهٔ ۳ روزه» و تساوی aria==title و شعله", () => {
    useStudy.setState({
      dayStat: perfect(todayStr()),
      dayHistory: {
        [daysAgoKey(0)]: perfect(daysAgoKey(0)),
        [daysAgoKey(1)]: perfect(daysAgoKey(1)),
        [daysAgoKey(2)]: perfect(daysAgoKey(2)),
      },
    });
    render(<DailyQuests />);
    const chip = document.querySelector(".quest-streak-chip");
    expect(chip).not.toBeNull();
    expect(chip).toHaveTextContent("زنجیرهٔ ۳ روزه");
    const title = chip!.getAttribute("title") || "";
    expect(title).toContain("۳ روزِ پیاپی هر پنج مأموریت کامل شده");
    expect(title).toContain("امروز هم عضوِ زنجیره‌ای");
    // قرارداد aria==title
    expect(chip).toHaveAttribute("aria-label", title);
    // شعلهٔ aria-hidden داخل چیپ
    expect(chip!.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("dayHistory خالی → هیچ چیپی رندر نمی‌شود (حضورِ صادقانه)", () => {
    render(<DailyQuests />);
    expect(document.querySelector(".quest-streak-chip")).toBeNull();
  });

  it("تک‌روزِ کامل → چیپ نمی‌آید — «زنجیره» یعنی حداقلِ دو حلقه", () => {
    useStudy.setState({
      dayStat: perfect(todayStr()),
      dayHistory: { [daysAgoKey(0)]: perfect(daysAgoKey(0)) },
    });
    render(<DailyQuests />);
    expect(document.querySelector(".quest-streak-chip")).toBeNull();
  });

  it("امروزِ ناقص ولی دیروز و پریروز کامل → چیپ از راهِ دیروز زنده: «زنجیرهٔ ۲ روزه»", () => {
    useStudy.setState({
      dayStat: fourOfFive(todayStr()),
      dayHistory: {
        [daysAgoKey(0)]: fourOfFive(daysAgoKey(0)),
        [daysAgoKey(1)]: perfect(daysAgoKey(1)),
        [daysAgoKey(2)]: perfect(daysAgoKey(2)),
      },
    });
    render(<DailyQuests />);
    const chip = document.querySelector(".quest-streak-chip");
    expect(chip).not.toBeNull();
    expect(chip).toHaveTextContent("زنجیرهٔ ۲ روزه");
    expect(chip!.getAttribute("title")).toContain("امروز هم بگیر تا زنجیره قطع نشود");
  });

  it("نوارِ پاداش — زنجیرهٔ ≥۲ با عضویتِ امروز عددِ واقعی را ادعا می‌کند", () => {
    useStudy.setState({
      dayStat: perfect(todayStr()),
      dayHistory: {
        [daysAgoKey(0)]: perfect(daysAgoKey(0)),
        [daysAgoKey(1)]: perfect(daysAgoKey(1)),
        [daysAgoKey(2)]: perfect(daysAgoKey(2)),
      },
    });
    render(<DailyQuests />);
    const band = screen.getByText(/پاداش روزانه گرفتی/);
    expect(band).toHaveTextContent("زنجیرهٔ مأموریت‌ها به ۳ روز رسید!");
  });

  it("نوارِ پاداش — تک‌روزِ کامل همان ادعای قدیمیِ امنیتِ زنجیره را می‌دهد", () => {
    useStudy.setState({
      dayStat: perfect(todayStr()),
      dayHistory: { [daysAgoKey(0)]: perfect(daysAgoKey(0)) },
    });
    render(<DailyQuests />);
    const band = screen.getByText(/پاداش روزانه گرفتی/);
    expect(band).toHaveTextContent("زنجیره‌ات امن است!");
    expect(band.textContent).not.toContain("زنجیرهٔ مأموریت‌ها به");
  });
});
