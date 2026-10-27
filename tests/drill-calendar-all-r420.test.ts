// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r420 — «تقویمِ همهٔ بانکها» — قفلهایِ سازندهٔ چندبانکی.
//
// دوقلویِ r418 رویِ کلِ نقشه (پیشنهادِ ②ِ r418). قفلها:
//  · نقشهٔ تهی / همه‌مسلط / تازهٔ امروزِ بیحق = فهرستِ تهیِ صادق
//  · بلوکهایِ بانکی به ترتیبِ رسمیِ میزبان؛ داخلِ هر بلوک عینِ
//    ترتیبِ SRSِ r418 (سررسیدها به اولویت، درنفسها به نزدیکترین)
//  · بانکِ بیرونِ ترتیبِ رسمی: الفبایی در انتها (قطعیِ صادق)
//  · عنوانِ بانک از میزبان تزریق میشود؛ گویشِ دهستونیِ مستند
//  · CRLF و نبودِ BOM در بدنه (BOM نزدِ جایِ دانلود — r399)
//  · escapeِ کمینهٔ RFC 4180 (ویرگولِ ASCII نقلقول میخواهد؛
//    ویرگولِ عربی U+060C نمیرسد — درسِ واقعیِ r418)
//  · پایِ سبزِ دانلود: لنگرِ همه-بانکی + BOM در سرِ بایتها (r401)
//  · پایِ سرخِ دانلود: شکستِ COU → false
// ---------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import {
  buildDrillCalendarAllRows,
  buildDrillCalendarAllCsv,
  downloadDrillCalendarAllCsv,
  DRILL_CALENDAR_ALL_COLUMNS,
  type DrillCalendarHosts,
} from "@/lib/drill-calendar-csv";
import { CSV_BOM } from "@/lib/file-download";

const TODAY = "2026-10-26";

/** ردیفِ درنفس — آخرین رخداد حقِ امروز، فاصله هنوز نگذشته */
const grace = (over: Record<string, unknown> = {}) => ({
  wrong: 2,
  ok: 1,
  lastDay: "2026-10-20",
  lastOkDay: TODAY,
  ...over,
});

const HOSTS: DrillCalendarHosts = {
  labelFor: (bankId) =>
    bankId === "verbs"
      ? (b) => ({ go: "رفتن", come: "آمدن، رسیدن" }[b] ?? "")
      : bankId === "phonemes"
        ? (b) => ({ "æ": "واکهٔ کشیدهٔ a" }[b] ?? "")
        : () => "",
  titleFor: (bankId) => ({ verbs: "افعال بی‌قاعده", phonemes: "جدول تلفظ" }[bankId] ?? ""),
  order: ["verbs", "phonemes", "words", "abbrev", "lesson-vocab", "dict-vocab", "bg-examples"],
};

describe("drill-calendar-all r420 — تقویمِ چندبانکی", () => {
  it("نقشهٔ تهی = فهرستِ تهیِ صادق", () => {
    expect(buildDrillCalendarAllRows({}, TODAY, HOSTS)).toEqual([]);
  });

  it("همه‌مسلط و تازهٔ امروزِ بیحق: هیچ سطری — تقویمِ چندبانکی هم ادعا نمیکند", () => {
    const rows = buildDrillCalendarAllRows(
      {
        verbs: {
          have: { wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-20" }, // مسلط
          eat: { wrong: 1, ok: 0, lastDay: TODAY, lastOkDay: "" }, // تازهٔ امروزِ بیحق
        },
      },
      TODAY,
      HOSTS,
    );
    expect(rows).toEqual([]);
  });

  it("بلوکهایِ بانکی به ترتیبِ رسمی؛ داخلِ هر بلوک سررسیدها پیشِ درنفسها", () => {
    const rows = buildDrillCalendarAllRows(
      {
        phonemes: { "æ": grace() }, // درنفسِ تنها
        verbs: {
          come: grace(), // درنفس
          go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // سررسید
        },
      },
      TODAY,
      HOSTS,
    );
    expect(rows.map((r) => `${r.bankId}:${r.base}:${r.state}`)).toEqual([
      "verbs:go:due", // سررسیدِ بانکِ اول
      "verbs:come:grace", // درنفسِ بانکِ اول
      "phonemes:æ:grace", // بعد بلوکِ بانکِ دوم
    ]);
    expect(rows[0].bankTitle).toBe("افعال بی‌قاعده");
    expect(rows[0].daysUntil).toBe(0); // سررسید = بازگشتِ امروز
    expect(rows[1].daysUntil).toBe(1); // grace1 — فردا
  });

  it("بانکِ بیرونِ ترتیبِ رسمی: الفبایی در انتها — و عنوانِ تهیِ صادق", () => {
    const rows = buildDrillCalendarAllRows(
      {
        "zz-custom": { x: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } },
        verbs: { go: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } },
        "aa-custom": { y: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } },
      },
      TODAY,
      HOSTS,
    );
    expect(rows.map((r) => r.bankId)).toEqual(["verbs", "aa-custom", "zz-custom"]);
    expect(rows[1].bankTitle).toBe(""); // بانکِ ناشناس — عنوانِ صادقِ تهی
    expect(rows[1].label).toBe(""); // برچسبِ حلنشده — خانهٔ تهیِ صادق (r403)
  });

  it("گویشِ دهستونی: سرصفحهٔ ۱۰ستونی، CRLF، بیِ BOM در بدنه (BOM نزدِ دانلود)", () => {
    const rows = buildDrillCalendarAllRows(
      { verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } },
      TODAY,
      HOSTS,
    );
    const csv = buildDrillCalendarAllCsv(rows);
    expect(csv.startsWith(DRILL_CALENDAR_ALL_COLUMNS.join(","))).toBe(true);
    expect(csv.startsWith(CSV_BOM)).toBe(false);
    expect(csv.endsWith("\r\n")).toBe(true);
    expect(csv).toContain("سررسید,افعال بی‌قاعده,go,رفتن,2,0,2026-10-20,2026-10-26,");
  });

  it("escapeِ کمینهٔ RFC 4180: ویرگولِ ASCII نقلقول؛ ویرگولِ عربی U+060C نمیرسد (درسِ r418)", () => {
    const rows = buildDrillCalendarAllRows(
      {
        verbs: {
          come: grace(), // معنیِ «آمدن، رسیدن» — ویرگولِ عربی، بی نقلقول
          look: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // معنیِ ویرگولدارِ ساختگی
        },
      },
      TODAY,
      { ...HOSTS, labelFor: () => (b) => (b === "come" ? "آمدن، رسیدن" : 'نگاه, "کردن"') },
    );
    const csv = buildDrillCalendarAllCsv(rows);
    expect(csv).toContain("درنفس,افعال بی‌قاعده,come,آمدن، رسیدن,"); // U+060C — بیِ نقلقول
    expect(csv).toContain('"نگاه, ""کردن""",1,0,'); // ویرگولِ ASCII + نقلقولِ دوتایی
  });

  describe("downloadDrillCalendarAllCsv (ر344 COU)", () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;

    afterEach(() => {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    });

    it("پایِ سبز: لنگرِ همه-بانکی و BOM در سرِ بایتها (درسِ r401: ignoreBOM)", async () => {
      let captured: Blob | null = null;
      Object.defineProperty(globalThis.URL, "createObjectURL", {
        value: (b: Blob) => {
          captured = b;
          return "blob:r420-fake";
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
        const rows = buildDrillCalendarAllRows(
          {
            verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } },
            phonemes: { "æ": grace() },
          },
          TODAY,
          HOSTS,
        );
        const ok = downloadDrillCalendarAllCsv(rows, TODAY);
        expect(ok).toBe(true);
        const anchor = appended.find(
          (el) => (el as HTMLAnchorElement).download === `vision2-review-calendar-all-${TODAY}.csv`,
        );
        expect(anchor).toBeDefined();
        // درسِ r401: blob.text() جوابِ BOM را میبلعد — arrayBuffer + ignoreBOM
        const buf = await captured!.arrayBuffer();
        const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(buf);
        expect(text.charCodeAt(0)).toBe(0xfeff); // BOM در سرِ فایل
        expect(text).toContain(DRILL_CALENDAR_ALL_COLUMNS.join(","));
        expect(text).toContain("سررسید,افعال بی‌قاعده,go,رفتن");
        expect(text).toContain("درنفس,جدول تلفظ,æ");
      } finally {
        document.body.appendChild = origAppend;
      }
    });

    it("پایِ سرخ: شکستِ COU → false", () => {
      Object.defineProperty(globalThis.URL, "createObjectURL", {
        value: () => {
          throw new TypeError("r420-test-cou");
        },
        writable: true,
        configurable: true,
      });
      expect(
        downloadDrillCalendarAllCsv(
          [{ state: "due", base: "go", label: "رفتن", wrong: 1, ok: 0, lastDay: "2026-10-20", nextDueDay: TODAY, daysUntil: 0, bankId: "verbs", bankTitle: "افعال بی‌قاعده" }],
          TODAY,
        ),
      ).toBe(false);
    });
  });
});
