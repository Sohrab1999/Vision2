// Task 116 «داستانِ واژه‌های من» — the pure contract of story-forge:
// selection (dedupe/cap/dangling-drop/min-floor), the order-insensitive
// fingerprint, the strict story parser, the honest fallback and the
// highlight segmenter. No imports, no DOM — total functions only.

import { describe, it, expect } from "vitest";
import {
  STORY_MIN_WORDS,
  STORY_MAX_WORDS,
  selectStoryWords,
  storyFingerprint,
  parseStory,
  fallbackStory,
  storySegments,
  type StoryWord,
} from "@/lib/story-forge";

const w = (key: string, en: string, fa: string): StoryWord => ({ key, en, fa });

const RESOLVER = new Map<string, StoryWord>([
  ["1:ability", w("1:ability", "ability", "توانایی")],
  ["1:aboard", w("1:aboard", "aboard", "سوارِ")],
  ["1:absent", w("1:absent", "absent", "غایب")],
  ["2:achieve", w("2:achieve", "achieve", "به دست آوردن")],
  ["2:actor", w("2:actor", "actor", "بازیگر")],
  ["3:adventure", w("3:adventure", "adventure", "ماجراجویی")],
]);
const resolve = (key: string) => RESOLVER.get(key) ?? null;

describe("selectStoryWords", () => {
  it("resolves and keeps input order once enough words survive", () => {
    const out = selectStoryWords(
      ["1:absent", "1:ability", "2:achieve", "3:adventure"],
      resolve
    );
    expect(out).not.toBeNull();
    expect(out!.map((x) => x.key)).toEqual(["1:absent", "1:ability", "2:achieve", "3:adventure"]);
  });

  it("drops dangling keys silently but counts only real survivors", () => {
    const out = selectStoryWords(
      ["1:ability", "9:ghost", "2:achieve", "no-colon", "3:adventure", "1:absent"],
      resolve
    );
    expect(out!.map((x) => x.key)).toEqual(["1:ability", "2:achieve", "3:adventure", "1:absent"]);
  });

  it("returns null below the minimum floor (honest not-enough)", () => {
    expect(selectStoryWords(["1:ability", "2:achieve", "1:absent"], resolve)).toBeNull();
    expect(selectStoryWords([], resolve)).toBeNull();
  });

  it("dedupes repeated keys and counts them once", () => {
    const out = selectStoryWords(
      ["1:ability", "1:ability", "2:achieve", "2:achieve", "1:absent", "2:actor"],
      resolve
    );
    expect(out!.length).toBe(4);
    expect(out!.filter((x) => x.key === "1:ability").length).toBe(1);
  });

  it("caps at STORY_MAX_WORDS", () => {
    const many = Array.from({ length: 30 }, (_, i) => `1:ability`); // same key dedupes…
    // build 30 distinct resolvable keys by extending the resolver locally
    const big = new Map<string, StoryWord>();
    for (let i = 0; i < 30; i++) big.set(`${i}:k${i}`, w(`${i}:k${i}`, `k${i}`, `ف${i}`));
    const keys = [...big.keys()];
    const out = selectStoryWords(keys, (k) => big.get(k) ?? null);
    expect(out!.length).toBe(STORY_MAX_WORDS);
    expect(many.length).toBe(30); // sanity for the array above (unused path)
  });

  it("rejects malformed input shapes", () => {
    expect(selectStoryWords(null as unknown as string[], resolve)).toBeNull();
    expect(
      selectStoryWords([123 as unknown as string, "1:ability", "1:absent", "2:achieve", "2:actor"], resolve)
    ).not.toBeNull(); // non-string skipped, real ones survive
  });

  it("exposes the documented constants", () => {
    expect(STORY_MIN_WORDS).toBe(4);
    expect(STORY_MAX_WORDS).toBe(20);
  });
});

describe("storyFingerprint", () => {
  it("is order-insensitive — same set, different star order, same story", () => {
    const a = [w("1:ability", "ability", "توانایی"), w("1:absent", "absent", "غایب"), w("2:actor", "actor", "بازیگر"), w("2:achieve", "achieve", "رسیدن")];
    const b = [w("2:achieve", "achieve", "رسیدن"), w("1:absent", "absent", "غایب"), w("2:actor", "actor", "بازیگر"), w("1:ability", "ability", "توانایی")];
    expect(storyFingerprint(a)).toBe(storyFingerprint(b));
  });

  it("different sets → different fingerprints", () => {
    const a = [w("1:ability", "a", "a"), w("1:absent", "b", "b"), w("2:actor", "c", "c"), w("2:achieve", "d", "d")];
    const b = a.slice(0, 3).concat(w("3:adventure", "e", "e"));
    expect(storyFingerprint(a)).not.toBe(storyFingerprint(b));
  });

  it("survives garbage entries and empty input", () => {
    expect(storyFingerprint([])).toBe("");
    expect(storyFingerprint([null as unknown as StoryWord, w("1:ability", "a", "a")])).toBe("1:ability");
  });
});

describe("parseStory", () => {
  it("parses the documented format: english body + «خلاصه:» line", () => {
    const raw =
      "Sara had the ability to fix any problem.\nOne morning the school bus was absent.\nShe chose to achieve something great.\nThe actor joined her adventure.\nخلاصه: داستان دربارهٔ توانایی سارا برای ماجراجویی بود.";
    const out = parseStory(raw);
    expect(out).not.toBeNull();
    expect(out!.summary).toContain("سارا");
    expect(out!.story).toContain("ability");
    expect(out!.story).not.toContain("خلاصه");
  });

  it("accepts the inline summary variant too", () => {
    const raw = "This is a simple story about an absent actor who had the ability to achieve his dream.\nخلاصه: یک جملهٔ فارسی.";
    const out = parseStory(raw);
    expect(out).not.toBeNull();
    expect(out!.summary).toBe("یک جملهٔ فارسی.");
  });

  it("strips markdown paint from the model output", () => {
    const raw =
      "**Sara** had the `ability` to achieve.\n# Title\nShe was never absent.\nThe actor began the adventure.\nخلاصه: پاک‌سازی.";
    const out = parseStory(raw)!;
    expect(out.story).not.toMatch(/[*`#]/);
  });

  it("caps the story at a sentence boundary, never mid-word", () => {
    const long = "A".repeat(50) + ". " + ("This is a sentence about absent actors. ".repeat(30)).trim();
    const raw = long + "\nخلاصه: بریده.";
    const out = parseStory(raw)!;
    expect(out.story.length).toBeLessThanOrEqual(700);
    expect(out.story.endsWith(".")).toBe(true);
  });

  it("returns null on garbage: empty body, missing summary, too-short story", () => {
    expect(parseStory("")).toBeNull();
    expect(parseStory("Only sentences no summary line at all here which is long enough for the floor." + " more text")).toBeNull();
    expect(parseStory("Short.\nخلاصه: کوتاه.")).toBeNull();
  });
});

describe("fallbackStory", () => {
  it("names the learner's own words — an exercise, never a fabricated tale", () => {
    const words = ["1:ability", "1:absent", "2:actor", "2:achieve"].map((k) => RESOLVER.get(k)!);
    const out = fallbackStory(words);
    expect(out.story).toContain("ability, absent, actor, achieve");
    expect(out.summary).toContain("دسترس نیست");
    expect(out.story.length).toBeLessThan(400); // TTS-safe
  });
});

describe("storySegments", () => {
  it("marks target words case-insensitively and keeps the rest plain", () => {
    const words = [w("1:ability", "ability", "توانایی"), w("1:absent", "absent", "غایب")];
    const segs = storySegments("Her ABILITY grew while he was absent.", words);
    const hits = segs.filter((s) => s.hit);
    expect(hits.map((h) => h.text)).toEqual(["ABILITY", "absent"]);
    expect(segs.map((s) => s.text).join("")).toBe("Her ABILITY grew while he was absent.");
  });

  it("respects word boundaries — «abilities» does not light up «ability»", () => {
    const words = [w("1:ability", "ability", "توانایی")];
    const segs = storySegments("Her abilities grew.", words);
    expect(segs.filter((s) => s.hit).length).toBe(0);
  });

  it("longer words win — «book» vs «bookish» never swaps", () => {
    const words = [w("1:book", "book", "کتاب"), w("1:bookish", "bookish", "کتابی")];
    const segs = storySegments("A bookish book.", words);
    const hits = segs.filter((s) => s.hit).map((h) => h.text);
    expect(hits).toEqual(["bookish", "book"]);
  });

  it("honest with no matches and empty inputs", () => {
    const words = [w("1:ability", "ability", "توانایی")];
    expect(storySegments("Nothing here.", words)).toEqual([{ text: "Nothing here." }]);
    expect(storySegments("", words)).toEqual([]);
    expect(storySegments("Plain text.", [])).toEqual([{ text: "Plain text." }]);
  });

  it("handles punctuation glued to the target word", () => {
    const words = [w("1:absent", "absent", "غایب")];
    const segs = storySegments("He was absent, she knew.", words);
    expect(segs.filter((s) => s.hit).length).toBe(1);
    expect(segs.map((s) => s.text).join("")).toBe("He was absent, she knew.");
  });
});
