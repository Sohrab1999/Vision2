#!/bin/bash
# r386 — داوریِ زندهٔ «ستونِ فقراتِ ترتیبِ دفترچه»:
#   ① گیتِ id: رکوردِ دستکاری‌شده با idِ «zzz» (روزِ دیروز) در رأسِ آرایهٔ
#      persist، کنارِ رکوردِ واقعیِ امروز — در buildِ r385 زنده میماند و
#      «آخرین مصاف» میشود (دروغ: CHIP[برد · دیروز] درحالیکه مصافِ واقعی
#      امروز است)؛ در buildِ r386 در همان گیتِ hydration میافتد.
#   ② ترمیمِ ترتیب: آرایهٔ کاملاً «قانونی» اما وارونه (قدیمی در رأس) —
#      r385 سرِ آرایه را «آخرین» میخواند؛ r386 مرز، newest-first ترمیم
#      میکند و چیپِ خانه «امروز» میخواند.
#   ③ لابیِ نبرد: ردیفِ رأسِ دفترچه نامِ حریفِ درست را نشان میدهد و
#      «ربایندهٔ آزمون» از کلِ نما غایب است.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r386-qa.txt
: > "$OUT"
shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

# بذرِ ① — دستکاری: ربایندهٔ بیقرارداد (دیروز) در رأس + واقعیِ امروز
SEED_HIJACK='(()=>{
  const k=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const raw=localStorage.getItem("vision2-study-v1");const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  j.state.duelHistory=[
    {id:"zzz",day:k(1),outcome:"win",reason:"finished",opponent:"ربایندهٔ آزمون",opponentColor:"rose",myScore:9,oppScore:2,myCorrect:9,oppCorrect:2,answered:10,total:10,durationSec:80},
    {id:"d"+Date.now(),day:k(0),outcome:"win",reason:"finished",opponent:"سارا",opponentColor:"emerald",myScore:8,oppScore:3,myCorrect:8,oppCorrect:3,answered:10,total:10,durationSec:95}
  ];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  location.reload();return "seeded-hijack";
})()'
# بذرِ ② — وارونهٔ قانونی: دو رکوردِ درقرارداد، قدیمی در رأس
SEED_REVERSED='(()=>{
  const k=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const raw=localStorage.getItem("vision2-study-v1");const j=raw?JSON.parse(raw):{state:{},version:0};
  j.state=j.state||{};j.state.onboarded=true;
  j.state.duelHistory=[
    {id:"d"+(Date.now()-86400000),day:k(1),outcome:"loss",reason:"finished",opponent:"مریم",opponentColor:"rose",myScore:4,oppScore:7,myCorrect:4,oppCorrect:7,answered:10,total:10,durationSec:110},
    {id:"d"+Date.now(),day:k(0),outcome:"win",reason:"finished",opponent:"سارا",opponentColor:"emerald",myScore:8,oppScore:3,myCorrect:8,oppCorrect:3,answered:10,total:10,durationSec:95}
  ];
  localStorage.setItem("vision2-study-v1",JSON.stringify(j));
  location.reload();return "seeded-reversed";
})()'

READ_CHIP='(()=>{
  const el=document.querySelector("[data-duel-resume]");
  const local=new Date().toString().slice(0,24);
  if(!el) return "NO_CHIP";
  return "CHIP["+el.textContent.trim().replace(/\s+/g," ")+"]";
})()'
read_chip(){ for i in $(seq 1 15); do R=$(agent-browser eval "$READ_CHIP" 2>/dev/null | tr -d '"'); case "$R" in CHIP*) echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; return;; esac; sleep 0.4; done; echo "$R" | tee -a "$OUT"; echo | tee -a "$OUT"; }

OPEN_LOBBY='(()=>{
  const cards=[...document.querySelectorAll("button,a")];
  const duel=cards.find(e=>(e.textContent||"").includes("نبرد دودنفره"));
  if(duel){duel.click();return "clicked-duel-card";}
  return "DUEL-CARD-NOT-FOUND";
})()'
READ_LOBBY='(()=>{
  const t=document.body.textContent;
  const rows=[...document.querySelectorAll(".text-\\[10\\.5px\\]")].map(e=>e.textContent.trim()).filter(Boolean).slice(0,4);
  return "LOBBY[top-name="+(t.includes("رباینده")?"حاضر":"غایب")+
    " sara="+(t.includes("سارا")?"حاضر":"غایب")+
    "] ROWS["+rows.join(" | ")+"]";
})()'

echo "########## PHASE-A — شاهدِ پیش رویِ buildِ r385 (سرورِ درحالِ اجرا)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
echo "— بذرِ ① ربایندهٔ بیقرارداد در رأس" | tee -a "$OUT"
ev "$SEED_HIJACK" >/dev/null 2>&1; sleep 2; read_chip
shot r386-before-hijack-light.png
ev "$OPEN_LOBBY" >/dev/null 2>&1; sleep 2; ev "$READ_LOBBY" | tee -a "$OUT"
shot r386-before-hijack-lobby.png

echo "— بذرِ ② وارونهٔ قانونی (بی هیچ idِ خراب)" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 1
ev "$SEED_REVERSED" >/dev/null 2>&1; sleep 2; read_chip

echo "########## PHASE-B — buildِ r386 + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r386-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -8 /tmp/r386-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
(HOSTNAME=127.0.0.1 PORT=3000 bun .next/standalone/server.js > /tmp/r386-server.log 2>&1 &) ; sleep 6
for i in $(seq 1 20); do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE" 2>/dev/null)
  [ "$C" = "200" ] && { echo "APP=200" | tee -a "$OUT"; break; }; sleep 2
done
curl -s -o /dev/null -w "JUDGE=%{http_code}\n" --max-time 3 http://127.0.0.1:3003 | tee -a "$OUT"

agent-browser open "$BASE" >/dev/null 2>&1; sleep 2
echo "— بذرِ ① همان دستکاری ⇒ رباینده میافتد، واقعیِ امروز میخواند" | tee -a "$OUT"
ev "$SEED_HIJACK" >/dev/null 2>&1; sleep 2; read_chip
shot r386-after-gate-light.png
ev "$OPEN_LOBBY" >/dev/null 2>&1; sleep 2; ev "$READ_LOBBY" | tee -a "$OUT"
shot r386-after-gate-lobby-dark.png

echo "— بذرِ ② وارونهٔ قانونی ⇒ مرز newest-first ترمیم میکند" | tee -a "$OUT"
agent-browser open "$BASE" >/dev/null 2>&1; sleep 1
ev "$SEED_REVERSED" >/dev/null 2>&1; sleep 2; read_chip

echo "— کنسول" | tee -a "$OUT"
ev "(()=>{const errs=(window.__qaErrors||[]).length;return 'CONSOLE_ERRORS='+errs;})()" | tee -a "$OUT"
echo "QA-DONE" | tee -a "$OUT"
