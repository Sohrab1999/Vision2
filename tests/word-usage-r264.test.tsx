// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۶۴ — بندهای ①+② پیشنهادِ ۲۶۳: لنزِ نوعِ در-جایِ دیالوگ و
// شمارندهٔ «N از M» رویِ عنوانِ نوارِ پراکندگی
//
//   ① چیپ‌هایِ «مکالمه/ریدینگ» دکمه‌هایِ دوسطحیِ aria-pressed می‌شوند
//      (الگویِ togglingِ r259): کلیک، فهرستِ سایت‌ها را درجا فیلتر می‌کند و
//      نوارِ پراکندگی از سایت‌هایِ هم-لنز بازمحاسبه می‌شود (چیپ‌هایِ درس +
//      شمارندهٔ صدرنشین هم-لنز می‌شوند — نه عکسِ کهنه). کلیکِ دوباره =
//      بازگشت؛ کلیکِ نوعِ دیگر = تعویضِ متقابل (الگویِ زوجِ r257).
//      فعال = پرِ آسمانیِ bg-sky-600 — آینهٔ بنفشِ پرِ صدرنشین.
//   ② شمارندهٔ صدرنشینِ توزیعِ جاری رویِ عنوانِ نوار: «۵ از ۱۳ کاربرد در
//      درسِ ۵»؛ زیرِ لنز با ذکرِ نوع: «۴ از ۱۱ کاربردِ ریدینگ در درسِ ۵».
//      تساویِ صدر: همهٔ درس‌هایِ هم-بیشینه نامیده می‌شوند — «در درس‌هایِ ۵
//      و ۹» (پیش‌شمارشِ r264: ۲۳۱ واژهٔ نواریِ پیکره صدرنشینِ مساوی دارد —
//      نامیدنِ تک‌درسه‌ای دروغ می‌شد).
//
// لنگرهایِ پیش‌شمارشِ ترمینالِ r264 (scripts/precount-r264.ts):
//   change: ۱۳ کاربرد · ۶ درس (۵=۵ · ۶=۳ · ۹=۲ · ۲=۱ · ۷=۱ · ۱۱=۱) · صدر=[۵]
//     · لنزِ ریدینگ: ۱۱ کاربرد (۵=۴ · ۶=۳ · ۲=۱ · ۷=۱ · ۹=۱ · ۱۱=۱) · صدر=[۵]
//     · لنزِ مکالمه: ۲ کاربرد (۵=۱ · ۹=۱) · صدرِ مساوی=[۵، ۹]
//   communication: ۳ کاربرد (۱=۲ · ۲=۱) · تک-نوع
//   ability: ۱ کاربرد · بدونِ نوار
//   پیکره: ۵۴۹ واژهٔ نواری · ۲۳۱ صدرنشینِ مساوی · ۳۸۰ دو-نوعی
//   نمونهٔ سقوطِ نوار زیرِ لنز: action (۳ کاربرد · ۲ درس · مکالمه=۱ در ۱ درس)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, within, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import WordUsageDialog from "@/components/study/lesson/word-usage-dialog";
import { useStudy } from "@/lib/study-store";
import { findWordUsages, type WordUsageSite } from "@/lib/word-usage";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { faNum } from "@/lib/study-theme";

// لنگرهایِ پیش‌شمارشِ r264 — رانشِ داده را همان‌جا می‌گیرد
const CHANGE = findWordUsages("change");
expect(CHANGE.length).toBe(13);
expect(CHANGE.filter((s) => s.kind === "reading").length).toBe(11);
expect(CHANGE.filter((s) => s.kind === "conversation").length).toBe(2);
const COMM = findWordUsages("communication");
expect(COMM.length).toBe(3);
expect(COMM.every((s) => s.kind === "reading")).toBe(true);

/** توزیعِ درسِ یک مجموعه‌سایت — همان مرتب‌سازیِ نوار (نزولیِ شمارش، صعودیِ شناسه) */
function distOf(sites: WordUsageSite[]) {
  const m = new Map<number, number>();
  sites.forEach((s) => m.set(s.lessonId, (m.get(s.lessonId) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
}
const changeDist = distOf(CHANGE);
const changeMax = changeDist[0][1];
const changeLeaders = changeDist.filter(([, c]) => c === changeMax).map(([l]) => l);
const READING_LENS = CHANGE.filter((s) => s.kind === "reading");
const readingDist = distOf(READING_LENS);
const readingMax = readingDist[0][1];
const CONV_LENS = CHANGE.filter((s) => s.kind === "conversation");
const convDist = distOf(CONV_LENS);
const convMax = convDist[0][1];
const convLeaders = convDist.filter(([, c]) => c === convMax).map(([l]) => l);
// لنگرِ تساوی: لنزِ مکالمهٔ change دو صدرنشینِ مساوی دارد
expect(convLeaders.length).toBe(2);
expect(convLeaders).toContain(5);
expect(convLeaders).toContain(9);

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

// ------------------------------------------------------------------
describe("شمارندهٔ «N از M» رویِ عنوانِ نوار (r264 ②)", () => {
  it("change: «۵ از ۱۳ کاربرد در درسِ ۵» — همیشه از دادهٔ زنده، span نه دکمه", () => {
    renderDialog("change");
    const stat = screen.getByTestId("usage-lessons-leader");
    expect(stat.tagName).toBe("SPAN");
    expect(stat.textContent).toBe(
      `${faNum(changeMax)} از ${faNum(CHANGE.length)} کاربرد در درسِ ${faNum(changeLeaders[0])}`
    );
    // صفر دکمهٔ «پراکندگی» — شمارنده اطلاعاتی است (فضای نامِ a11yِ r253)
    expect(screen.queryByRole("button", { name: /پراکندگی/ })).toBeNull();
    // توضیحِ آموزشی: نامیدنِ همهٔ هم-بیشینه‌ها
    expect(stat.getAttribute("title")).toContain("همهٔ درس‌هایِ هم-بیشینه");
  });

  it("communication: «۲ از ۳ کاربرد در درسِ ۱» — و ability (تک-درسه) نه نوار دارد نه شمارنده", () => {
    renderDialog("communication");
    const commDist = distOf(COMM);
    const commMax = commDist[0][1];
    const commLeaders = commDist.filter(([, c]) => c === commMax).map(([l]) => l);
    expect(screen.getByTestId("usage-lessons-leader").textContent).toBe(
      `${faNum(commMax)} از ${faNum(COMM.length)} کاربرد در درسِ ${faNum(commLeaders[0])}`
    );
    cleanup();
    renderDialog("ability");
    expect(screen.queryByTestId("usage-lessons-bar")).toBeNull();
    expect(screen.queryByTestId("usage-lessons-leader")).toBeNull();
    // ولی خودِ دیالوگ با سایتِ یگانه سالم است
    expect(screen.getByTestId("usage-dialog")).toBeInTheDocument();
  });
});

// ------------------------------------------------------------------
describe("لنزِ نوع — چیپ‌هایِ دوسطحیِ در-جا (r264 ①)", () => {
  it("کلیکِ «ریدینگ ۱۱»: چیپِ فعالِ پرِ آسمانی + فهرستِ فیلترشده + نوارِ هم-لنز + شمارندهٔ هم-لنز", () => {
    renderDialog("change");
    const read = screen.getByTestId("usage-kind-chip-reading");
    expect(read.getAttribute("aria-pressed")).toBe("false");
    act(() => {
      fireEvent.click(read);
    });
    // چیپِ فعال: aria-pressed + پرِ آسمانی (آینهٔ بنفشِ پرِ صدرنشین)
    const read2 = screen.getByTestId("usage-kind-chip-reading");
    expect(read2.getAttribute("aria-pressed")).toBe("true");
    expect(read2.className).toContain("bg-sky-600");
    expect(read2.className).toContain("text-white");
    expect(read2.getAttribute("aria-label")).toBe("کلیک: بازگشت به همهٔ کاربردها");
    // چیپِ دیگر دست‌نخورده: بی-فشار و روشن
    const conv = screen.getByTestId("usage-kind-chip-conversation");
    expect(conv.getAttribute("aria-pressed")).toBe("false");
    expect(conv.className).toContain("bg-sky-50");
    expect(conv.getAttribute("aria-label")).toBe("کلیک: فقط کاربردهایِ مکالمه");
    // عنوانِ نوار هم-لنز می‌شود
    const bar = screen.getByTestId("usage-lessons-bar");
    expect(bar.textContent).toContain(`پراکندگیِ ریدینگ:`);
    // شمارندهٔ صدرنشین از توزیعِ ریدینگ — «۴ از ۱۱ کاربردِ ریدینگ در درسِ ۵»
    expect(screen.getByTestId("usage-lessons-leader").textContent).toBe(
      `${faNum(readingMax)} از ${faNum(READING_LENS.length)} کاربردِ ریدینگ در درسِ ${faNum(readingDist[0][0])}`
    );
    // چیپ‌هایِ درس بازمحاسبه: درسِ ۵ حالا ۴ است نه ۵ — ولی هنوز صدرنشینِ پر
    const chip5 = screen.getByTestId("usage-lesson-chip-5");
    expect(chip5.textContent).toContain(`درس ${faNum(5)} · ${faNum(readingMax)}`);
    expect(chip5.className).toContain("bg-violet-600");
    // فهرستِ سایت‌ها فقط ریدینگ — ۸ کارتِ اول + «+ ۳ موردِ دیگر»
    const cards = [...bar.parentElement!.querySelectorAll("[data-testid=usage-site]")];
    expect(cards.length).toBe(8);
    for (const c of cards) expect(c.textContent).toContain("ریدینگ");
    expect(screen.getByTestId("usage-more").textContent).toContain(
      `+ ${faNum(READING_LENS.length - 8)} موردِ دیگر`
    );
  });

  it("کلیکِ دوباره: بازگشتِ کامل به همهٔ کاربردها — وعدهٔ aria همان رفتار است (بندِ r260)", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(screen.getByTestId("usage-kind-chip-reading").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByTestId("usage-kind-chip-reading").className).toContain("bg-sky-50");
    expect(screen.getByTestId("usage-lessons-bar").textContent).toContain("پراکندگیِ درس‌ها:");
    expect(screen.getByTestId("usage-lessons-leader").textContent).toBe(
      `${faNum(changeMax)} از ${faNum(CHANGE.length)} کاربرد در درسِ ${faNum(changeLeaders[0])}`
    );
    const bar = screen.getByTestId("usage-lessons-bar");
    const cards = [...bar.parentElement!.querySelectorAll("[data-testid=usage-site]")];
    expect(cards.length).toBe(8);
    expect(screen.getByTestId("usage-more").textContent).toContain(
      `+ ${faNum(CHANGE.length - 8)} موردِ دیگر`
    );
  });

  it("تعویضِ متقابل و نامیدنِ مشترکِ صدرنشینانِ مساوی: لنزِ مکالمهٔ change → «۱ از ۲ کاربردِ مکالمه در درس‌هایِ ۵ و ۹»", () => {
    renderDialog("change");
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-conversation"));
    });
    // تعویض: ریدینگ خاموش، مکالمه روشن
    expect(screen.getByTestId("usage-kind-chip-reading").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByTestId("usage-kind-chip-conversation").getAttribute("aria-pressed")).toBe("true");
    const bar = screen.getByTestId("usage-lessons-bar");
    expect(bar.textContent).toContain("پراکندگیِ مکالمه:");
    // صدرنشینِ مساوی: هر دو درسِ ۵ و ۹ نامیده می‌شوند — از لایهٔ داده
    const leadersFa = convLeaders.map((l) => faNum(l));
    expect(screen.getByTestId("usage-lessons-leader").textContent).toBe(
      `${faNum(convMax)} از ${faNum(CONV_LENS.length)} کاربردِ مکالمه در درس‌هایِ ${leadersFa[0]} و ${leadersFa[1]}`
    );
    // هر دو چیپِ صدرنشینِ مساوی پر می‌شوند (ایدئومِ تساویِ امنِ r258/259)
    for (const l of convLeaders) {
      expect(screen.getByTestId(`usage-lesson-chip-${l}`).className).toContain("bg-violet-600");
    }
    // فهرستِ مکالمه: ۲ کارت، بدونِ «+ موردِ دیگر»
    const cards = [...bar.parentElement!.querySelectorAll("[data-testid=usage-site]")];
    expect(cards.length).toBe(2);
    for (const c of cards) expect(c.textContent).toContain("مکالمه");
    expect(screen.queryByTestId("usage-more")).toBeNull();
  });

  it("با هندلر: وعدهٔ ariaِ چیپِ درس هم-لنز می‌شود و کلیک همان درس را صدا می‌زند", () => {
    const onOpenLesson = vi.fn();
    cleanup();
    render(
      <WordUsageDialog
        target={{ en: "change", sites: findWordUsages("change") }}
        onClose={vi.fn()}
        onOpenLesson={onOpenLesson}
      />
    );
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    const chip6 = screen.getByTestId("usage-lesson-chip-6");
    const inReading = READING_LENS.filter((s) => s.lessonId === 6).length;
    // r267: وعدهٔ aria مقیاسِ دوتایی می‌گیرد — «۳ از ۱۱» (مخرجِ هم-لنز)
    expect(chip6.getAttribute("aria-label")).toBe(
      `رفتن به واژه‌هایِ درسِ ${faNum(6)} — ${faNum(inReading)} از ${faNum(READING_LENS.length)} کاربردِ ریدینگِ این واژه در آن`
    );
    act(() => {
      fireEvent.click(chip6);
    });
    expect(onOpenLesson).toHaveBeenCalledWith(6);
    // بدونِ لنز، وعدهٔ r263 دست‌نخورده: «... در مکالمه‌ها و ریدینگ‌هایِ آن»
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(screen.getByTestId("usage-lesson-chip-6").getAttribute("aria-label")).toBe(
      `رفتن به واژه‌هایِ درسِ ${faNum(6)} — ${faNum(3)} از ${faNum(CHANGE.length)} کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن`
    );
  });
});

// ------------------------------------------------------------------
describe("بازنشانیِ لنز و صداقتِ تک-نوع (r264)", () => {
  it("تعویضِ هدف، لنز را از نو می‌کند — لنزِ change به communication نشت نمی‌کند", () => {
    const view = render(
      <WordUsageDialog target={{ en: "change", sites: findWordUsages("change") }} onClose={vi.fn()} />
    );
    act(() => {
      fireEvent.click(screen.getByTestId("usage-kind-chip-reading"));
    });
    expect(screen.getByTestId("usage-lessons-bar").textContent).toContain("پراکندگیِ ریدینگ:");
    // همان مونتاژ، هدفِ نو — کلیدِ واژه ری‌مونت می‌کند و state صفر می‌شود
    view.rerender(
      <WordUsageDialog target={{ en: "communication", sites: findWordUsages("communication") }} onClose={vi.fn()} />
    );
    expect(screen.getByTestId("usage-lessons-bar").textContent).toContain("پراکندگیِ درس‌ها:");
    const bar = screen.getByTestId("usage-lessons-bar");
    const cards = [...bar.parentElement!.querySelectorAll("[data-testid=usage-site]")];
    expect(cards.length).toBe(3);
    expect(screen.queryByTestId("usage-kind-chip-reading")).toBeNull();
    expect(screen.queryByTestId("usage-kind-chip-conversation")).toBeNull();
    // شمارنده از توزیعِ واژهٔ نو — نه عکسِ لنزِ کهنه
    const commDist = distOf(COMM);
    expect(screen.getByTestId("usage-lessons-leader").textContent).toBe(
      `${faNum(commDist[0][1])} از ${faNum(COMM.length)} کاربرد در درسِ ${faNum(commDist[0][0])}`
    );
  });

  it("تک-نوع هیچ لنزی نمی‌گیرد: communication نوار دارد ولی هیچ دکمهٔ نوعی — و بدونِ «همهٔ کاربردها»ی بیهوده", () => {
    renderDialog("communication");
    expect(screen.getByTestId("usage-lessons-bar")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /کاربردهایِ مکالمه/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /کاربردهایِ ریدینگ/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /بازگشت به همهٔ کاربردها/ })).toBeNull();
  });
});

// ------------------------------------------------------------------
describe("فضای نامِ a11y و قراردادهایِ سطحِ منبع (r264)", () => {
  it("نامِ دکمهٔ نوع در هر دو حالت هرگز «کاربرددار» یا «جزوه»ی برهنه نمی‌گیرد", () => {
    renderDialog("change");
    for (const testid of ["usage-kind-chip-conversation", "usage-kind-chip-reading"]) {
      const chip = screen.getByTestId(testid);
      expect(chip.getAttribute("aria-label")).not.toMatch(/کاربرددار/);
      expect(chip.getAttribute("aria-label")).not.toMatch(/جزوه/);
      act(() => {
        fireEvent.click(chip);
      });
      const chip2 = screen.getByTestId(testid);
      expect(chip2.getAttribute("aria-label")).not.toMatch(/کاربرددار/);
      expect(chip2.getAttribute("aria-label")).not.toMatch(/جزوه/);
      act(() => {
        fireEvent.click(chip2);
      });
    }
  });

  it("قراردادهایِ سطحِ منبع: stateِ درونِ بدنه + کلیدِ واژه + شرطِ نوار + تک‌منبعیِ visibleSites", () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    const dlg = read("src/components/study/lesson/word-usage-dialog.tsx");
    // stateِ درونِ بدنه + ری‌مونتِ کلید‌خورده
    expect(dlg).toContain("useState<KindFilter>(null)");
    expect(dlg).toContain('key={props.target?.en ?? "none"}');
    // شرطِ r262 دست‌نخورده می‌ماند و لنز آن را گسترش می‌دهد
    expect(dlg).toContain("(lessonCounts.length >= 2 || kindFilter)");
    // شمارندهٔ صدرنشین + نامیدنِ مشترکِ هم-بیشینه‌ها
    expect(dlg).toContain('data-testid="usage-lessons-leader"');
    expect(dlg).toContain("function leadersFa");
    expect(dlg).toContain("همهٔ درس‌هایِ هم-بیشینه");
    // دکمهٔ دوسطحی + ایدئومِ آسمانیِ فعال
    expect(dlg).toContain("aria-pressed={active}");
    expect(dlg).toContain("bg-sky-600");
    // ایدئوم‌هایِ r262/263 دست‌نخورده
    expect(dlg).toContain("count === maxLessonCount");
    expect(dlg).toContain("کاربردِ این واژه در مکالمه‌ها و ریدینگ‌هایِ آن");
    expect(dlg).toContain('data-testid={`usage-kind-chip-${k.kind}`}');
    // تک‌منبعیِ لنز: فهرست و شمارندهٔ «+ N» از visibleSites می‌خورند
    expect(dlg).toContain("visibleSites.slice(0, 8)");
    expect(dlg).toContain("faNum(visibleSites.length - 8)");
    // هیچ نسخهٔ خصوصی از نوار یا شمارنده در مصرف‌کننده‌هایِ شش‌گانه نیست
    for (const f of [
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/lesson/vocab-tab.tsx",
      "src/components/study/lesson/flashcards.tsx",
      "src/components/study/lesson/word-of-day.tsx",
      "src/components/study/lesson/word-family-table-card.tsx",
      "src/components/study/practice/danger-words.tsx",
    ]) {
      const src = read(f);
      expect(src).not.toContain("usage-lessons-bar");
      expect(src).not.toContain("usage-lessons-leader");
      expect(src).not.toContain("kindFilter");
    }
  });
});
