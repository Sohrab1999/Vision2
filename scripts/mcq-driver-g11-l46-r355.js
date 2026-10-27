// r355 — درایورِ MCQِ بانکِ ۴۶ (تشریحی جامع — تست چهارگزینه‌ای ص۴۰) — ۴ سؤال، گریدِ چاپیِ [c,d,a,c]
// حالت-ماشینِ قطعی: لنگرِ «N / 4» برای شمارهٔ سؤال + فیدبکِ «پاسخ درست/غلط» برای مرحلهٔ بعد.
(() => {
  if (window.__r355a) return "already";
  window.__r355a = { clicks: 0, nexts: 0, done: false, errs: [], log: [] };
  const grid = ["c", "d", "a", "c"]; // کلیدهای l46: popular/exist/despite/mental
  let i = 0;
  let phase = "answer"; // answer | advance
  const tick = () => {
    try {
      const st = window.__r355a;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*4/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; } // هنوز سؤالِ موردِ انتظار نیامده
      if (phase === "answer") {
        // فیدبکِ سؤالِ قبلی هنوز روی صفحه است؟ صبر
        if (/پاسخ درست|✓|✗/.test(mt)) return;
        const opts = Array.from(main.querySelectorAll("button"))
          .filter((b) => /^[a-d]/.test(b.textContent.trim()) && b.textContent.trim().length > 1);
        if (opts.length !== 4) return;
        const want = grid[i];
        const target = opts.find((b) => b.textContent.trim()[0] === want);
        if (!target) { st.errs.push("no-opt-" + want + "@" + i); return; }
        target.click();
        st.clicks++;
        st.log.push("q" + cur + ":" + want);
        phase = "advance";
      } else {
        if (/پاسخ درست/.test(mt) || /✗/.test(mt)) {
          const nextBtn = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("سؤال بعدی") || b.textContent.includes("دیدن نتیجه"));
          if (nextBtn) {
            nextBtn.click();
            st.nexts++;
            i++;
            phase = "answer";
          }
        }
      }
      if (i >= grid.length && /قهرمان|نتیجه/.test(document.body.textContent)) {
        clearInterval(st.iv);
        st.done = true;
      }
    } catch (e) {
      window.__r355a.errs.push(String(e));
    }
  };
  window.__r355a.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
