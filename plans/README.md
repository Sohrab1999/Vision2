# plans/ — unslop audit artifacts

**Source audit:** `unslop.md` (2026-10-14, canon `public-2026.10.14-1`, index checksum `8e7ed6f1…ebcaf8`).
**Read-only rule:** everything in this folder is a plan or a ledger — no source code changes happen here. Execution mode (`unslop execute <plan>`) is a separate, explicit step.

## Plan index (execution order — design-system source first)

| # | Plan | Finding | Touches | Status |
|---|---|---|---|---|
| 1 | P1 reduced-motion — **executed via superior route**: existing `html.user-reduce-motion` kill-switch discovered in recon; OS preference ORed into the same channel (new `usePrefersReducedMotion` hook) + `MotionConfig` on the app root (third leg: framer JS animations ignore CSS 0.01ms). Draft's parallel `@media` block correctly NOT added (US-004). | F1 (G-9, red) | hook + study-app root | **DONE @ d429ca9** (task 183) |
| 2 | P6 motion budget (flip 0.42s / bars 0.3s / confetti ease-out) — **executed**: three value edits + 4 static contract tests; live-verified on a REAL flip (computed 0.42s); scope bound pinned: home-hero 0.45s entrance untouched | F6 (G-5+G-1) | globals.css ×2, weekly-chart.tsx | **DONE @ 5087aef** (task 185) |
| 3 | P9 44 px hit areas (header + 29-site census) — **executed via the grow pattern only**: every offender could honestly grow (h-11 w-11 / min-h-11 / min-w-11), so NO `.hit-44` pseudo utility was added (a dead utility would trip the consumer-existence guard); FAB verified already-44 | F9 (KR-3 hard) | header/settings/pills/nav/lesson/dictation/speak (10 files) | **DONE @ d2e40e2** (task 187) |
| 4 | P5 thin double-encoded edges (6 sites) — **executed**: error border dropped / chrome border-white dropped (computed 0px + shadow alive) / pwa border dropped / bookshelf hover capped at md / duel-done border-2 gone from all THREE white buttons / book-spine on stock shadow-xl | F5 (DEC-2/DEC-4/KR-5) | error/official/pwa/bookshelf/duel-done + `.book-spine` | **DONE @ 4a0b569** (task 187) |
| 5 | P10 press scale → exactly 0.96 (192 sites — re-censused: 95×153, 90×14, [0.98]×13, [0.99]×12) — **executed** + conventions comment in globals header + 3 static guard tests | F11 (KR-10 hard) | src-wide class sweep (54 files) | **DONE @ efce06b** (task 187) |
| 6 | P4 `transition-all` → scoped transitions (228 sites) — **executed**: deterministic classifier (`scripts/sweep-transition-all-r188.mjs`) per the plan's mapping table: colors-only → transition-colors (12), +scale/translate → [bg,color,border,transform] (81), +shadow/ring → box-shadow variants (77), +opacity (52), +fill,stroke (3), uncertain → safe superlist (61 — still layout-excluding); escape `data-[swipe=move]:transition-none` preserved; +3 guard tests | F4 (G-4, red) | src-wide class sweep (59 files) | **DONE @ 05c7ad9** (task 188) |
| 7 | P2 flip-card keyboard operability — **executed**; test caught a real secondary bug (Space double-toggle with the page-level useKeydown) → element answers Enter only, Space stays global | F2 (B-8a) | flashcards.tsx | **DONE @ d429ca9** (task 183) |
| 8 | P7 heading levels in 3 dialogs — **executed** + static no-jump guard over every src tsx | F7 (J-6) | rush-view / spell-rush-view / appendix-view | **DONE @ d429ca9** (task 183) |
| 9 | P3 arcade dialect: formalize **or** re-skin | F3 (DEC-9) | duel/dictation/explain + `@theme` | **DONE @ ac89b93** (task 190 — owner closed the fork as **Route A formalize**): 7 `--color-arcade-*` tokens in a deliberately NON-INLINE `@theme` block (inline bakes literal hexes — the .dark kernel remap cannot flow; live-probed) + `.arcade-hero` recipe (countdown's rose-500 drift normalized) + estate sweep: 16 raw violet→fuchsia pairs + 4 violet-50 washes + flashcards purple-600 unify (25 sites, 9 files); dark stops ported from class rules to kernel remaps (#5b21b6/#86198f + tints); rush/spell-rush/podium moods documented as deliberate; +7 guards `tests/arcade-dialect.test.ts` |
| 10 | P8 type scale tokens **or** documented idiom | F8 (B-3, 914 hits) | `@theme` + src-wide | **DONE @ ac89b93** (task 190 — owner closed the fork as **Route B documented idiom**): globals.css header records the census table (12×181 · 13×130 · 11×120 · 10×102 · 11.5×72 · 10.5×63 · 15×53 · 12.5×53 · 9.5×44 · 13.5×24 · 14×20 · 9×9) as THE scale; tokenization declined (≈887-site mechanical diff, zero visual delta); code stays free; 9px print exception noted; +3 guards `tests/type-scale-idiom.test.ts` |

Note-only (no plan): **F10** hex painters → **EXECUTED (task 189)**: shared palette module `src/lib/ui-colors.ts` (35 leaf constants, Tailwind-named) + codemod `scripts/sweep-ui-colors-r189.mjs` — 124 hex literals across 9 painters swapped, zero leftovers; guard test `tests/ui-colors.test.ts` (import + zero-hex + module well-formedness). Exemptions honored: `global-error.tsx` / `layout.tsx` (platform-required), arbitrary-class hexes (CSS context).
Watch-items (no plan): DEC-8 tools-grid pastel tiles · DEC-7 single kicker (clean) · paper masthead gradient (documented print design).

**Status after task 190: ALL TEN PLANS CLOSED.** The unslop estate is fully executed — P1–P10 done, F10 executed, both REQUIRES-APPROVAL forks closed by the owner (P3 → Route A formalize, P8 → Route B documented idiom). Final reconcile @ ac89b93: transition-all 0 · press-scale 0.96-only · raw arcade pairs 0 (40 token refs) · purple-600 0 · type literals 887 = the documented idiom.

## Rules for executors

1. Execute in table order; one plan per commit; stamp the commit hash in the Status column (`DONE @ <short-hash>`).
2. Every plan's "Scope bounds" and "Verification" sections are binding. Contract tests must stay green: `bunx tsc --noEmit` · `bun run lint` · `bun run test` (1180/1180, 106 files @ task 190) · `tests/css-hygiene.test.ts` · `tests/print-pagination-contract.test.ts`.
3. Persian UI strings are quoted verbatim in plans — never "translate" or "improve" them.
6. Archive note: `orphan-executor-tests/` + `orphan-executor-wip.patch` are historical artifacts of the task-183 execution collision (superseded by the committed versions in `tests/`). Keep for provenance, do not execute.
4. The two `REQUIRES-APPROVAL` plans must not be auto-executed; the owner closes the stated forks first.
5. Re-run `unslop reconcile` (or re-run the audit's detector sections) after each executed plan and update the Status column.
