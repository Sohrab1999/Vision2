// r357 — درایورِ MCQِ بانکِ ۷۲ (جامع تشریحی د۲ — کلوزِ اعتیاد ص۷۶) — ۶ سؤال
// کلیدِ چاپیِ ص۱۹۲: badly, called, sick, hurt, cure, habit → c,b,c,a,c,d
// حالت-ماشینِ قطعی (درسِ r355/r356): لنگرِ «N / 6» + فازِ answer/advance + فیدبکِ ✓/✗.
(() => {
  if (window.__r357a) return "already";
  window.__r357a = { clicks: 0, nexts: 0, done: false, errs: [], log: [] };
  const grid = ["c", "b", "c", "a", "c", "d"];
  let i = 0;
  let phase = "answer";
  const tick = () => {
    try {
      const st = window.__r357a;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*6/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; }
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
        const nextBtn = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("سؤال بعدی") || b.textContent.includes("دیدن نتیجه"));
        if (nextBtn) {
          nextBtn.click();
          st.nexts++;
          i++;
          phase = "answer";
        }
      }
      if (i >= grid.length && /قهرمان|نتیجه/.test(document.body.textContent)) {
        clearInterval(st.iv);
        st.done = true;
      }
    } catch (e) {
      window.__r357a.errs.push(String(e));
    }
  };
  window.__r357a.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
