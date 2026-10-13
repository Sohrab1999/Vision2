"use client";

// ------------------------------------------------------------------
// Task 102 — هم‌رسانیِ بومیِ کارت‌ها (Web Share API Level 2).
// کارتِ PNG (result-image) ورودیِ آمادهٔ این قرارداد است؛ این‌جا فقط
// تصمیمِ «هم‌رسانی یا پشتیبانی‌نشدن» صادقانه گرفته می‌شود:
//   · پشتیبانی فقط با canShare({files}) واقعی — نه حدسِ user-agent
//   · لغوِ کاربر (AbortError/NotAllowedError) خطا نیست — cancelled
//   · هیچ‌وقت throw نمی‌کند؛ نتیجه همیشه یکی از سهِ صادق است
// ------------------------------------------------------------------

/** نتیجهٔ هم‌رسانی — صادق: لغوِ کاربر خطا نیست، پشتیبانی‌نشدن failed است */
export type ShareOutcome = "shared" | "cancelled" | "failed";

export interface ShareImageRequest {
  file: File;
  title: string;
  text: string;
}

/** زیرمجموعهٔ ساختاریِ Navigator که قرارداد به آن نیاز دارد (تست‌ها mock می‌کنند) */
export interface ShareCapableNavigator {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
}

/** navigator واقعی یا undefined در محیطِ بی‌navigator (SSR/node) */
function realNav(nav?: ShareCapableNavigator): ShareCapableNavigator | undefined {
  if (nav) return nav;
  if (typeof navigator === "undefined") return undefined;
  return navigator as unknown as ShareCapableNavigator;
}

/** blob → File با نوعِ تضمینی image/png (کارت‌ها همیشه PNG هستند) */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || "image/png" });
}

/**
 * پشتیبانیِ واقعیِ هم‌رسانیِ فایل: هم canShare و هم share باید باشند و
 * canShare({files}) با یک فایلِ PNGی نمونه true بدهد — همان شرطی که
 * shareِ واقعی با آن موافقت می‌کند (نه کمتر، نه بیشتر).
 */
export function canShareImageFiles(nav?: ShareCapableNavigator): boolean {
  try {
    const n = realNav(nav);
    if (!n || typeof n.canShare !== "function" || typeof n.share !== "function") return false;
    const probe = new File([new Blob(["p"], { type: "image/png" })], "probe.png", { type: "image/png" });
    return n.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/**
 * هم‌رسانیِ فایلِ تصویر با شیتِ بومیِ سیستم‌عامل.
 *   shared    — شیت باز شد و کاربر مقصد را تأیید کرد
 *   cancelled — خودِ کاربر لغو کرد (AbortError/NotAllowedError) — خطا نیست
 *   failed    — پشتیبانی نمی‌شود یا مرورگر رد کرد (بدونِ فراخوانیِ share)
 */
export async function shareImageFile(
  req: ShareImageRequest,
  nav?: ShareCapableNavigator
): Promise<ShareOutcome> {
  const n = realNav(nav);
  if (!canShareImageFiles(n)) return "failed";
  try {
    await n!.share!({ files: [req.file], title: req.title, text: req.text });
    return "shared";
  } catch (e) {
    // DOMException در همهٔ محیط‌ها instanceof Error نیست — نام را duck-type می‌خوانیم
    const name =
      typeof e === "object" && e !== null && "name" in e ? String((e as { name: unknown }).name) : "";
    if (name === "AbortError" || name === "NotAllowedError") return "cancelled";
    return "failed";
  }
}
