// @vitest-environment jsdom
// ---------------------------------------------------------------------
// r434 — «نامِ نزدیکترینِ پس از هفته» — قفلهایِ دنباله و نوارِ آرام.
//
// پیشنهادِ ①ِ r433: دنبالهٔ «+N پس از هفته» و نوارِ «این هفته آرام است»
// تا دیروز فقط «کِی» میگفتند (و دنباله حتی «چند») — یادگیرنده برایِ
// «چه چیزی» باید CSV را باز میکرد. r434: نام میگویند — عینِ خانوادهٔ
// گویشِ r433، فقط در title/aria (صفر شلوغیِ بصری):
//  · کتابخانه (خالص): سطرِ afterWeek حالا nearestCount و nearestBankIds
//    روزِ نزدیکترین را حمل میکند — بانکهایِ متمایز به ترتیبِ بلوکیِ
//    رسمیِ r420 (نخستینِ برخورد، حتی اگر نقشه بیترتیب بذر شده باشد)؛
//    CSVِ هفته این فیلدها را نادیده میگیرد (قراردادِ سطریِ r421)
//  · دنبالهٔ زنده: تکبانکِ شناخته «تمرینِ X»، چندبانکِ همروز «N مورد
//    در M بانک» (r425)، بانکِ ناشناس «N مورد» (r236 — نه کلیدِ خام
//    نه نامِ برساخته)؛ متنِ دیدنی همان «+N پس از هفته» میماند
//  · نوارِ آرام: «نزدیکترین بازگشت: [نام]، [کِی]» — aria همان زبان
//  · ظرفِ نوار: زیررشتهٔ قفلشدهٔ r425 سرِ جایش است و سندِ گویشِ نو
//    («دنبالهٔ پس از هفته نامِ نزدیکترین بازگشت را میگوید») بهش
//    پیوسته (ایدئومِ r433)
//  · کارتِ PNG (r423) دستنخورده: afterLabel همچنان فقط «کِی» میگوید
//    (بندِ ③ REQUIRES-JUDGEMENT — این راند دست نمیزند)
// ---------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  buildDrillCalendarAllRows,
  buildDrillWeekAgendaFromRows,
  buildDrillWeekAgendaCsv,
  type DrillCalendarHosts,
} from "@/lib/drill-calendar-csv";
import ReportCard from "@/components/study/reports/report-card";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { daysAgoKey } from "@/state/day-engine";
import { consonantPhonemes, vowelPhonemes } from "@/data/appendix";

// ============================================================ pure locks

const TODAY = "2026-10-26";
const graceAgo = (daysUntil: number) => {
  const ladder = [1, 2, 4, 8];
  const ok = ladder.findIndex((g) => g >= daysUntil) + 1;
  const graceDays = Math.min(2 ** (ok - 1), 8);
  const ago = graceDays - daysUntil;
  const iso = (d: Date) =>
    d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const shift = (n: number) => iso(new Date(Date.parse(TODAY + "T12:00:00Z") - n * 86400000));
  return { wrong: ok + 1, ok, lastDay: shift(ago + 1), lastOkDay: shift(ago) };
};

const HOSTS: DrillCalendarHosts = {
  labelFor: () => () => "",
  titleFor: (bankId) => ({ verbs: "افعال بی‌قاعده", phonemes: "جدول تلفظ" }[bankId] ?? ""),
  order: ["verbs", "phonemes", "words", "abbrev", "lesson-vocab", "dict-vocab", "bg-examples"],
};

const tailOf = (map: Parameters<typeof buildDrillCalendarAllRows>[0]) => {
  const agenda = buildDrillWeekAgendaFromRows(buildDrillCalendarAllRows(map, TODAY, HOSTS));
  const tail = agenda.rows.find((r) => r.kind === "afterWeek");
  if (!tail || tail.kind !== "afterWeek") return null;
  return { agenda, tail };
};

describe("r434 pure — دنبالهٔ پس از هفته نام حمل میکند", () => {
  it("تساویِ همروزیِ دوبانکی: بانکها به ترتیبِ بلوکیِ رسمی میآیند — نه ترتیبِ نقشه", () => {
    // نقشه عمداً بیترتیب: phonemes جلوتر از verbs — ترتیبِ رسمی باید برنده شود
    const r = tailOf({
      phonemes: { "æ": graceAgo(8) },
      verbs: { run: graceAgo(8) },
    });
    expect(r).toBeTruthy();
    expect(r!.tail.count).toBe(2); // کلِ دنباله
    expect(r!.tail.nearestCount).toBe(2); // هر دو همروزِ نزدیکترین
    expect(r!.tail.nearestDaysUntil).toBe(8);
    expect(r!.tail.nearestBankIds).toEqual(["verbs", "phonemes"]); // رسمی
  });

  it("روزهایِ دورِ نامساوی: شمارِ روزِ نزدیک فقط خودِ همان روز است", () => {
    const r = tailOf({
      verbs: { run: graceAgo(7), see: graceAgo(8) },
    });
    expect(r!.tail.count).toBe(2); // کل
    expect(r!.tail.nearestCount).toBe(1); // فقط run در روزِ ۷
    expect(r!.tail.nearestBankIds).toEqual(["verbs"]);
  });

  it("بانکِ ناشناس: شناسهٔ خام حمل میشود — عنوانش تهی است و CSV بانکِ نمیدهد", () => {
    const r = tailOf({ "ghost-bank": { zz: graceAgo(8) } });
    expect(r!.tail.nearestCount).toBe(1);
    expect(r!.tail.nearestBankIds).toEqual(["ghost-bank"]);
    // قراردادِ سطریِ r421 دستنخورده — ستونِ بانکِ سطرِ دنباله تهی میماند
    const csv = buildDrillWeekAgendaCsv(r!.agenda);
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines[lines.length - 1].startsWith("پس از هفته,,,1 موردِ دیگر,,,,")).toBe(true);
  });

  it("بیِ دورتر: سطری نیست که نامی حمل کند — هفته تمام و کمال", () => {
    const r = tailOf({ verbs: { go: { wrong: 2, ok: 0, lastDay: "2026-10-20", lastOkDay: "" } } });
    expect(r).toBeNull();
  });
});

// =========================================================== jsdom locks

const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — زیرِ هر تاریخِ اجرا
const SYM = [...vowelPhonemes, ...consonantPhonemes].find((p) => p.symbol && p.fa)!.symbol;

/** درنفسِ دور — ok=4 نردبانِ ۸روزه؛ با lastOkDayِ امروز بیرونِ پنجره میماند */
const graceFar = () => ({ wrong: 5, ok: 4, lastDay: YESTERDAY, lastOkDay: daysAgoKey(0) });
const dueEntry = () => ({ wrong: 2, ok: 0, lastDay: YESTERDAY, lastOkDay: "" });

const tailEl = () =>
  [...screen.queryAllByLabelText(/هفتهٔ پیشِ رو/)]
    .flatMap((el) => [...el.querySelectorAll("[title]")])
    // پیشوندِ دقیقِ دنباله — عنوانِ نوارِ آرام («…پس از این هفته
    // برمیگردند») هم همین زیررشته را دارد؛ دنباله فقط با «پس از این
    // هفته N موردِ…» آغاز میشود
    .find((el) => (el.getAttribute("title") || "").startsWith("پس از این هفته"));

const quiet = () => screen.queryByLabelText(/این هفته چیزی برنمیگردد/);

describe("r434 view — دنباله و نوارِ آرام نام میگویند", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  afterEach(() => {
    cleanup();
  });

  it("دنبالهٔ زندهٔ تکبانکی: title نامِ رسمی + «کِی» دارد؛ متنِ دیدنی همان +N میماند", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry(), run: graceFar() }, // امروز + پس از هفته
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const tail = tailEl();
    expect(tail).toBeTruthy();
    expect(tail!.getAttribute("title")).toBe(
      `پس از این هفته ${faNum(1)} موردِ دیگر در راه است — نزدیکترین بازگشتِ ${faNum(8)} روزِ دیگر: تمرینِ افعال بی‌قاعده`,
    );
    expect(tail!.textContent).toBe(`+${faNum(1)} پس از هفته`); // صفر شلوغیِ نو
    // ظرفِ نوار: زیررشتهٔ قفلشدهٔ r425 + سندِ گویشِ نو (ایدئومِ r433)
    // (selectorِ کلاس — ariaِ «هفتهٔ پیشِ رو» را دکمههایِ CSV/تصویر هم دارند)
    const strip = document.querySelector(".week-strip");
    expect(strip).toBeTruthy();
    const t = strip!.getAttribute("title") || "";
    expect(t).toContain("خانهٔ امروز با سررسیدِ تکبانک پرش به تمرین دارد");
    expect(t).toContain("دنبالهٔ پس از هفته نامِ نزدیکترین بازگشت را میگوید");
  });

  it("دنبالهٔ زندهٔ دوبانکیِ همروز: گویشِ «در M بانک» — عینِ r425", () => {
    useStudy.setState({
      drillMistakes: {
        // نقشه بیترتیب — بانکِ رسمی (verbs) باید نخستِ نام باشد
        phonemes: { [SYM]: graceFar() },
        verbs: { go: dueEntry(), run: graceFar() },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const tail = tailEl();
    expect(tail!.getAttribute("title")).toBe(
      `پس از این هفته ${faNum(2)} موردِ دیگر در راه است — نزدیکترین بازگشتِ ${faNum(8)} روزِ دیگر: ${faNum(2)} مورد در ${faNum(2)} بانک`,
    );
  });

  it("دنبالهٔ زندهٔ بانکِ ناشناس: شمارِ صادق — نه کلیدِ خام نه نامِ برساخته (r236)", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: { go: dueEntry() },
        "ghost-bank": { zz: graceFar() },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const tail = tailEl();
    expect(tail!.getAttribute("title")).toBe(
      `پس از این هفته ${faNum(1)} موردِ دیگر در راه است — نزدیکترین بازگشتِ ${faNum(8)} روزِ دیگر: ${faNum(1)} مورد`,
    );
    expect(tail!.getAttribute("title")).not.toContain("ghost");
    expect(tail!.getAttribute("title")).not.toContain("zz");
  });

  it("نوارِ آرامِ دوبانکی: «۲ مورد در ۲ بانک، ۸ روزِ دیگر» — متن و aria همزبان", () => {
    useStudy.setState({
      drillMistakes: {
        phonemes: { [SYM]: graceFar() },
        verbs: { run: graceFar() },
      },
    });
    render(<ReportCard open onClose={() => {}} />);
    const q = quiet();
    expect(q).toBeTruthy();
    expect(q!.textContent).toBe(
      `این هفته آرام است — نزدیکترین بازگشت: ${faNum(2)} مورد در ${faNum(2)} بانک، ${faNum(8)} روزِ دیگر`,
    );
    expect(q!.getAttribute("aria-label")).toBe(
      `هفتهٔ پیشِ رو — این هفته چیزی برنمیگردد؛ نزدیکترین بازگشت ${faNum(2)} مورد در ${faNum(2)} بانک، ${faNum(8)} روزِ دیگر`,
    );
    expect(tailEl()).toBeUndefined(); // شکلِ هفتخانهای رندر نشده — سطرِ آرام جانشین است
  });

  it("نوارِ آرامِ بانکِ ناشناس: شمارِ صادق بیِ نام — و بیِ کلیدِ خام", () => {
    useStudy.setState({
      drillMistakes: { "ghost-bank": { zz: graceFar() } },
    });
    render(<ReportCard open onClose={() => {}} />);
    const q = quiet();
    expect(q!.textContent).toBe(
      `این هفته آرام است — نزدیکترین بازگشت: ${faNum(1)} مورد، ${faNum(8)} روزِ دیگر`,
    );
    expect(q!.getAttribute("aria-label")).not.toContain("ghost");
    expect(q!.getAttribute("aria-label")).not.toContain("zz");
  });
});
