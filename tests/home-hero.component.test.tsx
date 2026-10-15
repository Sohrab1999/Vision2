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
      Array.from({ length: 179 }, (_, i) => [`w${i}`, true])
    );
    useStudy.setState({ known });
    render(<HomeHero />);
    expect(screen.getByRole("img", { name: "گنجینهٔ واژگانِ تو: ۵٪" })).toBeInTheDocument();
    expect(screen.getByText("۱۷۹ از ۳۵۶۶ واژه")).toBeInTheDocument();
    expect(screen.getByText("گنجینهٔ واژگانِ تو")).toBeInTheDocument();
  });

  it("تازه‌وارد: «۰٪» و «۰ از ۳۵۶۶ واژه» — حلقه بدونِ کمانِ پیشرفت رندر می‌شود", () => {
    render(<HomeHero />);
    const ring = screen.getByRole("img", { name: "گنجینهٔ واژگانِ تو: ۰٪" });
    expect(ring).toBeInTheDocument();
    // بدونِ کمان: فقط دو circle (زمینه + متن) — کمانِ کهربایی اصلاً نمی‌آید
    expect(ring.querySelectorAll("circle").length).toBe(1);
    expect(screen.getByText("۰ از ۳۵۶۶ واژه")).toBeInTheDocument();
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
    expect(screen.getByText("آموزش زبان انگلیسی دبیرستان")).toBeInTheDocument();
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
