// Task 116 «داستانِ واژه‌های من» — the pure contract for the AI mini-story
// forge. Same discipline as weekly-digest/share-card: no imports, no side
// effects, every path total. The route resolves wordKeys server-side (the
// client sends ids only — the explain security posture), this module does
// the selecting, fingerprinting, parsing and highlighting.

export const STORY_MIN_WORDS = 4; // fewer than this → not enough material for a tale
export const STORY_MAX_WORDS = 20; // cap the paid generation + the cache key
export const STORY_MAX_LEN = 700; // story body ceiling — also keeps it TTS-readable in one call (route trims at 950)
export const STORY_SUMMARY_MAX_LEN = 200; // Persian one-liner ceiling

export interface StoryWord {
  key: string; // "1:ability"
  en: string; // "ability"
  fa: string; // "توانایی"
}

/** one highlighted segment — `hit` names the matched target word (en) */
export interface StorySegment {
  text: string;
  hit?: string;
}

/**
 * Resolve + dedupe + cap the starred keys in input order (the launcher feeds
 * its current filter order, so «newest first» stays the caller's decision).
 * Dangling keys (content renamed, stale star) are silently dropped — same
 * policy as buildMyWordsDeck. Returns null when fewer than MIN survive:
 * an honest «not enough words» instead of a forced story.
 */
export function selectStoryWords(
  keys: string[],
  resolve: (key: string) => StoryWord | null
): StoryWord[] | null {
  if (!Array.isArray(keys)) return null;
  const seen = new Set<string>();
  const words: StoryWord[] = [];
  for (const raw of keys) {
    if (typeof raw !== "string" || raw.length === 0 || raw.length > 40) continue;
    if (seen.has(raw)) continue;
    const word = resolve(raw);
    if (!word || !word.en || !word.fa) continue;
    seen.add(raw);
    words.push({ key: raw, en: word.en, fa: word.fa });
    if (words.length >= STORY_MAX_WORDS) break;
  }
  return words.length >= STORY_MIN_WORDS ? words : null;
}

/**
 * Cache fingerprint for a resolved word set — order-insensitive (starring
 * the same words in a different order is the SAME story), duplicate-proof
 * (selectStoryWords already dedupes, but the fingerprint holds alone too).
 */
export function storyFingerprint(words: StoryWord[]): string {
  const keys = Array.isArray(words) ? words.map((w) => String(w?.key ?? "")).filter(Boolean) : [];
  return [...new Set(keys)].sort().join(",");
}

/** strip markdown paint and collapse ragged whitespace — plain text only */
function stripPaint(raw: string): string {
  return String(raw ?? "")
    .replace(/[*_`#>]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parse the model output. Contract: a few plain English sentences, then a
 * final line starting with «خلاصه:» carrying the Persian one-liner.
 * Returns null on garbage (empty body, missing summary, story below the
 * usefulness floor) — the caller then serves the honest fallback.
 */
export function parseStory(raw: string): { story: string; summary: string } | null {
  const clean = stripPaint(raw);
  if (!clean) return null;

  let summary = "";
  let story = clean;
  const lines = clean.split("\n");
  const summaryIdx = lines.findIndex((l) => /^خلاصه\s*:/.test(l.trim()));
  if (summaryIdx >= 0) {
    summary = lines[summaryIdx].replace(/^خلاصه\s*:\s*/, "").trim().slice(0, STORY_SUMMARY_MAX_LEN);
    story = lines.filter((_, i) => i !== summaryIdx).join("\n").trim();
  } else {
    // lenient: the summary rides the last line after a خلاصه marker inline
    const inline = clean.match(/خلاصه\s*:\s*([^\n]+)$/);
    if (inline) {
      summary = inline[1].trim().slice(0, STORY_SUMMARY_MAX_LEN);
      story = clean.slice(0, inline.index).trim();
    }
  }

  // cap at a sentence boundary — never mid-word
  if (story.length > STORY_MAX_LEN) {
    const cut = story.slice(0, STORY_MAX_LEN);
    const stop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
    story = (stop > 200 ? cut.slice(0, stop + 1) : cut).trim();
  }

  if (story.length < 40 || !summary) return null;
  return { story, summary };
}

/**
 * The honest fallback when the AI is unreachable — NOT a fabricated story,
 * a real self-study exercise using the learner's own words. source stays
 * "fallback" and the UI says «حالت آفلاین».
 */
export function fallbackStory(words: StoryWord[]): { story: string; summary: string } {
  const list = words
    .slice(0, STORY_MAX_WORDS)
    .map((w) => w.en)
    .join(", ");
  return {
    story:
      `Your words: ${list}. ` +
      `Can you write ONE short English sentence for each of them? ` +
      `Read every sentence aloud twice, then try to tell a friend the whole idea in Persian without looking. ` +
      `Small stories you make yourself stick better than long ones you only read.`,
    summary: "هوش مصنوعی الان در دسترس نیست — خودت با همین واژه‌ها جمله بساز و بلند بخوان؛ داستانِ ساختهٔ خودت ماندگارتر است!",
  };
}

/** escape a string for literal use inside a RegExp */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Split the story into render segments, marking where target words appear.
 * Case-insensitive with a light word-boundary guard; longer words match
 * first so «ability» wins over a hypothetical «ab». Punctuation keeps its
 * segment. Every target word is guaranteed present by the prompt, but an
 * honest segmenter must survive stories that dropped one.
 */
export function storySegments(story: string, words: StoryWord[]): StorySegment[] {
  const text = String(story ?? "");
  const targets = (Array.isArray(words) ? words : [])
    .map((w) => String(w?.en ?? "").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  if (!text) return [];
  if (targets.length === 0) return [{ text }];

  const alt = targets.map(escapeRe).join("|");
  const re = new RegExp(`(^|[^A-Za-z])(${alt})(?=$|[^A-Za-z])`, "gi");
  const out: StorySegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const lead = m[1];
    const hitStart = m.index + lead.length;
    if (hitStart > last) out.push({ text: text.slice(last, hitStart) });
    out.push({ text: m[2], hit: m[2] });
    last = hitStart + m[2].length;
    if (m[2].length === 0) re.lastIndex++; // paranoia: never loop on empty match
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out.filter((s) => s.text.length > 0);
}
