#!/bin/bash
# Task 172 — LIVE DOM contrast audit v2 (discovery, dev 3000).
# v2 fixes over v1:
#   ① oklch()/color(srgb)/rgba computed-value parsing (Tailwind v4 ships oklch)
#   ② gradient backgrounds: extract stops from backgroundImage, judge against
#      the WORST (min-contrast) stop instead of falling through to page white
#   ③ per-view fresh open + ZWNJ-tolerant skip + FETCH/sendBeacon patch
#     (no cross-view dialog leakage; deterministic state)
# Output: /tmp/r172-audit-<view>.json (raw) — triaged later by triage script.
set -u
cd /home/z/my-project
mkdir -p /tmp/r172

AUDIT='(() => {
  function oklchToRgb(s){
    const m=s.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/);
    if(!m)return null;
    let L=parseFloat(m[1]);if(s.includes("%")||L>1)L=L/100;
    const C=parseFloat(m[2]),H=parseFloat(m[3]);
    const hr=H*Math.PI/180,a=C*Math.cos(hr),b=C*Math.sin(hr);
    const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.291485548*b;
    const l=l_**3,mm=m_**3,ss=s_**3;
    const g=c=>{const v=c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055;return Math.min(255,Math.max(0,Math.round(v*255)))};
    return [g(4.0767416621*l-3.3077115913*mm+0.2309699292*ss),g(-1.2684380046*l+2.6097574011*mm-0.3413193965*ss),g(-0.0041960863*l-0.7034186147*mm+1.707614701*ss)];
  }
  function labToRgb(s){
    const m=s.match(/lab\(\s*([\d.%]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/);
    if(!m)return null;
    const L=parseFloat(m[1]);
    const a=parseFloat(m[2]),b=parseFloat(m[3]);
    const fy=(L+16)/116,fx=fy+a/500,fz=fy-b/200;
    const e=216/24389,k=24389/27;
    const inv2=t=>{const t3=t*t*t;return t3>e?t3:(k*t-16)/116};
    const Xn=0.96422,Yn=1.0,Zn=0.82521;
    const X=Xn*inv2(fx),Y=Yn*inv2(fy),Zn2=Zn*inv2(fz);
    const r=3.1338561*X-1.6168667*Y-0.4906146*Zn2;
    const g=-0.9787684*X+1.9161415*Y+0.0334540*Zn2;
    const bl=0.0719453*X-0.2289914*Y+1.4052427*Zn2;
    const g2=c=>{const v=c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055;return Math.min(255,Math.max(0,Math.round(v*255)))};
    return [g2(r),g2(g),g2(bl)];
  }
  function pc(c){
    if(!c||c==="transparent")return null;
    if(c[0]==="#"){const h=c.slice(1);return h.length<6?[0,0,0,1]:[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),1]}
    let m=c.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.%]+))?\)/);
    if(m){let a=m[4]===undefined?1:parseFloat(m[4]);if(String(m[4]||"").includes("%"))a=a/100;return [+m[1],+m[2],+m[3],a]}
    if(c.startsWith("oklch")){const m2=c.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?/);const r=m2?oklchToRgb(c):null;if(!r)return null;let a=m2[4]===undefined?1:parseFloat(m2[4]);if(m2[4]&&String(m2[4]).includes("%"))a=a/100;return [...r,a]}
    if(c.startsWith("lab")){const r=labToRgb(c);if(!r)return null;const m2=c.match(/lab\([^)]*\/\s*([\d.%]+)\)?/);let a=m2?parseFloat(m2[1]):1;if(m2&&String(m2[1]).includes("%"))a=a/100;return [...r,a]}
    m=c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
    if(m){return [Math.round(+m[1]*255),Math.round(+m[2]*255),Math.round(+m[3]*255),m[4]===undefined?1:+m[4]]}
    return null;
  }
  function comp(f,b){const a=f[3];return [f[0]*a+b[0]*(1-a),f[1]*a+b[1]*(1-a),f[2]*a+b[2]*(1-a),f[3]+b[3]*(1-f[3])]}
  function lum(p){const f=v=>{v/=255;return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(p[0])+0.7152*f(p[1])+0.0722*f(p[2])}
  function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)}
  function stops(el){
    const bi=getComputedStyle(el).backgroundImage;
    if(!bi||bi==="none")return null;
    const toks=bi.match(/(oklch\([^)]+\)|lab\([^)]+\)|rgba?\([^)]+\)|color\([^)]+\)|#[0-9a-fA-F]{3,8})/g)||[];
    const arr=[];
    for(const t of toks){const p=pc(t);if(p)arr.push(p)}
    return arr.length?arr:null;
  }
  const out=[];let scanned=0,gradJ=0;
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT);let n;
  while((n=w.nextNode())){
    const el=n;const cs=getComputedStyle(el);
    if(cs.display==="none"||cs.visibility==="hidden"||parseFloat(cs.opacity)===0)continue;
    if(el.closest("[aria-hidden=true],.sr-only"))continue;
    let hasText=false;for(const x of el.childNodes){if(x.nodeType===3&&x.textContent.trim()){hasText=true;break}}
    if(!hasText)continue;scanned++;
    const fgRaw=pc(cs.color);if(!fgRaw)continue;
    const gsSelf=stops(el);
    const clipText=(cs.webkitBackgroundClip==="text"||cs.backgroundClip==="text")&&fgRaw[3]<0.05&&gsSelf;
    let bgs,fg=fgRaw,clipWorst=null;
    if(clipText){
      /* gradient-clipped text: paint IS the gradient — worst stop vs the
         folded parent background (same fold, starting ABOVE this el) */
      const layers=[];let cur=el.parentElement,foundGrad=false;
      while(cur&&cur.nodeType===1){
        const g2=stops(cur);
        if(g2){layers.push({t:"g",st:g2});foundGrad=true;break}
        const bg=pc(getComputedStyle(cur).backgroundColor);
        if(bg&&bg[3]>0){layers.push({t:"s",c:bg});if(bg[3]>=0.999)break}
        cur=cur.parentElement;
      }
      let cands=[[255,255,255,1]];
      for(let i=layers.length-1;i>=0;i--){
        const L=layers[i];
        if(L.t==="s")cands=cands.map(b=>comp(L.c,b));
        else cands=L.st.flatMap(s=>cands.map(b=>comp(s,b)));
      }
      gradJ++;
      clipWorst=1e9;
      for(const st of gsSelf){for(const b of cands){const rr=ratio(st,b);if(rr<clipWorst)clipWorst=rr}}
      bgs=null;
    }
    else if(gsSelf){bgs=gsSelf;gradJ++}
    else{
      /* layered fold: collect top->bottom, fold bottom->top; a gradient
         layer expands the candidate set (one candidate per stop) */
      const layers=[];let cur=el,foundGrad=false;
      while(cur&&cur.nodeType===1){
        if(cur!==el){const g2=stops(cur);if(g2){layers.push({t:"g",st:g2});foundGrad=true;break}}
        const bg=pc(getComputedStyle(cur).backgroundColor);
        if(bg&&bg[3]>0){layers.push({t:"s",c:bg});if(bg[3]>=0.999)break}
        cur=cur.parentElement;
      }
      if(foundGrad)gradJ++;
      let cands=[[255,255,255,1]];
      for(let i=layers.length-1;i>=0;i--){
        const L=layers[i];
        if(L.t==="s")cands=cands.map(b=>comp(L.c,b));
        else cands=L.st.flatMap(s=>cands.map(b=>comp(s,b)));
      }
      bgs=cands;
    }
    if(fgRaw[3]>0&&fgRaw[3]<1&&!clipText&&bgs)fg=comp(fgRaw,bgs.reduce((lo,b)=>lum(b)<lum(lo)?b:lo));
    let r;
    if(clipText)r=+clipWorst.toFixed(2);
    else{let worst=1e9;for(const b of bgs){const rr=ratio(fg,b);if(rr<worst)worst=rr}r=+worst.toFixed(2)}
    const fs=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700,large=fs>=24||(bold&&fs>=18.66);
    const th=large?3:4.5;
    if(r<th){out.push({r:r,fs:Math.round(fs),g:clipText?2:(gsSelf?1:0),tag:el.tagName,cls:(el.getAttribute("class")||"").slice(0,70),t:el.textContent.trim().slice(0,30)});if(out.length>=50)break}
  }
  return JSON.stringify({scanned:scanned,gradJ:gradJ,v:out});
})()'

prep() {
  agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
  sleep 2.5
  for i in $(seq 1 8); do
    D=$(agent-browser eval "document.querySelectorAll('[data-state=open]').length" 2>/dev/null | tr -d '"')
    [ "$D" = "0" ] && break
    agent-browser eval "(()=>{const b=[...document.querySelectorAll('button')].find(x=>/ناشناس\s*می.مانم/.test(x.textContent));if(b)b.click();return 1})()" >/dev/null 2>&1
    sleep 1
  done
  agent-browser eval "(()=>{const o=window.fetch;window.fetch=function(u){try{const url=typeof u==='string'?u:(u&&u.url)||'';if(!/\/api\//.test(url))return o.apply(this,arguments)}catch(e){}return Promise.resolve(new Response('{}',{status:200}))};window.navigator.sendBeacon=function(){return true};return 1})()" >/dev/null
}

runView() { # $1 view name, $2 nav eval js (optional)
  prep
  if [ -n "${2:-}" ]; then
    agent-browser eval "$2" >/dev/null 2>&1
    sleep 2.2
  fi
  R=$(agent-browser eval "$AUDIT" 2>/dev/null)
  echo "$R" > "/tmp/r172/$1.json"
  echo "VIEW $1: $(echo "$R" | rg -o '"scanned":\d+' || echo RAW)"
}

HOME_NAV='(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim().startsWith("خانه"));if(b)b.click();return 1})()'
runView home ""
runView report "window.dispatchEvent(new CustomEvent('open-report'));1"
runView mywords "$HOME_NAV; setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('واژه‌های من'));b&&b.click()},400);1"
runView grammar "$HOME_NAV; setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('متروی گرامر'));b&&b.click()},400);1"
runView duel "$HOME_NAV; setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('نبرد دودنفره'));b&&b.click()},400);1"
runView konkur "$HOME_NAV; setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('گوشهٔ کنکور'));b&&b.click()},400);1"
runView exam "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='آزمون جامع');b&&b.click();return 1})()"
runView dictionary "(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='دیکشنری');b&&b.click();return 1})()"
runView smart "$HOME_NAV; setTimeout(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('تمرین هوشمند'));b&&b.click()},400);1"
echo "AUDIT-V2-DONE"
