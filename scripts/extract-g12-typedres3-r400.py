#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r400 — «بانکِ تایپیِ نهایی‌ها» — قسمتِ سوم (پایانی): پاسخ‌هایِ مدل (l144، ۵۱ آیتم)
سومین بانکِ گردآوریِ درون‌خانوادگی از «مخزنِ بانکِ تایپیِ نهایی‌ها» — سهمِ این قسط:
۵۱ ردیفِ «پاسخِ مدلِ» خوانداری/واژه‌نامه/شنیداری از ۱۲ برگه (r380-r393)؛ با این بانک
مخزنِ ۹۱ ردیفیِ جزئی به‌طورِ کامل مصرف می‌شود (۲۲ افعال l142 + ۱۸ جمله‌سازی l143 + ۵۱ مدل l144).

سهمِ هر برگه (۱۲ برگه / ۵۱ ردیف):
  r380 خرداد ۱۴۰۲ (ص۳۳۶-۳۴۰):        ق۴۳/۴۴/۴۷/۴۸ — کلید ص۳۴۱-۳۴۲
  r381 شهریور ۱۴۰۱ (ص۳۴۳-۳۴۷):       ق۳۹/۴۵/۴۶/۴۷/۵۲/۵۷/۵۸ — کلید ص۳۴۸-۳۴۹
  r382 دی ۱۴۰۰ (ص۳۲۹-۳۳۳):           ق۴۰/۴۳/۴۴/۴۷/۴۸ — کلید ص۳۳۴-۳۳۵
  r383 شهریور ۱۴۰۰ (ص۳۲۲-۳۲۶):       ق۴۰/۴۷/۴۸ — کلید ص۳۲۷-۳۲۸
  r384 خرداد ۱۴۰۰ انسانی (ص۳۱۵-۳۱۹): ق۳۴/۳۸/۴۲/۴۳ — کلید ص۳۲۰-۳۲۱
  r385 خرداد ۱۴۰۰ ر-ت (ص۳۰۸-۳۱۲):    ق۳۴/۴۳ — کلید ص۳۱۳-۳۱۴
  r386 دی ۱۳۹۹ (ص۳۰۱-۳۰۵):           ق۴۴/۴۵/۵۰/۵۱ — کلید ص۳۰۶-۳۰۷
  r387 شهریور ۱۳۹۹ (ص۲۸۵-۲۹۰):       ق۴۳ (means) / ق۴۴ (founding) — کلید ص۲۹۱-۲۹۲
  r390 دی ۱۳۹۷ (ص۲۲۹-۲۳۳):           ق۳۷/۳۸/۵۵/۵۶/۵۷/۶۰ — کلید ص۲۳۴-۲۳۶ (سربرگِ قدیمی)
  r391 خرداد ۱۳۹۸ (ص۲۳۷-۲۴۱):        ق۳۵/۳۶/۴۸/۴۹/۵۳/۵۴/۵۵ — کلید ص۲۴۲-۲۴۳
  r392 شهریور ۱۳۹۸ (ص۲۴۴-۲۴۸):       ق۴۹ — کلید ص۲۴۹-۲۵۰
  r393 دی ۱۳۹۸ (ص۲۵۱-۲۵۶):           ق۱-۶ شنیداری — کلید ص۲۵۷ (شش مدلِ چاپی؛ ساقه فقط صوتی)

روش: مدل‌ها عینِ چاپِ کلید؛ کلیدهای عمودیِ سربرگِ قدیمی (r380-۴۸، r382-۴۷، r383-۴۷/۴۸،
r391-۴۹/۵۳/۵۴، r392-۴۹، r381-۳۹/۵۸) با خوانشِ پایین-به-بالای چیپ‌های RTL بازسازی و با
خطِ کورپوس (خودِ خوانداریِ برگه) راستی‌آزمایی شدند؛ r391-۳۵/۳۶ دو ترتیبِ چاپیِ «یا»دار →
accepted دومَعضوی؛ r381-۵۲ «We / You» → دو شکلِ accepted؛ ردیف‌های «which» (r384/385-ق۳۴)
با مدلِ چاپیِ تک‌واژه‌ای؛ شنیداری‌های r393 با ساقهٔ فارسیِ صادقانه (ساقه فقط صوتی است).
idempotent: اجرای دوم NO-OP (رسیدِ g12typedres3).
"""
import json
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g12.json"

d = json.loads(OUT.read_text(encoding="utf-8"))
if "g12typedres3" in d.get("source", {}):
    print("r400: receipt g12typedres3 already present — NO-OP")
    raise SystemExit(0)
assert len(d["lessons"]) == 143, f"expected 143 banks before r400, got {len(d['lessons'])}"
assert d["lessons"][-1]["lesson"] == 143, "last bank must be l143"

def q(i: int, cat: str, stem: str, accepted: list[str]):
    return {
        "id": f"g12-l144-{i}",
        "n": i,
        "category": cat,
        "question": stem,
        "options": [accepted[0]],
        "answer": 0,
        "kind": "typed",
        "accepted": accepted,
    }

# (برگه، شماره، دسته، ساقه، acceptedها، قطعه‌هایِ راستی‌آزمایی | None=مدلِ بازسازی‌شدهٔ عمودی)
WHICH_INSTR = "«جمله را با ضمیرِ موصولیِ مناسب whom, who یا which کامل کنید» — "
FA_DIG = {1: "۱", 2: "۲", 3: "۳", 4: "۴", 5: "۵", 6: "۶"}
LISTEN_STEM = (
    "شنیداری {n} (برگهٔ نهاییِ دی ۱۳۹۸) — ساقه فقط در فایلِ صوتی است و در برگه چاپ نشده؛ "
    "مدلِ پاسخِ چاپ‌شدهٔ کلیدِ رسمی را تایپ کنید:"
)
ITEMS = [
    # ——— r380 خرداد ۱۴۰۲ — خوانداریِ John و واژه‌نامهٔ فنی — کلید ص۳۴۲ ———
    ("r380", 43, "vocab", "What did John ask Mike when he came out of the car?",
     ["He asked him if he could drive him home."], None),
    ("r380", 44, "vocab", "Why was John upset and worried the last time he was in the office?",
     ["John was upset because he had lost his documents.", "because he had lost his documents."],
     ["John was upset ) because he had lost his documents"]),
    ("r380", 47, "vocab", "What does “them” in the first line of paragraph 3 refer to?",
     ["It refers to words."], None),
    ("r380", 48, "vocab", "What is a technical dictionary?",
     ["A dictionary which explains the meanings of technical words."],
     ["A dictionary which", "the meanings of technical words"]),
    # ——— r381 شهریور ۱۴۰۱ — خوانداریِ خواب و انرژی خورشیدی — کلید ص۳۴۸-۳۴۹ ———
    ("r381", 39, "grammar", "If I had a time machine, ……………………………………….",
     ["I would travel to the future."], ["travel", "would", "future"]),
    ("r381", 45, "vocab", "In cloudy weather …………………. is available.",
     ["solar energy"], None),
    ("r381", 46, "vocab", "Solar ……………….. are produced to work for a long time.",
     ["panels"], None),
    ("r381", 47, "vocab", "What do solar technologies deliver to us?",
     ["Solar technologies can deliver heat, cooling, natural lighting, electricity, and fuels."], None),
    ("r381", 52, "vocab", "How much do we sleep in our lives?",
     ["We spend about one-third (1/3) of our lives in sleep.",
      "You spend about one-third (1/3) of our lives in sleep."],
     ["We spend about one-third (1/3) of our lives in sleep"]),
    ("r381", 57, "vocab", "The part of speech helps you find …………………….",
     ["the meaning of the word."], None),
    ("r381", 58, "vocab", "According to the passage, we use a dictionary when…………………",
     ["We are still confused or think we are missing important information."],
     ["are missing important information", "still conf", "used or think"]),
    # ——— r382 دی ۱۴۰۰ — خوانداریِ معماری ایرانی و معلمانِ فداکار — کلید ص۳۳۵ ———
    ("r382", 40, "vocab", "What do Iranians use to get the most sunshine? ……. .",
     ["Iranians use special designs and arrangements of windows, balconies and yards to get the most sunshine."], None),
    ("r382", 43, "vocab", "Students can show their respect to teachers by ……. .",
     ["paying attention during lessons and following classroom rules."], None),
    ("r382", 44, "vocab", "Dedicated teachers become a model for students because they …… .",
     ["go far beyond their duties."], None),
    ("r382", 47, "vocab", "What are some examples of technology?",
     ["televisions, computers, online games, phones."], None),
    ("r382", 48, "vocab", "Why should you use your mobile phone for limited time? ……. .",
     ["Because they can cause brain problems."], None),
    # ——— r383 شهریور ۱۴۰۰ — طبیعت و گوشی همراه — کلید ص۳۲۸ ———
    ("r383", 40, "vocab", "Your cell phone is a ……… that you can carry around every day.",
     ["portable device"], None),
    ("r383", 47, "vocab", "Where can you show your children the beauty of nature?",
     ["You can do this in your yard or in your favorite park."],
     ["You can do th", "in your yard or in your favorite park"]),
    ("r383", 48, "vocab", "What should you remind to kids?",
     ["You should remind your children that all living creatures are parts of our world and are valuable in the natural environment."], None),
    # ——— r384 خرداد ۱۴۰۰ انسانی — شترمرغ، احترام به سالمندان، واژه‌نامه — کلید ص۳۲۰-۳۲۱ ———
    ("r384", 34, "grammar", WHICH_INSTR + "An ostrich is a bird ………. .",
     ["which"], None),
    ("r384", 38, "vocab", "How do elders feel when we appreciate their love? ……. .",
     ["They feel honored."], None),
    ("r384", 42, "vocab",
     "When you find a/an …………, you can find the exact meaning of the word, pronunciation, part of speech and many other things.",
     ["entry"], None),
    ("r384", 43, "vocab", "The passage says that you should try to learn ………….. to expand your vocabulary.",
     ["collocations"], None),
    # ——— r385 خرداد ۱۴۰۰ ریاضی-تجربی — اسب و کلکتورهای خورشیدی — کلید ص۳۱۳-۳۱۴ ———
    ("r385", 34, "grammar", WHICH_INSTR + "A horse is an animal ………. .",
     ["which"], None),
    ("r385", 43, "vocab", "How can solar collectors collect heat? ……. .",
     ["Solar collectors collect heat by absorbing sunlight."], None),
    # ——— r386 دی ۱۳۹۹ — معلمان و پیکاسو — کلید ص۳۰۷ ———
    ("r386", 44, "vocab", "When should teachers clear up students’ confusion?",
     ["Quickly before they jump into to the next lesson."], None),
    ("r386", 45, "vocab", "What must the students have when they enter a more advanced level",
     ["They must have a native language dictionary."], None),
    ("r386", 50, "vocab", "Artists from everywhere in the …... came to Paris to see Picasso’ first paining in modern Art.",
     ["world"], None),
    ("r386", 51, "vocab", "Picasso is famous for …... the Cubism Style.",
     ["creating"], None),
    # ——— r387 شهریور ۱۳۹۹ — آتش و شهرها — کلید ص۲۹۲ ———
    ("r387", 43, "vocab", "Fire provided the …………… for cooking plants which were not eaten before.",
     ["means"], None),
    ("r387", 44, "vocab", "Finally, early humans began to follow other goals such as ………… the cities.",
     ["founding"], None),
    # ——— r390 دی ۱۳۹۷ — واژه‌نامه‌ها و معلمان — کلید ص۲۳۴-۲۳۶ (سربرگِ قدیمی) ———
    ("r390", 37, "grammar", "very heavy / a bag I always / which / my brother / seems / carries .",
     ["My brother always carries a bag which seems very heavy."],
     ["My brother always carries", "a bag which seems very heavy"]),
    ("r390", 38, "grammar", "well,/ should/ so /has /study / tonight / tomorrow / an exam / she Mina.",
     ["Mina has an exam tomorrow, so she should study well tonight."],
     ["Mina has an exam tomorrow", "so she should study well tonight"]),
    ("r390", 55, "vocab", "Which kind of dictionary is useful for beginners?",
     ["Bilingual dictionary is useful for them."], None),
    ("r390", 56, "vocab", "What does the first half of a bilingual dictionary contain?",
     ["It contains the English word along with their meaning in another language."], None),
    ("r390", 57, "vocab", "How many languages are used in a monolingual dictionary to explain the word meanings?",
     ["One language is used in it."], None),
    ("r390", 60, "vocab", "What do teachers do to find tools and ways to help their students become successful?",
     ["They attend conference and training sessions to find tools and ways to help their students become successful."], None),
    # ——— r391 خرداد ۱۳۹۸ — باغِ قهوه‌ای، همسایه، کمک و واژه‌نامه — کلید ص۲۴۲-۲۴۳ ———
    ("r391", 35, "grammar", "rained / brown / for months / everything / because / hadn't / in the garden / was / it.",
     ["Everything in the garden was brown because it hadn't rained for months.",
      "Everything is brown in the garden because it hadn't rained for months."],
     ["Everything in the garden was brown", "everything is brown in the garden", "because it hadn’t rained for months"]),
    ("r391", 36, "grammar", "famous / lives / the woman / professor / next door / is / who / a.",
     ["The woman who lives next door is a famous professor.",
      "The woman who is a famous professor lives next door."],
     ["The woman who lives next door", "is a famous professor", "The woman who is a famous professor"]),
    ("r391", 48, "vocab", "What can it lead to when you see the impacts on those you are helping?",
     ["It can lead not only to great personal happiness but also to respect from others who appreciate the work you do."], None),
    ("r391", 49, "vocab", "What is the important point in helping others?",
     ["The important point is that we continue to give to those who are more in need than ourselves."], None),
    ("r391", 53, "vocab", "How can a talking dictionary help us?",
     ["By using a talking dictionary, we are able to look the words up in a few minutes."], None),
    ("r391", 54, "vocab", "What is the use of example sentences?",
     ["Seeing specific words used in a sentence can provide more context and help you better understand proper usage."], None),
    ("r391", 55, "vocab", "When is a dictionary a great help for us?",
     ["When reading or writing a story,an essay,a paragraph or even a sentence, using a dictionary is a great help."], None),
    # ——— r392 شهریور ۱۳۹۸ — واژگان و عادتِ خواندن — کلید ص۲۵۰ ———
    ("r392", 49, "vocab", "How does having a good vocabulary influence your reading habit?",
     ["If we have a good vocabulary, we are more interested in reading."],
     ["have a good vocabulary ,", "are more interested in reading"]),
    # ——— r393 دی ۱۳۹۸ — شنیداریِ بازِ ق۱-۶ — ساقه فقط صوتی؛ مدل‌های چاپیِ کلید ص۲۵۷ ———
    ("r393", 1, "vocab", LISTEN_STEM.format(n=FA_DIG[1]), ["do exercise"], None),
    ("r393", 2, "vocab", LISTEN_STEM.format(n=FA_DIG[2]), ["dishwasher"], None),
    ("r393", 3, "vocab", LISTEN_STEM.format(n=FA_DIG[3]), ["renewable energy"], None),
    ("r393", 4, "vocab", LISTEN_STEM.format(n=FA_DIG[4]), ["at the top of each page"], None),
    ("r393", 5, "vocab", LISTEN_STEM.format(n=FA_DIG[5]), ["sun or sunshine"], None),
    ("r393", 6, "vocab", LISTEN_STEM.format(n=FA_DIG[6]), ["You can carry it everywhere."], None),
]

assert len(ITEMS) == 51, f"expected 51 items, got {len(ITEMS)}"

# ——— راستی‌آزماییِ لایه ———
import re

def norm(s: str) -> str:
    s = s.casefold().replace("’", "'").replace("`", "'")
    s = re.sub(r"[.\u2026]+", " ", s)     # هر نقطه‌چین/رانِ نقطه → فاصله (جایِ خالی بی‌اثر می‌شود)
    return " ".join(s.split())

layer_flat_raw = " ".join((ROOT / "booklet-extract/g12.txt").read_text(encoding="utf-8").split())
layer_norm = norm(layer_flat_raw)

missing_stems, missing_models = [], []
for paper, qn, cat, stem, accepted, pieces in ITEMS:
    # ساقه: رانِ نقطه‌ها نرمال؛ شنیداری‌های r393 ساقهٔ چاپی ندارند (فقط صوتی) — از سنجش معاف‌اند
    if paper != "r393":
        if norm(stem) not in layer_norm:
            probe = stem.split("— ", 1)[-1] if "—" in stem else stem
            if norm(probe) not in layer_norm:
                missing_stems.append(f"{paper}-{qn}")
    if pieces:
        for pc in pieces:
            if norm(pc) not in layer_norm:
                missing_models.append(f"{paper}-{qn} piece:{pc[:40]}")
    else:
        for a in accepted:
            for form in {a, a.replace("'", "`"), a.replace("'", "’")}:
                if norm(form).rstrip(".,?؟!") in layer_norm:
                    break
            else:
                missing_models.append(f"{paper}-{qn} model:{a[:50]}")

assert not missing_stems, f"stems not found in layer: {missing_stems}"
assert not missing_models, f"models/pieces not found in layer: {missing_models}"

# ——— ساختِ بانک و رسید ———
bank = {
    "lesson": 144,
    "title": "مرورِ تایپیِ نهایی‌ها — پاسخ‌هایِ مدل (قسمتِ سومِ مخزنِ ۸۹ ردیفی)",
    "level": "تایپی",
    "count": len(ITEMS),
    "questions": [q(i + 1, cat, stem, acc) for i, (_, _, cat, stem, acc, _) in enumerate(ITEMS)],
}
d["lessons"].append(bank)

d["source"]["g12typedres3"] = {
    "extractedRound": "r400",
    "section": ("بانکِ تایپیِ نهایی‌ها — قسمتِ سوم (پایانی): پاسخ‌هایِ مدل (l144) — سومین بانکِ گردآوریِ "
                "درون‌خانوادگی؛ ۵۱ ردیفِ «پاسخِ مدلِ» خوانداری/واژه‌نامه/شنیداری از ۱۲ برگه (r380-r393) — "
                "با این بانک مخزنِ جزئیِ ۹۱ ردیفی (۲۲ افعال + ۱۸ جمله‌سازی + ۵۱ مدل) به‌طورِ کامل مصرف شد"),
    "examPages": ("بدونِ صفحهٔ آزمونِ تازه؛ ساقه‌ها و مدل‌ها از لایهٔ متنیِ booklet-extract/g12.txt — "
                  "کلیدها: r380 ص۳۴۱-۳۴۲، r381 ص۳۴۸-۳۴۹، r382 ص۳۳۴-۳۳۵، r383 ص۳۲۷-۳۲۸، r384 ص۳۲۰-۳۲۱، "
                  "r385 ص۳۱۳-۳۱۴، r386 ص۳۰۶-۳۰۷، r387 ص۲۹۱-۲۹۲، r390 ص۲۳۴-۲۳۶، r391 ص۲۴۲-۲۴۳، r392 ص۲۴۹-۲۵۰، "
                  "r393 ص۲۵۷-۲۵۸"),
    "keyPolicy": ("مدل‌ها عینِ چاپ؛ کلیدهای عمودیِ سربرگِ قدیمی با خوانشِ پایین-به-بالای چیپ‌های RTL "
                  "بازسازی شدند (r380-۴۸ «A dictionary which / explain / s / the meanings…»، r381-۳۹ «I/would/"
                  "travel/to/the/future»، r381-۵۸، r382-۴۷ «televisions, computers, online games, phones»، "
                  "r383-۴۷ «You can do th+is»، r383-۴۸ با «part+s=parts» بر پشتوانهٔ خطِ کورپوس ص۳۲۵، r391-۴۹/۵۳/۵۴ "
                  "با «con+text=context»، r392-۴۹) و هر بازسازی با خطِ خودِ خوانداریِ برگه راستی‌آزمایی شد؛ "
                  "r391-۳۵/۳۶ دو ترتیبِ چاپیِ «یا»دار → accepted دومَعضوی؛ r381-۵۲ «We / You spend…» چاپی → دو "
                  "شکلِ accepted (الگویِ had got/gotten)؛ r380-۴۴ چاپِ «(John was upset ) because…» → دو شکلِ "
                  "(جملهٔ کامل + بن‌مایهٔ because)؛ ردیف‌های «which» (r384/385-ق۳۴) مدلِ چاپیِ تک‌واژه‌ای دارند و "
                  "ساقه‌شان دستورِ فارسیِ چاپیِ همان بخش را نقل می‌کند؛ tایپوی چاپ وفادار ماند (r386-۴۴ «jump into "
                  "to»، r386-۵۰ «Picasso’ first paining»، r391-۵۵ ویرگول‌های بی‌فاصله)؛ شنیداری‌های r393 ق۱-۶ "
                  "ساقهٔ چاپی ندارند (ساقه فقط صوتی است) — ساقه = توصیفِ صادقانهٔ فارسیِ منبع + درخواستِ تایپِ "
                  "مدلِ چاپیِ کلید؛ هیچ ساقهٔ انگلیسیِ جعلی ساخته نشد"),
    "items": 51,
    "bankCounts": {"l144": 51},
    "reservoirCensus": {
        "consumedHere": {
            "r380-khordad1402": "ق۴۳/۴۴/۴۷/۴۸ (۴)",
            "r381-shahrivar1401": "ق۳۹/۴۵/۴۶/۴۷/۵۲/۵۷/۵۸ (۷)",
            "r382-dey1400": "ق۴۰/۴۳/۴۴/۴۷/۴۸ (۵)",
            "r383-shahrivar1400": "ق۴۰/۴۷/۴۸ (۳)",
            "r384-khordad1400h": "ق۳۴/۳۸/۴۲/۴۳ (۴)",
            "r385-khordad1400m": "ق۳۴/۴۳ (۲)",
            "r386-dey1399": "ق۴۴/۴۵/۵۰/۵۱ (۴)",
            "r387-shahrivar1399": "ق۴۳/۴۴ means/founding (۲)",
            "r390-dey1397": "ق۳۷/۳۸/۵۵/۵۶/۵۷/۶۰ (۶)",
            "r391-khordad1398": "ق۳۵/۳۶/۴۸/۴۹/۵۳/۵۴/۵۵ (۷)",
            "r392-shahrivar1398": "ق۴۹ (۱)",
            "r393-dey1398": "ق۱-۶ شنیداری (۶)",
        },
        "remaining": "صفر — مخزنِ جزئیِ ۹۱ ردیفی (۲۲+۱۸+۵۱) کامل مصرف شد؛ بانکِ تایپیِ نهایی‌ها در سه بانکِ l142/l143/l144 بسته است",
    },
    "engineNote": ("یکهزاردرصدِ تایپی (kind=typed) — مستثنی از حلقهٔ MCQ؛ ساقه = متنِ چاپیِ سؤال با نقطه‌چینِ چاپ؛ "
                   "چیپ‌های مرتب‌کردنی (r390-۳۷/۳۸ و r391-۳۵/۳۶) با « / » (الگویِ l143)؛ options=[مدلِ نخست] "
                   "به‌عنوانِ داربستِ بازبینی؛ دسته‌ها در دامنهٔ بانک (vocab برای خوانداری/واژگان/شنیداری — الگویِ "
                   "بانک‌های خوانداریِ l138/139 — و grammar برای ردیف‌هایِ ساختِ جمله و which)؛ ساقه‌های "
                   "شنیداری فارسی‌اند — نخستین ساقه‌های فارسیِ tests-g12 (صداقتِ منبع بر ساختگی‌سازی مقدم است)؛ "
                   "ترتیبِ آیتم‌ها = ترتیبِ استخراجِ r380-r394"),
    "futureNote": ("مخزنِ بانکِ تایپیِ نهایی‌ها با این قسط بسته شد: ۲۲ افعال (l142) + ۱۸ جمله‌سازی (l143) + "
                   "۵۱ پاسخِ مدل (l144) = ۹۱ ردیفِ جزئی — بخشِ نهایی‌ها (۱۷/۱۷ برگه) اکنون هم بانک‌دار است هم "
                   "مخزنش خالی؛ فرصت‌هایِ باقیِ ثبت‌شدهٔ بخش: فیلدِ تصویرِ QuizQuestion (REQUIRES-APPROVAL) و "
                   "case-sensitive mode"),
}

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(b["count"] for b in d["lessons"])
print(f"r400 OK: +1 bank / +{bank['count']} items -> {len(d['lessons'])} banks / {total} items")
