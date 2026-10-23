// ------------------------------------------------------------------
// r353 — «عمقِ پنلِ معلم»: شناسهٔ ناموجودالاثرِ یادگیرنده.
// handle = ۱۶ نویسهٔ hex از HMAC-SHA256(userId, کدِ دسترسیِ اپراتور).
//
// چرا این شکل؟ قفلِ حریمِ r352 میگوید «هیچ userId و secretی در
// payload نیست» — ولی دیالوگِ جزئیات باید بتواند یک یادگیرنده را
// آدرس کند. HMAC این پل را بیآبرو میریزد:
//   · از handle به userId برنمیگردی (HMAC یکطرفه است).
//   · با چرخشِ کدِ اپراتور همهٔ handleها عوض میشوند — handleهایِ
//     کهنه بیاعتبار و بیبارند (کوئریِ بیهمتا ⇒ 404 صادق).
//   · بینِ سرورهایِ مختلف پیوندناپذیر است.
// فقط سرور: node:crypto را وارد میکند — هیچ مصرفکنندهٔ کلاینتی
// نباید این ماژول را import کند (خودِ مسیرِ API همان سرور است).
// ------------------------------------------------------------------

import { createHmac } from "node:crypto";

export const LEARNER_HANDLE_RE = /^[0-9a-f]{16}$/;

export function learnerHandle(userId: string, operatorCode: string): string {
  return createHmac("sha256", operatorCode).update(userId, "utf8").digest("hex").slice(0, 16);
}
