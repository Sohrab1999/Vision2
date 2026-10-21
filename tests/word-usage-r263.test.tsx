// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۳ — بندهای ①+③ پیشنهادِ ۲۶۲: پیوندِ دوسویه و تفکیکِ نوع
//
//   ① چیپ‌هایِ درسِ نوارِ پراکندگی کلیک‌پذیر می‌شوند — الگویِ host-decides:
//      با هندلر (فقط دیکشنری) دکمهٔ واقعی با نامِ صریح؛ بی‌هندلر spanِ
//      اطلاعاتیِ r262. کلیک = همان مسیرِ کلیکِ سطرِ مقایسهٔ r258 (فیلترِ
//      درس + لنزِ آسمانی) + بستنِ دیالوگ.
//   ③ چیپ‌هایِ تفکیکِ نوع (مکالمه/ریدینگ) در انتهایِ همان نوار — فقط وقتی
//      هر دو نوع موجودند (صداقتِ r252؛ ایدئومِ آسمانیِ خانواده).
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r263 (scripts/precount-r263.ts):
//   change: ۱۳ کاربرد · ۶ درس (۵=۵ · ۶=۳ · ۹=۲ · ۲=۱ · ۷=۱ · ۱۱=۱) ·
//   انواع: ریدینگ=۱۱ · مکالمه=۲ (هر دو)
//   communication: ۳ کاربرد · ۲ درس · تک-نوع (ریدینگ=۳) → چیپِ نوع ندارد
//   ability: ۱ کاربرد · ۱ درس → بدونِ نوار
//   لنزِ آسمانیِ درس‌ها: درسِ ۶ = ۹۵ · درسِ ۵ = ۱۱۹ · درسِ ۱ = ۱۳۳
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ ترمینالِ r263 — رانشِ داده را همان‌جا می‌گیرد
const CHANGE_SITES = findWordUsages("change");
expect(CHANGE_SITES.length).toBe(13);
expect(CHANGE_SITES.filter((s) => s.kind === "reading").length).toBe(11);
expect(CHANGE_SITES.filter((s) => s.kind === "conversation").length).toBe(2);
expect(findWordUsages("communication").every((s) => s.kind === "reading")).toBe(true);
expect(findWordUsages("communication").length).toBe(3);
const L6 = 95; // usedWordsِ درسِ ۶ — شمارِ نتیجهٔ لنزِ آسمانیِ همان درس

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    wordMistakes: {},
    wordSeen: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
});

// ------------------------------------------------------------------
describe("الگویِ host-decides برایِ چیپ‌هایِ درس (r263 ①)", () => {
  it("بی-هندلر: چیپ‌ها spanِ اطلاعاتیِ r262 می‌مانند — هیچ دکمه‌ای با نامِ «رفتن به واژه‌های»", () => {
    render(<WordUsageDialog target={{ en: "change", sites: CHANGE_SITES }} onClose={vi.fn()} />);
    for (const id of [5, 6, 9, 2, 7, 11]) {
      expect(screen.getByTestId(`usage-lesson-chip-${id}`).tagName).toBe("SPAN");
    }
    expect(screen.queryByRole("button", { name: /رفتن به واژه‌هایِ درسِ/ })).toBeNull();
  });

  it("با هندلر: دکمهٔ واقعی با نامِ صریحِ تمیز + tooltipِ مسیر + صدرنشینِ پرِ مركب — کلیک هندلر را با همان درس صدا می‌زند", () => {
    const onOpenLesson = vi.fn();
    render(
      <WordUsageDialog target={{ en: "change", sites: CHANGE_SITES }} onClose={vi.fn()} onOpenLesson={onOpenLesson} />
    );
    const chips = [5, 6, 9, 2, 7, 11].map((id) => screen.getByTestId(`usage-lesson-chip-${id}`));
    chips.forEach((c, i) => {
      expect(c.tagName).toBe("BUTTON");
      const lbl = c.getAttribute("aria-label") ?? "";
      expect(lbl).toContain(`رفتن به واژه‌هایِ درسِ`);
      expect(lbl).toContain("کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن");
      // فضای نامِ a11یِ r253 — نامِ دکمه هرگز «کاربرددار» یا «جزوه»ی برهنه
      expect(lbl).not.toContain("کاربرددار");
      expect(lbl).not.toMatch(/جزوه/);
      expect(c.getAttribute("title")).toContain("کلیک: واژه‌هایِ در-متنِ درسِ");
      fireEvent.click(c);
      expect(onOpenLesson).toHaveBeenNthCalledWith(i + 1, Number(c.getAttribute("data-testid")!.replace("usage-lesson-chip-", "")));
    });
    expect(onOpenLesson).toHaveBeenCalledTimes(6);
    // صدرنشینِ پر حالا tooltipِ مرکب دارد
    const lead = screen.getByTestId("usage-lesson-chip-5");
    expect(lead.className).toContain("bg-violet-600");
    expect(lead.getAttribute("title")).toContain(`بیشترینِ کاربردهایِ این واژه در درسِ ${faNum(5)}`);
  });
});

// ------------------------------------------------------------------
describe("پیوندِ دوسویه در دیکشنری — کلیکِ چیپ → فیلترِ درس + لنزِ آسمانی (r263 ①)", () => {
  it("دیکشنری هندلر می‌دهد: دیالوگِ change → کلیکِ چیپِ درسِ ۶ → دیالوگ بسته، جستجو پاک، «۹۵ واژه یافت شد» (لنگرِ پیش‌شمارش)", () => {
    render(<DictionaryView />);
    const input = screen.getByPlaceholderText("مثلاً: language یا زبان...");
    act(() => {
      fireEvent.change(input, { target: { value: "change" } });
    });
    // چیپِ کاربردِ کارتِ change — همان testidِ الگویِ r252
    const chip = screen.getAllByTestId("usage-chip-change")[0];
    expect(chip).toBeTruthy();
    act(() => {
      fireEvent.click(chip);
    });
    // دیالوگِ باز — چیپ‌هایِ درس حالا دکمه‌اند (دیکشنری هندلر می‌دهد)
    expect(screen.getByTestId("usage-lessons-bar")).toBeInTheDocument();
    expect(screen.getByTestId("usage-lesson-chip-6").tagName).toBe("BUTTON");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-lesson-chip-6"));
    });
    // دیالوگ بسته و نتیجهٔ همان مسیرِ r258: فیلترِ درسِ ۶ + لنزِ آسمانی = ۹۵
    expect(screen.queryByTestId("usage-dialog")).toBeNull();
    expect(screen.getByText(`${faNum(L6)} واژه یافت شد`)).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("چیپ‌هایِ تفکیکِ نوع (r263 ③)", () => {
  const renderDialog = (en: string, withHandler = false) =>
    render(
      <WordUsageDialog
        target={{ en, sites: findWordUsages(en) }}
        onClose={vi.fn()}
        {...(withHandler ? { onOpenLesson: vi.fn() } : {})}
      />
    );

  it("change (دو نوع): مکالمهٔ ۲ سپس ریدینگِ ۱۱ — ایدئومِ آسمانی، دکمهٔ دوسطحیِ بی-فشارِ آغازین (تحولِ r264)، جداکنندهٔ در میان", () => {
    renderDialog("change");
    const conv = screen.getByTestId("usage-kind-chip-conversation");
    const read = screen.getByTestId("usage-kind-chip-reading");
    expect(conv.textContent).toContain(`مکالمه ${faNum(2)}`);
    expect(read.textContent).toContain(`ریدینگ ${faNum(11)}`);
    for (const c of [conv, read]) {
      // r264 ①: چیپِ نوع دکمهٔ toggle شد (بندِ ① پیشنهادِ ۲۶۳) — آغازین
      // بی-فشار با ایدئومِ آسمانیِ خانواده؛ حالتِ فعال در r264 قفل می‌شود.
      expect(c.tagName).toBe("BUTTON");
      expect(c.getAttribute("aria-pressed")).toBe("false");
      expect(c.className).toContain("border-sky-200");
      expect(c.className).toContain("bg-sky-50");
      expect(c.className).toContain("text-sky-700");
    }
    // ترتیبِ ثابت: مکالمه پیش از ریدینگ در DOM
    expect(conv.compareDocumentPosition(read) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // جداکنندهٔ عمودیِ aria-hidden بینِ درس‌ها و انواع
    const bar = screen.getByTestId("usage-lessons-bar");
    expect(bar.querySelector('[aria-hidden="true"].bg-stone-300')).not.toBeNull();
  });

  it("communication: نوارِ درس هست ولی چیپِ نوع نیست (تک-نوع — صداقتِ r252)", () => {
    renderDialog("communication");
    expect(screen.getByTestId("usage-lessons-bar")).toBeInTheDocument();
    expect(screen.queryByTestId("usage-kind-chip-reading")).toBeNull();
    expect(screen.queryByTestId("usage-kind-chip-conversation")).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("قراردادهایِ سطحِ منبع (r263 ④)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("onOpenLesson اختیاری در دیالوگِ مشترک — شاخهٔ دکمه/spanِ صریح + قراردادِ aria", () => {
    const dlg = read("src/components/study/lesson/word-usage-dialog.tsx");
    expect(dlg).toContain("onOpenLesson?: (lessonId: number) => void;");
    expect(dlg).toContain("if (onOpenLesson)");
    expect(dlg).toContain("رفتن به واژه‌هایِ درسِ");
    expect(dlg).toContain("کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن");
    expect(dlg).toContain("kindsBoth");
    expect(dlg).toContain('data-testid={`usage-kind-chip-${k.kind}`}');
  });

  it("فقط دیکشنری هندلر می‌دهد (فیلترِ درس + لنزِ آسمانی + بستنِ دیالوگ) — پنج مصرف‌کنندهٔ دیگر بی-هندلر می‌مانند", () => {
    const dict = read("src/components/study/lesson/dictionary-view.tsx");
    expect(dict).toContain('onOpenLesson={(lessonId) => {');
    expect(dict).toContain('setStateFilter("usage")');
    expect(dict).toContain('setQuery("")');
    expect(dict).toContain("setUsage(null)");
    for (const f of [
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/flashcards.tsx",
      "src/components/study/lesson/word-of-day.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/practice/danger-words.tsx",
    ]) {
      // wft-card propِ هم‌نامِ خودش را از r255 دارد (بی-آرگومان، برایِ سلول‌های
      // جدول) — قفلِ ما بر «پاس‌دادنِ هندلرِ آرگومان‌دار به دیالوگ» است.
      expect(read(f)).not.toContain("onOpenLesson={(lessonId)");
    }
  });
});
