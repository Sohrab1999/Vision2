// گام ۹ §12 (ترانش ۱) — نگهبان ضد-رجعت CSS: فایل globals.css اجازه ندارد
// دوباره قاعدهٔ تکراریِ دقیق (هم‌سلکتور + هم‌اعلان‌ها) تولید کند. هر فیچر
// تازه‌ای که قاعدهٔ دارک/روشن تازه می‌سازد، اگر کپیِ یک قاعدهٔ موجود باشد
// همین تست قبل از کامیت زنگ می‌زند — مالیات دارک دیگر بی‌صدا رشد نمی‌کند.

import { createRequire } from "module";
import { readFileSync, readdirSync } from "fs";
import { resolve, join } from "path";
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
    const bgBand = lines.filter((l) => /^\.dark \.bg-stone-(50|100|200)(\\\/\d+)?[,{ ]/.test(l.trim()));
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
      // r328: kernel 500 روشنتر شد (#9c958c — خانوادهٔ مرزیِ تینتِ تاریک ≥۵٫۰)
      // و پینِ کاغذِ رسمی #78716c آمد (کاغذِ همیشهروشن نباید جوهرِ تاریکِ
      // کرنل را بگیرد — رتبهٔ ۰-۳-۰ رویِ ۰-۲-۰)
      "500": ["#78716c", "#9c958c", "#a8a29e"],
      // r328: پینِ کاغذ برایِ 600 هم (#57534e — سلولهایِ «—» رویِ زبرا ۶٫۹۹)
      "600": ["#57534e", "#a8a29e", "#c9c2bb"],
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

describe("globals.css tinted-ink token kernel (Step 9 tranche-3b)", () => {
  const css = readFileSync(cssPath, "utf8");
  const lines = css.split("\n");

  // گام ۹-۳ب — توکن‌های جوهرِ رنگین: هر سایه فقط یک‌بار داخل بلوک .dark
  // کانونی تعریف می‌شود؛ قواعد per-context بازنشسته هرگز برنمی‌گردند.
  const KERNEL: Record<string, string> = {
    "amber-800": "#fcd34d",
    "amber-900": "#fcd34d",
    "rose-900": "#fda4af",
    "sky-600": "#38bdf8",
    "sky-700": "#7dd3fc",
    "sky-800": "#7dd3fc",
    "orange-700": "#fdba74",
    "orange-800": "#fdba74",
    "violet-800": "#f5d0fe",
    "slate-500": "#a8a29e",
  };

  it("defines each tinted-ink token exactly once, inside the canonical .dark block", () => {
    const darkStart = lines.findIndex((l) => /^\.dark \{/.test(l));
    const darkEnd = lines.indexOf("}", darkStart);
    expect(darkStart).toBeGreaterThanOrEqual(0);
    for (const [shade, val] of Object.entries(KERNEL)) {
      const decls = lines.filter((l) => l.includes(`--color-${shade}:`));
      expect(decls, `--color-${shade} defined more than once`).toHaveLength(1);
      expect(decls[0]).toContain(val);
      const idx = lines.findIndex((l) => l.includes(`--color-${shade}:`));
      expect(idx, `--color-${shade} must live inside .dark block`).toBeGreaterThan(darkStart);
      expect(idx).toBeLessThan(darkEnd);
    }
  });

  it("never re-grows the retired per-context tinted-ink override band", () => {
    // the token serves these shades — a .dark rule that re-asserts the SAME
    // color on a text-<shade> utility is dead weight and must not return
    // (rules with a DIFFERENT value remain legitimate scoped deviations)
    for (const [shade, val] of Object.entries(KERNEL)) {
      const bad = lines.filter((l) => {
        const t = l.trim();
        if (!t.startsWith(".dark ")) return false;
        if (!t.includes(`text-${shade}`) && !t.includes(`hover\\:text-${shade}`)) return false;
        return new RegExp(`color:\\s*${val.replace("#", "#")}`).test(t);
      });
      expect(bad, `retired rules for text-${shade} returned: ${bad.join(" | ")}`).toEqual([]);
    }
  });

  it("keeps the selector budget honest (tranche-3b part 2 ceiling 500, re-based 505 r89, 510 r196, 513 r198, 514 r325, 520 r328, 521 r329, 522 r330, 529 r334, 541 r335, 543 r338)", () => {
    // soft ceiling: the file may not regrow past the consolidation floor. History:
    // 535 pre-kernel → 519 pre-part-2 → 500 (roadmap §12 goal). r89 re-based to
    // 505 for phase 6: the LAST veil family (c-stone) entered with net +4 lines
    // (2 class defs + the duel-card exclusion extension) but NET-ZERO dark rules
    // — the kernel owns dark through the var, 30 raw sites consolidated into 2
    // semantic classes. Growth from here must consolidate, not add.
    // r90: doc-arrow contract lines (".dark .x → value" inside comment blocks)
    // are NOT selectors — the counter skips them (was counting 8 phantoms)
    // r196: grammar metro grew to 11 lines / 34 stations (three-grade book) —
    // 5 new color families (sky/fuchsia/lime/indigo/cyan) entered as 5 COMPOUND
    // rules (pre-consolidated across .gmetro-line + .glesson-head), net +5.
    // r198: six-grade shelf (Prospect 10-12) — 3 more metro families
    // (pink/blue/purple) entered the same COMPOUND shape, net +3 → 513.
    // r325: heat-cell ink pairs with its band — the measured WCAG fix (white
    // 90% ink on emerald-200/400 = 1.24/1.79 light; the dark kernel remap
    // turns 600/800 light = 2.95/2.09) entered as ONE 2-selector rule beside
    // the band remaps it pairs with, net +2 → 514.
    // r328: the O2 tail — six 0-3-0 paper pins inside .dark .official-report
    // (emerald-700/stone-600/stone-500 inks + bg-stone-50/border-stone-100/
    // border-emerald-300 surfaces), each pinning one utility the 0-2-0 kernel
    // class-rules steal on the always-light print paper (31→0 fails),
    // net +6 → 520.
    // r329: the light-theme contrast tail — rose-800 joins the rose ink tone
    // band (skill chip deepened light-side; dark serves the same #fda4af as
    // rose-600/700), net +1 → 521. The report-band/from-amber/c-chip-freeze/
    // word-day edits replaced lines in place (net 0).
    // r334: the grammar data-layer dark inks — the lesson HTML (lesson*.ts)
    // speaks light-scale inline classes with no dark variants; slate-700/600
    // and the family -700/-900 text inks stayed light-scale on kernel-darkened
    // surfaces (live 1.69/2.16 in the grammar tab + the same disease in the
    // metro lesson dialog). Seven one-line .g-html-scoped remaps entered (the
    // eighth — emerald-700 — was rejected by the same-value guard: the global
    // band already owns it), net +7 → 529. Kernel tokens were NOT an option:
    // rose-700/emerald-700/amber-700 carry heavy solid-bg consumers (21/61/6
    // sites) that must keep their light-scale values.
    // r335: the metro record closure (31 groups) + the first-ever glesson
    // sweep. One hero ink rule (teal-50 → #ccfbf1 — the kernel remaps
    // --color-teal-50 to a 35% SURFACE wash but the hero used it as TEXT ink,
    // live 1.11), two solid pins (bg-sky-800/bg-orange-700 are kernel-lightened
    // to #7dd3fc/#fdba74 for their text consumers but sit UNDER white
    // badge/CTA text here — live 1.5/1.52/1.67; pinned to the r330-proven deep
    // stops #0369a1/#c2410c; the portaled .gmetro-dialog joined after its
    // lesson CTA re-failed 1.67), and NINE line-ink rules (indigo/violet/blue/
    // purple/pink/rose/fuchsia/cyan/lime-700 — no dark value anywhere; amber-700
    // has the global 563 rule, these nine do not; live 1.87-3.05 on the probe
    // cards). Tool lesson of the round: the lab→token mapping of r334's record
    // misread purple/fuchsia as violet/pink — the first re-record left them
    // failing and settled the true owners; all four now have rules (future
    // coverage). Each ink rule = 3 scopes in one compound line, net +12 → 541.
    // r338: the FIRST live judgment of the two header popovers (settings +
    // profile) with full data at desktop-1280. The emerald-100 chips (resume
    // scope + the sync «جدید» badge) kept their LIGHT surface in dark — ink
    // #6ee7b7 on #d0fae5 = 1.34 (live-recorded). A kernel remap of
    // --color-emerald-100 is FORBIDDEN (home-hero speaks text-emerald-100 as a
    // deliberate LIGHT ink in dark — the r334 mixed-consumer lesson), so the
    // wash entered wrapper-scoped beside the existing z-index popper rule:
    // one compound rule, two selector lines, net +2 → 543.
    // r349: the discovery journey's compass card (week-2 onboarding — the
    // audit's biggest UX gap). The dark contract CONSOLIDATED instead of
    // growing: every row/tile/ink value rides the EXISTING kernel compound
    // lines (daily-quests rows + emerald/teal/amber/orange/violet tiles,
    // skill-panel rose, spell-buttons sky, glesson lime/indigo) — the block's
    // net growth is ONE selector line (the sky border, bg via .dark .bg-white).
    // Re-based 543 → 544 for that single line.
    const sel = lines.filter((l) => /^\s*\.[a-z]/.test(l) && !l.includes("→")).length;
    expect(sel).toBeLessThanOrEqual(544); // r349: +1 compass-card border — all else consolidated into existing kernel lines
    expect(sel, "budget headroom tracked — re-base with documented rationale only").toBeGreaterThanOrEqual(490);
  });
});

describe("globals.css tone-band + elevated-surface consolidation (Step 9 tranche-3b part 2)", () => {
  const css = readFileSync(cssPath, "utf8");
  const lines = css.split("\n");

  // logical rule blocks (selector lines may span multiple physical lines —
  // canonical groups do): a block ends at the first line containing "}"
  const blocks: string[] = [];
  let cur = "";
  for (const l of lines) {
    cur += " " + l;
    if (l.includes("}")) {
      blocks.push(cur);
      cur = "";
    }
  }

  // part 2 — باند سراسری جوهر موفقیت/خطر/فیروزه‌ای + گروه کانونی سطح بالاآمده
  const BAND: Record<string, string> = {
    "emerald-700": "#6ee7b7",
    "rose-600": "#fda4af",
    "teal-700": "#5eead4",
    "teal-800": "#5eead4",
  };

  it("anchors each band shade with exactly ONE global .dark rule", () => {
    for (const shade of Object.keys(BAND)) {
      // anchor = the shade as a TOP-LEVEL band selector: line-start or after a
      // comma inside a grouped band rule (teal-700/800 share one rule)
      const anchorRe = new RegExp(`\\.dark \\.text-${shade}[,{ ]`);
      const anchors = blocks.filter((b) => anchorRe.test(b));
      expect(anchors, `band anchor for text-${shade} must exist exactly once: ${anchors.join(" | ")}`).toHaveLength(1);
    }
  });

  it("never re-grows same-value scoped copies of the band shades", () => {
    // a .dark rule asserting the band value on text-<shade> outside the
    // canonical anchor is dead weight (deviations with a DIFFERENT value —
    // like word-day's emerald-700 #34d399 — stay legitimate)
    for (const [shade, val] of Object.entries(BAND)) {
      const anchorRe = new RegExp(`\\.dark \\.text-${shade}[,{ ]`);
      const bad = blocks.filter((b) => {
        const t = b.trim();
        if (!t.includes(".dark ") || !t.includes(`.text-${shade}`)) return false;
        if (anchorRe.test(t)) return false;
        return new RegExp(`color:\\s*${val}\\b`).test(t);
      });
      expect(bad, `same-value copies of text-${shade} returned: ${bad.join(" | ")}`).toEqual([]);
    }
  });

  it("keeps word-day's emerald-700 drift as the documented deviation", () => {
    const drift = lines.filter((l) => l.includes(".word-day .text-emerald-700") && l.includes("#34d399"));
    expect(drift, "word-day emerald-700 #34d399 deviation must stay").toHaveLength(1);
  });

  it("keeps the elevated card surfaces in ONE canonical group", () => {
    // 12 light-surface rules (bg-white/bg-stone-100/bg-stone-200 inside tinted
    // panels) converged on #292524 — a single group block; scoped pure copies
    // must not return (compound rules like kbd/spell-input stay legitimate)
    const group = blocks.filter((b) => b.includes(".rush-card .bg-white") && b.includes("background-color: #292524"));
    expect(group, `elevated-surface canonical group must exist exactly once: ${group.join(" | ")}`).toHaveLength(1);
    for (const member of [
      "shortcuts-dialog .bg-white",
      "vocab-donut .bg-stone-100",
      "rush-hud .bg-stone-100",
      "rush-done .bg-white",
      "srs-panel .bg-stone-200",
      "rush-board .bg-white",
      "report-digest .bg-white",
      "daily-quests .c-track-80",
      "duel-card .bg-white",
      "gmetro-line .bg-white",
      "gmetro-dialog .bg-white",
    ]) {
      expect(group[0], `group lost member .dark .${member}`).toContain(`.${member}`);
    }
    const copies = blocks.filter((b) => {
      const sel = b.slice(0, b.lastIndexOf("{"));
      return (
        !sel.includes(",") &&
        /\.dark\s+\.[a-z][a-z0-9_-]*\s+\.(bg-white|bg-stone-100|bg-stone-200)(\\\/\d+)?\s*$/.test(sel.trim()) &&
        /background-color:\s*#292524/.test(b)
      );
    });
    expect(copies, `scoped pure elevated-surface copies returned: ${copies.join(" | ")}`).toEqual([]);
  });
});

describe("globals.css surface-tint kernel (Step 9 tranche 3b — Task 80)", () => {
  const css80 = readFileSync(cssPath, "utf8");
  const lines80 = css80.split("\n");

  it("defines each dark tint-surface token exactly once inside the canonical .dark block", () => {
    const start = lines80.findIndex((l) => /^\.dark \{/.test(l));
    expect(start, ".dark block not found").toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines80.length; i++) {
      body += lines80[i] + "\n";
      depth += (lines80[i].match(/{/g) ?? []).length;
      depth -= (lines80[i].match(/}/g) ?? []).length;
      if (depth <= 0 && i > start) break;
    }
    for (const tok of [
      "--color-amber-50:", "--color-emerald-50:", "--color-fuchsia-50:", "--color-orange-50:", "--color-orange-200:",
      "--color-rose-50:", "--color-rose-200:", "--color-sky-50:", "--color-sky-200:",
      "--color-teal-50:", "--color-violet-50:", "--color-violet-200:", "--color-violet-300:",
    ]) {
      const n = (body.match(new RegExp(tok.replace(":", "\\:"), "g")) ?? []).length;
      expect(n, `${tok} must be defined exactly once in .dark`).toBe(1);
      const total = (css80.match(new RegExp(tok.replace(":", "\\:"), "g")) ?? []).length;
      expect(total, `${tok} must not leak outside .dark (official-report re-light excepted)`).toBeLessThanOrEqual(2);
    }
  });

  it("never re-grows the retired tinted-surface override band", () => {
    // these 13 band rules were retired in favor of the tokens; the paper's
    // re-light patch and deviating scoped keeps are the only survivors
    const retired = [
      "bg-rose-50", "border-rose-200", "bg-emerald-50", "bg-orange-50", "border-orange-200",
      "bg-violet-50", "border-violet-200", "border-violet-300", "bg-teal-50", "bg-amber-50",
      "border-sky-200", "bg-sky-50",
    ];
    for (const sel of retired) {
      const back = lines80.filter((l) => l.trim().startsWith(`.dark .${sel} {`));
      expect(back, `retired band rule .dark .${sel} must not return`).toEqual([]);
    }
    // the shadowed-deat scoped twin stays dead too
    expect(lines80.filter((l) => l.includes(".rush-card.border-sky-200"))).toEqual([]);
  });

  it("keeps the deliberate skips on explicit rules (intentional light values)", () => {
    // emerald-200/300, amber-100/200/300, rose-300, teal-500 keep their band
    // rules — the consumer matrix proved intentional light consumers there
    for (const sel of ["border-emerald-200", "border-emerald-300", "bg-amber-100", "border-amber-100", "border-amber-200", "border-amber-300", "border-rose-300", "border-teal-500"]) {
      const kept = lines80.filter((l) => l.trim().startsWith(`.dark .${sel} {`));
      expect(kept.length, `.dark .${sel} keep must survive`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("globals.css semantic chip layer (Step 9 tranche 4 phase 1 — Task 83)", () => {
  const css83 = readFileSync(cssPath, "utf8");
  const lines83 = css83.split("\n");

  it("defines the four c-chip surfaces with a .dark counterpart each (pairing invariant)", () => {
    const chips = ["goal", "freeze", "due", "flame"];
    for (const c of chips) {
      const light = lines83.filter((l) => l.trim() === `.c-chip-${c} {`);
      const dark = lines83.filter((l) => l.trim() === `.dark .c-chip-${c} {`);
      expect(light.length, `.c-chip-${c} light rule`).toBe(1);
      expect(dark.length, `.c-chip-${c} must have exactly one .dark counterpart`).toBe(1);
    }
  });

  it("no half-defined c-chip classes may appear (every light class has its dark twin)", () => {
    const lightClasses = [...css83.matchAll(/^\.c-chip-([a-z-]+) \{/gm)].map((m) => m[1]);
    const darkClasses = [...css83.matchAll(/^\.dark \.c-chip-([a-z-]+) \{/gm)].map((m) => m[1]);
    expect(lightClasses.length, "at least the four pilot chips").toBeGreaterThanOrEqual(4);
    for (const c of lightClasses) {
      expect(darkClasses, `light .c-chip-${c} must have a .dark twin`).toContain(c);
    }
    for (const c of darkClasses) {
      expect(lightClasses, `dark .c-chip-${c} must have a light twin`).toContain(c);
    }
  });

  it("flame gradient IS flipped in dark (r336 reversal — the old UNFLIPPED pin encoded an unmeasured assumption)", () => {
    // The old pin ("probe-proven existing behavior") predates any session where
    // the chip ever rendered: past personas planted no dayHistory, streak stayed
    // 0 and the chip was never mounted, so "unflipped" was never actually
    // probed. r336's desktop-1280 sweep hit it live: light amber-50→orange-50
    // gradient under amber-400 ink = 1.57 — the ONLY incomplete member of the
    // c-chip family (goal/freeze/due/duel all remap their surface). The dark
    // rule now carries the kernel-mirrored washes (amber-50/orange-50 dark
    // values) — see metro-quiz-gates-r336.test.ts for the live pair math.
    const start = lines83.findIndex((l) => l.trim() === ".dark .c-chip-flame {");
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines83.length; i++) {
      body += lines83[i] + "\n";
      depth += (lines83[i].match(/{/g) ?? []).length;
      depth -= (lines83[i].match(/}/g) ?? []).length;
      if (depth <= 0) break;
    }
    expect(body).toContain(
      "background-image: linear-gradient(to left, rgba(69, 48, 12, 0.35), rgba(88, 44, 14, 0.4))",
    );
  });
});

describe("globals.css semantic card layer (Step 9 tranche 4 phase 2 — Task 85)", () => {
  const css85 = readFileSync(cssPath, "utf8");
  const lines85 = css85.split("\n");

  it("defines c-card ONLY via @utility — custom @layer components content is stripped by the v4 compiler (probe-proven)", () => {
    expect(lines85.filter((l) => l.trim() === "@utility c-card {").length, "exactly one @utility c-card").toBe(1);
    expect(css85.includes("@layer components {"), "no custom @layer components block may return").toBe(false);
    // the unlayered raw forms must never come back either — they would kill hover/branches
    expect(lines85.filter((l) => l.trim() === ".c-card {").length).toBe(0);
    expect(lines85.filter((l) => l.trim() === ".dark .c-card {").length).toBe(0);
  });

  it("c-card keeps the probe values byte-exact (light + dark nest, pairing inside the @utility)", () => {
    const start = lines85.findIndex((l) => l.trim() === "@utility c-card {");
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines85.length; i++) {
      body += lines85[i] + "\n";
      depth += (lines85[i].match(/{/g) ?? []).length;
      depth -= (lines85[i].match(/}/g) ?? []).length;
      if (depth <= 0) break;
    }
    expect(body).toContain("background-color: rgb(255, 255, 255)");
    expect(body).toContain("border-color: lab(91.055 0.663072 0.865579)");
    expect(body).toContain("&:is(.dark *)");
    expect(body).toContain("background-color: rgb(28, 25, 23)");
    expect(body).toContain("border-color: rgb(55, 49, 43)");
  });

  it("exclusion contract — a scoped deviating wrapper line never carries PLAIN c-card (consumer matrix r85; r86: c-card-elevated is the sanctioned shell class)", () => {
    const scoped = /duel-card|word-day|skill-panel|vocab-donut|rush-done|rush-card|rush-hud|gmetro-line|gmetro-dialog|report-digest/;
    const offenders: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l, i) => {
              // c-card NOT followed by [\w-] => the plain class only;
              // c-card-elevated must not false-positive (PCRE2 lesson r85)
              if (scoped.test(l) && /c-card(?![\w-])/.test(l)) offenders.push(`${p}:${i + 1}`);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(offenders, "c-card must never merge into a deviating scoped dark context").toEqual([]);
  });
});

describe("globals.css elevated shell layer (Step 9 tranche 4 phase 3 — Task 86)", () => {
  const css86 = readFileSync(cssPath, "utf8");
  const lines86 = css86.split("\n");

  it("defines c-card-elevated ONLY via @utility, BG-ONLY (no border-color — zero order-risk with state border utilities)", () => {
    expect(lines86.filter((l) => l.trim() === "@utility c-card-elevated {").length, "exactly one @utility c-card-elevated").toBe(1);
    expect(lines86.filter((l) => l.trim() === ".c-card-elevated {").length).toBe(0);
    expect(lines86.filter((l) => l.trim() === ".dark .c-card-elevated {").length).toBe(0);
    const start = lines86.findIndex((l) => l.trim() === "@utility c-card-elevated {");
    let depth = 0;
    let body = "";
    for (let i = start; i < lines86.length; i++) {
      body += lines86[i] + "\n";
      depth += (lines86[i].match(/{/g) ?? []).length;
      depth -= (lines86[i].match(/}/g) ?? []).length;
      if (depth <= 0) break;
    }
    // byte-exact probe values (r86 BEFORE probe: duel root dark = #292524)
    expect(body).toContain("background-color: rgb(255, 255, 255)");
    expect(body).toContain("&:is(.dark *)");
    expect(body).toContain("background-color: rgb(41, 37, 36)");
    expect(body).not.toContain("border-color");
  });

  it(".dark .duel-card root rule stays FOLDED — no background-color (paint lives in the utility), kernel + border stay scoped", () => {
    const start = lines86.findIndex((l) => l.trim() === ".dark .duel-card {");
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines86.length; i++) {
      body += lines86[i] + "\n";
      depth += (lines86[i].match(/{/g) ?? []).length;
      depth -= (lines86[i].match(/}/g) ?? []).length;
      if (depth <= 0) break;
    }
    expect(body).not.toContain("background-color");
    expect(body).toContain("--color-stone-100: #f5f5f4");
    expect(body).toContain("border-color: rgb(120 113 108 / 0.35)");
  });

  it("rush-card / skill-panel scoped dark painters STAY — the documented overrides of the elevated dark (r86 contract ③)", () => {
    expect(css86).toContain(".dark .rush-card { background-color: #1c1917; }");
    expect(css86).toContain(".dark .skill-panel { background-color: #1c1917; border-color: rgb(106 44 112 / 0.5); }");
  });

  it("shell root lines never regress to raw bg-white (recursive src walk)", () => {
    const shell = /duel-card|rush-card|skill-panel/;
    const offenders: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l, i) => {
              if (shell.test(l) && l.includes("bg-white")) offenders.push(`${p}:${i + 1}`);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(offenders, "elevated shells paint via c-card-elevated, never raw bg-white").toEqual([]);
  });
});

describe("globals.css translucent veil layer (Step 9 tranche 4 phase 4 — Task 87)", () => {
  const css87 = readFileSync(cssPath, "utf8");
  const lines87 = css87.split("\n");

  it("defines c-veil-60/70 ONLY via plain author rules (c-chip mechanism), BG-ONLY, byte-exact bodies", () => {
    for (const [name, light, dark] of [
      ["c-veil-60", "color-mix(in oklab, var(--color-white) 60%, transparent)", "rgba(28, 25, 23, 0.6)"],
      ["c-veil-70", "color-mix(in oklab, var(--color-white) 70%, transparent)", "rgba(28, 25, 23, 0.7)"],
    ] as const) {
      // pairing invariant (phase-1 pattern): exactly one light rule + one .dark rule, never @utility
      expect(lines87.filter((l) => l.trim() === `.${name} {`).length, `exactly one light .${name}`).toBe(1);
      expect(lines87.filter((l) => l.trim() === `.dark .${name} {`).length, `exactly one dark .${name}`).toBe(1);
      expect(lines87.filter((l) => l.trim() === `@utility ${name} {`).length, "@utility form is forbidden — it loses byte parity (r87 probed: lab conversion)").toBe(0);
      const li = lines87.findIndex((l) => l.trim() === `.${name} {`);
      const lightBody = lines87.slice(li, li + 3).join("\n");
      // light = the retired utility's EXACT engine declaration (r87: the ONLY form whose computed
      // value stays oklab — var-free / var-fallback / declared-oklab all re-serialize to lab, probed);
      // --color-white is pinned in @theme so the no-fallback var can never silently invalidate
      expect(lightBody).toContain(`background-color: ${light}`);
      expect(lightBody).not.toContain("var(--color-white,");
      expect(lightBody).not.toContain("border-color");
      const di = lines87.findIndex((l) => l.trim() === `.dark .${name} {`);
      const darkBody = lines87.slice(di, di + 3).join("\n");
      expect(darkBody).toContain(`background-color: ${dark}`);
      expect(darkBody).not.toContain("border-color");
    }
    // the token pin itself is guarded ([^}] crosses newlines without the /s flag)
    expect(css87).toMatch(/@theme inline \{[^}]*--color-white: #fff;/);
  });

  it("retired raw dark selectors never return as rules (comments may mention them; rules may not)", () => {
    // string literals: source \\/ = css text .bg-white\/60 (backslash-escaped slash)
    const retired = (sel: string) =>
      lines87.filter((l) => l.trim().startsWith(sel) && l.includes("{")).length;
    expect(retired(".dark .bg-white\\/60")).toBe(0);
    expect(retired(".dark .bg-white\\/70")).toBe(0);
    // the certificate half of the split surfaces-rule STAYS (never a c-veil consumer)
    expect(css87).toContain(".dark .certificate-card .bg-stone-50 { background-color: rgba(28, 25, 23, 0.7); }");
  });

  it("deviating dark painters retargeted + pinned (byte-identical dark for scoped groups)", () => {
    expect(css87).toContain(".dark .srs-panel .c-veil-70 { background-color: rgb(28 25 23 / 0.8); }");
    expect(css87).toContain(".dark .rush-hero .c-veil-70 { background-color: rgb(41 37 36 / 0.85); }");
    expect(css87).toContain(".dark .report-digest .c-veil-60,\n.dark .report-digest .c-veil-70 { background-color: rgb(41 37 36 / 0.6); }");
    // dormant gmetro badge keeps its own-class painter (never referenced bg-white alphas)
    expect(css87).toContain(".dark .gmetro-lesson-badge { background-color: rgb(41 37 36 / 0.6); }");
    // the /80 hero painter retargeted r88 (c-veil-80); /80 raw selector parts retired
    expect(css87).toContain(".dark .rush-banner .c-veil-80,.dark .rush-hero .c-veil-80,.dark .rush-hero .c-veil-70 { background-color: rgb(41 37 36 / 0.85); }");
  });

  it("raw bg-white/60|70 never reappears in src — new translucent surfaces take c-veil (recursive walk)", () => {
    const offenders: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l, i) => {
              if (/bg-white\/(60|70)\b/.test(l)) offenders.push(`${p}:${i + 1}`);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(offenders, "translucent surfaces paint via c-veil-60/70, never raw bg-white alphas").toEqual([]);
  });

  it("c-veil consumers exist exactly where the r87 matrix said (23 across 12 files)", () => {
    const files = [
      "src/components/study/home/home-feed.tsx",
      "src/components/study/duel/leaderboard.tsx",
      "src/components/study/lesson/writing-tab.tsx",
      "src/components/study/practice/srs-panel.tsx",
      "src/components/study/duel/spell-rush-view.tsx",
      "src/components/study/duel/rush-view.tsx",
      "src/components/study/shell/footer.tsx",
      "src/components/study/home/home-view.tsx",
      "src/components/study/lesson/lesson-tests-tab.tsx",
      "src/components/study/reports/weekly-report.tsx",
      "src/components/study/shared/explain-box.tsx",
      "src/components/study/grammar/grammar-view.tsx",
    ];
    let total = 0;
    for (const f of files) {
      const n = (readFileSync(resolve(process.cwd(), f), "utf8").match(/c-veil-(60|70)\b/g) ?? []).length;
      total += n;
      expect(n, `${f} has at least one c-veil consumer`).toBeGreaterThan(0);
    }
    // Task 103: weekly-report +۱ — بلوکِ «نبردهای واژگانی» هم‌خانوادهٔ ردیف‌های گزارش
    // Task 186: weekly-report +۱ دیگر — نوارِ «گامِ بعدی» (پیشنهادِ کانونی، بالایِ دایجست)
    // r284: weekly-report +۱ سوم — نوارِ «نشان‌های من» (هم‌باندِ c-veil-60، زیرِ گامِ بعدی)
    // r297: weekly-report +۱ چهارم — نوارِ «کتاب‌خانهٔ داستان‌ها» (زیرِ نشان‌ها، هم‌باندِ c-veil-60)
    // r313: weekly-report +۱ پنجم — باندِ «ستونهایِ خروجیهایِ اکسل» (هم‌باندِ دستورِ رنگ‌ها)
    expect(total).toBe(23);
  });
});

describe("globals.css veil phase 5 (alpha /80|95 — Task 88)", () => {
  const css88 = readFileSync(cssPath, "utf8");
  const lines88 = css88.split("\n");

  it("defines c-veil-80/95 via plain author rules, pairing invariant, byte-exact bodies", () => {
    for (const [name, light, dark] of [
      ["c-veil-80", "color-mix(in oklab, var(--color-white) 80%, transparent)", "rgba(28, 25, 23, 0.8)"],
      ["c-veil-95", "color-mix(in oklab, var(--color-white) 95%, transparent)", "rgb(41 37 36 / 0.95)"],
    ] as const) {
      expect(lines88.filter((l) => l.trim() === `.${name} {`).length, `exactly one light .${name}`).toBe(1);
      expect(lines88.filter((l) => l.trim() === `.dark .${name} {`).length, `exactly one dark .${name}`).toBe(1);
      expect(lines88.filter((l) => l.trim() === `@utility ${name} {`).length, "@utility form forbidden — loses byte parity (r87 probed)").toBe(0);
      const li = lines88.findIndex((l) => l.trim() === `.${name} {`);
      expect(lines88.slice(li, li + 3).join("\n")).toContain(`background-color: ${light}`);
      const di = lines88.findIndex((l) => l.trim() === `.dark .${name} {`);
      expect(lines88.slice(di, di + 3).join("\n")).toContain(`background-color: ${dark}`);
    }
  });

  it("exclusion matrix pinned — speak-button is the ONLY raw /80; srs trio the ONLY /50 sites; /95 fully migrated", () => {
    const tsxOf = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
    // speak-button: hover:bg-emerald-50 would die under an unlayered class rule (r80 lesson)
    expect(tsxOf("src/components/study/shared/speak-button.tsx")).toContain("bg-white/80");
    const raw80: string[] = [];
    const raw50: string[] = [];
    const raw95: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l) => {
              if (/bg-white\/80\b/.test(l)) raw80.push(p);
              if (/bg-white\/50\b/.test(l)) raw50.push(p);
              if (/bg-white\/95\b/.test(l)) raw95.push(p);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(raw80, "bg-white/80 survives ONLY in speak-button (documented exclusion)").toEqual([
      resolve(process.cwd(), "src/components/study/shared/speak-button.tsx"),
    ]);
    expect(raw95, "bg-white/95 fully migrated to c-veil-95 (pwa dark FIX)").toEqual([]);
    expect(new Set(raw50), "/50 stays raw ONLY in the srs trio (donut (0,2,0) order trap)").toEqual(
      new Set([
        resolve(process.cwd(), "src/components/study/practice/srs-panel.tsx"),
      ])
    );
  });

  it("deviating painters retargeted + exclusion painter pinned", () => {
    // hero/banner 0.85 painter now follows BOTH veil grades
    expect(css88).toContain(".dark .rush-banner .c-veil-80,.dark .rush-hero .c-veil-80,.dark .rush-hero .c-veil-70 { background-color: rgb(41 37 36 / 0.85); }");
    // rule 295 STAYS — the speak-button exclusion's dark painter (hover-death contract)
    expect(css88).toContain(".dark .bg-white\\/80 { background-color: rgba(28, 25, 23, 0.8); }");
    // srs trio own-class painters untouched
    expect(css88).toContain(".dark .srs-donut { background-color: rgba(6, 44, 34, 0.5);");
    expect(css88).toContain(".dark .srs-panel .srs-due-chip {\n  background-color: #1c1917;");
  });
});

describe("globals.css stone veil phase 6 (bg-stone-50/60|70 — Task 89)", () => {
  const css89 = readFileSync(cssPath, "utf8");
  const lines89 = css89.split("\n");

  it("defines c-stone-60/70 via plain author rules with verbatim utility bodies — and NO dark defaults (the kernel IS the dark)", () => {
    for (const [name, light] of [
      ["c-stone-60", "color-mix(in oklab, var(--color-stone-50) 60%, transparent)"],
      ["c-stone-70", "color-mix(in oklab, var(--color-stone-50) 70%, transparent)"],
    ] as const) {
      expect(lines89.filter((l) => l.trim() === `.${name} {`).length, `exactly one light .${name}`).toBe(1);
      expect(lines89.filter((l) => l.trim() === `@utility ${name} {`).length, "@utility form forbidden — loses byte parity (r87 probed)").toBe(0);
      const li = lines89.findIndex((l) => l.trim() === `.${name} {`);
      expect(lines89.slice(li, li + 3).join("\n")).toContain(`background-color: ${light}`);
      // the phase's elegance claim, pinned: NO .dark default rule exists —
      // dark comes from the kernel-remapped var (tranche-2 step 9)
      expect(lines89.filter((l) => l.trim() === `.dark .${name} {`).length, `.dark .${name} must NOT exist — kernel owns dark`).toBe(0);
    }
    // the NO-pin invariant: the hex pin shifted light L by ~2e-4 (probe-caught r89);
    // byte-parity source of truth = Tailwind's default oklch var, kernel owns dark.
    // Scoped to the @theme block — the official-report re-light (#fafaf9) is the
    // legitimate always-light paper patch and must stay.
    const themeStart = css89.indexOf("@theme inline {");
    const themeEnd = css89.indexOf("\n}", themeStart);
    const themeBlock = css89.slice(themeStart, themeEnd);
    expect(themeBlock, "--color-stone-50 must NOT be pinned in @theme (oklch default is parity)").not.toContain("--color-stone-50:");
    expect(css89).toContain(".dark .official-report {\n  --color-stone-50: #fafaf9;");
  });

  it("exclusion matrix pinned — raw /60 survives ONLY in daily-quests + discovery-journey; raw /70 ONLY in duel-setup (same-element hover traps)", () => {
    const raw60: string[] = [];
    const raw70: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l) => {
              if (/bg-stone-50\/60\b/.test(l)) raw60.push(p);
              if (/bg-stone-50\/70\b/.test(l)) raw70.push(p);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    // r349: the discovery-journey untried chips replicate the EXACT
    // daily-quests pattern (raw bg-stone-50/60 + a same-element hover wash —
    // hover:bg-sky-50/40 — that c-stone-60 cannot express); dark is served by
    // the consolidated .jrow kernel rule, so no new dark rule exists.
    expect(new Set(raw60), "bg-stone-50/60 survives ONLY in daily-quests + discovery-journey (same-element hover traps)").toEqual(
      new Set([
        resolve(process.cwd(), "src/components/study/practice/daily-quests.tsx"),
        resolve(process.cwd(), "src/components/study/home/home-discovery-journey.tsx"),
      ])
    );
    expect(raw70, "bg-stone-50/70 survives ONLY in duel-setup:167 (hover:bg-stone-100/70 same element)").toEqual([
      resolve(process.cwd(), "src/components/study/duel/duel-setup.tsx"),
    ]);
  });

  it("consumer matrix pinned — 28 migrations + sanctioned growth in exact split (20× /60 + 11× /70; r347 budget row joins)", () => {
    let n60 = 0;
    let n70 = 0;
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l) => {
              if (/\bc-stone-60\b/.test(l)) n60++;
              if (/\bc-stone-70\b/.test(l)) n70++;
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    // task 192: +1 c-stone-60 — the duel-play waiting-card live-progress module
    // joined the family (sanctioned growth, same primitive as the HUD cells)
    expect(n60, "c-stone-60 consumers").toBe(24); // r347: +1 settings budget row · r348: +1 explain budget row · r350: +1 pulse-dashboard zebra rows · r352: +1 settings teacher row + +1 teacher roster zebra
    // r251: +1 c-stone-70 — the guide's door-coverage map section (راند ۲۵۱)
    // joined the same primitive as the r89-retargeted guide section itself
    expect(n70, "c-stone-70 consumers").toBe(11);
  });

  it("deviating painters retargeted in place + exclusion painters pinned", () => {
    expect(css89).toContain(".dark .shortcuts-dialog .c-stone-70 { background-color: rgba(40, 36, 31, 0.6); }");
    expect(css89).toContain(".dark .skill-panel .c-stone-60 { background-color: rgb(28 25 23 / 0.6); }");
    // duel-card rule EXTENDED (raw /70 half stays for the excluded hover row);
    // one-lined r90 — budget conservation (single-selector rule, oracle-safe)
    expect(css89).toContain(".dark .duel-card .bg-stone-50\\/70,.dark .duel-card .c-stone-70,.dark .duel-card .bg-stone-50 { background-color: rgb(41 37 36 / 0.6); }");
    expect(css89).toContain(".dark .duel-hud .c-stone-60 { background-color: rgb(41 37 36 / 0.6); }");
    expect(css89).toContain(".dark .duel-done .c-stone-70 { background-color: rgb(41 37 36 / 0.6); }");
    // the daily-quests exclusion painter STAYS on the raw class
    expect(css89).toContain(".dark .daily-quests .bg-stone-50\\/60 { background-color: rgb(28 25 23 / 0.55); }");
    // kernel contract untouched — the dark default source of truth
    expect(css89).toContain("--color-stone-50: #151310;");
  });
});

describe("globals.css track semantic layer (stone-200 alphas — Task 90)", () => {
  const css90 = readFileSync(cssPath, "utf8");
  const lines90 = css90.split("\n");

  it("defines c-track-60/70/80 via plain author rules with verbatim utility bodies — kernel owns dark, token unpinned", () => {
    for (const [name, light] of [
      ["c-track-60", "color-mix(in oklab, var(--color-stone-200) 60%, transparent)"],
      ["c-track-70", "color-mix(in oklab, var(--color-stone-200) 70%, transparent)"],
      ["c-track-80", "color-mix(in oklab, var(--color-stone-200) 80%, transparent)"],
    ] as const) {
      expect(lines90.filter((l) => l.trim() === `.${name} {`).length, `exactly one light .${name}`).toBe(1);
      expect(lines90.filter((l) => l.trim() === `@utility ${name} {`).length, "@utility form forbidden — loses byte parity (r87 probed)").toBe(0);
      const li = lines90.findIndex((l) => l.trim() === `.${name} {`);
      expect(lines90.slice(li, li + 3).join("\n")).toContain(`background-color: ${light}`);
      expect(lines90.filter((l) => l.trim() === `.dark .${name} {`).length, `.dark .${name} must NOT exist — kernel owns dark`).toBe(0);
    }
    // the r89 no-pin lesson, pinned for the stone-200 token too
    const themeStart = css90.indexOf("@theme inline {");
    const themeEnd = css90.indexOf("\n}", themeStart);
    expect(css90.slice(themeStart, themeEnd), "--color-stone-200 must NOT be pinned in @theme").not.toContain("--color-stone-200:");
  });

  it("exclusion matrix pinned — raw /60 gone from src; /70 survives ONLY in header-hover + palette-state; /80 ONLY in the two filter pills", () => {
    const raw60: string[] = [];
    const raw70: string[] = [];
    const raw80: string[] = [];
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((l) => {
              if (/bg-stone-200\/60\b/.test(l)) raw60.push(p);
              if (/bg-stone-200\/70\b/.test(l)) raw70.push(p);
              if (/bg-stone-200\/80\b/.test(l)) raw80.push(p);
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(raw60, "bg-stone-200/60 fully migrated to c-track-60").toEqual([]);
    expect(new Set(raw70), "raw /70 = same-element hovers (header + settings icon + pulse refresh + teacher header pair) + state ink (palette) only").toEqual(
      new Set([
        resolve(process.cwd(), "src/components/study/shell/header.tsx"),
        resolve(process.cwd(), "src/components/study/shared/settings-popover.tsx"),
        resolve(process.cwd(), "src/components/study/shared/pulse-dashboard.tsx"), // r350: the dashboard's refresh button — the SAME settings-icon idiom (same-element hover)
        resolve(process.cwd(), "src/components/study/teacher/teacher-view.tsx"), // r352: the teacher panel's CSV+refresh pair — the SAME settings-icon idiom (same-element hover)
        resolve(process.cwd(), "src/components/study/shell/command-palette.tsx"),
      ])
    );
    expect(new Set(raw80), "raw /80 = inactive filter pills (dictionary + my-words) only").toEqual(
      new Set([
        resolve(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"),
        resolve(process.cwd(), "src/components/study/practice/my-words.tsx"),
      ])
    );
  });

  it("consumer matrix pinned — exact track counts per grade (n60=2, n70=8, n80=3; r347 budget bar joins), comments excluded", () => {
    let n60 = 0;
    let n70 = 0;
    let n80 = 0;
    const walk = (d: string): void => {
      for (const name of readdirSync(d)) {
        const p = join(d, name);
        try {
          if (readdirSync(p)) walk(p);
        } catch {
          if (p.endsWith(".tsx")) {
            readFileSync(p, "utf8").split("\n").forEach((raw) => {
              const l = raw.trim();
              if (l.startsWith("//")) return; // doc comments don't count
              if (/\bc-track-60\b/.test(l)) n60++;
              if (/\bc-track-70\b/.test(l)) n70++;
              if (/\bc-track-80\b/.test(l)) n80++;
            });
          }
        }
      }
    };
    walk(resolve(process.cwd(), "src"));
    // Task 103: weekly-report +۱ — مسیرِ نوارِ نرخِ بردِ نبردها (زیرِ همان retargetِ report-digest)
    // راند ۲۲۲: چیپِ شمارشِ خانوادهٔ واژه‌های «اجزای کلماتی» +۱
    // راند ۲۲۳: همان چیپ با کارتِ مشترکِ جدول به word-family-table-card مهاجرت کرد — جمع ثابت ۶
    // راند ۲۲۶: نوارِ ناوبریِ «قبلی/بعدی» کارت‌های ضمیمه +۱ — جمع ۷
    // راند ۲۲۷: پانوشتِ ناوبریِ جدول‌های «اجزای کلماتی» در word-family-table-card +۱ — جمع ۸
    // راند ۳۰۴: خانه‌های خالیِ نوارِ ماه‌نامهٔ خواندن در نوارِ کتاب‌خانهٔ هفته‌نامه +۱
    //   (سطحِ صفرِ گریدِ ۳۰روزه؛ تاریکش با painterِ report-digest موجود — جمع ۳)
    expect(n60, "c-track-60 consumers").toBe(3);
    // راند ۳۰۴: trackِ نوارِ رکوردِ زنجیره در کارتِ «ادامهٔ خواندن»ِ خانه +۱
    //   (جایگزینِ raw bg-stone-200/70 که ماتریسِ استثنا میبرد — جمع ۹)
    expect(n70, "c-track-70 consumers").toBe(9);
    expect(n80, "c-track-80 consumers").toBe(6); // r347: +1 budget bar track · r348: +1 explain bar track · r350: +1 pulse strip zero-day track · r352: +1 teacher strip zero-day track
  });

  it("deviating painters retargeted in place (byte-identical elevated tones + opaque band)", () => {
    expect(css90).toContain(".dark .report-digest .c-track-60 { background-color: rgb(68 64 60 / 0.6); }");
    expect(css90).toContain(".dark .srs-panel .c-track-70 { background-color: rgb(41 37 36 / 0.7); }");
    // the quest track band lives INSIDE the canonical #292524 elevated group
    expect(css90).toContain(".dark .daily-quests .c-track-80,.dark .duel-card .bg-white,.dark .gmetro-line .bg-white,.dark .gmetro-dialog .bg-white { background-color: #292524; }");
    // the analyzer-safety lesson: the duel retargets stay TWO single-selector rules
    expect(css90).toContain(".dark .duel-hud .c-stone-60 { background-color: rgb(41 37 36 / 0.6); }");
    expect(css90).toContain(".dark .duel-done .c-stone-70 { background-color: rgb(41 37 36 / 0.6); }");
  });
});

/* ================================================================
   r114 — wash alpha-drift convergence (Step 9 tranche 3b continuation)
   قرارداد: هر قاعدهٔ شستِ -50 (band و scoped) باید از BASEِ tokenِ خانوادهٔ
   خودش استفاده کند (یک پایه به‌ازای هر خانواده)؛ آلفای /NN دست‌تنظیم می‌ماند
   ولی در band سراسری باید در NN یکنوا باشد (باگِ 0.35<0.42 دیگر ممکن نیست)؛
   نسخه‌های scopedِ منسوخ‌شده هرگز برنمی‌گردند.
   ================================================================ */
describe("globals.css wash alpha-drift convergence (r114)", () => {
  const css114 = readFileSync(cssPath, "utf8");
  const lines114 = css114.split("\n");

  // single source of truth: parse the token BASES straight out of the .dark kernel
  const tokenBase: Record<string, [number, number, number]> = {};
  for (const fam of ["emerald", "rose", "amber", "teal", "orange", "sky", "violet", "fuchsia"]) {
    const m = css114.match(new RegExp(`--color-${fam}-50:\\s*(?:rgba?)\\(\\s*([\\d.]+)[ ,]+([\\d.]+)[ ,]+([\\d.]+)`));
    expect(m, `kernel token --color-${fam}-50 must exist`).not.toBeNull();
    tokenBase[fam] = [Number(m![1]), Number(m![2]), Number(m![3])];
  }

  // documented duel-leaderboard violet identity — the ONLY base deviation allowed
  // (the whole .leaderboard.duel-mode scope owns its own fuchsia palette)
  const KEEPS = ["leaderboard.duel-mode"];

  const normRgb = (v: string): [number, number, number] | null => {
    const m = v.match(/(?:rgba?)\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };

  it("every wash rule (band + scoped) paints with its family's token BASE", () => {
    const ruleRe = /^\.dark\s+([^{]*?)\{\s*background-color:\s*([^;}]+)/;
    const checked: string[] = [];
    for (const line of lines114) {
      const m = line.match(ruleRe);
      if (!m) continue;
      const sel = m[1];
      const famMatch = sel.match(/bg-(emerald|rose|amber|teal|orange|sky|violet|fuchsia)-50(?![\d])/);
      if (!famMatch) continue;
      if (KEEPS.some((k) => sel.includes(k.replace("\\\\", "\\")))) continue;
      const rgb = normRgb(m[2]);
      expect(rgb, `rule must paint an rgb() value: ${line.trim().slice(0, 90)}`).not.toBeNull();
      expect(rgb!, `base drift forbidden (token=${tokenBase[famMatch[1]]}): ${line.trim().slice(0, 90)}`)
        .toEqual(tokenBase[famMatch[1]]);
      checked.push(sel.trim());
    }
    expect(checked.length, "the guard must actually see the wash band").toBeGreaterThanOrEqual(12);
  });

  it("global band /NN alphas stay monotone in the modifier (the 0.35<0.42 bug is dead)", () => {
    // band rule = selector is EXACTLY .dark .bg-<fam>-50/NN (no extra scope classes)
    const bandRe = /^\.dark \.bg-([a-z]+)-50\\\/(\d+)\s*\{\s*background-color:\s*(?:rgba?)\(\s*[\d.]+[ ,]+[\d.]+[ ,]+[\d.]+[ ,]+([\d.]+)/;
    const alpha: Record<string, Map<number, number>> = {};
    for (const line of lines114) {
      const m = line.match(bandRe);
      if (!m) continue;
      (alpha[m[1]] ??= new Map()).set(Number(m[2]), Number(m[3]));
    }
    for (const [fam, byMod] of Object.entries(alpha)) {
      const mods = [...byMod.keys()].sort((a, b) => a - b);
      expect(mods.length, `band must carry ${fam} modifiers`).toBeGreaterThan(0);
      for (let i = 1; i < mods.length; i++) {
        expect(byMod.get(mods[i])!, `${fam}-50/${mods[i]} alpha must be >= /${mods[i - 1]}`)
          .toBeGreaterThanOrEqual(byMod.get(mods[i - 1])!);
      }
    }
    // and emerald specifically keeps the converged 0.5 for /70
    expect(alpha.emerald?.get(70), "emerald-50/70 canonical alpha").toBe(0.5);
  });

  it("emerald-50/70 is defined exactly once, at the canonical band value", () => {
    const defs = lines114.filter((l) => l.includes(".bg-emerald-50\\/70") && l.includes("background-color"));
    expect(defs.length, "exactly one emerald-50/70 wash rule").toBe(1);
    expect(defs[0].trim()).toBe(".dark .bg-emerald-50\\/70 { background-color: rgba(6, 55, 40, 0.5); }");
  });

  it("retired drifted scoped variants never come back", () => {
    const retired = [
      ".rush-card .hover\\:bg-orange-50\\/50:hover",
      ".rush-card .bg-rose-50\\/70",
      ".daily-quests .bg-emerald-50\\/70",
      ".duel-done .bg-emerald-50\\/70",
      ".word-day .bg-lime-50",
    ];
    for (const sel of retired) {
      expect(lines114.filter((l) => l.includes(sel)), `retired scoped rule must stay dead: ${sel}`).toEqual([]);
    }
  });

  it("fuchsia-50 solid consumers are kernel-served (no per-utility solid rule outside duel scopes)", () => {
    // the two live-proven light leaks (duel-code box, home-tools chip) must ride
    // the token — a bare .dark .bg-fuchsia-50 band rule would shadow it again
    expect(lines114.filter((l) => l.trim().startsWith(".dark .bg-fuchsia-50 {"))).toEqual([]);
    // the scoped duel surfaces keep their explicit rules (they win by specificity)
    expect(lines114.filter((l) => l.includes(".duel-card .bg-fuchsia-50 {")).length).toBe(1);
    expect(lines114.filter((l) => l.includes(".leaderboard.duel-mode .bg-fuchsia-50 {")).length).toBe(1);
  });
});
