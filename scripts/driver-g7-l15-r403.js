// r403 — درایورِ E2Eِ بانکِ g7-l15 (شش سؤالِ ۸گزینه‌ایِ «بانک واژه» ص۹۰)
// الگویِ r358/r386: پاسخ‌هایِ درستِ کلیدی: 1,2,3,4,5,7 — گزینهٔ هشتم (حرفِ h
// که تا دیروز «undefined» رندر می‌شد) عینِ کلیدِ سؤالِ آخر است.
(() => {
  if (window.__r403a) return "already";
  window.__r403a = { clicks: 0, nexts: 0, phase: "answer", done: false, errs: [], log: [] };
  const keys = [1, 2, 3, 4, 5, 7];
  let i = 0;
  let phase = "answer";
  const tick = () => {
    try {
      const st = window.__r403a;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent || "";
      const m = mt.match(/(\d+)\s*\/\s*6(?!\d)/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; }
      if (phase === "answer") {
        const btns = Array.from(main.querySelectorAll("[data-quiz-option]"));
        if (btns.length < 8) return;
        const target = btns[keys[i]];
        if (!target) { st.errs.push("no-btn-" + i); return; }
        target.click();
        st.clicks++;
        st.log.push("q" + cur + ":opt" + keys[i]);
        phase = "advance";
      } else {
        const nextBtn = Array.from(main.querySelectorAll("button")).find(
          (b) => b.textContent.includes("سؤال بعدی") || b.textContent.includes("دیدن نتیجه")
        );
        if (nextBtn) {
          nextBtn.click();
          st.nexts++;
          i++;
          phase = "answer";
        }
      }
      if (i >= keys.length && /معلمِ کارنامه/.test(document.body.textContent)) {
        clearInterval(st.iv);
        st.done = true;
      }
    } catch (e) {
      window.__r403a.errs.push(String(e));
    }
  };
  window.__r403a.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
