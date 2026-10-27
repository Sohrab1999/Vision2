// @vitest-environment jsdom
// ------------------------------------------------------------------
// r361 — «ادامهٔ خواندن» برایِ درسها — همزادِ درسیِ رکوردِ ضمیمه (r235)
// و کارتِ کتابخانه (r297): یادگیرندهٔ برگشتی به همان (درس، تب) آخرینِ
// مطالعه برمیگردد.
//
// قراردادهایی که این فایل قفل میکند:
//   • رکورد در localStorage است نه استور — هیچ فیلدِ جدیدِ persistای
//     نیست (قفلِ ساختاری: slices هیچ کلیدی از lesson-resume ندارند)
//   • نویسندهٔ یکتا lesson-view است — هیچ مسیرِ نویسندگیِ دیگری نیست
//   • پالایشِ صادقانه: درسِ بیرون از ۱..۱۲ / تبِ ناشناخته / JSONِ
//     خراب / `at`ِ بی‌تاریخ ⇒ رکورد نمی‌سازد — جعلِ محل ممنوع
//   • بازنویسیِ همسنت نمیکند — `at` فقط با تغییرِ واقعیِ محل تازه میشود
//   • پرش = openLessonTab + lesson_open (معنایِ openLesson) — رجیستریِ
//     ۵۲ دستنخورده
//   • بی‌رکورد ⇒ غیبتِ صادقانه — کارت هیچ رندر نمیکند
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const KEY = "vision2-lesson-resume-v1";

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------
// ① کتابخانهٔ خالص — پالایش و آیدیومِ رکوردِ بیرونی
// ---------------------------------------------------------------
describe("lesson-resume — رکوردِ بیرونِ استور", () => {
  it("① نوشتن/خواندنِ رفت‌وبرگشت + serverSnapshot همیشه null (هیدریشنِ امن)", async () => {
    const lib = await import("@/lib/lesson-resume");
    expect(lib.lessonResumeServerSnapshot()).toBeNull();
    lib.writeLessonResume(3, "dictation");
    const rec = lib.lessonResumeSnapshot();
    expect(rec).not.toBeNull();
    expect(rec!.lesson).toBe(3);
    expect(rec!.tab).toBe("dictation");
    expect(rec!.at).toBeTruthy();
  });

  it("② پالایشِ صادقانه: درسِ صفر/۱۳/کسری و تبِ ناشناخته هیچ مینویسد", async () => {
    const lib = await import("@/lib/lesson-resume");
    lib.writeLessonResume(0, "vocab");
    lib.writeLessonResume(13, "vocab");
    lib.writeLessonResume(2.5, "vocab");
    lib.writeLessonResume(2, "garbage" as never);
    expect(lib.lessonResumeSnapshot()).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    lib.writeLessonResume(2, "booklet"); // مرزِ بالا: ۱۲ مجاز، booklet از نُتایی مجاز
    lib.writeLessonResume(12, "tests");
    expect(lib.lessonResumeSnapshot()!.lesson).toBe(12);
  });

  it("③ رکوردِ خرابِ دستی (JSON/tab/at) ⇒ خواننده null — نه crash نه جعل", async () => {
    const lib = await import("@/lib/lesson-resume");
    for (const bad of ["{not-json", JSON.stringify({ lesson: 2, tab: "nope", at: "x" }), JSON.stringify({ lesson: 2, tab: "vocab" })]) {
      localStorage.setItem(KEY, bad);
      expect(lib.lessonResumeSnapshot()).toBeNull(); // هر سه شکلِ خراب ⇒ null
    }
    lib.writeLessonResume(99, "vocab"); // نویسنده هم پالایش دارد — بیاثر
    expect(lib.lessonResumeSnapshot()).toBeNull();
    lib.writeLessonResume(2, "grammar"); // نوشتنِ معتبر، رکوردِ خراب را جایگزین میکند (مسیرِ بهبودی)
    expect(lib.lessonResumeSnapshot()).toEqual({ lesson: 2, tab: "grammar", at: expect.any(String) });
  });

  it("④ بازنویسیِ همسنت نمیکند — `at` فقط با تغییرِ واقعی تازه میشود", async () => {
    const lib = await import("@/lib/lesson-resume");
    lib.writeLessonResume(2, "vocab");
    const at1 = lib.lessonResumeSnapshot()!.at;
    await new Promise((r) => setTimeout(r, 25));
    lib.writeLessonResume(2, "vocab"); // همسنت
    expect(lib.lessonResumeSnapshot()!.at).toBe(at1);
    lib.writeLessonResume(2, "grammar"); // تغییرِ تب
    expect(lib.lessonResumeSnapshot()!.at).not.toBe(at1);
  });

  it("⑤ subscribe در نوشتنِ غیرهمسنت آتش میشود", async () => {
    const lib = await import("@/lib/lesson-resume");
    let fires = 0;
    const un = lib.subscribeLessonResume(() => {
      fires += 1;
    });
    lib.writeLessonResume(4, "tests");
    lib.writeLessonResume(4, "tests"); // همسنت — بدونِ آتش
    un();
    expect(fires).toBe(1);
  });

  it("⑥ قفلِ ساختاری: استور فیلدِ نو ندارد، نویسندهٔ یکتا lesson-view است، رجیستری ۵۲", async () => {
    const slices = ["navigation.ts", "results.ts", "library.ts", "learning.ts", "srs.ts"]
      .map((f) => read(`src/state/slices/${f}`))
      .join("\n");
    expect(slices).not.toContain("lesson-resume");
    const view = read("src/components/study/lesson/lesson-view.tsx");
    expect(view).toContain("writeLessonResume(id, tab)");
    // نویسندهٔ یکتا — هیچ مصرفکنندهٔ دیگری write نمیکند
    const card = read("src/components/study/home/home-lesson-resume.tsx");
    expect(card).not.toContain("writeLessonResume");
    const reg = await import("@/lib/analytics-events");
    expect(reg.EVENT_NAMES).toHaveLength(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
  });
});

// ---------------------------------------------------------------
// ② کارتِ خانه — رندرِ زنده و پرشِ واقعی
// ---------------------------------------------------------------
describe("کارتِ ادامهٔ مطالعهٔ درس", () => {
  const seed = (lesson: number, tab: string, minutesAgo = 30) => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ lesson, tab, at: new Date(Date.now() - minutesAgo * 60_000).toISOString() })
    );
  };

  const renderCard = async () => {
    const { default: Card } = await import("@/components/study/home/home-lesson-resume");
    render(<Card />);
    await waitFor(() => {
      if (!document.querySelector("[data-lesson-resume]")) throw new Error("not-yet");
    });
  };

  it("⑦ با رکورد رندر میشود: «از درسِ ۲ ادامه بده — دیکته» + زمانِ نسبیِ فارسی + aria", async () => {
    seed(2, "dictation", 120);
    await renderCard();
    const btn = document.querySelector("[data-lesson-resume]") as HTMLElement;
    expect(btn.textContent).toContain("از درسِ ۲ ادامه بده — دیکته");
    expect(btn.textContent).toContain("۲ ساعت پیش");
    expect(btn.getAttribute("aria-label")).toBe("ادامهٔ مطالعه از درسِ ۲ — دیکته");
    expect(btn.getAttribute("data-resume-lesson")).toBe("2");
    expect(btn.getAttribute("data-resume-tab")).toBe("dictation");
  });

  it("⑧ پرش: view=lesson/2 + lessonTab=dictation + lesson_open ثبت میشود", async () => {
    seed(2, "dictation");
    await renderCard();
    const { trackEvent } = await import("@/lib/analytics");
    (document.querySelector("[data-lesson-resume]") as HTMLElement).click();
    await waitFor(() => {
      const s = useStudy.getState();
      if (s.view.type !== "lesson" || s.view.id !== 2) throw new Error("not-yet");
    });
    const s = useStudy.getState();
    expect(s.view).toEqual({ type: "lesson", id: 2 });
    expect(s.lessonTab).toBe("dictation");
    expect(trackEvent).toHaveBeenCalledWith("lesson_open");
  });

  it("⑨ بی‌رکورد ⇒ غیبتِ صادقانه — تازهوارد هیچ نمیبیند", async () => {
    const { default: Card } = await import("@/components/study/home/home-lesson-resume");
    render(<Card />);
    await new Promise((r) => setTimeout(r, 100));
    expect(document.querySelector("[data-lesson-resume]")).toBeNull();
  });

  it("⑩ تغییرِ زندهٔ رکورد (subscribe) کارت را به‌روز میکند — ۳→۵ با تبِ نو", async () => {
    seed(3, "vocab");
    await renderCard();
    expect(document.querySelector("[data-lesson-resume]")!.textContent).toContain("درسِ ۳");
    const lib = await import("@/lib/lesson-resume");
    act(() => {
      lib.writeLessonResume(5, "grammar"); // نویسندهٔ یکتا emit میکند — کارت زنده تازه میشود
    });
    await waitFor(() => {
      if (!document.querySelector("[data-lesson-resume]")!.textContent!.includes("درسِ ۵")) {
        throw new Error("not-yet");
      }
    });
    expect(document.querySelector("[data-lesson-resume]")!.textContent).toContain("گرامر");
  });
});
