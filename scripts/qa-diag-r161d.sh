#!/bin/bash
# Task 161 diagnostic — why does the onboarding modal reopen after the
# atomic restore+reload? Dump the RAW vision2-study-v1 payload at each step
# to discriminate: (a) storage holds onboarded:true but the dialog opens
# (hydration/merge issue) vs (b) storage is clobbered back to false between
# my setItem and the new page's rehydrate (early setState before rehydrate).
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r161d.bak
DIST=.next-prod161

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  git checkout tsconfig.json >/dev/null 2>&1 || true
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
}
trap restore EXIT

cp "$CFG" "$BAK"
rg -q 'distDir' "$CFG" && { echo "CONFIG-ALREADY-PATCHED-ABORT"; exit 1; }
python3 - "$CFG" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s = s.replace('const nextConfig: NextConfig = {\n  output: "standalone",',
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod161",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
bunx next build >/tmp/r161d-build.log 2>&1 || { echo "BUILD-FAILED"; tail -20 /tmp/r161d-build.log; exit 1; }
echo "BUILD-OK"

( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod161d-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
echo "--- D0. raw storage BEFORE anything (3004 origin as it stands now)"
agent-browser eval '(() => {
  const k=localStorage.getItem("vision2-study-v1");
  const b=localStorage.getItem("vision2-qa-bak-r161");
  return "D0|study="+(k===null?"ABSENT":k.slice(0,220))+"|bak="+(b===null?"ABSENT":b.slice(0,120));
})()' 2>/dev/null

echo "--- D1. clear both keys + fresh anonymous seed (atomic reload)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  localStorage.removeItem("vision2-qa-bak-r161");
  localStorage.setItem(KEY, JSON.stringify({state:{introDone:true,onboarded:true,userName:""},version:0}));
  location.reload();
  return "D1-SEEDED";
})()' 2>/dev/null
sleep 5
echo "--- D2. storage + modal right after the true-seed reload"
agent-browser eval '(() => {
  const k=localStorage.getItem("vision2-study-v1");
  const modal=!!document.querySelector(".onboard-paper");
  return "D2|modal="+modal+"|study="+(k===null?"ABSENT":k.slice(0,200));
})()' 2>/dev/null

echo "--- D3. seed onboarded:false (atomic reload) → expect modal open"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const raw=localStorage.getItem(KEY);
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state=Object.assign({},obj.state,{onboarded:false});
  localStorage.setItem(KEY,JSON.stringify(obj));
  location.reload();
  return "D3-SEEDED";
})()' 2>/dev/null
sleep 5
echo "--- D4. storage + modal after false-seed reload"
agent-browser eval '(() => {
  const k=localStorage.getItem("vision2-study-v1");
  const modal=!!document.querySelector(".onboard-paper");
  return "D4|modal="+modal+"|study="+(k===null?"ABSENT":k.slice(0,220));
})()' 2>/dev/null

echo "--- D5. atomic restore to TRUE + reload, then dump at +2s and +6s"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const raw=localStorage.getItem(KEY);
  const obj=raw?JSON.parse(raw):{state:{},version:0};
  obj.state=Object.assign({},obj.state,{introDone:true,onboarded:true});
  localStorage.setItem(KEY,JSON.stringify(obj));
  location.reload();
  return "D5-RESTORED";
})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const k=localStorage.getItem("vision2-study-v1");
  const modal=!!document.querySelector(".onboard-paper");
  return "D5a(t+2s)|modal="+modal+"|study="+(k===null?"ABSENT":k.slice(0,220));
})()' 2>/dev/null
sleep 4
agent-browser eval '(() => {
  const k=localStorage.getItem("vision2-study-v1");
  const modal=!!document.querySelector(".onboard-paper");
  return "D5b(t+6s)|modal="+modal+"|study="+(k===null?"ABSENT":k.slice(0,220));
})()' 2>/dev/null

trap - EXIT
restore
rm -rf "$DIST"
echo "R161D-DONE"
