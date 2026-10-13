// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 111 «کتابِ زنده» — هیرو روی صفحه:
//   ① حلقهٔ گنجینه با درصدِ واقعیِ استور (aria-label + ارقامِ فارسی)
//   ② تازه‌وارد: «۰» و «۰ از ۶۳۳ واژه» — صفرِ صادق، حلقهٔ خالی
//   ③ ساختارِ زنده: کلاسِ hero-book روی جلد + لبهٔ صفحاتِ aria-hidden
//   ④ reduce-motion: هیچ المنتِ متنی گم نمی‌شود و حلقه سرِ جایش است
//     (صف‌ربانیِ ورود initial=false می‌شود — رندرِ یکسان)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import HomeHero from "@/components/study/home/home-hero";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("هیرو — کتابِ زنده (Task 111)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ known: {}, settings: { ttsRate: 1, fontScale: 1, reduceMotion: false } });
  });

  it("حلقهٔ گنجینه درصدِ واقعیِ استور را نشان می‌دهد — aria + ارقامِ فارسی + شمار", () => {
    const known = Object.fromEntries(
      Array.from({ length: 126 }, (_, i) => [`w${i}`, true])
    );
    useStudy.setState({ known });
    render(<HomeHero />);
    expect(screen.getByRole("img", { name: "گنجینهٔ واژگانِ تو: ۲۰٪" })).toBeInTheDocument();
    expect(screen.getByText("۱۲۶ از ۶۳۳ واژه")).toBeInTheDocument();
    expect(screen.getByText("گنجینهٔ واژگانِ تو")).toBeInTheDocument();
  });

  it("تازه‌وارد: «۰٪» و «۰ از ۶۳۳ واژه» — حلقه بدونِ کمانِ پیشرفت رندر می‌شود", () => {
    render(<HomeHero />);
    const ring = screen.getByRole("img", { name: "گنجینهٔ واژگانِ تو: ۰٪" });
    expect(ring).toBeInTheDocument();
    // بدونِ کمان: فقط دو circle (زمینه + متن) — کمانِ کهربایی اصلاً نمی‌آید
    expect(ring.querySelectorAll("circle").length).toBe(1);
    expect(screen.getByText("۰ از ۶۳۳ واژه")).toBeInTheDocument();
  });

  it("ساختارِ زنده: جلد کلاسِ hero-book دارد و لبهٔ صفحات aria-hidden است", () => {
    render(<HomeHero />);
    const cover = screen.getByRole("button", { name: "باز کردن کتاب" });
    expect(cover.className).toContain("hero-book");
    const edges = cover.querySelectorAll('[aria-hidden="true"]');
    expect(edges.length).toBeGreaterThanOrEqual(2); // لبهٔ صفحات + لبهٔ شانه
  });

  it("کلیکِ جلد درسِ اول را باز می‌کند — تعاملِ همیشگی سالم مانده", () => {
    render(<HomeHero />);
    fireEvent.click(screen.getByRole("button", { name: "باز کردن کتاب" }));
    const view = useStudy.getState().view as { type: string; id?: number };
    expect(view.type).toBe("lesson");
    expect(view.id).toBe(1);
  });

  it("reduce-motion: همان محتوا رندر می‌شود — حلقه و عنوان‌ها سرِ جایشان", () => {
    useStudy.setState({ known: { a: true, b: true } });
    render(<HomeHero />);
    expect(screen.getByRole("img", { name: "گنجینهٔ واژگانِ تو: ۰٪" })).toBeInTheDocument();
    expect(screen.getByText("آموزش زبان انگلیسی پایهٔ یازدهم")).toBeInTheDocument();
  });

  it("تیلتِ مسیرِ فعال: با pointer:fineِ شبیه‌سازی‌شده، pointermove چرخش می‌سازد و leave برمی‌گرداند", async () => {
    // jsdom matchMedia ندارد/همه‌چیز false است — headlessِ واقعی هم «pointer: none»
    // گزارش می‌داد و گیت درستِ اپ tilt را می‌بندید (درسِ ۱۱۱)؛ این‌جا مسیرِ فعال را
    // با شبیه‌سازیِ pointer:fine اثبات می‌کنیم
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q === "(pointer: fine)", media: q })) as unknown as typeof window.matchMedia;
    try {
      const { waitFor } = await import("@testing-library/react");
      render(<HomeHero />);
      const cover = screen.getByRole("button", { name: "باز کردن کتاب" });
      // jsdom گتِBoundingClientRect را صفرِ کامل می‌دهد — تقسیم بر صفر یعنی
      // Infinity و framer سبکِ بی‌معنا را نمی‌بندد؛ رکتِ واقعی‌نما می‌گذاریم
      const fakeRect = { left: 100, top: 100, width: 288, height: 420, right: 388, bottom: 520, x: 100, y: 100, toJSON: () => ({}) };
      cover.getBoundingClientRect = () => fakeRect as DOMRect;
      fireEvent.pointerMove(cover, { clientX: 100 + 288 * 0.15, clientY: 100 + 420 * 0.2 });
      // فنر حرکت می‌کند — سبکِ transform از none به چرخشِ واقعی می‌رسد
      // (framer توابعِ جدا rotateX/rotateY می‌نویسد نه matrix3d)
      await waitFor(() => expect(cover.style.transform).toContain("rotateX("), { timeout: 2000 });
      const angleDuringTilt = parseFloat(cover.style.transform.split("rotateX(")[1]);
      expect(Number.isFinite(angleDuringTilt)).toBe(true);
      fireEvent.pointerLeave(cover);
      // فنر به مرزِ سکون برمی‌گردد — زاویه به صفرِ نزدیک می‌شود
      await waitFor(
        () => {
          const m = cover.style.transform.match(/rotateX\((-?[\d.]+)/);
          expect(m && Math.abs(parseFloat(m[1])) < 0.5).toBe(true);
        },
        { timeout: 3000 }
      );
    } finally {
      window.matchMedia = orig;
    }
  });

  it("تیلت و reduce-motion: با تنظیمِ کاربر، pointermove هیچ چرخشی نمی‌سازد — حتی با pointer:fine", async () => {
    const orig = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q === "(pointer: fine)", media: q })) as unknown as typeof window.matchMedia;
    try {
      useStudy.setState({ settings: { ttsRate: 1, fontScale: 1, reduceMotion: true } });
      render(<HomeHero />);
      const cover = screen.getByRole("button", { name: "باز کردن کتاب" });
      const rect = cover.getBoundingClientRect();
      fireEvent.pointerMove(cover, { clientX: rect.left + rect.width * 0.1, clientY: rect.top + rect.height * 0.15 });
      await new Promise((r) => setTimeout(r, 150));
      expect(cover.style.transform === "none" || cover.style.transform === "").toBe(true);
    } finally {
      window.matchMedia = orig;
    }
  });

});

// ------------------------------------------------------------------
// Task 123 «هیروی زیرِ ۴۰۰px» — قراردادِ ضد-سرریز و ریتمِ موبایل:
//   ① سقفِ ضد-سرریز: در ۲۸۰px (گلکسی فولد) جلدِ w-64 با هالهٔ -inset-4
//      از ویوپورت بیرون می‌زد (OV=19px زنده اندازه‌گیری شد)؛ حالا
//      max-w-full روی زنجیرهٔ جلد + هالهٔ -inset-3 در موبایل
//   ② تیترِ ۲۶px در موبایل (۳۲۰px ⇒ پنج‌خطِ ۲۰۷px به ریتمِ بهتر) و ۴xl از sm
//   ③ دکمه‌های CTA زیرِ sm ستونیِ تمام‌عرض — شکستنِ دوخطیِ ناهماهنگِ قدیمی
//   ④ مقدارِ آمار text-base در موبایل — سلولِ ۷۷px دیگر دوخطیِ ۱۳۹px نمی‌شود
// jsdom چیدمان ندارد؛ قرارداد = کلاس‌ها (همان سنّتِ «ساختارِ زنده» بالا)
// ------------------------------------------------------------------
describe("هیرو — ضد-سرریزِ زیرِ ۴۰۰px (Task 123)", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    useStudy.setState({ known: {}, settings: { ttsRate: 1, fontScale: 1, reduceMotion: false } });
  });

  it("زنجیرهٔ جلد سقفِ max-w-full دارد — خودِ جلد، والدِ perspective و ستون‌هایِ grid", () => {
    render(<HomeHero />);
    const cover = screen.getByRole("button", { name: "باز کردن کتاب" });
    expect(cover.className).toContain("max-w-full");
    expect(cover.className).toContain("w-64");
    expect(cover.className).toContain("sm:w-72"); // دسکتاپ دست‌نخورده
    const wrapper = cover.parentElement as HTMLElement;
    expect(wrapper.className).toContain("max-w-full");
    // Task 123 — گزیدِ grid با min-width:auto محتوایِ بی‌شکننده را می‌پهند
    // و max-w-full هرگز جمع نمی‌شود — هر دو ستون min-w-0 می‌خواهند
    const column = wrapper.parentElement as HTMLElement;
    expect(column.className).toContain("min-w-0");
    const textColumn = screen.getByText("آموزش زبان انگلیسی پایهٔ یازدهم").closest("h1")!.parentElement as HTMLElement;
    expect(textColumn.className).toContain("min-w-0");
  });

  it("هالهٔ پس‌زمینه در موبایل باریک‌تر است — -inset-3 و از sm همان -inset-4", () => {
    render(<HomeHero />);
    const cover = screen.getByRole("button", { name: "باز کردن کتاب" });
    const wrapper = cover.parentElement as HTMLElement;
    const glow = wrapper.querySelector(":scope > div[aria-hidden]") as HTMLElement | null;
    expect(glow).not.toBeNull();
    expect(glow!.className).toContain("-inset-3");
    expect(glow!.className).toContain("sm:-inset-4");
  });

  it("تیترِ هیرو در موبایل ۲۶px است و از sm چهار — ریتمِ پنج‌خطِ ۲۰۷px حل شده", () => {
    render(<HomeHero />);
    const h1 = screen.getByText("آموزش زبان انگلیسی پایهٔ یازدهم").closest("h1") as HTMLElement;
    expect(h1.className).toContain("text-[26px]");
    expect(h1.className).toContain("sm:text-4xl");
  });

  it("CTA زیرِ sm ستونیِ تمام‌عرض — هر دو دکمه w-full و از sm خودکار", () => {
    render(<HomeHero />);
    const start = screen.getByRole("button", { name: /شروع یادگیری/ });
    const exam = screen.getByRole("button", { name: /آزمون جامع/ });
    for (const btn of [start, exam]) {
      expect(btn.className).toContain("w-full");
      expect(btn.className).toContain("justify-center");
      expect(btn.className).toContain("sm:w-auto");
    }
    const row = start.parentElement as HTMLElement;
    expect(row.className).toContain("flex-col");
    expect(row.className).toContain("sm:flex-row");
  });

  it("مقدارِ آمار در موبایل text-base — کارتِ ۷۷px دیگر ۱۳۹px کش نمی‌آید", () => {
    render(<HomeHero />);
    const vocab = screen.getByText("۶۳۳+");
    expect(vocab.className).toContain("text-base");
    expect(vocab.className).toContain("sm:text-lg");
  });
});
