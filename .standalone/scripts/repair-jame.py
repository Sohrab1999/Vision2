#!/usr/bin/env python3
"""Repair the جامع mined rows — round 210, v2 (strict).

Three repair layers, precision-first:
  1. cross-booklet gold: the same en often appears in another جامع booklet
     with a gold (app-verified) Persian — adopt it.
  2. strict token gate: every content token of the raw fa must live in a
     whitelist built from ALL verified app Persian (lesson vocab + syn/ant
     pairs + booklet rows) plus a curated function-word list. Single-letter
     fragments (مشی ی / ا ضطراری) are hard suspects.
  3. learned token rewrites from (raw→gold) alignments, re-gated afterwards.
Anything still suspect lands in residue files for hand curation — zero
corrupted Persian may reach the app.

Outputs: booklet-extract/jame{N}-clean.json / -residue.txt / -rewrites.txt
"""
import difflib
import json
import os
import re
from collections import Counter

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")

POS_TAG = re.compile(r"\s*\((?:n|v|adj|adv|prep|conj|pron|interj|phr|id|pl|s)\)\s*")

STOP = set("""به از در برای با تا هر که و این آن یک های ها یا ولی اما بسیار خیلی
بیشتر همچنین مورد طور حالت نوع شخص نفر کس چیزی هیچ همه بعضی چند داخل خارج
شده شدن کردن دادن گرفتن بودن داشتن رفتن آمدن گفتن شدن‌ها خود هم حتی فقط اگر
بر روی زیر بین نزد مثل غیر جز سایر دیگر دیگری آنان آنها اش ام ای بله
""".split())

# common real Persian words absent from the app's small verified corpus
EXTRA_WL = set("""مجازات اجازه ورود مقایسه رقابت سطح نقل سازمان گردش الهام تنبیه
بهشت آسمان مدرن مشاهده رصد کیفیت زمینه دنبال ارائه وارد شدت تنها خنک وقف
تاریخ تحقیق تحقیقات جنگل محیط زیست جدول تعطیل تعطیلات ملاقات تحصیل مدت مزیت
حضور غیاب تغییر تفاوت متفاوت ترتیب ترتیبات تشویق تلاش توسعه تحلیل ترکیب
تقاضا تقریبا تخمین توصیه توجه تهدید تدریس تبلیغ تبریک تعمیر تعاونا تعاونی
امکان امتیاز اعضا عضو ارشد ارایه ارائه اساس اساسی استعداد اشتباه اصل
اصولا اطلاع اطلاعات اطمینان اقتدار اقامت اقتصاد الگو املا انرژی انگیزه
انجمن انتظار انقلاب انشاء انگيزه انگیزه اهمیت ایده ایجاد ایمان اینترنت
باغبان باغچه بازار بازی باقی بخصوص بخش بخشی بدبخت بدترین بردار برند
برنامه برق برزیل بساز بستن بصورت بخش بنابراین بنیاد بهتر بهترین بوستان
پایگاه پایدار پرداخت پرسش پرفروش پرورش پژوهش پست پذیرش پوشاک پویا
پیام پیمان پیوند تاریخ تحقیق خانه خواسته خدمت خطرناک خلاق خلاقیت
دانش دانشجو دانش آموز دانایی درخواست درس درسنامه دریای دستاورد دسترسی
دفاع دفتر دولت دوربین دوباره دوستی دنیا دیگران دهکده دیدگاه
رابطه رئیس رسیدن رفاه رقابت رهبر رهبری روبه روابط رشته رهسپار
زنده زیبا زیبایی زیست شناسی زندگی سازماندهی سالم سلامت سلامتی سامانه
سراسر سرعت سرفصل سکوت سالمند سنجش سوخت سهم سیاست سیگار شادی شاهکار
شغل شناسایی شهرداری شهروند شیوه صداقت صرفه صیانت صحیح صادق
طبقه طبیعت ظرفیت عقیده علم عصر عمومی غیرممکن فجله فاجعه فرهنگ
فناوری فروش فهرست فواید فضا فیزیک قابلیت قابل قوانین قانون قضاوت
کاهش کاوش کتبا کشاورزی گذراندن گزارش گلخانه گنجاندن لذت لازم لمس
مالی مبارزه متأسفانه متوسط محله محسوس محیطی مسئول مقایسه ماندگار
مانع مثبت مجتمع مجاز مجهز محدود محرمانه محصل معنی معنوی مذاکره
معجزه معالج مبتنی مباحثه متهم محترم مرحله مستقل مشاور مشتری
مصرف مضار مکمل ممتاز منابع منطق منظر نظارت نظر نگاه نسبت
نظم نشان نجات نسل نشست نفع نفوذ هوش هیجان هدیه هدف همکار هوشمند
واسطه واقعه وانمود واجب ورزش وزن وعده هدفمند هویت یافتن یکدست
صفت دهنده کننده برترین شیرین ستون راهنما امتحان کمک تفریح شرط
شرح گردشگری ضرب ضروری امید انسان واحد دارایی چاپ جریمه تاوان
جاسوس اطلاع رسانی خطر فاجعه بار توصیف توصیفی توصیف کننده
آرامش روایت ثروتمند دردناک مسافر آژانس مسیح میلاد معلوم تقویت
اذیت بررسی سند برجسته تصدیق انتقاد فقدان ماهیچه قطب مهم گرد
پس نویس مذهب کودکی دوران خاطرات یادداشت مستند زائر ضد بیننده
مخاطب قدرت توان استحکام آرام صلح نویسنده مورخ دانا ختم پایان
مسیحی مسافرتی مذهبی آرامی آنالیز کنترل شیطان بچگی دفتر قدیم
خوشنام محبت ریسک خاطره تصویر برداری منطقه‌ای منطقه ای جهانی
مکث حقوق جریان کمیت بدین شک فریاد موجودات زبانه جستجوگر فایده
پیچیده استدلال اصیل بحث جر شرم آور ننگین دسترسی استراحت نبرد
جدال مالی زیست زمان کیفی واقعی باورناکردنی ناکردنی، تردید
""".split())

# verified hand-curated fixes for systematically broken tokens
TOKEN_OVERRIDES = {
    "اخالق": "اخلاق", "اخالقیات": "اخلاقیات", "تالش": "تلاش", "عالقه": "علاقه",
    "داشتر": "داشتن", "داشتر ز": "داشتن", "داشی": "داشتن",
    "خیی": "خبر", "چیر": "چیز", "بیشیر": "بیشتر",
    "مرصف": "مصرف", "ییح": "یخ", "دریات": "دریایی", "اصأل": "اصلاً",
    "ابدأ": "ابداً", "سنگت ز": "سنگین", "محشی": "محشر", "گشی": "گشتن",
    "رسال": "سالم", "شفایه": "شفاهی", "پش خواهر": "پسر خواهر",
    "پش برادر": "پسر برادر", "عایل": "عالی",
    "میالد": "میلاد", "شطان": "شیطان", "بچگ": "بچگی", "دفی": "دفتر",
    "قدییم": "قدیم", "آمیر": "آمیز", "یافی": "یافتن", "مسافرتر": "مسافرتی",
    "آنالیر": "آنالیز", "مذهت": "مذهبی", "آرایم": "آرامی", "برریس": "بررسی",
    "ششناس": "خوشنام", "مهمی": "مهم", "تاری": "تاریخ", "کنی": "کنتر",
    "پیشر فت": "پیشرفت", "داشتر ز": "داشتن", "سنگت ز": "سنگین",
    "زمات": "زمان", "کیم": "کیفی", "واقیع": "واقعی", "نکردت": "ناکردنی",
    "شنایس": "شناسی", "رص وری": "ضروری", "نیی د": "نبرد",
}

# whole-phrase fixes (applied before tokenization) — confident cases only
PHRASE_OVERRIDES = {
    "رص وری": "ضروری",
    "ر ا هنما": "راهنما",
    "ر دری غ کردن، چشم پویس": "دریغ کردن، چشم پوشیدن",
    "با خیی بودن از، خیی ی داشی": "باخبر بودن از، خبر داشتن",
    "ت نهایت": "تا نهایت",
    "به شر ح زیر همچون زیر": "به شرح زیر، همچون زیر",
    "بدون قید و شر ط": "بدون قید و شرط",
    "گرد آ وری کردن": "گردآوری کردن",
    "به شدت، به طور سنگت ز(بارش برف و باران)": "به شدت، به طور سنگین (بارش برف و باران)",
    "بی ون پریدن": "بیرون پریدن",
    "خوش گذراندن، تفری ح داشتر ز": "خوش گذراندن، تفریح داشتن",
    "سالخورده، پیر ، قدییم، کهنه": "سالخورده، پیر، قدیمی، کهنه",
    "جمله معلوم ( در دستور زبان )": "جمله معلوم (در دستور زبان)",
    "ضد شطان": "ضد شیطان",
    "بعد از میالد مسیح ، میالدی": "بعد از میلاد مسیح، میلادی",
    "بچگ ، کودیک، دوران بچگ": "بچگی، کودکی، دوران بچگی",
    "شر م ، آور ، خجالت آور ننگیر": "شرم‌آور، خجالت‌آور، ننگین",
    "نیی د، جدال ، جنگ": "نبرد، جدال، جنگ",
    "قابل دسی س": "قابل دسترسی",
    "اسی احت کردن": "استراحت کردن",
    "تی ثمر بودن، تی فایده بودن": "بی‌ثمر بودن، بی‌فایده بودن",
    "توانات مایل داشی": "توان مالی داشتن",
    "کردن ر دری غ کردن، چشم پویس": "دریغ کردن، چشم پوشیدن",
    "دنبال کردن - پیر وی کردن": "دنبال کردن - پیروی کردن",
}

SINGLE_SUSPECT = set("ابپتثجسشصرزینموکیه")


def norm(s):
    s = s.lower().replace(chr(8217), chr(39))
    return re.sub(r"[()\s]+", " ", s).strip()


def load_exist():
    exist = {}
    for lid in range(1, 13):
        ens = set()
        for line in open(f"{BASE}/src/data/lesson{lid}.ts", encoding="utf-8"):
            m = re.match(r'\s*W\("([^"]+)"', line)
            if m:
                ens.add(norm(m.group(1)))
        exist[lid] = ens
    return exist


def load_whitelist():
    wl = set(STOP) | set(EXTRA_WL) | set(TOKEN_OVERRIDES.values())
    # all verified fa from lesson vocab
    for lid in range(1, 13):
        for line in open(f"{BASE}/src/data/lesson{lid}.ts", encoding="utf-8"):
            m = re.match(r'\s*W\("([^"]+)",\s*"([^"]+)"', line)
            if m:
                for t in re.split(r"[\s،\-]+", m.group(2)):
                    t = t.strip("().«»")
                    if t:
                        wl.add(t)
    # syn/ant pair fa
    try:
        src = open(f"{BASE}/src/data/syn-ant-pairs.ts", encoding="utf-8").read()
        for fa in re.findall(r'fa:\s*"([^"]+)"', src):
            for t in re.split(r"[\s،\-]+", fa):
                t = t.strip("().«»")
                if t:
                    wl.add(t)
    except FileNotFoundError:
        pass
    # booklet rows fa (middle-school, verified in r209)
    for g in (7, 8, 9):
        try:
            src = open(f"{BASE}/src/data/booklet/grade{g}.ts", encoding="utf-8").read()
        except FileNotFoundError:
            continue
        for fa in re.findall(r'fa:\s*"([^"]+)"', src):
            for t in re.split(r"[\s،\-]+", fa):
                t = t.strip("().«»")
                if t:
                    wl.add(t)
    return wl


def tokens(s):
    return [t for t in re.split(r"[\s،]+", s) if t]


def swap_lam_alef(tok, wl, corpus):
    """Repair لا↔ال transpositions (اخالق→اخلاق، تعطییل→تعطیلات).
    The repaired variant must be whitelist-verified or booklet-frequent."""
    if "ال" in tok:
        v = tok.replace("ال", "لا")
        if v in wl or corpus.get(v, 0) >= 6:
            return v
    if "لا" in tok:
        v = tok.replace("لا", "ال")
        if v in wl or corpus.get(v, 0) >= 6:
            return v
    # hamza-based (اصأل → اصلاً class): strip stray أ/ء
    if "أ" in tok:
        v = tok.replace("أ", "ا").replace("ء", "")
        if v in wl or (corpus and corpus.get(v, 0) >= 6):
            return v
    return None


def learn_rewrites(rows):
    tok_map = Counter()
    # common tokens must never be rewritten by learned alignments — a
    # misaligned gold pair once produced «به => سالم» and «کردن => حس»
    never = set(STOP) | {"کردن", "شدن", "دادن", "گرفتن", "بودن", "داشتن",
                          "رفتن", "آمدن", "گفتن", "کردن‌ها"}
    for r in rows:
        raw, gold = r["raw"], r["gold"]
        if not gold or raw == gold:
            continue
        rt, gt = tokens(raw), tokens(gold)
        sm = difflib.SequenceMatcher(a=rt, b=gt)
        for op, a1, a2, b1, b2 in sm.get_opcodes():
            if op == "replace" and a2 - a1 == b2 - b1:
                for k in range(a2 - a1):
                    a, b = rt[a1 + k], gt[b1 + k]
                    if a != b and a and b and a not in never and b not in never:
                        tok_map[(a, b)] += 1
    return tok_map


def gate(fa, wl, corpus, broken_raw):
    """Return (ok, bad_tokens)."""
    bad = []
    toks = tokens(fa)
    for tok in toks:
        if re.fullmatch(r"[A-Za-z0-9()./]+", tok):
            continue  # Latin/digit annotation
        t = tok.strip("().-«»")
        if not t:
            continue
        if len(t) == 1 and t in SINGLE_SUSPECT:
            bad.append(tok)
            continue
        if t in wl or tok in wl:
            continue
        if broken_raw and t in broken_raw:
            bad.append(tok)
            continue
        hit = False
        for suf in ("ی", "های", "ها", "تر", "ترین"):
            if t.endswith(suf) and t[: -len(suf)] in wl:
                hit = True
                break
        if hit:
            continue
        bad.append(tok)
    return (not bad), bad


def clean_en(en):
    e = POS_TAG.sub("", en).strip()
    e = re.sub(r"\s+", " ", e)
    return e


FA_LETTER = re.compile(r"[\u0621-\u064A\u0678-\u06EE\uFB50-\uFDFF\uFE70-\uFEFF]")
LATIN = re.compile(r"[A-Za-z]")


def segments(line):
    """Split a line into maximal script runs: list of (cls, text)."""
    runs, cur_cls, cur = [], None, []
    for ch in line:
        if FA_LETTER.match(ch) or ch in "،؟":
            c = "fa"
        elif LATIN.match(ch):
            c = "en"
        else:
            c = "neutral"
        if c == "neutral":
            if cur_cls is not None and cur:
                cur.append(ch)
            continue
        if c != cur_cls:
            if cur:
                runs.append((cur_cls, "".join(cur).strip()))
            cur_cls, cur = c, [ch]
        else:
            cur.append(ch)
    if cur:
        runs.append((cur_cls, "".join(cur).strip()))
    merged = []
    for cls, txt in runs:
        if not txt:
            continue
        if merged and merged[-1][0] == cls:
            merged[-1] = (cls, merged[-1][1] + " " + txt)
        else:
            merged.append((cls, txt))
    return merged


def build_corpus():
    """Frequency corpus of fa tokens from the three جامع extracts, minus
    tokens that appear on the RAW side of gold rewrites (verified-broken)."""
    freq = Counter()
    for g in (10, 11, 12):
        for line in open(f"{EXTRACT}/g{g}.txt", encoding="utf-8"):
            t = line.strip()
            if not t or is_noise(t):
                continue
            for cls, txt in segments(t):
                if cls == "fa":
                    for tok in re.split(r"[\s،\-]+", txt):
                        tok = tok.strip("().-«»")
                        if len(tok) >= 3:
                            freq[tok] += 1
    return freq


def is_noise(line):
    t = line.strip()
    if not t or re.match(r"^-{3,}", t):
        return True
    if re.match(r"^[\s\d.\u200f\u200e()،-]*$", t):
        return True
    for sub in ("جزوه جام", "تألیف", "تاليف", "گردآوری", "Telegram",
                "<<<PAGE", "Vision", "سوره", "آیه", "همکاران"):
        if sub in t:
            return True
    return False


def polish_fa(fa):
    """Final cosmetic pass: balanced parens, no leading ،، tight spacing."""
    fa = re.sub(r"\s+", " ", fa).strip()
    fa = re.sub(r"^[،،\s]+", "", fa)
    fa = re.sub(r"\s*،\s*", "، ", fa)
    fa = re.sub(r"\(\s*", "(", fa)
    fa = re.sub(r"\s*\)", ")", fa)
    # drop unmatched parens
    if fa.count("(") != fa.count(")"):
        fa = fa.replace("(", "").replace(")", "")
    fa = re.sub(r"\s+([،)])", r"\1", fa)
    return fa.strip()


def repair_tokens(raw, wl, corpus, tok_map, broken_raw):
    """Overrides → learned rewrites → lam-alef swap → fragment join.
    Comma-separated meaning segments are repaired independently so the
    «،» separators of the source survive the round-trip."""
    s = PHRASE_OVERRIDES.get(raw, PHRASE_OVERRIDES.get(raw.strip("، "), raw))
    segs = [x.strip() for x in s.split("،")]
    fixed_segs = []
    for seg in segs:
        if not seg:
            continue
        fixed_segs.append(_repair_seg(seg, wl, corpus, tok_map, broken_raw))
    return polish_fa("، ".join(fixed_segs))


def _repair_seg(seg, wl, corpus, tok_map, broken_raw):
    out = []
    for tok in tokens(seg):
        r = TOKEN_OVERRIDES.get(tok)
        if r:
            out.append(r)
            continue
        repl = None
        for (a, b), c in tok_map.items():
            if c >= 2 and a == tok:
                repl = b
                break
        if repl is None:
            repl = swap_lam_alef(tok, wl, corpus)
        out.append(repl if repl else tok)
    # pair pass: two-token override keys (پیشر فت، داشتر ز، …)
    i = 0
    merged = []
    while i < len(out):
        if i + 1 < len(out):
            pair = out[i] + " " + out[i + 1]
            if pair in TOKEN_OVERRIDES:
                merged.append(TOKEN_OVERRIDES[pair])
                i += 2
                continue
        merged.append(out[i])
        i += 1
    out = merged
    # fragment join: single-char suspects (+ known 2-char splits) glue to a
    # neighbour when the joined form passes the gate
    res, i = [], 0
    while i < len(out):
        t = out[i]
        frag = (len(t) == 1 and t in SINGLE_SUSPECT) or t in ("ین", "گر", "شر", "رص")
        if frag:
            done = False
            if res:
                cand = res[-1] + t
                ok, _ = gate(cand, wl, corpus, broken_raw)
                if ok:
                    res[-1] = cand
                    done = True
            if not done and i + 1 < len(out):
                nxt = out[i + 1]
                for cand in (t + nxt, nxt + t):
                    ok, _ = gate(cand, wl, corpus, broken_raw)
                    if ok:
                        out[i + 1] = cand
                        done = True
                        break
            if not done:
                res.append(t)
            i += 1
            continue
        res.append(t)
        i += 1
    return polish_fa(" ".join(res))


def main():
    exist = load_exist()
    wl = load_whitelist()
    corpus = build_corpus()
    all_rows = []
    for g in (10, 11, 12):
        data = json.load(open(f"{EXTRACT}/jame{g}-mine.json", encoding="utf-8"))
        for sec in data:
            for r in sec["rows"]:
                r["target"] = sec["target"]
                r["grade"] = sec["grade"]
                r["lesson"] = sec["lesson"]
                all_rows.append(r)

    # layer 1: cross-booklet gold by en  +  multi-source candidates by en
    gold_by_en = {}
    cand_by_en = {}
    for r in all_rows:
        if r["gold"]:
            gold_by_en.setdefault(norm(r["en"]), r["gold"])
        k = norm(r["en"])
        fa = re.sub(r"\s+", " ", r["fa"]).strip()
        if fa and fa not in cand_by_en.get(k, []):
            cand_by_en.setdefault(k, []).append(fa)

    gold_rows = [r for r in all_rows if r["gold"]]
    tok_map = learn_rewrites(gold_rows)
    # tokens verified-broken: raw side of learned rewrites
    broken_raw = {a for (a, b), c in tok_map.items() if c >= 2}

    report = []
    for g in (7, 8, 9, 10, 11, 12):
        data = [r for r in all_rows if r["grade"] == g]
        clean, residue = [], []
        seen = set()
        stats = Counter()
        for r in data:
            if r["dup"]:
                continue
            en = clean_en(r["en"])
            k = norm(en)
            if not k or k in exist[r["target"]] or k in seen:
                continue
            seen.add(k)
            raw = re.sub(r"\s+", " ", r["fa"]).strip()
            src = None
            fa = None
            gb = gold_by_en.get(k)
            if gb and gb != raw:
                fa, src = polish_fa(gb), "gold-x"
            elif gb:
                fa, src = polish_fa(raw), "raw=gold"
            else:
                # try every candidate fa seen for this en across booklets
                chosen = None
                for cand0 in cand_by_en.get(k, []):
                    cand = PHRASE_OVERRIDES.get(cand0, PHRASE_OVERRIDES.get(cand0.strip("، "), cand0))
                    ok, _ = gate(cand, wl, corpus, broken_raw)
                    if ok:
                        chosen, src = polish_fa(cand), ("raw" if cand0 == raw else "cand")
                        break
                if chosen is None:
                    fa2 = repair_tokens(raw, wl, corpus, tok_map, broken_raw)
                    ok2, bad2 = gate(fa2, wl, corpus, broken_raw)
                    if ok2:
                        fa, src = fa2, "learned"
                    else:
                        residue.append(
                            {"en": en, "fa": raw, "target": r["target"],
                             "grade": g, "lesson": r["lesson"], "bad": bad2}
                        )
                        stats["residue"] += 1
                        continue
                else:
                    fa = chosen
            clean.append({"en": en, "fa": fa, "target": r["target"],
                          "grade": g, "lesson": r["lesson"], "src": src})
            stats[src] += 1
        with open(f"{EXTRACT}/jame{g}-clean.json", "w", encoding="utf-8") as f:
            json.dump(clean, f, ensure_ascii=False, indent=1)
        with open(f"{EXTRACT}/jame{g}-residue.txt", "w", encoding="utf-8") as f:
            for row in residue:
                f.write(f"G{row['grade']}L{row['lesson']}T{row['target']}\t"
                        f"{row['en']}\t{row['fa']}\t<bad: {' '.join(row['bad'])}>\n")
        with open(f"{EXTRACT}/jame{g}-rewrites.txt", "w", encoding="utf-8") as f:
            for (a, b), c in tok_map.most_common(60):
                if c >= 2:
                    f.write(f"{c}\t{a} => {b}\n")
        per = Counter(row["target"] for row in clean)
        per_r = Counter(row["target"] for row in residue)
        report.append(
            f"g{g}: clean={len(clean)} residue={len(residue)} {dict(stats)} | "
            f"clean/target {dict(sorted(per.items()))} | "
            f"residue/target {dict(sorted(per_r.items()))}"
        )
    print("\n".join(report))


if __name__ == "__main__":
    main()
