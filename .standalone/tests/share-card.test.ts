// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 102 — قراردادِ خالصِ هم‌رسانیِ بومی (Web Share API Level 2):
//   ① blobToFile — نام/نوعِ تضمینی image/png (حتی با blob بی‌نوع)
//   ② canShareImageFiles — فقط با canShare({files}) واقعی؛ نه حدسِ UA
//   ③ shareImageFile — سهِ نتیجهٔ صادق: shared/cancelled/failed؛
//     لغوِ کاربر (AbortError/NotAllowedError) خطا نیست؛ هرگز throw نمی‌کند
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import {
  blobToFile,
  canShareImageFiles,
  shareImageFile,
  type ShareCapableNavigator,
} from "@/lib/share-card";

const navWith = (
  can?: (d: ShareData) => boolean,
  share?: (d: ShareData) => Promise<void>
): ShareCapableNavigator => ({ canShare: can, share });

const pngFile = () => new File([new Blob(["x"], { type: "image/png" })], "card.png", { type: "image/png" });

describe("blobToFile (Task 102)", () => {
  it("نام و نوعِ تضمینی image/png — حتی با blob بی‌نوع", () => {
    const f = blobToFile(new Blob(["abc"]), "vision2-duels.png");
    expect(f.name).toBe("vision2-duels.png");
    expect(f.type).toBe("image/png");
    expect(f.size).toBe(3);
  });

  it("blobِ نوع‌دار، نوعش حفظ می‌شود", () => {
    const f = blobToFile(new Blob(["x"], { type: "image/png" }), "c.png");
    expect(f.type).toBe("image/png");
  });
});

describe("canShareImageFiles (Task 102)", () => {
  it("بدونِ canShare → false", () => {
    expect(canShareImageFiles({ share: async () => {} })).toBe(false);
  });

  it("بدونِ share → false", () => {
    expect(canShareImageFiles({ canShare: () => true })).toBe(false);
  });

  it("canShare({files}) false → false — پشتیبانیِ فقطِ متن، فایل حساب نمی‌شود", () => {
    expect(canShareImageFiles(navWith(() => false, async () => {}))).toBe(false);
  });

  it("canShare({files}) true + share → true", () => {
    expect(canShareImageFiles(navWith(() => true, async () => {}))).toBe(true);
  });

  it("canShare پرتاب کند → false (نه انفجار)", () => {
    expect(
      canShareImageFiles({
        canShare: () => {
          throw new Error("x");
        },
        share: async () => {},
      })
    ).toBe(false);
  });

  it("canShare فایلِ PNGی نمونه را می‌بیند — همان شرطِ shareِ واقعی", () => {
    let seen: ShareData | undefined;
    canShareImageFiles({
      canShare: (d) => {
        seen = d;
        return true;
      },
      share: async () => {},
    });
    expect(seen?.files?.length).toBe(1);
    expect(seen?.files?.[0]?.type).toBe("image/png");
  });

  it("navigatorِ تعریف‌نشده (SSR) → false — قرارداد به navigatorِ واقعی نیاز دارد", () => {
    // فراخوانی با navِ صریحِ undefined یعنی مسیرِ realNav — در jsdom navigator
    // هست ولی canShare ندارد → false؛ در SSR کل navigator نیست → باز false
    expect(canShareImageFiles(undefined)).toBe(false);
  });
});

describe("shareImageFile (Task 102)", () => {
  const req = () => ({ file: pngFile(), title: "t", text: "x" });

  it("پشتیبانی‌نشدن → failed بدونِ فراخوانیِ share", async () => {
    let called = 0;
    const r = await shareImageFile(
      req(),
      navWith(() => false, async () => {
        called++;
      })
    );
    expect(r).toBe("failed");
    expect(called).toBe(0);
  });

  it("share موفق → shared با همان file/title/text", async () => {
    let data: ShareData | undefined;
    const r = await shareImageFile(
      req(),
      navWith(
        () => true,
        async (d) => {
          data = d;
        }
      )
    );
    expect(r).toBe("shared");
    expect(data?.files?.[0]?.name).toBe("card.png");
    expect(data?.files?.[0]?.type).toBe("image/png");
    expect(data?.title).toBe("t");
    expect(data?.text).toBe("x");
  });

  it("AbortError → cancelled — لغوِ کاربر خطا نیست", async () => {
    const r = await shareImageFile(
      req(),
      navWith(() => true, async () => {
        throw new DOMException("aborted", "AbortError");
      })
    );
    expect(r).toBe("cancelled");
  });

  it("NotAllowedError → cancelled", async () => {
    const r = await shareImageFile(
      req(),
      navWith(() => true, async () => {
        throw new DOMException("no", "NotAllowedError");
      })
    );
    expect(r).toBe("cancelled");
  });

  it("خطای دیگر → failed", async () => {
    const r = await shareImageFile(
      req(),
      navWith(() => true, async () => {
        throw new Error("boom");
      })
    );
    expect(r).toBe("failed");
  });

  it("navِ بین‌راهی (canShare true ولی share نیست) → failed بدونِ انفجار", async () => {
    const r = await shareImageFile(req(), { canShare: () => true });
    expect(r).toBe("failed");
  });
});
