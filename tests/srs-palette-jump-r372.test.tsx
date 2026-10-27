// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۷۲ — بندِ ④ پیشنهادِ r371: «داشبورد مرور هوشمند» در فرمان‌یاب —
// چهارمین مصرفِ تابعِ پرشِ focusSrsDashboard. قراردادها:
//   ① پرچمِ یک‌بارمصرفِ مُهرِدار (ایدئومِ نشانگرِ ضمیمه، r246):
//     request/peek/ack — نگاهِ بدونِ عارضه، اقرار فقط در تایمرِ زنده؛
//     کهنهشدنِ ۲ثانیهای پالسِ کاذبِ دیرهنگام را نمیسازد.
//   ② حضورِ صادقانه: تازهوارد فرمان ندارد (گیت = hasProgressِ خانه،
//     home-view r297)؛ شمارشِ جهانِ بی‌داده همان ۳۷ میماند.
//   ③ گیتِ چهارشاخه‌ای: بلدم/آزمون/srs/کتابخانه — هر کدام بهتنهایی
//     کافی؛ مقدارِ falseِ محض کافی نیست (هم‌ارزِ semanticsِ خانه).
//   ④ دو مسیرِ رسیدن: از دنیایِ دیگر = پرچم + ناوبری (پنل بعد از mount
//     با سکونِ ۴۵۰ms مصرف میکند)؛ رویِ خودِ خانه = پرشِ زنده بعد از
//     تحویلِ فوکوسِ پالت (درسِ r243 — ۲۶۰ms).
//   ⑤ رفعِ اشکالِ همراه: آیکونِ «پنل معلم» که هرگز School نشده بود —
//     کلیدِ «School» در ICONS نبود و به BookOpen برمیگشت.
//   ⑥ بیرویدادِ تحلیلیِ نو — پرش کنشِ یادگیری نیست (رجیستریِ ۵۲).
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import CommandPalette from "@/components/study/shell/command-palette";
import SrsPanel from "@/components/study/practice/srs-panel";
import {
  requestSrsSpotlight,
  peekSrsSpotlight,
  ackSrsSpotlight,
} from "@/lib/srs-due";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const openPalette = () => {
  fireEvent(window, new CustomEvent("open-command-palette"));
};

const srsRow = (): HTMLElement => {
  const rows = screen.getAllByRole("option") as HTMLElement[];
  const hit = rows.find((r) => (r.textContent ?? "").includes("داشبورد مرور هوشمند"));
  expect(hit, "row داشبورد مرور هوشمند").toBeDefined();
  return hit!;
};

const PROGRESS_SRS = {
  "1:ability": { level: 0, dueAt: Date.now() + 60_000 },
  "1:access": { level: 2, dueAt: Date.now() + 3 * 60_000 },
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
  cleanup();
  vi.useFakeTimers();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.mocked(trackEvent).mockClear();
  ackSrsSpotlight(); // حالتِ ماژولِ پرچم — بینِ آزمونها پاک
  (Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mockClear();
  useStudy.setState({
    view: { type: "dictionary" } as never,
    lessonTab: "vocab",
    konkurSeen: {},
    duelHistory: [],
    libraryDone: {},
    known: {},
    results: {},
    srs: {},
  } as never);
  cleanup();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("پرچمِ یک‌بارمصرفِ مُهرِدار — r372 ①", () => {
  it("① چرخهٔ کامل: request → peekِ تازه → ack → peekِ خالی؛ ackِ بیپرچم بیعارضه", () => {
    expect(peekSrsSpotlight()).toBe(false); // آغاز: هیچ درخواستی
    requestSrsSpotlight();
    expect(peekSrsSpotlight()).toBe(true);
    ackSrsSpotlight();
    expect(peekSrsSpotlight()).toBe(false);
    ackSrsSpotlight(); // دوباره — بیعارضه (اکسیمپوتنت)
    expect(peekSrsSpotlight()).toBe(false);
  });

  it("② کهنهشدنِ ۲ثانیهای: ۱۹۹۹ms تازه، ۲۰۰۰ms مرده — درخواستِ کهنه پالسِ کاذب نمیسازد", () => {
    requestSrsSpotlight();
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(peekSrsSpotlight()).toBe(true); // هنوز در پنجرهٔ تازگی
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(peekSrsSpotlight()).toBe(false); // مهلتِ ۲ثانیهای تمام — هیچ مصرفکنندهای آن را نمیبیند
  });
});

describe("حضورِ صادقانه + گیتِ چهارشاخه‌ای — r372 ②③", () => {
  it("③ تازهوارد: فرمان غایب است — جهانِ بی‌داده همان ۳۷ گزینه (شمارشِ کهنه پابرجا)", () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.queryByRole("option", { name: /داشبورد مرور هوشمند/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("option").length).toBe(37);
  });

  it("④ با srs: فرمان در «ناوبری» حاضر است — برچسب/hint + آیکونِ CalendarClock؛ و آیکونِ معلم دیگر BookOpenِ پشتیبان نیست", () => {
    useStudy.setState({ srs: PROGRESS_SRS } as never);
    render(<CommandPalette />);
    openPalette();
    const row = srsRow();
    expect(row.textContent).toContain("داشبورد مرور هوشمند");
    expect(row.textContent).toContain("سررسیدها، نردبان حافظه و پیش‌بینی هفت‌روزه");
    // آیکونِ نو — گروهِ آیکونهای lucide با کلاسِ خودشان داوری میشوند
    expect(row.querySelector("svg.lucide-calendar-clock")).not.toBeNull();
    // رفعِ اشکالِ همراه: «پنل معلم» حالا School واقعی است (قبل: lucide-book-openِ پشتیبان)
    const teacher = (screen.getAllByRole("option") as HTMLElement[]).find((r) =>
      (r.textContent ?? "").includes("پنل معلم"),
    );
    expect(teacher).toBeDefined();
    expect(teacher!.querySelector("svg.lucide-school")).not.toBeNull();
  });

  it("⑤ گیتِ چهارشاخه‌ای = hasProgressِ خانه: هر شاخه بهتنهایی کافی؛ falseِ محض کافی نیست", () => {
    // شاخهٔ ۱: بلدمِ واقعی (مقدارِ true)
    useStudy.setState({ known: { "1:able": true } } as never);
    render(<CommandPalette />);
    openPalette();
    expect(srsRow()).toBeDefined();
    cleanup();
    // شاخهٔ ۲: آزمون
    useStudy.setState({ known: {}, results: { "1:q1": 1 } } as never);
    render(<CommandPalette />);
    openPalette();
    expect(srsRow()).toBeDefined();
    cleanup();
    // شاخهٔ ۳: کتابخانه
    useStudy.setState({ results: {}, libraryDone: { "s1-1": true } } as never);
    render(<CommandPalette />);
    openPalette();
    expect(srsRow()).toBeDefined();
    cleanup();
    // ضدِّالگو: knownِ all-false پیشرفت نیست — عینِ Object.values(known).some(Boolean)ِ خانه
    useStudy.setState({ libraryDone: {}, known: { "1:able": false } } as never);
    render(<CommandPalette />);
    openPalette();
    expect(screen.queryByRole("option", { name: /داشبورد مرور هوشمند/ })).not.toBeInTheDocument();
  });
});

describe("دو مسیرِ رسیدن — r372 ④", () => {
  it("⑥ از دنیایِ دیگر: پرچم گذاشته میشود + ناوبری به خانه — بیرویدادِ تحلیلی، بیپرشِ زنده", () => {
    useStudy.setState({ srs: PROGRESS_SRS } as never);
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(srsRow());
    });
    expect(useStudy.getState().view).toEqual({ type: "home" });
    expect(peekSrsSpotlight()).toBe(true); // پرچمِ معلق — پنلِ آینده مصرفش میکند
    // پرشِ زنده پیشِ ناوبری اتفاق نیفتاده — scrollIntoView هنوز صدا نخورده
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    // پرش، کنشِ یادگیری نیست — هیچ رویدادِ تحلیلی
    expect(trackEvent).not.toHaveBeenCalled();
    expect(EVENT_NAMES.length).toBe(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306)؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
  });

  it("⑦ رویِ خودِ خانه: پرشِ زنده بعد از ۲۶۰ms تحویلِ فوکوس — اسکرول + فوکوس + پالس؛ مرگِ پالس در ۱۶۰۰ms", () => {
    useStudy.setState({ srs: PROGRESS_SRS, view: { type: "home" } } as never);
    render(
      <>
        <SrsPanel />
        <CommandPalette />
      </>,
    );
    openPalette();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    act(() => {
      fireEvent.click(srsRow());
    });
    // هنوز در دورهٔ تحویل — هیچ
    act(() => {
      vi.advanceTimersByTime(259);
    });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    const section = document.getElementById("srs-dashboard")!;
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(
      (Element.prototype.scrollIntoView as ReturnType<typeof vi.fn>).mock.calls.some(
        (c) => c[0]?.block === "start",
      ),
    ).toBe(true);
    expect(document.activeElement).toBe(section);
    expect(section.getAttribute("data-spotlit")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(section.getAttribute("data-spotlit")).toBeNull(); // پالس مُرد — چراغِ دائمی نیست
  });

  it("⑧ مسیرِ دور — سفرِ کامل: فرمان از دیکشنری → پرچم → mountِ پنل → سکونِ ۴۵۰ms → پرشِ واقعی؛ StrictModeپسند (نگاه مصرف نمیکند)", () => {
    useStudy.setState({ srs: PROGRESS_SRS, view: { type: "dictionary" } } as never);
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(srsRow());
    });
    expect(useStudy.getState().view).toEqual({ type: "home" });
    // خانه میآید — پنل mount میشود؛ نگاهِ mount مصرفِ عارضهدار نیست
    render(<SrsPanel />);
    expect(peekSrsSpotlight()).toBe(true); // هنوز معلق — StrictModeِ دوم هم میبیند
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(449);
    });
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled(); // هنوز در سکون
    act(() => {
      vi.advanceTimersByTime(1);
    });
    const section = document.getElementById("srs-dashboard")!;
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(section);
    expect(section.getAttribute("data-spotlit")).toBe("true");
    expect(peekSrsSpotlight()).toBe(false); // اقرار شد — یک‌بارمصرف
  });

  it("⑨ بیپرچم، پنلِ تازهواردِ mountشده نمیپرد — پالس فقط پاسخِ درخواست است", () => {
    useStudy.setState({ srs: PROGRESS_SRS, view: { type: "home" } } as never);
    render(<SrsPanel />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const section = document.getElementById("srs-dashboard")!;
    expect(section.getAttribute("data-spotlit")).toBeNull();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});

describe("قفلهایِ ساختاری — r372 ⑤⑥", () => {
  it("⑩ تکمنبعِ پرش: پرنده فقط صدا میزند — request فقط از پالت، مصرف فقط در پنل؛ لنگر فقط در پنل", () => {
    const palette = readFileSync(
      join(process.cwd(), "src/components/study/shell/command-palette.tsx"),
      "utf8",
    );
    const lib = readFileSync(join(process.cwd(), "src/lib/srs-due.ts"), "utf8");
    const panel = readFileSync(join(process.cwd(), "src/components/study/practice/srs-panel.tsx"), "utf8");
    const bird = readFileSync(join(process.cwd(), "src/components/study/practice/danger-words.tsx"), "utf8");
    // پرچم فقط در کتابخانه ساخته میشود
    expect(lib).toContain("let srsSpotlightAt");
    expect(palette).not.toContain("srsSpotlightAt");
    expect(panel).not.toContain("srsSpotlightAt");
    // لنگرِ id فقط در مالکِ نمایش
    expect(panel).toContain('id="srs-dashboard"');
    expect(palette).not.toContain('id="srs-dashboard"');
    // پرندهٔ r371 از تابعِ کتابخانه میخواند، رشتهٔ رویداد/پرچم را نمیشناسد
    expect(bird).toContain("focusSrsDashboard");
    expect(bird).not.toContain("SRS_PANEL_SPOTLIGHT_EVENT");
    expect(bird).not.toContain("requestSrsSpotlight");
    // فرمانِ پالت پرنده است — تابعِ کتابخانه را صدا میزند نه دستورِ پرشِ دستی
    expect(palette).toContain("requestSrsSpotlight()");
    expect(palette).toContain("focusSrsDashboard()");
    // پنل با خودِ تابعِ کتابخانه مصرف میکند — نمایشِ تکمسیر
    expect(panel).toContain("focusSrsDashboard()");
  });

  it("⑪ آیکونِ معلم در cmdIconKey به School میرسد و School در ICONS هست — رفعِ اشکال قفل شد", () => {
    const palette = readFileSync(
      join(process.cwd(), "src/components/study/shell/command-palette.tsx"),
      "utf8",
    );
    // قراردادِ نگاشت: بعدِ nav-srs-dashboard، Schoolِ معلم و CalendarClockِ مرور
    expect(palette).toContain('case "nav-srs-dashboard":\n      return "CalendarClock";');
    // ICONS با کلیدِ School — ورودیِ واقعی در نقشه (نه فقط importِ مرده)
    // [r373 درسِ ابزاری] فلگِ s به ES2018+ میخواهد (TS1501 رویِ target=ES2017) —
    // و در این الگو بیاثر بود هم: نقطهای در کار نیست، کلاسهایِ نقضشده خودشان
    // newline را میگیرند. حذفِ فلگ = هم سازگاری، هم همان قفلِ قبلی.
    expect(palette).toMatch(/const ICONS[^{]*\{[^}]*\bSchool\b[^}]*\}/);
    expect(palette).toMatch(/const ICONS[^{]*\{[^}]*\bCalendarClock\b[^}]*\}/);
  });
});
