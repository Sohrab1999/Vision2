// ------------------------------------------------------------------
// r360 — تکحقیقتِ «روزیِ یک‌بار» — استخراجِ خالص از pwa-layer.
//
// از r347 پنج توستِ خانواده (بدهیِ سررسید، یخزدایی، کسبِ یخ، سقفِ
// روخوانی، سقفِ توضیحِ هوشمند) همین آیدیوم را درونِ pwa-layer تکرار
// میکردند؛ راندِ ۳۶۰ ششمین مصرفکننده (هشدارِ پیشازِسقف) هم میآید و
// آیدیوم به کتابخانه میرود — مثلِ budget-tone: آیدیوم فقط اینجاست.
//
// قراردادِ صادقانه: کلید = «نشانگذاریِ امروز»؛ private-mode (throw) ⇒
// اجازهٔ توست — دسترسپذیری بر حسابداری مقدم است (قاعدهٔ fails-OPEN).
// ------------------------------------------------------------------

import { todayStr } from "@/state/day-engine";

/** true when this key wasn't already recorded today — records it atomically */
export function oncePerDay(key: string): boolean {
  const today = todayStr();
  try {
    if (localStorage.getItem(key) === today) return false;
    localStorage.setItem(key, today);
  } catch {
    /* private mode — allow the toast */
  }
  return true;
}
