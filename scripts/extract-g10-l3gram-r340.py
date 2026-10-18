# -*- coding: utf-8 -*-
# r340 — استخراجِ «آزمون تشریحی گرامر درس سوم» جزوهٔ دهم (ص۱۳۱-۱۳۳، کلیدِ چاپیِ ص۲۷۷-۲۷۸)
# به public/jozve/tests-g10.json — هشت بانکِ ۵۸-۶۵ (الگوی r337 — بانک به ازای هر سکشن):
#   ۵۸ شکلِ افعال ۱۰ (دوجای‌خالیِ اسلش‌دار) / ۵۹ جمله‌سازی ۷ / ۶۰ دانشِ گرامری ۷ (تا سه‌جای‌خالی) /
#   ۶۱ was-were + وصلِ ستون B ۵ (ستونِ B درونِ ساقه — کلیدِ دوبخشیِ چاپی «were / c») /
#   ۶۲ پاسخِ کامل ۵ (واریانت‌های چاپیِ we(I)/They/He در accepted — الگوی r336-S9) /
#   ۶۳ ضمیرِ انعکاسی-تأکیدی ۱۰ / ۶۴ پاسخ با ضمایرِ تأکیدی ۵ / ۶۵ جمله‌سازی ۵ = ۵۴ آیتم.
# ۵۴/۵۴ کلیدِ چاپی — صفر واگرایی با پیش‌پرکردنِ معنایی.
# داوری‌های رندر (۳۰۰dpi کامل ×۵ صفحه + ۶۰۰dpi سربرگ‌ها و جدول):
#   - سربرگِ ص۱۳۱ (۶۰۰dpi): «آزمون تشریحی گرامر درس سوم» رنگی + «(پاسخنامه صفحه ۲۷۷ - ۲۷۸)» — ارقامِ فارسی
#     (برخلافِ r339 که «275-276» لاتین بود)
#   - سربرگِ کلیدِ ص۲۷۷ (۶۰۰dpi): «پاسخنامه آزمون تشریحی گرامر درس سوم» + «(آزمون: صفحه ۱۳۱ تا ۱۳۳)»
#   - لایهٔ «تسی یچ» = ششمین تحریفِ تشریحی (r318/r331/r333/r336/r338؛ رندر: «تشریحی» تمیز)
#   - S1 کلید: Q1 «was talking/arrived» چسبیده در برابرِ Q3 «was sleeping/ stole» و Q7 «weren’t listening/ told»
#     فاصله‌دار — ناسازگاریِ اسلشِ خودِ چاپ (در داده با فاصلهٔ یکنواختِ « / » بازسازی شد — قاعدهٔ r337-D)
#   - S3-Q5 «No, I----.» چسبیده به I (۶۰۰dpi) + Q6 «too tired» بدونِ نقطهٔ پایانی — عینِ چاپ
#   - S6-Q9 «let ----in.» چسبیده به in (۶۰۰dpi) — عینِ چاپ
#   - S4 کلیدِ دوبخشیِ چاپی: were/c، Was/e، Was/d، were/b، was/a — حروفِ بزرگِ Was در ۲/۳ (در accepted با شکلِ چاپ)
#   - S5-Q3 «at 19» رقمِ لاتین؛ Q4 کلیدِ «at 8:00 o’clock»؛ S2-Q7 «the window/» چسبیده به اسلش
#   - S7-Q3 کلیدِ «post (do) it myself» — واریانتِ چاپیِ (do) در accepted
# Idempotent: اجرای دوم NO-OP (مبنا = ۵۷ بانکِ r323-r339 / ۷۷۴ آیتم).
import json
import re
from pathlib import Path

PATH = Path("public/jozve/tests-g10.json")

BL = "-" * 24  # تیرهٔ یکنواختِ بازسازی (چاپ ۹-۳۰ متغیر — طولِ تیره محتوایی نیست؛ الگوی r337)

PH_DUAL = "complete both blanks (use / between the two answers)…"
PH_TRI = "complete all blanks (use / between answers)…"
PH_SENT = "make a sentence with the given words…"
PH_FULL = "answer in a full sentence…"
PH_PAIR = "type the verb and the B-letter (e.g. were / c)…"
PH_REF = "complete the answer (emphatic pronoun)…"
PH_PLAIN = "type your answer…"


def typed(bank, n, q, key, distractors, accepted=None, ph=PH_PLAIN):
    return {
        "id": f"g10-l{bank}-{n}", "n": n, "category": "grammar", "kind": "typed",
        "question": q, "options": [key] + distractors, "answer": 0,
        "accepted": accepted or [key], "placeholder": ph,
    }


# ———— سکشن ۱: شکلِ صحیحِ افعال داخل پرانتز (گذشته استمراری یا گذشته ساده) — ۱۰
S1 = [
    (f"Ali {BL} (talk) to Reza when I {BL} (arrive) at the party.",
     "was talking / arrived", ["talked / was arriving", "was talking / was arriving", "talked / arrived"]),
    (f"When the phone {BL} (ring), she {BL} (write) a letter.",
     "rang / was writing", ["rang / wrote", "was ringing / was writing", "was ringing / wrote"]),
    (f"While John {BL} (sleep) last night, someone {BL} (steal) his car.",
     "was sleeping / stole", ["slept / was stealing", "was sleeping / was stealing", "slept / stole"]),
    (f"The computer suddenly {BL} (go) off while he {BL} (wait) for an e-mail.",
     "went / was waiting", ["was going / waited", "was going / was waiting", "went / waited"]),
    (f"It {BL} (start) to rain when we {BL} (have) dinner.",
     "started / were having", ["was starting / had", "was starting / were having", "started / had"]),
    (f"Yesterday at this time, I {BL} (sit) at my desk at work.",
     "was sitting", ["sat", "were sitting", "sit"]),
    (f"You {BL} (not/listen) to me when I {BL} (tell) you to turn the TV off.",
     "weren’t listening / told", ["didn’t listen / was telling", "weren’t listening / was telling", "didn’t listen / told"]),
    (f"You {BL} (study) when she {BL} (call) for dinner.",
     "were studying / called", ["studied / was calling", "were studying / was calling", "studied / called"]),
    (f"What were you {BL} (do) at 11:30 yesterday? Were you {BL} (work)?",
     "doing / working", ["do / work", "did / worked", "doing / work"]),
    (f"A: What did he say? B: I don’t know. I {BL} (not/listen).",
     "wasn’t listening", ["didn’t listen", "don’t listen", "am not listening"]),
]

# ———— سکشن ۲: با استفاده از کلمات داده شده جمله بسازید — ۷
S2 = [
    ("studying / playing / while / outside / he / were / was / we / his lessons.",
     "We were playing outside while he was studying his lessons.",
     ["We were studying his lessons while he was playing outside.",
      "He was playing outside while we were studying his lessons.",
      "While he was studying his lessons we were playing outside."]),
    ("were / hard / to / bird / trying / save / they / the injured.",
     "They were trying hard to save the injured bird.",
     ["They were hard trying to save the injured bird.",
      "They trying hard were to save the injured bird.",
      "The injured bird were trying hard to save they."]),
    ("reading / my father / I / when / was / came in / a book.",
     "I was reading a book when my father came in.",
     ["My father was reading a book when I came in.",
      "I was reading when a book my father came in.",
      "When my father came in I was a book reading."]),
    ("didn’t / it / so / raining / we / was / go out.",
     "It was raining so we didn’t go out.",
     ["It was raining so we didn’t went out.",
      "It raining was so we didn’t go out.",
      "We was raining so it didn’t go out."]),
    ("snowing / when / it / got up / you / was?",
     "Was it snowing when you got up?",
     ["Was you snowing when it got up?",
      "It was snowing when you got up?",
      "Was it got up when you snowing?"]),
    ("doing / at / yesterday / were / you / three o’clock / what?",
     "What were you doing at three o’clock yesterday?",
     ["What were you doing yesterday at three o’clock yesterday?",
      "What you were doing at three o’clock yesterday?",
      "What were doing you at three o’clock yesterday?"]),
    ("the window/ football / were / the boys / they / playing / broke / when.",
     "The boys broke the window when they were playing football.",
     ["The boys were breaking the window when they played football.",
      "They broke the window when the boys were playing football.",
      "The boys broke the window when they playing were football."]),
]

# ———— سکشن ۳: جملات زیر را با استفاده از دانش گرامری خود کامل کنید — ۷
S3 = [
    (f"It was a beautiful morning. The sun {BL} shining, and the birds {BL} singing.",
     "was / were", ["is / are", "were / was", "was / is"]),
    (f"I didn’t see you yesterday. Where {BL} you?",
     "were", ["was", "are", "did"]),
    (f"I {BL} having a shower. That’s why I {BL} answer the phone.",
     "was / didn’t", ["was / don’t", "were / didn’t", "was / wasn’t"]),
    (f"I was writing a report {BL} she was playing the piano.",
     "while", ["when", "so", "but"]),
    (f"A: {BL} you watching the film at nine o’clock last night? B: No, I{BL}. I {BL} reading a book.",
     "Were / wasn’t / was", ["Was / wasn’t / were", "Were / wasn’t / were", "Was / wasn’t / was"]),
    (f"A: {BL} you go out last night? B: No, I {BL} too tired",
     "Did / was", ["Were / was", "Did / were", "Was / was"]),
    (f"This time last year I {BL} living in Dubai.",
     "was", ["am", "were", "is"]),
]

# ———— سکشن ۴: was یا were + جوابِ مناسب از ستون B — ۵ (ستونِ B درونِ ساقه)
B_COL = "a. Because he was late. / b. I was asleep. / c. In Shiraz. / d. No, it was sunny. / e. No, he wasn’t."
S4_PREFIX = "سؤالِ ستون A را با was یا were کامل کنید و جوابِ مناسب را از ستون B انتخاب کنید — "
S4 = [
    (f"{S4_PREFIX}Where {BL} they living in 1995? ({B_COL})",
     "were / c", ["Was / e", "Was / d", "was / b"]),
    (f"{S4_PREFIX}{BL} your father wearing a suit yesterday? ({B_COL})",
     "Was / e", ["were / c", "Was / d", "was / b"]),
    (f"{S4_PREFIX}{BL} it raining when you got up? ({B_COL})",
     "Was / d", ["were / c", "Was / e", "was / b"]),
    (f"{S4_PREFIX}What {BL} you doing at 3 o’clock? ({B_COL})",
     "were / b", ["Was / e", "Was / d", "was / a"]),
    (f"{S4_PREFIX}Why {BL} your brother driving so fast? ({B_COL})",
     "was / a", ["Were / c", "Was / e", "was / b"]),
]

# ———— سکشن ۵: با استفاده از کلمات داخل پرانتز به سؤالات زیر پاسخ کامل دهید — ۵
S5 = [
    ("What were they doing when you arrived? (have / dinner)",
     "They were having dinner when we arrived.",
     ["They were having dinner when I arrived.",
      "They was having dinner when we arrived.",
      "They were having dinner when you arrived."],
     ["They were having dinner when we arrived.", "They were having dinner when I arrived."]),
    ("What were the students doing when the teacher came in? (do / homework)",
     "The students were doing their homework when the teacher came in.",
     ["The students were doing their homework when the teacher comes in.",
      "They were doing their homework when the teacher came in.",
      "The students was doing their homework when the teacher came in."],
     ["The students were doing their homework when the teacher came in.",
      "They were doing their homework when the teacher came in."]),
    ("What were you doing at 19 yesterday evening? (listen / music)",
     "I was listening to the music at 19 yesterday evening.",
     ["I was listening to music at 19 yesterday evening.",
      "I listened to the music at 19 yesterday evening.",
      "I was listening to the music in 19 yesterday evening."],
     None),
    ("What time was your brother studying English yesterday? (8:00)",
     "My brother was studying English at 8:00 o’clock yesterday.",
     ["My brother was studying English in 8:00 o’clock yesterday.",
      "He was studying English at 8:00 o’clock yesterday.",
      "My brother studied English at 8:00 o’clock yesterday."],
     ["My brother was studying English at 8:00 o’clock yesterday.",
      "He was studying English at 8:00 o’clock yesterday."]),
    ("Did you break your leg while you were playing football? (yes)",
     "Yes, I broke my leg while I was playing football.",
     ["Yes, I break my leg while I was playing football.",
      "Yes, I was breaking my leg while I played football.",
      "No, I broke my leg while I was playing football."],
     None),
]

# ———— سکشن ۶: با استفاده از ضمیر انعکاسی و تأکیدی مناسب جاهای خالی را پر کنید — ۱۰
S6 = [
    (f"My brother cut {BL} with a knife in the kitchen.",
     "himself", ["herself", "themselves", "itself"]),
    (f"Her classmate fell off her bicycle yesterday, but she didn’t hurt {BL}.",
     "herself", ["himself", "themselves", "yourself"]),
    (f"They had a nice time. They enjoyed {BL}.",
     "themselves", ["themself", "ourselves", "himself"]),
    (f"We had a good vacation. We enjoyed {BL}.",
     "ourselves", ["themselves", "ourself", "myself"]),
    (f"I went on vacation by {BL}.",
     "myself", ["himself", "themselves", "me"]),
    (f"Let’s paint the house {BL}. It will be much cheaper.",
     "ourselves", ["ourself", "themselves", "us"]),
    (f"Asghar Farhadi’s new film {BL} was very good, but I didn’t like the music.",
     "itself", ["himself", "themself", "oneself"]),
    (f"What I did was really bad. I’m ashamed of {BL}.",
     "myself", ["meself", "itself", "himself"]),
    (f"I gave them a key to our house so that they could let {BL}in.",
     "themselves", ["them", "ourself", "himself"]),
    (f"A: Can I take another biscuit? B: Of course. Help {BL}!",
     "yourself", ["yourselves", "himself", "you"]),
]

# ———— سکشن ۷: با استفاده از ضمایر تأکیدی به سؤالات زیر جواب دهید — ۵
S7 = [
    ("Who fixed the bicycle for you? — Nobody. I ------------------------.",
     "myself fixed it", ["myself fixed them", "me fixed it", "myself did it"]),
    ("Who cuts his hair for him? — Nobody. He cuts ------------------------.",
     "his hair himself", ["his hair hisself", "him hair himself", "his hair him"]),
    ("Do you want me to post that letter for you? — No, I’ll ------------------------.",
     "post (do) it myself",
     ["post it youself", "you post it myself", "post it itself"],
     ["post it myself", "do it myself", "post (do) it myself"]),
    ("Who told you that Ali was going away? — Ali ------------------------.",
     "himself told me", ["told me himself did", "himself told you", "told me him"]),
    ("Can you phone Reza for me? — Why can’t you ------------------------?",
     "phone him yourself", ["phone him your self", "phone you himself", "phone you yourself"]),
]

# ———— سکشن ۸: با استفاده از کلمات زیر جمله بسازید — ۵
S8 = [
    ("themselves / did / scientists / experiment / the / the.",
     "The scientists themselves did the experiment.",
     ["The scientists did the experiment themselves the.",
      "The experiment themselves did the scientists.",
      "Scientists the themselves did the experiment."]),
    ("cleaned / mother / herself / my / room / by / the.",
     "My mother cleaned the room by herself.",
     ["My mother cleaned herself the room by.",
      "The mother cleaned my room by herself.",
      "My mother cleaned the room by herselves."]),
    ("myself / my / I / homework / did.",
     "I did my homework myself.",
     ["I did myself my homework.",
      "My homework did I myself.",
      "I my homework did meself."]),
    ("a / for / baked / we / cake / ourselves / big.",
     "We baked a big cake for ourselves.",
     ["We baked ourselves a big cake for.",
      "We baked a big cake for ourself.",
      "A big cake baked we for ourselves the."]),
    ("the / they / painted / walls / themselves.",
     "They themselves painted the walls.",
     ["They painted themselves the walls.",
      "The walls painted they themselves.",
      "They themselves painted walls the."]),
]

SECTIONS = [
    (58, "بخش ۱ — شکلِ صحیحِ افعال داخل پرانتز (ص۱۳۱)", "تشریحی — تایپیِ دوجای‌خالیِ اسلش‌دار", S1, PH_DUAL),
    (59, "بخش ۲ — جمله‌سازی با کلماتِ داده شده (ص۱۳۱)", "تشریحی — تایپی جمله‌سازی", S2, PH_SENT),
    (60, "بخش ۳ — کامل‌کردن با دانشِ گرامری (ص۱۳۱-۱۳۲)", "تشریحی — تایپی (تا سه‌جای‌خالیِ اسلش‌دار)", S3, PH_TRI),
    (61, "بخش ۴ — was/were + وصلِ ستون B (ص۱۳۲)", "تشریحی — تایپی دوبخشی (فعل + حرفِ ستون B)", S4, PH_PAIR),
    (62, "بخش ۵ — پاسخِ کامل با کلماتِ پرانتز (ص۱۳۲)", "تشریحی — تایپی پاسخِ کامل", S5, PH_FULL),
    (63, "بخش ۶ — ضمیرِ انعکاسی و تأکیدی (ص۱۳۲)", "تشریحی — تایپی", S6, PH_PLAIN),
    (64, "بخش ۷ — پاسخ با ضمایرِ تأکیدی (ص۱۳۳)", "تشریحی — تایپی", S7, PH_REF),
    (65, "بخش ۸ — جمله‌سازی با ضمایرِ تأکیدی (ص۱۳۳)", "تشریحی — تایپی جمله‌سازی", S8, PH_SENT),
]

# کلیدهای چاپیِ ص۲۷۷-۲۷۸ (رونویسیِ رندر — قفلِ مستقلِ گارد)
PRINTED_KEYS = {
    58: ["was talking/arrived", "rang/was writing", "was sleeping/ stole", "went/was waiting",
         "started/were having", "was sitting", "weren’t listening/ told", "were studying/called",
         "doing/working", "wasn’t listening"],
    59: ["We were playing outside while he was studying his lessons.",
         "They were trying hard to save the injured bird.",
         "I was reading a book when my father came in.",
         "It was raining so we didn’t go out.",
         "Was it snowing when you got up?",
         "What were you doing at three o’clock yesterday?",
         "The boys broke the window when they were playing football."],
    60: ["was/were", "were", "was/didn’t", "while", "Were/wasn’t/was", "Did/was", "was"],
    61: ["were/c", "Was/e", "Was/d", "were/b", "was/a"],
    62: ["They were having dinner when we (I) arrived.",
         "The students (They) were doing their homework when the teacher came in.",
         "I was listening to the music at 19 yesterday evening.",
         "My brother (He) was studying English at 8:00 o’clock yesterday.",
         "Yes, I broke my leg while I was playing football."],
    63: ["himself", "herself", "themselves", "ourselves", "myself",
         "ourselves", "itself", "myself", "themselves", "yourself"],
    64: ["myself fixed it", "his hair himself", "post (do) it myself", "himself told me", "phone him yourself"],
    65: ["The scientists themselves did the experiment.",
         "My mother cleaned the room by herself.",
         "I did my homework myself.",
         "We baked a big cake for ourselves.",
         "They themselves painted the walls."],
}


def expand_variants(printed: str):
    """قراردادِ چاپ «واژه (جایگزین)»: «we (I) arrived» → {we arrived، I arrived}؛
    «post (do) it myself» → {post it myself، do it myself} — بسطِ بازگشتی"""
    m = re.search(r'((?:the|a|an|my|his|her|their|our|its|your)\s+)?(\S+)\s*\(([^)]+)\)', printed, re.IGNORECASE)
    if not m:
        return {norm(printed)}
    article, word, inner = m.group(1) or "", m.group(2), m.group(3)
    a = printed[:m.start()] + article + word + printed[m.end():]   # پایه: حذفِ پرانتز
    b = printed[:m.start()] + inner + printed[m.end():]            # جایگزینیِ گروهِ اسمیِ کامل
    return expand_variants(a) | expand_variants(b)


def norm(s: str) -> str:
    # بازسازیِ نرمال‌سازیِ موتورِ تایپی (src/lib/typed-answer.ts) برای قفلِ کلید
    # + فروپاشیِ فاصله (بازسازیِ اسلشِ یکنواخت) + حذفِ پرانتز (واریانت‌های چاپیِ we (I)/post (do))
    return " ".join(
        s.lower().replace("’", "'").replace("/", " ")
        .replace("(", "").replace(")", "").split()
    )


def main():
    data = json.loads(PATH.read_text(encoding="utf-8"))
    existing = [l for l in data["lessons"] if l["lesson"] >= 58]
    if existing:
        print(f"lessons 58+ already present ({sum(l['count'] for l in existing)} items) — NO-OP")
        if data["source"].get("l3gram") is None:
            data["source"]["l3gram"] = RECEIPT
            PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print("source.l3gram refreshed")
        return
    assert len(data["lessons"]) == 57, f"baseline mismatch: {len(data['lessons'])} banks"
    assert sum(l["count"] for l in data["lessons"]) == 774, "baseline item count mismatch"

    for lesson, title, level, items, ph in SECTIONS:
        qs = []
        for i, entry in enumerate(items, 1):
            if len(entry) == 4:
                q, key, distractors, accepted = entry
            else:
                q, key, distractors = entry
                accepted = None
            assert distractors, f"bank {lesson} Q{i}: no distractors"
            qs.append(typed(lesson, i, q, key, distractors, accepted, ph))
            # قفلِ کلید: بسطِ واریانت‌های پرانتزیِ کلیدِ چاپ (we (I) → we / we i)؛
            # accepted[0] باید یکی از واریانت‌ها باشد و هر واریانت باید در accepted پوشیده شود
            printed = PRINTED_KEYS[lesson][i - 1]
            acc = accepted or [key]
            variants = expand_variants(printed)
            first = acc[0]
            assert norm(first) in variants, \
                f"bank {lesson} Q{i}: accepted[0]={first!r} not in printed variants {sorted(variants)!r}"
            for v in variants:
                assert any(norm(a) == v for a in acc), \
                    f"bank {lesson} Q{i}: printed variant {v!r} not covered by accepted {acc!r}"
        data["lessons"].append({
            "lesson": lesson, "title": title, "level": level,
            "count": len(qs), "questions": qs,
        })

    data["source"]["l3gram"] = RECEIPT

    assert len(data["lessons"]) == 65, f"post mismatch: {len(data['lessons'])} banks"
    total = sum(l["count"] for l in data["lessons"])
    assert total == 828, f"total {total} != 828"
    ids = [q["id"] for l in data["lessons"] for q in l["questions"]]
    assert len(ids) == len(set(ids)) == 828

    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: banks 58-65 added — {total} items in {len(data['lessons'])} banks")
    for lesson, title, level, items, ph in SECTIONS:
        print(f"  bank {lesson}: {title} — {len(items)}")


RECEIPT = {
    "exam": "آزمون تشریحی گرامر درس سوم (ص۱۳۱-۱۳۳)",
    "header": "سربرگِ ص۱۳۱ (رندرِ ۶۰۰dpi): «آزمون تشریحی گرامر درس سوم» رنگی + «(پاسخنامه صفحه ۲۷۷ - ۲۷۸)» — ارقامِ فارسیِ چاپ (برخلافِ r339 با «275-276» لاتین)؛ سربرگِ کلیدِ ص۲۷۷: «پاسخنامه آزمون تشریحی گرامر درس سوم» + «(آزمون: صفحه ۱۳۱ تا ۱۳۳)» — لایهٔ «تسی یچ» = ششمین تحریفِ «تشریحی» (رندر: تمیز)؛ هشت سکشنِ ۱-۸ با سربرگِ رنگیِ هلوئی و ارقامِ قرمزِ فارسی؛ پاصفحهٔ ص۱۳۳: «جزوه جامع زبان انگلیسی پایه دهم» + «تألیف و گردآوری: جمال احمدی و همکاران» + «Vision One»",
    "keyPages": "277-278",
    "keyVerification": "کلیدِ چاپیِ کاملِ ص۲۷۷-۲۷۸ — ۵۴/۵۴ آیتم (۵۸: ۱۰، ۵۹: ۷، ۶۰: ۷، ۶۱: ۵، ۶۲: ۵، ۶۳: ۱۰، ۶۴: ۵، ۶۵: ۵) با پیش‌پرکردنِ معنایی هم‌رأی — صفر واگرایی؛ کلیدهای اسلش‌دارِ چاپ («was talking/arrived»، «was/were»، «Were/wasn’t/was»، «were/c») با فاصلهٔ یکنواختِ « / » بازسازی شدند (ناسازگاریِ اسلشِ خودِ چاپ: Q1 چسبیده در برابرِ Q3/Q7 فاصله‌دار)؛ حروفِ بزرگِ «Was» در S4-Q2/Q3 عینِ چاپ در accepted (نرمال‌سازِ موتور کوچک‌سازی می‌کند)؛ واریانت‌های پرانتزیِ چاپِ S5 (we (I)/students (They)/brother (He)) و S7-3 «post (do)» در accepted — الگوی r336-S9",
    "pattern": "r337 (بانک به ازای خانوادهٔ سکشن — ۸ بانک) + r337-D/r333-S3 (کلیدِ اسلش‌دارِ دوجای‌خالی) + r337-L52 (ساقهٔ خودبسنده با ستونِ درون‌خطی برای S4) + r336-S9 (واریانت‌های چاپی در accepted) + r337-K (جمله‌سازی) + r323/r326 (تایپی)",
    "printQuirks": [
        "سربرگ‌ها با ارقامِ فارسی: «(پاسخنامه صفحه ۲۷۷ - ۲۷۸)» و «(آزمون: صفحه ۱۳۱ تا ۱۳۳)» — برخلافِ r339 (لاتین)",
        "S1 کلید: Q1 «was talking/arrived» چسبیده در برابرِ Q3 «was sleeping/ stole» و Q7 «weren’t listening/ told» فاصله‌دار — ناسازگاریِ اسلشِ خودِ چاپ (۶۰۰dpi)؛ در داده فاصلهٔ یکنواخت",
        "S1-Q9 دو تیره با طولِ متفاوت در چاپ (اولی ~۱۹، دومی ~۲۴) + «11:30» با رقمِ لاتین و دونقطه — تیره‌ها یکنواخت شدند (BL؛ الگوی r337)",
        "S2-Q7 «the window/» بدونِ فاصله قبل از اسلش — عینِ چاپ (سایر توکن‌ها فاصله‌دار)",
        "S3-Q5 «B: No, I----.» تیرهٔ اول چسبیده به I بدونِ فاصله (۶۰۰dpi) — عینِ چاپ؛ کلیدِ سه‌جای‌خالیِ «Were/wasn’t/was» با فاصله بعد از «5.» در گرید — یکتا در گرید",
        "S3-Q6 «B: No, I --- too tired» بدونِ نقطهٔ پایانی — عینِ چاپ (برخلافِ سایر آیتم‌ها)",
        "S4 جدولِ دوستونیِ A/B (A سبزِ سربرگ، B سایه‌های زردِ یکی‌درمیان)؛ کلیدِ دوبخشیِ چاپی «were/c، Was/e، Was/d، were/b، was/a» — در داده ستونِ B درونِ ساقه می‌آید (موتورِ تایپی گزینه رندر نمی‌کند — ساقهٔ خودبسنده؛ الگوی r337-L52) و accepted دوبخشی است",
        "S5-Q3 «at 19» رقمِ لاتین (یعنی ساعت ۱۹:۰۰) — عینِ چاپ؛ Q4 کلیدِ «at 8:00 o’clock» با دونقطه؛ سطرِ پاسخِ Q2 «2-------.» بدونِ نقطه بعد از شماره",
        "S6-Q9 «let ----in.» تیره چسبیده به in بدونِ فاصله (۶۰۰dpi) — عینِ چاپ؛ Q10 دیالوگِ دوخطیِ A/B با «!»",
        "S7 کلیدها فقط محتوای تیره‌اند (خودِ جمله در ساقه): «myself fixed it» و غیره؛ Q3 «post (do) it myself» با واریانتِ پرانتزیِ چاپ — هر سه شکل در accepted؛ Q5 ساقه با «?» پایانی (برخلافِ Q1-4 با «.»)",
        "S6-Q7 «Asghar Farhadi’s new film ---» کلیدِ «itself» — اشاره به خودِ فیلم (غیرِ انسان)؛ نامِ خاصِ بومی (قرینهٔ رویکردِ بوکانیِ جزوه)",
        "جعبهٔ «Note:» زردِ پاصفحهٔ ص۱۳۳ با عنوانِ قرمز و ۱۰ خطِ خط‌چین (پاصفحهٔ ص۲۷۸ با ۱۳ خط) — بینِ جعبه‌های ۴خطیِ r334/r338 و ۱۶خطیِ r339",
        "لایهٔ «تسی یچ» (ششمین تکرار) + «جمالت/خایل/انعکایس/پرانی ن» — تحریف‌های استانداردِ لایه؛ رندر همه را تمیز می‌کند",
        "سکشن‌های چاپ با ارقامِ فارسیِ قرمز (۱ تا ۸) و سربرگِ هلوئیِ خطِ آبی؛ آیتم‌ها با ارقامِ قرمزِ لاتین (1 تا 10)",
    ],
    "extractedRound": "r340",
}


if __name__ == "__main__":
    main()
