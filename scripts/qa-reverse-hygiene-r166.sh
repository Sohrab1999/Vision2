#!/bin/bash
# Task 166 — reverse-hygiene round live QA against a PRODUCTION verification
# instance on 3004 (dev 3000 bundle is frozen pre-wave-9 — same one-call
# route as r149..r164).
#
# This round buried two ZERO-CONSUMER dark overrides in globals.css:
#   .dark .bg-fuchsia-500  (background-image gradient)
#   .dark .border-teal-500 (border-color)
# No visual delta is possible BY DEFINITION (zero consumers) — so the QA is a
# regression QA: prove the burial landed in the served CSS, prove every band
# neighbor still paints (probe elements, dark mode), prove CSSOM carries no
# ghost of the buried rules, and prove the app-level invariants hold.
#
# Also validated by the new css-hygiene consumer-existence contract (74/74)
# and scripts/css-reverse-hygiene-r166.cjs (0 hard-dead across 35 files) —
# this script is the PRODUCTION face of the same audit.
#
# EPHEMERAL-PROFILE LESSON (r161): agent-browser close --all starts a NEW
# temp profile — 3004 origin localStorage starts EMPTY. The intro dialog is
# skipped via the step-0 button («ناشناس میمانم»); no reload after the
# FETCH/beacon patch → the patch survives (r161 lesson).
#
# Phases (against 127.0.0.1:3004):
#   A. served source: buried rules ABSENT from every CSS chunk; band
#      neighbors PRESENT (violet-700, to-fuchsia-600, bg-orange-500,
#      from-amber-400)
#   B. CSSOM: zero rules for the buried selectors; neighbors present
#      (selectorText-first walk)
#   C. dark paint: probe elements — .dark .text-violet-700 → rgb(196,181,253),
#      .dark .bg-orange-500 → gradient image (the two band families)
#   D. home invariants: today chip + dark toggle round-trip
#   E. OV390 = 0 (home, mobile 390)
#   F. console errors = 0
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r166.bak
DIST=.next-prod166

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  git checkout tsconfig.json >/dev/null 2>&1 || true
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
  rm -rf "$DIST"
}
trap restore EXIT

echo "--- 0. patch distDir + production build into side dir ($DIST)"
cp "$CFG" "$BAK"
rg -q 'distDir' "$CFG" && { echo "CONFIG-ALREADY-PATCHED-ABORT"; exit 1; }
python3 - "$CFG" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
s = s.replace('const nextConfig: NextConfig = {\n  output: "standalone",',
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod166",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r166-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r166-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod166 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod166-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod166-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.includes("/api/event")) return Promise.resolve(new Response("{}", { status: 200 }));
    return realFetch(input, init);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = () => true;
  return "FETCH-PATCHED";
})()' 2>/dev/null

echo "--- A. served source: buried absent everywhere, neighbors present"
agent-browser eval '(() => {
  const buried=[".dark .bg-fuchsia-500{", ".dark .border-teal-500{"];
  const neighbors=[".dark .text-violet-700{", ".dark .to-fuchsia-600{", ".dark .bg-orange-500{", ".dark .from-amber-400"]; // from-amber-400 is GROUPED with from-amber-300 → no "{" suffix (minifier keeps the comma form)
  const chunks=[...document.querySelectorAll("link[rel=stylesheet]")].map(l=>l.href);
  return Promise.all(chunks.map(u=>fetch(u).then(r=>r.text())))
    .then((texts)=>{
      const buriedHits=buried.filter(b=>texts.some(t=>t.includes(b)));
      const missingNeighbors=neighbors.filter(n=>!texts.some(t=>t.includes(n)));
      return "SOURCE|" + JSON.stringify({buriedHits:buriedHits, missingNeighbors:missingNeighbors});
    });
})()' 2>/dev/null

echo "--- B. CSSOM: buried = 0 rules, neighbors present (selectorText walk)"
agent-browser eval '(() => {
  const buried=[".dark .bg-fuchsia-500", ".dark .border-teal-500"];
  const neighbors=[".dark .text-violet-700", ".dark .to-fuchsia-600", ".dark .bg-orange-500", ".dark .from-amber-400"];
  const counts={buried:0, neighbor:0};
  const walk=(rules)=>{ for(const r of rules){ const st=r.selectorText||"";
    if(buried.includes(st)) counts.buried++;
    if(neighbors.includes(st)) counts.neighbor++;
    if(r.cssRules && r.cssRules.length) walk(r.cssRules); } };
  for(const sheet of document.styleSheets){ let rules; try{rules=sheet.cssRules;}catch{continue;} if(rules) walk(rules); }
  return "CSSOM|" + JSON.stringify(counts);
})()' 2>/dev/null

echo "--- C. dark paint: probe elements for the two band families"
agent-browser eval '(() => { document.documentElement.classList.add("dark"); return "DARK-ON"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => {
  const p1=document.createElement("div"); p1.className="text-violet-700"; document.body.appendChild(p1);
  const p2=document.createElement("div"); p2.className="bg-orange-500"; document.body.appendChild(p2);
  const c1=getComputedStyle(p1).color;
  const g2=getComputedStyle(p2).backgroundImage;
  p1.remove(); p2.remove();
  return "PAINT|" + JSON.stringify({violet700:c1, orange500:g2});
})()' 2>/dev/null
agent-browser eval '(() => { document.documentElement.classList.remove("dark"); return "DARK-OFF"; })()' 2>/dev/null

echo "--- D. home invariants: today chip present"
agent-browser eval '(() => {
  const chip=[...document.querySelectorAll("button,a,div")].find(x=>x.textContent && x.textContent.includes("امروز"));
  return "HOME|" + JSON.stringify({todayPresent: !!chip});
})()' 2>/dev/null

echo "--- E. mobile 390 overflow (home)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1
sleep 1

echo "--- F. console errors"
agent-browser console 2>/dev/null | grep -ciE "error" | xargs -I{} echo "CONSOLE_ERRORS={}"

agent-browser close --all >/dev/null 2>&1
echo "R166-QA-DONE"
