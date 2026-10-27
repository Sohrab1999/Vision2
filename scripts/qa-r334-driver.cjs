#!/usr/bin/env node
// r334 — درایورِ MCQِ بانک ۳۰ (Q2-20) — الگوی r332: کلیدهای ۱-۴ + eval-polling همگام
// (اسکریپت از صفر نوشته شد — درسِ r333: هرگز درایورِ راندِ قبل را منتشر نکن)
const { execSync } = require("node:child_process");

const KEYS = [2, 2, 1, 2, 2, 3, 1, 2, 3, 3, 1, 4, 2, 4, 3, 1, 4, 4, 2]; // Q2..Q20 (1-based digits)
const ab = (args) => execSync(`agent-browser ${args}`, { encoding: "utf8" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pollText = () => {
  try {
    const out = ab(`eval "document.body.innerText"`);
    const v = JSON.parse(out);
    return typeof v === "string" ? v : (v.result ?? String(v));
  } catch {
    return "";
  }
};

(async () => {
  let ok = 0;
  for (let i = 0; i < KEYS.length; i++) {
    const qn = i + 2; // Q2..Q20
    // ۱) همگام: صبر تا «qn / 20»
    let synced = false;
    for (let t = 0; t < 40 && !synced; t++) {
      if (pollText().includes(`${qn} / 20`)) synced = true;
      else await sleep(250);
    }
    if (!synced) {
      console.error(`Q${qn}: SYNC FAIL — abort`);
      process.exit(1);
    }
    // ۲) کلیدِ رقم
    ab(`press ${KEYS[i]}`);
    await sleep(900);
    // ۳) Enter برای گذار (با retry)
    ab(`press Enter`);
    await sleep(1200);
    const txt = pollText();
    if (!txt.includes(`${qn + 1} / 20`) && qn < 20) {
      ab(`press Enter`);
      await sleep(900);
    }
    ok++;
    console.log(`Q${qn}: key=${KEYS[i]} ✓`);
  }
  // ۴) صفحهٔ نتیجه
  for (let t = 0; t < 20; t++) {
    const txt = pollText();
    if (txt.includes("قهرمان") || txt.includes("درصد") || txt.includes("20 / 20") || /نتیجه|پایان/.test(txt)) {
      console.log("RESULT SCREEN REACHED");
      break;
    }
    await sleep(400);
  }
  const final = pollText();
  const m = final.match(/(\d+)\s*\/\s*20/g);
  console.log("progress markers:", m ? m.join(",") : "n/a");
  console.log(`done: ${ok}/19 steps executed`);
})();
