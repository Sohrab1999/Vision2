// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۸۰ — «ردیفِ خودت را در فید بشناس»: آخرین حلقهٔ بصریِ روایتِ
// نام‌گذاری. جدول امتیازات از قبل ردیفِ شما را نشان میداد (isMe با
// userId)؛ فید — همان‌جایی که r278 وعدهٔ «دیده میشوی» را داد —
// بی‌نشان ماند. سرور از قبل userId را در ردیف‌های recent می‌فرستد
// (select + spread) و حالا تایپ هم اعلامش میکند؛ تطبیقِ دقیقِ userId
// در برابرِ هم‌نامیِ کلاس ایمن است.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom/vitest";
import { cleanup, render } from "@testing-library/react";
import { useStudy } from "@/lib/study-store";
import HomeFeed from "@/components/study/home/home-feed";

const ME = "u-me-2799";

const fixture = {
  total: 3,
  avgPercent: 80,
  last24h: 3,
  recent: [
    {
      userId: ME,
      lesson: 1,
      category: "lesson-quiz",
      total: 10,
      correct: 9,
      percent: 90,
      createdAt: new Date().toISOString(),
      name: "آرش ر",
      color: "emerald",
    },
    {
      userId: "u-other",
      lesson: 2,
      category: "lesson-quiz",
      total: 10,
      correct: 7,
      percent: 70,
      createdAt: new Date().toISOString(),
      name: "سارا",
      color: "amber",
    },
    {
      userId: "u-anon",
      lesson: 0,
      category: "konkur-sim",
      total: 5,
      correct: 4,
      percent: 80,
      createdAt: new Date().toISOString(),
      name: null,
      color: null,
    },
  ],
};

beforeEach(() => {
  cleanup();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => fixture }))
  );
  useStudy.setState({ userId: ME, userName: "آرش ر", seenBadges: [] });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("راند ۲۸۰ — «ردیفِ خودت را در فید بشناس»", () => {
  it("پردهٔ ① — فقط ردیفِ خودم نشانِ (شما) و حلقهٔ زمردی می‌گیرد؛ ردیفِ دیگران و ناشناس بی-نشان", async () => {
    const { container } = render(<HomeFeed />);
    // اجازهٔ mount + fetch + setState
    await vi.waitFor(() => {
      expect(container.textContent).toContain("آرش ر");
    });
    const lis = Array.from(container.querySelectorAll("li"));
    expect(lis).toHaveLength(3);
    const mine = lis.find((l) => l.textContent?.includes("آرش ر"));
    expect(mine).toBeDefined();
    expect(lis.filter((l) => l.textContent?.includes("(شما)"))).toHaveLength(1);
    expect(mine?.textContent).toContain("(شما)");
    expect(mine?.className).toContain("ring-emerald-200");
    expect(mine?.className).toContain("bg-emerald-50");
    // ردیفِ دیگران: نام هست، نشان نیست، حلقه نیست:
    const other = lis.find((l) => l.textContent?.includes("سارا"));
    expect(other?.textContent).not.toContain("(شما)");
    expect(other?.className).toContain("bg-white");
    expect(other?.className).not.toContain("ring-emerald-200");
    // ردیفِ ناشناس برچسبِ صادق دارد و هرگز نشان نمی‌گیرد:
    const anon = lis.find((l) => l.textContent?.includes("یادگیرندهٔ ناشناس"));
    expect(anon).toBeDefined();
    expect(anon?.textContent).not.toContain("(شما)");
  });

  it("پردهٔ ② — بی-هویتی: کاربرِ بدونِ userId هرگز ردیفی را مالِ خود نمی‌بیند (حتی اگر ردیفی userId داشته باشد)", async () => {
    useStudy.setState({ userId: "", userName: "" });
    const { container } = render(<HomeFeed />);
    await vi.waitFor(() => {
      expect(container.textContent).toContain("آرش ر");
    });
    expect(container.textContent).not.toContain("(شما)");
    const mine = Array.from(container.querySelectorAll("li")).find((l) =>
      l.textContent?.includes("آرش ر")
    );
    expect(mine?.className).toContain("bg-white");
  });

  it("پردهٔ ③ — قفل‌هایِ منبع: گِردِ isYou یک-بار با تطبیقِ دقیقِ userId، فیلدِ اعلام‌شده یک-بار، نشانِ مرئی یک-بار، بی-آلفایِ ممنوع", () => {
    const feed = readFileSync(
      join(process.cwd(), "src/components/study/home/home-feed.tsx"),
      "utf8"
    );
    const constants = readFileSync(
      join(process.cwd(), "src/components/study/home/home-constants.ts"),
      "utf8"
    );
    // گِردِ واحد — یک حقیقت، نه دو تطبیقِ موازی:
    expect(
      feed.split("const isYou = Boolean(myUserId && a.userId && a.userId === myUserId);")
        .length - 1
    ).toBe(1);
    // نشانِ مرئی یک-بار:
    expect(feed.split("(شما)").length - 1).toBe(1);
    // تایپِ سرور-هم‌راستا حالا اعلام می‌شود:
    expect(
      constants.split("userId?: string | null;").length - 1
    ).toBe(1);
    // ردیفِ زمردی به‌جایِ bg-whiteِ ثابت:
    expect(feed).toContain('isYou ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-white"');
    // آلفایِ ممنوعِ css-hygiene در فایل نیست:
    expect(/bg-white\/(60|70)\b/.test(feed)).toBe(false);
  });
});
