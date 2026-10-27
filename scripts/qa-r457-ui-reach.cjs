// r457 — ui/ primitives reachability: which are imported from app code?
const fs = require("fs");
const path = require("path");
const SRC = "/home/z/my-project/src";
const UI = path.join(SRC, "components/ui");

function listFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}
function importsOf(file) {
  const text = fs.readFileSync(file, "utf8");
  const specs = [];
  const re = /(?:import|export)\s[\s\S]*?from\s*["']([^"'\n]+)["']|import\s*\(\s*["']([^"'\n]+)["']\s*\)/g;
  let m;
  while ((m = re.exec(text))) specs.push(m[1] || m[2]);
  return specs;
}
function resolve(spec, fromFile) {
  let base = null;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const c of [base, base + ".ts", base + ".tsx", base + ".css", path.join(base, "index.ts"), path.join(base, "index.tsx")])
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}
const all = listFiles(SRC);
const allSet = new Set(all);
const entry = all.filter((f) => f.includes(`${SRC}/app/`));
const seen = new Set();
const queue = [...entry];
while (queue.length) {
  const f = queue.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  for (const spec of importsOf(f)) {
    const r = resolve(spec, f);
    if (r && allSet.has(r) && !seen.has(r)) queue.push(r);
  }
}
const uiFiles = all.filter((f) => f.startsWith(UI));
const live = uiFiles.filter((f) => seen.has(f));
const dead = uiFiles.filter((f) => !seen.has(f));
console.log("UI LIVE (" + live.length + "):");
live.forEach((f) => console.log("  " + path.basename(f)));
console.log("UI DEAD (" + dead.length + "):");
dead.forEach((f) => console.log("  " + path.basename(f)));
