#!/usr/bin/env bash
# Task 98 — single-session QA: searchable/filterable duel ledger.
# ① seed 8 records (4W/3L/1T, 3 receipt sigs, mixed opponents incl. «امیرمحمد» joined)
# ② header pill «۸ نبرد», default 5 rows, expander «نمایش همهٔ ۸ نبرد» → 8 rows
# ③ search «امیر» → 4 rows + digest «۴ نبرد یافت شد · ۲ برد، ۱ باخت، ۱ مساوی»
# ④ space-insensitive: «امیر رضا» (spaced query) finds the row
# ⑤ outcome chip برد → 4 rows; + verified toggle → 2 rows (shield visible)
# ⑥ nonsense query → honest empty state + double clear button restores 8
# ⑦ mobile 390 overflow 0 ⑧ console clean. Local-only seed — no server rows.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 5
agent-browser snapshot >/tmp/r98-home.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/r98-home.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/r98-home.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

echo "--- A. seed 8-record ledger (3 sigs, joined/spaced names)"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  const dayKey=(n)=>{const d=new Date(now-n*86400000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
  const S="a".repeat(64), S2="f".repeat(64);
  const mk=(id,outcome,opponent,my,opp,sig)=>({ id, day:dayKey(1), outcome, reason:"finished", opponent,
    opponentColor:"rose", myScore:my, oppScore:opp, myCorrect:8, oppCorrect:6, answered:10, total:10,
    durationSec:95, ...(sig?{receiptSig:sig}:{}) });
  obj.state.duelWins=4; obj.state.duelLosses=3; obj.state.duelTies=1;
  obj.state.duelHistory=[
    mk("r1","win","امیرمحمد",1200,950,S),
    mk("r2","loss","سینا",700,1150),
    mk("r3","tie","امیرمحمد",900,900),
    mk("r4","win","سینا",1100,800),
    mk("r5","loss","امیرمحمد",650,1200,S2),
    mk("r6","win","سینا",1000,760,S),
    mk("r7","win","امیر رضا",1150,900),
    mk("r8","loss","پریسا",600,1250)
  ];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-8";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

echo "--- B. open duel view via shell event"
agent-browser eval '(()=>{ window.dispatchEvent(new CustomEvent("open-duel")); return "duel-opened"; })()'
sleep 3

PANEL='[...document.querySelectorAll("section")].find(s=>s.getAttribute("aria-label")==="تاریخچهٔ نبردها")'

echo "--- C. default: pill + 5 rows + expander"
agent-browser eval "(()=>{
  const panel=$PANEL;
  if(!panel) return JSON.stringify({panel:false});
  const pill=[...panel.querySelectorAll('h2 span')].map(s=>s.textContent).find(t=>t&&/نبرد$/.test(t.trim()));
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const expander=[...panel.querySelectorAll('button')].find(b=>/نمایش همهٔ/.test(b.textContent||''));
  return JSON.stringify({ panel:true, pill: pill?pill.trim():null, rows, expander: expander?expander.textContent.trim():null });
})()"

echo "--- D. expand to all 8 then collapse"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const expander=[...panel.querySelectorAll('button')].find(b=>/نمایش همهٔ/.test(b.textContent||''));
  expander.click(); return 'clicked';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const collapse=[...panel.querySelectorAll('button')].find(b=>/نمایش کمتر/.test(b.textContent||''));
  const expanded=collapse?collapse.getAttribute('aria-expanded'):null;
  return JSON.stringify({ rowsAll: rows, collapse: !!collapse, expanded });
})()"

echo "--- E. search «امیر» → 4 rows + honest digest"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const input=panel.querySelector('input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'امیر');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const status=[...panel.querySelectorAll('p')].find(p=>/یافت شد/.test(p.textContent||''));
  return JSON.stringify({ rows, digest: status?status.textContent.replace(/\s+/g,' ').trim():null });
})()"

echo "--- F. space-insensitive: «امیر رضا» (spaced) finds the joined-name row"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const input=panel.querySelector('input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'امیر رضا');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const opp=panel.querySelector('.space-y-2 > div .font-extrabold');
  return JSON.stringify({ rows, firstOpponent: opp?opp.textContent.trim():null });
})()"

echo "--- G. clear search → outcome chip برد → verified toggle"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const input=panel.querySelector('input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  const chip=[...panel.querySelectorAll('button')].find(b=>b.textContent.trim()==='برد');
  chip.click();
  return 'win-chip';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  return JSON.stringify({ winRows: rows });
})()"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const toggle=[...panel.querySelectorAll('button')].find(b=>/فقط داورگواه/.test(b.textContent||''));
  toggle.click();
  return 'verified-on';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const shields=panel.querySelectorAll('span[role=img][aria-label=داورگواه]').length;
  const toggle=[...panel.querySelectorAll('button')].find(b=>/فقط داورگواه/.test(b.textContent||''));
  return JSON.stringify({ verifiedRows: rows, shields, pressed: toggle.getAttribute('aria-pressed') });
})()"

echo "--- H. nonsense query → honest empty state + clear restores"
agent-browser eval "(()=>{
  const panel=$PANEL;
  const input=panel.querySelector('input');
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'ناموجود‌اصلا');
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return 'typed-junk';
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const empty=[...panel.querySelectorAll('div')].find(d=>/نبردی با این مشخصات پیدا نشد/.test(d.textContent||'')&&d.className.includes('border-dashed'));
  const clears=[...panel.querySelectorAll('button')].filter(b=>/پاک‌کردن فیلترها/.test(b.textContent||''));
  if(!empty||clears.length<2) return JSON.stringify({ empty: !!empty, clears: clears.length });
  clears[clears.length-1].click();
  return JSON.stringify({ empty: true, clears: clears.length, clicked: 'empty-state-clear' });
})()"
sleep 1
agent-browser eval "(()=>{
  const panel=$PANEL;
  const rows=panel.querySelectorAll('.space-y-2 > div').length;
  const input=panel.querySelector('input');
  const emptyGone=![...panel.querySelectorAll('div')].some(d=>d.className&&d.className.includes&&d.className.includes('border-dashed')&&/پیدا نشد/.test(d.textContent||''));
  return JSON.stringify({ rowsAfterClear: rows, inputValue: input.value, emptyGone });
})()"

echo "--- I. mobile 390 overflow (duel view)"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1.5
agent-browser eval '(() => ({ w: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth }))()'

echo "--- J. console"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -4
echo "QA-R98-DONE"
