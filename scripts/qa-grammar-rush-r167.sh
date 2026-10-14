#!/bin/bash
# Task 167 — the 11th dual-system badge «گرامر و برق» (grammar × rush)
# live QA against a PRODUCTION verification instance on 3004 (dev 3000
# bundle is frozen pre-wave-9 — same one-call route as r149-r165).
#
# WHY production: the long-lived dev server (3000) can never contain task 167.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# ARBITRATION MEMO (the writing post-mortem): the planned 10th dimension
# (writingDays14 from `:writing` results keys) was discovered and KILLED
# before shipping — only THREE lessons (LESSONS_META 1/2/3) have writing
# arrays, so writingDays14 can never exceed 3 and a 14-day gate would be
# an impossible badge. The 11th pair therefore joins the two remaining
# ×1 dimensions from EXISTING stores: grammar (results g:*) × rush
# (dayHistory.rush) — the words/rush/grammar triangle closes.
#
# Seed mechanics (r165 pattern + r161 ATOMIC lesson): in-eval
# location.reload() inside the same JS task; FETCH/sendBeacon patches are
# RE-APPLIED after every reload (r161 lesson — patches do not survive
# reloads). Two disjoint sources: dayHistory {rush:1} days feed
# rushDays14, results g:* keys with `at` dates feed grammarDays14.
#
# Phases:
#   A. capstone seed twin(14) → tileCount=63, chip «N از ۶۳», tile
#      «گرامر و برق» UNLOCKED + badge-shine + gold + rail icon
#      (.lucide-train-track)
#   D. 7th honest gap live: grammar-rush shines; words-rush + grammar-words
#      + marathon + five-skill + the whole old combo family stay dark
#   D2. grammarOnly(14) — combo locked «قفل — ۰ از ۱۴ روزِ برق»
#   B. tie seed twin(7) (50/50) → locked, honest hint «۷ از ۱۴ روزِ گرامر»
#      (tie → the FIRST dim string, <= contract), popover bar 50%
#   C. rushOnly(14) → locked «قفل — ۰ از ۱۴ روزِ گرامر»
#   E. OV390 = 0
#   F. console errors = 0
#   G. strip seed (backup-ONCE restore) → chip «۰ از ۶۳»
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r167.bak
DIST=.next-prod167

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod167",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r167-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r167-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod167 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod167-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod167-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 1
patch_net() {
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
}
patch_net

# seed_state $1 = RAW dayHistory fields (e.g. 'rush:1'; '' = all zero)
#            $2 = dayHistory day count (0..14)
#            $3 = grammar day count (0..14 — results g:* keys, at = dk(i))
#            $4 = tag
# in-eval location.reload() inside the same JS task (the atomic pattern);
# network patches re-applied after the reload (r161 lesson).
seed_state() {
  agent-browser eval "(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const KEY='vision2-study-v1';
  const prev=localStorage.getItem(KEY);
  if(!localStorage.getItem('vision2-study-v1-r167-backup')) localStorage.setItem('vision2-study-v1-r167-backup', prev===null?'__ABSENT__':prev);
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<$2;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:0,dictation:0,rush:0,$1};
  st.dayHistory=hist;
  const res={};
  for (let i=0;i<$3;i++) res['g:st:d'+i]={correct:3,total:5,percent:60,at:dk(i)};
  st.results=res;
  st.goalMetDays=[];
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  location.reload();
  return 'SEEDED-$4';
})()" 2>/dev/null
  for i in $(seq 1 10); do
    sleep 2
    RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
    [ "$RD" = "complete|true" ] && break
  done
  agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
  sleep 2
  patch_net
}

echo "--- A. capstone seed twin(14): 14 grammar days + 14 rush days → UNLOCKED"
seed_state 'rush:1' 14 14 FULL
for attempt in 1 2 3 4 5; do
  OUT=$(agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const tiles=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("گرامر و برق"));
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۶۳$/.test((s.textContent||"").replace(/\s+/g," ")));
  const unlocked = tile ? !!tile.querySelector(".badge-shine") : false;
  return "FULL|" + JSON.stringify({
    tileCount: tiles.length,
    chip: chipEl ? chipEl.textContent.trim() : null,
    tilePresent: !!tile,
    unlocked,
    railIcon: tile ? !!tile.querySelector(".lucide-train-track") : null,
    tierChip: tile ? tile.textContent.includes("نشان طلایی") : null
  });
})()' 2>/dev/null)
  echo "$OUT"
  echo "$OUT" | rg -q '"unlocked":true' && break
  sleep 3
done

echo "--- D. 7th honest gap live: grammar-rush shines, strangers stay dark"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "SUBSET-FULL|" + JSON.stringify({
    grammarRush: st("گرامر و برق"),
    wordsRush: st("واژه و برق"),
    grammarWords: st("گرامر و واژه"),
    marathon: st("ماراتنِ دوهفته‌ای"),
    fiveSkill: st("هفتهٔ پنج‌گانه"),
    reviewQuiz: st("مرور و آزمون"),
    reviewDictation: st("مرور و دیکته"),
    quizPresence: st("آزمون و حضور"),
    presencePledge: st("حضور و پیمان"),
    dictationPledge: st("دیکته و پیمان")
  });
})()' 2>/dev/null

echo "--- D2. grammarOnly(14) — combo locked «۰ از ۱۴ روزِ برق»"
seed_state '' 0 14 GRAMMARONLY
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("گرامر و برق"));
  return "GAP-GRAMMARONLY|" + JSON.stringify({
    combo: tile ? !tile.querySelector(".badge-shine") : null,
    comboHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null
  });
})()' 2>/dev/null

echo "--- B. tie seed twin(7): 50/50 → honest grammar hint, bar 50%"
seed_state 'rush:1' 7 7 TIE7
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("گرامر و برق"));
  if(!tile) return "TILE-MISSING";
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۶۳$/.test((s.textContent||"").replace(/\s+/g," ")));
  tile.click();
  return "CLICKED|" + JSON.stringify({
    locked: !tile.querySelector(".badge-shine"),
    tileHint: (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60),
    chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null
sleep 1.5
agent-browser eval '(() => {
  const wraps=[...document.querySelectorAll("[data-radix-popper-content-wrapper]")];
  const wrap=wraps.map(w=>({w, t:(w.textContent||"").replace(/\s+/g," ")})).sort((a,b)=>b.t.length-a.t.length)[0];
  if(!wrap) return "POPOVER-MISSING";
  const bar=wrap.w.querySelector(".h-2 > div, .h-2 .rounded-full");
  return "TIE|" + JSON.stringify({ wrapCount: wraps.length, hintExact: wrap.t.includes("۷ از ۱۴ روزِ گرامر"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null, sample: wrap.t.slice(0,120) });
})()' 2>/dev/null

echo "--- C. rushOnly(14) → locked «۰ از ۱۴ روزِ گرامر»"
seed_state 'rush:1' 14 0 RUSHONLY
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("گرامر و برق"));
  return "INDEP|" + JSON.stringify({
    comboLocked: tile ? !tile.querySelector(".badge-shine") : null,
    tileHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null
  });
})()' 2>/dev/null

echo "--- E. mobile 390 overflow"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => { const d=document.documentElement; return "OV390|innerWidth="+window.innerWidth+"|"+Math.max(d.scrollWidth-window.innerWidth,0); })()' 2>/dev/null
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- F. console errors"
agent-browser console 2>/dev/null | rg -i "error" | rg -v "favicon|Download the React DevTools|audio|Audio" | wc -l | xargs echo "CONSOLE_ERRORS="

echo "--- G. strip seed (backup-ONCE restore)"
agent-browser eval '(() => {
  const KEY="vision2-study-v1";
  const bak=localStorage.getItem("vision2-study-v1-r167-backup");
  if (bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if (bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r167-backup");
  const chk=localStorage.getItem(KEY);
  location.reload();
  return "STRIPPED|" + (chk ? "RESTORED" : "ABSENT-OK");
})()' 2>/dev/null
sleep 5
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۶۳$/.test((s.textContent||"").replace(/\s+/g," ")));
  return "STRIP-CHIP|" + JSON.stringify({ chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null

agent-browser close --all >/dev/null 2>&1
echo "R167-QA-DONE"
