// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۷۴ — درِ چهارمِ خروجی و لهجهٔ v2:
//   ① «خروجی جدول مثال‌های درسنامه»: جدولِ BgExample ردیف‌به‌ردیف به
//      CSVِ اکسلِ معلم — لهجهٔ خانواده حالا نسخهٔ ۲ است: بی‌نقل‌قولِ v1
//      برایِ فیلدِ پاک + نقل‌قولِ کمینهٔ RFC 4180 برایِ فیلدِ
//      ویرگول‌دار (پیش‌سنجهٔ r274: ۵۵ جملهٔ انگلیسی ویرگولِ ASCII
//      دارند — بی‌نقل‌قولِ محض نمی‌ایستد؛ ascii-quote=۰ در کلِ داده —
//      شاخهٔ دوبل‌کردنِ امروز خاموش می‌ماند ولی قرارداد است).
//   ② دامنه‌ثابت: مثال‌ها به درس تعلق ندارند (دهمِ بنیان بی‌درس است —
//      صفرِ صادقانهٔ r220) و نوارِ دریل واژه‌محور است؛ پس شمارنده و
//      aria و توست پسوندِ دامنه نمی‌گیرند — حتی با چیپ‌هایِ درس/آستانه
//      فعال. «از ۳۴۷ نامزد» و «۲۰۵ مثال» دو جمعیتِ دو سندند (r268).
//
// لنگرهایِ پیش‌سنجهٔ r274: ۲۰۵ مثال در ۲۶ موضوع (۶ موضوعِ بی‌مثالِ
// صادقانه)، per-source دهم=۶۳/یازدهم=۴۳/دوازدهم=۹۹، پوششِ برچسب
// ۱۸۴/۲۰۵ (۲۱ ردیفِ بی‌برچسب — فیلدِ تهیِ صادقانه)، پنج جملهٔ شرطیِ
// مشترکِ دو موضوع (آینه نه ددوپ)، بزرگ‌ترین موضوع bg-relative-pronouns=۱۹.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import {
  buildGrammarExamplesCsv,
  csvField,
  GRAMMAR_EXAMPLES_CSV_COLUMNS,
  type GrammarExampleExportRow,
} from "@/lib/grammar-examples-csv";
import { buildPairsCsv } from "@/lib/pairs-csv";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { lessons } from "@/data";
import { faNum } from "@/lib/study-theme";

const { toastSpy, trackSpy } = vi.hoisted(() => ({ toastSpy: vi.fn(), trackSpy: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: trackSpy }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));
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
  toastSpy.mockClear();
  trackSpy.mockClear();
  cleanup();
});

const SRC = resolve(process.cwd(), "src");
const lastToast = () => toastSpy.mock.calls[toastSpy.mock.calls.length - 1][0] as {
  title: string;
  description: string;
};

/** آینهٔ مستقلِ جدول — همان ترتیبِ کامپوننت: هر موضوع، مثال‌هایش به ترتیبِ آرایه */
function rowsMirror(): GrammarExampleExportRow[] {
  return BOOKLET_GRAMMAR_TOPICS.flatMap((t) =>
    (t.examples ?? []).map((ex) => ({
      en: ex.en,
      fa: ex.fa,
      tag: ex.tag ?? "",
      topic: t.title,
      source: t.source,
      page: t.page,
    }))
  );
}

/** پارسرِ RFC-aware مستقل — هر خط را به فیلدها می‌شکند (نقل‌قولِ کمینه را می‌فهمد) */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQ = false; }
      else cur += ch;
    } else if (ch === '"' && cur === "") { inQ = true; }
    else if (ch === ",") { fields.push(cur); cur = ""; }
    else cur += ch;
  }
  fields.push(cur);
  return fields;
}

describe("درِ چهارمِ خروجی و لهجهٔ v2 — r274", () => {
  it("① buildGrammarExamplesCsv: سرستون + آینهٔ ردیف‌به‌ردیف + dialect (CRLF/کمینه-نقل‌قول/شش‌ستونه) + آینه نه ددوپ", () => {
    // سرستون دقیق
    expect(GRAMMAR_EXAMPLES_CSV_COLUMNS.join(",")).toBe("جمله,ترجمه,برچسب ساختاری,موضوع,مبدأ,صفحه");
    // جمعیت — لنگرهایِ پیش‌سنجهٔ r274
    const all = rowsMirror();
    expect(all.length).toBe(205);
    expect(all.filter((r) => r.source === "دهم").length).toBe(63);
    expect(all.filter((r) => r.source === "یازدهم").length).toBe(43);
    expect(all.filter((r) => r.source === "دوازدهم").length).toBe(99);
    // ۲۱ ردیفِ بی‌برچسب — فیلدِ تهیِ صادقانه
    expect(all.filter((r) => r.tag === "").length).toBe(21);
    // آینه نه ددوپ — جملهٔ شرطی در دو موضوع دو ردیف می‌گیرد
    const dups = all.filter((r) => r.en === "If you study more, you will learn a lot.");
    expect(dups.length).toBe(2);
    expect(new Set(dups.map((r) => r.topic)).size).toBe(2);
    // بزرگ‌ترین موضوع
    const rel = all.filter((r) => r.topic === BOOKLET_GRAMMAR_TOPICS.find((t) => t.id === "bg-relative-pronouns")!.title);
    expect(rel.length).toBe(19);
    // dialect: CRLF خالص؛ هر خط شش‌ستونه با پارسرِ RFC-aware
    const csv = buildGrammarExamplesCsv(all);
    expect(csv).not.toMatch(/(?<!\r)\n/);
    const lines = csv.split("\r\n").filter(Boolean);
    expect(lines.length).toBe(205 + 1);
    for (const line of lines) expect(parseCsvLine(line).length).toBe(6);
    // ردیفِ نخست — نخستین مثالِ نخستین موضوعِ مثال‌دارِ آرایه (bgs-alphabet بی‌مثال است — صفرِ صادقانه)
    const first = all[0];
    expect(first.en).toBe("Raman is a clever student. He gets good marks.");
    expect(parseCsvLine(lines[1])).toEqual([first.en, first.fa, first.tag, first.topic, first.source, first.page]);
    // سورس‌قرارداد: کامپوننت از خودِ BOOKLET_GRAMMAR_TOPICS می‌خواند
    const src = readFileSync(resolve(SRC, "components/study/lesson/booklet-grammar-view.tsx"), "utf8");
    expect(src).toContain("BOOKLET_GRAMMAR_TOPICS.flatMap");
    expect(src).toContain('data-testid="grammar-examples-export-csv"');
  }, 30000);

  it("② csvField: نقل‌قولِ کمینه — فیلدِ پاک عینِ v1؛ ویرگول‌دار یک‌جفت؛ نقل‌قول‌دار دوبل؛ و هم‌زیستیِ v1/v2", () => {
    // synthetic anchors
    expect(csvField("clean sentence")).toBe("clean sentence");
    expect(csvField("If you study more, you will learn a lot.")).toBe(
      '"If you study more, you will learn a lot."'
    );
    expect(csvField('say "hello"')).toBe('"say ""hello"""');
    // آینهٔ مستقلِ بایت‌به‌بایت رویِ کلِ ۲۰۵ — با بازتولیدِ قرارداد در تست
    const all = rowsMirror();
    const built = buildGrammarExamplesCsv(all);
    const independent = [GRAMMAR_EXAMPLES_CSV_COLUMNS.join(",")]
      .concat(
        all.map((r) =>
          [r.en, r.fa, r.tag, r.topic, r.source, r.page]
            .map((v) => (/[,"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
            .join(",")
        )
      )
      .join("\r\n") + "\r\n";
    expect(built).toBe(independent);
    // دقیقاً ۵۵ فیلدِ جمله نقل‌قول می‌گیرند و صفرِ فیلدِ نقل‌قولِ ASCII در داده است
    const quoted = all.filter((r) => /[,"]/.test(r.en)).length;
    expect(quoted).toBe(55);
    expect(all.some((r) => r.en.includes('"'))).toBe(false);
    expect(built.match(/""/g)?.length ?? 0).toBe(0); // دوبلِ امروز خاموش می‌ماند
    // هم‌زیستیِ v1/v2 — درِ جفت‌ها (r273) با دادهٔ پاکِ خودش بی‌نقل‌قول می‌ماند
    expect(buildPairsCsv(rowsMirrorPairs()).slice(0, 200)).not.toContain('"');
    // و بی‌BOM بودنِ بدنه — BOM کارِ دانلود است (خانواده)
    expect(built.charCodeAt(0)).not.toBe(0xfeff);
  });

  it("③ دکمهٔ خروجی در نوارِ درسنامه: شمارنده «جدول · ۲۰۵» + aria بی‌دامنه + دو جمعیتِ دو سند", () => {
    render(<BookletGrammarView />);
    const bar = screen.getByTestId("gram-drill-bar");
    const btn = within(bar).getByTestId("grammar-examples-export-csv");
    expect(btn.textContent).toContain(`جدول · ${faNum(205)}`);
    expect(btn).toHaveAttribute("aria-label", `خروجی CSV ${faNum(205)} مثالِ درسنامه`);
    // دامنه‌ثابت — title پسوندِ دامنه ندارد (نبودِ صادقانه)
    expect(btn.getAttribute("title")!).not.toContain("دامنه:");
    // دو جمعیتِ دو سند (r268): نوار «از ۳۴۷ نامزد» می‌گوید، دکمه «۲۰۵ مثال»
    const start = within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ });
    expect(start.getAttribute("aria-label")).toContain(`از ${faNum(347)} نامزد`);
    expect(start.getAttribute("aria-label")).not.toContain(faNum(205));
    // خانوادهٔ آسمانیِ درهایِ خروجی — همان لهجهٔ کلاسِ r260/۲۷۳
    expect(btn.className).toContain("border-sky-200");
    expect(btn.className).toContain("text-sky-700");
  }, 30000);

  it("④ توستِ خروجی: متنِ دقیقِ بی‌پسوندِ دامنه + trackEventِ نو؛ با دامنهٔ فعال هم aria دست نمی‌خورد", () => {
    const coSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    try {
      render(<BookletGrammarView />);
      const bar = screen.getByTestId("gram-drill-bar");
      act(() => {
        fireEvent.click(within(bar).getByTestId("grammar-examples-export-csv"));
      });
      expect(lastToast().title).toBe("خروجی CSV آماده شد");
      // بی‌پسوندِ صادقانه — دامنه‌ثابت
      expect(lastToast().description).toBe(
        `${faNum(205)} مثال در فایل vision2-grammar-examples.csv — در Excel/Sheets بازش کن.`
      );
      expect(trackSpy).toHaveBeenCalledWith("grammar_examples_csv");
      expect(trackSpy).toHaveBeenCalledTimes(1);
      // با چیپ‌هایِ درس/آستانه فعال، ariaِ شروع عوض می‌شود ولی خروجی ثابت می‌ماند
      act(() => {
        fireEvent.click(within(bar).getByTestId("gram-drill-min-10"));
        fireEvent.click(within(bar).getByTestId("gram-drill-scope-1"));
      });
      const start = within(bar).getByRole("button", { name: /شروع دریل مثال‌های درسنامه/ });
      expect(start.getAttribute("aria-label")).toContain(`واژه‌هایِ ${faNum(10)}+ کاربرد`);
      const btn = within(bar).getByTestId("grammar-examples-export-csv");
      expect(btn).toHaveAttribute("aria-label", `خروجی CSV ${faNum(205)} مثالِ درسنامه`);
    } finally {
      coSpy.mockRestore();
    }
  }, 30000);

  it("⑤ رگرسیونِ خانواده: گشت‌گذرِ کاملِ CSV→داده؛ جفت‌هایِ r273 و چیپ‌هایِ r265/r268 دست‌نخورده", () => {
    const all = rowsMirror();
    const csv = buildGrammarExamplesCsv(all);
    const lines = csv.split("\r\n").filter(Boolean).slice(1);
    // گشت‌گذرِ کامل: هر ۲۰۵ ردیفِ پارس‌شده عینِ دادهٔ منبع
    lines.forEach((line, i) => {
      expect(parseCsvLine(line)).toEqual([all[i].en, all[i].fa, all[i].tag, all[i].topic, all[i].source, all[i].page]);
    });
    // و رویدادِ نو در قراردادِ آنالیتیکس ثبت است
    const ev = readFileSync(resolve(SRC, "lib/analytics-events.ts"), "utf8");
    expect(ev).toContain('"grammar_examples_csv"');
    expect(ev).toContain("grammar_examples_csv:");
    // پیمانِ r271 — قفلِ سیمِ grPoolN سرِ جایش؛ پیمانِ r273 — درِ جفت‌ها بی‌نقل‌قول
    const gsrc = readFileSync(resolve(SRC, "components/study/lesson/booklet-grammar-view.tsx"), "utf8");
    expect(gsrc).toContain("const grPoolN = scopeChipCount(grScope);");
    expect(gsrc).toContain("downloadGrammarExamplesCsv(grammarExportRows)");
  }, 30000);
});

/** آینهٔ جفت‌ها برایِ گاردِ هم‌زیستی — همان rowsMirrorِ r273 در مقیاسِ کوچک */
function rowsMirrorPairs() {
  // فقط برایِ قفلِ «بی‌نقل‌قولِ v1 رویِ دادهٔ پاکِ جفت‌ها» — سه درسِ اول
  return lessons.slice(0, 3).flatMap((l) => [
    ...(l.synonyms ?? []).map((r) => ({ en: r.en, pair: r.syn, kind: "syn" as const, fa: r.fa, lessonId: l.id, lessonTitle: l.titleFa })),
    ...(l.antonyms ?? []).map((r) => ({ en: r.en, pair: r.ant, kind: "ant" as const, fa: r.fa, lessonId: l.id, lessonTitle: l.titleFa })),
  ]);
}
