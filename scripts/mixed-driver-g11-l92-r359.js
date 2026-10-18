// r359 — درایورِ ترکیبیِ بانکِ ۹۲ (تشریحی جامع د۳ — درک مطلبِ عکاسی ص۱۱۱) — ۶ سؤال (۴ درست/نادرست + ۲ تایپی)
// کلیدِ چاپیِ ص۲۰۲: true,true,false,false + دو جملهٔ کلیدیِ verbatim.
// حالت-ماشینِ دوراهی: اگر input دید → تایپ؛ وگرنه گزینهٔ True/False را کلیک کند. window.__r359c.
(() => {
  if (window.__r359c) return "already";
  window.__r359c = { clicks: 0, fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const TF = ["True", "True", "False", "False"];
  const typed = [
    "A photographer takes photographs, especially as a job.",
    "The amount of time the shutter stays open for is called the shutter speed.",
  ];
  let i = 0;
  let phase = "answer";
  const tick = () => {
    try {
      const st = window.__r359c;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*6(?!\d)/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; }
      if (phase === "answer") {
        if (/پاسخ درست|✓|✗/.test(mt)) return;
        const inp = main.querySelector("input, textarea");
        const check = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("بررسی پاسخ"));
        if (inp && check) {
          const ans = typed[i - 4];
          if (!ans) { st.errs.push("no-typed-ans@" + i); return; }
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(inp, ans);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          st.fills++;
          st.log.push("q" + cur + ":typed");
          check.click();
          phase = "advance";
          return;
        }
        const want = TF[i];
        if (!want) { st.errs.push("no-tf-ans@" + i); return; }
        const target = Array.from(main.querySelectorAll("button")).find((b) => {
          const t = b.textContent.trim().replace(/^[a-d]\s*/, "");
          return t === want;
        });
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
      if (i >= 6 && /قهرمان|نتیجه/.test(document.body.textContent)) {
        clearInterval(st.iv);
        st.done = true;
      }
    } catch (e) {
      window.__r359c.errs.push(String(e));
    }
  };
  window.__r359c.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
