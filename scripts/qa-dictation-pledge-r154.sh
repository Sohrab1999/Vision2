#!/bin/bash
# Task 154 — the 5th dual-system badge «دیکته و پیمان» (dictation×pledge) live QA
# against a PRODUCTION verification instance on 3004 (dev 3000 bundle is
# frozen pre-wave-9 — same one-call route as r149/r150/r151/r152).
#
# Seed pattern: backup-ONCE on vision2-study-v1; relative day keys computed
# in-browser with LOCAL date arithmetic (daysAgoKey contract). Helpers are
# defined INSIDE every eval — window tags do not survive reloads (r152 lesson).
#
# Phases:
#   A. capstone seed (14 dictation days + 14 recent goal days) → tileCount=57,
#      chip «N از ۵۷», tile «دیکته و پیمان» UNLOCKED (badge-shine) + «نشان طلایی»
#   D. subset discipline live: dictation-run «هفتهٔ دیکتهٔ پیوسته» and
#      goal-fortnight «دو هفتهٔ درخشان» shine too (7d ⊂ 14d window + 14 goals)
#   B. partial seed (7 dict days + 7 goals — fractions tie 50/50) → locked,
#      honest hint «۷ از ۱۴ روزِ دیکته» (<= tie → dictation string), bar 50%;
#      dictation-run still shines, pledge does NOT (reverse subset)
#   C. independence seed (14 OLD goal days 60+d, empty dayHistory) → locked,
#      hint «۰ از ۱۴ روزِ دیکته» (dictation dimension truly empty), bar 0%
#   E. OV390 = 0
#   F. console errors = 0
#   G. strip seed (backup-ONCE restore)
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r154.bak
DIST=.next-prod154

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod154",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r154-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r154-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod154 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod154-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod154-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1

echo "--- A. capstone seed: 14 dictation days + 14 recent goal days → UNLOCKED"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r154-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  st.dayHistory=Object.fromEntries(Array.from({length:14},(_,i)=>[dk(i),{day:dk(i),reviews:0,quizzes:0,words:0,dictation:1,rush:0}]));
  st.goalMetDays=Array.from({length:14},(_,i)=>dk(i));
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED-FULL";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const tiles=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("دیکته و پیمان"));
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۵۷$/.test((s.textContent||"").replace(/\s+/g," ")));
  // shine lives on the badge-card DESCENDANT, not the button (r126 lesson)
  const unlocked = tile ? !!tile.querySelector(".badge-shine") : false;
  return "FULL|" + JSON.stringify({
    tileCount: tiles.length,
    chip: chipEl ? chipEl.textContent.trim() : null,
    tilePresent: !!tile,
    unlocked,
    tierChip: tile ? tile.textContent.includes("نشان طلایی") : null
  });
})()' 2>/dev/null

echo "--- D. unlock implies the two predecessors (subset discipline, live)"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "SUBSET|" + JSON.stringify({ dictRun: st("هفتهٔ دیکتهٔ پیوسته"), goalFortnight: st("دو هفتهٔ درخشان"), pledge: st("دیکته و پیمان") });
})()' 2>/dev/null

echo "--- B. partial seed: 7 dict days + 7 goals (50/50 tie) → honest dictation hint"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  st.dayHistory=Object.fromEntries(Array.from({length:7},(_,i)=>[dk(i),{day:dk(i),reviews:0,quizzes:0,words:0,dictation:1,rush:0}]));
  st.goalMetDays=Array.from({length:7},(_,i)=>dk(i));
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-PARTIAL";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("دیکته و پیمان"));
  if(!tile) return "TILE-MISSING";
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۵۷$/.test((s.textContent||"").replace(/\s+/g," ")));
  const runTile=tiles.find(x=>x.textContent.includes("هفتهٔ دیکتهٔ پیوسته"));
  tile.click();
  return "CLICKED|" + JSON.stringify({
    locked: !tile.querySelector(".badge-shine"),
    tileHint: (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60),
    runShines: runTile ? !!runTile.querySelector(".badge-shine") : null,
    chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null
sleep 1.5
agent-browser eval '(() => {
  // collect ALL popper wrappers — take the one with real content (stale/empty
  // wrappers exist in production radix; longest-text wins)
  const wraps=[...document.querySelectorAll("[data-radix-popper-content-wrapper]")];
  const wrap=wraps.map(w=>({w, t:(w.textContent||"").replace(/\s+/g," ")})).sort((a,b)=>b.t.length-a.t.length)[0];
  if(!wrap) return "POPOVER-MISSING";
  const bar=wrap.w.querySelector(".h-2 > div, .h-2 .rounded-full");
  return "PARTIAL|" + JSON.stringify({ wrapCount: wraps.length, hintExact: wrap.t.includes("۷ از ۱۴ روزِ دیکته"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null, sample: wrap.t.slice(0,120) });
})()' 2>/dev/null
agent-browser eval '(() => { document.body.click(); return "x"; })()' >/dev/null 2>&1

echo "--- C. independence seed: 14 OLD goals (60+d) + empty dayHistory"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  st.dayHistory={};
  st.goalMetDays=Array.from({length:14},(_,i)=>dk(60+i));
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-OLD";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tile=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")].find(x=>x.textContent.includes("دیکته و پیمان"));
  if(!tile) return "TILE-MISSING";
  const locked=!tile.querySelector(".badge-shine");
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۵۷$/.test((s.textContent||"").replace(/\s+/g," ")));
  tile.click();
  return "OLD|" + JSON.stringify({ locked, tileHint: (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60), chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null
sleep 1.5
agent-browser eval '(() => {
  const wraps=[...document.querySelectorAll("[data-radix-popper-content-wrapper]")];
  const wrap=wraps.map(w=>({w, t:(w.textContent||"").replace(/\s+/g," ")})).sort((a,b)=>b.t.length-a.t.length)[0];
  if(!wrap) return "POPOVER-MISSING";
  const bar=wrap.w.querySelector(".h-2 > div, .h-2 .rounded-full");
  return "OLD-POP|" + JSON.stringify({ hintZero: wrap.t.includes("۰ از ۱۴ روزِ دیکته"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null });
})()' 2>/dev/null
agent-browser eval '(() => { document.body.click(); return "x"; })()' >/dev/null 2>&1

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
  const bak=localStorage.getItem("vision2-study-v1-r154-backup");
  if(bak==="__ABSENT__") localStorage.removeItem(KEY); else if(bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r154-backup");
  return bak==="__ABSENT__" ? "STRIPPED-ABSENT" : "STRIPPED-RESTORED";
})()' 2>/dev/null

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R154-QA-DONE"
