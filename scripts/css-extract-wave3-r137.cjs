#!/usr/bin/env node
/* Task 137 — §8.3 wave 3: the official-report A4 paper family leaves
   globals.css. Two verbatim block-level moves (the wave-1/2 protocol):
     1. the r27 band (or-* painters + the .dark token re-lights) + the
        task-124 teacher-judgment colors  → reports/official-report.css
     2. the r14 report-month dark cluster → reports/report-card.css
   The PRINT band (body.print-official, !important) STAYS in globals.css —
   the wave-1 protocol keeps print global so it wins regardless of order.
   Tombstones at the cut sites, manifest line in features.css, freshness
   assertions (death of removed rules + single copy in the new homes). */
const fs = require("fs");
const path = require("path");
const root = "/home/z/my-project";
const gPath = path.join(root, "src/app/globals.css");
const fPath = path.join(root, "src/app/features.css");
const orPath = path.join(root, "src/components/study/reports/official-report.css");
const rcPath = path.join(root, "src/components/study/reports/report-card.css");

let g = fs.readFileSync(gPath, "utf8");
const gLines = g.split("\n");

// ---------- cut 1: r27 + task-124 band ----------
const hIdx = gLines.findIndex((l) => l.startsWith("/* r27 — official printable progress report"));
if (hIdx < 0) throw new Error("r27 header not found");
const sep = gLines[hIdx - 1];
if (!/^\s*\/\* -+ \*\/\s*$/.test(sep)) throw new Error("separator line above r27 not found: " + JSON.stringify(sep));
const bandStart = hIdx - 1;
const printIdx = gLines.findIndex((l) => l.startsWith("/* ---------------- print stylesheet for the official report"));
if (printIdx < 0) throw new Error("print marker not found");
let bandEnd = printIdx - 1; // exclusive; trim trailing blanks
while (gLines[bandEnd - 1].trim() === "") bandEnd--;
const band = gLines.slice(bandStart, bandEnd).join("\n");
if (!band.includes(".official-overlay {") || !band.includes(".or-chip-offline {")) throw new Error("band content unexpected");
if (band.includes("body.print-official")) throw new Error("print band must NOT move");

// ---------- cut 2: report-month cluster ----------
const mIdx = gLines.findIndex((l) => l.trim() === "/* monthly report band */");
if (mIdx < 0) throw new Error("report-month comment not found");
const eIdx = gLines.findIndex((l) => l.startsWith('.dark .report-month [class*="bg-stone-200"]'));
if (eIdx < 0 || eIdx < mIdx) throw new Error("report-month end not found");
const cluster = gLines.slice(mIdx, eIdx + 1).join("\n");
if (cluster.split("\n").length !== 8) throw new Error("cluster line count unexpected: " + cluster.split("\n").length);

// ---------- r14 header line retune ----------
const r14Idx = gLines.findIndex((l) => l.includes("r14 — SRS donut, dictionary state filter, monthly report band"));
if (r14Idx < 0) throw new Error("r14 header not found");
gLines[r14Idx] = "/* r14 — SRS donut + dictionary state filter (report-month: wave 3)  */";

// ---------- splice tombstones ----------
gLines.splice(bandStart, bandEnd - bandStart,
  "/* §8.3 wave 3 (task 137): the A4 paper family — the r27 band and the",
  "   task-124 teacher-judgment colors — moved verbatim beside its owner:",
  "   src/components/study/reports/official-report.css (manifest:",
  "   src/app/features.css). The print band below stays global — it wins via",
  "   !important regardless of order (the wave-1 protocol). */");
const mIdx2 = gLines.findIndex((l) => l.trim() === "/* monthly report band */");
if (mIdx2 < 0) throw new Error("report-month comment not found after splice 1");
const eIdx2 = gLines.findIndex((l) => l.startsWith('.dark .report-month [class*="bg-stone-200"]'));
gLines.splice(mIdx2, eIdx2 - mIdx2 + 1,
  "/* report-month moved beside its owner (§8.3 wave 3, task 137):",
  "   reports/report-card.css */");
g = gLines.join("\n");

// ---------- safety: no remaining painters of the moved selectors ----------
const painterRe = /^\s*\.(dark\s+)?(official-overlay|official-report|official-chrome|or-[a-z-]+|report-month)\b/m;
const leftovers = g.split("\n").filter((l) => painterRe.test(l) && !l.trim().startsWith("/*") && !l.trim().startsWith("*") && !l.trim().startsWith("//"));
if (leftovers.length > 0) throw new Error("globals still paints moved selectors:\n" + leftovers.join("\n"));
// the print band must survive untouched
for (const keep of ["body.print-official .or-table tr", "@page { size: A4; margin: 9mm; }", "body.print-official .official-overlay {"]) {
  if (!g.includes(keep)) throw new Error("print band lost: " + keep);
}

// ---------- write globals ----------
fs.writeFileSync(gPath, g);

// ---------- official-report.css ----------
if (fs.existsSync(orPath)) throw new Error("official-report.css already exists");
const orCss = `/* Official printable progress report — کاغذ A4 (always-light paper) —
   extracted from src/app/globals.css (§8.3 per-feature extraction, wave 3 —
   task 137): the r27 or-* band + the task-124 teacher-judgment colors,
   verbatim. Always loaded via the src/app/features.css manifest; cascade
   isolation by construction — the wave-3 scan found zero equal-specificity
   competitors for the or-* painters anywhere in globals, the .dark token
   re-lights win on specificity (custom props), and the PRINT band stays in
   globals.css winning via !important regardless of order (wave-1 protocol).
   Owner: reports/official-report.tsx (+ the weekly teacher A4 card).
   The or-* classes stay theme-immune by design — dark mode must never
   reach the printed paper. */

${band}
`;
fs.writeFileSync(orPath, orCss);

// ---------- report-card.css append ----------
let rc = fs.readFileSync(rcPath, "utf8");
if (rc.includes(".report-month")) throw new Error("report-card.css already carries report-month");
rc = rc.trimEnd() + `

/* ---------------- monthly report band (§8.3 wave 3 — task 137) ----------------
   Verbatim from the r14 band of globals.css — owner: reports/report-card.tsx
   (the monthly block renders inside the report dialog). */
${cluster}
`;
fs.writeFileSync(rcPath, rc);

// ---------- manifest ----------
let f = fs.readFileSync(fPath, "utf8");
if (!f.includes('reports/report-card.css"')) throw new Error("manifest anchor missing");
f = f.replace('@import "../components/study/reports/report-card.css";',
  '@import "../components/study/reports/report-card.css";\n@import "../components/study/reports/official-report.css";');
fs.writeFileSync(fPath, f);

// ---------- freshness assertions ----------
const g2 = fs.readFileSync(gPath, "utf8");
const or2 = fs.readFileSync(orPath, "utf8");
const rc2 = fs.readFileSync(rcPath, "utf8");
const f2 = fs.readFileSync(fPath, "utf8");
// line-START matching (\n prefix): the surviving PRINT band legitimately
// references some selectors as body.print-official DESCENDANTS — a bare
// substring check would false-positive on those (e.g. body.print-official
// .official-overlay { stays in globals by design).
const goneFromGlobals = ["\n.official-overlay {", "\n.or-band {", "\n.or-stamp {", "\n.or-kpi {", "\n.or-table th {", "\n.or-teacher {", "\n.or-chip-fresh {", "\n.dark .report-month {", "--color-emerald-100: #d0fae5"];
for (const s of goneFromGlobals) {
  if (g2.includes(s)) throw new Error("globals still carries moved rule: " + JSON.stringify(s));
}
const inOr = [".official-overlay { background-color: rgb(12 10 9 / 0.68); }", ".dark .official-report {\n  --color-stone-50: #fafaf9;", ".or-table th { background-color: #f5f5f4;", ".or-teacher { background-color: #faf5ff;", ".or-chip-fresh {"];
for (const s of inOr) {
  const n = or2.split(s).length - 1;
  if (n !== 1) throw new Error(`official-report.css expected exactly 1 of [${s}], got ${n}`);
}
if ((rc2.match(/\.dark \.report-month \{/g) || []).length !== 1) throw new Error("report-card.css report-month count wrong");
if (!f2.includes('@import "../components/study/reports/official-report.css";')) throw new Error("manifest line missing");
console.log("WAVE3-OK | globals", g.split("\n").length, "lines | or-css", orCss.split("\n").length, "lines | moved band", band.split("\n").length, "lines | cluster", cluster.split("\n").length, "lines");
