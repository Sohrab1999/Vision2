// Task 188 — unslop plan P4 executor: sweep `transition-all` -> scoped
// transitions per plans/unslop.md's mapping table. Deterministic classifier:
//   colors-only effects            -> transition-colors
//   colors + scale/translate       -> transition-[background-color,color,border-color,transform]
//   + shadow / ring (ring IS a box-shadow in tailwind) -> ... ,box-shadow ...
//   opacity / fill / stroke detected -> appended to the list
//   no indicators in a /ui/ stock component (data-state) -> transition-[transform,background-color,border-color,color]
//   unsure anywhere else            -> safe superset (still excludes layout props)
// Duration/easing untouched (P6 owns outliers); keyframes untouched.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

const ROOT = "/home/z/my-project/src";
const files = walk(ROOT);
const hist = {};
const report = [];
let total = 0;

for (const f of files) {
  const text = readFileSync(f, "utf8");
  if (!text.includes("transition-all")) continue;
  const lines = text.split("\n");
  let changed = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("transition-all")) continue;
    // sibling window for template-literal classNames spread over lines
    const win = lines.slice(Math.max(0, i - 3), i + 4).join(" ");
    const hasTransform = /scale|translate/.test(win);
    const hasShadow = /shadow/.test(win);
    const hasRing = /ring-/.test(win); // tailwind ring = box-shadow
    const hasOpacity = /opacity/.test(win);
    const hasFillStroke = /\bfill-|\bstroke-/.test(win);
    const hasColorFx = /(?:hover|active|focus|group-hover|group-active|data-\[[^\]]+\]):(?:bg|text|border|fill|stroke|decoration)-/.test(win);
    let cls;
    if (!hasTransform && !hasShadow && !hasRing && !hasOpacity && !hasFillStroke) {
      if (hasColorFx) cls = "transition-colors"; // plan row 1
      else if (f.includes("/ui/")) cls = "transition-[transform,background-color,border-color,color]"; // plan row 4 (stock data-state)
      else cls = "transition-[background-color,color,border-color,box-shadow,transform]"; // unsure -> safe superset
    } else {
      const props = ["background-color", "color", "border-color"];
      if (hasShadow || hasRing) props.push("box-shadow");
      if (hasTransform) props.push("transform");
      if (hasOpacity) props.push("opacity");
      if (hasFillStroke) props.push("fill", "stroke");
      cls = `transition-[${props.join(",")}]`;
    }
    lines[i] = lines[i].replaceAll("transition-all", cls);
    hist[cls] = (hist[cls] || 0) + 1;
    changed++;
    total++;
  }
  if (changed) {
    writeFileSync(f, lines.join("\n"));
    report.push(`${f.replace(ROOT + "/", "")}: ${changed}`);
  }
}

console.log("TOTAL replaced:", total);
console.log("histogram:", JSON.stringify(hist, null, 1));
console.log(report.join("\n"));
