// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { speak } from "@/lib/speak";

// ------------------------------------------------------------------
// r345 — نخستین داوریِ خانوادهٔ «شکستِ صدا» — قفلهای راند.
//
// سرشماریِ راند (۹ مکانِ speak در src): تنها listen-view (توستِ «🔇
// پخش صدا ممکن نشد») و playAudioِ دیکته (نشانگرِ درونخطیِ کهربایی)
// صادق بودند؛ چهار عضوِ ساکتِ «چیرگیِ سکوتِ مخروبه» درمان شدند:
//   ① SpeakButton — درگاهِ ۱۵فایله (فلشکارت/دیکشنری/جدولها/کتابخانه…)
//     فقط setState("idle") میکرد: اسپینر میایستاد و هیچ چیز نمیگفت.
//   ② playAllِ مکالمه — onError فقط resolve میکرد: توالی بیصدا
//     خطبهخط جلو میرفت و کاربر «پخشِ همه»یِ بیصدا را میپنداشت.
//   ③ speakSpellِ دیکته — هجاکشیِ ساکت؛ حالا همان نشانگرِ درونخطیِ
//     پخشِ عادی («روخوانی در دسترس نیست») می‌نشیند.
//   ④ پنج چیپِ «روخوانی جفت» (danger-words/my-words/flashcards/
//     vocab-tab/dictionary-view) — اصلاً onError نداشتند.
// زبانِ خانواده دقیقاً عینِ عضوِ پایه (listen-view): عنوان «🔇 پخش صدا
// ممکن نشد» + توصیهٔ اتصال + ۳۵۰۰ms — و هیچ رویدادِ تحلیلیِ دروغین
// رویِ پایِ شکست (قاعدهٔ r344).
// رکوردِ زنده: scripts/qa-r345-audio-failpath.sh — تزریقِ fetchِ
// /api/tts→500، اتمیکِ کلیک+کاوش، تاریکِ درجا، negctlِ بازگردانی.
// ------------------------------------------------------------------

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const FAMILY_TITLE = "پخش صدا ممکن نشد";
const FAMILY_DESC = "اتصال اینترنت را بررسی کن و دوباره روی دکمهٔ پخش بزن.";

const chipFiles = [
  "src/components/study/practice/danger-words.tsx",
  "src/components/study/practice/my-words.tsx",
  "src/components/study/lesson/flashcards.tsx",
  "src/components/study/lesson/vocab-tab.tsx",
  "src/components/study/lesson/dictionary-view.tsx",
  "src/components/study/lesson/word-of-day.tsx",
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("r345 — زبانِ خانوادهٔ شنیدار رویِ همهٔ درگاههایِ شکست", () => {
  it("عضوِ پایه (listen-view) دستنخورده: عنوان + توصیه + ۳۵۰۰", () => {
    const src = p("src/components/study/practice/listen-view.tsx");
    expect(src).toContain(`title: "🔇 ${FAMILY_TITLE}"`);
    expect(src).toContain(FAMILY_DESC);
    expect(src).toContain("duration: 3500");
  });

  it("هر هشت عضوِ تازه همین سهگانهٔ خانواده را دارند", () => {
    const newMembers = [
      "src/components/study/shared/speak-button.tsx",
      "src/components/study/lesson/conversation-tab.tsx",
      ...chipFiles,
    ];
    for (const f of newMembers) {
      const src = p(f);
      expect(src, f).toContain(`title: "🔇 ${FAMILY_TITLE}"`);
      expect(src, f).toContain(FAMILY_DESC);
      expect(src, f).toContain("duration: 3500");
    }
  });

  it("شش چیپِ «روخوانی جفت»: فراخوانِ بی.onError دیگر وجود ندارد", () => {
    // r390 — کلیکِ چیپ به مالکِ یکتایِ PairSpeakChips رفت؛ قفلِ r345 حالا
    // دوروش میبندد: هر نما onSpeakError={pairSpeakError} به مالک میدهد
    // (توستِ خانواده سمتِ میزبان پابرجا) و مالکِ وامگیرنده فراخوانِ
    // چهارآرگومانِ کامل را حمل میکند (undefined, onSpeakError).
    for (const f of chipFiles) {
      const src = p(f);
      expect(src, f).toContain("onSpeakError={pairSpeakError}");
      // شکلِ برهنهٔ ساکت (بدونِ درگاهِ خطا) ممنوع — مرزِ پرانتز/سمیکالن
      expect(src, f).not.toMatch(/\(\s*p\.other,\s*0\.95\s*\)\s*[;}]/);
    }
    const owner = p("src/components/study/lesson/pair-speak-chips.tsx");
    expect(owner, "the r390 owner carries the full r345 speak call").toContain(
      "void speak(p.other, 0.95, undefined, onSpeakError)"
    );
  });
});

describe("r345 — قراردادِ هر درگاه", () => {
  it("SpeakButton: شکست ⇒ idle + توستِ خانواده؛ بدونِ رویدادِ تحلیلیِ شکست", () => {
    const src = p("src/components/study/shared/speak-button.tsx");
    const i = src.indexOf("const stop = await speak(");
    const block = src.slice(i, src.indexOf("stopRef.current = () => {", i));
    expect(block).toContain('setState("idle")');
    expect(block).toContain(`title: "🔇 ${FAMILY_TITLE}"`);
    // قاعدهٔ r344 — هیچ trackEventی رویِ پایِ شکست
    expect(src).not.toContain("trackEvent");
    // قراردادِ r234 دستنخورده: onSpeak پیش از هر تلاشِ شبکه
    const before = src.indexOf("onSpeak?.();");
    expect(before).toBeGreaterThan(-1);
    expect(before).toBeLessThan(src.indexOf('setState("loading")'));
  });

  it("playAllِ مکالمه: نخستین شکست ⇒ توقفِ توالی + توست — به همین ترتیب", () => {
    const src = p("src/components/study/lesson/conversation-tab.tsx");
    const i = src.indexOf("// راندِ ۳۴۵ — خطروخوانیِ ساکت دروغ است");
    expect(i).toBeGreaterThan(-1);
    const block = src.slice(i, src.indexOf("resolve();", i) + 10);
    const cancel = block.indexOf("cancelRef.current = true;");
    const toast = block.indexOf(`title: "🔇 ${FAMILY_TITLE}"`);
    const resolve = block.indexOf("resolve();");
    expect(cancel).toBeGreaterThan(-1);
    expect(toast).toBeGreaterThan(cancel);
    expect(resolve).toBeGreaterThan(toast);
  });

  it("speakSpellِ دیکته: شکست ⇒ همان نشانگرِ درونخطیِ ردیف", () => {
    const src = p("src/components/study/lesson/dictation-tab.tsx");
    const i = src.indexOf("speakSpell(");
    const block = src.slice(i, src.indexOf("}, [idx]);", i));
    expect(block).toContain("setSpelling(false)");
    expect(block).toContain("setAudioErrorFor(idx)");
    // پیامِ نشانگرِ درونخطی همان است که پخشِ عادی میگوید
    expect(src).toContain("روخوانی در دسترس نیست — از دکمهٔ راهنما استفاده کنید");
  });
});

describe("r345 — رفتارِ واقعیِ speak.ts در شکستِ شبکه", () => {
  it("شکستِ قطعیِ fetch ⇒ onErrorِ یک‌باره + stopِ بیآسیب (بدونِ کش)", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError("r345-network")));
    vi.stubGlobal("fetch", fetchMock);
    const onErr = vi.fn();
    const stop = await speak("r345-hello", 0.95, undefined, onErr);
    expect(typeof stop).toBe("function");
    expect(onErr).toHaveBeenCalledTimes(1);
    expect(() => stop()).not.toThrow();
    // مسیرِ شکست هرگز واردِ کشِ URL نشده — تلاشِ بعدی هم از fetch میگذرد
    await speak("r345-hello", 0.95, undefined, onErr);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onErr).toHaveBeenCalledTimes(2);
  });

  it("پاسخِ ۵۰۰ ⇒ دو تلاشِ درونی با فاصلهٔ ۷۰۰ms، بعد onError", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(() => Promise.resolve(new Response("no", { status: 500 })));
    vi.stubGlobal("fetch", fetchMock);
    const onErr = vi.fn();
    const run = speak("r345-500", 0.95, undefined, onErr);
    const done = vi.runAllTimersAsync();
    await Promise.all([run, done]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onErr).toHaveBeenCalledTimes(1);
  });
});
