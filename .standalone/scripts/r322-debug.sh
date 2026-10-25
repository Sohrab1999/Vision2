#!/usr/bin/env bash
# r322-debug — تشریحِ زندهٔ یافته‌هایِ شخصیتِ قهرمان:
#   A) suspectِ min-w-0 (over=9) کدام عنصر است؟
#   B) badge-cardهایِ over=203 — جدِّ برندهشان کیست و چه چیزی بیرون میزند؟
#   C) over=11 دسکتاپ — کدام کارت؟
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
PERSONA=$(node "$DIR/r322-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== A) min-w-0 suspect — تشریحِ کامل =="
agent-browser eval "(()=>{
  const els=[...document.querySelectorAll('[class*=\"min-w-0\"][class*=\"flex-1\"]')].filter((el)=>{
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')return false;
    const r=el.getBoundingClientRect();
    return r.width>0||r.height>0;
  });
  const out=els.map((el)=>{
    const pcs=el.parentElement?getComputedStyle(el.parentElement):null;
    if(!pcs||pcs.flexDirection!=='row')return null;
    const over=el.scrollWidth-el.clientWidth;
    if(over<=1||el.classList.contains('truncate'))return null;
    const chain=[]; let n=el;
    for(let i=0;i<6&&n;i++){const c=n.closest('[aria-label],[data-slot],section');
      chain.push((n.tagName||'?')+':'+String(n.className||'').slice(0,60)); n=n.parentElement;}
    return {
      over, cls:String(el.className).slice(0,60),
      text:(el.innerText||'').slice(0,80),
      parentCls:el.parentElement?String(el.parentElement.className).slice(0,80):'',
      gpCls:el.parentElement&&el.parentElement.parentElement?String(el.parentElement.parentElement.className).slice(0,80):'',
      aria:el.closest('[aria-label]')?.getAttribute('aria-label')||'',
      html:el.outerHTML.slice(0,300),
    };
  }).filter(Boolean);
  return JSON.stringify(out,null,1);
})()" 2>&1

echo "== B) badge-card over=203 — جدِّ برنده و محتوایِ بیرونزده =="
agent-browser eval "(()=>{
  const cards=[...document.querySelectorAll('.badge-card')].map((c)=>{
    const over=c.scrollWidth-c.clientWidth;
    if(over<=1)return null;
    const win=c.offsetWidth;
    // چه چیزی بیرون میزند؟ فرزندانِ پهن
    const kids=[...c.querySelectorAll('*')].map(k=>({cls:String(k.className).slice(0,50),sw:k.scrollWidth,cw:k.clientWidth,ow:k.offsetWidth})).filter(k=>k.sw>k.cw+1).slice(0,4);
    // جدِّ برنده: اولین جدّ با overflow-x hidden/auto/scroll یا clip
    let clip='none', n=c.parentElement;
    while(n&&n!==document.body){const cs=getComputedStyle(n);
      if(cs.overflowX!=='visible'){clip=cs.overflowX+':'+String(n.className).slice(0,60);break;} n=n.parentElement;}
    return {over,win,kids,clip,text:(c.innerText||'').slice(0,50).replace(/\n/g,'|')};
  }).filter(Boolean);
  return JSON.stringify({count:cards.length,cards:cards.slice(0,2)},null,1);
})()" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
