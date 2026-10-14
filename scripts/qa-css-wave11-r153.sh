#!/bin/bash
# Task 153 — §8.3 wave 11 (SRS state donut → srs-panel.css append) live QA
# against a PRODUCTION verification instance on 3004 (dev 3000 bundle frozen
# pre-wave-9 — same one-call route as r149/r150/r151/r152).
#
# No seed needed: the .srs-donut ring renders unconditionally inside the SRS
# panel on the home page (owner: practice/srs-panel.tsx line ~169).
#
# Phases:
#   A. dark: computed backgroundColor == rgba(6, 44, 34, 0.5), boxShadow ==
#      none, 1px border rgb(13,100,88,0.4) — the migrated painter is live.
#   B. light: utility painters (bg-white/50 → rgba(255,255,255,0.5) +
#      shadow-sm), zero dark values (no leak).
#   C. CSSOM single-hit (selectorText-first walk): .dark .srs-donut ×1,
#      zero heads in the globals sheet, same family sheet as .dark .srs-panel.
#   D. served source: head in the family chunk, absent from the globals chunk.
#   E. OV390 = 0.   F. console errors = 0.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r153.bak
DIST=.next-prod153

restore() {
  if [ -f "$BAK" ]; then cp "$BAK" "$CFG"; fi
  git checkout tsconfig.json >/dev/null 2>&1 || true
  for pid in $(ss -ltnp 2>/dev/null | rg '3004' | rg -o 'pid=([0-9]+)' -r '$1' | sort -u); do
    kill -9 "$pid" 2>/dev/null
  done
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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod153",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r153-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r153-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod153 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod153-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod153-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1

# the SRS panel (and its donut) mounts only with progress — seed one known
# word + one srs item (backup-ONCE, stripped at the end)
echo "--- 0b. minimal progress seed (SRS panel mounts only with progress)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r153-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  st.known={"l1-w1":true};
  st.srs={"l1-w1":{level:1,dueAt:Date.now()-3600000}};
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED-PROGRESS";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1
agent-browser eval '(() => "DONUT|" + (document.querySelector(".srs-donut") ? "present" : "MISSING"))' 2>/dev/null

echo "--- A. dark: migrated donut painter live on the real element"
agent-browser eval '(() => {
  const el = document.querySelector(".srs-donut");
  if (!el) return "DARK|donut=MISSING";
  el.style.transition = "none";
  document.documentElement.classList.add("dark");
  const cs = getComputedStyle(el);
  const out = {
    bg: cs.backgroundColor,
    shadow: cs.boxShadow,
    bw: cs.borderTopWidth,
    bc: cs.borderTopColor
  };
  document.documentElement.classList.remove("dark");
  return "DARK|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- B. light: utility painters (probe-equality — Tailwind v4 computes bg-white/50 as lab(... / 0.5)), zero dark values"
agent-browser eval '(() => {
  const el = document.querySelector(".srs-donut");
  el.style.transition = "none";
  const probe = document.createElement("div");
  probe.className = "bg-white/50";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const cs = getComputedStyle(el);
  const out = {
    bgUtility: cs.backgroundColor === getComputedStyle(probe).backgroundColor,
    shadowLive: cs.boxShadow !== "none",
    noDarkBg: cs.backgroundColor !== "rgba(6, 44, 34, 0.5)",
    bgSample: cs.backgroundColor.slice(0, 44)
  };
  probe.remove();
  return "LIGHT|" + JSON.stringify(out);
})()' 2>/dev/null

echo "--- C. CSSOM single-hit (selectorText-first walk)"
agent-browser eval '(() => {
  const seen = { donut: 0, globalsHeads: 0, familySheetOk: false, panelAnchor: 0 };
  const walk = (rules, tags) => {
    for (const r of rules) {
      if (r.selectorText) {
        const st = r.selectorText.trim();
        if (st === ".dark .srs-donut") { seen.donut++; if (tags.has("globals")) seen.globalsHeads++; if (tags.has("family") && tags.has("panel")) seen.familySheetOk = true; }
        else if (st === ".dark .srs-panel") { seen.panelAnchor++; }
      }
      if (r.cssRules && r.cssRules.length > 0) walk(r.cssRules, tags);
    }
  };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    const tags = new Set();
    for (const r of rules) {
      const st = r.selectorText ? r.selectorText.trim() : "";
      if (st === ".dark .stat-band") tags.add("globals");
      if (st === ".dark .srs-panel") tags.add("panel");
      if (st === ".dark .srs-donut" || st === ".dark .srs-panel") tags.add("family");
    }
    walk(rules, tags);
  }
  return "CSSOM|" + JSON.stringify(seen);
})()' 2>/dev/null

echo "--- D. served source: head in family chunk, absent from globals chunk"
agent-browser eval '(() => {
  const heads = [".dark .srs-donut{"];
  const chunks = [...document.querySelectorAll("link[rel=stylesheet]")].map((l) => l.href);
  return Promise.all(chunks.map((u) => fetch(u).then((r) => r.text()).then((t) => ({ u, t }))))
    .then((all) => {
      const globalsChunks = all.filter((x) => x.t.includes(".dark .stat-band"));
      const familyChunks = all.filter((x) => !x.t.includes(".dark .stat-band"));
      const inFamily = familyChunks.some((x) => heads.every((h) => x.t.includes(h)));
      const inGlobals = globalsChunks.some((x) => heads.some((h) => x.t.includes(h)));
      return "SOURCE|" + JSON.stringify({ inFamily, inGlobals });
    });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- G. strip seed (backup-ONCE restore)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r153-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY); else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r153-backup");
  return bak==="__ABSENT__" ? "STRIPPED-ABSENT" : "STRIPPED-RESTORED";
})()' 2>/dev/null

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R153-QA-DONE"
