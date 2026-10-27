// r356 — درایورِ تایپیِ بانکِ ۵۶ (تشریحی گرامر د۲ — since/for ص۶۳) — ۱۰ سؤال با کلیدِ چاپیِ ص۱۸۷
// حالت-ماشین (الگوی r355): پرکردنِ input با accepted → «بررسی پاسخ» → «سؤال بعدی/دیدن نتیجه». window.__r356b.
// Q1 دوبلانکی است — تایپِ «for / since» (نرمال‌سازیِ اسلش→فاصله در موتور، تطبیق می‌دهد).
(() => {
  if (window.__r356b) return "already";
  window.__r356b = { fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const answers = ["for / since", "for", "for", "since", "since", "for", "since", "for", "since", "for"];
  let i = 0;
  let phase = "fill";
  const tick = () => {
    try {
      const st = window.__r356b;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*10/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "fill"; return; }
      if (phase === "fill") {
        if (/پاسخ درست|✓|✗/.test(mt)) return;
        const inp = main.querySelector("input, textarea");
        const check = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("بررسی پاسخ"));
        if (!inp || !check) return;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        setter.call(inp, answers[i]);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        st.fills++;
        st.log.push("q" + cur + ":" + answers[i]);
        check.click();
        phase = "advance";
      } else {
        const nextBtn = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("سؤال بعدی") || b.textContent.includes("دیدن نتیجه"));
        if (nextBtn) {
          nextBtn.click();
          st.nexts++;
          i++;
          phase = "fill";
        }
      }
      if (i >= answers.length && /قهرمان|نتیجه/.test(document.body.textContent)) {
        clearInterval(st.iv);
        st.done = true;
      }
    } catch (e) {
      window.__r356b.errs.push(String(e));
    }
  };
  window.__r356b.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
