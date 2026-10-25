"use client";

// Shared TTS playback manager (uses backend /api/tts which wraps z-ai-web-dev-sdk)
import { toast } from "@/hooks/use-toast";

const urlCache = new Map<string, string>();
let current: HTMLAudioElement | null = null;

// user preference (settings hub): multiplier applied to every speak() speed.
// Kept as a module-level value so callers never need plumbing; effective speed
// is rounded to 2 decimals so the URL cache key stays stable.
let rateScale = 1;
export function setSpeakRateScale(v: number): void {
  const n = Number.isFinite(v) ? Math.min(1.4, Math.max(0.6, v)) : 1;
  rateScale = Math.round(n * 100) / 100;
}
export function getSpeakRateScale(): number {
  return rateScale;
}

export type SpeakStop = () => void;

// r394 — the family toast gets ONE name. Since r345 the TTS-failure
// triple (mute title + connection advice + 3500ms) was hand-copied across
// NINE call sites and held equal only by source locks; the owner makes the
// equality structural. Borrowing is a choice, not a side effect: speak()
// itself never toasts (the r345 4-arg contract stays frozen) and the duel
// arena keeps its inline dialect (spell-rush renders its own paragraph).
// Fires no analytics on the failure path (the r344 rule).
export function speakFailToast(): void {
  toast({
    title: "🔇 پخش صدا ممکن نشد",
    description: "اتصال اینترنت را بررسی کن و دوباره روی دکمهٔ پخش بزن.",
    duration: 3500,
  });
}

export async function speak(
  text: string,
  speed = 0.95,
  onEnd?: () => void,
  onError?: () => void
): Promise<SpeakStop> {
  stopSpeaking();
  const eff = Math.round(speed * rateScale * 100) / 100;
  const key = `${eff}|${text}`;
  let url = urlCache.get(key);
  try {
    if (!url) {
      // two attempts: the TTS backend occasionally hiccups on cold start
      let res: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speed: eff }),
        });
        if (res.ok) break;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
      }
      if (!res || !res.ok) {
        // r347 — the monthly cap is a DIFFERENT failure than a hiccup:
        // it deserves its own honest message, not just the family toast.
        // Zero signature churn (the r345 4-arg contract stays frozen):
        // a window event carries the news, pwa-layer toasts it once/day.
        if (res && res.status === 429) {
          try {
            const data = (await res.json()) as { code?: string };
            if (data?.code === "tts_quota" && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("tts-quota"));
            }
          } catch {
            /* unreadable body — the family toast still tells the truth */
          }
        }
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
): Promise<SpeakStop> {
  return speak(spellText(word), 0.8, onEnd, onError);
}
