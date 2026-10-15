#!/usr/bin/env python3
# r225 — splice the new bg-infinitive topic (g11 p97-99, the booklet's own
# 12 کاربرد + 7 نکته teaching section) into src/data/booklet-grammar.ts,
# after bg-ed-ing-adjectives (the booklet's own TOC puts مصدر با to under
# درس سوم's grammar, L822-856 of g11.txt). Also:
#   • LESSON_BG_LINKS[3] grows 2→3 (first-conditional, ed-ing, infinitive)
#   • the attribution comment gains the TOC evidence line
F = "/home/z/my-project/src/data/booklet-grammar.ts"
src = open(F).read()

TOPIC = '''  // ================================================ یازدهم — p۹۷-۹۹ (راند ۲۲۵)
  // فهرستِ خودِ جزوه، «مصدر با to» را در زیربخشِ گرامرِ درس سوم می‌گذارد
  // (g11.txt L822-856) — سومین گرامرِ درس سه پس از شرطی نوع اول و ed/ing.
  // دو MCQِ بخشِ ۷ آزمونِ جامع (ص۱۱۰، کلید ص۲۰۱§۷-۳/۴) که راند ۲۱۷ چون
  // کارتِ مصدری وجود نداشت صادقانه حذفش کرده بود، حالا به کارتِ خودشان
  // می‌پیوندند؛ جمله‌سازیِ پارک‌شدهٔ راند ۲۱۹ هم (۹ آیتمِ ص۱۰۲§۵ + ۱ آیتمِ
  // ص۱۱۰§۸-۱) با کلیدهای ص۱۹۷§۵ و ص۲۰۱§۸ فرود می‌آید.
  {
    id: "bg-infinitive",
    source: "یازدهم",
    title: "مصدر با to",
    titleEn: "Infinitive",
    page: "صفحهٔ ۹۷ تا ۹۹",
    intro:
      "تعریف: چنانچه شکل ساده یا ریشهٔ فعل، علامت مصدری «to» بگیرد، تبدیل به «مصدر با to» می‌شود: to swim شنا کردن، to see دیدن، to study مطالعه کردن، to play بازی کردن، to meet ملاقات کردن، to go رفتن، to walk قدم زدن، to work کار کردن. کاربردهای این ساختار در جمله دوازده مورد است که هر دوازده با مثالِ خودِ جزوه در ادامه آمده است.",
    notes: [
      "کاربرد اول — در حالت عادی (به غیر از فعل‌های استثنای درس دوم پایهٔ یازدهم که بعد از آنها فعل ing‌دار یا اسم مصدر می‌آید)، چنانچه جمله‌ای دارای دو فعل باشد، معمولاً فعل دوم جمله به صورت «مصدر با to» خواهد بود؛ در این حالت فعل دوم در نقش «مفعول» برای فعل اول عمل می‌کند: She decided to learn Spanish carefully. — او تصمیم گرفت تا اسپانیایی را به دقت یاد بگیرد.",
      "نکتهٔ مهمِ کاربرد اول — در این حالت، تمامی تغییرات زمانی تنها بر روی «فعل اول» جمله روی خواهد داد و همواره فعل دوم بدون تغییر (به صورت مصدر با to) باقی خواهد ماند: She decides to learn Spanish carefully. — او تصمیم می‌گیرد تا اسپانیایی را به دقت یاد بگیرد. / She has decided to learn Spanish carefully. — او تصمیم گرفته است تا اسپانیایی را به دقت یاد بگیرد.",
      "کاربرد دوم — چنانچه بعد از کلمات استفهامیِ Wh‌دار، بلافاصله فعلی بیاید، آن فعل همواره به صورت «مصدر با to» خواهد بود: I don’t know where to buy a nice shirt. — من نمی‌دانم در کجا یک پیراهن قشنگ بخرم.",
      "کاربرد سوم — بعد از صفات، چنانچه فعلی بیاید، آن فعل همواره به صورت «مصدر با to» خواهد بود: He was very careful to look both ways when he crossed the street. — او خیلی مواظب بود که به هر دو طرف، هنگام عبور کردن از خیابان، نگاه کند. (جدولِ صفاتِ پرکاربردِ بعد از مصدر با to، پایین.)",
      "کاربرد چهارم — در ساختار بسیار مهم زیر، فعل همواره به صورت «مصدر با to» خواهد بود: It + فعل to be + صفت + (for + مفعول) + مصدر با to: It was really difficult for my students to answer all the questions correctly. — برای دانش‌آموزانم واقعاً سخت بود که به همهٔ سؤالات به درست پاسخ بدهند.",
      "کاربرد پنجم — در ابتدای جمله (در نقش فاعل) می‌توان علاوه بر «اسم مصدر»، فعل را به صورت «مصدر با to» هم به کار برد: To learn a foreign language isn’t difficult. — یاد گرفتن یک زبان خارجی سخت نیست. / To ride a horse can be interesting. — اسب‌سواری کردن می‌تواند جالب باشد.",
      "توجهِ مهم (کاربرد پنجم) — در زبان انگلیسی بیشتر به جای مصدر با to در ابتدای جمله، اولویت با «اسم مصدر» (فعل ing‌دار) می‌باشد: Learning a foreign language isn’t difficult. / Riding a horse can be interesting.",
      "کاربرد ششم — برای بیان مقصد و منظور (هدف) از «مصدر با to» استفاده می‌کنیم: She goes to the library to study her books there. — او معمولاً به کتابخانه می‌رود برای مطالعه کردن کتاب‌هایش. / My father borrowed some money to buy that house. — پدرم کمی پول قرض کرد برای خریدن آن خانه.",
      "کاربرد هفتم — بعد از قید «too» به معنی «بیش از حد» یا «خیلی» چنانچه فعلی بیاید، آن فعل به صورت «مصدر با to» خواهد بود. در این ساختار بلافاصله بعد از too «صفت» می‌آید (در این حالت too به تنهایی جمله را منفی می‌کند): That table was too heavy (for him) to move. — آن میز برای او بیش از حد سنگین بود که جابجا کند.",
      "کاربرد هشتم — بعد از enough به معنی «کافی» یا «به اندازهٔ کافی» چنانچه فعلی بیاید، آن فعل به صورت «مصدر با to» خواهد بود. در این ساختار بلافاصله بعد از enough «اسم» می‌آید: Raman doesn’t have enough money to buy that bicycle. — رامان پول کافی برای خریدن آن دوچرخه ندارد.",
      "کاربرد نهم — به عنوان متمم فاعل می‌توان هم از «اسم مصدر» و هم از «مصدر با to» استفاده کرد: My favorite hobby is reading novels. = My favorite hobby is to read novels. (دو جملهٔ بالا دقیقاً بیانِ مجددِ نکتهٔ شمارهٔ ۵ می‌باشد: Reading novels is my favorite hobby. = To read novels is my favorite hobby.)",
      "کاربرد دهم — چنانچه بعد از ساختار «جملات مجهول» فعل دیگری بیاید، آن فعل همواره به صورت «مصدر با to» خواهد بود (در درس اول پایهٔ دوازدهم به طور مفصل با ساختار جملات مجهول آشنا خواهیم شد): They were forced to leave the class quickly. — آنها مجبور شدند که فوراً کلاس را ترک کنند.",
      "کاربرد یازدهم — چنانچه بعد از «مرتبت اعداد» (the first, the second, the third, the last, ...) فعلی بیاید، آن فعل به صورت «مصدر با to» خواهد بود: Alfred is always the last student to come to class. — آلفرد همیشه آخرین نفری است که به کلاس می‌آید.",
      "کاربرد دوازدهم — چنانچه بعد از «the only» و «صفات عالی» فعلی بیاید، آن فعل به صورت «مصدر با to» خواهد بود: That dress is the best choice to wear at the party. — آن لباس بهترین انتخاب برای پوشیدن در مهمانی است. / He was the only one to reach the mountain peak. — او تنها نفری بود که به قلهٔ کوه رسید.",
      "نکتهٔ ۱ — برای منفی کردن مصدر با to باید قبل از علامت مصدری to قید منفی‌ساز not را اضافه کنیم: The students promised not to make a lot of mistakes. — دانش‌آموزان قول دادند که اشتباهات زیادی نکنند.",
      "نکتهٔ ۲ — مواظب باشیم که حرف اضافهٔ to به معنی «به» که قبل از اسم به کار برده می‌شود را با علامت مصدری to که قبل از شکل سادهٔ فعل می‌آید اشتباه نگیریم: I want to tell you something about my plan. — می‌خوام چیزی را در مورد برنامه‌ام به تو بگویم. / They usually go to school by bus. — آنها معمولاً با اتوبوس به مدرسه می‌روند.",
      "نکتهٔ ۳ — بعد از «would like» به معنی «مایل بودن»، فعل دوم به صورت «مصدر با to» خواهد بود: I would like to drink a cup of tea. — من مایلم یک فنجان چای بنوشم.",
      "نکتهٔ ۴ (زبان تخصصی) — برای بیان مقصد و منظور می‌توان از «in order to» و «so as to» به معنی «به منظور» یا «تا اینکه» هم استفاده کرد که بعد از آنها «شکل سادهٔ فعل» می‌آید: Yesterday, he went to the library in order to / so as to study his lessons there. — دیروز او به کتابخانه رفت تا اینکه در آنجا درس‌هایش را بخواند.",
      "نکتهٔ ۵ (زبان تخصصی) — برای بیان مقصد و منظور می‌توان از «so that» و «in order that» به معنی «به منظور» یا «تا اینکه» هم استفاده کرد که بعد از آنها «یک جملهٔ کامل با افعال ناقص» می‌آید: Yesterday, she went to the library so that / in order that she could study her lessons there.",
      "نکتهٔ ۶ (زبان تخصصی) — بعد از افعال make (مجبور کردن)، help (کمک کردن) و let (اجازه دادن) فعل دوم به صورت «شکل ساده» می‌آید: The teacher didn’t let the students speak at the class. — معلم به دانش‌آموزان اجازه نداد که در کلاس صحبت کنند.",
      "توجه‌های نکتهٔ ۶ — ۱) بعد از فعل help، فعل دوم هم به صورت «مصدر با to» و هم به صورت «شکل ساده» خواهد آمد: Raman helped me repair / to repair my car. — رامان به من کمک کرد تا ماشینم را تعمیر کنم. ۲) فعل make چنانچه به معنی «ساختن» یا «درست کردن» باشد، فعل دوم به صورت «مصدر با to» و در صورتی که به معنی «مجبور کردن» باشد، فعل دوم به صورت «شکل ساده» خواهد آمد.",
      "نکتهٔ ۷ (زبان تخصصی) — بعد از افعال جدولِ پایین، فعل دوم هم به صورت «مصدر با to» و هم به صورت «اسم مصدر» خواهد آمد. دو مثالِ stop: Fortunately, my father stopped smoking. — خوشبختانه پدرم سیگار کشیدن را متوقف کرد (توقف برای همیشه). / I stopped (for a minute) to buy a newspaper. — (برای یک دقیقه) توقف کردم تا یک روزنامه بخرم (توقف موقت).",
    ],
    tables: [
      {
        // جدولِ کاربرد سوم — صفاتِ پرکاربرد بعد از مصدر با to (ص۹۸)
        // ترمیم‌های سوپِ استخراج (متدِ راند ۲۲۲ — جفت‌سازیِ خطیِ ستون‌های RTL):
        // «تی دقت»→بی‌دقت (جابه‌جاییِ نقطهٔ ب/ت)، «سف أ مت»→متأسف،
        // «غمگئر»→غمگین (دو خانه)، «مطمئ»→مطمئن، «شر منده»→شرمنده
        headers: ["صفت", "معنی"],
        rows: [
          ["careless", "بی‌دقت"],
          ["sorry", "متأسف"],
          ["happy", "خوشحال"],
          ["afraid", "ترسیده"],
          ["forbidden", "ممنوع"],
          ["safe", "امن - ایمن"],
          ["glad", "خوشحال"],
          ["anxious", "نگران"],
          ["surprised", "متعجب"],
          ["suitable", "مناسب"],
          ["lucky", "خوش شانس"],
          ["good", "خوب"],
          ["easy", "آسان"],
          ["proud", "مغرور"],
          ["important", "مهم"],
          ["sad = unhappy", "غمگین"],
          ["careful", "مراقب"],
          ["certain = sure", "مطمئن"],
          ["fortunate", "خوش شانس"],
          ["dangerous", "خطرناک"],
          ["upset", "غمگین"],
          ["ready", "آماده"],
          ["amazed", "هیجان‌زده"],
          ["ashamed", "شرمنده"],
          ["willing", "مشتاق"],
          ["difficult", "سخت - مشکل"],
          ["hard", "سخت"],
        ],
      },
      {
        // جدولِ نکتهٔ ۷ — افعالی که هر دو شکل را می‌پذیرند (ص۹۹)
        headers: ["فعل", "معنی"],
        rows: [
          ["like", "دوست داشتن"],
          ["prefer", "ترجیح دادن"],
          ["stop", "متوقف کردن"],
          ["love", "دوست داشتن"],
          ["intend", "مایل بودن"],
          ["need", "نیاز داشتن"],
          ["hate", "متنفر بودن"],
          ["remember", "به یاد آوردن"],
          ["continue", "ادامه دادن"],
          ["begin", "شروع کردن"],
          ["start", "شروع کردن"],
          ["forget", "فراموش کردن"],
        ],
      },
    ],
    examples: [
      { en: "She decided to learn Spanish carefully.", fa: "او تصمیم گرفت تا اسپانیایی را به دقت یاد بگیرد.", tag: "کاربرد اول — فعل دوم در نقش مفعول" },
      { en: "She has decided to learn Spanish carefully.", fa: "او تصمیم گرفته است تا اسپانیایی را به دقت یاد بگیرد.", tag: "تغییر زمان فقط روی فعل اول (حال کامل)" },
      { en: "I don’t know where to buy a nice shirt.", fa: "من نمی‌دانم در کجا یک پیراهن قشنگ بخرم.", tag: "کاربرد دوم — بعد از کلمات استفهامی Wh" },
      { en: "He was very careful to look both ways when he crossed the street.", fa: "او خیلی مواظب بود که به هر دو طرف، هنگام عبور کردن از خیابان، نگاه کند.", tag: "کاربرد سوم — بعد از صفات" },
      { en: "It was really difficult for my students to answer all the questions correctly.", fa: "برای دانش‌آموزانم واقعاً سخت بود که به همهٔ سؤالات به درست پاسخ بدهند.", tag: "کاربرد چهارم — It + to be + صفت + (for + مفعول)" },
      { en: "That table was too heavy (for him) to move.", fa: "آن میز برای او بیش از حد سنگین بود که جابجا کند.", tag: "کاربرد هفتم — بعد از too" },
      { en: "Raman doesn’t have enough money to buy that bicycle.", fa: "رامان پول کافی برای خریدن آن دوچرخه ندارد.", tag: "کاربرد هشتم — بعد از enough" },
      { en: "They were forced to leave the class quickly.", fa: "آنها مجبور شدند که فوراً کلاس را ترک کنند.", tag: "کاربرد دهم — بعد از ساختار مجهول" },
      { en: "Alfred is always the last student to come to class.", fa: "آلفرد همیشه آخرین نفری است که به کلاس می‌آید.", tag: "کاربرد یازدهم — بعد از مرتبت اعداد" },
      { en: "The students promised not to make a lot of mistakes.", fa: "دانش‌آموزان قول دادند که اشتباهات زیادی نکنند.", tag: "نکتهٔ ۱ — منفی کردن با not قبل از to" },
    ],
    drill: [
      // آزمونِ جامعِ درس سوم، بخشِ ۷ (ص۱۱۰) — دو سؤالِ مصدرِ حذف‌شدهٔ راندهٔ ۲۱۷ (بدونِ کارتِ موضوع) · کلید: پاسخنامهٔ خودِ جزوه، ص۲۰۱§۷
      { q: "They try ------------------------------- the building in a few weeks.", options: ["completed", "completing", "complete", "to complete"], answer: 3 },
      { q: "My father asked me ------------------------------- about my future plans.", options: ["don’t speak", "to not speak", "not to speak", "not speak"], answer: 2 },
    ],
    orderDrill: [
      // آزمون تشخیصی درس سوم، بخشِ ۵ «مربوط به بخش مصدر» (ص۱۰۲) · کلید: پاسخنامهٔ ص۱۹۷§۵
      // ناسازگاریِ درونیِ خودِ جزوه: کلیدِ §۵ ده سطر دارد ولی سؤالِ دهم در ص۱۰۲ نیست — فقط ۹ جفتِ سؤال↔کلید استخراج شد.
      { q: "eat / do / breakfast / want / for / you / to / what?", task: "با استفاده از کلمات داده شده جمله بسازید. (مربوط به بخش مصدر)", answer: "What do you want to eat for breakfast?" },
      { q: "son / new / buy / for / a / he / to / car / agreed / his.", answer: "He agreed to buy a new car for his son." },
      { q: "expected / hard / the teacher / study / me / to.", answer: "The teacher expected me to study hard." },
      { q: "in / it / dangerous / the pool / to swim / not / is.", answer: "It is not dangerous to swim in the pool." },
      { q: "is / everyone / very / to / for / smoke / bad.", answer: "To smoke is very bad for everyone." },
      { q: "a / difficult / can / to learn / language / be / foreign.", answer: "To learn a foreign language can be difficult." },
      { q: "decided / the / we / sell / house / have / old / to.", answer: "We have decided to sell the old house." },
      { q: "for / to have / I / eggs / breakfast / like / would.", answer: "I would like to have eggs for breakfast." },
      { q: "in time / duty / the work / is / to finish / it / your.", answer: "It is your duty to finish the work in time." },
      // آزمونِ جامعِ درس سوم، بخشِ ۸ (ص۱۱۰) — سؤالِ اولِ مصدر (سؤالِ دومِ همان بخش شرطی است و در راند ۲۱۹ به کارتِ شرطی پیوست) · کلید: پاسخنامهٔ ص۲۰۱§۸
      { q: "football / not / him / play / in / I / to / the yard / told.", task: "با هر گروه از کلمات زیر یک جملهٔ کامل بسازید.", answer: "I told him not to play football in the yard." },
    ],
  },
'''

ANCHOR = "  // ================================================ دوازدهم — p۲۶-۲۷"
assert src.count(ANCHOR) == 1, "anchor not unique"
src = src.replace(ANCHOR, TOPIC + ANCHOR)

# 2) LESSON_BG_LINKS[3] grows + attribution comment gains the TOC evidence
OLD_LINKS = '  3: ["bg-first-conditional", "bg-ed-ing-adjectives"],'
NEW_LINKS = '  3: ["bg-first-conditional", "bg-ed-ing-adjectives", "bg-infinitive"],'
assert src.count(OLD_LINKS) == 1
src = src.replace(OLD_LINKS, NEW_LINKS)

OLD_DOC = " *  - یازدهم: آزمون‌های تشخیصیِ «آزمون تشخیصی گرامر درس اول/دوم/سوم» (ص۲۹/۶۳/۱۰۰\n *    با کلیدهای ص۱۷۹/ص۱۸۷/ص۱۹۶) هر موضوع را به درسِ خودش گره زده‌اند."
NEW_DOC = (" *  - یازدهم: آزمون‌های تشخیصیِ «آزمون تشخیصی گرامر درس اول/دوم/سوم» (ص۲۹/۶۳/۱۰۰\n"
           " *    با کلیدهای ص۱۷۹/ص۱۸۷/ص۱۹۶) هر موضوع را به درسِ خودش گره زده‌اند؛\n"
           " *    «مصدر با to» (راند ۲۲۵) با شاهدِ فهرستِ خودِ جزوه — زیربخشِ گرامرِ درس\n"
           " *    سوم (g11.txt L822-856، بینِ گرامرها و آزمونِ تشخیصیِ درس سه).\n")
assert src.count(OLD_DOC) == 1
src = src.replace(OLD_DOC, NEW_DOC)

open(F, "w").write(src)
print("spliced OK")
