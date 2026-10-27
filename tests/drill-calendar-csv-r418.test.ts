// @vitest-environment jsdom
// ------------------------------------------------------------------
// r418 — «صادرِ تقویمِ مرور» — قفلهایِ موتورِ خالص.
//
// تقویم = دو مجموعهٔ زندهٔ بانکِ خطا (همپوشانیِ صفرِ r417) رویِ اکسل:
//  · سررسیدها نخست — ترتیبِ اولویتِ صادقِ drillDueBases (بیشترین خطا،
//    کهنهترین اشتباه)؛ روزِ بازگشتِ سطرِ سررسید = امروز (تعریفِ سررسید)
//  · درنفسها بعد — نزدیکترین بازگشتِ drillGraceRows
//  · مسلط و تازهٔ امروزِ بیحق بازگشتِ برنامهای ندارند — تقویم ادعا
//    نمیسازد؛ بانکِ غایب = فهرستِ تهیِ صادق
// قراردادِ خانوادهٔ CSV: CRLF + سرصفحهٔ همیشهحاضر + اعدادِ ASCII +
// BOM نزدِ جایِ دانلود (در build نیست)؛ گویشِ مستندِ همین ماژول:
// escapeِ کمینهٔ RFC 4180 — دامنهٔ تقویم جمله و واژهٔ چندکلمهای دارد.
// ------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import {
  buildDrillCalendarRows,
  buildDrillCalendarCsv,
  downloadDrillCalendarCsv,
  DRILL_CALENDAR_COLUMNS,
  type DrillCalendarRow,
} from "@/lib/drill-calendar-csv";
import type { DrillMistakeBank } from "@/lib/drill-mistakes";

const TODAY = "2026-10-14"; // چهارشنبه — روزِ لنگرِ ثابت (عینِ خانوادهٔ ۱۶۹)
const FA_OF = (b: string) => ({ go: "رفتن", see: "دیدن", come: "آمدن، رسیدن" })[b] ?? "";

/** بانکِ مخلوطِ همهٔ حالتها — نردبانِ r417 رویِ لنگرِ ثابت */
const mixedBank = (): DrillMistakeBank => ({
  go: { wrong: 2, ok: 0, lastDay: "2026-10-12", lastOkDay: "" }, // سررسیدِ ساده
  see: { wrong: 3, ok: 0, lastDay: "2026-10-10", lastOkDay: "" }, // سررسید — بیشترینِ خطا
  come: { wrong: 2, ok: 1, lastDay: "2026-10-12", lastOkDay: TODAY }, // درنفسِ grace1 → فردا
  watch: { wrong: 3, ok: 2, lastDay: "2026-10-10", lastOkDay: TODAY }, // درنفسِ grace2 → +۲
  have: { wrong: 1, ok: 1, lastDay: "2026-10-12", lastOkDay: "2026-10-13" }, // مسلط — هیچ
  eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" }, // تازهٔ امروزِ بیحق — هیچ
});

describe("r418 — buildDrillCalendarRows", () => {
  it("ترتیبِ SRSِ صادق: سررسیدها به اولویت (بیشترینِ خطا نخست) و بعد درنفسها به نزدیکترین بازگشت", () => {
    const rows = buildDrillCalendarRows(mixedBank(), TODAY, FA_OF);
    expect(rows.map((r) => `${r.state}:${r.base}`)).toEqual([
      "due:see", // wrong 3 — بیشترینِ خطا
      "due:go", // wrong 2
      "grace:come", // بازگشتِ ۱۰-۱۵ — نزدیکتر
      "grace:watch", // بازگشتِ ۱۰-۱۶
    ]);
  });

  it("سطرِ سررسید: روزِ بازگشتش خودِ امروز است (تعریفِ سررسید) — daysUntil صفر", () => {
    const rows = buildDrillCalendarRows(mixedBank(), TODAY, FA_OF);
    const go = rows.find((r) => r.base === "go")!;
    expect(go.state).toBe("due");
    expect(go.nextDueDay).toBe(TODAY);
    expect(go.daysUntil).toBe(0);
    expect(go.wrong).toBe(2);
    expect(go.ok).toBe(0);
    expect(go.lastDay).toBe("2026-10-12");
  });

  it("سطرِ درنفس: روزِ بازگشت از نردبانِ r416 رویِ lastOkDay — not امروز", () => {
    const rows = buildDrillCalendarRows(mixedBank(), TODAY, FA_OF);
    const come = rows.find((r) => r.base === "come")!;
    const watch = rows.find((r) => r.base === "watch")!;
    expect(come.nextDueDay).toBe("2026-10-15"); // grace1 از امروزِ حق
    expect(come.daysUntil).toBe(1);
    expect(watch.nextDueDay).toBe("2026-10-16"); // grace2
    expect(watch.daysUntil).toBe(2);
    expect(watch.wrong).toBe(3);
    expect(watch.ok).toBe(2);
  });

  it("همپوشانیِ صفر (r417) رویِ تقویم: هیچ پایهای در هر دو وضعیت نیست و مسلط/تازهٔ بیحق غایباند", () => {
    const rows = buildDrillCalendarRows(mixedBank(), TODAY, FA_OF);
    const bases = rows.map((r) => r.base);
    expect(new Set(bases).size).toBe(bases.length); // هیچ تکراری
    expect(bases).not.toContain("have"); // مسلط — بازگشتی در کار نیست
    expect(bases).not.toContain("eat"); // تازهٔ امروزِ بیحق — حقی نگرفته
  });

  it("برچسب از resolverِ میزبان میآید — حلنشده = خانهٔ تهیِ صادق (نه حدس)", () => {
    const rows = buildDrillCalendarRows(mixedBank(), TODAY, FA_OF);
    expect(rows.find((r) => r.base === "go")!.label).toBe("رفتن");
    expect(rows.find((r) => r.base === "watch")!.label).toBe(""); // resolver نمیاد
  });

  it("بانکِ غایب و بانکِ تهی = فهرستِ تهیِ صادق", () => {
    expect(buildDrillCalendarRows(undefined, TODAY, FA_OF)).toEqual([]);
    expect(buildDrillCalendarRows({}, TODAY, FA_OF)).toEqual([]);
  });
});

describe("r418 — buildDrillCalendarCsv", () => {
  it("سرصفحهٔ ۹ستونیِ منجمد — جدولِ همیشههمشکل حتی با سطرِ صفر", () => {
    expect(DRILL_CALENDAR_COLUMNS).toHaveLength(9);
    const empty = buildDrillCalendarCsv([]);
    expect(empty).toBe(DRILL_CALENDAR_COLUMNS.join(",") + "\r\n");
    const csv = buildDrillCalendarCsv(buildDrillCalendarRows(mixedBank(), TODAY, FA_OF));
    expect(csv.split("\r\n")[0]).toBe(DRILL_CALENDAR_COLUMNS.join(","));
  });

  it("سطرِ کامل با اعدادِ ASCII و برچسبِ وضعیتِ فارسی و روزِ هفته", () => {
    const csv = buildDrillCalendarCsv(buildDrillCalendarRows(mixedBank(), TODAY, FA_OF));
    const lines = csv.split("\r\n").filter((l) => l !== "");
    expect(lines[1]).toBe("سررسید,see,دیدن,3,0,2026-10-10,2026-10-14,چهارشنبه,0");
    expect(lines[2]).toBe("سررسید,go,رفتن,2,0,2026-10-12,2026-10-14,چهارشنبه,0");
    // ویرگولِ درونِ معنیِ come («آمدن، رسیدن») ویرگولِ عربیِ (U+060C) است —
    // جداسازِ CSV نیست و نقلقول نمیخواهد؛ escape فقط برایِ ویرگولِ ASCII
    expect(lines[3]).toBe("درنفس,come,آمدن، رسیدن,2,1,2026-10-12,2026-10-15,پنجشنبه,1");
    expect(lines[4]).toBe("درنفس,watch,,3,2,2026-10-10,2026-10-16,جمعه,2");
  });

  it("CRLF (RFC 4180) و بدونِ BOM در build — BOM نزدِ جایِ دانلود است (r399)", () => {
    const csv = buildDrillCalendarCsv(buildDrillCalendarRows(mixedBank(), TODAY, FA_OF));
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv.includes("\n") && !csv.includes("\r\n")).toBe(false);
    expect(csv.charCodeAt(0)).not.toBe(0xfeff);
  });

  it("escapeِ کمینهٔ RFC 4180: ویرگول → نقلقول، نقلقول → دوبرابر", () => {
    const rows: DrillCalendarRow[] = [
      {
        state: "due",
        base: "look at, watch",
        label: 'ساعت "دیواری"',
        wrong: 1,
        ok: 0,
        lastDay: "2026-10-12",
        nextDueDay: TODAY,
        daysUntil: 0,
      },
    ];
    const line = buildDrillCalendarCsv(rows).split("\r\n")[1];
    expect(line).toBe(
      'سررسید,"look at, watch","ساعت ""دیواری""",1,0,2026-10-12,2026-10-14,چهارشنبه,0',
    );
  });
});

describe("r418 — downloadDrillCalendarCsv (ر344 COU)", () => {
  const originalCOU = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;

  afterEach(() => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
  });

  it("پایِ سبز: لنگرِ vision2-review-calendar-<روز>.csv و BOM در سرِ بایتها (درسِ r401: ignoreBOM)", async () => {
    let captured: Blob | null = null;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => {
        captured = b;
        return "blob:r418-fake";
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      const ok = downloadDrillCalendarCsv(buildDrillCalendarRows(mixedBank(), TODAY, FA_OF), TODAY);
      expect(ok).toBe(true);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === `vision2-review-calendar-${TODAY}.csv`);
      expect(anchor).toBeDefined();
      // درسِ r401: blob.text() جوابِ BOM را میبلعد — arrayBuffer + ignoreBOM
      const buf = await captured!.arrayBuffer();
      const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(buf);
      expect(text.charCodeAt(0)).toBe(0xfeff); // BOM در سرِ فایل
      expect(text).toContain(DRILL_CALENDAR_COLUMNS.join(","));
      expect(text).toContain("سررسید,see,دیدن");
    } finally {
      document.body.appendChild = origAppend;
    }
  });

  it("پایِ سرخ: شکستِ COU → false (builder درونِ گاردِ نقاشِ مشترک میماند)", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => {
        throw new TypeError("r418-test-cou");
      },
      writable: true,
      configurable: true,
    });
    expect(downloadDrillCalendarCsv([{ state: "due", base: "go", label: "رفتن", wrong: 1, ok: 0, lastDay: "2026-10-12", nextDueDay: TODAY, daysUntil: 0 }], TODAY)).toBe(false);
  });
});
