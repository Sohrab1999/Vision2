// Task 299 «کیوستِ داستانِ کتاب‌خانه» — ششمین هدفِ روزانه.
// خواندنِ یک داستانِ دکتر هیل = مأموریتِ روز: شمارنده از dayStat.stories
// (منبعِ یگانه: activityPatch در markStoryDone) و CTA به کتاب‌خانه میرود.
// این فایل قراردادِ رجیستری + رفتارِ پیشرفت + اتصالِ زندهٔ داستان→کیوست را قفل میکند.

import { describe, it, expect, beforeEach } from "vitest";
import { QUESTS, questProgress, completedQuestCount } from "@/lib/daily-quests";
import { emptyDayStat, todayStr, useStudy } from "@/lib/study-store";
import { normDayStat } from "@/state/day-engine";

const state = () => useStudy.getState();

const resetAll = () =>
  useStudy.setState({
    view: { type: "home" },
    libraryDone: {},
    dayStat: emptyDayStat(todayStr()),
    history: {},
    dayHistory: {},
    streak: 0,
    bestStreak: 0,
    lastActiveDay: "",
    goalMetDays: [],
  });

describe("story quest registry — Task 299", () => {
  beforeEach(resetAll);

  it("the registry has six quests and the story quest closes it", () => {
    expect(QUESTS).toHaveLength(6);
    const story = QUESTS[QUESTS.length - 1];
    expect(story.id).toBe("story");
    expect(story.icon).toBe("BookOpen");
    expect(story.target).toBe(1);
    expect(story.jump).toEqual({ kind: "library" });
    expect(story.title).toContain("داستان");
    // unique ids — a duplicate would silently shadow a quest
    expect(new Set(QUESTS.map((q) => q.id)).size).toBe(6);
  });

  it("questProgress derives the story value from dayStat.stories only", () => {
    const stat = { ...emptyDayStat(todayStr()), stories: 2 };
    const rows = questProgress(stat);
    const story = rows.find((r) => r.def.id === "story")!;
    expect(story.value).toBe(2);
    expect(story.done).toBe(true);
    expect(story.pct).toBe(100);
    // everything else still zero
    expect(rows.filter((r) => r.done)).toHaveLength(1);
  });

  it("a legacy DayStat without the stories field reads zero honestly (no NaN)", () => {
    const legacy = normDayStat({ day: todayStr(), reviews: 3, quizzes: 1 });
    expect(legacy.stories).toBe(0);
    const rows = questProgress(legacy);
    const story = rows.find((r) => r.def.id === "story")!;
    expect(story.value).toBe(0);
    expect(story.done).toBe(false);
    expect(Number.isFinite(story.pct)).toBe(true);
    expect(completedQuestCount(legacy)).toBe(0);
  });

  it("undefined day → story quest pending, never complete", () => {
    const rows = questProgress(undefined);
    const story = rows.find((r) => r.def.id === "story")!;
    expect(story.value).toBe(0);
    expect(story.done).toBe(false);
  });

  it("markStoryDone completes the story quest live (store → quest chain)", () => {
    expect(completedQuestCount(state().dayStat)).toBe(0);
    state().markStoryDone("s1-1", 6, 12);
    const s = state();
    expect(s.dayStat.stories).toBe(1);
    expect(completedQuestCount(s.dayStat)).toBe(1);
    const story = questProgress(s.dayStat).find((r) => r.def.id === "story")!;
    expect(story.done).toBe(true);
    // a second story bumps the counter past target — still exactly one completed quest
    state().markStoryDone("s1-2", 8, 12);
    expect(state().dayStat.stories).toBe(2);
    expect(completedQuestCount(state().dayStat)).toBe(1);
  });

  it("day rollover: yesterday's story does not complete today's quest", () => {
    const yesterday = { day: "2026-01-01", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0, stories: 3 };
    // stale day key → questProgress treats it as today-zero (same contract as the other quests)
    const story = questProgress(yesterday).find((r) => r.def.id === "story")!;
    expect(story.done).toBe(false);
    expect(story.value).toBe(0);
  });
});
