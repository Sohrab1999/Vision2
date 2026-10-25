// ------------------------------------------------------------------
// r399 — CSV_BOM gets ONE home (the download-estate owner).
//
// The registered candidate (r398-②) landed. What the round actually
// found, though, is bigger than a constant move:
//  · The r398 census note said THREE module-local CSV_BOM copies
//    (teacher-csv / pulse-csv / progress-csv). The disk said FOUR —
//    coverage-csv's copy was missed by the census. Lesson registered:
//    re-grep the estate before migrating, never trust the note.
//  · Migration followed the r384 path-stability shape: only the
//    constant's HOME changed — the `CSV_BOM + build(...)` idiom at the
//    call sites is byte-for-byte untouched, so every produced file is
//    byte-identical to the pre-round output.
//  · The four former owners (teacher-csv / pulse-csv / coverage-csv /
//    progress-csv) retired their local exports; the two siblings
//    (teacher-learner-csv / teacher-class-ledger) that borrowed the
//    constant from teacher-csv now borrow from the owner like everyone
//    else — one import path, the anti-two-names rule (r385) applied.
//  · anki-export (TSV, no BOM) and backup (JSON) stay documented
//    no-verdicts — they never carried the constant.
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import { CSV_BOM } from "@/lib/file-download";

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

describe("csv-bom-r399 — BOM تکخانه در مالک", () => {
  it("تعریف: export const CSV_BOM در سراسر src دقیقاً یکجاست — در مالک", () => {
    const hits = execSync(`rg -n 'export const CSV_BOM' src/ || true`)
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toContain("src/lib/file-download.ts");
    const owner = p("src/lib/file-download.ts");
    expect(owner).toContain('export const CSV_BOM = "\\uFEFF";');
  });

  it("مقدار: بایتمارک واقعی UTF-8 (0xFEFF) — نه رشتهٔ خالی، نه BOM جعلی", () => {
    expect(CSV_BOM).toBe("\uFEFF");
    expect(CSV_BOM.charCodeAt(0)).toBe(0xfeff);
    expect(CSV_BOM.length).toBe(1);
  });

  it("چهار مالکِ پیشین: کپیِ محلی منقرض — از مالک وام میگیرند", () => {
    for (const f of [
      "src/lib/teacher-csv.ts",
      "src/lib/pulse-csv.ts",
      "src/lib/coverage-csv.ts",
      "src/lib/progress-csv.ts",
    ]) {
      const src = p(f);
      expect(src, f).not.toContain('export const CSV_BOM');
      expect(src, f).not.toContain('CSV_BOM = "\\uFEFF"');
      expect(src, f).toContain('import { CSV_BOM, downloadCsvFile } from "./file-download"');
    }
  });

  it("دو خواهروار: مسیرِ وامِ یکتا — CSV_BOM دیگر از teacher-csv نمیآید", () => {
    for (const [f, sibling] of [
      ["src/lib/teacher-learner-csv.ts", "csvSafe"],
      ["src/lib/teacher-class-ledger.ts", "buildClassCsv"],
    ] as const) {
      const src = p(f);
      expect(src, f).toContain('import { CSV_BOM, downloadCsvFile } from "./file-download"');
      // وامِ کهنه از teacher-csv منقرض — شکل‌های تاریخیِ ایمپورتِ جفتی
      expect(src, f).not.toContain(`import { CSV_BOM, ${sibling} } from "./teacher-csv"`);
      expect(src, f).toContain(`from "./teacher-csv"`); // وامِ خواهریِ غیر-BOM پابرجا
      expect(src, f).toContain(sibling);
    }
  });

  it("ثباتِ مسیرِ بایت (r384): ایدئومِ `CSV_BOM + build(...)` دستنخورده — ۸ دروازه در ۶ ماژول", () => {
    const gates: Array<[string, number]> = [
      ["src/lib/teacher-csv.ts", 1],
      ["src/lib/teacher-learner-csv.ts", 1],
      ["src/lib/teacher-class-ledger.ts", 1],
      ["src/lib/coverage-csv.ts", 1],
      ["src/lib/pulse-csv.ts", 1],
      ["src/lib/progress-csv.ts", 3], // پیشرفت + روند هفتگی + ماهانهٔ کتابخانه
    ];
    let total = 0;
    for (const [f, n] of gates) {
      const src = p(f);
      const count = (src.match(/downloadCsvFile\(\(\) => CSV_BOM \+/g) ?? []).length;
      expect(count, f).toBe(n);
      total += count;
    }
    expect(total).toBe(8);
  });

  it("سندهای «نخیر»: anki (TSV بی‌BOM) و backup (JSON) هرگز CSV_BOM نداشتند", () => {
    expect(p("src/lib/anki-export.ts")).not.toContain("CSV_BOM");
    expect(p("src/lib/backup.ts")).not.toContain("CSV_BOM");
  });
});
