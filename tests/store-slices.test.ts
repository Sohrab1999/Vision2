// گام ۸ §12 — قرارداد اسلایس‌ها: نگهبان رانش API + ماتریس سیاست فعالیت +
// کامل‌بودن لایهٔ سازگاری. اگر روزی عضوی از StudyState حذف/تغییرنام خورد،
// این فایل قبل از هر مصرف‌کننده‌ای زنگ می‌زند.

import { describe, it, expect, beforeEach } from "vitest";
import * as storeModule from "@/lib/study-store";
import {
  useStudy,
  daysAgoKey,
  todayStr,
  pushDayHistory,
  konkurSrsEntry,
  type StudyState,
} from "@/lib/study-store";

const state = () => useStudy.getState();

const resetAll = () =>
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    flashIntent: "none",
    flashNonce: 0,
    known: {},
    results: {},
    srs: {},
    userId: "",
    userSecret: "",
    userName: "",
    avatarColor: "emerald",
    syncCode: "",
    streak: 0,
    bestStreak: 0,
    lastActiveDay: "",
    dayStat: { day: "", reviews: 0, quizzes: 0, words: 0, dictation: 0, rush: 0 },
    history: {},
    dayHistory: {},
    mistakes: {},
    wordMistakes: {},
    wordSeen: {},
    konkurSeen: {},
    konkurWrong: {},
    starredWords: [],
    seenBadges: [],
    rushBest: 0,
    rushBestCorrect: 0,
    rushGames: 0,
    spellRushBest: 0,
    spellRushBestCorrect: 0,
    duelWins: 0,
    duelLosses: 0,
    duelTies: 0,
    dailyGoal: 10,
    onboarded: false,
    settings: { ttsRate: 1, fontScale: 1, reduceMotion: false },
    freezeCount: 0,
    freezeEarnedDay: "",
    freezeUsedDays: [],
    goalMetDays: [],
    freezeSavedDay: "",
  });

beforeEach(resetAll);

// ---------------- ۱) نگهبان رانش قرارداد ----------------

describe("StudyState drift guard (12 slices → one contract)", () => {
  it("exposes every historical field on the composed store", () => {
    const s = state();
    const fields: (keyof StudyState)[] = [
      "view", "lessonTab", "known", "results", "srs",
      "userId", "userSecret", "userName", "avatarColor", "syncCode",
      "streak", "bestStreak", "lastActiveDay", "dayStat", "history", "dayHistory",
      "mistakes", "wordMistakes", "wordSeen",
      "konkurSeen", "konkurWrong",
      "starredWords", "flashIntent", "flashNonce", "seenBadges",
      "rushBest", "rushBestCorrect", "rushGames",
      "spellRushBest", "spellRushBestCorrect",
      "duelWins", "duelLosses", "duelTies",
      "dailyGoal", "onboarded", "settings",
      "freezeCount", "freezeEarnedDay", "freezeUsedDays", "goalMetDays", "freezeSavedDay",
    ];
    for (const f of fields) expect(s[f], `field ${String(f)} missing`).toBeDefined();
  });

  it("exposes every historical action and drops the dead lessonMistakeCount", () => {
    const s = state() as unknown as Record<string, unknown>;
    const actions = [
      "setProfile", "setDailyGoal", "setOnboarded", "setSettings", "setSyncCode",
      "setRushBest", "setSpellRushBest", "recordDuelOutcome", "trackDictation", "markBadgesSeen",
      "goHome", "openLesson", "openLessonTab", "setView", "setLessonTab",
      "consumeFlashIntent", "toggleKnown", "addResult", "reviewWord",
      "trackReview", "trackQuizDone", "addMistakes", "clearMistake",
      "markKonkur", "addWordResults", "toggleStarred", "clearStarred",
      "ensureUserId", "setIdentity",
    ];
    for (const a of actions) expect(typeof s[a], `action ${a} missing`).toBe("function");
    // Step-8 cleanup: the dead selector must be gone for good
    expect(s.lessonMistakeCount).toBeUndefined();
  });
});

// ---------------- ۲) ماتریس سیاست فعالیت (effects/activityPatch) ----------------

describe("activity policy matrix", () => {
  it("reviews advance the streak AND count toward the daily goal", () => {
    useStudy.setState({ dailyGoal: 1 });
    state().trackReview();
    const s = state();
    expect(s.dayStat.reviews).toBe(1);
    expect(s.streak).toBe(1); // first active day → chain starts
    expect(s.lastActiveDay).toBe(todayStr());
    expect(s.goalMetDays).toContain(todayStr()); // goal met (1 ≥ 1) → recorded
    expect(s.history[todayStr()]).toEqual({ reviews: 1, quizzes: 0 });
    expect(s.dayHistory[todayStr()]?.reviews).toBe(1);
  });

  it("quizzes advance the streak AND count toward the goal", () => {
    useStudy.setState({ dailyGoal: 1 });
    state().trackQuizDone();
    const s = state();
    expect(s.dayStat.quizzes).toBe(1);
    expect(s.streak).toBe(1);
    expect(s.goalMetDays).toContain(todayStr());
  });

  it("dictation advances the streak but NEVER counts toward the goal", () => {
    useStudy.setState({ dailyGoal: 1 });
    state().trackDictation();
    const s = state();
    expect(s.dayStat.dictation).toBe(1);
    expect(s.streak).toBe(1); // streak applies
    expect(s.goalMetDays).not.toContain(todayStr()); // goal/freeze bypassed
    expect(s.history[todayStr()]).toEqual({ reviews: 0, quizzes: 0 }); // history only tracks reviews/quizzes
  });

  it("words (toggleKnown) bump the day counter but bypass the streak entirely", () => {
    state().toggleKnown("1:ability");
    const s = state();
    expect(s.known["1:ability"]).toBe(true);
    expect(s.dayStat.words).toBe(1);
    expect(s.streak).toBe(0); // words never start a chain
    expect(s.lastActiveDay).toBe(""); // applyStreak untouched
    expect(s.dayHistory[todayStr()]?.words).toBe(1);
    // un-learning does not bump the counter back
    state().toggleKnown("1:ability");
    expect(state().dayStat.words).toBe(1);
    expect(state().known["1:ability"]).toBe(false);
  });

  it("rush rounds bump dayStat but bypass the streak; best score is kept", () => {
    state().setRushBest(120, 8);
    let s = state();
    expect(s.rushBest).toBe(120);
    expect(s.rushBestCorrect).toBe(8);
    expect(s.rushGames).toBe(1);
    expect(s.dayStat.rush).toBe(1);
    expect(s.streak).toBe(0);
    // a weaker round keeps the best, still counts as a played game
    state().setRushBest(90, 5);
    s = state();
    expect(s.rushBest).toBe(120);
    expect(s.rushBestCorrect).toBe(8);
    expect(s.rushGames).toBe(2);
    expect(s.dayStat.rush).toBe(2);
  });

  it("grants a freeze after 3 goal-days inside the 7-day window (reviews path)", () => {
    const twoDaysAgo = daysAgoKey(2);
    const threeDaysAgo = daysAgoKey(3);
    useStudy.setState({
      dailyGoal: 1,
      goalMetDays: [threeDaysAgo, twoDaysAgo], // 2 days already in window
      freezeEarnedDay: "",
    });
    state().trackReview(); // third goal-day + cooldown clean + cap open
    const s = state();
    expect(s.freezeCount).toBe(1);
    expect(s.freezeEarnedDay).toBe(todayStr());
  });

  it("goalMetDays is honest: an active but below-goal day is NOT recorded (round-55 fix)", () => {
    useStudy.setState({ dailyGoal: 10 });
    state().trackReview(); // reviews=1 < 10 → active day, NOT a goal day
    expect(state().goalMetDays).not.toContain(todayStr());
    // crossing the threshold records it
    useStudy.setState({ dailyGoal: 1 });
    state().trackReview();
    expect(state().goalMetDays).toContain(todayStr());
  });

  it("the freeze window counts only real goal-days (legacy inflation no longer mints freezes)", () => {
    useStudy.setState({
      dailyGoal: 1,
      goalMetDays: [daysAgoKey(1)], // one honest goal-day in window
      freezeEarnedDay: "",
    });
    state().trackReview(); // met today → 2 goal-days in window < 3 → no grant
    const s = state();
    expect(s.freezeCount).toBe(0);
    expect(s.freezeEarnedDay).toBe("");
    expect(s.goalMetDays).toContain(todayStr());
  });

  it("day rollover: stale yesterday dayStat does not leak into today", () => {
    useStudy.setState({
      dayStat: { day: daysAgoKey(1), reviews: 9, quizzes: 9, words: 9, dictation: 9, rush: 9 },
    });
    state().trackReview();
    const s = state();
    expect(s.dayStat.day).toBe(todayStr());
    expect(s.dayStat.reviews).toBe(1); // fresh zeroed day, not 10
    expect(s.dayStat.words).toBe(0);
  });
});

// ---------------- ۳) زنجیره: ادامهٔ طبیعی و نجات با یخ ----------------

describe("streak continuation and freeze rescue", () => {
  it("continues a natural chain (active yesterday)", () => {
    useStudy.setState({ streak: 5, bestStreak: 5, lastActiveDay: daysAgoKey(1) });
    state().trackReview();
    const s = state();
    expect(s.streak).toBe(6);
    expect(s.bestStreak).toBe(6);
  });

  it("a freeze repairs exactly one missed day", () => {
    useStudy.setState({
      streak: 5,
      bestStreak: 5,
      lastActiveDay: daysAgoKey(2), // missed exactly yesterday
      freezeCount: 1,
      freezeUsedDays: [],
    });
    state().trackReview();
    const s = state();
    expect(s.streak).toBe(6); // saved
    expect(s.freezeCount).toBe(0); // consumed
    expect(s.freezeUsedDays).toContain(daysAgoKey(1));
    expect(s.freezeSavedDay).toBe(todayStr());
  });

  it("a two-day gap with no freeze resets the chain", () => {
    useStudy.setState({ streak: 5, bestStreak: 7, lastActiveDay: daysAgoKey(3) });
    state().trackReview();
    const s = state();
    expect(s.streak).toBe(1);
    expect(s.bestStreak).toBe(7); // record survives
  });
});

// ---------------- ۴) پنجرهٔ هفته‌نامه و نردبان کنکور ----------------

describe("dayHistory window and konkur SRS entry", () => {
  it("pushDayHistory caps at 35 days and keeps the NEWEST days", () => {
    let map: Record<string, { day: string; reviews: number; quizzes: number; words: number; dictation: number; rush: number }> = {};
    for (let i = 40; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = todayStr(d);
      map = pushDayHistory(map, { day, reviews: i, quizzes: 0, words: 0, dictation: 0, rush: 0 });
    }
    const keys = Object.keys(map).sort();
    expect(keys).toHaveLength(35);
    expect(keys[0]).toBe(todayStrFromOffset(34)); // oldest kept = 34 days ago (41 pushed − cap 35)
    expect(keys[34]).toBe(todayStr()); // today
    expect(map[keys[0]].reviews).toBe(34); // day-40..day-35 dropped
  });

  it("konkurSrsEntry: wrong → rung 0; right-when-due → promote; right-early / first-time-right → no-op", () => {
    const now = Date.now();
    // wrong answer enters the queue
    const afterWrong = konkurSrsEntry({}, "x-1", false, now)!;
    expect(afterWrong["q:x-1"]).toEqual({ level: 0, dueAt: now + 15 * 60_000 });
    // right while NOT due yet → no promotion, no clone (undefined)
    expect(konkurSrsEntry(afterWrong, "x-1", true, now)).toBeUndefined();
    // right exactly when due → one rung up
    const due = { "q:x-2": { level: 2, dueAt: now - 1 } };
    const promoted = konkurSrsEntry(due, "x-2", true, now)!;
    expect(promoted["q:x-2"].level).toBe(3);
    expect(promoted["q:x-2"].dueAt).toBeGreaterThan(now);
    // first-time-right never enters the queue
    expect(konkurSrsEntry({}, "x-3", true, now)).toBeUndefined();
  });
});

// ---------------- ۵) کامل‌بودن لایهٔ سازگاری (بارل) ----------------

describe("compat barrel surface", () => {
  it("re-exports the historical API from @/lib/study-store", () => {
    const m = storeModule as unknown as Record<string, unknown>;
    for (const name of [
      "useStudy", "AVATAR_COLORS", "DEFAULT_SETTINGS", "DAILY_GOAL_OPTIONS",
      "FREEZE_CAP", "FREEZE_EARN_GOALS", "FREEZE_WINDOW",
      "SRS_INTERVALS", "SRS_LABELS",
      "normDayStat", "emptyDayStat", "todayStr", "daysAgoKey", "pushDayHistory",
      "srsDueCount", "srsQuestionDueIds", "srsQuestionDueTotal", "srsDueTotal", "firstLessonWithDue",
      "wordKey", "resultKey", "summarize", "knownCountOfLesson", "mistakesOfLesson", "questionSourceLesson",
      "lastNDays", "applyStreak", "goalAndFreezePatch", "activityPatch", "konkurSrsEntry",
    ]) {
      expect(m[name], `export ${name} missing from barrel`).toBeDefined();
    }
  });

  it("identity + navigation slices keep their historical behavior", () => {
    // ensureUserId is idempotent
    const id1 = state().ensureUserId();
    const id2 = state().ensureUserId();
    expect(id1).toBe(id2);
    // openLesson(smart) bumps the nonce and lands on the vocab tab
    useStudy.setState({ lessonTab: "grammar", flashNonce: 0 });
    state().openLesson(2, "smart");
    const s = state();
    expect(s.view).toEqual({ type: "lesson", id: 2 });
    expect(s.flashIntent).toBe("smart");
    expect(s.flashNonce).toBe(1);
    expect(s.lessonTab).toBe("vocab");
    // setView resets the flash intent
    state().setView({ type: "dictionary" });
    expect(state().flashIntent).toBe("none");
  });
});

/** today key of -n days… helper kept local (tests must not import engine internals twice) */
function todayStrFromOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
