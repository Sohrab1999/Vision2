// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 75 (گام ۱۰ بخش ۲) — نخستین سوژهٔ زیرساخت تازهٔ «تست کامپوننت».
//
// چرا حبهٔ مرور: کاندید اولِ فهرست باقی‌ماندهٔ گام ۱۰ بخش ۲ (audit §12) —
// کامپوننتی که سه قرارداد را هم‌زمان به هم می‌دوزد و تا امروز فقط با
// QA دستی پروب می‌شد: ① قرارداد متنی خالص (duePillMeta) ② قرارداد
// شمارش SRS شامل حذف کلیدهای «q:» (F11 — سؤال‌های کنکور نباید شمارش
// واژگان را آلوده کنند) ③ ناوبری هوشمند (openLesson با نیت smart).
//
// الگوی زیرساخت (برای سوژه‌های بعدی):
//   • داک‌بلاک `@vitest-environment jsdom` — محیط گرهٔ سراسری node می‌ماند
//   • `@testing-library/jest-dom/vitest` — مترها فقط در همین فایل ثبت می‌شوند
//   • store واقعی zustand با setState مستقیم seed می‌شود (skipHydration —
//     هم‌درس ثبت‌شدهٔ راند ۵۹/۷۳: persist تا اولین action کلید ندارد و
//     در تست اصلاً localStorage لازم نیست)
//   • trackEvent با vi.mock ماک می‌شود — fetch نسبی در jsdom بی‌مقصد است
//     و رویدادِ فانل باید خودِ تست ادعا کند نه شبکه
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { SrsItem } from "@/state/types";
import DuePill from "@/components/study/practice/due-pill";
import { useStudy } from "@/lib/study-store";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

/** کارت سررسیدهٔ همین حالا (dueAt در گذشته) */
const dueNow = (): SrsItem => ({ level: 1, dueAt: Date.now() - 1000 });
/** کارت آینده — هرگز نباید وارد شمارش سررسید شود */
const future = (): SrsItem => ({ level: 0, dueAt: Date.now() + 86_400_000 });

describe("حبهٔ مرور سررسیده — کامپوننت (Task 75)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(trackEvent).mockClear();
    // baseline تمیز: srs خالی + ناوبری خانه — فقط فیلدهای این سوژه
    useStudy.setState({
      srs: {},
      view: { type: "home" },
      lessonTab: "vocab",
      flashIntent: "none",
      flashNonce: 0,
    });
  });

  it("srs خالی → هیچ دکمه‌ای رندر نمی‌شود (صفر نویز برای تازه‌وارد)", () => {
    const { container } = render(<DuePill />);
    expect(container.querySelector("button")).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it("فقط کارت‌های آینده → غایب (dueAt آینده وارد شمارش نمی‌شود)", () => {
    useStudy.setState({
      srs: { "1:ability": future(), "2:absent": future() },
    });
    const { container } = render(<DuePill />);
    expect(container.querySelector("button")).toBeNull();
  });

  it("۵ سررسیده (۳×درس۱ + ۲×درس۲) + آینده + q: → شمارش ۵ و درس ۱؛ q: آلوده نمی‌کند (F11)", () => {
    useStudy.setState({
      srs: {
        "1:ability": dueNow(),
        "1:absent": dueNow(),
        "1:accept": dueNow(),
        "2:achieve": dueNow(),
        "2:across": dueNow(),
        "3:action": future(),
        // سؤال آزمون/کنکور روی همان store — نباید در شمارش واژگان بیاید
        "q:exam-17": { level: 0, dueAt: Date.now() - 500 },
      },
    });
    render(<DuePill />);
    const pill = screen.getByRole("button");
    expect(pill).toHaveAttribute(
      "aria-label",
      "۵ کارت سررسیده — شروع مرور با فلش‌کارت‌های درس ۱"
    );
    expect(pill).toHaveAttribute("title", pill.getAttribute("aria-label"));
  });

  it("فقط درس ۲ سررسید → عنوان از درس ۲ شروع می‌شود", () => {
    useStudy.setState({
      srs: { "2:achieve": dueNow(), "2:across": dueNow(), "1:ability": future() },
    });
    render(<DuePill />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toContain("درس ۲");
  });

  it("مفرد: یک کارت → برچسب «۱ کارت سررسیده»", () => {
    useStudy.setState({ srs: { "1:ability": dueNow() } });
    render(<DuePill />);
    const pill = screen.getByRole("button");
    expect(pill.textContent).toContain("۱ کارت سررسیده");
    expect(pill.textContent).toContain("۱"); // برچسب فشردهٔ موبایل
  });

  it("هر دو برچسب بلند+کوتاه در DOM هستند (رسپانسیو سطح CSS، نه شرطی رندر)", () => {
    useStudy.setState({
      srs: { "1:ability": dueNow(), "1:absent": dueNow(), "2:achieve": dueNow() },
    });
    render(<DuePill />);
    // برچسب بلند دسکتاپ و شمارش فشردهٔ موبایل هر دو present اند —
    // نمایش/مخفی‌شدن کار استایل (hidden / min-[420px]:inline) نه شرط React
    expect(screen.getByText("۳ کارت سررسیده")).toHaveClass("hidden");
    expect(screen.getByText("۳")).not.toHaveClass("hidden");
  });

  it("کلیک → رویداد قیف srs_due_pill + ناوبری هوشمند درس اولِ سررسید", () => {
    useStudy.setState({
      srs: { "2:achieve": dueNow(), "1:ability": future() }, // اولین درسِ سررسید = ۲
    });
    const nonceBefore = useStudy.getState().flashNonce;
    render(<DuePill />);
    fireEvent.click(screen.getByRole("button"));

    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("srs_due_pill");
    // openLesson خودش lesson_open برمی‌دارد — هر دو رویداد از یک ضربه
    expect(vi.mocked(trackEvent)).toHaveBeenCalledWith("lesson_open");

    const st = useStudy.getState();
    expect(st.view).toEqual({ type: "lesson", id: 2 });
    expect(st.flashIntent).toBe("smart");
    expect(st.flashNonce).toBe(nonceBefore + 1); // نیت هوشمند nonce را بالا می‌برد
    expect(st.lessonTab).toBe("vocab"); // مرور هوشمند همیشه روی فلش‌کارت‌ها می‌نشیند
  });
});
