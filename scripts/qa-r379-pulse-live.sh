#!/usr/bin/env bash
# ------------------------------------------------------------------
# r379 — داوریِ زندهٔ «مسیرِ بانیتیجهٔ» چیپِ نبضِ زنده (بندِ ③ِ پیشنهادِ r378):
#   r378 فقط مسیرِ صفر را رویِ APIِ راستین داوری کرد — نبضِ واقعیِ صفر بود.
#   این راند یک تلاشِ واقعیِ یادگیرندهٔ پنجرهٔ QA ثبت میکند تا سه مسیرِ
#   هنوززندهنشده رویِ APIِ راستین داوری شود:
#   A) ریاستارت رویِ standaloneِ همین راند (قراردادِ r374) + داورِ دستنخورده
#   B) یک دستِ واقعیِ چالش برق‌آسا (qa-fresh-session --play) → تلاشِ راستین
#      در DB + شاهدِ بایت (شمارِ تلاشهایِ ۱۰دقیقهٔ اخیر) — نه فقط توست
#   C) نامگذاریِ سمتِ سرور از پاپاورِ پروفایل (ذخیره ⇒ sendProfile) —
#      یادگیرندهٔ زنده در روزنامه با نامِ خودش خوانا میشود
#   D) گیتِ معلم ⇒ پنل: نشانِ «۱» ↔ انتظارِ داده‌محور از report (ساعتِ
#      generatedAtِ خودش) + کارتِ آمار + سرشماریِ ۸۳ردیفی
#   E) کلیکِ چیپ ⇒ دقیقاً ۱ ردیفِ زندهٔ نامدار؛ خالیِ سوم غایب؛ سرشماری
#      دستنخورده
#   F) ماتریسِ ترکیب: چیپ × «نبض» ⇒ ۱ ردیف + «۱ یادگیرنده یافت شد»؛
#      چیپ × «سارا» ⇒ خالیِ صادق با hintِ سه‌دره (زیرِ نبضِ زنده — نو)؛
#      پاکسازیِ جست‌وجو چیپ را نمیرد (قراردادِ r378)
#   G) خاموشیِ چیپ ⇒ کلِ فهرست برمیگردد
#   H) شاتِ روشن (چیپِ روشن، ردیفِ زندهٔ یگانه) + شاتِ تیره (نشانِ «۱»)
#   I) EventDay + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r379-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) ریاستارت رویِ buildِ همین راند" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
cd /home/z/my-project
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) یک دستِ واقعیِ چالش برق‌آسا — تلاشِ راستین، نه ساختگی" | tee -a "$OUT"
bash /home/z/my-project/scripts/qa-fresh-session.sh --name "نبض زنده QA" --play 2>&1 | tee -a "$OUT"
sleep 2
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const n = await p.quizAttempt.count({ where: { createdAt: { gte: since }, category: 'rush' } });
  console.log('RUSH-ATTEMPT-IN-10M=' + n);
  const prof = await p.learnerProfile.findFirst({ where: { createdAt: { gte: since } }, select: { name: true } });
  console.log('NEW-PROFILE-NAME=' + (prof ? prof.name : 'none'));
  await p.\$disconnect();
})().catch(e => { console.error('DB-ERR ' + e.message); process.exit(1); });
" 2>&1 | tee -a "$OUT"

echo "########## C) نامگذاریِ سمتِ سرور — پاپاورِ پروفایل ⇒ ذخیره ⇒ sendProfile" | tee -a "$OUT"
ev "(()=>{const t=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').startsWith('پروفایل من'));if(!t)return 'NO-TRIGGER';t.click();return 'popover-open';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.textContent||'').includes('ذخیرهٔ پروفایل'));if(!b)return 'NO-SAVE';b.click();return 'save-clicked';})()"
sleep 2
ev "(()=>{const esc=document.activeElement;document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return 'esc';})()" >/dev/null 2>&1
sleep 1
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  const prof = await p.learnerProfile.findFirst({ where: { createdAt: { gte: since } }, select: { name: true, secret: true } });
  console.log('RENAMED=' + (prof ? prof.name + ' secret=' + (prof.secret ? 'yes' : 'no') : 'none'));
  await p.\$disconnect();
})().catch(e => { console.error('DB-ERR ' + e.message); process.exit(1); });
" 2>&1 | tee -a "$OUT"

echo "########## D) گیتِ معلم ⇒ پنل — نشانِ «۱» ↔ انتظارِ داده‌محور" | tee -a "$OUT"
ev "(()=>{const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');if(!b)return 'NO-TEACHER-BTN';b.click();return 'teacher';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(async ()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  if(!res.ok)return 'REPORT-HTTP-'+res.status;
  const j=await res.json();
  const snap=Date.parse(j.generatedAt);
  const actives=j.roster.filter(r=>r.lastActive&&Date.parse(r.lastActive)>=snap-86400000);
  const badge=document.querySelector('[data-testid=\"teacher-active-badge\"]');
  const card=[...document.querySelectorAll('*')].find(el=>el.children.length===0&&(el.textContent||'').trim()==='فعال در ۲۴ ساعت');
  const card24=card?card.parentElement.querySelector('span:last-child,div:last-child'):null;
  const census=[...document.querySelectorAll('h2')].find(h=>(h.textContent||'').includes('یادگیرندگان ('));
  return JSON.stringify({EXPECTED:{activeLearners:actives.length,activeNames:actives.map(a=>a.name),roster:j.roster.length,last24h:j.summary.last24h},BADGE:badge&&badge.textContent,CARD24:card24&&card24.textContent,CENSUS:census&&census.textContent});
})()"

echo "########## E) کلیکِ چیپ ⇒ دقیقاً ۱ ردیفِ زندهٔ نامدار" | tee -a "$OUT"
ev "(()=>{const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');if(!chip)return 'NO-CHIP';chip.click();return 'clicked';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const census=[...document.querySelectorAll('h2')].find(h=>(h.textContent||'').includes('یادگیرندگان ('));
  const names=rows.map(r=>r.querySelector('span,p,div')?.textContent||'').slice(0,3);
  return JSON.stringify({CHIP:{pressed:chip&&chip.getAttribute('aria-pressed'),rows:rows.length,thirdEmptyAbsent:!empty,firstNames:names,census:census&&census.textContent}});
})()"
shot r379-pulse-live-light.png

echo "########## F) ماتریسِ ترکیب — همسایه و بیهمسایه، زیرِ نبضِ زنده" | tee -a "$OUT"
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-search-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'نبض');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed-nabz';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const cnt=document.querySelector('[data-testid=\"teacher-search-count\"]');
  const se=document.querySelector('[data-testid=\"teacher-search-empty\"]');
  const rows=[...document.querySelectorAll('[data-testid=\"teacher-row\"]')];
  const rowText=rows.map(r=>r.textContent||'').join(' | ').slice(0,120);
  return JSON.stringify({COMPOSE_MATCH:{rows:rows.length,count:cnt&&cnt.textContent,searchEmpty:!!se,rowText}});
})()"
ev "(()=>{const clr=document.querySelector('[data-testid=\"teacher-search-clear\"]');if(!clr)return 'NO-CLEAR';clr.click();return 'cleared';})()" >/dev/null 2>&1
sleep 0.8
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-search-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'سارا');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed-sara';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const se=document.querySelector('[data-testid=\"teacher-search-empty\"]');
  const cnt=document.querySelector('[data-testid=\"teacher-search-count\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  return JSON.stringify({COMPOSE_NOMATCH:{rows,count:cnt&&cnt.textContent,searchEmpty:!!se,hint3doors:se&&se.textContent.includes('چیپِ «فعال» را بردار'),chipStillPressed:chip&&chip.getAttribute('aria-pressed')}});
})()"
ev "(()=>{const clr=document.querySelector('[data-testid=\"teacher-search-clear\"]');if(!clr)return 'NO-CLEAR';clr.click();return 'cleared';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  return JSON.stringify({AFTER_CLEAR:{chipStillPressed:chip&&chip.getAttribute('aria-pressed'),rows,activeEmpty:!!empty}});
})()"

echo "########## G) خاموشیِ چیپ ⇒ کلِ فهرست" | tee -a "$OUT"
ev "(()=>{const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');if(!chip)return 'NO-CHIP';chip.click();return 'toggled-off';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  const census=[...document.querySelectorAll('h2')].find(h=>(h.textContent||'').includes('یادگیرندگان ('));
  return JSON.stringify({OFF:{rows,pressed:chip&&chip.getAttribute('aria-pressed'),activeEmptyGone:!empty,census:census&&census.textContent}});
})()"

echo "########## H) شاتِ تیره — نشانِ «۱» زیرِ نبضِ زنده" | tee -a "$OUT"
ev "(()=>{const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');if(chip)chip.click();document.documentElement.classList.add('dark');return 'dark+chip-on';})()" >/dev/null 2>&1
sleep 1.2
shot r379-pulse-live-dark.png
ev "(()=>{const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');if(chip&&chip.getAttribute('aria-pressed')==='true')chip.click();document.documentElement.classList.remove('dark');return 'light+chip-off';})()" >/dev/null 2>&1

echo "########## I) EventDay + کنسولِ پاک" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['teacher_open','rush_done','teacher_detail','teacher_class_csv'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r379-console.log || true
if [ -s /tmp/r379-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r379-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
