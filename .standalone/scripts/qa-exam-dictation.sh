#!/usr/bin/env bash
# Live QA for «دیکتهٔ واژگان کنکور» (exam-bank dictation, 5th DictationSource)
# — single browser session. Seeds a known word → exam view → CTA (pool ۱۴۹)
# → dialog setup → 8-word round (5 correct via in-page fa→en map, 1 skip,
# 1 wrong, 1 correct-ish) → done screen → store effects on first-occurrence
# keys → context exit «بازگشت به آزمون جامع» → dark probe → mobile 390 →
# fresh-session console check. DB cleanup is a separate script.
set -e
BASE="http://127.0.0.1:3000"
FA2EN_B64="$(cat /tmp/examdict-b64.txt)"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/exd63-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/exd63-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/exd63-snap.txt | grep -oE 'e[0-9]+' | head -1)
  agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed returning-learner marker + open exam view via header nav ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  obj.state.known = { "1:ability": true };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded";
})()'
echo "--- NAV TO EXAM VIEW ---"
agent-browser snapshot >/tmp/exd63-nav.txt 2>&1
NAVREF=$(grep -oE 'button "[^"]*آزمون[^"]*" \[ref=(e[0-9]+)\]' /tmp/exd63-nav.txt | grep -oE 'e[0-9]+' | head -1)
echo "nav ref: $NAVREF"
if [ -n "$NAVREF" ]; then agent-browser click "$NAVREF" >/dev/null; sleep 2; fi
agent-browser snapshot >/tmp/exd63-view.txt 2>&1
grep -c 'آزمون جامع واژگان' /tmp/exd63-view.txt || true

# ---- exam view: CTA present with pool size ۱۴۹ ----
echo "--- EXAM DICTATION CTA ---"
agent-browser eval '(()=>{
  const b = [...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ واژگان کنکور"));
  if (!b) return JSON.stringify({ cta: false });
  return JSON.stringify({
    cta: true,
    has149: b.textContent.includes("۱۴۹"),
    disabled: b.disabled,
    title: b.getAttribute("title") ?? null,
    startChip: b.textContent.includes("شروع دیکته")
  });
})()'

# ---- open dialog → setup ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ واژگان کنکور")); if(b){b.click();return "open-ok";} return "open-miss";})()' >/dev/null
sleep 1
echo "--- DIALOG SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  dialogTitle: [...document.querySelectorAll("[role=dialog] h2")].some(x=>x.textContent.includes("دیکتهٔ واژگان بانک آزمون")),
  countButtons: [...document.querySelectorAll("[role=dialog] button")].filter(b=>["۸","۱۰","۱۵","۲۰"].includes(b.textContent.trim())).length,
  exitBtn: [...document.querySelectorAll("[role=dialog] button")].some(b=>b.textContent.trim()==="بازگشت")
}))()'

# ---- hold full fa→en map in page, pick 8-word round ----
agent-browser eval "(()=>{
  window.FA2EN = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('$FA2EN_B64'), c=>c.charCodeAt(0))));
  return 'map-' + Object.keys(window.FA2EN).length;
})()"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="۸"); if(b){b.click();return "count8-ok";} return "count8-miss";})()' >/dev/null
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="شروع دیکته"); if(b){b.click();return "start-ok";} return "start-miss";})()' >/dev/null
sleep 1

# ---- answer loop: i1-2 correct, i3 skip, i4 wrong, i5-8 correct ----
LOG=/tmp/exd63-round.txt; : > "$LOG"
for i in 1 2 3 4 5 6 7 8; do
  ANSWER=$(agent-browser eval "(()=>{
    const fa = document.querySelector('[role=dialog] div.text-2xl')?.textContent?.trim();
    return window.FA2EN[fa] ?? 'UNKNOWN:'+fa;
  })()" 2>/dev/null | tr -d '"')
  echo "word $i: $ANSWER" >> "$LOG"
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
      setter.call(input, 'xxxxx');
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
cat "$LOG"

echo "--- DONE SCREEN ---"
agent-browser eval '(()=>JSON.stringify({
  done: [...document.querySelectorAll("[role=dialog] h3")].some(x=>x.textContent.includes("دیکته تمام شد")),
  percent: document.querySelector("[role=dialog] p.text-4xl")?.textContent,
  exits: [...document.querySelectorAll("[role=dialog] button")].map(b=>b.textContent.trim()).filter(t=>t.includes("بازگشت"))
}))()'

echo "--- STORE EFFECTS ---"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const s = JSON.parse(raw).state;
  const bucket = s.results && s.results["exam:dictation"];
  const srsKeys = Object.keys(s.srs||{});
  return JSON.stringify({
    bucket: bucket ? {total:bucket.total, percent:bucket.percent} : null,
    srsCount: srsKeys.length,
    srsSample: srsKeys.slice(0,6),
    dayStat: s.dayStat?{dictation:s.dayStat.dictation,quizzes:s.dayStat.quizzes}:null,
    streak: s.streak
  });
})()'

echo "--- EXIT (context label) ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="بازگشت به آزمون جامع"); if(b){b.click();return "exit-ok";} return "exit-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>JSON.stringify({ dialogClosed: !document.querySelector("[role=dialog]") }))()'

echo "--- DARK PROBE ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "dark-ok";} return "dark-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const b = [...document.querySelectorAll("button")].find(x=>x.textContent.includes("دیکتهٔ واژگان کنکور"));
  if (!b) return JSON.stringify({ cta: false });
  const cs = getComputedStyle(b);
  const title = b.querySelector("span span") ?? b;
  return JSON.stringify({
    ctaBg: cs.backgroundImage.slice(0,60) || cs.backgroundColor,
    ctaBorder: cs.borderTopColor,
    titleInk: getComputedStyle(title).color,
    bodyBg: getComputedStyle(document.body).backgroundColor
  });
})()'
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")?.includes("شب")); if(b){b.click();return "light-ok";} return "light-miss";})()' >/dev/null
sleep 1

echo "--- MOBILE 390 ---"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth})'
agent-browser set viewport 1280 800 >/dev/null 2>&1

echo "--- FRESH SESSION CONSOLE ---"
agent-browser eval '(()=>{localStorage.clear(); return "cleared";})()' >/dev/null
agent-browser close >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser errors 2>&1 | tail -3
agent-browser close >/dev/null 2>&1
echo "QA-DONE"
