// r189 — unslop F10 codemod: swap raw hex literals in canvas/SVG painters
// for the shared `uiColors` module (src/lib/ui-colors.ts). Idempotent from a
// zero-hex state; verifies zero leftovers, exits 1 otherwise.
import fs from "node:fs";

const MAP = {
  "#ffffff": "uiColors.white",
  "#f5f5f4": "uiColors.stone[100]",
  "#e7e5e4": "uiColors.stone[200]",
  "#d6d3d1": "uiColors.stone[300]",
  "#a8a29e": "uiColors.stone[400]",
  "#78716c": "uiColors.stone[500]",
  "#1c1917": "uiColors.stone[900]",
  "#10b981": "uiColors.emerald[500]",
  "#059669": "uiColors.emerald[600]",
  "#047857": "uiColors.emerald[700]",
  "#064e3b": "uiColors.emerald[900]",
  "#f0fdf4": "uiColors.green[50]",
  "#fffbeb": "uiColors.amber[50]",
  "#fbbf24": "uiColors.amber[400]",
  "#f59e0b": "uiColors.amber[500]",
  "#d97706": "uiColors.amber[600]",
  "#b45309": "uiColors.amber[700]",
  "#92400e": "uiColors.amber[800]",
  "#78350f": "uiColors.amber[900]",
  "#f43f5e": "uiColors.rose[500]",
  "#e11d48": "uiColors.rose[600]",
  "#ef4444": "uiColors.red[500]",
  "#f97316": "uiColors.orange[500]",
  "#ea580c": "uiColors.orange[600]",
  "#fdf4ff": "uiColors.fuchsia[50]",
  "#d946ef": "uiColors.fuchsia[500]",
  "#c026d3": "uiColors.fuchsia[600]",
  "#a21caf": "uiColors.fuchsia[700]",
  "#8b5cf6": "uiColors.violet[500]",
  "#7c3aed": "uiColors.violet[600]",
  "#14b8a6": "uiColors.teal[500]",
  "#0d9488": "uiColors.teal[600]",
  "#db2777": "uiColors.pink[600]",
  "#0891b2": "uiColors.cyan[600]",
  "#4d7c0f": "uiColors.lime[700]",
};

// file → import specifier (lib siblings use relative, components use alias)
const FILES = {
  "src/lib/result-image.ts": "./ui-colors",
  "src/lib/skill-stats.ts": "./ui-colors",
  "src/components/study/practice/vocab-donut.tsx": "@/lib/ui-colors",
  "src/components/study/shared/confetti.tsx": "@/lib/ui-colors",
  "src/components/study/practice/daily-quests.tsx": "@/lib/ui-colors",
  "src/components/study/practice/progress-ring.tsx": "@/lib/ui-colors",
  "src/components/study/practice/srs-panel.tsx": "@/lib/ui-colors",
  "src/components/study/lesson/lesson-view.tsx": "@/lib/ui-colors",
  "src/components/study/home/home-bookshelf.tsx": "@/lib/ui-colors",
};

let totalReplaced = 0;
const report = [];

for (const [file, specifier] of Object.entries(FILES)) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  let count = 0;

  // pass 1 — JSX attributes: attr="#hex"  ->  attr={ident}
  for (const [hex, ident] of Object.entries(MAP)) {
    const re = new RegExp(`(\\w[\\w-]*)="${hex}"`, "g");
    src = src.replace(re, (_m, attr) => {
      count++;
      return `${attr}={${ident}}`;
    });
  }

  // pass 2 — standalone quoted strings: "#hex" / '#hex'  ->  ident
  for (const [hex, ident] of Object.entries(MAP)) {
    const re = new RegExp(`(['"])${hex}\\1`, "g");
    src = src.replace(re, () => {
      count++;
      return ident;
    });
  }

  // leftovers must be zero (hexes outside the map are a mapping gap — abort)
  const leftovers = src.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  if (leftovers.length > 0) {
    console.error(`${file}: ${leftovers.length} unmapped hex(es) remain: ${[...new Set(leftovers)].join(", ")}`);
    process.exit(1);
  }

  // import insertion — after the last existing top-level import line
  if (!src.includes("ui-colors") && count > 0) {
    const lines = src.split("\n");
    let lastImport = -1;
    for (let i = 0; i < Math.min(lines.length, 60); i++) {
      if (/^import /.test(lines[i])) lastImport = i;
    }
    let insertAfter = lastImport;
    if (insertAfter === -1) {
      // no import block — insert right after the "use client" directive
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        if (/^"use client"/.test(lines[i])) { insertAfter = i; break; }
      }
    }
    if (insertAfter === -1) {
      console.error(`${file}: no import block or "use client" directive found`);
      process.exit(1);
    }
    lines.splice(insertAfter + 1, 0, `import { uiColors } from "${specifier}";`);
    src = lines.join("\n");
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    report.push(`${file}: ${count} swap(s)`);
    totalReplaced += count;
  } else {
    report.push(`${file}: already clean (0 swaps)`);
  }
}

console.log(report.join("\n"));
console.log(`TOTAL: ${totalReplaced} hex literal(s) -> uiColors`);
