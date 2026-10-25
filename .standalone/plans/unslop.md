# UNSLOP Audit — Vision 2 (ویژن ۲) — COMPLETE

**Date:** 2026-10-14 · **Mode:** `unslop` full pipeline (read-only) · **Status:** findings + fix plans complete
**Scope:** `src/**` UI source (54 components in 11 feature folders + `app/` + `globals.css`) + live screens at `http://127.0.0.1:3000`.
**Hard rule honored:** no source file was created, edited, or reverted for this audit. Outputs: `plans/unslop.md`, `plans/README.md`, evidence screenshots under `download/audit-*.png`. DB restored to baseline afterwards (app_open=2, attempts=0).

> **Reconciliation note.** Two independent audit runs happened on 2026-10-14 against the same canon pin. A first run ("Super Z", cron-triggered) wrote §0–§2 below and was interrupted before writing the findings detail and plans it promised. A second run (this document's completion) re-connected the same canon server, re-ran the detector **per section** (uncapped), took **8 live screenshots incl. a 390 px mobile pass**, and added two canon findings the first run missed (**F9 touch targets — live-measured; F11 press-scale ≠ 0.96 — canon-hard, detector-blind**). §0–§2 are preserved from the first run with light amendments marked; §3–§6 are this run's completion. Where the two runs disagree on detail, the corrected value is used and flagged.

---

## 0 · Provenance (pinned for both runs)

| Artifact | Value |
|---|---|
| Canon server | `unslop-canon` v0.1.0 at `https://oleg.design/unslop/mcp` (resources only, no tools) |
| Canon version | **`public-2026.10.14-1`** (published 2026-10-14T00:00:00Z) — **identical in both runs** |
| Index checksum | **`8e7ed6f1e54e14f7d951242788a4a045cfd121d653147aa142980ee216ebcaf8`** — identical in both runs |
| Connection method | Raw MCP **streamable-HTTP JSON-RPC over curl** (`initialize` → instructions index → `resources/read`). No `Mcp-Session-Id` issued; server is stateless. |
| Topics read (run 2) | `copy` (7,018 B text), `interface` (29,411 B), `process` (7,324 B, `always`) — routed by index globs: `*.tsx/*.ts/*.css/*.md` all match `copy`+`interface`; `process` is `always`. (Run 1 reported wire-escaped envelope bytes 7,762/31,795/8,075 — same payloads.) |
| Checksum verification (run 2, closes run 1's caveat one notch) | Run 1 verified topic payloads "by the server's own index". Run 2 additionally **recomputed** each topic's payload hash — `sha256(canonical-compact-JSON(payload))` — and matched all three against BOTH the index-declared and envelope-declared checksums: `copy 0d66b691…7c44` · `interface 5c72bb1d…8af33` · `process 13ba3aec…1253`. Schema/version/topic names validated (`schemaVersion 1`, `version public-2026.10.14-1`). The SDK helper `canon-route.mjs` was still **not** run (no plugin `node_modules/`, no npm install without consent) → per the skill's own rule, **no canon-certified "pass" is issued**; every finding is detector-backed (machine) or labelled **judgement** with rule ID / class / strength quoted from the fetched payloads. |
| Detector | `scripts/detect.mjs` from `github.com/0design/unslop-skill` @ skill version 1.0.3. Run 1: single full pass (3,202 raw hits). Run 2: **per-section passes** `--rules C,D,DS,E,F,G,H,I,J` on `src/` (exact counts in §2), plus a B-section pass (hit its 500-finding cap; census completed by grep: `transition-all` ×228, `active:scale-*` ×172). |
| Live evidence (run 2) | `download/audit-01-dashboard.png` · `02-tools` · `03-reportcard` · `04-coverage` · `05-official` · `06-lesson` · `07-duel` · `08-mobile390.png` (run 1's `02-duel`/`03-report` also kept). |
| Repo rule citations | **B/DS/D/E/G/H/I/J** = detector catalog; **DEC/KR/XP/LK/US/UR** = canon `interface`/`copy`/`process` topics (all `judgement`; `hard`/`soft` as supplied). |

## 1 · Recon (Phase 1) — what this project actually is

- **Stack:** Next.js App Router + React 19 + TypeScript, **Tailwind v4 CSS-first** (`@theme` inside `src/app/globals.css` is the token source), framer-motion, zustand (persist), lucide-react (direct imports, no icon adapter), RTL Persian UI for 11th-grade English learners.
- **Design system:** the `@theme` block re-pins the stone scale and dark variants; `tests/css-hygiene.test.ts` + contract tests lock tokens, tones, duplicates, and the print family. The **print family** (`.or-*`, `.report-paper`) is deliberately hand-hexed in globals.css with photocopy-contrast contracts (documented, pinned by `tests/print-pagination-contract.test.ts`) — under Hard Rule 6 these are **sourced decisions**, not findings.
- **Conventions:** radii on a coarse scale (`rounded-xl/2xl/3xl/full`), press feedback via `active:scale-*`, durations via Tailwind classes and framer-motion props, Persian numerals everywhere via `faNum()`, honest empty states («—», never fabricated zeros), toasts via shadcn `useToast`, `min-h-11` (44 px) intended as the touch-target primitive.
- **Two visual dialects (verified by both runs; census corrected by run 2):** the study world speaks **stone/emerald/teal/amber on paper-white**; a second **violet/fuchsia/sky** family is real but spreads wider than run 1 recorded: dictation-tab (25 violet/fuchsia class hits), the whole duel/arcade family (~50), smart-practice, skill-panel, appendix-view, and the AI-explain chip (`explain-box.tsx:54-101`). **No doc or comment records this as a deliberate decision** → filed F3.
- **Contract inputs:** token source = `src/app/globals.css` (`@theme` + `.dark` block). Copy lives inline in components (no content files). Imagery: no external/stock images (detector I-section clean).

## 2 · Verification ledger (Phase 3) — raw hits → 11 filed findings

Adversarial re-check of every detector class before filing (Hard Rule 4). Dropped classes are named, not hidden. Run 1's counts from its full pass; run 2's per-section counts in parentheses where they differ.

| Rule | Raw | Filed | Verdict |
|---|---|---|---|
| B-2 Tailwind palette class | 1,534 | 0 | **Architecture N/A.** The rule's premise ("the theme cannot re-skin them") fails on Tailwind v4: palette utilities compile to `var(--color-*)` and `@theme`+`.dark` re-pin them — re-skinning is centralized. Real palette-*choice* issues are filed under F3. |
| DS-2a hardcoded hex in token-aware file | 283 (283) | 0 | **All 283 in `globals.css` itself** — the token source (run 2 sampled 10: `--color-*` definitions, `.dark` re-pins, comment lines). Values belong there by definition; locked by css-hygiene contracts. |
| B-3 arbitrary value utility | 914 | 1 systemic (F8) | Real: the project's entire type scale is ad-hoc `text-[9px]…text-[110px]` literals. Pervasive, DS-level. |
| G-4 transition on every property | 163 (163) | 1 systemic (F4) | Verified `transition-all` — run 2 census: **228 occurrences in src** (error.tsx:44, header.tsx:81/94/105, settings-popover:126, home-hero:69/77, home-tools:53, duel-done:292/302…). Systemic sweep plan P4. |
| B-1 raw hex in styles | 89 (89) | 0 filed, 1 note (F10) | Concentrated in canvas/SVG painters (`result-image.ts` 63, `skill-stats.ts` 10, `vocab-donut` 4, `confetti.tsx` 1, `daily-quests` SVG 1, `global-error` 8, `layout.tsx` 2). Painters cannot read Tailwind classes; `global-error` must be self-contained (renders before CSS); `layout.tsx` hexes are `<meta theme-color>` (platform constraint). **DS-source improvement note → P7-filed-as-F10, no blocking plan.** |
| B-4 icon imported from set | 74 | 0 | lucide-direct **is** the project's icon convention (single set, no swaps). Adapter layer would be ceremony. Accepted deviation (US-001). |
| G-5 UI duration > 300 ms | 52 (52) | 3 (F6) | De-noised (run 2 confirms): ~44 hits are toast `duration: 3000` (display lifetime, not motion — false positive). Confirmed real: `.flip-card` 0.55 s (globals.css:258), weekly-chart bars 0.45 s (weekly-chart.tsx:119/126), `confetti-fall` 1.8 s (globals.css:671). Ambient infinite loops (flame-flicker 1.6 s, badge-sheen 3.2 s, rush-pulse 0.9 s, reward-shine 2.4 s, hero-sheen 6 s) verified **intentional** one-off/ambient sequences — they become findings only via F1 (no reduced-motion escape). |
| H-1 em dashes in copy | 42 (42) | 0 | Run 1: "41 are code comments". Run 2 correction: the hits are mostly **Persian UI strings** — «—» is standard Persian typographic punctuation AND the product's documented honest-empty-cell marker (worklog rounds 174–181, contract-tested). Language convention + sourced decision (US-001, Hard Rule 6) → not findings. |
| E-4 thick border on rounded card | 12 (12) | 1 cluster (F5) | Verified in duel CTAs/cards; bg fill already carries the boundary — border-2 is decoration. `border-dashed` empty-state frames (leaderboard:218) are honest-empty-state styling (documented convention). |
| B-7 inline style w/ hex | 7 | 0 | `app/global-error.tsx` **must** be self-contained (renders when CSS may not load). Intentional; severity white. |
| E-8 ad-hoc shadow | 7 (7) | folded into F5 | `book-spine:hover` 4-value shadow (globals.css:280) + kbd key-caps (fine — real key-cap affordance); print `box-shadow:none` resets are print hygiene, not UI. |
| E-5 extreme radius / glow | 6 (6) | folded into F3 | `rounded-3xl` gradient icon tiles (duel-setup 152, rush-view 272, spell-rush 322), **home-hero glow blob** (`bg-emerald-200/40 blur-2xl`). |
| E-3 hairline border + diffuse shadow | 4 (4) | 1 cluster (F5) | Verified: `app/error.tsx:25` (`border c-card shadow-lg`), `official-report.tsx:261` chrome (`border-white/15 … shadow-2xl backdrop-blur`), `pwa-layer.tsx:244`, `home-bookshelf.tsx:73`. |
| D-4 grey text on colored bg | 6 (6) | 0 | **Contrast-verified false positives:** all are stone-700 (#44403c) / stone-600 (#57534e) ink on stone-100/50 paper pairs in the print family — ratio ≈ 9.9:1. The rule targets mid-grey on saturated color. |
| B-8a non-semantic click target | 2 | 1 (F2) | **flashcards.tsx:192 REAL** (run 2 re-verified: `<div className="flip-card …" onClick role="button" aria-label>` — labeled but **not keyboard-focusable**; Enter/Space cannot flip). official-report backdrop-click dropped — standard modal pattern, Esc contract exists (`useEscape`). |
| B-6a fetch w/o loading/error/empty | 1 | 0 | `explain-box.tsx` renders all three states (`status === "error"` :81, disabled+loading :100/:103, done branch). Detector limitation. |
| J-6 heading level jump | 3 (3) | 1 cluster (F7) | Verified: `appendix-view` h1→h3 (27→89), `rush-view` h1→h3 (279→346), `spell-rush-view` (394). |
| D-3 gradient-filled text | 1 (1) | 1 (F3) | `home-hero.tsx:58` — `bg-gradient-to-l from-emerald-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent` (on-brand hues, but ad-hoc, not a DS recipe). |
| G-1 `ease-in` on UI motion | 1 (1) | 1 (F6) | `globals.css:671` `confetti-fall … ease-in` (falling-confetti physics argument noted; canon treats `ease-in` UI motion as the tell). |
| G-9 no prefers-reduced-motion | 1 (1) | 1 (F1) | 54 animating files, **zero** reduced-motion handling (run 2 re-grep: 0 hits). Project-wide a11y gap. |
| — (canon, run 2 only) | — | 1 (F9) | **KR-3 touch targets** (hard): live measurement on mobile 390 — 7 of 11 header buttons below 44 px (`تنظیمات/حالت شب/فرمان‌یاب` 36×36, `خانه/دیکشنری` 39×31, progress pill 67×32, profile 44×38); code census: 29 hit-areas at 32–40 px. The app is a phone-first PWA. |
| — (canon, run 2 only) | — | 1 (F11) | **KR-10 press scale** (hard: "scales to exactly 0.96"): census `active:scale-95` ×~150, `active:scale-90` ×~10 ("a deeper squeeze … is a finding"), `active:scale-[0.98]` ×1 ("no feedback" side). 172 sites total. Detector-blind (canon judgement rule). |
| I-1a/I-2, G-2, G-6, G-10, C-4/C-6/C-9, J-3a/J-4, F, C, I sections | 0 | — | Clean (no broken/stock images, no scale(0), no width/height animation, no overlays without transform-origin, no crushed tracking, no line-height/padding offenders; F and C sections zero). |

**Run-2-only manual canon checks, verified clean (no findings):** TY-1 (zero `tabular-nums`/`slashed-zero`) · KR-19 (`font-mono` only inside `<kbd>` — allowed technical use) · KR-18 (no `scroll-behavior:smooth`; one print-reset `auto !important`) · KR-8 (no root smoothing override) · XP-31 (no marker-less indented lists) · C-11 (no uppercase transforms; Persian has no case) · XP-33 (no placeholder/service text in UI) · US-009 (no agent notes on screen; matches were code comments) · LK-01 (no false urgency) · KR-20 (ISO strings go to storage/CSV files only; UI shows `fa-IR` dates) · XP-18 (white-opacity `c-veil` family per documented r87 contract; no gray tokens on colored fills) · DEC-6 (muted text is stone-500 ≥4.5:1; stone-400 banned by contract 172) · DEC-7 (one deliberate kicker in hero, systematic) · DEC-8 (tools grid: equal-weight launcher where cards are clicked-as-a-whole → DEC-3-exempt; **watch-item**, see F-note) · KR-15 (entrances intentional per design) · NR-02 (no icon morphing; plain crossfades) · J-12 (no `<details>`) · KR-7 (no forced breaks) · KR-4/KR-5/KR-11 spot checks.

**Net: 11 findings filed (F1–F11), 10 fix plans written (P1–P10).** Blocking flags: **P3 REQUIRES-APPROVAL + TOUCHES-DS · P8 REQUIRES-APPROVAL + TOUCHES-DS**; non-blocking `TOUCHES-DS` on P1, P5, P6, P9. *(F9/F11 numbers were unassigned in the interrupted draft; run 2 assigns them to the two canon findings above.)*

---

## 3 · Findings (full detail, severity order)

Severity: 🔴 red-hard (systemic or a11y) → 🟠 orange (single-surface hard canon) → 🟡 white/soft (notes).

### F1 · 🔴 No `prefers-reduced-motion` anywhere (G-9, machine) — plan P1
54 files animate (framer-motion entrances, ambient loops, card flips); `grep prefers-reduced-motion src/` = **0 hits**. Motion-sensitive users get everything. Fix at DS source.

### F2 · 🔴 Flip-card is a keyboard-dead click target (B-8a, machine) — plan P2
`src/components/study/lesson/flashcards.tsx:192-196`:
```tsx
<div
  className={`flip-card ${flipped ? "flipped" : ""} h-64 cursor-pointer select-none sm:h-72`}
  onClick={() => setFlipped((f) => !f)}
  role="button"
  aria-label="برگرداندن کارت"
>
```
Labeled, but no `tabIndex` and no key handling → keyboard users cannot flip the primary study object of the flashcards screen.

### F3 · 🟠 The violet/fuchsia/sky "arcade dialect" is undocumented and not in the DS (DEC-9 hard + DEC-2/DEC-4 + D-3 + E-5, machine+judgement) — plan P3 · **REQUIRES-APPROVAL, TOUCHES-DS**
The duel hero is a **full-bleed violet→fuchsia gradient** (screenshot `download/audit-07-duel.png`): `duel-done.tsx:292` CTA `bg-gradient-to-l from-violet-600 to-fuchsia-600`, duel-setup:152 / rush-view:272 / spell-rush-view:322 `rounded-3xl bg-gradient-to-br` icon tiles, `leaderboard.tsx:218` fuchsia dashed frame, `explain-box.tsx:101` `from-violet-50 to-fuchsia-50` chip, dictation-tab (25 class hits), sky accents in 6 home/lesson files. Plus the on-brand-but-ad-hoc `home-hero.tsx:58` gradient headline text and the emerald glow blob. DEC-9's exact example is "a purple gradient hero in a project without such a brand"; the house brand (paper/print/report/home) is stone+emerald/teal, and the project's own rule bans blue/indigo hues — violet/fuchsia live in no token, no recipe, no comment. **This is the single strongest generic-AI tell in the app** (SKILL.md posture: "the purple gradient").
**Fork (owner closes):** (a) *formalize* — name the arcade dialect in `@theme`/recipe form (e.g. `--arcade-gradient-from/to`, a `.arcade-hero` recipe) and document it as brand; or (b) *re-skin* the arcade family to the house emerald/teal/amber range. Tradeoff: (a) keeps the playful battle identity at the cost of a documented second brand; (b) unifies but loses the intentional mood contrast the duel mode may be using.

### F4 · 🔴 `transition-all` on 228 elements (G-4 red, machine) — plan P4
Transitioning every property animates properties nobody meant (including layout): `error.tsx:44`, `home-tools.tsx:53` (hover:-translate-y + shadow), `header.tsx:81/94/105`, `settings-popover.tsx:126`, `duel-done.tsx:292/302`, `flashcards.tsx:185`, ui/switch.tsx & ui/toast.tsx (shadcn stock)…

### F5 · 🟠 Double-encoded edges: hairline border + wide diffuse shadow on non-layer surfaces (DEC-2/DEC-4/KR-5 hard, E-3/E-4/E-8 machine) — plan P5
Verified sites: `app/error.tsx:25` (`rounded-2xl border c-card p-8 shadow-lg` — standalone card, not a layer), `official-report.tsx:261` chrome (`border-white/15 + shadow-2xl + backdrop-blur` — a real floating layer: shadow justified, border is the redundant second cue), `pwa-layer.tsx:244` (`border-emerald-200 + shadow-2xl shadow-emerald-900/15 + backdrop-blur`), `home-bookshelf.tsx:73` (`border c-card shadow-sm hover:shadow-lg` — hover deepens a shadow on a bordered, non-lifted card), `duel-done.tsx:302/312` (`border-2 border-stone-200 bg-white` — fill already separates; 2px border is decoration), `globals.css:280` `book-spine:hover` 4-value ad-hoc shadow.

### F6 · 🟠 Motion budget outliers + `ease-in` on UI motion (G-5/G-1, machine) — plan P6
`.flip-card { transition: transform 0.55s … }` (globals.css:258) — a direct interaction; weekly-chart bars 0.45 s; `confetti-fall 1.8s ease-in` (globals.css:671). Canon KR-16: direct feedback 100–160 ms, context changes within budget; G-1: `ease-in` is the exiting-motion tell.

### F7 · 🟡 Heading level jumps in three dialogs (J-6, machine) — plan P7
`rush-view.tsx:346` and `spell-rush-view.tsx:394` open result screens with `<h3>` after an `h1` (skip); `appendix-view.tsx:89` same. A11y polish, screen-reader outlines.

### F8 · 🟡 The type scale is 914 ad-hoc `text-[Npx]` literals (B-3, machine) — plan P8 · **REQUIRES-APPROVAL, TOUCHES-DS**
Sizes from 9px to 110px picked per block (`text-[9px]`, `text-[10.5px]`, `text-[11.5px]`, `text-[12.5px]`, `text-[13.5px]`…). No named scale exists; rhythm is by eye. **Fork:** (a) tokenize a minimal named scale for the ~10 recurring sizes in `@theme` (`--text-xs-*`-style) and sweep; or (b) accept as documented project idiom (Persian micro-typography at 9–11px is deliberate in places, e.g. print labels). Tradeoff: (a) is a large mechanical diff with real consistency payoff; (b) costs nothing but leaves the drift open. (Detector severity: white.)

### F9 · 🔴 Touch targets below 44×44 on a phone-first PWA (KR-3 hard, canon — run 2) — plan P9
Live-measured (mobile 390, header): `تنظیمات`/`حالت شب`/`فرمان‌یاب` **36×36**, `خانه`/`دیکشنری` **39×31**, progress pill **67×32**, `پروفایل` **44×38**. Code census: **29 interactive elements** sized 32–40 px (`h-9 w-9`, `h-8 w-8`, `h-10 w-10` icon buttons in header.tsx, settings-popover.tsx:126, study-app FAB, exam/duel icon buttons). KR-3: "every interactive element has a hit area of at least 44×44 px" on touch screens; neighboring hit areas must not overlap.

### F10 · 🟡 Note-only: raw hex painters outside the token system (B-1, machine) — DS note, no blocking plan
`result-image.ts` (63), `skill-stats.ts` (10), `vocab-donut.tsx` (4), `confetti.tsx` (1), `daily-quests.tsx` SVG (1). Canvas/SVG painters can't read Tailwind classes; the hexes manually duplicate the palette. **DS-source improvement (US-004):** one shared TS palette module (`lib/ui-colors.ts` exporting the ~20 stone/emerald/… constants, typed, consumed by every painter) so canvas output can't drift from the CSS tokens. Suggested, not blocking. (`global-error.tsx`/`layout.tsx` hexes are platform-required, exempt.)

### F11 · 🔴 Press feedback scale ≠ 0.96 (KR-10 hard, canon — run 2) — plan P10
Census: `active:scale-95` ×~150 · `active:scale-90` ×~10 (deeper squeeze = finding) · `active:scale-[0.98]` ×1 (no-feedback side) · `scale-100` resets. Canon: "A pressed button responds with scale(0.96); no feedback and a deeper squeeze are both findings." Detector-blind (judgement rule) — found via canon text, verified by grep.

### Watch-items (no plan, no flag)
- **DEC-8 tools grid** (home-tools): 9–11 identical icon-tile cards, pastel-rainbow tiles. Cards are clicked-as-a-whole navigation objects (DEC-3-exempt launcher) and equal weight is intended for a menu; the pastel-tile-per-item look is the part to keep an eye on. If a future redesign touches this grid, prefer one neutral tile treatment with color only on the glyph.
- **DEC-7 kicker**: exactly one hero kicker — systematic, fine.
- Paper masthead gradient (`official-report`): on-brand emerald gradient, documented print design, contract-pinned — not a finding.

---

## 4 · Fix plans (Phase 4 — execution order: DS-source first)

> Readiness test applied: each plan is executable with zero conversation context. Persian UI strings are quoted verbatim; do not "translate" them. All plans assume the repo's contract tests must stay green (`bunx tsc --noEmit`, `bun run lint`, `bun run test` = 1121/1121, 93 files, plus `tests/css-hygiene.test.ts` and `tests/print-pagination-contract.test.ts`).

### P1 — Global `prefers-reduced-motion` escape hatch — `TOUCHES-DS`
- **Problem:** F1 / G-9 (machine, red). 54 animating files, zero reduced-motion handling.
- **Target:** a single media block in `src/app/globals.css`, placed **after** all animation/transition definitions (current file ends ~line 1490+; append at end of the non-print layer, before or after the print block but outside `@media print`):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  plus framer-motion: in the four ambient-loop sources — `flame-flicker` consumer (home-today streak flame), `badge-sheen`/`hero-sheen` consumers, `rush-pulse` (duel timer), `reward-shine` — gate with `const reduce = useReducedMotion()` from `framer-motion` and skip rendering the animated element (or set `animate={false}`) when true.
- **Repo conventions:** globals.css already ends print/hygiene layers with contract comments — add `/* r182-a: reduced-motion escape (unslop F1) */` above the block. `useMounted`/hooks live in `src/lib` / `src/hooks`.
- **Steps:** 1) append CSS block; 2) `bunx tsc --noEmit`; 3) add `useReducedMotion` gates in the four loop consumers (import from `framer-motion`, early-return `null` or static fallback); 4) run full gates; 5) verify visually with OS-level emulate (or DevTools rendering tab).
- **Scope bounds:** do NOT touch the print family (`.or-*`, `.report-*` — print never animated); do not reorder existing rules; do not change durations.
- **Verification:** grep `prefers-reduced-motion` ≥1 hit; gates green; `agent-browser` smoke: dashboard renders without motion errors; the flip-card still flips normally with motion enabled.
- **Status:** `TOUCHES-DS` (edit lands in the token/recipe source file).

### P2 — Make the flip-card keyboard-operable
- **Problem:** F2 / B-8a. `flashcards.tsx:192` div-as-button without focus or keys.
- **Target:** same element gains `tabIndex={0}` and key handling:
  ```tsx
  <div
    className={/* unchanged */}
    onClick={() => setFlipped((f) => !f)}
    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }}
    role="button"
    tabIndex={0}
    aria-label="برگرداندن کارت"
  >
  ```
  plus `focus-visible:ring-2 focus-visible:ring-emerald-500` on the same className (the project's focus contract uses visible rings; see `tests/focus-visible` hygiene conventions — keep the existing ring pattern used elsewhere in this file's buttons).
- **Repo conventions:** existing buttons in the same file use `focus-visible:ring-*` utilities; `useEscape`-style keyboard contracts exist app-wide.
- **Steps:** 1) apply the edit; 2) gates; 3) keyboard check: Tab reaches the card, Enter/Space flips, ring visible.
- **Scope bounds:** do not convert the div to `<button>` (it contains block layout that buttons would restyle); do not touch flip CSS.
- **Verification:** jsdom check optional; manual Tab+Enter in browser; gates green.
- **Status:** no flags.

### P3 — Name or re-skin the arcade dialect — **`REQUIRES-APPROVAL` · `TOUCHES-DS`**
- **Problem:** F3 / DEC-9 hard. Violet→fuchsia full-bleed gradient hero + gradient icon tiles + gradient chip + 25-hit dictation usage + sky accents in 6 files; zero DS presence, zero documentation.
- **The fork (owner closes before execution):**
  - **Route A — formalize:** add to `@theme`: `--color-arcade-from: #7c3aed; --color-arcade-to: #c026d3;` (or keep current literal hues) + a documented `.arcade-hero` recipe in globals.css; sweep the ~10 gradient call-sites to use the tokens; add a comment block documenting "arcade dialect = deliberate battle-mode brand".
  - **Route B — re-skin:** replace violet/fuchsia in duel/dictation/explain with the house range (emerald-700 CTAs, amber/rose accents already in the palette), keep the duel mood via depth (stone-900 panels + emerald glow) instead of hue.
  - **Tradeoff:** A keeps a second brand (risk: the exact "purple gradient" AI tell the canon names, now at least documented and consistent); B unifies the brand but loses an intentional mood contrast that may be load-bearing for the battle mode's feel. Owner decides; no default.
- **Repo conventions (either route):** gradient direction in this repo is `to-l`/`to-br` with `from-*`/`to-*` pairs; documented recipes live in globals.css with a `/* rNNN: … */` comment.
- **Steps (Route A template):** 1) add the two tokens + recipe; 2) sweep `bg-gradient-to-l from-violet-600 to-fuchsia-600` (duel-done.tsx:292), `rounded-3xl bg-gradient-to-br from-violet-*…` (duel-setup:152, rush-view:272, spell-rush-view:322), explain-box:101, dictation-tab sites → token/recipe; 3) document in the recipe comment; 4) gates + visual pass of duel setup/done, dictation, AI-chip.
- **Scope bounds:** do not touch the paper masthead gradient (documented print design); do not touch home-hero gradient text unless the owner folds it into this decision (it is on-brand and lower risk).
- **Verification:** no remaining literal `from-violet-600 to-fuchsia-600` outside the recipe; css-hygiene + full gates green; screenshots of duel-setup/done/dictation match the chosen route.
- **Status:** `REQUIRES-APPROVAL` (fork above) · `TOUCHES-DS` (tokens/recipe land in globals.css).

### P4 — Sweep `transition-all` → scoped transitions — product-wide (US-010)
- **Problem:** F4 / G-4 red. 228 sites.
- **Target (mechanical mapping, applied by inspecting each line's actual hover/active effects):**
  | current effects on the element | replace `transition-all` with |
  |---|---|
  | `hover:bg-*` only (or + text/border color) | `transition-colors` |
  | `hover:bg-* active:scale-*` | `transition-[background-color,color,border-color,transform]` |
  | `hover:shadow-*` or translate | `transition-[background-color,color,box-shadow,transform]` |
  | toast/switch (shadcn stock data-state transforms) | `transition-[transform,background-color,border-color,color]` |
- **Repo conventions:** arbitrary transition-property lists already appear in the codebase (e.g. `transition-[transform]`-style utilities in ui components); keep the same bracket syntax.
- **Steps:** 1) `rg -n "transition-all" src/` → 228 lines; 2) for each, read the sibling hover/active/data-state classes and pick from the table; 3) when unsure, `transition-[background-color,color,border-color,box-shadow,transform]` (safe superset that still excludes layout properties); 4) gates; 5) spot-check ten interactions (tabs, cards, duel CTA, settings, toast) for visual regressions.
- **Scope bounds:** do not change durations or easings in this sweep (P6 owns outliers); do not touch `@keyframes` animations; keep shadcn `ui/*` diffs minimal (they are stock but project-owned).
- **Verification:** `rg -c "transition-all" src/` = 0; gates green; no interaction visually changed (before/after screenshots of home-tools card hover and duel CTA).
- **Status:** no flags (instance-level sweep; no DS source change).

### P5 — Thin double-encoded edges (border + wide shadow on non-layers)
- **Problem:** F5 / DEC-2+DEC-4+KR-5 hard (E-3/E-4/E-8 machine evidence).
- **Target, per verified site:**
  - `app/error.tsx:25`: drop `shadow-lg` (bordered card on plain backdrop is one cue enough) **or** drop `border` and keep `shadow-lg` as the layer cue — prefer dropping the border: `rounded-2xl c-card p-8 text-center shadow-lg`.
  - `official-report.tsx:261`: keep `shadow-2xl backdrop-blur` (real floating layer), drop `border-white/15`.
  - `pwa-layer.tsx:244`: keep `shadow-2xl backdrop-blur`, drop `border-emerald-200`.
  - `home-bookshelf.tsx:73`: replace `border c-card … shadow-sm hover:shadow-lg` with `c-card … shadow-sm hover:shadow-md` and keep the border **only if** it marks the interactive boundary (it does — keep border, cap hover at `shadow-md` so the shadow stays within surface-system steps).
  - `duel-done.tsx:302/312`: drop `border-2` (bg fill already separates): `rounded-2xl bg-white px-6 …`.
  - `globals.css:280` `.book-spine:hover`: replace ad-hoc `0 18px 32px -12px rgb(0 0 0 / 0.25)` with the project's closest stock step (`box-shadow: 0 12px 24px -8px rgb(0 0 0 / 0.25)` is not a token — instead use Tailwind's `shadow-xl` value `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`), commented as the elevation-system step.
- **Repo conventions:** `c-card` is the surface token; elevation steps elsewhere use Tailwind shadow scale (`shadow-sm/md/lg/2xl`); input/control boundaries keep their borders (DEC-2 exceptions — do NOT touch inputs, option buttons, kbd).
- **Steps:** per-site edits → gates → visual pass (error page, official chrome, PWA layer, bookshelf hover, duel done, book hover).
- **Scope bounds:** print family untouched; do not remove borders from inputs/controls/data tables (DEC-2 exceptions); keep focus/selection rings.
- **Verification:** E-section detector re-run on the five files returns ≤2 (remaining are layer-justified); gates green.
- **Status:** `TOUCHES-DS` (one rule inside globals.css — the `.book-spine` recipe).

### P6 — Motion budget: flip, chart bars, confetti easing
- **Problem:** F6 / G-5+G-1 (machine).
- **Target:** `.flip-card` transition `0.55s → 0.42s` (keeps the deliberate card-flip feel, exits the >0.5 outlier band; a full context change may exceed 160 ms — this is a judgement call, documented); `weekly-chart.tsx:119/126` `duration: 0.45 → 0.3`; `confetti-fall` `ease-in → ease-out` (canon G-1: entering UI motion eases out; the gravity argument is noted and overruled by canon — falling confetti is decoration, not physics simulation).
- **Repo conventions:** durations in the repo cluster at 150–300 ms; framer transitions use explicit `ease: "easeOut"` already (weekly-chart does).
- **Steps:** three value edits (globals.css:258, globals.css:671, weekly-chart.tsx:119/126) → gates → feel-check: flip a card, load weekly chart, trigger a celebration.
- **Scope bounds:** ambient loops untouched (P1 gates them); toast durations are display lifetimes — untouched.
- **Verification:** detector `--rules G` on the three files = clean; gates green.
- **Status:** `TOUCHES-DS` (two rules in globals.css).

### P7 — Heading levels in three result/appendix screens
- **Problem:** F7 / J-6.
- **Target:** `rush-view.tsx:346` `<h3 …>چالش تمام شد!</h3>` → `<h2>`; `spell-rush-view.tsx:394` same → `<h2>`; `appendix-view.tsx:89` `<h3 …>{group.title}</h3>` → `<h2>`. Adjust sibling CSS only if the visual size was carried by the tag (it is not — sizes come from classes `text-xl`/`text-[15px]`, which stay).
- **Repo conventions:** dialogs in this repo open at `h1` (279/27/394 are the `h1`s); section heads inside dialogs are `h2`.
- **Steps:** three tag swaps → gates → screen-reader outline sanity (or headless DOM assert `h2` exists).
- **Scope bounds:** no visual class changes; no other heading renumbering.
- **Verification:** detector `--rules J` on the three files = 0; gates green.
- **Status:** no flags.

### P8 — Type scale tokens — **`REQUIRES-APPROVAL` · `TOUCHES-DS`**
- **Problem:** F8 / B-3 (914 hits). No named scale; sizes by eye.
- **The fork (owner closes):** (a) tokenize the ~10 recurring sizes (`--text-2xs: 10px`, `--text-xs+: 11.5px`, `--text-sm+: 12.5px`, `--text-base+: 13.5px` … Persian-tuned names) in `@theme`, sweep literals → tokens, keep `text-[9px]` print micro-labels as documented exceptions; or (b) declare the literal scale a project idiom (document in globals.css header comment) and leave code as-is. Tradeoff: (a) buys consistency and future re-skinning at the cost of a very large mechanical diff across ~50 files (regression risk bounded by the screenshot suite); (b) costs nothing now, keeps drift.
- **Repo conventions (Route A):** `@theme` already re-pins stone/white tokens with contract tests; a new `--text-*` family follows the same pattern and must be added to css-hygiene's single-definition guards.
- **Steps (Route A template):** 1) add tokens; 2) update `tests/css-hygiene.test.ts` guards; 3) sweep highest-frequency sizes first (`text-[11.5px]` → `text-xs+` etc.) file by file; 4) screenshot-compare report-card, official paper, home, lesson; 5) gates.
- **Scope bounds:** print family sizes pinned by `tests/print-pagination-contract.test.ts` — do not change their rendered values; if tokens produce identical values, tests stay green.
- **Verification:** B-section detector on `src/` drops from 914 to the documented exception set; full gates green; screenshot suite unchanged.
- **Status:** `REQUIRES-APPROVAL` (fork) · `TOUCHES-DS` (`@theme`).

### P9 — 44 px hit areas on touch — `TOUCHES-DS`
- **Problem:** F9 / KR-3 hard (live-measured: header buttons 36×36–39×31; census 29 sites).
- **Target:** add one DS utility to globals.css (near the focus/ring utilities):
  ```css
  .hit-44 { position: relative; }
  .hit-44::after { content: ""; position: absolute; inset: -6px; } /* extends hit area, not visuals */
  ```
  …**or** the simpler Tailwind-native pattern used by the codebase for key CTAs: wrap visual size in padding (`p-2.5` around a 24 px glyph keeps the button 44 px while the icon stays 24 px). Apply to the measured offenders: `header.tsx:81/94/105` (36×36 → `h-11 w-11` or `p-2` wrapper), `settings-popover.tsx:126`, study-app FAB, progress pill (`67×32` → min-h-11), lesson/footer icon buttons (the 29-site census list).
- **Repo conventions:** `min-h-11` is already the project's touch primitive on primary buttons (`error.tsx:44`, `home-hero.tsx:69`) — this plan extends the same primitive to icon buttons; overlapping hit areas are forbidden (KR-3) — header has ~12 px gaps, expanding by 4 px per side is safe.
- **Steps:** 1) apply `h-11 w-11` (or padding pattern) to header icon buttons; 2) re-run the live measurement eval (must report all header buttons ≥44); 3) sweep the 29-site census; 4) gates + mobile-390 screenshots before/after.
- **Scope bounds:** visual glyph sizes stay (24 px icons remain 24 px); do not shrink any currently-≥44 target; desktop-only elements (`hidden sm:flex`) still need the fix (they render on tablet widths).
- **Verification:** the audit's own measurement eval returns `small:[]` for the header; gates green; no layout shift at 390 px (no overflow per the standing 390 check).
- **Status:** `TOUCHES-DS` (adds one utility to globals.css).

### P10 — Press feedback to exactly 0.96 — product-wide (US-010)
- **Problem:** F11 / KR-10 hard (canon judgement; detector-blind).
- **Target:** `active:scale-95` → `active:scale-[0.96]` (~150 sites) · `active:scale-90` → `active:scale-[0.96]` (~10) · `active:scale-[0.98]` → `active:scale-[0.96]` (1, home-tools.tsx:53). Mechanical, one sweep, `rg -n "active:scale-" src/` as the worklist.
- **Repo conventions:** none exist for the value (that is the finding); after the sweep add one line to the conventions comment in globals.css header: `/* press feedback: active:scale-[0.96] everywhere (unslop KR-10) */`.
- **Steps:** 1) sweep; 2) grep verify `active:scale-` has only the `0.96` form; 3) gates; 4) feel-check three buttons (primary CTA, icon button, tool card).
- **Scope bounds:** do not touch `hover:` scales, entrance keyframes, or the flip transform; do not bundle with P4 (keep diffs reviewable).
- **Verification:** `rg "active:scale-(?!\\[0\\.96\\])" src/ --pcre2` = 0; gates green.
- **Status:** no flags.

---

## 5 · Summary for the owner

**Findings by severity (highest first):**
🔴 **F1** reduced-motion gap (54 files) · **F2** keyboard-dead flip-card · **F4** `transition-all` ×228 · **F9** touch targets <44 px (live-measured on a phone-first PWA) · **F11** press scale ≠ 0.96 (172 sites)
🟠 **F3** undocumented violet/fuchsia arcade dialect (the classic purple-gradient tell) · **F5** border+shadow double-encoding (6 sites) · **F6** motion outliers + `ease-in` confetti
🟡 **F7** heading jumps ×3 · **F8** 914 ad-hoc type sizes · **F10** hex-painter note (shared palette module suggested)

**Decisions pulled to the top (`REQUIRES-APPROVAL`) — these are choices, not tasks:**
1. **P3** — arcade dialect: formalize as a documented second brand **or** re-skin to the house palette.
2. **P8** — type scale: tokenize a named Persian-tuned scale **or** declare the literal sizes a documented idiom.

**Execution order (DS-source first):** P1 → P6 → P9 → P5 → P10 → P4 → P2 → P7 → (blocked: P3, P8 awaiting owner).
**What was checked and found clean:** the entire copy canon (XP-33/US-009/LK-01/KR-20/DEC-5-adjacent: no fabricated metrics — every number on screen comes from user data), TY-1, KR-19, KR-18, XP-18, DEC-6, DEC-7, DEC-8 (launcher exemption; watch-item), KR-15, NR-02, J-12, KR-7, XP-31, C-11, and detector sections C, F, I (zero).
**Honest limits:** the SDK canon helper was not run (no consent for npm installs in this environment) — the canon is wire-verified and payload-hash-recomputed, but per the skill's own rule this run issues **no canon-certified pass**; all canon-rule findings are labelled judgement with quoted rule text. Screenshots cover 8 screens (dashboard, tools, report-card, coverage, official paper, lesson, duel, mobile-390); the remaining screens (exam, grammar metro, SRS, dictionary, appendix, settings, onboarding, error) were audited at source level and via the detector, not visually.
