#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract-booklets.py — استخراجِ ساخت‌یافتهٔ محتوای جزوه‌ها از PDFها (راند ۲۰۹)

ورودی:  upload/*.pdf (شش جزوه)      خروجی:  /tmp/booklets/grade{7..12}.json

قراردادها:
- نامِ مؤلف/ناشر و نشانه‌های تماس حذف می‌شود — طبق درخواستِ صریحِ مالک.
- لیگاتور «لا» که لایهٔ متن آن «ال» وارونه ثبت کرده با دیکشنریِ صریح + فالبکِ میانی‌واژه ترمیم می‌شود.
- سطرها با هم‌پوشانیِ y و ستون‌ها با شکافِ x تفکیک می‌شوند (PyMuPDF dict).
- محتوای وابسته به تصویر حذف می‌شود تا چیزی ساختگی نمایش داده نشود.
"""
import fitz
import json
import os
import re
import sys
from collections import Counter

UPLOAD = "upload"
OUT = "/tmp/booklets"
BIDI = dict.fromkeys(map(ord, "\u202a\u202b\u202c\u200e\u200f\u0640"), None)  # + حذفِ کشیده

# ----------------------------------------------------------------------------
# ۱) فیکسرِ لیگاتورِ لا — دیکشنریِ صریح + فالبکِ میانی‌واژه
# ----------------------------------------------------------------------------
LAM_ALEF_FIX = {
    "کالس": "کلاس", "کالسی": "کلاسی", "همکالسی": "همکلاسی", "سالم": "سلام",
    "سالمت": "سلامت", "سالمتی": "سلامتی", "حاال": "حالا", "باال": "بالا",
    "باالی": "بالای", "باالیی": "بالایی", "جمالت": "جملات", "جمالتی": "جملاتی",
    "سواالت": "سوالات", "معموال": "معمولا", "مالقات": "ملاقات", "پالک": "پلاک",
    "االن": "الان", "الزم": "لازم", "الزمی": "لازمی", "عالقه": "علاقه",
    "خالصه": "خلاصه", "قبال": "قبلا", "ایاالت": "ایالات", "اصال": "اصلا",
    "اطالعات": "اطلاعات", "اطالع": "اطلاع", "اطالعی": "اطلاعی", "اطالعاتی": "اطلاعاتی",
    "فالن": "فلان", "فالنی": "فلانی", "عالمت": "علامت", "کامال": "کاملاً",
    "میالدی": "میلادی", "طوالنی": "طولانی", "تعطیالت": "تعطیلات",
    "اصطالح": "اصطلاح", "داللت": "دلالت", "برخالف": "برخلاف", "خالف": "خلاف",
    "کاله": "کلاه", "کاال": "کالا", "آمبوالنس": "آمبولانس", "اتالف": "اتلاف",
    "التین": "لاتین", "امال": "املا", "طوالت": "طولانی", "قباال": "قبال",
    "داالند": "دادند", "باالی‌تر": "بالای‌تر", "عالیق": "عالیق",
}
LAM_ALEF_KEEP = set(
    "حال حالت حالتی حالها حالی حالم حالتون درحال بحال قیدحالت احوال احوالپرسی مثال مثالهای "
    "مثالها مثالهایی سوال سوالی سوالات سؤالات مال مالی مالیات مالک مالکیت سال سالی سالن سالها "
    "سالهای ساله افعال افعالی مطالعه مطالعات خالی فوتبال فینال عالی عالی، عالیتر عالیه عالیقتان "
    "الف الفبا الفبای الگو الهه الهام المللی فعالیت فعالیتها فعالیتهای قالب قالبها خوشحال "
    "خوشحالم خوشحالی جالب جالبه جالبی دنبال دنباله باشیدودنبال والدین والا والدت والده کمال "
    "کمالی محال خالق مقاله مقالات جمال خاله خالها خاله، سالگرد تالیف تالیفی اغلب معالجه خالص "
    "تکالیف تکلیف چالش مطالب شمال بقال سفالگر جوالی عیال عالم اصالتا امالی نچرال گلوبال ژیال "
    "کالوکیشن مقایسه اینقال انتقال طالع نتیجه عالی، عالی،".split()
)


ARAB_PUNCT = "\u060c\u061b\u061f\u066a\u066b\u066c"

# پسوندهای تصریفی رایج — واژهٔ KEEP + پسوند هم KEEP می‌ماند (فوتبال+ش)
INFLECTIONS = ("ها", "های", "ات", "ام", "مان", "تان", "شان", "ش", "م", "ت", "یی", "هایم", "هایت", "هایش", "هایمان", "هایتان", "هایشان")


def fix_lam_alef_word(w: str) -> str:
    core = w.replace("\u200c", "").replace("\u0640", "")
    lead = ""
    tail = ""
    while core and core[0] in ARAB_PUNCT + ".":
        lead += core[0]
        core = core[1:]
    while core and core[-1] in ARAB_PUNCT + ".":
        tail = core[-1] + tail
        core = core[:-1]
    if "ال" not in core:
        return w
    # ۱) دیکشنریِ صریح — حکمِ قطعی (جمالت→جملات حتی با الگویِ پسوند)
    if core in LAM_ALEF_FIX:
        return lead + LAM_ALEF_FIX[core] + tail
    # ۲) پیشوندِ شناخته‌شده + پسوندِ تصریفی → دست‌نخورده (فوتبالش، کلاس‌ها)
    for length in range(len(core) - 1, 3, -1):
        if core[:length] in LAM_ALEF_KEEP and core[length:] in INFLECTIONS:
            return w
    fixed_core = core
    if core in LAM_ALEF_KEEP:
        return w
    # ۳) فالبک: «ال» میانی → «لا» (رفتارِ غالبِ لایهٔ متن)
    out, i, changed = [], 0, False
    while i < len(core):
        if i > 0 and core.startswith("ال", i):
            out.append("لا")
            i += 2
            changed = True
            continue
        out.append(core[i])
        i += 1
    cand = "".join(out)
    if changed and cand not in LAM_ALEF_KEEP:
        fixed_core = cand
    if fixed_core == core:
        return w
    return lead + fixed_core + tail


def fix_fa(text: str) -> str:
    text = text.translate(BIDI)
    out = []
    for tok in re.split(r"(\s+)", text):
        if tok.strip() == "":
            out.append(tok)
        else:
            parts = re.split(r"([\u0600-\u06FF\u200c]+)", tok)
            out.append("".join(p if not re.fullmatch(r"[\u0600-\u06FF\u200c]+", p) else fix_lam_alef_word(p) for p in parts))
    return "".join(out)


# ----------------------------------------------------------------------------
# ۲) پاک‌سازِ نامِ مؤلف/ناشر
# ----------------------------------------------------------------------------
AUTHOR_RE = re.compile(
    r"حسن\s*لطفی|لطفی|حسن\s*lotfi|lotfi|بوکان|دبیر\s*دبیرستان|موبایل|تلگرام|"
    r"اینستا\s*گرام|اینستاگرام|تالیف\s*و\s*گردآوری|سابقه\s*۲?۶\s*سال|0?0914\d{7,}",
    re.IGNORECASE,
)
TABLE_HEADER_RE = re.compile(r"^[\(\)0-9معنیکل\u200c\s]+$")


def is_noise_row(txt: str) -> bool:
    t = txt.strip()
    if not t:
        return True
    if AUTHOR_RE.search(t):
        return True
    if re.fullmatch(r"[0-9۰-۹]+", t):
        return True
    if re.fullmatch(r"[\.\u2026]+", t):
        return True
    if TABLE_HEADER_RE.match(t):
        return True
    return False


# ----------------------------------------------------------------------------
# ۳) سطرسازی
# ----------------------------------------------------------------------------
LATIN = re.compile(r"[A-Za-z]")
PERSIAN = re.compile(r"[\u0600-\u06FF]")


def span_kind(t: str) -> str:
    return "fa" if PERSIAN.search(t) else ("en" if LATIN.search(t) else "fa")


def doc_rows(doc):
    rows = []
    for page in doc:
        d = page.get_text("dict")
        lines = []
        for b in d["blocks"]:
            if b.get("type") != 0:
                continue
            for l in b.get("lines", []):
                spans = [s for s in l.get("spans", []) if s["text"].strip()]
                if not spans:
                    continue
                lines.append({
                    "y0": l["bbox"][1], "y1": l["bbox"][3],
                    "spans": [{"t": s["text"].strip(), "x0": s["bbox"][0], "x1": s["bbox"][2]} for s in spans],
                })
        lines.sort(key=lambda l: (l["y0"], min(s["x0"] for s in l["spans"])))
        rows_page = []
        for l in lines:
            placed = False
            for r in rows_page:
                ov = min(r["y1"], l["y1"]) - max(r["y0"], l["y0"])
                smaller = min(r["y1"] - r["y0"], l["y1"] - l["y0"])
                if smaller > 0 and ov > 0.2 * smaller:
                    r["spans"].extend(l["spans"])
                    r["y0"] = min(r["y0"], l["y0"])
                    r["y1"] = max(r["y1"], l["y1"])
                    placed = True
                    break
            if not placed:
                rows_page.append({"y0": l["y0"], "y1": l["y1"], "spans": list(l["spans"])})
        rows_page.sort(key=lambda r: r["y0"])
        rows.extend(rows_page)
    return rows


def polish_fa(t: str) -> str:
    t = t.translate(BIDI)
    t = re.sub(r"\s*\.\s*:", ":", t)  # معلم .: → معلم:
    m = re.match(r"^([\.،:؛؟!\s]+)(.*)$", t)
    if m and m.group(2):
        lead = m.group(1).replace(":", "").strip()
        t = m.group(2).rstrip() + (lead if lead else "")
    return re.sub(r"\s+([.،:؛؟!])", r"\1", t).strip()


def fix_en(t: str) -> str:
    return re.sub(r"\s+([.,!?;:'])", r"\1", t).strip()


def split_columns(spans, gap=22.0):
    """ستون‌های هندسی (چپ→راست) با شکافِ افقیِ بزرگ."""
    sp = sorted([s for s in spans if s["t"].strip()], key=lambda s: s["x0"])
    if not sp:
        return []
    cols = [[sp[0]]]
    for prev, cur in zip(sp, sp[1:]):
        if cur["x0"] - prev["x1"] > gap:
            cols.append([cur])
        else:
            cols[-1].append(cur)
    return cols


def col_bounds(col):
    return min(s["x0"] for s in col), max(s["x1"] for s in col)


def run_text(kind, spans) -> str:
    if kind == "en":
        asc = sorted([s for s in spans if s["t"].strip()], key=lambda s: s["x0"])
        text = asc[0]["t"].strip()
        for prev, cur in zip(asc, asc[1:]):
            gap = cur["x0"] - prev["x1"]
            text += cur["t"].strip() if gap < 14 else " " + cur["t"].strip()
        return fix_en(text)
    # فارسی: راست→چپ؛ واژه‌های شکسته (کلا س) با شکافِ < ۳pt بدونِ فاصله
    desc = sorted([s for s in spans if s["t"].strip()], key=lambda s: -s["x0"])
    text, left = "", None
    for s in desc:
        t = s["t"].strip()
        if not t:
            continue
        if text and left is not None and (left - s["x1"]) < 3:
            text += t
        elif text and len(t) == 1 and t not in "وؤا" and not t.isdigit():
            text += t  # تک‌حرفِ بی‌فاصله = ادامهٔ واژهٔ قبلی (کلا|س، ا|ز)
        else:
            text = text + " " + t if text else t
        left = s["x0"]
    return polish_fa(fix_fa(text))


def pair_row_vocab(row):
    """جدول واژگان: ران‌های اسکریپتی؛ هر en با اولین fa معتبرِ نزدیک (راست، فالبک چپ)."""
    runs = script_runs(row["spans"])
    en_runs = [i for i, r in enumerate(runs) if r[0] == "en"]
    # فقط ران‌های fa که واقعاً حروف فارسی دارند (ستاره‌ها/نشان‌ها نامزد نیستند)
    fa_runs = []
    for i, r in enumerate(runs):
        if r[0] != "fa":
            continue
        txt = run_text("fa", r[1])
        if PERSIAN.search(txt):
            fa_runs.append(i)
    if not en_runs or not fa_runs:
        return []
    pairs, used = [], set()
    for i in en_runs:
        en = run_text("en", runs[i][1]).strip(" *•").strip()
        ex1 = runs[i][2]
        if not en or re.match(r"^[\d\.\s]+$", en):
            continue
        cands = [j for j in fa_runs if j not in used and runs[j][1][0]["x0"] > ex1] or \
                [j for j in fa_runs if j not in used]
        cands.sort(key=lambda j: abs(runs[j][1][0]["x0"] - ex1))
        for j in cands:
            fa = run_text("fa", runs[j][1]).strip(" *").strip()
            if len(fa) > 1:
                pairs.append({"en": en, "fa": fa})
                used.add(i)
                used.add(j)
                break
    return pairs


def row_cols(row):
    """سطر → [(kind, text, x0, x1)] ران‌های اسکریپتی از چپ به راست."""
    out = []
    for kind, spans, x1 in script_runs(row["spans"]):
        text = run_text(kind, spans)
        x0 = min(s["x0"] for s in spans)
        if text:
            out.append((kind, text, x0, x1))
    return out


def row_plain(row) -> str:
    """متنِ سطر: راست→چپ با ران‌های انگلیسیِ چپ→راست."""
    cols = row_cols(row)
    segs = []
    run = []
    for kind, text, _, _ in reversed(cols):  # راست به چپ
        if kind == "en":
            run.append(text)
        else:
            if run:
                segs.extend(reversed(run))
                run = []
            segs.append(text)
    if run:
        segs.extend(reversed(run))
    return " ".join(segs)


def script_runs(spans):
    """ستون‌ها از روی تغییرِ اسکریپت (جدولِ en,fa,en,fa) — چپ→راست."""
    sp = sorted([s for s in spans if s["t"].strip()], key=lambda s: s["x0"])
    runs = []
    for s in sp:
        k = span_kind(s["t"])
        if runs and runs[-1][0] == k and (s["x0"] - runs[-1][2]) < 40:
            runs[-1][1].append(s)
            runs[-1][2] = s["x1"]
        else:
            runs.append([k, [s], s["x1"]])
    return runs


# ----------------------------------------------------------------------------
# ۴) تجزیهٔ پایه‌های ۷-۹
# ----------------------------------------------------------------------------
ORD = {"اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9}
RE_VOCAB = re.compile(r"واژگان\s*و\s*نکات\s*(?:گرامری|دستوری)\s*درس\s*(\S+)\s*پایه")
RE_PREVOCAB = re.compile(r"مرور\s*واژگان\s*قبل\s*از\s*درس\s*(\S+)")
RE_CONV = re.compile(r"ترجمه\s*(?:مکالمه|conversation)?\s*درس\s*(\S+)\s*پایه", re.IGNORECASE)
RE_PRACT = re.compile(r"ترجمه\s*(?:تمرین|practice)?\s*درس\s*(\S+)\s*پایه", re.IGNORECASE)
RE_GRAM = re.compile(r"(?:دستور\s*زبان|نکات\s*گرامری\s*و\s*دستور\s*زبان)\s*درس\s*(\S+)")
RE_EXAM = re.compile(r"(?:نمونه\s*)?سو[اآؤ]لات?\s*امتحانی\s*درس\s*(\S+)\s*پایه")
RE_VERBS = re.compile(r"افعال\s*بی\s*قاعده")
IMAGE_HINT = re.compile(r"تصویر|تصاویر|شکل\s*(?:زیر|روبرو|بالا|پایین)")
DIGRAPHS = {"ch", "kh", "sh", "ph", "th", "gh", "wh", "ck", "oo", "ee", "qu"}
RE_EN_SPEAKER = re.compile(r"^(teacher|student\s*\d*|class|mother|father|doctor)\s*:\s*", re.IGNORECASE)
RE_FA_SPEAKER = re.compile(r"^(معلم|دانش\s*آموز\s*\d*|کلاس|مادر|پدر|پزشک)\s*:\s*")


def classify_heading(t: str):
    clean = t.strip()
    if len(clean) > 80:
        return None
    m = RE_VOCAB.search(clean)
    if m:
        return ("vocab", ORD.get(m.group(1)))
    m = RE_PREVOCAB.search(clean)
    if m:
        return ("vocab", ORD.get(m.group(1), 0))
    m = RE_PRACT.search(clean)
    if m:
        return ("practice", ORD.get(m.group(1)))
    m = RE_CONV.search(clean)
    if m:
        return ("dialogue", ORD.get(m.group(1)))
    m = RE_GRAM.search(clean)
    if m:
        return ("notes", ORD.get(m.group(1)))
    m = RE_EXAM.search(clean)
    if m:
        return ("exam", ORD.get(m.group(1)))
    if RE_VERBS.search(clean):
        return ("verbs", 0)
    return None


def parse_vocab_section(rows):
    words, prose = [], []
    for row in rows:
        pairs = pair_row_vocab(row)
        if pairs:
            words.extend(pairs)
            continue
        txt = row_plain(row)
        if not txt or len(txt) < 6 or is_noise_row(txt) or TABLE_HEADER_RE.match(txt):
            continue
        prose.append(txt)
    return words, prose


def emit_dialogue_line(en, fa, lines):
    m = RE_EN_SPEAKER.match(en)
    sp = m.group(1).capitalize() if m else None
    body_en = RE_EN_SPEAKER.sub("", en) if m else en
    m2 = RE_FA_SPEAKER.match(fa)
    body_fa = RE_FA_SPEAKER.sub("", fa) if m2 else fa
    sp = sp or (m2.group(1) if m2 else None)
    if body_en and body_fa and not IMAGE_HINT.search(body_fa):
        lines.append({"speaker": sp, "en": body_en, "fa": body_fa})


def parse_dialogue_rows(rows):
    """مکالمه/تمرین: جفت‌سازیِ ردیفِ EN با ردیفِ FA؛ جدول‌های دوستونی با هم‌پوشانیِ x."""
    lines = []
    pending = []  # ستون‌های en بدونِ جفت [{x0,x1,en}]

    def flush_matched(fa_cells):
        nonlocal pending
        for fc in fa_cells:
            cand = [p for p in pending if not (p["x1"] < fc["x0"] or p["x0"] > fc["x1"])]
            if cand:
                best = min(cand, key=lambda p: (p["x1"] - p["x0"]))
                emit_dialogue_line(best["en"], fc["fa"], lines)
                pending.remove(best)
            elif len(fa_cells) == 1 and len(pending) == 1:
                emit_dialogue_line(pending[0]["en"], fc["fa"], lines)
                pending = []

    for row in rows:
        pairs = pair_row_vocab(row)
        if len(pairs) >= 2:
            for p in pairs:
                emit_dialogue_line(p["en"], p["fa"], lines)
            pending = []
            continue
        cols = row_cols(row)
        en_cols = [c for c in cols if c[0] == "en"]
        fa_cols = [c for c in cols if c[0] == "fa"]
        if en_cols and not fa_cols:
            for c in en_cols:
                pending.append({"x0": c[2], "x1": c[3], "en": c[1]})
            continue
        if fa_cols:
            fa_cells = [{"x0": c[2], "x1": c[3], "fa": c[1]} for c in fa_cols]
            if pending:
                flush_matched(fa_cells)
                pending = []
                continue
            for fc in fa_cells:
                pass  # فارسیِ بی‌انگلیسی در مکالمه — رد
            continue
        if en_cols and fa_cols:  # هر دو در یک ردیف
            for ec in en_cols:
                cand = [f for f in fa_cols if not (f[3] < ec[2] or f[2] > ec[3])] or fa_cols
                if cand:
                    f = min(cand, key=lambda f: abs((f[2] + f[3]) / 2 - (ec[2] + ec[3]) / 2))
                    emit_dialogue_line(ec[1], f[1], lines)
            pending = []
    return lines


def parse_exam_rows(rows):
    items = []
    for row in rows:
        txt = row_plain(row)
        if not txt or len(txt) < 4 or is_noise_row(txt):
            continue
        if IMAGE_HINT.search(txt):
            continue
        items.append(txt)
    return items


def parse_verbs_rows(rows):
    out = []
    for row in rows:
        cols = row_cols(row)
        en_cols = [c for c in cols if c[0] == "en"]
        fa_cols = [c for c in cols if c[0] == "fa"]
        forms = [c[1] for c in en_cols]
        if len(forms) >= 2 and fa_cols:
            f0 = forms[0].lower().strip(".,")
            if len(f0) >= 3 and f0 not in DIGRAPHS and f0.isalpha():
                out.append({"forms": forms[:4], "fa": " ".join(c[1] for c in fa_cols)})
    return out


def extract_grade789(pdf_path: str, grade: int) -> dict:
    doc = fitz.open(pdf_path)
    rows = doc_rows(doc)
    doc.close()

    sections, cur = [], None
    for row in rows:
        plain = row_plain(row)
        if is_noise_row(plain):
            continue
        head = classify_heading(plain)
        if head:
            cur = {"kind": head[0], "lesson": head[1], "title": plain.strip(), "rows": []}
            sections.append(cur)
        elif cur is not None:
            cur["rows"].append(row)

    lessons, general = {}, {"verbs": [], "tips": []}
    for sec in sections:
        num = sec["lesson"] or 0
        slot = lessons.setdefault(num, {})
        if sec["kind"] == "vocab":
            words, prose = parse_vocab_section(sec["rows"])
            slot.setdefault("vocab", []).extend(words)
            if prose:
                slot.setdefault("notes", []).extend(prose)
        elif sec["kind"] == "dialogue":
            lines = parse_dialogue_rows(sec["rows"])
            slot.setdefault("dialogue", {"title": sec["title"], "lines": []})["lines"].extend(lines)
        elif sec["kind"] == "practice":
            slot.setdefault("practice", []).append({"title": sec["title"], "lines": parse_dialogue_rows(sec["rows"])})
        elif sec["kind"] == "notes":
            prose = [row_plain(r) for r in sec["rows"]]
            prose = [p for p in prose if p and len(p) >= 6 and not is_noise_row(p) and not TABLE_HEADER_RE.match(p)]
            slot.setdefault("notes", []).extend(prose)
        elif sec["kind"] == "exam":
            slot.setdefault("exam", []).extend(parse_exam_rows(sec["rows"]))
        elif sec["kind"] == "verbs":
            general["verbs"].extend(parse_verbs_rows(sec["rows"]))
    return {"grade": grade, "lessons": lessons, "general": general}


# ----------------------------------------------------------------------------
# ۵) تجزیهٔ جامع (پایه‌های ۱۰-۱۲) — لغاتِ کلیدیِ هر درس
# ----------------------------------------------------------------------------
RE_NOSPACE = re.compile(r"لغاتکلیدیوتکم.?یلدرس(\S+?)پایه(دهم|یازدهم|دوازدهم)")
GRADE_OF = {"دهم": 10, "یازدهم": 11, "دوازدهم": 12}
ORD2 = {"اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5, "ششم": 6, "هفتم": 7, "هشتم": 8}


def nospace(t: str) -> str:
    return re.sub(r"[\s\u200c\u0640]+", "", t)


def extract_jame(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    rows = doc_rows(doc)
    doc.close()

    lessons, cur = {}, None
    for row in rows:
        plain = row_plain(row)
        if is_noise_row(plain):
            continue
        m = RE_NOSPACE.search(nospace(plain))
        if m:
            les, gr = ORD2.get(m.group(1)), GRADE_OF.get(m.group(2))
            if les and gr:
                cur = les
                lessons.setdefault(les, {"vocab": [], "notes": []})
                continue
        if cur is not None:
            pairs = pair_row_vocab(row)
            if pairs and all(len(p["en"].split()) <= 4 and len(p["fa"]) < 80 for p in pairs):
                lessons[cur]["vocab"].extend(pairs)
            else:
                txt = row_plain(row)
                if txt and PERSIAN.search(txt) and not LATIN.search(txt) and 25 < len(txt) < 400:
                    lessons[cur]["notes"].append(txt)
    return {"lessons": lessons}


# ----------------------------------------------------------------------------
def main():
    os.makedirs(OUT, exist_ok=True)
    files = {
        7: "جزوه هفتم.pdf",
        8: "جزوه هشتم.pdf",
        9: "جزوه زبان نهم حسن لطفی بوکان.pdf",
        10: "جزوه جامع دهم .pdf",
        11: "جزوه جامع یازدهم .pdf",
        12: "جزوه_جامع_پایه_دوازدهم_با_امتحانات_نهایی_.pdf",
    }
    only = [int(x) for x in sys.argv[1:]] or list(files)
    for grade in only:
        path = os.path.join(UPLOAD, files[grade])
        data = extract_grade789(path, grade) if grade <= 9 else extract_jame(path)
        out = os.path.join(OUT, f"grade{grade}.json")
        with open(out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        if grade <= 9:
            summary = {}
            for les, slot in data["lessons"].items():
                summary[f"L{les}"] = {
                    k: (len(v["lines"]) if k == "dialogue" else (sum(len(p["lines"]) for p in v) if k == "practice" else len(v)))
                    for k, v in slot.items()
                }
            print(f"grade {grade}: {out}")
            print("   ", json.dumps(summary, ensure_ascii=False))
            print("    verbs:", len(data["general"]["verbs"]))
        else:
            summary = {f"L{k}": {"vocab": len(v["vocab"]), "notes": len(v.get("notes", []))} for k, v in data["lessons"].items()}
            print(f"grade {grade}: {out}")
            print("   ", json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
