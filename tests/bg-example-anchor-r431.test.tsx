// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r431 — «رنگِ حلقهٔ خانواده + عمقِ سطریِ مثالِ درسنامه» — قفلها.
//
// بندِ ① (سوءظنِ «متغیرِ مشترکِ سایه» به همهٔ خانواده): کشفِ ایستایِ این
// راند — سطرِ خانوادهٔ r428 هنگام پالس زبرا (bg-white/bg-stone-50) را
// همچنان حمل میکرد و در CSSِ کامپایلشده هر دو Utilityِ زبرا «پسِ»
// bg-emerald-50 میآیند (همان لایه، همان ویژگی، همسطحی) — پالسِ روشنِ
// زمردی زیرِ زبرا دفن بود. ترمیم: قراردادِ «جایگزین، نه اضافه» رویِ زبرا —
// سطرِ پالس‌دار هرگز همسایهٔ هم-خاصیتی ندارد.
// بندِ ② (عمقِ سطریِ bg-examples — آخرین لنگرِ بیپالسِ خانواده): اطلس
// پایهٔ جملهای را با en میفرستد، openAppendixTopic پارامترِ دومِ اختیاری
// میگیرد، و سطرِ مثال در موضوعِ لنگرخورده با هستهٔ زمردیِ r234 پالس
// میزند — گاردِ عضویت روی مثالهایِ «همین» موضوع (بیگانه = سکوتِ صادق —
// r236)؛ لنگر پسِ نخستین تلاشِ اسکرول مصرف میشود (ایدئومِ r427) و
// بازشدنِ پرشی ماندگار میشود (عینِ navigateToTopicِ r226).
// قفلها:
//  · اطلس: پایهٔ جملهای → {kind:"topicId", id, en}؛ پایهٔ topicIdِ خام →
//    فرودِ موضوعیِ صادق بیِ en؛ ناشناس → null
//  · کارت: سطرِ مثالِ هدف پالس میزند (bg-emerald-50 + حلقهٔ درونیِ
//    shadow-emerald-300)، همسایه دستنخورده، جملهٔ بیگانه ساکت
//  · کارت: پالس پس از مصرفِ لنگرِ موضوع زنده میماند (stateِ محلی) و با
//    تایمرِ ۱٫۶ثانیهای خاموش میشود
//  · میزبان (ضمیمه): رسیدن با view = {appendix, topicId, bgExampleEn}
//    سطرِ مثال را پالس میدهد؛ جملهٔ بیگانه با مثالهایِ موضوع هیچ
//  · استور: openAppendixTopic دو-آرگومنتی bgExampleEn مینویسد؛
//    فراخوانیِ تک-آرگومنتیِ کهنه پاک میکند — رفتارِ r221 دستنخورده
//  · مسیرِ کارنامه: کلیکِ خانهٔ امروزِ بانکِ bg-examples = view با لنگرِ
//    عمیق + رویدادِ drill_due_jump یکبار + بستنِ کارنامه
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { drillJumpAnchorFor, drillBankTitle } from "@/lib/drill-label-atlas";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";

const { trackSpy, closeSpy } = vi.hoisted(() => ({
  trackSpy: vi.fn(),
  closeSpy: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackSpy(...args),
}));

const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا
const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});

// موضوعِ واقعی با دستکم دو مثال (برایِ قفلِ همسایه) — نخستین در ترتیبِ آرایه
const TOPIC = BOOKLET_GRAMMAR_TOPICS.find((t) => (t.examples?.length ?? 0) >= 2)!;
const EX0 = TOPIC.examples![0];
const EX1 = TOPIC.examples![1];
const LI0 = `bg-ex-${TOPIC.id}-0`;
const LI1 = `bg-ex-${TOPIC.id}-1`;
// جملهٔ بیگانه — مثالِ واقعیِ «موضوعِ دیگر» (گاردِ عضویتِ داده‌محور)
const FOREIGN_TOPIC = BOOKLET_GRAMMAR_TOPICS.find(
  (t) => t.id !== TOPIC.id && (t.examples?.length ?? 0) > 0,
)!;
const FOREIGN_EN = FOREIGN_TOPIC.examples![0].en;

const bgTitle = drillBankTitle("bg-examples");

describe("r431 — اطلسِ پرش: عمقِ سطریِ bg-examples", () => {
  it("پایهٔ جملهایِ واقعی → {kind:'topicId', id, en} — خودِ جمله با لنگر میرود", () => {
    expect(drillJumpAnchorFor("bg-examples", EX0.en)).toEqual({
      kind: "topicId",
      id: TOPIC.id,
      en: EX0.en,
    });
  });

  it("پایهٔ topicIdِ خام → فرودِ موضوعیِ صادق بیِ en — هیچ پالسِ برساخته (r236)", () => {
    expect(drillJumpAnchorFor("bg-examples", TOPIC.id)).toEqual({
      kind: "topicId",
      id: TOPIC.id,
    });
  });

  it("پایهٔ ناشناس → nullِ صادق", () => {
    expect(drillJumpAnchorFor("bg-examples", "no such base")).toBeNull();
  });
});

describe("r431 — پالسِ سطرِ مثال (BookletGrammarView)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });
  afterEach(() => cleanup());

  it("سطرِ مثالِ هدف پالسِ زمردی میگیرد؛ همسایه دستنخورده؛ لنگرِ موضوع مصرف میشود", async () => {
    const topicDone = vi.fn();
    const exampleDone = vi.fn();
    render(
      <BookletGrammarView
        focusTopicId={TOPIC.id}
        focusExampleEn={EX0.en}
        onFocusDone={topicDone}
        onExampleFocusDone={exampleDone}
      />,
    );
    await waitFor(
      () => {
        const li = document.getElementById(LI0);
        expect(li).not.toBeNull();
        expect(li!.className).toContain("bg-emerald-50"); // هستهٔ زمردیِ r234
        expect(li!.className).toContain("shadow-emerald-300"); // حلقهٔ درونیِ روشن
      },
      { timeout: 1500 },
    );
    // پالس فقط یک سطر است — همسایه بیِ هسته میماند
    const pulsed = Array.from(document.querySelectorAll("li")).filter((li) =>
      li.className.includes("bg-emerald-50"),
    );
    expect(pulsed).toHaveLength(1);
    expect(document.getElementById(LI1)?.className).not.toContain("bg-emerald-50");
    // لنگرِ موضوع و لنگرِ مثال هر دو پسِ نخستین تلاشِ اسکرول مصرف شدند —
    // waitFor: زیرِ فشارِ سوئیت، تایمرهایِ مصرف ممکن است دیرتر بیفتند (درسِ OOM)
    await waitFor(() => expect(topicDone).toHaveBeenCalled(), { timeout: 3000 });
    await waitFor(() => expect(exampleDone).toHaveBeenCalled(), { timeout: 3000 });
    // و پالس با وجودِ مصرفِ لنگرها زنده مانده (stateِ محلی — نه prop)
    expect(document.getElementById(LI0)!.className).toContain("bg-emerald-50");
  }, 20000);

  it("پالس با تایمرِ ۱٫۶ثانیهای خاموش میشود — سطر به ظاهرِ ساکتِ خودش برمیگردد", async () => {
    render(
      <BookletGrammarView
        focusTopicId={TOPIC.id}
        focusExampleEn={EX0.en}
      />,
    );
    await waitFor(
      () => {
        expect(document.getElementById(LI0)?.className).toContain("bg-emerald-50");
      },
      { timeout: 1500 },
    );
    await new Promise((r) => setTimeout(r, 1900)); // فراتر از پنجرهٔ پالس
    expect(document.getElementById(LI0)?.className).not.toContain("bg-emerald-50");
  }, 20000);

  it("جملهٔ بیگانه با مثالهایِ موضوع: سکوتِ صادق — موضوع باز، بیِ اسکرول و پالسِ برساخته (r236)", async () => {
    const exampleDone = vi.fn();
    render(
      <BookletGrammarView
        focusTopicId={TOPIC.id}
        focusExampleEn={FOREIGN_EN}
        onExampleFocusDone={exampleDone}
      />,
    );
    await new Promise((r) => setTimeout(r, 500)); // فرصتِ کاملِ effectها
    expect(document.querySelector("li.bg-emerald-50")).toBeNull();
    // موضوعِ لنگرخورده همان است (فرودِ موضوعی) — فقط عمقِ سطری ساکت ماند
    expect(document.getElementById(`bg-topic-${TOPIC.id}`)).not.toBeNull();
    expect(exampleDone).toHaveBeenCalled(); // تلاشِ ناکام هم «تلاش» است
  }, 20000);

  it("بیِ لنگرِ مثال هیچ — همهٔ سطرها بیِ هسته (رفتارِ r221 دستنخورده)", async () => {
    render(<BookletGrammarView focusTopicId={TOPIC.id} />);
    await new Promise((r) => setTimeout(r, 500));
    expect(document.querySelector("li.bg-emerald-50")).toBeNull();
  }, 20000);
});

describe("r431 — میزبانِ ضمیمه: رسیدن با لنگرِ عمیقِ مثال", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });
  afterEach(() => cleanup());

  it("view = {appendix, topicId, bgExampleEn}: سطرِ مثال در دید با پالس باز میشود", async () => {
    useStudy.setState({
      view: { type: "appendix", topicId: TOPIC.id, bgExampleEn: EX0.en },
    });
    render(<AppendixView topicId={TOPIC.id} bgExampleEn={EX0.en} />);
    await waitFor(
      () => {
        const li = document.getElementById(LI0);
        expect(li).not.toBeNull();
        expect(li!.className).toContain("bg-emerald-50");
        expect(li!.getAttribute("data-bg-example")).toBe(EX0.en);
      },
      { timeout: 2000 },
    );
  }, 20000);

  it("جملهٔ بیگانه با مثالهایِ موضوعِ لنگرخورده: هیچ پالسی هیچجا — سکوتِ صادق (r236)", async () => {
    useStudy.setState({
      view: { type: "appendix", topicId: TOPIC.id, bgExampleEn: FOREIGN_EN },
    });
    render(<AppendixView topicId={TOPIC.id} bgExampleEn={FOREIGN_EN} />);
    await new Promise((r) => setTimeout(r, 600));
    expect(document.querySelector("li.bg-emerald-50")).toBeNull();
    // زیرتابِ درسنامه همان فعال شد (لنگرِ موضوع معتبر بود)
    expect(document.getElementById(`bg-topic-${TOPIC.id}`)).not.toBeNull();
  }, 20000);
});

describe("r431 — قراردادِ استور: openAppendixTopic با/بیِ عمقِ سطری", () => {
  beforeEach(() => {
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("دو-آرگومنتی: bgExampleEn در view نوشته میشود", () => {
    useStudy.getState().openAppendixTopic(TOPIC.id, EX0.en);
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      topicId: TOPIC.id,
      bgExampleEn: EX0.en,
    });
  });

  it("تک-آرگومنتیِ کهنه: هر bgExampleEnِ کهنهای پاک میشود — رفتارِ r221 دستنخورده", () => {
    useStudy.setState({
      view: { type: "appendix", topicId: TOPIC.id, bgExampleEn: EX0.en },
    });
    useStudy.getState().openAppendixTopic(TOPIC.id);
    expect(useStudy.getState().view).toEqual({ type: "appendix", topicId: TOPIC.id });
  });
});

describe("r431 — سیمِ میزبانِ واقعی (درسِ شاهدِ زنده)", () => {
  it("study-app هر لنگرِ view ضمیمه را به AppendixView میرساند — از جمله bgExampleEn", () => {
    const src = readFileSync(
      join(process.cwd(), "src", "components", "study", "study-app.tsx"),
      "utf8",
    );
    // شاهدِ زندهٔ r431 گرفت: propِ نو که به میزبان سیم نشود در jsdomِ مستقیم
    // سبز میماند و در محصول مرده بود — سیمِ هر میدانِ view قفل میشود.
    expect(src).toContain("topicId={view.topicId}");
    expect(src).toContain("bgExampleEn={view.bgExampleEn}");
    expect(src).toContain("posTableId={view.posTableId}");
    expect(src).toContain("posRowWord={view.posRowWord}");
    expect(src).toContain("verbBase={view.verbBase}");
    expect(src).toContain("phonemeId={view.phonemeId}");
    expect(src).toContain("abbrevSym={view.abbrevSym}");
  });
});

describe("r431 — مسیرِ کارنامه: پرشِ خانهٔ امروزِ بانکِ bg-examples", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
    trackSpy.mockClear();
    closeSpy.mockClear();
  });
  afterEach(() => cleanup());

  it("کلیکِ خانهٔ امروز = view با لنگرِ عمیقِ مثال + رویدادِ یکبار + بستنِ کارنامه", () => {
    useStudy.setState({
      drillMistakes: { "bg-examples": { [EX0.en]: dueEntry() } },
    });
    render(<ReportCard open onClose={() => closeSpy()} />);
    const el = screen.queryByLabelText(
      `هفتهٔ پیشِ رو — ${faNum(1)} موردِ بازگشت در ${faNum(1)} روز`,
    );
    expect(el).toBeTruthy();
    const btn = el!.querySelector('button[aria-label^="امروز"]')!;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-label")).toBe(
      `امروز — ${faNum(1)} موردِ بازگشت — پرش به تمرینِ ${bgTitle}`,
    );
    fireEvent.click(btn);
    // عمقِ سطریِ r431: view خودِ جمله را هم حمل میکند (سطرِ مثال پالس میزند)
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      topicId: TOPIC.id,
      bgExampleEn: EX0.en,
    });
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("drill_due_jump");
    expect(closeSpy).toHaveBeenCalledTimes(1); // کارنامه بسته شد — مقصد پنهان نمیماند
  });
});
