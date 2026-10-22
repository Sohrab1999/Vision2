// r326 — پارسرِ خروجیِ دیباگ — رشتهٔ JSON escapeشدهٔ agent-browser را باز میکند
"use strict";
const fs = require("fs");
const raw = fs.readFileSync("/tmp/r326-debug.txt", "utf8");
const lines = raw.split("\n");
let section = "";
let buf = [];
const results = [];
const flush = () => {
  if (!buf.length) return;
  const joined = buf.join("\n").trim();
  if (joined.startsWith('"')) {
    try {
      const s = JSON.parse(joined); // خودِ رشتهٔ JSON-stringified
      let arr = null;
      try { arr = JSON.parse(s); } catch (e) { /* inner parse */ }
      results.push([section, arr]);
    } catch (e) {
      results.push([section, null]);
    }
  }
  buf = [];
};
for (const ln of lines) {
  const sec = ln.match(/^#{5,}\s*(.+?)\s*#{5,}$/);
  if (sec) { flush(); section = sec[1]; continue; }
  if (ln.startsWith('"')) { flush(); buf = [ln]; }
  else if (buf.length) buf.push(ln);
}
flush();
for (const [sec, arr] of results) {
  if (!arr) { console.log("== " + sec + ": parse-fail"); continue; }
  console.log("== " + sec + "  (" + arr.length + " hits)");
  for (const h of arr) {
    const surf =
      h.chain.find((c) => c.bg && c.bg !== "rgba(0, 0, 0, 0)") ||
      h.chain.find((c) => c.bgi && c.bgi.length > 2) ||
      h.chain[0];
    console.log(
      `  "${h.text.slice(0, 30)}" ink=${(h.ink || "").slice(0, 46)} fs=${h.fs} fw=${h.fw} clip=${h.clip}`
    );
    console.log(
      `    top: ${h.chain
        .slice(0, 3)
        .map((c) => `${c.tag}[${(c.c || "").slice(0, 42)}]op${c.op}`)
        .join(" > ")}`
    );
    console.log(
      `    surf: ${surf.tag}[${(surf.c || "").slice(0, 58)}] bg=${(surf.bg || "").slice(0, 36)} bgi=${(surf.bgi || "").slice(0, 46)}`
    );
  }
}
