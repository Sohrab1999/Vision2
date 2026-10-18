// r355 — درایورِ تایپیِ بانکِ ۴۳ (تشریحی جامع — کلمات ناقص ص۴۰) — ۴ سؤال با کلیدِ چاپیِ ص۱۸۳
// حالت-ماشین: پرکردنِ input با accepted → «بررسی پاسخ» → «سؤال بعدی/دیدن نتیجه». window.__r355b.
(() => {
  if (window.__r355b) return "already";
  window.__r355b = { fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const answers = ["explanation", "communication", "loaves", "candles"];
  let i = 0;
  let phase = "fill";
  const tick = () => {
    try {
      const st = window.__r355b;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*4/);
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
      window.__r355b.errs.push(String(e));
    }
  };
  window.__r355b.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
