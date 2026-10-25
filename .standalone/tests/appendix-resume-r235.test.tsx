// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۵ — دو لایهٔ باقی‌مانده به حلقهٔ «ادامهٔ مطالعه» می‌پیوندند
// (بندِ ① پیشنهادِ ۲۳۴): جدول تلفظ (phonetics) و نشانه‌های اختصاری
// (abbrev) — هر دو فقط با یک نقطهٔ نوشتنِ TTS («شنیدن» کنشِ واقعیِ
// خواندن است، نه دیدن) + لنگرِ عمیقِ کارت با پالسِ زمردی.
//
//   A. لایهٔ واک‌ها:
//     ① روخوانیِ نمونه = رکوردِ phonetics با عنوانِ خودکفایِ منجمد
//     ② write-wins — رکوردِ لایهٔ دیگر بازنویسی می‌شود؛ صفرِ نوشتنِ جانبیِ استور
//     ③ لنگرِ عمیقِ کارت = سطر واقعی + پالسِ زمردی؛ رسیدن ثبت نمی‌کند
//   B. لایهٔ نشانه‌ها:
//     ④ روخوانیِ شکلِ کامل = رکوردِ abbrev
//     ⑤ لنگرِ عمیقِ کارت = کارت واقعی + پالسِ زمردی
//   C. مسیرها:
//     ⑥ کارتِ خانه: رکوردِ phonetics → view {appendix, phonemeId}
//     ⑦ کارتِ خانه: رکوردِ abbrev → view {appendix, abbrevSym}
//     ⑧ نشانگرِ سرِ ضمیمه: کلیکِ رکوردِ phonetics = زیرتبِ + لنگرِ + پالس،
//        صفرِ چرخشِ view (رفت‌وبرگشتِ کاملاً محلی)
//     ⑨ نشانگر: کلیکِ رکوردِ abbrev = زیرتبِ abbrev + کارتِ لنگرشده
//     ⑩ لنگرِ نامعتبر بی‌خطر: ضمیمه روی درسنامهٔ جامع باز می‌شود
//   D. فرمان‌یاب (بندِ ② پیشنهادِ ۲۳۴):
//     ⑪ بی‌رکورد = هیچ فرمانِ «ادامهٔ مطالعه»ای نیست
//     ⑫ با رکورد = اولین فرمانِ ناوبری + dispatch به viewِ همان لایه
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeTools from "@/components/study/home/home-tools";
import AppendixView from "@/components/study/lesson/appendix-view";
import PhoneticsTable from "@/components/study/lesson/phonetics-table";
import AbbreviationsTable from "@/components/study/lesson/abbreviations-table";
import CommandPalette from "@/components/study/shell/command-palette";
import { readAppendixResume, writeAppendixResume } from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { vowelPhonemes, consonantPhonemes, abbreviations } from "@/data/appendix";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** گاردِ سیم‌کشیِ واقعی (r235): study-app باید هر دو لنگرِ نو را به
 * AppendixView بفرستد — رگرسیونِ «کارت می‌فرستد، سرِ ضمیمه نمی‌گیرد»
 * که در QA زندهٔ همین راند پیدا شد (لنگرِ abbrev/phoneme بی‌سیم ماند). */
const studyAppSrc = readFileSync(
  join(process.cwd(), "src/components/study/study-app.tsx"),
  "utf8",
);

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}), speakFailToast: vi.fn() }));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

beforeAll(() => {
  // jsdom scrollIntoView ندارد — افکتِ «گزینهٔ فعال در دید»ِ پالت باید امن باشد
  Element.prototype.scrollIntoView = vi.fn();
  // IntersectionObserver برای whileInView (فریمرموشنِ درسنامه) — هم‌الگوی r234
  class IOStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
    (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
  }
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("the phonetics layer writes its own resume record (r235)", () => {
  it("listening to a phoneme's sample words records it — with zero learning-store side-writes", async () => {
    render(<PhoneticsTable />);
    const p0 = vowelPhonemes[0]; // «/ɑː/» — نخستین واکِ جزوه
    const speakButtons = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speakButtons.length).toBeGreaterThan(10); // ۴۴ نقطهٔ روخوانی
    fireEvent.click(speakButtons[0]); // نمونهٔ نخستین واکِ صدادار
    await waitFor(() => {
      expect(readAppendixResume()).toEqual({
        scope: "phonetics",
        id: p0.symbol,
        title: `/${p0.symbol}/ ${p0.fa.replace(/\s*\/\s*$/, "")}`,
        hint: p0.example,
      });
    });
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("write-wins: hearing a phoneme overwrites a record from another layer", async () => {
    writeAppendixResume({ scope: "pos", id: "t10-v1", title: "دهم · درس اول" });
    render(<PhoneticsTable />);
    const c0 = consonantPhonemes[0];
    const btn = document.getElementById(`ph-${c0.symbol}`)?.querySelector("button");
    expect(btn).not.toBeNull(); // لنگرِ کارت هم‌زمان درست است
    fireEvent.click(btn!);
    await waitFor(() => {
      expect(readAppendixResume()?.scope).toBe("phonetics");
      expect(readAppendixResume()?.id).toBe(c0.symbol);
    });
  });

  it("deep-link focus scrolls to the real card and pulses emerald — arrival records nothing", async () => {
    const p0 = vowelPhonemes[0];
    render(<PhoneticsTable focusSymbol={p0.symbol} />);
    await waitFor(() => {
      expect(document.getElementById(`ph-${p0.symbol}`)?.className).toContain("bg-emerald-50");
    });
    // رسیدن ثبت نمی‌کند — نقطهٔ نوشتنِ این لایه فقط شنیدن است (تصمیمِ ۲۳۴)
    expect(readAppendixResume()).toBeNull();
  });
});

describe("the abbreviations layer writes its own resume record (r235)", () => {
  it("listening to a mark's full form records it — with zero learning-store side-writes", async () => {
    render(<AbbreviationsTable />);
    const a0 = abbreviations[0]; // «n — اسم»
    const speakButtons = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speakButtons.length).toBe(abbreviations.length); // ۱۳ نقطهٔ روخوانی
    fireEvent.click(speakButtons[0]);
    await waitFor(() => {
      expect(readAppendixResume()).toEqual({
        scope: "abbrev",
        id: a0.sym,
        title: `${a0.sym} — ${a0.fa}`,
        hint: a0.full,
      });
    });
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
  });

  it("deep-link focus scrolls to the real card and pulses emerald — arrival records nothing", async () => {
    const a0 = abbreviations[0];
    render(<AbbreviationsTable focusSym={a0.sym} />);
    await waitFor(() => {
      expect(document.getElementById(`ab-${a0.sym}`)?.className).toContain("bg-emerald-50");
    });
    expect(readAppendixResume()).toBeNull();
  });
});

describe("home appendix card routes the two new scopes (r235)", () => {
  it("phonetics record: clicks into openAppendixPhoneme with the real frozen symbol", () => {
    const p0 = vowelPhonemes[0];
    writeAppendixResume({
      scope: "phonetics",
      id: p0.symbol,
      title: `/${p0.symbol}/ ${p0.fa.replace(/\s*\/\s*$/, "")}`,
      hint: p0.example,
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).toContain(`ادامه از «/${p0.symbol}/`);
    expect(card.getAttribute("title")).toContain("در جدول تلفظ");
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      phonemeId: p0.symbol,
    });
  });

  it("abbrev record: clicks into openAppendixAbbrev with the real frozen symbol", () => {
    const a0 = abbreviations[0];
    writeAppendixResume({ scope: "abbrev", id: a0.sym, title: `${a0.sym} — ${a0.fa}`, hint: a0.full });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).toContain(`ادامه از «${a0.sym} — ${a0.fa}»`);
    expect(card.getAttribute("title")).toContain("در نشانه‌های اختصاری");
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      abbrevSym: a0.sym,
    });
  });
});

describe("appendix header resume pill routes the two new scopes locally (r235)", () => {
  it("phonetics record: pill click opens the phonetics sub-tab with the card anchored and pulsing", async () => {
    const p0 = vowelPhonemes[0];
    writeAppendixResume({
      scope: "phonetics",
      id: p0.symbol,
      title: `/${p0.symbol}/ ${p0.fa.replace(/\s*\/\s*$/, "")}`,
      hint: p0.example,
    });
    render(<AppendixView />);
    fireEvent.click(screen.getByTestId("appendix-resume-pill"));
    await waitFor(() => {
      // زیرتبِ phonetics فعال شد + کارتِ هدف لنگرِ واقعی دارد
      expect(screen.getAllByText("جدول تلفظ (IPA)").length).toBeGreaterThanOrEqual(1);
      expect(document.getElementById(`ph-${p0.symbol}`)).not.toBeNull();
    });
    await waitFor(
      () => {
        expect(document.getElementById(`ph-${p0.symbol}`)?.className).toContain("bg-emerald-50");
      },
      { timeout: 1200 },
    );
    // رفت‌وبرگشتِ محلی — view دست نخورد و رکورد همان مانده
    expect(useStudy.getState().view).toEqual({ type: "home" });
    expect(readAppendixResume()?.id).toBe(p0.symbol);
  }, 20000);

  it("abbrev record: pill click opens the abbrev sub-tab with the card anchored", async () => {
    const a0 = abbreviations[0];
    writeAppendixResume({ scope: "abbrev", id: a0.sym, title: `${a0.sym} — ${a0.fa}`, hint: a0.full });
    render(<AppendixView />);
    fireEvent.click(screen.getByTestId("appendix-resume-pill"));
    await waitFor(() => {
      expect(screen.getAllByText("نشانه‌های اختصاری").length).toBeGreaterThanOrEqual(2); // زیرتاب + سرصفحه
      expect(document.getElementById(`ab-${a0.sym}`)).not.toBeNull();
    });
    expect(useStudy.getState().view).toEqual({ type: "home" });
  }, 20000);

  it("invalid deep-link ids degrade safely to the plain grammar appendix", async () => {
    render(<AppendixView phonemeId="/zzz/" abbrevSym="zzz" />);
    // درسنامهٔ جامع — زیرتبِ پیش‌فرض؛ هیچ کارتِ واک/نشانه‌ای لنگر نخورد
    await waitFor(() => {
      expect(screen.getByText("ضمیمهٔ کتاب")).toBeInTheDocument();
    });
    expect(document.getElementById("ph-/zzz/")).toBeNull();
    expect(document.getElementById("ab-zzz")).toBeNull();
  }, 20000);
});

describe("study-app wiring of the two new anchors (r235)", () => {
  it("AppendixView receives phonemeId and abbrevSym from the view — the r235 live-QA regression", () => {
    expect(studyAppSrc).toContain("phonemeId={view.phonemeId}");
    expect(studyAppSrc).toContain("abbrevSym={view.abbrevSym}");
    // لنگرهایِ قدیمی هم سرِ جایشان بمانند
    expect(studyAppSrc).toContain("topicId={view.topicId}");
    expect(studyAppSrc).toContain("posTableId={view.posTableId}");
    expect(studyAppSrc).toContain("verbBase={view.verbBase}");
  });
});

describe("command palette «ادامهٔ مطالعه» (r235)", () => {
  const openPalette = () => {
    // fireEvent = پوشش act() — هم‌الگوی تستِ پالتِ Task 79
    fireEvent(window, new CustomEvent("open-command-palette"));
  };

  it("without a record: no resume command exists at all", () => {
    render(<CommandPalette />);
    openPalette();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    const opts = screen.getAllByRole("option");
    // نقطهٔ شروعِ پایه = ۳۱ فرمانِ کهنه + ۴ درِ حلقه (r246: درِ ششم پیوست) — فرمانِ «ادامهٔ مطالعه» در ناوبری نیست
    expect(opts.length).toBe(37); // r290: + nav-library · r352: + nav-teacher
    // فرمانِ «ادامهٔ مطالعه» (nav-resume) فقط با رکورد می‌آید — گروهِ ناوبریِ بی‌رکورد
    // هیچ ردیفِ «ادامهٔ مطالعه»ای ندارد (hintِ درِ ضمیمهٔ r244 چنین واژه‌ای دارد؛
    // مقصودِ گارد، فرمانِ ناوبری است نه هر رشته‌ای که ورداشت)
    const navGroup = screen
      .getAllByRole("group")
      .find((g) => g.getAttribute("aria-label") === "ناوبری");
    expect(navGroup!.textContent).not.toContain("ادامهٔ مطالعه");
  });

  it("with a phonetics record: the command exists, sits first in ناوبری and dispatches the deep-link view", () => {
    const p0 = vowelPhonemes[0];
    writeAppendixResume({
      scope: "phonetics",
      id: p0.symbol,
      title: `/${p0.symbol}/ ${p0.fa.replace(/\s*\/\s*$/, "")}`,
      hint: p0.example,
    });
    render(<CommandPalette />);
    openPalette();
    // ۳۱ فرمانِ پایه + ۵ درِ حلقه (r246: درِ ششم پیوست) + فرمانِ «ادامهٔ مطالعه»
    const opts = screen.getAllByRole("option");
    expect(opts.length).toBe(39); // r290: + nav-library · r352: + nav-teacher
    const cmd = opts.find((o) => o.textContent?.includes("ادامهٔ مطالعه"));
    expect(cmd).toBeDefined();
    expect(cmd!.textContent).toContain(`از «/${p0.symbol}/`);
    expect(cmd!.textContent).toContain("جدول تلفظ");
    // اولین گزینهٔ ناوبری است (ورودِ سریعِ کیبوردی — بندِ ②)
    const groups = screen.getAllByRole("group");
    expect(groups[0]?.getAttribute("aria-label")).toBe("ناوبری");
    expect(groups[0]?.querySelector('[role="option"]')).toBe(cmd);
    fireEvent.click(cmd!);
    // dispatch از snapshotِ لحظهٔ اجرا — viewِ همان لایه
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      phonemeId: p0.symbol,
    });
  });
});
