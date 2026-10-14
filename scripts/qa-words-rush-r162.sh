#!/bin/bash
# Task 162 — the 9th dual-system badge «واژه و برق» (words × rush) live QA
# against a PRODUCTION verification instance on 3004 (dev 3000 bundle is
# frozen pre-wave-9 — same one-call route as r149/r156-r160).
#
# WHY production: the long-lived dev server (3000) can never contain task 162.
# Temporarily patch next.config.ts distDir, `bunx next build` into a SIDE dir,
# `next start -p 3004`, run all phases, kill via ss-PID, restore config +
# tsconfig, rm the side dir — all inside THIS single tool call.
#
# Seed mechanics (r158/r160 pattern + r161 ATOMIC lesson): every seed is
# ONE eval task — mutate localStorage THEN location.reload() in the same
# JS task, so no poller setState can interleave (JS single-threaded) and
# persist never writes the stale memory back over the seed. dayHistory
# entries {day,words:1,rush:1} feed both new win14 counters
# (wordsDays14 + rushDays14 — Task 162's extraction from the generic
# windowCounters).
#
# Phases:
#   A. capstone seed twin(14) → wordsDays14=14 + rushDays14=14 →
#      tileCount=61, chip «N از ۶۱», tile «واژه و برق» UNLOCKED + gold
#   D. subset/independence live: words-rush shines; marathon (review +
#      dictation + quiz — all strangers) + five-skill-week (2/5) + the
#      whole old combo family stay dark — the 5th honest gap
#   D2. independence: rushOnly(14) — combo locked «قفل — ۰ از ۱۴ روزِ واژه»
#   B. tie seed twin(7) (50/50) → locked, honest hint «۷ از ۱۴ روزِ واژه»
#      (tie → the FIRST dim string, <= contract), bar 50%
#   C. independence seed wordsOnly(14) → locked «۰ از ۱۴ روزِ برق»
#   E. OV390 = 0
#   F. console errors = 0
#   G. strip seed (backup-ONCE restore) → chip «۰ از ۶۱»
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r162.bak
DIST=.next-prod162

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod162",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
rg -q 'distDir' "$CFG" || { echo "PATCH-FAILED"; exit 1; }
bunx next build >/tmp/r162-build.log 2>&1 || { echo "BUILD-FAILED"; tail -30 /tmp/r162-build.log; exit 1; }
echo "BUILD-OK"

echo "--- 1. start prod162 on 3004 (lives only inside this call)"
( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod162-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP after ${i}s"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; tail -20 /tmp/prod162-3004.log; exit 1; }

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
# intro may show on the fresh profile — skip it, then swallow analytics
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

seed_hist() {  # $1 = RAW object-literal fields (e.g. 'words:1,rush:1'), $2 = tag
  # SINGLE seed + reload (the r162d diagnostic's PROVEN pattern — run-3's
  # double-seed/double-reload broke phase A: the second reload interrupts
  # the first navigation's commit and the page hydrates pre-seed storage).
  agent-browser eval "(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const KEY='vision2-study-v1';
  const prev=localStorage.getItem(KEY);
  if(!localStorage.getItem('vision2-study-v1-r162-backup')) localStorage.setItem('vision2-study-v1-r162-backup', prev===null?'__ABSENT__':prev);
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:0,dictation:0,rush:0,$1};
  st.dayHistory=hist;
  st.goalMetDays=[];
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  return 'SEEDED-$2';
})()" 2>/dev/null
  # the CLI reload — r158/r160's battle-tested badge-QA pattern (in-eval
  # location.reload() proved unreliable as the session's FIRST navigation)
  agent-browser reload >/dev/null 2>&1
  # poll until the reloaded page is complete AND the badge section renders
  for i in $(seq 1 10); do
    sleep 2
    RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
    [ "$RD" = "complete|true" ] && break
  done
  agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
  sleep 2
}

echo "--- A. capstone seed twin(14): 14 twin days (words+rush) → UNLOCKED"
seed_hist 'words:1,rush:1' 'TWIN14'
# verify-with-retry: the check is read-only and idempotent; tolerate any
# reload latency (cold chunks) by re-reading until the capstone state lands
for attempt in 1 2 3 4 5; do
  OUT=$(agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  if(!sec) return "SECTION-MISSING";
  const tiles=[...sec.querySelectorAll("button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("واژه و برق"));
  const chipEl=[...sec.querySelectorAll("span")].find(s=>/از\s*۶۱$/.test((s.textContent||"").replace(/\s+/g," ")));
  const unlocked = tile ? !!tile.querySelector(".badge-shine") : false;
  return "FULL|" + JSON.stringify({
    tileCount: tiles.length,
    chip: chipEl ? chipEl.textContent.trim() : null,
    tilePresent: !!tile,
    unlocked,
    tierChip: tile ? tile.textContent.includes("نشان طلایی") : null
  });
})()' 2>/dev/null)
  echo "$OUT"
  echo "$OUT" | rg -q '"unlocked":true' && break
  sleep 3
done

echo "--- D. subset/independence live: 5th honest gap — marathon + five-skill + old family dark"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const st=(t)=>{ const x=tiles.find(y=>y.textContent.includes(t)); return x ? !!x.querySelector(".badge-shine") : null; };
  return "SUBSET-FULL|" + JSON.stringify({
    wordsRush: st("واژه و برق"),
    marathon: st("ماراتنِ دوهفته‌ای"),
    fiveSkill: st("هفتهٔ پنج‌گانه"),
    reviewQuiz: st("مرور و آزمون"),
    reviewDictation: st("مرور و دیکته"),
    quizPresence: st("آزمون و حضور"),
    presencePledge: st("حضور و پیمان"),
    dictationPledge: st("دیکته و پیمان")
  });
})()' 2>/dev/null

echo "--- D2. independence: rushOnly(14) — combo locked «۰ از ۱۴ روزِ واژه»"
seed_hist 'rush:1' 'RUSHONLY'
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("واژه و برق"));
  return "GAP-RUSHONLY|" + JSON.stringify({
    combo: tile ? !tile.querySelector(".badge-shine") : null,
    comboHint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,60) : null
  });
})()' 2>/dev/null

echo "--- B. tie seed twin(7): 50/50 → honest words hint, bar 50%"
agent-browser eval "(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const KEY='vision2-study-v1';
  const parsed=JSON.parse(localStorage.getItem(KEY));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<7;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:1,dictation:0,rush:1};
  st.dayHistory=hist;
  localStorage.setItem(KEY,JSON.stringify(parsed));
  location.reload();
  return 'SEEDED-TIE7';
})()" 2>/dev/null
for i in $(seq 1 10); do
  sleep 2
  RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
  [ "$RD" = "complete|true" ] && break
done
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("واژه و برق"));
  if(!tile) return "TILE-MISSING";
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۶۱$/.test((s.textContent||"").replace(/\s+/g," ")));
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
  return "TIE|" + JSON.stringify({ wrapCount: wraps.length, hintExact: wrap.t.includes("۷ از ۱۴ روزِ واژه"), progressLabel: wrap.t.includes("پیشرفت تو:"), barW: bar ? bar.style.width : null, sample: wrap.t.slice(0,120) });
})()' 2>/dev/null

echo "--- C. independence seed wordsOnly(14) → locked «۰ از ۱۴ روزِ برق»"
agent-browser eval "(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const KEY='vision2-study-v1';
  const parsed=JSON.parse(localStorage.getItem(KEY));
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:1,dictation:0,rush:0};
  st.dayHistory=hist;
  localStorage.setItem(KEY,JSON.stringify(parsed));
  location.reload();
  return 'SEEDED-WORDSONLY';
})()" 2>/dev/null
for i in $(seq 1 10); do
  sleep 2
  RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
  [ "$RD" = "complete|true" ] && break
done
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "SKIPPED";} return "NO-INTRO";})()' 2>/dev/null
sleep 2
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("واژه و برق"));
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
  const bak=localStorage.getItem("vision2-study-v1-r162-backup");
  if (bak==="__ABSENT__") localStorage.removeItem(KEY);
  else if (bak) localStorage.setItem(KEY,bak);
  localStorage.removeItem("vision2-study-v1-r162-backup");
  const chk=localStorage.getItem(KEY);
  location.reload();
  return "STRIPPED|" + (chk ? "RESTORED" : "ABSENT-OK");
})()' 2>/dev/null
for i in $(seq 1 10); do
  sleep 2
  RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
  [ "$RD" = "complete|true" ] && break
done
agent-browser eval '(() => {
  const sec=document.querySelector(".badge-section");
  const chipEl=sec ? [...sec.querySelectorAll("span")].find(s=>/از\s*۶۱$/.test((s.textContent||"").replace(/\s+/g," "))) : null;
  return "POST-STRIP|" + JSON.stringify({ section: sec ? "present" : "MISSING", chip: chipEl ? chipEl.textContent.trim() : null });
})()' 2>/dev/null

echo "--- cleanup: kill 3004 + restore config/tsconfig + rm dist"
trap - EXIT
restore
rm -rf "$DIST"
echo "R162-QA-DONE"
