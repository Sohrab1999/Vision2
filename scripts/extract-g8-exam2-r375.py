#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r375 — ادامهٔ کارتِ تستِ پایهٔ هشتم: «نمونه سؤالات امتحانی درس دوم» (pdf-p27)
→ tests-g8.json با ۴ بانکِ تازه/۱۱ آیتم (۳ بانکِ r374 + ۴ بانکِ این راند = ۷ بانک/۲۱ آیتم)

خانوادهٔ ۲ (درس دوم، ص۲۷ — ۵ سکشن) — ۴ بانک/۱۱ آیتم:
  س۱ (۲ MCQ چهارگزینه‌ایِ فرگمنت) — «با توجه به تصاویر املاي کلمات را کامل کنید»:
      فرگمنت‌ها فقط در رندرند (لایه بینِ تیترِ س۱ و «2)» خالی است — الگویِ رندر-فقطِ
      r372-بانک۱۵/r373-بانک۱۶) و از رندرِ ۱۵۰dpi رونویسی شدند:
      go sh-------ing → shopping (لنگر: Go shopping* فهرستِ واژگانِ درس دوم L1341 ص۱۹)
      go to l-------br-------y → library (لنگر: library* L1373 ص۱۹)
      واژه از خودِ فرگمنت + اصطلاحِ «go shopping/go to the library» در محدودهٔ درس دوم یکتاست
      (تصویر فقط تأیید) — الگویِ r373-س۲ «فرگمنت بی‌تصویر کلیدپذیر».
  س۲ (۵ MCQ پنج‌گزینه‌ای با بانکِ چاپیِ بدونِ اضافی) — «با کلمات داده شده جملات ناقص زیر
      را کامل کنید (Mountain – know – pronunciation – relax – relative)» — ۵ واژه برای
      ۵ بلنک، هیچ اضافی نیست (برخلافِ r374-بانک۲ دواضعی):
      1) I stay at home and ------- on Fridays. → relax (لنگر: relax* L1397 + دیالوگ
         L1439 «I stay at home and relax.»)
      2) What is the correct ------- for " study"? → pronunciation (لنگر: دیالوگِ ص۲۳
         L1625 «The correct pronunciation is ‘study’.»)
      3) I climb a ------- on Sunday’s morning. → Mountain (لنگر: climb a mountain* L1388 ص۱۹)
      4) We visit our ------- on thursday. → relative (لنگر: Visit relative* L1348 +
         L1503 «I visit my relatives.»)
      5) That is fine. I will let her ------- → know (لنگر: I’ll let her know L1368 +
         L1456 «That’s fine. Thank you. I’ll let her know.»)
  س۳ (۳ MCQ سه‌گزینه‌ایِ درون‌چاپی) — «جواب صحیح را انتخاب کنید»:
      1) ------- is the weekend. (Saturday – wednesday – Friday) → Friday — تنها روزِ آخرِ
         هفته در گزینه‌ها؛ «نکته۲» ص۲۶ (L1844): «دو روز آخر هفته را Weekend می نامیم» +
         Time Expressions ص۲۰ (The Weekend/آخر هفته).
      2) I study my ------- in the morning. (Lessons – well – library) → Lessons
         (لنگر: study lesson* L1311 ص۱۹)
      3) What is شروع کردن in English? It is ------- (help – start – stay) → start
         (ساقهٔ فارسیِ چاپ — الگویِ g7-بانک۸/r374-بانک۳؛ لنگر: start «شروع» L1404-۱۴۰۶ ص۱۹ +
         دیالوگِ L1449 «When can you start?» / «کی می توانی شروع کنی؟»)
  س۴ (۱ MCQ چهارگزینه‌ایِ ناهماهنگ) — «کلمه ناهماهنگ را در هر ردیف مشخص کنید»:
      ردیفِ ۲: Monday – Sunday – midday – Friday → midday (تنها واژهٔ غیرِ روزِ هفته؛
      لنگر: noon (midday) L1758 ص۲۵ خودِ جزوه midday را برابرِ noon می‌گیرد و Monday*/Sunday*/
      Friday* در جدولِ واژگان‌اند).
  مستثنیِ آیتمی (۱): س۱-«T____sd__y» — دوکلیدی: Tuesday و Thursday هر دو در فهرستِ واژگانِ
      درس دوم‌اند (Tuesday* L1344 / Thursday* L1339) و فرگمنت هر دو را می‌پذیرد؛ فقط تصویرِ
      تقویم («سه شنبه ۲۲ آبان» در رندرِ ۱۵۰dpi) تعیین‌کننده است → تصویری-کلید.
  مستثنیِ آیتمی (۲): س۴-ردیفِ ۱ «Midday – midnight – sunset – noon» — دوکلیدی: midnight
      (تنها واژهٔ شب) و sunset (تنها واژهٔ بدونِ زمانِ ثابتِ ساعت‌شمار؛ midday=noon از
      L1758) هر دو قابلِ دفاع‌اند و لنگرِ تعیین‌کننده‌ای در جزوه نیست.
  مستثنیِ سکشنی: س۵ «درستی یا نادرستی هر عبارت را با استفاده از [تصاویر] مشخص نمایید» —
      دو آیتمِ تصویری: «He's relaxing.» [پسرِ در حالِ بالا رفتن از درخت] → غ؛
      «Sam is watching TV» [پسرِ تماشاچیِ تلویزیون] → ص — حکم فقط از تصویر.
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g8.json"
LAYER = ROOT / "booklet-extract/g8.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g8exam2" in d.get("source", {}):
    print("r375: receipt g8exam2 already present — NO-OP")
    raise SystemExit(0)
assert d and "g8exam1" in d.get("source", {}), "tests-g8.json (r374) must exist first"

layer = LAYER.read_text(encoding="utf-8").split("\n")
PM = {}
for i, l in enumerate(layer):
    m = re.match(r"<<<PAGE (\d+)>>>", l)
    if m: PM[int(m.group(1))] = i


def page_slice(p: int) -> list[str]:
    s = PM[p]
    e = next((v for q, v in sorted(PM.items()) if q > p), len(layer))
    return layer[s:e]


def norm(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[….]{3,}", "-------", s)
    s = re.sub(r"-------(?=[A-Za-z])", "------- ", s)
    return s


def q(id_: str, n: int, category: str, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": category, "question": question, "options": options, "answer": answer}


def place(bank: list[str], key: str, target: int) -> tuple[list[str], int]:
    rest = [w for w in bank if w != key]
    assert len(rest) == len(bank) - 1
    return rest[:target] + [key] + rest[target:], target


p27 = page_slice(27)

# ————— پیمانِ لایه: لنگرها در صفحاتِ ۱-۲۶ (پیش از خانواده) —————
head = "\n".join(layer[: PM[27]])
for anchor in [
    r"Go shopping\*", r"library\*", r"relax\*", r"climb a mountain\*", r"Visit relative\*",
    r"I’ll let her know", r"The correct pronunciation is ‘study’\.", r"weekend\*",
    r"noon \(midday\)", r"Tuesday\*", r"Thursday\*", r"study lesson\*",
]:
    assert re.search(anchor, head), f"anchor missing before p27: {anchor}"

# ————— پیمانِ لایهٔ ص۲۷: بانکِ چاپی، ساقه‌ها، گزینه‌های درون‌چاپی، دو ردیفِ ناهماهنگ —————
BANK_RE = re.compile(r"\((Mountain[^)]*)\)")
bank_line = next(l for l in p27 if BANK_RE.search(l))
B5 = [w.strip() for w in BANK_RE.search(bank_line).group(1).split("–")]
assert B5 == ["Mountain", "know", "pronunciation", "relax", "relative"], B5

S2_RE = re.compile(r"^([1-5])\)\s*(.+?)\s*$")
s2_stems: dict[str, str] = {}
for line in p27:
    m = S2_RE.match(line.strip())
    if m and ("…" in line or "..." in line) and not re.search(r"\([^)]*\)\s*$", line):
        s2_stems[m.group(1)] = norm(f"{m.group(1)}) {m.group(2)}")
assert set(s2_stems) == {"1", "2", "3", "4", "5"}, f"p27-S2 stems incomplete: {sorted(s2_stems)}"
assert s2_stems["1"] == "1) I stay at home and ------- on Fridays.", s2_stems["1"]
assert s2_stems["2"] == '2) What is the correct ------- for " study"?', s2_stems["2"]
assert s2_stems["3"] == "3) I climb a ------- on Sunday’s morning.", s2_stems["3"]
assert s2_stems["4"] == "4) We visit our ------- on thursday.", s2_stems["4"]
assert s2_stems["5"] == "5) That is fine. I will let her -------", s2_stems["5"]

S3_RE = re.compile(r"^([1-3])\)\s*(.+?)\s*\(([^)]+)\)\s*$")
s3_items: list[tuple[str, list[str]]] = []
for line in p27:
    m = S3_RE.match(line.strip())
    if m and ("…" in line):
        stem = norm(f"{m.group(1)}) {m.group(2)}").rstrip()
        opts = [w.strip() for w in re.split(r"\s[-–]\s", m.group(3))]
        s3_items.append((stem, opts))
assert len(s3_items) == 3, f"p27-S3 items incomplete: {s3_items}"
assert s3_items[0] == ("1) ------- is the weekend.", ["Saturday", "wednesday", "Friday"]), s3_items[0]
assert s3_items[1] == ("2) I study my ------- in the morning.", ["Lessons", "well", "library"]), s3_items[1]
assert s3_items[2] == ("3) What is شروع کردن in English? It is -------", ["help", "start", "stay"]), s3_items[2]

S4_RE = re.compile(r"^(Midday|Monday)\b.*")
s4_rows: list[str] = []
for line in p27:
    if S4_RE.match(line.strip()):
        left = re.split(r"\s{2,}", line.strip())[0]
        s4_rows.append(norm(left))
assert s4_rows == ["Midday – midnight – sunset – noon", "Monday – Sunday – midday – Friday"], s4_rows
row2 = s4_rows[1]
row2_words = row2.split(" – ")
assert row2_words == ["Monday", "Sunday", "midday", "Friday"] and "midday" in row2_words

# ————— بانک ۴ — خ۲/س۱: دو فرگمنتِ رندر-فقط (رونویسی از رندرِ ۱۵۰dpi ص۲۷) —————
# فرگمنت‌ها در لایه نیستند؛ گاردِ راند «عدمِ حضور در لایه» را اثبات می‌کند.
FRAG_SHOP = "go sh-------ing"          # چاپ: «go sh______ing» — یک بلنکِ درون‌واژه
FRAG_LIB = "go to l-------br-------y"  # چاپ: «go to l__br____y» — دو بلنکِ جدای درون‌واژه
assert FRAG_SHOP not in head and FRAG_LIB not in head, "fragments must be render-only"
Q4 = [
    q("g8-l4-1", 1, "vocab", FRAG_SHOP, ["shopping", "weekend", "relative", "mountain"], 0),
    q("g8-l4-2", 2, "vocab", FRAG_LIB, ["Saturday", "pronunciation", "library", "weekend"], 2),
]

# ————— بانک ۵ — خ۲/س۲: بانکِ چاپیِ ۵واژه‌ایِ بدونِ اضافی — کلیدها [1,3,0,2,4] —————
Q5 = [
    q("g8-l5-1", 1, "vocab", s2_stems["1"], *place(B5, "relax", 1)),
    q("g8-l5-2", 2, "vocab", s2_stems["2"], *place(B5, "pronunciation", 3)),
    q("g8-l5-3", 3, "vocab", s2_stems["3"], *place(B5, "Mountain", 0)),
    q("g8-l5-4", 4, "vocab", s2_stems["4"], *place(B5, "relative", 2)),
    q("g8-l5-5", 5, "vocab", s2_stems["5"], *place(B5, "know", 4)),
]
assert [it["options"][it["answer"]] for it in Q5] == ["relax", "pronunciation", "Mountain", "relative", "know"]

# ————— بانک ۶ — خ۲/س۳: سه MCQ درون‌چاپی — کلیدها Friday/Lessons/start در [2,0,1] —————
Q6 = [
    q("g8-l6-1", 1, "vocab", s3_items[0][0], s3_items[0][1], 2),  # Friday
    q("g8-l6-2", 2, "vocab", s3_items[1][0], s3_items[1][1], 0),  # Lessons
    q("g8-l6-3", 3, "vocab", s3_items[2][0], s3_items[2][1], 1),  # start
]
assert [it["options"][it["answer"]] for it in Q6] == ["Friday", "Lessons", "start"]

# ————— بانک ۷ — خ۲/س۴: ردیفِ ۲ ناهماهنگ (ردیفِ ۱ دوکلیدی — مستثنیِ آیتمی) —————
Q7 = [q("g8-l7-1", 1, "vocab", row2, row2_words, row2_words.index("midday"))]

# ————— الحاقِ ۴ بانک به فایلِ موجود —————
d["lessons"] += [
    {"lesson": 4, "title": "امتحانی درس دوم — کامل‌کردن حروف (س۱، ص۲۷)", "level": "چهارگزینه‌ای", "count": len(Q4), "questions": Q4},
    {"lesson": 5, "title": "امتحانی درس دوم — تکمیل با بانک واژه (س۲، ص۲۷)", "level": "پنج‌گزینه‌ای", "count": len(Q5), "questions": Q5},
    {"lesson": 6, "title": "امتحانی درس دوم — گزینهٔ صحیح (س۳، ص۲۷)", "level": "سه‌گزینه‌ای", "count": len(Q6), "questions": Q6},
    {"lesson": 7, "title": "امتحانی درس دوم — کلمهٔ ناهماهنگ (س۴، ص۲۷)", "level": "چهارگزینه‌ای", "count": len(Q7), "questions": Q7},
]

d["source"]["g8exam2"] = {
    "extractedRound": "r375",
    "section": "نمونه سؤالات امتحانی درس دوم پایه هشتم",
    "examPages": "pdf-p27 (تک‌صفحه‌ای) — ص۲۸ واژگانِ درس سوم است و مرزِ پایینیِ خانواده",
    "keyPages": "هیچ پاسخنامهٔ چاپی در جزوهٔ هشتم نیست — کلیدها استنتاجی؛ لنگرهای س۲ همگی از خودِ درسِ دوم (جدولِ واژگانِ ص۱۹ + دیالوگ‌های ص۱۹-۲۳) و س۳-۱ از «نکته۲» ص۲۶",
    "sectionsTotal": 5,
    "sectionsExtracted": 4,
    "sectionsSkipped": 1,
    "items": 11,
    "bankCounts": [2, 5, 3, 1],
    "wordBank": ["Mountain", "know", "pronunciation", "relax", "relative"],
    "wordBankSource": "پرانتزِ چاپیِ سکشنِ س۲ ص۲۷ (لایه) — ۵ واژه برای ۵ بلنک بدونِ اضافی (برخلافِ r374-بانک۲ دواضعی)؛ کلیدِ «pronunciation» بیرونِ جدولِ واژگان ولی در دیالوگِ ص۲۳ چاپ است",
    "keyPolicy": "س۱: واژه از خودِ فرگمنت + اصطلاحِ درسِ دوم یکتا (تصویر تأیید) با لنگرِ Go shopping*/library*؛ س۲: نگاشتِ یکتای بانک-به-بلنک با پنج لنگرِ درس‌درون؛ س۳: Friday تنها روزِ آخرِ هفته در گزینه‌ها (نکته۲ ص۲۶)، Lessons لنگردارِ study lesson*، start لنگردارِ «شروع» ص۱۹؛ س۴: midday تنها غیرِ روزِ هفته (noon (midday) ص۲۵)",
    "engineNote": "بانکِ ۶ آیتمِ ۳ ساقهٔ فارسیِ چاپ دارد (شروع کردن — الگویِ g7-بانک۸/r374-بانک۳) و استثنای خلوصِ لاتین است؛ فرگمنت‌های س۱ رندر-فقط‌اند (لایه خالی — الگویِ r372-بانک۱۵/r373-بانک۱۶) و گزینه‌ها واژهٔ کامل‌اند نه حرف (برخلافِ g7-بانک۱۷) چون بلنکِ میانیِ چندحرفی است؛ شماره‌گذاریِ «1)» چاپیِ س۲/س۳ verbatim ماند",
    "derivedKeys": {
        "S1": ["shopping", "library"],
        "S2": ["relax", "pronunciation", "Mountain", "relative", "know"],
        "S3": ["Friday", "Lessons", "start"],
        "S4": ["midday"],
    },
    "skippedSections": [
        "ص۲۷-س۱-آیتمِ «T____sd__y» — دوکلیدی: Tuesday/Thursday هر دو در فهرستِ واژگانِ درس دوم (Tuesday* ص۱۹ / Thursday* ص۱۹) و فرگمنت هر دو را می‌پذیرد؛ فقط تصویرِ تقویمِ «سه شنبه ۲۲ آبان» در رندر تعیین می‌کند → تصویری-کلید (مستثنیِ آیتمی — الگویِ r374-س۵-آیتمِ چهارم)",
        "ص۲۷-س۴-ردیفِ ۱ «Midday – midnight – sunset – noon» — دوکلیدی: midnight (تنها واژهٔ شب) و sunset (تنها واژهٔ بدونِ زمانِ ثابتِ ساعت‌شمار؛ midday=noon از خودِ جزوه ص۲۵) هر دو قابلِ دفاع و بدونِ لنگرِ تعیین‌کننده (مستثنیِ آیتمی)",
        "ص۲۷-س۵ «درستی یا نادرستی هر عبارت را با استفاده از [تصاویر] مشخص نمایید» — دو آیتمِ تصویری: «He's relaxing.» [پسرِ در حالِ بالا رفتن از درخت] → غ؛ «Sam is watching TV» [پسرِ تماشاچیِ تلویزیون] → ص — حکم فقط از تصویر (تصویری-کلید)",
    ],
    "printQuirks": [
        "«thursday» با t کوچک در ساقهٔ ۴ س۲ و «wednesday» با w کوچک در گزینه‌های س۳ — verbatim",
        "«Mountain» با M بزرگ در بانکِ چاپی س۲ — verbatim",
        'کوتیشنِ «" study"» در ساقهٔ ۲ س۲ فاصله‌دارِ چاپ — verbatim',
        "«Sunday’s» با آپاستروفِ خمیدهٔ چاپ در ساقهٔ ۳ س۲ — verbatim",
        "نقطه‌های چسبیدهٔ «...on Fridays»/«...for» پس از بلنک در لایه — norm فاصله را بازگرداند (قراردادِ r373 «And your -------.»)",
        "خط‌تیره‌های مخلوطِ چاپ در س۳ («–» در ردیفِ ۱/۲ و «-» در ردیفِ ۳) — گزینه‌سازی مستقل از خط‌تیره؛ ردیف‌های س۴ با «–» قراردادِ کارت",
    ],
}
d["source"]["g8familyMap"]["lastUpdatedRound"] = "r375"
fam = d["source"]["g8familyMap"]["families"][1]
fam["round"] = "r375"
fam["status"] = "استخراج شد — ۴ بانک/۱۱ آیتم از ۵ سکشن (س۵ تصویری مستثنی؛ آیتمِ Tuesday س۱ و ردیفِ اولِ س۴ دوکلیدیِ آیتمی مستثنی)"

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
total = sum(len(l["questions"]) for l in d["lessons"])
print(f"r375: tests-g8.json extended — {len(d['lessons'])} banks/{total} items (g8 lesson-2 family done)")
