#!/usr/bin/env bash
# Live QA for «دیکتهٔ برق‌آسا» (spelling sprint) — single browser session.
# Home → rush banner → quiz setup shows mode tabs → switch to «املا» →
# spell setup (sky hero, records, tabs) → start → full 60s round played
# fast-forward: type 3 correct + 1 hint + 1 skip (the remaining time is
# burned by answering everything skipped) → wait for timer end → done
# screen → store effects (records, spell-rush bucket, SRS on canonical
# keys, wordSeen) → back to quiz mode → dark probe → mobile 390 →
# fresh-session console.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/sr-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/sr-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/sr-snap.txt | grep -oE 'e[0-9]+' | head -1)
  [ -n "$REF" ] && agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- navigate to the rush view via the home banner ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.trim()==="شروع چالش"); if(b){b.click();return "nav-ok";} return "nav-miss";})()'
sleep 2

echo "--- QUIZ SETUP TABS ---"
agent-browser eval '(()=>JSON.stringify({
  tabs: [...document.querySelectorAll("[role=tab]")].map(t=>({t:t.textContent.trim(), sel:t.getAttribute("aria-selected")})),
  board: !!document.querySelector(".rush-board, [class*=rush-board]"),
  hero: !!document.querySelector(".rush-hero")
}))()'

# ---- switch to spell mode ----
agent-browser eval '(()=>{const t=[...document.querySelectorAll("[role=tab]")].find(x=>x.textContent.trim()==="املا"); if(t){t.click();return "tab-ok";} return "tab-miss";})()'
sleep 1.5

echo "--- SPELL SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  hero: !!document.querySelector(".rush-hero"),
  icon: document.querySelector(".rush-hero .rush-icon")?.className?.includes("from-sky-500") ?? null,
  chip: [...document.querySelectorAll(".spell-chip")].map(c=>c.textContent.trim()).slice(0,2),
  startBtn: [...document.querySelectorAll("button")].some(b=>b.textContent.includes("شروع دیکتهٔ برق‌آسا")),
  best: [...document.querySelectorAll(".spell-chip")].map(c=>c.textContent.trim()).find(t=>t.includes("رکورد")) ?? null
}))()'

# ---- start the round ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent.includes("شروع دیکتهٔ برق‌آسا")); if(b){b.click();return "start-ok";} return "start-miss";})()' >/dev/null
sleep 1.5

echo "--- PLAY HUD ---"
agent-browser eval '(()=>JSON.stringify({
  hud: !!document.querySelector(".rush-hud"),
  ringStroke: document.querySelector(".rush-hud circle:last-child")?.getAttribute("class")?.includes("stroke-sky-500") ?? null,
  card: !!document.querySelector(".rush-card.border-sky-200"),
  fa: document.querySelector(".spell-fa")?.textContent?.trim() ?? null,
  input: !!document.querySelector(".spell-input"),
  btns: [...document.querySelectorAll(".rush-card button")].map(b=>b.textContent.trim()).filter(t=>t && t.length<16).slice(0,4)
}))()'

# ---- answer loop: lookup + typing happen INSIDE the page (one eval) —
# 3 typed correct, then 1 hint-assisted, then skip the rest until the timer ends ----
MAP_B64=$(base64 -w0 /tmp/fa2en.json)
agent-browser eval "window.__qaMap = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob('$MAP_B64'), c=>c.charCodeAt(0)))); window.__qaHint = false; 'map-ok'" >/dev/null
TYPED=0; HINTED=0; SKIPPED=0
for i in $(seq 1 90); do
  DONE=$(agent-browser eval '[...document.querySelectorAll("h3")].some(x=>x.textContent.includes("دیکتهٔ برق‌آسا تمام شد")) ? "yes" : "no"' 2>/dev/null | tr -cd 'a-z')
  [ "$DONE" = "yes" ] && break
  if [ "$TYPED" -lt 3 ]; then
    R=$(agent-browser eval '(()=>{const fa=document.querySelector(".spell-fa")?.textContent?.trim()??""; const en=window.__qaMap?.[fa]; if(!en) return "noword"; const b=document.querySelector(".spell-input"); if(!b) return "noinput"; const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(b,en); b.dispatchEvent(new Event("input",{bubbles:true})); b.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true})); return "typed";})()' 2>/dev/null | tr -cd 'a-z')
    if [ "$R" = "typed" ]; then TYPED=$((TYPED+1)); sleep 1.2; else SKIPPED=$((SKIPPED+1)); sleep 0.7; agent-browser eval '(()=>{const b=[...document.querySelectorAll(".rush-card button")].find(x=>x.textContent.includes("رد کردن")); b?.click(); return "s";})()' >/dev/null; sleep 0.5; fi
  elif [ "$HINTED" -lt 1 ]; then
    R=$(agent-browser eval '(()=>{const fa=document.querySelector(".spell-fa")?.textContent?.trim()??""; const en=window.__qaMap?.[fa]; if(!en) return "noword"; const h=[...document.querySelectorAll(".rush-card button")].find(x=>x.textContent.includes("راهنما")); if(h) h.click(); const b=document.querySelector(".spell-input"); if(!b) return "noinput"; const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; s.call(b,en); b.dispatchEvent(new Event("input",{bubbles:true})); b.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true})); return "hinted";})()' 2>/dev/null | tr -cd 'a-z')
    if [ "$R" = "hinted" ]; then HINTED=1; sleep 1.4; else SKIPPED=$((SKIPPED+1)); sleep 0.7; agent-browser eval '(()=>{const b=[...document.querySelectorAll(".rush-card button")].find(x=>x.textContent.includes("رد کردن")); b?.click(); return "s";})()' >/dev/null; sleep 0.5; fi
  else
    SKIPPED=$((SKIPPED+1))
    agent-browser eval '(()=>{const b=[...document.querySelectorAll(".rush-card button")].find(x=>x.textContent.includes("رد کردن")); b?.click(); return "s";})()' >/dev/null
    sleep 0.7
  fi
done
echo "round: typed=$TYPED hinted=$HINTED skipped=$SKIPPED"
# ---- wait for the 60s timer to end (the loop may finish early) ----
for w in $(seq 1 30); do
  DONE=$(agent-browser eval '[...document.querySelectorAll("h3")].some(x=>x.textContent.includes("دیکتهٔ برق‌آسا تمام شد")) ? "yes" : "no"' 2>/dev/null | tr -cd 'a-z')
  [ "$DONE" = "yes" ] && break
  sleep 2
done

echo "--- DONE SCREEN ---"
agent-browser eval '(()=>JSON.stringify({
  done: [...document.querySelectorAll("h3")].some(x=>x.textContent.includes("دیکتهٔ برق‌آسا تمام شد")),
  score: document.querySelector(".rush-score")?.textContent?.trim() ?? null,
  chips: [...document.querySelectorAll(".rush-done .rounded-full")].map(c=>c.textContent.trim()).slice(0,5),
  buttons: [...document.querySelectorAll(".rush-done button")].map(b=>b.textContent.trim()).filter(t=>t.length<22)
}))()'

echo "--- STORE EFFECTS ---"
agent-browser eval '(()=>{
  const s = JSON.parse(localStorage.getItem("vision2-study-v1")).state;
  const srsKeys = Object.keys(s.srs || {});
  return JSON.stringify({
    best: { score: s.spellRushBest, correct: s.spellRushBestCorrect },
    bucket: s.results && s.results["spell-rush"] ? s.results["spell-rush"] : null,
    dayStat: s.dayStat ? { quizzes: s.dayStat.quizzes } : null,
    streak: s.streak,
    srsCount: srsKeys.length,
    srsSample: srsKeys.slice(0,4).map(k => k + ":" + s.srs[k].level),
    wordSeenCount: Object.keys(s.wordSeen || {}).length
  });
})()'

echo "--- BACK TO QUIZ MODE ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll(".rush-done button")].find(x=>x.textContent.includes("حالت چهارگزینه‌ای")); if(b){b.click();return "back-ok";} return "back-miss";})()'
sleep 1.5
agent-browser eval '(()=>JSON.stringify({
  quizHeroBack: !!document.querySelector(".rush-hero"),
  tabsBack: [...document.querySelectorAll("[role=tab]")].map(t=>t.getAttribute("aria-selected"))
}))()'

# ---- dark probe (app's own aria-label toggle) ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")==="حالت شب"); if(b){b.click();return "dark-ok";} return "dark-miss";})()' >/dev/null
sleep 1
echo "--- DARK PROBE (spell input) ---"
agent-browser eval '(()=>{const t=[...document.querySelectorAll("[role=tab]")].find(x=>x.textContent.trim()==="املا"); if(t){t.click();return "tab-ok";} return "tab-miss";})()' >/dev/null
sleep 1
agent-browser eval '(()=>{
  const g=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null};
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    heroBg: g(".rush-hero","backgroundColor"),
    chipInk: g(".spell-chip","color"),
    startBg: g(".rush-start","backgroundImage")?.slice(0,40) ?? g(".rush-start","backgroundColor")
  });
})()'
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")==="حالت روشن"); if(b){b.click();return "light-ok";} return "light-miss";})()' >/dev/null

# ---- mobile 390 ----
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
echo "--- MOBILE 390 (spell setup) ---"
agent-browser eval 'JSON.stringify({overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth})'

echo "QA-SCRIPT-DONE"
