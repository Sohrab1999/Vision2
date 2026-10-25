#!/usr/bin/env bash
# ------------------------------------------------------------------
# r381 — داوریِ زندهٔ دو پرش:
#   A) buildِ تولیدیِ همین راند + ریاستارت + داورِ دستنخورده
#   B) گواهِ حکمِ تصحیحشدهٔ ②: «پنل معلم» از r352 در پالت هست (پیشنهادِ
#      r381 بر grepِ ناقصِ فقط-کتابخانه بنا شده بود) — پالت ← جست‌وجوی
#      «معلم» ← اجرا ← گیتِ کد ناظر میماند ← ورود ⇒ پنل
#   C) گواهِ صداقتِ گیت: یادگیرندهٔ بیتلاش ردیفِ داشبورد در راهنما را
#      «نمیبیند» (r236 — هیچ پرشِ ساختگی)
#   D) بذرِ پیشرفت (srs در persist) ⇒ ردیف حاضر؛ کلیک روی خانه ⇒
#      HANDOFF ⇒ فوکوسِ واقعی روی #srs-dashboard (activeElement)
#   E) پرش از دیکشنری ⇒ پرچمِ یک‌بارمصرف + خانه ⇒ پنل حاضر
#   F) شاتها (راهنما با بخشِ نو / خانه بعد از پرش) + EventDay + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r381-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) build + ریاستارت" | tee -a "$OUT"
cd /home/z/my-project
bun run build > /tmp/r381-build.log 2>&1 && echo "BUILD-OK" | tee -a "$OUT" || { echo "BUILD-FAILED" | tee -a "$OUT"; tail -5 /tmp/r381-build.log | tee -a "$OUT"; exit 1; }
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) پالت ← «معلم» ← گیتِ ناظر ← پنل (حکمِ ② تصحیح شد: از r352 هست)" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'skipped'}return 'no-onboard';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{window.dispatchEvent(new CustomEvent('open-command-palette'));return 'palette-open';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{const inp=document.querySelector('[aria-label=\"جست‌وجوی فرمان‌ها\"]');if(!inp)return 'NO-PALETTE-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'معلم');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed';})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const cmds=[...document.querySelectorAll('[role=\"group\"] [data-command], [cmdk-item], [role=\"option\"]')];
  const hit=cmds.find(c=>(c.textContent||'').includes('پنل معلم'));
  return JSON.stringify({PALETTE:{commands:cmds.length,teacherPresent:!!hit,text:hit&&hit.textContent.slice(0,60)}});
})()"
ev "(()=>{const cmds=[...document.querySelectorAll('[cmdk-item], [role=\"option\"]')];const hit=cmds.find(c=>(c.textContent||'').includes('پنل معلم'));if(!hit)return 'NO-TEACHER-CMD';hit.click();return 'executed';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{
  const gate=document.querySelector('[data-testid=\"teacher-code-input\"]');
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  return JSON.stringify({JUMP:{gateGuarding:!!gate,panelNotOpenYet:!ready}});
})()"
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  return JSON.stringify({PANEL:{ready:!!ready,rows}});
})()"

echo "########## C) صداقتِ گیت: بیتلاش ⇒ ردیفِ داشبورد در راهنما نیست" | tee -a "$OUT"
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'').includes('بازگشت به خانه'));if(b){b.click();return 'home-btn';}window.dispatchEvent(new CustomEvent('open-shortcuts'));return 'via-event';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{
  const sec=document.querySelector('[data-testid=\"shortcut-guide-srs-dashboard\"]');
  return JSON.stringify({GUIDE_FRESH:{dashRowAbsent:!sec}});
})()"

echo "########## D) بذرِ پیشرفت ⇒ ردیف حاضر؛ کلیک روی خانه ⇒ فوکوسِ واقعی" | tee -a "$OUT"
ev "(()=>{const raw=localStorage.getItem('vision2-study-v1');const j=raw?JSON.parse(raw):{state:{},version:0};j.state=j.state||{};j.state.srs={'1-0':{state:'learning',level:1,dueAt:Date.now()+3600000}};j.state.onboarded=true;localStorage.setItem('vision2-study-v1',JSON.stringify(j));location.reload();return 'seeded';})()" >/dev/null 2>&1
sleep 5
ev "(()=>{window.dispatchEvent(new CustomEvent('open-shortcuts'));return 'guide-open';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const sec=document.querySelector('[data-testid=\"shortcut-guide-srs-dashboard\"]');
  const row=document.querySelector('[data-testid=\"guide-srs-dashboard-row\"]');
  return JSON.stringify({GUIDE_SEEDED:{sectionPresent:!!sec,rowPresent:!!row,footnote:sec&&sec.textContent.includes('بی‌رکورد، هیچ')}});
})()"
shot r381-guide-dashboard-light.png
ev "(()=>{const row=document.querySelector('[data-testid=\"guide-srs-dashboard-row\"]');if(!row)return 'NO-ROW';row.click();return 'clicked-on-home';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{return 'waiting-handoff';})()" >/dev/null 2>&1
sleep 0.5
ev "(()=>{
  const panel=document.getElementById('srs-dashboard');
  const focused=document.activeElement===panel;
  const view=JSON.stringify((()=>{try{return JSON.parse(localStorage.getItem('vision2-study-v1')).state?.view||'unknown'}catch(e){return 'unknown'}})());
  return JSON.stringify({JUMP_ON_HOME:{panelExists:!!panel,focused}});
})()"

echo "########## E) پرش از دیکشنری ⇒ پرچم + خانه + پنل" | tee -a "$OUT"
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='دیکشنری واژگان');if(b){b.click();return 'to-dictionary';}return 'NO-DICT-BTN';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{window.dispatchEvent(new CustomEvent('open-shortcuts'));return 'guide-open';})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{const row=document.querySelector('[data-testid=\"guide-srs-dashboard-row\"]');if(!row)return 'NO-ROW';row.click();return 'clicked-from-dictionary';})()" >/dev/null 2>&1
sleep 2.5
ev "(()=>{
  const panel=document.getElementById('srs-dashboard');
  const home=new URLSearchParams(location.search);
  const hero=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');
  return JSON.stringify({JUMP_FROM_DICT:{panelMounted:!!panel,homeSurface:!!hero}});
})()"
ev "(()=>{document.documentElement.classList.add('dark');return 'dark';})()" >/dev/null 2>&1
sleep 1
shot r381-home-dashboard-dark.png
ev "(()=>{document.documentElement.classList.remove('dark');return 'light';})()" >/dev/null 2>&1

echo "########## F) EventDay + کنسولِ پاک" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['teacher_open','srs_panel_open','teacher_csv'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r381-console.log || true
if [ -s /tmp/r381-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r381-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
