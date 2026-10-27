#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r390 — برگهٔ دوازدهمِ نهایی‌ها: دی ۱۳۹۷ (کلیهٔ رشته‌ها — داوطلب آزاد/بزرگسال، ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶)
۹ بانک / ۳۲ آیتم → tests-g12.json (l84-l92) + رسیدِ g12nahaie12. idempotent (اجرای دوم = NO-OP).
هم‌خانوادگی: r292 همین برگه را در grammar-g12-topic.json (l59-68) هم رندر کرده — سرشماریِ دوقلو در رسید.
"""
import json, copy
from pathlib import Path

F = Path("/home/z/my-project/public/jozve/tests-g12.json")
d = json.loads(F.read_text(encoding="utf-8"))
src = d["source"]
if "g12nahaie12" in src:
    print("NO-OP: g12nahaie12 already present")
    raise SystemExit(0)

# ---------- متن‌های چاپیِ داوری‌شده (zoom 300dpi) ----------
BRAIN = ("The brain is more active at night than during the day. Most part of the brain is "
         "------- (7) -------. When the brain does not have good and ------- (8) ------- food, "
         "it becomes smaller.")
WIND = ("Engineers design and make machines that measure wind and ------- (17) ------- wind into "
        "energy. They develop wind turbines that ------- (18) ------- electricity by considering "
        "the Earth's surface, wind direction, average outside temperature, the ------- (19) "
        "------- by and on 'birds and insects, and the great forces on the ------- (20) -------")
DEF_B = ["well-known .", "in a quiet way", "to finish something",
         "to take something in, especially gradually",
         "the amount of a product or service that people want"]
COLL_B = ["temperature", "the train", "a mistake", "no pains", "the needs"]
CONN_OPTS = ["and", "or", "but", "so"]  # ترتیبِ چاپِ سطرِ راهنمای س۱۱
DICT_TEXT = ("Just imagine how many English dictionaries there are in the world. How do you know "
             "which one is the best for you? Let's look at three types of English dictionaries: "
             "Bilingual dictionaries: This is probably the first type of dictionary that you bought "
             "when you started to study English. Usually, the first half gives the English word along "
             "with their meaning in another language, and the second half gives the words in the other "
             "language first and then their meanings in English. This kind of dictionary is suitable "
             "for those who have just started learning. You can quickly find how to translate a word "
             "from your language into English. But sometimes the meaning of the English word is a bit "
             "different from the word in the other language. Also this kind of dictionary encourages "
             "the students to translate instead of thinking in English. Monolingual dictionaries: "
             "These dictionaries use just one language to explain the meanings of the words. These "
             "dictionaries are good for students with a more advanced level of English. Monolingual "
             "dictionary encourages people to think in English and help them practice their English "
             "reading skills. Electronic dictionaries: Both monolingual and bilingual dictionaries are "
             "available in electronic format. Electronic dictionaries can be really useful if they are "
             "properly used. This is especially true with regard to pronunciation, as they often have "
             "an audio feature that lets you hear the word spoken. This lets you check your own "
             "pronunciation.")
TEACH_TEXT = ("Teachers are an essential part of our lives. They teach us much more than reading and "
              "writing. They teach us life lessons and help us discover who we are and how to succeed. "
              "It's important to appreciate the teachers who are dedicated to their jobs. Even if you "
              "feel you have too much homework and too many exams, take a moment to think how important "
              "your teachers are. Without them, you wouldn't be where you are today. Teaching requires "
              "a lot of time, preparation, and effort. Outside of the class, teachers write lesson "
              "plans, create exams and grade tests. They also attend conference and training sessions "
              "to find tools and ways to help students succeed. Teachers are very knowledgeable on the "
              "specific subjects they teach. However, it takes a helpful and dedicated individual to be "
              "able to teach effectively. Teaching requires them to stay up-to-date on advances in "
              "their field of study. They are busy with a wide variety of responsibilities, 'Teachers "
              "need to make sure that they know all their students' names and they must learn them "
              "quickly. One way of having a productive class is learning students' names. This article "
              "has given you some insight of the hard work and dedication that your teachers use each "
              "day at school. Then next time that you see you teachers, tell them you appreciate their "
              "help.")

def q(i, cat, stem, opts, ans, **extra):
    o = {"id": f"g12-l{{}}-{i}", "n": i, "category": cat, "question": stem,
         "options": opts, "answer": ans}
    o.update(extra)
    return o

def bank(n, title, level, qs, source_extra=None):
    b = {"lesson": n, "title": title, "level": level, "count": len(qs), "questions": qs}
    if source_extra:
        b["source"] = source_extra
    return b

def fix_ids(b, n):
    for i, item in enumerate(b["questions"], 1):
        item["id"] = f"g12-l{n}-{i}"

# ---------- l84 — کلوژِ شنیداریِ مغز (س۴، ص۲۲۹) — کلید: 7. water / 8. healthy ----------
l84 = bank(84, "نهایی دی ۱۳۹۷ — کلوژِ شنیداریِ مغز (س۴، ص۲۲۹)", "چهارگزینه‌ای", [
    q(1, "vocab", f"{BRAIN} — پاسخِ خانهٔ (7): -------", ["water", "healthy"], 0),
    q(2, "vocab", f"{BRAIN} — پاسخِ خانهٔ (8): -------", ["healthy", "water"], 0),
])
fix_ids(l84, 84)

# ---------- l85 — واژگانِ کلوژِ توربینِ بادی (س۵، ص۲۳۰) — کلید: 17 convert/18 generate/19 effect/20 turbine ----------
wind_qs = []
for idx, (gap, ans) in enumerate([(17, 2), (18, 0), (19, 4), (20, 3)], 1):
    wind_qs.append(q(idx, "vocab", f"{WIND} — پاسخِ خانهٔ ({gap}): -------",
                     ["generate", "renewable", "convert", "turbine", "effect"], ans))
l85 = bank(85, "نهایی دی ۱۳۹۷ — واژگانِ کلوژِ توربینِ بادی (س۵، ص۲۳۰)", "چهارگزینه‌ای", wind_qs)
fix_ids(l85, 85)

# ---------- l86 — تعریف‌یابی (س۶، ص۲۳۰) — کلید: 21 b/22 a/23 e/24 c — اضافیِ هرگز-کلید: d ----------
l86 = bank(86, "نهایی دی ۱۳۹۷ — تعریف‌یابی (س۶، ص۲۳۰)", "چهارگزینه‌ای", [
    q(1, "vocab", "تعریفِ ستون B برای واژهٔ «calmly»: -------", DEF_B, 1),
    q(2, "vocab", "تعریفِ ستون B برای واژهٔ «Distinguished»: -------", DEF_B, 0),
    q(3, "vocab", "تعریفِ ستون B برای واژهٔ «Demand»: -------", DEF_B, 4),
    q(4, "vocab", "تعریفِ ستون B برای واژهٔ «Use up»: -------", DEF_B, 2),
])
fix_ids(l86, 86)

# ---------- l87 — هم‌نشین‌ها (س۷، ص۲۳۰) — کلید: 25 d/26 c/27 e/28 a — اضافیِ هرگز-کلید: b ----------
l87 = bank(87, "نهایی دی ۱۳۹۷ — هم‌نشین‌ها (س۷، ص۲۳۰)", "چهارگزینه‌ای", [
    q(1, "vocab", "هم‌نشینِ ستون B برای واژهٔ «spare»: -------", COLL_B, 3),
    q(2, "vocab", "هم‌نشینِ ستون B برای واژهٔ «make»: -------", COLL_B, 2),
    q(3, "vocab", "هم‌نشینِ ستون B برای واژهٔ «meet»: -------", COLL_B, 4),
    q(4, "vocab", "هم‌نشینِ ستون B برای واژهٔ «take»: -------", COLL_B, 0),
])
fix_ids(l87, 87)

# ---------- l88 — گرامرِ شکلِ صحیحِ فعل — تایپی (س۸، ص۲۳۰) — کلیدِ چاپیِ سربرگ ----------
l88 = bank(88, "نهایی دی ۱۳۹۷ — گرامرِ شکلِ صحیحِ فعل — تایپی (س۸، ص۲۳۰)", "تایپی", [
    q(1, "vocab", "The little boy ------- the box, can't he? (to open )",
      ["can open"], 0, kind="typed", accepted=["can open"]),
    q(2, "vocab", "If I were you, I ------- the old house. (to sell )",
      ["would sell"], 0, kind="typed", accepted=["would sell"]),
    q(3, "vocab", "The bill must ------- before leaving the restaurant. (to pay )",
      ["be paid"], 0, kind="typed", accepted=["be paid"]),
    q(4, "vocab", "My mother was very angry with my sister because she ------- the dishes. (not to wash)",
      ["had not washed"], 0, kind="typed", accepted=["had not washed"]),
])
fix_ids(l88, 88)

# ---------- l89 — گرامرِ چهارگزینه‌ای (س۹، ص۲۳۰-۲۳۱) — کلید: 33 c/34 a/35 d/36 b ----------
l89 = bank(89, "نهایی دی ۱۳۹۷ — گرامرِ چهارگزینه‌ای (س۹، ص۲۳۰-۲۳۱)", "چهارگزینه‌ای", [
    q(1, "grammar", "The man ------- is wearing glasses is Reza's uncle.",
      ["whom", "whose", "who", "which"], 2),
    q(2, "grammar", "The letter ------- by my father two hours ago.",
      ["was posted", "posted", "was posting", "has posted"], 0),
    q(3, "grammar", "Ali's sister had an accident last week, -------?",
      ["did he", "did she", "didn't he", "didn't she"], 3),
    q(4, "grammar", "I couldn't figure ------- What they were talking about.",
      ["off", "out", "at", "on"], 1),
])
fix_ids(l89, 89)

# ---------- l90 — حروفِ ربط (س۱۱، ص۲۳۱) — کلید: 39 but/40 so/41 and/42 or ----------
l90 = bank(90, "نهایی دی ۱۳۹۷ — حروفِ ربط (س۱۱، ص۲۳۱)", "چهارگزینه‌ای", [
    q(1, "grammar", "Mrs. Tehrani likes fish, ------- her grandmother hates it.", CONN_OPTS, 2),
    q(2, "grammar", "These shoes aren't comfortable, ------- I rarely wear them.", CONN_OPTS, 3),
    q(3, "grammar", "The woman washed the dishes, ------- her daughter dried them.", CONN_OPTS, 0),
    q(4, "grammar", "You can check this booklet, ------- you may see our website.", CONN_OPTS, 1),
])
fix_ids(l90, 90)

# ---------- l91 — خوانداریِ فرهنگ‌لغت‌ها (س۱۴، ص۲۳۲) — کلید: 58 True/59 True (دوبلِ Trueِ چاپ) ----------
l91 = bank(91, "نهایی دی ۱۳۹۷ — خوانداریِ فرهنگ‌لغت‌ها (س۱۴، ص۲۳۲)", "چهارگزینه‌ای", [
    q(1, "grammar", f"{DICT_TEXT} — A monolingual dictionary improves your English reading skills.",
      ["True", "False"], 0),
    q(2, "grammar", f"{DICT_TEXT} — You can correct your pronunciation by using an electronic dictionary.",
      ["True", "False"], 0),
])
fix_ids(l91, 91)

# ---------- l92 — خوانداریِ معلمان (س۱۵، ص۲۳۳) — کلید: 61 c/62 d/63 False/64 False ----------
l92 = bank(92, "نهایی دی ۱۳۹۷ — خوانداریِ معلمان (س۱۵، ص۲۳۳)", "چهارگزینه‌ای", [
    q(1, "grammar", f"{TEACH_TEXT} — What does the word essential in the first lime mean?",
      ["dedicated", "knowledgeable", "necessary", "productive"], 2),
    q(2, "grammar", f'{TEACH_TEXT} — What does the word "then” refer to?',
      ["subjects", "classes", "teachers", "students' names"], 3),
    q(3, "grammar", f"{TEACH_TEXT} — Teachers are just busy when they are at school.",
      ["True", "False"], 1),
    q(4, "grammar", f"{TEACH_TEXT} — The only things that students learn at school are reading and writing.",
      ["True", "False"], 1),
])
fix_ids(l92, 92)

# ---------- رسید ----------
paper_map = ("نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — به‌روزِ r390: "
             "دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ ← این راند؛ "
             "خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸)؛ "
             "شهریور ۱۳۹۸ ص۲۴۴-۲۴۸ + کلید ص۲۴۹-۲۵۰ (۱۲/۶/۱۳۹۸)؛ "
             "دی ۱۳۹۸ ص۲۵۱-۲۵۶ + کلید ص۲۵۷-۲۵۸ (۲۲/۱۰/۹۸)؛ "
             "خرداد ۱۳۹۹ ریاضی-تجربی ص۲۵۹-۲۶۵ + کلید ص۲۶۶-۲۶۷ [r388]؛ "
             "خرداد ۱۳۹۹ انسانی ص۲۶۸-۲۷۴ + کلید ص۲۷۵-۲۷۶ (۰۷/۰۴/۹۹) [r389]؛ "
             "برگهٔ لایه‌خراب ص۲۷۷-۲۸۴ (نیازمند OCR/رندر)؛ "
             "شهریور ۱۳۹۹ ص۲۸۵-۲۹۰ + کلید ص۲۹۱-۲۹۲ [r387]؛ "
             "شهریور ۱۳۹۹ ویژهٔ ناشنوایان ص۲۹۳-۲۹۸ + کلید ص۲۹۹-۳۰۰ [r388]؛ "
             "دی ۱۳۹۹ ص۳۰۱-۳۰۵ + کلید ص۳۰۶-۳۰۷ [r386]؛ "
             "خرداد ۱۴۰۰ ریاضی-تجربی ص۳۰۸-۳۱۴ [r385]؛ "
             "خرداد ۱۴۰۰ انسانی ص۳۱۵-۳۲۱ [r384]؛ "
             "شهریور ۱۴۰۰ ص۳۲۲-۳۲۸ [r383]؛ "
             "دی ۱۴۰۰ ص۳۲۹-۳۳۵ [r382]؛ "
             "دی ۱۴۰۱ ص۳۳۶-۳۴۲ [r380]؛ "
             "شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۱۳ برگه استخراج شد، ۴ برگه باقی است")

receipt = {
    "extractedRound": "r390",
    "section": ("بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ دوازدهم: "
                "«سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ دی ۱۳۹۷ — کلیهٔ رشته‌ها، ویژهٔ داوطلبان آزاد و بزرگسال"),
    "examPages": ("pdf-p229-233 (پنج صفحهٔ آزمون) + کلیدِ رسمیِ سربرگِ قدیمی: pdf-p234-236 «راهنماي تصحيح امتحان نهایی درس زبان»؛ "
                  "مرزِ برگه‌ها = p228 (سربرگِ بخشِ ۴) → p229 و p236 → p237 (خرداد ۱۳۹۸)"),
    "examMeta": ("امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیهٔ رشته‌ها — "
                 "نوبت دیماه ۱۳۹۷ (تاریخِ چاپی: ۹۷/۱۰/۱۲) — ویژهٔ داوطلبان آزاد و بزرگسال سراسر کشور در دیماه ۹۷ — "
                 "نخستین و تنها برگهٔ پیش از عصرِ presentation-forms (سربرگِ ساده، بدونِ «مركز سنجش و پايش كيفيت آموزشي») — "
                 "۱۶ سکشن/۶۴ ردیف — یادداشتِ سربرگ: «سوالات پاسخنامه ندارد.» (چاپِ ثابتِ هر دو سربرگِ سؤال و کلید) — "
                 "پانویسِ QR: «Audio file (MP3) / Audio script (PDF)» برای شنیداری"),
    "keyPages": ("pdf-p234-236 راهنمای تصحیح — قالبِ قدیمیِ «1 .a/ next week» و «33 .(c) who» و «25: d» — "
                 "۳۲ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۲ کلید از ۳۲ آیتمِ بانک‌ها عینِ چاپ است"),
    "keyVerification": ("کلیدِ چاپی عیناً نقل شد: «1 .a/ next week» «2. b/ No» «3 . It was red. / red» «4 .Yes, She did. / Yes» "
                        "«5 . a/ True» «6 .b/ False» «7 . water» «8. healthy» / س۹-۱۶ speaking (بی‌کلیدِ ثابت) / "
                        "«17 . convert 18. generate 19 .effect 20 . Turbine» (۲۰ با T بزرگِ چاپ) / «21. (b) 22. (a)» (پایانِ ص۲۳۴) "
                        "«23. (e) 24. (c)» «25: d 26 :c 27 :e 28 :a» (دونقطه‌های ناهمگونِ چاپ) / "
                        "«29 . can open 30. would sell 31 .be paid 32 . had not washed» / "
                        "«33 .(c) who 34.( a ) was posted 35. (d)didn't she 36 .(b) out» (پرانتزهای ناهمگون) / "
                        "«37» «My brother always carries (.25) a bag which seems very heavy. (0/25)» و «38» «Mina has an exam tomorrow, (.25)so she should study well tonight. (0/25)» با نمره‌های زیربخشِ چاپی / "
                        "«39: but 40: so 41 .and 42: or» / س۴۳-۴۸ topic sentence (به‌صرفهٔ داور) / "
                        "مدلِ پاراگرافِ ص۲۳۶: Topic «Horses are farm animals.» + Supportingهای ۵۳/۵۱/۵۰/۵۲ + Concluding «They are very useful farm animals.» / "
                        "«55 . Bilingual dictionary is useful for them.» «.56 It contains the English word along with their meaning in another language.» "
                        "«.57 One language is used in it.» «.58 (a) True» «.59 (a) True» (دوبلِ Trueِ چاپ) / "
                        "«60 .They attend conference and training sessions...» «.61 c / necessary» «.62 d /the students' names» "
                        "«.63 (b) False» «64 .(b) False»"),
    "sectionsTotal": 64,
    "sectionsExtracted": 32,
    "sectionsSkipped": 32,
    "items": 32,
    "bankCounts": [2, 4, 4, 4, 4, 4, 4, 2, 4],
    "keyPolicy": ("همهٔ کلیدهای ۳۲ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ بانکِ ۵واژه‌ایِ l85 به ترتیبِ چاپِ خودِ برگه "
                  "(generate/renewable/convert/turbine/effect) و «renewable» اضافیِ چاپیِ هرگز-کلید؛ l84 با استخرِ دومکلیدیِ خودِ کلید "
                  "(water/healthy)؛ l88 دومین بانکِ تایپیِ بخشِ نهایی‌ها (بعدِ l74ِ r389) با accepted عینِ کلیدِ چاپی — "
                  "شکلِ کشیده؛ صورت‌های منقبض (مثل hadn't washed) پذیرفته نیست؛ l90 به ترتیبِ چاپِ سطرِ راهنما (and/or/but/so)"),
    "paperMap": paper_map,
    "skippedSections": [
        "س۱-س۳ شنیداریِ صوتی (ق۱-۶: تاریخ تولد/مهمانی/رنگِ لباس) — محتوای صوتی خارج از برگه (QR)",
        "س۵ speaking (ق۹-۱۶: وظایفِ فرزندان/دفترچهٔ خاطرات/ورزشِ انفرادی-تیمی/انرژیِ پاک/انتخابِ فرهنگ‌لغت/منابعِ زمین/درسِ موردعلاقه) — پاسخِ دلخواه",
        "س۱۰ جمله‌سازی (ق۳۷-۳۸) — کلیدِ مدلِ چاپی به مخزنِ تایپی رفت",
        "س۱۲ topic sentence (ق۴۳-۴۸: sport/Forest/smoking/Language/bad habits/Art) — «به‌صرفهٔ داور»",
        "س۱۳ پاراگرافِ اسب‌ها (ق۴۹-۵۴) — کلیدِ کاملِ ترتیب/نقش در ص۲۳۶ چاپ شده؛ کاندیدِ مرتب‌سازی ثبت شد (در gt-l66 رندرِ نقش‌محور دارد)",
        "خوانداریِ بازِ ق۵۵-۵۷ و ۶۰ — کلیدهای مدلِ چاپی به مخزنِ تایپی رفتند (در gt-l67/gt-l68 رندرِ تایپی دارند)",
    ],
    "printQuirks": [
        "سربرگِ سؤال و کلید هر دو: «سوالات پاسخنامه ندارد.» — یادداشتِ چاپیِ نسخهٔ داوطلبِ آزاد [z1]",
        "«... 7........ .When» — دنبالهٔ نقطه + نقطهٔ چسبیده به When در لایه [p229]",
        "«'birds» — آپاستروفِ سرگردانِ چاپ پیش از birds [z7]",
        "«a. well-known .» — نقطهٔ سرگردانِ چاپ پس از well-known در ستون B تعریف‌یابی [z3]",
        "«e d. no pains» — eِ سرگردانِ چاپ رویِ سطرِ d در ستون B هم‌نشین‌ها [z8]",
        "«d: which» و «d: didn't she» — دونقطه به‌جای نقطه در گزینه‌های dِ ق۳۳/۳۵ [z4]",
        "«I couldn't figure .......... What» — W بزرگِ میانهٔ جمله (چاپ) [z4]",
        "«very heavy / a bag I always / which...» — Iِ سرگردانِ چاپ در ق۳۷ [z4]",
        "«in the first lime mean?» — lime غلطِ حروف‌چینیِ چاپ برای line [z5]",
        "«the word \"then” refer to?» — کوتیشنِ مخلوطِ چاپ (بازِ مستقیم، بستهٔ خمیده) [z5]",
        "«responsibilities, 'Teachers need» — آپاستروفِ سرگردانِ چاپ در متنِ معلمان [z9]",
        "«you see you teachers» — you به‌جای your (چاپ) [z5]",
        "«attend conference» — بی‌حرف تعریف (چاپ؛ عینِ آن در کلیدِ مدلِ ۶۰)",
        "«20 . Turbine» — T بزرگِ چاپ در کلید",
        "دوبلِ Trueِ چاپ در کلیدِ ۵۸/۵۹ (الگویِ l56ِ r387)",
        "کلیدهای ۲۹-۳۲ و ۳۷-۳۸ با نمره‌های زیربخشِ چاپی (.25)/(0/25)",
    ],
    "twinCensus": ("هم‌خانوادگیِ بین‌خانواده‌ای — r292 همین برگه را در grammar-g12-topic.json (l59-68، ۴۲ آیتم) هم رندر کرده: "
                   "l85↔gt-l59 (تایپیِ همان چهارخانه)، l86↔gt-l60، l87↔gt-l61، l88↔gt-l62 (تایپی)، l89↔gt-l63، l90↔gt-l65 (تایپیِ آنجا/چهارگزینه‌ایِ اینجا)، "
                   "l91/l92↔gt-l67/gt-l68 (آنجا تایپی+MCQ؛ اینجا فقط ردیف‌های کلیددارِ MCQ)؛ "
                   "l84 (کلوژِ شنیداریِ مغز) هیچ‌جای مخزن نیست — نخستین رندرِ دی۹۷-شنیداری در کل پروژه؛ "
                   "جفت‌های تعریفیِ وزارت بین‌برگه‌ای: «calmly→in a quiet way» (gt-l60/گاردِ r292 و r382-l29)، «Distinguished→well-known»، "
                   "«Demand→the amount of...» (r386-l45 و r389-l82)، «Use up→to finish something» (r387-l58-4) — عینِ جفت‌های چاپِ برگه‌های ۹۹؛ "
                   "«spared no pains» در r298-س۵ و «no pains» در r388-l68 خوانداری — هم‌نشینِ اینجا مستقل است"),
    "futureNote": ("کاندیدهای تایپیِ این برگه (ق۳۷: My brother always carries...، ق۳۸: Mina has an exam...، ق۵۵: Bilingual dictionary...، "
                   "ق۵۶: It contains the English word...، ق۵۷: One language is used...، ق۶۰: They attend conference...) به کاندیدهای r380-r389 "
                   "اضافه شدند — مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۷۵ ردیف است (۶۹ِ r389 + ۶ ردیفِ تازه؛ این شش کاندید در gt-l64/gt-l67/gt-l68 رندرِ تایپیِ بین‌خانواده‌ای دارند)؛ "
                   "یک کاندیدِ مرتب‌سازیِ پاراگرافی (ق۴۹-۵۴ اسب‌ها) با کلیدِ کاملِ چاپیِ ص۲۳۶ (Topic/Supporting/Concluding) ثبت شد؛ "
                   "l88 الگویِ بانکِ تایپیِ آیندهٔ برگه‌های ۱۳۹۷/۹۸ است (gt نشان می‌دهد هر چهار برگهٔ قدیمی شکلِ فعلِ تایپی دارند)؛ "
                   "۴ برگه باقی است (نزدیک‌ترین: خرداد ۱۳۹۸ ص۲۳۷-۲۴۱)؛ در gt از l69 به بعد خرداد/شهریور/دی ۹۸ هم رندر دارند — سرشماریِ دوقلو برایشان الزامی"),
    "engineNote": ("l88 دومین بانکِ تایپیِ بخشِ نهایی‌ها — موتور ورودیِ متنی می‌رندرد (opts=0/typedInput=true) و با نرمال‌سازیِ "
                   "lib/typed-answer.ts مقایسه می‌کند؛ l88 از حلقهٔ MCQ-خالصِ گاردها مستثنی است (مثلِ l74)؛ "
                   "l85/l86/l87 پنج‌گزینه‌ای‌اند (الگویِ l58/l59/l80)؛ l84 دوبخشیِ استخرِ دومکلیدی (الگویِ چرخشِ l44 با استخرِ کوچک)"),
}
src["g12nahaie12"] = receipt

d["lessons"].extend([l84, l85, l86, l87, l88, l89, l90, l91, l92])
F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# sanity
d2 = json.loads(F.read_text(encoding="utf-8"))
ls = d2["lessons"]
tot = sum(len(b["questions"]) for b in ls)
print(f"OK: banks={len(ls)} items={tot} last={ls[-1]['lesson']}")
assert len(ls) == 92 and tot == 665
assert ls[-9]["lesson"] == 84 and ls[-1]["lesson"] == 92
ids = [q["id"] for b in ls for q in b["questions"]]
assert len(ids) == len(set(ids)) == 665
assert ids[633] == "g12-l84-1" and ids[-1] == "g12-l92-4"
print("ids[633] =", ids[633], "| ids[-1] =", ids[-1])
print("r390 extraction OK")
