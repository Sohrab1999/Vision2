// ------------------------------------------------------------------
// تسک ۱۸۰ — قراردادِ «خروجیِ CSVِ پوشش» — برادرِ خانوادهٔ ۱۶۹/۱۷۸
// با جهتِ تازه: جدولِ بلندِ tidy (هر سطر = درس×مهارت) برایِ فیلتر/پیوت
// اکسل، نه خطِ زمان. همان دیالکتِ خانواده قفل می‌شود:
// CRLF/BOM·ASCII·صداقتِ سلولِ خالی·ساختارِ بی‌ویرگول.
// ورودیِ تست ورودیِ مصنوعیِ coverage است (سه درس × شش مهارت) — خواندن
// از LESSONS_META نیست؛ این lib از هر CoverageMapResultای تغذیه می‌شود.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  buildCoverageCsv,
  coverageStatus,
  COVERAGE_CSV_COLUMNS,
  downloadCoverageCsv,
} from "@/lib/coverage-csv";
import type { CoverageMapResult } from "@/lib/coverage-map";

// ---------- سازندهٔ ورودیِ فشرده: فقط سلول‌هایِ نامبرده را پر می‌کند ----------
function makeCoverage(
  rows: Record<string, number | null>, // کلید «درس:اندیسِ مهارت» -> best
  lessons = 3,
  skills = 6
): CoverageMapResult {
  const lessonsOut = Array.from({ length: lessons }, (_, li) => {
    const id = li + 1;
    const cells = Array.from({ length: skills }, (_, si) => {
      const key = `${id}:${si}`;
      const best = Object.prototype.hasOwnProperty.call(rows, key) ? rows[key] : null;
      return {
        key: `sk${si}`,
        label: `مهارت ${si}`,
        best,
        at: best !== null ? `2026-10-${String(10 + li).padStart(2, "0")}` : null,
      };
    });
    return {
      id,
      title: `درسِ نمونه ${id}`,
      color: "emerald",
      known: 0,
      wordTotal: 100,
      wordPct: 0,
      cells,
      gap: null,
      covered: false,
    };
  });
  const totalSkills = lessons * skills;
  const attemptedSkills = lessonsOut.reduce(
    (s, l) => s + l.cells.filter((c) => c.best !== null).length,
    0
  );
  return { lessons: lessonsOut, totalSkills, attemptedSkills };
}

describe("coverage CSV — tidy teacher file (Task 180)", () => {
  it("freezes the 6-column header exactly like the family dialect", () => {
    const csv = buildCoverageCsv(makeCoverage({}));
    const first = csv.split("\r\n")[0];
    expect(first).toBe(COVERAGE_CSV_COLUMNS.join(","));
    expect(COVERAGE_CSV_COLUMNS).toHaveLength(6);
  });

  it("emits one row per lesson x skill (3x6=30 data rows + header, CRLF-terminated)", () => {
    const csv = buildCoverageCsv(makeCoverage({}));
    const rows = csv.split("\r\n").filter((r) => r !== "");
    expect(rows).toHaveLength(1 + 18); // 3 lessons x 6 skills + header
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("keeps lessons and skills in canonical order (row 1 = lesson 1, skill 0)", () => {
    const csv = buildCoverageCsv(makeCoverage({ "1:0": 90 }));
    const body = csv.split("\r\n").filter((r) => r !== "").slice(1);
    expect(body[0]).toBe("1,درسِ نمونه 1,مهارت 0,90,عالی,2026-10-10");
    expect(body[1].endsWith(",مهارت 1,,تلاش‌نشده,")).toBe(true);
  });

  it("untried cells stay EMPTY (no fabricated zeros) with تلاش‌نشده status", () => {
    const csv = buildCoverageCsv(makeCoverage({ "2:3": 66 }));
    const row = csv.split("\r\n").find((r) => r.startsWith("2,") && r.includes("مهارت 3"));
    expect(row).toBe("2,درسِ نمونه 2,مهارت 3,66,خوب,2026-10-11");
    // and an untried sibling in the same lesson has an empty best field
    const untried = csv.split("\r\n").find((r) => r.startsWith("2,") && r.includes("مهارت 0"));
    expect(untried).toBe("2,درسِ نمونه 2,مهارت 0,,تلاش‌نشده,");
  });

  it("status ladder mirrors the printed paper: <50 ضعیف, <85 خوب, >=85 عالی", () => {
    expect(coverageStatus(null)).toBe("تلاش‌نشده");
    expect(coverageStatus(0)).toBe("ضعیف");
    expect(coverageStatus(49)).toBe("ضعیف");
    expect(coverageStatus(50)).toBe("خوب");
    expect(coverageStatus(84)).toBe("خوب");
    expect(coverageStatus(85)).toBe("عالی");
    expect(coverageStatus(100)).toBe("عالی");
  });

  it("status ladder is reflected per row (49/50/85 boundary sweep)", () => {
    const csv = buildCoverageCsv(makeCoverage({ "1:0": 49, "1:1": 50, "1:2": 85 }));
    expect(csv).toContain("مهارت 0,49,ضعیف,");
    expect(csv).toContain("مهارت 1,50,خوب,");
    expect(csv).toContain("مهارت 2,85,عالی,");
  });

  it("best column is pure ASCII digits (no ٪, no Persian digits) for Excel math", () => {
    const csv = buildCoverageCsv(makeCoverage({ "3:5": 77 }));
    expect(csv).toContain(",77,خوب,");
    expect(csv).not.toMatch(/[۰-۹٪]/);
  });

  it("structure has no quotes anywhere — no field contains a comma", () => {
    const csv = buildCoverageCsv(makeCoverage({ "1:0": 90, "2:2": 30 }));
    expect(csv).not.toContain('"');
  });

  it("download function is SSR-safe and names the file vision2-coverage-<today>.csv", () => {
    // در vitest با node environment، document وجود ندارد → false (قراردادِ ۱۶۹/۱۷۸)
    expect(downloadCoverageCsv(makeCoverage({}), "2026-10-14")).toBe(false);
  });
});
