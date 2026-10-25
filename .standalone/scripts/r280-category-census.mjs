// r280 — ground-truth category census: every distinct category in
// quizAttempt vs the feedLabel map (raw English leaking into the Persian
// feed is exactly what we hunt). Read-only.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const feedLabelSrc = await import("node:fs").then((fs) =>
  fs.readFileSync("src/components/study/home/home-constants.ts", "utf8")
);

// extract feedLabel keys from source between "export const feedLabel" and the closing brace
const block = feedLabelSrc.slice(
  feedLabelSrc.indexOf("export const feedLabel"),
  feedLabelSrc.indexOf("RecentAttempt")
);
const labelKeys = new Set();
for (const m of block.matchAll(/^\s+"?([a-zA-Z0-9:${}.-]+)"?:/gm)) {
  labelKeys.add(m[1].replace(/\$\{[^}]*\}/g, "*").trim());
}

const cats = await prisma.quizAttempt.groupBy({ by: ["category"], _count: { category: true } });
console.log("=== DB categories vs feedLabel coverage ===");
let missing = 0;
for (const c of cats.sort((a, b) => b._count.category - a._count.category)) {
  const covered =
    labelKeys.has(c.category) ||
    [...labelKeys].some((k) => k === "*" && /^dict-/.test(c.category)) ||
    (c.category.startsWith("final") && labelKeys.has("final*"));
  if (!covered) {
    missing++;
    console.log(`MISSING  ${c.category}  (rows: ${c._count.category})`);
  } else {
    console.log(`ok       ${c.category}  (rows: ${c._count.category})`);
  }
}
console.log(`--- ${missing} missing of ${cats.length} total distinct categories`);
await prisma.$disconnect();
