# -*- coding: utf-8 -*-
# r351 — استخراجِ بخشِ نخستِ «۳۶۰ تست واژگان درس ۱ تا ۴ - پایه دهم» (سؤال: ص۱۷۸-۱۹۴، کلیدِ جدولیِ ص۳۰۱)
# به public/jozve/tests-g10.json — بانکِ ۹۸ (lesson 98): سؤال‌های ۱ تا ۱۲۰ (ص۱۷۸-۱۸۳) — نخستینِ سه
# بانکِ ۱۲۰تایی (۱۲۰×۳=۳۶۰). MCQ بدونِ ترجمهٔ چاپی («ترجمه» ×۰ در ص۱۷۸-۱۹۴ — قرینهٔ r334/r350).
# سربرگِ آزمونِ ص۱۷۸: «۳۶۰ تست آموزشی واژگان "درس ۱ تا ۴ - پایه دهم"» + «(پاسخنامه کلیدی صفحه: ۳۰۱)» +
# «سطح تستها: "آموزشی" و "متوسط"» — داوریِ رندرِ ۹۰۰dpi: «آموزشی» سرخِ نقل‌قولی و «متوسط» مشکیِ نقل‌قولی
# (لایه «ی آموزیس» = تجزیهٔ «آموزشی») — دو سطحِ نقل‌قولی (الگوی r343؛ برخلافِ r349 تک‌سطح).
# کلید = جدولِ ص۳۰۱ (۳۶۰ جفت در یک صفحه — regex چندالگویی: ۳۶۰/۳۶۰ بدونِ تکرار/نقص/واگرایی).
# **کوئیرکِ فرمتِ گزینه‌ها: خودِ چاپ بینِ Q39 و Q40 از «a. b. c. d.» (نقطه‌دار) به «a) b) c) d)» (پرانتزدار)
# می‌پیچد** — رندرِ ۱۱۰۰dpi: Q38/Q39 نقطه‌دار، Q40+ پرانتزدار (ناکسازیِ تایپوگرافیکِ خودِ جزوه — عینِ چاپ
# حفظ شد؛ در داده فقط متنِ گزینه ذخیره می‌شود). جای‌خالی‌ها تیره‌چینِ سبز؛ حروفِ گزینه‌ها کادرِ آبیِ روشن؛
# شمارهٔ سؤال‌ها سرخ.
# Q24: رانِ [۷،۱۰،۳] لایه (بریده بینِ خط‌ها) = یک خطِ خط‌چین در رندرِ ۱۲۰۰dpi → ۲۰ تیرهٔ یکپارچه با
# نقطهٔ چسبیده (قانونِ ادغامِ r349-Q2). Q40 گزینهٔ c «planed» = چاپ‌غلطِ عینِ چاپ (کلیدِ c — باید planned).
# چاپ‌غلط‌های دیگر در محدودهٔ ۱-۱۲۰ در verify قفل می‌شوند.
# Idempotent: اجرای دوم NO-OP (مبنا = ۹۷ بانکِ r323-r350 / ۱۳۴۶ آیتم).
import json
import re
from pathlib import Path

import fitz

PATH = Path("public/jozve/tests-g10.json")
PDF = "/home/z/my-project/upload/جزوه جامع دهم .pdf"

BANK_NO = 98
GROUP = "۳۶۰ تست واژگان درس ۱ تا ۴"
Q_FROM, Q_TO = 1, 120

# گریدِ کلیدِ جدولیِ ص۳۰۱ — رانِ خامِ ۳۶۰ جفت (خروجیِ پروب: ۳۶۰/۳۶۰ یکتا)
KEY_RAW = (
    "1a 2d 3a 4c 5c 6d 7b 8b 9d 10c "
    "11c 12a 13a 14b 15c 16c 17d 18b 19b 20d "
    "21d 22b 23b 24d 25b 26b 27d 28a 29d 30c "
    "31d 32a 33d 34b 35d 36a 37a 38c 39c 40a "
    "41c 42b 43c 44a 45c 46b 47a 48a 49b 50d "
    "51c 52c 53a 54d 55b 56b 57d 58b 59c 60c "
    "61d 62d 63c 64d 65d 66c 67b 68a 69c 70a "
    "71c 72b 73a 74b 75d 76b 77a 78c 79d 80c "
    "81a 82c 83c 84b 85d 86a 87b 88b 89d 90d "
    "91b 92c 93a 94d 95b 96b 97b 98a 99b 100b "
    "101b 102b 103c 104d 105c 106c 107a 108a 109b 110a "
    "111c 112c 113d 114c 115b 116c 117c 118c 119d 120d "
    "121a 122a 123b 124b 125b 126d 127d 128a 129b 130b "
    "131d 132b 133b 134c 135d 136c 137b 138b 139d 140d "
    "141a 142d 143b 144b 145a 146a 147c 148c 149c 150d "
    "151b 152b 153a 154b 155c 156c 157b 158b 159d 160b "
    "161d 162c 163c 164c 165d 166c 167b 168d 169d 170c "
    "171a 172d 173b 174c 175a 176b 177b 178c 179c 180b "
    "181b 182c 183d 184d 185d 186b 187b 188b 189c 190c "
    "191d 192d 193b 194c 195c 196a 197b 198b 199d 200b "
    "201c 202a 203d 204d 205d 206c 207d 208d 209a 210a "
    "211b 212b 213d 214b 215a 216c 217b 218b 219d 220c "
    "221a 222b 223b 224d 225b 226c 227c 228c 229a 230c "
    "231a 232b 233d 234b 235b 236a 237b 238d 239d 240d "
    "241c 242d 243b 244d 245c 246c 247b 248a 249a 250b "
    "251c 252b 253c 254c 255b 256c 257c 258b 259c 260c "
    "261b 262a 263c 264a 265c 266c 267a 268b 269a 270c "
    "271a 272a 273a 274d 275c 276b 277b 278c 279c 280b "
    "281a 282b 283a 284c 285a 286d 287c 288d 289a 290d "
    "291d 292c 293c 294a 295d 296b 297a 298c 299b 300d "
    "301c 302a 303d 304b 305a 306b 307b 308d 309b 310d "
    "311c 312d 313b 314c 315c 316d 317a 318a 319a 320c "
    "321b 322a 323a 324b 325b 326a 327d 328a 329b 330a "
    "331b 332a 333c 334b 335d 336d 337d 338a 339c 340b "
    "341c 342c 343d 344b 345a 346a 347c 348c 349c 350d "
    "351c 352d 353c 354a 355c 356c 357d 358b 359b 360d"
)
KEYMAP = {int(m.group(1)): "abcd".index(m.group(2)) for m in re.finditer(r"(\d{1,3})([a-d])", KEY_RAW)}
assert len(KEYMAP) == 360 and set(KEYMAP) == set(range(1, 361)), f"keymap broken: {len(KEYMAP)}"


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def load_layer() -> str:
    doc = fitz.open(PDF)
    txt = ""
    for pno in range(177, 194):  # ص۱۷۸-۱۹۴ — کلِ ۳۶۰ سؤال (این راند فقط ۱-۱۲۰ مصرف می‌شود)
        txt += doc[pno].get_text("text") + "\n"
    # فرفرجهٔ هر صفحه: شمارهٔ صفحه + آغازِ «"جزوه» در ۲۰ نویسهٔ بعد + تا «هم..کاران» (هر تعداد کشیده)
    # (بدونِ پنجرهٔ «"جزوه»، عددِ «۳۰۱» در «پاسخنامه کلیدی صفحه: ۳۰۱» هم لنگر می‌شد و Q1-20 را می‌بلعید)
    txt = re.sub(r'\d{3}\s*\n[\s\S]{0,20}?"جزوه[\s\S]*?هم.{0,12}کاران"\s*\n', "\n", txt)
    return txt


def parse_questions(txt: str):
    # دو فرمتِ گزینه: «a.» (Q1-39) و «a)» (Q40+) — الگوی واحد با [.)]‎
    pat = re.compile(
        r'(\d{1,3})\.\s*([\s\S]*?)\n\s*a[.)]\s*([\s\S]*?)\n?\s*b[.)]\s*([\s\S]*?)\n?\s*c[.)]\s*([\s\S]*?)\n?\s*d[.)]\s*([\s\S]*?)(?=\n\s*\d{1,3}\.\s|\Z)',
    )
    qs = {}
    for m in pat.finditer(txt):
        num = int(m.group(1))
        stem, a, b, c, d = (norm(g) for g in m.groups()[1:])
        if num not in qs:  # نخستین رخداد = خودِ سؤال (سؤال‌های دوباره‌شماری‌شدهٔ کلید نداریم اینجا)
            qs[num] = {"stem": stem, "opts": [a, b, c, d]}
    return qs


def main() -> None:
    data = json.loads(PATH.read_text())
    assert data["grade"] == 10
    existing = [b for b in data["lessons"] if b["lesson"] == BANK_NO]
    qs = parse_questions(load_layer())
    missing = [n for n in range(Q_FROM, Q_TO + 1) if n not in qs]
    assert not missing, f"missing: {missing}"

    if existing:
        bank = existing[0]
        assert bank["count"] == Q_TO - Q_FROM + 1
        assert len(bank["questions"]) == bank["count"]
        print("translations changed: 0 — NO-OP")
        return

    questions = []
    for n in range(Q_FROM, Q_TO + 1):
        q = qs[n]
        question = q["stem"]
        if n == 24:  # ران‌های [۷،۱۰،۳،۱] لایه = یک خطِ خط‌چین + نقطهٔ چسبیده (رندر ۱۲۰۰dpi — مجموعِ ۲۱)
            question = re.sub(r"(?:-+\s*){3,}\.", "-" * 21 + ".", question)
            assert "---------------------." in question, question
        questions.append({
            "id": f"g10-l98-{n}",
            "n": n,
            "category": "vocab",
            "question": question,
            "options": q["opts"],
            "answer": KEYMAP[n],
        })

    bank = {
        "lesson": BANK_NO,
        "title": "آموزشی/متوسط — ۳۶۰ تست واژگان درس ۱ تا ۴ — بخش ۱ از ۳ (ص۱۷۸-۱۸۳)",
        "level": "آموزشی/متوسط — چهارگزینه‌ای",
        "count": len(questions),
        "questions": questions,
    }

    # راستی‌آزمایی‌های درونی
    Q = {q["n"]: q for q in bank["questions"]}
    assert len(Q) == 120
    # خلوصِ لاتین
    for q in bank["questions"]:
        body = q["question"] + " ".join(q["options"])
        assert not re.search(r"[آ-ی]", body), f"Persian leaked in Q{q['n']}"
    # تکیه‌گاه‌های معناییِ نمونه (پیش‌پرکردن)
    spot = {1: 0, 2: 3, 3: 0, 6: 3, 7: 1, 24: 3, 25: 1, 40: 0}
    for n, want in spot.items():
        assert Q[n]["answer"] == want, f"spot Q{n}: got {'abcd'[Q[n]['answer']]} want {'abcd'[want]}"
    # چاپ‌غلطِ Q40
    assert Q[40]["options"][2] == "planed", Q[40]["options"]
    # Q24 ادغام‌شده (۲۱ تیرهٔ یکپارچه)
    assert "historical ---------------------." in Q[24]["question"], Q[24]["question"]
    # هر سؤال دست‌کم یک جای‌خالی (به‌جز سؤال‌های بدونِ خط‌چین که پایین شمرده می‌شوند)
    no_blank = [q["n"] for q in bank["questions"] if not re.search(r"-{6,}", q["question"])]
    print("questions without 6+ dash blank:", no_blank)
    # دوگانه‌های فرمت: Q1-39 نقطه‌دار، Q40+ پرانتزدار — در داده اثری ندارد (فقط متن)

    data["lessons"].append(bank)
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    total = sum(b["count"] for b in data["lessons"])
    print(f"bank {BANK_NO} appended: {bank['count']} MCQs | tests-g10 = {total} in {len(data['lessons'])} banks")


if __name__ == "__main__":
    main()
