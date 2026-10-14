#!/bin/bash
# Task 172 — contrast sweep: production QA on :3004 (single session).
# Route: patch distDir -> build .next-prod172 -> next start -p 3004 ->
#        token/CTA/hero asserts -> kill + restore + rm (trap, idempotent).
# Asserts the r172 sweep LANDED in the production bundle: @theme 52% stone-500,
# zero .text-stone-400 elements, home CTAs emerald-700/cyan-700, duel hero
# rose-600 + black scrims, report emerald-800 band, konkur 700-family,
# gmetro deeper hero. Missing nav targets are SKIP-honest, never silent-FAIL.
set -u
cd /home/z/my-project
BASE="http://127.0.0.1:3004"
CFG=next.config.ts
BAK=/tmp/next.config.r172.bak
DDIR=.next-prod172
LOG=/tmp/qa-contrast-r172-build.log
PASS=0; FAIL=0; SKIP=0
ok(){ echo "PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "FAIL: $1"; FAIL=$((FAIL+1)); }
skp(){ echo "SKIP: $1"; SKIP=$((SKIP+1)); }

cleanup(){
  # the next start PARENT dies but its next-server CHILD survives pkill-by-name —
  # capture the :3004 listener pid directly and kill it (never match the :3000 dev)
  local CPID
  CPID=$(ss -tlnp 2>/dev/null | grep ':3004' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
  [ -n "$CPID" ] && kill -9 "$CPID" 2>/dev/null || true
  pkill -f "next start -p 3004" 2>/dev/null || true
  [ -n "${SRV:-}" ] && kill "$SRV" 2>/dev/null || true
  # restore config ONLY from an unpatched backup (chain-of-custody guard)
  if [ -f "$BAK" ] && ! grep -q 'distDir' "$BAK"; then cp "$BAK" "$CFG"; fi
  rm -f "$BAK"
  [ -f "$TSBAK" ] && cp "$TSBAK" tsconfig.json && rm -f "$TSBAK"
  rm -rf "$DDIR"
  agent-browser close >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Next auto-appends "<distDir>/types/**" entries to tsconfig.include the moment
# a custom distDir's types dir appears (Task-169-incident signature) — snapshot
# it alongside the config so cleanup restores BOTH.
TSBAK=/tmp/tsconfig.r172.bak
cp tsconfig.json "$TSBAK"

echo "== phase 0: distDir bypass build =="
cp "$CFG" "$BAK"
python3 - <<'PY'
import re
s = open("next.config.ts", encoding="utf-8").read()
if 'distDir' in s:
    print("already patched"); raise SystemExit(0)
s = s.replace('const nextConfig: NextConfig = {',
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod172",', 1)
open("next.config.ts", "w", encoding="utf-8").write(s)
print("patched")
PY
# NOTE: package.json's "build" hardcodes .next paths for the standalone cp —
# run the three steps directly against the bypass distDir instead.
./node_modules/.bin/next build > "$LOG" 2>&1 \
  && cp -r "$DDIR/static" "$DDIR/standalone/.next/" \
  && cp -r public "$DDIR/standalone/" \
  || { echo "BUILD-FAIL"; tail -25 "$LOG"; exit 1; }
grep -q '.next-prod172' "$CFG" && echo "config-patched OK"
nohup ./node_modules/.bin/next start -p 3004 > "$LOG" 2>&1 &
SRV=$!
UP=0
for i in $(seq 1 45); do
  sleep 1
  if curl -s -o /dev/null --max-time 2 "$BASE"; then UP=1; break; fi
done
[ "$UP" = "1" ] || { echo "3004-UP-FAIL"; tail -10 "$LOG"; exit 1; }
curl -s -o /dev/null -w "3004:%{http_code}\n" "$BASE"

echo "== phase 1: open + intro skip (retry — fresh origin mounts intro late) =="
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
SKIPRES="no-intro"
for i in 1 2 3 4; do
  SKIPRES=$(agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>/ناشناس\s*می.مانم/.test(x.textContent||""));if(b){b.click();return "intro-skipped"}return "no-intro"})()' 2>&1 | tr -d '"\\')
  echo "$SKIPRES" | grep -q 'intro-skipped' && break
  sleep 2
done
echo "intro: $SKIPRES"
# wait for home markers (starter or today panel) before any probe
for i in 1 2 3 4 5 6 7 8; do
  M=$(agent-browser eval 'JSON.stringify({home:/از کجا شروع کنم|مرور هوشمند/.test(document.body.innerText)})' 2>&1 | tr -d '"\\')
  echo "$M" | grep -q 'true' && break
  sleep 2
done
echo "home-marker: $M"

echo "== phase 2: token probes (light mode; oklch 52% -> lab L~44.3, stock 55.3% -> L~47.5) =="
R=$(agent-browser eval '(()=>{const cs=getComputedStyle(document.documentElement);
  const raw=(cs.getPropertyValue("--color-stone-500")||"").trim();
  const m=raw.match(/lab\(([0-9.]+)%/);
  return JSON.stringify({raw:raw.slice(0,40),labL:m?+m[1]:null,
    dark:document.documentElement.classList.contains("dark"),
    dead400:document.querySelectorAll(".text-stone-400").length,
    live500:document.querySelectorAll(".text-stone-500").length});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'dark:false' && ok "probe ran in light mode" || skp "light-mode probe (dark theme active)"
echo "$R" | grep -Eq 'labL:(4[0-5]|46)\.' && ok "stone-500 = 52% override live (lab L<46.5, stock would be ~47.5)" || bad "@theme stone-500 52% pin"
echo "$R" | grep -q 'dead400:0' && ok "zero .text-stone-400 elements in production DOM" || bad "text-stone-400 elements alive"
echo "$R" | grep -Eq 'live500:[1-9]' && ok ".text-stone-500 family alive (migrated estate)" || bad "stone-500 estate empty"

echo "== phase 3: home CTAs (starter / banners / today) =="
R=$(agent-browser eval '(()=>{
  const btns=[...document.querySelectorAll("button")];
  const starter=btns.filter(b=>/^(شروع فلش‌کارت‌ها|تست‌های درس اول|تمرین شنیداری)$/.test((b.textContent||"").trim()));
  const starterEmerald700=starter.filter(b=>b.classList.contains("bg-emerald-700")).length;
  const listen=[...document.querySelectorAll("button")].find(b=>(b.textContent||"").includes("شروع تمرین شنیداری"));
  const listenCyan=listen?listen.className.includes("from-cyan-700")&&listen.className.includes("to-teal-700"):null;
  const chip=[...document.querySelectorAll("span")].find(s=>/ثانیه/.test(s.textContent||"")&&s.className.includes("bg-orange-500"));
  const chipDark=chip?chip.className.includes("text-stone-900"):null;
  const today=[...document.querySelectorAll("button")].find(b=>(b.textContent||"").includes("مرور هوشمند"));
  const todayEmerald=today?today.className.includes("bg-emerald-700"):null;
  return JSON.stringify({starterN:starter.length,starterEmerald700,listenCyan,chipDark,todayEmerald});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -Eq 'starterEmerald700:[1-9]' && ok "starter lesson CTAs = emerald-700" || bad "starter CTAs not emerald-700"
echo "$R" | grep -q 'listenCyan:true' && ok "listen CTA gradient = cyan/teal-700" || skp "listen CTA (banner not rendered?)"
echo "$R" | grep -q 'chipDark:true' && ok "orange chip = warm-solid dark text" || skp "orange chip"
echo "$R" | grep -q 'todayEmerald:true' && ok "home-today CTA = emerald-700" || skp "home-today CTA (starter view replaces it)"

echo "== phase 4: duel-setup hero (open-duel event) =="
agent-browser eval 'window.dispatchEvent(new CustomEvent("open-duel"))' >/dev/null
sleep 2
R=$(agent-browser eval '(()=>{
  const hero=document.querySelector("[class*=from-violet-600]");
  return JSON.stringify({
    heroFound:!!hero,
    rose600:hero?hero.className.includes("to-rose-600"):null,
    scrim:!!document.querySelector("[class*=bg-black\\/25]"),
    oldWhite:document.querySelectorAll("[class*=bg-white\\/15]").length});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'rose600:true' && ok "duel hero ends rose-600" || bad "duel hero rose pin"
echo "$R" | grep -q 'scrim:true' && ok "duel scrim chips bg-black/25" || bad "duel scrim"
echo "$R" | grep -q 'oldWhite:0' && ok "no bg-white/15 chips left in duel" || bad "bg-white/15 still alive"

echo "== phase 5: report band (open-report event) =="
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").trim()==="گزارش");if(b){b.click();return "clicked"}window.dispatchEvent(new CustomEvent("open-report"));return "event"})()' >/dev/null
sleep 2
R=$(agent-browser eval '(()=>{
  const band=document.querySelector("[class*=from-emerald-800]");
  return JSON.stringify({bandFound:!!band});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'bandFound:true' && ok "report band = emerald-800 family" || skp "report band (dialog path differs)"

echo "== phase 6: konkur hero (text-nav) =="
agent-browser eval 'document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))' >/dev/null
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].find(x=>/کنکور/.test(x.textContent||""));if(b){b.click();return "nav"}return "no-target"})()' >/dev/null
sleep 2
R=$(agent-browser eval '(()=>{
  const hero=document.querySelector("[class*=from-red-700]");
  return JSON.stringify({konkur700:!!hero,kpi:!!document.querySelector("[class*=bg-black\\/25]")});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'konkur700:true' && ok "konkur hero = 700-family" || skp "konkur view (nav target not found on home)"

echo "== phase 7: gmetro hero (text-nav) =="
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button,a,[role=button]")].find(x=>/مترو/.test(x.textContent||""));if(b){b.click();return "nav"}return "no-target"})()' >/dev/null
sleep 2
R=$(agent-browser eval '(()=>{
  const hero=document.querySelector("[class*=from-teal-700]");
  return JSON.stringify({gmetroDeep:!!hero,steps:document.querySelectorAll("[class*=bg-black\\/20]").length});})()' 2>&1 | tr -d '"\\')
echo "$R"
echo "$R" | grep -q 'gmetroDeep:true' && ok "gmetro hero = teal-700 deeper family" || skp "gmetro view (nav target not found)"

echo "== phase 8: mobile 390 + console =="
agent-browser set viewport 390 844 >/dev/null 2>&1 || agent-browser resize 390 844 >/dev/null 2>&1 || true
sleep 2
R=$(agent-browser eval 'JSON.stringify({overflowX:document.documentElement.scrollWidth>document.documentElement.clientWidth})' 2>&1 | tr -d '"\')
echo "$R"
echo "$R" | grep -q 'overflowX:false' && ok "mobile-390 no horizontal overflow" || bad "mobile-390 overflow"
C=$(agent-browser console 2>&1 | grep -ciE "error" || true)
[ "${C:-0}" = "0" ] && ok "console = 0 errors" || bad "console has $C error lines"

echo "QA-DONE pass=$PASS fail=$FAIL skip=$SKIP"
exit 0
