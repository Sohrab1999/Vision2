// ------------------------------------------------------------------
// Task 120 — storyCardWords + wrapStoryWords: the pure word-wrap
// contract that lets the story card draw the LTR English tale with
// per-word amber highlight marks (the canvas twin of the UI's <mark>).
//   ① words inherit their segment's hit flag; punctuation stays plain
//   ② greedy fill measures word + joining space against the measure fn
//   ③ a single word wider than the whole line is hard-chopped, hit kept
//   ④ dropped=true is honest — only when tokens truly fall past maxLines
//   ⑤ degenerate inputs return honest empties
// measure here = string length (maxW in "chars"); space = 1 char.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { storyCardWords, wrapStoryWords, type StoryCardWord } from "@/lib/result-image";
import { storySegments, type StoryWord } from "@/lib/story-forge";

const M = (s: string) => s.length;

describe("storyCardWords", () => {
  it("inherits the hit flag from hit segments and keeps punctuation plain", () => {
    const words = storyCardWords([
      { text: "The " },
      { text: "ability", hit: "ability" },
      { text: " to fly amazed everyone." },
    ]);
    expect(words).toEqual([
      { text: "The", hit: false },
      { text: "ability", hit: true },
      { text: "to", hit: false },
      { text: "fly", hit: false },
      { text: "amazed", hit: false },
      { text: "everyone.", hit: false },
    ]);
  });

  it("survives junk segments honestly", () => {
    expect(storyCardWords([])).toEqual([]);
    expect(storyCardWords(null as unknown as [])).toEqual([]);
    const junk = [{ text: "" }, null, { text: "   " }] as unknown as Parameters<
      typeof storyCardWords
    >[0];
    expect(storyCardWords(junk)).toEqual([]);
  });

  it("integrates with the real segmenter: every <mark> the UI paints becomes a hit word", () => {
    const words: StoryWord[] = [
      { key: "1:ability", en: "ability", fa: "توانایی" },
      { key: "2:journey", en: "journey", fa: "سفر" },
    ];
    const story = "The ability grew on every journey. Ability returns.";
    const tokens = storyCardWords(storySegments(story, words));
    const hits = tokens.filter((t) => t.hit);
    // case-insensitive + punctuation stays out of the hit token
    expect(hits.map((h) => h.text)).toEqual(["ability", "journey", "Ability"]);
  });
});

describe("wrapStoryWords", () => {
  it("packs words greedily, counting the joining space", () => {
    const words: StoryCardWord[] = [
      { text: "ab", hit: false },
      { text: "cd", hit: false },
      { text: "efghij", hit: false },
    ];
    // maxW=10: "ab cd" = 5 fits, "ab cd efghij" = 12 does not
    expect(wrapStoryWords(words, 10, M, 5).lines).toEqual([
      [
        { text: "ab", hit: false },
        { text: "cd", hit: false },
      ],
      [{ text: "efghij", hit: false }],
    ]);
  });

  it("keeps the hit flag with its word across a line break", () => {
    const words: StoryCardWord[] = [
      { text: "keep", hit: false },
      { text: "ability", hit: true },
      { text: "close", hit: false },
    ];
    const { lines } = wrapStoryWords(words, 12, M, 5);
    expect(lines[0]).toEqual([
      { text: "keep", hit: false },
      { text: "ability", hit: true },
    ]);
    expect(lines[1]).toEqual([{ text: "close", hit: false }]);
  });

  it("hard-chops an oversized word and the hit flag survives the chop", () => {
    const words: StoryCardWord[] = [{ text: "abcdefghij", hit: true }];
    const { lines, dropped } = wrapStoryWords(words, 4, M, 5);
    expect(lines).toEqual([
      [{ text: "abcd", hit: true }],
      [{ text: "efgh", hit: true }],
      [{ text: "ij", hit: true }],
    ]);
    expect(dropped).toBe(false);
  });

  it("reports dropped honestly when the tail truly passes maxLines", () => {
    const words: StoryCardWord[] = ["aa", "bb", "cc", "dd", "ee"].map((t) => ({ text: t, hit: false }));
    const { lines, dropped } = wrapStoryWords(words, 5, M, 2);
    // "aa bb" / "cc dd" fit exactly, "ee" falls off
    expect(lines).toEqual([
      [
        { text: "aa", hit: false },
        { text: "bb", hit: false },
      ],
      [
        { text: "cc", hit: false },
        { text: "dd", hit: false },
      ],
    ]);
    expect(dropped).toBe(true);
  });

  it("exact fit never lies about dropping", () => {
    const words: StoryCardWord[] = ["aa", "bb", "cc"].map((t) => ({ text: t, hit: false }));
    const { lines, dropped } = wrapStoryWords(words, 5, M, 2);
    expect(lines).toEqual([
      [
        { text: "aa", hit: false },
        { text: "bb", hit: false },
      ],
      [{ text: "cc", hit: false }],
    ]);
    expect(dropped).toBe(false);
  });

  it("degenerate configs are honest", () => {
    const words: StoryCardWord[] = [{ text: "aa", hit: false }];
    expect(wrapStoryWords([], 10, M, 5)).toEqual({ lines: [], dropped: false });
    expect(wrapStoryWords(words, 0, M, 5)).toEqual({ lines: [], dropped: true });
    expect(wrapStoryWords(words, 10, M, 0)).toEqual({ lines: [], dropped: true });
    expect(wrapStoryWords(null as unknown as StoryCardWord[], 10, M, 5).lines).toEqual([]);
  });
});
