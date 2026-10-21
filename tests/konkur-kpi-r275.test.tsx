// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۵ — گذرِ صداقتِ KPIهایِ «گوشهٔ کنکور» (بندِ ① پیشنهادِ ۲۷۴):
//   اندازه‌گیریِ زندهٔ راندِ ۲۷۴ گفت: KPIها بی-title بودند و hintِ
//   «تسلط» می‌گفت «درست از دیده‌شده‌ها» — دروغِ ظریف؛ بانکِ کنکور
//   «درست» جداگانه ثبت نمی‌کند، فقط «دیدن» و «خطایِ باز» را.
//   فرمولِ واقعی از منبع: mastered = seen && !wrong → تسلط =
//   دیده‌شده‌هایِ بی-خطایِ باز ÷ دیده‌شده‌ها. کشفِ تازهٔ راندِ ۲۷۵:
//   aria-labelِ نقشهٔ پیشرفت با ارقامِ لاتین می‌گفت («0 از 360»)
//   درحالی‌که کلِ برنامه faNum می‌گوید.
//   قراردادها:
//   ① رندرِ زندهٔ KonkurView — کاربرِ نو: هر ۵ کارتِ KPI title دارند؛
//      hintِ تسلط «بی-خطایِ باز از دیده‌شده‌ها» است؛ عبارتِ دروغِ
//      قدیمی در هیچ DOMی نیست؛ aria-labelِ نقشه با ارقامِ فارسی و
//      بدونِ هیچ رقمِ لاتین
//   ② رندرِ زنده با دادهٔ کاشته‌شده (۱۰ دیده / ۳ غلطِ باز): تسلط
//      «۷۰٪» می‌گوید و تولتیپش «۷ از ۱۰ دیده‌شده» — اعدادِ زنده از
//      تک‌منبع (stats) نه رشتهٔ منجمد؛ aria-label «۱۰ دیده‌شده از
//      ۳۶۰، ۳ خطای باز»
//   ③ قفل‌هایِ منبع: عبارتِ دروغ از منبع رفته؛ HeroKpi title
//      اختیاری دارد و رویِ ریشه می‌نشیند؛ شمارشِ دقیقِ titleها از
//      منبع (۶ × title={ + ۵ × title=" — ۳ ModeCard + ۲ KPI)؛
//      قالبِ دقیقِ aria-label با faNum؛ رشته‌هایِ نو بی-«جزوه»
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import KonkurView from "@/components/study/exam/konkur-view";
import { useStudy } from "@/lib/study-store";
import { examBank } from "@/data";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

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
  sessionStorage.clear();
  useStudy.setState({
    view: { type: "konkur" },
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
    konkurSeen: {},
    konkurWrong: {},
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

/** همهٔ کارت‌هایِ KPI — divهایِ ریشهٔ HeroKpi با title */
function kpiCards() {
  return Array.from(document.querySelectorAll<HTMLElement>(".rounded-xl.bg-black\\/25"));
}

describe("صداقتِ KPIهایِ گوشهٔ کنکور — رندرِ زنده — r275", () => {
  it("① کاربرِ نو: هر ۵ کارتِ KPI تولتیپِ صادق دارد؛ hintِ تسلط بی-خطایِ باز است؛ aria-labelِ نقشه تماماً فارسی‌رقم", () => {
    render(<KonkurView />);

    const cards = kpiCards();
    expect(cards).toHaveLength(5);
    // هر پنج کارت title دارند — پیش‌تر بی-title بودند (اندازه‌گیریِ زندهٔ ۲۷۴)
    for (const c of cards) expect(c).toHaveAttribute("title");

    // عبارتِ دروغِ قدیمی در هیچ DOMی نیست
    expect(document.body.textContent).not.toContain("درست از دیده‌شده‌ها");

    // hintِ تسلط — فرمولِ واقعی، نه وعدهٔ «درست»
    const mastery = cards.find((c) => c.textContent!.includes("تسلط"))!;
    expect(mastery.textContent).toContain("بی-خطایِ باز از دیده‌شده‌ها");
    expect(mastery.textContent).toContain("۰٪");
    // تولتیپِ تسلط: بانک «درست» جداگانه ثبت نمی‌کند + اعدادِ زنده (۰ از ۰)
    expect(mastery.getAttribute("title")).toContain("بانک «درست» جداگانه ثبت نمی‌کند");
    expect(mastery.getAttribute("title")).toContain("الان ۰ از ۰ دیده‌شده");

    // تولتیپِ پوشش با اعدادِ زنده
    const cover = cards.find((c) => c.textContent!.includes("پوشش بانک"))!;
    expect(cover.getAttribute("title")).toContain("الان ۰ از ۳۶۰");

    // aria-labelِ نقشهٔ پیشرفت — فارسی‌رقمِ خالص
    const map = screen.getByRole("img", { name: /نقشهٔ پیشرفت بانک کنکور/ });
    expect(map.getAttribute("aria-label")).toBe(
      "نقشهٔ پیشرفت بانک کنکور: ۰ دیده‌شده از ۳۶۰، ۰ خطای باز",
    );
    expect(map.getAttribute("aria-label")).not.toMatch(/[0-9]/);

    // تولتیپِ خانه‌ها هم فارسی‌رقم — اولین خانه «تست ۱» است نه «تست 1»
    const firstCell = map.querySelector<HTMLElement>("div[title]")!;
    expect(firstCell.getAttribute("title")).toBe("تست ۱ — دیده‌نشده");
    expect(firstCell.getAttribute("title")).not.toMatch(/[0-9]/);
  });

  it("② دادهٔ کاشته‌شده (۱۰ دیده / ۳ غلطِ باز): تسلط «۷۰٪» و «۷ از ۱۰» — اعدادِ زنده از تک‌منبع", () => {
    const seenIds = examBank.slice(0, 10).map((q) => q.id);
    useStudy.setState({
      konkurSeen: Object.fromEntries(seenIds.map((id) => [id, true])),
      konkurWrong: Object.fromEntries(seenIds.slice(0, 3).map((id) => [id, true])),
    } as Partial<ReturnType<typeof useStudy.getState>>);

    render(<KonkurView />);

    const cards = kpiCards();
    const mastery = cards.find((c) => c.textContent!.includes("تسلط"))!;
    expect(mastery.textContent).toContain("۷۰٪");
    expect(mastery.getAttribute("title")).toContain("الان ۷ از ۱۰ دیده‌شده");

    const cover = cards.find((c) => c.textContent!.includes("پوشش بانک"))!;
    expect(cover.textContent).toContain("۱۰ از ۳۶۰");
    expect(cover.getAttribute("title")).toContain("الان ۱۰ از ۳۶۰");

    const wrong = cards.find((c) => c.textContent!.includes("خطای باز"))!;
    expect(wrong.textContent).toContain("۳");

    const map = screen.getByRole("img", { name: /نقشهٔ پیشرفت بانک کنکور/ });
    expect(map.getAttribute("aria-label")).toBe(
      "نقشهٔ پیشرفت بانک کنکور: ۱۰ دیده‌شده از ۳۶۰، ۳ خطای باز",
    );
    // خاموشیِ کاربرِ سررسید-دار نشده: تولتیپِ سررسید بی-شرطِ صادق است
    const due = cards.find((c) => c.textContent!.includes("مرور سررسید"))!;
    expect(due.getAttribute("title")).toContain("زمان‌بندی SRS");
  });
});

describe("قفل‌هایِ منبعِ صداقتِ KPI — r275", () => {
  const src = () => readFileSync(join(process.cwd(), "src/components/study/exam/konkur-view.tsx"), "utf8");

  it("③ عبارتِ دروغ از منبع رفته؛ HeroKpi title اختیاری دارد و رویِ ریشه می‌نشیند", () => {
    const s = src();
    // دروغِ قدیمی — بانک «درست» ندارد
    expect(s).not.toContain("درست از دیده‌شده‌ها");
    // امضای نو: title اختیاری + گذر به ریشه
    expect(s).toContain("title?: string");
    expect(s).toContain("title={title}");
    // hintِ صادق
    expect(s).toContain("بی-خطایِ باز از دیده‌شده‌ها");
  });

  it("④ شمارشِ دقیقِ titleها از منبع (نه حافظه): ۶ × title={ و ۵ × title=\"", () => {
    const s = src();
    // title={: سه KPI (پوشش/تسلط/رکورد) + خانهٔ نقشه + QuizEngine + گذرِ HeroKpi
    expect(s.match(/title=\{/g)!.length).toBe(6);
    // title=": دو KPI (خطای باز/مرور سررسید) + سه ModeCard
    expect(s.match(/title="/g)!.length).toBe(5);
  });

  it("⑤ قالبِ دقیقِ aria-labelِ نقشه با faNum — ارقامِ لاتینِ خام ممنوع؛ خانه‌ها هم", () => {
    const s = src();
    expect(s).toContain(
      "aria-label={`نقشهٔ پیشرفت بانک کنکور: ${faNum(stats.seenCount)} دیده‌شده از ${faNum(examBank.length)}، ${faNum(stats.wrongCount)} خطای باز`}",
    );
    // الگویِ خامِ قدیمی دیگر نیست
    expect(s).not.toContain("${stats.seenCount} دیده‌شده از ${examBank.length}");
    // تولتیپِ خانه‌ها: faNum(q.id.slice(2)) — الگویِ لاتینِ قدیمیِ replace رفته
    expect(s).toContain("title={`تست ${faNum(q.id.slice(2))}");
    expect(s).not.toContain('q.id.replace("x-", "تست ")');
  });

  it("⑥ رشته‌هایِ نو در فضای نامِ a11y بی-«جزوه»اند؛ تولتیپِ رکورد دو شاخهٔ صادق دارد", () => {
    const s = src();
    for (const frag of [
      "هر تستی که حداقل یک‌بار دیده‌ای — درست یا غلط، در هر حالتِ جلسه؛ الان",
      "مسلط یعنی دیده‌شده‌ای که خطایِ باز ندارد",
      "غلط‌هایی که هنوز پاک نشده‌اند — با «تست‌های سخت من» مرورشان کن",
      "تست‌هایی که طبق زمان‌بندی SRS الان وقتِ مرورشان است",
      "بهترین درصدِ جلسه‌هایِ شبیه‌ساز تا امروز",
      "اولین جلسهٔ شبیه‌سازت را بزن تا رکورد ثبت شود",
    ]) {
      expect(s).toContain(frag);
      expect(frag).not.toContain("جزوه");
    }
  });
});
