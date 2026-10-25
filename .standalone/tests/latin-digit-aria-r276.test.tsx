// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۶ — سرشماریِ ارقامِ لاتین در ویژگی‌هایِ a11y (بندِ ① پیشنهادِ
// ۲۷۵): پس از بستنِ نقشهٔ کنکور در r275، سرشماریِ rg + اسکریپتِ
// precount-r276 رویِ همهٔ aria-label/title/altهایِ src هشت نشتیِ
// باقی‌مانده را یافت — جاهایی که متنِ مرئی faNum می‌گوید ولی ویژگیِ
// a11y عددِ خامِ لاتین (شش نشتِ عددی) یا نامِ خامِ انگلیسی (دو رنگ):
//   ۱. listen-view «فرصت پخش باقی‌مانده: ${playsLeft}»
//   ۲. vocab-donut «دونات پیشرفت واژگان: ${percent} درصد»
//   ۳. vocab-donut «رفتن به واژگان درس ${a.id}»
//   ۴. dictionary-view «صادرات ${ankiCount} واژه» — بدترِ همه: متنِ
//      مرئیِ همان دکمه faNum(ankiCount) می‌گفت؛ دو استانداردِ موازی!
//   ۵. flashcards title «سطح مرور: ${srsItem.level + 1}» — r274 متنِ
//      مرئیِ «سطح ۱ از ۶» را faNum کرد ولی این tooltip جا ماند
//   ۶. weekly-chart «${d.weekday} ${d.day}» — d.day کلیدِ ISOِ خام
//      («2026-10-21») است؛ با faDayLabelِ تک‌منبعِ weekly-digest فارسی
//      شد («شنبه ۲۱/۱۰») — همان ایدئومِ weekly-report
//   ۷/۸. onboarding + profile-popover «رنگ ${c}» — c اسمِ خامِ
//      انگلیسیِ رنگ («emerald»)؛ با AVATAR_COLOR_LABELS (تک‌منبعِ
//      types.ts) فارسی شد («رنگ زمردی»)
//   مواردِ سالمِ کنارشان: roomCode (کدِ اتاقِ کیبوردی — طراحی)،
//   book-spine «L1..L12» (برچسبِ انگلیسیِ رویِ جلد — en-text+ltr)،
//   t.page («صفحهٔ ۲۲» — از داده فارسی می‌آید)، تاریخ‌ها (fa-IR)،
//   g.letter (حرفِ الفبایِ افعالِ بی‌قاعده — انگلیسیِ به‌جاست)،
//   w.en/p.other (واژهٔ انگلیسی)، countNote (از داخل faNum ساخته
//   می‌شود)، table.lesson («درس اول» — از داده فارسی)
// قراردادها:
//   ① رندرِ زندهٔ VocabDonut — کاربرِ نو: ariaِ دونات «۰ درصد» با
//      رقمِ فارسی؛ هر ۱۲ پیوندِ درس با «درس ۱..۱۲» فارسی؛ هیچ
//      aria-labelی در کلِ کامپوننت رقمِ لاتین ندارد
//   ② قفل‌هایِ منبعِ پنج نشتیِ عددی: هر رشتهٔ نو دقیقاً یک‌بار؛
//      الگویِ خامِ قدیمی در فایلِ خودش صفر
//   ③ سرشماریِ سراسری: پنج الگویِ خامِ قدیمی در کلِ src/components
//      صفر — قراردادِ faNum یک قانونِ سراسری است
//   ④ فضای نامِ a11y: رشته‌هایِ نو بی-«جزوه»
//   ⑤ رندرِ زندهٔ WeeklyChart در تبِ «۳۰ روزه»: ۳۰ خانهٔ نقشهٔ
//      حرارتی با تولتیپِ «روزِ هفته ۲۱/۱۰ — ۰ آزمون · ۰ مرور» —
//      بی-هیچ رقمِ لاتین
//   ⑥ قفلِ تاریخِ نمودار + برچسبِ رنگِ فارسی (تک‌منبعِ types.ts)
//   ⑦ سرشماریِ سراسریِ تکمیلی: ISOِ خام و رنگِ خام صفر
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import VocabDonut from "@/components/study/practice/vocab-donut";
import WeeklyChart from "@/components/study/practice/weekly-chart";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  // jsdom IntersectionObserver ندارد — whileInViewِ دونات (framer-motion)
  class IOStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;
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
  sessionStorage.clear();
  useStudy.setState({
    known: {},
    results: {},
  });
});

afterEach(() => {
  cleanup();
});

const srcRoot = join(process.cwd(), "src");
const readSrc = (rel: string) => readFileSync(join(srcRoot, rel), "utf8");

// سرشماریِ بازگشتی — همهٔ فایل‌هایِ متنیِ زیرِ src/components
function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, acc);
    else if (/\.(tsx?|css)$/.test(name)) acc.push(p);
  }
  return acc;
}
const allComponentSources = (): string[] =>
  walkFiles(join(srcRoot, "components"));

describe("راند ۲۷۶ — سرشماریِ ارقامِ لاتین در ویژگی‌هایِ a11y", () => {
  it("پردهٔ ① — رندرِ زندهٔ VocabDonut: ariaِ دونات و ۱۲ پیوندِ درس همه faNum، بی-هیچ رقمِ لاتین", () => {
    render(<VocabDonut />);
    const donut = screen.getByRole("img");
    const donutAria = donut.getAttribute("aria-label") ?? "";
    expect(donutAria).toBe("دونات پیشرفت واژگان: ۰ درصد");
    expect(donutAria).not.toMatch(/[0-9]/);

    // پیوندهایِ درس: «رفتن به واژگان درس N» با رقمِ فارسی
    const links = screen
      .getAllByRole("button")
      .filter((b) => (b.getAttribute("aria-label") ?? "").startsWith("رفتن به واژگان درس"));
    expect(links.length).toBe(12);
    for (const link of links) {
      const aria = link.getAttribute("aria-label") ?? "";
      expect(aria).toMatch(/رفتن به واژگان درس [۰-۹]+$/);
      expect(aria).not.toMatch(/[0-9]/);
    }
    // لنگرِ دو سر: درس ۱ و درس ۱۲
    expect(
      links.some((l) => l.getAttribute("aria-label") === "رفتن به واژگان درس ۱")
    ).toBe(true);
    expect(
      links.some((l) => l.getAttribute("aria-label") === "رفتن به واژگان درس ۱۲")
    ).toBe(true);
  });

  it("پردهٔ ② — قفل‌هایِ منبع: پنج رشتهٔ نو دقیقاً یک‌بار و الگویِ خامِ قدیمی در فایلِ خودش صفر", () => {
    // شمارش از منبع پیش از نوشتنِ تست (درسِ سه-راند) — با rg تأیید شد
    const listen = readSrc("components/study/practice/listen-view.tsx");
    expect(listen.split("فرصت پخش باقی‌مانده: ${faNum(playsLeft)}").length - 1).toBe(1);
    expect(listen.includes("فرصت پخش باقی‌مانده: ${playsLeft}")).toBe(false);

    const donut = readSrc("components/study/practice/vocab-donut.tsx");
    expect(donut.split("دونات پیشرفت واژگان: ${faNum(percent)} درصد").length - 1).toBe(1);
    expect(donut.includes("واژگان: ${percent} درصد")).toBe(false);
    expect(donut.split("رفتن به واژگان درس ${faNum(a.id)}").length - 1).toBe(1);
    expect(donut.includes("درس ${a.id}")).toBe(false);

    const dict = readSrc("components/study/lesson/dictionary-view.tsx");
    expect(dict.split("صادرات ${faNum(ankiCount)} واژه به صورت فایل Anki").length - 1).toBe(1);
    expect(dict.includes("صادرات ${ankiCount} واژه")).toBe(false);

    const flash = readSrc("components/study/lesson/flashcards.tsx");
    expect(flash.split("سطح مرور: ${faNum(srsItem.level + 1)}").length - 1).toBe(1);
    expect(flash.includes("سطح مرور: ${srsItem.level + 1} —")).toBe(false);
  });

  it("پردهٔ ③ — سرشماریِ سراسری: پنج الگویِ خامِ قدیمی در کلِ src/components صفرند", () => {
    const banned = [
      "فرصت پخش باقی‌مانده: ${playsLeft}",
      "واژگان: ${percent} درصد",
      "رفتن به واژگان درس ${a.id}",
      "صادرات ${ankiCount} واژه",
      "سطح مرور: ${srsItem.level + 1} —",
    ];
    for (const f of allComponentSources()) {
      const text = readFileSync(f, "utf8");
      for (const b of banned) {
        expect(text.includes(b), `${b} هنوز در ${f} زنده است`).toBe(false);
      }
    }
  });

  it("پردهٔ ④ — فضای نامِ a11y: رشته‌هایِ نو بی-«جزوه»", () => {
    const dict = readSrc("components/study/lesson/dictionary-view.tsx");
    const flash = readSrc("components/study/lesson/flashcards.tsx");
    for (const text of [dict, flash]) {
      const lines = text.split("\n").filter((l) => l.includes("faNum(") && (l.includes("aria-label") || l.includes("title=")));
      for (const l of lines) expect(l.includes("جزوه")).toBe(false);
    }
  });

  it("پردهٔ ۵ — رندرِ زندهٔ WeeklyChart: تولتیپِ ۳۰ خانهٔ نقشهٔ حرارتی تاریخِ فارسی دارد، بی-ISOِ لاتین", async () => {
    render(<WeeklyChart />);
    // نقشهٔ حرارتی فقط در تبِ «۳۰ روزه» رندر می‌شود — پیش‌فرض هفتگی است
    fireEvent.click(screen.getByRole("tab", { name: "۳۰ روزه" }));
    await waitFor(() => {
      // mounted پس از اولین اثر فعال می‌شود و ۳۰ خانهٔ نقشهٔ حرارتی می‌نشیند
      const cells = document.querySelectorAll(".heatmap-grid .heat-cell[title]");
      expect(cells.length).toBe(30);
    });
    const cells = [...document.querySelectorAll(".heatmap-grid .heat-cell[title]")];
    for (const cell of cells) {
      const t = cell.getAttribute("title") ?? "";
      // «شنبه ۲۱/۱۰ — ۰ آزمون · ۰ مرور» — روزِ هفته (بی-فاصله، با نیم‌فاصله‌هایِ داخلی) + برچسبِ M/Dِ فارسی
      expect(t).toMatch(/^\S+ [۰-۹]+\/[۰-۹]+ — [۰-۹]+ آزمون · [۰-۹]+ مرور$/);
      expect(t).not.toMatch(/[0-9]/);
    }
  });

  it("پردهٔ ⑥ — قفلِ تاریخِ نمودار + برچسبِ رنگِ فارسی: سه رشتهٔ نو و الگوهایِ خام صفر", () => {
    const chart = readSrc("components/study/practice/weekly-chart.tsx");
    expect(chart.split("${d.weekday} ${faDayLabel(d.day)} —").length - 1).toBe(1);
    expect(chart.includes("${d.weekday} ${d.day}")).toBe(false);
    expect(chart.includes('from "@/lib/weekly-digest"')).toBe(true);

    const types = readSrc("state/types.ts");
    // پنج رنگ، پنج برچسبِ فارسی — تک‌منبعِ مشترکِ دو میزبان
    for (const fa of ["زمردی", "کهربایی", "گلگلی", "بنفش", "آسمانی"]) {
      expect(types.includes(fa)).toBe(true);
    }
    const onboarding = readSrc("components/study/shell/onboarding.tsx");
    const popover = readSrc("components/study/profile/profile-popover.tsx");
    expect(onboarding.split("رنگ ${AVATAR_COLOR_LABELS[c]}").length - 1).toBe(1);
    expect(popover.split("رنگ ${AVATAR_COLOR_LABELS[c]}").length - 1).toBe(1);
    expect(onboarding.includes("رنگ ${c}") || popover.includes("رنگ ${c}")).toBe(false);
  });

  it("پردهٔ ⑦ — سرشماریِ سراسریِ تکمیلی: ISOِ خامِ d.day و رنگِ خام در کلِ src/components صفرند", () => {
    const banned = ["${d.weekday} ${d.day}", "رنگ ${c}"];
    for (const f of allComponentSources()) {
      const text = readFileSync(f, "utf8");
      for (const b of banned) {
        expect(text.includes(b), `${b} هنوز در ${f} زنده است`).toBe(false);
      }
    }
  });
});
