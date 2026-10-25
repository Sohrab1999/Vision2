#!/bin/bash
# Task 91 — view-marker verification (companion to qa-regroup-r91.sh)
set -u
cd /home/z/my-project
agent-browser close --all >/dev/null 2>&1
sleep 1
agent-browser open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 4

open_via_palette='((q, pick) => {
  window.dispatchEvent(new CustomEvent("open-command-palette"));
  return new Promise(res => setTimeout(() => {
    const inp = document.querySelector("input");
    if (!inp) { res("no-input"); return; }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(inp, q);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    setTimeout(() => {
      const opts = [...document.querySelectorAll("[role=option], [cmdk-item], li, button")];
      const o = opts.find(x => pick.test(x.textContent || ""));
      if (!o) { res("no-option"); return; }
      o.click();
      setTimeout(() => res("opened"), 2500);
    }, 900);
  }, 600));
})'

echo "--- A. dictionary: expect word-search marker (واژهٔ مورد نظر / جستجو)"
agent-browser eval "($open_via_palette)(\"دیکشنری\", /دیکشنری/)" 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ dict: /جستجو|واژهٔ مورد|معنی/.test(document.body.textContent||""), url: location.href })' 2>/dev/null

echo "--- B. exam: expect setup marker (تعداد سؤال / شروع آزمون)"
agent-browser eval "($open_via_palette)(\"آزمون جامع\", /شروع آزمون جامع|آزمون جامع/) " 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ exam: /تعداد سؤال|شروع آزمون|سؤال/.test(document.body.textContent||"") })' 2>/dev/null

echo "--- C. appendix: expect irregular-verbs marker"
agent-browser eval "($open_via_palette)(\"ضمیمه\", /ضمیمه/)" 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ appendix: /بی‌قاعده|آوا|IPA|فعل/.test(document.body.textContent||"") })' 2>/dev/null

echo "--- D. grammar: expect grammar-flow marker"
agent-browser eval "($open_via_palette)(\"گرامر\", /گرامر/)" 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ grammar: /گرامر|زمان|نکته/.test(document.body.textContent||"") })' 2>/dev/null

echo "--- E. konkur: expect konkur setup marker"
agent-browser eval "($open_via_palette)(\"کنکور\", /کنکور/)" 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ konkur: /کنکور|آزمون/.test(document.body.textContent||"") })' 2>/dev/null

echo "--- F. smart practice: expect review/smart marker"
agent-browser eval "($open_via_palette)(\"مرور هوشمند\", /مرور هوشمند|مرور/)" 2>/dev/null
sleep 1
agent-browser eval 'JSON.stringify({ smart: /مرور|فلش|هوشمند/.test(document.body.textContent||"") })' 2>/dev/null

echo "--- G. console"
agent-browser console 2>/dev/null | grep -iE "error|failed|cannot" | grep -v "Download the React DevTools" | head -6
echo "CONSOLE_END"
