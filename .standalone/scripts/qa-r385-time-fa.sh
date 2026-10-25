#!/bin/bash
# r385 — داوریِ زندهٔ دو حکم:
#   ② دروغِ نیمهشبِ UTC: مصافِ کلید-امروز در buildِ r384 برچسبِ ساعتیِ
#      ساختگی («N ساعت پیش») میگیرد — witness پیش؛ پس از buildِ r385
#      «امروز» میخواند — witness پس. دیروز-کلید هم «دیروز» میخواند.
#   ③ گویشهایِ تفویضی: پشتیبان (lastSyncAt ⇒ «۵ دقیقه پیش») و لابیِ نبرد
#      (سطرِ دفترچه ⇒ برچسبِ روز-گرا) — هر دو رویِ موتورِ واحدِ time-fa.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r385-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# بذر: آنبورد شد + دو مصاف (کلیدِ امروز/دیروز یکی‌یکی) + همگامسازیِ ۵دقیقهای
SEED_TODAY='(()=>{
  const k=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const raw=localStorage.getItem("vision2-study-v1");const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  j.state.duelHistory=[{id:"dT",day:k(0),outcome:"win",reason:"finished",opponent:"سارا",opponentColor:"rose",myScore:8,oppScore:3,myCorrect:8,oppCorrect:3,answered:10,total:10,durationSec:95}];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  localStorage.setItem("vision2-sync-at",new Date(Date.now()-5*60000).toISOString());
  location.reload();return "seeded-today";
})()'
SEED_YESTERDAY='(()=>{
  const k=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const raw=localStorage.getItem("vision2-study-v1");const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  j.state.duelHistory=[{id:"dY",day:k(1),outcome:"loss",reason:"finished",opponent:"مریم",opponentColor:"emerald",myScore:4,oppScore:7,myCorrect:4,oppCorrect:7,answered:10,total:10,durationSec:110}];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));location.reload();return "seeded-yesterday";
})()'
# خواندنِ چیپِ بازگشت به میدان + ساعتِ محلی برایِ تفسیرِ witness
READ_CHIP='(()=>{
  const el=document.querySelector("[data-duel-resume]");
  const local=new Date().toString().slice(0,24);
  if(!el) return "NO_CHIP home="+(document.body&&document.body.textContent.includes("ابزارهای یادگیری"));
  return "CHIP["+el.textContent.trim().replace(/\s+/g," ")+"] LOCAL["+local+"]";
})()'

read_chip(){ for i in $(seq 1 15); do R=$(agent-browser eval "$READ_CHIP" 2>/dev/null | tr -d '"'); case "$R" in CHIP*) echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return;; esac; sleep 0.4; done; echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## PHASE-A — witnessِ پیش رویِ buildِ r384 (سرورِ درحالِ اجرا)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
ev "$SEED_TODAY" >/dev/null 2>&1; sleep 2; read_chip
shot r385-before-utc-lie-light.png
ev "$SEED_YESTERDAY" >/dev/null 2>&1; sleep 2; read_chip

echo "########## PHASE-B — buildِ r385 + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r385-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -8 /tmp/r385-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r385-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
echo "— مصافِ کلید-امروز ⇒ «امروز»، هرگز برچسبِ ساعتی" | tee -a "$OUT"
ev "$SEED_TODAY" >/dev/null 2>&1; sleep 2; read_chip
shot r385-after-today-honest-light.png

echo "— مصافِ کلید-دیروز ⇒ «دیروز»" | tee -a "$OUT"
ev "$SEED_YESTERDAY" >/dev/null 2>&1; sleep 2; read_chip
shot r385-after-yesterday-dark.png

echo "— گویشِ پشتیبان: پروفایل ⇒ «آخرین همگام‌سازی: ۵ دقیقه پیش»" | tee -a "$OUT"
agent-browser click 'button[aria-label="حساب کاربری"]' >/dev/null 2>&1 || agent-browser click 'header button' >/dev/null 2>&1 || true
sleep 1
ev "(()=>{
  const t=document.body.textContent;
  const m=t.match(/آخرین همگام‌سازی:\s*[^\n]*/);
  return m?('SYNC['+m[0].trim().slice(0,60)+']'):'NO_SYNC_LINE popover='+(t.includes('پشتیبان خودکار')||t.includes('همگام‌سازی'));
})()" | tee -a "$OUT"
shot r385-backup-dialect.png

echo "— لابیِ نبرد: سطرِ دفترچه با برچسبِ روز-گرا" | tee -a "$OUT"
agent-browser press Escape >/dev/null 2>&1
ev "(()=>{
  const cards=[...document.querySelectorAll('button,a')];
  const duel=cards.find(e=>(e.textContent||'').includes('نبرد دودنفره'));
  if(duel){duel.click();return 'clicked-duel-card';}
  return 'DUEL-CARD-NOT-FOUND';
})()" | tee -a "$OUT"
sleep 2
ev "(()=>{
  const t=document.body.textContent;
  const rows=[...document.querySelectorAll('.text-\\[10\\.5px\\]')].map(e=>e.textContent.trim()).filter(Boolean).slice(0,4);
  return 'LOBBY_ROWS['+rows.join(' | ')+'] view='+t.slice(0,40).replace(/\s+/g,' ');
})()" | tee -a "$OUT"
shot r385-lobby-rows.png

echo "— کنسول" | tee -a "$OUT"
ev "(()=>{const errs=(window.__qaErrors||[]).length;return 'CONSOLE_ERRORS='+errs;})()" | tee -a "$OUT"
echo "QA-DONE" | tee -a "$OUT"
