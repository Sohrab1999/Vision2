// r358 — درایورِ تایپیِ بانکِ ۷۷ (تشریحی گرامر د۳ — جمله‌سازیِ شرطی ص۱۰۲) — ۱۰ سؤال با کلیدِ چاپیِ ص۱۹۶-۱۹۷
// ساقه‌ها کلماتِ به‌هم‌ریخته‌اند؛ پاسخ = جملهٔ کاملِ کلیدِ چاپی. window.__r358c.
(() => {
  if (window.__r358c) return "already";
  window.__r358c = { fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const answers = [
    "Will you buy this car if they fix it?",
    "I will make a sandwich if I am hungry.",
    "If you don’t practice, you won’t improve.",
    "We will go swimming if the sun comes out.",
    "Will you stay at home if it rains tomorrow?",
    "If he doesn’t go now, he may miss the plane.",
    "Can you buy a pencil if you have 3000 tomans?",
    "If you take more exercise, you may feel better.",
    "I will watch television if I finish my homework soon.",
    "If they play computer games all night, they will be tired tomorrow.",
  ];
  let i = 0;
  let phase = "fill";
  const tick = () => {
    try {
      const st = window.__r358c;
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
        st.log.push("q" + cur + ":ok");
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
      window.__r358c.errs.push(String(e));
    }
  };
  window.__r358c.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
