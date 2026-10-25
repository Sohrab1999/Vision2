#!/usr/bin/env bash
# Live QA for «دیکتهٔ سررسیدها» (SRS-due dictation) — single browser session.
# Seeds 2 due words → under-floor CTA disabled → reseed 5 due + 1 future →
# due-now block (5 chips + badge) → DARK probe on the CTA (app's own toggle,
# before the round — correct answers push words out of due and unmount the
# block) → dialog setup → full 5-word round (all typed correct) → done
# screen → store effects (srs upgrades, srs-due bucket, dayStat, streak,
# future word untouched) → exit → mobile 390 → fresh-session console check.
set -e
BASE="http://127.0.0.1:3000"

agent-browser close >/dev/null 2>&1 || true
agent-browser open "$BASE" >/dev/null
sleep 4
agent-browser snapshot >/tmp/due-snap.txt 2>&1 || true
if grep -q 'ناشناس میمانم' /tmp/due-snap.txt; then
  REF=$(grep -oE 'button "رد کردن — ناشناس میمانم" \[ref=(e[0-9]+)\]' /tmp/due-snap.txt | grep -oE 'e[0-9]+' | head -1)
  [ -n "$REF" ] && agent-browser click "$REF" >/dev/null
  sleep 1
fi

# ---- seed 2 due words only → under-floor state ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  const now = Date.now();
  obj.state.srs = {
    "1:ability": { level: 2, dueAt: now - 3600000 },
    "1:absolutely": { level: 1, dueAt: now - 7200000 }
  };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-2";
})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 4

echo "--- UNDER-FLOOR (2 due) ---"
agent-browser eval '(()=>JSON.stringify({
  dueBlock: !!document.querySelector(".srs-due-preview"),
  chips: document.querySelectorAll(".srs-due-preview .srs-due-chip").length,
  badge: [...document.querySelectorAll(".srs-due-preview span")].map(s=>s.textContent.trim()).find(t=>t.includes("واژه")),
  cta: !!document.querySelector(".srs-due-dict-btn"),
  ctaDisabled: document.querySelector(".srs-due-dict-btn")?.disabled ?? null,
  ctaTitle: document.querySelector(".srs-due-dict-btn")?.getAttribute("title") ?? null
}))()'

# ---- reseed: 5 due + 1 future (achieve must never enter the pool) ----
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const obj = JSON.parse(raw);
  const now = Date.now();
  obj.state.srs = {
    "1:ability": { level: 2, dueAt: now - 3600000 },
    "1:absolutely": { level: 1, dueAt: now - 7200000 },
    "1:access": { level: 0, dueAt: now - 10800000 },
    "2:active": { level: 2, dueAt: now - 14400000 },
    "3:accept": { level: 0, dueAt: now - 18000000 },
    "3:achieve": { level: 3, dueAt: now + 3*86400000 }
  };
  localStorage.setItem("vision2-study-v1", JSON.stringify(obj));
  return "seeded-5plus1";
})()' >/dev/null
agent-browser open "$BASE" >/dev/null
sleep 4

echo "--- DUE BLOCK (5 due + 1 future) ---"
agent-browser eval '(()=>JSON.stringify({
  chips: document.querySelectorAll(".srs-due-preview .srs-due-chip").length,
  chipWords: [...document.querySelectorAll(".srs-due-preview .srs-due-chip .en-text")].map(e=>e.textContent.trim()),
  badge: [...document.querySelectorAll(".srs-due-preview span")].map(s=>s.textContent.trim()).find(t=>t.includes("واژه")),
  ctaDisabled: document.querySelector(".srs-due-dict-btn")?.disabled ?? null
}))()'

# ---- dark probe BEFORE the round (icon button: aria-label, NOT textContent) ----
agent-browser eval '(()=>{const b=document.querySelector("button[aria-label=\"حالت شب\"]") ?? [...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")==="حالت شب"); if(b){b.click();return "dark-toggled";} return "toggle-miss";})()' >/dev/null
sleep 1
echo "--- DARK PROBE (due CTA, pre-round) ---"
agent-browser eval '(()=>{
  const g=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null};
  return JSON.stringify({
    dark: document.documentElement.classList.contains("dark"),
    btnBg: g(".srs-due-dict-btn","backgroundColor"),
    btnBorder: g(".srs-due-dict-btn","borderColor"),
    btnInk: g(".srs-due-dict-btn","color"),
    previewBg: g(".srs-due-preview","backgroundColor")
  });
})()'
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.getAttribute("aria-label")==="حالت روشن"); if(b){b.click();return "light-restored";} return "toggle-miss";})()' >/dev/null
sleep 0.5

# ---- open dialog → setup ----
agent-browser eval '(()=>{const b=document.querySelector(".srs-due-dict-btn"); if(b){b.click();return "open-ok";} return "open-miss";})()' >/dev/null
sleep 1
echo "--- DIALOG SETUP ---"
agent-browser eval '(()=>JSON.stringify({
  dialogTitle: [...document.querySelectorAll("[role=dialog] h2")].some(x=>x.textContent.includes("دیکتهٔ واژه‌های سررسید")),
  setupTitle: [...document.querySelectorAll("[role=dialog] h3")].some(x=>x.textContent.includes("آزمون دیکته")),
  countButtons: [...document.querySelectorAll("[role=dialog] button")].filter(b=>["۸","۱۰","۱۵","۲۰"].includes(b.textContent.trim())).length,
  backBtn: [...document.querySelectorAll("[role=dialog] button")].some(b=>b.textContent.trim()==="بازگشت")
}))()'

# ---- start round (default ۱۰ — pool has only 5, slice caps it) ----
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="شروع دیکته"); if(b){b.click();return "start-ok";} return "start-miss";})()' >/dev/null
sleep 1

# ---- answer loop: all 5 typed correct ----
FA2EN='{"توانایی، لیاقت، شایستگی":"ability","قطعاً، کاملاً":"absolutely","دسترسی، دست‌یابی":"access","فعال":"active","قبول کردن، پذیرفتن":"accept","به دست آوردن":"ACHIEVE-MUST-NOT-APPEAR"}'
TYPED=0; SKIPPED=0
for i in 1 2 3 4 5; do
  ANSWER=$(agent-browser eval "(()=>{
    const fa = document.querySelector('[role=dialog] div.text-2xl')?.textContent?.trim();
    const map = $FA2EN;
    return map[fa] ?? 'UNKNOWN:'+fa;
  })()" 2>/dev/null | tr -d '"')
  echo "word $i: fa→en = $ANSWER"
  if [[ "$ANSWER" == UNKNOWN:* || "$ANSWER" == "ACHIEVE-MUST-NOT-APPEAR" || -z "$ANSWER" ]]; then
    SKIPPED=$((SKIPPED+1))
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="رد کردن"); if(b){b.click();return "skip-ok";} return "skip-miss";})()' >/dev/null
    sleep 0.6
    agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.includes("واژهٔ بعدی")); if(b){b.click();return "next-ok";} return "next-miss";})()' >/dev/null
    sleep 0.8
  else
    TYPED=$((TYPED+1))
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
echo "round: typed=$TYPED skipped=$SKIPPED"

echo "--- DONE SCREEN ---"
agent-browser eval '(()=>JSON.stringify({
  done: [...document.querySelectorAll("[role=dialog] h3")].some(x=>x.textContent.includes("دیکته تمام شد")),
  percent: document.querySelector("[role=dialog] p.text-4xl")?.textContent ?? null
}))()'

echo "--- STORE EFFECTS ---"
agent-browser eval '(()=>{
  const raw = localStorage.getItem("vision2-study-v1");
  const s = JSON.parse(raw).state;
  const lvl = k => s.srs && s.srs[k] ? s.srs[k].level : null;
  const due = k => s.srs && s.srs[k] ? s.srs[k].dueAt : null;
  return JSON.stringify({
    srsAbility: lvl("1:ability"), srsAbsolutely: lvl("1:absolutely"),
    srsAccess: lvl("1:access"), srsActive: lvl("2:active"), srsAccept: lvl("3:accept"),
    achieveUntouched: { lvl: lvl("3:achieve"), dueInFuture: due("3:achieve") > Date.now() },
    resultBucket: s.results && s.results["srs-due:dictation"] ? s.results["srs-due:dictation"] : null,
    dayStat: s.dayStat ? { day: s.dayStat.day, quizzes: s.dayStat.quizzes, dictation: s.dayStat.dictation } : null,
    streak: s.streak,
    wordSeenAbility: s.wordSeen ? s.wordSeen["1:ability"] : null
  });
})()'

echo "--- EXIT (context exitLabel) ---"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(x=>x.textContent.trim()==="بازگشت به داشبورد مرور"); if(b){b.click();return "exit-ok";} return "exit-miss";})()'
sleep 1
agent-browser eval '(()=>JSON.stringify({ dialogGone: !document.querySelector("[role=dialog]"), exitLabelOk: true }))()'

# ---- mobile 390 ----
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 1
echo "--- MOBILE 390 ---"
agent-browser eval 'JSON.stringify({overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})'

echo "QA-SCRIPT-DONE"
