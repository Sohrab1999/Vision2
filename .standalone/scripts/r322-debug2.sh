#!/usr/bin/env bash
# r322-debug2 — تشریحِ C (دسکتاپِ over=11) + درونِ suspectِ A (کدام chip بیرون میزند)
set -uo pipefail
BASE="http://127.0.0.1:3000"
DIR=/home/z/my-project/scripts
PERSONA=$(node "$DIR/r322-persona.js" champion)

agent-browser open "$BASE" >/dev/null 2>&1
agent-browser set viewport 1280 900 >/dev/null 2>&1
agent-browser wait 'body' >/dev/null 2>&1 || true
sleep 1.5
agent-browser eval "(()=>{localStorage.setItem('vision2-study-v1', JSON.stringify(${PERSONA})); location.reload(); return 'seeded';})()" >/dev/null 2>&1
sleep 4

echo "== C) دسکتاپ — عنصرِ over=11 =="
agent-browser eval "(()=>{
  const root=document.body;
  const hits=[];
  for(const el of root.querySelectorAll('*')){
    const sw=el.scrollWidth,cw=el.clientWidth;
    if(sw>cw+1&&cw>0){
      let anc=false;
      for(let n=el.parentElement;n&&n!==root;n=n.parentElement)
        if(n.scrollWidth>n.clientWidth+1){anc=true;break;}
      if(anc)continue;
      const cs=getComputedStyle(el);
      const trunc=cs.textOverflow==='ellipsis'&&cs.overflowX==='hidden';
      const scrolls=[... (function(){for(let n=el;n&&n!==root.parentElement;n=n.parentElement){const c2=getComputedStyle(n);if(c2.overflowX==='auto'||c2.overflowX==='scroll')return [true];}return [false];})()][0];
      if(scrolls||trunc)continue;
      hits.push({
        over:sw-cw, tag:el.tagName.toLowerCase(),
        cls:String(el.className).slice(0,80),
        text:(el.innerText||'').slice(0,60).replace(/\n/g,'|'),
        aria:el.closest('[aria-label]')?.getAttribute('aria-label')||'',
        html:el.outerHTML.slice(0,240),
      });
    }
  }
  return JSON.stringify(hits.slice(0,4),null,1);
})()" 2>&1

echo "== A) درونِ suspect — کدام فرزندِ ردیفِ chips بیرون میزند (390) =="
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval "(()=>{
  const rows=[...document.querySelectorAll('[aria-label=\"واژه‌های خطرناک من\"] [class*=\"min-w-0\"][class*=\"flex-1\"]')];
  const out=rows.map((el)=>{
    const over=el.scrollWidth-el.clientWidth;
    const kids=[...el.querySelectorAll(':scope > * > *, :scope > *')].map(k=>({
      cls:String(k.className).slice(0,55), sw:k.scrollWidth, cw:k.clientWidth,
      text:(k.innerText||'').slice(0,40).replace(/\n/g,'|'),
    })).filter(k=>k.sw>k.cw+1);
    return {over, kids};
  });
  return JSON.stringify(out,null,1);
})()" 2>&1

agent-browser close >/dev/null 2>&1
pkill -f "chrome" 2>/dev/null || true
echo "== done =="
