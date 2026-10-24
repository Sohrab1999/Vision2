// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۶ — بندهای ①+② پیشنهادهایِ ۲۶۵: مقیاسِ دوتاییِ پانویس و
// صداقتِ توزیعِ یکنواخت
//
//   ① پانویسِ پنلِ مقایسه حالا درصدِ همان جمع‌ها را هم می‌گوید:
//      «جمعِ ۱۲ درس: ۱۹۱۵ از ۴۰۳۲ واژه در جزوه (٪۴۷٫۵) · بی‌کاربردها:
//      ۲۱۱۷ واژه (٪۵۲٫۵)» — مخرج‌هایِ tooltipهایِ r265 با درصدشان در خودِ
//      پنل مرئی می‌شوند؛ درصد از همان memo (pctFa) — هرگز رشتهٔ منجمد.
//   ② tooltipِ شمارندهٔ صدرنشین توزیعِ یکنواخت را می‌شناسد: وقتی «همهٔ»
//      درس‌هایِ توزیع هم‌شمارند (leaderLessons.length === lessonCounts.length
//      و >۱)، پسوندِ «توزیعِ یکنواخت (همهٔ درس‌ها هم‌شمارند)» افزوده می‌شود —
//      افزودنِ نه جایگزینی: «اینجا K درسِ هم-بیشینه‌اند» قفلِ r265 سبز می‌ماند.
//      برایِ تساویِ جزئی «یکنواخت» دروغ است و نمی‌آید.
//
// لنگرهایِ پیش‌شمارشِ r266 (scripts/precount-r266.ts):
//   پیکره: ۱۹۱۵/۴۰۳۲ = ٪۴۷٫۵ · ۲۱۱۷/۴۰۳۲ = ٪۵۲٫۵ (گردِ مستقل)
//   نوارهایِ باز: ۵۴۹ = یگانهِ ۳۱۸ + یکنواختِ ۱۷۳ + جزئیِ ۵۸
//   یکنواختِ بی-لنز: absolutely (۲ درس × ۱) · جزئی: interest (۲ از ۴)
//   بیشینهٔ هم-بیشینه: conversation با ۱۰ درسِ هم‌شمار — یکنواخت
//   لنزِ مکالمهٔ change: ۵=۱·۹=۱ — یکنواختِ زیرِ لنز
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import DictionaryView from "@/components/study/lesson/dictionary-view";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { lessonsVocabUsageRanking as RANKING, findWordUsages } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), speakFailToast: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ r266
const RANK = RANKING();
expect(RANK.length).toBe(12);
const SUM_USED = RANK.reduce((n, r) => n + r.usedWords, 0);
const SUM_TOTAL = RANK.reduce((n, r) => n + r.totalWords, 0);
const SUM_UNUSED = SUM_TOTAL - SUM_USED;
expect(SUM_USED).toBe(1915);
expect(SUM_UNUSED).toBe(2117);
expect(SUM_TOTAL).toBe(4032);
// همان گردِ مستقلِ pctFa — یک‌اعشاری با جداکنندهٔ فارسی
const pctFa = (ratio: number) => faNum((Math.round(ratio * 1000) / 10).toFixed(1)).replace(".", "٫");
expect(pctFa(SUM_USED / SUM_TOTAL)).toBe(pctFa(0.4749503968253968)); // ٪۴۷٫۵
expect(pctFa(SUM_UNUSED / SUM_TOTAL)).toBe(pctFa(0.5250496031746031)); // ٪۵۲٫۵

// توزیعِ درس‌ها — همان منطقِ نوارِ دیالوگ
const distOf = (en: string) => {
  const m = new Map<number, number>();
  findWordUsages(en).forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
};
const shapeOf = (en: string) => {
  const d = distOf(en);
  const max = Math.max(...d.map(([, c]) => c));
  const nLeaders = d.filter(([, c]) => c === max).length;
  return { dist: d, max, nLeaders, uniform: nLeaders === d.length && d.length > 1 };
};
const ABS = shapeOf("absolutely");
expect(ABS.uniform).toBe(true); // لنگرِ یکنواختِ بی-لنز
expect(ABS.dist.length).toBe(2);
const INT = shapeOf("interest");
expect(INT.uniform).toBe(false); // لنگرِ تساویِ جزئی
expect(INT.nLeaders).toBe(2);
expect(INT.dist.length).toBe(4);
const CONV = findWordUsages("change").filter((s) => s.kind === "conversation");
expect(CONV.length).toBe(2); // لنگرِ یکنواختِ زیرِ لنز (۵=۱·۹=۱)

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    wordMistakes: {},
    wordSeen: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
  });
});

const renderDialog = (en: string, withHandler = false) =>
  render(
    <WordUsageDialog
      target={{ en, sites: findWordUsages(en) }}
      onClose={vi.fn()}
      {...(withHandler ? { onOpenLesson: vi.fn() } : {})}
    />
  );

const openPanel = () => {
  render(<DictionaryView />);
  fireEvent.click(screen.getByTestId("usage-rank-toggle"));
};

// ------------------------------------------------------------------
describe("صداقتِ توزیعِ یکنواخت در tooltipِ صدرنشین (r266 ②)", () => {
  it("absolutely (یکنواختِ ۲درسه): هم «۲ درسِ هم-بیشینه‌اند» (قفلِ r265) هم پسوندِ «توزیعِ یکنواخت» — از دادهٔ زنده", () => {
    renderDialog("absolutely");
    const stat = screen.getByTestId("usage-lessons-leader");
    const ids = ABS.dist.map(([l]) => l);
    const title = stat.getAttribute("title") ?? "";
    // زبانِ r265 سرِ جایش — افزودنِ نه جایگزینی
    expect(title).toContain(
      `اینجا ${faNum(2)} درسِ هم-بیشینه‌اند: درس‌هایِ ${faNum(ids[0])} و ${faNum(ids[1])}`
    );
    // پسوندِ نوِ r266
    expect(title).toContain("توزیعِ یکنواخت (همهٔ درس‌ها هم‌شمارند)");
    // و شمارندهٔ r264 در انتها — «۱ از ۲ کاربرد»
    expect(title).toContain(`· ${faNum(1)} از ${faNum(2)}`);
    // spanِ اطلاعاتی نه دکمه — فضای نامِ a11yِ r253
    expect(stat.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /صدرنشین|پراکندگی/ })).toBeNull();
  });

  it("interest (تساویِ جزئیِ ۲از۴): «یکنواخت» نمی‌آید — برایِ جزئی، یکنواخت دروغ است", () => {
    renderDialog("interest");
    const title = screen.getByTestId("usage-lessons-leader").getAttribute("title") ?? "";
    expect(title).toContain(
      `اینجا ${faNum(INT.nLeaders)} درسِ هم-بیشینه‌اند`
    );
    expect(title).not.toContain("توزیعِ یکنواخت");
    expect(title).not.toContain("صدرنشینِ یگانه");
  });

  it("لنزِ مکالمهٔ change یکنواختِ زیرِ لنز است؛ ریدینگ و communication یگانه می‌مانند — پسوندِ یکنواخت فقط به توزیعِ همان لنز می‌نشیند", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    const title = screen.getByTestId("usage-lessons-leader").getAttribute("title") ?? "";
    expect(title).toContain("اینجا ۲ درسِ هم-بیشینه‌اند: درس‌هایِ ۵ و ۹");
    expect(title).toContain("توزیعِ یکنواخت (همهٔ درس‌ها هم‌شمارند)");
    cleanup();
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const t2 = screen.getByTestId("usage-lessons-leader").getAttribute("title") ?? "";
    expect(t2).toContain("صدرنشینِ یگانه است");
    expect(t2).not.toContain("توزیعِ یکنواخت");
    cleanup();
    renderDialog("communication");
    const t3 = screen.getByTestId("usage-lessons-leader").getAttribute("title") ?? "";
    expect(t3).toContain("صدرنشینِ یگانه است");
    expect(t3).not.toContain("توزیعِ یکنواخت");
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-leader")).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("پانویسِ مقیاسِ دوتایی (r266 ①)", () => {
  it("«جمعِ ۱۲ درس: ۱۹۱۵ از ۴۰۳۲ واژه در جزوه (٪۴۷٫۵) · بی‌کاربردها: ۲۱۱۷ واژه (٪۵۲٫۵)» — داده‌محور از همان memo", () => {
    openPanel();
    const sum = screen.getByTestId("usage-rank-sum");
    expect(sum.tagName).toBe("P");
    // قطعهٔ قفلِ r258 دست‌نخورده — درصد پس از آن می‌نشیند
    expect(sum.textContent).toContain(`${faNum(1915)} از ${faNum(4032)} واژه در جزوه`);
    // جفت‌هایِ نو — درصدِ همان جمع‌ها
    expect(sum.textContent).toContain(
      `واژه در جزوه (٪${pctFa(SUM_USED / SUM_TOTAL)})`
    );
    expect(sum.textContent).toContain(
      `واژه (٪${pctFa(SUM_UNUSED / SUM_TOTAL)})`
    );
    // هیچ دکمه‌ای با نامِ پانویس — اطلاعاتی است (فضای نامِ a11y)
    expect(screen.queryByRole("button", { name: /جمعِ ۱۲ درس|بی‌کاربردها/ })).toBeNull();
  });

  it("سطرِ میانگین (r260) دست‌نخورده می‌ماند — دو مقیاسِ متفاوت با هم اشتباه نمی‌شوند", () => {
    openPanel();
    const avg = screen.getByTestId("usage-rank-avg").textContent ?? "";
    expect(avg).toContain(`میانگینِ سهمِ درس‌ها: ٪${pctFa(RANK.reduce((n, r) => n + r.usedWords / r.totalWords, 0) / 12)}`);
    expect(avg).toContain(`سهمِ کلِ پیکره: ٪${pctFa(SUM_USED / SUM_TOTAL)}`);
  });
});

// ------------------------------------------------------------------
describe("قفل‌هایِ سطحِ منبع (r266)", () => {
  const dlgSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
    "utf8"
  );
  const dictSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"),
    "utf8"
  );

  it("دیالوگ: شرطِ یکنواخت از leaderLessons و lessonCounts می‌خواند — هرگز رشتهٔ منجمد؛ شاخه‌هایِ r265 سرِ جایشان", () => {
    expect(dlgSrc).toContain("leaderLessons.length === lessonCounts.length");
    expect(dlgSrc).toContain("توزیعِ یکنواخت");
    expect(dlgSrc).toContain("همهٔ درس‌ها هم‌شمارند");
    // زبان‌هایِ r264/265 سرِ جایشان
    expect(dlgSrc).toContain("درسِ هم-بیشینه‌اند");
    expect(dlgSrc).toContain("صدرنشینِ یگانه است");
    expect(dlgSrc).toContain("همهٔ درس‌هایِ هم-بیشینه");
  });

  it("دیکشنری: درصدِ پانویس از pctFa و همان memo می‌آید — هیچ عددِ درصدیِ نوشته‌شده در منبع نیست", () => {
    expect(dictSrc).toContain("واژه در جزوه (٪{pctFa(usageRank.sumUsed / usageRank.sumTotal)})");
    expect(dictSrc).toContain(
      "واژه (٪{pctFa((usageRank.sumTotal - usageRank.sumUsed) / usageRank.sumTotal)})"
    );
    // صداقتِ منبع: ۴۷٫۵ و ۵۲٫۵ در کدِ زنده نمی‌نشینند — کامنت‌هایِ خطیِ //
    // و بلوکیِ /* */ مستندِ راندهایِ پیش‌اند (پیش‌شمارشِ r260) و مجازند
    const codeOnly = dictSrc
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((l) => !l.trim().startsWith("//"))
      .join("\n");
    expect(codeOnly).not.toContain("۴۷٫۵");
    expect(codeOnly).not.toContain("۵۲٫۵");
    // قطعهٔ r258 سرِ جایش
    expect(dictSrc).toContain("واژه در جزوه");
  });

  it("فضای نامِ a11y: پسوندهایِ نو هیچ‌جا به نامِ دکمه/سطر نمی‌نشینند", () => {
    const ariaLines = dictSrc.split("\n").filter((l) => l.includes("aria-label"));
    for (const l of ariaLines) {
      expect(l).not.toContain("توزیعِ یکنواخت");
      expect(l).not.toContain("کاربرددار");
    }
    expect(dlgSrc.split("\n").filter((l) => l.includes("aria-label")).join("\n")).not.toContain(
      "توزیعِ یکنواخت"
    );
  });
});
