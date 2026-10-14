#!/bin/bash
# Task 162 diagnostic — where does the twin(14) seed die?
# Step-by-step storage dump: open → intro click → seed (with in-eval write
# proof) → post-wait dump → post-reload dump → tile/chip/hint state.
set -u
cd /home/z/my-project

CFG=next.config.ts
BAK=/tmp/next.config.ts.r162d.bak
DIST=.next-prod162

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
              'const nextConfig: NextConfig = {\n  distDir: ".next-prod162",\n  output: "standalone",')
open(p, "w", encoding="utf-8").write(s)
PY
bunx next build >/tmp/r162d-build.log 2>&1 || { echo "BUILD-FAILED"; tail -20 /tmp/r162d-build.log; exit 1; }
echo "BUILD-OK"

( NODE_ENV=production node node_modules/next/dist/bin/next start -p 3004 -H 127.0.0.1 >/tmp/prod162d-3004.log 2>&1 & )
UP=0
for i in $(seq 1 40); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3004/ --max-time 5 2>/dev/null)
  if [ "$code" = "200" ]; then UP=1; echo "SERVER-UP"; break; fi
done
[ "$UP" = "1" ] || { echo "SERVER-FAILED"; exit 1; }

dump() {
  agent-browser eval '(() => {
    const k=localStorage.getItem("vision2-study-v1");
    const b=localStorage.getItem("vision2-qa-r162d-bak");
    let dayN=0, words=0, rush=0;
    if(k){ try{ const p=JSON.parse(k); const st=p.state||p;
      const dh=st.dayHistory||{};
      dayN=Object.keys(dh).length;
      for(const v of Object.values(dh)){ if(v.words>0)words++; if(v.rush>0)rush++; }
    }catch(e){} }
    return "DUMP|study="+(k===null?"ABSENT":("days="+dayN+" wordsDays="+words+" rushDays="+rush+" len="+k.length))+"|bak="+(b===null?"ABSENT":b.slice(0,40));
  })()' 2>/dev/null
}

agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3004 >/dev/null 2>&1
sleep 5
echo "--- T1. storage right after first open"
dump
echo "--- T2. click intro skip, wait, dump (does the click persist?)"
agent-browser eval '(() => {const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("ناشناس میمانم")); if(b){b.click();return "CLICKED";} return "NO-INTRO";})()' 2>/dev/null
sleep 3
dump
echo "--- T3. seed twin(14) with IN-EVAL write proof"
agent-browser eval "(() => {
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
  const KEY='vision2-study-v1';
  const prev=localStorage.getItem(KEY);
  const parsed=prev?JSON.parse(prev):{state:{},version:0};
  const st=parsed.state||parsed;
  const hist={};
  for (let i=0;i<14;i++) hist[dk(i)]={day:dk(i),reviews:0,quizzes:0,words:1,dictation:0,rush:1};
  st.dayHistory=hist;
  st.goalMetDays=[];
  st.seenBadges=[];
  localStorage.setItem(KEY,JSON.stringify(parsed));
  const back=JSON.parse(localStorage.getItem(KEY));
  const bst=back.state||back;
  const proof='WRITE-PROOF|days='+Object.keys(bst.dayHistory||{}).length;
  location.reload();
  return proof+'|reloadIssued';
})()" 2>/dev/null
echo "--- T4. dump immediately (same page, before reload settles)"
sleep 1
dump
echo "--- T5. wait for complete+section, then dump"
for i in $(seq 1 10); do
  sleep 2
  RD=$(agent-browser eval 'document.readyState + "|" + !!document.querySelector(".badge-section")' 2>/dev/null | tr -d '"')
  [ "$RD" = "complete|true" ] && { echo "READY after ${i} polls"; break; }
done
dump
echo "--- T6. tile/chip/hint + re-dump"
agent-browser eval '(() => {
  const tiles=[...document.querySelectorAll(".badge-section button[aria-label^=\"جزئیات نشان\"]")];
  const tile=tiles.find(x=>x.textContent.includes("واژه و برق"));
  const chipEl=[...document.querySelectorAll(".badge-section span")].find(s=>/از\s*۶۱$/.test((s.textContent||"").replace(/\s+/g," ")));
  return "STATE|" + JSON.stringify({
    tileCount: tiles.length,
    chip: chipEl ? chipEl.textContent.trim() : null,
    unlocked: tile ? !!tile.querySelector(".badge-shine") : null,
    hint: tile ? (tile.textContent.match(/قفل — [^"]+/)||[""])[0].slice(0,50) : null
  });
})()' 2>/dev/null
dump

trap - EXIT
restore
rm -rf "$DIST"
echo "R162D-DONE"
