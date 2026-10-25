// @vitest-environment jsdom
// ------------------------------------------------------------------
// r366 — سوییپِ سیستماتیکِ a11yِ دیالوگها (پیشنهادِ ④ِ r365).
//   رادیکس هنگامِ mountِ DialogContent اگر DialogTitle در سند نباشد
//   console.error میگوید — و distِ نصبشده این هشدار را از NODE_ENV
//   نمیگذراند (همان خطایِ تولیدیِ r353 که r365 در teacher-detail بست).
//   سوییپِ این راند نشان داد ۱۲ سطح از ۱۳ سالم‌اند و فقط گیتِ
//   {dialog && …} در متروی گرامر همان شکلِ نهفتهٔ r353 را دارد —
//   همین راند سخت شد (عنوانِ پنهانِ فازِ بیایستگاه) و سوییپ با سه لایه
//   به ماشینِ همیشگی تبدیل شد:
//   A) سوییپِ ایستایِ پویا — هر فایلی (با fs، آینده خودبهخود وارد میشود)
//      که <DialogContent دارد باید: DialogTitle را از ui/dialog
//      ایمپورت کند؛ به تعدادِ usageها <DialogTitle داشته باشد؛ و
//      توصیفش با <DialogDescription یا aria-describedby={undefined}
//      پوشیده باشد. رجیستریِ ۱۳فایلی هم موبهمو قفل است (تساویِ مجموعه —
//      فایلِ نو ناگزیر به ثبتِ آگاهانه میشود).
//   B) آزمونِ زندهٔ دیالوگِ ایستگاهِ مترو: mount ⇒ دقیقاً یک عنوانِ
//      دیدنی؛ بستن ⇒ یا محتوا رفته یا عنوانِ پنهانِ r366 تنها حاضر —
//      در هیچ لحظهای محتوای بیعنوان؛ کنسول رادیکس هرگز خطا نمیگوید.
//   C) قفلهایِ ساختاریِ grammar-view: شاخهٔ {!dialog} با sr-only پیش
//      از گیتِ {dialog}؛ هرگز دوتایی نمیشوند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));

import GrammarView from "@/components/study/grammar/grammar-view";
import { useStudy } from "@/lib/study-store";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const countOf = (src: string, needle: string) => src.split(needle).length - 1;

// ---------- A) سوییپِ ایستایِ پویا ----------

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// رجیستریِ سوییپِ r366 — ۱۳ فایلِ ۱۵ usageای. فایلِ نو = این فایل میشکند
// و نویسنده ناگزیر به آیدمِ سوییپ میشود: ایمپورتِ عنوان + پوششِ توصیف.
const DIALOG_REGISTRY: string[] = [
  "src/components/study/exam/exam-view.tsx",
  "src/components/study/grammar/grammar-view.tsx",
  "src/components/study/lesson/dictionary-view.tsx",
  "src/components/study/lesson/word-usage-dialog.tsx",
  "src/components/study/practice/danger-words.tsx",
  "src/components/study/practice/srs-panel.tsx",
  "src/components/study/reports/report-card.tsx",
  "src/components/study/shared/pulse-dashboard.tsx",
  "src/components/study/shell/command-palette.tsx",
  "src/components/study/shell/onboarding.tsx",
  "src/components/study/shell/pwa-layer.tsx",
  "src/components/study/shell/shortcut-guide.tsx",
  "src/components/study/teacher/teacher-detail.tsx",
];

const IMPORT_RE = /import\s*\{[^}]*\}\s*from\s*"@\/components\/ui\/dialog"/;

describe("dialog a11y sweep — dynamic (A)", () => {
  it("every <DialogContent file imports DialogTitle from ui/dialog", () => {
    const files = walk(join(ROOT, "src")).filter((p) =>
      readFileSync(p, "utf8").includes("<DialogContent"),
    );
    expect(files.length).toBeGreaterThan(0);
    for (const p of files) {
      const src = readFileSync(p, "utf8");
      expect(
        IMPORT_RE.test(src),
        `${p} باید DialogTitle را از @/components/ui/dialog ایمپورت کند`,
      ).toBe(true);
      expect(src).toMatch(/DialogTitle/);
    }
  });

  it("per-file: titles ≥ usages and descriptions covered (Description or aria-describedby=undefined)", () => {
    const files = walk(join(ROOT, "src")).filter((p) =>
      readFileSync(p, "utf8").includes("<DialogContent"),
    );
    for (const p of files) {
      const src = readFileSync(p, "utf8");
      const usages = countOf(src, "<DialogContent");
      const titles = countOf(src, "<DialogTitle");
      const described =
        countOf(src, "<DialogDescription") +
        countOf(src, "aria-describedby={undefined}");
      expect(
        titles,
        `${p}: هر DialogContent باید در همهٔ فازها DialogTitle داشته باشد (داشت: ${titles}، usage: ${usages})`,
      ).toBeGreaterThanOrEqual(usages);
      expect(
        described,
        `${p}: هر DialogContent باید DialogDescription یا aria-describedby={undefined} داشته باشد (داشت: ${described}، usage: ${usages})`,
      ).toBeGreaterThanOrEqual(usages);
    }
  });

  it("registry equality — the 13 known files, no more no less", () => {
    const files = walk(join(ROOT, "src"))
      .filter((p) => readFileSync(p, "utf8").includes("<DialogContent"))
      .map((p) => p.slice(ROOT.length + 1))
      .sort();
    expect(files).toEqual([...DIALOG_REGISTRY].sort());
  });

  it("15 usages across the registry — the sweep's own census", () => {
    const total = DIALOG_REGISTRY.reduce(
      (acc, p) => acc + countOf(read(p), "<DialogContent"),
      0,
    );
    expect(total).toBe(15);
  });
});

// ---------- B) آزمونِ زندهٔ دیالوگِ ایستگاهِ مترو ----------

class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

const RADIX_A11Y = /requires a `DialogTitle`|Missing `Description`/;

let errSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "grammar" },
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  cleanup();
});

afterEach(() => {
  errSpy.mockRestore();
  cleanup();
});

const radixCalls = () =>
  errSpy.mock.calls.filter((c) =>
    c.some((a) => typeof a === "string" && RADIX_A11Y.test(a)),
  );

describe("grammar station dialog — live a11y (B)", () => {
  it("mount ⇒ exactly one visible title; radix never complains", () => {
    render(<GrammarView />);
    const station = document.querySelector(
      'button[aria-label^="ایستگاه"]',
    ) as HTMLButtonElement | null;
    if (!station) throw new Error("station button not found");
    fireEvent.click(station);
    return waitFor(() =>
      expect(
        document.querySelector('[data-slot="dialog-content"]'),
      ).toBeTruthy(),
    ).then(() => {
      const titles = document.querySelectorAll('[data-slot="dialog-title"]');
      expect(titles.length).toBe(1);
      // عنوانِ دیدنیِ ایستگاه است، نه عنوانِ پنهانِ فازِ بیایستگاه
      expect(titles[0].className).not.toContain("sr-only");
      expect(titles[0].textContent!.length).toBeGreaterThan(0);
      expect(titles[0].textContent).not.toContain("ایستگاه گرامر");
      expect(radixCalls()).toEqual([]);
    });
  });

  it("closing ⇒ either content gone or the r366 sr-only title alone — never a titleless content", async () => {
    render(<GrammarView />);
    const station = document.querySelector(
      'button[aria-label^="ایستگاه"]',
    ) as HTMLButtonElement | null;
    if (!station) throw new Error("station button not found");
    fireEvent.click(station);
    await waitFor(() =>
      expect(
        document.querySelector('[data-slot="dialog-content"]'),
      ).toBeTruthy(),
    );
    const close = document.querySelector(
      '[data-slot="dialog-close"]',
    ) as HTMLButtonElement | null;
    if (!close) throw new Error("close button not found");
    fireEvent.click(close);
    await waitFor(() => {
      const contents = document.querySelectorAll(
        '[data-slot="dialog-content"]',
      );
      if (contents.length > 0) {
        // پنجرهٔ انیمیشنِ بستن — دقیقاً عنوانِ پنهانِ r366 حاضر است
        const titles = document.querySelectorAll('[data-slot="dialog-title"]');
        expect(titles.length).toBe(1);
        expect(titles[0].className).toContain("sr-only");
        expect(titles[0].textContent).toContain("ایستگاه گرامر");
      } else {
        expect(contents.length).toBe(0);
      }
    });
    expect(radixCalls()).toEqual([]);
  });
});

// ---------- C) قفلهایِ ساختاریِ grammar-view ----------

describe("grammar-view structural locks (C)", () => {
  const gv = read("src/components/study/grammar/grammar-view.tsx");

  it("one DialogContent, two DialogTitles — the hidden branch never doubles the visible one", () => {
    expect(countOf(gv, "<DialogContent")).toBe(1);
    expect(countOf(gv, "<DialogTitle")).toBe(2);
    expect(countOf(gv, 'className="sr-only"')).toBe(2); // عنوان + توصیفِ پنهان
  });

  it("the {!dialog} sr-only branch precedes the {dialog} gate", () => {
    const hiddenTitle = gv.indexOf(
      '<DialogTitle className="sr-only">ایستگاه گرامر</DialogTitle>',
    );
    const hiddenDesc = gv.indexOf('<DialogDescription className="sr-only">');
    const gate = gv.indexOf("{dialog && (");
    const guard = gv.indexOf("{!dialog && (");
    expect(hiddenTitle).toBeGreaterThan(-1);
    expect(hiddenDesc).toBeGreaterThan(-1);
    expect(gate).toBeGreaterThan(-1);
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(gate);
    expect(hiddenTitle).toBeGreaterThan(guard);
    expect(hiddenTitle).toBeLessThan(gate);
    expect(hiddenDesc).toBeGreaterThan(hiddenTitle);
    expect(hiddenDesc).toBeLessThan(gate);
  });
});
