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

// §8.3 per-feature extraction (wave 1 — task 133): the feature CSS files that
// left globals.css. The EFFECTIVE stylesheet = globals + these — they always
// load together via the src/app/features.css manifest (layout.tsx, right
// after globals.css), so presence contracts read the effective text while
// absence/budget contracts keep reading globals.css ONLY.
const featureCssPaths = [
  "src/components/study/shared/confetti.css",
  "src/components/study/duel/rush.css",
  "src/components/study/duel/spell-input.css",
  "src/components/study/practice/srs-panel.css",
  "src/components/study/practice/skill-panel.css",
  "src/components/study/reports/report-card.css",
  // wave 2 (task 135): the small single-family bands
  "src/components/study/shared/streak-flame.css",
  "src/components/study/shell/footer.css",
  "src/components/study/home/quote-band.css",
  "src/components/study/home/home-hero.css",
  "src/components/study/practice/badges.css",
  "src/components/study/quiz/quiz-result.css",
  "src/components/study/practice/weekly-chart.css",
  "src/components/study/lesson/word-of-day.css",
  // wave 3 (task 137): the official-report A4 paper family
  "src/components/study/reports/official-report.css",
  // wave 4 (task 139): the duel dark-mode family (duel-* + leaderboard duel-mode)
  "src/components/study/duel/duel-dark.css",
  // wave 5 (task 141): the daily-quests family (reward shimmer + dark tuning)
  "src/components/study/practice/daily-quests.css",
  // wave 9 (task 149): the dictionary state-filter chips (dark trio) — path
  // repaired into this list in wave 10 (it was only in KEY_SELECTORS before,
  // so the manifest + per-file-dupes sweeps silently skipped it)
  "src/components/study/lesson/dictionary-view.css",
  // task 150: the combined streak badge (ice guest ink duo) — same repair
  "src/components/study/practice/streak-badge.css",
  // wave 10 (task 151): the bookshelf family (spine hover + dark shelf gradients)
  "src/components/study/home/home-bookshelf.css",
  // wave 12 (task 155): the home band dark painters (stat-band new file;
  // quote-band's painter appended to the wave-2 file)
  "src/components/study/home/stat-band.css",
  // wave 13 (task 157): the my-words dark launcher family — one view
  // family, one file (the duel-dark.css precedent)
  "src/components/study/practice/my-words-dark.css",
  // wave 14 (task 159): the three remaining single-consumer launcher
  // painters each beside its owner — three mutually exclusive views
  // (smart/exam/konkur), one file each; mistakes-cta/review-hero/
  // quiz-teacher stay (multi-consumer)
  "src/components/study/practice/smart-hero.css",
  "src/components/study/exam/konkur-hero.css",
  "src/components/study/exam/exam-dict-cta.css",
  // wave 15 (task 161): the task-64 sweep band dissolved — four single-
  // consumer painters, four feature areas (home/duel/shell/lesson),
  // one file each beside its owner
  "src/components/study/home/listen-hero.css",
  "src/components/study/duel/name-cta.css",
  "src/components/study/shell/onboard-paper.css",
  "src/components/study/lesson/dict-setup.css",
];
const readEffectiveCss = (): string =>
  readFileSync(cssPath, "utf8") +
  "\n" +
  featureCssPaths.map((p) => readFileSync(resolve(process.cwd(), p), "utf8")).join("\n");

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
    // the frozen canonical values per shade — new one-off drifts fail here.
    // Scans the EFFECTIVE css (globals + the per-feature files): moved panels
    // keep their tone contracts beside their owners (wave 3: report-month's
    // #716b63 now lives in reports/report-card.css) — a drift anywhere fails.
    const effLines = readEffectiveCss().split("\n");
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
    // scans the EFFECTIVE css (globals + the per-feature files): moved panels
    // keep their tone contracts beside their owners (wave 3: report-month's
    // #716b63 now lives in reports/report-card.css) — a drift anywhere fails
    for (const raw of readEffectiveCss().split("\n")) {
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

  it("keeps the selector budget honest (tranche-3b part 2 ceiling 500, re-based 505 r89)", () => {
    // soft ceiling: the file may not regrow past the consolidation floor. History:
    // 535 pre-kernel → 519 pre-part-2 → 500 (roadmap §12 goal). r89 re-based to
    // 505 for phase 6: the LAST veil family (c-stone) entered with net +4 lines
    // (2 class defs + the duel-card exclusion extension) but NET-ZERO dark rules
    // — the kernel owns dark through the var, 30 raw sites consolidated into 2
    // semantic classes. Growth from here must consolidate, not add.
    // r90: doc-arrow contract lines (".dark .x → value" inside comment blocks)
    // are NOT selectors — the counter skips them (was counting 8 phantoms)
    // r115: re-based 490 → 466 — the -100 kernel retired 18 scoped/band rules
    // and added ZERO raw selectors (tokens only); the trio merge (stone-100
    // ×3 → 1) took two more. Growth from here must consolidate, not add.
    // task 133 (§8.3 wave 1): re-based 466 → 404 — the r12 band's single-family
    // rules (80 selector lines) moved beside their components (duel/rush.css,
    // practice/srs-panel.css, practice/skill-panel.css, reports/report-card.css,
    // duel/spell-input.css, shared/confetti.css) — always loaded via the
    // features.css manifest; cross-family canonical groups + the hover-utility
    // overrides stayed. Growth from here must consolidate, not add.
    // task 135 (§8.3 wave 2): re-based 404 → 378 — the small single-family
    // bands (streak flame, footer, quote mark, hero-book sheen, badge shine,
    // pop-fade, certificate, heatmap, word-day base+descendants) moved beside
    // their owners (8 files, 26 selector lines) and the DEAD .dictation-box
    // rule (zero TSX consumers) was buried. Cross-family canonical groups,
    // the surface clusters and utility overrides stayed. Growth from here
    // must consolidate, not add.
    // task 137 (§8.3 wave 3): re-based 378 → 330 — the A4 paper family (the
    // r27 or-* band + the task-124 teacher-judgment colors, 89 lines →
    // reports/official-report.css) and the r14 report-month cluster (→
    // reports/report-card.css) moved beside their owners; the print band
    // (body.print-official, !important) stayed global per the wave-1
    // protocol. Cross-family canonical groups, the surface clusters and
    // utility overrides stayed. Growth from here must consolidate, not add.
    // task 139 (§8.3 wave 4): re-based 330 → 286 — the duel dark band (the
    // .dark .duel-* tuning + the leaderboard duel-mode standings/podium,
    // 43 selector lines → duel/duel-dark.css) moved beside its owners; the
    // r115 .bg-stone-100 consolidated trio (duel-card/duel-done/gmetro-line)
    // stays as the cross-family focal layer at the first member's position,
    // the ink-tone canonical groups stay, and the .dark .duel-week rule
    // stays (owner reports/weekly-report.tsx, not the duel family). The
    // wave-4 removal ALSO unmasked one genuinely mergeable pair (the duel
    // member was the hazard-blocker): gmetro-line + gmetro-dialog
    // .border-stone-200 consolidated at the first member's position (−1,
    // css-tones --apply, 3a checkpoint). Growth from here must consolidate,
    // not add.
    // task 141 (§8.3 wave 5): re-based 286 → 275 — the daily-quests family
    // (the reward-shimmer band + the .dark .daily-quests tuning, 11 selector
    // lines → practice/daily-quests.css) moved beside its owner; the r115
    // ink trio (daily-quests + leaderboard.duel-mode) stays at the first
    // member's position and the .c-track-80 member stays inside the
    // elevated-surface canonical group (twelve families). Every moved rule
    // was single-member — the removal unmasked NO new mergeable pair (3a
    // checkpoint re-run clean). Growth from here must consolidate, not add.
    // task 143 (§8.3 wave 6): re-based 275 → 273 — the last single-owner
    // report residue (the .dark .report-print-btn pair, 2 selector lines →
    // reports/report-card.css, appended to the wave-1 file) moved beside its
    // owner; the body.print-report print band stays per the wave-1 protocol
    // and the report members of the ink canonical groups + orange painters
    // stay (multi-family). Removal was 2 single-member rules — 3a checkpoint
    // re-run clean. Growth from here must consolidate, not add.
    // task 145 (§8.3 wave 7): re-based 273 → 269 — the four rush dark
    // gradients (hero/done/board-strip/board-hint, 4 selector lines →
    // duel/rush.css) joined their owner; the hero/done merge ALSO retired
    // the masked wave-1 stops there (cross-file duplicate selector — the
    // globals !important had silently won the background-image while the
    // non-important border-color stayed live; one painter per head now).
    // The ink canonical groups + orange painters stay (multi-family), and
    // the dd-* trio stays this wave (duel-done family residue — wave-8
    // candidate). 3a checkpoint re-run clean. Growth from here must
    // consolidate, not add.
    // task 147 (§8.3 wave 8): re-based 269 → 266 — the three dd-* outcome
    // gradients (win/tie/lose, 3 selector lines → duel/duel-dark.css) joined
    // the duel-done dark family beside their owner; the attribute-variant
    // background-images there had been PERMANENTLY MASKED by these
    // !important painters (every duel-done card carries exactly one dd-*
    // head beside its border-*-300 class) and retired in the same move —
    // one background painter per outcome head (the wave-7 service, now
    // performed for duel-done). Tombstone selector-pattern-free; the
    // 3a checkpoints re-ran clean. Growth from here must consolidate,
    // not add.
    // task 149 (§8.3 wave 9): re-based 266 → 263 — the dictionary state
    // filter chips (hover/descendant-badge/bg-stone-700, 3 selector lines →
    // lesson/dictionary-view.css, a NEW file beside its owner — first since
    // wave 5) moved beside their single consumer; the .bg-stone-100 member
    // of the text-stone-600 canonical group stays (multi-family, nine
    // families — asserted). 3a checkpoints re-ran clean. Growth from here
    // must consolidate, not add.
    // task 151 (§8.3 wave 10): re-based 263 → 260 — the bookshelf family
    // (two theme-free .book-spine rules + two .dark .shelf-* gradients, 4
    // selector lines → home/home-bookshelf.css, a NEW file beside its owner)
    // moved beside their single consumer; the neighbouring .dark .stat-band
    // / .dark .quote-band painters stay (different owners: home-feed /
    // home-view via the quote band). MEASURED note: the true pre-wave count
    // was 264, not the recorded 263 — a +1 drift in the wave-9 bookkeeping;
    // this re-base anchors to the measured reality (260 = 264 − 4). 3a
    // checkpoints re-ran clean. Growth from here must consolidate, not add.
    // task 153 (§8.3 wave 11): re-based 260 → 259 — the SRS state donut (1
    // selector line → practice/srs-panel.css, APPENDED to the wave-1 file —
    // no new file) moved beside its single consumer; the r14 band frame
    // retired with its last resident (report-month wave 3, dict chips wave
    // 9, donut now). 3a checkpoints re-ran clean. Growth from here must
    // consolidate, not add.
    // task 155 (§8.3 wave 12): re-based 259 → 257 — the home band dark
    // painters (2 selector lines) moved beside their single consumers:
    // .stat-band into home/stat-band.css (NEW file beside home-feed.tsx),
    // .quote-band appended to the wave-2 home/quote-band.css. Anchored to
    // the field-measured 259 (exact guard regex, node re-count). 3a
    // checkpoints re-ran clean. Growth from here must consolidate, not add.
    // task 157 (§8.3 wave 13): re-based 257 → 254 — the my-words dark
    // launcher family (3 selector lines, 4 heads) moved beside its owners:
    // practice/my-words-dark.css (NEW file — one view family, one file,
    // the duel-dark.css precedent). The multi-consumer neighbours stay:
    // review-hero (exam-view + review-view) and quiz-teacher/week-teacher
    // (quiz-teacher + week-teacher). 3a checkpoints re-ran clean. Growth
    // from here must consolidate, not add.
    // task 159 (§8.3 wave 14): re-based 254 → 251 — the three remaining
    // single-consumer launcher painters (3 selector lines) each beside its
    // owner: practice/smart-hero.css, exam/konkur-hero.css and
    // exam/exam-dict-cta.css (NEW files — three mutually exclusive views:
    // smart/exam/konkur). The multi-consumer neighbours stay: review-hero,
    // quiz-teacher/week-teacher and mistakes-cta (exam-view +
    // lesson-tests-tab). 3a checkpoints re-ran clean. Growth from here
    // must consolidate, not add.
    // task 161 (§8.3 wave 15): re-based 251 → 247 — the task-64 sweep band
    // dissolved: its four remaining tinted gradient painters (4 selector
    // lines) each beside its single owner: home/listen-hero.css,
    // duel/name-cta.css, shell/onboard-paper.css, lesson/dict-setup.css
    // (NEW files — four feature areas, no co-render family). 3a
    // checkpoints re-ran clean. Growth from here must consolidate, not
    // add.
    const sel = lines.filter((l) => /^\s*\.[a-z]/.test(l) && !l.includes("→")).length;
    expect(sel).toBeLessThanOrEqual(505);
    expect(sel, "budget headroom tracked — re-base with documented rationale only").toBeGreaterThanOrEqual(247);
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
    // task 135 (§8.3 wave 2): the rule moved verbatim beside its owner
    // (lesson/word-of-day.css) — the deviation survives, now feature-file hosted
    const wod = readFileSync(resolve(process.cwd(), "src/components/study/lesson/word-of-day.css"), "utf8");
    const drift = wod.split("\n").filter((l) => l.includes(".word-day .text-emerald-700") && l.includes("#34d399"));
    expect(drift, "word-day emerald-700 #34d399 deviation must stay (beside its owner)").toHaveLength(1);
    // the scoped rule itself left globals — other #34d399 uses (or-weekbar,
    // glosson-mirror) are unrelated and stay
    const gLines = readFileSync(cssPath, "utf8").split("\n");
    expect(gLines.filter((l) => l.includes(".word-day .text-emerald-700")), "scoped rule must leave globals").toEqual([]);
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
    // emerald-200/300, amber-200/300, rose-300, teal-500 keep their band
    // rules — the consumer matrix proved intentional light consumers there.
    // r115: bg/border-amber-100 LEFT this list — the -100 layer is kernelized
    // now (the old bg/border value conflict collapsed onto the family base).
    for (const sel of ["border-emerald-200", "border-emerald-300", "border-amber-200", "border-amber-300", "border-rose-300", "border-teal-500"]) {
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

  it("flame gradient stays UNFLIPPED in dark (probe-proven existing behavior, not a regression)", () => {
    // .dark .c-chip-flame = border + ink only; background-image must NOT be redefined
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
    expect(body).not.toContain("background-image");
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
  const css86 = readEffectiveCss(); // presence contracts — the rush-card painter lives in duel/rush.css now (task 133)
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
  const css87 = readEffectiveCss(); // presence contracts — the retargeted painters moved beside their features (task 133)
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

  it("c-veil consumers exist exactly where the r87 matrix said (19 across 12 files)", () => {
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
    expect(total).toBe(19);
  });
});

describe("globals.css veil phase 5 (alpha /80|95 — Task 88)", () => {
  const css88 = readEffectiveCss(); // presence contracts — the merged hero/banner painter lives in duel/rush.css now (task 133)
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
  const css89 = readEffectiveCss(); // presence contracts — the skill-panel c-stone-60 painter lives beside the panel now (task 133)
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

  it("exclusion matrix pinned — raw /60 survives ONLY in daily-quests; raw /70 ONLY in duel-setup (both same-element hover traps)", () => {
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
    expect(raw60, "bg-stone-50/60 survives ONLY in daily-quests (hover:bg-emerald-50/40 same element)").toEqual([
      resolve(process.cwd(), "src/components/study/practice/daily-quests.tsx"),
    ]);
    expect(raw70, "bg-stone-50/70 survives ONLY in duel-setup:167 (hover:bg-stone-100/70 same element)").toEqual([
      resolve(process.cwd(), "src/components/study/duel/duel-setup.tsx"),
    ]);
  });

  it("consumer matrix pinned — 28 migrations in exact file split (18× /60 + 10× /70)", () => {
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
    expect(n60, "c-stone-60 consumers").toBe(18);
    expect(n70, "c-stone-70 consumers").toBe(10);
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
  const css90 = readEffectiveCss(); // presence contracts — the srs/report painters live beside their features now (task 133)
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
    expect(new Set(raw70), "raw /70 = same-element hovers (header + settings icon) + state ink (palette) only").toEqual(
      new Set([
        resolve(process.cwd(), "src/components/study/shell/header.tsx"),
        resolve(process.cwd(), "src/components/study/shared/settings-popover.tsx"),
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

  it("consumer matrix pinned — 8 tracks in exact grade split (1× /60 + 5× /70 + 2× /80), comments excluded", () => {
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
    expect(n60, "c-track-60 consumers").toBe(2);
    expect(n70, "c-track-70 consumers").toBe(5);
    expect(n80, "c-track-80 consumers").toBe(2);
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
  // effective css (task 139): the duel wash rules live in duel/duel-dark.css
  // now — the token-base contract must still see them
  const css114 = readEffectiveCss();
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

/* ================================================================
   r115 — the -100 wash layer joins the kernel (Step 9 tranche 3c)
   همان قراردادِ -50: یک ارزشِ تاریکِ نیمه‌شفاف به‌ازای هر خانواده،
   token = تک‌منبعِ حقیقت؛ قاعده‌ای که هم‌ارزِ token نیست یا whitelist
   نشده = قرمز. کلاسِ نشتیِ نور (hover:bg-*-100 / border-*-100 /
   ring-*-100 بدونِ قاعده) ساختاراً مرده — هر مصرف‌کنندهٔ تازه رایگانِ
   تاریک می‌شود.
   ================================================================ */
describe("globals.css -100 wash kernel (r115)", () => {
  // effective text — the documented keeps (skill-weak-cta strength, rush
  // hero/board orange borders) moved beside their features in task 133; the
  // keeps-contract follows the rule wherever it lives
  const css115 = readEffectiveCss();
  const lines115 = css115.split("\n");

  const tokenBase: Record<string, [number, number, number]> = {};
  for (const fam of ["emerald", "rose", "amber", "teal", "orange", "sky", "violet", "fuchsia"]) {
    const m = css115.match(new RegExp(`--color-${fam}-100:\\s*(?:rgba?)\\(\\s*([\\d.]+)[ ,]+([\\d.]+)[ ,]+([\\d.]+)`));
    expect(m, `kernel token --color-${fam}-100 must exist`).not.toBeNull();
    tokenBase[fam] = [Number(m![1]), Number(m![2]), Number(m![3])];
  }

  // documented keeps: the CTA's deliberate strength wash + the rush orange
  // border identity (task-80 "rush-hero borders" precedent continued)
  const KEEPS = ["skill-weak-cta .bg-amber-100", "rush-hero .border-orange-100", "rush-board .border-orange-100", "rush-hero .bg-orange-100", "hover\\:bg-sky-100:hover"];

  const normRgb = (v: string): [number, number, number] | null => {
    const m = v.match(/(?:rgba?)\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
  };

  it("every -100 wash rule (bg or border) paints with its family's token BASE", () => {
    const ruleRe = /^\.dark\s+([^{]*?)\{\s*(background|border)-color:\s*([^;}]+)/;
    const checked: string[] = [];
    for (const line of lines115) {
      const m = line.match(ruleRe);
      if (!m) continue;
      const sel = m[1];
      const famMatch = sel.match(/(?:bg|border)-(emerald|rose|amber|teal|orange|sky|violet|fuchsia)-100(?![\d])/);
      if (!famMatch) continue;
      if (KEEPS.some((k) => sel.includes(k))) continue;
      const rgb = normRgb(m[3]);
      expect(rgb, `rule must paint an rgb() value: ${line.trim().slice(0, 90)}`).not.toBeNull();
      expect(rgb!, `-100 base drift forbidden (token=${tokenBase[famMatch[1]]}): ${line.trim().slice(0, 90)}`)
        .toEqual(tokenBase[famMatch[1]]);
      checked.push(sel.trim());
    }
    // the retired scoped copies are gone, so what remains = the keeps only…
    // every converged site must have LEFT; nothing new may drift in
    expect(checked.length, "no non-keep -100 rules may remain").toBe(0);
  });

  it("the -100 band rules never return (bg/border-amber-100 retired with the rest)", () => {
    for (const sel of ["bg-emerald-100", "bg-rose-100", "bg-amber-100", "bg-teal-100", "bg-orange-100", "bg-violet-100", "bg-fuchsia-100", "border-amber-100"]) {
      const back = lines115.filter((l) => l.trim().startsWith(`.dark .${sel} {`));
      expect(back, `retired -100 band rule .dark .${sel} must not return`).toEqual([]);
    }
  });

  it("documented keeps survive (strength + identity)", () => {
    expect(lines115.filter((l) => l.includes(".skill-weak-cta .bg-amber-100") && l.includes("0.8")).length).toBe(1);
    expect(lines115.filter((l) => l.includes("rush-hero .border-orange-100")).length).toBe(1);
    expect(lines115.filter((l) => l.includes("rush-board .border-orange-100")).length).toBe(1);
    expect(lines115.filter((l) => l.includes("hover\\:bg-sky-100:hover")).length).toBe(1);
  });

  it("official-report re-lights emerald-100 for the always-light paper's print button", () => {
    const start = lines115.findIndex((l) => l.trim() === ".dark .official-report {");
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines115.length; i++) {
      body += lines115[i] + "\n";
      depth += (lines115[i].match(/{/g) ?? []).length;
      depth -= (lines115[i].match(/}/g) ?? []).length;
      if (depth <= 0 && i > start) break;
    }
    expect(body).toContain("--color-emerald-100: #d0fae5");
  });

  it("word-day's -100 copies and the srs /70 border variants stay retired", () => {
    const retired = [
      ".word-day .bg-teal-100",
      ".word-day .bg-emerald-100",
      "srs-due-preview .border-rose-100\\/70",
      "srs-fx-expand .border-teal-100\\/70",
      ".skill-panel .bg-emerald-100",
      ".skill-panel .bg-teal-100",
      ".skill-panel .bg-amber-100",
      ".skill-panel .bg-rose-100",
      ".daily-quests .bg-emerald-100",
      ".daily-quests .bg-violet-100",
      ".daily-quests .bg-amber-100",
      ".daily-quests .bg-teal-100",
      ".daily-quests .bg-orange-100",
      ".duel-card .bg-fuchsia-100",
      ".duel-done .bg-rose-100",
      "leaderboard.duel-mode .border-fuchsia-100",
      "leaderboard.duel-mode .bg-emerald-100",
      "leaderboard.duel-mode .bg-rose-100",
    ];
    for (const sel of retired) {
      expect(lines115.filter((l) => l.includes(sel)), `retired -100 rule must stay dead: ${sel}`).toEqual([]);
    }
  });
});

describe("globals.css semantic wash layer (Step 9 tranche 4 phase 8 — Task 125)", () => {
  // comment-stripped: guards read CODE, never docs (phase-10 doc names the
  // retired selectors as history — that must not look like a live rule)
  // effective text, comments stripped — the retired-selector checks must stay
  // dead EVERYWHERE (globals + feature files), and the .dark .srs-panel root
  // block lives in practice/srs-panel.css since the §8.3 extraction (task 133)
  const lines125 = readEffectiveCss().replace(/\/\*[\s\S]*?\*\//g, "").split("\n");

  it("defines the four c-wash washes exactly once, light var() + dark panel-grade literal", () => {
    const defs: Record<string, [string, string]> = {
      "c-wash-rose": ["background-color: var(--color-rose-50);", "background-color: rgba(80, 18, 28, 0.4);"],
      "c-wash-amber": ["background-color: var(--color-amber-50);", "background-color: rgba(69, 48, 12, 0.45);"],
      "c-wash-emerald": ["background-color: var(--color-emerald-50);", "background-color: rgba(6, 55, 40, 0.5);"],
      "c-wash-teal": ["background-color: var(--color-teal-50);", "background-color: rgb(6 55 50 / 0.5);"],
    };
    for (const [cls, [light, dark]] of Object.entries(defs)) {
      expect(lines125.filter((l) => l.trim() === `.${cls} {`), `${cls} light base once`).toHaveLength(1);
      expect(lines125.filter((l) => l.trim() === `.dark .${cls} {`), `${cls} dark twin once`).toHaveLength(1);
      const li = lines125.findIndex((l) => l.trim() === `.${cls} {`);
      expect(lines125[li + 1].trim(), `${cls} light declaration byte-exact`).toBe(light);
      const di = lines125.findIndex((l) => l.trim() === `.dark .${cls} {`);
      expect(lines125[di + 1].trim(), `${cls} dark declaration byte-exact (retired scoped literal)`).toBe(dark);
    }
  });

  it("never re-grows the retired panel-grade wash retargets (srs-panel/rush-done/vocab-donut)", () => {
    const retired = [
      ".srs-panel .bg-rose-50",
      ".srs-panel .bg-amber-50",
      ".srs-panel .bg-emerald-50",
      ".srs-panel .bg-teal-50",
      ".srs-panel .border-teal-200",
      ".rush-done .bg-rose-50",
      ".rush-done .bg-amber-50",
      ".rush-done .bg-emerald-50",
      ".vocab-donut .bg-emerald-50",
      ".srs-panel .srs-fx-expand .text-emerald-600",
    ];
    for (const sel of retired) {
      expect(lines125.filter((l) => l.includes(sel)), `retired wash retarget must stay dead: ${sel}`).toEqual([]);
    }
  });

  it("folds the root border winner into .dark .srs-panel (the scoped (0,3,0) rule used to win)", () => {
    const start = lines125.findIndex((l) => l.trim() === ".dark .srs-panel {");
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    let body = "";
    for (let i = start; i < lines125.length; i++) {
      body += lines125[i] + "\n";
      depth += (lines125[i].match(/{/g) ?? []).length;
      depth -= (lines125[i].match(/}/g) ?? []).length;
      if (depth <= 0 && i > start) break;
    }
    expect(body).toContain("border-color: rgb(19 78 74 / 0.6);");
    expect(body).not.toContain("rgb(13 100 88 / 0.55)");
  });

  it("keeps the migrated files on the semantic classes (raw wash matrix, r125 consumer walk)", () => {
    const plainWash = (text: string) =>
      text.split("\n").filter((l) => /(^|[^:\-a-z])bg-(rose|amber|emerald|teal)-50(?![0-9/])/.test(l));
    // srs-panel: all four washes migrated; hover:bg-rose-50/amber-50 stay (kernel consumers)
    const srs = readFileSync(resolve(process.cwd(), "src/components/study/practice/srs-panel.tsx"), "utf8");
    expect(plainWash(srs).length, "srs-panel keeps only hover: variants").toBe(0);
    // vocab-donut: pill migrated; dead soft/track data deleted
    const donut = readFileSync(resolve(process.cwd(), "src/components/study/practice/vocab-donut.tsx"), "utf8");
    expect(plainWash(donut).length, "vocab-donut fully migrated").toBe(0);
    expect(donut).not.toContain("soft:");
    expect(donut).not.toContain("track:");
    // rush-view: exactly ONE documented kernel consumer (start-screen record chip)
    const rush = readFileSync(resolve(process.cwd(), "src/components/study/duel/rush-view.tsx"), "utf8");
    expect(plainWash(rush).length, "rush-view keeps the start-chip kernel consumer only").toBe(1);
    // spell-rush: exactly TWO documented kernel consumers (feedback pills in .rush-card)
    const spell = readFileSync(resolve(process.cwd(), "src/components/study/duel/spell-rush-view.tsx"), "utf8");
    expect(plainWash(spell).length, "spell-rush keeps the feedback pills kernel consumers only").toBe(2);
  });

  it("retires the three plain deviant wash rules (phase 10 — task 130 moved them onto classes)", () => {
    for (const sel of [".badge-popover .bg-emerald-50", ".report-month .bg-teal-50", ".rush-done .bg-sky-50"]) {
      expect(lines125.filter((l) => l.includes(sel)), `plain deviant must stay retired: ${sel}`).toEqual([]);
    }
  });
});

describe("globals.css deviant consolidation (Step 9 tranche 4 phase 10 — Task 130)", () => {
  // comment-stripped like the phase-8 band: the doc block names the retired
  // selectors and starts continuation lines with `.dark` — history is not law
  const lines130 = readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").split("\n");

  it("defines the three deviant washes exactly once, light var() + retired dark literal", () => {
    const defs: Record<string, [string, string]> = {
      "c-wash-emerald-soft": ["background-color: var(--color-emerald-50);", "background-color: rgba(6, 55, 40, 0.4);"],
      "c-wash-sky": ["background-color: var(--color-sky-50);", "background-color: rgba(8, 47, 60, 0.5);"],
      "c-wash-teal-deep": ["background-color: var(--color-teal-50);", "background-color: rgb(6 55 50 / 0.6);"],
    };
    for (const [cls, [light, dark]] of Object.entries(defs)) {
      expect(lines130.filter((l) => l.trim() === `.${cls} {`), `${cls} light base once`).toHaveLength(1);
      expect(lines130.filter((l) => l.trim() === `.dark .${cls} {`), `${cls} dark twin once`).toHaveLength(1);
      const li = lines130.findIndex((l) => l.trim() === `.${cls} {`);
      expect(lines130[li + 1].trim(), `${cls} light declaration byte-exact`).toBe(light);
      const di = lines130.findIndex((l) => l.trim() === `.dark .${cls} {`);
      expect(lines130[di + 1].trim(), `${cls} dark declaration byte-exact (retired scoped literal)`).toBe(dark);
    }
  });

  it("leaves the phase-8 panel-grade washes untouched (emerald stays 0.5, teal stays 0.5)", () => {
    expect(lines130.filter((l) => l.trim() === ".dark .c-wash-emerald {"), "panel-grade emerald once").toHaveLength(1);
    const ei = lines130.findIndex((l) => l.trim() === ".dark .c-wash-emerald {");
    expect(lines130[ei + 1].trim()).toBe("background-color: rgba(6, 55, 40, 0.5);");
    expect(lines130.filter((l) => l.trim() === ".dark .c-wash-teal {"), "panel-grade teal once").toHaveLength(1);
    const ti = lines130.findIndex((l) => l.trim() === ".dark .c-wash-teal {");
    expect(lines130[ti + 1].trim()).toBe("background-color: rgb(6 55 50 / 0.5);");
  });

  it("zero plain bg-fam-50 dark retargets remain in the whole stylesheet", () => {
    // plain = a `.bg-<fam>-50` class selector in a .dark rule; alpha variants
    // (bg-emerald-50\/40) excluded by the escape lookahead, hover state
    // utilities (hover\:bg-sky-50) never carry a `.bg-` prefix at all.
    const plainRetargets = lines130.filter(
      (l) => l.trim().startsWith(".dark") && /\.bg-(emerald|sky|teal|rose|amber)-50(?![0-9/\\])/.test(l)
    );
    expect(plainRetargets, "no plain bg-<fam>-50 scoped rule may reappear").toEqual([]);
  });

  it("keeps the migrated files on the semantic classes (raw deviant matrix, r130 consumer walk)", () => {
    const plain = (text: string, fam: string) =>
      text.split("\n").filter((l) => new RegExp(`(^|[^:\\-a-z])bg-${fam}-50(?![0-9/])`).test(l));
    const carry = (text: string, cls: string) => text.split(cls).length - 1;
    // badges.tsx: the congrats box was the ONLY bg-emerald-50; fully migrated
    const badges = readFileSync(resolve(process.cwd(), "src/components/study/practice/badges.tsx"), "utf8");
    expect(plain(badges, "emerald").length, "badges drops raw bg-emerald-50").toBe(0);
    expect(carry(badges, "c-wash-emerald-soft"), "badges carries c-wash-emerald-soft").toBe(1);
    // rush-view: the accuracy pill was the only plain bg-sky-50; start chip is amber (phase-8 matrix)
    const rush = readFileSync(resolve(process.cwd(), "src/components/study/duel/rush-view.tsx"), "utf8");
    expect(plain(rush, "sky").length, "rush-view drops raw bg-sky-50").toBe(0);
    expect(carry(rush, "c-wash-sky"), "rush-view carries c-wash-sky").toBe(1);
    // spell-rush: done pill migrated; exactly TWO documented kernel consumers stay raw
    //   (start-screen record chip + in-question hint chip — outside .rush-done)
    const spell = readFileSync(resolve(process.cwd(), "src/components/study/duel/spell-rush-view.tsx"), "utf8");
    expect(plain(spell, "sky").length, "spell-rush keeps start+hint kernel consumers only").toBe(2);
    expect(carry(spell, "c-wash-sky"), "spell-rush carries c-wash-sky").toBe(1);
    // report-card: the «جمع کل» pill was the only plain bg-teal-50; fully migrated
    const report = readFileSync(resolve(process.cwd(), "src/components/study/reports/report-card.tsx"), "utf8");
    expect(plain(report, "teal").length, "report-card drops raw bg-teal-50").toBe(0);
    expect(carry(report, "c-wash-teal-deep"), "report-card carries c-wash-teal-deep").toBe(1);
  });
});

describe("globals.css semantic ink layer (Step 9 tranche 4 phase 9 — Task 127)", () => {
  const css127 = readFileSync(cssPath, "utf8");
  const lines127 = css127.split("\n");

  it("defines c-ink-amber exactly once, light var() + dark panel-grade literal", () => {
    expect(lines127.filter((l) => l.trim() === ".c-ink-amber {"), "light base once").toHaveLength(1);
    expect(lines127.filter((l) => l.trim() === ".dark .c-ink-amber {"), "dark twin once").toHaveLength(1);
    const li = lines127.findIndex((l) => l.trim() === ".c-ink-amber {");
    expect(lines127[li + 1].trim(), "light declaration byte-exact (the utility's own token)").toBe(
      "color: var(--color-amber-700);"
    );
    const di = lines127.findIndex((l) => l.trim() === ".dark .c-ink-amber {");
    expect(lines127[di + 1].trim(), "dark declaration byte-exact (retired scoped literal)").toBe("color: #fcd34d;");
  });

  it("never re-grows the retired panel-grade ink retargets (5 scopes, incl. the dead daily-quests rule)", () => {
    const retired = [
      ".rush-done .text-amber-700",
      ".srs-panel .text-amber-700",
      ".rush-board .text-amber-700",
      ".skill-weak-cta .text-amber-700",
      ".daily-quests .text-amber-700",
    ];
    for (const sel of retired) {
      expect(lines127.filter((l) => l.includes(sel)), `retired ink retarget must stay dead: ${sel}`).toEqual([]);
    }
  });

  it("keeps the global dark amber band #fbbf24 for the plain consumers (untouched)", () => {
    expect(
      lines127.filter((l) => l.trim() === ".dark .text-amber-700 { color: #fbbf24; }"),
      "the plain-ink band survives exactly once"
    ).toHaveLength(1);
  });

  it("keeps the migrated files on the semantic ink class (raw ink matrix, r127 consumer walk)", () => {
    const rawInk = (text: string) => text.split("text-amber-700").length - 1;
    const carry = (text: string) => text.split("c-ink-amber").length - 1;
    // single-consumer files: fully migrated, zero raw ink left
    const zeros = [
      "src/components/study/practice/srs-panel.tsx",
      "src/components/study/duel/rush-view.tsx",
      "src/components/study/duel/rush-board.tsx",
      "src/components/study/practice/skill-panel.tsx",
    ];
    for (const f of zeros) {
      const text = readFileSync(resolve(process.cwd(), f), "utf8");
      expect(carry(text), `${f} carries c-ink-amber`).toBe(1);
      expect(rawInk(text), `${f} dropped raw text-amber-700`).toBe(0);
    }
    // spell-rush-view: the rush-done combo chip migrated + exactly ONE documented
    // plain consumer stays (the word-bank spell-chip, global band #fbbf24)
    const spell = readFileSync(resolve(process.cwd(), "src/components/study/duel/spell-rush-view.tsx"), "utf8");
    expect(carry(spell), "spell-rush carries c-ink-amber").toBe(1);
    expect(rawInk(spell), "spell-rush keeps only the spell-chip plain consumer").toBe(1);
  });
});

describe("per-feature CSS extraction (§8.3 wave 1 — task 133, wave 2 — task 135, wave 3 — task 137)", () => {
  // the r12 band's single-family rules now live beside their owners; the
  // manifest (src/app/features.css) keeps them always-loaded and at cascade
  // end — the wave-1 isolation scan proved no equal-specificity competition
  // outside the band (print band wins via !important; @utility defs lose to
  // unlayered author rules regardless of position).
  const KEY_SELECTORS: Record<string, string[]> = {
    "src/components/study/shared/confetti.css": ["@keyframes confetti-fall", ".confetti-piece { animation: confetti-fall 1.8s ease-in forwards; }"],
    "src/components/study/duel/rush.css": [".rush-time-low { animation: rush-pulse 0.9s ease-in-out infinite; }", ".dark .rush-hero {\n  background-image: linear-gradient(to bottom left, rgba(69, 48, 12, 0.5), rgba(88, 44, 14, 0.4), rgba(24, 21, 18, 0.92)) !important;\n  border-color: rgb(154 52 18 / 0.5);\n}", ".dark .rush-done {\n  background-image: linear-gradient(to bottom, rgba(88, 44, 14, 0.45), rgba(69, 48, 12, 0.4)) !important;\n  border-color: rgb(154 52 18 / 0.5);\n}", ".dark .rush-card { background-color: #1c1917; }", ".dark .rush-board { background-color: #1c1917; border-color: rgb(154 52 18 / 0.5); }", ".dark .rush-board-strip { background-image: linear-gradient(to left, rgba(88, 44, 14, 0.4), rgba(69, 48, 12, 0.3), transparent) !important; }", ".dark .rush-board-hint { background-image: linear-gradient(to left, rgba(88, 44, 14, 0.3), transparent) !important; }"],
    "src/components/study/duel/spell-input.css": [".dark .spell-input {", ".dark .spell-input:focus {"],
    "src/components/study/practice/srs-panel.css": [".srs-panel .border-white\\/60", ".dark .srs-panel {", ".dark .srs-panel .srs-due-chip {", ".dark .srs-donut { background-color: rgba(6, 44, 34, 0.5); box-shadow: none; border: 1px solid rgb(13 100 88 / 0.4); }"],
    "src/components/study/practice/skill-panel.css": [".dark .skill-panel { background-color: #1c1917; border-color: rgb(106 44 112 / 0.5); }", ".skill-weak-cta"],
    "src/components/study/reports/report-card.css": [".dark .report-dialog {", ".dark .report-foot {", ".dark .report-month { background-color: rgb(28 25 23 / 0.6); border-color: #37312b; }", ".dark .report-print-btn { background-color: #1c1917; border-color: rgb(4 120 87 / 0.6); color: #6ee7b7; }", ".dark .report-print-btn:hover { background-color: rgb(6 44 34 / 0.6); }"],
    // wave 3 (task 137) — the A4 paper family; the print band stays global
    "src/components/study/reports/official-report.css": [".official-overlay { background-color: rgb(12 10 9 / 0.68); }", ".dark .official-report {\n  --color-stone-50: #fafaf9;", ".or-table th { background-color: #f5f5f4;", ".or-teacher { background-color: #faf5ff;", ".or-chip-fresh {"],
    // wave 4 (task 139)
    "src/components/study/duel/duel-dark.css": [".dark .duel-hero {", ".dark .duel-card {", ".dark .duel-code {", ".dark .duel-hud {", '.dark .duel-done[class*="border-emerald-300"]', ".dark .leaderboard.duel-mode .ring-fuchsia-200", ".dark .leaderboard.duel-mode .from-fuchsia-300 {",
      // wave 8 (task 147): the dd-* outcome gradients, verbatim single lines
      ".dark .dd-win { background-image: linear-gradient(to bottom left, rgba(6, 55, 40, 0.55), rgba(19, 78, 74, 0.4)) !important; }",
      ".dark .dd-tie { background-image: linear-gradient(to bottom left, rgba(69, 48, 12, 0.55), rgba(88, 44, 14, 0.4)) !important; }",
      ".dark .dd-lose { background-image: linear-gradient(to bottom left, rgba(88, 18, 30, 0.55), rgba(124, 45, 18, 0.4)) !important; }"],
    // wave 5 (task 141)
    "src/components/study/practice/daily-quests.css": ["@keyframes reward-shine", ".reward-shimmer {", ".dark .daily-quests {", ".dark .daily-quests .bg-stone-50\\/60", ".dark .daily-quests .quest-row:hover", ".dark .daily-quests .quest-row.border-emerald-300 {", ".dark .daily-quests .text-emerald-800 { color: #a7f3d0; }"],
    // wave 2 (task 135)
    "src/components/study/shared/streak-flame.css": [".streak-flame {", "@keyframes flame-flicker {"],
    "src/components/study/shell/footer.css": [".footer-band {", ".dark .footer-band {"],
    "src/components/study/home/quote-band.css": [".quote-band::before {", ".dark .quote-band::before", ".dark .quote-band { background-image: linear-gradient(to left, rgba(69, 48, 12, 0.4), rgba(60, 34, 8, 0.3)) !important; }"],
    "src/components/study/home/home-hero.css": [".hero-book::after {", "@keyframes hero-sheen {"],
    "src/components/study/practice/badges.css": [".badge-shine::after {", "@keyframes badge-sheen {", ".badge-popover { animation: pop-fade 0.18s ease-out; }", "@keyframes pop-fade {"],
    "src/components/study/quiz/quiz-result.css": [".certificate-card {", ".dark .certificate-card .border-dashed"],
    "src/components/study/practice/weekly-chart.css": [".heat-cell {", "@media (max-width: 480px) {", ".dark .heat-cell.bg-emerald-200"],
    "src/components/study/lesson/word-of-day.css": [".word-day {", ".dark .word-day {", ".dark .word-day .text-emerald-700", ".dark .word-day .bg-emerald-600"],
    // wave 9 (task 149) — the dictionary state-filter chips, verbatim single lines
    "src/components/study/lesson/dictionary-view.css": [".dark .dict-state-chip.bg-stone-100:hover {", '.dark .dict-state-chip [class*="bg-stone-200"] {', ".dark .dict-state-chip.bg-stone-700 {"],
    // task 150 — the combined streak badge: born extracted beside its owner (ice guest ink duo)
    "src/components/study/practice/streak-badge.css": [".streak-ice {", ".dark .streak-ice {"],
    // wave 10 (task 151) — the bookshelf family: two theme-free spine rules
    // + two dark shelf gradients, all single-owner (home-bookshelf.tsx)
    "src/components/study/home/home-bookshelf.css": [".book-spine {", ".book-spine:hover {", ".dark .shelf-strip { background-image: linear-gradient(to bottom, #1c1917, #0f0d0c) !important; }", ".dark .shelf-edge { background-image: linear-gradient(to bottom, #3d372f, #26221d) !important; }"],
    // wave 12 (task 155) — the stat band's dark painter, single owner
    // (home-feed.tsx); the quote band's painter key lives on the wave-2
    // quote-band.css entry above
    "src/components/study/home/stat-band.css": [".dark .stat-band { background-image: linear-gradient(to left, rgba(6, 55, 40, 0.45), rgba(6, 44, 40, 0.3)) !important; }"],
    // wave 13 (task 157) — the my-words dark launcher family, verbatim
    // single lines (hero + cards/dictation pair + story)
    "src/components/study/practice/my-words-dark.css": [".dark .mywords-hero { background-image: linear-gradient(to left, rgba(69, 48, 12, 0.45), rgba(24, 21, 18, 0.95)) !important; }", ".dark .mywords-cards, .dark .mywords-dictation { background-image: linear-gradient(to left, rgba(59, 32, 96, 0.45), rgba(24, 21, 18, 0.95)) !important; }", ".dark .mywords-story { background-image: linear-gradient(to left, rgba(8, 47, 60, 0.45), rgba(24, 21, 18, 0.95)) !important; }"],
    // wave 14 (task 159) — the three remaining single-consumer launcher
    // painters, verbatim single lines (smart/konkur/dict-cta)
    "src/components/study/practice/smart-hero.css": [".dark .smart-hero { background-image: linear-gradient(to left, rgba(76, 29, 149, 0.45), rgba(24, 21, 18, 0.9)) !important; }"],
    "src/components/study/exam/konkur-hero.css": [".dark .konkur-hero { background-image: linear-gradient(to left, rgba(124, 45, 18, 0.62), rgba(24, 21, 18, 0.94)) !important; }"],
    "src/components/study/exam/exam-dict-cta.css": [".dark .exam-dict-cta { background-image: linear-gradient(to left, rgba(6, 55, 40, 0.5), rgba(24, 21, 18, 0.92)) !important; }"],
    // wave 15 (task 161) — the task-64 sweep band dissolved, verbatim
    // single lines (listen-hero/name-cta/onboard-paper/dict-setup)
    "src/components/study/home/listen-hero.css": [".dark .listen-hero { background-image: linear-gradient(to left, rgba(8, 51, 68, 0.5), rgba(19, 78, 74, 0.4), rgba(24, 21, 18, 0.92)) !important; }"],
    "src/components/study/duel/name-cta.css": [".dark .name-cta { background-image: linear-gradient(to left, rgba(6, 55, 40, 0.5), rgba(19, 78, 74, 0.4)) !important; }"],
    "src/components/study/shell/onboard-paper.css": [".dark .onboard-paper { background-image: linear-gradient(to left, rgba(6, 55, 40, 0.4), rgba(24, 21, 18, 0.92), rgba(24, 21, 18, 0.92)) !important; }"],
    "src/components/study/lesson/dict-setup.css": [".dark .dict-setup { background-image: linear-gradient(to bottom, rgba(59, 32, 96, 0.4), transparent) !important; }"],
  };

  it("keeps every extracted feature file present with its key selectors", () => {
    for (const [p, keys] of Object.entries(KEY_SELECTORS)) {
      const css = readFileSync(resolve(process.cwd(), p), "utf8");
      for (const k of keys) expect(css, `${p} lost key selector: ${k}`).toContain(k);
    }
  });

  it("globals.css no longer carries the single-family rules that moved", () => {
    const css = readFileSync(cssPath, "utf8");
    for (const gone of [
      "@keyframes confetti-fall",
      "@keyframes rush-pulse",
      "rgb(62 24 26 / 0.5)", // the moved .dark .rush-hero gradient's last stop (the r84 !important override uses rgba(..., 0.92))
      ".dark .rush-banner .c-veil-80",
      ".dark .rush-card { background-color: #1c1917; }",
      ".dark .rush-board { background-color: #1c1917;",
      ".dark .spell-input {",
      ".dark .srs-panel {",
      ".dark .skill-panel { background-color: #1c1917;",
      ".dark .report-dialog {",
      ".dark .report-week,",
      // wave 2 (task 135) — full moved rule heads; the tombstones are written
      // selector-pattern-free so these stay honest
      "@keyframes flame-flicker {",
      ".dark .footer-band {",
      ".quote-band::before {",
      "@keyframes hero-sheen {",
      ".badge-shine::after {",
      "@keyframes badge-sheen {",
      ".certificate-card {",
      ".heat-cell {",
      ".dark .heat-cell.bg-emerald-200",
      ".dark .word-day {",
      ".dark .word-day .text-emerald-700",
      ".dark .word-day .bg-emerald-600",
      ".badge-popover { animation: pop-fade",
      ".dictation-box {",
      // wave 3 (task 137) — \n-prefixed: the surviving print band references
      // some selectors as body.print-official descendants, so bare substrings
      // would false-positive (wave-3 script lesson)
      "\n.official-overlay {",
      "\n.or-band {",
      "\n.or-table th {",
      "\n.or-teacher {",
      "\n.or-chip-fresh {",
      "\n.dark .report-month {",
      // wave 4 (task 139) — \n-prefixed where substring risk exists (the ink
      // canonical groups and the stayed r115 trio reference duel members)
      "\n.dark .duel-hero {",
      "\n.dark .duel-code {",
      "\n.dark .duel-hud {",
      "\n.dark .duel-card .border-stone-100",
      "\n.dark .duel-done[class*=\"border-emerald-300\"]",
      "\n.dark .leaderboard.duel-mode .ring-fuchsia-200",
      "\n.dark .leaderboard.duel-mode .to-purple-400",
      "--color-emerald-100: #d0fae5",
      // wave 5 (task 141) — \n-prefixed where the stayed residents share the
      // .daily-quests prefix (the r115 trio + the c-track-80 group member)
      "@keyframes reward-shine {",
      "\n.reward-shimmer {",
      "\n.dark .daily-quests {",
      "\n.dark .daily-quests .border-dashed",
      "\n.dark .daily-quests .text-stone-300",
      "\n.dark .daily-quests .bg-stone-50\\/60",
      "\n.dark .daily-quests .bg-stone-50 {",
      "\n.dark .daily-quests .quest-row {",
      "\n.dark .daily-quests .quest-row:hover",
      "\n.dark .daily-quests .quest-row.border-emerald-300",
      "\n.dark .daily-quests .text-emerald-800",
      "\n.dark .daily-quests .text-emerald-600",
      // wave 6 (task 143) — \n-prefixed: the stayed print band carries
      // body.print-report .report-print-btn (descendant) — a bare substring
      // would false-positive (wave-3 script lesson); :hover is suffixed with
      // " {" to stay distinct from the plain head
      "\n.dark .report-print-btn {",
      "\n.dark .report-print-btn:hover {",
      // wave 7 (task 145) — \n-prefixed with " {" suffix: the stayed ink
      // canonical groups carry .dark .rush-hero .text-stone-700 /
      // .dark .rush-done .text-stone-600 / .dark .rush-board members — a
      // bare substring would false-positive (wave-3 lesson)
      "\n.dark .rush-hero {",
      "\n.dark .rush-done {",
      "\n.dark .rush-board-strip {",
      "\n.dark .rush-board-hint {",
      // wave 8 (task 147) — \n-prefixed with " {" suffix per the standing
      // lesson; the tombstone is written selector-pattern-free
      "\n.dark .dd-win {",
      "\n.dark .dd-tie {",
      "\n.dark .dd-lose {",
      // wave 9 (task 149) — \n-prefixed with " {" suffix per the standing
      // lesson; the tombstone is selector-pattern-free, and the \n prefix
      // keeps the stayed canonical-group member (line ~604: no :hover, and
      // the chip head there sits mid-line, not at line start) from
      // false-positiving
      "\n.dark .dict-state-chip.bg-stone-100:hover {",
      '\n.dark .dict-state-chip [class*="bg-stone-200"] {',
      "\n.dark .dict-state-chip.bg-stone-700 {",
      // wave 10 (task 151) — \n-prefixed with " {" suffix per the standing
      // lesson; tombstones are selector-pattern-free. The shelf heads must
      // stay distinct from the stayed .dark .stat-band / .dark .quote-band
      // band-neighbours (none share the prefix, but the discipline holds)
      "\n.book-spine {",
      "\n.book-spine:hover {",
      "\n.dark .shelf-strip {",
      "\n.dark .shelf-edge {",
      // wave 11 (task 153) — \n-prefixed with " {" suffix per the standing
      // lesson; tombstone selector-pattern-free (the r14 band frame retired
      // with its last resident)
      "\n.dark .srs-donut {",
      // wave 12 (task 155) — \n-prefixed with " {" suffix per the standing
      // lesson; tombstones selector-pattern-free. The band heads stay
      // distinct from the ::before mark already living in quote-band.css
      // (different property; the \n prefix keeps the wave-10 tombstone's
      // prose mention from false-positiving)
      "\n.dark .stat-band {",
      "\n.dark .quote-band {",
      // wave 13 (task 157) — \n-prefixed with " {" suffix per the standing
      // lesson; tombstone selector-pattern-free. The cards pair keeps its
      // full two-selector head — the \n prefix keeps it distinct from any
      // mid-line mention
      "\n.dark .mywords-hero {",
      "\n.dark .mywords-cards, .dark .mywords-dictation {",
      "\n.dark .mywords-story {",
      // wave 14 (task 159) — \n-prefixed with " {" suffix per the standing
      // lesson; the tombstone mentions only file paths (selector-pattern-free)
      "\n.dark .smart-hero {",
      "\n.dark .konkur-hero {",
      "\n.dark .exam-dict-cta {",
      // wave 15 (task 161) — \n-prefixed with " {" suffix per the standing
      // lesson; the tombstone mentions only file paths (selector-pattern-free)
      "\n.dark .listen-hero {",
      "\n.dark .name-cta {",
      "\n.dark .onboard-paper {",
      "\n.dark .dict-setup {",
    ]) {
      expect(css, `globals.css still carries a moved rule: ${gone}`).not.toContain(gone);
    }
  });

  it("keeps the cross-family canonical groups + utility overrides in globals.css", () => {
    const css = readFileSync(cssPath, "utf8");
    // the stone-600 ink canonical group (spanning rush/report/duel/gmetro)
    expect(css).toContain(".dark .rush-banner .text-stone-600,.dark .rush-hero .text-stone-600,.dark .rush-done .text-stone-600,");
    // the shared orange painters (rush family + report-paper)
    expect(css).toContain(".dark .rush-hero .text-orange-600,.dark .rush-score-live,.dark .rush-board .text-orange-600,.dark .report-paper .text-orange-600");
    expect(css).toContain(".dark .rush-hero .border-orange-200,.dark .rush-board .border-orange-200,.dark .report-paper .border-orange-200");
    // the hover utilities are consumed across teacher/my-words panels — global band stays
    expect(css).toContain(".dark .hover\\:bg-sky-50:hover");
    // wave 9 (task 149): the dict-state-chip ink member of the canonical group stays (multi-family)
    expect(css).toContain(".dark .gmetro-dialog .text-stone-600,.dark .dict-state-chip.bg-stone-100 { color: #c9c2bb; }");
    expect(css).toContain(".dark .hover\\:bg-violet-50:hover");
    // wave 5 (task 141): the r115 daily-quests ink trio stays at the first
    // member's position (its leaderboard.duel-mode member is the duel family)
    expect(css).toContain(".dark .daily-quests .text-violet-700,.dark .leaderboard.duel-mode .text-fuchsia-300");
  });

  it("features.css manifest imports all twenty-nine files; layout.tsx loads it right after globals.css", () => {
    const manifest = readFileSync(resolve(process.cwd(), "src/app/features.css"), "utf8");
    for (const p of featureCssPaths) {
      expect(manifest, `manifest line missing for ${p}`).toContain(`@import "${p.replace("src/", "../")}";`);
    }
    const layout = readFileSync(resolve(process.cwd(), "src/app/layout.tsx"), "utf8");
    const gi = layout.indexOf('"./globals.css"');
    const fi = layout.indexOf('"./features.css"');
    expect(gi, "layout imports globals.css").toBeGreaterThanOrEqual(0);
    expect(fi, "layout imports features.css").toBeGreaterThanOrEqual(0);
    expect(fi, "features.css must load right after globals.css").toBeGreaterThan(gi);
  });

  it("feature files carry no internally duplicated rule blocks (css-dupes per file)", () => {
    const { analyze } = require("../scripts/css-dupes.cjs");
    for (const p of featureCssPaths) {
      const a = analyze(resolve(process.cwd(), p));
      const dupes: string[] = [];
      for (const [, bs] of a.groups as Map<string, { start: number }[]>) {
        if (bs.length > 1) dupes.push(`${bs.length}x at L${bs.map((b: { start: number }) => b.start).join(",L")}`);
      }
      expect(dupes, `${p}: duplicate rule blocks: ${dupes.join("; ")}`).toEqual([]);
    }
  });
});
