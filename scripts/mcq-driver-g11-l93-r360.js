// r360 — درایورِ state-machine برای بانکِ ۹۴ (۷۰ MCQ) — درسِ r359: انتظارِ پیشرفتِ شماره‌ای
// جریان: کلیکِ گزینهٔ درست → حالتِ بازخورد (دکمه‌ها disabled، «سؤال بعدی» ظاهر) → پیشرفتِ خودکار
// درایور پس از هر کلیک تا ظاهر شدنِ شمارهٔ سؤال بعدی با دکمه‌های فعال صبر می‌کند؛ اگر «سؤال بعدی»
// ماند، خودش کلیکش می‌کند. پایان: صفحهٔ نتیجه («قهرمان»).
(() => {
  const KEY = "b b c b c b a b d d c a d d c d d b b a d a b d d b c c b b".split(" ");
  window.__r360 = { ok: 0, miss: [], done: false, total: KEY.length, step: "start" };
  if (KEY.length !== 30) { window.__r360.step = "bad-key"; window.__r360.done = true; return; }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter(e => e.children.length === 0).map(e => e.textContent.trim());
    const joined = txts.join("|");
    let m = joined.match(/(?:^|\|)(\d{1,2})\| \/ \|(\d{1,3})(?:\||$)/);
    if (m) return +m[1];
    m = joined.match(/(?:^|\|)(\d{1,2}) \/ (\d{1,3})(?:\||$)/);
    return m ? +m[1] : null;
  };
  const liveBtns = () => [...document.querySelectorAll("button")].filter(
    (b) => !b.disabled && /^[abcd]$/.test((b.firstChild?.textContent || "").trim()) && (b.textContent || "").trim().length > 1
  );

  (async () => {
    for (let q = 1; q <= 30; q++) {
      // ۱) صبر برای سؤالِ q با دکمه‌های فعال
      let btns = null, guard = 0;
      window.__r360.step = "wait-q" + q;
      while (guard++ < 50) {
        if (counterN() === q && liveBtns().length === 4) { btns = liveBtns(); break; }
        await sleep(120);
      }
      if (!btns) { window.__r360.miss.push(q + "-no-btns"); continue; }
      // ۲) کلیکِ گزینهٔ درست
      const target = btns.find((b) => (b.firstChild?.textContent || "").trim() === KEY[q - 1]);
      if (!target) { window.__r360.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r360.ok++;
      await sleep(150);
      // ۳) اگر «سؤال بعدی» ماند، کلیکش کن؛ وگرنه صبر برای پیشرفتِ خودکار
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1 || (q === 70 && null)) break;
        const nextBtn = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && (b.textContent || "").includes("سؤال بعدی"));
        if (nextBtn) { nextBtn.click(); await sleep(120); }
        else await sleep(120);
      }
    }
    // ۴) صبر برای صفحهٔ نتیجه
    let g2 = 0;
    while (g2++ < 60) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r360.step = "end-q" + (counterN() ?? "?");
    window.__r360.done = true;
  })();
})();
