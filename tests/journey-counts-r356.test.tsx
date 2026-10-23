// @vitest-environment jsdom
// ------------------------------------------------------------------
// r356 — «شمارندههای نبض روی سفرِ کشف» — پیشنهادِ ④ِ r351 (چهار راند
// باز): چیپِ «کشف شد» از پرچمِ دودویی به شمارندهٔ زندهٔ مصرفِ واقعی.
//
// قراردادهایی که این فایل قفل میکند:
//   • نگاشتِ دنیا→رویداد تکحقیقت است (journey-counts.ts) و تایپش
//     علیهِ EventName بسته — رانشِ بدونِ کامپایل ناممکن؛ هر رویداد فقط
//     یک خانه دارد (شمارندهٔ مشترک = آمارِ دوبرابرِ دروغ)
//   • sumJourneyEvents صادق است: کلیدِ غایب/زباله ⇒ صفر؛ منفی/NaN/∞
//     هرگز وارد جمع نمیشوند
//   • journeyCounterState هرگز جعل نمیکند: (۰،۰) ⇒ plain — واگراییِ
//     محلی-سرور عدد از هیچ نمیسازد
//   • قلاب: یک GET (قراردادِ پیشفرضِ F10)، خطا ⇒ نقشههای خالی —
//     «سلامتِ جعلی» ممنوع (همزادِ use-watchtower)
//   • چیپ: active=«N بار این هفته» زمردی / dormant=«N بار تا امروز —
//     برگرد و تمرین کن» کهربایی (خطِ تاریکِ موجودِ کرنل — رشدِ صفرِ
//     CSS) / plain=خطِ ثابتِ r349 با ariaِ یخزده
//   • چیپِ کشفنشده شمارنده ندارد — کارِ او پرش است، نه آمار
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { EVENT_NAMES, isEventName } from "@/lib/analytics-events";
import {
  JOURNEY_WORLD_EVENTS,
  sumJourneyEvents,
  journeyCounterState,
  useJourneyCounts,
  type JourneyWorldKey,
} from "@/lib/journey-counts";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    srs: {},
    starredWords: [],
    libraryDone: {},
    konkurSeen: {},
    rushGames: 0,
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

// ---------------------------------------------------------------
// ① قفلهایِ نگاشتِ تکحقیقت
// ---------------------------------------------------------------
describe("نگاشتِ دنیا→رویداد — تکحقیقتِ بسته به رجیستری", () => {
  it("① دقیقاً ۹ دنیا، هرکدام دستکم یک رویداد، همهٔ رویدادهایِ مجازِ رجیستری", () => {
    const keys = Object.keys(JOURNEY_WORLD_EVENTS);
    expect(keys).toHaveLength(9);
    expect(keys).toEqual(
      expect.arrayContaining([
        "flashcards",
        "quiz",
        "listening",
        "dictation",
        "rush",
        "duel",
        "mywords",
        "library",
        "konkur",
      ])
    );
    for (const key of keys) {
      const events = JOURNEY_WORLD_EVENTS[key as JourneyWorldKey];
      expect(events.length).toBeGreaterThan(0);
      for (const e of events) expect(isEventName(e)).toBe(true);
    }
  });

  it("② نگاشتِ دقیق — تصمیمِ محصولیِ قفلشده (پایانِ دورِ واقعیِ همان سطح)", () => {
    expect(JOURNEY_WORLD_EVENTS.flashcards).toEqual(["flashcard_done"]);
    expect(JOURNEY_WORLD_EVENTS.quiz).toEqual(["quiz_done"]);
    expect(JOURNEY_WORLD_EVENTS.listening).toEqual(["listen_done"]);
    expect(JOURNEY_WORLD_EVENTS.dictation).toEqual(["dictation_done"]);
    expect(JOURNEY_WORLD_EVENTS.rush).toEqual(["rush_done"]);
    expect(JOURNEY_WORLD_EVENTS.duel).toEqual(["duel_done"]); // start+done = دوبرابرِ دروغ
    expect(JOURNEY_WORLD_EVENTS.mywords).toEqual([
      "my_words_review_start",
      "my_words_flashcards_start",
      "my_words_dictation_start",
    ]);
    expect(JOURNEY_WORLD_EVENTS.library).toEqual(["library_story_done"]);
    expect(JOURNEY_WORLD_EVENTS.konkur).toEqual(["konkur_start"]);
  });

  it("③ هر رویداد فقط یک خانه دارد — شمارندهٔ مشترکِ دو چیپ ممنوع", () => {
    const seen = new Map<string, string>();
    for (const [world, events] of Object.entries(JOURNEY_WORLD_EVENTS)) {
      for (const e of events) {
        expect(seen.has(e)).toBe(false); // تکرارِ بینِ دنیاها ⇒ آمارِ دوبرابر
        seen.set(e, world);
      }
    }
    expect(seen.size).toBe(11); // ۹ دنیا، ۱۱ رویدادِ منحصربهفرد
  });

  it("④ تکحقیقت: کامپوننت از موتور قرض میگیرد، نامِ رویداد را رونویسی نمیکند", () => {
    const comp = read("src/components/study/home/home-discovery-journey.tsx");
    expect(comp).toContain('from "@/lib/journey-counts"');
    expect(comp).toContain("JOURNEY_WORLD_EVENTS[w.key]");
    // هیچ نامِ رویدادی در کامپوننت زندگی نمیکند — نگاشت فقط در موتور است
    for (const name of ["flashcard_done", "duel_done", "konkur_start", "library_story_done"]) {
      expect(comp).not.toContain(name);
    }
    const engine = read("src/lib/journey-counts.ts");
    expect(engine).toContain("satisfies Record<string, readonly EventName[]>");
  });
});

// ---------------------------------------------------------------
// ② موتورِ خالص — جمعِ صادق و حالتهایِ بیجعل
// ---------------------------------------------------------------
describe("sumJourneyEvents + journeyCounterState — ریاضیِ صادق", () => {
  it("⑤ جمع: غایب/خالی/زبانه ⇒ صفر؛ سه شروعِ واژههایمن جمع میشوند؛ زباله وارد جمع نمیشود", () => {
    expect(sumJourneyEvents(undefined, JOURNEY_WORLD_EVENTS.duel)).toBe(0);
    expect(sumJourneyEvents({}, JOURNEY_WORLD_EVENTS.duel)).toBe(0);
    expect(sumJourneyEvents({ junk: 5 }, JOURNEY_WORLD_EVENTS.duel)).toBe(0); // کلیدِ غریبه
    expect(
      sumJourneyEvents(
        {
          my_words_review_start: 2,
          my_words_flashcards_start: 1,
          my_words_dictation_start: 4,
        },
        JOURNEY_WORLD_EVENTS.mywords
      )
    ).toBe(7);
    // مقادیرِ ناممکن هرگز وارد جمع نمیشوند — نه منفی، نه NaN، نه ∞
    expect(
      sumJourneyEvents(
        { my_words_review_start: -3, my_words_flashcards_start: NaN, my_words_dictation_start: Infinity },
        JOURNEY_WORLD_EVENTS.mywords
      )
    ).toBe(0);
    expect(
      sumJourneyEvents(
        { my_words_review_start: 3, my_words_flashcards_start: -1, my_words_dictation_start: 2 },
        JOURNEY_WORLD_EVENTS.mywords
      )
    ).toBe(5);
  });

  it("⑥ حالتِ خط: زنده/خفته/ساده — (۰،۰) هرگز عدد جعل نمیکند", () => {
    expect(journeyCounterState(0, 0)).toEqual({ kind: "plain", week: 0, total: 0 });
    expect(journeyCounterState(3, 9)).toEqual({ kind: "active", week: 3, total: 9 });
    expect(journeyCounterState(0, 7)).toEqual({ kind: "dormant", week: 0, total: 7 });
    // دفاعی — ورودیِ ناممکن همان plainِ صادق است
    expect(journeyCounterState(NaN, Infinity).kind).toBe("plain");
    expect(journeyCounterState(-1, -5).kind).toBe("plain");
    // هفتهٔ منفی اما سابقهٔ مثبت ⇒ خفته با جمعِ سالم
    expect(journeyCounterState(-2, 7)).toEqual({ kind: "dormant", week: 0, total: 7 });
  });
});

// ---------------------------------------------------------------
// ③ قلاب — یک GET، خطا = نقشههایِ خالی
// ---------------------------------------------------------------
describe("useJourneyCounts — همزادِ برجِ مراقبت", () => {
  it("⑦ واکشِ سبز ⇒ ready با نقشههایِ week/total؛ ردیفِ زباله بیآسیب نادیده", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            events: [
              { name: "rush_done", label: "چالش برق‌آسا", total: 12, week: 3 },
              { name: "duel_done", label: "نبرد دودنفره", total: 4, week: 0 },
              { junk: true }, // ردیفِ بی‌نام — نادیده
              { name: "", total: 9, week: 9 }, // نامِ خالی — نادیده
              { name: "konkur_start", total: NaN, week: "no" }, // زبالهٔ عددی ⇒ صفرِ صادق
            ],
          }),
          { status: 200 }
        )
      )
    );
    const { result } = await import("@testing-library/react").then((m) =>
      m.renderHook(() => useJourneyCounts())
    );
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.week).toEqual({ rush_done: 3, duel_done: 0, konkur_start: 0 });
    expect(result.current.total).toEqual({ rush_done: 12, duel_done: 4, konkur_start: 0 });
  });

  it("⑧ واکشِ ۵۰۰ ⇒ error با نقشههایِ خالی — سلامتِ جعلی ممنوع", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 500 })));
    const { result } = await import("@testing-library/react").then((m) =>
      m.renderHook(() => useJourneyCounts())
    );
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.week).toEqual({});
    expect(result.current.total).toEqual({});
  });

  it("⑧ واکشِ ردشده (شبکه) هم همان errorِ صادق است", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("offline"))));
    const { result } = await import("@testing-library/react").then((m) =>
      m.renderHook(() => useJourneyCounts())
    );
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.week).toEqual({});
  });
});

// ---------------------------------------------------------------
// ④ رندرِ زنده — سه حالتِ چیپ + سقوطِ صادق
// ---------------------------------------------------------------
describe("سفرِ کشف با شمارندهها — رندرِ زنده", () => {
  const ledger = (overrides: Record<string, { total: number; week: number }> = {}) => ({
    events: [
      { name: "flashcard_done", label: "دور فلش‌کارت", total: 3, week: 3 },
      { name: "quiz_done", label: "آزمون کوتاه", total: 7, week: 0 },
      { name: "my_words_review_start", label: "شروع مرور نشان‌شده‌ها", total: 2, week: 2 },
      ...Object.entries(overrides).map(([name, v]) => ({ name, label: name, total: v.total, week: v.week })),
    ],
  });

  const wire = (body: unknown, status = 200) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(status === 200 ? JSON.stringify(body) : "nope", { status }))
    );
  };

  const renderJourney = async () => {
    const { default: Journey } = await import("@/components/study/home/home-discovery-journey");
    render(<Journey />);
    await waitFor(() => expect(document.querySelector(".discovery-journey")).toBeTruthy());
  };

  const counterLine = (key: string) =>
    document.querySelector(`[data-journey-counter="${key}"]`) as HTMLElement | null;

  it("⑨ active — «۳ بار این هفته» زمردی + ariaِ غنیشده با عددِ واقعی", async () => {
    useStudy.setState({ known: { "1:ability": true } }); // فلش‌کارت کشفشده
    wire(ledger());
    await renderJourney();
    const line = counterLine("flashcards");
    expect(line).toBeTruthy();
    expect(line!.getAttribute("data-counter-kind")).toBe("active");
    expect(line!.textContent).toBe("۳ بار این هفته — ادامه بده!");
    expect(line!.className).toContain("text-emerald-600");
    const chip = document.querySelector('[data-journey-chip="flashcards"]') as HTMLElement;
    expect(chip.getAttribute("aria-label")).toBe("فلش‌کارت‌ها — کشف شده، ۳ بار این هفته");
  });

  it("⑩ dormant — «۷ بار تا امروز» کهربایی (تنِ گرمِ کرنلِ موجود) + دعوتِ ملایم", async () => {
    useStudy.setState({
      results: { "1:quiz": { correct: 4, total: 5, percent: 80, at: new Date().toISOString() } },
    });
    wire(ledger()); // quiz_done: week=0، total=7
    await renderJourney();
    const line = counterLine("quiz");
    expect(line!.getAttribute("data-counter-kind")).toBe("dormant");
    expect(line!.textContent).toBe("۷ بار تا امروز — برگرد و تمرین کن");
    expect(line!.className).toContain("text-amber-700"); // خطِ تاریکِ موجود — رشدِ صفرِ CSS
    const chip = document.querySelector('[data-journey-chip="quiz"]') as HTMLElement;
    expect(chip.getAttribute("aria-label")).toBe("آزمونک‌های درس — کشف شده، ۷ بار تا امروز");
  });

  it("⑪ plain — کشفشده اما دفترِ خالی (واگراییِ محلی-سرور) ⇒ خطِ ثابتِ r349 و ariaِ یخزده", async () => {
    useStudy.setState({ known: { "1:ability": true } });
    // انکارِ تعمدی: دفتر هیچ flashcard_doneای ندارد — divergence واقعی
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ events: [{ name: "rush_done", label: "x", total: 5, week: 5 }] }), {
          status: 200,
        })
      )
    );
    await renderJourney();
    const line = counterLine("flashcards");
    expect(line!.getAttribute("data-counter-kind")).toBe("plain");
    expect(line!.textContent).toBe("کشف شد — ادامه بده!");
    const chip = document.querySelector('[data-journey-chip="flashcards"]') as HTMLElement;
    expect(chip.getAttribute("aria-label")).toBe("فلش‌کارت‌ها — کشف شده"); // برچسبِ یخزدهٔ r349
  });

  it("⑫ شکستِ واکش ⇒ همهٔ چیپهایِ کشفشده خطِ ثابتِ r349 — شمارندهٔ جعلی هیچ‌جا", async () => {
    useStudy.setState({
      known: { "1:ability": true },
      results: {
        duel: { correct: 7, total: 10, percent: 70, at: new Date().toISOString() },
      },
    });
    wire("server down", 500);
    await renderJourney();
    for (const key of ["flashcards", "duel"]) {
      const line = counterLine(key);
      expect(line!.getAttribute("data-counter-kind")).toBe("plain");
      expect(line!.textContent).toBe("کشف شد — ادامه بده!");
    }
    const chip = document.querySelector('[data-journey-chip="flashcards"]') as HTMLElement;
    expect(chip.getAttribute("aria-label")).toBe("فلش‌کارت‌ها — کشف شده");
  });

  it("⑬ چیپِ کشفنشده شمارنده ندارد — کارِ او پرش است، نه آمار", async () => {
    useStudy.setState({ known: { "1:ability": true } }); // فقط فلش‌کارت
    wire(ledger());
    await renderJourney();
    expect(counterLine("duel")).toBeNull(); // todo — بدونِ data-journey-counter
    expect(counterLine("konkur")).toBeNull();
    expect(counterLine("rush")).toBeNull();
    // اما چیپهایِ کشفشده دارند
    expect(counterLine("flashcards")).toBeTruthy();
  });

  it("⑭ جمعِ چندرویدادی: review_start=۲ (دفترِ پایه) + flashcards_start=۱ (override) ⇒ «۳ بار»", async () => {
    // hasProgressِ r349 با starred تنها برآورده نمیشود (گیتِ عمدی) — یک واژهٔ معلوم هم میخواهد
    useStudy.setState({ known: { "1:ability": true }, starredWords: ["1:ability"] });
    wire(
      ledger({
        my_words_flashcards_start: { total: 1, week: 1 },
      })
    );
    await renderJourney();
    const line = counterLine("mywords");
    expect(line!.getAttribute("data-counter-kind")).toBe("active");
    expect(line!.textContent).toBe("۳ بار این هفته — ادامه بده!"); // ۲+۱ — جمعِ واقعیِ سه رویداد
  });
});

// ---------------------------------------------------------------
// ⑤ قفلهایِ ساختاری
// ---------------------------------------------------------------
describe("قفلهایِ ساختاریِ r356", () => {
  it("⑮ کامپوننت: بی‌transition-all، با data-journey-counter و data-counter-kind", () => {
    const comp = read("src/components/study/home/home-discovery-journey.tsx");
    expect(comp).not.toContain("transition-all"); // قفلِ scoped-transitions — دستنخورده
    expect(comp).toContain("data-journey-counter={worldKey}");
    expect(comp).toContain("data-counter-kind={counter.kind}");
    expect(comp).toContain("text-amber-700"); // تنِ خفته از کرنلِ موجود میگذرد
    expect(comp).toContain("کشف شد — ادامه بده!"); // خطِ ثابتِ r349 همچنان سقوطِ صادق
  });

  it("⑯ رجیستری دستنخورده — این راند هیچ رویدادِ تازهای ثبت نمیکند (خواندنِ منفعل، ردیابیِ منفعل)", () => {
    // GETِ شمارندهها passive است — مثل برجِ مراقبت، رجیستری را شلوغ نمیکند
    // [پینِ بهروزشده با اعلانِ r357]: teacher_class_csv پنجاهویکم شد
    expect(EVENT_NAMES).toHaveLength(51);
    expect(EVENT_NAMES).not.toContain("journey_counts");
  });
});
