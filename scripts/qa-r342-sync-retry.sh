#!/usr/bin/env bash
# r342 — تاییدِ mountِ توستِ «✓ پیشرفت ادغام شد» (چرخهٔ دومِ سنجشِ همان راند:
#   در سشنِ E پروب ۲.۲s با reloadِ ۹۰۰ms مسابقه داد و توست را از دست داد —
#   «صفرِ بی mount» دو معنا دارد: توستِ نیامده یا پروبِ دیرسال). درمانِ
#   سنجشی: تأخیرِ reload با استابِ window.setTimeout (شناساییِ کالبکِ
#   reload ⇒ +۸s) — reload لغو نمیشود، فقط دیر میشود؛ پروب در پنجرهٔ امن.
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
DIR=/home/z/my-project/scripts
OUT=/tmp/r342-sync-retry.txt
: > "$OUT"
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 2
node "$DIR/r338-persona.js" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.parse(s).browserEval))" > /tmp/r342-seed-eval3.js || { echo PERSONA-FAIL; exit 1; }
agent-browser eval "$(cat /tmp/r342-seed-eval3.js)" >/dev/null 2>&1
sleep 4
agent-browser eval "(()=>{const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME-OK':'WAIT';})()" 2>/dev/null | tr -d '"'
agent-browser eval "(()=>{const t=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith('پروفایل من'));if(!t)return 'NO-TRIGGER';t.click();return 'profile-open';})()" 2>&1 | tee -a "$OUT"
sleep 1.5
CODE="X6NA-4NZA" # کدِ واقعیِ سشنِ B — روی ابر زنده است (سشنِ attachِ همین راند)
echo "-- [cloud-code] $CODE" | tee -a "$OUT"
# استابِ تأخیرِ reload — قبل از کلیکِ «ورود با کدِ» این دستگاهِ متصلِ دومی
agent-browser eval "(()=>{
  if(!window.__origST){window.__origST=window.setTimeout;
    window.setTimeout=(fn,ms,...r)=>{ if(String(fn).includes('reload')){window.__r342delay=(window.__r342delay||0)+1; return window.__origST(fn,(ms||0)+8000,...r);} return window.__origST(fn,ms,...r);};}
  return 'reload-delay-armed';})()" 2>&1 | tee -a "$OUT"
# دستگاهِ تازه، بی‌کد — شاخهٔ join مستقیم فعال است
agent-browser eval "(()=>{
  const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open');
  const i=dlg&&dlg.querySelector('input[placeholder*=\"کد موجود\"]');
  if(!i)return 'NO-INPUT';
  const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  set.call(i,'$CODE');i.dispatchEvent(new Event('input',{bubbles:true}));return 'filled';})()" 2>&1 | tee -a "$OUT"
agent-browser eval "(()=>{const norm=(s)=>(s||'').replace(/\\u200c/g,'');const dlg=[...document.querySelectorAll('[role=dialog]')].find(d=>d.getAttribute('data-state')==='open');const b=[...dlg.querySelectorAll('button')].find(x=>norm(x.textContent).includes('ورود با کد'));if(!b)return 'NO-BTN';b.click();return 'join-clicked';})()" 2>&1 | tee -a "$OUT"
sleep 1.4
echo "-- [merge-toast-probe] (در پنجرهٔ امنِ تأخیر)" | tee -a "$OUT"
agent-browser eval "$(cat "$DIR/r341-toast-probe.js")" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"
agent-browser screenshot "$EV/r342-sync-merge-toast.png" >/dev/null 2>&1
agent-browser eval "(()=>JSON.stringify({reloadDelays:window.__r342delay||0}))()" 2>&1 | tee -a "$OUT"
agent-browser close >/dev/null 2>&1
echo "QA-R342-MERGE-TOAST-RETRY-DONE" | tee -a "$OUT"
