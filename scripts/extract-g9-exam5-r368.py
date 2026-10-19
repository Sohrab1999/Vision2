#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r368 — «سؤالات امتحانی درس پنجم» نهم (چاپی ص۸۵-۸۷؛ pdf-p85-87) → tests-g9.json
خانواده: ۱۱ سکشنِ شماره‌گذاری‌شده (با ارقامِ آمیختهٔ فارسی/لاتین: ۳ و ۸) + دنبالهٔ بی‌شمارهٔ دیکته.
p88 جلدِ «Lesson 6 — Health and Injuries» است — خانواده همان‌جا بسته می‌شود.
۹ بانکِ ۳۶-۴۴ (۳۱ آیتم): این خانواده بازآراییِ خودِ مکالمه/تمرین‌های درس پنجم است:
  س۲ (۱۰ تایپی) — بانکِ ۱۱ واژه‌ای («یک کلمه اضافی است» — اضافی: watched)؛ هر ده بلنک
      نه‌به‌نه در مکالمهٔ verbatim درس لنگر دارد (لایه p78-79)؛ سطرِ چهارمِ B دو بلنک دارد
      (surf/address) و به دو آیتم شکسته شد؛ «It» بزرگِ چاپی verbatim
  س۳ (۴ MCQ پنج‌گزینه‌ایِ چاپی a-e؛ اضافی: c) — دو جفت verbatimِ تمرینِ ۲ درس (p79-80) و
      دو جفت با نوعِ پرسش‌واژه (Who→شخص، When→زمان)
  س۴ (۲ MCQ) — ناهماهنگ: cinema (سه صفتِ ستایشیِ درس)، fruit (سه واژهٔ رسانه/فناوری)
  س۵ (۳ تایپی) — مرتب‌کردن؛ ق۱ جملهٔ verbatim مکالمه («There are many interesting things
      there.»)؛ ق۳ بانکِ چاپی «a» ندارد (چاپ‌خطا) — دو شکلِ accepted
  س۷ (۳ MCQ) — ساختاری: They were happy / What (شیءخواهی) / wasn't
  س۸ (۲ MCQ سه‌گزینه‌ایِ چاپی) — weren't (تقابلِ this/last month) / attended (2 days ago)
  س۱۱ درست/غلط (۲ MCQ True/False) — هر دو False با متنِ verbatim (Saturday↔weekend،
      grandfather↔grandmother)
  س۱۱ پاسخ به سؤالِ متن (۲ تایپی) — «At first, I wasn’t happy.» و «I cleaned my room and
      I called my grandmother.» — تبدیلِ ضمیرِ I→she؛ چهار/سه شکلِ accepted
  دیکتهٔ ناقص (۳ تایپی — دنبالهٔ بی‌شمارهٔ چاپیِ پس از س۱۱؛ عبارت‌ها فقط در رندرند نه لایه) —
      interview somebody*/update a blog* از photo dictionary؛ «use technology» لنگرِ ضعیف‌تر
      (هم‌ارزِ مفهومیِ «use IT*») — مستند
مستثنی‌ها: س۱/س۱۰ تصویری، س۶ افتان/خیزان (آهنگی)، س۹ تولیدِ آزاد (پاسخِ شخصی) — الگوی r364/365/366.
هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)
  — کلید = استنتاجِ مستندِ مکالمه‌محور/ساختاری (الگوی g9exam1-4).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
LAYER = (ROOT / "booklet-extract/g9.txt").read_text(encoding="utf-8").split("\n")
G9 = ROOT / "public/jozve/tests-g9.json"

d = json.loads(G9.read_text(encoding="utf-8"))
if "g9exam5" in d.get("source", {}):
    print("r368: receipt g9exam5 already present — NO-OP")
    raise SystemExit(0)

PM = {}
for i, l in enumerate(LAYER):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m:
        PM[int(m.group(1))] = i


def page_lines(p: int) -> list[str]:
    start = PM[p]
    end = next((v for q, v in sorted(PM.items()) if q > p), len(LAYER))
    return LAYER[start:end]


SEG = page_lines(85) + page_lines(86) + page_lines(87)


def find(needle: str, from_abs: int = 0) -> int:
    for i in range(from_abs, len(SEG)):
        if needle in SEG[i]:
            return i
    raise AssertionError(f"anchor missing: {needle!r}")


def find_all(needle: str) -> int:
    for i, l in enumerate(LAYER):
        if needle in l:
            return i
    raise AssertionError(f"layer anchor missing: {needle!r}")


# ————— سربرگ + شواهدِ سکشن‌های مستثنی —————
find("سواالت امتحانی درس پنجم")
find("با توجه به تصاویر")                     # س۱ تصویری
find("شماره هر عبارت را زیر تصویر مربوط به آن بنویسید")  # س۱۰ تصویری
find("افتان یا خیزان جمالت زیر را مشخص کنید")  # س۶ آهنگی
find("به سواالت زیر پاسخ کامل دهید")           # س۹ تولیدِ آزاد

# ————— اثباتِ لنگرهای مکالمه/تمرین/واژگانِ درس پنجم (رسید) —————
LEX = {
    "Did you enjoy your weekend?": "مکالمهٔ درس verbatim (Mina لایه p78:032) — لنگرِ س۲ق۱",
    "I attended Fajr International Film Festival.": "مکالمهٔ درس verbatim (Mahsa p78:035) — لنگرِ س۲ق۲/ق۴",
    "I am also interested in its events and movies.": "مکالمهٔ درس verbatim (p78:043) — لنگرِ س۲ق۵",
    "did you watch the reports on TV last night?": "مکالمهٔ درس verbatim (p78:051) — لنگرِ س۲ق۶",
    "you can surf its website if you like": "مکالمهٔ درس verbatim (p79:005) — لنگرِ س۲ق۸",
    "There are many interesting things": "مکالمهٔ درس verbatim (p79:005-006) — لنگرِ س۵ق۱",
    "give me the website address?": "مکالمهٔ درس verbatim (p79:015) — لنگرِ س۲ق۹",
    "I just texted it.": "مکالمهٔ درس verbatim (p79:021) — لنگرِ س۲ق۱۰",
    "What did you do last week?": "تمرینِ ۲ درس verbatim (p80:017) — لنگرِ س۲ق۳",
    "No, he worked with his mobile.": "تمرینِ ۱ درس verbatim (p79:064) — لنگرِ س۳ق۲",
    "She connected to the Internet at": "تمرینِ ۲ درس verbatim (p80:044) — لنگرِ س۳ق۳",
    "They downloaded it yesterday.": "تمرینِ ۲ درس verbatim (p80:033) — لنگرِ س۳ق۴",
    "text a message*": "photo dictionary درس (p78:013)",
    "attend a TV program*": "photo dictionary درس (p78:008) — لنگرِ س۸ق۲/دیکته",
    "interview somebody*": "photo dictionary درس (p78:020) — لنگرِ دیکتهٔ ۱",
    "update a blog*": "photo dictionary درس (p78:015) — لنگرِ دیکتهٔ ۲",
    "watch a quiz show*": "photo dictionary درس (p78:019) — لنگرِ س۵ق۲",
    "look at the newsstand*": "photo dictionary درس (p78:014)",
    "see a war movie*": "photo dictionary درس (p78:011)",
    "connect to the internet*": "photo dictionary درس (p78:012)",
    "download something from the internet*": "photo dictionary درس (p78:021)",
    "install a computer dictionary*": "photo dictionary درس (p78:016) — لنگرِ س۷ق۲",
    "use IT*": "photo dictionary درس (p78:017) — هم‌ارزِ مفهومیِ «use technology» دیکتهٔ ۳",
    "receive an e-mail*": "photo dictionary درس (p78:009)",
    "Amazing*": "واژهٔ درس (p77:026) — لنگرِ س۴ق۱",
    "Wonderful*": "واژهٔ درس (p77:096) — لنگرِ س۴ق۱",
    "Fantastic*": "واژهٔ درس (p77:090) — لنگرِ س۴ق۱",
    "Connect*": "واژهٔ درس (p77:066) — لنگرِ س۴ق۲",
    "Download*": "واژهٔ درس (p77:082) — لنگرِ س۴ق۲",
    "Quiz show*": "واژهٔ درس (p77:072)",
    "Match*": "واژهٔ درس (p77:040)",
    "My name is Parisa": "متنِ درک مطلب س۱۱ (p87:012)",
    "first, I wasn’t happy.": "متنِ درک مطلب verbatim (p87:012-013، شکسته در لایه) — لنگرِ س۱۱QAق۱",
    "I cleaned my room and I called my grandmother": "متنِ درک مطلب verbatim (p87:013-014) — لنگرِ س۱۱QAق۲",
}
for k in LEX:
    find_all(k)
# کوئیرکِ ۸: عبارت‌های دیکته در لایه نیستند (در تصویرِ نشسته‌اند)
SEG_JOINED = "\n".join(SEG)
assert "technol" not in SEG_JOINED, "dictation phrases unexpectedly present in layer"
assert "_nterview" not in SEG_JOINED

# ————— س۲: بانک واژهٔ مکالمهٔ جشنوارهٔ فجر (۱۰ تایپی) —————
find("watched, wonderful, did, weekend, text, interested, watch,")
find("didn’t, surf, attended, address")
find("Did you enjoy your")
find("Fajr International Film Festival.")
find("the reports on TV last night")
find("its website. I can give you the website")
WORDBANK = ["watched", "wonderful", "did", "weekend", "text", "interested", "watch", "didn’t", "surf", "attended", "address"]
DATA36 = [
    ("A: Did you enjoy your -------?", "weekend", "watched", ["weekend"],
     "مکالمهٔ verbatim درس: «Mina: Did you enjoy your weekend?» (لایه p78:032)"),
    ("B: Yes, it was -------.", "wonderful", "interested", ["wonderful"],
     "مکالمهٔ verbatim: «Mahsa: Yes, it was wonderful! …» (لایه p78:035) + Wonderful* (p77:096)"),
    ("A: What ------- you do?", "did", "didn’t", ["did"],
     "ساختاری: did-پرسشِ گذشته + شکلِ سادهٔ فعل؛ همتای تمرینِ درس: «What did you do last week?» (لایه p80:017)"),
    ("B: I ------- Fajr International Film Festival.", "attended", "watched", ["attended"],
     "مکالمهٔ verbatim: «I attended Fajr International Film Festival.» (لایه p78:035) + Attend* (p77:034)"),
    ("A: I’m also ------- in its movies.", "interested", "wonderful", ["interested"],
     "مکالمهٔ verbatim: «I am also interested in its events and movies.» (لایه p78:043)؛ ساختارِ interested in"),
    ("B: Did you ------- the reports on TV last night?", "watch", "watched", ["watch"],
     "مکالمهٔ verbatim: «did you watch the reports on TV last night?» (لایه p78:051)؛ Did + شکلِ سادهٔ فعل — «watched» اضافیِ چاپیِ بانک"),
    ("A: No, I -------. I like to read about them.", "didn’t", "did", ["didn’t", "did not"],
     "پاسخِ کوتاهِ منفیِ did-پرسش: «No, I didn’t.» — الگوی تمرینِ درس: «No, she didn’t.» (لایه p79:050)؛ درسِ خودش «Yes, I did» دارد ولی ساقهٔ چاپیِ «No» حاکم است؛ بازشدنِ مخفف روادار"),
    ("B: You can ------- its website.", "surf", "text", ["surf"],
     "مکالمهٔ verbatim: «you can surf its website if you like» (لایه p79:005)؛ سطرِ B چهارم دو بلنک دارد — نیمهٔ نخست"),
    ("I can give you the website -------.", "address", "text", ["address"],
     "مکالمهٔ verbatim: «Could you please give me the website address?» (لایه p79:015) — نیمهٔ دومِ همان سطر"),
    ("A: Thanks a lot. You can ------- It.", "text", "surf", ["text"],
     "مکالمهٔ verbatim: «I just texted it.» (لایه p79:021) + text a message* (p78:013)؛ حرفِ بزرگِ چاپیِ «It» verbatim"),
]
BANK36 = []
for stem, key, wrong, accepted, why in DATA36:
    assert key in WORDBANK and wrong in WORDBANK, f"scaffold out of printed bank: {key}/{wrong}"
    BANK36.append({
        "id": f"g9-l36-{len(BANK36) + 1}", "n": len(BANK36) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": accepted, "placeholder": "answer in English…", "keyWhy": why,
    })

# ————— س۳: وصل‌کردنیِ پرسش/پاسخ (۴ MCQ — پنج‌گزینه‌ایِ چاپی a-e) —————
find("Who watch the cartoon yesterday?")
find("Did your father work with the computer?")
find("Where did Zahra connect to the Internet?")
find("When did they download the book from the")
for opt in ["No, he worked with his mobile.", "They downloaded it last week.", "He searched the Internet.",
            "My brother.", "She connected at school."]:
    find(opt)
OPTS37 = ["No, he worked with his mobile.", "They downloaded it last week.", "He searched the Internet.",
          "My brother.", "She connected at school."]
DATA37 = [
    ("Who watch the cartoon yesterday?", 3,
     "پرسشِ Who → تنها پاسخِ شخصی: «My brother.» (a منفیِ did-پرسش، b زمانی، c مکانیِ بی‌پرسشِ مکانی، e مکانی)؛ «Who watch» افتادِ -edِ چاپ است — verbatim"),
    ("Did your father work with the computer?", 0,
     "did-پرسشِ بله/نه → پاسخِ منفیِ علت‌دار: a) — جفتِ verbatimِ تمرینِ درس: «Did Amir work with his computer? → No, he worked with his mobile.» (لایه p79:068/064)"),
    ("Where did Zahra connect to the Internet?", 4,
     "پرسشِ Where → مکان: e) — تمرینِ درس: «Where did she connect to the Internet? → She connected to the Internet at school.» (لایه p80:052/044)"),
    ("When did they download the book from the Internet?", 1,
     "پرسشِ When → زمان: b) — تمرینِ درس همان جفت با «yesterday»: «When did they download the book? → They downloaded it yesterday.» (لایه p80:039/033)"),
]
BANK37 = [{
    "id": f"g9-l37-{i + 1}", "n": i + 1, "category": "grammar",
    "question": f"{stem} ( ------- )", "options": OPTS37, "answer": ans, "keyWhy": why,
} for i, (stem, ans, why) in enumerate(DATA37)]

# ————— س۴: کلمهٔ ناهماهنگ (۲ MCQ) —————
find("a) amazing")
find("d) cinema")
find("c) fruit")
BANK38 = [
    {
        "id": "g9-l38-1", "n": 1, "category": "vocab",
        "question": "amazing – wonderful – fantastic – cinema",
        "options": ["amazing", "wonderful", "fantastic", "cinema"], "answer": 3,
        "keyWhy": "سه صفتِ ستایشی، همگی واژهٔ درس: Amazing* (p77:026)/Wonderful* (p77:096)/Fantastic* (p77:090)؛ cinema مکان است نه صفت",
    },
    {
        "id": "g9-l38-2", "n": 2, "category": "vocab",
        "question": "Internet – connect – fruit – download",
        "options": ["Internet", "connect", "fruit", "download"], "answer": 2,
        "keyWhy": "سه واژهٔ خانوادهٔ رسانه/فناوری (Connect* p77:066/Download* p77:082 و اینترنت)؛ fruit خوراکی است نه رسانه",
    },
]

# ————— س۵: مرتب‌کردن جملات (۳ تایپی) —————
find("are, things, many, there, interesting, there.")
find("not, watch, show, we, a, quiz, did, yesterday.")
find("can, match, on, tonight, you, watch, TV, football.")
DATA39 = [
    ("are, things, many, there, interesting, there.",
     "There are many interesting things there.", ["There are many interesting things there."],
     "مکالمهٔ verbatim درس: «There are many interesting things there.» (لایه p79:005-006) — تنها چینشِ دستوریِ شش واژه"),
    ("not, watch, show, we, a, quiz, did, yesterday.",
     "We did not watch a quiz show yesterday.",
     ["We did not watch a quiz show yesterday.", "Yesterday we did not watch a quiz show."],
     "عبارتِ photo dictionary: «watch a quiz show*» (لایه p78:019)؛ دو جایگاهِ قیدِ زمانِ پایان/آغاز هر دو دستوری‌اند — هر دو شکل accepted"),
    ("can, match, on, tonight, you, watch, TV, football.",
     "You can watch a football match on TV tonight.",
     ["You can watch a football match on TV tonight.", "You can watch football match on TV tonight."],
     "چینشِ یکتا؛ بانکِ چاپی حرفِ تعریفِ «a» را ندارد (چاپ‌خطای مستند) — شکلِ مقصود با «a» و شکلِ سخت‌گیرانهٔ واژه‌به‌واژه هر دو روادار؛ «football» در واژگانِ چاپیِ درس نیست (فقط Match* لایه p77:040)"),
]
BANK39 = []
for stem, key, accepted, why in DATA39:
    BANK39.append({
        "id": f"g9-l39-{len(BANK39) + 1}", "n": len(BANK39) + 1,
        "category": "grammar", "kind": "typed",
        "question": stem, "options": [key, stem], "answer": 0,
        "accepted": accepted, "placeholder": "write the sentence…", "keyWhy": why,
    })

# ————— س۷: گزینهٔ صحیح (۳ MCQ) —————
find("happy last summer")
find("did Amir install")
find("upset yesterday")
BANK40 = [
    {
        "id": "g9-l40-1", "n": 1, "category": "grammar",
        "question": "They ------- happy last summer.",
        "options": ["was not", "didn’t", "were", "didn’t were"], "answer": 2,
        "keyWhy": "جمع + مسندِ صفتِ گذشته → «They were happy»؛ «was not» مفرد است و «didn’t were» ساختارِ ناممکن (did + شکلِ سادهٔ فعل)",
    },
    {
        "id": "g9-l40-2", "n": 2, "category": "grammar",
        "question": "A: ------- did Amir install? B: He installed a computer dictionary.",
        "options": ["Where", "What", "When", "Who"], "answer": 1,
        "keyWhy": "پاسخِ B شیءِ نصب‌شده را نام می‌برد → شیءخواهی: What؛ عبارتِ photo dictionary: «install a computer dictionary*» (لایه p78:016)",
    },
    {
        "id": "g9-l40-3", "n": 3, "category": "grammar",
        "question": "She ------- upset yesterday.",
        "options": ["am", "am not", "wasn’t", "were"], "answer": 2,
        "keyWhy": "سوم‌شخص + «yesterday» → wasn’t؛ «were» جمع است و «am» حالِ اول‌شخص — ساختاری",
    },
]

# ————— س۸: کامل با کلماتِ داخلِ پرانتز (۲ MCQ سه‌گزینه‌ایِ چاپی) —————
find("nice last month. (aren’t, were, weren’t)")
find("a TV program 2 days ago. (Attend, attended, attends)")
BANK41 = [
    {
        "id": "g9-l41-1", "n": 1, "category": "grammar",
        "question": "You are really nice this month. But you ------- nice last month.",
        "options": ["aren’t", "were", "weren’t"], "answer": 2,
        "keyWhy": "تقابلِ «this month / last month» با «But» → منفیِ گذشته: weren’t؛ «were» مثبتِ ناسازگار و «aren’t» حال است",
    },
    {
        "id": "g9-l41-2", "n": 2, "category": "grammar",
        "question": "My favorite player ------- a TV program 2 days ago.",
        "options": ["Attend", "attended", "attends"], "answer": 1,
        "keyWhy": "قیدِ گذشتهٔ «2 days ago» → attended؛ عبارتِ photo dictionary: «attend a TV program*» (لایه p78:008) و مکالمه: «I attended Fajr International Film Festival.»",
    },
]

# ————— س۱۱ (الف): درست/غلط متنِ Parisa (۲ MCQ True/False) —————
find("Something happened to her TV last Saturday")
find("Her grandfather came to her home")
BANK42 = [
    {
        "id": "g9-l42-1", "n": 1, "category": "vocab",
        "question": "a) Something happened to her TV last Saturday. ( ------- )",
        "options": ["True", "False"], "answer": 1,
        "keyWhy": "متنِ verbatim: «Last weekend, something happened to my TV.» (لایه p87:012) — Saturday نیست، weekend است → False",
    },
    {
        "id": "g9-l42-2", "n": 2, "category": "vocab",
        "question": "b) Her grandfather came to her home. ( ------- )",
        "options": ["True", "False"], "answer": 1,
        "keyWhy": "متنِ verbatim: «I called my grandmother. She came to our home.» (لایه p87:013-014) — مادربزرگ آمد نه پدربزرگ → False",
    },
]

# ————— س۱۱ (ب): پاسخ به سؤالِ متن (۲ تایپی) —————
find("Was Parisa happy at first?")
find("What did she do?")
BANK43 = [
    {
        "id": "g9-l43-1", "n": 1, "category": "vocab", "kind": "typed",
        "question": "Was Parisa happy at first?",
        "options": ["No, she wasn’t.", "Yes, she was."], "answer": 0,
        "accepted": ["No, she wasn’t.", "No she wasn’t.", "No, she was not.", "No she was not."],
        "placeholder": "answer in English…",
        "keyWhy": "متنِ verbatim: «At first, I wasn’t happy.» (لایه p87:013) — تبدیلِ ضمیرِ I→she؛ چهار شکلِ accepted (ویرگول × انقباض)",
    },
    {
        "id": "g9-l43-2", "n": 2, "category": "vocab", "kind": "typed",
        "question": "What did she do?",
        "options": ["She cleaned her room and called her grandmother.", "She watched TV all day."], "answer": 0,
        "accepted": ["She cleaned her room and called her grandmother.",
                     "She cleaned her room and she called her grandmother.",
                     "She called her grandmother and cleaned her room."],
        "placeholder": "answer in English…",
        "keyWhy": "متنِ verbatim: «But then I cleaned my room and I called my grandmother.» (لایه p87:013-014) — تبدیلِ ضمیرِ I→she؛ حذف/نگه‌داشتنِ ضمیرِ دوم و ترتیبِ دو کنش روادار",
    },
]

# ————— دیکتهٔ ناقص — دنبالهٔ بی‌شمارهٔ چاپیِ پس از س۱۱ (۳ تایپی) —————
find("دیکته کلمات ناقص زیر را کامل کنید")
DATA44 = [
    ("_nterview someb_dy", "interview somebody", "attend a TV program", ["interview somebody"],
     "عبارتِ photo dictionary درس: «interview somebody*» (لایه p78:020) + Interview* (p77:020)؛ عبارتِ ناقص از رندرِ p87 خوانده شد (در لایه نیست — کوئیرکِ ۸)"),
    ("Upd_te a blog", "update a blog", "text a message", ["update a blog"],
     "عبارتِ photo dictionary درس: «update a blog*» (لایه p78:015) + Blog* (p77:042)؛ عبارتِ ناقص از رندرِ p87"),
    ("use technol_gy", "use technology", "watch a quiz show", ["use technology"],
     "کامل‌شدنیِ یکتا: technol_gy → technology؛ هم‌ارزِ مفهومیِ «use IT*» (لایه p78:017) — «technology» در لایه فقط در ضمیمهٔ تلفظِ ch (لایه p105) هست؛ لنگرِ واژگانیِ ضعیف‌تر از دو آیتمِ دیگر — مستند"),
]
BANK44 = []
for stem, key, wrong, accepted, why in DATA44:
    BANK44.append({
        "id": f"g9-l44-{len(BANK44) + 1}", "n": len(BANK44) + 1,
        "category": "vocab", "kind": "typed",
        "question": stem, "options": [key, wrong], "answer": 0,
        "accepted": accepted, "placeholder": "complete the words…", "keyWhy": why,
    })

# ————— قفل‌های پیش از نوشتن —————
NEW_BANKS = [BANK36, BANK37, BANK38, BANK39, BANK40, BANK41, BANK42, BANK43, BANK44]
all_new_ids = [q["id"] for b in NEW_BANKS for q in b]
assert len(all_new_ids) == 31, len(all_new_ids)
assert len(set(all_new_ids)) == 31
existing_ids = {q["id"] for b in d["lessons"] for q in b["questions"]}
assert not (set(all_new_ids) & existing_ids), "id collision"
for b in NEW_BANKS:
    for q in b:
        if q.get("kind") == "typed":
            assert len(q["options"]) >= 2, f"single-option typed: {q['id']}"
            assert q["options"][q["answer"]] == q["accepted"][0]
bad_typed = [q["id"] for b in NEW_BANKS for q in b if q.get("kind") == "typed" and len(q["options"]) < 2]
assert not bad_typed

# ————— چسباندن بانک‌ها —————
def mkbank(lesson, title, level, qs):
    return {"lesson": lesson, "title": title, "level": level, "count": len(qs), "questions": qs}


d["lessons"] += [
    mkbank(36, "امتحانی درس پنجم — بانک واژهٔ مکالمهٔ جشنوارهٔ فجر (س۲، ص۸۵)", "تمرین تایپی (بانک واژه)", BANK36),
    mkbank(37, "امتحانی درس پنجم — وصل‌کردنیِ پرسش/پاسخ (س۳، ص۸۵)", "چهارگزینه‌ای (پنج‌گزینه‌ایِ چاپی)", BANK37),
    mkbank(38, "امتحانی درس پنجم — کلمهٔ ناهماهنگ (س۴، ص۸۶)", "چهارگزینه‌ای", BANK38),
    mkbank(39, "امتحانی درس پنجم — مرتب‌کردن جملات (س۵، ص۸۶)", "تمرین تایپی (مرتب‌کردن)", BANK39),
    mkbank(40, "امتحانی درس پنجم — گزینهٔ صحیح (س۷، ص۸۶)", "چهارگزینه‌ای", BANK40),
    mkbank(41, "امتحانی درس پنجم — کامل با کلماتِ پرانتز (س۸، ص۸۶)", "چهارگزینه‌ای (سه‌گزینه‌ایِ چاپی)", BANK41),
    mkbank(42, "امتحانی درس پنجم — درک مطلب: درست/غلط (س۱۱، ص۸۷)", "چهارگزینه‌ای (درست/غلط)", BANK42),
    mkbank(43, "امتحانی درس پنجم — پاسخ به سؤالِ متن (س۱۱، ص۸۷)", "تمرین تایپی (درک مطلب)", BANK43),
    mkbank(44, "امتحانی درس پنجم — دیکتهٔ ناقص (دنبالهٔ بی‌شمارهٔ س۱۱، ص۸۷)", "تمرین تایپی (دیکتهٔ ناقص)", BANK44),
]

d["source"]["g9exam5"] = {
    "extractedRound": "r368",
    "section": "سؤالات امتحانی درس پنجم پایه نهم",
    "examPages": "pdf-p85-87 (برچسبِ فوتر: ۸۵/۸۶/۸۷)؛ p88 جلدِ «Lesson 6 — Health and Injuries» است و خانواده همان‌جا بسته می‌شود؛ درس ششم از pdf-p89 با واژگانِ «سلامتی و آسیب‌ها»",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوه برای این خانواده نیست (تنها پاسخنامهٔ جزوه: کلید واژگان ص۱۰۱ — r362)؛ کلیدها استنتاجیِ مستندند",
    "sectionsTotal": 11,
    "sectionsExtracted": 7,
    "sectionsSkipped": 4,
    "items": 31,
    "bankCounts": [10, 4, 2, 3, 3, 2, 2, 2, 3],
    "wordBank": WORDBANK,
    "extraWords": ["watched"],
    "keyPolicy": "کلیدِ استنتاجیِ مکالمه‌محور: این خانواده بازآراییِ خودِ مکالمه/تمرین‌های درس پنجم است — س۲ ده بلنکش نه‌به‌نه در مکالمهٔ verbatim درس (لایه p78-79) لنگر دارد؛ س۳ دو جفتش verbatimِ تمرین‌های درس (لایه p79-80) و دو جفتش با نوعِ پرسش‌واژه (Who→شخص، When→زمان) یکتاست؛ س۵ق۱ جملهٔ verbatim مکالمه است؛ س۷/س۸ ساختاری (توافقِ be/did + قیدِ زمان + نوعِ پاسخ)؛ دیکته از photo dictionary درس (لایه p78) — دو آیتمِ «use technology» و «football match» لنگرِ واژگانیِ ضعیف‌تر دارند و در keyWhy مستندند؛ هیچ کلیدی از خارجِ متنِ جزوه نیامده",
    "derivedKeys": {
        "S2": [x["keyWhy"] for x in BANK36],
        "S3": [x["keyWhy"] for x in BANK37],
        "S4": [x["keyWhy"] for x in BANK38],
        "S5": [x["keyWhy"] for x in BANK39],
        "S7": [x["keyWhy"] for x in BANK40],
        "S8": [x["keyWhy"] for x in BANK41],
        "S11-TF": [x["keyWhy"] for x in BANK42],
        "S11-QA": [x["keyWhy"] for x in BANK43],
        "SDictation": [x["keyWhy"] for x in BANK44],
    },
    "skippedSections": [
        "س۱ (ص۸۵): «با توجه به تصاویر جاهای خالی را با عبارات مناسب پر کنید» — تصویری (میکروفون/ابرِ UPDATE/موبایل) — الگوی س۱ِ r364/r365/r366",
        "س۶ (ص۸۶): «افتان یا خیزان جملات زیر را مشخص کنید» — آهنگی (That's brilliant. / What a beautiful flower.) — الگوی س۶ِ r366/س۳ِ r367",
        "س۹ (ص۸۶): «به سوالات زیر پاسخ کامل دهید» — تولیدِ آزاد با پاسخِ شخصی (Did you receive an email yesterday? / What did you do last week?) — الگوی س۵/س۱۵ِ r364",
        "س۱۰ (ص۸۷): «شماره هر عبارت را زیر تصویر مربوط به آن بنویسید» — تصویری (text a message/see a war movie/look at the newsstand/attend a TV program/interview somebody)",
    ],
    "printQuirkCount": 8,
    "printQuirks": [
        "شماره‌گذاریِ آمیختهٔ چاپی: ارقامِ فارسیِ «۳» و «۸» در میانِ ارقامِ لاتینِ سکشن‌ها (1/2/۳/4/5/6/7/۸/9)/10/11) — برخلافِ درس چهارم، پیوستِ و یکتاست",
        "دنبالهٔ «دیکته کلمات ناقص زیر را کامل کنید» پس از س۱۱ بی‌شمارهٔ چاپی است — س۱۲ در چاپ وجود ندارد؛ به‌عنوان بانکِ ۴۴ استخراج شد",
        "س۲ق۱۰: حرفِ بزرگِ چاپیِ «It» («You can ……. It.») — verbatim در ساقه",
        "س۳ق۱: «Who watch the cartoon yesterday?» — افتادِ -edِ چاپ (در برابرِ تمرینِ درس: «Who watched the movie last night؟» لایه p80:008) — verbatim",
        "س۵ق۳: بانکِ واژهٔ چاپی حرفِ تعریفِ «a» ندارد — جملهٔ مقصود «You can watch a football match on TV tonight.»؛ هر دو شکل accepted",
        "س۲: سطرِ چهارمِ B دو بلنک دارد («You can ……. its website. I can give you the website ………….») — به دو آیتمِ ۸/۹ شکسته شد",
        "س۱۱: هر دو گزارهٔ درست/غلط False است (a: «last Saturday»↔متنِ «Last weekend»؛ b: grandfather↔متنِ grandmother) — کوئیرکِ دوبلِ False مستند",
        "لایهٔ p88 خالی است ولی رندرش جلدِ «Lesson 6» است؛ عبارت‌های دیکتهٔ انتهای p87 در لایه نمی‌آیند (در تصویرِ نشسته‌اند) و از رندر خوانده شدند — assertionِ غیبت در اسکریپت ثبت است",
    ],
    "lessonLexicon": {
        "text a message": "پیام دادن — photo dictionary درس (لایه p78:013) + Message* (p77:048) — لنگرِ س۲ق۱۰",
        "attend a TV program": "شرکت‌کردن در برنامهٔ تلویزیونی — photo dictionary (p78:008) + Attend* (p77:034) — لنگرِ س۸ق۲/دیکته",
        "interview somebody": "مصاحبه‌کردن — photo dictionary (p78:020) + Interview* (p77:020) — لنگرِ دیکتهٔ ۱",
        "update a blog": "به‌روزرسانیِ وبلاگ — photo dictionary (p78:015) + Blog* (p77:042) — لنگرِ دیکتهٔ ۲",
        "watch a quiz show": "تماشای مسابقهٔ تلویزیونی — photo dictionary (p78:019) + Quiz show* (p77:072) — لنگرِ س۵ق۲",
        "look at the newsstand": "نگاه‌کردن به دکهٔ روزنامه — photo dictionary (p78:014) + Newsstand* (p77:056)",
        "see a war movie": "دیدنِ فیلم جنگی — photo dictionary (p78:011)",
        "connect to the internet": "وصل‌شدن به اینترنت — photo dictionary (p78:012) + Connect* (p77:066) — لنگرِ س۳ق۳/س۴ق۲",
        "download something from the internet": "دانلودکردن از اینترنت — photo dictionary (p78:021) + Download* (p77:082) — لنگرِ س۳ق۴",
        "install a computer dictionary": "نصبِ دیکشنریِ رایانه‌ای — photo dictionary (p78:016) + Install* (p77:098) — لنگرِ س۷ق۲",
        "use IT": "استفاده از فناوریِ اطلاعات — photo dictionary (p78:017) — هم‌ارزِ مفهومیِ دیکتهٔ ۳",
        "receive an e-mail": "دریافتِ ایمیل — photo dictionary (p78:009)",
        "participate in an online course": "شرکت‌کردن در دورهٔ برخط — photo dictionary (p78:007)",
        "change the TV channels": "عوض‌کردن کانال‌های تلویزیون — photo dictionary (p78:010)",
        "surf the website": "جست‌وجوی وبسایت — مکالمهٔ درس verbatim: «you can surf its website if you like» (p79:005) — لنگرِ س۲ق۸",
        "website address": "نشانیِ وبسایت — مکالمهٔ درس: «Could you please give me the website address?» (p79:015) — لنگرِ س۲ق۹",
        "Amazing / Wonderful / Fantastic": "سه صفتِ ستایشیِ درس (p77:026/096/090) — لنگرِ س۴ق۱",
        "Did you enjoy your weekend?": "مکالمهٔ درس verbatim (Mina، p78:032) — لنگرِ س۲ق۱",
        "Yes, it was wonderful! I attended Fajr International Film Festival.": "مکالمهٔ درس verbatim (Mahsa، p78:035) — لنگرِ س۲ق۲/ق۴",
        "Did Amir work with his computer? → No, he worked with his mobile.": "تمرینِ ۱ درس verbatim (p79:068/064) — لنگرِ س۳ق۲",
        "Where did she connect to the Internet? → She connected to the Internet at school.": "تمرینِ ۲ درس verbatim (p80:052/044) — لنگرِ س۳ق۳",
        "When did they download the book? → They downloaded it yesterday.": "تمرینِ ۲ درس verbatim (p80:039/033) — لنگرِ س۳ق۴",
        "readingText": "متنِ Parisa (p87:012-015): Hello. My name is Parisa. Last weekend, something happened to my TV. It didn’t work. At first, I wasn’t happy. But then I cleaned my room and I called my grandmother. She came to our home. She showed me how to play an old game. It was really fun and I enjoyed it. All day I was busy.",
    },
    "typedNote": "هر ۱۸ آیتمِ تایپیِ تازه (س۲:۱۰، س۵:۳، س۱۱QA:۲، دیکته:۳) داربستِ اندیسِ نادرست دارند — قفلِ سراسریِ r363 (ممنوعیتِ تایپیِ تک‌گزینه‌ای) حفظ شد؛ داربست‌ها خانواده‌محور: چرخشِ واژه‌های هم‌بانکِ چاپی (س۲)، ردیفِ به‌هم‌ریختهٔ چاپی (س۵)، پاسخِ نادرستِ ناهم‌سو (س۱۱QA) و عبارت‌های هم‌خانوادهٔ photo dictionary (دیکته)",
}

G9.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
ids = [q["id"] for b in d["lessons"] for q in b["questions"]]
nk = sum(1 for b in NEW_BANKS for q in b if q.get("kind") == "typed")
print(f"r368: +9 banks / +31 items ({nk} typed) → tests-g9 = {len(d['lessons'])} banks / {len(ids)} items")
