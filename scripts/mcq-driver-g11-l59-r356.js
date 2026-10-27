// r356 — درایورِ MCQِ بانکِ ۵۹ (تشریحی گرامر د۲ — بهترین گزینه ص۶۴) — ۲۰ سؤال
// گریدِ چاپیِ کلیدِ ص۱۸۷: d,a,b,b,a,d,a,c,b,c,b,c,d,c,a,d,b,a,b,d
// حالت-ماشینِ قطعی (درسِ r355): لنگرِ «N / 20» + فازِ answer/advance + فیدبکِ ✓/✗.
(() => {
  if (window.__r356a) return "already";
  window.__r356a = { clicks: 0, nexts: 0, done: false, errs: [], log: [] };
  const grid = ["d","a","b","b","a","d","a","c","b","c","b","c","d","c","a","d","b","a","b","d"];
  let i = 0;
  let phase = "answer"; // answer | advance
  const tick = () => {
    try {
      const st = window.__r356a;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*20/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; } // سؤالِ موردِ انتظار هنوز نیامده
      if (phase === "answer") {
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
        if (/پاسخ درست|✗/.test(mt)) {
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
      window.__r356a.errs.push(String(e));
    }
  };
  window.__r356a.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
