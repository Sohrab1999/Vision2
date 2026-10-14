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
#      the partial round is preserved on branch r172-contrast-fixes — 00a0a0e)
#   5. re-apply the contrast sweep: python3 scripts/contrast-fixes-r172.py
#      (idempotent, per-pattern applied/skipped/missing report)
#   6. gates: tsc / lint / test  (expect 1476+ baseline on the restored tree)
#   7. reminder list of the remaining task-172 items (guards, QA-3004, DB, push)
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

echo "--- 4. re-apply contrast sweep"
python3 scripts/contrast-fixes-r172.py

echo "--- 5. gates"
bunx tsc --noEmit && echo TSC=0
bun run lint 2>&1 | tail -2 && echo LINT=OK
bun run test 2>&1 | grep -E "Test Files|Tests " | head -2

echo "--- 6. remaining task-172 checklist"
cat <<'LIST'
  [ ] css-hygiene: add the "contrast contract" describe (stone-500 52% pin,
      dark-restore pin, migration completeness: zero text-stone-400 in src,
      hero gradient pins: konkur 700-family / duel rose-600 / report
      emerald-800-band / gmetro solids / exam amber-700)
  [ ] home-today lesson buttons: bg-emerald-600 -> bg-emerald-700 (audit rows
      "شروع فلش‌کارت‌ها / تست‌های درس اول / تمرین شنیداری" 3.65:1)
  [ ] decide: delete the now-dead .dark .text-stone-400 canonical groups in
      globals.css (guarded cleanup, zero TSX consumers after migration)
  [ ] scripts/qa-contrast-r172.sh: 3004 production run — re-audit the same
      9 views, assert the flagged sites now pass (before/after differential)
  [ ] r101 --clean DB baseline (attempts=39, app_open=2)
  [ ] worklog addendum + commit + push (40th falsification test)
LIST
echo "RECOVERY-DONE"
