#!/usr/bin/env bash
# Live QA for «دیکتهٔ واژه‌های خطرناک» (danger-words dictation) — single browser session.
# Seeds 5 real mistake words → home danger panel → third CTA (دیکتهٔ همین‌ها)
# → dialog dictation setup → full 5-word round (2 correct typed + 1 skip +
# 2 wrong) → done screen → store effects on canonical keys → exit → dark probe
# → mobile 390 → fresh-session console check.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/dqd-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/dqd-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/dqd-snap.txt | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed 5 real danger words (mistakes=2/seen=3) + known for hasProgress ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  obj.state.wordMistakes = { "1:ability":2, "1:absolutely":2, "1:access":2, "2:active":2, "3:accept":2 };
  obj.state.wordSeen = { "1:ability":3, "1:absolutely":3, "1:access":3, "2:active":3, "3:accept":3 };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

# ---- home: danger panel + third CTA ----
echo "--- DANGER PANEL ---"
agent-browser eval '(()=>{
  const h = [...document.querySelectorAll("h2")].find(x=>x.textContent.includes("واژه‌های خطرناک من"));
  const cta = [...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها"));
  const rows = h ? h.closest("section").querySelectorAll("ul li").length : 0;
  return JSON.stringify({ panel: !!h, rows, cta: !!cta, ctaDisabled: cta?.disabled ?? null });
})()'

# ---- open dictation dialog → setup ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها")); if(b){b.click();return "open-ok";} return "open-miss";})()'
sleep 1
echo "--- DIALOG SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  dialogTitle: [...document.querySelectorAll("[role=dialog] h2")].some(x=>x.textContent.includes("دیکتهٔ واژه‌های خطرناک")),
  setupTitle: [...document.querySelectorAll("[role=dialog] h3")].some(x=>x.textContent.includes("آزمون دیکته")),
  countButtons: [...document.querySelectorAll("[role=dialog] button")].filter(b=>["۸","۱۰","۱۵","۲۰"].includes(b.textContent.trim())).length,
  exitBtn: [...document.querySelectorAll("[role=dialog] button")].some(b=>b.textContent.trim()==="بازگشت")
}))()'

# ---- start round ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="شروع دیکته"); if(b){b.click();return "start-ok";} return "start-miss";})()'
sleep 1

# ---- answer loop: 5 words — 2 correct, 1 skip, 2 wrong ----
FA2EN='{"توانایی، لیاقت، شایستگی":"ability","قطعاً، کاملاً":"absolutely","دسترسی، دست‌یابی":"access","فعال":"active","قبول کردن، پذیرفتن":"accept"}'
for i in 1 2 3 4 5; do
  ANSWER=$(agent-browser eval "(()=>{
    const fa = document.querySelector('[role=dialog] div.text-2xl')?.textContent?.trim();
    const map = $FA2EN;
    return map[fa] ?? 'UNKNOWN:'+fa;
  })()" 2>/dev/null | tr -d '"')
  echo "word $i: fa→en = $ANSWER"
  if [ "$i" = "3" ]; then
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="رد کردن"); if(b){b.click();return "skip-ok";} return "skip-miss";})()' >/dev/null
    sleep 0.6
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("واژهٔ بعدی")); if(b){b.click();return "next-ok";} return "next-miss";})()' >/dev/null
    sleep 0.8
  elif [ "$i" = "4" ] || [ "$i" = "5" ]; then
    # deliberate wrong answer (typo) → exercises the wrong flow on danger keys
    agent-browser eval "(()=>{
      const input = document.querySelector('[role=dialog] input[dir=ltr]');
      if (!input) return 'no-input';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '$ANSWER'+'xx');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return 'answered-wrong';
    })()" >/dev/null
    sleep 0.8
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("واژهٔ بعدی")); if(b){b.click();return "next-ok";} return "auto-advance";})()' >/dev/null
    sleep 1.2
  else
    agent-browser eval "(()=>{
      const input = document.querySelector('[role=dialog] input[dir=ltr]');
      if (!input) return 'no-input';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '$ANSWER');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return 'answered';
    })()" >/dev/null
    sleep 2.2
  fi
done

echo "--- DONE SCREEN ---"
agent-browser eval '(()=>JSON.stringify({
  done: [...document.querySelectorAll("[role=dialog] h3")].some(x=>x.textContent.includes("دیکته تمام شد")),
  percent: document.querySelector("[role=dialog] p.text-4xl")?.textContent,
  exitBtn: [...document.querySelectorAll("[role=dialog] button")].some(b=>b.textContent.includes("بازگشت"))
}))()'

echo "--- STORE EFFECTS ---"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const s = JSON.parse(raw).state;
  const pick=(o,k)=>o&&o[k]!==undefined?o[k]:null;
  return JSON.stringify({
    seenAbility: pick(s.wordSeen,"1:ability"),
    mistakesAbility: pick(s.wordMistakes,"1:ability"),
    seenActive: pick(s.wordSeen,"2:active"),
    mistakesActive: pick(s.wordMistakes,"2:active"),
    seenAccept: pick(s.wordSeen,"3:accept"),
    mistakesAccept: pick(s.wordMistakes,"3:accept"),
    srsAbility: s.srs&&s.srs["1:ability"]?s.srs["1:ability"].level:null,
    resultDanger: s.results&&s.results["danger:dictation"]?{total:s.results["danger:dictation"].total,percent:s.results["danger:dictation"].percent}:null,
    dayStat: s.dayStat?{dictation:s.dayStat.dictation,quizzes:s.dayStat.quizzes}:null,
    streak: s.streak
  });
})()'

echo "--- EXIT DIALOG ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("بازگشت به واژه‌های من")); if(b){b.click();return "exit-ok";} return "exit-miss";})()'
sleep 1
agent-browser eval '(()=>JSON.stringify({
  dialogClosed: !document.querySelector("[role=dialog]"),
  ctaBack: [...document.querySelectorAll("button")].some(x=>x.textContent.includes("دیکتهٔ همین‌ها"))
}))()'

# ---- dark probe (self app toggle — ref from snapshot, per task-58 protocol) ----
agent-browser snapshot >/tmp/dqd-snap2.txt 2>&1 || true
DREF=$(grep -oE 'button "(حالت شب|حالت روز)" \[ref=e[0-9]+\]' /tmp/dqd-snap2.txt | grep -oE 'ref=e[0-9]+' | grep -oE 'e[0-9]+' | head -1)
if [ -n "$DREF" ]; then agent-browser click "$DREF" >/dev/null; else echo "DARK-REF-MISS"; fi
sleep 1
agent-browser eval '(()=>{
  const g=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null};
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    ctaBorder: (()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها")); return b?getComputedStyle(b).borderColor:null})(),
    ctaBg: (()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها")); return b?getComputedStyle(b).backgroundColor:null})(),
    ctaInk: (()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها")); return b?getComputedStyle(b).color:null})()
  });
})()'
# back to light for a clean next session
if [ -n "$DREF" ]; then agent-browser click "$DREF" >/dev/null; fi

# ---- mobile 390 ----
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth})'

# ---- fresh session console check ----
agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
echo "--- FRESH CONSOLE ---"
agent-browser errors 2>&1 | tail -2
agent-browser close >/dev/null 2>&1 || true

echo "QA-SCRIPT-DONE"
