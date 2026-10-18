# -*- coding: utf-8 -*-
# r332 — استخراجِ «تست گرامر و نگارش درس اول — استاندارد/متوسط» جزوهٔ دهم (ص۷۲-۷۴، کلیدِ توضیح‌دار و ترجمهٔ چاپی ص۲۵۴-۲۵۷)
# به public/jozve/tests-g10.json — بانکِ بیست‌وپنجم (lesson 25): ۴۰ MCQ با ترجمهٔ چاپیِ «ترجمه:» (الگوی r330)
# کلیدِ چاپی: 40/40 هم‌رأی با پیش‌پرکردنِ معناییِ مستقل — صفر واگرایی.
# داوری‌های ۲۲۰۰-۹۰۰۰dpi: خداحافیط/واقعا؟من (Q2)، میز را (Q5)، جک،آرام (Q13)، شروع می شود (Q17)،
# شرکت بکنی/کافی (Q19)، کاوو/چور (Q20)، میبرد+نقطهٔ سیاه (Q21)، مشغول/حاضر (Q22)، مهمانی (Q29)،
# هستی/بوده اند/مختلفی (Q31)، جین/مدت طولانی (Q32)، شیرفروشی/شیرینی/پیاده کنی (Q34)، تعطیلی (Q36)،
# بی تاب و بی حوصله (Q38)، خشکشویی/بگیریم (Q39)، هلن/راضی خواهی بود (Q40)، می گوب (Q26، ۶۰۰۰dpi)،
# دو پس/پسها/کرده (Q27-d)، دایی/ماهی (آزاد) (Q27)، دو day (Q9)، A:' (Q11)، --------------the (Q14)،
# _ / گزینه‌های خالی (Q32/Q36)، (ریاضی ۹۴)/(تجاری ۹۴) قرمز (Q39/Q40)، سربرگ کلید «پاسخنامه تشریحی
# تستهای گرامر» — بخش دوم (خلافِ «دستگری» ص۲۴۹ — این سربرگ تمیز است).
# Idempotent: اجرای دوم NO-OP (مبنا = ۲۴ بانکِ r323-r331 / ۳۹۸ آیتم).
import json
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

# —— (ساقه، گزینه‌ها، اندیسِ کلید چاپ، ترجمهٔ چاپی) — عینِ چاپ (کوتیشن‌های خمیده، کوئیرک‌ها حفظ)
ITEMS = [
    ("On Friday mornings she --------------------- up at 7:30.",
     ["wakes", "is waking", "will wake", "is going to wake"], 0,
     "او صبح های جمعه ساعت هفت و نیم از خواب بیدار می شود."),
    ("A: “Sam is going abroad tomorrow afternoon.”  B: “Really? I -------------------- him off.”",
     ["will see", "am going to see", "see", "am seeing"], 0,
     "الف: سام فردا بعد از ظهر به خارج از کشور می رود؟ ب: واقعا؟من می روم و با او خداحافیط خواهم کرد."),
    ("A: “Ahmad’s father has just been in hospital for two weeks.  B: “Yes, we ------------------ him at this time tomorrow.”",
     ["will visit", "visit", "are going to visit", "were going to visit"], 2,
     "الف: پدر اخیرا به مدت دو هفته در بیمارستان بوده است.\" ب:آره، ما قصد داریم فردا همین موقع از او دیدن کنیم.\""),
    ("She is so pale that I believe she---------------- now.",
     ["is going to faint", "will faint", "faints", "is fainting"], 0,
     "او آنقدر رنگش پریده است که باور دارم الان غش می کند."),
    ("A: Will you please -------------------- me carry the table?”  B: “Yes, sure”",
     ["helps", "help", "to help", "helping"], 1,
     "الف: میشه لطفا کمکم میز را حمل بکنم؟ ب:بله. حتما."),
    ("Samira and Saba ------------------- to the cinema tonight. It’s said that the movie is great. I wish I could go with them.",
     ["is going to", "were going to", "are going to", "was going to"], 2,
     "سمیرا و صبا قصد دارند امشب به سینما بروند. میگویند که فیلم عالی است. ای کاش من هم میتوانستم با آنها بروم."),
    ("A: “Hi Sobhan, it’s getting too dark. Don’t you want to come back home?”  B: “Yes dad, ok I ------------------- back very soon.”",
     ["am going to go", "will go", "am going", "go"], 1,
     "الف: سلام سبحان، هوا دارد تاریک می شود. نمی خوایه به خانه برگردی؟ ب: بله پدر، باشه خیلی زود برخواهم گشت."),
    ("A: “I ------------ my finger a few seconds ago.”  B: “Ok, I ------------- bring the plaster soon”.",
     ["cut / will", "am cutting / will", "cut / am going to", "am cutting / am going to"], 0,
     "الف: انگشتم را چند ثانیه قبل بریدم. ب: باشه زود چسب زخم را خواهم آورد."),
    ("We should wrap up warm, it has been snowing for two day, so it ------------------ very cold outside.",
     ["was", "will be", "isn’t", "is going to be"], 3,
     "باید به خوبی لباس گرم بپوشیم، دو روز است که دارد برف می بارد، بنابراین بیرون خیلی سرد خواهد بود."),
    ("The day after tomorrow -------------- my little son’s birthday and he ----------------- be seven years old.",
     ["is / will", "was / is going to", "was / will", "is / is going to"], 0,
     "پس فردا تولد پس کوچکم است و او هفت سالش خواهد شد."),
    ("A:’ There’s nothing in the fridge.  B: “I know, I ------------------ shopping this evening.",
     ["will go", "am going to go", "go", "am going to going"], 1,
     "الف: هیچ چیز در یخچال نیست. ب: می دانم امروز عصر قصد دارم به خرید بروم."),
    ("He ------------------------ her mother the whole truth, but he didn’t.",
     ["will", "is going to", "was going to", "was going"], 2,
     "او قصد داشت تمام حقیقت را به مادرش بگوید اما این کار را نکرد."),
    ("Drive slowly! Jack! Otherwise, we -------------------- a car crash!",
     ["will have", "have", "are having", "are going to have"], 3,
     "جک،آرام بکن! در غیر اینصورت تصادف خواهیم کرد."),
    ("A: “When --------------the sun come up every day”?  B: “I think it is around 6:30”.",
     ["will", "does", "do", "did"], 1,
     "الف: خورشید هر روز ساعت چند طلوع می کند؟ ب: فکر بکنم حدود ساعت شش و نیم ."),
    ("After graduation, I ------------------- an institute. I think it ----------------- attract lots of students.",
     ["will / is going to", "am going to / is going to", "will / will", "am going to / will"], 3,
     "بعد از اینکه فارغ التحصیل بشوم قصد دارم یک آموزشگاه تاسیس کنم. فکر می کنم دانش آموزان زیادی را (به خود) جذب خواهد کرد."),
    ("A: “Unfortunately, her daughter has just caught Covid-19.”  B: “Oh, that’s bad! She -------------------- in a good mood.”",
     ["isn’t going to be", "won’t be", "is going to be", "will be"], 0,
     "الف: متاسفانه دختر او اخیرا بیماری کرونا گرفته است. ب: اوه، چه بد! او (الن) در حال و هوای خوب نیست."),
    ("The film ------------ at 4:30 and now it’s 3:45. It takes an hour to reach the cinema, ------------ we will be late.",
     ["is starting / are going to be", "will start / will be", "starts / are going to be", "is going to start / will be"], 2,
     "فیلم ساعت چهار و نیم شروع می شود و الان ساعت سه و چهل و پنج دقیقه است. یک ساعت هم طول می کشد تا به سینما برسیم، ما (قطعا) دیر خواهیم کرد."),
    ("A: “Why are you buying these things?”  B: “Because I ---------------- soup for Pedram.”",
     ["will make", "am going to make", "am making", "make"], 1,
     "الف: چرا این چیزها را میخری؟ ب: زیرا قصد دارم برای پدرام سوپ درست بکنم."),
    ("A: ----------------- you want to attend these courses?  B: Actually no, I ----------------- have enough money.",
     ["Will / don’t", "Do / don’t", "Are / won’t", "Will / am not going to"], 1,
     "الف: آیا می خوایه در این دوره ها شرکت بکنی؟ ب:راستش نه. پول کافی ندارم."),
    ("A: “Karo, -------------- you guide me how to solve this math problem?  B: “Yes. Don’t worry, I --------------- help you with it”",
     ["do / will", "will / am going to", "am going to / do", "will / will"], 3,
     "الف:کاوو میشه راهنماییم بکنی که چور این مسئله ریاضی را حل بکنم؟ ب:بله نگران نباش. کمکت خواهم کرد."),
    ("There is a football match on TV tomorrow night. I feel Real Madrid --------------- against Barcelona.",
     ["will win", "is going to win", "wins", "is winning"], 0,
     "الف: فردا شب در تلویزیون فوتبال پخش میشود. ب: من احساس می کنم که رئال مادرید در مقابل بارسلونا بازی را میبرد."),
    ("There are many ---------------- in the alley. They ----------------- right now.",
     ["children / are playing", "children / play", "childs / are going to play", "childs / will play"], 0,
     "بچه های زیادی در کوچه هستند . آنها در حال حاضر مشغول بازی کردن هستند."),
    ("There are around 190 --------------- in the world. I wish we were able to visit all of them.",
     ["country", "countries", "countrys", "countris"], 1,
     "حدود 190 کشور در دنیا وجود دارد. ای کاش می توانستیم از همه آنها بازدید بکنیم."),
    ("I saw three --------------- in the mountain. They -------------- very dangerous.",
     ["wolves/are", "wolfs/were", "wolves/were", "wolfs / are"], 2,
     "سه گرگ را در کوهستان دیدم. آنها خیلی خطرناک بودند."),
    ("Coming back home, we found -----------------. She was crying loudly.",
     ["three missing kids", "a missing kids", "a missing kid", "two missing kid"], 2,
     "وقتی به خانه بر می گشتیم یک بچه گمشده را پیدا کردیم. او داشت با صدای بلند گریه می کرد."),
    ("A:” Today, few ------------- take notice of moral ---------------, do they”?  B: “Yes, you are right”.",
     ["persons / principle", "people / prnciples", "people / principle", "person / principles"], 1,
     "الف:امروزه مردم خیلی کم به اصول اخلاق توجه می کنند ,مگر نه؟ ب:بله درست می گوب."),
    ("Which of the following is grammatically CORRECT?",
     ["The my uncle bought a nice present for my birthday.",
      "Two salmons died because of a long lack of water .",
      "Pejman will want to go abroad next Tuesday .",
      "Jamshid has two sons and a daughter. Sadly, one of the boys had a bad car accident two days ago."], 3,
     "کدام یک از گزینه های زیر از نظر گرامری درست است ؟ — a: دایی من برای تولدم یک هدیه خرید. b: دو ماهی (آزاد) به دلیل کمبود مدت آب مردند. c: پژمان سه شنبه بعد می خواهد به خارج برود. d: جمشید دو پس و یک دختر دارد. متاسفانه یکی از پسها دو روز پیش تصادف بدی کرده."),
    ("If you don’t follow the rules, I -------------- the police to catch you.",
     ["will inform", "am going to inform", "am informing", "inform"], 0,
     "اگر از قوانین پیروی نکنی به پلیس اطلاع خواهم داد تا تو را دستگیر بکنند."),
    ("-------------- guest who they invited was from -------------. He was a famous athlete.",
     ["A / the German", "The / Germany", "A / the Germany", "The / German"], 1,
     "مهمانی که آنها دعوت کردند اهل کشور آلمان بود . او یک ورزشکار مشهور بود."),
    ("The police ------------ still looking into the murder. They believe they can catch ------------ killer soon.",
     ["is / the", "are / a", "is / a", "are / the"], 3,
     "پلیس هنوز دارد درباره آن قتل تحقیق می کند. آنها معتقدند که می توانند قاتل را به زودی پیدا بکنند."),
    ("Since the creation, there have been a lot of ---------------- on the earth who have had different traditions and --------------- too.",
     ["peoples / beliefs", "people / believes", "persons / beliefs", "peoples / believes"], 0,
     "از آغاز هستی اقوام زیادی روی زمین بوده اند که سنت ها و اعتقادات مختلفی داشته اند."),
    ("A: “Jane, we haven’t watered ----------------- flowers for a long period of time”  B: “Ok, I --------------- them very soon”.",
     ["the / am going to water", "the / will water", "_ / am going to water", "_ / will water"], 1,
     "الف: جین، مدت طولانی است که گل ها را آب نداده ایم . ب:باشه، به زودی آنها را آب می دهم."),
    ("A: “Excuse me sir, how much is this -----------------?”  B: “It’s 100 thousand -------------------.”",
     ["knife / toman", "knife / tomans", "knives / toman", "knives / tomans"], 1,
     "الف: ببخشید آقا قیمت این چاقو چقدر است؟ ب: قیمت آن صد هزار تومان است."),
    ("A: “Sahar, would you please drop me off next to --------- confectionary shop? I ------------ some sweet.”  B: “Yeah, sure.”",
     ["that / will buy", "these / am going to buy", "the / am going to buy", "a / will buy"], 2,
     "سحر، میشه لطفا کنار آن مغازه شیرفروشی من را پیاده کنی؟ می خواهم کمی شیرینی بخرم."),
    ("The accident happened --------------- hour ago. --------------- were taken to hospital immediately.",
     ["a / The injured people", "an / Injured people", "a / Injured people", "an / The injured people"], 3,
     "تصادف یک ساعت قبل اتفاق افتاد. مصدومان را فورا به بیمارستان بردند."),
    ("--------------- shops of our city will be closed tomorrow, and it lasts for two ------------------.",
     ["The / weeks", "_ / weeks", "The / week", "_ / week"], 0,
     "مغازه های شهر ما فردا بسته خواهند شد و این تعطیلی تا دو هفته طول خواهد کشید."),
    ("Two of the ---------------- were devoured by ---------------- hungry wolf.",
     ["a / sheeps", "sheep / two", "sheep / a", "sheeps / those"], 2,
     "دو راس از گوسفندان توسط یک گرگ گرسنه بلعیده شدند."),
    ("Those people standing in --------------- are impatient with the long queue.",
     ["lines", "a line", "an line", "line"], 3,
     "آن افرادی که در صف ایستاده اند از صف بی تاب و بی حوصله شده اند."),
    ("A: “Where are you going?”  B: “I ------------- my coat from the cleaner’s. Is there anything I can do for you?” (ریاضی ۹۴)",
     ["am going to pick up", "am picking up", "would pick up", "pick up"], 0,
     "الف: کجا داری می روی ؟ ب: قصد دارم کتم را از خشکشویی بگیریم. کاری هست که بتونم برای تو انجام بدهم؟"),
    ("Helen is such a good English teacher that I’m sure you --------------- be happy with her. (تجاری ۹۴)",
     ["were going to", "would", "may", "will"], 3,
     "هلن یک معلم خیلی خوب انگلیسی است که من مطمئنم تو از او راضی خواهی بود."),
]

PRINT_QUIRKS = [
    "سربرگِ آزمونِ ص۷۲: «تست گرامر و نگارش \"درس اول - پایه دهم\"» + «سطح تستها: \"استاندارد\" - \"متوسط\" (پاسخنامه صفحه ۲۵۴ تا ۲۵۷)» — لایه ارقام را «254 257» بهم‌ریخته داده بود؛ رندر ۲۴۰۰dpi حاکم",
    "سربرگِ کلیدِ ص۲۵۴ تمیز است: «پاسخنامه تشریحی تستهای گرامر \"درس اول - پایه دهم\" — بخش: \"دوم\" (سؤالات: صفحه ۷۲ تا ۷۴)» — برخلافِ «دستگری» ص۲۴۹ (r330) این سربرگ واژهٔ تحریف‌شده ندارد؛ لایه «72 4 7» نویز",
    "Q2 ترجمه: «خداحافیط» با ف و ط — تحریفِ چاپیِ «خداحافظی» (۳۰۰۰dpi عین چاپ) + «واقعا؟من» بدون فاصله پس از علامت سؤال",
    "Q3 ساقه: گیومهٔ نامتوازن — «A: “Ahmad’s …» بسته نمی‌شود و B هم با «“Yes» آغاز می‌شود؛ ترجمه: «بوده است.\"» گیومهٔ درونی + «ب:آره» بدون فاصله",
    "Q4 ساقه: «she----------------» خط‌تیره‌ها چسبیده به she",
    "Q5 ترجمه: «میز را» (لایه «میر» و «را» را حذف کرده بود — رندر ۳۰۰۰dpi حاکم) + «ب:بله. حتما.» دونقطه چسبیده و دو جملهٔ کوتاه",
    "Q8 ساقه: B با «soon”.» می‌شود — گیومه سپس نقطه",
    "Q9 ساقه: «for two day,» — day مفرد (عین چاپ، رندر ۲۲۰۰dpi)",
    "Q11 ساقه: «A:’» آپاستروف به‌جای گیومه (رندر حاکم) + B گیومهٔ باز بدون بستن؛ ترجمه: «به خرید بروم.\"»",
    "Q13 ترجمه: «جک،آرام» — ویرگول از هر دو طرف چسبیده، بدون فاصله (۳۰۰۰dpi)",
    "Q14 ساقه: «--------------the» خط‌تیره‌ها چسبیده به the + «day”?” + «6:30”.” — گیومه بیرون از علامت‌ها؛ ترجمه: «شش و نیم .» فاصله پیش از نقطه",
    "Q18 ترجمه: «چیزها» جمع (لایه «چیر» ناقص)",
    "Q20 ترجمه: «کاوو» تحریفِ چاپیِ «کارو» (رندر ۳۰۰۰dpi — و، نه ر) + «چور» عینِ چاپ برای «چطور» + «الف:کاوو» دونقطه چسبیده",
    "Q21 ترجمه: «میشود» و «میبرد» چسبیده + نقطهٔ پایان سیاه‌رنگ (متفاوت از متنِ آبی) با گیومهٔ بالارفته — ۹۰۰۰dpi",
    "Q22 ترجمه: «هستند . آنها» فاصله پیش از نقطه + «مشغول» و «حاضر» در لایه غایب بودند (رندر ۳۰۰۰dpi حاکم)",
    "Q24 گزینه‌ها: «wolves/are» بدون فاصله دورِ اسلش ولی گزینهٔ d «wolfs / are» با فاصله — ناهماهنگیِ خودِ چاپ",
    "Q25 ترجمه: «بر می گشتیم» سه‌واژه‌ای (میِ واقعی — لایه «یم» جابه‌جا) + «وقتی» (لایه «وقت» ی را حذف کرده بود)",
    "Q26 ساقه: «A:”» گیومه پس از دونقطه + «they”?” گیومه میان they و ? + دو جای خالی (few---/moral---)؛ ترجمه: «می گوب.» تحریفِ چاپیِ «می گویی/گویید» (۶۰۰۰dpi عین چاپ) + «,مگر» ویرگول چسبیده + «الف:امروزه» دونقطه چسبیده",
    "Q27 گزینه‌های b/c با نقطهٔ فاصله‌دار «water .» و «Tuesday .» + CORRECT ایتالیک زیرخط‌دار؛ ترجمهٔ گزینه‌ها: «دایی» (لایه «داب»)، «ماهی (آزاد)» (لایه «مایه»)، «دو پس» و «پسها» بدون ر (خانوادهٔ تحریفِ r330-Q3)، «کرده.» (لایه «کرد»)",
    "Q29 ساقه: جای خالی نخست «-------------- guest» — بدون The چاپی؛ ترجمه: «مهمانی» (لایه «مهمان» ی را حذف کرده بود) + «بود . او» فاصله پیش از نقطه",
    "Q32 ترجمه: «جین،» (لایه «جیر») + «مدت طولانی است» (لایه «طولانی» را حذف کرده بود) + «نداده ایم .» فاصله پیش از نقطه + «ب:باشه،» دونقطه چسبیده؛ گزینه‌ها با «the» کوچک و «_» برای حرف تعریف خالی",
    "Q33 ساقه: «Excuse me sir,» بدون ویرگول پس از me + «this -----------------?”» علامت سؤال درون گیومه",
    "Q34 ترجمه: بدون «الف:» آغازین — مستقیم «سحر،» + «شیرفروشی» و «شیرینی» (لایه «شیر بخرم» ناقص) + «پیاده کنی؟» (لایه «کنی» را حذف کرده بود)",
    "Q35 ترجمه: «مصدومان» (لایه «مصدومان را فورا» کامل)",
    "Q36 ترجمه: «تعطیلی» تک‌ی (لایه «تعطییل» نویز)؛ گزینه‌ها با «The» بزرگ و «_» خالی",
    "Q38 توضیحِ کلید: «( in line به معنای درصف )» — «درصف» چسبیده؛ ترجمه: «بی تاب و بی حوصله» (لایه «ب تاب» ی حذف‌شده)",
    "Q39 ترجمه: «می روی ؟» فاصله پیش از علامت سؤال + «بگیریم» به‌جای «بگیرم» (عین چاپ ۳۰۰۰dpi) + «خشکشویی» (لایه «خشکشوب»)؛ برچسب قرمز «(ریاضی ۹۴)» با رقم فارسی (لایه «ریاض 94»)",
    "Q40 برچسب قرمز «(تجاری ۹۴)» (لایه «تجرت» نویز — رندر ۲۴۰۰dpi حاکم)؛ ترجمه با «هلن» آغاز می‌شود (لایه غایب) + «راضی خواهی بود» (لایه «راض خوایه» ناقص)",
    "Q31 گزینه‌ها به سبک «a.» نقطه‌دار می‌آیند (تا Q30 سبک «a)») — تغییرِ سبکِ چاپ در میانهٔ آزمون؛ استثناهای roof/belief در توضیحِ کلید",
    "جعبهٔ اصطلاحِ پس از Q40: «اصطلاح به کار رفته در تست فوق توجه بکنید: To be happy with sb — از دست کسی راضی بودن:» — ترتیبِ وارونهٔ چاپی حفظ شد",
    "Note خالیِ خط‌چین در پایین ص۷۴ (جعبهٔ خالی)؛ جداسازِ خط‌چینِ قرمز پیش از Q39",
]

RECEIPT = {
    "exam": "تست گرامر و نگارش درس اول — استاندارد/متوسط (سؤالات: ص۷۲ تا ۷۴)",
    "header": "تست گرامر و نگارش «درس اول - پایه دهم» — سطح تستها: «استاندارد» - «متوسط» (پاسخنامه صفحه: ۲۵۴ تا ۲۵۷) — ۴۰ MCQ",
    "keyPages": "254-257",
    "keyVerification": "print key pp254-257 «پاسخنامه تشریحی تستهای گرامر — درس اول - پایه دهم، بخش: دوم (سؤالات: صفحه ۷۲ تا ۷۴)» — 40/40 agree with semantic pre-fill (هر مدخل: گزینه + شیوهٔ حل + ترجمهٔ چاپی), zero divergence; Q13=د و Q32=ب با کلید چاپ حاکم شدند",
    "extractedRound": "r332",
    "pattern": "r330 (کلیدِ توضیح‌دار + ترجمهٔ چاپی) + r328 (ترجمه‌محور) + r321 (عین چاپ + اندازه‌گیریِ گپ)",
    "translations": "۴۰ ترجمهٔ چاپی «ترجمه:» تزریق شد؛ ~۳۰ نقطهٔ سرنوشت‌ساز با زوم ۲۲۰۰-۹۰۰۰dpi داوری شد (فهرست کوئیرک‌ها)",
    "printQuirks": PRINT_QUIRKS,
}

data = json.loads(PATH.read_text(encoding="utf-8"))

existing = [l for l in data["lessons"] if l["lesson"] == 25]
if existing:
    print(f"lesson 25 already present ({existing[0]['count']} items) — NO-OP")
else:
    assert len(data["lessons"]) == 24, f"baseline mismatch: {len(data['lessons'])} banks"
    questions = [
        {
            "id": f"g10-l25-{i + 1}",
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
        "lesson": 25,
        "title": "استاندارد/متوسط — تست گرامر و نگارش درس اول (ص۷۲-۷۴)",
        "level": "استاندارد/متوسط — چهارگزینه‌ای",
        "count": len(questions),
        "questions": questions,
    }
    data["lessons"].append(bank)
    data["source"]["gram3"] = RECEIPT
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["count"] for l in data["lessons"])
    print(f"added lesson 25: {bank['count']} items → banks={len(data['lessons'])}, total={total}")
