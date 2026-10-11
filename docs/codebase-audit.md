# Vision 2 — Codebase Architecture Audit

**Date:** 2026-10-12 · **Auditor:** Z.ai Code (4 parallel deep-dive agents + manual verification) · **Mode:** read-only, no code changed
**Scope:** all 123 source files (~24,100 LOC), 9 API routes, socket.io mini-service (:3003), Prisma/SQLite schema, 10 test files, dependencies, folder structure, git hygiene.

**Verification bar:** every High-severity claim below was independently re-verified by reading the exact lines (`git ls-files`, `sed -n`, `ss -tlnp`, `EXPLAIN QUERY PLAN`, grep sweeps). Line numbers refer to the working tree at audit time.

---

## 0. Executive Summary

**Health snapshot (the good news):**

| Metric | Result |
|---|---|
| TypeScript strictness | 0 `any` / 0 `as any` (1 false hit = a comment) |
| TODO/FIXME/HACK debt | 0 |
| console.log leakage | 0 |
| eslint/ts-ignore suppressions | 0 |
| Tests | 126/126 passing (pure-domain, vitest) |
| Store selector discipline | 0 wholesale-subscribers; all 37 components use field selectors |
| JSON.parse on untrusted input | 100% guarded; no raw SQL (Prisma everywhere) |
| EventDay retention | rotating (60d) — the model to copy |

The codebase is **hygienic but architecturally loaded**. The systemic problems are not sloppiness — they are **concentration** (god store, god components), **duplication by accretion** (~20 copy-paste families, some already diverged), **a bundle that ships everything to everyone**, **an unbounded dark-mode CSS tax**, and **a security model with three soft spots** (credentials committed to git, spoofable rate limiting, non-CSPRNG sync codes).

**Top 5 risks, ranked by (impact ÷ effort):**

1. 🔴 `.env` + `db/custom.db` (plaintext learner write-secrets) are git-tracked and **pushed to GitHub daily by the backup cron**.
2. 🔴 Rate limiting is bypassable: backends bind `0.0.0.0`, so attackers hitting `:3000` directly choose their own `X-Forwarded-For` (fresh bucket per request) — and the same limiter guards the paid LLM/TTS routes and sync-code brute force.
3. 🟠 Zero code-splitting: all 12 views + the 371 KB data layer (~110 KB gzip) + socket.io-client ship in the first paint of a 5-line route.
4. 🟠 `duel-view.tsx` (931 lines, 19 useState) leaks a countdown interval on unmount and re-renders its whole tree at 10 Hz.
5. 🟠 Sync credential (`newCode()`) is generated with `Math.random()`; the code is the *only* credential for reading **and overwriting** a learner's cloud snapshot (which now embeds their write-secret).

---

## 1. Unusually Large Files

| File | LOC | Role | Verdict |
|---|---|---|---|
| `src/components/study/duel-view.tsx` | 931 | Socket duel: lobby→countdown→play→result | **God component** — 6 responsibilities, 0 sub-components, 19 useState, 9 useRef, 6 useEffect |
| `src/data/grammar-lessons.ts` | 924 | 15 PPP micro-lessons | Fine by design (structured content, not logic) |
| `src/components/study/home-view.tsx` | 808 | Home dashboard | **God component** — 10 hidden sections, 15 store selectors |
| `src/lib/study-store.ts` | 668 | Zustand store | **God store** — 38 fields + 27 actions = 16 domains |
| `src/data/lesson2/1/3.ts` | 669/645/644 | Book content | Structural data; issue is bundling (§5 P-1), not size |
| `src/components/study/quiz-engine.tsx` | 656 | Shared quiz engine | `finish()` = 7 responsibilities in one function (L79–154) |
| `src/components/study/dictation-tab.tsx` | 635 | Dictation practice | 3 phases inline; duplicates quiz-engine finish pattern |
| `src/components/study/rush-view.tsx` | 588 | 60s rush minigame | Confetti+HUD+result inline; 5th timer implementation |
| `src/components/study/official-report.tsx` | 559 | Printable report modal | Hand-rolled portal modal; computes 9 memos while closed |
| `src/components/study/konkur-view.tsx` | 557 | Konkur simulator | `ModeCard` + `sourceOf` verbatim duplicates of exam-view |
| `src/components/study/header.tsx` | 552 | App header | Profile popover is a 200-line inline mega-panel (L325–525) |
| `src/app/globals.css` | 1,209 | Global styles | **516 dark-mode rule blocks, 142 namespaces, 18 duplicated selectors, 2 section comments** |

---

## 2. God Classes / Over-stuffed Components

### G-1 — `src/lib/study-store.ts` — the god store · **High**
- **Exact problem:** One `StudyState` (L95–164) holds **38 data fields** (33 persisted) + **27 actions** spanning ≥16 domains: navigation, vocabulary knowledge, quiz results, SRS ladder, identity/secret, profile, streak+freeze economy, day-stats, mistake bank, word-risk, konkur coverage, rush, duel, settings, badge UI state, embedded analytics side-effects. 37 components / 251 `useStudy` references depend on it. Every new feature (grammar roadmap phases 3–5!) appends here — shotgun surgery is guaranteed.
- **Fix:** Split into zustand **slices** combined in one `create()`; extract pure domain functions; move side-effects to a subscribe-based effects layer.
- **Pattern:** Store slices / duck modules + effects layer; thin composition root.
- **Modularize:** see §11.1 (`src/state/` tree).
- **Impact:** maintainability ↑↑ (merge conflicts, test surface, cognitive load shrink); enables independent slice tests; SRS slice becomes reusable for grammar rule-cards (roadmap phase 4). Performance: stops cross-domain re-render fan-out (one `trackReview` write today re-renders HomeView + DailyQuests + WeeklyChart + Header simultaneously).

### G-2 — `src/components/study/duel-view.tsx` — the god component · **High**
- **Exact problem:** One 931-line `DuelView()` with **zero extracted sub-components** and 6 responsibilities: socket lifecycle (L210–296), lobby UI (431–556), waiting room (559–617), countdown (620–649), gameplay+timer+keyboard (357–420), result persistence + leaderboard write (141–190), rematch/clipboard (347–355, 422–428). 3 effects exist only to mirror state into refs (L122–133). Bonus bug: the countdown `setInterval` created inside the `onCountdown` socket callback (L247–251) is **never cleared on unmount/socket cleanup** (cleanup at 283–295 only clears `advanceTimer`/`qTimer`) — verified. HUD rebuilds 2×10 progress spans every 100 ms tick (L815–825).
- **Fix:** Extract `useDuelSocket` hook + phase components; fix the interval leak (store id in ref, clear in socket cleanup); memoize HUD.
- **Pattern:** Custom hooks for socket/protocol, compound components for phases, `React.memo` HUD fed primitives.
- **Modularize:** `duel/` folder — `use-duel-socket.ts`, `use-countdown.ts` (shared), `duel-setup.tsx`, `duel-waiting.tsx`, `duel-result.tsx`, `duel-hud.tsx`, `question-card.tsx`.
- **Impact:** correctness (leak), testability (socket protocol becomes unit-testable), 10 Hz re-render cost bounded to HUD.

### G-3 — `src/components/study/home-view.tsx` · **Medium**
- **Problem:** 15 store selectors (L115–129), 10 inline sections (hero L200–298, today-plan 301–386, banners 395–469, starter-path 491–534, bookshelf 537–623, tools 626–667, global feed 676–764, recent results 767–795, quote 798–805), one ungated `fetch` with `.catch(() => {})` and **no AbortController** (L178–190), 5 unmemoized O(n) derivations per render (L132–147, incl. **4 separate full `mistakes` map passes**). Dead import: `ReportCard` (L45) never rendered.
- **Fix:** Extract section components + `useGlobalStats()` hook (AbortController + error state); `useMemo` the derivations; collapse 4 mistake passes into one bucket-count helper.
- **Pattern:** Composition root + container/presentational split.
- **Modularize:** `home/` folder (§11.2).
- **Impact:** halves work on the hottest screen; unblocks per-section memoization.

### G-4 — `quiz-engine.tsx finish()` (L79–154) · **Medium**
- **Problem:** One function chains 7 side-effect orchestration steps: result persist, analytics, mistake-bank diffing with bucket grouping (96–119), word-risk tracking, konkur coverage, toast, server `sendStats`. Nesting hits 4–5 levels (L103–118). Used by **8 call sites** with a 15-prop interface.
- **Fix:** Extract `lib/quiz-finish.ts` as pure functions returning a summary; the component stays a thin orchestrator.
- **Pattern:** Command/function composition; side-effects at the edge.
- **Impact:** the most-reused engine becomes testable without mounting React; new categories (grammar games) plug in without touching `finish()`.

### G-5 — `official-report.tsx` computes while closed · **Medium**
- **Problem:** All 9 `useMemo`s and 13 store subscriptions sit above the `if (!open || !mounted) return null` gate (L80–219) — the modal recomputes `perLesson`, `skills`, `badges`, `monthBuckets`, `avgPercent`, `advice` on **every store change app-wide** while invisible. Same shape in `report-card.tsx` and `badges.tsx`.
- **Fix:** Compute inside a child rendered only when open (`{open && <ReportBody/>}`), or an `enabled` flag in a shared `useProgressStats()` hook.
- **Pattern:** Deferred computation / gate-then-compute.
- **Impact:** removes constant per-keystroke work across the app.

---

## 3. Duplicated Logic (20 families — the ones that already hurt)

| # | Family | Sites | Divergence? | Sev |
|---|---|---|---|---|
| D-1 | **Persisted-payload shape** hand-synced in 5 places: `study-store.ts:450–484` (partialize) ≈ `backup.ts:20–54` (interface) ≈ `backup.ts:70–97` (collectData) ≈ `backup.ts:229–278` (parseBackup) ≈ `sync.ts:144–182` (mergeSyncData). Adding ONE field = 5 hand-synced lists + tests. `wordMistakes`, `dayHistory`, `konkurSeen` each arrived as "optional compat" patches — pattern will repeat for every roadmap feature | 5 | yes (clamping exists only in some) | **High** |
| D-2 | `shuffle<T>` Fisher–Yates | **8×** (`smart-practice:34, word-risk:138, listen-bank:50, exam-view:12, konkur-view:40, rush-view:50, dictation-tab:44, writing-tab:11`) | no | Med |
| D-3 | Percent math `Math.round(a/b*100)` | 10× (lib + 5 components + api/stats) | no | Low |
| D-4 | Timer/countdown implementations | **5×** (quiz-engine 157–167 setTimeout-chain, rush 160–173, duel 391–404 **and** 246–251, dictation 135–140, listen 87–99) + identical SVG ring duplicated duel 862–880 ↔ rush 418–436 | yes (different tick rates, 1 leaks) | **High** |
| D-5 | **Two modal systems**: Radix Dialog (6 files) vs hand-rolled portal in official-report (L221–558: manual overlay-close, manual Esc, manual scroll-lock, **no focus trap/restore**) | 2 | yes | Med |
| D-6 | Card shell string `rounded-2xl border … bg-white p-5` ×40+, `active:scale-95` ×100+, while `ui/button.tsx` has **0 importers** | 12+ files | no | Med |
| D-7 | `ModeCard` (konkur 511–557 ↔ exam-view 342–390), `Podium` ×3 (leaderboard ×2 + rush-board), `OptionList` ×4 (quiz 558–585, duel 890–913, rush 516–541, listen 464–487), kbd-hint row ×4, saveResultImage ×2, summary-chip row ×2 inside weekly-chart | 15+ | no | Med |
| D-8 | **Learner-code logic client/server, diverged**: `sync.ts:22–45` (crypto.getRandomValues, normalize returns truncated) vs `api/sync/route.ts:16–32` (`Math.random()`, normalize returns `""`) — same regex, drifting behavior | 2 | **yes** | Med |
| D-9 | "Best percent wins" merge rule | 2 (`study-store.ts:324–330`, `sync.ts:51–58`) | no | Med |
| D-10 | 35-day window trim ×2 (store `pushDayHistory` **sorts**; sync `mergeDayHistory` re-implements) + legacy `history` trim in `applyStreak` (533–536) **doesn't sort** + O(n²) `Object.keys` per iteration → after cloud merge (scrambled insertion order) the 30-cap can delete the **newest** days | 3 | **yes (buggy)** | Med |
| D-11 | Leaderboard polling fetch+interval+visibility wrapper | 2 (~25 lines copy-pasted: leaderboard 68–96 ↔ rush-board 40–67) | yes (windows `slice(3,8)` vs `slice(3,10)`) | Low |
| D-12 | Secret generation ×2 (`register:21–25`, `profile:59–61`), secret check ×3 (all plain `!==`, not timing-safe), `ALLOWED_COLORS` ×2, guest fallback ×3, `utcDay()` ×2, EventDay upsert ×2 | 12 | yes | Med |
| D-13 | Keyboard option-picking handlers | **7 listeners, 5 re-implement** the isTyping guard (exists once, in shortcut-guide:16–21) | yes | Low |
| D-14 | Persian lesson ordinals `id===1?"اول":…` inline | **6 files** (home ×3, exam, duel, rush) | no | Low |
| D-15 | `sourceOf` + `GROUP_LABELS` verbatim | 2 (exam-view 22–34 ↔ konkur-view 50–62) | no | Low |
| D-16 | Report data pipeline (evalInput/skills/month buckets) | 2 (report-card 99–137 ↔ official-report 160–197) | yes | Med |
| D-17 | `todayFa()` + print plumbing | 2 (report-card 54–74 ↔ official-report 45–65) | no | Low |
| D-18 | Standalone-PWA `matchMedia` detection | 2 (pwa-layer 100–106 ↔ settings-popover 66–74) | no | Low |
| D-19 | `mistakesOfLesson(0)+…(3)` sum inline | 2 (home 137–139 ↔ exam 59–61) | no | Low |
| D-20 | Day-key formatting ×4, Persian weekday array ×2, knownCount ×4, "which lesson" ×3, outcome whitelist ×3 | 17 | yes | Low |

**Fix for all:** one `src/lib/domain/` layer (day/percent/shuffle/merge/keys), one `hooks/` set (`useCountdown`, `usePolling`, `useKeyboardOptions`, `useStandalone`), one `components/study/shared/` set (`OptionList`, `Podium`, `ModeCard`, `ScoreDisplay`, `Confetti`). D-1 specifically → schema table (§10 R-1).

---

## 4. Anti-patterns

| # | Where | Problem | Sev | Fix / Pattern |
|---|---|---|---|---|
| A-1 | `study-store.ts:288,353,361` | `trackEvent(...)` (network fire) called **inside `set()` updaters** — StrictMode double-invokes updaters in dev → double-counted analytics; events fire even for discarded updates | Med | Effects layer via `subscribe` (pattern already exists in study-app:91–134) |
| A-2 | `duel-view.tsx:122–133, rush-view:156–179` | Ref-mirrors of state (3 effects copying state→refs to fight stale closures) | Med | `useCountdown(deadline, onEnd)` + `useEventCallback` |
| A-3 | `study-store.ts` results/mistakes keys | One `Record<string,…>` hiding **≥6 incompatible key namespaces** (`"<lesson>:<cat>"`, `"exam"`, `"rush"`, `"0:konkur-hard"`, `"g:<station>"`, `"g:probe:l1"`, `"g:ls:<station>"`) — typo-proof by convention only | Med | Branded key types + smart constructors (`resultKey()`, `konkurKey()`, `stationKey()`) |
| A-4 | `dictation-tab.tsx:70–72` | Boolean-flag state machine (`replaying`/`spelling`/`audioErrorFor`) | Low | Status enum union (header's `syncing` enum is the in-repo model) |
| A-5 | 9 dispatch / 6 listener sites | **Window-CustomEvent service bus** (`open-profile`, `open-duel`, `open-report`, `open-official-report`, `open-shortcuts`, `install-app`) — untyped, untrackable | Med | Typed pub-sub module or plain zustand actions |
| A-6 | `study-app.tsx:169–180` | 12-branch view switch (fine type-wise) but eager imports + `header.tsx:87–90` string-compare active state | Med | `VIEW_COMPONENTS` registry + `next/dynamic` (§5 P-1) |
| A-7 | everywhere | Magic numbers: `PER_Q_MS 15_000`, `ROUND_MS 60_000`, auto-advance `2200`, feedback `480/850/900`, podium windows `slice(3,8)` vs `slice(3,10)`, dict `slice(0,300)` | Low | Named constants module |
| A-8 | 6+ files | Hardcoded Persian strings incl. repeated lesson ordinals — no string catalog; i18n impossible; copy edits touch N files | Low | `lib/fa.ts` catalog (start with ordinals, grade messages) |
| A-9 | `quiz-engine.tsx:212–242` | Keyboard effect with **no deps array** — re-registers window listener every render (incl. every timer tick); comment admits it. Same shape: listen-view 197–214, flashcards 80–102 | Med | Proper deps / `useKeyboardOptions` hook |
| A-10 | `home-view.tsx:632–646` | Tools array as `onClick | view | custom` union requiring `in`-casts | Low | Discriminated union with exhaustive render |
| A-11 | `next.config.ts` | `reactStrictMode: false` — masks effect bugs (like A-1) | Low | Re-enable after A-1 fixed |

---

## 5. Performance Bottlenecks

### P-1 — Zero code-splitting; 371 KB data layer in first paint · **High**
- **Evidence:** `study-app.tsx:12–30` statically imports all 12 views + 6 overlays; grep `dynamic(`/`lazy`/`Suspense` → **0 hits in src/**. All 46 components are `"use client"`; 17 files import `lessons`, 6 import `examBank`; `review-view → explain-source → lesson1+2+3+exam` again. `duel-view` pulls socket.io-client (~40 KB gz) onto the home page. Data dir = **371,250 B source ≈ 110 KB gzip** (`exam.ts`+`exam-fa.ts` = 121 KB = 33% of it).
- **Fix (cheapest first):** ① `dynamic(() => import("./duel-view"), { ssr:false })` ×11 via `VIEW_COMPONENTS` registry (one-file change, splits each view's data subtree automatically); ② `exam.ts/exam-fa.ts` → `/public/content/*.json` fetched only by exam/konkur views (trivial — no `EN()` templating there); ③ lessons → JSON with a one-off codegen pass to pre-render the `${EN(…)}`/`.map(…)` HTML templating; ④ framer-motion → consider `LazyMotion` (29 files use it).
- **Impact:** est. 30–50% first-load JS reduction; the app's core asset stops being its bundle tax; grows sub-linearly with new content.

### P-2 — Full SRS scan on *every* store change · **Medium**
- `pwa-layer.tsx:154–165`: `useStudy.subscribe` → `srsDueTotal(getState().srs)` runs `Object.entries().filter()` over the whole SRS map (~490 exam + ~150 word entries) synchronously on every `set()` (every flashcard flip, every keystroke write). Unthrottled.
- **Fix:** `subscribeWithSelector` on the `srs` slice, or throttle to 1s/rAF, or write-time derived due-count. Impact: removes per-keystroke O(n) allocation.

### P-3 — 100 ms duel timer re-renders the 931-line tree · **High (during play)**
- `duel-view.tsx:391–404` + HUD at 794–834 rebuilding 20 spans/tick. Fix: memoized `DuelHud` fed primitives. Impact: smooth gameplay on low-end phones (the target audience).

### P-4 — Unmemoized hot-path derivations · **Low–Med**
- `home-view.tsx:132–147` (5 derivations incl. 4 full mistake-map passes), `weekly-chart.tsx:18–19` (37 Date objects/render), konkur 360-cell grid re-renders on every store change (243–255), danger-words `flashWords` unmemoized (54–56). Siblings do use `useMemo` — this is drift, not policy. Fix: `useMemo` + one-pass bucket counter.

### P-5 — Always-on polling · **Low–Med**
- `leaderboard.tsx:83–96` polls every 30 s and is mounted on Home forever (paused only on `document.hidden`, not view change). Fix: `usePolling` hook with `enabled` bound to view.

### P-6 — `/api/stats` full-table scans · **Medium (growth)**
- EXPLAIN QUERY PLAN (verified live): `SCAN QuizAttempt` + `USE TEMP B-TREE FOR ORDER BY` — no index on bare `createdAt`; `count()` + `_avg` + conditional count + findMany = up to 4 scans per request on the most-polled read endpoint. Fix: `@@index([createdAt])` (one `db push`), single groupBy/raw aggregate, optional cached stats row. Impact: O(n)→O(log n) reads.

### P-7 — `/api/leaderboard` fetches ALL duel rows forever · **Medium**
- `leaderboard/route.ts:43–47`: `findMany where category:"duel"` with no `take`, aggregated in JS (`duel-standings.ts:34–69`). Grows linearly with total duels ever played. Fix: SQL-side `groupBy` aggregation or time-window + `src/lib/queries/leaderboard.ts`.

### P-8 — No retention for QuizAttempt / LearnerSync · **Medium (long-term)**
- Only EventDay rotates. Every quiz attempt and every 600 KB-possible sync blob lives forever. Fix: `src/lib/jobs/prune.ts` — roll up attempts >90d into a daily-aggregate table, delete stale sync rows >180d (mirror EventDay's throttled pattern).

### P-9 — Server misc · **Low**
- `collectData()` re-reads + re-parses the entire localStorage blob after every debounced burst (`backup.ts:58–67` via `study-app.tsx:90–94`) then re-serializes for push — read `useStudy.getState()` instead. TTS SDK call has **no timeout** (tts:44–52) and in-memory cache bounded by entries (120) not bytes → hundreds of MB worst case. Fix: `withTimeout` wrapper (explain already does this right at 22,50), byte-bounded LRU.

### P-10 — Correctness bug found: `totalPlayers` always ≤10 · **Low**
- `rush-leaderboard/route.ts:43–63`: rows sliced to 10 **before** `totalPlayers: rows.length`. (Leaderboard reports `grouped.length` correctly.) One-line fix.

---

## 6. Dead Code, Unused Imports, Outdated Dependencies

**Tier A — fully dead (delete):**
1. `src/hooks/use-mobile.ts` — whole file, 0 importers.
2. `sync.ts:26` `generateLearnerCode()` — dead client twin of the server copy (and *better*: crypto vs the server's `Math.random` — inverted quality!).
3. `daily-quests.ts:108` `FLASHCARD_TAB` · `backup.ts:336` `AUTO_BACKUP_INTERVAL` (**24h cadence documented but never enforced** — implement or remove) · `speak.ts:16` `getSpeakRateScale()`.
4. `study-store.ts` dead action `lessonMistakeCount` (L161, 430–433) — never called by any component; duplicates pure `mistakesOfLesson`.
5. `home-view.tsx:45` unused `ReportCard` import.
6. `study-types.ts:105` `FA` · `data/index.ts:13` `totalGrammarSections` · `grammar-map.ts:258` `GRAMMAR_STATION_TOTAL`.
7. `src/components/ui/*` — **8 of 14 never imported** (~392 lines): `button`, `input`, `label`, `separator`, `sheet`, `skeleton`, `toggle`, `tooltip`. Meanwhile ~100 hand-rolled buttons and 40+ hand-rolled card shells re-implement what `button` (+ a `card`) would provide. Either adopt (preferred, see roadmap) or delete.

**Tier B — redundant `export` keywords (~28 symbols used only in-file):** `use-toast reducer`, `EVENT_NAMES`, `QUESTS/QuestDef`, `getListenBank/ListenItem`, `matchVocabWord/wordByKey/DangerQuiz`, `pushDayHistory`, `lessonTheme/LessonTheme`, `SKILL_DEFS/SkillDef`, `BadgeDef`, `DuelStanding`, `StationStatus`, `LinePalette`, `DuelOutcome/StatsPayload/ProfilePayload`, `ResultImageOpts`, `SmartPlan/SmartMixChip`, `SpeakStop/spellText`, `SyncPushResult/SyncFetchResult`, `WeekTotals/WeeklyDigest`, `Pos/DialogueLine`, `AutoBackup`. Un-export to shrink API surface.

**Dependencies (grep-verified against src/, mini-services/, tests/):**
| Package | Verdict |
|---|---|
| `tailwindcss-animate` | **Unused — remove.** Only referenced by `tailwind.config.ts`, which is itself dead: the project is Tailwind v4 (`@import "tailwindcss"` + `@tailwindcss/postcss` + `@theme inline` in globals.css) and **nothing imports the v3-era `tailwind.config.ts`** → delete both |
| `sharp` | **Unused — remove.** No `next/image` anywhere; only static public icons |
| `@radix-ui/react-label/separator/slot/toggle/tooltip` | Removable **after** ui-pruning decision (each feeds only an unused ui component) |
| `framer-motion` | Used in 29 files — keep, but it's the biggest dep weight after data; consider `LazyMotion` |
| everything else | verified used (prisma, radix dialog/popover/slider/switch/toast, next-themes, socket.io-client, z-ai-web-dev-sdk, zustand, cva/clsx/tailwind-merge, lucide; all devDeps) |

No missing-but-used packages; no version conflicts (socket.io server ^4.8.1 vs client ^4.8.4, same major).

---

## 7. Low-Cohesion Modules / Missing Separation of Concerns

| Where | Mixed concerns | Sev | Split into |
|---|---|---|---|
| `study-store.ts applyStreak` (L506–576) | 4 concerns in 71 lines: persistence trimming (buggy — D-10), streak business rule, freeze economy, dayHistory merge; mutates a captured object inside an IIFE | Med | `capDays()` + `nextStreak()` + `grantFreezeIfEligible()` pure fns; action composes |
| `study-store.ts markKonkur` (L389–416) | Coverage tracking + wrong-set maintenance + SRS scheduling in one loop; 4-level nesting | Med | `srsPromote(srs, key, ok, now)` pure fn + thin slice action |
| `backup.ts parseBackup` (L155–279, 125 lines) | Parse + per-field validation + clamping (clamps dayHistory but **not** results/mistakes/history — a tampered `percent: 9000` poisons best-scores/badges via max-merge) | Med | schema-driven table (§10 R-1); clamp everything |
| `smart-practice.ts buildSmartPlan` (L48–157) | 3 algorithms + Persian UI copy in one function, 4–5-level nesting | Low | separate planners + copy map |
| API routes (all 9) | No shared layer: 13 rate-limit preambles, 7 body-parse idioms (3 styles), ~20 manual `typeof` extractions, 3 secret-check variants, 10 catch blocks (4 silent), 2 error languages, no machine-readable codes | **High (aggregate)** | `src/lib/api/` layer: `withApi({schema, bodyCap, limit, auth}, fn)` + `errors.ts` + `client-ip.ts` (§10 R-3) |
| `result-image.ts downloadResultImage` (L58–248) | 191-line linear canvas function | Low | `drawCard/drawRing/drawChips` helpers |

---

## 8. Folder Structure / Architecture Violations

- **8.1 — Flat `src/components/study/` (46 files / 13,715 lines).** Tab components (`vocab-tab`…`lesson-tests-tab`) are used only by `lesson-view` but the flat layout hides it. → Target tree in §11.2. Sev: Med.
- **8.2 — One route for the whole app.** `src/app/page.tsx` = 5 lines; navigation = zustand view-type. Consequences: no URLs/back-button for book views, SEO = root metadata only (a *web-book* whose content is invisible to crawlers), no route-level splitting, manifest shortcuts fake via `?goto=` (pwa-layer:210). Defensible for quiz/duel flows; wrong default for book views. → minimum: dynamic() (P-1); full: routes under `(book)/`. Sev: Med (High if SEO/sharing matters).
- **8.3 — `globals.css` unbounded growth (1,209 lines; 516 dark blocks; 18 duplicate selectors; 2 comments).** Root cause: book-content HTML and views use light-only Tailwind utilities → every feature re-enumerates its utilities under `.dark`. This is the most-churned file per worklog (Tasks 36/39/40/41 each added blocks). → semantic surface classes (`.c-card`, `.c-tip`, `.c-table`…) defined once per theme + one codegen pass over content HTML; split feature CSS beside components. 1,209 → ~400–500 lines; stops the per-feature dark tax permanently. Sev: **High**.
- **8.4 — Git hygiene:** `db/custom.db` (binary, churned by the app, committed daily by backup cron) and `upload/جزوه جامع یازدهم.pdf` (4.57 MB, tracked) in git; `examples/websocket/` + `download/` scaffold leftovers; 3 shell scripts misplaced in `tests/`. `.gitignore` gaps: `/db/`, `/upload/`. Sev: Med (and see SEC-1).
- **8.5 — Tests:** 10 files / 1,492 lines, centralized, pure-node. Zero component tests, zero API-route tests (9 routes untested), zero E2E (browser QA is ad-hoc mega-QA sessions). Add `jsdom` + `@testing-library/react` (start: quiz-engine, store hydration) + route tests for sync/explain. Sev: Med.
- **8.6 — Double-export inconsistency:** lesson1/2/3+exam export named+default; `appendix-view` bypasses the barrel. Minor.
- **8.7 — Two theme palettes:** `study-theme.ts` (43 importers) vs `grammar-theme.ts` (2) overlap on emerald/amber/rose. Merge into one `theme/palettes.ts`. Low.
- Verified **not** violations: `error.tsx` (Tailwind) vs `global-error.tsx` (inline styles) is correct duplication (global-error renders before CSS exists); all 29 lib modules referenced; no orphan components.

---

## 9. Security Risks

### SEC-1 — Credentials committed to git and pushed daily · **High**
- **Evidence (verified):** `git ls-files` → `.env` and `db/custom.db` tracked. DB holds 8 LearnerProfile rows (incl. 48-hex write-secrets, plaintext) + 5 LearnerSync snapshots. Going forward every sync snapshot embeds the identity pair (`backup.ts:96` `userSecret: s.userSecret || undefined` → stored verbatim by `api/sync/route.ts:103,109`). The daily backup cron pushes this to GitHub (`commit 9f7683a "db/custom.db updated"`).
- **Impact:** one "make repo public" click / leaked PAT / new collaborator = mass credential leak → forged stats/leaderboard, destructive sync overwrites for every learner.
- **Fix:** `git rm --cached .env db/custom.db`; ignore `/db/`; purge or rotate secrets; **store SHA-256 hashes of secrets, not plaintext**; add `timingSafeEqual`. Until then, the backup cron keeps re-leaking daily — fix before next backup run.
- **Modularize:** `src/lib/identity/secret.ts` — `issueSecret()/verifySecret()` used by register/stats/profile (kills the 3 divergent check variants too).

### SEC-2 — Spoofable, restartable, per-instance rate limiting · **High**
- **Evidence (verified):** `rate-limit.ts:14–18` takes the first `x-forwarded-for` hop; Caddy rewrites it correctly (Caddyfile:9,18–20) **but** `ss -tlnp` shows `*:3000` and `*:3003` — direct hits deliver attacker-chosen XFF → fresh bucket per request. Header-less clients share the `"local"` bucket. In-memory Map (lost on restart; this sandbox restarts often); cleanup scans the full map per request once >4000 entries (O(4000) under flood).
- **Impact:** unlimited paid LLM/TTS spend (explain 20/hr, tts 30/min guards are the only spend caps), unthrottled sync-code brute force, DB write floods.
- **Fix:** bind Next + duel service to `127.0.0.1` (only Caddy faces out); ignore client XFF unless a Caddy-injected trust header is present; fail closed for sensitive routes; optionally persist buckets (SQLite token-bucket) given restart-happy environment. `tests/rate-limit.test.ts` only covers the happy path — add spoof tests.

### SEC-3 — No body-size caps, no schema validation anywhere · **Med–High**
- Every route `await req.json()`s the full body before any check (Next 16 route handlers have **no default JSON limit**; the 1 MB cap is Server Actions only). `/api/sync`'s 600 KB ceiling runs **after** full parse; `/api/event` has no size awareness. No zod; ~20 hand-rolled `typeof` sites; stats POST accepts negative/float `lesson`, non-integer `total` (garbage dilutes averages). Combined with SEC-2 → memory-DoS on the single shared server.
- **Fix:** shared `withApi` wrapper: Content-Length check → parse → zod → rateLimit → auth → handler; `request_body max_size` in Caddy.

### SEC-4 — `Math.random()` sync credential + destructive overwrite · **High**
- `api/sync/route.ts:28–32` (verified). The 8-char code is the **only** credential for GET (returns whole snapshot incl. userSecret) and POST (overwrites blob). 32⁸≈1.1e12 is fine on paper, but V8 xorshift128+ state is recoverable from observed outputs, and observations can be minted via POST at 30/min spoofable rate; the 12/min GET guard dies with SEC-2. The dead client twin already uses crypto — inverted.
- **Fix:** CSPRNG in one shared `src/lib/sync-code.ts`; consider code+userId double-check; keep brute-force guard fail-closed.

### SEC-5 — Duel mini-service anti-cheat holes · **Medium**
- Score trusts **client-supplied `ms`** (index.ts:329 → 339) → cheat = `ms: 0` for +199/question, despite the header's "داوری متمرکز و ضد تقلب" claim. Question order IS server-side (good). Join has no rate-limit/attempt cap (32⁵ room codes); `cors: { origin: "*" }`; names self-reported. Duel *outcomes* are player-reported to `/api/stats` (a learner can POST 100× `outcome:"win"` and top the podium — `duel-standings.ts:8–10` admits it). No `uncaughtException`/`unhandledRejection` guard; rooms persist while a socket stays open (TTL sweep only matches empty rooms, L392).
- **Fix:** server-side per-question timing (`qStartAt` recorded server-side); join throttle per IP; origin whitelist or one-time join token minted by Next; HMAC-signed duel receipt before `/api/stats` accepts `category:"duel"`; process guards. Modularize: `room-manager.ts` + `src/lib/duel/receipt.ts`.

### SEC-6 — Misc · Low
- Caddy `XTransformPort` = open reverse-proxy into **any** localhost port (`Caddyfile:2–13`) — constrain to `^300[03]$` before anything admin-ish ever binds localhost. No TLS anywhere (`:81` plain HTTP — secrets transit in cleartext; fine in sandbox, blocker for real deployment). Read paths over-fetch secrets (`stats:32–34`, `leaderboard:55–57`, `rush:38–40` — `findMany` without `select` pulls `secret` into memory; one refactor from leaking → `select: {userId,name,color}`). Register claim race (two concurrent claims → last-write-wins, one client left with a dead secret). Error responses: mixed languages, no codes, 4 silent catch blocks.
- Verified **clean**: no hardcoded API keys anywhere (`z-ai-web-dev-sdk` used keyless; PAT only in `~/.git-credentials`, mode 600, outside repo); all JSON.parse guarded; no raw SQL; `.env` contains only `DATABASE_URL` (but see SEC-1).

---

## 10. Refactoring Opportunities (SOLID · DRY · KISS)

| # | Opportunity | Principle | Where |
|---|---|---|---|
| R-1 | **Schema-driven persistence**: one `SyncField` table `{key, sanitize, merge}` as single source of truth; *generate* `partialize`, `collectData`, `parseBackup` and drive `mergeSyncData` from it. ~1 table + 4 generic loops replace ~350 lines across 5 hand-synced lists. New persisted fields become 1-line changes; backup/sync drift becomes structurally impossible | DRY / OCP | D-1, SEC-3 clamping |
| R-2 | **Zustand slices + effects layer**: 16 domains → 12 slices + `effects.ts` absorbing study-app:85–134, pwa-layer:152–174 and the 3 in-`set()` trackEvents | SRP / composition | G-1, A-1, P-2 |
| R-3 | **API composition root**: `withApi()` wrapper (size-cap → zod → rate-limit → auth → try/catch → one error shape with codes). 9 routes shrink to their essence; security posture upgrades in one place | DRY / OCP | §7, SEC-2/3/6 |
| R-4 | **Pure domain layer** `src/lib/domain/{day,percent,shuffle,merge,keys,day-stat}.ts` — zero store imports, kills 20 duplication families, enables the branded key types | DRY / KISS | §3 |
| R-5 | **Registry + dynamic imports** for views (`VIEW_COMPONENTS`) — kills the 12-branch switch, delivers code splitting | OCP | P-1, A-6 |
| R-6 | **Shared UI kit from within**: adopt `ui/button.tsx`, add `ui/card.tsx`, extract `OptionList/Podium/ModeCard/ScoreDisplay/Confetti` + `useCountdown/usePolling/useKeyboardOptions/useStandalone` — ~100 buttons, 40+ card shells, 5 timers, 4 option-lists collapse | DRY / composition | §3, §4 |
| R-7 | **Semantic theme tokens**: `.c-card/.c-tip/.c-warn/.c-table/.c-ink` per theme → dark mode = token swaps, zero per-feature rules | KISS | 8.3 |
| R-8 | **Branded IDs + `as const` FKs** for station/quiz keys + a 10-line dev-mode `validateData()` (promote the vitest invariants to fail-fast) | type safety | A-3, data M-2 |
| R-9 | **Query layer** `src/lib/queries/{stats,leaderboard,profiles}.ts` — indexed aggregations, `select` projection, pagination | SRP | P-6/7, SEC-6 |
| R-10 | **Composition root routes** for book views (real URLs, RSC-friendly) | architecture | 8.2 |

---

## 11. Modularization Analysis

### 11.1 State layer (study-store.ts 668 → 12 slices + domain)
```
src/lib/domain/            # pure, zero store imports (unit-test core)
  day.ts percent.ts shuffle.ts keys.ts merge.ts day-stat.ts
src/state/
  store.ts                 # create()(persist(combineSlices(...)))
  schema.ts                # SyncField table → generates partialize + drives merge (R-1)
  navigation-slice.ts  srs-slice.ts  results-slice.ts  knowledge-slice.ts
  mistakes-slice.ts    wordrisk-slice.ts  konkur-slice.ts  activity-slice.ts
  streak-slice.ts      identity-slice.ts  prefs-slice.ts
  effects.ts               # subscribe-based: analytics, auto-backup, cloud push, app badge
```

### 11.2 Component layer (46 flat files → grouped by feature)
```
src/components/
  shell/        header, footer, theme-provider, pwa-layer, onboarding, shortcut-guide
                (header → profile/profile-popover.tsx + profile/backup-section.tsx + profile/sync-section.tsx + hooks/use-sync.ts)
  lesson/       lesson-view + 8 tabs, flashcards, word-of-day
  practice/     quiz-engine (→ quiz/use-quiz-run.ts, quiz/quiz-result-card.tsx, quiz/quiz-review-list.tsx),
                review-view, smart-practice-view, srs-panel, daily-quests, danger-words,
                skill-panel, badges, progress-ring, vocab-donut, weekly-chart, listen-view
  exam/         exam-view, konkur-view (shared ModeCard)
  grammar/      grammar-view, grammar-lesson-flow
  duel/         duel-view (→ 7 files per G-2), rush-view, rush-board, leaderboard (shared Podium + usePolling)
  reports/      report-card, official-report (→ shadcn Dialog; shared useProgressStats)
  shared/       OptionList, Podium, ModeCard, ScoreDisplay, Confetti, speak-button, explain-box, settings-popover
  ui/           PRUNED 14 → 6 (or adopted): dialog, popover, slider, switch, toast, toaster
```

### 11.3 Backend layer
```
src/lib/api/     handler.ts (withApi) · validate.ts (zod schemas ×9) · errors.ts (one shape + codes) · client-ip.ts
src/lib/identity/secret.ts   issueSecret/verifySecret (hash + timingSafeEqual)
src/lib/sync-code.ts         CSPRNG newCode/normalize/looksValid (client AND server)
src/lib/ai/zai.ts            single SDK accessor + withTimeout (explain + tts)
src/lib/queries/             stats.ts leaderboard.ts profiles.ts
src/lib/jobs/prune.ts        QuizAttempt rollup, LearnerSync TTL
mini-services/challenge-service/room-manager.ts (+ receipt signing)
```

### 11.4 Data layer
```
public/content/exam.json exam-fa.json lesson1..3.json   # fetched on demand (P-1)
src/data/grammar/{map.ts,micro-lessons.ts,appendix.ts,titles.ts}  # titles single-source (D: 15 duplicated title pairs)
```

---

## 12. Ranked Refactoring Roadmap (1–10)

| # | Initiative | Key files | Effort | Impact | Acceptance criteria |
|---|---|---|---|---|---|
| **1** | **Security triage**: untrack `.env`+`db/custom.db`, ignore `/db/`, rotate/re-hash secrets (SHA-256 + timingSafeEqual), CSPRNG sync codes, bind :3000/:3003 to 127.0.0.1, harden `clientIp()` | `api/register`, `api/profile`, `api/stats`, `api/sync`, `rate-limit.ts`, new `identity/secret.ts`, `sync-code.ts`, start.sh | S (½ day) | 🔴 risk↓↑↑ | `git ls-files` clean of secrets; direct :3000 hit gets a shared bucket; no plaintext secret in DB; tsc/lint/test zero |
| **2** | **Correctness bugs**: duel countdown interval leak + AbortController on home fetch + `totalPlayers` bug + `parseBackup` clamp-all + sorted `capDays` for `history` trim + re-enable `reactStrictMode` | `duel-view.tsx:247–251,283–295`, `home-view.tsx:178–190`, `rush-leaderboard:43–63`, `backup.ts:155–279`, `study-store.ts:533–536` | S (½ day) | 🟠 bugs→0 | leak repro gone in browser QA; corrupt-backup fuzz test passes; strict mode on with 0 new console errors |
| **3** | **Code splitting**: `VIEW_COMPONENTS` registry + `dynamic()` ×11; exam/exam-fa → `/public/content/*.json`; (opt) lessons JSON via codegen | `study-app.tsx`, new `public/content/` | M (1 day) | 🟠 30–50% first-load JS↓ | home route doesn't download socket.io-client or exam bank (verify in devtools); all views still lazy-load cleanly |
| **4** | **Schema-driven persistence** (R-1): SyncField table generates partialize/collectData/parseBackup, drives merge; clamp everything | `study-store.ts:450–484`, `backup.ts`, `sync.ts`, new `state/schema.ts` | M (1 day) | **High** maintainability | adding a fake field touches exactly 1 line + 1 test; all 126 tests pass; backup↔restore↔cloud-merge round-trip test |
| **5** | **API layer** (R-3): `withApi` + zod + one error shape + body caps + Caddy `request_body max_size`; timeouts for TTS; `select` projections | 9 routes, new `lib/api/*` | M (1 day) | High security+DRY | every route validates via zod; 50MB POST rejected at Content-Length; error shape uniform; route tests for sync/explain |
| **6** | **Domain + hooks extraction** (R-4/R-6): `lib/domain/*`, `useCountdown/usePolling/useKeyboardOptions/useStandalone`, `OptionList/Podium/ModeCard/ScoreDisplay/Confetti`; migrate 8 shuffles, 5 timers, 7 keyboard handlers, 2 modal systems (official-report → Radix Dialog = free focus trap) | 20+ files, all consumers | M–L (2 days) | High DRY | grep: `shuffle` defined once; 1 countdown hook; 1 modal system; 126+ tests green |
| **7** | **Split god components**: duel-view → `duel/` (7 files), home-view → `home/` (8 files + `useGlobalStats`), quiz-engine → `quiz/` (`use-quiz-run`, result cards, `lib/quiz-finish.ts`), header → `profile/*` | the 4 monsters + new folders | L (2–3 days) | High maintainability | no file >350 lines in components/; duel HUD memoized; behavior parity via browser QA checklist |
| **8** | **Store slices** (R-2): 12 slices + `effects.ts`; delete dead `lessonMistakeCount`; branded result keys | `study-store.ts` → `state/*` (37 consumers keep `useStudy` API) | L (2 days) | High scalability | store API backward-compatible; slice unit tests; cross-domain fan-out gone (React profiler) |
| **9** | **CSS semantic refactor** (8.3): 5 semantic classes per theme, codegen pass over book HTML, delete utility-override band + 18 duplicate selectors | `globals.css`, content HTML generator | M (1–2 days) | High (kills the dark tax forever) | 1,209 → ≤500 lines; dark-mode QA of all views pixel-equivalent |
| **10** | **Structure & ops**: folder regroup (§11.2), real book routes, prune/adopt ui kit, remove `tailwind.config.ts`+`tailwindcss-animate`+`sharp` (+5 radix after), delete `examples/`+`download/`, `git rm --cached upload/*.pdf`, move stray scripts out of `tests/`, `@@index([createdAt])` + query layer, prune job, duel receipts + room-manager, component/route test infra | §11 trees, `schema.prisma`, `leaderboard/route.ts`, `challenge-service` | L (3+ days, parallelizable) | Long-term scalability | target tree matches §11.2; `bun pm` weight ↓; leaderboard O(log n); duel `ms` server-authoritative |

**Order rationale:** 1–2 are cheap and stop active bleeding (security + bugs) — do them before anything else, *before the next daily backup push*. 3 is the highest user-perceived win per effort and must precede 7 (split components stay split in the bundle). 4 precedes 8 (slices need the schema table; persistence is the riskiest contract). 6 before 7 (component splits *consume* the shared kit — extract first, split second). 9 is independent and can run anytime. 10 is the long tail.

**Standing rule for every step:** `bunx tsc --noEmit` + `bun run lint` + `bun run test` (126 → growing) all clean, plus browser QA via the single-session mega-QA pattern before merge. Commit per roadmap item (git-bisectable).

*End of audit.*
