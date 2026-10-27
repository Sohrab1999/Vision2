#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r395 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ نخست: شکلِ فعل (l142، ۲۲ آیتم)
گردآوریِ درون‌خانوادگی از «مخزنِ بانکِ تایپیِ نهایی‌ها» (۸۹ ردیفِ ثبت‌شده در
futureNoteهای رسیدهای g12nahaie1..16) — سهمِ این قسط: ۲۲ ردیفِ «شکلِ فعل/واژه»
از ۹ برگه؛ ساقه‌ها از لایهٔ متنیِ booklet-extract/g12.txt و کلیدها از رسیدهای
راستی‌آزمایی‌شدهٔ راندهای r381..r389 (همگی با داوریِ کلیدِ چاپیِ همان راندها).

سهمِ هر برگه (۹ برگه / ۲۲ ردیف):
  r381 شهریور ۱۴۰۱ (ص۳۴۵): ق۳۵ be kept / ق۳۶ had studied / ق۳۷ would tell
  r382 دی ۱۴۰۰ (ص۳۳۱):     ق۳۲ had seen
  r383 شهریور ۱۴۰۰ (ص۳۲۴): ق۳۲ had got/gotten (دو شکلِ پذیرفته)
  r384 خرداد ۱۴۰۰ انسانی (ص۳۱۷): ق۳۱ was broken
  r385 خرداد ۱۴۰۰ ریاضی-تجربی (ص۳۱۰): ق۳۱ had paid
  r386 دی ۱۳۹۹ (ص۳۰۳):     ق۳۶ had studied / ق۳۷ is spoken
  r388 ناشنوایان شهریور ۹۹ (ص۲۹۴): ق۲۱ was found / ق۲۲ forgets / ق۲۳ got / ق۲۴ been made
  r388m خرداد ۱۳۹۹ ریاضی-تجربی (ص۲۶۱): ق۳۱ have been invited / ق۳۲ was said /
        ق۳۳ decides / ق۳۴ might-would-could choose (سه‌گانهٔ چاپی «might/would /could choose»)
  r389 خرداد ۱۳۹۹ انسانی (ص۲۷۰): ق۳۰ increasingly / ق۳۱ collect /
        ق۳۲ has been discovered / ق۳۳ were invented / ق۳۴ were

باقی‌ماندهٔ مخزن پس از این قسط: ۶۷ ردیف (۱۷ جمله‌سازی + ۵۰ پاسخِ مدل/شنیداری).
idempotent: اجرای دوم NO-OP (رسیدِ g12typedres1).
"""
import json
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"
LAYER = ROOT / "booklet-extract/g12.txt"

d = json.loads(OUT.read_text(encoding="utf-8"))
if "g12typedres1" in d.get("source", {}):
    print("r395: receipt g12typedres1 already present — NO-OP")
    raise SystemExit(0)
assert len(d["lessons"]) == 141, f"expected 141 banks before r395, got {len(d['lessons'])}"
assert [b["lesson"] for b in d["lessons"][-1:]] == [141], "last bank must be l141"

layer_text = LAYER.read_text(encoding="utf-8")
layer_flat = " ".join(layer_text.split())  # متنِ تخت — برای قطعه‌های میان‌خطی

G = "---------------"  # قراردادِ r394/l136: نقطه‌چینِ چاپ → پانزده خطِ چسبیده


def q(i: int, stem: str, accepted: list[str]):
    assert isinstance(accepted, list) and len(accepted) >= 1
    return {
        "id": f"g12-l142-{i}",
        "n": i,
        "category": "grammar",
        "question": stem,
        "options": [accepted[0]],
        "answer": 0,
        "kind": "typed",
        "accepted": accepted,
    }


ITEMS = [
    # —— r381 شهریور ۱۴۰۱ — س۱۰ (ق۳۵-۳۷) — کلیدِ چاپیِ داوری‌شده با رندر ۳۰۰dpi در همان راند ——
    ("The meat must " + G + " in a freezer. (to keep)", ["be kept"]),
    ("I passed my final exam because I " + G + " well. (to study)", ["had studied"]),
    ("I don't know the answer. If I knew the answer, I " + G + " you. (to tell)", ["would tell"]),
    # —— r382 دی ۱۴۰۰ — ق۳۲ ——
    ("I knew I " + G + " that man somewhere before. (see)", ["had seen"]),
    # —— r383 شهریور ۱۴۰۰ — ق۳۲ — کلیدِ چاپیِ دوتایی ——
    ("She was upset because she " + G + " a bad score. (get)", ["had got", "had gotten"]),
    # —— r384 خرداد ۱۴۰۰ انسانی — ق۳۱ ——
    ("The window " + G + " by that boy yesterday. (break)", ["was broken"]),
    # —— r385 خرداد ۱۴۰۰ ریاضی-تجربی — ق۳۱ ——
    ("They gave me some money back because I " + G + " too much. (pay)", ["had paid"]),
    # —— r386 دی ۱۳۹۹ — س۱۱ (ق۳۶-۳۷) — «china» کوچکِ چاپ وفادارانه ماند ——
    ("Joe " + G + " Chinese before he moved to china. (study)", ["had studied"]),
    ("Persian " + G + " in Iran, Tajikistan and Afghanistan. (speak)", ["is spoken"]),
    # —— r388 ناشنوایان — س۶ (ق۲۱-۲۴) ——
    ("The robber " + G + " by the police last week. (to find)", ["was found"]),
    ("Kate " + G + " to feed the chickens, doesn't he? (to forget)", ["forgets"]),
    ("If it " + G + " warmer, they would travel to the north. (to get)", ["got"]),
    ("A new medicine has " + G + " by doctors to cure cancer. (to make)", ["been made"]),
    # —— r388m خرداد ۱۳۹۹ ریاضی-تجربی — س۹ مکالمهٔ Babak/Ali (ق۳۱-۳۴) — پیشوندِ گوینده به الگویِ l136 ——
    ("Ali: You " + G + " (invite) to his birthday party, haven't you?", ["have been invited"]),
    ("Babak: No, nothing " + G + " (say) about it while I was talking to him.", ["was said"]),
    ("Ali: He may call you tomorrow. He always " + G + " (decide) to do things at the last moment, doesn't he?", ["decides"]),
    ("Babak: You are right! But if he told us sooner we " + G + " (choose) a better gift to buy.",
     ["might choose", "would choose", "could choose"]),
    # —— r389 خرداد ۱۳۹۹ انسانی — س۸ (ق۳۰-۳۴) ——
    ("His job became " + G + " difficult because of his illness. (increase)", ["increasingly"]),
    ("They " + G + " the waste every night and send it to the landfill, don't they? (collect)", ["collect"]),
    ("A: Is there any medicine for the disease? B: A new medicine " + G + " by the doctors to cure it since last month. (discover)",
     ["has been discovered"]),
    ("Smart phones and tablets " + G + " by lots of hard work some years ago. (invent)", ["were invented"]),
    ("They would travel all over the world if they " + G + " rich. (be)", ["were"]),
]

assert len(ITEMS) == 22, f"expected 22 items, got {len(ITEMS)}"

# ——— راستی‌آزماییِ لایه: رشته‌های خامِ چاپیِ کلیدها + قطعه‌های ساقه باید در لایه باشند ———
# (شکل‌های مشتقِ accepted — «might/would/could choose» و «had gotten» — از الگویِ چاپیِ
#  l108-4 ساخته می‌شوند؛ معیارِ لایه، رشتهٔ خامِ چاپ است نه اعضای مشتق)
RAW_KEYS = [
    "be kept", "had studied", "would tell",            # r381 — بلوکِ درهم ولی حاضر
    "had seen",                                        # r382
    "had got",                                         # r383 — چاپِ «had got/gotten»
    "was broken",                                      # r384
    "had paid",                                        # r385
    "is spoken",                                       # r386
    "was found", "forgets", "been made",               # r388 ناشنوایان
    "have been invited", "was said", "decides", "might/would /could choose",  # r388m
    "increasingly", "has been discovered", "were invented",                   # r389
]
for a in RAW_KEYS:
    assert a in layer_flat, f"printed key '{a}' not found in g12.txt layer"
for frag in [
    "The meat must", "that man somewhere before", "a bad score", "by that boy yesterday",
    "some money back because I", "before he moved to", "Tajikistan and Afghanistan",
    "by the police last week", "to feed the chickens", "warmer, they would travel",
    "to cure cancer", "to his birthday party", "while I was talking to him",
    "at the last moment", "a better gift to buy", "because of his illness",
    "send it to the landfill", "cure it since last month", "by lots of hard work",
    "all over the world if they",
]:
    assert frag in layer_flat, f"stem fragment '{frag}' not found in g12.txt layer"

bank = {
    "lesson": 142,
    "title": "مرورِ تایپیِ نهایی‌ها — شکلِ فعل (قسمتِ افعالِ مخزنِ ۸۹ ردیفی)",
    "level": "تایپی",
    "count": len(ITEMS),
    "questions": [q(i + 1, s, a) for i, (s, a) in enumerate(ITEMS)],
}
d["lessons"].append(bank)

d["source"]["g12typedres1"] = {
    "extractedRound": "r395",
    "section": ("بانکِ تایپیِ نهایی‌ها — قسمتِ نخست: شکلِ فعل (l142) — نخستین بانکِ گردآوریِ درون‌خانوادگی؛ "
                "ساخته‌شده از ۲۲ ردیفِ افعالیِ «مخزنِ بانکِ تایپیِ نهایی‌ها» (۸۹ ردیفِ ثبت‌شده در futureNoteهای "
                "g12nahaie1..16) بدونِ صفحهٔ تازه — تکمیلِ فرصتِ ثبت‌شدهٔ راندهای r380-r394"),
    "examPages": ("بدونِ صفحهٔ آزمونِ تازه؛ ساقه‌ها از لایهٔ متنیِ booklet-extract/g12.txt (ص۳۴۵/۳۳۱/۳۲۴/۳۱۷/"
                  "۳۱۰/۳۰۳/۲۹۴/۲۶۱/۲۷۰) و کلیدها از رسیدهای راستی‌آزمایی‌شدهٔ g12nahaie2/3/4/5/6/7/9/10/11 + "
                  "پروبِ صفحاتِ کلیدِ چاپی (ص۲۹۹/۲۶۶/۲۷۵ — «21. was found … 24. been made»، «31. have been "
                  "invited … 34. might/would /could choose»، «30. increasingly … 34. were»)؛ کلیدهای سه‌گانهٔ "
                  "r381 (be kept/had studied/would tell) داوریِ رندر ۳۰۰dpiِ همان r381 است"),
    "keyPolicy": ("همهٔ ۲۲ کلید عینِ چاپ‌اند؛ دوتاییِ چاپیِ r383 «had got/gotten» → accepted دومَعضوی؛ "
                  "سه‌گانهٔ چاپیِ r388m «might/would /could choose» → accepted سهمَعضوی (الگویِ l108-4)؛ "
                  "بک‌تیکِ چاپ (haven`t/doesn`t) به آپوستروفِ ASCII نرمال شد — الگویِ l136ِ r394؛ "
                  "«china» کوچکِ چاپِ r386-36 وفادارانه ماند"),
    "items": 22,
    "bankCounts": {"l142": 22},
    "reservoirCensus": {
        "consumedHere": {
            "r381-shahrivar1401": "س۱۰: ق۳۵-۳۷ (۳)",
            "r382-dey1400": "ق۳۲ (۱)",
            "r383-shahrivar1400": "ق۳۲ (۱)",
            "r384-khordad1400h": "ق۳۱ (۱)",
            "r385-khordad1400m": "ق۳۱ (۱)",
            "r386-dey1399": "س۱۱: ق۳۶-۳۷ (۲)",
            "r388-deaf": "س۶: ق۲۱-۲۴ (۴)",
            "r388m-khordad1399m": "س۹: ق۳۱-۳۴ (۴)",
            "r389-khordad1399h": "س۸: ق۳۰-۳۴ (۵)",
        },
        "remaining": ("۶۷ ردیف: ۱۷ جمله‌سازی (r381-ق۳۸؛ r382-ق۳۳/۳۴؛ r383-ق۳۳/۳۴؛ r384-ق۳۲/۳۳؛ r386-ق۳۸؛ "
                      "r387-ق۵۹-۶۲؛ r388m-س۱۶ چهارگانه) + ۵۰ پاسخِ مدلِ خوانداری/شنیداری/واژه‌نامه "
                      "(r380-ق۴۳/۴۴/۴۷/۴۸؛ r381-ق۳۹/۴۵-۴۷/۵۲/۵۷-۵۸؛ r382-ق۴۰/۴۳/۴۴/۴۷/۴۸؛ r383-ق۴۰/۴۷/۴۸؛ "
                      "r384-ق۳۴/۳۸/۴۲/۴۳؛ r385-ق۳۲/۳۳/۳۴/۴۳؛ r386-ق۴۴/۴۵/۵۰/۵۱؛ r387-ق۴۳/۴۴؛ r390-ق۳۷/۳۸/۵۵-۵۷/۶۰؛ "
                      "r391-ق۳۵/۳۶/۴۸/۴۹/۵۳-۵۵؛ r392-ق۴۹؛ r393-ق۱-۶ شنیداری) — قسطِ دوم/سومِ بانکِ تایپی"),
    },
    "engineNote": ("یکهزاردرصدِ تایپی (kind=typed، options=[کلیدِ نخست] به‌عنوانِ داربست) — مستثنی از حلقهٔ MCQ؛ "
                   "خانهٔ ۱۵خطِ چسبیده به الگویِ l136؛ پیشوندِ گویندهٔ Ali:/Babak:/A:-B: به الگویِ مکالمهٔ l136؛ "
                   "راهنمای مصدرِ داخلِ پرانتز وفادار به چاپ (فقط نیم‌فاصلهٔ درونی نرمال شد)؛ "
                   "دو acceptedِ چندعضوی: l142-5 (had got/had gotten) و l142-17 (might/would/could choose)"),
    "futureNote": ("مخزن از ۸۹ به ۶۷ ردیف رسید — قسطِ دوم: ۱۷ جمله‌سازی، قسطِ سوم: ۵۰ پاسخِ مدل؛ "
                   "دو فرصتِ دیگرِ ثبت‌شدهٔ بخش: فیلدِ تصویرِ QuizQuestion (REQUIRES-APPROVAL) و case-sensitive mode"),
}

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r395 OK: +1 bank / +{bank['count']} items -> {len(d['lessons'])} banks / {total} items")
