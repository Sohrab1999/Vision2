#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r373 — «نمونه سؤالات امتحانی» هفتم: خانوادهٔ درس هفتم (pdf-p97) + خانوادهٔ درس هشتم (pdf-p103)
→ افزودنِ ۵ بانک/۱۷ آیتم به public/jozve/tests-g7.json (۱۵ بانکِ r370/r371/r372 محفوظ)
— پایانِ خانواده‌های g7 (۸ از ۸).

خانوادهٔ ۷ (درس هفتم، ص۹۷ — ۴ سکشن) — ۳ بانک/۱۱ آیتم:
  س۱ (۴ MCQ پنج‌گزینه‌ای) — «با توجه به لغات داده شده جملات زیر را کامل کنید. (یک کلمه اضافی است)»:
      بانکِ واژه = کادرِ آبیِ رندر-فقط (لایه ندارد — الگویِ r370-بانک۴/r372-بانک۱۵):
      [address , live , phone number , time , e-mail address]؛ ستونِ چاپیِ سمتِ راست
      (a) at 4:40 pm / b) 545-7845 / c)hasanlotfi1392@gmail.come / d)32 mahan street) ستونِ
      نمونه‌پاسخ است و ردیف‌های ۲/۳ را که بدونِ آن دوکلیدی‌اند (phone number یا e-mail address
      یا address هر سه در «What is your -------?» می‌نشینند) یک‌تایی می‌کند → ساقه‌ها برچسبِ
      «(نمونهٔ پاسخِ چاپی: …)» با محتوای verbatimِ ستون می‌گیرند؛ کلیدها: time / phone number /
      e-mail address / live؛ اضافیِ بانک = address (هرگز-کلید)؛ «Where do you -------?» با
      گرامرِ فعل هم یکتاست (تنها فعلِ بانک = live).
  س۲ (۳ MCQ چهارگزینه‌ایِ حروف) — «با توجه به تصاویر. جاهای خالی را با حروف مناسب کامل کنید»:
      فرگمنت‌های چاپی [……ffice / m……bile / str…… ……t] — واژه از خودِ فرگمنت یکتاست (office /
      mobile / street تنها واژه‌های ممکن؛ تصویر فقط تزئین است) → کلید: o / o / e
      (هر دو بلنکِ street در چاپ جدا هستند و هر یک e می‌گیرند)؛ گزینه‌ها = حروفِ مزاحم.
  س۳ (۴ MCQ چهارگزینه‌ایِ ناهماهنگ) — «کلمه ناهماهنگ از نظر معنی را مشخص کنید»: چهار ردیفِ
      چاپی verbatim (غلطِ «studing» محفوظ)؛ کلیدها: reading (جای‌ها vs کنش) / stair (تنها
      غیرِ کنش) / notebook (تنها شیء) / hungry (تنها صفت) — گزینه‌ها به ترتیبِ چاپیِ ردیف
      (کلیدها ۲,۰,۳,۱ — بی‌قطریِ طبیعی).
  مستثنی: س۴ «با توجه به تصویر داده شده… (اعداد را بصورت حروف بنویسید)» — ساعتِ تصویر ۹:۱۵
      (عقربهٔ ساعت‌شمار روی ۹، دقیقه‌شمار روی ۳) → «It's quarter past nine.» — تصویری-کلید
      (QuizQuestion فیلدِ تصویر ندارد — الگویِ مستثنیِ r371/r372).
خانوادهٔ ۸ (درس هشتم، ص۱۰۳ — ۵ سکشن) — ۲ بانک/۶ آیتم:
  س۳ (۴ MCQ پنج‌گزینه‌ای) — «حروف مربوط به هر پاسخ را مقابل سوال بنویسید. (یک جواب اضافی است)»:
      ستونِ چاپیِ verbatim [a. tea / b. that is my favorite / c. how about some cake. /
      d. lets have something to drink / e. rice and kebab]؛ کلیدها: I feel hungry → c /
      What is your favorite drink? → a / I am thirsty. → d / What is your favorite food? → e؛
      اضافیِ چاپی = b «that is my favorite» (هرگز-کلید)؛ «lets» بدونِ آپاستروفِ چاپ verbatim.
  س۴ (۲ MCQ چهارگزینه‌ایِ ناهماهنگ) — «کلمه ناهماهنگ را مشخص کنید»: ردیفِ ۱ favorite/carrot/
      quince/jelly → favorite (تنها صفت؛ بقیه خوراکی)؛ ردیفِ ۲ Kebab/fish/cocount/spaghetti →
      fish (تنها جاندار) با پشتوانهٔ علامتِ چاپیِ سرگردانِ «b.» خودِ جزوه (کلیدِ اعلامیِ چاپ)؛
      غلطِ «cocount» verbatim.
  مستثنی: س۱ «با توجه به تصاویر…» — تصویرِ مرغِ بریان → «Rice and chicken.» و تصویرِ
      آب‌نارنج → «Orange juice.» (تصویری-کلید؛ بدونِ تصویر «Rice and -------» با salad و
      «-------juice» با چند میوه سازگار است — یکتا نیست)؛ س۲ «نام مربوط به هر تصویر را زیر آن
      بنویسید» — چهار تصویرِ [خرما/موز/گوجه/بستنی] + بانکِ زردِ چاپیِ [Potato - banana - dates -
      ice cream - tomato] (در لایه هست ولی خارجِ موقعیت — انتهای لایهٔ ص۱۰۳؛ اضافی = Potato) —
      تطبیقِ واژه‌به‌تصویر بدونِ تصویر بی‌معناست (تصویری-کلید)؛ س۵ «……… به انگلیسی چه می شود؟» —
      تصویرِ تخم‌مرغ → egg (لنگرِ جدولِ ص۹۸: egg*) — تصویری-کلید.
هیچ پاسخنامهٔ چاپی در جزوهٔ هفتم نیست (جز علامتِ «b.» س۴) — کلیدها مستند (رسید g7exam7/g7exam8).
idempotent: اجرای دوم NO-OP.
"""
import json
import re
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "public/jozve/tests-g7.json"
LAYER = ROOT / "booklet-extract/g7.txt"

d = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else None
if d and "g7exam7" in d.get("source", {}):
    print("r373: receipt g7exam7 already present — NO-OP")
    raise SystemExit(0)
assert d is not None, "tests-g7.json must exist (r370-r372 built it)"

layer = LAYER.read_text(encoding="utf-8").split("\n")


def page_slice(p: int) -> list[str]:
    s = next(i for i, l in enumerate(layer) if l.strip() == f"<<<PAGE {p}>>>")
    e = next((i for i, l in enumerate(layer) if i > s and l.strip().startswith("<<<PAGE")), len(layer))
    return layer[s:e]


def norm(s: str) -> str:
    """نرمال‌سازیِ چاپ: فاصله‌های چندگانه → تک‌فاصله؛ نقطه‌چینِ بلنک (≥۳) → -------؛
    بلنکِ چسبیده به واژهٔ بعدی → با فاصله."""
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"[….]{3,}", "-------", s)
    s = re.sub(r"-------(?=[A-Za-z])", "------- ", s)
    return s


def frag(s: str) -> str:
    """نرمال‌سازیِ فرگمنتِ املا: نقطه‌چین (≥۲) → ------- بدونِ درجِ فاصله (حروف به هم می‌چسبند)."""
    s = re.sub(r"\s+", " ", s).strip()
    return re.sub(r"[….]{2,}", "-------", s)


def q(id_: str, n: int, question: str, options: list[str], answer: int):
    return {"id": id_, "n": n, "category": "vocab", "question": question, "options": options, "answer": answer}


def place(bank: list[str], key: str, target: int) -> tuple[list[str], int]:
    """چینشِ صریحِ ضدِ قطری (درسِ r372): مزاحم‌ها به ترتیبِ بانک، سپس insertِ کلید در جایگاهِ هدف."""
    rest = [w for w in bank if w != key]
    assert len(rest) == len(bank) - 1
    opts = rest[:target] + [key] + rest[target:]
    return opts, target


# ————— پیمانِ لایه: لنگرهای ص۹۸ (جدولِ واژگانِ درس هشتم) برای سکشن‌های مستثنی —————
p97 = page_slice(97)
p98 = "\n".join(page_slice(98))
p103 = page_slice(103)
assert "egg*" in p98, "p98 vocab anchor egg* missing"
assert "chicken*" in p98, "p98 vocab anchor chicken* missing"
assert "واژگان و نکات گرامری درس هشتم" in p98, "p98 is not the lesson-8 vocab table"

# ————— خ۷/س۱: ساقه‌ها + ستونِ نمونه‌پاسخ از لایهٔ ص۹۷ (ضدِ رونویسی) —————
S1_RE = re.compile(r"^(What|And your|Where do you)\b.*")
s1: list[tuple[str, str]] = []
for line in p97:
    if S1_RE.match(line) and "…" in line:
        parts = re.split(r"\s{2,}", line.strip())
        assert len(parts) == 2, f"p97-S1 line must be stem+anchor: {line!r}"
        s1.append((parts[0], re.sub(r"^[a-d]\)\s*", "", parts[1].strip())))
assert len(s1) == 4, f"p97-S1 stems incomplete: {s1}"
# نقطهٔ پایانیِ جمله‌ایِ چاپ که norm داخلِ بلنک بلعید («And your ………………….»)
s1_stems = [norm(st) + ("." if re.search(r"\.\s*$", st) and not norm(st).endswith((".", "?")) else "") for st, _ in s1]
assert s1_stems[2] == "And your -------.", s1_stems[2]
s1_anchors = [an for _, an in s1]
assert s1_anchors == ["at 4:40 pm", "545-7845", "hasanlotfi1392@gmail.come", "32 mahan street"], s1_anchors
B16 = ["address", "live", "phone number", "time", "e-mail address"]
Q16 = [
    q("g7-l16-1", 1, f"{s1_stems[0]} (نمونهٔ پاسخِ چاپی: {s1_anchors[0]})", *place(B16, "time", 2)),
    q("g7-l16-2", 2, f"{s1_stems[1]} (نمونهٔ پاسخِ چاپی: {s1_anchors[1]})", *place(B16, "phone number", 0)),
    q("g7-l16-3", 3, f"{s1_stems[2]} (نمونهٔ پاسخِ چاپی: {s1_anchors[2]})", *place(B16, "e-mail address", 3)),
    q("g7-l16-4", 4, f"{s1_stems[3]} (نمونهٔ پاسخِ چاپی: {s1_anchors[3]})", *place(B16, "live", 1)),
]

# ————— خ۷/س۲: فرگمنت‌های املا از لایهٔ ص۹۷ (سطرِ تک‌خطیِ سه‌تکه) —————
frag_line = next(l for l in p97 if "ffice" in l and "bile" in l)
tokens = re.split(r"\s{2,}", frag_line.strip())
tokens = [t for t in tokens if t]
assert len(tokens) == 4, f"p97-S2 fragments must be 4 tokens: {tokens}"
f_office, f_mobile, f_str1, f_str2 = (frag(t) for t in tokens)
assert f_office.endswith("ffice") and f_office.startswith("-------"), f_office
assert f_mobile.startswith("m-------") and f_mobile.endswith("bile"), f_mobile
assert f"{f_str1} {f_str2}" == "str------- ------- t", (f_str1, f_str2)  # دو بلنکِ چاپی، هر دو یک e
Q17 = [
    q("g7-l17-1", 1, f_office, ["a", "o", "e", "u"], 1),
    q("g7-l17-2", 2, f_mobile, ["a", "e", "o", "i"], 2),
    q("g7-l17-3", 3, f"{f_str1} {f_str2}", ["a", "o", "i", "e"], 3),
]

# ————— خ۷/س۳: چهار ردیفِ ناهماهنگ از لایهٔ ص۹۷ —————
S3_RE = re.compile(r"^(Garden|Stair|Friend|Visit)\b.*")
s3_rows: list[str] = []
for line in p97:
    if S3_RE.match(line):
        left = re.split(r"\s{2,}", line.strip())[0]
        s3_rows.append(norm(left).replace(" - ", " – "))
assert len(s3_rows) == 4, f"p97-S3 rows incomplete: {s3_rows}"
assert "studing" in s3_rows[1], "print typo 'studing' must survive"
s3_keys = ["reading", "Stair", "notebook", "hungry"]
Q18 = []
for i, (row, key) in enumerate(zip(s3_rows, s3_keys), 1):
    words = row.split(" – ")
    assert len(words) == 4 and key in words, (row, key)
    Q18.append(q(f"g7-l18-{i}", i, row, words, words.index(key)))

# ————— خ۸/س۳: ساقه‌ها + ستونِ چاپیِ a-e از لایهٔ ص۱۰۳ —————
OPT_RE = re.compile(r"^([a-e])\.\s*(.+?)\s*$")
col: list[str] = []
stem_lines: list[str] = []
skip_next = False
for line in p103:
    t = line.strip()
    if skip_next:
        skip_next = False
        if t:
            stem_lines.append(t)  # دنبالهٔ ساقهٔ دوبخطیِ چاپ («food?.................»)
        continue
    if t == "What is your favorite":  # ساقهٔ شکسته — خطِ بعدی دنباله‌اش است
        stem_lines.append(t)
        skip_next = True
        continue
    if re.match(r"^(I feel hungry|I am thirsty)", t) or (
        t.startswith("What is your favorite") and re.search(r"\.{3,}", t)
    ):
        stem_lines.append(t)
joined: list[str] = []
buf = ""
for t in stem_lines:
    buf = (buf + " " + t).strip()
    if re.search(r"[….]$", buf):  # ساقه با نقطه‌چینِ بلنک یا نقطهٔ چاپ می‌بندد؛ «What is your favorite» باز می‌ماند
        joined.append(buf)
        buf = ""
assert not buf and len(joined) == 4, f"p103-S3 stems incomplete: {joined}"
s3p103_stems = [norm(j) for j in joined]
assert s3p103_stems == [
    "I feel hungry -------",
    "What is your favorite drink?-------",
    "I am thirsty. -------",
    "What is your favorite food?-------",
], s3p103_stems
for line in p103[31:42]:  # فقط ناحیهٔ سکشنِ س۳ — ستونِ س۴ (favorite/carrot…) این الگو را با فاصلهٔ زیاد دارد
    m = OPT_RE.match(line.strip())
    if m and re.split(r"\s{2,}", line.strip())[0] == line.strip():
        col.append(m.group(2))
assert col == ["tea", "that is my favorite", "how about some cake.", "lets have something to drink", "rice and kebab"], col
B19 = col
s3p103_keys = ["how about some cake.", "tea", "lets have something to drink", "rice and kebab"]
s3p103_targets = [0, 2, 4, 1]
Q19 = []
for i, (st, key, tgt) in enumerate(zip(s3p103_stems, s3p103_keys, s3p103_targets), 1):
    Q19.append(q(f"g7-l19-{i}", i, st, *place(B19, key, tgt)))

# ————— خ۸/س۴: دو ردیفِ ناهماهنگ از لایهٔ ص۱۰۳ + علامتِ چاپیِ «b.» —————
s4_rows: list[list[str]] = []
for line in p103:
    parts = re.split(r"\s{2,}", line.strip())
    if len(parts) == 4 and all(re.match(r"^[a-d]\.", p) for p in parts):
        s4_rows.append([re.sub(r"^[a-d]\.\s*", "", p) for p in parts])
assert len(s4_rows) == 2, f"p103-S4 rows incomplete: {s4_rows}"
assert s4_rows[0] == ["favorite", "carrot", "quince", "jelly"], s4_rows[0]
assert s4_rows[1] == ["Kebab", "fish", "cocount", "spaghetti"], s4_rows[1]  # غلطِ cocount verbatim
assert any(re.match(r"^b\.?\s*$", l.strip()) for l in p103), "print's own stray 'b.' answer-mark must exist in p103 layer"
Q20 = [
    q("g7-l20-1", 1, "favorite – carrot – quince – jelly", s4_rows[0], 0),
    q("g7-l20-2", 2, "Kebab – fish – cocount – spaghetti", s4_rows[1], 1),
]

# ————— افزودنِ بانک‌ها و رسیدها —————
add = [
    ({"lesson": 16, "title": "امتحانی درس هفتم — تکمیل با بانک واژه (س۱، ص۹۷)", "level": "پنج‌گزینه‌ای", "count": 4}, Q16),
    ({"lesson": 17, "title": "امتحانی درس هفتم — کامل‌کردن حروف (س۲، ص۹۷)", "level": "چهارگزینه‌ای", "count": 3}, Q17),
    ({"lesson": 18, "title": "امتحانی درس هفتم — کلمهٔ ناهماهنگ (س۳، ص۹۷)", "level": "چهارگزینه‌ای", "count": 4}, Q18),
    ({"lesson": 19, "title": "امتحانی درس هشتم — پاسخ از ستون راست (س۳، ص۱۰۳)", "level": "پنج‌گزینه‌ای", "count": 4}, Q19),
    ({"lesson": 20, "title": "امتحانی درس هشتم — کلمهٔ ناهماهنگ (س۴، ص۱۰۳)", "level": "چهارگزینه‌ای", "count": 2}, Q20),
]
for meta, qs in add:
    meta["questions"] = qs
    d["lessons"].append(meta)

d["source"]["g7exam7"] = {
    "extractedRound": "r373",
    "section": "نمونه سؤالات امتحانی درس هفتم پایه هفتم",
    "examPages": "pdf-p97 (تک‌صفحه‌ای) — ص۹۸ جدولِ واژگانِ درس هشتم است و مرزِ پایینیِ خانواده",
    "keyPages": "هیچ پاسخنامهٔ چاپی نیست — کلیدِ س۱ از بانکِ آبی + ستونِ نمونه‌پاسخِ چاپی؛ س۲ از یکتاییِ فرگمنت؛ س۳ از معناشناسیِ دسته‌ای",
    "sectionsTotal": 4,
    "sectionsExtracted": 3,
    "sectionsSkipped": 1,
    "items": 11,
    "bankCounts": [4, 3, 4],
    "wordBank": ["address", "live", "phone number", "time", "e-mail address"],
    "wordBankSource": "کادرِ آبیِ رندر-فقطِ ص۹۷-top (۳۰۰dpi) — لایه ندارد (الگویِ r370-بانک۴/r372-بانک۱۵)؛ ستونِ چاپیِ a-d ستونِ نمونه‌پاسخ است نه گزینه",
    "keyPolicy": "س۱: ردیف‌های ۲/۳ بدونِ ستونِ نمونه‌پاسخ دوکلیدی‌اند (phone number/e-mail address/address هر سه گرامری‌اند) — برچسبِ «(نمونهٔ پاسخِ چاپی: …)» با محتوای verbatimِ ستون به ساقه چسبید و یکتایی را چاپ‌لنگر کرد؛ ردیفِ ۴ با گرامرِ فعل هم یکتاست (تنها فعلِ بانک = live)؛ س۲: واژه از فرگمنت یکتاست (office/mobile/street) و تصویر فقط تزئین است — کلیدِ حروفی o/o/e (هر دو بلنکِ street یک e)؛ س۳: کلیدِ دسته‌ای (جای‌ها vs کنش / کنش vs غیرِ کنش / انسان‌ها vs شیء / فعل‌ها vs صفت)",
    "engineNote": "سکشنِ حروف MCQ چهارگزینه‌ای است نه تایپی (قراردادِ r363 — موتورِ تایپ case-insensitive است و پاسخِ تک‌حرفی ارزشِ تایپ ندارد)؛ گزینه‌های س۲ = حروفِ مزاحم",
    "derivedKeys": {"S1": ["time", "phone number", "e-mail address", "live"], "S2": ["o", "o", "e"], "S3": ["reading", "Stair", "notebook", "hungry"]},
    "skippedSections": [
        "ص۹۷-س۴ «با توجه به تصویر داده شده… (اعداد را بصورت حروف بنویسید)» — ساعتِ تصویر ۹:۱۵ (ساعت‌شمار روی ۹، دقیقه‌شمار روی ۳ — رندرِ ۳۰۰dpi ص۹۷-bottom) → «It's quarter past nine.»؛ تصویری-کلید — بدونِ تصویر بی‌پاسخ (الگویِ r371-س۵/r372)",
    ],
    "printQuirks": [
        "«What ……………are you going?» — بلنکِ چسبیده به are در چاپ؛ norm به «------- are» تبدیل کرد (قراردادِ فاصله‌دارِ بانک‌های g7)",
        "«Where do you ……………...?» — سه‌نقطهٔ پس از بلنک در چاپ verbatim ماند («-------...?»)",
        "«str…… ……t» — دو بلنکِ جدا با tِ پایانی در چاپ (رندرِ ۳۰۰dpi: str…… …… t)؛ هر دو بلنک e می‌گیرند — گزینه‌ها تک‌حرفی‌اند نه جفت",
        "تیترِ خانواده دوبخطی است («نمونه سواالت امتحانی درس\nهفتم») — جست‌وجوی دوسطری (پروبِ r373)",
    ],
}
d["source"]["g7exam8"] = {
    "extractedRound": "r373",
    "section": "نمونه سؤالات امتحانی درس هشتم پایه هفتم",
    "examPages": "pdf-p103 (تک‌صفحه‌ای) — ص۱۰۴ پایانِ جزوه است (۴ خط)؛ خانوادهٔ آخرِ g7",
    "keyPages": "هیچ پاسخنامهٔ چاپی نیست — جز علامتِ سرگردانِ «b.» س۴ (کلیدِ اعلامیِ خودِ چاپ برای ردیفِ دوم)؛ بقیه استنتاجی",
    "sectionsTotal": 5,
    "sectionsExtracted": 2,
    "sectionsSkipped": 3,
    "items": 6,
    "bankCounts": [4, 2],
    "wordBank": ["tea", "that is my favorite", "how about some cake.", "lets have something to drink", "rice and kebab"],
    "wordBankSource": "ستونِ چاپیِ a-e س۳ ص۱۰۳ (لایه) — اضافیِ چاپی = b «that is my favorite»",
    "keyPolicy": "س۳: هر ساقه دقیقاً یک پاسخِ دستوری/معنایی دارد (گرسنه→پیشنهادِ غذا / تشنه→پیشنهادِ نوشیدنی / favorite drink→tea / favorite food→rice and kebab)؛ س۴-ردیف۱: favorite تنها صفت است؛ س۴-ردیف۲: fish تنها جاندار + علامتِ «b.» چاپ؛ اضافیِ هر دو ستون مشترکِ پنج‌گزینه‌ای/چهارگزینه‌ای است",
    "engineNote": "ساقه‌ها نقطه‌چینِ انتهاییِ چاپ را verbatim دارند («favorite drink?-------»)؛ گزینه‌ها verbatimِ ستون (شاملِ نقطهٔ پایانیِ «how about some cake.» و «lets» بدونِ آپاستروف)",
    "derivedKeys": {"S3": ["how about some cake.", "tea", "lets have something to drink", "rice and kebab"], "S4": ["favorite", "fish"]},
    "skippedSections": [
        "ص۱۰۳-س۱ «با توجه به تصاویر داده شده به سواالت زیر پاسخ دهید؟» — تصویرِ مرغِ بریان → «Rice and chicken.» و تصویرِ آب‌نارنج → «Orange juice.» (رندرِ ۳۰۰dpi ص۱۰۳-top)؛ تصویری-کلید و بدونِ تصویرِ یکتا نیست («Rice and -------» با saladِ جدولِ ص۹۸ هم سازگار است)",
        "ص۱۰۳-س۲ «نام مربوط به هر تصویر را زیر آن بنویسید» — چهار تصویرِ [خرما/موز/گوجه/بستنی] + بانکِ زردِ چاپیِ [Potato - banana - dates - ice cream - tomato] (اضافی = Potato)؛ بانکِ زرد در لایه هست ولی خارجِ موقعیت (انتهای لایهٔ ص۱۰۳ — کوئیرکِ استخراج)؛ تطبیقِ واژه‌به‌تصویر بدونِ تصویر بی‌معناست — تصویری-کلید",
        "ص۱۰۳-س۵ «……… به انگلیسی چه می شود؟» — تصویرِ تخم‌مرغ (سه تخم‌مرغ در رندرِ ص۱۰۳-bottom) → egg (لنگرِ جدولِ ص۹۸: egg*)؛ تصویری-کلید — الگویِ ساقه‌فارسیِ r371-س۶ ولی با تصویر به‌جای واژهٔ فارسی",
    ],
    "printQuirks": [
        "«cocount» غلطِ تایپیِ چاپ برای coconut — verbatim (الگویِ grangmoter/studing)",
        "«lets have something to drink» بدونِ آپاستروفِ چاپ — verbatim",
        "علامتِ «b.» سرگردانِ زیرِ ردیفِ دومِ س۴ = کلیدِ اعلامیِ خودِ جزوه (fish) — نخستین کلیدِ چاپیِ کارتِ هفتم",
        "«What is your favorite food?.........» در لایه دوخطی شکسته بود («What is your favorite / food?…») — بازجوش شد",
    ],
}
fm = d["source"]["g7familyMap"]
assert fm["families"][6]["pdfPage"] == 97 and fm["families"][7]["pdfPage"] == 103
fm["families"][6].update({"round": "r373", "status": "استخراج شد — ۳ بانک/۱۱ آیتم از ۴ سکشن (س۴ تصویری-کلید: ساعتِ ۹:۱۵ مستثنی)"})
fm["families"][7].update({"round": "r373", "status": "استخراج شد — ۲ بانک/۶ آیتم از ۵ سکشن (۳ سکشنِ تصویری مستثنی) — پایانِ خانواده‌های g7 (۸/۸)"})
fm["note"] = "نقشهٔ ۸ خانوادهٔ «نمونه سؤالات امتحانی» جزوهٔ هفتم — از جست‌وجوی لایه؛ سربرگ‌های دوخطی (مثل «درس\ndوم») با جست‌وجوی دوسطری یافت شدند؛ همهٔ ۸ خانواده استخراج شد (r370-r373)"

OUT.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

total = sum(len(l["questions"]) for l in d["lessons"])
print(f"r373: +5 banks/+17 items → {len(d['lessons'])} banks/{total} items; family map 8/8 done")
