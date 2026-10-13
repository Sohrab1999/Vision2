// @vitest-environment jsdom
// Task 104 — قراردادِ محیطِ بی‌کانواس: downloadWeeklyImage در jsdom (getContext=null)
// باید false بدهد و هیچ استثنایی پرتاب نکند — همان قراردادِ خانوادهٔ کارت‌ها.
import { describe, it, expect } from "vitest";
import { downloadWeeklyImage } from "@/lib/result-image";

describe("downloadWeeklyImage — بی‌کانواس (Task 104)", () => {
  it("falseِ صادق بدونِ انفجار", async () => {
    const ok = await downloadWeeklyImage({
      activities: 15,
      reviews: 8,
      quizzes: 2,
      words: 5,
      dictation: 0,
      rush: 0,
      goalDays: 2,
      streak: 4,
      bestDay: { label: "۱۴/۱۰", total: 8 },
    });
    expect(ok).toBe(false);
  });
});
