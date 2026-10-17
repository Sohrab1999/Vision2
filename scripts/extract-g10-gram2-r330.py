# -*- coding: utf-8 -*-
# r330 — استخراجِ «تست گرامر و نگارش درس اول» جزوهٔ دهم (ص۶۶-۶۷، کلیدِ توضیح‌دار و ترجمهٔ چاپی ص۲۴۹-۲۵۱)
# به public/jozve/tests-g10.json — بانکِ هفدهم (lesson 17): ۲۰ MCQ با ترجمهٔ چاپیِ «ترجمه تست» (الگوی r328)
# کلیدِ چاپی: 20/20 هم‌رأی با پیش‌پرکردنِ معناییِ مستقل — صفر واگرایی.
# داوری‌های ۳۰۰۰-۸۰۰۰dpi: دستگری/پس/پسر/بخرد/قراره/بشوریم/کمی(مداد و خودکار)/اوه..کاملاً/ساعت۹:۳۰/
# میدونم/میشود/آمریکا هستند (گپ ۲.۳۳pt در بازهٔ فاصلهٔ واقعی ۱.۶-۳.۱pt)/جدی تر/خوشمزه ای/میروند (۰pt).
# Idempotent: اجرای دوم NO-OP (مبنا = ۱۶ بانکِ r323-r329 / ۳۱۱ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# —— (ساقه، گزینه‌ها، اندیسِ کلید چاپ، ترجمهٔ چاپی) — عینِ چاپ (آپاستروف راست‌خمیده، کوئیرک‌ها حفظ)
ITEMS = [
    ("When people keep the earth clean and safe, most kinds of animals will --------------- longer in the future.",
     ["live", "living", "are going to live", "lived"], 0,
     "زمانیکه مردم، کره زمین را تمیز و امن نگه دارند، بیشتر حیوانات در آینده طولانی تر خواهند زیست."),
    ("Other students are going ------------------- their friends’ reports and learn many things about nature and sea animals.",
     ["read", "to read", "will read", "reading"], 1,
     "سایر دانش آموزان قرار است که گزارشات دوستان خود را خوانده و چیزهای زیادی در مورد طبیعت و حیوانات دریایی یاد بگیرند."),
    ("Our neighbor has a big family. He has four ----------, --------- boy and three girls. --------- boy is 7 years old and their girls are 3, 16 and 20.",
     ["children / a / A", "children / a / The", "child / the / A", "child / the / The"], 1,
     "همسایه ما خانواده پر جمعیتی دارد. او صاحب چهار فرزند است. یک پس و سه دختر. پسر ۷ ساله دارد و دخترها ۳، ۱۶ و ۲۰ ساله هستند."),
    ("Mr. Rahimi’s little daughter broke his expensive laptop. He --------------------- a new one next month.",
     ["be going to buy", "bought", "will buying", "is going to buy"], 3,
     "دختر کوچک آقای رحیمی لپ تاپ گران قیمت او را شکست. او قرار است یک لپ تاپ جدید را ماه آینده بخرد."),
    ("Armin and Alireza have ---------- Italian class together. ------------- teacher is ----------- Mr. Del Piero.",
     ["a / Their / the", "a / His / -", "an / Their / -", "an / His / the"], 2,
     "آرمین و علیرضا به یک کلاس زبان ایتالیایی میروند و معلم آنها آقای دل پیرو است."),
    ("A: My classmates and I don’t know how to answer these difficult math questions.  B: They’re really easy. Don’t worry my dear students. I --------------------- you these questions again.",
     ["am going to teach", "will teach", "am teaching", "taught"], 1,
     "الف: من و همکلاسیهایم نمیدانیم چطور به این سوالات سخت ریاضی پاسخ دهیم.\" ب: این سوالات واقعاً آسان هستند نگران نباشید. من این سوالات را دوباره به شما تدریس خواهم کرد."),
    ("------------- shops aren’t very expensive, because they’re not in the center of ------------- town.",
     ["That / the", "This / a", "These / a", "These / the"], 3,
     "این مغازه ها خیلی گران قیمت نیستند، چونکه در مرکز شهر نیستند."),
    ("Next Saturday, my cousin ----------------- to Tehran for 2 days to visit Milad Tower and Azadi Square.",
     ["is going to travel", "will travel", "traveled", "travel"], 0,
     "شنبه آینده عموزاده من قرار است به مدت ۲ روز به تهران، برای دیدن کردن از برج میلاد و میدان آزادی، سفر کند."),
    ("My parents have decided to have a great birthday party for me. They --------------------- my best friends next Wednesday.",
     ["invite", "will invite", "are going to invite", "have invited"], 2,
     "والدین من تصمیم گرفته اند یک مهمانی تولد برای من بگیرند. آنها قرار است تعداد زیادی از بهترین دوستانم را برای چهارشنبه آینده دعوت کنند."),
    ("A: Why did they buy a lot of paint last week?  B: Because they --------------------- all the classes of our school soon.",
     ["paint", "painted", "will paint", "are going to paint"], 3,
     "الف- چرا آنها هفته گذشته آن همه رنگ را خریدند؟ ب- زیرا آنها قصد دارند همه کلاسهای مدرسه ما را به زودی رنگ آمیزی کنند."),
    ("A: The windows of your house are really dirty.  B: Yes, I know. I -------------------- and clean -------------------- with my sister next Friday.",
     ["’m going to wash / them", "’ll wash / it", "’ll wash / them", "’m going to wash / it"], 0,
     "الف- پنجره های خانه شما واقعاً کثیف هستند. ب- بله میدانم. من قراره با خواهرم جمعه آینده آنها را بشوریم و تمیز کنیم."),
    ("Our mother has bought some rice, meat from the supermarket. So, she ----------------------- a delicious food tomorrow night.",
     ["cook", "cooked", "will cook", "is going to cook"], 3,
     "مادرم کمی برنج و گوشت را از سوپرمارکت خریده است. او قصد دارد برای فردا شب یک شام خوشمزه ای را بپزد."),
    ("Most of the professors who are going ---------- us English at university are from ---------- Mexico and ---------- USA.",
     ["teach / a / the", "to teach / - / the", "to teach / - / an", "teach / the / an"], 1,
     "بیشتر اساتیدی که امسال قرار است به ما در دانشگاه زبان انگلیسی را تدریس کنند اهل کشور مکزیک و ایالات متحده آمریکا هستند."),
    ("When you come to our house Sunday night, I --------------------- you my big new toy train.",
     ["am going to show", "will show", "show", "showed"], 0,
     "اگه (زمانیکه) شما یکشنبه شب به خانه ما آمدید، قطار اسباب بازی جدید بزرگم را به تو نشان خواهم داد."),
    ("The hard-working zookeepers in our city’s zoo ---------------- the endangered animals more seriously.",
     ["will protects", "are going to protect", "protecting", "to protect"], 1,
     "نگهبانان سختکوش در باغ وحش شهر ما قرار است از حیوانات در معرض خطر به طور جدی تری محافظت کنند"),
    ("A: I don’t have any pens and pencils in my school bag today.  B: Really? Well, I --------------- you some.",
     ["am going to lend", "am lending", "will lend", "lent"], 2,
     "الف- من امروز هیچ خودکار و مدادی در کیفم ندارم. ب- واقعاً؟ نگران نباش. من بهت کمی(مداد و خودکار) به تو قرض خواهم داد."),
    ("A: Did you send your homework for the teacher?  B: Oh, I completely forgot, I ------------------- it after dinner.",
     ["will send", "am going to send", "send", "sent"], 0,
     "الف- آیا تکلیفت را برای معلم ارسال کردی؟ ب- اوه..کاملاً فراموش کردم. بعد از شام آن را ارسال خواهم کرد."),
    ("Raman helped his friend, Arshan to solve his math problems. He ------------------ him do his homework next Thursday.",
     ["will help", "helps", "is going to help", "be going to help"], 2,
     "رامان به دوستش آرشان کمک کرد که مسائل ریاضی را حل کند. قرار است که پنج شنبه آینده به او در انجام تکلیفش کمک کند."),
    ("My flight ---------------- at 9:30 tomorrow, so I need to get to the airport by 9:00. (کنکور منحصراً زبان)",
     ["leaves", "will leave", "is leaving", "left"], 0,
     "پرواز من در ساعت۹:۳۰ خواهد بود (حرکت میکنه). بنابراین لازمه که تا ساعت ۹ در فرودگاه باشم."),
    ("I don’t know what time the movie ------------------ tonight. (کنکور منحصراً زبان)",
     ["is beginning", "will begin", "begins", "began"], 2,
     "آیا میدونم امشب فیلم سینمایی ساعت چند شروع میشود. (شروع خواهد شد.)؟"),
]

PRINT_QUIRKS = [
    "سربرگِ کلید: «پاسخنامه تستهای دستگری گرامر و نگارش» — واژهٔ «دستگری» با یِ پایانیِ کاسه‌دار (زوم ۶۰۰۰dpi روی ص۲۴۹ و ص۲۶۵ — احتمالاً تحریفِ چاپیِ «دستوری»)؛ عین چاپ در رسید",
    "Q3: نخستین «پسر» چاپ «پس» بدون ر، دومین «پسر» با ر (زوم ۶۰۰۰dpi)؛ ارقام «۳، ۱۶ و ۲۰» با ساقهٔ انگلیسی هم‌خوان",
    "Q4: چاپ «بخرد» (لایه «بخرند» نویز — رندر ۳۰۰۰dpi حاکم)",
    "Q5: «میروند» چسبیده چاپ (گپِ لایه میان «میر|وند» = ۰pt)",
    "Q6: «همکلاسیهایم» چسبیده؛ گیومهٔ چاپ پس از «دهیم.» بسته ولی پیش از «ب:» گشوده نمی‌شود (نامتوازن — عین چاپ)؛ «هستند نگران» بدون نقطه؛ «الف:» دونقطه (بقیه با «الف-»)",
    "Q9: «گرفته اند» جدای چاپ",
    "Q11: «قراره» محاورهٔ چاپ + «بشوریم/کنیم» جمع با فاعلِ مفرد «من» (عین چاپ)؛ «پنجره های» جدای",
    "Q12: «خریده است.» نقطه (نه ویرگول)؛ «خوشمزه ای» جدای (گپ ۲.۶۳pt)؛ «را بپزد»",
    "Q13: «آمریکا هستند» جدای — گپ ۲.۳۳pt در بازهٔ فاصلهٔ واقعیِ همان سطر (۱.۶-۳.۱pt)؛ خوانشِ نخستِ «چسبیده» با اندازه‌گیری رد شد",
    "Q14: «اگه (زمانیکه)» عین چاپ؛ «قطار اسباب بازی جدید بزرگم»",
    "Q15: «جدی تر» جدای (گپ ۲.۷۴pt)؛ بدون نقطه پیش از گیومهٔ پایانی",
    "Q16: «کمی(مداد و خودکار)» پرانتزِ چسبیده (۶۰۰۰dpi)؛ «بهت … به تو» تکرارِ چاپ؛ «واقعاً؟»",
    "Q17: «اوه..کاملاً» با دو نقطه و بدون فاصله (عین چاپ)",
    "Q19: گیومهٔ آغازینِ جدای «\" پرواز» (گپ ۲.۹۱pt)؛ «ساعت۹:۳۰» چسبیده (گپ ۰.۱pt) ولی «ساعت ۹» جدای (۲.۷۷pt) — ناهماهنگیِ خودِ چاپ؛ «میکنه/لازمه» چسبیدهٔ محاوره؛ نقطه پس از پرانتز",
    "Q20: «میدونم» محاورهٔ چاپ (مِ ریزِ روی ن — ۶۰۰۰dpi؛ لایه «میدوبن»)؛ «میشود» چسبیده (برخلاف «می شود»های ص۹۰)؛ «(شروع خواهد شد.)؟» نقطه درون پرانتز + «؟» بیرون — عین چاپ",
    "Q19/Q20 ساقه‌ها با برچسب «(کنکور منحصراً زبان)» و کلید با «(زبان تخصصی)» (۶۰۰۰dpi — لایه «تخصیص» نویز)؛ جداسازِ خط‌چینِ قرمز پیش از Q19؛ جعبه‌های Note در ص۶۷/ص۲۵۱ خارج از محتوا",
]

RECEIPT = {
    "exam": "تست گرامر و نگارش درس اول (سؤالات: ص۶۶ و ۶۷)",
    "header": "۲۰ تست گرامر و نگارش — «درس یک - پایه دهم» — سطح تستها: «آموزشی»، «متوسط» (پاسخنامه صفحه: ۲۴۹ تا ۲۵۱)",
    "keyPages": "249-251",
    "keyVerification": "print key pp249-251 «پاسخنامه تستهای دستگری گرامر و نگارش — درس اول - پایه دهم، بخش: اول» — 20/20 agree with semantic pre-fill (هر مدخل: گزینه + شیوهٔ حل + ترجمه تست چاپی), zero divergence",
    "extractedRound": "r330",
    "pattern": "r328 (ترجمهٔ چاپ‌محور) + r311/r323 (بانک درس‌محور) + r320/r321 (عین چاپ)",
    "translations": "۲۰ ترجمهٔ چاپی «ترجمه تست» تزریق شد؛ ۱۵ نقطهٔ سرنوشت‌ساز با زوم ۳۰۰۰-۸۰۰۰dpi + اندازه‌گیریِ گپِ لایه داوری شد",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 17]
if existing:
    print(f"lesson 17 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 16, f"baseline mismatch: {len(data['lessons'])} banks"
    questions = [
        {
            "id": f"g10-l17-{i + 1}",
            "n": i + 1,
            "category": "grammar",
            "question": stem,
            "options": opts,
            "answer": key,
            "translation": tr,
        }
        for i, (stem, opts, key, tr) in enumerate(ITEMS)
    ]
    bank = {
        "lesson": 17,
        "title": "آموزشی/متوسط — تست گرامر و نگارش درس اول (ص۶۶-۶۷)",
        "level": "آموزشی/متوسط — چهارگزینه‌ای",
        "count": len(questions),
        "questions": questions,
    }
    data["lessons"].append(bank)
    data["source"]["gram2"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lesson 17: {bank['count']} items → banks={len(data['lessons'])}, total={total}")
