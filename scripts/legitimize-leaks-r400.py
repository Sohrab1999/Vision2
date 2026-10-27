#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r400 — مشروع‌سازیِ رشته‌هایِ نشت‌سنج با بانکِ l144 (الگویِ Solar power — r391/392/395/396).
هر رشته‌ای که بانکِ «پاسخ‌هایِ مدل» (l144) به‌طورِ مشروع در ساقه/گزینه/accepted دارد
از فهرستِ forbidden برگهٔ مربوطه حذف و با نشانِ R400-LEGIT مستند می‌شود.
نشانِ ایدمپوتنسی: «R400-LEGIT» در سطرِ نخستِ فایل.
"""
from pathlib import Path

ROOT = Path("/home/z/my-project/tests")

# (فایل، [(جایگزینیِ دقیقِ سطر، جایگزینِ جدید، توضیحِ رسید)]) — هر جایگزینی دقیقاً ۱ رخداد
EDITS = {
    "jozve-tests-g12-shahrivar-r381.test.ts": [
        (
            '      "time machine", "A Forest is a place", // س۱۰-س۱۳ (باز)\n',
            '      "A Forest is a place", // س۱۰-س۱۳ (باز)\n      // R400-LEGIT — 1 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شد: "time machine"→g12-l144-5\n',
        ),
        (
            '      "are produced to work for a long time", "What do solar technologies deliver", // ردیف ۴۵-۴۷\n',
            '      // R400-LEGIT — 2 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند: "are produced to work for a long time"→g12-l144-7، "What do solar technologies deliver"→g12-l144-8\n',
        ),
        (
            '      "The part of speech helps you find", // ردیف ۵۷\n',
            '      // R400-LEGIT — "The part of speech helps you find"→g12-l144-10\n',
        ),
    ],
    "jozve-tests-g12-dey-r382.test.ts": [
        (
            '      "What do Iranians use", // ردیف ۴۰\n      "Because they can cause brain problems", // ردیف ۴۸\n',
            '      // R400-LEGIT — 2 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند (الگویِ Solar power): "What do Iranians use"→g12-l144-12، "Because they can cause brain problems"→g12-l144-16\n',
        ),
    ],
    "jozve-tests-g12-khordad1400-r384.test.ts": [
        (
            '      "An ostrich", // س۱۲ (تایپی/تولیدی)\n      "They feel honored.", // ردیف ۳۸ (تایپی) — با نقطه؛ متنِ خوانداریِ l31 «They feel honored when» دارد\n',
            '      // R400-LEGIT — 2 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند (الگویِ Solar power): "An ostrich"→g12-l144-20، "They feel honored."→g12-l144-21\n',
        ),
    ],
    "jozve-tests-g12-khordad1400m-r385.test.ts": [
        (
            '      "A horse is an animal", // س۱۲ (تایپی/تولیدی)\n',
            '      // R400-LEGIT — 1 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شد (الگویِ Solar power): "A horse is an animal"→g12-l144-24\n',
        ),
    ],
    "jozve-tests-g12-dey1399-r386.test.ts": [
        (
            '      "When should teachers clear up", // ردیفِ ۴۴ (تایپی)\n      "Picasso is famous for", // ردیفِ ۵۱ (تایپی)\n      "Artists from everywhere in the", // ردیفِ ۵۰ (تایپی)\n',
            '      // R400-LEGIT — 3 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند (الگویِ Solar power): "When should teachers clear up"→g12-l144-26، "Picasso is famous for"→g12-l144-29، "Artists from everywhere in the"→g12-l144-28\n',
        ),
    ],
    "jozve-tests-g12-dey1397-r390.test.ts": [
        (
            '      "a bag I always", // ق۳۷ خامِ جمله‌سازی (مدلِ چاپیِ key متنِ بانک نیست)\n      "she Mina", // ق۳۸ خام\n',
            '      // R400-LEGIT — 2 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند (الگویِ Solar power): "a bag I always"→g12-l144-32، "she Mina"→g12-l144-33\n',
        ),
    ],
    "jozve-tests-g12-khordad1398-r391.test.ts": [
        (
            '      "rained / brown", // ق۳۵ خام\n      "famous / lives", // ق۳۶ خام\n',
            '      // R400-LEGIT — 2 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شدند (الگویِ Solar power): "rained / brown"→g12-l144-38، "famous / lives"→g12-l144-39\n',
        ),
    ],
    "jozve-tests-g12-shahrivar1398-r392.test.ts": [
        (
            '      "If we have a good vocabulary", // مدلِ چاپِ ق۴۹ — مخزن (متنِ ساقه «If you have» دارد)\n',
            '      // R400-LEGIT — 1 رشته با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن) مشروع شد (الگویِ Solar power): "If we have a good vocabulary"→g12-l144-45\n',
        ),
    ],
    "jozve-tests-g12-dey1398-r393.test.ts": [
        (
            '      "do exercise", // مدلِ صوتیِ ق۱\n      "dishwasher", // مدلِ صوتیِ ق۲\n',
            '      // R400-LEGIT — 4 مدلِ صوتیِ ق۱-۶ با بانکِ l144 (پاسخ‌هایِ مدلِ مخزن — ساقهٔ فارسیِ صادقانه) مشروع شدند (الگویِ Solar power): "do exercise"→g12-l144-46، "dishwasher"→g12-l144-47، "sun or sunshine"→g12-l144-50، "You can carry it everywhere"→g12-l144-51\n',
        ),
        (
            '      "sun or sunshine", // مدلِ صوتیِ ق۵\n      "You can carry it everywhere", // مدلِ صوتیِ ق۶\n',
            '',
        ),
    ],
}

for name, edits in EDITS.items():
    p = ROOT / name
    txt = p.read_text(encoding="utf-8")
    if "R400-LEGIT" in txt:
        print(f"{name}: already legitimized — NO-OP")
        continue
    for old, new in edits:
        assert txt.count(old) == 1, f"{name}: pattern x{txt.count(old)} — {old[:70]!r}"
        txt = txt.replace(old, new)
    txt = "// R400-LEGIT — رشته‌هایِ مصرفیِ l144 از نشت‌سنج حذف شدند (الگویِ Solar power)\n" + txt
    p.write_text(txt, encoding="utf-8")
    print(f"{name}: legitimized OK ({len(edits)} edits)")
