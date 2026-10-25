// Task 87 — bisect why tailwindcss 4.1.18 drops the c-veil @utility blocks
const postcss = require("postcss");
const tw = require("@tailwindcss/postcss");

const CASES = {
  full: `@utility c-veil-60 {
  background-color: color-mix(in oklab, #fff 60%, transparent);
  &:is(.dark *) {
    background-color: rgba(28, 25, 23, 0.6);
  }
}
@utility c-veil-70 {
  background-color: color-mix(in oklab, #fff 70%, transparent);
  &:is(.dark *) {
    background-color: rgba(28, 25, 23, 0.7);
  }
}`,
  literalAlpha: `@utility c-veil-60 {
  background-color: rgb(255 255 255 / 0.6);
  &:is(.dark *) {
    background-color: rgba(28, 25, 23, 0.6);
  }
}`,
  noNest: `@utility c-veil-60 {
  background-color: color-mix(in oklab, #fff 60%, transparent);
}`,
};

(async () => {
  for (const [name, css] of Object.entries(CASES)) {
    const input = `@import "tailwindcss" prefetch;\n${css}\n`;
    try {
      const result = await postcss([tw({ base: process.cwd() })]).process(input, {
        from: "src/app/globals.css",
      });
      const out = result.css;
      console.log(name, "OK", JSON.stringify({
        veilDef: out.includes(".c-veil-60"),
        colorMix: out.includes("color-mix"),
        len: out.length,
      }));
    } catch (e) {
      console.log(name, "THREW:", String(e.message).slice(0, 200));
    }
  }
  // and the real globals.css end-to-end
  try {
    const fs = require("fs");
    const real = fs.readFileSync("src/app/globals.css", "utf8");
    const result = await postcss([tw({ base: process.cwd() })]).process(real, {
      from: "src/app/globals.css",
    });
    console.log("globals.css", "OK", JSON.stringify({ veil: result.css.includes("c-veil-60") }));
  } catch (e) {
    console.log("globals.css THREW:", String(e.message).slice(0, 300));
  }
})();
