#!/bin/bash
# Task 158 — the 7th dual-system badge «مرور و دیکته» (review×dictation) live QA
# against a PRODUCTION verification instance on 3004 (dev 3000 bundle is
# frozen pre-wave-9 — same one-call route as r149..r156).
#
# Seed pattern: backup-ONCE on vision2-study-v1; relative day keys computed
# in-browser with LOCAL date arithmetic (daysAgoKey contract). Helpers are
# defined INSIDE every eval — window tags do not survive reloads (r152 lesson).
# twin(n) = n days with BOTH reviews:1 AND dictation:1 —
#   reviewsDays14 = dictationDays14 = n (same 14-day window, Task 90).
# revOnly(n)/dictOnly(n) = one dimension only.
#
# Phases:
#   A. capstone seed twin(14) → reviewsDays14=14 + dictationDays14=14 →
#      tileCount=59, chip «N از ۵۹», tile «مرور و دیکته» UNLOCKED
#      (badge-shine) + «نشان طلایی»
#   D. subset discipline live: review-run «هفتهٔ مرور» shines (7 ⊂ 14),
#      dictation-run «هفتهٔ دیکتهٔ پیوسته» shines (7 ⊂ 14) — while the
#      HONEST THIRD GAP holds: marathon «ماراتنِ دوهفته‌ای» stays DARK
#      (quizDays14=0 — needs all three), and the pledge family +
#      آزمون و حضور stay dark (no goals, 14 active < 30, no quizzes)
#   D2. independence live: dictOnly(14) → dictation-run shines but
#       review-run + combo do NOT (review dimension truly empty)
#   B. tie seed twin(7) (50/50) → locked, honest hint «۷ از ۱۴ روزِ مرور»
#      (<= tie → review string), bar 50%; both runs still shine
#   C. independence seed revOnly(14) → locked, hint «۰ از ۱۴ روزِ دیکته»
#      (dictation dimension truly empty); review-run shines, dictation-run
#      dark, marathon dark
#   E. OV390 = 0
#   F. console errors = 0
#   G. strip seed (backup-ONCE restore)
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r158.bak
DIST=.next-prod158

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod158",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r158-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r158-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod158 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod158-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod158-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1

echo "--- A. capstone seed twin(14): 14 twin days (review+dictation) → UNLOCKED"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const KEY="vision2-study-v1";
  const prev=localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r158-backup", prev||"__ABSENT__");
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:1,rush:0};
  st.dayHistory=hist;
  st.goalMetDays=[];
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return "SEEDED-TWIN14";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const tiles=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("مرور و دیکته"));
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۵۹$/.test((s.textContent||"").replace(/\s+/g," ")));
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

echo "--- D. subset discipline live: both runs shine, marathon + pledge family dark (honest third gap)"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "SUBSET-FULL|" + JSON.stringify({
    reviewRun: st("هفتهٔ مرور"),
    dictationRun: st("هفتهٔ دیکتهٔ پیوسته"),
    combo: st("مرور و دیکته"),
    marathon: st("ماراتنِ دوهفته‌ای"),
    presencePledge: st("حضور و پیمان"),
    dictationPledge: st("دیکته و پیمان"),
    quizPresence: st("آزمون و حضور")
  });
})()' 2>/dev/null

echo "--- D2. independence live: dictOnly(14) — dictation-run shines, review-run + combo do NOT"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:0,dictation:1,rush:0};
  st.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-DICTONLY";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  const tile=tiles.find(x=>x.textContent.includes("مرور و دیکته"));
  return "GAP-DICTONLY|" + JSON.stringify({
    combo: st("مرور و دیکته"),
    comboHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null,
    reviewRun: st("هفتهٔ مرور"),
    dictationRun: st("هفتهٔ دیکتهٔ پیوسته"),
    marathon: st("ماراتنِ دوهفته‌ای")
  });
})()' 2>/dev/null

echo "--- B. tie seed twin(7): 50/50 → honest review hint, bar 50%"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<7;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:1,rush:0};
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
  const tile=tiles.find(x=>x.textContent.includes("مرور و دیکته"));
  if(!tile) return "TILE-MISSING";
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۵۹$/.test((s.textContent||"").replace(/\s+/g," ")));
  const runTile=tiles.find(x=>x.textContent.includes("هفتهٔ مرور"));
  const dictTile=tiles.find(x=>x.textContent.includes("هفتهٔ دیکتهٔ پیوسته"));
  tile.click();
  return "CLICKED|" + JSON.stringify({
    locked: !tile.querySelector(".badge-shine"),
    tileHint: (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60),
    reviewRunShines: runTile ? !!runTile.querySelector(".badge-shine") : null,
    dictRunShines: dictTile ? !!dictTile.querySelector(".badge-shine") : null,
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
  return "TIE|" + JSON.stringify({ wrapCount: wraps.length, hintExact: wrap.t.includes("۷ از ۱۴ روزِ مرور"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null, sample: wrap.t.slice(0,120) });
})()' 2>/dev/null

echo "--- C. independence seed revOnly(14): review-only → combo locked, bar 0%"
agent-browser eval '(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const parsed=JSON.parse(localStorage.getItem("vision2-study-v1"));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:1,quizzes:0,words:0,dictation:0,rush:0};
  st.dayHistory=hist;
  localStorage.setItem("vision2-study-v1",JSON.stringify(parsed));
  return "SEEDED-REVONLY";
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("مرور و دیکته"));
  const runTile=tiles.find(x=>x.textContent.includes("هفتهٔ مرور"));
  const dictTile=tiles.find(x=>x.textContent.includes("هفتهٔ دیکتهٔ پیوسته"));
  const marathonTile=tiles.find(x=>x.textContent.includes("ماراتنِ دوهفته‌ای"));
  return "INDEP|" + JSON.stringify({
    comboLocked: tile ? !tile.querySelector(".badge-shine") : null,
    tileHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null,
    reviewRunShines: runTile ? !!runTile.querySelector(".badge-shine") : null,
    dictRunShines: dictTile ? !!dictTile.querySelector(".badge-shine") : null,
    marathonShines: marathonTile ? !!marathonTile.querySelector(".badge-shine") : null
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
  const bak=localStorage.getItem("vision2-study-v1-r158-backup");
  if (bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if (bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r158-backup");
  const chk=localStorage.getItem(KEY);
  return "STRIPPED|" + (chk ? "RESTORED" : "ABSENT-OK");
})()' 2>/dev/null
agent-browser reload >/dev/null 2>&1
sleep 3
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  const chipEl=sec ? [...sec.querySelectorAll("span")].find(s=>/از\s*۵۹$/.test((s.textContent||"").replace(/\s+/g," "))) : null;
  return "POST-STRIP|" + JSON.stringify({ section: sec ? "present" : "MISSING", chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R158-QA-DONE"
