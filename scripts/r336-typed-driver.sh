#!/bin/bash
# r336 — typed fill-driver v3 (bank 32 Q1-Q16): ref via sed (the 'e[0-9]+$' grep was broken — line ends with ']')
KEYS=(observatory happiest thousand information suitable compare happened healthy interested microscope wonder expensive shark telescope blood planet)
cd /home/z/my-project
PAGE () { agent-browser eval "document.body.innerText" 2>/dev/null | python3 -c "import sys,json; print(json.loads(sys.stdin.read()))" 2>/dev/null; }
GETREF () { agent-browser snapshot -c 2>&1 | sed -nE 's/.*textbox "پاسخ تایپی" \[ref=(e[0-9]+)\].*/\1/p' | head -1; }
for q in $(seq 1 16); do
  ok=0
  for try in $(seq 1 12); do
    CUR=$(PAGE | grep -oE "^$q / 16$" | head -1)
    [ -n "$CUR" ] && { ok=1; break; }
    agent-browser press Enter >/dev/null 2>&1 || true
    sleep 0.55
  done
  [ "$ok" = "0" ] && { echo "Q$q: never reached"; break; }
  REF=""
  for tr in 1 2 3 4 5 6; do
    REF=$(GETREF)
    [ -n "$REF" ] && break
    sleep 0.6
  done
  [ -z "$REF" ] && { echo "Q$q: no textbox"; break; }
  agent-browser fill "$REF" "${KEYS[$((q-1))]}" >/dev/null 2>&1
  sleep 0.4
  DIS=$(agent-browser snapshot -c 2>&1 | grep -E 'button "بررسی پاسخ" \[disabled' | head -1)
  [ -n "$DIS" ] && { echo "Q$q: fill did NOT register"; break; }
  agent-browser press Enter >/dev/null 2>&1 || true   # submit
  sleep 0.9
  agent-browser press Enter >/dev/null 2>&1 || true   # advance
  sleep 0.7
  echo "Q$q ok"
done
echo "DRIVER-V3 COMPLETE"
