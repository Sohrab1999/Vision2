// r359 — درایورِ تایپیِ بانکِ ۷۹ (تشریحی جامع د۳ — کلمات ناقص ص۱۰۹) — ۴ سؤال با کلیدِ چاپیِ ص۲۰۱
// حالت-ماشین (الگوی r358): پرکردنِ input با accepted → «بررسی پاسخ» → «سؤال بعدی/دیدن نتیجه». window.__r359a.
(() => {
  if (window.__r359a) return "already";
  window.__r359a = { fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const answers = ["diversity", "pottery", "imagination", "reflects"];
  let i = 0;
  let phase = "fill";
  const tick = () => {
    try {
      const st = window.__r359a;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*4(?!\d)/);
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
      window.__r359a.errs.push(String(e));
    }
  };
  window.__r359a.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
