# -*- coding: utf-8 -*-
# r199: inject 5 vocab-konkuri quizzes (k11..k15) into lessons 1-9 — grounded in
# the uploaded comprehensive booklets (11th -> lessons 1-3, 12th -> 4-6, 10th -> 7-9).
import re

ITEMS = {
 1: [
  ('l1-k11', "She has a good deal of ---------------- as an ice skater and wins a lot of prizes in the competitions every year.", ["access", "ability", "experience", "image"], 2, "او به‌عنوان یک اسکیت‌باز تجربهٔ خوبی دارد و هر سال در مسابقات جوایز زیادی می‌برد."),
  ('l1-k12', "Jim knew ---------------- nothing about the business when he joined the company.", ["absolutely", "fluently", "frequently", "wrongly"], 0, "جیم وقتی به شرکت پیوست هیچ‌چیزِ درباریِ این کار نمی‌دانست."),
  ('l1-k13', "The ability to give clear ---------------- is the most important quality of an ideal teacher.", ["experiences", "suggestions", "combinations", "explanations"], 3, "تواناییِ دادنِ توضیحِ روشن مهم‌ترین ویژگیِ یک معلمِ آرمانی است."),
  ('l1-k14', "It's in the underdeveloped eastern ---------------- of the country that the biggest problems exist.", ["region", "continent", "villages", "plains"], 0, "بزرگ‌ترین مشکلات در منطقهٔ شرقیِ کمترتوسعه‌یافتهٔ کشور وجود دارد."),
  ('l1-k15', "The police managed to gain ---------------- to the roof through an upstairs window.", ["ability", "habit", "mission", "access"], 3, "پلیس توانست از راهِ پنجرهٔ طبقهٔ بالا به پشت‌بام دسترسی پیدا کند."),
 ],
 2: [
  ('l2-k11', "She provided ---------------- support at a very distressing time for me.", ["emotional", "cultural", "balanced", "depressed"], 0, "او در زمانِ بسیار ناراحت‌کننده‌ای برای من حمایتِ عاطفی ارائه داد."),
  ('l2-k12', "I was ---------------- at the thought of all the hard work ahead of me in that hard time.", ["confused", "depressed", "influenced", "balanced"], 1, "با فکرِ همهٔ کارِ سختِ پیشِ رو در آن دورانِ سخت، افسرده بودم."),
  ('l2-k13', "Some studies have shown the benefits of a vegetarian ---------------- on people's health and longer life.", ["habit", "limit", "diet", "serving"], 2, "برخی پژوهش‌ها فوایدِ رژیمِ گیاهی را بر سلامتی و عمرِ طولانی‌تر نشان داده‌اند."),
  ('l2-k14', "She knew it probably wasn't necessary anymore, but old ---------------- die hard.", ["limits", "missions", "miracles", "habits"], 3, "می‌دانست دیگر لازم نیست، اما عادت‌های قدیمی به‌سختی از بین می‌روند."),
  ('l2-k15', "In mental illnesses, there is a complex relationship between cause and ----------------.", ["effect", "habit", "limit", "miracle"], 0, "در بیماری‌های روانی، رابطهٔ پیچیده‌ای بین علت و اثر وجود دارد."),
 ],
 3: [
  ('l3-k11', "In a trip to Isfahan, my father has bought a ---------------- pot for my sister. It looks really beautiful.", ["satisfied", "decorative", "available", "harmful"], 1, "در سفری به اصفهان، پدرم یک ظرفِ تزئینی برای خواهرم خرید؛ واقعاً زیباست."),
  ('l3-k12', "After finishing my exam, my teacher seemed ---------------- with my progress.", ["moral", "handmade", "satisfied", "available"], 2, "بعد از تمام شدنِ امتحانم، معلمم از پیشرفتم راضی به نظر می‌رسید."),
  ('l3-k13', "A lot of Iranian craftswomen have great skill to ---------------- a basket from some plants.", ["reflect", "promise", "weave", "expect"], 2, "بسیاری از صنعتگرانِ ایرانی مهارتِ عالی برای بافتنِ سبد از گیاهان دارند."),
  ('l3-k14', "In our country Iran, it is the ---------------- for many people to celebrate New Year.", ["material", "custom", "range", "beauty"], 1, "در کشورمان ایران، جشن گرفتنِ سالِ نو رسمِ بسیاری از مردم است."),
  ('l3-k15', "There is a 25 percent ---------------- on all clothes until the end of the week.", ["relationship", "discount", "interest", "meaning"], 1, "تا آخر هفته ۲۵ درصد تخفیف روی همهٔ لباس‌ها هست."),
 ],
 4: [
  ('l4-k11', "Their first ---------------- to climb Everest ended in failure.", ["test", "attempt", "temperature", "exercise"], 1, "اولین تلاشِ آن‌ها برای فتحِ اورست به شکست انجامید."),
  ('l4-k12', "As parents, it's our moral duty to teach our children to ---------------- other people's opinions.", ["produce", "honor", "power", "burst"], 1, "به‌عنوانِ پدر و مادر، وظیفهٔ اخلاقی‌مان این است که به بچه‌ها یاد بدهیم به نظرِ دیگران احترام بگذارند."),
  ('l4-k13', "It is surely the ---------------- of the wealthy members of the society to help those who are economically weak.", ["duty", "matter", "point", "case"], 0, "قطعاً وظیفهٔ اعضای ثروتمندِ جامعه است که به تنگ‌دست‌ها کمک کنند."),
  ('l4-k14', "It was a great job to do and you helped me a lot. I really don't know how to ---------------- you.", ["hate", "describe", "appreciate", "burst"], 2, "کارِ بزرگی بود و خیلی کمکم کردی؛ واقعاً نمی‌دانم چطور از تو قدردانی کنم."),
  ('l4-k15', "After they had taken my brother to hospital, I tried to say how ---------------- we all were for his great help.", ["shameful", "cruel", "peaceful", "grateful"], 3, "وقتی برادرم را به بیمارستان بردند، سعی کردم بگویم همه‌مان برای کمکِ عظیمش چقدر قدردانیم."),
 ],
 5: [
  ('l5-k11', "My family doctor ---------------- that I should take more exercise and stop smoking to get better.", ["forgot", "recommended", "expanded", "chose"], 1, "پزشکِ خانوادگی‌مان توصیه کرد برای بهتر شدن بیشتر ورزش کنم و سیگار را کنار بگذارم."),
  ('l5-k12', "If my parents set off early tomorrow morning, they will ---------------- most of the traffic.", ["decide", "avoid", "meet", "face"], 1, "اگر پدر و مادرم فردا صبح زود راه بیفتند، بیشترِ ترافیک را از خودشان دور می‌کنند."),
  ('l5-k13', "Education and training are the most ---------------- means of improving a nation's culture.", ["wonderful", "symbolic", "lingual", "effective"], 3, "آموزش و تربیت مؤثرترین راهِ بهبودِ فرهنگِ یک ملت است."),
  ('l5-k14', "Tsunami researchers rely on computers to try to ---------------- where waves might start and how they might behave.", ["point out", "put out", "figure out", "look out"], 2, "پژوهشگرانِ سونامی به رایانه‌ها تکیه می‌کنند تا بفهمند امواج از کجا شروع می‌شوند و چطور رفتار می‌کنند."),
  ('l5-k15', "She needs to be given some useful ---------------- before starting every new project.", ["advice", "trips", "advises", "tip"], 0, "قبل از شروعِ هر پروژهٔ تازه باید چند توصیهٔ مفید به او بدهند."),
 ],
 6: [
  ('l6-k11', "After finishing reading the novel, I ---------------- the book correctly on the shelf.", ["replaced", "defended", "covered", "attracted"], 0, "بعد از تمام کردنِ رمان، کتاب را درست سرِ جایش روی قفسه گذاشتم."),
  ('l6-k12', "In a natural process, nitrogen is ---------------- into nitrates in the soil which plants can then use.", ["magnified", "visited", "consumed", "converted"], 3, "در فرایندی طبیعی، نیتروژن در خاک به نیترات تبدیل می‌شود که گیاهان بعداً از آن استفاده می‌کنند."),
  ('l6-k13', "As the number of population increases, power plants should ---------------- more fossil fuels to generate electricity.", ["consider", "endanger", "consume", "expand"], 2, "با افزایشِ جمعیت، نیروگاه‌ها باید سوختِ فسیلیِ بیشتری مصرف کنند تا برق تولید کنند."),
  ('l6-k14', "They have greatly ---------------- the size and cost of most electronic products.", ["reduced", "developed", "generated", "labeled"], 0, "آن‌ها اندازه و هزینهٔ بیشترِ محصولاتِ الکترونیکی را به‌شدت کم کرده‌اند."),
  ('l6-k15', "He believes that eating ---------------- food reduces one's chances of developing certain types of cancer.", ["organic", "renewable", "ordinary", "junk"], 0, "او باور دارد خوردنِ غذای ارگانیک شانسِ ابتلا به برخی سرطان‌ها را کم می‌کند."),
 ],
 7: [
  ('l7-k11', "It was a bad accident. They're lucky to be ----------------.", ["dead", "alive", "living", "injured"], 1, "تصادف بدی بود؛ خوش‌شانس‌اند که زنده‌اند."),
  ('l7-k12', "It's ---------------- how often you see drivers using mobile phones.", ["boring", "common", "amazing", "important"], 2, "شگفت‌انگیز است که چه‌قدر زیاد راننده‌ها را می‌بینی که با موبایل رانندگی می‌کنند."),
  ('l7-k13', "The government should develop an education system which is more ---------------- to the needs of the students.", ["common", "especial", "important", "appropriate"], 3, "دولت باید سیستمِ آموزشی‌ای بسازد که مناسب‌تر با نیازهای دانش‌آموزان باشد."),
  ('l7-k14', "The ---------------- cost of making a movie has increased by 25 percent.", ["above", "beginning", "hope", "average"], 3, "هزینهٔ متوسطِ ساختِ فیلم ۲۵ درصد افزایش یافته است."),
  ('l7-k15', "The TV play was ---------------- real-life events of poor people in our society.", ["instead of", "based on", "interested in", "asked for"], 1, "آن سریالِ تلویزیونی بر رویدادهای واقعیِ مردمِ تنگ‌دستِ جامعهٔ ما بنا شده بود."),
 ],
 8: [
  ('l8-k11', "We heard voices when we drew ---------------- the village.", ["far", "near", "real", "above"], 1, "وقتی به روستا نزدیک شدیم صدایی شنیدیم."),
  ('l8-k12', "The first ---------------- of rain fell down on the ground yesterday and we enjoyed a lot.", ["drops", "pumps", "liquids", "signs"], 0, "اولین قطره‌های باران دیروز روی زمین نشست و خیلی خوشحال شدیم."),
  ('l8-k13', "Have you ever explored the ---------------- of other planets?", ["powers", "signs", "wonders", "types"], 2, "آیا تا حالا شگفتی‌های سیاراتِ دیگر را کاویده‌ای؟"),
  ('l8-k14', "He went around the office ---------------- old coffee cups.", ["carrying", "creating", "orbiting", "collecting"], 3, "دورِ دفتر می‌گشت و لیوان‌های قهوهٔ کهنه را جمع می‌کرد."),
  ('l8-k15', "Crying is seen as a ---------------- of weakness among some people in bad situations.", ["system", "sign", "power", "ring"], 1, "گریه نزدِ برخی مردم در موقعیت‌های بد نشانهٔ ضعف دیده می‌شود."),
 ],
 9: [
  ('l9-k11', "Jack arrived home while his father was watching his ---------------- film in the living room.", ["interested", "famous", "favorite", "energetic"], 2, "جک به خانه رسید وقتی پدرش فیلمِ محبوبش را در اتاق نشیمن تماشا می‌کرد."),
  ('l9-k12', "We're planning to travel to Russia by ---------------- this summer. I like flying.", ["airplane", "boat", "ship", "train"], 0, "برنامه داریم این تابستان با هواپیما به روسیه سفر کنیم؛ من پرواز را دوست دارم."),
  ('l9-k13', "I'm reading a book which is about ---------------- Iranian great scientists such as Avicenna and Razi.", ["favorite", "famous", "energetic", "possible"], 1, "کتابی می‌خوانم که دربارهٔ دانشمندانِ بزرگِ ایرانی مثل ابوعلی سینا و رازی است."),
  ('l9-k14', "That novel was so ---------------- that I learned a lot of interesting things from it.", ["useful", "natural", "famous", "energetic"], 0, "آن رمان آن‌قدر مفید بود که چیزهای جالبِ زیادی از آن یاد گرفتم."),
  ('l9-k15', "She studies ---------------- at Tehran university. She likes to be a doctor.", ["medicine", "geography", "chemistry", "literature"], 0, "او در دانشگاه تهران پزشکی می‌خواند؛ دوست دارد پزشک شود."),
 ],
}

for ln, items in ITEMS.items():
    p = f'src/data/lesson{ln}.ts'
    s = open(p, encoding='utf-8').read()
    # find the k10 line (last konkuri item) and insert after it
    pat = re.compile(r'(Q\("l' + str(ln) + r'-k10".*?\),\n)')
    m = pat.search(s)
    assert m, f"k10 anchor not found in lesson{ln}"
    block = ''.join(
        f'  Q("{qid}", "vocab-konkuri", {stem!r}, {opts!r}, {ans}, {fa!r}),\n'
        for (qid, stem, opts, ans, fa) in items
    )
    # house style: strings use double quotes — convert reprs
    block = block.replace("'", '\u2032')  # guard: avoid repr single-quote mess? no — build manually instead
    # build manually with proper quoting:
    def q(x): return '"' + x.replace('\\', '\\\\').replace('"', '\\"') + '"'
    block = ''.join(
        f'  Q({q(qid)}, "vocab-konkuri", {q(stem)}, [{", ".join(q(o) for o in opts)}], {ans}, {q(fa)}),\n'
        for (qid, stem, opts, ans, fa) in items
    )
    s = s[:m.end()] + block + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
    print(f"lesson{ln}: +5 konkuri (k11..k15)")

print("done")
