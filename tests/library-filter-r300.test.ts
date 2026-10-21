// Task 300 «کتابخانهٔ هوشمند» — آزمونِ قراردادِ خالصِ جست‌وجو و صافی.
// دادهٔ ثابت (بدونِ Date) — هم‌قراردادِ آزمونِ library-progress r297.
import { describe, expect, it } from "vitest";
import {
  filterStoryIds,
  matchesStory,
  readingMinutes,
  toLatinDigits,
  wordCount,
} from "@/lib/library-filter";

describe("wordCount — شمارشِ واژهٔ واقعیِ متن", () => {
  it("جملاتِ ساده روی فاصله توکن میشوند", () => {
    expect(wordCount("He went home. He was happy.")).toBe(6);
  });

  it("پاراگراف‌های \\n\\n همه شمرده میشوند", () => {
    expect(wordCount("one two\n\nthree four five")).toBe(5);
  });

  it("متنِ خالی یا فقط-فاصله = صفرِ صادق", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   \n\n  ")).toBe(0);
  });

  it("علائمِ چسبیده یک توکن‌اند (نقطه/ویرگول جدا نمیکند)", () => {
    expect(wordCount("Hello, world!")).toBe(2);
  });
});

describe("readingMinutes — تخمینِ دقیقه با نرخِ ۱۱۰", () => {
  it("صفر/منفی واژه = صفر دقیقه (صادق)", () => {
    expect(readingMinutes(0)).toBe(0);
    expect(readingMinutes(-3)).toBe(0);
  });

  it("کران‌های سقف: ۱→۱، ۱۱۰→۱، ۱۱۱→۲، ۵۰۰→۵", () => {
    expect(readingMinutes(1)).toBe(1);
    expect(readingMinutes(110)).toBe(1);
    expect(readingMinutes(111)).toBe(2);
    expect(readingMinutes(500)).toBe(5);
  });
});

describe("toLatinDigits — ارقامِ فارسی و عربی", () => {
  it("فارسی ۱۲ → 12", () => {
    expect(toLatinDigits("۱۲")).toBe("12");
  });
  it("عربی ٠٧ → 07", () => {
    expect(toLatinDigits("٠٧")).toBe("07");
  });
  it("لاتین و متنِ مخلوط دست‌نخورده میماند", () => {
    expect(toLatinDigits("s1-3")).toBe("s1-3");
    expect(toLatinDigits("jones")).toBe("jones");
  });
});

describe("matchesStory — عنوانِ انگلیسی یا شمارهٔ داستان", () => {
  const s = { id: "s1-12", num: 12, title: "The Blue Gloves" };

  it("پرس‌وجوی خالی/فاصله = تطبیقِ همه", () => {
    expect(matchesStory(s, "")).toBe(true);
    expect(matchesStory(s, "   ")).toBe(true);
  });

  it("زیررشتهٔ انگلیسی بی‌حساس به بزرگیِ حرف", () => {
    expect(matchesStory(s, "blue")).toBe(true);
    expect(matchesStory(s, "BLUE GLOVES")).toBe(true);
    expect(matchesStory(s, "The Blue")).toBe(true);
  });

  it("شمارهٔ داستان با ارقامِ فارسی", () => {
    expect(matchesStory(s, "۱۲")).toBe(true);
    expect(matchesStory(s, "۲")).toBe(false);
  });

  it("شمارهٔ داستان با ارقامِ لاتین", () => {
    expect(matchesStory(s, "12")).toBe(true);
    expect(matchesStory(s, "13")).toBe(false);
  });

  it("ناهمخوانِ صادق — شناسه و متنِ بی‌ربط تطبیقِ دروغ نمیزنند", () => {
    expect(matchesStory(s, "jones")).toBe(false);
    expect(matchesStory(s, "s1-12")).toBe(false);
  });
});

describe("filterStoryIds — پرس‌وجو ∧ صافیِ خواندن", () => {
  const stories = [
    { id: "s1-1", num: 1, title: "Mr Jones's Hat" },
    { id: "s1-2", num: 2, title: "The Old Lady and the Bank" },
    { id: "s1-3", num: 3, title: "Mary's New School" },
  ];
  const done = {
    "s1-1": { score: 5, total: 6, day: "2026-10-20" },
    "s1-2": { score: 4, total: 6, day: "2026-10-21" },
  };

  it("همه + پرس‌وجوی خالی = کلِ فهرست در همان ترتیب", () => {
    expect(filterStoryIds(stories, done, "", "all")).toEqual([
      "s1-1",
      "s1-2",
      "s1-3",
    ]);
  });

  it("صافیِ خوانده‌شده فقط done را نگه میدارد", () => {
    expect(filterStoryIds(stories, done, "", "read")).toEqual(["s1-1", "s1-2"]);
  });

  it("صافیِ نخوانده done را حذف میکند", () => {
    expect(filterStoryIds(stories, done, "", "unread")).toEqual(["s1-3"]);
  });

  it("پرس‌وجو ∧ صافی ترکیب میشوند", () => {
    expect(filterStoryIds(stories, done, "jones", "read")).toEqual(["s1-1"]);
    expect(filterStoryIds(stories, done, "bank", "unread")).toEqual([]);
  });

  it("کلیدِ بیگانهٔ done هرگز صافیِ read را فریب نمیدهد", () => {
    expect(
      filterStoryIds(
        stories,
        { "s9-9": { score: 1, total: 2, day: "2026-10-21" } },
        "",
        "read"
      )
    ).toEqual([]);
  });

  it("پرس‌وجوی شماره با ارقامِ فارسی", () => {
    expect(filterStoryIds(stories, done, "۲", "all")).toEqual(["s1-2"]);
  });
});
