// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۳ — خانوادهٔ انتخابگرها کامل شد: سرشماریِ هفت‌گانه.
// r272 فقط انتخابگرِ «تمرین هوشمند» را ناطق کرد؛ سرشماریِ همین راند
// هفت گروهِ هم‌خانوادهٔ دیگر را یافت که انتخاب را فقط با رنگ اعلام
// می‌کردند — همگی حالا گروهِ نام‌دار + وضعیتِ اعلام‌شده دارند
// (قراردادِ r272/posGrade، همان ایدئومِ فیلترِ پایهٔ ضمیمه):
//   my-words-review «طول جلسهٔ مرور» (گروهِ موجود، وضعیتِ گم‌شده)
//   review-view     «۱. طول جلسهٔ مرور» ۱۰/۱۵/۲۰
//   exam-view       «۱. تعداد سؤالات» + «۲. حالت آزمون» (جفتِ تایمر)
//   konkur-view     «تعداد تست» + «حالت جلسه» (جفتِ تایمر) + «تعداد تست تازه»
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, fireEvent, within, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import MyWordsReview from "@/components/study/practice/my-words-review";
import { useStudy } from "@/lib/study-store";
import type { ResolvedStar } from "@/lib/my-words-resolve";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
const count = (src: string, re: RegExp) => src.split(re).length - 1;

describe("r273 — ① سرشماریِ قفل‌هایِ منبع: هفت گروه، چهار فایل", () => {
  it("my-words-review: گروهِ نام‌دارِ قدیمی حالا وضعیت هم دارد — دقیقاً یک اعلام برایِ دو دکمه", () => {
    const src = read("src/components/study/practice/my-words-review.tsx");
    expect(src).toContain('role="group" aria-label="طول جلسهٔ مرور"');
    expect(src).toContain("aria-pressed={clamped === n}");
    expect(count(src, /aria-pressed=/g)).toBe(1);
    for (const m of src.matchAll(/aria-label="([^"]+)"/g)) {
      expect(m[1]).not.toContain("جزوه");
    }
  });

  it("review-view: «طول جلسهٔ مرور» گروهِ نام‌دار گرفت — سه دکمه با وضعیتِ clamp-آگاه", () => {
    const src = read("src/components/study/practice/review-view.tsx");
    expect(src).toContain('role="group" aria-label="طول جلسهٔ مرور"');
    expect(src).toContain("aria-pressed={clampedSize === n}");
    expect(count(src, /aria-pressed=/g)).toBe(1);
    for (const m of src.matchAll(/aria-label="([^"]+)"/g)) {
      expect(m[1]).not.toContain("جزوه");
    }
  });

  it("exam-view: شمارنده + جفتِ تایمر — دو گروهِ نام‌دار؛ هفت اعلام (پنجِ قدیمیِ dictScope/finalGrade/dو ModeCard سرِ جایش)", () => {
    const src = read("src/components/study/exam/exam-view.tsx");
    expect(src).toContain('role="group" aria-label="تعداد سؤال‌های آزمون جامع"');
    expect(src).toContain('role="group" aria-label="حالت آزمون جامع"');
    expect(src).toContain("aria-pressed={examCount === n}");
    expect(src).toContain("aria-pressed={examTimed}");
    expect(src).toContain("aria-pressed={!examTimed}");
    // قدیمی‌ها: scopeِ دیکشنری + دو ModeCard + پایهٔ نهایی — بی-ویرایش
    expect(src).toContain('aria-pressed={dictScope === "bank"}');
    expect(src).toContain("aria-pressed={finalGradeId === g.id}");
    expect(count(src, /aria-pressed=\{active\}/g)).toBe(2);
    expect(count(src, /aria-pressed=/g)).toBe(7);
    for (const m of src.matchAll(/aria-label="([^"]+)"/g)) {
      expect(m[1]).not.toContain("جزوه");
    }
  });

  it("konkur-view: سه گروه (شمارندهٔ شبیه‌ساز + جفتِ تایمر + شمارندهٔ پوشش) — پنج اعلام با ModeCardِ قدیمی", () => {
    const src = read("src/components/study/exam/konkur-view.tsx");
    expect(src).toContain('role="group" aria-label="تعداد تستِ شبیه‌ساز کنکور"');
    expect(src).toContain('role="group" aria-label="حالت جلسهٔ شبیه‌ساز"');
    expect(src).toContain('role="group" aria-label="تعداد تستِ تازهٔ پوشش بانک"');
    expect(src).toContain("aria-pressed={simCount === n}");
    expect(src).toContain("aria-pressed={simTimed}");
    expect(src).toContain("aria-pressed={!simTimed}");
    expect(src).toContain("aria-pressed={coverCount === n}");
    // قدیمیِ ModeCard — بی-ویرایش
    expect(src).toContain("aria-pressed={active}");
    expect(count(src, /aria-pressed=/g)).toBe(5);
    for (const m of src.matchAll(/aria-label="([^"]+)"/g)) {
      expect(m[1]).not.toContain("جزوه");
    }
  });

  it("r272 regression: انتخابگرِ تمرین هوشمند دست‌نخورده — قراردادِ مشترک سرِ جایش است", () => {
    const src = read("src/components/study/practice/smart-practice-view.tsx");
    expect(src).toContain('role="group" aria-label="طول جلسهٔ تمرین هوشمند"');
    expect(src).toContain("aria-pressed={size === n}");
  });
});

/* فیکسچرِ ستاره — کمینه برایِ MyWordsReview */
const star = (i: number): ResolvedStar =>
  ({
    key: `1:w${i}`,
    lessonId: 1,
    en: `word${i}`,
    fa: `معنی ${i}`,
    word: { en: `word${i}`, fa: `معنی ${i}` },
    color: "violet",
  }) as unknown as ResolvedStar;

describe("r273 — ② رندرِ زندهٔ my-words-review", () => {
  beforeEach(() => {
    cleanup();
    useStudy.setState({
      known: {},
      srs: {},
      mistakes: {},
      results: {},
      starredWords: [],
    } as never);
  });

  it("گروهِ «طول جلسهٔ مرور»: ۸ انتخاب‌شده، ۱۵ فراتر از فهرست — کلیکِ ۱۵ وضعیت را جابه‌جا می‌کند", async () => {
    const stars = Array.from({ length: 15 }, (_, i) => star(i));
    render(<MyWordsReview stars={stars} />);
    const group = await waitFor(() => screen.getByRole("group", { name: "طول جلسهٔ مرور" }));
    const b8 = within(group).getByRole("button", { name: "۸" });
    const b15 = within(group).getByRole("button", { name: "۱۵" });
    expect(b8).toHaveAttribute("aria-pressed", "true");
    expect(b15).toHaveAttribute("aria-pressed", "false");
    expect(b8).toBeEnabled();
    expect(b15).toBeEnabled();
    fireEvent.click(b15);
    expect(b15).toHaveAttribute("aria-pressed", "true");
    expect(b8).toHaveAttribute("aria-pressed", "false");
  });

  it("فهرستِ کوتاه (۶ ستاره، بالایِ حداقل): دکمه‌های فراتر از ستاره‌ها disabled و بی-وضعیتِ دروغین‌اند", async () => {
    const stars = Array.from({ length: 6 }, (_, i) => star(i));
    render(<MyWordsReview stars={stars} />);
    const group = await waitFor(() => screen.getByRole("group", { name: "طول جلسهٔ مرور" }));
    const b8 = within(group).getByRole("button", { name: "۸" });
    const b15 = within(group).getByRole("button", { name: "۱۵" });
    expect(b8).toBeDisabled();
    expect(b15).toBeDisabled();
    // clamp = min(8, 6) = ۶ — هیچ دکمه‌ای «انتخاب‌شده» نیست و صادقانه اعلام نمی‌کند
    expect(b8).toHaveAttribute("aria-pressed", "false");
    expect(b15).toHaveAttribute("aria-pressed", "false");
  });

  it("زیرِ حداقلِ چهار ستاره: گروه اصلاً رندر نمی‌شود و مسیرِ نجاتِ دیکشنری می‌آید", async () => {
    const stars = Array.from({ length: 2 }, (_, i) => star(i));
    render(<MyWordsReview stars={stars} />);
    expect(screen.queryByRole("group", { name: "طول جلسهٔ مرور" })).toBeNull();
    expect(screen.getByRole("button", { name: /رفتن به دیکشنری/ })).toBeInTheDocument();
    expect(screen.getByText(/حداقل ۴ واژه نشان کن — الان ۲ داری/)).toBeInTheDocument();
  });
});
