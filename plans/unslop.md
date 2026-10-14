# UNSLOP Audit — Vision 2 (ویژن ۲)

**Date:** 2026-10-14 · **Mode:** `unslop` full pipeline (read-only) · **Auditor:** Super Z
**Scope:** `src/**` UI source (54 components in 11 feature folders + `app/` + `globals.css`) + live screens at `http://127.0.0.1:3000`.
**Hard rule honored:** no source file was created, edited, or reverted for this audit. Only `plans/unslop.md`, `plans/README.md` (this run's outputs) and 3 evidence screenshots under `download/` were produced.

---

## 0 · Provenance (pinned for this run)

| Artifact | Value |
|---|---|
| Canon server | `unslop-canon` v0.1.0 at `https://oleg.design/unslop/mcp` (resources only, no tools) |
| Canon version | **`public-2026.10.14-1`** (published 2026-10-14T00:00:00Z) |
| Index checksum | **`8e7ed6f1e54e14f7d951242788a4a045cfd121d653147aa142980ee216ebcaf8`** |
| Connection method | Raw MCP **streamable-HTTP JSON-RPC over curl** (`initialize` → instructions index → `resources/read` ×3). No `Mcp-Session-Id` was issued; the server is stateless. |
| Topics read | `copy` (7,762 B), `interface` (31,795 B; topic checksum `5c72bb1d…8af33`), `process` (8,075 B, `always`) — topics selected by the index globs: `*.tsx/*.ts/*.css/*.md` all match `copy`+`interface`; `process` is `always`. |
| Canon caveat (honest) | The SDK-based `canon-route.mjs` helper was **not** run: this is a skill-only install with no plugin `node_modules/`, and the skill forbids npm downloads without owner consent. Topic payloads were read directly over the wire (schema-valid JSON, per-topic checksums verified by the server's own index). Per the skill's own rule, **no canon-certified "pass" is issued**; every finding below is either detector-backed (machine) or labelled **judgement** with its rule ID, mode and strength quoted from the fetched payloads. |
| Detector | `scripts/detect.mjs` from `github.com/0design/unslop-skill` @ skill version **1.0.3**, run as `node detect.mjs src --json` → 3,202 raw hits / 2,072 red (raw JSON kept ephemerally; counts and verdicts are in §2). |
| Live evidence | `download/audit-01-dashboard.png` · `download/audit-02-duel.png` · `download/audit-03-report.png` |
| Repo rule citations | Rule IDs prefixed **B/DS/D/E/G/H/I/J** = detector catalog; **DEC/KR/XP/LK/US/UR** = canon `interface`/`copy`/`process` topics (all `judgement`, `hard` unless noted). |

---

## 1 · Recon (Phase 1) — what this project actually is

- **Stack:** Next.js App Router + React 19 + TypeScript, **Tailwind v4 CSS-first** (`@import "tailwindcss"`; `@theme` inside `src/app/globals.css` is the token source), framer-motion, zustand (persist), lucide-react (direct imports, no icon adapter), RTL Persian UI for 11th-grade English learners.
- **Design system:** the `@theme` block re-pins the stone scale and dark variants; `scripts/css-*.cjs` generators + `tests/css-hygiene.test.ts` lock tokens, tones and duplicate-freedom — an unusually rigorous, contract-tested DS for a hand-rolled project. The **print family** (`.or-*`, `.report-paper`) is deliberately hand-hexed in globals.css with photocopy-contrast contracts (documented in `tests/print-pagination-contract.test.ts`).
- **Conventions:** radii on a coarse scale (`rounded-xl/2xl/3xl/full`), press feedback via `active:scale-*`, durations via Tailwind classes and framer-motion props, Persian numerals everywhere via `faNum()`, honest empty states («—», never fabricated zeros), toasts via shadcn `useToast`.
- **Two visual dialects (verified, undocumented):** the study world speaks **stone/emerald/teal/amber on paper-white**; a second **violet/fuchsia/sky** dialect appears only in the arcade (duel/rush/spell-rush) and the AI-explain chip. No doc or comment records this as a deliberate decision.
- **Contract inputs:** token source = `src/app/globals.css` (`@theme` + `.dark` block). Copy lives inline in components (no content files). Imagery: no external/stock images (detector I-section clean).

## 2 · Verification ledger (Phase 3) — 3,202 raw hits → 11 filed findings

Adversarial re-check of every detector class before filing (Hard Rule 4). Dropped classes are named, not hidden.

| Rule | Raw | Filed | Verdict |
|---|---|---|---|
| B-2 Tailwind palette class | 1,534 | 0 | **Architecture N/A.** The rule's premise ("the theme cannot re-skin them") fails on Tailwind v4: palette utilities compile to `var(--color-*)` and `@theme`+`.dark` re-pin them — re-skinning is centralized. Real palette-*choice* issues are filed under F3. |
| DS-2a hardcoded hex in token-aware file | 283 | 0 | **All 283 are in `globals.css` itself** — the token source. Values belong there by definition; the rule's own note ("fix in the design system") points at the file where they already live. Locked by css-hygiene contracts. |
| B-3 arbitrary value utility | 914 | 1 systemic (F8) | Real: the project's entire type scale is ad-hoc `text-[9px]…text-[110px]` literals. Pervasive, DS-level. |
| G-4 transition on every property | 163 | 1 systemic (F4) | Verified `transition-all` (e.g. `app/error.tsx:44`). Systemic sweep plan. |
| B-1 raw hex in styles | 89 | 0 filed, 1 note (F10) | Concentrated in canvas/SVG painters (`result-image.ts` 63, `skill-stats.ts` 10, `vocab-donut` 4, `layout.tsx` 2, `global-error` 8) — painters cannot read Tailwind tokens; hex constants there *are* the generator's palette. Note-only. |
| B-4 icon imported from set | 74 | 0 | lucide-direct **is** the project's icon convention (single set, no swaps). Adapter layer would be ceremony. Accepted deviation. |
| G-5 UI duration > 300 ms | 52 | 3 (F6) | De-noised: ~44 hits are toast `duration: 3000` (display time, not motion — false positive). Confirmed: `.flip-card` 0.55 s, weekly-chart bars 0.45 s, `confetti-fall` 1.8 s. |
| H-1 em dashes in copy | 42 | 0 | 41 are code comments (not copy); the one user-facing hit (meta description, `app/layout.tsx:72`) has a single dash — below "too many". |
| E-4 thick border on rounded card | 12 | 1 cluster (F5) | Verified in duel CTAs/cards; bg fill already carries the boundary — border-2 is decoration. |
| B-7 inline style w/ hex | 7 | 0 | `app/global-error.tsx` **must** be self-contained (renders when CSS may not load). Intentional; severity white. |
| E-8 ad-hoc shadow | 7 | folded into F5 | `book-spine:hover` 4-value shadow + `shortcut-guide` — real but same elevation story. |
| E-5 extreme radius / glow | 6 | folded into F3 | `rounded-3xl` gradient icon tiles (duel-setup 152, rush-view 272, spell-rush 322), grammar hero gradient panel, **home-hero glow blob** (`bg-emerald-200/40 blur-2xl`). |
| E-3 hairline border + diffuse shadow | 4 | 1 cluster (F5) | Verified: `app/error.tsx:25` (`border c-card shadow-lg`), `official-report.tsx:261` chrome (`border-white/15 … shadow-2xl backdrop-blur`), `pwa-layer.tsx:244` (`border … shadow-2xl backdrop-blur`), `home-bookshelf.tsx:73` (`border c-card shadow-sm hover:shadow-lg`). |
| D-4 grey text on colored bg | 6 | 0 | **Contrast-verified false positives:** all are stone-700 (#44403c) / stone-600 (#57534e) ink on stone-100/50 paper pairs in the print family — ratio ≈ 9.9:1. The rule targets mid-grey on saturated color; these are dark-on-light. |
| B-8a non-semantic click target | 2 | 1 (F2) | **flashcards.tsx:192 REAL** (details below); official-report backdrop-click dropped — standard modal pattern, keyboard users have the Esc contract (`useEscape`), and a focusable backdrop would be worse. |
| B-6a fetch w/o loading/error/empty | 1 | 0 | `explain-box.tsx` renders all three states (`status === "error"` :81, disabled+loading :100/:103, done branch). Detector limitation. |
| J-6 heading level jump | 3 | 1 cluster (F7) | Verified: `appendix-view` h1→h3 (27→89), `rush-view` h1→h3 (279→346), `spell-rush-view` same pattern (394). |
| D-3 gradient-filled text | 1 | 1 (F3) | `home-hero.tsx:58` — `bg-gradient-to-l from-emerald-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent`. |
| G-1 `ease-in` on UI motion | 1 | 1 (F6) | `globals.css:671` `confetti-fall … ease-in`. |
| G-9 no prefers-reduced-motion | 1 | 1 (F1) | 54 animating files, zero reduced-motion handling. Project-wide a11y gap. |
| I-1a/I-2, G-2, G-6, G-10, C-4/C-6/C-9, J-3a/J-4 | 0 | — | Clean (no broken/stock images, no scale(0), no width/height animation, no overlays without transform-origin, no crushed tracking on display text, no line-height/padding offenders). |

**Net: 11 findings filed (F1–F11), 9 fix plans written (P1–P9), 3 of them carry blocking flags.**
