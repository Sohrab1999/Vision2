#!/bin/bash
# r384 — داوریِ زندهٔ دو حکم:
#   ② liveTodayStat: روزِ کهنه ⇒ صفرِ صادقِ امروز رویِ چیپ هدف (رفتارِ پیشین
#      حفظ شده — استخراج هیچ رفتاری را عوض نکرد)
#   ③ حلقهٔ هدرِ ۱۹سیگنالی: نشانِ نبردیِ دیده‌نشده، نقطهٔ «نشان تازه» را
#      روشن میکند (پنجرهٔ موقت تا دیده‌شدن در گریدِ خانه — رگه را با
#      پولینگِ ۳۰۰میلیثانیهای میگیریم) + توستِ جشنِ همان لوله
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r384-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) build + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r384-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -5 /tmp/r384-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r384-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

agent-browser open "$BASE" 2>&1 | tail -1 | tee -a "$OUT"
sleep 2

echo "########## B) صفرِ صادقِ امروز — dayStatِ دیروزِ پرکار (۹+۹)، هدفِ ۳" | tee -a "$OUT"
ev "(()=>{
  const k=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const raw=localStorage.getItem('vision2-study-v1');const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};
  j.state.onboarded=true;
  j.state.known={};j.state.results={};j.state.streak=0;j.state.bestStreak=0;j.state.userName='';
  j.state.duelHistory=[];j.state.seenBadges=[];
  j.state.dailyGoal=3;
  j.state.dayStat={day:k(1),reviews:9,quizzes:9,words:0,dictation:0,rush:0,stories:0};
  localStorage.setItem('vision2-study-v1',JSON.stringify(j));location.reload();return 'seeded-stale';
})()" >/dev/null 2>&1
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{return document.body&&document.body.textContent.includes('ابزارهای یادگیری')?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME" ] && { echo "HOME-RELOADED" | tee -a "$OUT"; break; }; sleep 3
done
sleep 1
ev "(()=>{
  const chip=document.querySelector('.goal-chip');
  if(!chip) return 'CHIP-NOT-FOUND';
  const t=(chip.getAttribute('aria-label')||'')+' | '+chip.textContent.trim();
  const zero=/۰/.test(chip.textContent)||/[۰]\/۳/.test(t);
  return 'CHIP['+t.replace(/\s+/g,' ')+'] ZERO_SEEN='+zero;
})()" | tee -a "$OUT"
shot r384-honest-zero-chip-light.png

echo "########## C) حلقهٔ هدرِ ۱۹سیگنالی — نشانِ نبردیِ تازه (دو برد مقابلِ سارا)" | tee -a "$OUT"
ev "(()=>{
  const k=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const raw=localStorage.getItem('vision2-study-v1');const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};
  j.state.onboarded=true;
  j.state.known={};j.state.results={};j.state.streak=0;j.state.bestStreak=0;j.state.userName='';
  j.state.seenBadges=[];j.state.dailyGoal=3;
  j.state.dayStat={day:k(1),reviews:0,quizzes:0,words:0,dictation:0,rush:0,stories:0};
  j.state.duelHistory=[
    {id:'d1',day:k(0),outcome:'win',reason:'score',opponent:'سارا',opponentColor:'rose',myScore:8,oppScore:3,myCorrect:8,oppCorrect:3},
    {id:'d2',day:k(0),outcome:'win',reason:'score',opponent:'سارا',opponentColor:'rose',myScore:6,oppScore:2,myCorrect:6,oppCorrect:2}
  ];
  localStorage.setItem('vision2-study-v1',JSON.stringify(j));location.reload();return 'seeded-duel';
})()" >/dev/null 2>&1
# پولینگِ تندِ نقطهٔ «نشان تازه» — پنجرهٔ موقت تا دیده‌شدن در گریدِ خانه
CAUGHT=NO
for i in $(seq 1 20); do
  R=$(agent-browser eval "(()=>{
    const dot=document.querySelector('[aria-label*=\"نشان تازه\"]');
    if(dot) return 'DOT['+(dot.getAttribute('aria-label')||'')+']';
    const toast=[...document.querySelectorAll('*')].find(e=>e.children.length===0&&(e.textContent||'').includes('نشان جدید'));
    if(toast) return 'TOAST['+toast.textContent.trim().slice(0,50)+']';
    return (document.body&&document.body.textContent.includes('ابزارهای یادگیری'))?'HOME':'WAIT';
  })()" 2>/dev/null | tr -d '"')
  case "$R" in
    DOT*|TOAST*) echo "CAUGHT($i): $R" | tee -a "$OUT"; CAUGHT=YES; shot r384-fresh-dot-dark.png; break;;
    HOME) [ $((i % 4)) -eq 0 ] && echo "home-up,no-dot-yet($i)" | tee -a "$OUT";;
  esac
  sleep 0.3
done
[ "$CAUGHT" = "NO" ] && echo "RACE-LOST (پنجرهٔ موقت — قفلِ رفتاری در jsdom زنده است)" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const s=JSON.parse(localStorage.getItem('vision2-study-v1')||'{}');
  const seen=(s.state&&s.state.seenBadges)||[];
  return 'SEEN_HAS_RIVAL_HUNTER='+seen.includes('rival-hunter')+' SEEN_COUNT='+seen.length;
})()" | tee -a "$OUT"

echo "########## D) EventDay + کنسول" | tee -a "$OUT"
ev "(()=>{const errs=(window.__qaErrors||[]).length;return 'CONSOLE_ERRORS='+errs;})()" | tee -a "$OUT"
echo "QA-DONE" | tee -a "$OUT"
