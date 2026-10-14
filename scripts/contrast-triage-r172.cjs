#!/usr/bin/env node
/* Task 172 — triage the raw live-audit JSONs from /tmp/r172/*.json
 * Dedupes by (cls, t), merges views, prints a sorted table grouped by
 * suspected root cause class. */
const fs = require("fs");
const files = fs.readdirSync("/tmp/r172").filter((f) => f.endsWith(".json"));
const rows = [];
for (const f of files) {
  const view = f.replace(".json", "");
  const raw = JSON.parse(fs.readFileSync(`/tmp/r172/${f}`, "utf8"));
  const data = JSON.parse(raw); // agent-browser returns a JSON-encoded string
  for (const v of data.v || []) rows.push({ view, ...v });
}
/* dedupe on cls+t (same element across views) */
const seen = new Map();
for (const r of rows) {
  const k = `${r.cls}|${r.t}|${r.r}`;
  if (!seen.has(k)) seen.set(k, { ...r, views: [r.view] });
  else seen.get(k).views.push(r.view);
}
const uniq = [...seen.values()].sort((a, b) => a.r - b.r || a.fs - b.fs);
console.log(`raw=${rows.length} uniq=${uniq.length}`);
console.log("r    fs  g tag   cls(first70)                                      text              views");
for (const u of uniq) {
  const cls = (u.cls || "").padEnd(48).slice(0, 48);
  const t = (u.t || "").padEnd(16).slice(0, 16);
  console.log(`${String(u.r).padStart(5)} ${String(u.fs).padStart(3)} ${u.g} ${u.tag.padEnd(5)} ${cls} ${t} [${[...new Set(u.views)].join(",")}]`);
}
