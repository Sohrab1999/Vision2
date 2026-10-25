// @vitest-environment jsdom
// ------------------------------------------------------------------
// r398 — مالکِ دامنهٔ دانلودِ فایل (file-download.ts): نقاشِ مشترکِ
// downloadCsvFile + مالکِ نامدارِ fileFailToast.
//
// سرشماریِ راند (نامزدِ ثبتشدهٔ r397 + کشفِ عمیقترِ همین راند):
//  · دُمِ دانلود (SSR guard + Blob(text/csv) + createObjectURL + anchor +
//    revoke(۱۰۰۰) + try/catch→false) در ۶ ماژولِ lib بایتبهبایت یکی بود
//    (progress ×۳ / coverage / teacher / class-ledger / learner-card /
//    pulse) — درسِ drawBadgeBand: منبعِ یگانه وقتی واقعی است که نقاشِ
//    مشترک امضا داشته باشد؛ نامِ پرونده و سازنده بهپارامتر آمدند.
//  · جفتِ شکستِ «خطا در ساخت فایل» در ۹ دروازهٔ نما بایتمسان بود — قفلِ
//    سرشماریِ r397 اینک از سندِ دستکپی به سندِ وامگیری ارتقا یافت.
//
// تصمیمهایِ حکم:
//  ① مالک در file-download.ts است — ماژولی که اینک خودِ مسیرِ شکست را
//     دارد (سازنده درونِ گارد میدود — هر پرتاب → false، همان قلمروِ try
//     کهنه، بایتبهبایت).
//  ② سندهای «نخیر»: anki-export دُمِ خودش را دارد (mimeِ TSV، بیگاردِ
//     SSR، revokeِ ۴۰۰۰، بازگشتِ count)؛ backup خانوادهٔ JSON است؛
//     CSV_BOM سهکپیِ ثبتشده (نامزد، نه مهاجرتِ این راند)؛ رویدادهایِ CSV
//     «قصدِ خروجی»اند (r351) — برخلافِ رویدادهایِ تصویریِ موفقیتگیت.
//  ③ هیچ رویدادِ تحلیلی در مالک (قاعدهٔ r344).
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, act } from "@testing-library/react";
import { useEffect } from "react";
import { downloadCsvFile, fileFailToast } from "@/lib/file-download";
import { useToast } from "@/hooks/use-toast";

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const TITLE = "خطا در ساخت فایل";
const DESC = "لطفاً دوباره تلاش کن.";

const SIX_TAIL_MODULES = [
  "src/lib/progress-csv.ts",
  "src/lib/coverage-csv.ts",
  "src/lib/teacher-csv.ts",
  "src/lib/teacher-class-ledger.ts",
  "src/lib/teacher-learner-csv.ts",
  "src/lib/pulse-csv.ts",
] as const;

const NINE_GATES: ReadonlyArray<readonly [string, number]> = [
  ["src/components/study/reports/weekly-report.tsx", 3],
  ["src/components/study/reports/official-report.tsx", 1],
  ["src/components/study/lesson/dictionary-view.tsx", 1],
  ["src/components/study/shared/pulse-dashboard.tsx", 1],
  ["src/components/study/teacher/teacher-detail.tsx", 1],
  ["src/components/study/teacher/teacher-view.tsx", 2],
];

const SUCCESS_DIALECTS: ReadonlyArray<readonly [string, string]> = [
  ["src/components/study/reports/weekly-report.tsx", "📊 جدول CSV ذخیره شد"],
  ["src/components/study/reports/weekly-report.tsx", "📈 روندِ ۴هفته‌ای ذخیره شد"],
  ["src/components/study/reports/weekly-report.tsx", "🗓 ماه‌نامهٔ خواندن ذخیره شد"],
  ["src/components/study/reports/official-report.tsx", "🧭 CSV پوشش ذخیره شد"],
  ["src/components/study/shared/pulse-dashboard.tsx", "📊 دفترِ سی‌روزهٔ نبض ذخیره شد"],
  ["src/components/study/teacher/teacher-view.tsx", "🎓 روزنامهٔ کلاس ذخیره شد"],
  ["src/components/study/teacher/teacher-view.tsx", "🎓 دفترِ کاملِ کلاس ذخیره شد"],
  ["src/components/study/teacher/teacher-detail.tsx", "ذخیره شد"],
  ["src/components/study/lesson/dictionary-view.tsx", "🃏 خروجی Anki آماده شد"],
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("r398 — رفتارِ واقعیِ مالک", () => {
  it("fileFailToast دقیقاً جفتِ خانواده را شلیک میکند (۳۰۰۰ms)", () => {
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
      fileFailToast();
    });
    expect(seen).toHaveLength(1);
    expect(seen[0].title).toBe(TITLE);
    expect(seen[0].description).toBe(DESC);
    expect(seen[0].duration).toBe(3000);
  });

  it("downloadCsvFile: مسیرِ سالم → true با نامِ پروندهٔ پارامتری + anchor واقعی + revokeِ ۱۰۰۰ms", () => {
    vi.useFakeTimers();
    const urls: string[] = [];
    const downloads: string[] = [];
    const clicked: number[] = [];
    const fakeUrl = "blob:mock-1";
    vi.stubGlobal("URL", Object.assign(Object.create(URL), {
      createObjectURL: vi.fn(() => fakeUrl),
      revokeObjectURL: vi.fn((u: string) => urls.push(u)),
    }));
    const origAppend = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, "appendChild").mockImplementation(((el: Node) => {
      if ((el as HTMLAnchorElement).download) {
        downloads.push((el as HTMLAnchorElement).download);
        (el as HTMLAnchorElement).click = () => clicked.push(1);
      }
      return origAppend(el);
    }) as typeof document.body.appendChild);
    try {
      const ok = downloadCsvFile(() => "a,b\n1,2", "vision2-test-x.csv");
      expect(ok).toBe(true);
      expect(downloads).toEqual(["vision2-test-x.csv"]);
      expect(clicked).toHaveLength(1);
      // revoke با تأخیر ۱۰۰۰ms برنامهریزی شده — تایمر جلو میرود تا زنده Witness شود
      vi.advanceTimersByTime(1000);
      expect(urls).toEqual([fakeUrl]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("downloadCsvFile: پرتابِ سازنده درونِ گارد است → false (قلمروِ tryِ کهنه، تمام)", () => {
    vi.stubGlobal("URL", Object.assign(Object.create(URL), {
      createObjectURL: vi.fn(() => { throw new TypeError("injected"); }),
      revokeObjectURL: vi.fn(),
    }));
    const ok = downloadCsvFile(() => { throw new Error("builder-boom"); }, "x.csv");
    expect(ok).toBe(false);
    // و پرتابِ createObjectURL هم همان مسیر است
    const ok2 = downloadCsvFile(() => "data", "x.csv");
    expect(ok2).toBe(false);
  });
});

describe("r398 — قفلهایِ منبعِ مالک", () => {
  it("مالک در file-download.ts است؛ جفت را یکبار حمل میکند و بیanalytics است", () => {
    const src = p("src/lib/file-download.ts");
    expect(src).toContain("export function downloadCsvFile(build: () => string, filename: string): boolean");
    expect(src).toContain("export function fileFailToast(): void");
    expect(src).toContain(`title: "${TITLE}"`);
    expect(src).toContain(`description: "${DESC}"`);
    expect(src).toContain("duration: 3000");
    expect(src).toContain('if (typeof document === "undefined") return false; // SSR guard');
    expect(src).toContain("setTimeout(() => URL.revokeObjectURL(url), 1000);");
    expect(src).not.toContain("trackEvent");
    expect(src).not.toContain("@/lib/analytics");
  });

  it("شش ماژولِ CSV دُمِ دستی ندارند — createObjectURL در src/lib فقط در مالک و سه سندِ «نخیر»", () => {
    for (const f of SIX_TAIL_MODULES) {
      const src = p(f);
      expect(src, f).toContain('downloadCsvFile(() => CSV_BOM +');
      expect(src, f).not.toContain("createObjectURL");
      expect(src, f).not.toContain("revokeObjectURL");
    }
    const hits = execSync(`rg -l 'createObjectURL' src/lib/ || true`).toString().trim().split("\n").filter(Boolean).sort();
    // مالک + anki-export (سندِ «نخیر»ِ TSV) + backup (خانوادهٔ JSON) + speak + result-image (خانوادههایِ خودشان)
    expect(hits).toEqual([
      "src/lib/anki-export.ts",
      "src/lib/backup.ts",
      "src/lib/file-download.ts",
      "src/lib/result-image.ts",
      "src/lib/speak.ts",
    ]);
  });

  it("نه دروازه از مالک وام میگیرند — شمارشِ دقیق، بی جفتِ دستی", () => {
    for (const [f, n] of NINE_GATES) {
      const src = p(f);
      const count = (src.match(/fileFailToast\(\)/g) ?? []).length;
      expect(count, f).toBe(n);
      expect(src, f).toContain('fileFailToast } from "@/lib/file-download"');
      expect(src, f).not.toContain(`title: "${TITLE}"`);
    }
  });

  it("سندهای «نخیر»: anki دُمِ خودش را نگه میدارد؛ گویشهایِ موفقیتِ هر نه دروازه زندهاند", () => {
    const anki = p("src/lib/anki-export.ts");
    expect(anki).toContain('type: "text/tab-separated-values;charset=utf-8"');
    expect(anki).toContain("setTimeout(() => URL.revokeObjectURL(url), 4000);");
    expect(anki).toContain("return count;");
    expect(anki).not.toContain("downloadCsvFile");
    for (const [f, title] of SUCCESS_DIALECTS) {
      expect(p(f), `${f} → ${title}`).toContain(title);
    }
    // رویدادهایِ CSV «قصدِ خروجی»اند — سندِ r351 پابرجا (پیش از تلاش)
    expect(p("src/components/study/shared/pulse-dashboard.tsx")).toMatch(/trackEvent\("pulse_csv"\);\s*\n\s*setCsvState\("loading"\)/);
  });
});
