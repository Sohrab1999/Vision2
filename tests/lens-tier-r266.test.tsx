// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۶ — ستونِ «سطح» در CSVِ لنز (بندِ ① پیشنهادِ ۲۶۵)
//
// سطح = نگاشتِ ثابتِ شمارشِ کاربرد: ۵+ «پرکاربرد» · ۲–۴ «میانه» ·
// ۱ «کم‌کاربرد» — برشی که رویِ مرزِ نوارهایِ هم‌شمار می‌نشیند.
// پیش‌سنجهٔ r266 ثابت کرد ثلثِ خامِ رتبه (۶۳۹/۱۲۷۷) داخلِ نوارِ count=4
// و نوارِ ۶۵۲تاییِ count=1 می‌افتد و واژه‌هایِ هم‌شمار را در دو سطح
// می‌شکافت؛ برشِ ۵+/۲–۴/۱ هم مقاوم به تساوی است، هم با مرزِ آشنایِ
// «۵+» لنز (راند ۲۵۸/۲۶۵) هم‌نفس، هم امروز متوازن: ۵۳۷/۷۲۶/۶۵۲.
//
// قراردادهایِ تحتِ قفل:
//   · usageTierLabel نگاشتِ خالصِ count است — سلولِ سطح داخلِ
//     buildLensCsv از خودِ count مشتق می‌شود، نه از ردیف (فراخوانِ
//     ناساز نمی‌تواند سطحِ قلابی بفرستد).
//   · تعمیمِ «هم‌شمارها هم‌رتبه»یِ r260: هم‌شمارها هم‌سطح — هیچ نوارِ
//     هم‌شماری بینِ دو سطح نصفه نمی‌شود.
//   · لهجهٔ CSV دست‌نخورده می‌ماند (BOM/CRLF/ASCII/بی‌ویرگول) و خانوادهٔ
//     Anki TSV ستونِ نو نمی‌گیرد — سطح مالِ dialektِ CSV است.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import { findWordUsages } from "@/lib/word-usage";
import { buildLensCsv, usageTierLabel, LENS_CSV_COLUMNS } from "@/lib/lens-csv";
import { buildAnkiTsv } from "@/lib/anki-export";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";
import type { LensExportRow } from "@/lib/lens-csv";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "reading",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

/** آینهٔ مستقلِ نگاشتِ سطح — بازنویسیِ تحت‌اللفظیِ قرارداد، نه فراخوانِ سیم */
const tierMirror = (count: number): string =>
  count >= 5 ? "پرکاربرد" : count >= 2 ? "میانه" : count === 1 ? "کم‌کاربرد" : "";

/** ردیف‌سازِ مستقل — همان قراردادِ lensRowsِ کامپوننت */
const liveRow = (en: string): LensExportRow => {
  for (const l of lessons) {
    const w = l.vocabulary.find((v) => v.en.trim().toLowerCase() === en.trim().toLowerCase());
    if (w)
      return {
        en: w.en,
        fa: w.fa,
        lessonId: l.id,
        lessonTitle: l.titleFa,
        count: findWordUsages(w.en).length,
        rank: null,
      };
  }
  throw new Error(`word not found: ${en}`);
};

describe("ستونِ سطحِ CSVِ لنز — r266", () => {
  it("① نگاشتِ خالص: آینهٔ مستقل رویِ ۰..۳۰ + مرزهایِ دقیق (۱/۲/۴/۵) + صفرِ بی‌سطحِ صادقانه", () => {
    // مرزهایِ دقیق — جایی که ثلثِ خام می‌شکست و این نگاشت نمی‌شکند
    expect(usageTierLabel(0)).toBe(""); // بی‌کاربرد = بی‌سطح (در لنز هرگز)
    expect(usageTierLabel(1)).toBe("کم‌کاربرد");
    expect(usageTierLabel(2)).toBe("میانه");
    expect(usageTierLabel(4)).toBe("میانه");
    expect(usageTierLabel(5)).toBe("پرکاربرد");
    expect(usageTierLabel(91)).toBe("پرکاربرد"); // of — پرکاربردترینِ جزوه
    // جاروبِ کاملِ بازه — آینه بایت‌به‌بایت با سیم
    for (let c = 0; c <= 30; c++) expect(usageTierLabel(c)).toBe(tierMirror(c));
  });

  it("② CSV با لنگرهایِ واقعی: سرستون با «سطح» تمام می‌شود؛ سلولِ سطح از خودِ count می‌آید — نه از ردیف", () => {
    expect(LENS_CSV_COLUMNS[LENS_CSV_COLUMNS.length - 1]).toBe("سطح");
    // لنگرها از پیش‌سنجهٔ r266/r262: of=۹۱ پرکاربرد، language=۲۱ پرکاربرد،
    // communication=۳ میانه، ability=۱ کم‌کاربرد — چهار سطحِ مرزیِ زنده
    const anchors = ["of", "language", "communication", "ability"];
    const rows = anchors.map(liveRow);
    expect(rows.map((r) => r.count)).toEqual([91, 21, 3, 1]);
    const csv = buildLensCsv(rows);
    const lines = csv.split("\r\n").filter((l) => l !== "");
    expect(lines.length).toBe(anchors.length + 1);
    expect(lines[0]).toBe(LENS_CSV_COLUMNS.join(","));
    for (let i = 0; i < rows.length; i++) {
      const fields = lines[i + 1].split(",");
      expect(fields.length).toBe(LENS_CSV_COLUMNS.length);
      expect(fields[6]).toBe(tierMirror(rows[i].count)); // سلول = نگاشتِ شمارش
      expect(lines[i + 1]).not.toContain('"');
    }
    expect(lines[1].endsWith(",پرکاربرد")).toBe(true); // of
    expect(lines[3].endsWith(",میانه")).toBe(true); // communication
    expect(lines[4].endsWith(",کم‌کاربرد")).toBe(true); // ability
  });

  it("③ پارتیِ کاملِ ۱۹۱۵تایی: توزیعِ ۵۳۶/۷۲۷/۶۵۲ + هم‌شمارها هم‌سطح (هیچ نوارِ هم‌شماری نصفه نمی‌شود)", () => {
    const dist = { پرکاربرد: 0, میانه: 0, کم‌کاربرد: 0 } as Record<string, number>;
    const tierOfCount = new Map<number, string>(); // هم‌شمارها هم‌سطح
    let ranked = 0;
    for (const l of lessons)
      for (const w of l.vocabulary) {
        const count = findWordUsages(w.en).length;
        if (count === 0) continue;
        ranked++;
        const tier = tierMirror(count);
        dist[tier]++;
        const prev = tierOfCount.get(count);
        expect(prev === undefined || prev === tier).toBe(true); // پیمانِ هم‌سطحی
        tierOfCount.set(count, tier);
      }
    expect(ranked).toBe(1915); // پیش‌سنجهٔ r260/r266
    expect(dist["پرکاربرد"]).toBe(536); // count≥۵ — نوارِ [۱..۵۳۶]ِ پیش‌سنجهٔ r266
    expect(dist["میانه"]).toBe(727); // count ۲..۴ — نوارِ [۵۳۷..۱۲۶۳]
    expect(dist["کم‌کاربرد"]).toBe(652); // count=۱ — نوارِ ۶۵۲تاییِ یکپارچهٔ [۱۲۶۴..۱۹۱۵]
    expect(dist["پرکاربرد"] + dist["میانه"] + dist["کم‌کاربرد"]).toBe(ranked);
    // هر سه سطح زنده‌اند — هیچ سطحِ تهیِ ساختگی در فایل معلم نمی‌نشیند
    for (const v of Object.values(dist)) expect(v).toBeGreaterThan(0);
  });

  it("④ UI end-to-end: فایلِ دانلودشدهٔ لنز سرستونِ «سطح» دارد و در دامنهٔ ۱۰+ همهٔ سطرها پرکاربردند", async () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    // آستانهٔ ۱۰+ + مرتب‌سازیِ نزولی — همان ایدئومِ پیمانِ r260
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    const csvBtn = screen.getByTestId("dict-export-csv");
    const narrowed = 263; // لنگرِ آستانهٔ ۱۰+ِ لنز (پیش‌سنجهٔ r266 — متمایز از ۹۵ِ دریلِ درسنامه)
    expect(csvBtn.textContent).toContain(faNum(narrowed));

    const origCreate = document.createElement.bind(document);
    const anchors: HTMLAnchorElement[] = [];
    const ceSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag) as HTMLAnchorElement;
      if (tag === "a") {
        anchors.push(el);
        el.click = vi.fn();
      }
      return el;
    });
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    let blobText = "";
    try {
      act(() => {
        fireEvent.click(csvBtn);
      });
      const blob = coSpy.mock.calls[0][0] as Blob;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]); // BOMِ صریح
      blobText = await blob.text();
    } finally {
      ceSpy.mockRestore();
    }
    expect(anchors[0].download).toBe("vision2-used-all-min10.csv");
    const lines = blobText.split("\r\n").filter((l) => l !== "");
    expect(lines[0].endsWith(",سطح")).toBe(true);
    expect(lines.length).toBe(narrowed + 1);
    // دامنهٔ ۱۰+ ⇒ شمارشِ هر ردیف ≥ ۱۰ ⇒ سطحِ همه پرکاربرد — فیلترِ معلم
    // با چیپِ «۱۰+» لنز هم‌نفس است
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(",");
      expect(Number(fields[4])).toBeGreaterThanOrEqual(10);
      expect(fields[6]).toBe("پرکاربرد");
    }
    // سرِ فایل = پرکاربردترینِ دامنه — of با رتبهٔ ۱ و سطحِ پرکاربرد
    expect(lines[1].startsWith("of,")).toBe(true);
    expect(lines[1].split(",")).toEqual(["of", expect.any(String), expect.any(String), expect.any(String), "91", "1", "پرکاربرد"]);
  });

  it("⑤ مرزِ خانواده: سطح فقط در dialektِ CSV زندگی می‌کند — TSVِ Anki ستونِ نو نمی‌گیرد", () => {
    const cards = [liveRow("of"), liveRow("ability")].map((r) => ({ en: r.en, fa: r.fa }));
    const { tsv, count } = buildAnkiTsv(cards);
    expect(count).toBe(2);
    const dataLines = tsv.split("\n").filter((l) => l && !l.startsWith("#"));
    for (const line of dataLines) {
      expect(line.split("\t").length).toBe(2); // en + fa — بدونِ ستونِ سطح
      expect(line).not.toContain("سطح");
      expect(line).not.toContain("پرکاربرد");
    }
    // و بازگشت به CSV: همان کارت‌ها آنجا سطح می‌گیرند — تفکیکِ دو dialekt
    const csv = buildLensCsv(cards.map((c) => ({ ...liveRow(c.en), rank: null })));
    expect(csv.split("\r\n")[1].split(",").length).toBe(LENS_CSV_COLUMNS.length);
  });
});
