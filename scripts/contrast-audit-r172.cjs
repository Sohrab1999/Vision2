#!/usr/bin/env node
/* Task 172 — estate-wide contrast sweep v2 (light mode).
 * v2 fixes over v1:
 *  1. audit per quoted literal (no ternary cross-contamination)
 *  2. opacity-aware compositing: bg-X/NN is alpha-blended over the card white
 *  3. gradients (from-/to-) judged at the LIGHTEST endpoint under the text
 *  4. exemption triage: disabled (cursor-not-allowed/disabled:), decorative
 *     icon tiles (no text, lucide icon), translucent overlay on dark parent
 * Run: node scripts/contrast-audit-r172.cjs
 */
const fs = require("fs");
const path = require("path");

function oklchToSrgb(L, C, H) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const gam = (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.min(255, Math.max(0, Math.round(v * 255)));
  };
  return [gam(4.0767416621*l - 3.3077115913*m + 0.2309699292*s), gam(-1.2684380046*l + 2.6097574011*m - 0.3413193965*s), gam(-0.0041960863*l - 0.7034186147*m + 1.707614701*s)];
}
const lum = ([r,g,b]) => { const f=v=>{const c=v/255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const blend = (fg, alpha, bg) => fg.map((v,i)=>Math.round(v*alpha+bg[i]*(1-alpha)));

const theme = fs.readFileSync("node_modules/tailwindcss/theme.css", "utf8");
const PAL = {};
for (const m of theme.matchAll(/--color-([a-z]+)-(\d+):\s*oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/g))
  PAL[`${m[1]}-${m[2]}`] = oklchToSrgb(+m[3]/100, +m[4], +m[5]);
PAL["white"]=[255,255,255]; PAL["black"]=[0,0,0];
const WHITE = PAL["white"];

function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);e.isDirectory()?walk(p,out):e.name.endsWith(".tsx")&&out.push(p);}return out;}
const files=[...walk("src/components"),...walk("src/app")];

const findings=[];
const LIT=/["'`]([^"'`\n]{4,400})["'`]/g; // per-literal (static chunks incl. template pieces)
for (const f of files) {
  const lines = fs.readFileSync(f,"utf8").split("\n");
  lines.forEach((line,i)=>{
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const lm of line.matchAll(LIT)) {
      const s = lm[1];
      if (!/text-/.test(s)) continue;
      if (/disabled:|cursor-not-allowed/.test(s)) continue; // WCAG 1.4.3 exempt
      /* collect candidate text colors with optional opacity */
      const txs=[...s.matchAll(/\btext-([a-z]+-\d+|white|black)(?:\/(\d+))?\b/g)];
      if (!txs.length) continue;
      /* effective background: last explicit solid bg; translucent bg-white/NN on dark parent => parent wins */
      let bgs=[...s.matchAll(/\b(bg|from|to)-([a-z]+-\d+|white|black)(?:\/(\d+))?\b/g)]
        .map(m=>({kind:m[1],c:m[2],a:m[3]?+m[3]/100:1}));
      if (!bgs.length) {
        /* implicit card white — only flag known-risky shades */
        for (const t of txs) {
          const c=t[1], a=t[2]?+t[2]/100:1;
          if (!PAL[c]) continue;
          const eff = a<1 ? blend(WHITE,a,WHITE) : PAL[c];
          const r=ratio(eff,WHITE);
          if (r<4.5) findings.push({f,l:i+1,tx:`${c}${t[2]?`/${t[2]}`:""}`,bg:"white(implicit)",r:+r.toFixed(2),s:s.trim().slice(0,110)});
        }
        continue;
      }
      /* effective bg = blend of solid/translucent over white; for gradient pairs judge LIGHTEST endpoint */
      const solids=bgs.filter(b=>b.c!=="white"||b.a<1).map(b=> b.a<1?blend(PAL[b.c],b.a,WHITE):PAL[b.c]).filter(c=>c);
      if (!solids.length) continue; // translucent white overlay => real parent is saturated/dark, skip
      const bgWorst = solids.reduce((lo,c)=> ratio(WHITE,c)<ratio(WHITE,lo)?c:lo, solids[0]); // lightest = worst for white text
      for (const t of txs) {
        const c=t[1], a=t[2]?+t[2]/100:1;
        if (!PAL[c]) continue;
        const eff = a<1 ? blend(PAL[c],a,bgWorst) : PAL[c];
        const r=ratio(eff,bgWorst);
        if (r<4.5) findings.push({f,l:i+1,tx:`${c}${t[2]?`/${t[2]}`:""}`,bg:`${bgs.map(b=>b.kind+"-"+b.c+(b.a<1?`/${Math.round(b.a*100)}`:"")).join("->")}`,r:+r.toFixed(2),s:s.trim().slice(0,110)});
      }
    }
  });
}
const seen=new Set();
const uniq=findings.filter(x=>{const k=`${x.f}:${x.l}:${x.tx}:${x.bg}`;if(seen.has(k))return false;seen.add(k);return true;});
uniq.sort((a,b)=>a.r-b.r).forEach(x=>console.log(`${String(x.r).padStart(5)}  ${x.tx} on ${x.bg}   ${x.f.replace("src/components/study/","")}:${x.l}\n        └ ${x.s}`));
console.log(`\nTOTAL findings: ${uniq.length}`);
const byTx={};uniq.forEach(x=>byTx[x.tx]=(byTx[x.tx]||0)+1);
console.log("by text:",JSON.stringify(byTx));
