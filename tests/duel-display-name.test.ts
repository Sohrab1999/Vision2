// ------------------------------------------------------------------
// Task 131 «نامِ نمایشیِ نبرد» — SEC-5: خوداظهارِ فقطِ نمایشی.
//
// ① قراردادِ خالصِ resolveDuelName (duel-receipt.ts):
//    پیش‌نویسِ خالی/فاصله → نامِ پروفایل → فالبکِ «یادگیرنده»؛ trim و
//    slice(24) از duelDisplayName به ارث می‌رسد (پاریتی با readProfile
//    سرویسِ ۳۰۰۳ — کلاینت باید همان نامی را ادعا کند که داور ثبت کرده).
// ② قراردادِ منبعِ سوکت: هر دو payload (duel:create/duel:join) با
//    resolveDuelName ساخته می‌شوند، نامِ resolveشده در myDuelNameRef قفل
//    می‌شود و جست‌وجوی رسیدِ آمار همان را ادعا می‌کند (refِ پایدار، نه
//    خواندنِ دیرهنگامِ استور) — گره‌زدنِ «ورود» و «اثباتِ نتیجه».
// الگوی رندر: seed مستقیمِ store (هم‌الگوی shield/share tests).
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { resolveDuelName, duelDisplayName } from "@/lib/duel-receipt";

describe("resolveDuelName — the per-duel display alias (Task 131)", () => {
  it("empty draft falls back to the profile name", () => {
    expect(resolveDuelName("", "سینا")).toBe("سینا");
  });

  it("whitespace-only draft falls back to the profile name (trim inherited)", () => {
    expect(resolveDuelName("   ", "سینا")).toBe("سینا");
  });

  it("a real draft wins over the profile name", () => {
    expect(resolveDuelName("شیرِ کدنویس", "سینا")).toBe("شیرِ کدنویس");
  });

  it("the draft itself is trimmed", () => {
    expect(resolveDuelName("  alias  ", "سینا")).toBe("alias");
  });

  it("a 24+ char draft is sliced to 24 (readProfile parity)", () => {
    expect(resolveDuelName("a".repeat(30), "سینا")).toBe("a".repeat(24));
  });

  it("a 24+ char PROFILE falls back sliced to 24 — never «یادگیرنده» while non-empty", () => {
    expect(resolveDuelName("", "ب".repeat(26))).toBe("ب".repeat(24));
  });

  it("empty draft AND empty profile → the honest service default «یادگیرنده»", () => {
    expect(resolveDuelName("", "")).toBe("یادگیرنده");
  });

  it("non-string inputs never throw (defensive guards)", () => {
    expect(resolveDuelName(undefined as unknown as string, "سینا")).toBe("سینا");
    expect(resolveDuelName("alias", undefined as unknown as string)).toBe("alias");
    expect(resolveDuelName(undefined as unknown as string, undefined as unknown as string)).toBe("یادگیرنده");
  });

  it("network agreement with duelDisplayName on the fallback chain (sampled pairs)", () => {
    const drafts = ["", "   ", "علی", "a".repeat(30)];
    const profiles = ["", "سینا", "ب".repeat(26), "یادگیرنده"];
    for (const d of drafts) {
      for (const p of profiles) {
        expect(resolveDuelName(d, p)).toBe(duelDisplayName(d.trim() || p));
      }
    }
  });
});

describe("socket source contract — the resolved name threads entry AND receipt (Task 131)", () => {
  const src = readFileSync(
    resolve(process.cwd(), "src/components/study/duel/use-duel-socket.ts"),
    "utf8"
  );

  it("both entry payloads build the name with resolveDuelName(nameDraft, …)", () => {
    expect(src.split("resolveDuelName(nameDraft, store.userName)").length - 1, "create + join").toBe(2);
    expect(src).not.toContain('name: store.userName || "یادگیرنده"');
  });

  it("the resolved name is locked into myDuelNameRef exactly at both entry points", () => {
    expect(src.split("myDuelNameRef.current = duelName").length - 1).toBe(2);
  });

  it("the stats receipt lookup claims the SAME locked name (ref first, legacy fallback)", () => {
    expect(src).toContain("duelName: myDuelNameRef.current || duelDisplayName(useStudy.getState().userName)");
  });

  it("the setup input honors the 24-char parity client-side (slice + maxLength)", () => {
    const setup = readFileSync(
      resolve(process.cwd(), "src/components/study/duel/duel-setup.tsx"),
      "utf8"
    );
    expect(setup).toContain("setNameDraft(e.target.value.slice(0, 24))");
    expect(setup).toContain("maxLength={24}");
  });
});
