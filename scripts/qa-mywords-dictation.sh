#!/usr/bin/env bash
# Live QA for «دیکتهٔ واژه‌های من» (my-words dictation) — single browser session.
# Seeds 4 real stars → my-words → dictation launcher → full round (3 correct
# + 1 skip) → done screen → store effects → exit → dark probe → mobile 390.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/mwd-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/mwd-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/mwd-snap.txt | grep -oE 'e[0-9]+')
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed 4 real stars into the persisted store, then reload ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 1 };
  obj.state.starredWords = ["1:ability","1:absolutely","1:access","1:action"];
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

# ---- go to my-words ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("واژه‌های من")); if(b){b.click();return "mw-ok";} return "mw-miss";})()'
sleep 2
echo "--- LAUNCHER ---"
agent-browser eval '(()=>{
  const h = [...document.querySelectorAll("h2")].find(x=>x.textContent.includes("دیکتهٔ ستاره‌ها"));
  const btn = [...document.querySelectorAll("button")].find(x=>x.textContent.includes("شروع دیکته"));
  return JSON.stringify({ launcher: !!h, startBtn: !!btn, eligibleText: h ? h.parentElement.querySelector("p")?.textContent.slice(0,60) : null });
})()'

# ---- launch → setup ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("شروع دیکته")); if(b){b.click();return "launch-ok";} return "launch-miss";})()'
sleep 1
echo "--- SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  setupTitle: [...document.querySelectorAll("h3")].some(x=>x.textContent.includes("آزمون دیکته")),
  counts: [...document.querySelectorAll("button")].filter(b=>["۸","۱۰","۱۵","۲۰"].includes(b.textContent.trim())).length,
  smartOrder: [...document.querySelectorAll("button")].some(b=>b.textContent.includes("اولویت با واژه‌های")),
  exitBtn: [...document.querySelectorAll("button")].some(b=>b.textContent.trim()==="بازگشت")
}))()'

# ---- start round ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع دیکته"); if(b){b.click();return "start-ok";} return "start-miss";})()'
sleep 1

# ---- answer loop: 3 correct + 1 skip ----
FA2EN='{"توانایی، لیاقت، شایستگی":"ability","قطعاً، کاملاً":"absolutely","دسترسی، دست‌یابی":"access","اقدام، عمل، کار":"action"}'
for i in 1 2 3 4; do
  ANSWER=$(agent-browser eval "(()=>{
    const fa = document.querySelector('div.text-2xl')?.textContent?.trim();
    const map = $FA2EN;
    return map[fa] ?? 'UNKNOWN:'+fa;
  })()" 2>/dev/null | tr -d '"')
  echo "word $i: fa→en = $ANSWER"
  if [ "$i" = "3" ]; then
    # skip word 3 (wrong flow)
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="رد کردن"); if(b){b.click();return "skip-ok";} return "skip-miss";})()' >/dev/null
    sleep 0.6
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("واژهٔ بعدی")); if(b){b.click();return "next-ok";} return "next-miss";})()' >/dev/null
    sleep 0.8
  else
    agent-browser eval "(()=>{
      const input = document.querySelector('input[dir=ltr]');
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
  done: [...document.querySelectorAll("h3")].some(x=>x.textContent.includes("دیکته تمام شد")),
  percent: document.querySelector("p.text-4xl")?.textContent,
  chips: [...document.querySelectorAll("span.rounded-full")].map(s=>s.textContent.trim()).slice(0,4),
  backToMyWords: [...document.querySelectorAll("button")].some(b=>b.textContent.includes("بازگشت به واژه‌های من"))
}))()'

echo "--- STORE EFFECTS ---"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const s = JSON.parse(raw).state;
  return JSON.stringify({
    srsAbility: s.srs && s.srs["1:ability"] ? { lvl: s.srs["1:ability"].level } : null,
    srsAccess: s.srs && s.srs["1:access"] ? { lvl: s.srs["1:access"].level } : null,
    resultMyWords: s.results && s.results["my-words:dictation"] ? s.results["my-words:dictation"] : null,
    dayStat: s.dayStat ? { day: s.dayStat.day, quizzes: s.dayStat.quizzes, dictation: s.dayStat.dictation } : null,
    streak: s.streak,
    wordSeenAbility: s.wordSeen ? s.wordSeen["1:ability"] : null,
    wordMistakesAbility: s.wordMistakes ? s.wordMistakes["1:ability"] : null
  });
})()'

echo "--- EXIT BACK ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("بازگشت به واژه‌های من")); if(b){b.click();return "exit-ok";} return "exit-miss";})()'
sleep 1
agent-browser eval '(()=>JSON.stringify({
  launcherBack: [...document.querySelectorAll("h2")].some(x=>x.textContent.includes("دیکتهٔ ستاره‌ها"))
}))()'

# ---- dark probe on the new launcher ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>["حالت شب","حالت روز"].includes(x.textContent.trim())); if(b){b.click();return "dark-toggled";} return "toggle-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const g=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null};
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    launcherBorder: g(".mywords-dictation","borderColor"),
    launcherBg: g(".mywords-dictation","backgroundImage")?.slice(0,60) ?? g(".mywords-dictation","backgroundColor"),
    h2Color: g(".mywords-dictation h2","color"),
    pColor: g(".mywords-dictation p","color")
  });
})()'

# ---- mobile 390 ----
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})'

echo "QA-SCRIPT-DONE"
