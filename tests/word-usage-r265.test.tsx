// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۵ — بندهای ①+③ پیشنهادِ ۲۶۴: دو مقیاسِ «چندتا» و «از کلِ پیکره»
//
//   ① شمارِ هم-بیشینه‌ها در tooltipِ شمارندهٔ صدرنشینِ دیالوگِ کاربرد —
//      متنِ مرئی r264 نامِ صدرنشین(ها) را می‌گوید؛ tooltip حالا «چندتا» را
//      هم می‌گوید: تساوی «اینجا K درسِ هم-بیشینه‌اند: درس‌هایِ ۵ و ۹» ·
//      بی-تساوی «اینجا صدرنشینِ یگانه است: درسِ ۵». همیشه از leaderLessonsِ
//      لنزِ جاری — نه رشتهٔ منجمد.
//   ③ مقیاسِ مطلقِ پیکره در tooltipِ سطرهایِ پنلِ مقایسهٔ ۱۲ درس —
//      «۴۹۰ از ۱۹۱۵ کاربردِ در-متنِ پیکره · ۴۹۸ از ۲۱۱۷ بی‌کاربردِ پیکره».
//      مخرج = جمعِ کلِ ۱۲ درس، نه اندازهٔ خودِ درس (آن «N از M» مرئیِ سطر).
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r265 (scripts/precount-r265.ts):
//   پیکره: sumUsed=۱۹۱۵ · sumUnused=۲۱۱۷ (قفلِ r259) · sumTotal=۴۰۳۲
//   درسِ ۱۰ = ۴۹۰/۱۹۱۵ + ۴۹۸/۲۱۱۷ · درسِ ۷ = ۷۳/۱۹۱۵ + ۳۲/۲۱۱۷
//   واژه‌هایِ لنگر: change بی-لنز یگانه[۵] · زیرِ مکالمه مساوی[۵،۹] ·
//   زیرِ ریدینگ یگانه[۵] · communication یگانه[۱]
//   سرشماریِ نوارهایِ باز: ۵۴۹ واژه — ۳۱۸ یگانه · ۲۳۱ مساوی (بیشینهٔ تساوی ۱۰)
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
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ r265 — رانشِ داده همان‌جا گرفته می‌شود
const RANK = RANKING();
expect(RANK.length).toBe(12);
const SUM_USED = RANK.reduce((n, r) => n + r.usedWords, 0);
const SUM_UNUSED = RANK.reduce((n, r) => n + (r.totalWords - r.usedWords), 0);
const SUM_TOTAL = RANK.reduce((n, r) => n + r.totalWords, 0);
expect(SUM_USED).toBe(1915);
expect(SUM_UNUSED).toBe(2117);
expect(SUM_TOTAL).toBe(4032);
expect(RANK.find((r) => r.lessonId === 10)!.usedWords).toBe(490);
expect(RANK.find((r) => r.lessonId === 10)!.totalWords - RANK.find((r) => r.lessonId === 10)!.usedWords).toBe(498);
expect(RANK.find((r) => r.lessonId === 7)!.usedWords).toBe(73);
expect(RANK.find((r) => r.lessonId === 7)!.totalWords - RANK.find((r) => r.lessonId === 7)!.usedWords).toBe(32);

// توزیعِ درس‌هایِ واژه — همان منطقِ نوارِ دیالوگ
const distOf = (sites: ReturnType<typeof findWordUsages>) => {
  const m = new Map<number, number>();
  sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
};
const CHANGE = findWordUsages("change");
const changeDist = distOf(CHANGE);
const changeMax = changeDist[0][1];
const changeLeaders = changeDist.filter(([, c]) => c === changeMax).map(([l]) => l);
expect(changeLeaders).toEqual([5]); // بی-لنز: یگانه
const CONV_LENS = CHANGE.filter((s) => s.kind === "conversation");
const convDist = distOf(CONV_LENS);
const convMax = convDist[0][1];
const convLeaders = convDist.filter(([, c]) => c === convMax).map(([l]) => l);
expect(convLeaders).toEqual([5, 9]); // لنگرِ تساویِ r264
const READ_LENS = CHANGE.filter((s) => s.kind === "reading");
const readDist = distOf(READ_LENS);
const readMax = readDist[0][1];
const readLeaders = readDist.filter(([, c]) => c === readMax).map(([l]) => l);
expect(readLeaders).toEqual([5]); // زیرِ ریدینگ: یگانه
const COMM = findWordUsages("communication");
const commDist = distOf(COMM);
const commMax = commDist[0][1];
const commLeaders = commDist.filter(([, c]) => c === commMax).map(([l]) => l);
expect(commLeaders).toEqual([1]);
// رتبهٔ رقابتیِ نسبتِ در-متن — همان منطقِ memoِ دیکشنری (قفلِ r261)
const fracs = RANK.map((r) => ({ id: r.lessonId, frac: r.usedWords / r.totalWords }));
const sortedFracs = [...fracs].sort((a, b) => b.frac - a.frac);
const fracRank = new Map<number, number>();
sortedFracs.forEach((f, i) => {
  if (!fracRank.has(f.frac)) fracRank.set(f.frac, i + 1);
});
const rankOfId = new Map<number, number>(fracs.map((f) => [f.id, fracRank.get(f.frac)!]));

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
describe("شمارِ هم-بیشینه‌ها در tooltipِ شمارندهٔ صدرنشین (r265 ①)", () => {
  it("change بی-لنز: «اینجا صدرنشینِ یگانه است: درسِ ۵» — عبارتِ آموزشیِ r264 دست‌نخورده · متنِ مرئیِ r264 همان", () => {
    renderDialog("change");
    const stat = screen.getByTestId("usage-lessons-leader");
    // متنِ مرئی — قفلِ r264 دست‌نخورده
    expect(stat.textContent).toBe(
      `${faNum(changeMax)} از ${faNum(CHANGE.length)} کاربرد در درسِ ${faNum(changeLeaders[0])}`
    );
    const title = stat.getAttribute("title") ?? "";
    // عبارتِ آموزشیِ r264 — افزوده می‌شود نه جایگزین
    expect(title).toContain("همهٔ درس‌هایِ هم-بیشینه");
    // نکتهٔ نوِ یگانگی — از دادهٔ زنده
    expect(title).toContain(`اینجا صدرنشینِ یگانه است: درسِ ${faNum(5)}`);
    expect(title).not.toContain("هم-بیشینه‌اند"); // یگانه، ادعای تساوی نمی‌کند
    // و شمارندهٔ «N از M»ِ r264 در انتها
    expect(title).toContain(`· ${faNum(changeMax)} از ${faNum(CHANGE.length)}`);
    // spanِ اطلاعاتی نه دکمه — فضای نامِ a11yِ r253
    expect(stat.tagName).toBe("SPAN");
    expect(screen.queryByRole("button", { name: /صدرنشین/ })).toBeNull();
  });

  it("لنزِ مکالمهٔ change: «اینجا ۲ درسِ هم-بیشینه‌اند: درس‌هایِ ۵ و ۹» — همیشه از لنزِ جاری", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    const stat = screen.getByTestId("usage-lessons-leader");
    // متنِ مرئیِ هم-لنزِ r264 دست‌نخورده
    expect(stat.textContent).toBe(
      `${faNum(convMax)} از ${faNum(CONV_LENS.length)} کاربردِ مکالمه در درس‌هایِ ${faNum(5)} و ${faNum(9)}`
    );
    const title = stat.getAttribute("title") ?? "";
    expect(title).toContain(`اینجا ${faNum(2)} درسِ هم-بیشینه‌اند: درس‌هایِ ${faNum(5)} و ${faNum(9)}`);
    expect(title).not.toContain("صدرنشینِ یگانه"); // زیرِ تساوی، «یگانه» دروغ است
    expect(title).toContain(`· ${faNum(convMax)} از ${faNum(CONV_LENS.length)}`);
  });

  it("لنزِ ریدینگ: دوباره یگانه — و communication بی-لنز یگانه[۱]؛ واژهٔ تک-درسه هیچ نوار و شمارنده‌ای ندارد", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const title = screen.getByTestId("usage-lessons-leader").getAttribute("title") ?? "";
    expect(title).toContain(`اینجا صدرنشینِ یگانه است: درسِ ${faNum(readLeaders[0])}`);
    expect(title).not.toContain("هم-بیشینه‌اند");
    cleanup();
    renderDialog("communication");
    const stat = screen.getByTestId("usage-lessons-leader");
    expect(stat.textContent).toBe(
      `${faNum(commMax)} از ${faNum(COMM.length)} کاربرد در درسِ ${faNum(commLeaders[0])}`
    );
    expect(stat.getAttribute("title")).toContain(
      `اینجا صدرنشینِ یگانه است: درسِ ${faNum(1)}`
    );
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-bar")).toBeNull();
    expect(screen.queryByTestId("usage-lessons-leader")).toBeNull();
    expect(screen.getByTestId("usage-dialog")).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("مقیاسِ مطلقِ پیکره در tooltipِ سطرهایِ مقایسه (r265 ③)", () => {
  it("هر ۱۲ سطر «N از ۱۹۱۵ کاربردِ در-متنِ پیکره · M از ۲۱۱۷ بی‌کاربردِ پیکره» دارد — داده‌محور از تک‌منبع", () => {
    openPanel();
    for (const r of RANK) {
      const title = screen.getByTestId(`usage-rank-row-${r.lessonId}`).getAttribute("title") ?? "";
      const unused = r.totalWords - r.usedWords;
      expect(title).toContain(
        `${faNum(r.usedWords)} از ${faNum(SUM_USED)} کاربردِ در-متنِ پیکره`
      );
      expect(title).toContain(`${faNum(unused)} از ${faNum(SUM_UNUSED)} بی‌کاربردِ پیکره`);
    }
  });

  it("لنگرهایِ سختِ پیش‌شمارش: درسِ ۱۰ = ۴۹۰/۱۹۱۵ + ۴۹۸/۲۱۱۷ · درسِ ۷ = ۷۳/۱۹۱۵ + ۳۲/۲۱۱۷ — و نیمه‌هایِ r260 و رتبهٔ r261 در همان tooltip می‌مانند", () => {
    openPanel();
    const t10 = screen.getByTestId("usage-rank-row-10").getAttribute("title") ?? "";
    expect(t10).toContain(`${faNum(490)} از ${faNum(1915)} کاربردِ در-متنِ پیکره`);
    expect(t10).toContain(`${faNum(498)} از ${faNum(2117)} بی‌کاربردِ پیکره`);
    const t7 = screen.getByTestId("usage-rank-row-7").getAttribute("title") ?? "";
    expect(t7).toContain(`${faNum(73)} از ${faNum(1915)} کاربردِ در-متنِ پیکره`);
    expect(t7).toContain(`${faNum(32)} از ${faNum(2117)} بی‌کاربردِ پیکره`);
    // نیمه‌هایِ r260 + رتبهٔ r261 + مسیر — همه در همان سطر، بی-جابه‌جایی
    for (const r of RANK) {
      const title = screen.getByTestId(`usage-rank-row-${r.lessonId}`).getAttribute("title") ?? "";
      expect(title).toContain("در متن · ");
      expect(title).toContain("بیرون از متن · ");
      expect(title).toContain(`رتبهٔ ${faNum(rankOfId.get(r.lessonId)!)} از ${faNum(12)} در سهمِ در-متن`);
      expect(title).toContain("کلیک: واژه‌های در-متن");
      expect(title).toContain("Shift+کلیک: بیرون-از-متن");
    }
    // سطر دکمه می‌ماند؛ «پیکره» هیچ دکمهٔ تازه‌ای نمی‌سازد (اطلاعاتی است)
    const row10 = screen.getByTestId("usage-rank-row-10");
    expect(row10.tagName).toBe("BUTTON");
  });

  it("جمعِ پانویس همان مخرج‌ها را می‌گوید — صداقتِ مقیاس: tooltipِ سطر با پانویسِ پنل یک پیکره‌اند", () => {
    openPanel();
    const sum = screen.getByTestId("usage-rank-sum").textContent ?? "";
    expect(sum).toContain(`${faNum(SUM_USED)} از ${faNum(SUM_TOTAL)}`);
    expect(sum).toContain(`${faNum(SUM_UNUSED)}`);
  });
});

// ------------------------------------------------------------------
describe("قفل‌هایِ سطحِ منبع (r265)", () => {
  const dlgSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/word-usage-dialog.tsx"),
    "utf8"
  );
  const dictSrc = readFileSync(
    join(process.cwd(), "src/components/study/lesson/dictionary-view.tsx"),
    "utf8"
  );

  it("دیالوگ: leaderTieNote از leaderLessonsِ تک‌منبع می‌خواند — هرگز رشتهٔ منجمد؛ عبارتِ آموزشیِ r264 سرِ جایش", () => {
    expect(dlgSrc).toContain("leaderTieNote");
    expect(dlgSrc).toContain("leaderLessons.length > 1");
    expect(dlgSrc).toContain("درسِ هم-بیشینه‌اند");
    expect(dlgSrc).toContain("صدرنشینِ یگانه است");
    expect(dlgSrc).toContain("همهٔ درس‌هایِ هم-بیشینه");
    // شمارندهٔ مرئیِ r264 دست‌نخورده
    expect(dlgSrc).toContain("کاربردِ");
  });

  it("دیکشنری: مخرج‌هایِ پیکره‌ای از sumUsed/sumTotalِ همان memo می‌آیند — نه عددِ نوشته‌شده", () => {
    expect(dictSrc).toContain("کاربردِ در-متنِ پیکره");
    expect(dictSrc).toContain("بی‌کاربردِ پیکره");
    expect(dictSrc).toContain("usageRank.sumUsed");
    expect(dictSrc).toContain("usageRank.sumTotal - usageRank.sumUsed");
    // نیمه‌ها و رتبهٔ r260/261 سرِ جایشان
    expect(dictSrc).toContain("بیرون از متن");
    expect(dictSrc).toContain("در سهمِ در-متن");
  });

  it("فضای نامِ a11y: tooltipهایِ نو هیچ‌جا «کاربرددار» یا «جزوه»ی برهنه به دکمه/نام نمی‌دهند", () => {
    // فقط در رشته‌هایِ tooltipِ اطلاعاتی‌اند، نه در aria-label یا نامِ دکمه
    const ariaLines = dictSrc.split("\n").filter((l) => l.includes("aria-label"));
    for (const l of ariaLines) expect(l).not.toContain("کاربرددار");
    // عنوانِ پنلِ مقایسه — گاردِ outline و نامِ بخش دست‌نخورده
    expect(dictSrc).toContain("کدام درس بیشترین واژهٔ کاربرددار را دارد؟");
  });
});
