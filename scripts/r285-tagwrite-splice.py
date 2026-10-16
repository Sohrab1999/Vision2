#!/usr/bin/env python3
# r285 — بانک تایپی «بنویسید» ص۴۳ جزوهٔ دوازدهم → grammar-g12-topic.json درس ۱۲
# منبع: /tmp/jozve/g12.txt — تمرین دستگریم ص۴۳ (۲۲ جمله) + کلید توضیحیِ
# ترجمه‌دار ص۱۸۸ (پاسخنامه تمرین آموزش و دستگریم گرامر «عبارات الحاق»).
# هر سؤال: kind=typed، گزینهٔ درست در options[0] (answer=0) + سه داربست نادرست،
# accepted = کلید چاپی، translation = رسیدِ ترجمهٔ چاپی خود جزوه.
import json, io, sys

BANK = [
    # (sentence, key, [3 wrong scaffolds], printed-translation receipt)
    ("They aren’t going to cut that tree down, ---------------?", "are they",
     ["aren’t they", "is it", "don’t they"],
     "آنها قصد ندارند آن درخت را قطع کنند، مگه نه؟"),
    ("You will come to our house tonight, ---------------?", "won’t you",
     ["will you", "don’t you", "won’t we"],
     "شما امشب به خانهٔ ما خواهید آمد، مگه نه؟"),
    ("These aren’t my pencils, ---------------?", "are they",
     ["aren’t they", "is it", "aren’t these"],
     "اینها مدادهای من نیستند، مگه نه؟"),
    ("We should take our umbrellas, ---------------?", "shouldn’t we",
     ["should we", "won’t we", "don’t we"],
     "ما باید چترهایمان را با خودمان بیاوریم، مگه نه؟"),
    ("Fatemeh likes playing tennis, ---------------?", "doesn’t she",
     ["does she", "don’t she", "isn’t she"],
     "فاطمه تنیس بازی کردن را دوست دارد، مگه نه؟"),
    ("The ticket costs five thousand tomans, ---------------?", "doesn’t it",
     ["does it", "don’t they", "isn’t it"],
     "قیمت بلیط ۵ هزار تومان است، مگه نه؟"),
    ("You paid for dinner at the restaurant last night, ---------------?", "didn’t you",
     ["did you", "don’t you", "didn’t we"],
     "تو دیشب پول شام رستوران را پرداخت کردی، مگه نه؟"),
    ("We use only 10 percent of our brain, ---------------?", "don’t we",
     ["do we", "doesn’t it", "aren’t we"],
     "ما از ده درصد مغزمان استفاده می‌کنیم، مگه نه؟"),
    ("You made many mistakes, ---------------?", "didn’t you",
     ["did you", "don’t you", "didn’t they"],
     "تو اشتباهات زیادی مرتکب شدی، مرتکب نشدی؟ / مگه نه؟"),
    ("We need one more person to make up a team, ---------------?", "don’t we",
     ["do we", "doesn’t he", "aren’t we"],
     "ما به یک نفر بیشتر برای تشکیل تیم‌مان نیاز داریم، مگه نه؟"),
    ("He has been here before, ---------------?", "hasn’t he",
     ["has he", "doesn’t he", "isn’t he"],
     "او قبلاً در اینجا بوده است، مگه نه؟"),
    ("Your students can play ping-pong after doing their homework, ---------------?", "can’t they",
     ["can they", "don’t they", "can’t we"],
     "دانش‌آموزانت بعد از انجام تکالیفشان می‌توانند پینگ‌پنگ بازی کنند، مگه نه؟"),
    ("I have seen you at school many times, ---------------?", "haven’t I",
     ["have I", "don’t I", "hasn’t he"],
     "من چندین بار تو را در مدرسه دیده‌ام، مگه نه؟"),
    ("You will be sorry to leave your parents, ---------------?", "won’t you",
     ["will you", "don’t you", "won’t we"],
     "تو از ترک کردن والدینت متأسف می‌شوی، مگه نه؟"),
    ("My aunt has worked here for a long time, ---------------?", "hasn’t she",
     ["has she", "doesn’t she", "isn’t she"],
     "خاله‌ام برای مدت طولانی در اینجا کار کرده است، مگه نه؟"),
    ("That’s a good idea, ---------------?", "isn’t it",
     ["is it", "doesn’t it", "isn’t this"],
     "این ایده خوب است، مگه نه؟"),
    ("You haven’t finished reading that story, ---------------?", "have you",
     ["haven’t you", "did you", "do you"],
     "تو خواندن آن داستان را تمام نکرده‌ای، مگه نه؟"),
    ("I never go to that supermarket, ---------------?", "do I",
     ["don’t I", "does he", "am I"],
     "من هرگز به آن سوپرمارکت نمی‌روم، مگه نه؟"),
    ("The Children have not played with Raman, ---------------?", "have they",
     ["haven’t they", "did they", "do they"],
     "بچه‌ها با «رامان» بازی نکردند، مگه نه؟"),
    ("Mary can speak English, Spanish and Italian well, ---------------?", "can’t she",
     ["can she", "doesn’t she", "can’t they"],
     "مری می‌تواند انگلیسی، اسپانیایی و ایتالیایی را به‌خوبی صحبت کند، مگه نه؟"),
    ("You and I answered some difficult questions, ---------------?", "didn’t we",
     ["did we", "don’t we", "didn’t you"],
     "من و تو سؤالات سخت را جواب دادیم، مگه نه؟"),
    ("Mehdi and Mehran want to be with each other at the party, ---------------?", "don’t they",
     ["do they", "doesn’t it", "aren’t they"],
     "مهدی و مهران می‌خواهند در مهمانی با هم باشند، مگه نه؟"),
]

def norm(s: str) -> str:
    return (s.lower().replace("’", "'").replace("‘", "'")
            .replace(" ", "").rstrip("?؟.!"))

def main():
    path = "public/jozve/grammar-g12-topic.json"
    with io.open(path, encoding="utf-8") as f:
        data = json.load(f)

    lessons = data["lessons"]
    if any(l["lesson"] == 12 for l in lessons):
        # idempotent re-run: drop the previous lesson 12, then re-splice
        lessons[:] = [l for l in lessons if l["lesson"] != 12]
        data["source"].pop("tagwrite", None)

    # self-checks before splice
    assert len(BANK) == 22, len(BANK)
    seen_keys = set()
    for i, (sent, key, wrong, tr) in enumerate(BANK, 1):
        assert len(wrong) == 3 and len(set(wrong)) == 3, f"q{i} scaffolds"
        assert all(norm(w) != norm(key) for w in wrong), f"q{i} wrong==key"
        assert norm(key) not in seen_keys or True  # keys may repeat (are they ×2)
        seen_keys.add(norm(key))
        assert tr and tr[0].isascii() is False, f"q{i} translation Persian"
        # sentence: only Latin letters + punctuation, no Persian leak
        latin = sum(1 for c in sent if c.isascii() and c.isalpha())
        nonlat = sum(1 for c in sent if not (c.isascii() or c in "’‘"))
        assert nonlat == 0, f"q{i} Persian leak in stem: {sent!r}"

    questions = []
    for i, (sent, key, wrong, tr) in enumerate(BANK, 1):
        questions.append({
            "id": f"g12-tagwrite-{i}",
            "n": i,
            "category": "grammar",
            "kind": "typed",
            "question": sent,
            "options": [key] + wrong,   # داربست بازبینی — درست در اندیس ۰
            "answer": 0,
            "accepted": [key],
            "translation": tr,
        })

    lesson = {
        "lesson": 12,
        "title": "عبارات الحاق (Tag Questions) — بنویسید، پاسخ تایپی (ص۴۳)",
        "level": "آموزشی — ورود آزاد",
        "count": len(questions),
        "questions": questions,
    }
    lessons.append(lesson)

    data["source"]["tagwrite"] = {
        "pages": "43",
        "topic": "تمرین آموزش و دستگریم گرامر «عبارات الحاق» — پاسخِ باز",
        "questions": len(questions),
        "keyType": "کلید توضیحیِ ترجمه‌دار ص۱۸۸ (رسید ترجمه برای هر ۲۲ آیتم)",
        "translations": "رسیدِ ترجمهٔ چاپی ص۱۸۸ برای همهٔ آیتم‌ها — شکستنِ سنتِ غیبتِ صادقانهٔ این خانواده",
        "typedMode": "kind=typed + accepted؛ نرمال‌سازی آپاستروف/علامت سؤال در lib/typed-answer.ts؛ options داربست بازبینی",
        "extractedRound": 285,
    }
    # stats بلوکِ رسیدِ r280 است — frozen؛ برخلافش گاردِ r280 را می‌شکند (الگوی r281-r284)

    with io.open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")

    total = sum(l["count"] for l in lessons)
    print(f"OK — lesson 12 spliced: {len(questions)} typed questions; "
          f"family now {len(lessons)} banks / {total} tests")

if __name__ == "__main__":
    main()
