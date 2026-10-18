// r363 — درایورِ بانک ۳ گ۹ «تمرین مکالمه درس اول» (۱۱ آیتمِ تایپیِ دیالوگ)
// هدفِ دوگانه:
//  ۱) اثباتِ اصلاحِ باگِ تک‌گزینه‌ای: ق۱ با پاسخِ غلطِ عمدی → باید «غلط» ثبت شود
//     (پیش از اصلاح، هر ورودیِ غلطی به (answer+1)%1=0 نگاشت می‌شد و «درست» می‌گرفت)
//  ۲) واریانت‌های روادارِ accepted: آپاستروفِ راست (q3)، بی‌ویرگول+بازشدنِ مخفف (q5)، بازشدن (q10)
(() => {
  const RIGHT = [
    "Yes, I am",             // q1 (استفاده نمی‌شود — غلطِ عمدی)
    "Yes, he is",            // q2
    "No, she isn't",         // q3 — آپاستروفِ راست در برابرِ چاپِ خمیده isn’t
    "Yes, they are",         // q4
    "No they are not",       // q5 — بی‌ویرگول + بازشدنِ they’re not
    "He's very funny",       // q6
    "She's very kind and patient", // q7
    "He is quiet",           // q8
    "She is clever",         // q9
    "I am a bit serious",    // q10 — بازشدنِ I’m
    "They are very kind",    // q11
  ];
  const WRONG_Q1 = "No, I am not";
  window.__r363b3 = { ok: 0, miss: [], done: false, total: 11, step: "start", typedEcho: null };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
    const joined = txts.join("|");
    let m = joined.match(/(?:^|\|)(\d{1,2})\| \/ \|(\d{1,2})(?:\||$)/);
    if (m) return +m[1];
    m = joined.match(/(?:^|\|)(\d{1,2}) \/ (\d{1,2})(?:\||$)/);
    return m ? +m[1] : null;
  };

  (async () => {
    for (let q = 1; q <= 11; q++) {
      window.__r363b3.step = "wait-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        const inp = document.querySelector("input[data-quiz-typed-input]");
        if (n === q && inp && !inp.disabled) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r363b3.miss.push(q + "-no-q"); continue; }
      const inp = document.querySelector("input[data-quiz-typed-input]");
      const sub = document.querySelector("button[data-quiz-typed-submit]");
      if (!inp || !sub) { window.__r363b3.miss.push(q + "-no-input"); continue; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, q === 1 ? WRONG_Q1 : RIGHT[q - 1]);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      sub.click();
      await sleep(250);
      if (q === 1) { /* ق۱ باید غلط ثبت شود — شمارش نمی‌شود */ }
      else window.__r363b3.ok++;
      // پیشرفت: «سؤال بعدی» یا «دیدن نتیجه»
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g2 = 0;
    while (g2++ < 60) {
      const t = document.body.textContent || "";
      if (t.includes("قهرمان") || t.includes("از ۱۱") || t.includes("کارنامه")) break;
      await sleep(300);
    }
    window.__r363b3.step = "end-q" + (counterN() ?? "?");
    const t = document.body.textContent || "";
    window.__r363b3.champion = t.includes("قهرمان");
    window.__r363b3.score = (t.match(/(\d{1,2})\s*از\s*۱۱/) || [])[1] ?? null;
    const i = t.indexOf("پاسخ تایپیِ شما");
    window.__r363b3.typedEcho = i >= 0 ? t.slice(Math.max(0, i - 120), i + 200) : null;
    window.__r363b3.done = true;
  })();
})();
