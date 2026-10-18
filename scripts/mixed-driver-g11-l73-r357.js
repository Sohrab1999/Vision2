// r357 — درایورِ ترکیبیِ بانکِ ۷۳ (جامع تشریحی د۲ — درک مطلبِ تغذیه ص۷۶-۷۷) — ۶ سؤال
// ۴ درست/نادرست (کلیدِ چاپی: true,false,true,false) + ۲ تایپی (کلیدِ عینِ گذرنامه).
// حالت-ماشین: فازِ T/F با کلیکِ دکمهٔ True/False، فازِ تایپ با پرکردنِ input. window.__r357c.
(() => {
  if (window.__r357c) return "already";
  window.__r357c = { clicks: 0, fills: 0, nexts: 0, done: false, errs: [], log: [] };
  const tf = [true, false, true, false];
  const typed = [
    "Grains give carbohydrates and some vitamins and minerals.",
    "It is a chart that can be used to see how many servings of each food should be eaten each day.",
  ];
  let i = 0;
  let phase = "answer";
  const tick = () => {
    try {
      const st = window.__r357c;
      const main = document.querySelector("main");
      if (!main) return;
      const mt = main.textContent;
      const m = mt.match(/(\d+)\s*\/\s*6/);
      if (!m) return;
      const cur = parseInt(m[1], 10);
      if (cur - 1 !== i) { phase = "answer"; return; }
      if (/پاسخ درست|✓|✗/.test(mt)) { /* در فازِ advance می‌رویم */ }
      if (phase === "answer") {
        if (i < 4) {
          if (/پاسخ درست|✓|✗/.test(mt)) return;
          const want = tf[i] ? "True" : "False";
          const btn = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.replace(/^[a-d]\s*/, "").trim() === want);
          if (!btn) return;
          btn.click();
          st.clicks++;
          st.log.push("q" + cur + ":" + want.toLowerCase());
          phase = "advance";
        } else {
          if (/پاسخ درست|✓|✗/.test(mt)) return;
          const inp = main.querySelector("input, textarea");
          const check = Array.from(main.querySelectorAll("button")).find((b) => b.textContent.includes("بررسی پاسخ"));
          if (!inp || !check) return;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(inp, typed[i - 4]);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
          st.fills++;
          st.log.push("q" + cur + ":typed" + (i - 3));
          check.click();
          phase = "advance";
        }
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
      window.__r357c.errs.push(String(e));
    }
  };
  window.__r357c.iv = setInterval(tick, 300);
  tick();
  return "started";
})()
