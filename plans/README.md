# plans/ — unslop audit artifacts

**Source audit:** `unslop.md` (2026-10-14, canon `public-2026.10.14-1`, index checksum `8e7ed6f1…ebcaf8`).
**Read-only rule:** everything in this folder is a plan or a ledger — no source code changes happen here. Execution mode (`unslop execute <plan>`) is a separate, explicit step.

## Plan index (execution order — design-system source first)

| # | Plan | Finding | Touches | Status |
|---|---|---|---|---|
| 1 | P1 reduced-motion — **executed via superior route**: existing `html.user-reduce-motion` kill-switch discovered in recon; OS preference ORed into the same channel (new `usePrefersReducedMotion` hook) + `MotionConfig` on the app root (third leg: framer JS animations ignore CSS 0.01ms). Draft's parallel `@media` block correctly NOT added (US-004). | F1 (G-9, red) | hook + study-app root | **DONE @ d429ca9** (task 183) |
| 2 | P6 motion budget (flip 0.42s / bars 0.3s / confetti ease-out) | F6 (G-5+G-1) | globals.css ×2, weekly-chart.tsx | OPEN · `TOUCHES-DS` |
| 3 | P9 44 px hit areas (header + 29-site census) | F9 (KR-3 hard) | globals.css +1 utility, header/settings/others | OPEN · `TOUCHES-DS` |
| 4 | P5 thin double-encoded edges (6 sites) | F5 (DEC-2/DEC-4/KR-5) | error/official/pwa/bookshelf/duel-done + `.book-spine` | OPEN · `TOUCHES-DS` |
| 5 | P10 press scale → exactly 0.96 (172 sites) | F11 (KR-10 hard) | src-wide class sweep | OPEN |
| 6 | P4 `transition-all` → scoped transitions (228 sites) | F4 (G-4, red) | src-wide class sweep | OPEN |
| 7 | P2 flip-card keyboard operability — **executed**; test caught a real secondary bug (Space double-toggle with the page-level useKeydown) → element answers Enter only, Space stays global | F2 (B-8a) | flashcards.tsx | **DONE @ d429ca9** (task 183) |
| 8 | P7 heading levels in 3 dialogs — **executed** + static no-jump guard over every src tsx | F7 (J-6) | rush-view / spell-rush-view / appendix-view | **DONE @ d429ca9** (task 183) |
| 9 | P3 arcade dialect: formalize **or** re-skin | F3 (DEC-9) | duel/dictation/explain + `@theme` | **BLOCKED · `REQUIRES-APPROVAL`** (fork) · `TOUCHES-DS` |
| 10 | P8 type scale tokens **or** documented idiom | F8 (B-3, 914 hits) | `@theme` + src-wide | **BLOCKED · `REQUIRES-APPROVAL`** (fork) · `TOUCHES-DS` |

Note-only (no plan): **F10** hex painters → suggested shared `lib/ui-colors.ts` palette module (US-004, non-blocking).
Watch-items (no plan): DEC-8 tools-grid pastel tiles · DEC-7 single kicker (clean) · paper masthead gradient (documented print design).

## Rules for executors

1. Execute in table order; one plan per commit; stamp the commit hash in the Status column (`DONE @ <short-hash>`).
2. Every plan's "Scope bounds" and "Verification" sections are binding. Contract tests must stay green: `bunx tsc --noEmit` · `bun run lint` · `bun run test` (1121/1121, 93 files) · `tests/css-hygiene.test.ts` · `tests/print-pagination-contract.test.ts`.
3. Persian UI strings are quoted verbatim in plans — never "translate" or "improve" them.
6. Archive note: `orphan-executor-tests/` + `orphan-executor-wip.patch` are historical artifacts of the task-183 execution collision (superseded by the committed versions in `tests/`). Keep for provenance, do not execute.
4. The two `REQUIRES-APPROVAL` plans must not be auto-executed; the owner closes the stated forks first.
5. Re-run `unslop reconcile` (or re-run the audit's detector sections) after each executed plan and update the Status column.
