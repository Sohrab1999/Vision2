#!/usr/bin/env bash
# ------------------------------------------------------------------
# r292 — شکارِ باگِ «این صفحهٔ کتاب باز نشد!» (گزارشِ کاربر با اسکرین‌شات).
# نسخهٔ ۲: ناوبری با برچسبِ فارسیِ واقعی (نسخهٔ ۱ با id تایپ‌شده کار نکرد)
# و کلیدِ ذخیره‌سازیِ درست (vision2-study-v1).
# ------------------------------------------------------------------
set -uo pipefail
BASE="http://127.0.0.1:3000"

declare -A LABELS=(
  ["home"]="جلد کتاب"
  ["dictionary"]="دیکشنری واژگان"
  ["exam"]="آزمون جامع"
  ["appendix"]="ضمیمهٔ کتاب"
  ["grammar"]="متروی گرامر"
  ["konkur"]="گوشهٔ کنکور"
  ["review"]="مرور سریع خطاها"
  ["my-words"]="واژه‌های من"
  ["library"]="کتاب‌خانهٔ داستان‌ها"
  ["smart"]="تمرین هوشمند"
  ["listen"]="آموخته‌های شنیداری"
)

goto() {
  agent-browser press "Control+k" >/dev/null 2>&1; sleep 0.9
  agent-browser keyboard type "$1" >/dev/null 2>&1; sleep 1
  agent-browser press "Enter" >/dev/null 2>&1; sleep 2.5
}

probe() {
  agent-browser eval '(()=>{
    const err=[...document.querySelectorAll("h1")].find(h=>(h.textContent||"").includes("این صفحهٔ کتاب باز نشد"));
    const main=(document.querySelector("main")||document.body).textContent||"";
    return JSON.stringify({err:!!err,len:main.length});
  })()' 2>/dev/null
}

concheck() {
  agent-browser console 2>/dev/null | rg -i "error" | rg -v "Download the React DevTools|Image with src|third-party" | head -3 | tr '\n' '~'
}

echo "===== A. fresh walk ====="
agent-browser open "$BASE" >/dev/null 2>&1; sleep 3
agent-browser eval '(()=>{ localStorage.clear(); sessionStorage.clear(); return "ok"; })()' >/dev/null 2>&1
agent-browser open "$BASE" >/dev/null 2>&1; sleep 4
agent-browser console --clear >/dev/null 2>&1
for k in dictionary exam appendix grammar konkur review my-words library smart listen home; do
  goto "${LABELS[$k]}"
  echo "[$k] $(probe)  CONSOLE=$(concheck)"
done

echo "===== B. deep-interaction probes (fresh) ====="
# دیکشنری: جست‌وجوی واژه
goto "${LABELS[dictionary]}"
agent-browser eval '(()=>{const i=document.querySelector("input[type=search],input[type=text],input");if(!i)return "no-input";const st=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set;st.call(i,"book");i.dispatchEvent(new Event("input",{bubbles:true}));return "typed";})()' >/dev/null 2>&1; sleep 2
echo "[dict-search] $(probe)  CONSOLE=$(concheck)"
# کنکور: شروعِ یک تست
goto "${LABELS[konkur]}"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").match(/شروع|آغاز/));if(b){b.click();return "started";}return "no-start";})()' >/dev/null 2>&1; sleep 2.5
echo "[konkur-start] $(probe)  CONSOLE=$(concheck)"
# آزمون جامع: شروع
goto "${LABELS[exam]}"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").match(/شروع|آغاز/));if(b){b.click();return "started";}return "no-start";})()' >/dev/null 2>&1; sleep 2.5
echo "[exam-start] $(probe)  CONSOLE=$(concheck)"
# کتاب‌خانه: بازکردنِ داستانِ نوِ s1-19
goto "${LABELS[library]}"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").includes("Miss Green"));if(b){b.click();return "opened";}return "no-row";})()' >/dev/null 2>&1; sleep 2.5
echo "[library-s1-19] $(probe)  CONSOLE=$(concheck)"
# تمرین هوشمند
goto "${LABELS[smart]}"
agent-browser eval '(()=>{const b=[...document.querySelectorAll("button")].find(x=>(x.textContent||"").match(/شروع|آغاز/));if(b){b.click();return "started";}return "no-start";})()' >/dev/null 2>&1; sleep 2.5
echo "[smart-start] $(probe)  CONSOLE=$(concheck)"

echo "===== C. returning-learner rich state ====="
agent-browser eval '(()=>{
  try{
    const K="vision2-study-v1"; const raw=localStorage.getItem(K); if(!raw) return "no-key";
    const s=JSON.parse(raw); const st=s.state||s;
    if(st.libraryDone!==undefined||true) st.libraryDone=Object.assign({},st.libraryDone,{
      "s1-1":{score:6,total:6,day:"2026-10-21"},"s1-7":{score:4,total:6,day:"2026-10-20"},"s2-3":{score:5,total:6,day:"2026-10-19"}});
    s.state=st; localStorage.setItem(K,JSON.stringify(s)); return "rich-ok";
  }catch(e){ return "fail:"+e.message; }
})()' 2>/dev/null
agent-browser open "$BASE" >/dev/null 2>&1; sleep 4
agent-browser console --clear >/dev/null 2>&1
for k in library my-words review smart home; do
  goto "${LABELS[$k]}"
  echo "[$k] $(probe)  CONSOLE=$(concheck)"
done
