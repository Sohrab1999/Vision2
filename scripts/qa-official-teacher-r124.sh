#!/bin/bash
# Task 124 QA — داوریِ معلمِ هفته روی کاغذ رسمی A4 — تک‌سشن، ناوبریِ واقعی
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- A0. force first persist write (skipHydration — any state set writes)"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const tg = btns.find(b => (b.getAttribute("aria-label") || "").includes("حالت"));
  if (!tg) return "TOGGLE-MISSING";
  tg.click();
  return "TOGGLED|keys=" + Object.keys(localStorage).length;
})()' 2>/dev/null
sleep 1

echo "--- A. seed an active week (build the persist key from scratch — skipHydration store writes only on set; lesson: header theme toggle is a separate 'theme' key)"
agent-browser eval '(() => {
  const KEY = "vision2-study-v1";
  const prev = localStorage.getItem(KEY);
  localStorage.setItem("vision2-study-v1-r124-backup", prev || "__ABSENT__");
  const parsed = prev ? JSON.parse(prev) : { state: {}, version: 0 };
  const st = parsed.state || parsed;
  const dk = (n) => { const d = new Date(); d.setDate(d.getDate()-n); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${dd}`; };
  st.dayHistory = {
    [dk(0)]: { day: dk(0), reviews: 5, quizzes: 1, words: 0, dictation: 0, rush: 0 },
    [dk(1)]: { day: dk(1), reviews: 3, quizzes: 0, words: 2, dictation: 0, rush: 0 },
    [dk(3)]: { day: dk(3), reviews: 2, quizzes: 1, words: 0, dictation: 1, rush: 1 },
  };
  st.goalMetDays = [dk(0), dk(1)];
  localStorage.setItem(KEY, JSON.stringify(parsed));
  return "SEEDED|days=" + Object.keys(st.dayHistory).length + "|hadPrev=" + !!prev;
})()' 2>/dev/null

echo "--- B. reload with the seeded week"
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

echo "--- C. open report dialog via the real home card"
agent-browser eval '(() => {
  const btns = [...document.querySelectorAll("button")];
  const card = btns.find(b => (b.textContent || "").includes("کارنامهٔ من"));
  if (!card) return "REPORT-CARD-MISSING";
  card.click();
  return "REPORT-CLICKED";
})()' 2>/dev/null
sleep 2

echo "--- D. open the official A4 paper"
agent-browser eval '(() => {
  const btn = document.querySelector("[aria-label=\"گزارش رسمی چاپی برای معلم\"]");
  if (!btn) return "OFFICIAL-BTN-MISSING";
  btn.click();
  return "OFFICIAL-CLICKED";
})()' 2>/dev/null
sleep 2

echo "--- E. poll for the verdict (AI seconds / offline instant) — scoped to portal root"
RESULT="NEVER"
for i in $(seq 1 35); do
  R=$(agent-browser eval '(() => {
    const root = document.querySelector(".official-portal-root");
    if (!root) return "NO-PAPER";
    const sec = root.querySelector("[aria-label=\"داوری معلم هفته\"]");
    if (sec) {
      const prov = root.querySelector("[data-provenance=\"teacher-verdict\"]");
      const cls = prov ? prov.className : "";
      const chip = cls.includes("or-chip-offline") ? "OFFLINE" : cls.includes("or-chip-ready") ? "READY" : cls.includes("or-chip-fresh") ? "FRESH" : "?";
      const txt = sec.textContent || "";
      return "VERDICT|" + chip +
        "|STRENGTH|" + (/نقطهٔ قوت/.test(txt) ? "OK" : "FAIL") +
        "|ADVICE|" + (/تمرینِ پیشنهادی/.test(txt) ? "OK" : "FAIL") +
        "|GOAL7|" + (/از ۷ روزِ هدف کامل/.test(txt) ? "OK" : "FAIL") +
        "|ROWS|" + sec.querySelectorAll(".or-teacher-row").length;
    }
    if (root.querySelector("[role=\"status\"]")) return "LOADING";
    return "WAIT";
  })()' 2>/dev/null)
  echo "poll$i: $R"
  case "$R" in *VERDICT*) RESULT="$R"; break;; esac
  sleep 1
done
echo "FINAL: $RESULT"

echo "--- F. overflow checks at 390 while the paper is open"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval '(() => {
  const d = document.documentElement;
  const paper = document.querySelector(".official-report");
  const pw = paper ? Math.round(paper.getBoundingClientRect().width) : -1;
  return "MOBILE390|OV|" + (d.scrollWidth - d.clientWidth) + "|PAPERW|" + pw + "|VW|" + d.clientWidth;
})()' 2>/dev/null

echo "--- G. paper screenshot for the record"
agent-browser screenshot /home/z/my-project/qa-official-teacher-r124.png >/dev/null 2>&1 && echo "SHOT-OK" || echo "SHOT-SKIP"

echo "--- H. restore the original learner state (strip the seed)"
agent-browser eval '(() => {
  const bak = localStorage.getItem("vision2-study-v1-r124-backup");
  if (bak === null) return "NO-BACKUP";
  if (bak === "__ABSENT__") {
    localStorage.removeItem("vision2-study-v1");
  } else {
    localStorage.setItem("vision2-study-v1", bak);
  }
  localStorage.removeItem("vision2-study-v1-r124-backup");
  localStorage.removeItem("theme");
  return "STRIPPED-OK";
})()' 2>/dev/null

echo "--- I. console errors this session"
agent-browser console 2>/dev/null | grep -iE "error|warn" | grep -v "Download the React DevTools" | head -5
echo "CONSOLE_END"
echo "R124-QA-END"
