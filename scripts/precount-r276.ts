// سرشماریِ دومِ r276 — خطوطی که faNum دارند ولی interpolationِ دیگری
// در همان قالب ممکن است عددِ خام باشد؛ هر ${...} را جداگانه می‌کاویم.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "/home/z/my-project/src/components";
function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const ATTR_RE = /(aria-label|title|alt|placeholder|aria-description)=\{`([^`]*)`\}/g;
const INTERP_RE = /\$\{([^}]+)\}/g;

// شناسه‌هایی که قطعاً رشته/برند هستند نه عدد
const NON_NUMERIC_HINT = /(^|[^a-zA-Z])(fa|faNum|secFa|label|Label|title|Title|name|Name|en|code|roomCode|color|kind|scope|hint|id\.slice|SRS_LABELS|APPENDIX_SCOPE_LABELS|toLocaleDateString|percentFa|pctFa|toFixed|join\(|map\(|\?|&&|\|\||===|!==|\bisOpen|\.fa\b|lessonId|query|text|desc|msg)/;

const suspects: { f: string; line: number; attr: string; expr: string; tpl: string }[] = [];
for (const f of walk(root)) {
  const text = readFileSync(f, "utf8");
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(text))) {
    const [full, attr, tpl] = m;
    let ip;
    INTERP_RE.lastIndex = 0;
    while ((ip = INTERP_RE.exec(tpl))) {
      const expr = ip[1].trim();
      if (/faNum\(/.test(expr)) continue;
      // عددِ ریاضیِ خام: شناسهٔ ساده یا جمعِ ساده
      const rawNumeric = /^[a-zA-Z_][a-zA-Z0-9_.]*(\s*[+\-*/]\s*[^'"]+)?$/.test(expr) &&
        !NON_NUMERIC_HINT.test(expr);
      if (rawNumeric) {
        const line = text.slice(0, m.index).split("\n").length;
        suspects.push({ f: f.replace(root + "/", ""), line, attr, expr, tpl: tpl.slice(0, 60) });
      }
    }
  }
}
console.log(JSON.stringify(suspects, null, 1));
console.log("total:", suspects.length);
