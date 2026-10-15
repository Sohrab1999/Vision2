// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۴ — گاردهای «ادامهٔ مطالعه»ی تعمیم‌یافته روی همهٔ لایه‌های ضمیمه:
//   A. رکوردِ تعمیم‌یافته (bg-reading):
//     ① رفت‌وبرگشتِ سه scope + هویتِ پایدارِ snapshot (قراردادِ useSyncExternalStore)
//     ② خواندنِ دفاعی — خراب/ناقص/scopeِ ناشناخته = null؛ hintِ خراب دور ریخته
//     ③ whitelistِ نوشتن — scopeِ سیم‌کشی‌نشده اصلاً نوشته نمی‌شود
//     ④ write-wins — نوشتنِ هر لایه «آخرینِ دیده‌شده» را عوض می‌کند
//     ⑤ مهاجرتِ ۲۳۳ — کلیدِ نو غایب = رکوردِ قدیمی با scopeِ grammar؛
//        کلیدِ نو موجود-but-خراب = null (احیای legacy ممنوع)
//     ⑥ آینهٔ writeBgLastTopic — کلیدِ قدیمی سالم + کلیدِ نو با hint=page
//   B. کارتِ خانه با رکوردِ verbs/pos — مسیرِ viewِ همان لایه
//   C. نشانگرِ سرِ ضمیمه:
//     ⑨ بی‌رکورد = هیچ دکمه‌ای
//     ⑩ pos: کلیک = زیرتبِ pos + صفرِ چرخشِ view (رفت‌وبرگشتِ محلی)
//     ⑪ verbs: کلیک = زیرتبِ verbs + سطرِ فعل با لنگر و پالسِ زمردی
//     ⑫ grammar: کلیک = موضوعِ mergeشده باز (aria-expanded)
//   D. نوشتن از خودِ لایهٔ verbs:
//     ⑬ روخوانیِ فعل = رکورد + صفرِ نوشتنِ جانبیِ استور
//     ⑭ لنگرِ عمیقِ verbs = رکورد («رسیدن هم دیدن است»)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeTools from "@/components/study/home/home-tools";
import AppendixView from "@/components/study/lesson/appendix-view";
import IrregularVerbsTable from "@/components/study/lesson/irregular-verbs-table";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  writeAppendixResume,
  readAppendixResume,
  writeBgLastTopic,
  readBgLastTopic,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";
import { irregularVerbs } from "@/data/appendix";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
// قراردادِ واقعیِ speak همیشه یک تابعِ توقف برمی‌گرداند (حتی در مسیرِ خطا) —
// mock باید همان وفاداری را داشته باشد وگرنه unmountِ حینِ پخش می‌شکند.
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}) }));

// IntersectionObserver برای whileInView (فریمرموشنِ درسنامه)
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

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

describe("generalized appendix resume record (r234)", () => {
  it("round-trips all three wired scopes and keeps a stable snapshot identity", () => {
    expect(readAppendixResume()).toBeNull(); // بازدیدِ اول: هیچ رکوردی
    writeAppendixResume({ scope: "verbs", id: "be", title: "be · was / were · been", hint: "بودن" });
    expect(readAppendixResume()).toEqual({
      scope: "verbs",
      id: "be",
      title: "be · was / were · been",
      hint: "بودن",
    });
    writeAppendixResume({ scope: "pos", id: "t10-v1", title: "دهم · درس اول" });
    expect(readAppendixResume()).toEqual({ scope: "pos", id: "t10-v1", title: "دهم · درس اول" });
    writeAppendixResume({ scope: "grammar", id: "bg-subject-pronouns", title: "ضمایر فاعلی", hint: "صفحهٔ ۲۲" });
    expect(readAppendixResume()).toEqual({
      scope: "grammar",
      id: "bg-subject-pronouns",
      title: "ضمایر فاعلی",
      hint: "صفحهٔ ۲۲",
    });
    // snapshotِ پایدار — هویتِ واحد بینِ فراخوانی‌هایِ پیاپی (قراردادِ useSyncExternalStore)
    expect(readAppendixResume()).toBe(readAppendixResume());
  });

  it("defensive reads: malformed, partial, array and unknown-scope shapes are all null", () => {
    localStorage.setItem("vision2-bg-last-item", "{not json");
    expect(readAppendixResume()).toBeNull();
    localStorage.setItem("vision2-bg-last-item", JSON.stringify({ scope: "verbs", id: "be" })); // بی‌عنوان
    expect(readAppendixResume()).toBeNull();
    localStorage.setItem("vision2-bg-last-item", JSON.stringify({ scope: "grammar", title: "t" })); // بی‌شناسه
    expect(readAppendixResume()).toBeNull();
    localStorage.setItem("vision2-bg-last-item", JSON.stringify({ scope: 7, id: "x", title: "t" })); // scopeِ غیررشته‌ای
    expect(readAppendixResume()).toBeNull();
    localStorage.setItem("vision2-bg-last-item", JSON.stringify(["verbs"])); // آرایه
    expect(readAppendixResume()).toBeNull();
    localStorage.setItem(
      "vision2-bg-last-item",
      JSON.stringify({ scope: "phonetics", id: "x", title: "t" }), // scopeِ سیم‌کشی‌نشده
    );
    expect(readAppendixResume()).toBeNull();
    // hintِ غیررشته‌ای کنارِ رکوردِ سالم دور ریخته می‌شود نه کلِ رکورد
    localStorage.setItem(
      "vision2-bg-last-item",
      JSON.stringify({ scope: "verbs", id: "go", title: "go · went · gone", hint: 42 }),
    );
    expect(readAppendixResume()).toEqual({ scope: "verbs", id: "go", title: "go · went · gone" });
  });

  it("write whitelist: an unwired scope never reaches storage", () => {
    writeAppendixResume({
      scope: "phonetics" as "verbs",
      id: "x",
      title: "t",
    });
    expect(localStorage.getItem("vision2-bg-last-item")).toBeNull();
  });

  it("write-wins: the last real write in any layer is the one that stays", () => {
    writeAppendixResume({ scope: "verbs", id: "be", title: "be · was / were · been", hint: "بودن" });
    writeAppendixResume({ scope: "pos", id: "t10-v1", title: "دهم · درس اول", hint: "۱۲ خانوادهٔ واژه" });
    const rec = readAppendixResume();
    expect(rec?.scope).toBe("pos");
    expect(rec?.id).toBe("t10-v1");
  });

  it("legacy migration: old r233 key wraps as grammar; a corrupt new key is never healed from legacy", () => {
    // فقط کلیدِ قدیمی — رکوردِ ۲۳۳ یادگیرندهٔ واقعی گم نمی‌شود
    localStorage.setItem(
      "vision2-bg-last-topic",
      JSON.stringify({ id: "bg-verb-to-be", title: "فعل to be", page: "صفحهٔ ۲۴" }),
    );
    expect(readAppendixResume()).toEqual({
      scope: "grammar",
      id: "bg-verb-to-be",
      title: "فعل to be",
      hint: "صفحهٔ ۲۴",
    });
    // کلیدِ نو موجود ولی خراب = null — رکوردِ کهنهٔ legacy احیا نمی‌شود
    localStorage.setItem("vision2-bg-last-item", "{corrupt");
    expect(readAppendixResume()).toBeNull();
    // کلیدِ نو خالی شد — باز مهاجرتِ روی-خواندن کار می‌کند
    localStorage.removeItem("vision2-bg-last-item");
    expect(readAppendixResume()?.scope).toBe("grammar");
  });

  it("writeBgLastTopic mirrors: legacy record stays intact and the generalized record carries hint=page", () => {
    writeBgLastTopic({ id: "bg-verb-to-be", title: "فعل to be", page: "صفحهٔ ۲۴", source: "دهم" });
    // کلیدِ قدیمی دست‌نخورده — گاردها و دادهٔ r233 سالم
    expect(readBgLastTopic()).toEqual({
      id: "bg-verb-to-be",
      title: "فعل to be",
      page: "صفحهٔ ۲۴",
      source: "دهم",
    });
    // آینهٔ تعمیم‌یافته — scopeِ grammar با hint=page (source فقط legacy است)
    expect(readAppendixResume()).toEqual({
      scope: "grammar",
      id: "bg-verb-to-be",
      title: "فعل to be",
      hint: "صفحهٔ ۲۴",
    });
  });
});

describe("home appendix card routes by scope (r234)", () => {
  it("verbs record: shows the three-forms line and clicks into openAppendixVerb", () => {
    writeAppendixResume({ scope: "verbs", id: "be", title: "be · was / were · been", hint: "بودن" });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).toContain("ادامه از «be · was / were · been»");
    expect(card.textContent).toContain("بودن");
    expect(card.getAttribute("title")).toContain("در افعال بی‌قاعده");
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      verbBase: "be",
    });
  });

  it("pos record: clicks into openAppendixPosTable with the real frozen table id", () => {
    const t0 = WORD_FAMILY_TABLES[0];
    const id0 = wordFamilyTableId(t0);
    writeAppendixResume({
      scope: "pos",
      id: id0,
      title: `${t0.grade} · ${t0.lesson}`,
      hint: `${t0.families.length} خانوادهٔ واژه`,
    });
    render(<HomeTools />);
    const card = screen.getByRole("button", { name: /ضمیمهٔ کتاب/ });
    expect(card.textContent).toContain(`ادامه از «${t0.grade} · ${t0.lesson}»`);
    expect(card.getAttribute("title")).toContain("در اجزای کلماتی");
    fireEvent.click(card);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      posTableId: id0,
    });
  });
});

describe("appendix header resume pill (r234)", () => {
  it("without a record: no pill is rendered at all", () => {
    render(<AppendixView />);
    expect(screen.queryByTestId("appendix-resume-pill")).toBeNull();
  });

  it("pos record: pill click opens the pos sub-tab with pure local routing — zero view churn", async () => {
    const t0 = WORD_FAMILY_TABLES[0];
    const id0 = wordFamilyTableId(t0);
    writeAppendixResume({ scope: "pos", id: id0, title: `${t0.grade} · ${t0.lesson}` });
    render(<AppendixView />);
    const pill = screen.getByTestId("appendix-resume-pill");
    expect(pill.textContent).toContain(`ادامه از «${t0.grade} · ${t0.lesson}»`);
    fireEvent.click(pill);
    // زیرتبِ pos فعال شد (محتوای جدول‌ها رندر شد)
    await waitFor(() => {
      expect(screen.getByText("خانوادهٔ واژه‌ها از خودِ جزوه‌ها (اجزای کلماتی)")).toBeInTheDocument();
    });
    // رفت‌وبرگشتِ محلی — view دست نخورد
    expect(useStudy.getState().view).toEqual({ type: "home" });
    // صفرِ نوشتنِ جانبی در استورِ یادگیری
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
  }, 20000);

  it("verbs record: pill click opens the verbs sub-tab with the verb row anchored and pulsing", async () => {
    writeAppendixResume({
      scope: "verbs",
      id: "be",
      title: "be · was / were · been",
      hint: "بودن",
    });
    render(<AppendixView />);
    fireEvent.click(screen.getByTestId("appendix-resume-pill"));
    // زیرتبِ verbs فعال شد (دو «افعال بی‌قاعده»: برچسبِ زیرتاب + سرصفحهٔ جدول)
    // + سطرِ فعلِ هدف لنگرِ واقعی دارد
    await waitFor(() => {
      expect(screen.getAllByText("افعال بی‌قاعده").length).toBeGreaterThanOrEqual(2);
      expect(document.getElementById("iv-row-be")).not.toBeNull();
    });
    // پالسِ زمردی روی همان سطر (پنجرهٔ ۱٫۶ثانیه‌ای)
    await waitFor(
      () => {
        expect(document.getElementById("iv-row-be")?.className).toContain("bg-emerald-50");
      },
      { timeout: 1200 },
    );
    // رکورد همان مانده — رسیدن با لنگر همان فعل را ثبت می‌کند، چیزی جعل نمی‌شود
    expect(readAppendixResume()?.id).toBe("be");
    expect(useStudy.getState().view).toEqual({ type: "home" });
  }, 20000);

  it("grammar record: pill click opens the merged topic (aria-expanded)", async () => {
    const topic = BOOKLET_GRAMMAR_TOPICS[1]; // «ضمایر فاعلی» — بسته به‌صورتِ پیش‌فرض
    writeBgLastTopic({ id: topic.id, title: topic.title });
    render(<AppendixView />);
    fireEvent.click(screen.getByTestId("appendix-resume-pill"));
    await waitFor(() => {
      const header = document.getElementById(`bg-topic-${topic.id}`)?.querySelector("button");
      expect(header?.getAttribute("aria-expanded")).toBe("true");
    });
    expect(useStudy.getState().view).toEqual({ type: "home" });
  }, 20000);
});

describe("the verbs layer writes its own resume record (r234)", () => {
  it("listening to any form of a verb records it — with zero learning-store side-writes", async () => {
    render(<IrregularVerbsTable />);
    const v0 = irregularVerbs[0];
    const speakButtons = screen.getAllByRole("button", { name: "روخوانی متن انگلیسی" });
    expect(speakButtons.length).toBeGreaterThan(2);
    fireEvent.click(speakButtons[0]); // نخستین سلولِ شکلِ سادهٔ سطرِ اول
    await waitFor(() => {
      expect(readAppendixResume()).toEqual({
        scope: "verbs",
        id: v0.base,
        title: `${v0.base} · ${v0.past} · ${v0.pp}`,
        hint: v0.fa,
      });
    });
    // صفرِ نوشتنِ جانبی در استورِ یادگیری
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
    expect(useStudy.getState().view).toEqual({ type: "home" });
  });

  it("deep-link focus into the verbs table counts as seeing — the record is written", async () => {
    const v0 = irregularVerbs[0];
    render(<IrregularVerbsTable focusBase={v0.base} />);
    await waitFor(() => {
      expect(readAppendixResume()?.scope).toBe("verbs");
      expect(readAppendixResume()?.id).toBe(v0.base);
    });
    // سطرِ هدف لنگرِ واقعی دارد (برایِ اسکرولِ عمیقِ home→appendix)
    expect(document.getElementById(`iv-row-${v0.base}`)).not.toBeNull();
  });
});
