#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r320 — تزریقِ ۲۰ ترجمهٔ چاپیِ «ترجمهٔ تست» کلیدِ تشریحیِ بخش اول (ص۱۸۵-۱۸۶) به l10
+ تصدیقِ چاپ‌محورِ کلید (l10: ۲۰/۲۰ گزینه(X)؛ l11: ۴۰/۴۰ گریدِ ص۱۸۷) — الگوی r315/r319.
بستنِ رسیدِ موکولِ r284 («بازسازی به راند مستقل موکول شد»). idempotent؛ فرمتِ ریپو حفظ می‌شود."""
import hashlib
import json
import sys

BANK = "/home/z/my-project/public/jozve/grammar-g12-topic.json"

# رونویسیِ چشمیِ ۱۴۰۰-۳۴۰۰dpi + کراس‌چکِ fitz (رندر حاکم بر حروف، لایه حاکم بر تقطیع)
TRANSCRIPT = {
    1: "مرد گفت: ماشینهای زیادی در این مکان خریداری میشود.",
    2: "دانش آموزان تخته سیاه را پاک کردند. به عبارت دیگر، تخته سیاه توسط دانش آموزان پاک شد.",
    3: "بنی دستهایش را شسته است. به عبارت دیگر، دستهای بنی تمیز شده اند.",
    4: "تکلیف زیادی از ساعت ۸ انجام داده شده است.",
    5: "تعداد زیادی از فیلمهای جالب اغلب در این سینما نمایش داده میشوند.",
    6: "این محصول با قیمت پائین‌تری برای سالها فروخته شده است.",
    7: "جالب است بدانیم که این پل دو سال قبل ساخته شد.",
    8: "امروز یک چیز جالب اتفاق افتاد و همه دانش آموزان خندیدند.",
    9: "به ما گفته شد که شما این کتاب را از کتابخانه قرض گرفته بودید.",
    10: "گزارش آزمایشات انجام گرفته توسط دانش آموزان به معلم فرستاده شد.",
    11: "من نمیدانستم که کتاب \"جنایات و مکافات\" توسط \"فئودور داستایوفسگی\" نوشته شده است.",
    12: "شغل خوبی توسط آنها به خواهرم پیشنهاد شده، اما او آن را رد کرد (نپذیرفت).",
    13: "به آقای علوی هدیه ای توسط همکارانش داده شده (اهدا شد) وقتی که او بازنشسته شد.",
    14: "آلبرت انیشتین نزد عامه مردم به عنوان معروف ترین دانشمند همه دوران شناخته شده است.",
    15: "بنی سیلین در دهه ۱۹۲۰ عریضه شد، و به گسترش عصر آنتی بیوتیک ها کمک کرد.",
    16: "دیوار بزرگ چین هزاران سال قبل ساخته شد.",
    17: "وقتیکه بچه بودم به من یاد داده شد که چگونه از آن دستگاه قدیمی استفاده کنم، شما نیاز نیست به من آموزش دهید.",
    18: "دیزن لند یک پارک تفریحی معروف جهانی در کالیفرنیای جنوبی است. از آن توسط بیشتر از ده میلیون نفر هر سال بازدید میشود.",
    19: "بسیاری از ما به فرض از آب در زندگی روزانه مان استفاده می کنیم، اما آدمی که در بیابان زندگی می کند آب را با سهل انگاری استفاده نمی کند. برای آنها، هر قطره آب ارزشمند است.",
    20: "برواز به استنبول به مدت پنج ساعت تاخیر داشته است به خاطر مهی که مانع از زمین برخاستن و فرود هواپیماها در لحظه شده است.",
}

WASH_RECEIPT = {
    "round": "r320",
    "pages": "185-186",
    "section": "کلید توضیحیِ «پاسخنامه تستهای گرامر جملات معلوم و مجهول — بخش اول» — خط‌های «ترجمه تست»",
    "method": "visual transcription (1400dpi halves + 2400-3400dpi word zooms; render governs letters, fitz governs tokenization — الگوی r315/r316)",
    "items": 20,
    "supersedes": "r284 deferral («بازسازیِ رسیددار به راند مستقل موکول شد»)",
    "keysVerified": "20/20 گزینه(X)ِ تشریحی با JSON موافق — صفر واگرایی",
    "printQuirks": [
        "بنی (×۲ آیتم ۳) برای Betty — عینِ چاپ",
        "داستایوفسگی (آیتم ۱۱) — به‌جای داستایوفسکی؛ عینِ چاپ",
        "بنی سیلین (آیتم ۱۵) — پ→ب؛ عینِ چاپ",
        "عریضه شد (آیتم ۱۵) — ناسازگاریِ معنایی با کشفِ پنی‌سیلین؛ عینِ چاپ (الگوی printErrata r309)",
        "برواز (آیتم ۲۰) — Boeing؛ عینِ چاپ",
        "استنبول (آیتم ۲۰) — بدون همزه؛ عینِ چاپ",
        "مهی (آیتم ۲۰) — عینِ چاپ",
        "دیزن لند (آیتم ۱۸) — به‌جای دیزنی‌لند؛ عینِ چاپ",
        "ماشینهای/میشود/میشوند چسبیده و می کنیم/می کند فاصله‌دار — عینِ چاپ",
        "برخاستن (آیتم ۲۰) — ۳۴۰۰dpi حاکم بر لایهٔ «برداستن»",
    ],
}

PART2_RECEIPT = {
    "round": "r320",
    "page": "187",
    "method": "visual transcription of 300dpi full-page render (print-verbatim — الگوی r319)",
    "items": 40,
    "agree": 40,
    "note": "گریدِ «پاسخنامه کلیدی 40 تست ... بخش دوم (صفحه 37 و 38)» — صفر واگرایی با JSON؛ ترجمهٔ چاپی برای part2 وجود ندارد (غیبتِ صادقانه)",
}

NEW_TRANSLATIONS_NOTE = "part1: ۲۰ ترجمهٔ چاپیِ «ترجمه تست» کلیدِ تشریحیِ ص۱۸۵-۱۸۶ تزریق شد (رسیدِ translationsWashed r320 — رسیدِ موکولِ r284 بسته شد)؛ part2: در جزوه ترجمهٔ چاپی ندارد (غیبتِ صادقانه)"


def main() -> int:
    before = open(BANK, encoding="utf-8").read()
    d = json.loads(before)
    passive = d["source"]["passive"]
    if passive.get("part1", {}).get("translationsWashed", {}).get("round") == "r320":
        cur = json.dumps(passive, ensure_ascii=False, sort_keys=True)
        # بازسازیِ حالتِ تزریق‌شده برای سنجش (فقط زیردرختِ passive)
        probe_p = json.loads(json.dumps(passive))  # deep copy
        probe_p["part1"]["translationsWashed"] = WASH_RECEIPT
        probe_p["part2"]["printVerification"] = PART2_RECEIPT
        probe_p["translations"] = NEW_TRANSLATIONS_NOTE
        if json.dumps(probe_p, ensure_ascii=False, sort_keys=True) == cur:
            print("[inject] NO-OP (idempotent) — md5", hashlib.md5(before.encode()).hexdigest()[:12])
            return 0
    # ۱) ترجمه‌ها به l10
    l10 = [l for l in d["lessons"] if l["lesson"] == 10][0]
    changed = 0
    for q in l10["questions"]:
        t = TRANSCRIPT[q["n"]]
        if q.get("translation") != t:
            q["translation"] = t
            changed += 1
    # ۲) رسیدها
    passive["part1"]["translationsWashed"] = WASH_RECEIPT
    passive["part2"]["printVerification"] = PART2_RECEIPT
    passive["translations"] = NEW_TRANSLATIONS_NOTE
    out = json.dumps(d, ensure_ascii=False, indent=1) + "\n"
    open(BANK, "w", encoding="utf-8").write(out)
    print(f"[inject] translations changed: {changed} — md5 {hashlib.md5(out.encode()).hexdigest()[:12]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
