// ---------------------------------------------------------------------
// r431 — «رنگِ حلقهٔ خانواده» — سرشماریِ ایستایِ جفتِ هندسه+رنگ و دزدِ
// هم-خاصیتی.
//
// پیشنهادِ ①ِ r430: پالسهایِ خانواده تا دیروز فقط با «هندسه» تبرئه
// شده بودند (r428/r429)؛ r430 ثابت کرد «هندسهٔ سالم، رنگِ مرده» ممکن
// است (دزدِ متغیرِ مشترکِ --tw-shadow). این سرشماری قرارداد را به
// صورتِ ایستا کامل میکند:
//   ① جفتِ رنگ: هر رشتهٔ پالس هم «حاملِ رنگِ روشن» (shadow-emerald-300)
//     و هم «قصهٔ رنگِ شب» (dark:shadow-emerald-700/600 یا کرنلِ
//     اسکوپشدهٔ wf-row-pulse) را دارد — هندسهٔ بیرنگ = حلقهٔ مرده
//   ② دزدِ هم-خاصیتی: رشتهٔ پالس هرگز shadow-sm را حمل نمیکند و در
//     «قالبِ دربردارندهٔ» آن هم هیچ shadow-smِ برهنه (غیرِ hover:)
//     حقِ همسایگی با پالس ندارد — قراردادِ «جایگزین، نه اضافه»ٔ r430
//     به کلِ خانواده میرسد
//   ③ کشفِ این راند — دزدِ هم-خاصیتیِ bg: سطرِ خانواده هنگام پالس زبرا
//     (bg-white/bg-stone-50) را حمل میکرد؛ در CSSِ کامپایلشده هر دو
//     «پسِ» bg-emerald-50 میآیند و با همسطحی، زبرا برنده بود — پالسِ
//     روشنِ زمردی زیرِ زبرا دفن بود. ترمیم: زبرا به شاخهٔ بی‌پالس
//     رفت (ساختارِ «جایگزین» قفل میشود) — و ششمیں پالسِ پرش (سطرِ
//     مثالِ r431) با هستهٔ کاملِ خانواده وارد میشود.
// ---------------------------------------------------------------------
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC_COMPONENTS = join(ROOT, "src", "components");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(full);
  }
  return acc;
}

interface PulseHit {
  file: string;
  literal: string;
  index: number;
  source: string;
}

function pulseHits(source: string): { literal: string; index: number }[] {
  const out: { literal: string; index: number }[] = [];
  const re = /["'`]([^"'`\n]*shadow-emerald-300[^"'`\n]*)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) out.push({ literal: m[1], index: m.index });
  return out;
}

/** قالبِ دربردارندهٔ literal — نزدیکترین جفتِ بکتیک دورِ آن. اگر در فاصلهٔ
 * معقولی قالبی نبود، خودِ literal (قراردادِ محتاط — رشتهٔ بیقالب). */
function enclosingTemplate(source: string, litIndex: number, litLen: number): string {
  const open = source.lastIndexOf("`", litIndex);
  const close = source.indexOf("`", litIndex + litLen);
  if (open === -1 || close === -1 || litIndex - open > 4000 || close - litIndex > 4000) {
    return source.slice(litIndex, litIndex + litLen);
  }
  return source.slice(open, close + 1);
}

const JUMP_PULSE_FILES = [
  "src/components/study/lesson/irregular-verbs-table.tsx", // r234 — سطرِ فعل
  "src/components/study/lesson/phonetics-table.tsx", // r235 — کارتِ واک
  "src/components/study/lesson/abbreviations-table.tsx", // r235 — کارتِ نشانه
  "src/components/study/lesson/vocab-tab.tsx", // r427 — کارتِ واژه
  "src/components/study/lesson/dictionary-view.tsx", // r430 — کارتِ واژهٔ دیکشنری
  "src/components/study/lesson/booklet-grammar-view.tsx", // r431 — سطرِ مثالِ درسنامه
] as const;

describe("r431 — سرشماریِ رنگِ حلقه (جفتِ هندسه+رنگ + دزدِ هم-خاصیتی)", () => {
  const files = walk(SRC_COMPONENTS);
  const found: PulseHit[] = [];
  for (const f of files) {
    const source = readFileSync(f, "utf8");
    for (const { literal, index } of pulseHits(source)) {
      found.push({ file: f.slice(ROOT.length + 1), literal, index, source });
    }
  }

  it("سطحِ سرشماری: دستکم هشت رشتهٔ پالس زندهاند (شش پرش + سطرِ خانواده + srs-panel)", () => {
    expect(found.length).toBeGreaterThanOrEqual(8);
  });

  it("جفتِ رنگ برایِ هر پالس: رنگِ روشنِ emerald-300 + قصهٔ رنگِ شب (هندسهٔ بیرنگ = حلقهٔ مرده)", () => {
    const sins: string[] = [];
    for (const { file, literal } of found) {
      if (!literal.includes("shadow-emerald-300")) {
        sins.push(`${file}: حاملِ رنگِ روشنِ emerald-300 نیست`);
      }
      const nightRing = /dark:shadow-emerald-(700|600)\b/.test(literal);
      const kernel = literal.includes("wf-row-pulse");
      if (!nightRing && !kernel) {
        sins.push(`${file}: قصهٔ رنگِ شب غایب — نه dark:shadow-emerald-700/600 و نه کرنلِ اسکوپشده — ${literal.slice(0, 60)}`);
      }
    }
    expect(sins, sins.join("\n")).toEqual([]);
  });

  it("دزدِ هم-خاصیتیِ سایه: رشتهٔ پالس هرگز shadow-sm ندارد و در «باقیماندهٔ ایستای» قالبِ دربردارندهاش (خارجِ شاخههایِ انحصاری) shadow-smِ برهنه ممنوع است", () => {
    const sins: string[] = [];
    for (const { file, literal, index, source } of found) {
      if (literal.includes("shadow-sm")) {
        sins.push(`${file}: تلهٔ r430 در رشتهٔ پالس — shadow-sm دزدِ --tw-shadow است`);
      }
      const template = enclosingTemplate(source, index, literal.length + 2);
      // شاخههایِ سهتایی mutually-exclusiveاند — فقط «باقیماندهٔ ایستای» قالب
      // (پیشوند/پسوندِ همیشه-اعمالشده) با پالس همزمان روشن میشود؛ همان
      // شکلِ کهنهٔ r430 («... shadow-sm ${pulse ? …}») که حلقه را میکشت.
      // shadow-smِ درونِ شاخهٔ غیرپالس (srs-panel) انحصاری است و مجاز.
      const residual = template.replace(/\$\{[^}]*\}/g, ";");
      const re = /shadow-sm/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(residual)) !== null) {
        if (residual.slice(Math.max(0, m.index - 6), m.index) !== "hover:") {
          sins.push(`${file}: shadow-smِ برهنه در باقیماندهٔ ایستایِ قالبِ همسایهٔ پالس — همزمان با پالس اعمال میشود (قراردادِ «جایگزین، نه اضافه»ٔ r430)`);
          break;
        }
      }
    }
    expect(sins, sins.join("\n")).toEqual([]);
  });

  it("شش پالسِ پرش: هستهٔ کاملِ خانوادهٔ r234 (زمردیِ روشن + شبِ emerald-900/30 + حلقهٔ شبِ emerald-700)", () => {
    const jumpPulses = found.filter((f) =>
      (JUMP_PULSE_FILES as readonly string[]).includes(f.file),
    );
    expect(jumpPulses.map((j) => j.file).sort()).toEqual([...JUMP_PULSE_FILES].sort());
    for (const { file, literal } of jumpPulses) {
      expect(literal, file).toContain("bg-emerald-50");
      expect(literal, file).toContain("dark:bg-emerald-900/30");
      expect(literal, file).toContain("dark:shadow-emerald-700");
    }
  });

  it("ساختارِ «جایگزین» رویِ زبرایِ سطرِ خانواده (کشفِ این راند): زبرا در شاخهٔ بی‌پالس است نه همسایهٔ پالس", () => {
    const src = readFileSync(
      join(ROOT, "src", "components", "study", "lesson", "word-family-table-card.tsx"),
      "utf8",
    );
    // شکلِ کهنهٔ ممنوع — زبرا پیشِ ternaryِ پالس (هم-خاصیتیِ همزمان)
    expect(src).not.toMatch(/bg-stone-50"\}\$\{/);
    // شکلِ نو — ternaryِ پالس مالکِ کلِ پسزمینه است و زبرا فقط در شاخهٔ بی‌پالس
    expect(src).toMatch(/isPulseRow[\s\S]{0,400}?fi % 2 === 0\s*\?\s*"bg-white"\s*:\s*"bg-stone-50"/);
  });

  it("سطرِ مثالِ r431: شناسهٔ پایدار + دادهٔ واقعی + قراردادِ جایگزینیِ ظاهرِ ساکت", () => {
    const src = readFileSync(
      join(ROOT, "src", "components", "study", "lesson", "booklet-grammar-view.tsx"),
      "utf8",
    );
    expect(src).toContain("bg-ex-${topic.id}-${ei}"); // شناسهٔ پایدارِ اسکرولِ عمیق
    expect(src).toContain("data-bg-example"); // هویتِ داده‌محورِ سطر
    // ظاهرِ ساکتِ سطر در شاخهٔ بی‌پالس میماند — پالس جایگزینش میشود نه اضافه
    expect(src).toContain(': "flex items-start justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800/70"');
  });
});
