#!/usr/bin/env bash
# Live QA for the two-level word-key resolver (task 62) — single browser session.
# Seeds FOUR second-occurrence danger keys (2:take, 2:happen, 3:confuse,
# 3:create — all silently dropped by the danger feed before the fix) plus one
# first-occurrence control (1:ability) → home danger panel must show 5 rows
# → «دیکتهٔ همین‌ها» CTA → full 5-word round (2 correct + 1 skip + 1 wrong +
# 1 correct) → done ۶۰٪ → store effects on second-occurrence keys (incl. SRS
# upgrade on 2:take) → context-aware exit → dark probe → mobile 390 →
# fresh-session console check. DB cleanup is a separate script.
set -e
BASE="http://127.0.0.1:3000"
FA2EN_B64="eyLYqNixINiv2KfYtNiq2YbYjCDYqNix2K/ZhiI6InRha2UiLCLYp9iq2YHYp9mCINin2YHYqtin2K/ZhiI6ImhhcHBlbiIsItqv24zYrCDaqdix2K/ZhiI6ImNvbmZ1c2UiLCLYrtmE2YIg2qnYsdiv2YbYjCDYqNmHINmI2KzZiNivINii2YjYsdiv2YYiOiJjcmVhdGUiLCLYqtmI2KfZhtin24zbjNiMINmE24zYp9mC2KrYjCDYtNin24zYs9iq2q/bjCI6ImFiaWxpdHkifQ=="

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/so62-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/so62-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/so62-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed: 4 second-occurrence keys + 1 control, mistakes=2/seen=3 ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  obj.state.wordMistakes = { "2:take":2, "2:happen":2, "3:confuse":2, "3:create":2, "1:ability":2 };
  obj.state.wordSeen = { "2:take":3, "2:happen":3, "3:confuse":3, "3:create":3, "1:ability":3 };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
agent-browser open "$BASE" >/dev/null
sleep 4

# ---- home: danger panel must rank SECOND occurrences (before fix: 1 row) ----
echo "--- DANGER PANEL (5 rows expected: 4 second-occurrence + 1 control) ---"
agent-browser eval '(()=>{
  const h = [...document.querySelectorAll("h2")].find(x=>x.textContent.includes("واژه‌های خطرناک من"));
  if (!h) return JSON.stringify({ panel: false });
  const lis = [...h.closest("section").querySelectorAll("ul li")];
  const takeRow = lis.find(x=>x.textContent.includes("take"));
  return JSON.stringify({
    panel: true,
    rows: lis.length,
    rowWords: lis.map(x=>x.textContent.trim().slice(0,24)),
    takeFaLesson2: takeRow ? takeRow.textContent.includes("بردن") : false,
    cta: [...h.closest("section").querySelectorAll("button")].some(b=>b.textContent.includes("دیکتهٔ همین‌ها"))
  });
})()'

# ---- open dictation dialog → setup → start ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ همین‌ها")); if(b){b.click();return "open-ok";} return "open-miss";})()' >/dev/null
sleep 1
echo "--- DIALOG SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  dialogTitle: [...document.querySelectorAll("[role=dialog] h2")].some(x=>x.textContent.includes("دیکتهٔ واژه‌های خطرناک")),
  countButtons: [...document.querySelectorAll("[role=dialog] button")].filter(b=>["۸","۱۰","۱۵","۲۰"].includes(b.textContent.trim())).length,
  exitBtn: [...document.querySelectorAll("[role=dialog] button")].some(b=>b.textContent.trim()==="بازگشت")
}))()'
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="شروع دیکته"); if(b){b.click();return "start-ok";} return "start-miss";})()' >/dev/null
sleep 1

# ---- answer loop: i1 correct, i2 correct, i3 skip, i4 wrong, i5 correct ----
# fa→en map held IN PAGE via base64+TextDecoder (round-61 lesson: no shell quoting traps)
agent-browser eval "(()=>{
  window.FA2EN = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('$FA2EN_B64'), c=>c.charCodeAt(0))));
  return 'map-' + Object.keys(window.FA2EN).length;
})()"
for i in 1 2 3 4 5; do
  ANSWER=$(agent-browser eval "(()=>{
    const fa = document.querySelector('[role=dialog] div.text-2xl')?.textContent?.trim();
    return window.FA2EN[fa] ?? 'UNKNOWN:'+fa;
  })()" 2>/dev/null | tr -d '"')
  echo "word $i: fa→en = $ANSWER"
  if [ "$i" = "3" ]; then
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="رد کردن"); if(b){b.click();return "skip-ok";} return "skip-miss";})()' >/dev/null
    sleep 0.6
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("واژهٔ بعدی")); if(b){b.click();return "next-ok";} return "next-miss";})()' >/dev/null
    sleep 0.8
  elif [ "$i" = "4" ]; then
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
  exitLabel: [...document.querySelectorAll("[role=dialog] button")].map(b=>b.textContent.trim()).find(t=>t.includes("بازگشت"))
}))()'

echo "--- STORE EFFECTS ON SECOND-OCCURRENCE KEYS ---"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const s = JSON.parse(raw).state;
  const pick=(o,k)=>o&&o[k]!==undefined?o[k]:null;
  return JSON.stringify({
    srs2take: s.srs&&s.srs["2:take"]?s.srs["2:take"].level:null,
    seenTake: pick(s.wordSeen,"2:take"), mistakesTake: pick(s.wordMistakes,"2:take"),
    seenCreate: pick(s.wordSeen,"3:create"), mistakesCreate: pick(s.wordMistakes,"3:create"),
    seenAbility: pick(s.wordSeen,"1:ability"),
    resultDanger: s.results&&s.results["danger:dictation"]?{total:s.results["danger:dictation"].total,percent:s.results["danger:dictation"].percent}:null,
    dayStat: s.dayStat?{dictation:s.dayStat.dictation,quizzes:s.dayStat.quizzes}:null,
    streak: s.streak
  });
})()'

echo "--- EXIT (context-aware label) ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("بازگشت به واژه‌های خطرناک")); if(b){b.click();return "exit-ok";} return "exit-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>JSON.stringify({ dialogClosed: !document.querySelector("[role=dialog]") }))()'

echo "--- DARK PROBE ---"
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label=\"حالت شب\"]")||[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "dark-ok";} return "dark-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const h = [...document.querySelectorAll("h2")].find(x=>x.textContent.includes("واژه‌های خطرناک من"));
  if (!h) return JSON.stringify({ panel: false });
  const row = h.closest("section").querySelector("ul li");
  const cs = row ? getComputedStyle(row) : null;
  return JSON.stringify({
    rowInk: cs ? cs.color : null,
    rowBorder: cs ? cs.borderTopColor : null,
    bodyBg: getComputedStyle(document.body).backgroundColor
  });
})()'
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label=\"حالت شب\"]")||[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "light-ok";} return "light-miss";})()' >/dev/null
sleep 1

echo "--- MOBILE 390 ---"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth})'
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- FRESH SESSION CONSOLE ---"
agent-browser eval 'localStorage.clear(); return "cleared";' >/dev/null 2>&1 || agent-browser eval '(()=>{localStorage.clear(); return "cleared";})()' >/dev/null
agent-browser close >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser errors 2>&1 | tail -3
agent-browser close >/dev/null 2>&1
echo "QA-DONE"
