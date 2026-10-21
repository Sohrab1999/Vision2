// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۰ — بندِ ② پیشنهادِ ۲۳۹: تستِ هیدریشنِ واقعی در CI.
//
// پیشِ زمینه: هشدارِ «The result of getServerSnapshot should be cached»
// در r237 فقط در مرورگر دیده و رفع شد — CI آن کلاس از خطا را نمی‌دید.
// این فایل همان مسیرِ Next را در jsdom بازسازی می‌کند:
//   renderToString با windowِ خداحذفی (شبیه‌سازیِ صادقانهٔ SSR —
//   snapshotهایِ bg-reading روی سرور null می‌دهند) → تزریقِ HTML به
//   container → hydrateRoot در act → شنودِ console.error.
// هر درِ «ادامهٔ مطالعه» (هفت درِ حلقهٔ r239) + مجموعهٔ موضوع‌هایِ
// پایدارِ r231 باید بدونِ هیچ هشدارِ هیدریشن هیدرات شوند و حالتِ
// کلاینت بعد از هیدریشن برسد (کاشفِ معنادار — نه تستِ خالی).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { useSyncExternalStore, type ReactElement } from "react";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import AppendixResumePill from "@/components/study/lesson/appendix-resume-pill";
import HomeTools from "@/components/study/home/home-tools";
import ProfilePopover from "@/components/study/profile/profile-popover";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { writeAppendixResume, type AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const grammarRec: AppendixResumeItem = { scope: "grammar", id: "t-present-simple", title: "حال ساده", hint: "ص ۲۳" };
const phonRec: AppendixResumeItem = { scope: "phonetics", id: "ʌ", title: "/ʌ/", hint: "cup — love" };
const verbRec: AppendixResumeItem = { scope: "verbs", id: "eat", title: "eat — ate — eaten", hint: "خوردن" };

beforeAll(() => {
  // actِ React محیطِ تست می‌خواهد
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
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

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  cleanup();
});

/** همان مسیرِ SSR → هیدریشنِ Next، در jsdom:
 *  ۱) renderToString با windowِ حذف‌شده — سرورِ واقعی window ندارد و
 *     snapshotهایِ bg-reading باید null بدهند (HTMLِ سرورِ خالی از درها)
 *  ۲) تزریقِ HTML به container (نه render خالی — هیدریشنِ واقعی)
 *  ۳) hydrateRoot در act + یک تیکِ اضافه برایِ اثرهایِ async
 *  خروجی: خطاهایِ console.errorِ فازِ هیدریشن + HTMLِ سرور + container. */
async function hydrateForTest(ui: ReactElement): Promise<{
  container: HTMLElement;
  errors: string[];
  serverHtml: string;
}> {
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    errors.push(args.map((a) => String(a)).join(" "));
  };
  // React 19 خطایِ هیدریشن را در تسکِ زمان‌بندِ خودش می‌اندازد — از بیرونِ
  // act عبور می‌کند و به‌شکلِ uncaught به vitest می‌رسد. کانالِ سومِ کاشف:
  // رویدادِ error پنجره — preventDefault جلویِ گزارشِ jsdom به vitest را
  // می‌گیرد و خطا به‌عنوانِ دادهٔ تست ثبت می‌شود.
  const windowErrors: string[] = [];
  const onError = (e: ErrorEvent) => {
    e.preventDefault();
    windowErrors.push(String(e.message));
  };
  window.addEventListener("error", onError);
  let serverHtml = "";
  vi.stubGlobal("window", undefined);
  try {
    serverHtml = renderToString(ui);
  } finally {
    vi.unstubAllGlobals();
  }
  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.appendChild(container);
  try {
    // React 19: mismatchِ هیدریشن را console.error نمی‌کند — «می‌اندازد»؛
    // کاشف باید هر دو کانال را بگیرد (شنودِ کنسول + خطایِ پرتاب‌شده)
    await act(async () => {
      hydrateRoot(container, ui);
    });
    await act(async () => {});
  } catch (e) {
    errors.push(`[thrown] ${e instanceof Error ? e.message : String(e)}`);
  } finally {
    console.error = original;
    window.removeEventListener("error", onError);
  }
  return { container, errors: [...errors, ...windowErrors], serverHtml };
}

const hydrationNoise = (errors: string[]) =>
  errors.filter((e) => /getServerSnapshot|hydrat|did not match|should be cached/i.test(e));

// ------------------------------------------------------------------
// A — کاشفِ بیدار: هارنس باید کلاسِ خطایِ هدف را واقعاً بگیرد
// (کفِ معناداری — تستی که هیچ‌وقت قرمز نمی‌شود گارد نیست)
// ------------------------------------------------------------------

/** دقیقاً شکلِ باگِ r237: getServerSnapshot در هر فراخوانی مقدارِ تازه می‌سازد. */
const emptySubscribe = () => () => {};
function UnstableServerSnapshotProbe() {
  const v = useSyncExternalStore(
    emptySubscribe,
    () => "client",
    () => `server-${Math.random()}`,
  );
  return <div data-testid="probe-unstable">{v}</div>;
}

/** ناسازگاریِ واقعیِ درخت: سرور window ندارد، کلاینت دارد. */
function TreeMismatchProbe() {
  const side = typeof window === "undefined" ? "server" : "client";
  return <div data-testid="probe-mismatch">{side}</div>;
}

describe("A — کاشفِ بیدار (هارنس)", () => {
  it("① getServerSnapshotِ ناپایدار = هشدارِ گرفته‌شده", async () => {
    const { errors } = await hydrateForTest(<UnstableServerSnapshotProbe />);
    const caught = hydrationNoise(errors);
    expect(
      caught,
      `هارنس هشدارِ getServerSnapshot را نگرفت: ${JSON.stringify(errors)}`
    ).not.toHaveLength(0);
  });

  it("② mismatchِ واقعیِ درخت = خطایِ گرفته‌شده", async () => {
    const { errors } = await hydrateForTest(<TreeMismatchProbe />);
    const caught = hydrationNoise(errors);
    expect(
      caught,
      `هارنس mismatchِ درخت را نگرفت: ${JSON.stringify(errors)}`
    ).not.toHaveLength(0);
  });
});

// ------------------------------------------------------------------
// B — درهایِ «ادامهٔ مطالعه» هیدریشنِ تمیز دارند (کلاسِ باگِ r237 بسته)
// ------------------------------------------------------------------

describe("B — هیدریشنِ تمیزِ درهایِ «ادامه»", () => {
  it("③ هدر: بی‌دکمه در HTMLِ سرور، دکمه + caret بعد از هیدریشن با seedِ کامل — صفرِ هشدار", async () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(phonRec); // جدیدترینِ دیگر
      writeAppendixResume(grammarRec); // فعلی
    });
    const { container, errors, serverHtml } = await hydrateForTest(<HeaderResumeButton />);
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    // سرور window نداشت → snapshot null → دکمه نبود (مسیرِ واقعیِ SSR)
    expect(serverHtml).not.toContain("header-resume-button");
    // بعد از هیدریشن، حالتِ کلاینت رسید: دکمه + caret
    const btn = container.querySelector('[data-testid="header-resume-button"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain("حال ساده");
    expect(container.querySelector('[data-testid="header-resume-recent-toggle"]')).not.toBeNull();
  });

  it("④ نشانگرِ ضمیمه: pill + چیپِ اخیر بعد از هیدریشن — صفرِ هشدار", async () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    const { container, errors, serverHtml } = await hydrateForTest(
      <AppendixResumePill onGo={vi.fn()} />,
    );
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors).toHaveLength(0);
    expect(serverHtml).not.toContain("appendix-resume-pill");
    expect(container.querySelector('[data-testid="appendix-resume-pill"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="appendix-recent-chip-verbs-eat"]')).not.toBeNull();
  });

  it("⑤ خانه: کارتِ ضمیمه + سینیِ «اخیراً» بعد از هیدریشن — صفرِ هشدار", async () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    const { container, errors } = await hydrateForTest(<HomeTools />);
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    const card = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("ضمیمهٔ کتاب"),
    );
    expect(card).toBeDefined();
    // خطِ «ادامه از» و چیپِ سینی — حالتِ کلاینت بعد از هیدریشن
    expect(card?.textContent).toContain("ادامه از");
    expect(container.querySelector('[data-testid="home-history-item-verbs-eat"]')).not.toBeNull();
  });

  it("⑥ پروفایل: تریگرِ پاپ‌اُور بدونِ هشدارِ radix هیدرات می‌شود", async () => {
    act(() => {
      writeAppendixResume(verbRec);
      writeAppendixResume(grammarRec);
    });
    const { container, errors } = await hydrateForTest(<ProfilePopover />);
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    expect(container.querySelector('[aria-label^="پروفایل من"]')).not.toBeNull();
  });

  it("⑦ درسنامهٔ جامع: مجموعهٔ موضوع‌هایِ پایدارِ r231 — پیش‌فرض در سرور، seedِ کلاینت بعد از هیدریشن — صفرِ هشدار", async () => {
    // نخستین تستِ مصرف‌کنندهٔ این ماژول در فایل — cacheِ ماژولِ هنوز
    // دست‌نخورده است (BG_DEFAULT_OPEN) و «سرور» صادقانه همان را می‌دهد.
    const topic2 = BOOKLET_GRAMMAR_TOPICS[1];
    localStorage.setItem("vision2-bg-open-topics", JSON.stringify([topic2.id]));
    const { container, errors } = await hydrateForTest(<BookletGrammarView />);
    expect(hydrationNoise(errors), errors.join("\n---\n")).toHaveLength(0);
    expect(errors, `خطایِ غیرِهیدریشن: ${errors.join(" | ")}`).toHaveLength(0);
    // بعد از هیدریشن، مجموعهٔ پایدارِ کلاینت اعمال شد — موضوعِ ۲ باز است
    // (اگر سرور و کلاینت ناسازگار بودند، هارنسِ بالا همان‌جا قرمز می‌شد)
    const toggle = container.querySelector(`#bg-topic-${topic2.id} button[aria-expanded]`);
    expect(toggle).not.toBeNull();
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
  });
});
