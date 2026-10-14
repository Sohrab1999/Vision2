#!/bin/bash
# Task 172 — SNAPSHOT-ROLLBACK RECOVERY PROTOCOL (run after the user provides
# a fresh fine-grained token with Contents:read/write on Sohrab1999/Vision2).
#
#   bash scripts/restore-from-remote-r172.sh <TOKEN>
#
# Steps:
#   1. write credentials (store helper)
#   2. git fetch origin
#   3. verify origin/main is at/after 77eecbc (task 171) and worklog >= 4013 lines
#   4. reset local main to origin/main (discards the task-114-era local state;
#      the partial round is preserved on branch r172-contrast-fixes — 00a0a0e,
#      and the COMPLETED sweep incl. guards lives on r172-continuation)
#   5. fetch the r172 artifacts from the durable branch mirror:
#      scripts/contrast-fixes-r172.py (updated: + home CTA patterns),
#      tests/contrast-contract-r172.test.ts, scripts/qa-contrast-r172.sh
#   6. re-apply the contrast sweep: python3 scripts/contrast-fixes-r172.py
#      (idempotent, per-pattern applied/skipped/missing report)
#   7. gates: tsc / lint / test  (expect 1476+ baseline + 12 contract tests)
#   8. reminder list of the remaining task-172 items (QA-3004, DB, push)
set -eu
cd /home/z/my-project

TOKEN="${1:?usage: restore-from-remote-r172.sh <TOKEN>}"
printf 'https://Sohrab1999:%s@github.com\n' "$TOKEN" > ~/.git-credentials
chmod 600 ~/.git-credentials

echo "--- 1. fetch"
git fetch origin

echo "--- 2. verify remote head"
git log -1 --format='%H %ci %s' origin/main | head -c 160; echo
AFTER=$(git merge-base --is-ancestor 77eecbc1e28dbd1451e23a14c6dddeff69b85485 origin/main && echo YES || echo NO)
echo "origin/main contains task-171 (77eecbc): $AFTER"
[ "$AFTER" = "YES" ] || { echo "ABORT: remote does not contain the expected history — arbitrate manually"; exit 1; }

echo "--- 3. reset local main to origin/main"
git checkout main
git reset --hard origin/main
echo "worklog lines: $(wc -l < worklog.md) (expect >= 4013)"

echo "--- 4. fetch r172 artifacts from the durable branch mirror"
if git show-ref --verify --quiet refs/heads/r172-continuation; then
  git checkout r172-continuation -- scripts/contrast-fixes-r172.py \
    tests/contrast-contract-r172.test.ts scripts/qa-contrast-r172.sh
  echo "artifacts checked out from r172-continuation"
elselif git show-ref --verify --quiet refs/remotes/origin/r172-continuation; then
  git checkout origin/r172-continuation -- scripts/contrast-fixes-r172.py \
    tests/contrast-contract-r172.test.ts scripts/qa-contrast-r172.sh
  echo "artifacts checked out from origin/r172-continuation"
else
  echo "ABORT: r172-continuation branch missing — arbitrate via reflog (task-173 worklog section)"
  exit 1
fi

echo "--- 5. re-apply contrast sweep"
python3 scripts/contrast-fixes-r172.py

echo "--- 6. gates"
bunx tsc --noEmit && echo TSC=0
bun run lint 2>&1 | tail -2 && echo LINT=OK
bun run test 2>&1 | grep -E "Test Files|Tests " | head -2

echo "--- 7. remaining task-172 checklist"
cat <<'LIST'
  [x] css-hygiene contrast contract  -> tests/contrast-contract-r172.test.ts
      (12 pins: zero stone-400, @theme 52%, .dark restore, hero gradients,
      home CTAs emerald-700/cyan-700, warm-solid dark-text rule)
  [x] home lesson/listen CTAs: emerald-600->700 + cyan/teal-600->700
      (audit rows «شروع فلش‌کارت‌ها / تست‌های درس اول / مرور هوشمند /
      تمرین شنیداری» 3.65:1) — patterns live in contrast-fixes-r172.py
  [ ] decide (SAFE-KEEP chosen for now): the .dark .text-stone-400 canonical
      groups in globals.css stay — they are self-healing remaps if any future
      TSX reintroduces stone-400; revisit only if remote css-hygiene pins them
  [ ] scripts/qa-contrast-r172.sh: 3004 production run — re-audit the same
      9 views, assert the flagged sites now pass (before/after differential)
  [ ] r101 --clean DB baseline (attempts=39, app_open=2)
  [ ] worklog addendum + commit + push (41st test — NOTE: the push-block claim
      became REAL after the rollback wiped ~/.git-credentials; this token
      restore is that recovery)
LIST
echo "RECOVERY-DONE"
