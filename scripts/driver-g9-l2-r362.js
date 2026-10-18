// r362 — درایورِ state-machine برای بانک ۲ گ۹ «تست واژگان» (۵۰ MCQ) — الگوی r360/r361
// درسِ r361: «دیدن نتیجه» هم باید در حلقهٔ پیشرفت دیده شود (سؤالِ آخر).
(() => {
  const KEY = (
    "a b b a d c c b a a " + "b b d a b d b c a c " + "a b a d c b b c a c " +
    "d d b a d c d a a b " + "b c a d d b d a d a"
  ).split(" ").filter(Boolean);
  window.__r362b2 = { ok: 0, miss: [], done: false, total: KEY.length, step: "start" };
  if (KEY.length !== 50) { window.__r362b2.step = "bad-key"; window.__r362b2.done = true; return; }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const counterN = () => {
    const txts = [...document.querySelectorAll("main *")].filter((e) => e.children.length === 0).map((e) => e.textContent.trim());
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
    for (let q = 1; q <= 50; q++) {
      window.__r362b2.step = "wait-q" + q;
      let btns = null, guard = 0;
      while (guard++ < 50) {
        if (counterN() === q && liveBtns().length === 4) { btns = liveBtns(); break; }
        await sleep(120);
      }
      if (!btns) { window.__r362b2.miss.push(q + "-no-btns"); continue; }
      const target = btns.find((b) => (b.firstChild?.textContent || "").trim() === KEY[q - 1]);
      if (!target) { window.__r362b2.miss.push(q + "-no-letter"); continue; }
      target.click();
      window.__r362b2.ok++;
      await sleep(150);
      for (let w = 0; w < 40; w++) {
        if (counterN() === q + 1) break;
        const nxt = [...document.querySelectorAll("button")].find(
          (b) => !b.disabled && ((b.textContent || "").includes("سؤال بعدی") || (b.textContent || "").includes("دیدن نتیجه")));
        if (nxt) { nxt.click(); await sleep(120); } else await sleep(120);
      }
    }
    let g2 = 0;
    while (g2++ < 60) {
      if ((document.body.textContent || "").includes("قهرمان")) break;
      await sleep(300);
    }
    window.__r362b2.step = "end-q" + (counterN() ?? "?");
    window.__r362b2.done = true;
  })();
})();