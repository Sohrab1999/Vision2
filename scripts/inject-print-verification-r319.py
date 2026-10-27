#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r319 — تزریقِ رسیدِ «تصدیقِ چاپ‌محورِ کلید» برای سه بانکِ افعال ناقص/معلوم‌مجهول (ص۲۲۴).
الگوی r316-r318: داوریِ مستقلِ چشمی از رندرِ واقعی (۳۰۰dpi کامل + ۱۴۰۰dpi ناحیه)؛
۸۰ کلید رونویسی شد — ۷۹ موافق JSON، C-Q10 چاپ=b (خطای چاپ؛ حکمِ r269/r282 برجاست: c).
تزریقِ idempotent به source.modals.printVerification — فرمتِ ریپو (indent=1) حفظ می‌شود."""
import hashlib
import json
import sys

BANK = "/home/z/my-project/public/jozve/grammar-g12-topic.json"

# رونویسیِ چشمیِ رندرِ ص۲۲۴ (/tmp/r319-p224-full.png + b3-zoom@1400dpi)
TRANSCRIPT = {
    "A": "dccacbbacdbcbbdbccdb",
    "B": "cdbccbddabbbbbccaaba",
    "C": "".join(["cbddb", "aabdb", "bdbda", "bbbcd", "adbbb", "bbccc", "bcbbb", "cdabd"]),
}

RECEIPT = {
    "round": "r319",
    "page": "224",
    "method": "visual transcription of 300dpi full-page render + 1400dpi zone zoom (print-verbatim)",
    "items": 80,
    "agree": 79,
    "transcripts": TRANSCRIPT,
    "printErratum": {
        "family": "C",
        "n": 10,
        "print": "b",
        "json": "c",
        "cellZoom": "1400dpi — خانهٔ «10 b» قطعی است",
        "reason": "چاپ b=«should have been painted» با تعجبِ مثبتِ «What a beautiful painting!» نمی‌سازد؛ c=«must have been painted» (پسیو + استنتاجِ قطعیِ گذشته) — حکمِ داوریِ r269/r282 پابرجاست؛ کلیدِ درون‌خطی در ص۱۵۱ وجود ندارد",
    },
}


def main() -> int:
    before = open(BANK, encoding="utf-8").read()
    d = json.loads(before)
    modals = d["source"].get("modals")
    if not modals:
        print("!! source.modals not found")
        return 1
    if modals.get("printVerification", {}).get("round") == "r319":
        # idempotency: مقایسهٔ محتوا
        cur = json.dumps(modals["printVerification"], ensure_ascii=False, sort_keys=True)
        new = json.dumps(RECEIPT, ensure_ascii=False, sort_keys=True)
        if cur == new:
            print("[inject] printVerification already r319 — NO-OP (idempotent), md5",
                  hashlib.md5(before.encode()).hexdigest()[:12])
            return 0
    # جای‌گذاری با حفظِ ترتیبِ کلیدها: printVerification بعد از answerRepairs/extractedRound
    modals["printVerification"] = RECEIPT
    out = json.dumps(d, ensure_ascii=False, indent=1) + "\n"
    if out == before:
        print("[inject] no change?!")
        return 1
    open(BANK, "w", encoding="utf-8").write(out)
    print(f"[inject] printVerification injected — md5 {hashlib.md5(out.encode()).hexdigest()[:12]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
