# -*- coding: utf-8 -*-
"""
r312 — استخراج «آزمون تشریحی واژگان درس دوم و درس سوم» جزوهٔ جامع یازدهم
درس دوم: ص۵۴-۵۶، کلید واژه‌ای چاپی ص۱۸۴ → l29..l32
درس سوم: ص۸۸-۹۰، کلید واژه‌ای چاپی ص۱۹۳ → l33..l36

هر درس ۴ بخش (ساختار عینِ r311):
  بخش ۱ — جای خالی از دو بانک واژهٔ ۹تایی (۱۶ آیتم تایپی)
  بخش ۲ — جمله با الگوی حرف اول («(c _ _ _)») (۸ آیتم تایپی)
  بخش ۳ — تعریف‌ها با بانک ۹تایی (۸ آیتم تایپی)
  بخش ۴ — ۲۵ MCQ با کلید واژه‌ای چاپی → نگاشت واژه→حرف با تطبیق یکتا

نوهای r312 نسبت به r311:
  • پارسرِ پارامتری (هر درس: صفحات بدنه + صفحه کلید + آفستِ بانک)
  • ناحیه‌بندیِ سکشن با سرفصل‌های فارسیِ منتهی به «.N» (درس r311)
  • سوآپِ پرانتزهای معکوسِ لایهٔ RTL در ساقه‌های بخش ۲ درس دوم
  • OPT_FIX مستند برای Q12 درس دوم (خانهٔ چهارمِ گزینه بدون «d.» چاپ شده)
  • پیوندِ ساقهٔ چندخطی در بخش ۴ (الگوی r310)

تزریق idempotent است. مزاحم‌های چاپیِ بی‌استفاده در receipts ثبت می‌شوند.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

import pdfplumber

ROOT = Path("/home/z/my-project")
PDF = ROOT / "upload/جزوه جامع یازدهم .pdf"
BANK = ROOT / "public/jozve/tests-g11.json"

DASH15 = "-" * 15
DASH_RUN = re.compile(r"-{5,}(?:\s+-{5,})*")
DASH_LINE = re.compile(r"^-{5,}\s*$")
FA = re.compile(r"[\u0600-\u06FF]")
STEM = re.compile(r"^(\d+)\.\s+(.+)$")
OPT_SEG = re.compile(r"([a-d])\.\s+")
FA_SECTION = re.compile(r"\.([1-4])\s*$")
BOX_LINE = re.compile(
    r"^[A-Za-z][A-Za-z'’ ]*(?:\s*/\s*[A-Za-z][A-Za-z'’ ]*){4,}\s*$"
)
HINT = re.compile(r"[A-Za-z]\s*(?:_\s*)+")

# استثنای چاپیِ مستند — فقط Q12 درس دوم: خانهٔ چهارم بدون «d.» چاپ شده
# (رندر pdftoppm ص۵۶: «a. producing | b. preventing | c. retiring | calling back»)
OPT_FIX = {
    ("L2", 12): {"c": "retiring", "d": "calling back", "reason": "d-label missing in print"},
}


def norm_word(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def norm_stem(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def extract():
    with pdfplumber.open(str(PDF)) as pdf:
        pages = {n: (pdf.pages[n - 1].extract_text() or "") for n in
                 (54, 55, 56, 88, 89, 90, 184, 193)}
    return pages


# ————————————————————— کلید واژه‌ای —————————————————————

def parse_key(p: str):
    """چهار سکشن کلید؛ سرفصل‌ها فارسیِ منتهی به «.N»؛ جفت‌های «N. word» در گریدهای چاپی."""
    lines = [ln.strip() for ln in p.splitlines() if ln.strip()]
    sections = {1: [], 2: [], 3: [], 4: []}
    cur = None
    pair = re.compile(r"(\d+)\.\s*([A-Za-z][A-Za-z'’ ]*?)\s*(?=(?:\d+\.)|$)")
    for ln in lines:
        m_end = FA_SECTION.search(ln)
        if m_end and FA.search(ln):
            cur = int(m_end.group(1))
            continue
        if cur is None:
            continue
        if FA.search(ln):
            continue
        words = [(int(a), b.strip()) for a, b in pair.findall(ln)]
        sections[cur].extend(words)
    out = {}
    for k, v in sections.items():
        nums = [n for n, _ in v]
        assert nums == list(range(1, len(nums) + 1)), f"key section {k}: broken numbering {nums}"
        out[k] = [w for _, w in v]
    return out


# ————————————————————— بدنهٔ آزمون —————————————————————

def split_page(lines, sections):
    """ناحیه‌بندی سطرهای صفحه با سرفصل‌های «.N»؛ خروجی: {n: [lines]}"""
    zones = {k: [] for k in sections}
    cur = None
    for ln in lines:
        m = FA_SECTION.search(ln)
        if m and FA.search(ln):
            z = int(m.group(1))
            if z in zones:
                cur = z
                continue
        if cur is None:
            continue
        zones[cur].append(ln)
    return zones


def parse_s1_s2(page: str):
    """صفحهٔ نخست هر درس: سکشن ۱ (دو بانک + ۱۶ ساقه) و سکشن ۲ (۸ ساقهٔ حرف‌اول)."""
    lines = [ln.strip() for ln in page.splitlines() if ln.strip()]
    zones = split_page(lines, [1, 2])

    boxes, s1 = [], {}
    for ln in zones[1]:
        if BOX_LINE.match(ln):
            boxes.append([re.sub(r"\s+", " ", w).strip() for w in ln.split("/")])
        elif STEM.match(ln):
            m = STEM.match(ln)
            assert not HINT.search(m.group(2)), f"s1 stem has a first-letter hint: {m.group(0)!r}"
            s1[int(m.group(1))] = m.group(2).strip()
    assert len(boxes) == 2, f"section1: expected 2 word boxes, got {len(boxes)}"
    assert sorted(s1) == list(range(1, 17)), f"section1 stems: {sorted(s1)}"

    s2 = {}
    for ln in zones[2]:
        m = STEM.match(ln)
        if m:
            assert HINT.search(m.group(2)), f"s2 stem lacks first-letter hint: {m.group(0)!r}"
            s2[int(m.group(1))] = swap_parens(m.group(2).strip())
    assert sorted(s2) == list(range(1, 9)), f"section2 stems: {sorted(s2)}"
    return boxes[0], boxes[1], s1, s2


def swap_parens(stem: str) -> str:
    """ساقه‌های بخش ۲ درس دوم: پرانتزهای چاپی در لایهٔ RTL معکوس می‌آیند («)c _ _ _(»).
    ساقه انگلیسیِ خالص است — سوآپِ امن (درس سوم پرانتز ندارد؛ بی‌اثر)."""
    if ")" in stem and "(" in stem:
        return stem.translate(str.maketrans("()", ")("))
    return stem


def parse_s3_s4(p3: str, p4b: str, lesson_tag: str):
    """صفحهٔ دوم (سکشن ۳ + آغاز سکشن ۴) و صفحهٔ سوم (ادامهٔ سکشن ۴)."""
    lines3 = [ln.strip() for ln in p3.splitlines() if ln.strip()]
    zones = split_page(lines3, [3, 4])

    box3, s3, s4, s4o = None, {}, {}, {}
    pend = None
    # سکشن ۳
    for ln in zones[3]:
        if BOX_LINE.match(ln):
            box3 = [re.sub(r"\s+", " ", w).strip() for w in ln.split("/")]
            continue
        m = STEM.match(ln)
        if m:
            s3[int(m.group(1))] = m.group(2).strip()
    assert box3 and len(box3) == 9, f"{lesson_tag} s3 box: {box3}"
    assert sorted(s3) == list(range(1, 9)), f"{lesson_tag} s3 stems: {sorted(s3)}"

    # سکشن ۴ — صفحهٔ دوم + صفحهٔ سوم (پیوند ساقهٔ چندخطی، الگوی r310)
    def feed(ln, pend):
        if DASH_LINE.match(ln):
            return ("pend",) + pend if pend else None
        m = STEM.match(ln)
        if m:
            if OPT_SEG.search(m.group(2)):
                return ("close", int(m.group(1)), m.group(2).strip())
            return ("pend", int(m.group(1)), m.group(2).strip())
        if OPT_SEG.search(ln):
            if pend is None:
                return None
            return ("close", pend[0], pend[1] + " " + ln)
        if pend is not None and not FA.search(ln):
            return ("pend", pend[0], pend[1] + " " + ln)
        return ("pend",) + pend if pend else None

    pend = None
    for ln in zones[4]:
        r = feed(ln, pend)
        if r is None:
            continue
        kind, n, text = r[0], r[1], r[2]
        if kind == "pend":
            pend = (n, text)
        else:
            s4[n] = text
            pend = None
    for ln in [ln.strip() for ln in p4b.splitlines() if ln.strip()]:
        if "Vision Two" in ln:
            continue
        r = feed(ln, pend)
        if r is None:
            continue
        kind, n, text = r[0], r[1], r[2]
        if kind == "pend":
            pend = (n, text)
        else:
            s4[n] = text
            pend = None
    assert pend is None, f"{lesson_tag} s4 dangling stem: {pend}"
    assert sorted(s4) == list(range(1, 26)), f"{lesson_tag} s4 stems: {sorted(s4)}"
    return box3, s3, s4


def parse_options(line: str, lesson_tag: str, n: int):
    fix = OPT_FIX.get((lesson_tag, n))
    if fix:
        # استثنای چاپیِ مستند (رسید printErrata در source)
        assert line.count("a.") == 1 and line.count("b.") == 1 and line.count("c.") == 1 and line.count("d.") == 0
        segs = OPT_SEG.split(line)
        assert segs[1] == "a" and segs[3] == "b" and segs[5] == "c"
        c_raw = segs[6].strip()
        assert c_raw == fix["c"] + " " + fix["d"], f"OPT_FIX mismatch: {c_raw!r}"
        opts = [segs[2].strip(), segs[4].strip(), fix["c"], fix["d"]]
    else:
        segs = OPT_SEG.split(line)
        opts = {}
        for i in range(1, len(segs) - 1, 2):
            opts[segs[i]] = segs[i + 1].strip()
        assert sorted(opts) == list("abcd"), f"bad options: {line!r} -> {opts}"
        opts = [opts[c] for c in "abcd"]
    assert len(set(opts)) == 4, f"duplicate options: {line!r}"
    for v in opts:
        assert v and not FA.search(v), f"option pollution: {v!r}"
    return opts


def build_s4(s4, s4o_raw, keys, lesson_tag):
    """۲۵ MCQ با نگاشتِ واژه→حرفِ چاپی."""
    q = []
    for i in range(1, 26):
        stem = DASH_RUN.sub(DASH15, s4[i]).strip()
        opts = parse_options(s4o_raw[i], lesson_tag, i)
        ans_word = keys[4][i - 1]
        hits = [j for j, o in enumerate(opts) if norm_word(o) == norm_word(ans_word)]
        assert len(hits) == 1, (
            f"{lesson_tag} s4 q{i}: key word {ans_word!r} matched {hits} of {opts}"
        )
        q.append({
            "id": None, "n": i, "category": "vocab",
            "question": stem, "options": opts, "answer": hits[0],
        })
    return q


def norm_dash(stem: str) -> str:
    return DASH_RUN.sub(DASH15, stem).strip()


# ————————————————————— ساخت بانک‌ها —————————————————————

def build_lesson(base, lesson_no, pages, keys, pages_txt, lesson_tag):
    """چهار بانکِ یک درس؛ base = نخستین شمارهٔ درس (۲۹ یا ۳۳)."""
    pS1, pS34, pS4b, pKey = pages
    boxA, boxB, s1, s2 = parse_s1_s2(pages_txt[pS1])
    box3, s3, s4 = parse_s3_s4(pages_txt[pS34], pages_txt[pS4b], lesson_tag)
    # s4 از parse_s3_s4: رشتهٔ خام «ساقه + سطر گزینه‌ها» (بدون پیشوندِ شماره) — جداسازی با نخستین «a. »
    q_s4 = []
    for i in range(1, 26):
        body = s4[i]
        mo = re.search(r"\ba\.\s", body)
        assert mo, f"{lesson_tag} s4 q{i}: options missing: {body!r}"
        stem = body[:mo.start()].strip()
        opt_line = body[mo.start():].strip()
        stem_n = DASH_RUN.sub(DASH15, stem).strip()
        opts = parse_options(opt_line, lesson_tag, i)
        ans_word = keys[4][i - 1]
        hits = [j for j, o in enumerate(opts) if norm_word(o) == norm_word(ans_word)]
        assert len(hits) == 1, f"{lesson_tag} s4 q{i}: {ans_word!r} -> {hits} of {opts}"
        q_s4.append({
            "id": None, "n": i, "category": "vocab",
            "question": stem_n, "options": opts, "answer": hits[0],
        })

    receipts = {"unusedBoxWords": {}, "printQuirks": []}
    # بخش ۱ — l base+0
    # نکتهٔ ساختاری: در درس دوم/سوم جای‌خالیِ بخش ۱ در سطر جداگانه چاپ شده
    # (برخلاف درس اول که inline بود) — الحاقِ DASH15 تا هر سؤال خودبسنده باشد.
    q1 = []
    for i in range(1, 17):
        stem = norm_dash(s1[i])
        if not DASH_RUN.search(stem):
            stem = stem + " " + DASH15
        ans = keys[1][i - 1]
        box = boxA if i <= 8 else boxB
        assert norm_word(ans) in {norm_word(w) for w in box}, f"{lesson_tag} s1 q{i}: {ans!r} not in box"
        opts = [ans] + [w for w in box if norm_word(w) != norm_word(ans)]
        q1.append({
            "id": None, "n": i, "category": "vocab", "kind": "typed",
            "question": f"{stem} [bank: {' / '.join(box)}]",
            "options": opts, "answer": 0, "accepted": [ans],
            "placeholder": "fill in the blank with the bank word…",
        })
    usedA = {norm_word(keys[1][i - 1]) for i in range(1, 9)}
    usedB = {norm_word(keys[1][i - 1]) for i in range(9, 17)}
    receipts["unusedBoxWords"]["s1boxA"] = [w for w in boxA if norm_word(w) not in usedA]
    receipts["unusedBoxWords"]["s1boxB"] = [w for w in boxB if norm_word(w) not in usedB]

    # بخش ۲ — l base+1
    q2 = []
    for i in range(1, 9):
        stem = s2[i]
        ans = keys[2][i - 1]
        hinted = re.search(r"([A-Za-z])\s*(?:_\s*)+", stem).group(1)
        assert hinted.lower() == ans[0].lower(), f"{lesson_tag} s2 q{i}: hint {hinted} != key {ans}"
        others = [w for w in keys[2] if norm_word(w) != norm_word(ans)]
        q2.append({
            "id": None, "n": i, "category": "vocab", "kind": "typed",
            "question": stem,
            "options": [ans] + others, "answer": 0, "accepted": [ans],
            "placeholder": "complete the word (first letter is given)…",
        })
    for i in (7, 8):
        if lesson_tag == "L3":
            receipts["printQuirks"].append(
                f"کلیدِ {i} بخش ۲ «{keys[2][i-1]}» با حرف بزرگ چاپ شده — عینِ چاپ (الگوی Imagine ر۳۱۱)."
            )

    # بخش ۳ — l base+2
    q3 = []
    for i in range(1, 9):
        stem = s3[i]
        ans = keys[3][i - 1]
        assert norm_word(ans) in {norm_word(w) for w in box3}, f"{lesson_tag} s3 q{i}: {ans!r} not in box"
        opts = [ans] + [w for w in box3 if norm_word(w) != norm_word(ans)]
        q3.append({
            "id": None, "n": i, "category": "vocab", "kind": "typed",
            "question": f"{stem} [bank: {' / '.join(box3)}]",
            "options": opts, "answer": 0, "accepted": [ans],
            "placeholder": "type the word for the definition…",
        })
    used3 = {norm_word(keys[3][i - 1]) for i in range(1, 9)}
    receipts["unusedBoxWords"]["s3box"] = [w for w in box3 if norm_word(w) not in used3]

    return q1, q2, q3, q_s4, receipts


LESSONS = [
    {
        "tag": "L2", "base": 29,
        "pages": (54, 55, 56, 184),
        "group": "آزمون تشریحی واژگان درس دوم",
        "meta": [
            ("تشریحی واژگان د۲ — جای خالی از بانک واژه (ص۵۴)", 16, "تشریحی — تایپی"),
            ("تشریحی واژگان د۲ — کلمه با حرف اول (ص۵۴)", 8, "تشریحی — تایپی"),
            ("تشریحی واژگان د۲ — تعریف‌ها، بنویسید (ص۵۵)", 8, "تشریحی — تایپی"),
            ("تشریحی واژگان د۲ — تست چهارگزینه‌ای (ص۵۵-۵۶)", 25, "تشریحی — چهارگزینه‌ای"),
        ],
    },
    {
        "tag": "L3", "base": 33,
        "pages": (88, 89, 90, 193),
        "group": "آزمون تشریحی واژگان درس سوم",
        "meta": [
            ("تشریحی واژگان د۳ — جای خالی از بانک واژه (ص۸۸)", 16, "تشریحی — تایپی"),
            ("تشریحی واژگان د۳ — کلمه با حرف اول (ص۸۸)", 8, "تشریحی — تایپی"),
            ("تشریحی واژگان د۳ — تعریف‌ها، بنویسید (ص۸۹)", 8, "تشریحی — تایپی"),
            ("تشریحی واژگان د۳ — تست چهارگزینه‌ای (ص۸۹-۹۰)", 25, "تشریحی — چهارگزینه‌ای"),
        ],
    },
]


def dup_hunt(new_qs, bank, own_lessons):
    """هم‌راستا با منطقِ گارد (حذفِ [bank:]، دش→فاصله، نقطه‌گذاری→فاصله)."""
    def strip(s):
        s = re.sub(r"\[bank:[^\]]+\]", "", s)
        s = DASH_RUN.sub(" ", s)
        s = re.sub(r"[^\w\s]", " ", s)
        return re.sub(r"\s+", " ", s).strip().lower()
    existing = []
    for L in bank["lessons"]:
        if L["lesson"] in own_lessons:
            continue
        for q in L["questions"]:
            existing.append((L["lesson"], q["id"], strip(q["question"])))
    dup = []
    for q in new_qs:
        ns = strip(q["question"])
        for les, qid, es in existing:
            if ns == es:
                dup.append({"new": q["id"], "old": qid, "oldLesson": les})
    return dup


def main():
    pages_txt = extract()

    bank = json.loads(BANK.read_text(encoding="utf-8"))
    all_new, groups_src = [], []
    own = set()
    for cfg in LESSONS:
        pS1, pS34, pS4b, pKey = cfg["pages"]
        keys = parse_key(pages_txt[pKey])
        assert [len(keys[k]) for k in (1, 2, 3, 4)] == [16, 8, 8, 25], \
            f"{cfg['tag']} key sizes: {[(k, len(keys[k])) for k in (1,2,3,4)]}"
        q1, q2, q3, q4, receipts = build_lesson(cfg["base"], None, cfg["pages"], keys, pages_txt, cfg["tag"])
        for k, ((title, count, level), qs) in enumerate(
            zip(cfg["meta"], [q1, q2, q3, q4])
        ):
            les = cfg["base"] + k
            assert len(qs) == count, f"{cfg['tag']} l{les}: {len(qs)} != {count}"
            for q in qs:
                q["id"] = f"g11-l{les}-{q['n']}"
            all_new.append({"lesson": les, "title": title, "level": level,
                            "count": count, "questions": qs})
            own.add(les)
        groups_src.append({
            "tag": cfg["tag"], "group": cfg["group"], "base": cfg["base"],
            "questionPages": f"{pS1}-{pS4b}", "keyPage": str(pKey),
            "receipts": receipts,
        })

    dup = dup_hunt([q for L in all_new for q in L["questions"]], bank, own)

    bank["lessons"] = [L for L in bank["lessons"] if L["lesson"] not in own]
    bank["lessons"].extend(all_new)

    src = bank.setdefault("source", {})
    src["descVocab2"] = {
        "family": "descriptive-vocab-lesson2-and-3",
        "printedHeader": "«آزمون تشریحی واژگان درس دوم» (پاسخ: ص۱۸۴) + «آزمون تشریحی واژگان درس سوم» (پاسخ: ص۱۹۳) — هر دو چهاربخشی",
        "questionPages": "54-56 / 88-90",
        "keyPages": "184 / 193",
        "keyKind": "word-keyed — نگاشتِ واژه→حرف برای MCQ با تطبیقِ یکتا (assert)",
        "lessons": {g["tag"]: {str(g["base"] + k): s for k, s in enumerate([
            "بخش ۱ — جای خالی از دو بانک ۹تایی (تایپی)",
            "بخش ۲ — کلمه با حرف اول (تایپی)",
            "بخش ۳ — تعریف‌ها با بانک ۹تایی (تایپی)",
            "بخش ۴ — ۲۵ MCQ با کلید واژه‌ای چاپی",
        ])} for g in groups_src},
        "unusedBoxWords": {g["tag"]: g["receipts"]["unusedBoxWords"] for g in groups_src},
        "printQuirks": [
            "درس دوم بخش ۱ کلیدِ ۱۶ «disagree» چاپ شده با ساقهٔ «I --- the problem with my parents.» (معناییِ «discussed» به‌جای مانده و مزاحمِ بی‌استفاده است) — عینِ چاپ حاکم است (رندر pdftoppm ص۵۴ و ص۱۸۴) — الگوی printErrata r309.",
            "درس دوم بخش ۴ Q12 خانهٔ چهارمِ گزینه بدون «d.» چاپ شده («c. retiring calling back») — بازسازیِ مستند: c=retiring / d=calling back (رندر ص۵۶).",
            "درس سوم بخش ۲ کلیدهای ۷ و ۸ («Prize»/«Souvenir») با حرف بزرگ چاپ شده‌اند — عینِ چاپ (الگوی Imagine ر۳۱۱)؛ تطبیقِ تایپ حساس به حروف نیست.",
            "پرانتزهای الگوی حرف‌اولِ بخش ۲ درس دوم در لایهٔ RTL معکوس می‌آیند («)c _ _ _(») — سوآپِ امن در ساقهٔ انگلیسیِ خالص انجام شد (رندر ص۵۴: چاپ طبیعی «(c _ _ _)»).",
        ],
        "duplicateHunt": {
            "scope": "همهٔ بانک‌های پیشینِ tests-g11 — ساقهٔ نرمال‌شده (هم‌راستا با منطقِ گارد)",
            "duplicates": dup,
            "note": ("یک بازاستفادهٔ درون‌جزوه‌ایِ چاپی: ساقهٔ g11-l33-6 عیناً در بانکِ تکمیلیِ درس سوم (g11-l5-12، ص۹۳) هم چاپ شده — هر دو نگه داشته شدند؛ گاردِ برابریِ بین‌بانکی (ساقه+کلید) قفل است. الگوی r309." if len(dup) == 1 else f"{len(dup)} هم‌پوشانی"),
        },
        "translation": "برای هر دو آزمون در جزوه ترجمهٔ چاپی نیست (الگوی صادقانهٔ r278/r308/r309/r311) — translation ساخته نشد.",
        "extractedRound": "r312",
    }

    out = json.dumps(bank, ensure_ascii=False, sort_keys=True, indent=1)
    BANK.write_text(out + "\n", encoding="utf-8")

    h1 = hashlib.md5(BANK.read_bytes()).hexdigest()
    total = sum(len(L["questions"]) for L in bank["lessons"])
    print(json.dumps({
        "ok": True,
        "banks": {L["lesson"]: len(L["questions"]) for L in all_new},
        "totalItems": total,
        "totalLessons": len(bank["lessons"]),
        "duplicates": dup,
        "unused": {g["tag"]: g["receipts"]["unusedBoxWords"] for g in groups_src},
        "md5": h1,
    }, ensure_ascii=False, indent=1))

    # اثباتِ idempotency — اجرای دومِ کامل
    bank2 = json.loads(BANK.read_text(encoding="utf-8"))
    assert json.dumps(bank2, ensure_ascii=False, sort_keys=True, indent=1) == out
    print("idempotency: OK", h1)


if __name__ == "__main__":
    sys.exit(main())
