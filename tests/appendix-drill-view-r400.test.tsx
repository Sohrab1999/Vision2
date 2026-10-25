// @vitest-environment jsdom
// ------------------------------------------------------------------
// r400 — نمایِ «تمرین افعال بی‌قاعده» + سویچِ آن در زیرتبِ verbs ضمیمه.
//
// قراردادهای نما که این پرونده میبندد:
//  · دکمهٔ ورود فقط در حالتِ جدول دیده میشود (aria-label ثابت)
//  · لنگرِ عمیقِ r234 (verbBase) هرگز دریل را بالا نمیآورد — drill فقط
//    با کلیک؛ پسِ بازگشت از دریل، جدول با همان لنگرِ خودش است
//  · هر سؤال یک انتخاب — چیپهای پسِ پاسخ قفل میشوند (disabled)
//  · «بعدی» تا پاسخ معلول است؛ سؤالِ آخر «دیدن نتیجه» میشود
//  · نتیجه: درصدِ فارسی + شمارشِ صادق + بازخوانیِ سؤالبهسؤال
//  · «جدول افعال» از هر سه فاز بیرون میبرد — رفتارِ سویچِ کامل
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { irregularVerbs } from "@/data/appendix";

// بعضی زیرکامپوننتها به استور نیاز دارند (همان سنتِ تستهای نما)
const noop = () => {};

const openVerbsTab = () => {
  const tab = screen.getByRole("button", { name: "افعال بی‌قاعده" });
  fireEvent.click(tab);
};

describe("appendix-drill-view r400 — سویچِ تمرین در ضمیمه", () => {
  beforeEach(() => cleanup());

  it("زیرتبِ verbs دکمهٔ «تمرین» دارد و جدول هنوز هست", () => {
    render(<AppendixView />);
    openVerbsTab();
    expect(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" })).toBeTruthy();
    expect(screen.getByPlaceholderText("جست‌وجو: انگلیسی یا فارسی…")).toBeTruthy();
  });

  it("کلیکِ تمرین: جدول میرود، معرفی میآید؛ «جدول افعال» برمیگرداند", () => {
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    expect(screen.queryByPlaceholderText("جست‌وجو: انگلیسی یا فارسی…")).toBeNull();
    expect(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول افعال" }));
    expect(screen.getByPlaceholderText("جست‌وجو: انگلیسی یا فارسی…")).toBeTruthy();
  });

  it("لنگرِ عمیقِ r234: verbBase معتبر جدول را میآورد نه دریل را — drill فقط با کلیک", () => {
    render(<AppendixView verbBase="break" />);
    expect(screen.queryByRole("button", { name: "شروع جلسهٔ تمرین فعل" })).toBeNull();
    expect(screen.getByPlaceholderText("جست‌وجو: انگلیسی یا فارسی…")).toBeTruthy();
  });
});

describe("appendix-drill-view r400 — جریانِ یک جلسه", () => {
  beforeEach(() => cleanup());

  const startDrill = () => {
    render(<AppendixView />);
    openVerbsTab();
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
  };

  it("جلسه: شمارندهٔ «سؤال ۱ از ۱۰» + چهار گزینه؛ پسِ پاسخ، درست/نادرست آشکار میشود", () => {
    startDrill();
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    expect(opts).toHaveLength(4);
    fireEvent.click(opts[0]);
    // گزینههای دیگر معلولاند — کلیکِ دوباره روی یک گزینهٔ دیگر حالت را عوض نمیکند
    const others = screen.getAllByRole("button", { name: /^گزینه [۱-۴]/ });
    expect(others.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(screen.getByRole("button", { name: "سؤال بعدی" })).toBeTruthy();
  });

  it("«بعدی» تا پاسخ معلول است", () => {
    startDrill();
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(true);
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[2]);
    expect((screen.getByRole("button", { name: "سؤال بعدی" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("جلسهٔ کامل: نتیجه با درصدِ فارسی + بازخوانی + «تمرین دوباره» و «انصراف» مسیرِ خروج دارند", () => {
    startDrill();
    for (let i = 0; i < 10; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[i % 4]); // پاسخهای قاطی — نمرهٔ هرچه شد صادق است
      const next =
        i === 9
          ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
          : screen.getByRole("button", { name: "سؤال بعدی" });
      fireEvent.click(next);
    }
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
    expect(screen.getByLabelText(/^نمرهٔ /)).toBeTruthy();
    expect(screen.getByLabelText("بازخوانی سؤال‌های تمرین").children.length).toBe(10);
    // تمرین دوباره: جلسهٔ تازه میسازد (به پرسشِ اول برمیگردد)
    fireEvent.click(screen.getByRole("button", { name: "تمرین دوباره" }));
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "انصراف از تمرین" })[0]);
    expect(screen.getByPlaceholderText("جست‌وجو: انگلیسی یا فارسی…")).toBeTruthy();
  });

  it("بانکِ واقعی منبع است: پرامپتِ سؤالِ اول یکی از ۸۷ فعل است — نه متنِ ساختگی", () => {
    startDrill();
    const h3 = screen.getByRole("heading", { level: 3 });
    const someVerb = irregularVerbs.some(
      (v) => h3.textContent!.includes(v.base) || h3.textContent!.includes(v.past),
    );
    expect(someVerb).toBe(true);
  });
});
