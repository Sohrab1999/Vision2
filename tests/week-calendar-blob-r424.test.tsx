// @vitest-environment jsdom
// ------------------------------------------------------------------
// r424 — قراردادِ محیطِ بی‌کانواس برایِ دروازهٔ هم‌رسانیِ کارتِ تقویمِ
// هفته: buildWeekCalendarBlob در jsdom (getContext=null) باید null بدهد
// و هیچ استثنایی پرتاب نکند — الگویِ buildWeeklyBlobِ r306 /
// buildOfficialBlobِ r307 و همان قراردادِ خانوادهٔ کارت‌ها
// (week-calendar-image-r423 / Task 104). دانلود و هم‌رسانی دو دروازهٔ
// یک ارزیابی‌اند — هر دو بیِ بوم، «false/nullِ صادق» بدونِ انفجار.
// ------------------------------------------------------------------
import { describe, it, expect } from "vitest";
import { buildWeekCalendarBlob } from "@/lib/result-image";

describe("buildWeekCalendarBlob — بی‌کانواس (r424)", () => {
  it("nullِ صادق بدونِ انفجار — نردبانِ کاملِ هفت خانه", async () => {
    const blob = await buildWeekCalendarBlob({
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
    expect(blob).toBeNull();
  });

  it("nullِ صادق بدونِ انفجار — هفتهٔ تهی و بیِ دنباله", async () => {
    const blob = await buildWeekCalendarBlob({
      cells: [],
      itemCount: 0,
      dayCount: 0,
      afterCount: 0,
    });
    expect(blob).toBeNull();
  });

  it("nullِ صادق بدونِ انفجار — پساز هفته با afterLabelِ اختیاریِ غایب", async () => {
    const blob = await buildWeekCalendarBlob({
      cells: [{ label: "امروز", count: 2, family: "today" }],
      itemCount: 2,
      dayCount: 1,
      afterCount: 3,
    });
    expect(blob).toBeNull();
  });
});
