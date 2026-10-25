// ------------------------------------------------------------------
// راند ۲۸۰ — گاردِ سرشماریِ برچسبِ فید: هر دسته‌ای که به /api/stats
// می‌رود باید برچسبِ فارسی در feedLabel داشته باشد — وگرنه کلیدِ خامِ
// انگلیسی روی فیدِ فارسیِ خانه رندر میشود (`feedLabel[a.category] ??
// a.category`). امروز چهار نشتیِ واقعی بسته شد (smart / spell-rush /
// review / my-words)؛ این گارد هر دستهٔ تازهٔ بی-برچسب را می‌گیرد.
// پردهٔ ① فهرستِ صریحِ مکانون (از سرشماریِ منبعِ همین راند)؛
// پردهٔ ② پیمایشِ زندهٔ src برایِ هر لیتِرالِ category (sendStats و
// propهای QuizEngine) — هر چیزِ تازه باید برچسب بگیرد.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { feedLabel } from "@/components/study/home/home-constants";

const walkTs = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkTs(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
};

/** فهرستِ مکانونِ دسته‌های ارسالی — سرشماریِ منبعِ راند ۲۸۰ (sendStats
 *  call-sites + propهای category QuizEngine + اتحادِ QuizCategory +
 *  خانواده‌های تولیدی: dict-N و final-N و دیکته‌های شخصی) */
const CANON_CATEGORIES = [
  // QuizEngine callers (category="…")
  "vocab",
  "vocab-konkuri",
  "grammar",
  "synant",
  "mixed",
  "mistakes",
  "review",
  "smart",
  "my-words",
  "danger",
  // dictation family (dictation-tab: src.category ?? "dictation")
  "dictation",
  "dict-g10",
  "dict-g11",
  "dict-g12",
  "exam-dictation",
  "my-words-dictation",
  "danger-dictation",
  "srs-due-dictation",
  // lib quizzes / exam / exam-view
  "listening",
  "exam",
  "final",
  "final-7",
  "final-8",
  "final-9",
  "final-10",
  "final-12",
  "vocab",
  // duel family
  "rush",
  "spell-rush",
  "duel",
  // konkur corner
  "konkur",
  "konkur-hard",
  "konkur-cover",
];

const isPersianLabel = (s: string | undefined): boolean =>
  typeof s === "string" && s.length > 0 && !/^[a-z0-9-]+$/i.test(s);

describe("راند ۲۸۰ — سرشماریِ برچسبِ فید", () => {
  it("پردهٔ ① — هر دستهٔ مکانون برچسبِ فارسی دارد (کلیدِ خامِ انگلیسی ممنوع)", () => {
    for (const cat of CANON_CATEGORIES) {
      expect(isPersianLabel(feedLabel[cat]), `category "${cat}" raw on the feed`).toBe(true);
    }
  });

  it("پردهٔ ② — پیمایشِ زندهٔ src: هر لیتِرالِ category در sendStats/QuizEngine پوشیده است", () => {
    const srcDir = join(process.cwd(), "src");
    const files = walkTs(srcDir);
    const found = new Set<string>();
    for (const f of files) {
      const txt = readFileSync(f, "utf8");
      for (const m of txt.matchAll(/category[:=]\s*"([a-z][a-z0-9-]*)"/g)) {
        // خودِ map و تایپ‌ها لیتِرالِ «برچسب» دارند نه «دسته» — کلیدِ
        // feedLabel به شکل category: "واژهٔ فارسی" است؛ فقط دسته‌های
        // لاتینِ کاندید جمع می‌شوند و بعدی در پردهٔ ① آشکار میشود.
        found.add(m[1]);
      }
    }
    const raw = [...found].filter((c) => !isPersianLabel(feedLabel[c]));
    expect(
      raw,
      `these reachable categories have NO Persian feed label: ${raw.join(", ")}`
    ).toEqual([]);
  });
});
