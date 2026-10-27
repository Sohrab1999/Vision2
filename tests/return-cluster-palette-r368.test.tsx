// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۶۸ — بندِ ④ پیشنهادِ r367: «درهای خانه» در فرمان‌یاب —
// چهارمین مصرفِ «فهرستِ زنده»: گروهِ نو از همان
// RETURN_CLUSTER_DOORS (تک‌منبعِ r367) تغذیه میشود؛ درِ نو = یک
// سطرِ داده، نه یک فرمانِ دستی. قراردادها:
//   ① قراردادِ داده: palette.label = عنوانِ کارت؛ درِ ضمیمه null —
//     فرمانش از قبل هست (nav-resume r235 + درِ خانه r244)؛ دو گویش
//     نباید دو فرمان شوند.
//   ② ترتیبِ گروه: «درهای خانه» درست بعد از «درهای حلقه»؛ یکتا.
//   ③ حضورِ صادقانه: تازهوارد هیچ فرمانی ندارد — شمارشِ کلِ گزینهها
//     همان ۳۷ میماند؛ گروهِ بی‌عضو اصلاً رندر نمیشود.
//   ④ با داده: هر چهار فرمان با برچسبِ خودِ داده + hint = متنِ در.
//   ⑤ گیتِ در-جهانی: رویِ خودِ دنیا، درِ همان دنیا مستور است —
//     «ادامهٔ کنکور» وسطِ جلسه یعنی remount و سوختنِ جلسه؛ غیبتِ
//     صادقانه هم‌زمان محافظِ جلسه است. درس فقط رویِ نقطهٔ دقیقِ
//     رزومه مستور است.
//   ⑥ اجرا: پرشِ همان‌جایی که کارت میپرد؛ رکوردِ درس در لحظهٔ اجرا
//     دوباره خوانده میشود (صداقتِ nav-resume: پاکشده در فاصلهٔ
//     باز-تا-اجرا = هیچ)؛ lesson_open با همان معنایِ کارتِ r361؛
//     konkur_start/duel_start هرگز (قراردادِ r364 — رویدادِ جلسهٔ
//     واقعی، نه بازکردنِ نما)؛ رجیستریِ ۵۲ میماند.
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import CommandPalette from "@/components/study/shell/command-palette";
import { COMMAND_GROUPS } from "@/lib/command-palette";
import { RETURN_CLUSTER_DOORS, RETURN_CMD_PREFIX, returnCmdId } from "@/lib/return-cluster-doors";
import { LESSON_RESUME_KEY } from "@/lib/lesson-resume";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const openPalette = () => {
  fireEvent(window, new CustomEvent("open-command-palette"));
};

const seedLessonResume = (lesson: number, tab: string) => {
  window.localStorage.setItem(
    LESSON_RESUME_KEY,
    JSON.stringify({ lesson, tab, at: new Date().toISOString() }),
  );
};

const homeGroup = () => screen.getByRole("group", { name: "درهای خانه" });
const rowOf = (label: string): HTMLElement => {
  const rows = [...homeGroup().querySelectorAll('[role="option"]')] as HTMLElement[];
  const hit = rows.find((r) => (r.textContent ?? "").includes(label));
  expect(hit, `row ${label}`).toBeDefined();
  return hit!;
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
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.mocked(trackEvent).mockClear();
  useStudy.setState({
    view: { type: "dictionary" } as never, // نقطهٔ شروع غیرِمقصد — پرشِ واقعی اثبات شود
    lessonTab: "vocab",
    konkurSeen: {},
    duelHistory: [],
    libraryDone: {},
  } as never);
  cleanup();
});

describe("قراردادِ داده — گروهِ «درهای خانه» از تک‌منبع — r368 ④", () => {
  it("① شناسهٔ فرمان خودکفا («return-<id>») + قراردادِ palette: چهار label، ضمیمه null", () => {
    for (const d of RETURN_CLUSTER_DOORS) {
      expect(returnCmdId(d.id)).toBe(`${RETURN_CMD_PREFIX}${d.id}`);
    }
    const appendix = RETURN_CLUSTER_DOORS.find((d) => d.id === "appendix")!;
    expect(appendix.palette).toBeNull();
    const spoken = RETURN_CLUSTER_DOORS.filter((d) => d.palette);
    expect(spoken.map((d) => d.id)).toEqual(["lesson", "reading", "konkur", "duel"]);
    expect(spoken.map((d) => d.palette!.label)).toEqual([
      "ادامهٔ مطالعهٔ درس",
      "ادامهٔ خواندن داستان‌ها",
      "ادامهٔ کنکور",
      "بازگشت به میدان",
    ]);
  });

  it("② گروهِ «درهای خانه» در COMMAND_GROUPS درست بعد از «درهای حلقه» و یکتاست", () => {
    expect(COMMAND_GROUPS).toContain("درهای خانه");
    expect(new Set(COMMAND_GROUPS).size).toBe(COMMAND_GROUPS.length);
    expect(COMMAND_GROUPS.indexOf("درهای خانه")).toBe(
      COMMAND_GROUPS.indexOf("درهای حلقه") + 1,
    );
    // قراردادهایِ کهنه پابرجا
    expect(COMMAND_GROUPS[0]).toBe("ناوبری");
    expect(COMMAND_GROUPS.indexOf("درهای حلقه")).toBe(
      COMMAND_GROUPS.indexOf("ادامه‌های اخیر") + 1,
    );
  });

  it("③ تازهوارد: هیچ گروهی نیست — غیبتِ صادقانه، شمارشِ کلِ گزینهها دستنخورده", () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.queryByRole("group", { name: "درهای خانه" })).not.toBeInTheDocument();
    // هیچ فرمانِ ساختگیِ بی‌مقصد — همان ۳۷ گزینهٔ جهانِ بی‌داده (r244/r290/r352)
    expect(screen.getAllByRole("option").length).toBe(37);
  });

  it("④ با داده: چهار فرمان با برچسبِ خودِ داده + hint = متنِ در؛ فرمانِ دومیِ ضمیمه ممنوع", () => {
    seedLessonResume(2, "tests");
    useStudy.setState({
      konkurSeen: { q1: true, q2: true },
      duelHistory: [{ opponent: "سارا", outcome: "loss", at: Date.now() }] as never,
      libraryDone: { "s1-1": true },
    } as never);
    render(<CommandPalette />);
    openPalette();
    const group = homeGroup();
    const rows = group.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(4);
    for (const d of RETURN_CLUSTER_DOORS.filter((x) => x.palette)) {
      expect(group.textContent).toContain(d.palette!.label);
      expect(group.textContent).toContain(d.text); // hint = متنِ در از داده
    }
    // درِ مشترکِ ضمیمه فرمانِ دومی ندارد — nav-resume و درِ خانه مالکشاند
    expect(group.textContent).not.toContain("ادامه از");
  });

  it("⑤ گیتِ در-جهانی: رویِ خودِ کنکور، «ادامهٔ کنکور» مستور است — بقیه حاضرند", () => {
    useStudy.setState({
      view: { type: "konkur" } as never,
      konkurSeen: { q1: true },
      duelHistory: [{ opponent: "سارا", outcome: "tie", at: Date.now() }] as never,
      libraryDone: { "s1-1": true },
      // رکوردِ درس هم هست
    } as never);
    seedLessonResume(2, "tests");
    render(<CommandPalette />);
    openPalette();
    const rows = homeGroup().querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(3);
    expect(homeGroup().textContent).not.toContain("ادامهٔ کنکور");
    expect(homeGroup().textContent).toContain("ادامهٔ مطالعهٔ درس");
  });

  it("⑥ گیتِ درس فقط رویِ نقطهٔ دقیقِ رزومه است — از تبِ دیگرِ همان درس حاضر", () => {
    // بقیهٔ درها هم داده داشته باشند تا گروه اصلاً رندر شود — این آزمون
    // فقط رفتارِ گیتِ درس را میسنجد
    useStudy.setState({
      konkurSeen: { q1: true },
      duelHistory: [{ opponent: "سارا", outcome: "tie", at: Date.now() }] as never,
      libraryDone: { "s1-1": true },
    } as never);
    seedLessonResume(2, "tests");
    useStudy.setState({ view: { type: "lesson", id: 2 } as never, lessonTab: "tests" } as never);
    render(<CommandPalette />);
    openPalette();
    expect(homeGroup().textContent).not.toContain("ادامهٔ مطالعهٔ درس");
    expect(homeGroup().textContent).toContain("ادامهٔ کنکور"); // بقیهٔ درها سالم
    cleanup();
    // همان درس، تبِ دیگر — پرش به نقطهٔ رزومه همچنان معنادار
    useStudy.setState({ view: { type: "lesson", id: 2 } as never, lessonTab: "vocab" } as never);
    render(<CommandPalette />);
    openPalette();
    expect(homeGroup().textContent).toContain("ادامهٔ مطالعهٔ درس");
  });
});

describe("اجرا — پرشِ همان‌جایی که کارت میپرد — r368 ④", () => {
  beforeEach(() => {
    seedLessonResume(3, "grammar");
    useStudy.setState({
      konkurSeen: { q1: true },
      duelHistory: [{ opponent: "سارا", outcome: "win", at: Date.now() }] as never,
      libraryDone: { "s1-1": true },
    } as never);
  });

  it("⑦ «ادامهٔ کنکور» به خودِ کنکور میپرد — بدونِ konkur_start (رویدادِ جلسهٔ واقعی)", () => {
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(rowOf("ادامهٔ کنکور"));
    });
    expect(useStudy.getState().view).toEqual({ type: "konkur" });
    expect(trackEvent).not.toHaveBeenCalledWith("konkur_start");
    expect(trackEvent).not.toHaveBeenCalledWith("duel_start");
  });

  it("⑧ «ادامهٔ مطالعهٔ درس» به نقطهٔ رزومه میپرد + lesson_open با همان معنایِ کارت", () => {
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(rowOf("ادامهٔ مطالعهٔ درس"));
    });
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 3 });
    expect(useStudy.getState().lessonTab).toBe("grammar");
    expect(trackEvent).toHaveBeenCalledWith("lesson_open");
  });

  it("⑨ صداقتِ nav-resume: رکورد در فاصلهٔ باز-تا-اجرا پاک شود = هیچ جابه‌جایی", () => {
    render(<CommandPalette />);
    openPalette();
    const row = rowOf("ادامهٔ مطالعهٔ درس");
    window.localStorage.removeItem(LESSON_RESUME_KEY); // مستقیم — بدونِ emit
    act(() => {
      fireEvent.click(row);
    });
    expect(useStudy.getState().view).toEqual({ type: "dictionary" }); // دست‌نخورده
  });

  it("⑩ «ادامهٔ خواندن» و «بازگشت به میدان» — کتابخانه و داورِ نبرد، بی‌رویدادِ فردی", () => {
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(rowOf("ادامهٔ خواندن داستان‌ها"));
    });
    expect(useStudy.getState().view).toEqual({ type: "library" });
    // رندرِ تازه برایِ پرشِ دوم — بستنِ رادیکس بعد از اجرا صحنه را خالی میکند
    cleanup();
    useStudy.setState({ view: { type: "dictionary" } } as never);
    render(<CommandPalette />);
    openPalette();
    act(() => {
      fireEvent.click(rowOf("بازگشت به میدان"));
    });
    expect(useStudy.getState().view).toEqual({ type: "duel" });
    expect(trackEvent).not.toHaveBeenCalledWith("duel_start");
  });
});

describe("قفلهایِ ساختاری — r368 ④", () => {
  it("⑪ رجیستریِ رویدادها ۵۲ میماند + پالت از تک‌منبع تغذیه میشود نه فهرستِ دستی", () => {
    expect(EVENT_NAMES.length).toBe(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306)؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    const src = readFileSync(join(process.cwd(), "src/components/study/shell/command-palette.tsx"), "utf8");
    expect(src).toContain("RETURN_CLUSTER_DOORS.filter");
    expect(src).toContain('group: "درهای خانه"');
    // هیچ برچسبِ دستیِ دومی — برچسب از d.palette!.label میآید
    expect(src).toContain("d.palette!.label");
  });
});
