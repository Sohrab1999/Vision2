#!/bin/bash
# Task 156 — the 6th dual-system badge «آزمون و حضور» (quiz×presence) live QA
# against a PRODUCTION verification instance on 3004 (dev 3000 bundle is
# frozen pre-wave-9 — same one-call route as r149/r150/r151/r152/r154).
#
# Seed pattern: backup-ONCE on vision2-study-v1; relative day keys computed
# in-browser with LOCAL date arithmetic (daysAgoKey contract). Helpers are
# defined INSIDE every eval — window tags do not survive reloads (r152 lesson).
# mix(q, r) = q quiz days (quizzes:1, most recent) + r review-only active days
# (reviews:1) — activeDays35 = q+r, quizDays14 = min(q, 14).
#
# Phases:
#   A. capstone seed mix(14,16) → quizDays14=14 + activeDays35=30 →
#      tileCount=58, chip «N از ۵۸», tile «آزمون و حضور» UNLOCKED
#      (badge-shine) + «نشان طلایی»
#   D. subset discipline live: exam-run «هفتهٔ آزمون‌دار» shines (7 ⊂ 14),
#      presence-month-full «ماهِ درخشان» shines (30 active) — while the
#      pledge family (حضور و پیمان / دیکته و پیمان) stays dark (no goals);
#      then the HONEST GAP live: mix(14,0) → exam-run shines but
#      ماهِ درخشان does NOT (14 active < 30); and mix(0,30) →
#      ماهِ درخشان shines but the combo + exam-run do NOT
#   B. tie seed mix(7,8) (50/50 — 7/14 vs 15/30) → locked, honest hint
#      «۷ از ۱۴ روزِ آزمون» (<= tie → quiz string), bar 50%;
#      exam-run still shines, ماهِ درخشان does NOT (15 < 30)
#   C. independence seed mix(0,30) (presence-only) → locked, hint
#      «۰ از ۱۴ روزِ آزمون» (quiz dimension truly empty), bar 0%;
#      ماهِ درخشان shines
#   E. OV390 = 0
#   F. console errors = 0
#   G. strip seed (backup-ONCE restore)
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r156.bak
DIST=.next-prod156

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod156",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r156-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r156-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod156 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod156-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod156-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1

echo "--- A. capstone seed mix(14,16): 14 quiz days + 30 active → UNLOCKED"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r156-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:1,words:0,dictation:0,rush:0};
  for (let i=14;i<30;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:0,rush:0};
  st.dayHistory=hist;
  st.goalMetDays=[];
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
  const tile=tiles.find(x=>x.textContent.includes("آزمون و حضور"));
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۵۸$/.test((s.textContent||"").replace(/\s+/g," ")));
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

echo "--- D. subset discipline live: exam-run + ماهِ درخشان shine, pledge family dark"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "SUBSET-FULL|" + JSON.stringify({
    examRun: st("هفتهٔ آزمون‌دار"),
    monthFull: st("ماهِ درخشان"),
    combo: st("آزمون و حضور"),
    presencePledge: st("حضور و پیمان"),
    dictationPledge: st("دیکته و پیمان"),
    goalFortnight: st("دو هفتهٔ درخشان")
  });
})()' 2>/dev/null

echo "--- D2. honest gap live: mix(14,0) — exam-run shines, ماهِ درخشان does NOT"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:1,words:0,dictation:0,rush:0};
  st.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-QUIZONLY";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "GAP|" + JSON.stringify({
    combo: st("آزمون و حضور"),
    examRun: st("هفتهٔ آزمون‌دار"),
    monthFull: st("ماهِ درخشان")
  });
})()' 2>/dev/null

echo "--- B. tie seed mix(7,8): 50/50 → honest quiz hint, bar 50%"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<7;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:1,words:0,dictation:0,rush:0};
  for (let i=7;i<15;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:0,rush:0};
  st.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-TIE";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("آزمون و حضور"));
  if(!tile) return "TILE-MISSING";
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۵۸$/.test((s.textContent||"").replace(/\s+/g," ")));
  const runTile=tiles.find(x=>x.textContent.includes("هفتهٔ آزمون‌دار"));
  const monthTile=tiles.find(x=>x.textContent.includes("ماهِ درخشان"));
  tile.click();
  return "CLICKED|" + JSON.stringify({
    locked: !tile.querySelector(".badge-shine"),
    tileHint: (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60),
    runShines: runTile ? !!runTile.querySelector(".badge-shine") : null,
    monthShines: monthTile ? !!monthTile.querySelector(".badge-shine") : null,
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
  return "TIE|" + JSON.stringify({ wrapCount: wraps.length, hintExact: wrap.t.includes("۷ از ۱۴ روزِ آزمون"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null, sample: wrap.t.slice(0,120) });
})()' 2>/dev/null

echo "--- C. independence seed mix(0,30): presence-only → combo locked, bar 0%"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<30;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:0,rush:0};
  st.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-PRESONLY";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("آزمون و حضور"));
  const monthTile=tiles.find(x=>x.textContent.includes("ماهِ درخشان"));
  const runTile=tiles.find(x=>x.textContent.includes("هفتهٔ آزمون‌دار"));
  return "INDEP|" + JSON.stringify({
    comboLocked: tile ? !tile.querySelector(".badge-shine") : null,
    tileHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null,
    monthShines: monthTile ? !!monthTile.querySelector(".badge-shine") : null,
    runShines: runTile ? !!runTile.querySelector(".badge-shine") : null
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
  const bak=localStorage.getItem("vision2-study-v1-r156-backup");
  if (bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if (bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r156-backup");
  const chk=localStorage.getItem(KEY);
  return "STRIPPED|" + (chk ? "RESTORED" : "ABSENT-OK");
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  const chipEl=sec ? [...sec.querySelectorAll("span")].find(s=>/از\s*۵۸$/.test((s.textContent||"").replace(/\s+/g," "))) : null;
  return "POST-STRIP|" + JSON.stringify({ section: sec ? "present" : "MISSING", chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R156-QA-DONE"
