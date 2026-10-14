// Task 169 — «خروجیِ CSV از پیشرفت» — the progress CSV contract.
// The builder is pure (anchor day key passed in, same pattern as
// computeWeeklyDigest) so every assertion here is deterministic —
// no fake timers needed.
import { describe, it, expect } from "vitest";
import {
  buildProgressCsv,
  downloadProgressCsv,
  CSV_BOM,
  PROGRESS_CSV_COLUMNS,
  PROGRESS_CSV_DAYS,
} from "@/lib/progress-csv";
import { dayKeyBefore } from "@/lib/weekly-digest";

const T = "2026-10-14"; // a Wednesday — fixed "today" for deterministic tests

const lines = (csv: string) => csv.split("\r\n").filter((l) => l !== "");
const rowOf = (csv: string, day: string) => lines(csv).find((l) => l.startsWith(`${day},`))!;

describe("progress CSV — shape", () => {
  it("starts with the Persian header row, in the frozen column order", () => {
    const csv = buildProgressCsv({}, T);
    expect(lines(csv)[0]).toBe(PROGRESS_CSV_COLUMNS.join(","));
    expect(lines(csv)[0]).toBe("تاریخ,روز هفته,مرور,آزمون,واژهٔ نو,دیکته,برق‌آسا,مجموع");
  });

  it("emits exactly one row per calendar day of the window (zero-filled)", () => {
    const csv = buildProgressCsv({}, T);
    expect(lines(csv)).toHaveLength(PROGRESS_CSV_DAYS + 1); // header + 35 days
  });

  it("runs oldest → newest and ends the window at the anchor day", () => {
    const csv = buildProgressCsv({}, T);
    const rows = lines(csv).slice(1);
    expect(rows[0].split(",")[0]).toBe(dayKeyBefore(T, PROGRESS_CSV_DAYS - 1)); // 2026-09-10
    expect(rows[rows.length - 1].split(",")[0]).toBe(T);
  });

  it("clamps the window to the requested `days`", () => {
    const csv = buildProgressCsv({}, T, 7);
    expect(lines(csv)).toHaveLength(8); // header + 7 days
    expect(lines(csv)[1].split(",")[0]).toBe(dayKeyBefore(T, 6)); // 2026-10-08
  });

  it("steps across month boundaries without gaps", () => {
    const csv = buildProgressCsv({}, "2026-03-01", 2);
    expect(lines(csv)[1].split(",")[0]).toBe("2026-02-28");
  });

  it("uses CRLF line endings (RFC 4180) with a trailing terminator", () => {
    const csv = buildProgressCsv({}, T);
    expect(csv.endsWith("\r\n")).toBe(true);
    // no bare LF outside CRLF pairs
    expect(csv.replace(/\r\n/g, "").includes("\n")).toBe(false);
  });
});

describe("progress CSV — values", () => {
  it("lands each DayStat counter in its own column and sums the total", () => {
    const csv = buildProgressCsv({ [T]: { day: T, reviews: 5, quizzes: 1, words: 2, dictation: 0, rush: 1 } }, T);
    expect(rowOf(csv, T)).toBe("2026-10-14,چهارشنبه,5,1,2,0,1,9");
  });

  it("normalizes legacy partial entries — every cell is a number, never undefined", () => {
    const csv = buildProgressCsv({ [T]: { day: T, reviews: 3 } as never }, T);
    expect(rowOf(csv, T)).toBe("2026-10-14,چهارشنبه,3,0,0,0,0,3");
  });

  it("zero-fills absent days so gaps stay visible in the spreadsheet", () => {
    const csv = buildProgressCsv({}, T, 3);
    const rows = lines(csv).slice(1);
    for (const r of rows) {
      const cells = r.split(",");
      expect(cells.slice(2).every((c) => c === "0")).toBe(true);
      expect(cells[7]).toBe("0"); // total
    }
  });

  it("labels Persian weekdays from the day key", () => {
    const csv = buildProgressCsv({}, T, 2);
    expect(rowOf(csv, T).split(",")[1]).toBe("چهارشنبه"); // 2026-10-14 is a Wednesday
    expect(rowOf(csv, dayKeyBefore(T, 1)).split(",")[1]).toBe("سه‌شنبه"); // 2026-10-13 is a Tuesday
  });

  it("keeps raw ASCII digits so spreadsheets can compute", () => {
    const csv = buildProgressCsv({ [T]: { day: T, reviews: 12 } as never }, T, 1);
    expect(rowOf(csv, T)).toContain(",12,");
  });

  it("structural invariant: 8 fields per row, no quoting ever needed", () => {
    const csv = buildProgressCsv(
      {
        [T]: { day: T, reviews: 4, quizzes: 2, words: 1, dictation: 1, rush: 3 },
        [dayKeyBefore(T, 5)]: { day: dayKeyBefore(T, 5), reviews: 7 } as never,
      },
      T
    );
    for (const l of lines(csv)) {
      const fields = l.split(",");
      expect(fields).toHaveLength(8);
      for (const f of fields) {
        expect(f.includes(",")).toBe(false);
        expect(f.includes('"')).toBe(false);
      }
    }
  });
});

describe("progress CSV — download path", () => {
  it("exposes the UTF-8 BOM constant that the downloader prepends", () => {
    expect(CSV_BOM).toBe("\uFEFF");
  });

  it("is SSR/test-safe — returns false when no DOM exists", () => {
    // node environment: typeof document === "undefined"
    expect(downloadProgressCsv({}, T)).toBe(false);
  });
});
