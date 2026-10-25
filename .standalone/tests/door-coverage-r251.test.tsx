// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۵۱ — بندِ ② پیشنهادِ ۲۴۹: جدولِ «پوششِ درها» در راهنما
//
// راند ۲۵۰ خانوادهٔ resumeDoor را با ده عضو کامل کرد؛ این راند نقشهٔ
// آن پوشش به خودِ یادگیرنده می‌رسد: کارتِ راهنما حالا از
// RESUME_DOOR_COVERAGE (تک‌منبعِ حقیقتِ src/lib/resume-door-coverage.ts)
// رندر می‌شود — محلِ نو به خانواده اضافه شود، کارت خودش تازه می‌شود
// (ایدئومِ «فهرستِ زنده»ِ resume-loop-doors).
//
// گاردهایِ این فایل:
//   ① قفلِ منبع: کارتِ راهنما از RESUME_DOOR_COVERAGE.map رندر می‌کند —
//     هیچ فهرستِ دستیِ دومی که از حقیقت عقب بماند.
//   ② قفلِ داده ↔ درخت: هر entryِ داده باید فایلِ واقعیِ opt-in داشته
//     باشد و اسکنِ پویایِ کلِ درخت باید با مجموعهٔ داده یکی باشد —
//     عضوِ ناشناس و عضوِ غایب هر دو بی‌درنگ می‌شکنند.
//   ③ یکتایی: id و label و file در داده تکرارپذیر نیستند.
//   ④ سطحِ کامپوننت: راهنمایِ بازشده بخشِ پوشش را با دقیقاً ده ردیف،
//     شمارشِ faNum در تیتر و پانویسِ صداقتِ nav-resume نشان می‌دهد.
//   ⑤ صداقتِ ساختاری: ردیف‌هایِ پوشش «لی» اطلاعاتی‌اند نه دکمه — کنش‌ها
//     در بخشِ درهاست؛ این نقشهٔ «کجاها» است.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { RESUME_DOOR_COVERAGE } from "@/lib/resume-door-coverage";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const ROOT = join(process.cwd(), "src/components/study");
const STUDY_TREE = join(process.cwd(), "src/components/study");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

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
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("جدولِ «پوششِ درها» — r251 ②", () => {
  it("① قفلِ منبع: کارتِ راهنما از تک‌منبعِ رندر می‌کند، نه فهرستِ دستی", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/shell/shortcut-guide.tsx"),
      "utf8"
    );
    expect(src).toContain("RESUME_DOOR_COVERAGE.map");
    // شمارش در تیتر از خودِ داده می‌آید — هیچ «۱۰» دستیِ فارسی یا لاتین
    expect(src).toContain("faNum(RESUME_DOOR_COVERAGE.length)");
    expect(src).not.toMatch(/پوششِ\s*(۱۰|10)گانه/);
  });

  it("② قفلِ داده ↔ درخت: هر entry فایلِ واقعیِ opt-in دارد و اسکنِ درخت = داده", () => {
    for (const c of RESUME_DOOR_COVERAGE) {
      const p = join(ROOT, c.file);
      expect(existsSync(p), c.file).toBe(true);
      expect(readFileSync(p, "utf8"), c.file).toMatch(/^\s*resumeDoor\s*$/m);
    }
    const found = walk(STUDY_TREE)
      .filter((p) => /^\s*resumeDoor\s*$/m.test(readFileSync(p, "utf8")))
      .map((p) => p.replace(/\\/g, "/"))
      .sort();
    const declared = RESUME_DOOR_COVERAGE.map((c) =>
      join(ROOT, c.file).replace(/\\/g, "/")
    ).sort();
    expect(found).toEqual(declared);
  });

  it("③ یکتایی: id و label و file تکرارپذیر نیستند", () => {
    const ids = RESUME_DOOR_COVERAGE.map((c) => c.id);
    const labels = RESUME_DOOR_COVERAGE.map((c) => c.label);
    const files = RESUME_DOOR_COVERAGE.map((c) => c.file);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(files).size).toBe(files.length);
  });

  it("④ سطحِ کامپوننت: ده ردیفِ پوشش + شمارشِ faNum در تیتر + پانویسِ صداقت", () => {
    render(<ShortcutGuide />);
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    const section = screen.getByTestId("shortcut-guide-coverage");
    // دقیقاً ده ردیف — به اندازهٔ داده
    const rows = RESUME_DOOR_COVERAGE.map((c) =>
      screen.getByTestId(`coverage-${c.id}`)
    );
    expect(rows).toHaveLength(10);
    // تیتر شمارشِ فارسی‌شدهٔ داده را دارد
    expect(section).toHaveTextContent("پوششِ ۱۰گانه");
    // دو نمونهٔ معرف از زبانِ خودِ اپ — از داده آمده نه دستی
    expect(screen.getByTestId("coverage-grammar")).toHaveTextContent("متروی گرامر");
    expect(screen.getByTestId("coverage-my-words")).toHaveTextContent("مرورِ واژه‌های نشان‌شده");
    // پانویسِ صداقتِ nav-resume — بی‌رکورد، هیچ
    expect(section).toHaveTextContent("بی‌رکورد، هیچ");
  });

  it("⑤ صداقتِ ساختاری: ردیف‌هایِ پوشش اطلاعاتی‌اند — هیچ دکمهٔ رقیبِ بخشِ درها", () => {
    render(<ShortcutGuide />);
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    const section = screen.getByTestId("shortcut-guide-coverage");
    // درونِ بخشِ پوشش هیچ buttonی نیست — نقشه است، کنش در بخشِ درهاست
    expect(section.querySelectorAll("button")).toHaveLength(0);
    // و بخشِ درها همچنان دکمه‌هایِ واقعیِ خودش را دارد
    const doors = screen.getByTestId("shortcut-guide-resume-loop");
    expect(doors.querySelectorAll("button").length).toBeGreaterThan(0);
  });
});
