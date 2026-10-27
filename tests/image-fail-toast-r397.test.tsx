// @vitest-environment jsdom
// ------------------------------------------------------------------
// r397 — مالکِ نامدارِ «توستِ شکستِ ساختِ تصویر» (imageFailToast در
// result-image.ts) + درمانِ دو زخمِ همراهِ همان خانواده.
//
// سرشماریِ راند (الگویِ دوقلویِ r382..r396): جفتِ شکستِ «خطا در ساخت
// تصویر» + «لطفاً دوباره تلاش کن.» (۳۰۰۰ms) در ۵ دروازهٔ دانلود
// بایتبهبایت یکی بود (quiz-result / weekly-report / official-report /
// duel-setup / duel-done) و برابری‌شان فقط با قفلهایِ r342 نگه داشته
// میشد — همان وضعیتِ پیش از r394 برای خانوادهٔ صدا.
//
// تصمیمهایِ حکم:
//  ① مالک در result-image.ts است — ماژولی که خودِ مسیرِ شکست را دارد
//     (آینهٔ speakFailToast در speak.ts، r394).
//  ② وامگیری «انتخاب» است: دو نمایِ برقآسا دیالوگِ برهنهایِ خودشان را
//     نگه میدارند («دانلود تصویر ناموفق بود» — سندِ «نخیر») و هر هفت
//     توستِ موفقیت گویشِ بافتهندِ خودشان را (سندِ «نخیر»).
//  ③ درمانِ زخمِ ①: درگاهِ دانلودِ رسمی رویدادِ official_image را پیشِ
//     ساخت میآتشاند (زادهوردهٔ task 286، پیش از پختهشدنِ قرارداد در
//     r287/288) — تنها نقضِ قراردادِ خانواده؛ درگاهِ همرسانیِ خودش از
//     همیشه if (blob) داشت. اینک if (ok).
//  ④ درمانِ زخمِ ②: دو نمایِ برقآسا گاردِ ضدبازورودِ `if (imgBusy)`
//     نداشتند — کمربندوبندِ استانداردِ ۵ دروازهٔ دیگر.
//  ⑤ هیچ رویدادِ تحلیلی رویِ پایِ شکست (قاعدهٔ r344) — مالک بیtrackEvent.
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act, useEffect } from "react";
import { imageFailToast } from "@/lib/result-image";
import { useToast } from "@/hooks/use-toast";

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const TITLE = "خطا در ساخت تصویر";
const DESC = "لطفاً دوباره تلاش کن.";

// r423 — سرشماریِ وامگیرندها با شمارِ هر پرونده به داخلِ قفلِ رفتارِ
// زیر رفت (BORROWER_COUNTS) — weekly-report اکنون دو دروازه دارد.

const TWO_RUSH_NO_VERDICTS = [
  "src/components/study/duel/rush-view.tsx",
  "src/components/study/duel/spell-rush-view.tsx",
] as const;

const SUCCESS_DIALECTS: ReadonlyArray<readonly [string, string]> = [
  ["src/components/study/quiz/quiz-result.tsx", "🖼 تصویر نتیجه ذخیره شد"],
  ["src/components/study/reports/weekly-report.tsx", "🖼 عکسِ هفته‌نامه ذخیره شد"],
  // r423 — همان نما دروازهٔ دومِ همخانواده را گرفت: کارتِ تقویمِ هفتهٔ پیشِ رو
  ["src/components/study/reports/weekly-report.tsx", "🖼 عکسِ تقویمِ هفته ذخیره شد"],
  ["src/components/study/reports/official-report.tsx", "📸 عکسِ کارنامه ذخیره شد"],
  ["src/components/study/duel/duel-setup.tsx", "🖼 عکسِ کارنامهٔ نبردها ذخیره شد"],
  ["src/components/study/duel/duel-done.tsx", "🖼 عکسِ این نبرد ذخیره شد"],
];

import { afterEach } from "vitest";
afterEach(() => cleanup());

// r397 — hoisted spies for the behavioral official-gate lock (top level,
// the vi.hoisted contract — the mock factory runs before this module).
const { toastSpy, officialImage, trackSpy } = vi.hoisted(() => ({
  toastSpy: vi.fn(),
  officialImage: vi.fn(),
  trackSpy: vi.fn(),
}));

describe("r397 — رفتارِ واقعیِ مالک", () => {
  it("imageFailToast دقیقاً جفتِ خانواده را شلیک میکند (۳۰۰۰ms)", () => {
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
      imageFailToast();
    });
    expect(seen).toHaveLength(1);
    expect(seen[0].title).toBe(TITLE);
    expect(seen[0].description).toBe(DESC);
    expect(seen[0].duration).toBe(3000);
  });
});

describe("r397 — درمانِ درگاهِ رسمی (قراردادِ خانواده، رفتاری)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function mountAndClick() {
    vi.doMock("@/lib/result-image", async (importOriginal) => {
      const actual = await importOriginal<typeof import("@/lib/result-image")>();
      return { ...actual, downloadOfficialImage: (...args: unknown[]) => officialImage(...args) };
    });
    vi.doMock("@/hooks/use-toast", () => ({
      useToast: () => ({ toast: toastSpy }),
      toast: toastSpy,
    }));
    vi.doMock("@/lib/analytics", () => ({ trackEvent: (...args: unknown[]) => trackSpy(...args) }));
    vi.doMock("@/lib/share-card", () => ({
      canShareImageFiles: () => false,
      blobToFile: vi.fn(),
      shareImageFile: vi.fn(),
    }));
    const { useStudy, daysAgoKey } = await import("@/lib/study-store");
    const { FIRST_VISIBLE_BADGE_ID } = await import("@/lib/identity");
    const OfficialReport = (await import("@/components/study/reports/official-report")).default;
    useStudy.setState({
      known: { "3:accept": true } as never,
      results: { "3:1": { percent: 80, total: 10 } } as never,
      history: { [daysAgoKey(0)]: { reviews: 8, quizzes: 2 } },
      dayHistory: {
        [daysAgoKey(0)]: { day: daysAgoKey(0), reviews: 8, quizzes: 2, words: 0, dictation: 0, rush: 0, stories: 0 },
      },
      dayStat: { day: daysAgoKey(0), reviews: 8, quizzes: 2, words: 0, dictation: 0, rush: 0, stories: 0 },
      streak: 3,
      bestStreak: 5,
      userName: "آرش-قهرمان",
      userId: "abcd1234efgh5678",
      seenBadges: [FIRST_VISIBLE_BADGE_ID],
      mistakes: {},
      srs: {},
      starredWords: [],
      wordSeen: {},
    });
    render(<OfficialReport open onClose={() => {}} />);
    const btn = screen.getByRole("button", { name: "گرفتن عکس کارنامهٔ رسمی" });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).not.toBeDisabled());
  }

  it("ساختِ موفق → رویدادِ official_image یکبار + توستِ موفقیتِ گویشِ خودِ درگاه", async () => {
    officialImage.mockResolvedValue(true);
    await mountAndClick();
    expect(trackSpy).toHaveBeenCalledTimes(1);
    expect(trackSpy).toHaveBeenCalledWith("official_image");
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "📸 عکسِ کارنامه ذخیره شد" })
    );
  });

  it("ساختِ ناکام (false) → هیچ رویدادی نیست + مالک جفتِ خانواده را میسوزاند", async () => {
    officialImage.mockResolvedValue(false);
    await mountAndClick();
    expect(trackSpy).not.toHaveBeenCalled(); // زخمِ درمانشده — پیش از این، رویدادِ پیشِ ساخت میآمد
    expect(toastSpy).toHaveBeenCalledWith({ title: TITLE, description: DESC, duration: 3000 });
  });
});

describe("r397 — قفلهایِ منبعِ مالک", () => {
  it("مالک در result-image.ts است و جفت را دقیقاً یکبار حمل میکند", () => {
    const src = p("src/lib/result-image.ts");
    expect(src).toContain("export function imageFailToast(): void");
    expect(src).toContain(`title: "${TITLE}"`);
    expect(src).toContain(`description: "${DESC}"`);
    expect(src).toContain("duration: 3000");
  });

  it("در کل src فقط مالک شکلِ آبجکتیِ عنوانِ تصویر را دارد (سرشماریِ سرتاسری)", () => {
    const hits = execSync(`rg -l 'title: "${TITLE}"' src/ || true`).toString().trim().split("\n").filter(Boolean);
    expect(hits).toEqual(["src/lib/result-image.ts"]);
  });

  it("r398 landed — the CSV sibling family's owner: 9 gates borrow fileFailToast, the pair lives ONLY in the owner", () => {
    // The r397-registered candidate migrated this round (r398): the failure
    // pair «خطا در ساخت فایل» now lives only in lib/file-download.ts; the
    // nine gates borrow the named owner. This test is the census tripwire,
    // upgraded from pinning hand-copies to pinning the borrows.
    const ownerSrc = p("src/lib/file-download.ts");
    expect(ownerSrc).toContain('title: "خطا در ساخت فایل"');
    expect(ownerSrc).toContain("لطفاً دوباره تلاش کن.");
    const BORROWERS: ReadonlyArray<readonly [string, number]> = [
      ["src/components/study/reports/weekly-report.tsx", 5], // r421 — پنجمین دروازه: تقویمِ هفتهٔ پیشِ رو
      ["src/components/study/reports/official-report.tsx", 1],
      ["src/components/study/lesson/dictionary-view.tsx", 1],
      ["src/components/study/shared/pulse-dashboard.tsx", 1],
      ["src/components/study/teacher/teacher-detail.tsx", 1],
      ["src/components/study/teacher/teacher-view.tsx", 2],
    ];
    for (const [f, n] of BORROWERS) {
      const count = (p(f).match(/fileFailToast\(\)/g) ?? []).length;
      expect(count, f).toBe(n);
      expect(p(f), f).not.toContain('title: "خطا در ساخت فایل"');
    }
    // و در کل src هیچ سایتِ دیگری از این عنوان وجود ندارد
    const all = execSync(`rg -l 'title: "خطا در ساخت فایل"' src/ || true`).toString().trim().split("\n").filter(Boolean);
    expect(all).toEqual(["src/lib/file-download.ts"]);
  });

  it("وامگیرندها مالک را صدا میزنند و وامگیری از مسیرِ باریلِ درست است", () => {
    // r423 — weekly-report حالا دو دروازهٔ همخانواده دارد (هفته‌نامه +
    // تقویمِ هفته) — هر دو نامدارِ مالک را میخوانند؛ شمارِ هر پرونده قفل است
    const BORROWER_COUNTS: ReadonlyArray<readonly [string, number]> = [
      ["src/components/study/quiz/quiz-result.tsx", 1],
      ["src/components/study/reports/weekly-report.tsx", 2],
      ["src/components/study/reports/official-report.tsx", 1],
      ["src/components/study/duel/duel-setup.tsx", 1],
      ["src/components/study/duel/duel-done.tsx", 1],
    ];
    for (const [f, expected] of BORROWER_COUNTS) {
      const src = p(f);
      const calls = src.match(/imageFailToast\(\)/g) ?? [];
      expect(calls.length, f).toBe(expected);
      expect(src, f).toContain('imageFailToast } from "@/lib/result-image"');
      // شاخهٔ شکست، مالک را صدا میزند (الگویِ if/else — نه توستِ دستی)
      expect(src, f).toMatch(/else \{\s*imageFailToast\(\);/);
    }
  });

  it("سندهای «نخیر»: دو نمایِ برقآسا دیالوگِ برهنهٔ خودشان را نگه میدارند", () => {
    for (const f of TWO_RUSH_NO_VERDICTS) {
      const src = p(f);
      expect(src, f).toContain("دانلود تصویر ناموفق بود");
      expect(src, f).not.toContain("imageFailToast");
      expect(src, f).not.toContain(TITLE);
    }
    // و هفت توستِ موفقیت، گویشهایِ خودشان را زنده نگه میدارند
    for (const [f, title] of SUCCESS_DIALECTS) {
      expect(p(f), `${f} → ${title}`).toContain(title);
    }
  });

  it("سرشماریِ گارد: هر هفت دروازهٔ دانلود کمربندوبندِ ضدبازورود دارند", () => {
    // duel-done گاردِ خودش را با شرطِ «نبردِ من» دارد — شکلِ دقیقِ هر پرونده قفل است
    const GUARDS: ReadonlyArray<readonly [string, string]> = [
      ["src/components/study/quiz/quiz-result.tsx", "if (imgBusy) return;"],
      ["src/components/study/reports/weekly-report.tsx", "if (imgBusy) return;"],
      ["src/components/study/reports/official-report.tsx", "if (imgBusy) return;"],
      ["src/components/study/duel/duel-setup.tsx", "if (imgBusy) return;"],
      ["src/components/study/duel/duel-done.tsx", "if (imgBusy || !mine) return;"],
      ["src/components/study/duel/rush-view.tsx", "if (imgBusy) return;"],
      ["src/components/study/duel/spell-rush-view.tsx", "if (imgBusy) return;"],
    ];
    for (const [f, guard] of GUARDS) {
      expect(p(f), f).toContain(guard);
    }
  });

  it("قراردادِ خانوادهٔ رویداد: هیج درگاهِ تصویری رویداد را بیگیت نمیآتشاند", () => {
    const official = p("src/components/study/reports/official-report.tsx");
    // درگاهِ دانلود: gated بر ok (درمانِ r397)
    expect(official).toContain('if (ok) trackEvent("official_image")');
    // درگاهِ همرسانی: gated بر blob (از r307)
    expect(official).toContain('trackEvent("official_image")');
    // الگویِ پیشساختِ کهنه منقرض است: setImgBusy(true) بیدرنگ trackEvent
    const extinct = execSync(
      `rg -U 'setImgBusy\\(true\\);\\s*\\n\\s*trackEvent' src/ || true`
    ).toString().trim();
    expect(extinct).toBe("");
    // هر رویدادِ تصویریِ باقیمانده در دوگانِ (ok / blob) است
    for (const [f, ev] of [
      ["src/components/study/duel/duel-setup.tsx", "duel_ledger_image"],
      ["src/components/study/duel/duel-done.tsx", "duel_image"],
      ["src/components/study/reports/weekly-report.tsx", "weekly_image"],
    ] as const) {
      const src = p(f);
      expect(src, f).toContain(`trackEvent("${ev}")`);
      expect(src, f).toContain("if (blob) {");
    }
  });

  it("مالک بیanalytics است (قاعدهٔ r344) — رویدادها مالِ درگاهها هستند", () => {
    const src = p("src/lib/result-image.ts");
    expect(src).not.toContain("trackEvent");
    expect(src).not.toContain("@/lib/analytics");
  });
});
