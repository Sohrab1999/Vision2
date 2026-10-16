#!/usr/bin/env bash
# recovery-check.sh — executable companion to RECOVERY-253.md (Vision 2 volume-rollback incident).
# Written in round 257 (2026-10-16) to turn the prose recovery recipe into an
# assertion-based checklist, so the next credentialed session cannot mis-order
# or half-run the recovery.
#
# Incident in one line: the sandbox volume rolled back to the Oct-13 snapshot
# (task 171 era) mid-round-253; the true history (rounds 172-252, tip r252 =
# 3b1f582) survives only on the private GitHub remote, unreachable until the
# platform re-installs ~/.git-credentials.
#
# Modes:
#   ./scripts/recovery-check.sh pre    # on the CURRENT stale base: knowledge base intact, reflog anchors, remote probe
#   ./scripts/recovery-check.sh fetch  # attempt `git fetch origin` (needs credentials); print origin/main + mirror branches
#   ./scripts/recovery-check.sh post   # AFTER `git reset --hard origin/main`: verify the recovered r252-era content
#
# The destructive step (reset --hard) stays MANUAL on purpose — run it only
# after `fetch` shows origin/main >= 3b1f582 and you have read RECOVERY-253.md.
#
# Exit codes: 0 = all checks passed, 1 = at least one check failed, 2 = usage error.

set -u
cd "$(dirname "$0")/.." || exit 2

PASS=0
FAIL=0

ok()  { PASS=$((PASS + 1)); echo "  [PASS] $1"; }
bad() { FAIL=$((FAIL + 1)); echo "  [FAIL] $1"; }
section() { echo; echo "== $1 =="; }

ANCHOR_R252="3b1f582"   # r252 docs commit — last verified tip of the true history
ANCHOR_KB="b686da8"     # recovery knowledge base (RECOVERY-253.md + PLANS-R253.md)
ANCHOR_INV="c900b60"    # lost-era inventory

mode="${1:-}"
case "$mode" in
  pre) ;;
  fetch) ;;
  post) ;;
  *)
    echo "usage: $0 {pre|fetch|post}" >&2
    echo "  pre   — verify knowledge base + anchors on the current (stale) base" >&2
    echo "  fetch — try git fetch origin (needs platform credentials)" >&2
    echo "  post  — verify recovered content markers after git reset --hard origin/main" >&2
    exit 2
    ;;
esac

echo "recovery-check.sh mode=$mode  $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "repo: $(pwd)   HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo 'none')"

# ---------------------------------------------------------------------------
if [ "$mode" = "pre" ]; then
  section "knowledge base in worktree (must survive until recovery)"
  for f in RECOVERY-253.md PLANS-R253.md LOST-ERA-INVENTORY.md; do
    if [ -s "$f" ]; then ok "$f present ($(wc -l < "$f") lines)"; else bad "$f MISSING from worktree"; fi
  done

  section "knowledge base retrievable from git objects (survives any reset --hard)"
  if git cat-file -e "$ANCHOR_KB:RECOVERY-253.md" 2>/dev/null; then
    ok "git show $ANCHOR_KB:RECOVERY-253.md  ($(git show "$ANCHOR_KB:RECOVERY-253.md" | wc -l) lines)"
  else bad "anchor $ANCHOR_KB:RECOVERY-253.md not retrievable"; fi
  if git cat-file -e "$ANCHOR_KB:PLANS-R253.md" 2>/dev/null; then
    ok "git show $ANCHOR_KB:PLANS-R253.md  ($(git show "$ANCHOR_KB:PLANS-R253.md" | wc -l) lines)"
  else bad "anchor $ANCHOR_KB:PLANS-R253.md not retrievable"; fi
  if git cat-file -e "$ANCHOR_INV:LOST-ERA-INVENTORY.md" 2>/dev/null; then
    ok "git show $ANCHOR_INV:LOST-ERA-INVENTORY.md  ($(git show "$ANCHOR_INV:LOST-ERA-INVENTORY.md" | wc -l) lines)"
  else bad "anchor $ANCHOR_INV:LOST-ERA-INVENTORY.md not retrievable"; fi

  section "reflog anchors (incident-era named commits reachable)"
  if git reflog --quiet | grep -q "$ANCHOR_KB"; then ok "reflog contains $ANCHOR_KB (knowledge base)"; else bad "reflog lost $ANCHOR_KB"; fi
  if git reflog --quiet | grep -q "$ANCHOR_INV"; then ok "reflog contains $ANCHOR_INV (inventory)"; else bad "reflog lost $ANCHOR_INV"; fi
  if [ "$(git config gc.auto 2>/dev/null || echo 6789)" = "0" ]; then
    ok "gc.auto=0 (auto-prune cannot eat witnesses)"
  else bad "gc.auto is NOT 0 — run: git config gc.auto 0"; fi

  section "remote probe (non-interactive, never prompts)"
  probe="$(GIT_TERMINAL_PROMPT=0 timeout 15 git ls-remote origin 2>&1 | head -1)"
  if echo "$probe" | grep -q "could not read Username"; then
    bad "remote BLOCKED (credentials absent) — recovery stays blocked, keep preserving"
  elif echo "$probe" | grep -qE "^[0-9a-f]{40}"; then
    ok "remote REACHABLE — run: $0 fetch"
  else
    bad "remote probe unexpected output: $probe"
  fi

  section "manual recipe reminder"
  echo "  When remote becomes reachable:"
  echo "    1. $0 fetch          # verify origin/main >= $ANCHOR_R252"
  echo "    2. git reset --hard origin/main"
  echo "    3. git branch -f r250-pack origin/r250-pack  (same for r251-pack / r252-pack)"
  echo "    4. $0 post           # content markers + then full gates (expect 1782+/179+)"
  echo "    5. Migrate the «ثبتِ دائمی» section of RECOVERY-253.md into worklog.md, then delete"
  echo "       RECOVERY-253.md / PLANS-R253.md / LOST-ERA-INVENTORY.md and commit"
  echo "    6. Continue PLANS-R253.md (usage-chip everywhere + dictionary header counter)"

# ---------------------------------------------------------------------------
elif [ "$mode" = "fetch" ]; then
  section "git fetch origin"
  if ! GIT_TERMINAL_PROMPT=0 git fetch origin 2>&1; then
    bad "fetch failed (credentials missing or network) — stay in preservation mode"
    echo; echo "PASS=$PASS FAIL=$FAIL"; exit 1
  fi
  ok "fetch succeeded"

  section "origin/main position"
  om="$(git rev-parse origin/main 2>/dev/null || true)"
  if [ -z "$om" ]; then
    bad "origin/main not found after fetch"
  else
    ok "origin/main = $om"
    if git merge-base --is-ancestor "$ANCHOR_R252" "$om" 2>/dev/null; then
      ok "r252 ($ANCHOR_R252) is an ancestor of origin/main — true history intact"
    else
      bad "r252 ($ANCHOR_R252) NOT an ancestor of origin/main — DIVERGENCE, stop and arbitrate before any reset"
    fi
  fi

  section "origin mirror branches"
  for b in r250-pack r251-pack r252-pack; do
    if git rev-parse --verify --quiet "origin/$b" >/dev/null; then
      ok "origin/$b -> $(git rev-parse --short "origin/$b")"
    else
      bad "origin/$b missing on remote"
    fi
  done

  echo
  echo "NEXT MANUAL STEP (only if the ancestor check passed):"
  echo "  git reset --hard origin/main && git branch -f r250-pack origin/r250-pack && \\"
  echo "  git branch -f r251-pack origin/r251-pack && git branch -f r252-pack origin/r252-pack"
  echo "  then: $0 post"

# ---------------------------------------------------------------------------
elif [ "$mode" = "post" ]; then
  section "history"
  if git merge-base --is-ancestor "$ANCHOR_R252" HEAD 2>/dev/null; then
    ok "HEAD ($(git rev-parse --short HEAD)) descends from r252 ($ANCHOR_R252)"
  else
    bad "HEAD does NOT descend from r252 — reset did not reach the true history"
  fi

  section "r252-era library markers"
  if [ -f src/lib/word-usage.ts ]; then
    ok "src/lib/word-usage.ts exists ($(wc -l < src/lib/word-usage.ts) lines)"
    for sym in findWordUsages wordFormRegex highlightParts WordUsageSite; do
      if grep -q "$sym" src/lib/word-usage.ts; then ok "  exports/mentions $sym"; else bad "  $sym missing from word-usage.ts"; fi
    done
  else
    bad "src/lib/word-usage.ts MISSING — reset did not recover r252 content"
  fi
  if [ -f src/lib/resume-door-coverage.ts ]; then
    ok "src/lib/resume-door-coverage.ts exists (resumeDoor family single source)"
  else bad "src/lib/resume-door-coverage.ts MISSING"; fi
  if [ -f plans/README.md ]; then
    ok "plans/README.md exists (unslop roadmap of the lost era)"
  else bad "plans/README.md MISSING"; fi

  section "12-lesson era markers"
  if [ -f src/data/lesson12.ts ]; then
    ok "src/data/lesson12.ts exists"
  else bad "src/data/lesson12.ts MISSING (stale 3-lesson base?)"; fi
  if grep -q "lesson12" src/data/index.ts 2>/dev/null; then
    ok "src/data/index.ts registers lesson12"
  else bad "src/data/index.ts does not register lesson12"; fi

  section "r252 usage-chip contract (three consumers + testids)"
  for f in src/components/study/lesson/dictionary-view.tsx src/components/study/lesson/vocab-tab.tsx src/components/study/lesson/flashcards.tsx; do
    if [ -f "$f" ]; then
      if grep -q "usage-chip-" "$f"; then ok "$f has usage-chip testid"; else bad "$f present but no usage-chip testid"; fi
    else
      bad "$f MISSING"
    fi
  done

  section "worklog restored"
  wl="$(wc -l < worklog.md 2>/dev/null || echo 0)"
  if [ "$wl" -ge 4500 ]; then
    ok "worklog.md = $wl lines (pre-incident scale ~4517+)"
  else
    bad "worklog.md only $wl lines — reset replaced the local stub, migrate «ثبتِ دائمی» from RECOVERY-253.md now"
  fi

  section "mirror branches rebuilt"
  for b in r250-pack r251-pack r252-pack; do
    if git rev-parse --verify --quiet "$b" >/dev/null; then
      ok "local branch $b -> $(git rev-parse --short "$b")"
    else
      bad "local mirror $b missing — run: git branch -f $b origin/$b"
    fi
  done

  section "finishing checklist (manual)"
  echo "  [ ] migrate «ثبتِ دائمی» into worklog.md, then git rm RECOVERY-253.md PLANS-R253.md LOST-ERA-INVENTORY.md"
  echo "  [ ] full gates: bunx tsc --noEmit && bun run lint && bun run test   (expect 1782+/179+)"
  echo "  [ ] pkill -f agent-browser; pkill -f chromium   BEFORE bun run test (OOM lesson)"
  echo "  [ ] continue PLANS-R253.md: shared UsageChip + bookletUsageStats + 5 guard tests"
fi

echo
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ] || exit 1
exit 0
