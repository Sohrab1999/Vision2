// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { render } from "@testing-library/react";
import { act, useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { speakFailToast, speak } from "@/lib/speak";
import { useToast, toast } from "@/hooks/use-toast";


// ------------------------------------------------------------------
// r394 — مالکِ نامدارِ «توستِ خانواده» (speakFailToast در speak.ts).
//
// سرشماریِ راند (الگویِ دوقلویِ r382..r393): سهگانهٔ شکستِ صدا
// (عنوانِ «🔇 پخش صدا ممکن نشد» + توصیهٔ اتصال + ۳۵۰۰ms) در ۹ سایت
// دستکپی شده بود — ۶ چیپِ «روخوانی جفت» (danger-words/my-words/
// flashcards/vocab-tab/dictionary-view/word-of-day) + ۳ درگاهِ درونخطی
// (listen-view/speak-button/conversation-tab) — و برابری‌شان فقط با
// قفلِ تستیِ r345 نگه داشته میشد؛ مالکِ نامدار برابری را ساختاری میکند.
//
// تصمیمهایِ حکم:
//  ① مالک در speak.ts است — ماژولی که خودِ مسیرِ شکست را دارد (کامنتِ
//     r347 آن «the family toast» را از پیش مینامید).
//  ② وامگیری «انتخاب» است نه اثرِ جانبی: speak() خودش هرگز توست
//     نمیکند — قراردادِ ۴آرگومانیِ r345 منجمد میماند.
//  ③ عرصهٔ نبرد با دیالوگِ درونخطی میماند (spell-rush پاراگرافِ خودش
//     را رندر میکند) — عضوِ خانواده نیست؛ سندِ «نخیر»ِ ثبتشده.
//  ④ هیچ رویدادِ تحلیلی رویِ پایِ شکست (قاعدهٔ r344).
// ------------------------------------------------------------------

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const TITLE = "🔇 پخش صدا ممکن نشد";
const DESC = "اتصال اینترنت را بررسی کن و دوباره روی دکمهٔ پخش بزن.";

const chipFiles = [
  "src/components/study/practice/danger-words.tsx",
  "src/components/study/practice/my-words.tsx",
  "src/components/study/lesson/flashcards.tsx",
  "src/components/study/lesson/vocab-tab.tsx",
  "src/components/study/lesson/dictionary-view.tsx",
  "src/components/study/lesson/word-of-day.tsx",
];

afterEach(() => {
  toast({ title: "r394-cleanup", duration: 1 });
});

describe("r394 — رفتارِ واقعیِ مالک", () => {
  it("speakFailToast دقیقاً سهگانهٔ خانواده را شلیک میکند", () => {
    let seen: ReturnType<typeof useToast>["toasts"] = [];
    function Probe({ onToasts }: { onToasts: (t: ReturnType<typeof useToast>["toasts"]) => void }) {
      const s = useToast();
      useEffect(() => {
        onToasts(s.toasts);
      }, [s.toasts, onToasts]);
      return null;
    }
    render(<Probe onToasts={(t) => { seen = t; }} />);
    act(() => {
      speakFailToast();
    });
    expect(seen).toHaveLength(1);
    expect(seen[0].title).toBe(TITLE);
    expect(seen[0].description).toBe(DESC);
    expect(seen[0].duration).toBe(3500);
  });
});

describe("r394 — قفلهایِ منبعِ مالک", () => {
  it("مالک در speak.ts است و سهگانه را دقیقاً یکبار حمل میکند", () => {
    const src = p("src/lib/speak.ts");
    expect(src).toContain("export function speakFailToast(): void");
    expect(src).toContain(`title: "${TITLE}"`);
    expect(src).toContain(`description: "${DESC}"`);
    expect(src).toContain("duration: 3500");
    // در کل src فقط مالک شکلِ آبجکتیِ عنوان را دارد
    const hits = execSync(
      `rg -l 'title: "🔇 پخش صدا ممکن نشد"' src/ || true`
    )
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
    expect(hits).toEqual(["src/lib/speak.ts"]);
  });

  it("speak() خودش هرگز توست نمیکند — وامگیری انتخاب است، نه اثرِ جانبی", () => {
    const src = p("src/lib/speak.ts");
    const i = src.indexOf("export async function speak(");
    const block = src.slice(i, src.indexOf("export function stopSpeaking", i));
    expect(block).not.toContain("speakFailToast");
    expect(block).not.toContain("toast(");
    // قراردادِ ۴آرگومانیِ r345 منجمد
    expect(block).toContain("onError?.();");
  });

  it("هیچ رویدادِ تحلیلی رویِ پایِ شکست (قاعدهٔ r344)", () => {
    const src = p("src/lib/speak.ts");
    expect(src).not.toContain("trackEvent");
  });
});

describe("r394 — وامگیریِ ۹ سایت", () => {
  it("شش چیپ مستقیم پاس میدهند — تعریفِ محلیِ کهنه منقرض", () => {
    for (const f of chipFiles) {
      const src = p(f);
      expect(src, f).toContain('import { speakFailToast } from "@/lib/speak";');
      expect(src, f).toContain("onSpeakError={speakFailToast}");
      expect(src, f).not.toContain("pairSpeakError");
    }
  });

  it("سه درگاهِ درونخطی صدا میزنند — منطقِ محلیِ هرکدام دستنخورده", () => {
    // listen-view — setPlaying(false) کنارِ وامگیری میماند
    const lv = p("src/components/study/practice/listen-view.tsx");
    expect(lv).toContain("speakFailToast();");
    expect(lv).toContain("setPlaying(false);\n          speakFailToast();");
    // speak-button — setState("idle") کنارِ وامگیری میماند
    const sb = p("src/components/study/shared/speak-button.tsx");
    expect(sb).toContain('import { speak, speakFailToast } from "@/lib/speak";');
    expect(sb).toContain('setState("idle");\n        speakFailToast();');
    // conversation-tab — cancel + وامگیری + resolve به همین ترتیب
    const ct = p("src/components/study/lesson/conversation-tab.tsx");
    const b = ct.indexOf("cancelRef.current = true;");
    const t = ct.indexOf("speakFailToast();");
    const r = ct.indexOf("resolve();", t);
    expect(b).toBeGreaterThan(-1);
    expect(t).toBeGreaterThan(b);
    expect(r).toBeGreaterThan(t);
  });

  it("عرصهٔ نبرد با دیالوگِ درونخطی میماند — سندِ «نخیر»ِ ثبتشده", () => {
    const src = p("src/components/study/duel/spell-rush-view.tsx");
    expect(src).toContain("پخش صدا ممکن نشد — از معنی بالا حدس بزن یا دوباره تلاش کن");
    expect(src).not.toContain("speakFailToast");
  });
});
