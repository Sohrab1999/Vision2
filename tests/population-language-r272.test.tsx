// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۲ — «از N نامزد» به خانوادهٔ دیکشنری می‌رسد: نوارِ دریلِ
// واژه‌های زنده استخرِ خودش را نام می‌برد (ایدئومِ حرف‌به‌حرفِ نوارِ
// درسنامهٔ r271) و سرِ هر دو دیالوگِ دریلِ دیکشنری تحویلِ واقعی را
// («N سؤال از M…») کنارِ وعدهٔ «تا ۸» نوار می‌نشاند؛ و aria/titleِ
// دکمه‌هایِ خروجی هم‌نفسِ توستِ دانلود می‌شوند (بندِ ③ پیشنهادِ r271).
//
// قراردادهایِ تحتِ قفل:
//   · liveWordsCandidates = سیمِ واحدِ r272 (ایدئومِ r265): سازندهٔ سؤال،
//     شمارندهٔ نوار و زیرنویسِ دیالوگ از یک تابع می‌خوانند — ددوپِ
//     بین‌درسی به یک نامزد (درسِ غیر-جمع‌پذیریِ r268 در مقیاسِ دریلِ زنده).
//   · لنگرهایِ پیش‌سنجهٔ r272: استخرِ همه×۰=۱۱۱۳ (۵+=۲۷۷، ۱۰+=۱۳۹،
//     ۲۰+=۴۶)، L1=۱۳۳/۲۴/۵/۱، L10=۴۹۰/۱۹۷/۱۱۹/۴۱؛ جمعِ تک-درس‌ها در
//     ۱۰+=۲۶۳ در برابرِ ددوپِ سراسریِ ۱۳۹ (language×۴، take×۵)؛
//     صفرهایِ واقعیِ L2..L7×۲۰+؛ لنگرِ استخرِ تهی‌شده: L1×۱۰+ = ۵ سؤال
//     از ۵ نامزد (سقفِ ۸ حتی به میله نمی‌رسد).
//   · زیرنویسِ دیالوگ = شمارشِ واقعیِ ساخته‌شده از همان جمعیتِ نوار:
//     جفت‌ها «۸ سؤال از ۴۷۷ ردیفِ جدول»؛ زنده «۸ سؤال از ۱۱۱۳ نامزد».
//   · ariaِ خروجی: دامنهٔ نام‌گذاری‌شده «… واژه · <دامنه>» و پیش‌فرضِ
//     بی‌دامنه همان «واژهٔ این دامنه»ِ کهنه (رگرسیونِ r260)؛ title با
//     «— دامنه: …» گسترش می‌یابد. سیم: lensDomainLabel(lessonFilter,
//     minUsed) — داخلِ لنزِ used برابرِ minUsedActiveِ توست‌هاست و
//     پیمانِ r271 فراخوانِ minUsedActive را دقیقاً دوتا قفل کرده.
//   · متنِ توست‌ها و عنوان‌ها و نوارِ جفت‌ها دست‌نخورده — رشدِ نمایشی،
//     نه شکستنِ قرارداد (پیمان‌هایِ r257/r260/r266/r270/r271 سبز می‌مانند).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import {
  buildLiveWordsQuiz,
  liveWordsCandidates,
  LIVE_DRILL_CAP,
} from "@/lib/live-words-quiz";
import { buildPairsDrillQuiz, SYN_QUIZ_CAP } from "@/lib/syn-ant-quiz";
import { findWordUsages } from "@/lib/word-usage";
import { lensDomainLabel } from "@/lib/lens-csv";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";

const { toastSpy } = vi.hoisted(() => ({ toastSpy: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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
  localStorage.clear();
  toastSpy.mockClear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "reading",
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

const SRC = resolve(process.cwd(), "src");
const lastToast = () => toastSpy.mock.calls[toastSpy.mock.calls.length - 1][0] as {
  title: string;
  description: string;
};

/** آینهٔ مستقلِ سیمِ واحد — همان اشتقاقِ پیش‌سنجه، بیرون از سازنده */
function candidatesMirror(scope: typeof lessons, minCount: number): { en: string; count: number }[] {
  const seen = new Set<string>();
  const out: { en: string; count: number }[] = [];
  for (const l of scope) {
    for (const w of l.vocabulary) {
      const k = w.en.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const count = findWordUsages(w.en).length;
      if (count >= Math.max(1, minCount)) out.push({ en: w.en, count });
    }
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

const L = (id: number) => lessons.find((l) => l.id === id)!;

describe("زبانِ نامزد در دیکشنری — r272", () => {
  it("① سیمِ واحدِ liveWordsCandidates: آینه رویِ ۱۲×۴ + لنگرهایِ پیش‌سنجه + ددوپِ بین‌درسی + مصرفِ سازنده", () => {
    // آینهٔ مستقل رویِ کلِ ماتریسِ دامنه×آستانه
    for (const l of lessons)
      for (const t of [0, 5, 10, 20])
        expect(liveWordsCandidates([l], t).map((c) => c.en)).toEqual(
          candidatesMirror([l], t).map((c) => c.en)
        );
    expect(liveWordsCandidates(lessons, 0).map((c) => c.en)).toEqual(
      candidatesMirror(lessons, 0).map((c) => c.en)
    );
    // لنگرهایِ پیش‌سنجهٔ r272
    expect(liveWordsCandidates(lessons).length).toBe(1113);
    expect(liveWordsCandidates(lessons, 5).length).toBe(277);
    expect(liveWordsCandidates(lessons, 10).length).toBe(139);
    expect(liveWordsCandidates(lessons, 20).length).toBe(46);
    expect(liveWordsCandidates([L(1)]).length).toBe(133);
    expect(liveWordsCandidates([L(1)], 5).length).toBe(24);
    expect(liveWordsCandidates([L(1)], 10).length).toBe(5);
    expect(liveWordsCandidates([L(1)], 20).length).toBe(1);
    expect(liveWordsCandidates([L(10)], 10).length).toBe(119);
    // ددوپِ بین‌درسی — درسِ غیر-جمع‌پذیریِ r268 در مقیاسِ دریلِ زنده
    const sumPerLesson = lessons.reduce((n, l) => n + liveWordsCandidates([l], 10).length, 0);
    expect(sumPerLesson).toBe(263);
    expect(liveWordsCandidates(lessons, 10).length).toBe(139);
    const witness = new Map<string, number>();
    for (const l of lessons)
      for (const c of liveWordsCandidates([l], 10))
        witness.set(c.en.toLowerCase(), (witness.get(c.en.toLowerCase()) ?? 0) + 1);
    expect(witness.get("language")).toBe(4);
    expect(witness.get("take")).toBe(5);
    // سازنده از همین سیم می‌خواند: L1×۱۰+ — استخرِ تهی‌شده، ۵ سؤال از ۵ نامزد
    const l1x10 = buildLiveWordsQuiz([L(1)], LIVE_DRILL_CAP, 10);
    expect(l1x10.length).toBe(5);
    expect(liveWordsCandidates([L(1)], 10).length).toBe(5);
    expect(l1x10.map((q) => q.word)).toEqual(
      liveWordsCandidates([L(1)], 10).map((c) => c.en)
    );
    // سورس‌قرارداد: نوار و دیالوگ از سیمِ واحد می‌خوانند
    const src = readFileSync(resolve(SRC, "components/study/lesson/dictionary-view.tsx"), "utf8");
    expect(src).toContain("liveWordsCandidates(liveScope, minUsedActive)");
    expect(src).toContain('data-testid="live-drill-population"');
    expect(src).toContain('data-testid="drill-dialog-population"');
    expect(src).toContain("از {faNum(livePoolN)} نامزد");
    // و پیمانِ r271: فراخوانِ minUsedActiveِ lensDomainLabel دقیقاً دوتا می‌ماند
    expect(src.split("lensDomainLabel(lessonFilter, minUsedActive)").length - 1).toBe(2);
  });

  it("② نوارِ دریلِ زنده «از N نامزد» می‌گوید — آینه در مسیرِ کامل: ۱۱۱۳ → ۱۳۹ → درس ۱ (۱۳۳) → درس ۱×۱۰+ (۵) → خاموشِ آستانه (۱۳۳)", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const bar = screen.getByTestId("live-drill-bar");
    const pop = within(bar).getByTestId("live-drill-population");
    // پیش‌فرض: استخرِ سراسریِ ددوپ‌شده — لنگرِ پیش‌سنجه
    expect(pop.textContent).toContain(`از ${faNum(1113)} نامزد، تا ${faNum(8)} سؤال، پرکاربردترها اول`);
    // آستانهٔ ۱۰+ — همان سیمِ چیپِ ۵+… نه، چیپ‌هایِ حداقلِ کاربرد r258
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    expect(pop.textContent).toContain(`از ${faNum(139)} نامزد`);
    expect(pop.textContent).toContain(`فقط واژه‌هایِ ${faNum(10)}+ کاربرد`);
    // فیلترِ درس ۱ — تقاطعِ کوچکِ لنگردار
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    expect(pop.textContent).toContain(`از ${faNum(5)} نامزد`);
    expect(liveWordsCandidates([L(1)], 10).length).toBe(5);
    // خاموش‌کردنِ آستانه — استخرِ کاملِ درس ۱ (صفر مالِ تقاطع بود، نه درس)
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    expect(pop.textContent).toContain(`از ${faNum(133)} نامزد`);
    expect(pop.textContent).not.toContain("فقط واژه‌هایِ");
  }, 30000);

  it("③ زیرنویسِ دیالوگ تحویلِ واقعی را می‌گوید: زنده «۸ از ۱۱۱۳»، استخرِ تهی‌شده «۵ از ۵»، جفت‌ها «۸ از ۴۷۷»؛ صفرِ صادقانهٔ L2×۲۰+ توست می‌ماند", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // دریل زنده — همه×۰: ۸ سؤال از ۱۱۱۳ نامزد
    act(() => {
      fireEvent.click(within(screen.getByTestId("live-drill-bar")).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    let dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("drill-dialog-population").textContent).toBe(
      `${faNum(8)} سؤال از ${faNum(1113)} نامزد`
    );
    // بستن با Closeِ radix (درسِ r267 — آنبوردینگ سرِ دیالوگ می‌نشیند)
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    // L1×۱۰+ — استخرِ تهی‌شده: ۵ سؤال از ۵ نامزد (سقفِ ۸ به میله نمی‌رسد)
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۱:/ }));
    });
    act(() => {
      fireEvent.click(within(screen.getByTestId("live-drill-bar")).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("drill-dialog-population").textContent).toBe(
      `${faNum(5)} سؤال از ${faNum(5)} نامزد`
    );
    expect(within(dialog).getByTestId("drill-dialog-population").textContent).not.toContain(faNum(8));
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    // صفرِ صادقانهٔ واقعی — L2×۲۰+ (پیش‌سنجه: ۰ نامزد): نوارِ «از ۰» + توست + بی‌دیالوگ
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-20"));
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /درس ۲:/ }));
    });
    expect(within(screen.getByTestId("live-drill-bar")).getByTestId("live-drill-population").textContent).toContain(
      `از ۰ نامزد`
    );
    act(() => {
      fireEvent.click(within(screen.getByTestId("live-drill-bar")).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    expect(toastSpy).toHaveBeenCalledWith({ title: "سؤالِ قابلِ ساختی از این دامنه نبود" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    cleanup();
    // دریل جفت‌ها — همان زیرنویس با جمعیتِ جدول: «۸ سؤال از ۴۷۷ ردیفِ جدول»
    const pairsAll = buildPairsDrillQuiz(lessons, SYN_QUIZ_CAP);
    expect(pairsAll.length).toBe(8);
    render(<DictionaryView />);
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    act(() => {
      fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
    });
    act(() => {
      fireEvent.click(within(screen.getByTestId("pairs-drill-bar")).getByRole("button", { name: /شروع دریل جفت‌ها/ }));
    });
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByTestId("drill-dialog-population").textContent).toBe(
      `${faNum(8)} سؤال از ${faNum(477)} ردیفِ جدول`
    );
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  }, 30000);

  it("④ aria/titleِ خروجی هم‌نفسِ توست: پیش‌فرضِ بی‌دامنه همان «این دامنه»؛ ۱۰+ و مرکبِ درس ۳ برچسب می‌گیرند — و توست دست‌نخورده", () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // پیش‌فرض — دامنهٔ تهی = همان لهجهٔ کهنهٔ r260 (رگرسیون)
    const csvBtn = screen.getByTestId("dict-export-csv");
    expect(csvBtn).toHaveAttribute("aria-label", `خروجی CSV ${faNum(1915)} واژهٔ این دامنه`);
    expect(csvBtn.getAttribute("title")!).not.toContain("دامنه:");
    expect(screen.getByTestId("dict-export-anki")).toHaveAttribute(
      "aria-label",
      `خروجی Anki ${faNum(1915)} واژهٔ این دامنه`
    );
    // ۱۰+ — aria با برچسبِ دامنه، هم‌نفسِ توستِ r271
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    const csv10 = screen.getByTestId("dict-export-csv");
    expect(csv10).toHaveAttribute(
      "aria-label",
      `خروجی CSV ${faNum(263)} واژه · ${lensDomainLabel(null, 10)}`
    );
    expect(csv10.getAttribute("title")!).toContain(`— دامنه: ${lensDomainLabel(null, 10)}`);
    expect(screen.getByTestId("dict-export-anki")).toHaveAttribute(
      "aria-label",
      `خروجی Anki ${faNum(263)} واژه · واژه‌هایِ ${faNum(10)}+ کاربرد`
    );
    // دامنهٔ مرکبِ کوچک — درسِ ۳ زیرِ ۱۰+: یک واژه با برچسبِ کامل
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /^درس ۳:/ }));
    });
    const csvL3 = screen.getByTestId("dict-export-csv");
    expect(csvL3).toHaveAttribute(
      "aria-label",
      `خروجی CSV ${faNum(1)} واژه · درس ${faNum(3)} · واژه‌هایِ ${faNum(10)}+ کاربرد`
    );
    // و توستِ دانلود دست‌نخورده — همان متنِ دقیقِ پیمانِ r271
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    try {
      toastSpy.mockClear();
      act(() => {
        fireEvent.click(csvL3);
      });
      expect(lastToast().description).toBe(
        `${faNum(1)} ردیف در فایل vision2-used-l3-min10.csv — درس ${faNum(3)} · واژه‌هایِ ${faNum(10)}+ کاربرد — در Excel/Sheets بازش کن.`
      );
    } finally {
      coSpy.mockRestore();
    }
  }, 30000);

  it("⑤ رگرسیونِ خانواده: نوارِ جفت‌ها و توست‌ها و عنوان‌ها بایت‌به‌بایت؛ نوارِ زنده وعدهٔ «تا ۸» را نگه می‌دارد", () => {
    const src = readFileSync(resolve(SRC, "components/study/lesson/dictionary-view.tsx"), "utf8");
    // سورس‌قراردادهایِ پیشین — دست‌نخورده
    expect(src).toContain("pairsPopulation.syn + pairsPopulation.ant");
    expect(src).toContain("ردیفِ جدول");
    expect(src).toContain("دریل واژه‌های زنده — ${suffix}");
    // نوارِ جفت‌ها — همان متنِ پیمانِ r270 (مونتِ واقعی)
    render(<DictionaryView />);
    const row = screen.getByText("وضعیت یادگیری:").parentElement as HTMLElement;
    act(() => {
      fireEvent.click(within(row).getByRole("button", { name: /جفت‌دار/ }));
    });
    const pbar = screen.getByTestId("pairs-drill-bar");
    expect(pbar.textContent).toContain(
      `همهٔ ${faNum(12)} درس — ${faNum(477)} ردیفِ جدول (${faNum(298)} مترادف · ${faNum(179)} متضاد)، تا ${faNum(8)} سؤال`
    );
    // نوارِ زنده — «تا ۸ سؤال، پرکاربردترها اول»ِ r257 کنارِ «از N نامزد»ِ نو
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const lbar = screen.getByTestId("live-drill-bar");
    expect(lbar.textContent).toContain("پرکاربردترها اول");
    expect(lbar.textContent).toContain(`تا ${faNum(LIVE_DRILL_CAP)} سؤال`);
    expect(lbar.textContent).toContain(`از ${faNum(1113)} نامزد`);
    // عنوان‌هایِ پیمانِ r270 — پسوندهایِ suffix سالم
    act(() => {
      fireEvent.click(within(lbar).getByRole("button", { name: /شروع دریل واژه‌های زنده/ }));
    });
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getAllByText(`دریل واژه‌های زنده — همهٔ درس‌ها`).length).toBeGreaterThan(0);
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  }, 30000);
});
