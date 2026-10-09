"use client";

// Shared TTS playback manager (uses backend /api/tts which wraps z-ai-web-dev-sdk)

const urlCache = new Map<string, string>();
let current: HTMLAudioElement | null = null;

export type SpeakStop = () => void;

export async function speak(
  text: string,
  speed = 0.95,
  onEnd?: () => void,
  onError?: () => void
): Promise<SpeakStop> {
  stopSpeaking();
  const key = `${speed}|${text}`;
  let url = urlCache.get(key);
  try {
    if (!url) {
      // two attempts: the TTS backend occasionally hiccups on cold start
      let res: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speed }),
        });
        if (res.ok) break;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
      }
      if (!res || !res.ok) {
        onError?.();
        return () => {};
      }
      const blob = await res.blob();
      url = URL.createObjectURL(blob);
      urlCache.set(key, url);
    }
    const audio = new Audio(url);
    current = audio;
    const stop: SpeakStop = () => {
      audio.pause();
      if (current === audio) current = null;
    };
    audio.onended = () => {
      if (current === audio) current = null;
      onEnd?.();
    };
    audio.onerror = () => {
      if (current === audio) current = null;
      onError?.();
    };
    await audio.play().catch(() => {
      onError?.();
    });
    return stop;
  } catch {
    onError?.();
    return () => {};
  }
}

export function stopSpeaking() {
  if (current) {
    current.pause();
    current = null;
  }
}

/**
 * Build a TTS-friendly "spelled out" version of a word: each latin letter
 * separated by commas so the voice reads them one by one ("b, e, a, u…").
 * Punctuation and spaces are skipped; apostrophes become a short pause.
 */
export function spellText(word: string): string {
  return word
    .split("")
    .filter((ch) => /[a-zA-Z']/.test(ch))
    .map((ch) => (ch === "'" ? "," : ch.toUpperCase()))
    .join(", ");
}

/** Speak the spelling of a word, letter by letter (same pipeline as speak). */
export function speakSpell(
  word: string,
  onEnd?: () => void,
  onError?: () => void
): SpeakStop {
  return speak(spellText(word), 0.8, onEnd, onError);
}
