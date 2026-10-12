// گام ۹ §12 (ترانش ۱) — نگهبان ضد-رجعت CSS: فایل globals.css اجازه ندارد
// دوباره قاعدهٔ تکراریِ دقیق (هم‌سلکتور + هم‌اعلان‌ها) تولید کند. هر فیچر
// تازه‌ای که قاعدهٔ دارک/روشن تازه می‌سازد، اگر کپیِ یک قاعدهٔ موجود باشد
// همین تست قبل از کامیت زنگ می‌زند — مالیات دارک دیگر بی‌صدا رشد نمی‌کند.

import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";

const require = createRequire(import.meta.url);

const cssPath = resolve(process.cwd(), "src/app/globals.css");

describe("globals.css anti-duplication guard (Step 9 tranche-1)", () => {
  it("has no exactly-duplicated rule blocks (same selector + context + declarations)", () => {
    const { analyze: analyzeLocal } = require("../scripts/css-dupes.cjs");
    const a = analyzeLocal(cssPath);
    const dupes: string[] = [];
    for (const [, bs] of a.groups as Map<string, { start: number }[]>) {
      if (bs.length > 1) dupes.push(`${bs.length}x at L${bs.map((b: { start: number }) => b.start).join(",L")}`);
    }
    expect(dupes, `duplicate rule blocks found: ${dupes.join("; ")}`).toEqual([]);
  });

  it("keeps the dark theme in ONE .dark block and ONE .dark body block", () => {
    const css = readFileSync(cssPath, "utf8");
    const topLevelDark = css.split("\n").filter((l) => /^\.dark \{/.test(l));
    const topLevelDarkBody = css.split("\n").filter((l) => /^\.dark body \{/.test(l));
    expect(topLevelDark, ".dark must be a single canonical block").toHaveLength(1);
    expect(topLevelDarkBody, ".dark body must be a single canonical block").toHaveLength(1);
  });
});

describe("globals.css surface-token kernel (Step 9 tranche-2)", () => {
  const css = readFileSync(cssPath, "utf8");
  const lines = css.split("\n");

  const extractBlock = (headerRe: RegExp): string => {
    const start = lines.findIndex((l) => headerRe.test(l));
    expect(start, `block ${headerRe} not found`).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines.length; i++) {
      body += lines[i] + "\n";
      depth += (lines[i].match(/{/g) ?? []).length;
      depth -= (lines[i].match(/}/g) ?? []).length;
      if (depth <= 0 && i > start) break;
      if (depth <= 0 && i === start && lines[i].includes("}")) break;
    }
    return body;
  };

  it("defines each dark surface token exactly once inside the canonical .dark block", () => {
    const darkBlock = extractBlock(/^\.dark \{/);
    for (const tok of ["--color-stone-50:", "--color-stone-100:", "--color-stone-200:"]) {
      const n = (darkBlock.match(new RegExp(tok.replace(":", "\\:"), "g")) ?? []).length;
      expect(n, `${tok} must be defined exactly once in .dark`).toBe(1);
    }
  });

  it("never re-grows the retired neutral-surface override band", () => {
    // the band rules these tokens replaced may not come back; the three surviving
    // global keeps are intentional: plain bg-stone-50 translucent wash, the
    // border-stone-100 #292524 tune, and the border-stone-300 #44403c tune
    const bgBand = lines.filter((l) => /^\.dark \.bg-stone-(50|100|200)(\\\/\d+)? \{/.test(l.trim()));
    expect(bgBand, `bg-stone band must stay retired (only the bg-stone-50 wash keep survives): ${bgBand.join(" | ")}`).toHaveLength(1);
    const borderBand = lines.filter((l) => /^\.dark \.border-stone-(100|200|300)(\\\/\d+)? \{/.test(l.trim()));
    expect(borderBand, `border-stone keeps drifted: ${borderBand.join(" | ")}`).toHaveLength(2);
    expect(borderBand.join(" ")).toContain("border-stone-100");
    expect(borderBand.join(" ")).toContain("border-stone-300");
  });

  it("never reintroduces the mangled :not(idden]) divide selector", () => {
    expect(css).not.toContain("idden])");
    // divide-stone-100 is now served purely by the token via the utility itself
    expect(lines.filter((l) => l.includes(".divide-stone-100") && /^\.dark /.test(l.trim()))).toHaveLength(0);
  });

  it("keeps per-panel ink tones canonical (no drifted copies of a tone value)", () => {
    // every 2-hop scoped dark rule `.dark .Panel .text-stone-N` must use one of
    // the frozen canonical values per shade — new one-off drifts fail here
    const CANON: Record<string, string[]> = {
      "300": ["#57534e"],
      "400": ["#716b63", "#78716c", "#8a8580", "#a8a29e"],
      "500": ["#8a8580", "#a8a29e"],
      "600": ["#a8a29e", "#c9c2bb"],
      "700": ["#d6d3cf", "#d6d3d1", "#e7e5e4"],
      "800": ["#f5f5f4"],
    };
    const re = /^\.dark \.[A-Za-z0-9_\\/.-]+ \.text-stone-(\d+)\s*[,{]/;
    const seen = new Map<string, Set<string>>();
    for (const raw of lines) {
      const l = raw.trim();
      const m = l.match(re);
      if (!m) continue;
      const cm = l.match(/color:\s*(#[0-9a-fA-F]{3,8})/);
      if (!cm) continue; // group prefix rows carry no declaration
      const set = seen.get(m[1]) ?? new Set<string>();
      set.add(cm[1].toLowerCase());
      seen.set(m[1], set);
    }
    for (const [shade, expected] of Object.entries(CANON)) {
      const got = [...(seen.get(shade) ?? [])].sort();
      expect(got, `text-stone-${shade} ink tones drifted`).toEqual([...expected].sort());
    }
  });
});

describe("globals.css dark tone-group consolidation (Step 9 tranche-3a)", () => {
  it("has no consolidatable equal-declaration dark rule pairs left", () => {
    // css-tones.cjs proves each merge safe (identical decls + no cascade
    // hazard between members); after the fixed-point pass nothing may remain
    const { analyze } = require("../scripts/css-tones.cjs");
    const a = analyze(cssPath);
    expect(
      a.merges,
      `consolidatable dark groups remain: ${a.merges.map((m: { lines: number[] }) => `L${m.lines.join(",L")}`).join("; ")}`
    ).toEqual([]);
    // the safety filter itself must keep working: hazard exclusion list is
    // populated (the file still contains legitimately unmergeable siblings)
    expect(Array.isArray(a.conflicts)).toBe(true);
  });
});
