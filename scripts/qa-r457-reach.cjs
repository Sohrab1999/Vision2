// r457 — reachability census: which study/ root files are reachable from src/app?
// Static scan of relative imports + @/ aliases; BFS from src/app entry files.
const fs = require("fs");
const path = require("path");

const ROOT = "/home/z/my-project/src";

function listFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, out);
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

// parse import specifiers from a ts/tsx file (static import/export-from/dynamic import)
function importsOf(file) {
  const text = fs.readFileSync(file, "utf8");
  const specs = [];
  const re = /(?:import|export)\s[\s\S]*?from\s*["']([^"'\n]+)["']|import\s*\(\s*["']([^"'\n]+)["']\s*\)|import\s*["']([^"'\n]+)["']/g;
  let m;
  while ((m = re.exec(text))) specs.push(m[1] || m[2] || m[3]);
  // css @import "...";
  if (file.endsWith(".css")) {
    for (const mm of text.matchAll(/@import\s+["']([^"']+)["']/g)) specs.push(mm[1]);
  }
  return specs;
}

function resolve(spec, fromFile) {
  let base = null;
  if (spec.startsWith("@/")) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith("./") || spec.startsWith("../")) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // package import
  const cands = [base, base + ".ts", base + ".tsx", base + ".css", path.join(base, "index.ts"), path.join(base, "index.tsx")];
  for (const c of cands) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  return null;
}

const all = listFiles(ROOT);
const allSet = new Set(all);
const entry = all.filter((f) => f.includes("/src/app/"));
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

const studyRoot = all.filter((f) => f.startsWith(path.join(ROOT, "components/study/")) && path.dirname(f) === path.join(ROOT, "components/study"));
const dead = studyRoot.filter((f) => !seen.has(f));
const live = studyRoot.filter((f) => seen.has(f));
console.log("STUDY-ROOT LIVE (" + live.length + "):");
live.forEach((f) => console.log("  LIVE  " + path.basename(f)));
console.log("STUDY-ROOT DEAD (" + dead.length + "):");
dead.forEach((f) => console.log("  DEAD  " + path.basename(f)));
// also report dead files in subdirs (old-generation stragglers)
const sub = all.filter((f) => f.startsWith(path.join(ROOT, "components/study/")) && path.dirname(f) !== path.join(ROOT, "components/study") && !seen.has(f));
console.log("STUDY-SUBDIR DEAD (" + sub.length + "):");
sub.forEach((f) => console.log("  DEAD  " + f.replace(ROOT + "/", "")));
