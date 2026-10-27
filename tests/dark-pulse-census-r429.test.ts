/**
 * r429 — «سوءظنِ نظاممندِ شب» — سرشماریِ ایستایِ پالسهایِ زمردی.
 *
 * درسِ r428: ریمپِ سراسریِ `.dark .bg-white` (بیرونِ لایه) از هر utilityِ
 * شبِ لایهای بالاتر است — سطرِ خانواده قربانیِ زندهاش شد (bg خوانده شد
 * rgb(28,25,23) نه emerald-900/30) و کرنلِ شبش به globals اسکوپشده رفت.
 * این راند همان سوءظن را نظاممند میکند: **هر** رشتهٔ پالسِ زمردی
 * (literal حاویِ shadow-emerald-300) در کلِ src باید قراردادِ شب را داشته باشد:
 *   ① هندسهٔ حلقهٔ درونی (shadow-[inset_0_0_0_2px]) حاضر است
 *   ② bg-white در رشتهٔ پالس نیست (تلهٔ r428 — پالسی که bg-white را نگه
 *      دارد در شب زیرِ ریمپِ سراسری دفن میشود)
 *   ③ قصهٔ شب: یا dark:shadow-* در خودِ رشته (کرنلِ utility — خانوادهٔ
 *      r234 با dark:shadow-emerald-700، حلقهٔ انتخابِ srs-panel با
 *      dark:shadow-emerald-600) یا نشانگرِ کرنلِ اسکوپشدهٔ globals
 *      (wf-row-pulse — رندِ r428)
 * و شش پالسِ پرشِ مشخص (سطرِ فعل r234 / کارتِ واک r235 / کارتِ نشانه r235 /
 * کارتِ واژهٔ r427 / کارتِ واژهٔ دیکشنری r430 / سطرِ مثالِ درسنامه r431) علاوه بر آن باید 
 * dark:bg-emerald-900/30 + dark:shadow-emerald-700 (هستهٔ شبِ خانوادهٔ r234) 
 * را داشته باشند.
 * سطحِ globals هم زیرِ نظر است: هیچ ریمپِ «اسکوپنشدهٔ» .dark .bg-emerald-50
 * حق ندارد بالا بیاید — و دشمنِ مستند (.dark .bg-white) حاضر میماند تا
 * دلیلِ زیستنِ این سرشماری فراموش نشود.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC_COMPONENTS = join(ROOT, "src", "components");
const GLOBALS = join(ROOT, "src", "app", "globals.css");

// بازگشتیِ سبک — فقط فایلهایِ متنیِ tsx/ts
function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(full);
  }
  return acc;
}

/** رشتههایِ literal تک/دوقلو که shadow-emerald-300 درونشان زندگی میکند */
function pulseLiterals(source: string): string[] {
  const out: string[] = [];
  const re = /["'`]([^"'`\n]*shadow-emerald-300[^"'`\n]*)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.push(m[1]);
  return out;
}

// نشانگرهایِ مشروعِ قصهٔ شب
const GLOBALS_KERNEL_MARKERS = ["wf-row-pulse"]; // کرنلِ اسکوپشده در globals (.dark tr.wf-row-pulse)

const JUMP_PULSE_FILES = [
  "src/components/study/lesson/irregular-verbs-table.tsx", // r234 — سطرِ فعل
  "src/components/study/lesson/phonetics-table.tsx", // r235 — کارتِ واک
  "src/components/study/lesson/abbreviations-table.tsx", // r235 — کارتِ نشانه
  "src/components/study/lesson/vocab-tab.tsx", // r427 — کارتِ واژه
  "src/components/study/lesson/dictionary-view.tsx", // r430 — کارتِ واژهٔ دیکشنری
  "src/components/study/lesson/booklet-grammar-view.tsx", // r431 — سطرِ مثالِ درسنامه (آخرین لنگرِ بیپالسِ خانواده زمردی شد)
] as const;

describe("r429 — سرشماریِ ایستایِ پالسهایِ زمردی (سوءظنِ نظاممندِ شب)", () => {
  const files = walk(SRC_COMPONENTS);
  const found: { file: string; literal: string }[] = [];
  for (const f of files) {
    for (const literal of pulseLiterals(readFileSync(f, "utf8"))) {
      found.push({ file: f.slice(ROOT.length + 1), literal });
    }
  }

  it("سطحِ سرشماری: دستکم هشت رشتهٔ پالسِ شناختهشده زندهاند (شش پرش + wf-row + srs-panel)", () => {
    expect(found.length).toBeGreaterThanOrEqual(8);
  });

  it("قراردادِ شب برایِ هر پالسِ زمردی: حلقهٔ درونی + بیِ bg-white + قصهٔ شب", () => {
    const sins: string[] = [];
    for (const { file, literal } of found) {
      if (!literal.includes("shadow-[inset_0_0_0_2px]")) {
        sins.push(`${file}: حلقهٔ درونی غایب — ${literal.slice(0, 60)}`);
      }
      if (literal.includes("bg-white")) {
        sins.push(`${file}: تلهٔ r428 — bg-white در رشتهٔ پالس (ریمپِ سراسریِ شب آن را دفن میکند)`);
      }
      const utilityNight = /dark:shadow-[a-z0-9/-]+/.test(literal);
      const scopedKernel = GLOBALS_KERNEL_MARKERS.some((mk) => literal.includes(mk));
      if (!utilityNight && !scopedKernel) {
        sins.push(`${file}: قصهٔ شب غایب — نه dark:shadow-* و نه نشانگرِ کرنلِ اسکوپشده — ${literal.slice(0, 60)}`);
      }
    }
    expect(sins, sins.join("\n")).toEqual([]);
  });

  it("شش پالسِ پرش: هستهٔ شبِ خانوادهٔ r234 (dark:bg-emerald-900/30 + dark:shadow-emerald-700)", () => {
    const jumpPulses = found.filter((f) =>
      (JUMP_PULSE_FILES as readonly string[]).includes(f.file),
    );
    // هر فایلِ پرش دقیقاً یک رشتهٔ پالس دارد
    expect(jumpPulses.map((j) => j.file).sort()).toEqual([...JUMP_PULSE_FILES].sort());
    for (const { file, literal } of jumpPulses) {
      expect(literal, file).toContain("bg-emerald-50");
      expect(literal, file).toContain("dark:bg-emerald-900/30");
      expect(literal, file).toContain("dark:shadow-emerald-700");
    }
  });

  it("سطحِ globals: هیچ ریمپِ اسکوپنشدهِٔ solidِ .dark .bg-emerald-50 حقِ حیات ندارد", () => {
    const css = readFileSync(GLOBALS, "utf8");
    const unscoped = css
      .split("\n")
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      // فقط solid — خانوادهٔ آلفایِ مستندِ bg-emerald-50/40../70 (ریمپهایِ ۴۴۷–۴۵۰)
      // پالسِ زمردیِ جامد را نمیدزند و از حکمِ سرشماری خارج است.
      .filter(({ line }) => /^\.dark \.bg-emerald-50(?![\\\/\d])/.test(line));
    expect(
      unscoped,
      `ریمپِ بیاسکوپ یافت شد: ${JSON.stringify(unscoped)} — هر ریمپِ bg-emerald-50 باید به کامپوننتِ خودش اسکوپ شود (r334/r338)`,
    ).toEqual([]);
  });

  it("دشمنِ مستند حاضر میماند: .dark .bg-white در globals زنده است — دلیلِ زیستنِ این سرشماری", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).toContain(".dark .bg-white { background-color: #1c1917; }");
  });

  it("کرنلِ اسکوپشدهٔ wf-row-pulse در globals زنده است (رندِ r428 — تنها پالسِ با کرنلِ globals)", () => {
    const css = readFileSync(GLOBALS, "utf8");
    expect(css).toContain(".dark tr.wf-row-pulse {");
    expect(css).toContain("rgba(6, 78, 59, 0.3)");
    expect(css).toContain("inset 0 0 0 2px rgb(4, 120, 87)");
  });

  it("کرنلِ اسکوپشدهٔ پالسِ srs-panel — قراردادِ «جایگزین، نه اضافه» (رندِ r430 — شاهدِ زنده حلقهٔ مرده را گرفت)", () => {
    const src = readFileSync(join(ROOT, "src", "components", "study", "practice", "srs-panel.tsx"), "utf8");
    const css = readFileSync(GLOBALS, "utf8");
    // دشمنِ دوگانهٔ مستند: (۱) ریمپِ سراسریِ .dark .shadow-sm در globals
    // (بیرونِ لایه — box-shadow را مستقیم بازنویسی میکند)؛ (۲) خودِ
    // .shadow-sm که در CSSِ کامپایلشده پسِ shadow-[inset…] میآید و
    // متغیرِ مشترکِ --tw-shadow را میدزدد — حلقهٔ spotlit در هر دو
    // نمای مرده بود (شاهدِ زندهٔ r430: spotlit:true ولی سایهٔ بیحلقه).
    expect(css).toContain(".dark .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.4); }");
    // درمان: پنلِ پالس‌دار هرگز shadow-sm را همزمان حمل نمیکند —
    // shadow-sm فقط در شاخهٔ بی‌پالسِ سهتایی است (جایگزین، نه اضافه).
    expect(src).toContain('? "shadow-[inset_0_0_0_2px] shadow-emerald-300 dark:shadow-emerald-600"');
    expect(src).toContain(': "shadow-sm"');
    expect(src).not.toMatch(/to-emerald-50\/60 shadow-sm/); // رشتهٔ پایه پاک است
  });
});
