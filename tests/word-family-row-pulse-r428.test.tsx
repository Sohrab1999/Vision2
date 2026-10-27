// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r428 — «لنگرِ سطریِ خانوادهٔ واژه‌ها» — قفلهایِ پالسِ سطر.
//
// پیشنهادِ ②ِ r426 (تکمیلِ عمقِ پرشِ بانکِ words): تا دیروز پرشِ خانهٔ
// امروزِ بانکِ words فقط تا «جدولِ خانواده» میآمد (r224) و یادگیرنده
// خودش باید سطر را در جدول مییافت. r428: الگویِ سطرِ فعلِ r234 / کارتِ
// واژهٔ r427 رویِ سطرهایِ جدولِ خانواده — خودِ واژه با لنگر میرود و
// سطرِ حاویِ آن در دید با پالسِ زمردیِ همخانواده باز میشود. قفلها:
//  · کارت: سطرِ حاویِ واژه پالسِ زمردی میگیرد (bg-emerald-50 +
//    حلقهٔ درونیِ shadow-emerald-300 — همان هستهٔ r234/r427) و
//    شناسهٔ پایدارِ سطر (wf-row-<tid>-<idx>) همان چیزی است که
//    اسکرولِ عمیقِ ضمیمه تکیه میکند
//  · کارت: سطرِ همسایه دستنخورده — پالس فقط یک سطر است
//  · کارت: واژهٔ بیگانه با جدول = سکوتِ صادق — هیچ کلاسِ برساخته
//    (r236)؛ و بیِ prop هیچ
//  · میزبان (ضمیمه): رسیدن با view = {appendix, posTableId, posRowWord}
//    سطرِ هدف را پالس میدهد؛ واژهٔ بیگانه با جدولِ لنگرخورده هیچ
//  · استور: openAppendixPosTable دو-آرگومنتی posRowWord مینویسد؛
//    فراخوانیِ تک-آرگومنتیِ کهنه هر posRowWordِ کهنه را پاک میکند —
//    رفتارِ r224 دستنخورده
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import WordFamilyTableCard from "@/components/study/lesson/word-family-table-card";
import AppendixView from "@/components/study/lesson/appendix-view";
import { useStudy } from "@/lib/study-store";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
// قراردادِ واقعیِ speak همیشه یک تابعِ توقف برمی‌گرداند (حتی در مسیرِ خطا)
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}), speakFailToast: vi.fn() }));

// IntersectionObserver برای فریمرموشنِ میزبانهایِ احتمالی
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

const T0 = WORD_FAMILY_TABLES[0];
const TID0 = wordFamilyTableId(T0);
const NOUN0 = T0.families.find((f) => f.noun)!.noun; // واژهٔ واقعیِ جدولِ نخست
const IDX0 = T0.families.findIndex((f) => f.noun === NOUN0);
const ROW0 = `wf-row-${TID0}-${IDX0}`;
// واژهٔ واقعی از جدولِ دیگر — برایِ گاردِ «بیگانه با جدولِ لنگرخورده»
const OTHER_WORD =
  WORD_FAMILY_TABLES.slice(1)
    .flatMap((t) => t.families)
    .map((f) => f.noun)
    .find((n) => n && !T0.families.some((f) => [f.noun, f.verb, f.adjective, f.adverb].includes(n)))!;

describe("r428 — پالسِ سطرِ خانواده (کارتِ جدول)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });
  afterEach(() => cleanup());

  it("سطرِ حاویِ واژه پالسِ زمردی میگیرد — با شناسهٔ پایدارِ سطر؛ همسایهها دستنخورده", async () => {
    render(<WordFamilyTableCard table={T0} focusRowWord={NOUN0} />);
    await waitFor(
      () => {
        const row = document.getElementById(ROW0);
        expect(row).not.toBeNull();
        expect(row!.className).toContain("bg-emerald-50"); // هستهٔ زمردیِ r234/r427
        expect(row!.className).toContain("shadow-emerald-300"); // حلقهٔ درونیِ روشن
      },
      { timeout: 1200 },
    );
    // فقط یک سطر پالس میزند
    const pulsed = Array.from(document.querySelectorAll("tr")).filter((r) =>
      r.className.includes("bg-emerald-50"),
    );
    expect(pulsed).toHaveLength(1);
    // سطرِ همسایه بدونِ هسته میماند
    const neighborIdx = IDX0 === 0 ? 1 : IDX0 - 1;
    expect(document.getElementById(`wf-row-${TID0}-${neighborIdx}`)?.className).not.toContain(
      "bg-emerald-50",
    );
  }, 20000);

  it("واژهٔ بیگانه با جدول: سکوتِ صادق — هیچ سطری پالس نمیگیرد (r236)", async () => {
    render(<WordFamilyTableCard table={T0} focusRowWord={OTHER_WORD} />);
    await new Promise((r) => setTimeout(r, 300)); // فرصتِ کاملِ effectها
    expect(document.querySelector("tr.bg-emerald-50")).toBeNull();
    // ولی سطرِ واقعیِ واژهٔ بیگانه در جدولِ خودش هست — این کارت بیِ آن واژه است
    expect(document.getElementById(ROW0)).not.toBeNull(); // سطرها شناسهٔ پایدار دارند
  }, 20000);

  it("کرنلِ شبِ سطر اسکوپشده است (globals r428) — ریمپِ سراسریِ .dark .bg-white بر utilityِ شب غلبه میکرد (درسِ r334/r338، زنده witnessed)", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf-8");
    expect(css).toContain(".dark tr.wf-row-pulse");
    // پایهٔ emerald-900/30 = rgb(6,78,59)/0.3 — عینِ کرنلِ r234
    expect(css).toMatch(/\.dark tr\.wf-row-pulse\s*\{[\s\S]*rgba\(6,\s*78,\s*59,\s*0\.3\)/);
    // حلقهٔ درونیِ شب با جوهرِ emerald-700 = rgb(4,120,87)
    expect(css).toMatch(/\.dark tr\.wf-row-pulse\s*\{[\s\S]*inset 0 0 0 2px rgb\(4,\s*120,\s*87\)/);
  });

  it("بیِ prop هیچ — رندرِ خنثی؛ همهٔ سطرها بیِ هسته", async () => {
    render(<WordFamilyTableCard table={T0} />);
    await new Promise((r) => setTimeout(r, 300));
    expect(document.querySelector("tr.bg-emerald-50")).toBeNull();
    // رفتارِ کهنه دستنخورده: سرصفحه و شمارشِ خانوادهها سرِ جایش
    expect(screen.getByText(`اجزای کلماتیِ ${T0.lesson}`)).toBeInTheDocument();
  }, 20000);
});

describe("r428 — میزبانِ ضمیمه: رسیدن با لنگرِ سطری", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });
  afterEach(() => cleanup());

  it("view = {appendix, posTableId, posRowWord}: سطرِ خانواده در دید با پالس باز میشود", async () => {
    useStudy.setState({
      view: { type: "appendix", posTableId: TID0, posRowWord: NOUN0 },
    });
    render(<AppendixView posTableId={TID0} posRowWord={NOUN0} />);
    await waitFor(
      () => {
        const row = document.getElementById(ROW0);
        expect(row).not.toBeNull();
        expect(row!.className).toContain("bg-emerald-50");
      },
      { timeout: 1500 },
    );
  }, 20000);

  it("واژهٔ بیگانه با جدولِ لنگرخورده: هیچ پالسی هیچجا — سکوتِ صادق (r236)", async () => {
    useStudy.setState({
      view: { type: "appendix", posTableId: TID0, posRowWord: OTHER_WORD },
    });
    render(<AppendixView posTableId={TID0} posRowWord={OTHER_WORD} />);
    await new Promise((r) => setTimeout(r, 500));
    expect(document.querySelector("tr.bg-emerald-50")).toBeNull();
    // زیرتبِ pos همان فعال شد (لنگرِ جدول معتبر بود) — فقط عمقِ سطری ساکت ماند
    expect(screen.getByText("خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)")).toBeInTheDocument();
  }, 20000);
});

describe("r428 — قراردادِ استور: openAppendixPosTable با/بیِ عمقِ سطری", () => {
  beforeEach(() => {
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("دو-آرگومنتی: posRowWord در view نوشته میشود", () => {
    useStudy.getState().openAppendixPosTable(TID0, NOUN0);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: TID0,
      posRowWord: NOUN0,
    });
  });

  it("تک-آرگومنتیِ کهنه: هر posRowWordِ کهنهای پاک میشود — رفتارِ r224 دستنخورده", () => {
    useStudy.setState({ view: { type: "appendix", posTableId: TID0, posRowWord: NOUN0 } });
    useStudy.getState().openAppendixPosTable(TID0);
    expect(useStudy.getState().view).toEqual({ type: "appendix", posTableId: TID0 });
  });
});
