// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r421 — «تقویمِ هفتهٔ پیشِ رو» — قفلهایِ چینندهٔ روزبهروز.
//
// برشِ ۷روزهٔ اطلسِ r420 (پیشنهادِ ③ِ r418 — پرسشِ ابزار، نه سیاست).
// قفلها:
//  · نقشهٔ تهی / همه‌مسلط / تازهٔ امروزِ بیحق = هفتهٔ تهیِ صادق
//    (صداقت از منبعِ r420 به ارث میرسد — اینجا بازقفل نمیشود)
//  · مرزِ پنجره: روزِ ۰ تا ۶ درون؛ ۷ و ۸ بیرون — دورترها حذفِ خاموش
//    نمیشوند، سطرِ «پس از هفته» چندتایی و نزدیکترینِشان را میگوید
//  · چینشِ روزبهروز: سطرِ «جمعِ روز» پیشِ ردیفهایِ همان روز؛ روزها
//    صعودی؛ درونِ روز ترتیبِ بلوکیِ رسمیِ r420 پابرجا
//  · جمعِ روزِ صادق: شمارِ همان روز — نه کلِ هفته
//  · گویشِ CSV: سرصفحهٔ دهستونیِ خودِ r420، CRLF، بیِ BOM در بدنه
//  · پایِ سبزِ دانلود: نامِ فایلِ هفتگی + BOM در سرِ بایتها (r401)
//  · پایِ سرخِ دانلود: شکستِ COU → false
//  · خلوصِ تابعی: ورودیِ یکسان = رشتهٔ یکسان (امروز همیشه ورودی است)
// ---------------------------------------------------------------------

import { describe, it, expect, afterEach } from "vitest";
import {
  buildDrillCalendarAllRows,
  buildDrillWeekAgendaFromRows,
  buildDrillWeekAgendaCsv,
  downloadDrillWeekAgendaCsv,
  DRILL_CALENDAR_ALL_COLUMNS,
  DRILL_WEEK_WINDOW,
  type DrillCalendarHosts,
} from "@/lib/drill-calendar-csv";
import { CSV_BOM } from "@/lib/file-download";
import { faWeekday } from "@/lib/weekly-digest";

const TODAY = "2026-10-26";
const graceAgo = (daysUntil: number) => {
  const ladder = [1, 2, 4, 8];
  const ok = ladder.find((g) => g >= daysUntil) ? ladder.findIndex((g) => g >= daysUntil) + 1 : 4;
  const graceDays = Math.min(2 ** (ok - 1), 8);
  const ago = graceDays - daysUntil; // چند روز پیش حق گرفته
  const iso = (d: Date) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const shift = (n: number) => iso(new Date(Date.parse(TODAY + "T12:00:00Z") - n * 86400000));
  return {
    wrong: ok + 1, // بیِتسلط — ok هرگز به wrong نمیرسد
    ok,
    lastDay: shift(ago + 1), // اشتباه کهنهتر از آخرین حق
    lastOkDay: shift(ago),
  };
};

const HOSTS: DrillCalendarHosts = {
  labelFor: (bankId) =>
    bankId === "verbs"
      ? (b) => ({ go: "رفتن", come: "آمدن، رسیدن", run: "دویدن" }[b] ?? "")
      : bankId === "phonemes"
        ? (b) => ({ "æ": "واکهٔ کشیدهٔ a" }[b] ?? "")
        : () => "",
  titleFor: (bankId) => ({ verbs: "افعال بی‌قاعده", phonemes: "جدول تلفظ" }[bankId] ?? ""),
  order: ["verbs", "phonemes", "words", "abbrev", "lesson-vocab", "dict-vocab", "bg-examples"],
};

describe("drill-week-agenda r421 — برشِ هفتهٔ پیشِ رو", () => {
  it("هفتهٔ تهی: نقشهٔ تهی و همه‌مسلط — itemCount صفر و بی سطر", () => {
    expect(buildDrillWeekAgendaFromRows([]).rows).toEqual([]);
    const mastered = buildDrillCalendarAllRows(
      { verbs: { have: { wrong: 1, ok: 1, lastDay: "2026-10-20", lastOkDay: "2026-10-20" } } },
      TODAY,
      HOSTS,
    );
    const agenda = buildDrillWeekAgendaFromRows(mastered);
    expect(agenda.itemCount).toBe(0);
    expect(agenda.rows).toEqual([]);
    expect(agenda.afterCount).toBe(0);
  });

  it("مرزِ پنجره: ۰ و ۶ درون؛ ۷ و ۸ بیرون — پس از هفته نزدیکترین (۷) را میگوید", () => {
    const rows = buildDrillCalendarAllRows(
      {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // سررسید — روزِ ۰
          come: graceAgo(6), // درنفسِ لبهٔ درون
          run: graceAgo(7), // لبهٔ بیرون
          see: graceAgo(8), // دورتر
        },
      },
      TODAY,
      HOSTS,
    );
    const agenda = buildDrillWeekAgendaFromRows(rows);
    expect(agenda.itemCount).toBe(2); // go + come
    expect(agenda.dayCount).toBe(2); // روزِ ۰ و روزِ ۶
    expect(agenda.afterCount).toBe(2); // run + see
    const tail = agenda.rows[agenda.rows.length - 1];
    expect(tail.kind).toBe("afterWeek");
    if (tail.kind === "afterWeek") {
      expect(tail.count).toBe(2);
      expect(tail.nearestDaysUntil).toBe(7); // نزدیکترینِ دورترها
      expect(tail.nearestDay).toBe("2026-11-02");
      // r434 — نامِ نزدیکترین: روزِ ۷ فقط run را دارد (see روزِ ۸ است) —
      // شمارِ روزِ نزدیک و بانکِ رسمیِ آن از خودِ سطرها
      expect(tail.nearestCount).toBe(1);
      expect(tail.nearestBankIds).toEqual(["verbs"]);
    }
    expect(DRILL_WEEK_WINDOW).toBe(6); // پنجرهٔ ۷روزه: ۰ تا ۶
  });

  it("بیِ دورتر: سطرِ پس از هفته نیست — هفته تمام و کمال", () => {
    const rows = buildDrillCalendarAllRows(
      { verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, come: graceAgo(1) } },
      TODAY,
      HOSTS,
    );
    const agenda = buildDrillWeekAgendaFromRows(rows);
    expect(agenda.afterCount).toBe(0);
    expect(agenda.rows.some((r) => r.kind === "afterWeek")).toBe(false);
  });

  it("چینشِ روزبهروز: جمعِ روز پیشِ ردیفهایِ همان روز؛ روزها صعودی؛ بلوکِ رسمی درونِ روز", () => {
    const rows = buildDrillCalendarAllRows(
      {
        phonemes: { "æ": graceAgo(1) }, // بانکِ دوم — عمداً بیترتیب در نقشه
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // روزِ ۰
          come: graceAgo(1), // روزِ ۱
        },
      },
      TODAY,
      HOSTS,
    );
    const agenda = buildDrillWeekAgendaFromRows(rows);
    const kinds = agenda.rows.map((r) => (r.kind === "item" ? `item:${r.item.base}` : r.kind === "dayTotal" ? `total:${r.daysUntil}` : "after"));
    expect(kinds).toEqual([
      "total:0",
      "item:go", // سررسیدِ امروز — نخستین روز
      "total:1",
      "item:come", // بلوکِ رسمی: verbs پیشِ phonemes حتی درونِ یک روز
      "item:æ",
    ]);
  });

  it("جمعِ روزِ صادق: شمارِ همان روز — دو سررسیدِ یکروزه «2 مورد» میگویند نه کلِ هفته", () => {
    const rows = buildDrillCalendarAllRows(
      {
        verbs: {
          go: { wrong: 3, ok: 0, lastDay: "2026-10-20", lastOkDay: "" },
          see: { wrong: 1, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, // دومین سررسیدِ امروز
          come: graceAgo(1),
        },
      },
      TODAY,
      HOSTS,
    );
    const agenda = buildDrillWeekAgendaFromRows(rows);
    const totals = agenda.rows.filter((r) => r.kind === "dayTotal");
    expect(totals.map((t) => (t.kind === "dayTotal" ? t.count : -1))).toEqual([2, 1]);
    expect(agenda.itemCount).toBe(3);
    expect(agenda.dayCount).toBe(2);
  });

  it("گویشِ CSV: سرصفحهٔ دهستونیِ r420، CRLF، بیِ BOM؛ سطرِ جمع و پس از هفته به شکلِ مستند", () => {
    const rows = buildDrillCalendarAllRows(
      {
        verbs: {
          go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" },
          run: graceAgo(8),
        },
        phonemes: { "æ": graceAgo(1) },
      },
      TODAY,
      HOSTS,
    );
    const csv = buildDrillWeekAgendaCsv(buildDrillWeekAgendaFromRows(rows));
    expect(csv.startsWith(DRILL_CALENDAR_ALL_COLUMNS.join(","))).toBe(true);
    expect(csv.startsWith(CSV_BOM)).toBe(false);
    expect(csv.endsWith("\r\n")).toBe(true);
    const lines = csv.split("\r\n").filter((l) => l);
    expect(lines).toHaveLength(6); // سرصفحه + جمعِ ۰ + go + جمعِ ۱ + æ + پس از هفته
    expect(lines[1].split(",")).toEqual(["جمعِ روز", "", "", "1 مورد", "", "", "", TODAY, faWeekday(TODAY), "0"]); // خانهها دقیق — روزِ هفته از faWeekdayِ همان روز
    expect(lines[2]).toContain("سررسید,افعال بی‌قاعده,go,رفتن,2,0,");
    expect(lines[3].startsWith("جمعِ روز,,,1 مورد,,,,")); // فردا
    expect(lines[4]).toContain("درنفس,جدول تلفظ,æ,واکهٔ کشیدهٔ a,");
    expect(lines[5].startsWith("پس از هفته,,,1 موردِ دیگر,,,,")); // نزدیکترینِ دورترها = run
    expect(lines[5].endsWith(",8"));
  });

  it("خلوصِ تابعی: ورودیِ یکسان = رشتهٔ یکسان (امروز همیشه ورودی است، نه Date.now)", () => {
    const make = () =>
      buildDrillCalendarAllRows(
        { verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" }, come: graceAgo(2) } },
        TODAY,
        HOSTS,
      );
    const a = buildDrillWeekAgendaCsv(buildDrillWeekAgendaFromRows(make()));
    const b = buildDrillWeekAgendaCsv(buildDrillWeekAgendaFromRows(make()));
    expect(a).toBe(b);
  });

  describe("downloadDrillWeekAgendaCsv (ر344 COU)", () => {
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;

    afterEach(() => {
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    });

    it("پایِ سبز: نامِ فایلِ هفتگی و BOM در سرِ بایتها (درسِ r401: ignoreBOM)", async () => {
      let captured: Blob | null = null;
      Object.defineProperty(globalThis.URL, "createObjectURL", {
        value: (b: Blob) => {
          captured = b;
          return "blob:r421-fake";
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
          { verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } },
          TODAY,
          HOSTS,
        );
        const ok = downloadDrillWeekAgendaCsv(buildDrillWeekAgendaFromRows(rows), TODAY);
        expect(ok).toBe(true);
        const anchor = appended.find(
          (el) => (el as HTMLAnchorElement).download === `vision2-review-week-${TODAY}.csv`,
        );
        expect(anchor).toBeDefined();
        const buf = await captured!.arrayBuffer();
        const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(buf);
        expect(text.charCodeAt(0)).toBe(0xfeff); // BOM در سرِ فایل
        expect(text).toContain(DRILL_CALENDAR_ALL_COLUMNS.join(","));
        expect(text).toContain("جمعِ روز");
      } finally {
        document.body.appendChild = origAppend;
      }
    });

    it("پایِ سرخ: شکستِ COU → false", () => {
      Object.defineProperty(globalThis.URL, "createObjectURL", {
        value: () => {
          throw new TypeError("r421-test-cou");
        },
        writable: true,
        configurable: true,
      });
      const rows = buildDrillCalendarAllRows(
        { verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } },
        TODAY,
        HOSTS,
      );
      expect(downloadDrillWeekAgendaCsv(buildDrillWeekAgendaFromRows(rows), TODAY)).toBe(false);
    });
  });
});
