// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۹ — ادامهٔ خانوادهٔ «ادامهٔ مطالعه» + تعمیمِ هارنسِ یکپارچه
//
// بندِ ① پیشنهادِ ۲۴۸: سه مصرف‌کنندهٔ کوچک‌ترِ باقی‌مانده opt-in می‌کنند —
//   تبِ مترادف/متضاد (دریلِ جفت‌هایِ خودِ درس)، مرورِ سریع قبل امتحان
//   (بانکِ خطا)، تمرینِ هدفمندِ واژه‌های خطرناک. جایی که حکمِ کوچکِ خودشان
//   داده می‌شود، راهِ برگشت به ضمیمه هم آن‌جاست (سرشماری: ۵ → ۸).
//
// بندِ ② پیشنهادِ ۲۴۸: نقطهٔ کورِ باقی‌مانده — در r248 زنجیرهٔ واقعی از
//   «اکشنِ مستقیمِ store» آغاز می‌شد؛ اما کاربرِ واقعی از «چیپِ واقعی»
//   شروع می‌کند: ردیفِ AppendixResumeRow → قلابِ useAppendixResumeNav →
//   اکشن → view → AppendixView → effectِ رسیدن. این فایل همان مسیرِ
//   کاربر را برایِ دو لایهٔ شنیدنی (تلفظ r235 / نشانه‌ها r235) می‌راند:
//   کلیکِ ردیفِ واقعی → فرودِ زیرتب → رکورد با «هویتِ مرجع» دست‌نخورده —
//   نه فقط deep-equal؛ صفرِ churn یعنی صفرِ فراخوانیِ write در کلِ مسیر.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import AppendixView from "@/components/study/lesson/appendix-view";
import AppendixResumeRow from "@/components/study/shared/appendix-resume-row";
import {
  readAppendixResume,
  writeAppendixResume,
  type AppendixResumeItem,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { vowelPhonemes, abbreviations } from "@/data/appendix";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}) }));

class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

// هیچ ساختگی — عنوانِ رکورد دقیقاً همان مشتقِ دادهٔ منجمد است که
// recordPhonemeResume/recordAbbrevResumeِ (r235) می‌نویسند.
const phoneme = vowelPhonemes[0];
const abbrev = abbreviations[0];

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
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("resumeDoor family grows to eight (r249 ①): source wiring of the three new opt-ins", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("the lesson's own syn/ant drill opts in (category=synant + standalone prop)", () => {
    const src = read("src/components/study/lesson/syn-ant-tab.tsx");
    expect(src).toContain('category="synant"');
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });

  it("the quick pre-exam review opts in (resultKey=review + standalone prop)", () => {
    const src = read("src/components/study/practice/review-view.tsx");
    expect(src).toContain('resultKeyStr="review"');
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });

  it("the targeted danger-words drill opts in (resultKey=0:danger + standalone prop)", () => {
    const src = read("src/components/study/practice/danger-words.tsx");
    expect(src).toContain('resultKeyStr="0:danger"');
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });
});

describe("the real chip jump meets the hear-layers in the full chain (r249 ②)", () => {
  /** مسیرِ کاملِ کاربر: ردیفِ واقعی → کلیک → قلاب → اکشن → view →
   * AppendixView با همان propsی که study-app می‌گذرد → effectِ رسیدن. */
  function chipJumpAndMount(): void {
    render(<AppendixResumeRow />);
    const row = screen.queryByTestId("results-resume-row");
    expect(row).toBeTruthy(); // رکوردِ seed یعنی ردیف باید حاضر باشد
    fireEvent.click(row!);
    const view = useStudy.getState().view;
    expect(view.type).toBe("appendix");
    if (view.type !== "appendix") return;
    render(
      <AppendixView
        topicId={view.topicId}
        posTableId={view.posTableId}
        verbBase={view.verbBase}
        phonemeId={view.phonemeId}
        abbrevSym={view.abbrevSym}
      />,
    );
  }

  it("phonetics: real row click lands the phoneme card and the record survives by reference identity", async () => {
    const seed: AppendixResumeItem = {
      scope: "phonetics",
      id: phoneme.symbol,
      title: `/${phoneme.symbol}/ ${phoneme.fa.replace(/\s*\/\s*$/, "")}`,
      hint: phoneme.example,
    };
    writeAppendixResume(seed);
    const before = readAppendixResume();
    expect(before).toEqual(seed);

    chipJumpAndMount();

    // «رسیده»: کارتِ واکِ واقعی روی زیرتبِ تلفظ (لنگرِ ph-*)
    await waitFor(() => {
      expect(document.getElementById(`ph-${phoneme.symbol}`)).toBeTruthy();
    });
    // «ننوشته»: هویتِ مرجعِ ثابت — نه مقدارِ تازه، نه حتی snapshotِ نو؛
    // صفرِ فراخوانیِ write در کلِ مسیرِ چیپ (قراردادِ شنیدنیِ r235)
    expect(readAppendixResume()).toBe(before);
  });

  it("abbrev: real row click lands the abbreviation card and the record survives by reference identity", async () => {
    const seed: AppendixResumeItem = {
      scope: "abbrev",
      id: abbrev.sym,
      title: `${abbrev.sym} — ${abbrev.fa}`,
      hint: abbrev.full,
    };
    writeAppendixResume(seed);
    const before = readAppendixResume();
    expect(before).toEqual(seed);

    chipJumpAndMount();

    await waitFor(() => {
      expect(document.getElementById(`ab-${abbrev.sym}`)).toBeTruthy();
    });
    expect(readAppendixResume()).toBe(before);
  });

  it("the row speaks the honest layer label (APPENDIX_SCOPE_LABELS — no hand-made mapping)", () => {
    const seed: AppendixResumeItem = {
      scope: "phonetics",
      id: phoneme.symbol,
      title: `/${phoneme.symbol}/ ${phoneme.fa.replace(/\s*\/\s*$/, "")}`,
      hint: phoneme.example,
    };
    writeAppendixResume(seed);
    render(<AppendixResumeRow />);
    const row = screen.getByTestId("results-resume-row");
    // برچسبِ لایه از خودِ ثابتِ مشترک می‌آید — ردیفِ چیپ همان زبانِ درهایِ دیگر را حرف می‌زند
    expect(row).toHaveAttribute("aria-label", expect.stringContaining("ادامهٔ مطالعه از"));
    expect(row).toHaveAttribute("aria-label", expect.stringContaining("جدول تلفظ"));
  });
});
