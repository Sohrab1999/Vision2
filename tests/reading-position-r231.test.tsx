// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۳۱ — گاردهایِ «جایگاهِ خواندنِ پایدار» (بندِ ① پیشنهادِ ۲۲۸):
// مجموعهٔ موضوع‌هایِ بازِ درسنامهٔ جامع در localStorage فقط برایِ این UI
// ذخیره می‌شود — چیپِ توپُرِ فهرستِ پرش بینِ نشست‌ها می‌ماند؛ «بستنِ همه»
// هم یک انتخابِ ماندگار است. هیچ نوشتنی در استورِ یادگیری نیست.
//   ① بازدیدِ اول (بی‌کلید): پیش‌فرضِ موضوعِ ۱ — کلید هنوز ساخته نمی‌شود
//      (پیش‌فرض، انتخابِ کاربر نیست)؛ با نخستینِ کنشِ کاربر ساخته می‌شود
//   ② بازدیدِ بعدی: مجموعهٔ ذخیره‌شده اعمال می‌شود (storeِ خارجیِ
//      useSyncExternalStore — بدونِ setState-in-effect)
//   ③ «بستنِ همه» = [] ماندگار — بازدیدِ بعدی صفرِ باز
//   ④ شناسه‌هایِ نامعتبر پالایش می‌شوند
//   ⑤ لنگرِ عمیق با مجموعهٔ ذخیره‌شده ادغام می‌شود — پرشِ عمیق گم نمی‌شود
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import BookletGrammarView from "@/components/study/lesson/booklet-grammar-view";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));

const KEY = "vision2-bg-open-topics";
const T = (i: number) => BOOKLET_GRAMMAR_TOPICS[i];
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

const PANEL = "فهرست پرش موضوع‌های درسنامهٔ جامع";

/** پنلِ فهرستِ پرش را تضمین می‌کند — کلیکِ چیپ پنل را می‌بندد (راند ۲۲۸)،
 *  پس هر chipOpen باید خودش پنل را باز کند اگر بسته است. */
const ensureJumpIndex = () => {
  if (!screen.queryByRole("group", { name: PANEL })) {
    fireEvent.click(screen.getByRole("button", { name: "فهرست پرش" }));
  }
  return screen.getByRole("group", { name: PANEL });
};

/** نشانِ توپُرِ چیپِ فهرستِ پرش — data-open=true (پنل را خودکار باز می‌کند) */
const chipOpen = (i: number) => {
  ensureJumpIndex();
  return (
    screen
      .getByRole("button", { name: `پرش به موضوعِ ${fa(i + 1)}: ${T(i).title}` })
      .getAttribute("data-open") === "true"
  );
};

/** پنل را (اگر باز است) می‌بندد — برای کلیکِ سرصفحهٔ موضوع بدونِ ابهامِ
 *  متنِ مشترک با چیپ‌ها (چیپ‌ها هم تیتر را دارند). */
const closeJumpIndex = () => {
  if (screen.queryByRole("group", { name: PANEL })) {
    fireEvent.click(screen.getByRole("button", { name: "فهرست پرش" }));
  }
};

/** toggleِ موضوع از سرصفحهٔ کارت — پنل باید بسته باشد تا متنِ تیتر یکتا شود */
const toggleTopicFromHeader = (i: number) => {
  closeJumpIndex();
  fireEvent.click(screen.getByText(T(i).title));
};

describe("reading-position-r231 — جایگاهِ خواندنِ پایدار", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    useStudy.setState({ view: { type: "appendix" } as never });
  });

  it("بازدیدِ اول: پیش‌فرضِ موضوعِ ۱ باز است و کلید هنوز ساخته نمی‌شود؛ نخستینِ کنش همان را می‌نویسد", () => {
    render(<BookletGrammarView />);
    const panel = ensureJumpIndex();
    expect(panel).toBeTruthy();
    expect(chipOpen(0)).toBe(true);
    expect(chipOpen(1)).toBe(false);
    // پیش‌فرض، انتخابِ کاربر نیست — هنوز هیچ کلیدی نوشته نشده
    expect(window.localStorage.getItem(KEY)).toBeNull();
    // کنشِ کاربر (پرش به موضوعِ ۱۰) — کلید ساخته می‌شود و هر دو را دارد
    fireEvent.click(
      screen.getByRole("button", { name: `پرش به موضوعِ ${fa(10)}: ${T(9).title}` }),
    );
    expect(chipOpen(9)).toBe(true);
    const saved: unknown = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved).toEqual(expect.arrayContaining([T(0).id, T(9).id]));
  });

  it("بازدیدِ بعدی: مجموعهٔ ذخیره‌شده اعمال می‌شود — موضوعِ ۳ باز، موضوعِ ۱ بسته", () => {
    window.localStorage.setItem(KEY, JSON.stringify([T(2).id]));
    render(<BookletGrammarView />);
    expect(chipOpen(2)).toBe(true);
    expect(chipOpen(0)).toBe(false);
    // کنشِ کاربر: بازکردنِ موضوعِ ۱ از سرصفحه — کلید به‌روز می‌شود
    toggleTopicFromHeader(0);
    const saved: unknown = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved).toEqual(expect.arrayContaining([T(0).id, T(2).id]));
    expect(chipOpen(0)).toBe(true);
  });

  it("«بستنِ همه» یک انتخابِ ماندگار است — بازدیدِ بعدی صفرِ باز و toggleِ تکی سالم", () => {
    window.localStorage.setItem(KEY, JSON.stringify([]));
    render(<BookletGrammarView />);
    const panel = ensureJumpIndex();
    // هیچ چیپی توپُر نیست — انتخابِ کاربر محترم است
    const chips = within(panel).getAllByRole("button");
    expect(chips.every((c) => c.getAttribute("data-open") === "false")).toBe(true);
    // toggleِ تکی بعدش سالم می‌ماند و ذخیره می‌شود
    toggleTopicFromHeader(0);
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual([T(0).id]);
    expect(chipOpen(0)).toBe(true);
  });

  it("شناسه‌هایِ نامعتبر پالایش می‌شوند — «zzz» و غیررشته‌ها حذف، معتبرها می‌مانند", () => {
    window.localStorage.setItem(KEY, JSON.stringify(["zzz", T(4).id, 42, null]));
    render(<BookletGrammarView />);
    expect(chipOpen(4)).toBe(true);
    expect(chipOpen(0)).toBe(false);
    // نوشتنِ بعدی، فهرستِ پالایش‌شده را جایگزین می‌کند
    toggleTopicFromHeader(0);
    const saved: unknown = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved).toEqual(expect.arrayContaining([T(0).id, T(4).id]));
    expect(saved).not.toContain("zzz");
  });

  it("لنگرِ عمیق با مجموعهٔ ذخیره‌شده ادغام می‌شود — هر دو باز می‌مانند", () => {
    window.localStorage.setItem(KEY, JSON.stringify([T(2).id]));
    render(<BookletGrammarView focusTopicId={T(6).id} />);
    expect(chipOpen(2)).toBe(true);
    expect(chipOpen(6)).toBe(true);
    expect(chipOpen(0)).toBe(false);
    // کنشِ بعدی، هر دو (ادغامِ session-scopeِ لنگر) را نگه می‌دارد
    toggleTopicFromHeader(0);
    const saved: unknown = JSON.parse(window.localStorage.getItem(KEY)!);
    expect(saved).toEqual(expect.arrayContaining([T(2).id, T(6).id, T(0).id]));
  });

  it("هیچ چرخشِ استوری — ذخیره و بازخوانی فقط UI-محلی است", () => {
    window.localStorage.setItem(KEY, JSON.stringify([T(3).id]));
    render(<BookletGrammarView />);
    ensureJumpIndex();
    fireEvent.click(
      screen.getByRole("button", { name: `پرش به موضوعِ ${fa(10)}: ${T(9).title}` }),
    );
    expect(chipOpen(9)).toBe(true);
    // viewِ استور دست‌نخورده — پرش کاملاً محلی
    expect(useStudy.getState().view).toEqual({ type: "appendix" });
  });
});
