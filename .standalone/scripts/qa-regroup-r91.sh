#!/bin/bash
# Task 91 — post-regroup live QA: every dynamic-imported view loads from its new home.
# Single agent-browser session; home → lesson → dictionary → exam → grammar → appendix → smart → report.
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

probe='(() => {
  const t = document.body.textContent || "";
  return JSON.stringify({
    hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    sample: t.replace(/\s+/g, " ").slice(0, 60),
  });
})()'

echo "--- 1. lesson-view opens (lesson/ folder, dynamic import)"
agent-browser eval '(() => { const cards=[...document.querySelectorAll("[class*=lesson-card], button, a")]; const c=cards.find(x=>/درس اول|Lesson 1|درس ۱/.test(x.textContent||"")); if(c){c.click(); return "clicked";} return "not-found"; })()' 2>/dev/null
sleep 3
agent-browser eval "$probe" 2>/dev/null

echo "--- 2. back home via palette: dictionary (lesson/ folder)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "palette"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const inp=document.querySelector("input"); if(!inp) return "no-input"; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; setter.call(inp,"دیکشنری"); inp.dispatchEvent(new Event("input",{bubbles:true})); return "typed"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const opts=[...document.querySelectorAll("[role=option], [cmdk-item], li, button")]; const o=opts.find(x=>/دیکشنری/.test(x.textContent||"")); if(o){o.click(); return "ok";} return "no-option"; })()' 2>/dev/null
sleep 3
agent-browser eval "$probe" 2>/dev/null

echo "--- 3. exam-view (exam/ folder)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "palette"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const inp=document.querySelector("input"); if(!inp) return "no-input"; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; setter.call(inp,"آزمون جامع"); inp.dispatchEvent(new Event("input",{bubbles:true})); return "typed"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const opts=[...document.querySelectorAll("[role=option], [cmdk-item], li, button")]; const o=opts.find(x=>/آزمون جامع/.test(x.textContent||"")); if(o){o.click(); return "ok";} return "no-option"; })()' 2>/dev/null
sleep 3
agent-browser eval "$probe" 2>/dev/null

echo "--- 4. grammar (grammar/ folder)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "palette"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const inp=document.querySelector("input"); if(!inp) return "no-input"; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; setter.call(inp,"گرامر"); inp.dispatchEvent(new Event("input",{bubbles:true})); return "typed"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const opts=[...document.querySelectorAll("[role=option], [cmdk-item], li, button")]; const o=opts.find(x=>/گرامر/.test(x.textContent||"")); if(o){o.click(); return "ok";} return "no-option"; })()' 2>/dev/null
sleep 3
agent-browser eval "$probe" 2>/dev/null

echo "--- 5. appendix (lesson/ folder)"
agent-browser eval '(() => { window.dispatchEvent(new CustomEvent("open-command-palette")); return "palette"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const inp=document.querySelector("input"); if(!inp) return "no-input"; const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set; setter.call(inp,"ضمیمه"); inp.dispatchEvent(new Event("input",{bubbles:true})); return "typed"; })()' 2>/dev/null
sleep 1
agent-browser eval '(() => { const opts=[...document.querySelectorAll("[role=option], [cmdk-item], li, button")]; const o=opts.find(x=>/ضمیمه/.test(x.textContent||"")); if(o){o.click(); return "ok";} return "no-option"; })()' 2>/dev/null
sleep 3
agent-browser eval "$probe" 2>/dev/null

echo "--- 6. console errors"
agent-browser console 2>/dev/null | grep -iE "error|failed|cannot" | grep -v "Download the React DevTools" | head -8
echo "CONSOLE_END"
