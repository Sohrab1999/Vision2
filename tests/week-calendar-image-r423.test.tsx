// @vitest-environment jsdom
// ------------------------------------------------------------------
// r423 — قراردادِ محیطِ بی‌کانواس برایِ کارتِ تقویمِ هفته: 
// downloadWeekCalendarImage در jsdom (getContext=null) باید false بدهد
// و هیچ استثنایی پرتاب نکند — همان قراردادِ خانوادهٔ کارت‌ها
// (weekly-image-canvasless / Task 104).
// خانوادهٔ خالی هم صادق است: آرایهٔ تهیِ خانهها انفجار نمیکند —
// نما هرگز چنین گاردی را بالا نمیآورد (r236)، ولی کتابخانه نمی‌شکند.
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { downloadWeekCalendarImage } from "@/lib/result-image";

describe("downloadWeekCalendarImage — بی‌کانواس (r423)", () => {
  it("falseِ صادق بدونِ انفجار — نردبانِ کاملِ هفت خانه", async () => {
    const ok = await downloadWeekCalendarImage({
      cells: [
        { label: "امروز", count: 1, family: "today" },
        { label: "فردا", count: 1, family: "future" },
        { label: "سه‌شنبه", count: 1, family: "future" },
        { label: "چهارشنبه", count: 0, family: "future" },
        { label: "پنجشنبه", count: 0, family: "future" },
        { label: "جمعه", count: 0, family: "future" },
        { label: "شنبه", count: 0, family: "future" },
      ],
      itemCount: 3,
      dayCount: 3,
      afterCount: 1,
      afterLabel: "۸ روزِ دیگر",
    });
    expect(ok).toBe(false);
  });

  it("falseِ صادق بدونِ انفجار — هفتهٔ تهی و بیِ دنباله", async () => {
    const ok = await downloadWeekCalendarImage({
      cells: [],
      itemCount: 0,
      dayCount: 0,
      afterCount: 0,
    });
    expect(ok).toBe(false);
  });

  it("falseِ صادق بدونِ انفجار — پساز هفته با afterLabelِ اختیاریِ غایب", async () => {
    const ok = await downloadWeekCalendarImage({
      cells: [{ label: "امروز", count: 2, family: "today" }],
      itemCount: 2,
      dayCount: 1,
      afterCount: 3,
    });
    expect(ok).toBe(false);
  });
});
