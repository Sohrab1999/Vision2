#!/usr/bin/env bash
# ------------------------------------------------------------------
# r378 — داوریِ زندهٔ «چیپِ نبضِ زندهٔ ۲۴ساعت»:
#   A) ریاستارتِ بیقیدوشرط رویِ standaloneِ همین راند (buildِ نهایی —
#      قراردادِ r374: داوری همان buildی است که ساخته میشود)
#   B) سشنِ تازه + آنبوردینگِ واقعی + گیتِ معلم ⇒ پنلِ زنده
#   C) چیپِ نو: aria-pressed=false + نشانِ شمارنده + انتظارِ داده‌محور
#      از reportِ سرور با ساعتِ generatedAtِ خودش (عینِ معناشناسیِ نما)
#   D) کلیکِ چیپ ⇒ فیلترِ زنده؛ با نبضِ صفرِ واقعی ⇒ خالیِ صادقانهٔ
#      سوم («هیچ یادگیری زنده نیست») + سرشماریِ دستنخورده + رضایتِ
#      صفر-به-صفر با کارتِ آمار
#   E) ترکیب: چیپ × جست‌وجو («سارا») ⇒ تقاطعِ صادق + hintِ سه‌درِه؛
#      پاکسازیِ جست‌وجو چیپ را نمیرد
#   F) خاموشیِ چیپ ⇒ کلِ فهرست برمیگردد
#   G) شاهدِ بایتیِ دفترِ کامل (بندِ ③ِ پیشنهادِ r377): رهگیرِ
#      createObjectURL — بایت‌هایِ واقعیِ CSVِ دفتر درونِ مرورگر:
#      عنوان + صادره + هفتهٔ فعال + سربرگِ ۹ستونیِ قرضی + کارنامهها
#   H) شاتهایِ روشن/تیره (تیره با چیپِ روشن و خالیِ نبض)
#   I) EventDay + کنسولِ پاک
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"
EV=/home/z/my-project/qa-evidence
OUT=/tmp/r378-qa.txt
: > "$OUT"

shot(){ agent-browser screenshot "$EV/$1" >/dev/null 2>&1; }
ev(){ agent-browser eval "$1" 2>&1 | tee -a "$OUT"; echo | tee -a "$OUT"; }

echo "########## A) ریاستارتِ بیقیدوشرط رویِ buildِ همین راند" | tee -a "$OUT"
pkill -f "bun .next/standalone/server.js" 2>/dev/null; sleep 2
cd /home/z/my-project
DATABASE_URL="file:/home/z/my-project/db/custom.db" TEACHER_ACCESS_CODE=moallem-1404 \
  setsid nohup bun .next/standalone/server.js > /home/z/my-project/scripts/app-server.log 2>&1 &
C="000"
for i in $(seq 1 30); do sleep 3; C=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/" 2>/dev/null); [ "$C" = "200" ] && break; done
echo "APP-READY code=$C" | tee -a "$OUT"
curl -s -o /dev/null -w "judge:%{http_code}\n" http://127.0.0.1:3003/ 2>/dev/null | tee -a "$OUT"

echo "########## B) سشنِ تازه + آنبوردینگ + گیتِ معلم" | tee -a "$OUT"
agent-browser close >/dev/null 2>&1 || true
pkill -f "agent-browser/browsers" 2>/dev/null; sleep 1
agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
for i in $(seq 1 30); do
  R=$(agent-browser eval "(()=>{const t=document.querySelector('[data-slot=\"dialog-title\"]');if(t)return 'ONBOARD';const g=document.querySelector('[aria-label=\"ابزارهای یادگیری\"]');return g?'HOME':'WAIT';})()" 2>/dev/null | tr -d '"')
  [ "$R" = "WAIT" ] || { echo "SURFACE-0=$R" | tee -a "$OUT"; break; }; sleep 3
done
ev "(()=>{const skip=[...document.querySelectorAll('button')].find(b=>(b.innerText||'').includes('ناشناس'));if(skip){skip.click();return 'onboard-skipped'}return 'no-onboard';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const g=document.querySelector('[aria-label=\"تنظیمات\"]');if(!g)return 'NO-GEAR';g.click();return 'gear';})()" >/dev/null 2>&1
sleep 1.5
ev "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')==='گشودن پنل معلم — فهرست کلاس');if(!b)return 'NO-TEACHER-BTN';b.click();return 'teacher';})()" >/dev/null 2>&1
sleep 2
ev "(()=>{const inp=document.querySelector('[data-testid=\"teacher-code-input\"]');if(!inp)return 'NO-INPUT';const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;s.call(inp,'moallem-1404');inp.dispatchEvent(new Event('input',{bubbles:true}));inp.closest('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));return 'submitted';})()" >/dev/null 2>&1
sleep 3.5
ev "(()=>{
  const ready=document.querySelector('[data-testid=\"teacher-ready\"]');
  if(!ready)return 'NOT-READY';
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  if(!chip)return 'NO-CHIP';
  const badge=document.querySelector('[data-testid=\"teacher-active-badge\"]');
  return JSON.stringify({PANEL:{rows,chip:true,pressed:chip.getAttribute('aria-pressed'),badge:badge&&badge.textContent}});
})()"

echo "########## C) انتظارِ داده‌محور از سرور — ساعتِ generatedAtِ خودِ گزارش" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/teacher/report',{cache:'no-store',headers:{'x-teacher-code':'moallem-1404'}});
  if(!res.ok)return 'REPORT-HTTP-'+res.status;
  const j=await res.json();
  const snap=Date.parse(j.generatedAt); // ساعتِ snapshot — عینِ reportNowِ نما
  const active=j.roster.filter(r=>r.lastActive&&Date.parse(r.lastActive)>=snap-86400000).length;
  const card24=j.summary.last24h;
  const badge=document.querySelector('[data-testid=\"teacher-active-badge\"]');
  return JSON.stringify({EXPECTED_ACTIVE_LEARNERS:active,CARD24_ATTEMPTS:card24,BADGE:badge&&badge.textContent,ZERO_VS_ZERO:active===0&&card24===0});
})()"

echo "########## D) کلیکِ چیپ — نبضِ صفرِ واقعی ⇒ خالیِ صادقانهٔ سوم" | tee -a "$OUT"
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  if(!chip)return 'NO-CHIP';chip.click();return 'clicked';
})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const census=[...document.querySelectorAll('h2')].find(h=>(h.textContent||'').includes('یادگیرندگان ('));
  return JSON.stringify({CHIP:{pressed:chip&&chip.getAttribute('aria-pressed')},ACTIVE_EMPTY:{present:!!empty,text:empty&&empty.textContent},rows,census:census&&census.textContent});
})()"
shot r378-active-empty-light.png

echo "########## E) ترکیب: چیپ × جست‌وجو — تقاطع + hintِ سه‌درِه؛ پاکسازیِ جست‌وجو چیپ را نمیرد" | tee -a "$OUT"
ev "(()=>{
  const inp=document.querySelector('[data-testid=\"teacher-search-input\"]');
  if(!inp)return 'NO-INPUT';
  const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  s.call(inp,'سارا');inp.dispatchEvent(new Event('input',{bubbles:true}));return 'typed';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const se=document.querySelector('[data-testid=\"teacher-search-empty\"]');
  const cnt=document.querySelector('[data-testid=\"teacher-search-count\"]');
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  return JSON.stringify({COMPOSE:{rows,count:cnt&&cnt.textContent,searchEmpty:!!se,hint3doors:se&&se.textContent.includes('چیپِ «فعال» را بردار')}});
})()"
ev "(()=>{
  const clr=document.querySelector('[data-testid=\"teacher-search-clear\"]');
  if(!clr)return 'NO-CLEAR';clr.click();return 'cleared';
})()" >/dev/null 2>&1
sleep 1
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  return JSON.stringify({AFTER_CLEAR:{chipStillPressed:chip&&chip.getAttribute('aria-pressed'),activeEmpty:!!empty}});
})()"

echo "########## F) خاموشیِ چیپ ⇒ کلِ فهرست" | tee -a "$OUT"
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  if(!chip)return 'NO-CHIP';chip.click();return 'toggled-off';
})()" >/dev/null 2>&1
sleep 1.2
ev "(()=>{
  const rows=document.querySelectorAll('[data-testid=\"teacher-row\"]').length;
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  const empty=document.querySelector('[data-testid=\"teacher-active-empty\"]');
  return JSON.stringify({OFF:{rows,pressed:chip&&chip.getAttribute('aria-pressed'),activeEmptyGone:!empty}});
})()"

echo "########## G) شاهدِ بایتیِ دفترِ کامل — رهگیرِ createObjectURL" | tee -a "$OUT"
ev "(async ()=>{
  return await new Promise((resolve)=>{
    let captured=null;
    const orig=URL.createObjectURL.bind(URL);
    URL.createObjectURL=function(blob){
      const u=orig(blob);
      blob.text().then(t=>{
        URL.createObjectURL=orig;
        const lines=t.split('\r\n').filter(l=>l.length>0);
        const title=lines[0]||'';
        const issued=lines.find(l=>l.startsWith('صادره,'))||'';
        const week=lines.find(l=>l.startsWith('هفتهٔ فعال,'))||'';
        const header=lines.find(l=>l.startsWith('نام,رنگ,تلاش,'))||'';
        const cards=t.split('ویژن ۲ — کارنامهٔ یادگیرنده').length-1;
        const col24=header.includes('فعال در ۲۴ ساعت');
        resolve(JSON.stringify({LEDGER_BYTES:{title,issued,week:week.slice(0,40),cols:header.split(',').length,col24,cards,hasBOM:t.charCodeAt(0)===0xFEFF,crlf:t.includes('\r\n')}}));
      }).catch(e=>{URL.createObjectURL=orig;resolve('READ-ERR');});
      return u;
    };
    const btn=document.querySelector('[data-testid=\"teacher-ledger\"]');
    if(!btn){URL.createObjectURL=orig;return resolve('NO-BTN');}
    btn.click();
    setTimeout(()=>{ if(!captured){URL.createObjectURL=orig;resolve('LEDGER-NOT-CAPTURED');} },12000);
  });
})()"

echo "########## H) شاتهایِ پنل (روشن با چیپِ خاموش + تیره با چیپِ روشن)" | tee -a "$OUT"
shot r378-panel-light.png
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  if(chip)chip.click();
  document.documentElement.classList.add('dark');return 'dark+chip-on';
})()" >/dev/null 2>&1
sleep 1.2
shot r378-panel-dark-chip.png
ev "(()=>{
  const chip=document.querySelector('[data-testid=\"teacher-active-chip\"]');
  if(chip&&chip.getAttribute('aria-pressed')==='true')chip.click();
  document.documentElement.classList.remove('dark');return 'light+chip-off';
})()" >/dev/null 2>&1

echo "########## I) EventDay + کنسولِ پاک" | tee -a "$OUT"
ev "(async ()=>{
  const res=await fetch('/api/event',{cache:'no-store'});
  const j=await res.json();
  const names=['teacher_open','teacher_csv','teacher_class_csv','teacher_detail'];
  const out={};
  for(const n of names){const e=(j.events||[]).find(x=>x.name===n);out[n]=e?e.total:0;}
  return 'EVENTS '+JSON.stringify(out);
})()"
agent-browser logs 2>/dev/null | grep -iE "error|warn" | grep -vE "Download the React DevTools|hydrat" > /tmp/r378-console.log || true
if [ -s /tmp/r378-console.log ]; then echo "CONSOLE-DIRTY: $(head -3 /tmp/r378-console.log)" | tee -a "$OUT"; else echo "CONSOLE-CLEAN" | tee -a "$OUT"; fi

echo "########## DONE" | tee -a "$OUT"
