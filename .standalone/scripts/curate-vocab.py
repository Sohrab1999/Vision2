#!/usr/bin/env python3
"""Curate mined vocab: apply exclusions, hand-verified fa overrides, en typo
fixes, lam-alef fixes, and casing normalization. Output: final curated JSON.

Adjudication source: v1/v2 disagreement reports + direct source reads
(g7.txt lines ~5885-5935 food table, g8.txt jobs table, g9 irregular verbs).
"""
import json
import os
import re

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")

# ---------------------------------------------------------------- global
EN_FIX = {
    "Capitan": "Captain",
    "intersting": "interesting",
}

FA_FIX = {
    "تعطیالت": "تعطیلات", "اسالمی": "اسلامی", "انقالب": "انقلاب",
    "وبالگ": "وبلاگ", "آنالین": "آنلاین", "آنفوالنزا": "آنفولانزا",
    "معموال": "معمولا", "تالش": "تلاش", "اطالعات": "اطلاعات",
    "کالم": "کلم", "ساالمتی": "سلامتی", "ساالد": "سالاد",
    "االن": "الان", "حاال": "حالا", "تاالر": "تالار", "باال": "بالا",
    "سواالت": "سوالات", "امال": "املا", "کاال": "کالا", "کالس": "کلاس",
}

# proper nouns keep booklet casing
PROPER = {
    "january", "february", "march", "april", "may", "june", "july",
    "august", "september", "october", "november", "december",
    "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday",
    "friday", "iran", "iranian", "spain", "brazil", "africa", "african",
    "china", "asia", "australia", "england", "europe", "european",
    "france", "french", "persian", "english", "spanish", "chinese",
    "mr", "mrs", "miss", "dr", "japan", "japanese", "germany", "german",
    "italy", "italian", "turkey", "turkish", "arabic", "quran", "islamic",
    "muslim", "farvardin", "aban", "azar", "bahman", "esfand",
    "tuesday", "tha", "god", "america", "american", "canada",
    "canadian", "switzerland", "swiss", "police", "christmas", "nowruz",
}

MONTH_CLEAN = {
    "January": "ژانویه (دی/بهمن)", "February": "فوریه (بهمن/اسفند)",
    "March": "مارس (اسفند/فروردین)", "April": "آوریل (فروردین/اردیبهشت)",
    "May": "مه (اردیبهشت/خرداد)", "June": "ژوئن (خرداد/تیر)",
    "July": "ژوئیه (تیر/مرداد)", "August": "اوت (مرداد/شهریور)",
    "September": "سپتامبر (شهریور/مهر)", "October": "اکتبر (مهر/آبان)",
    "November": "نوامبر (آبان/آذر)", "December": "دسامبر (آذر/دی)",
}

FAMILY_CLEAN = {
    "Step-brother": "برادرخوانده", "Step-sister": "خواهرخوانده",
    "Half-brother": "برادر ناتنی", "Half-sister": "خواهر ناتنی",
    "Step-mother": "نامادری، مادرخوانده", "Stepfather": "نامادری، پدرخوانده",
    "Grandson": "نوهٔ پسر", "Granddaughter": "نوهٔ دختر",
    "Uncle": "دایی، عمو", "Aunt": "عمه، خاله",
    "Brother-in-law": "برادرشوهر، برادرزن، باجناق",
    "Father-in-law": "پدرزن، پدرشوهر", "Mother-in-law": "مادرزن، مادرشوهر",
    "Cousin": "عموزاده، دایی‌زاده، عمه‌زاده، خاله‌زاده",
}

JOBS_CLEAN = {
    "miner": "معدنچی", "baker": "نانوا", "actress": "هنرپیشه زن",
    "Optician": "عینک‌ساز", "waiter": "گارسون، پیشخدمت",
    "August": None,  # months ride MONTH_CLEAN
}

CLOTHES_CLEAN = {
    "shirt": "پیراهن مردانه", "jeans": "جین", "sport shirt": "پیراهن اسپورت",
    "dress": "پیراهن زنانه", "jersey": "پیراهن کشباف",
    "three-piece suit": "لباس سه‌تکه", "suit": "کت و شلوار",
    "uniform": "لباس فرم", "T-shirt": "تی‌شرت", "jumpsuit": "لباس کار یکسره",
    "maternity dress": "لباس بارداری", "blazer": "کت رسمی",
    "overalls": "لباس کار بندی", "leggings": "شلوار استرچ",
    "tuxedo": "کت و شلوار رسمی مردانه", "turtleneck": "پیراهن یقه‌گردان",
    "gown": "لباس شب", "skirt": "دامن", "sweater": "سویستر",
    "jumper": "سارافون",
}

# ---------------------------------------------------------------- g7
G7_EXCLUDE = {
    "to be", "does", "is", "am", "es", "will be", "one half",
    "four hundred percent", "Weekdays", "Tues", "Thur", "Thurs", "In",
    "one", "girls", "Two", "ten", "law", "Mother-in-", "English teacher",
    "Ali", "Shoe", "simple", "Nephew", "Great-grandfather", "s es",
    "There", "girl friend", "husband", "boy friend", "Great",
}

G7_OVERRIDE = {
    # L1 pronouns & misc (table column shift repaired)
    "She": "او (مؤنث)", "He": "او (مذکر)", "You": "شما، تو",
    "They": "آنها", "We": "ما", "What": "چه", "My": "مال من",
    "It": "آن", "your": "مال تو", "Of": "از",
    "Hi": "سلام", "greeting": "سلام و احوال‌پرسی", "greet": "سلام، احوال‌پرسی",
    "circle": "دایره کشیدن، دور چیزی را گرفتن", "so": "خیلی، آنقدر",
    # L5 house block (v1 alignment verified correct)
    "where": "کجا، در کجا", "place": "مکان، جا، محل، میدان",
    "home": "خانه، منزل، وطن", "kitchen": "آشپزخانه",
    "mom": "مامان، مادر", "garage": "گاراژ، توقفگاه",
    "mum": "مادر، مامان", "bedroom": "اتاق خواب، خوابگاه",
    "dad": "بابا، باباجان", "living room": "اتاق نشیمن، سالن نشیمن",
    "papa": "بابا، پاپا", "bathroom": "حمام، گرمابه",
    "hall": "هال، اتاق بزرگ، تالار", "hungry": "گرسنه",
    "stair": "پله، پلکان", "thirsty": "تشنه", "corner": "گوشه، کنج، نبش",
    "breakfast": "صبحانه", "lunch": "ناهار، ظهرانه",
    "dinner": "شام، شامگاه", "W.C": "دستشویی، توالت",
    "activity": "فعالیت، کار، عمل", "storeroom": "انبار کالا، مخزن",
    "storehouse": "انبار کالا، مخزن", "garden": "باغ، باغچه، بوستان",
    "wash": "شستن", "office": "اداره، دفتر، محل کار", "come": "آمدن، رسیدن",
    "Town": "شهر کوچک، شهرک", "call": "صدا زدن، تلفن زدن",
    "flat": "آپارتمان، طبقه", "fix": "تعمیر کردن، نصب کردن",
    "apartment": "آپارتمان، واحد مسکونی", "watch": "ساعت، تماشا کردن",
    "villa": "ویلا، خانهٔ ییلاقی", "play": "بازی کردن، بازی",
    "tower": "برج", "look at": "نگاه کردن، نگریستن",
    "Mime": "نمایش بدون گفتگو", "pardon": "معذرت‌خواهی، بخشیدن",
    "bookcase": "قفسهٔ کتاب", "change": "تغییر دادن، معاوضه کردن",
    "the yard": "حیاط", "the corner of": "گوشهٔ حیاط",
    # L7 food table (source-read truth, lines 5885-5935)
    "some": "اندکی، قدری، کمی", "juice": "شربت، آبمیوه، عصاره",
    "good": "خوب، نیک، نیکو", "chicken": "جوجه مرغ، مرغ",
    "suggest": "پیشنهاد کردن", "salad": "سالاد",
    "suggestion": "پیشنهاد، نظریه", "fruit": "میوه، ثمر، فرزند",
    "make a suggestion": "پیشنهاد/اظهار کردن", "dates": "خرما، نخل",
    "feel": "احساس، حس", "coconut": "نارگیل", "something": "یک چیزی",
    "jelly": "ژله", "How about": "چطوره؟", "quince": "به، درخت به",
    "sir": "آقا، شخص محترم", "zucchini": "کدو سبز",
    "need": "نیاز، لازم، احتیاج", "all": "همه، تمام، کلیه، هر",
    "carrot": "هویج", "Onion": "پیاز", "keep": "نگه داشتن، نگهداری",
    "banana": "موز", "body": "بدن، بدنه، تنه، جسد",
    "potato": "سیب‌زمینی", "strong": "قوی، نیرومند، پرزور",
    "tomato": "گوجه‌فرنگی", "healthy": "سلامتی، بهداشت",
    "omelet": "املت", "grain": "دانه، حبه، بذر", "yoghurt": "ماست",
    "like": "مثل، مانند، نظیر", "egg": "تخم‌مرغ، تخمک",
    "sound": "صدا، آوا، صوت؛ به نظر رسیدن",
    # L4 family repairs
    "Grandson": "نوهٔ پسر", "Granddaughter": "نوهٔ دختر",
    "Cousin": "عموزاده، دایی‌زاده، عمه‌زاده، خاله‌زاده",
    "Brother-in-law": "برادرشوهر، برادرزن، باجناق",
    "Girl friend": "دوست دختر", "Husband": "شوهر", "Boy friend": "دوست پسر",
    "Wife": "زن", "Father-in-law": "پدرزن، پدرشوهر",
    "Only-child": "تک‌فرزند", "Sister-in-law": "جاری، زن برادرزن",
    # L4/L5 misc repairs
    "women": "زنان، زن‌ها", "cap": "کلاه لبه‌دار",
    "three-piece suit": "لباس سه‌تکه", "blazer": "کت رسمی",
    "overalls": "لباس کار بندی", "leggings": "شلوار استرچ",
    "tuxedo": "کت و شلوار رسمی مردانه", "turtleneck": "پیراهن یقه‌گردان",
    "gown": "لباس شب", "jumper": "سارافون", "maternity dress": "لباس بارداری",
    "uniform": "لباس فرم", "jeans": "جین", "sport shirt": "پیراهن اسپورت",
    "jersey": "پیراهن کشباف", "skirt": "دامن", "pants": "زیرشلواری",
    "August": "اوت (مرداد)", "waiter": "گارسون، پیشخدمت",
    "miner": "معدنچی", "word": "واژه، کلمه", "Try": "تلاش کردن",
}

# ---------------------------------------------------------------- g8
G8_EXCLUDE = {
    "am", "are", "yes", "No", "where", "at", "me", "do", "not", "In",
    "What is", "general statement of fact", "back in a minute", "ch",
    "th", "Pong", "Farvardin", "s-", "s’", "of", "Tues", "Thur", "Thurs",
}

G8_OVERRIDE = {
    "a little": "کمی، مقدار", "welcome": "خوش‌آمدید", "From": "از",
    "cousin": "عموزاده، دایی‌زاده، عمه‌زاده، خاله‌زاده",
    "love": "دوست داشتن، عشق",
    "There is": "وجود دارد", "Go shopping": "خرید کردن، رفتن برای خرید",
    "Visit relative": "عیادت اقوام، مالقات کردن",
    "Good at": "خوب بودن در", "gym": "سالن ورزشی",
    "weekdays": "روزهای هفته", "weekend": "تعطیلات آخر هفته",
    "climb a mountain": "کوهنوردی کردن", "Play sport": "ورزش کردن",
    "start": "شروع کردن", "study": "مطالعه کردن",
    "in the morning": "صبح‌ها", "in the afternoon": "بعدازظهرها",
    "in the evening": "عصرها", "on weekdays": "روزهای هفته",
    "on the weekend": "آخر هفته", "habits": "عادت‌های روزانه",
    "Tuesday": "سه‌شنبه", "sunrise": "طلوع آفتاب", "sunset": "غروب آفتاب",
    "evening": "عصر، شب", "midnight": "نیمه‌شب",
    # L3 repairs (v1 alignment)
    "see": "دیدن", "all": "همه", "short": "کوتاه", "be": "بودن",
    "sound": "صدا", "sure": "حتماً", "between": "بین",
    "swim": "شنا کردن", "bring": "آوردن", "photo": "عکس",
    "take": "گرفتن، بردن", "story": "داستان", "tell": "گفتن، بیان کردن",
    "too": "هم، نیز", "well": "خوب، سالم", "Excuse": "ببخشید",
    "work": "کار کردن", "good": "خوب", "write": "نوشتن", "house": "خانه",
    "act": "عمل کردن، بازی کردن", "tea": "چای", "cake": "کیک",
    "Make": "ساختن، انجام دادن", "badminton": "بدمینتون",
    "play": "بازی کردن", "chess": "شطرنج", "basketball": "بسکتبال",
    "football": "فوتبال", "read": "خواندن", "tennis": "تنیس",
    "recite": "از حفظ خواندن، اداء کردن", "pronunciation": "تلفظ",
    "horse": "اسب", "ride": "سوار شدن، راندن", "question": "سوال",
    "run": "دویدن", "really": "واقعاً", "your": "مال تو",
    "she": "او (مؤنث)", "he": "او (مذکر)", "it": "آن (شیء)",
    "All right": "خوب بودن، سالم بودن", "should": "باید",
    "Sore eyes": "درد چشم", "Be quiet": "ساکت باش", "call": "تلفن زدن",
    "The flu": "آنفولانزا", "these": "این‌ها", "Don’t worry": "نگران نباش",
    "toothache": "دندان‌درد", "earache": "گوش‌درد", "Go home": "رفتن به خانه",
    "have a fever": "تب داشتن", "I’ll talk": "حرف خواهم زد",
    "let's go": "بیا برویم", "more": "بیشتر",
    # L4 family/clothes shared cleans
    **{k: v for k, v in FAMILY_CLEAN.items()},
    **{k: v for k, v in CLOTHES_CLEAN.items()},
    "sweater": "سویستر", "pants": "شلوار", "painter": "نقاش ساختمان",
    # L5 places
    "about": "راجع به", "actually": "در واقع", "soon": "به زودی",
    "Tell me": "به من بگو", "There are": "وجود دارند",
    "zoo": "باغ وحش", "bus station": "ایستگاه اتوبوس",
    "minaret": "منارهٔ مسجد", "Metro system": "سیستم مترو",
    "train station": "ایستگاه قطار",
    # L6 farm/weather
    "raise": "پرورش دادن", "weather": "آب و هوا",
    "icy": "یخ‌بندان، یخ‌زده", "plow": "گاوآهن، شخم زدن",
    "much": "مقدار زیادی",
    # L7 free time
    "usually": "معمولاً", "walk": "راه رفتن", "as": "به عنوان",
    "watch movie": "فیلم تماشا کردن", "Free time": "اوقات فراغت",
    "walk in the park": "قدم زدن در پارک", "horse riding": "اسب‌سواری",
    "play tennis": "تنیس بازی کردن", "listen to story": "گوش دادن به داستان",
    "Play computer": "بازی‌های کامپیوتری", "games": "بازی‌ها",
    "net": "شبکه، اینترنت", "time": "وقت، زمان",
    "reading": "خواندن، مطالعه", "shopping": "خرید کردن",
    "seventy": "هفتاد", "Colors": "رنگ‌ها",
}

# ---------------------------------------------------------------- g9
G9_EXCLUDE = {
    "n’t", "first person singular pronoun", "first", "To be", "to",
    "was", "were", "we", "not", "We are", "some", "the", "there",
    "there is", "there are", "be", "is", "are", "es", "box", "A book",
    "books", "Sara", "am", "ing", "forever", "s-", "s’", "objects", "of",
    "friends", "does", "sh", "ie", "much - a little",
    "little - thin - clever", "green - blue - white",
    "at Monday - Saturday", "slowly - hard - rapidly",
    "at home - in the park", "adverb of frequency", "Have", "law",
    "Mother-in-", "written", "drunk", "learned", "sworn", "left",
    "My sister", "simple", "I played", "I spoke", "went to school",
    "Reza", "and", "Tues", "Thur", "Thurs", "demarche", "sleeper",
    "Great", "s es",
}

G9_OVERRIDE = {
    "Intonation": "آهنگ (کلام)", "falling": "افتان",
    "You": "شما، تو", "He": "او (مذکر)", "She": "او (مؤنث)",
    "it": "آن (غیرجاندار)", "This": "این", "That": "آن",
    "These": "این‌ها", "Those": "آن‌ها",
    "restaurant": "رستوران", "sea": "دریا", "lake": "دریاچه",
    "republic": "جمهوری", "there": "آنجا", "Need": "نیاز داشتن",
    "Travel": "مسافرت، سفر کردن",
    "Express train": "قطار سریع‌السیر", "Voyage": "سفر دریایی",
    "Hold": "برگزار کردن", "Holiday": "تعطیلات",
    "Information": "اطلاعات", "language melody": "آهنگ زبان",
    "what": "چه، چه چیز، چه کار، شغل", "How many": "چند تا",
    "Interview": "مصاحبه کردن", "War": "جنگ",
    "miner": "معدنچی", "baker": "نانوا", "actress": "هنرپیشه زن",
    "Optician": "عینک‌ساز", "Capitan": "ناخدا",
    **{k: v for k, v in FAMILY_CLEAN.items()},
    **{k: v for k, v in CLOTHES_CLEAN.items()},
    "Wife": "زن", "Girl friend": "دوست دختر", "Husband": "شوهر",
    "Boy friend": "دوست پسر", "painter": "نقاش ساختمان",
    # irregular verbs
    "Irregular verbs": "افعال بی‌قاعده", "put": "قرار دادن",
    "read": "خواندن", "sing": "آواز خواندن", "bet": "شرط بستن",
    "bend": "خم کردن", "dream": "خواب دیدن", "grow": "رشد کردن",
    "light": "روشن کردن، آتش زدن", "slide": "سر خوردن",
    "strike": "ضربه زدن", "lean": "تکیه دادن، خم شدن",
    "burn": "سوختن، سوزاندن",
    # L5 health
    "school": "مدرسه", "rising": "آهنگ خیزان", "often": "اغلب، غالباً",
    "Heart attack": "حمله قلبی", "Plaster": "چسب زخم",
    # L6 weekdays/months
    "seventy": "هفتاد", "Colors": "رنگ‌ها", "Weekdays": "روزهای هفته",
    "Sunday": "یکشنبه", "Monday": "دوشنبه", "Tuesday": "سه‌شنبه",
    "Wednesday": "چهارشنبه", "Thursday": "پنج‌شنبه", "Friday": "جمعه",
    "Saturday": "شنبه",
}


def fix_fa(s):
    s = re.sub(r"اال", "الا", s)
    out = []
    for tok in re.split(r"(\s+|،|/|\(|\))", s):
        out.append(FA_FIX.get(tok, tok))
    return "".join(out)


def smart_case(en):
    e = EN_FIX.get(en, en)
    if e.lower() in PROPER:
        return e
    # lowercase leading letter for common words (keep interior caps)
    if e and e[0].isupper() and (len(e) < 2 or e[1].islower()):
        return e[0].lower() + e[1:]
    return e


def curate(booklet, exclude, override):
    with open(os.path.join(EXTRACT, f"{booklet}-new.json"), encoding="utf-8") as f:
        words = json.load(f)
    out, seen, dropped, fixed = [], set(), 0, 0
    for w in words:
        en_raw, fa = w["en"], w["fa"]
        en = EN_FIX.get(en_raw, en_raw)
        key = en.lower()
        if en in exclude or en_raw in exclude:
            dropped += 1
            continue
        # months / weekday shared cleans
        if en in MONTH_CLEAN:
            fa = MONTH_CLEAN[en]
        if en in override:
            ov = override[en]
            if ov is None:
                dropped += 1
                continue
            fa = ov
        fa = fix_fa(fa).strip(" ،")
        en2 = smart_case(en)
        k2 = en2.lower()
        if k2 in seen:
            continue
        seen.add(k2)
        out.append({"lesson": w["lesson"], "en": en2, "fa": fa})
    with open(os.path.join(EXTRACT, f"{booklet}-curated.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    return out, dropped


def main():
    total = 0
    for booklet, (ex, ov) in {
        "g7": (G7_EXCLUDE, G7_OVERRIDE),
        "g8": (G8_EXCLUDE, G8_OVERRIDE),
        "g9": (G9_EXCLUDE, G9_OVERRIDE),
    }.items():
        out, dropped = curate(booklet, ex, ov)
        total += len(out)
        per_les = {}
        for w in out:
            per_les[w["lesson"]] = per_les.get(w["lesson"], 0) + 1
        print(f"{booklet}: kept={len(out)} dropped={dropped} per-lesson={per_les}")
    print("TOTAL curated:", total)


if __name__ == "__main__":
    main()
