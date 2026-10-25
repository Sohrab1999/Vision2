#!/usr/bin/env bash
# ------------------------------------------------------------------
# r343 — نخستین داوریِ زندهٔ خانوادهٔ CSV و شکستِ تصویر/اشتراکِ دو گزارش.
#   درمانِ سنجشی: تزریقِ URL.createObjectURL→throw و toBlob→null (رفتارِ
#   واقعیِ «ساختِ ناموفق» — قراردادِ catch→false ⇒ توستِ صادقانه) +
#   رکوردگرِ لنگرِ a[download] + negctlِ بازگردانی. درسِ بزرگِ راند:
#   «کلیک و کاوشِ اتمیک» — evalِ agent-browser پرامیس را await میکند؛
#   پس کلیک+صبر+کاوش در «یک فراخوانِ اتمیک» مینشیند و هیچ مسابقهٔ
#   بین-evalی (تعویضِ زمینه، احیایِ مرورگر، mountِ دیرهنگامِ زیرِ فشارِ
#   حافظه) نمیماند. الگوها: گاردِ seed (r338) · negctl (r339) ·
#   رانندهٔ یکپارچه (r341) · احیایِ ضدِ OOM (r343).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r343-csv.txt
: > "$OUT"

shot()  { agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
rec(){ agent-browser eval "(()=>JSON.stringify(window.__r343rec||{}))()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# اتمیک: کلیک + نظرسنجیِ درون-صفحهایِ توست تا ۸ثانیه + پاسخِ یکریگ
click_toast(){ agent-browser eval "(()=>{
  const b=document.querySelector('[aria-label=\"$1\"]');
  if(!b||b.getBoundingClientRect().width===0)return Promise.resolve('NO-BTN:$1');
  b.click();
  return new Promise((res)=>{
    let n=0;
    const tick=()=>{
      const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);
      if(lis.some((el)=>(el.innerText||'').includes('$2')))return res('TOAST-HIT:$2');
      if(++n>=16)return res('TOAST-TIMEOUT[$2] seen:'+(lis.map((l)=>(l.innerText||'').slice(0,30)).join(' | ')||'none'));
      setTimeout(tick,500);
    };
    setTimeout(tick,600);
  });
})()" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }
# اتمیک: کلیکِ ساده (برای مسیرهای بیتوست / رکوردگرمحور)
click_aria(){ agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"$1\"]');if(!b||b.getBoundingClientRect().width===0)return 'NO-BTN:$1';b.click();return 'clicked';})()" 2>&1 | tee -a "$OUT"; }
install_recorders(){ agent-browser eval "(()=>{
  if(!window.__origCOU)window.__origCOU=URL.createObjectURL.bind(URL);
  if(!window.__origToBlob)window.__origToBlob=HTMLCanvasElement.prototype.toBlob;
  if(!window.__r343rec){window.__r343rec={cou:0,dl:0,names:[],blob:0};
    document.addEventListener('click',(e)=>{const a=e.target&&e.target.closest?e.target.closest('a[download]'):null;if(a){window.__r343rec.dl++;window.__r343rec.names.push(a.download||'?');}},true);}
  return 'base-recorders-on';})()" 2>&1 | tee -a "$OUT"; }
cou_fail_on(){ agent-browser eval "(()=>{URL.createObjectURL=function(){window.__r343rec.cou++;throw new TypeError('r343-cou-injected');};return 'cou-fail-on';})()" 2>&1 | tee -a "$OUT"; }
cou_restore(){ agent-browser eval "(()=>{if(window.__origCOU)URL.createObjectURL=window.__origCOU;return 'cou-restored';})()" 2>&1 | tee -a "$OUT"; }
blob_fail_on(){ agent-browser eval "(()=>{HTMLCanvasElement.prototype.toBlob=function(cb,...rest){window.__r343rec.blob++;setTimeout(()=>cb(null),0);};return 'blob-fail-on';})()" 2>&1 | tee -a "$OUT"; }
blob_restore(){ agent-browser eval "(()=>{if(window.__origToBlob)HTMLCanvasElement.prototype.toBlob=window.__origToBlob;return 'blob-restored';})()" 2>&1 | tee -a "$OUT"; }
to_dark(){ agent-browser eval "(()=>{document.documentElement.classList.add('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
to_light(){ agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1; sleep 1.2; }
wait_home(){ for i in $(seq 1 30); do
  local R; R=$(agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "HOME-OK" ] && { echo "home-ready-${i}x3s" >> "$OUT"; return 0; }; sleep 3
done; echo "HOME-NEVER" | tee -a "$OUT"; return 1; }
seed_guard(){ local R; R=$(agent-browser eval "(()=>{const t=document.body.innerText||'';const hasName=t.includes('آرش-قهرمان');const hasGrid=!!document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return (hasName&&hasGrid)?'SEED-OK':'SEED-MISS';})()" 2>/dev/null | tr -d '"')
  echo "-- [seed-guard] $R" | tee -a "$OUT"; [ "$R" = "SEED-OK" ]; }
ensure_alive(){
  local R; R=$(agent-browser eval "(()=>JSON.stringify({len:(document.body.innerText||'').length}))()" 2>/dev/null)
  echo "$R" | rg -q '"len"' && return 0
  echo "-- [revive] blank-browser — reopening+reseeding" | tee -a "$OUT"
  agent-browser close >/dev/null 2>&1 || true
  agent-browser open "$BASE" >/dev/null 2>&1
  agent-browser set viewport 1280 900 >/dev/null 2>&1
  wait_home || return 1
  agent-browser eval "$(cat /tmp/r343-seed-eval.js)" >/dev/null 2>&1
  sleep 5
  seed_guard || return 1
  install_recorders >/dev/null 2>&1
  return 0
}
open_report(){ ensure_alive || return 1
  agent-browser eval "(()=>{window.dispatchEvent(new Event('open-report'));return 'evt';})()" >> "$OUT" 2>&1
  local i; for i in $(seq 1 30); do
    local R; R=$(agent-browser eval "(()=>{const t=(document.body.innerText||'');if(t.length<200)return 'DEAD';const norm=(s)=>(s||'').replace(/\u200c/g,'');const ok=norm(t).includes(norm('هفته‌نامهٔ پیشرفت'));if(!ok)window.dispatchEvent(new Event('open-report'));return ok?'BAND':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "BAND" ] && { echo "report-open@$i" | tee -a "$OUT"; return 0; }
    [ "$R" = "DEAD" ] && { echo "REPORT-DEAD-PAGE" | tee -a "$OUT"; return 1; }
    sleep 2
  done; echo "REPORT-NEVER" | tee -a "$OUT"; return 1; }
ensure_report(){
  local R; R=$(agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"دانلود جدول CSV پیشرفت\"]');return (b&&b.getBoundingClientRect().width>0)?'OPEN':'CLOSED';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "OPEN" ] && return 0
  open_report; }
open_official(){ ensure_alive || return 1
  agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report'));return 'evt';})()" >> "$OUT" 2>&1
  local i; for i in $(seq 1 40); do
    local R; R=$(agent-browser eval "(()=>{if((document.body.innerText||'').length<200)return 'DEAD';const p=document.querySelector('[aria-label=\"گزارش رسمی پیشرفت درسی\"]');const ok=p&&p.getBoundingClientRect().width>0;if(!ok)window.dispatchEvent(new Event('open-official-report'));return ok?'PAPER':'WAIT';})()" 2>/dev/null | tr -d '"')
    [ "$R" = "PAPER" ] && { echo "official-open@$i" | tee -a "$OUT"; return 0; }
    [ "$R" = "DEAD" ] && { echo "OFFICIAL-DEAD-PAGE" | tee -a "$OUT"; return 1; }
    sleep 2
  done; echo "OFFICIAL-NEVER" | tee -a "$OUT"; return 1; }
ensure_official(){
  local R; R=$(agent-browser eval "(()=>{const b=document.querySelector('[aria-label=\"دانلود CSV پوشش مهارت‌ها\"]');return (b&&b.getBoundingClientRect().width>0)?'OPEN':'CLOSED';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "OPEN" ] && return 0
  open_official; }

echo "########## A) خانه — seed + روشنِ ۱۲۸۰ + رکوردگرها" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r343-seed-eval.js || { echo "PERSONA-FAIL" | tee -a "$OUT"; agent-browser close >/dev/null 2>&1; exit 1; }
wait_home || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "$(cat /tmp/r343-seed-eval.js)" >/dev/null 2>&1
sleep 5
seed_guard || { agent-browser close >/dev/null 2>&1; exit 1; }
agent-browser eval "(()=>{document.documentElement.classList.remove('dark');return 1;})()" >/dev/null 2>&1
install_recorders
sleep 1

echo "########## B) سه CSVِ هفته‌نامه — شکستِ ساخت: COU→throw (اتمیک)" | tee -a "$OUT"
open_report || { agent-browser close >/dev/null 2>&1; exit 1; }
install_recorders
cou_fail_on
click_toast "دانلود جدول CSV پیشرفت" "خطا در ساخت فایل" || true
click_toast "دانلود روند ۴هفته‌ای CSV" "خطا در ساخت فایل" || true
click_toast "دانلود ماه‌نامهٔ خواندن CSV" "خطا در ساخت فایل" || true
rec
shot r343-csv-fail-light.png

echo "########## C) تاریکِ درجا — همان درگاه + شناسنامهٔ توست" | tee -a "$OUT"
to_dark
click_toast "دانلود جدول CSV پیشرفت" "خطا در ساخت فایل" || true
agent-browser eval "(()=>{const lis=[...document.querySelectorAll('ol li')].filter((el)=>el.className.includes('pointer-events-auto')&&el.getBoundingClientRect().height>0);const l=lis[0];if(!l)return 'NO-LIVE';const cs=getComputedStyle(l);return JSON.stringify({live:true,cls:(l.className.match(/(?:bg|text)-[a-z-]+[\d]*/g)||[]).join(','),bg:cs.backgroundColor,ink:cs.color});})()" 2>&1 | tee -a "$OUT"
shot r343-csv-fail-dark.png
to_light

echo "########## D) negctl — بازگردانیِ COU ⇒ سه توستِ موفقیت + سه لنگر" | tee -a "$OUT"
ensure_report || { agent-browser close >/dev/null 2>&1; exit 1; }
cou_restore
click_toast "دانلود جدول CSV پیشرفت" "جدول CSV ذخیره شد" || true
click_toast "دانلود روند ۴هفته‌ای CSV" "روندِ ۴هفته‌ای ذخیره شد" || true
click_toast "دانلود ماه‌نامهٔ خواندن CSV" "ماه‌نامهٔ خواندن ذخیره شد" || true
rec
shot r343-csv-ok-negctl.png

echo "########## E) عکسِ هفته‌نامه — شکستِ canvas: toBlob→null + بازگردانی" | tee -a "$OUT"
ensure_report || { agent-browser close >/dev/null 2>&1; exit 1; }
blob_fail_on
click_toast "گرفتن عکس هفته‌نامهٔ پیشرفت" "خطا در ساخت تصویر" || true
rec
blob_restore
click_toast "گرفتن عکس هفته‌نامهٔ پیشرفت" "عکسِ هفته‌نامه ذخیره شد" || true
rec

echo "########## F) اشتراکِ بیپشتیبانِ هفته‌نامه — بدونِ استاب (هدلس canShare ندارد)" | tee -a "$OUT"
ensure_report || { agent-browser close >/dev/null 2>&1; exit 1; }
click_toast "هم‌رسانی عکس هفته‌نامهٔ پیشرفت" "هم‌رسانی ممکن نشد" || true
rec
shot r343-weekly-share-unsupported.png

echo "########## G) کارنامهٔ رسمی — coverage CSV: پایِ تازهٔ درمانِ r343" | tee -a "$OUT"
agent-browser eval "(()=>{window.dispatchEvent(new Event('open-official-report'));return 'prewarm';})()" >> "$OUT" 2>&1
sleep 2
agent-browser key Escape >/dev/null 2>&1 || true; sleep 1
ensure_official || { agent-browser close >/dev/null 2>&1; exit 1; }
cou_fail_on
click_toast "دانلود CSV پوشش مهارت‌ها" "خطا در ساخت فایل" || true
rec
shot r343-coverage-fail-fixed.png
cou_restore
click_toast "دانلود CSV پوشش مهارت‌ها" "CSV پوشش ذخیره شد" || true
rec
shot r343-coverage-ok.png

echo "########## H) عکسِ کارنامه — شکستِ canvas + بازگردانی" | tee -a "$OUT"
ensure_official || { agent-browser close >/dev/null 2>&1; exit 1; }
blob_fail_on
click_toast "گرفتن عکس کارنامهٔ رسمی" "خطا در ساخت تصویر" || true
rec
blob_restore
click_toast "گرفتن عکس کارنامهٔ رسمی" "عکسِ کارنامه ذخیره شد" || true
rec

echo "########## I) اشتراکِ بیپشتیبانِ کارنامه + basis-zero" | tee -a "$OUT"
ensure_official || { agent-browser close >/dev/null 2>&1; exit 1; }
click_toast "هم‌رسانی عکس کارنامهٔ رسمی" "هم‌رسانی ممکن نشد" || true
rec
shot r343-official-share-unsupported.png
agent-browser eval "$(cat "$DIR/r319-basis-zero-audit.js")" 2>&1 | tail -1 | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "QA-R343-CSV-FAMILY-DONE" | tee -a "$OUT"
