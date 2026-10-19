#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""r391 — برگهٔ سیزدهمِ نهایی‌ها: خرداد ۱۳۹۸ (کلیهٔ رشته‌ها، ص۲۳۷-۲۴۱ + کلیدِ ص۲۴۲-۲۴۳، تاریخِ ۱۳/۳/۱۳۹۸)
۱۰ بانک / ۳۸ آیتم → tests-g12.json (l93-l102) + رسیدِ g12nahaie13. idempotent (اجرای دوم = NO-OP).
هم‌خانوادگی: r292 همین برگه را در grammar-g12-topic.json (l69-l80) هم رندر کرده — سرشماری در رسید.
"""
import json
from pathlib import Path

F = Path("/home/z/my-project/public/jozve/tests-g12.json")
d = json.loads(F.read_text(encoding="utf-8"))
src = d["source"]
if "g12nahaie13" in src:
    print("NO-OP: g12nahaie13 already present")
    raise SystemExit(0)

# ---------- متن‌های چاپیِ داوری‌شده ----------
CHARITY = ("Some people prefer to provide help and support directly to those in need. However, "
           "others prefer to give money to national and international charity organizations. Giving "
           "money to those in need can be a personally good experience, but there is a choice between "
           "donating nationally and internationally through charities or giving directly to those "
           "around you. One of the advantages of providing direct support is that you can know exactly "
           "how your money is spent. Another benefit is that you can see the impacts on those you are "
           "helping, which can lead not only to great personal happiness but also to respect from "
           "others who appreciate the work you do. There are advantages in giving to charities that "
           "are national and international. First and the best is helping in problems of global "
           "importance, such as curing diseases and human rights or helping those who are in bad "
           "environmental events like earthquakes and floods. In conclusion a person should make "
           "their own choice in helping others. The important point is that we continue to give to "
           "those who are more in need than ourselves.")
DICTADV = ("A dictionary is a collection of words ranging from letters A-Z. When reading or writing "
           "a story, an essay, a paragraph or even a sentence, using a dictionary is a great help. "
           "There are many advantages of using a dictionary. So, using a dictionary is important for "
           "students. The first advantage of using a dictionary is pronunciation. We can also listen "
           "to the pronunciation of the words if we use an audio dictionary. The second advantage of "
           "using a dictionary is checking out a word's right spelling. The third advantage of using "
           "it is learning a word's part of speech. It is one of the types into which words are "
           "divided in grammar according to their use, such as noun, verb, or adjective. Lastly, "
           "example sentences are mostly available. Seeing specific words used in a sentence can "
           "provide more context and help you better understand proper usage. However, searching "
           "words by using a dictionary takes a lot of time. By using a talking dictionary, we are "
           "able to look the words up in a few minutes. As a result, a dictionary is a great help "
           "for everyone, especially students who are learning a language and who are interested in "
           "language learning.")
DEF_B = ["the rise and fall of the sea", "in a quiet way",
         "a book in which you record your thoughts and feelings",
         "to change in form or character",
         "in a way that is successful and achieves what you want"]
BANK4 = ["combination", "compile", "dedicated", "consume"]
CONN = ["and", "or", "but", "so"]

def bank(n, title, level, qs):
    return {"lesson": n, "title": title, "level": level, "count": len(qs), "questions": qs}

def q(i, cat, stem, opts, ans, **extra):
    o = {"id": f"g12-l{{}}-{i}", "n": i, "category": cat, "question": stem,
         "options": opts, "answer": ans}
    o.update(extra)
    return o

def fix_ids(b, n):
    for i, item in enumerate(b["questions"], 1):
        item["id"] = f"g12-l{n}-{i}"

# ---------- l93 — شنیداریِ متن‌چاپ (ق۷-۱۴) — کلید: 7 wind/8a/9c/10b/11d/12c/13a/14b ----------
l93 = bank(93, "نهایی خرداد ۱۳۹۸ — شنیداریِ متن‌چاپ (س۲-س۴، ص۲۳۷)", "چهارگزینه‌ای", [
    q(1, "vocab", "Which one is clean energy? Wind or Coal? -------.", ["wind", "coal"], 0),
    q(2, "grammar", "Scientists try to use clean energy because -------.",
      ["do not pollute the earth", "are harmful to the environment", "cannot be replaced",
       "cannot be turned into other forms of energy"], 0),
    q(3, "grammar", "When renewable energy is used, the demand for fossil fuels -------.",
      ["is produced", "is made", "is reduced", "is provided"], 2),
    q(4, "grammar", "Bijan didn't tell Mehran about the problem because -------.",
      ["it was an emergency", "it was a secret", "he didn't need any money", "he had no mobile phone"], 1),
    q(5, "grammar", "Why has Bijan saved some money?",
      ["to buy a new pair of shoes", "to solve his friend's problem", "to help Mehran",
       "to buy a new mobile phone"], 3),
    q(6, "grammar", "Ali is doing research on -------.",
      ["heart attack", "human's life", "air pollution"], 2),
    q(7, "grammar", "Where does air pollution mostly happen?",
      ["big cities", "roads", "highways"], 0),
    q(8, "grammar", "Polluted air causes different ------- to human.",
      ["reasons", "diseases", "ways"], 1),
])
fix_ids(l93, 93)

# ---------- l94 — واژگانِ تصویری — تایپی (ق۱۵-۱۶) — کلید: hard / Wind turbines- turbines ----------
l94 = bank(94, "نهایی خرداد ۱۳۹۸ — واژگانِ تصویری — تایپی (س۵، ص۲۳۸)", "تایپی", [
    q(1, "vocab", "We have to speak louder, because my grandfather is ------- of hearing.",
      ["hard"], 0, kind="typed", accepted=["hard"]),
    q(2, "vocab", "In opposite to fans, ------- (s) use wind to generate electricity.",
      ["wind turbines"], 0, kind="typed", accepted=["wind turbines", "turbines"]),
])
fix_ids(l94, 94)

# ---------- l95 — تعریف‌یابی (ق۱۷-۲۰) — کلید: e/c/a/d — اضافیِ هرگز-کلید: b ----------
l95 = bank(95, "نهایی خرداد ۱۳۹۸ — تعریف‌یابی (س۶، ص۲۳۸)", "چهارگزینه‌ای", [
    q(1, "vocab", "«There are some helpful tips on how to use a dictionary more effectively.» — تعریفِ ستون B برای واژهٔ «effectively»: -------", DEF_B, 4),
    q(2, "vocab", "«She agreed some parts of her personal diary to be published.» — تعریفِ ستون B برای واژهٔ «diary»: -------", DEF_B, 2),
    q(3, "vocab", "«Strong tides make swimming dangerous.» — تعریفِ ستون B برای واژهٔ «tides»: -------", DEF_B, 0),
    q(4, "vocab", "«We can convert some sofas into a bed.» — تعریفِ ستون B برای واژهٔ «convert»: -------", DEF_B, 3),
])
fix_ids(l95, 95)

# ---------- l96 — بانکِ چاپ (ق۲۱-۲۳) — کلید: consume/combination/dedicated — اضافی: compile ----------
l96 = bank(96, "نهایی خرداد ۱۳۹۸ — واژگانِ بانکِ چاپ (س۷، ص۲۳۸)", "چهارگزینه‌ای", [
    q(1, "vocab", "Nowadays the new light bulbs ------- less electricity.", BANK4, 3),
    q(2, "vocab", "As a great artist, he has used a ------- of paints in his works.", BANK4, 0),
    q(3, "vocab", "Dr. Gharib was regarded as a ------- physician and he spared no pains to help sick people.", BANK4, 2),
])
fix_ids(l96, 96)

# ---------- l97 — دانشِ خودِ حرف‌اول — تایپی (ق۲۴-۲۶) — کلید: absorb / symbol-sign / hu(بریده→hug) ----------
l97 = bank(97, "نهایی خرداد ۱۳۹۸ — دانشِ خودِ حرف‌اول — تایپی (س۸، ص۲۳۹)", "تایپی", [
    q(1, "vocab", "Plants a------- carbon dioxide from the air.",
      ["absorb"], 0, kind="typed", accepted=["absorb"]),
    q(2, "vocab", "H is the chemical s------- for hydrogen.",
      ["symbol"], 0, kind="typed", accepted=["symbol", "sign"]),
    q(3, "vocab", "In Germany people usually h------- each other when they meet.",
      ["hug"], 0, kind="typed", accepted=["hug"]),
])
fix_ids(l97, 97)

# ---------- l98 — شکلِ صحیحِ فعلِ مکالمه — تایپی (ق۲۷-۳۰) — کلید: seems/had decided/would-could go/are served ----------
l98 = bank(98, "نهایی خرداد ۱۳۹۸ — شکلِ صحیحِ فعلِ مکالمه — تایپی (س۹، ص۲۳۹)", "تایپی", [
    q(1, "grammar", "It ------- rather cold today, doesn't it? ( to seem)",
      ["seems"], 0, kind="typed", accepted=["seems"]),
    q(2, "grammar", "I ------- to go swimming before I left home. ( to decide)",
      ["had decided"], 0, kind="typed", accepted=["had decided"]),
    q(3, "grammar", "If it were fine, We ------- swimming today. ( to go)",
      ["would go"], 0, kind="typed", accepted=["would go", "could go"]),
    q(4, "grammar", "I know a restaurant in which a variety of sea foods ------- . ( to serve)",
      ["are served"], 0, kind="typed", accepted=["are served"]),
])
fix_ids(l98, 98)

# ---------- l99 — گرامرِ چهارگزینه‌ای (ق۳۱-۳۴) — کلید: which/may be produced/communicative/into ----------
l99 = bank(99, "نهایی خرداد ۱۳۹۸ — گرامرِ چهارگزینه‌ای (س۱۰، ص۲۳۹)", "چهارگزینه‌ای", [
    q(1, "grammar", "The train ------- he catches early in the morning is not very crowded.",
      ["whom", "which", "who", "whose"], 1),
    q(2, "grammar", "Some dangerous gases ------- when we burn garbage.",
      ["was produced", "produce", "may produce", "may be produced"], 3),
    q(3, "grammar", "The old man wasn't very ------- and kept to himself.",
      ["communicate", "communication", "communicative", "to communicate"], 2),
    q(4, "grammar", "I did not read the introduction and jumped ------- the next part.",
      ["into", "on", "up", "over"], 0),
])
fix_ids(l99, 99)

# ---------- l100 — حروفِ ربط (ق۳۷-۴۰) — کلید: so/and/but/or ----------
l100 = bank(100, "نهایی خرداد ۱۳۹۸ — حروفِ ربط (س۱۲، ص۲۳۹)", "چهارگزینه‌ای", [
    q(1, "grammar", "The early bird catches the worm, ------- if you want to succeed, wake up and start work early.", CONN, 3),
    q(2, "grammar", "He bought a house, found a job, ------- chose a school for his children last year.", CONN, 0),
    q(3, "grammar", "The glass fell down to the floor, ------- it didn't break.", CONN, 2),
    q(4, "grammar", "You can pay now, ------- when I finish your painting.", CONN, 1),
])
fix_ids(l100, 100)

# ---------- l101 — خوانداریِ نیکوکاری (ق۵۰-۵۲) — کلید: b/advantage، دوبلِ True ----------
l101 = bank(101, "نهایی خرداد ۱۳۹۸ — خوانداریِ نیکوکاری (س۱۵، ص۲۴۰)", "چهارگزینه‌ای", [
    q(1, "grammar", f'{CHARITY} — What is the closest synonym for the word "benefit"?',
      ["experience", "advantage", "choice", "effect"], 1),
    q(2, "grammar", f"{CHARITY} — Helping people in bad environmental events has the global importance.",
      ["True", "False"], 0),
    q(3, "grammar", f"{CHARITY} — All people feel great personal happiness when they help others.",
      ["True", "False"], 0),
])
fix_ids(l101, 101)

# ---------- l102 — خوانداریِ فرهنگ‌لغت (ق۵۶-۵۸) — کلید: c/ part of speech، a/ out of reach، b/ False ----------
l102 = bank(102, "نهایی خرداد ۱۳۹۸ — خوانداریِ فرهنگ‌لغت (س۱۶، ص۲۴۱)", "چهارگزینه‌ای", [
    q(1, "grammar", f"{DICTADV} — What does the pronoun (it) in line 7 refer to?",
      ["pronunciation", "spelling", "part of speech", "example sentence"], 2),
    q(2, "grammar", f'{DICTADV} — What is the opposite of the underlined word "available"?',
      ["out of reach", "valuable", "repetitive", "accessible"], 0),
    q(3, "grammar", f"{DICTADV} — Learning a word's part of speech helps us better understand proper usage of it.",
      ["True", "False"], 1),
])
fix_ids(l102, 102)

# ---------- رسید ----------
paper_map = ("نقشهٔ کاملِ بخشِ ۴ (ص۲۲۸-۳۴۹، ۱۷ برگه) — به‌روزِ r391: "
             "دی ۱۳۹۷ ص۲۲۹-۲۳۳ + کلیدِ سربرگِ قدیمیِ ص۲۳۴-۲۳۶ [r390]؛ "
             "خرداد ۱۳۹۸ ص۲۳۷-۲۴۱ + کلید ص۲۴۲-۲۴۳ (۱۳/۳/۱۳۹۸) ← این راند؛ "
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
             "شهریور ۱۴۰۱ ص۳۴۳-۳۴۹ [r381] — ۱۴ برگه استخراج شد، ۳ برگه باقی است")

receipt = {
    "extractedRound": "r391",
    "section": ("بخش چهارمِ جزوه: «آزمونهای از دی ماه 1397 تا شهریور 1401 نهابی با کلید» — برگهٔ سیزدهم: "
                "«سؤالات امتحان نهایی» زبان انگلیسی (۳) نوبتِ خرداد ۱۳۹۸ — کلیهٔ رشته‌ها"),
    "examPages": ("pdf-p237-241 (پنج صفحهٔ آزمون) + کلیدِ رسمی: pdf-p242-243 «راهنماي تصحيح امتحان نهایی درس: زبان انگلیسی (۳)»؛ "
                  "مرزِ برگه‌ها = p236 → p237 (پس از دی ۱۳۹۷ِ r390) و p243 → p244 (شهریور ۱۳۹۸)"),
    "examMeta": ("امتحان نهاییِ سراسریِ وزارت — درس: زبان انگلیسی (۳) — پایه دوازدهم دورهٔ دوم متوسطه — رشته: کلیهٔ رشته‌ها — "
                 "نوبت خردادماه ۱۳۹۸ (تاریخِ چاپی: ۱۳/۳/۱۳۹۸) — ساعت شروع ۸ صبح (فاصلهٔ چاپ؛ الگویِ r388/r389) — مدت ۱۲۰ دقیقه — "
                 "۵ صفحه/۵۸ ردیف/جمعِ نمرهٔ ۴۰ — روزانه/بزرگسال/داوطلب آزاد — مركز سنجش و پايش كيفيت آموزشي (aee.medu.ir) — "
                 "سربرگِ presentation-forms با «ﺳﺆاﻻت  اﻣﺘﺤﺎن ﻧﻬﺎﯾﯽ» دوفاصله‌ای (الگویِ r383/r386/r387) و یادداشتِ «سؤالات (پاسخ نامه دارد)»؛ "
                 "شنیداریِ ۶سؤالیِ صوتی (ق۱-۶) + سه سکشنِ شنیداریِ متن‌چاپ (ق۷-۱۴)"),
    "keyPages": ("pdf-p242-243 راهنمای تصحیح — قالبِ «8. a/ do not pollute the earth» و «17. ( e )» و «21. consume» — "
                 "۳۸ کلیدِ چاپی در گارد پیمان می‌شود؛ ۳۸ کلید از ۳۸ آیتمِ بانک‌ها عینِ چاپ است (تنها استثنا: ق۲۶ با کلیدِ بریدهٔ چاپ)"),
    "keyVerification": ("کلیدِ چاپی عیناً نقل شد: ق۱-۶ مدل‌های شنیداریِ بازِ «1. take temperature 2. Dr. Gharib 3. Solar power 4. English "
                        "5. Natural gas, oil ,and coal (ذکر دو مورد کافی است) 6. I would take a photo / photos» / "
                        "«7. wind» «8. a/ do not pollute the earth» «9. c/ is reduced» «10. b / it was a secret» «11. d/ to buy a new mobile phone» "
                        "«12. c/ air pollution» «13. a/ big cities» «14. b/ diseases» / «15. hard» «16. Wind turbines/ turbines» / "
                        "«17. ( e ) 18. ( c ) 19. ( a ) 20. ( d )» (پرانتزهای ناهمگونِ چاپ) / «21. consume 22. combination 23. dedicated» / "
                        "«24. absorb 25. symbol /sign 26. hu» — کلیدِ ۲۶ بریدهٔ چاپ است (تکمیلِ معناییِ hug هم‌سو با gt-l73) / "
                        "«27. seems 28. had decided 29. would/ could go 30. are served» (جفتِ کلیدِ چاپیِ ۲۹) / "
                        "«31. b/ which 32. d/ may be produced 33. c/ communicative 34. a/ into» / "
                        "«35. Everything in the garden was brown or everything is brown in the garden because it hadn't rained for months. (0/5)(0/5)» "
                        "«36. The woman who lives next door is a famous professor or The woman who is a famous professor lives next door. (0/5)(0/5)» / "
                        "«37. so 38. and 39. but 40. or» / س۱۳ open (ق۴۱ با صرفهٔ داور) / "
                        "جدولِ س۱۴: Topic=44، Supporting=42، 43، 47، 46 (ترتیب مهم نیست)، Concluding=45 با یادداشتِ «ترتیب قرار گرفتن جملات supporting مهم نیست» / "
                        "«48. It can lead not only to great personal happiness but also to respect from others who appreciate the work you do (0.5/0.5)» "
                        "«49. The important point is that we continue to give to those who are more in need than ourselves (0.25/0.75)» / "
                        "«50. b/ advantage» «51. (a) True» «52. (a) True» (دوبلِ Trueِ چاپ — الگویِ l91/l56) / "
                        "«53. By using a talking dictionary, we are able to look the words up in a few minutes (0.25/0.75)» "
                        "«54. Seeing specific words used in a sentence can provide more context and help you better understand proper usage (0.5/0.5)» "
                        "«55. When reading or writing a story, an essay, a paragraph or even a sentence, using a dictionary is a great help (0.75/0.25)» / "
                        "«56. c/ part of speech» «57. a / out of reach» «58. b / False»"),
    "sectionsTotal": 58,
    "sectionsExtracted": 38,
    "sectionsSkipped": 20,
    "items": 38,
    "bankCounts": [8, 2, 4, 3, 3, 4, 4, 4, 3, 3],
    "keyPolicy": ("همهٔ کلیدهای ۳۸ آیتم از راهنمای تصحیحِ چاپی می‌آیند (عینِ چاپ)؛ سه استثنایِ ساختاری: "
                  "(۱) ق۷ بدونِ گزینهٔ چاپی — دو کاندیدای درون‌ساقه‌ایِ چاپ (Wind/Coal) به گزینهٔ MCQ بدل شد (gt همان را تایپی رندر کرده)؛ "
                  "(۲) ق۲۶ با کلیدِ بریدهٔ چاپِ «hu» — تکمیلِ معناییِ hug هم‌سو با gt-l73؛ "
                  "(۳) جفت‌کلیدهای چاپیِ ۱۶ (Wind turbines/turbines) و ۲۵ (symbol/sign) و ۲۹ (would/could go) به accepted دوبخشی بدل شدند؛ "
                  "بانکِ ۴واژه‌ایِ l96 به ترتیبِ چاپِ خودِ برگه (combination/compile/dedicated/consume) و «compile» اضافیِ چاپیِ هرگز-کلید؛ "
                  "gزینه‌های گرامرِ l99 به چینشِ دیداریِ چاپ (a-d تک‌ردیفی — ترتیبِ لایه d,c,b,a آرتیفکتِ RTL بود)؛ "
                  "سه‌گزینه‌ای‌های چاپیِ ق۱۲-۱۴ (الف-ج) وفادار حفظ شدند"),
    "paperMap": paper_map,
    "skippedSections": [
        "س۱ شنیداریِ صوتیِ باز (ق۱-۶: دمای بدن/دکتر غریب/انرژیِ خورشیدی/زبان/سوختِ فسیلی/عکاسی) — ساقه‌ها فقط صوتی‌اند (بدونِ متنِ چاپی)؛ مدل‌های کلید در گارد پیمان شد",
        "س۱۱ جمله‌سازی (ق۳۵-۳۶) — دو مدلِ چاپیِ دوبخشی به مخزنِ تایپی رفت (gt-l76 رندرِ تایپی دارد)",
        "س۱۳ پاراگرافِ «save our Earth» (ق۴۱) — با صرفهٔ داور (گزاره‌های bullet چاپ)",
        "س۱۴ پاراگرافِ آب (ق۴۲-۴۷) — کلیدِ جدولیِ کاملِ Descriptor در ص۲۴۳؛ کاندیدِ نقش‌محور ثبت شد (gt-l78 رندرِ نقش‌محور دارد)",
        "خوانداریِ بازِ نیکوکاری (ق۴۸-۴۹) — مدل‌های چاپی به مخزن رفت (gt-l79 رندرِ تایپی دارد)",
        "خوانداریِ بازِ فرهنگ‌لغت (ق۵۳-۵۵) — سه مدلِ چاپی با زیرنمره‌های (0.25/0.75)(0.5/0.5)(0.75/0.25) به مخزن رفت (gt-l80 رندرِ تایپی دارد)",
    ],
    "printQuirks": [
        "کلیدِ بریدهٔ چاپیِ «26. hu» — ناقصِ حروف‌چینی؛ تکمیلِ معناییِ hug (هم‌سو با gt-l73) [z4]",
        "ق۷ بدونِ گزینهٔ چاپی — «Wind or Coal؟» درونِ ساقه؛ MCQِ درون‌ساقه‌ای [p237]",
        "ق۱۲-۱۴ سه‌گزینه‌ای‌اند (الف-ج) — وفادار حفظ شد",
        "چینشِ گزینه‌های ق۳۱-۳۴ در لایه d,c,b,a اما در چاپِ دیداری تک‌ردیفیِ a-d [z2] — ترتیبِ لایه آرتیفکتِ RTL",
        "دوبلِ Trueِ چاپ در کلیدِ ۵۱/۵۲ (سومین تکرارِ الگو بعدِ l56 و l91)",
        "«18. ( c )» و «19. (  a  )» پرانتزهای ناهمگونِ چاپ در کلید",
        "«5. Natural gas, oil ,and coal» ویرگولِ چسبیدهٔ چاپ + یادداشتِ «(ذکر دو مورد کافی است)»",
        "«25. symbol /sign» و «29. would/ could go» و «16. Wind turbines/ turbines» — سه جفت‌کلیدِ چاپی → accepted دوبخشی",
        "«( to seem)» و «( to serve)» فاصلهٔ اولِ پرانتز در ساقه‌های مکالمه + نقطهٔ « ------- . ( to serve)» پیش از پرانتز",
        "«a……….» حرفِ اولِ چسبیده به نقطه‌چین در ق۲۴-۲۶ (a------- پیوند خورد)",
        "«is ………of hearing» نقطه‌چینِ چسبیده به of در ق۱۵",
        "«\"benefit\"» و «\"available\"» کوتیشنِ مستقیمِ چاپ در ساقه‌های خوانداری",
        "«the woman / professor / next door / is / who / a.» خامِ ق۳۶ با «a.» پایانیِ چاپ",
        "پانویسِ QR «Audio file (MP3) / Audio script (PDF)» در ص۲۳۷ + شماره‌گذاریِ چاپیِ ۱۴۲-۱۴۸ پایینِ صفحات",
        "«We cannot think of life without water.» به‌عنوانِ Supporting (نه Topic) در کلیدِ جدولی — Topic = 44 «Water is the most essential element...» [z3]",
        "«hadn't» و «didn't» و «friend's» آپاستروف‌های خمیدهٔ لایه در ق۳۵/۳۶ و ق۱۰/ق۱۱",
    ],
    "twinCensus": ("هم‌خانوادگیِ بین‌خانواده‌ای — r292 همین برگه را در grammar-g12-topic.json (l69-l80، ۵۲ آیتم) هم رندر کرده: "
                   "l93↔gt-l69 (ق۷: ما MCQِ درون‌ساقه‌ای/آنها تایپی با accepted wind)، l94↔gt-l70، l95↔gt-l71، l96↔gt-l72 (تایپیِ آنجا)، "
                   "l97↔gt-l73 (hug تکمیل‌شدهٔ هر دو)، l98↔gt-l74، l99↔gt-l75، l100↔gt-l77، l101↔gt-l79، l102↔gt-l80؛ "
                   "پاراگرافِ آب ↔ gt-l78 (کاندیدِ نقش‌محور)؛ جفت‌های بین‌برگه‌ای: "
                   "«spared no pains to help sick people» (l96-3 ↔ r388-l68 خوانداریِ خرداد ۹۹ ↔ r298-س۵ شهریور ۹۹ ↔ r390-l87 هم‌نشینِ no pains) — "
                   "چهارمین تکرار؛ «convert... sofas into a bed» (l95-4 ↔ اضافیِ چاپیِ r387-س۵ «The sofa converts into bed.» ↔ l1-60)؛ "
                   "«in a quiet way» (ستون B این برگه ↔ r390-l86 ↔ gt-l60)؛ «rise and fall of the sea» (↔ l5-4..6 و l29-4..6 و gt-l71)؛ "
                   "«communicative» (l99-3 ↔ r389-l77-5 «He is not very communicative»)؛ «jumped ------- the next part» (l99-4 ↔ r387-l58-3 تعریفِ jumped into)؛ "
                   "«wind turbines» (l94-2 ↔ l43/l68/l79/l85 — تمِ پایدارِ وزارت)؛ «diary» تعریف (l95-2 ↔ r387-l58-1/gt-l60)"),
    "futureNote": ("کاندیدهای تایپیِ این برگه (ق۳۵: Everything in the garden...، ق۳۶: The woman who lives next door...، "
                   "ق۴۸: It can lead not only...، ق۴۹: The important point is that...، ق۵۳: By using a talking dictionary...، "
                   "ق۵۴: Seeing specific words...، ق۵۵: When reading or writing a story...) به کاندیدهای r380-r390 اضافه شدند — "
                   "مخزنِ بانکِ تایپیِ نهایی‌ها اکنون ۸۲ ردیف است (۷۵ِ r390 + ۷ ردیفِ تازه؛ همگی در gt-l76/gt-l79/gt-l80 رندرِ تایپیِ بین‌خانواده‌ای دارند)؛ "
                   "یک کاندیدِ نقش‌محورِ پاراگرافِ آب (ق۴۲-۴۷) با کلیدِ جدولیِ کاملِ چاپی (Topic=44/Supporting=42,43,47,46/Concluding=45) ثبت شد؛ "
                   "ق۱-۶ شنیداریِ بازِ بی‌ساقهٔ چاپی — قابلِ بانک‌شدن نیستند؛ "
                   "۳ برگه باقی است (نزدیک‌ترین: شهریور ۱۳۹۸ ص۲۴۴-۲۴۸؛ سپس دی ۱۳۹۸ ص۲۵۱-۲۵۶ و برگهٔ لایه‌خراب ص۲۷۷-۲۸۴)؛ "
                   "gt از l81 به بعد شهریور ۹۸ را هم دارد — سرشماریِ دوقلو برایشان الزامی"),
    "engineNote": ("سه بانکِ تایپیِ تازه: l94 (با accepted دوبخشیِ wind turbines/turbines)، l97 (اولین بانکِ حرف‌اولِ تایپیِ بخشِ نهایی‌ها — "
                   "ساقه‌های a-------/s-------/h------- با حرفِ اولِ چسبیده)، l98 (مکالمه با accepted دوبخشیِ would/could go) — "
                   "مجموعِ بانک‌های تایپیِ بخشِ نهایی‌ها اکنون پنج‌تاست (l74، l88، l94، l97، l98)؛ "
                   "l93 شاملِ نخستین گزینهٔ درون‌ساقه‌ایِ (Wind/Coal) مخزن است؛ l101/l102 متنِ کامل در ساقه (الگویِ l91/l92)؛ "
                   "l95 پنج‌گزینه‌ای با ساقه‌های جمله‌دار (الگویِ l58)؛ بانک‌های تایپی از حلقهٔ MCQ-خالصِ گاردها مستثنی‌اند"),
}
src["g12nahaie13"] = receipt

d["lessons"].extend([l93, l94, l95, l96, l97, l98, l99, l100, l101, l102])
F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# sanity
d2 = json.loads(F.read_text(encoding="utf-8"))
ls = d2["lessons"]
tot = sum(len(b["questions"]) for b in ls)
print(f"OK: banks={len(ls)} items={tot} last={ls[-1]['lesson']}")
assert len(ls) == 102 and tot == 703
ids = [q["id"] for b in ls for q in b["questions"]]
assert len(ids) == len(set(ids)) == 703
assert ids[665] == "g12-l93-1" and ids[-1] == "g12-l102-3"
print("ids[665] =", ids[665], "| ids[-1] =", ids[-1])
print("r391 extraction OK")
