#!/usr/bin/env node
// ------------------------------------------------------------------
// تسک ۱۷۷ — اودیتورِ focus-visible: نگهبانِ «هیچ عنصرِ تعاملی‌ای بی‌نشانهٔ
// کانونی نمی‌ماند». راندهای ۱۶۸/۱۶۹ پوششِ لکه‌لکه‌ایِ ringها را دیده بودند؛
// این اسکریپت لکه‌ها را به عدد تبدیل می‌کند.
//
// قرارداد: هر className در TSX که outline-none دارد باید هم‌راستا یکی از
//   focus:ring-* / focus-visible:ring-* / focus:outline-* / focus-visible:outline-*
// را هم داشته باشد (ring تِیل‌ویند = box-shadow؛ outline = outline).
//   border/bg-only شمارش نمی‌شود — تغییرِ رنگِ لبه نشانهٔ کانونیِ قابل
//   اعتمادِ کاربرِ کیبورد نیست (المانِ کم‌کنتراست، فونتِ درشت و …).
// خروجیِ analyze(): { files, outlineNone: n, spots: [{file,line,kind,cls}] }
//   kind = "none"         → صفرِ مطلقِ نشانه (باید صفر بماند)
//   kind = "border-only"  → لبه‌بازیِ بی‌ring (باید صفر بماند)
// خالص و فقط-خواندنی؛ تستِ قرارداد (tests/focus-visible-contract.test.ts)
// همین analyze را مصرف می‌کند — یک قرارداد، دو مصرف‌کننده.
// ------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

// className="..." | className={'...'} | className={`...`} — تک‌ریشه‌ای؛
// رشته‌های چندخطی (template) با /s گرفته می‌شوند. عبارت‌های ${...} از
// استاتیک جدا هستند و خودشان تحلیل نمی‌شوند (کلاسِ شرطی = بیرونِ قرارداد).
const RE = [
  /className\s*=\s*"([^"]*)"/g,
  /className\s*=\s*\{`([^`]*)`\}/g,
  /className\s*=\s*\{'([^']*)'\}/g,
];

/** آیا رشتهٔ کلاس، نشانهٔ کانونیِ قابلِ اعتماد (ring/outline) دارد؟ */
function hasStrongSignal(cls) {
  return /(?:^|\s)(?:focus|focus-visible|focus-within):(?:ring|outline|shadow)/.test(cls);
}

/** فقط border/bg رنگ عوض می‌کند؟ (ضعیف — شمارش نمی‌شود) */
function hasBorderOnly(cls) {
  return /(?:^|\s)(?:focus|focus-visible):(?:border|bg)-/.test(cls);
}

function analyzeDir(srcDir) {
  const spots = [];
  let files = 0;
  let outlineNone = 0;
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        walk(p);
        continue;
      }
      if (!name.endsWith(".tsx")) continue;
      files++;
      const src = fs.readFileSync(p, "utf8");
      for (const re of RE) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(src)) !== null) {
          const cls = m[1];
          if (!/(?:^|\s)outline-none(?:\s|$)/.test(cls)) continue;
          outlineNone++;
          // شمارهٔ خط = شمارهٔ خطِ شروعِ رشتهٔ کلاس
          const line = src.slice(0, m.index).split("\n").length;
          const file = path.relative(process.cwd(), p);
          if (hasStrongSignal(cls)) continue; // سالم
          spots.push({
            file,
            line,
            kind: hasBorderOnly(cls) ? "border-only" : "none",
            cls: cls.replace(/\s+/g, " ").trim().slice(0, 160),
          });
        }
      }
    }
  };
  walk(srcDir);
  spots.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return { files, outlineNone, spots };
}

module.exports = { analyze: () => analyzeDir(path.join(process.cwd(), "src")) };

if (require.main === module) {
  const r = analyzeDir(path.join(process.cwd(), "src"));
  console.log(`files scanned: ${r.files}`);
  console.log(`outline-none occurrences: ${r.outlineNone}`);
  console.log(`spots (missing/weak focus signal): ${r.spots.length}`);
  for (const s of r.spots) console.log(`  [${s.kind}] ${s.file}:${s.line} — ${s.cls}`);
  process.exitCode = r.spots.length ? 1 : 0;
}
