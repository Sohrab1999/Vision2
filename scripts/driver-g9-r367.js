// r367 — درایورِ دو بانکِ تازهٔ «سؤالات امتحانی درس چهارم»:
//  بانک ۲۹ (س۵ دیکتهٔ ناقص — ۳ تایپی): ق۱ غلطِ عمدی = تایپِ عبارتِ هم‌بانک
//   («information desk» — تطابقِ دقیق با داربست/گزینهٔ دوم → باید غلط ثبت شود)؛ ق۲/ق۳ درست
//  بانک ۳۴ (س۱۰ وصل‌کردنی — ۶ MCQ با هفت گزینهٔ مشترکِ چاپی a-g — نخستین هفت‌گزینه‌ایِ کارت):
//   همهٔ شش پاسخ درست (b,e,g,c,a,d) → قهرمان
(() => {
  window.__r367 = { b29: { ok: 0, miss: [], done: false }, b34: { ok: 0, miss: [], done: false }, phase: "b29" };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
    const joined = txts.join("|");
    let m = joined.match(/(?:^|\|)(\d{1,2})\| \/ \|(\d{1,2})(?:\||$)/);
    if (m) return +m[1];
    m = joined.match(/(?:^|\|)(\d{1,2}) \/ (\d{1,2})(?:\||$)/);
    return m ? +m[1] : null;
  };
  const liveBtns = () => [...document.querySelectorAll("button")].filter(
    (b) => !b.disabled && /^[abcdefg]$/.test((b.firstChild?.textContent || "").trim()) && (b.textContent || "").trim().length > 1
  );
  const openBank = async (needle) => {
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes(needle));
      if (b) { b.click(); return true; }
      await sleep(200);
    }
    return false;
  };
  const goBack = async () => {
    for (let w = 0; w < 30; w++) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("بازگشت"));
      if (b) { b.click(); return true; }
      await sleep(200);
    }
    return false;
  };

  (async () => {
    // ——— بانک ۲۹: تایپیِ دیکتهٔ ناقص ———
    window.__r367.phase = "b29-open";
    await openBank("دیکتهٔ ناقص");
    await sleep(1500);
    const KEY29 = ["information desk", "information desk", "help charity"]; // ق۱ غلطِ عمدی
    for (let q = 1; q <= 3; q++) {
      window.__r367.phase = "b29-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        const n = counterN();
        const inp = document.querySelector("input[data-quiz-typed-input]");
        if (n === q && inp && !inp.disabled) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r367.b29.miss.push(q + "-no-q"); continue; }
      const inp = document.querySelector("input[data-quiz-typed-input]");
      const sub = document.querySelector("button[data-quiz-typed-submit]");
      if (!inp || !sub) { window.__r367.b29.miss.push(q + "-no-input"); continue; }
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      setter.call(inp, KEY29[q - 1]);
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      await sleep(120);
      sub.click();
      await sleep(250);
      if (q !== 1) window.__r367.b29.ok++;      // ق۱ غلطِ عمدی — شمرده نمی‌شود
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g1 = 0;
    while (g1++ < 50) {
      const t = document.body.textContent || "";
      if (t.includes("کارنامه") || t.includes("از ۳")) break;
      await sleep(300);
    }
    const t29 = document.body.textContent || "";
    window.__r367.b29.q1wrong = t29.includes("پاسخ درست");
    window.__r367.b29.done = true;

    // ——— بانک ۳۴: MCQ هفت‌گزینه‌ای ———
    await goBack();
    await sleep(1500);
    window.__r367.phase = "b34-open";
    await openBank("وصل‌کردنیِ ستون‌ها");
    await sleep(1500);
    const KEY34 = ["b", "e", "g", "c", "a", "d"]; // Amaini/fire fighter/puts out/at station/on shifts/there's one
    for (let q = 1; q <= 6; q++) {
      window.__r367.phase = "b34-q" + q;
      let guard = 0;
      while (guard++ < 60) {
        if (counterN() === q && liveBtns().length === 7) break;
        await sleep(120);
      }
      if (counterN() !== q) { window.__r367.b34.miss.push(q + "-no-q"); continue; }
      const target = liveBtns().find((b) => (b.firstChild?.textContent || "").trim() === KEY34[q - 1]);
      if (!target) { window.__r367.b34.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r367.b34.ok++;
      await sleep(200);
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g2 = 0;
    while (g2++ < 50) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r367.b34.champion = (document.body.textContent || "").includes("قهرمان");
    window.__r367.b34.done = true;
    window.__r367.phase = "done";
  })();
})();
