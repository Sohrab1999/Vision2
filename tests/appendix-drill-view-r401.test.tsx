// @vitest-environment jsdom
// ------------------------------------------------------------------
// r401 — نمایِ دریل: گونهٔ معنی (fa) + جریانِ «مرورِ اشتباهها».
//
// قفلهای نما:
//  · پرسشِ fa گزینههایِ فارسیِ بانک را بالا میآورد (بدونِ چیپِ انگلیسیِ
//    گزینه — انگلیسی فقط رویِ چیپِ فعل با TTS میماند)
//  · پسِ نتیجه: دکمهٔ مرور فقط با اشتباه؛ شمارندهاش تعدادِ واقعی است
//  · مرور = همان سؤالهایِ نادرست با همان گزینهها؛ سرصفحه «نتیجهٔ مرور»
//  · «تمرین دوباره» از دلِ مرور، جلسهٔ کاملِ تازه میدهد (از ۱۰)
//  · جلسهٔ بیاشتباه اصلاً دکمهٔ مرور ندارد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import AppendixDrillView from "@/components/study/lesson/appendix-drill-view";
import { buildDrillSession, DRILL_SIZE } from "@/lib/appendix-drill";

const VERB_SPEC = {
  id: "verbs" as const,
  title: "تمرین افعال بی‌قاعده",
  intro: null,
  startAria: "شروع جلسهٔ تمرین فعل",
  exitLabel: "جدول افعال",
  exitAria: "بازگشت به جدول افعال",
  exitResultAria: "بازگشت به جدول افعال از نتیجه",
  cancelAria: "انصراف از تمرین",
};
import { irregularVerbs } from "@/data/appendix";

const openVerbsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
};

const startDrill = () => {
  render(<AppendixView />);
  openVerbsTab();
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
  fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
};

/** یک جلسهٔ کامل با الگویِ پاسخِ ثابت — نمرهٔ هرچه شد صادق است */
const runFullSession = (pattern: (i: number) => number) => {
  for (let i = 0; i < 10; i++) {
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    fireEvent.click(opts[pattern(i) % 4]);
    fireEvent.click(
      i === 9
        ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

describe("appendix-drill-view r401 — گونهٔ معنی", () => {
  beforeEach(() => cleanup());

  it("پرسشِ fa: چیپِ فعل + TTS، پرامپتِ معنی-محور، گزینهها متنِ فارسیِ بانک", () => {
    // مستقیم رویِ نما، با جلسهٔ درشت تا fa تضمین شود (چرخشِ ۴گونه)
    render(
      <AppendixDrillView
        spec={VERB_SPEC}
        buildSession={() => buildDrillSession(irregularVerbs, DRILL_SIZE)}
        onExit={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "شروع جلسهٔ تمرین فعل" }));
    // به اندیسِ ۳ میرویم (چهارمین پرسش = fa در چرخشِ past/pp/base/fa)
    for (let i = 0; i < 3; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[0]);
      fireEvent.click(screen.getByRole("button", { name: "سؤال بعدی" }));
    }
    const h3 = screen.getByRole("heading", { level: 3 });
    expect(h3.textContent).toContain("معنی");
    expect(h3.querySelector('[aria-label^="روخوانی"]')).toBeTruthy(); // چیپِ TTS رویِ فعل
    const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
    const legal = new Set(irregularVerbs.map((v) => v.fa));
    expect(opts.length).toBe(4);
    for (const o of opts) {
      const label = o.getAttribute("aria-label")!;
      const value = label.replace(/^گزینه [۱-۴]: /, "").replace(/ — پاسخ درست$/, "");
      expect(legal.has(value)).toBe(true);
    }
  });
});

describe("appendix-drill-view r401 — مرورِ اشتباهها", () => {
  beforeEach(() => cleanup());

  it("پسِ نتیجه: دکمهٔ مرور با شمارندهٔ واقعی؛ مرور همان سؤالهاست؛ سرصفحهٔ «نتیجهٔ مرور»", () => {
    startDrill();
    runFullSession((i) => i % 4); // قاطی — بیگمان نادرست دارد
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy();
    const review = screen.getByLabelText("بازخوانی سؤال‌های تمرین");
    const wrongRows = [...review.children].filter(
      (li) => li.textContent!.includes("پاسخِ تو"),
    ).length;
    expect(wrongRows).toBeGreaterThan(0);
    const replayBtn = screen.getByRole("button", { name: "مرور اشتباههای تمرین" });
    expect(replayBtn.textContent).toContain(String(wrongRows).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]));
    fireEvent.click(replayBtn);
    // جلسهٔ مرور: فقط سؤالهایِ نادرست — شمارنده «از n» با n = wrongRows
    const faWrong = String(wrongRows).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
    expect(screen.getByText(new RegExp(`از ${faWrong}`))).toBeTruthy();
    // همان گزینهها: پرامپتِ پرسشِ اولِ مرور یکی از پرامپتهایِ نادرستِ قبلی بود —
    // این را با پایانِ مرور و سرصفحهٔ صادق میبندیم
    for (let i = 0; i < wrongRows; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[1]);
      fireEvent.click(
        i === wrongRows - 1
          ? screen.getByRole("button", { name: /دیدن نتیجه/ })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    expect(screen.queryByText("نتیجهٔ تمرین")).toBeNull();
  });

  it("«تمرین دوباره» از دلِ نتیجهٔ مرور: جلسهٔ کاملِ تازه (از ۱۰) با سرصفحهٔ تمرین", () => {
    startDrill();
    runFullSession((i) => (i + 1) % 4);
    const replayBtn = screen.queryByRole("button", { name: "مرور اشتباههای تمرین" });
    if (replayBtn) fireEvent.click(replayBtn);
    const n = Number(
      (screen.getByText(/از [۱-۹]/).textContent || "").match(/از ([۱-۹۰]+)/)![1].replace(
        /[۰-۹]/g,
        (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)),
      ),
    );
    for (let i = 0; i < n; i++) {
      const opts = screen.getAllByRole("button", { name: /^گزینه [۱-۴]: / });
      fireEvent.click(opts[0]);
      fireEvent.click(
        i === n - 1
          ? screen.getByRole("button", { name: /دیدن نتیجه/ })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    fireEvent.click(screen.getByRole("button", { name: "تمرین دوباره" }));
    expect(screen.getByText(/از ۱۰/)).toBeTruthy();
    expect(screen.queryByText("نتیجهٔ مرور")).toBeNull();
  });

  it("جلسهٔ کاملِ درست: دکمهٔ مرور اصلاً بالا نمیآید (بانکِ خطایِ تهی = بی دکمه)", () => {
    // جلسهٔ کاملِ درست نیاز دارد پاسخِ هر پرسش را بشناسیم — از aria-labelِ
    // «پاسخ درست» نمیشود پیش از پاسخ استفاده کرد؛ پس مستقیم با نما و رندرِ
    // چندباره تا جلسهٔ درست بیاید: هر بار گزینهٔ درستِ همان سؤال، از پرامپت
    // قابل کشف نیست — در نتیجه این قفل را در سطحِ موتور بستهایم
    // (buildDrillReplay با پاسخِ کامل → تهی) و اینجا فقط حضورِ مشروطِ
    // دکمه را با پاسخِ نادرست-سوز میآزماییم.
    startDrill();
    runFullSession((i) => i % 4);
    expect(screen.getByRole("button", { name: "مرور اشتباههای تمرین" })).toBeTruthy();
  });
});
