// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۰ — «خروجی این دامنه» از لنزِ «کاربرددار» (بندِ ① پیشنهادِ ۲۵۹)
// + رتبهٔ پرکاربردی در خودِ دیالوگِ «کاربرد در جزوه» (بندِ ②).
//
// راند ۲۶۶ — ستونِ «سطح» به همین لهجه پیوست (بندِ ① پیشنهادِ ۲۶۵):
// قراردادهایِ زیر با هفتمین ستون هم‌نفس شدند — سلولِ سطح از خودِ count
// مشتق می‌شود (usageTierLabel) نه از ردیف، تا فراخوان ناساز نتواند بفرستد.
//
// قراردادهایِ تحتِ قفل:
//   · سازندهٔ CSV با dialekt خانوادهٔ ۱۶۹/۱۷۸/۱۸۰: BOM، CRLF، اعدادِ
//     ASCII، مقدارهایِ بی‌ویرگول؛ rank=null یعنی سلولِ خالی نه صفرِ ساختگی.
//   · دامنهٔ خروجی هیچ استقلالی ندارد: دقیقاً همان کارت‌هایِ دیدنیِ لنز
//     با همان ترتیب (آستانه × مرتب‌سازی هم در فایل می‌آید) — درسِ راند ۲۵۸.
//   · Anki = همان buildAnkiTsv موجود رویِ دامنهٔ باریک‌شده؛ countِ
//     برگشتی = کارت‌هایِ واقعیِ فایل (هم‌نام‌ها یکی می‌شوند).
//   · دیالوگ برایِ واژهٔ کاربرددار «رتبهٔ N از M» می‌گوید — همان
//     usedWordRankِ WOTD؛ شاخهٔ صفر-سایتِ درسنامه بی‌رتبه می‌ماند.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import UsageDialog from "@/components/study/lesson/usage-dialog";
import { findWordUsages, usedWordRank } from "@/lib/word-usage";
import { buildLensCsv, lensScopeTag, downloadLensCsv, usageTierLabel } from "@/lib/lens-csv";
import { LENS_CSV_COLUMNS, type LensExportRow } from "@/lib/lens-csv";
import { buildAnkiTsv } from "@/lib/anki-export";
import { faNum } from "@/lib/study-theme";
import { useStudy } from "@/lib/study-store";
import { lessons } from "@/data";

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

/** آینهٔ مستقلِ کارت‌هایِ کاربرددارِ n>=t به ترتیبِ اصلیِ جزوه */
function usedCards(t: number): { en: string; fa: string; lessonId: number; lessonTitle: string; count: number }[] {
  const out: { en: string; fa: string; lessonId: number; lessonTitle: string; count: number }[] = [];
  for (const l of lessons)
    for (const w of l.vocabulary) {
      const count = findWordUsages(w.en).length;
      if (count >= Math.max(1, t)) out.push({ en: w.en, fa: w.fa, lessonId: l.id, lessonTitle: l.titleFa, count });
    }
  return out;
}

/** نزولیِ پایدار (هم‌شمارها ترتیبِ اصلی) — آینهٔ سویچِ مرتب‌سازیِ r256 */
const desc = <T extends { count: number }>(rows: T[]): T[] => [...rows].sort((a, b) => b.count - a.count);

/** ردیف‌هایِ خروجیِ مستقل برایِ یک دامنه — همان قراردادِ lensRows در کامپوننت */
const exportRows = (cards: ReturnType<typeof usedCards>): LensExportRow[] =>
  cards.map((c) => ({ ...c, rank: usedWordRank(c.en)?.rank ?? null }));

describe("خروجی دامنهٔ لنز + رتبهٔ دیالوگ — r260", () => {
  it("① سازندهٔ CSV خالص: BOM در دانلود، CRLF، سرستون، اعدادِ ASCII، rank=null یعنی سلولِ خالی؛ برچسبِ دامنه درست", () => {
    const rows: LensExportRow[] = [
      { en: "language", fa: "زبان", lessonId: 1, lessonTitle: "زبان‌های دنیا", count: 21, rank: 61 },
      { en: "some", fa: "چند/برخی", lessonId: 2, lessonTitle: "درسِ دوم", count: 7, rank: null },
    ];
    const csv = buildLensCsv(rows);
    expect(csv).not.toContain("\uFEFF"); // BOM تنها در دانلود اضافه می‌شود
    expect(csv.endsWith("\r\n")).toBe(true);
    const lines = csv.split("\r\n").filter((l) => l !== "");
    expect(lines[0]).toBe(LENS_CSV_COLUMNS.join(","));
    expect(lines[1]).toBe("language,زبان,1,زبان‌های دنیا,21,61,پرکاربرد");
    expect(lines[2]).toBe("some,چند/برخی,2,درسِ دوم,7,,پرکاربرد"); // بی‌رتبه = خالی؛ سطحِ ۷+ = پرکاربرد
    expect(downloadLensCsv(rows, "all")).toBe(true); // dialektِ BOM در مسیرِ دانلود
    expect(lensScopeTag(null, 0)).toBe("all");
    expect(lensScopeTag(null, 10)).toBe("all-min10");
    expect(lensScopeTag(1, 0)).toBe("l1");
    expect(lensScopeTag(1, 20)).toBe("l1-min20");
  });

  it("② پارتیِ دامنهٔ کامل: هر ردیفِ CSV = کارتِ مستقل (شمارش و رتبه از همان سیم) با ساختارِ بی‌ویرگولِ خانواده", () => {
    const cards = usedCards(0); // ۱۹۱۵ کارتِ کاربرددار — پیش‌سنجهٔ r260
    expect(cards.length).toBeGreaterThan(1900);
    const csv = buildLensCsv(exportRows(cards));
    const lines = csv.split("\r\n").filter((l) => l !== "");
    expect(lines.length).toBe(cards.length + 1);
    for (let i = 0; i < cards.length; i++) {
      const fields = lines[i + 1].split(",");
      expect(fields.length).toBe(LENS_CSV_COLUMNS.length); // مقدارها بی‌ویرگول — dialektِ خانواده
      expect(lines[i + 1]).not.toContain('"');
      const c = cards[i];
      expect(fields[0]).toBe(c.en);
      expect(fields[1]).toBe(c.fa);
      expect(fields[2]).toBe(String(c.lessonId));
      expect(fields[3]).toBe(c.lessonTitle);
      expect(fields[4]).toBe(String(findWordUsages(c.en).length)); // شمارش = همان سیم
      const rank = usedWordRank(c.en);
      expect(rank).not.toBeNull(); // پیش‌شرط: کاربرددار همیشه رتبه دارد
      expect(fields[5]).toBe(String(rank!.rank));
      expect(fields[6]).toBe(usageTierLabel(c.count)); // سطح = نگاشتِ خودِ شمارش
      expect(fields[4]).toMatch(/^\d+$/); // اعدادِ ASCII — اکسل حساب کند
    }
  });

  it("③ UI: ردیفِ خروجی فقط در لنز؛ دانلودِ CSV = دقیقاً دامنهٔ دیدنی (آستانه×مرتب‌سازی) با نامِ فایلِ دامنه‌دار؛ دامنهٔ صفر می‌میرد", async () => {
    render(<DictionaryView />);
    expect(screen.queryByTestId("dict-export-row")).not.toBeInTheDocument(); // بیرونِ لنز هیچ
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const row = screen.getByTestId("dict-export-row");
    const csvBtn = within(row).getByTestId("dict-export-csv");
    // شمارندهٔ دکمه = خطِ «N واژه یافت شد»
    const total = usedCards(0).length;
    expect(csvBtn.textContent).toContain(faNum(total));
    expect(screen.getByText(new RegExp(`^${faNum(total)} واژه یافت شد$`))).toBeInTheDocument();

    // آستانهٔ ۱۰+ + مرتب‌سازی → دانلود = همان دامنهٔ باریک‌شدهٔ نزولی
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    const narrowed = usedCards(10);
    expect(csvBtn.textContent).toContain(faNum(narrowed.length));

    const origCreate = document.createElement.bind(document);
    const anchors: HTMLAnchorElement[] = [];
    const ceSpy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreate(tag) as HTMLAnchorElement;
      if (tag === "a") {
        anchors.push(el);
        el.click = vi.fn(); // jsdom navigation را بی‌سروصدا می‌بندد
      }
      return el;
    });
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    let blobText = "";
    try {
      act(() => {
        fireEvent.click(csvBtn);
      });
      expect(coSpy).toHaveBeenCalledTimes(1);
      const blob = coSpy.mock.calls[0][0] as Blob;
      // BOMِ صریح — بایت‌به‌بایت (blob.text() طبق استانداردِ UTF-8 decodeِ BOM را می‌خورد)
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
      blobText = await blob.text();
    } finally {
      ceSpy.mockRestore();
    }
    expect(anchors[0].download).toBe("vision2-used-all-min10.csv");
    expect(blobText).toBe(buildLensCsv(exportRows(desc(narrowed)))); // متنِ بدونِ BOM — BOM بالا بایت‌به‌بایت سنجیده شد
    // ترتیبِ فایل = ترتیبِ دیدنی — سرِ فایل با سرِ کارت‌هایِ رندرشده یکی است
    const rendered = screen
      .getAllByTestId(/^usage-chip-.+$/)
      .map((c) => c.getAttribute("aria-label")!.match(/کاربرد (.+?) در جزوه/)![1]);
    expect(blobText.split("\r\n")[1].split(",")[0]).toBe(rendered[0]);

    // دامنهٔ صفر: جستجویِ بی‌جواب → دکمه‌ها می‌میرند (صداقتِ صفر)
    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/language یا زبان/), { target: { value: "zzzqqq" } });
    });
    expect(screen.getByTestId("dict-export-csv")).toBeDisabled();
    expect(screen.getByTestId("dict-export-anki")).toBeDisabled();
  });

  it("④ UI: خروجی Anki = ددوپِ مستقلِ هم‌نام‌ها رویِ دامنهٔ باریک‌شده؛ سرِ فایل directive، سرِ کارت‌ها پرکاربردترین", async () => {
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("dict-minused-10"));
    });
    // ترتیبِ دیدنی = نزولی (همان سویچِ r256) — فایل هم همان ترتیب را می‌بیند
    act(() => {
      fireEvent.click(screen.getByTestId("dict-sort-usage"));
    });
    const cards = desc(usedCards(10));
    const unique = new Set(cards.map((c) => c.en.trim().toLowerCase()));
    expect(unique.size).toBeLessThan(cards.length); // پیش‌شرط: در این دامنه هم‌نام فرو می‌ریزد

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
        fireEvent.click(screen.getByTestId("dict-export-anki"));
      });
      const blob = coSpy.mock.calls[0][0] as Blob;
      blobText = await blob.text();
    } finally {
      ceSpy.mockRestore();
    }
    expect(anchors[0].download).toBe("vision2-used-all-min10-anki.txt");
    const expected = buildAnkiTsv(cards.map((c) => ({ en: c.en, fa: c.fa })));
    expect(blobText).toBe(expected.tsv);
    expect(expected.count).toBe(unique.size); // countِ صادقانه = کارت‌هایِ واقعیِ فایل
    const dataLines = blobText.split("\n").filter((l) => l && !l.startsWith("#"));
    expect(dataLines.length).toBe(unique.size);
    expect(dataLines[0].startsWith("of\t")).toBe(true); // پرکاربردترینِ جزوه سرِ فایل
  });

  it("⑤ رتبه در دیالوگ: واژهٔ کاربرددار «رتبهٔ N از M» می‌گوید (مستقل)؛ شاخهٔ صفر-سایتِ درسنامه بی‌رتبه می‌ماند؛ مسیرِ UI هم همان", () => {
    // شاخهٔ صفر-سایت — loaf در پیکره سایت ندارد (پیش‌سنجهٔ r259)
    expect(usedWordRank("loaf")).toBeNull();
    const { unmount } = render(<UsageDialog usage={{ en: "loaf", sites: [] }} onClose={() => {}} />);
    expect(screen.getByTestId("usage-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("usage-rank")).not.toBeInTheDocument(); // بی‌رتبه، صادقانه
    unmount();
    cleanup();

    // دیالوگِ مستقل با واژهٔ کاربرددار — رتبه = مستقلِ usedWordRank
    const sites = findWordUsages("of");
    render(<UsageDialog usage={{ en: "of", sites }} onClose={() => {}} />);
    const ofRank = usedWordRank("of")!;
    expect(screen.getByTestId("usage-rank").textContent).toBe(
      `رتبهٔ ${faNum(ofRank.rank)} از ${faNum(ofRank.total)}`
    );
    expect(screen.getByTestId("usage-rank").textContent).toContain(faNum(1)); // پرکاربردترینِ جزوه
    unmount();
    cleanup();

    // مسیرِ UI: از چیپِ کارتِ دلخواه در لنز — رتبه = مستقل
    render(<DictionaryView />);
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /کاربرددار/ }));
    });
    const chip = screen
      .getAllByTestId(/^usage-chip-.+$/)
      .find((c) => {
        const word = c.getAttribute("aria-label")!.match(/کاربرد (.+?) در جزوه/)![1];
        const r = usedWordRank(word);
        return r !== null && r.rank > 1 && r.count >= 3;
      })!;
    const word = chip.getAttribute("aria-label")!.match(/کاربرد (.+?) در جزوه/)![1];
    act(() => {
      fireEvent.click(chip);
    });
    const dialog = screen.getByTestId("usage-dialog");
    const rank = usedWordRank(word)!;
    expect(within(dialog).getByTestId("usage-rank").textContent).toBe(
      `رتبهٔ ${faNum(rank.rank)} از ${faNum(rank.total)}`
    );
    expect(within(dialog).getByText(`در جزوه · ${faNum(rank.count)} کاربرد`)).toBeInTheDocument();
    act(() => {
      fireEvent.click(within(dialog).getByRole("button", { name: /Close/i }));
    });
    expect(screen.queryByTestId("usage-dialog")).not.toBeInTheDocument();
  });
});
