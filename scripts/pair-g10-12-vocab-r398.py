#!/usr/bin/env python3
# r398 — جفت‌سازیِ کورپوس‌محورِ جداولِ واژگانِ g10/g11/g12 — موتورِ حالت‌مند (نسخهٔ ۲)
#
# زمینه: در r397 جدول‌های دوستونیِ «لغات کلیدی» گ۷-گ۹ از کورپوس بازجفت شدند، اما
# جداولِ g10-g12 ازپیش‌ادغام‌اند (W1 M1 W2 M2 در یک خط، معنیِ شکسته/جابه‌جا) و جفت‌سازیِ
# درجایشان در r397 ریجکت شد. کورپوسِ r265 (gradeN.txt) ترتیبِ چاپیِ سطرها را سالم دارد —
# با چیدمان‌های متغیرِ خطی:
#   «about / درباره- / در حدود come / آمدن»        (چهارخطی)
#   «black سیاه excuse me ببخشید»                  (یکخطی)
#   «bear خرس - / تحمل کردن- / زاییدن / goat / بز»  (W2 در خطِ مستقل)
# پس خودِ کورپوس مرجعِ ردیف‌سازی است با ماشینِ حالتِ خط‌به‌خط؛ واژه‌های JSON برای
# (۱) لنگرِ آغاز و (۲) سنجشِ پوشش به‌کار می‌روند. دو گذر: نخست همهٔ آغازها لنگر می‌شوند
# (پایانِ هر جدول = آغازِ جدولِ بعدی)، بعد هر ناحیه پارس می‌شود.
#
#   --stats : سنجشِ خشک + نمونه‌ردیف‌ها
#   --apply : همان + اعمالِ TOKEN_FIXES + بازنویسیِ gN.json و index.json
import json
import os
import re
import sys
from collections import Counter

ROOT = "/home/z/my-project"
CORPUS = os.path.join(ROOT, "content-extracts")
OUT = os.path.join(ROOT, "public/jozve")

FA_CLASS = "\u0600-\u06FF\u200c\u064b-\u0652"
RE_FA = re.compile("[" + FA_CLASS + "]")
RE_LATIN_RUN = re.compile(r"[A-Za-z][A-Za-z'\u2019-]*(?: [A-Za-z][A-Za-z'\u2019-]*)*")
RE_SLASH_JOIN = re.compile(r"^[\s/|,]+$")
RE_JUNK_DASHES = re.compile(r"^\s*[=\-_*·.~]{2,}\s*$")
RE_PAGE_NO = re.compile(r"^\s*\d{1,3}\s*$")
JUNK_SUBSTR = (
    "Persian Meanings", "صفحه", "=====", "جزوه جام", "جزوه یازدهم", "جزوه دوازدهم",
    "آموزش زبان", "Vision 1", "Vision 2", "Vision 3", "Prospect", "prospect",
    "جام ــع", "کمک آموزش", "گردآوری", "تألیف", "Vision Two", "Vision One",
    "Vision Three", "همکاران", '"جزوه',
    # هنجارشده (پس از حذفِ کشیده): سربرگِ چندخطیِ صفحات + تبلیغ
    "لغات کلی", "انگلییس", "پایه یازد", "پایه دوازد", "پای ه", "ده م",
    "کانال تلگرایم", "در کانال", "تلگرایم",
)
RE_TATWEEL = re.compile(r"\u0640")
RE_AD_EN = re.compile(r"Telegram Channel\s*:?\s*@\s*\S*|@\s*Practical\w*")

# جداولِ هدف به ترتیبِ کتاب: (grade، نشانهٔ عنوان در JSON، لنگرهای زنجیرهٔ آغاز — از واژه‌های
# واقعیِ خودِ سکشن در JSON، نه حدس)
TABLES = [
    (10, "لغات کلیدی پایه هفتم", ["about", "come", "again", "correct", "answer", "date"]),
    (10, "لغات کلیدی پایه هشتم", ["ability", "cinema", "ache", "city", "act", "clean"]),
    (10, "لغات کلیدی پایه نهم", ["accident", "bruise", "account", "burn", "actually", "business"]),
    (10, "لغات کلیدی و تکمییل درس یکم", ["a few", "foot", "air", "fox", "alive", "forest"]),
    (10, "لغات کلیدی و تکمییل درس دوم", ["above", "carry", "abroad", "cell", "actually", "choose"]),
    (10, "لغات کلیدی و تکمییل درس سوم", ["action", "emphasis", "airplane", "emphatic", "anything", "energetic"]),
    (10, "لغات کلیدی و تکمییل درس چهارم", ["across", "cultural", "add", "culture", "adverb", "desert"]),
    (11, "لغات کلیدی و تکمییل درس اول", ["ability", "completely", "absolutely", "confident", "access", "consider"]),
    (11, "لغات کلیدی و تکمییل درس دوم", ["a bit", "cycling", "active", "dead", "activity", "death"]),
    (11, "لغات کلیدی و تکمییل درس سوم", ["accept", "choice", "according to", "clothing", "achieve", "collection"]),
    (12, "لغات کلیدی و تکمییل درس اول", ["accidental", "at all", "accidentally", "at last", "at least", "attempt"]),
    (12, "لغات کلیدی و تکمییل درس دوم", ["abbreviation", "basement", "absent", "battle", "access", "behind"]),
    (12, "لغات کلیدی و تکمییل درس سوم", ["absence", "chemical", "absorb", "chemistry", "alcoholic", "circulate"]),
]

STUCK_LIMIT = 16
MAX_REGION = 9000
PAREN_AGE_MAX = 4


def load_corpus(grade):
    with open(os.path.join(CORPUS, f"grade{grade}.txt"), encoding="utf-8") as f:
        return f.read().split("\n")


JUNK_NOSPACE = ("لغاتکلی", "انگلییس", "پایهیازد", "پایهدوازد", "پایهدهم", "پایههفت", "پایههشت", "پایهنهم")


def is_junk(text):
    t = text.strip()
    if not t:
        return True
    if RE_JUNK_DASHES.match(t) or RE_PAGE_NO.match(t):
        return True
    t = RE_TATWEEL.sub("", RE_AD_EN.sub("", t))
    t = t.replace("\u200c", "")
    for s in JUNK_SUBSTR:
        if s in t:
            return True
    t2 = re.sub(r"\s+", "", t)
    for s in JUNK_NOSPACE:
        if s in t2:
            return True
    return False


def strip_ads(text):
    return RE_AD_EN.sub(" ", text)


def segment(line):
    """خط → ران‌های متناوب [(kind, text)]؛ lat / fa / other — با چسباندنِ «have /has»."""
    segs = []
    pos = 0
    n = len(line)
    while pos < n:
        m = RE_LATIN_RUN.search(line, pos)
        gap = line[pos:m.start() if m else n]
        if gap.strip():
            segs.append(["fa" if RE_FA.search(gap) else "other", gap])
        if m:
            segs.append(["lat", m.group()])
            pos = m.end()
        else:
            break
    merged = []
    for s in segs:
        if (
            len(merged) >= 2 and merged[-1][0] == "lat" and s[0] == "lat"
            and merged[-2][0] == "other" and RE_SLASH_JOIN.match(merged[-2][1])
        ):
            merged[-1][1] = merged[-1][1] + merged[-2][1] + s[1]
            del merged[-2]
        else:
            merged.append(s)
    return merged


def word_slot(line, s, e):
    """جایگاهِ «واژهٔ جدول»: پیش از ران آغازِ خط یا حرفِ فارسی؛ پس از ران پایان/فارسی/(/ *"""
    k = s
    while k > 0 and line[k - 1] in " \t":
        k -= 1
    if k > 0 and not RE_FA.match(line[k - 1]):
        return False
    after = line[e:].lstrip()
    if after == "":
        return True
    c = after[0]
    return bool(RE_FA.match(c) or c in "(/*\u201c\u201d\"")


def match_word_any(raw, word):
    """سه چیدمانِ لنگر: خطِ مستقل، آغازِ خط با معنی، چسبیده به انتهای خطِ فارسی."""
    esc = re.escape(word)
    if re.match(r"^\s*" + esc + r"\s*(?:[(/].*)?$", raw, re.IGNORECASE):
        return True
    if re.match(r"^\s*" + esc + r"(?=\s*[" + FA_CLASS + r"(])", raw, re.IGNORECASE):
        return True
    if " " in word:
        return False
    for m in re.finditer(esc, raw, re.IGNORECASE):
        s, e = m.start(), m.end()
        before = raw[:s].rstrip()
        after = raw[e:]
        if before and RE_FA.search(before[-1]):
            a = after.lstrip()
            if a == "" or RE_FA.match(a[:1]) or a[:1] in "(/":
                return True
    return False


def find_chain(corpus, anchors, search_from, search_to):
    """آغازِ جدول: نخستین رخدادی که ۴ لنگرِ اول را در پنجره‌های ۳۵ خطی پیوسته ببندد."""
    i = search_from
    while i < search_to:
        raw = corpus[i]
        if not is_junk(raw) and match_word_any(raw, anchors[0]):
            cursor = i + 1
            good = 1
            for w in anchors[1:]:
                hit = None
                for k in range(cursor, min(cursor + 35, search_to)):
                    if not is_junk(corpus[k]) and match_word_any(corpus[k], w):
                        hit = k
                        break
                if hit is None:
                    break
                cursor = hit  # چند لنگر می‌توانند در یک خط چسبیده باشند
                good += 1
            if good >= 4:
                return i
        i += 1
    return None


FRAG_WORDS = {"cm", "mm", "km", "kg", "km/h"}


def merge_fragment_rows(rows):
    """ردیف‌های پاره‌ای: واژهٔ کوچکی که معنی‌اش با «)» یا «/» آغاز می‌شود —
    به معنیِ ردیفِ پیشین می‌چسبد (پاره‌های «(جمع آن feet :واحد طول 30/48cm»)."""
    out = []
    merged = 0
    for w, m in rows:
        if (
            out and w.lower() in FRAG_WORDS
            or (out and len(w) <= 4 and w.islower() and (m or "").startswith((")", "(", "/", ":")))
        ):
            pw, pm = out[-1]
            out[-1] = (pw, ((pm or "") + " " + w + " " + (m or "")).strip())
            merged += 1
            continue
        out.append((w, m))
    return out, merged


def is_hard_stop(line, segs):
    """نشانه‌های پایانِ جدول: جملهٔ بلندِ انگلیسی یا سربخشِ «Student Book: Pages …»."""
    lat_runs = [t for k, t in segs if k == "lat"]
    others = [t for k, t in segs if k == "other"]
    for r in lat_runs:
        if "/" not in r and len(r.split()) >= 5:
            return True
    if len(lat_runs) >= 2 and any((":" in o or any(c.isdigit() for c in o)) for o in others):
        return True
    return False


def parse_region(corpus, start, end, cap=None):
    """ماشینِ حالت روی [start, end) → rows[(word, meaning)] + شمارِ یتیم‌ها"""
    rows = []
    orphans = 0
    state = "W1"
    w1 = w2 = None
    m1_parts, m2_parts = [], []
    stuck = 0
    paren_open = 0
    paren_age = 0

    def flush():
        nonlocal w1, w2, m1_parts, m2_parts, state, paren_open, paren_age
        if w1 is not None:
            m1 = " ".join(p for p in (x.strip() for x in m1_parts) if p) or None
            m2 = " ".join(p for p in (x.strip() for x in m2_parts) if p) or None
            rows.append((w1, m1))
            if w2 is not None:
                rows.append((w2, m2))
        w1 = w2 = None
        m1_parts, m2_parts = [], []
        state = "W1"
        paren_open = 0
        paren_age = 0

    i = start
    while i < min(end, start + MAX_REGION):
        raw = corpus[i]
        i += 1
        if is_junk(raw):
            continue
        line = strip_ads(raw).rstrip()
        segs = segment(line)
        if not segs:
            continue
        if rows and is_hard_stop(line, segs):
            flush()
            break
        has_word = False
        idx = 0
        while idx < len(segs):
            kind, text = segs[idx]
            t = text.strip()
            if not t:
                idx += 1
                continue
            if kind == "lat":
                s0 = line.find(text)
                slot = word_slot(line, s0, s0 + len(text))
                if state == "W1":
                    if slot:
                        flush() if w1 is not None else None
                        w1 = t
                        state = "M1"
                        has_word = True
                    else:
                        orphans += 1
                elif state == "M1":
                    if slot and paren_open == 0:
                        w2 = t
                        state = "M2"
                        has_word = True
                    else:
                        m1_parts.append(t)
                elif state == "M2":
                    if slot:
                        flush()
                        w1 = t
                        state = "M1"
                        has_word = True
                    else:
                        m2_parts.append(t)
            else:
                if state == "M1":
                    m1_parts.append(t)
                elif state == "M2":
                    m2_parts.append(t)
                else:
                    orphans += 1
                paren_open += t.count("(") - t.count(")")
                paren_age += 1
                if paren_open < 0 or paren_age > PAREN_AGE_MAX:
                    paren_open = 0
                    paren_age = 0
            idx += 1
        if has_word:
            stuck = 0
        else:
            stuck += 1
            if stuck >= STUCK_LIMIT and rows:
                break
        if cap and len(rows) >= cap:
            break
    flush()
    return rows, orphans


def json_flat_words(sec):
    """واژه‌های تکیِ JSON از خط‌های ازپیش‌ادغام: رانِ لاتینِ چسبیده به واژهٔ بعدی دو واژه است."""
    out = []
    for l in sec.get("lines") or []:
        for m in RE_LATIN_RUN.finditer(l):
            seg = m.group()
            after = l[m.end():m.end() + 4]
            if RE_FA.match(after.lstrip()) or after.strip() == "" or after.lstrip().startswith("—"):
                # رانِ چسبیده به فارسی می‌تواند W1+W2 فشرده باشد — واژه‌هایش جدا شمرده شوند
                for w in seg.split(" "):
                    if re.match(r"^[A-Za-z][A-Za-z'\u2019-]*$", w):
                        out.append(w.lower())
    return out


def find_section(doc, title_key):
    for ch in doc["chapters"]:
        for s in ch["sections"]:
            if s.get("type") == "vocab" and title_key in (s.get("title") or ""):
                return s
    return None


def classify_old_lines(sec, corpus_words):
    """خط‌های قدیمیِ سکشن → (tableish, prose): tableish یعنی همان محتوایی که ردیف‌های
    کورپوس بازنمایی‌اش می‌کنند؛ prose یعنی محتوای غیرجدولیِ نشتی‌کرده از فصل‌های دیگر —
    به سکشنِ یادداشت منتقل می‌شود (هیچ خطی دور ریخته نمی‌شود)."""
    tableish, prose = [], []
    for l in sec.get("lines") or []:
        if not l.strip():
            continue
        runs = [m.group().strip() for m in RE_LATIN_RUN.finditer(l)]
        runs = [r for r in runs if len(r) >= 2]
        # ارزیابیِ واژه‌به‌واژه — رانِ «absence chemical» دو واژهٔ شناخته است نه یک ناشناخته
        words_in_runs = [w.lower() for r in runs for w in r.split(" ") if len(w) >= 2]
        if words_in_runs:
            all_known = all(w in corpus_words for w in words_in_runs)
            if all_known and len(l) <= 110:
                tableish.append(l)
            else:
                prose.append(l)
        else:
            # فارسیِ خالص: کوتاه = پارهٔ معنیِ جدول، بلند = نثر
            (tableish if len(l.strip()) < 28 else prose).append(l)
    return tableish, prose


def append_notes_section(doc, vocab_sec, prose_lines):
    """سکشنِ یادداشت بلافاصله پس از سکشنِ واژگان — اگر نثری مانده باشد."""
    if not prose_lines:
        return False
    note = {
        "type": "notes",
        "title": f"یادداشت‌های فصل — {(vocab_sec.get('title') or '')[:40]}",
        "lines": prose_lines,
        "source": "r398 — جداکردنِ نثرِ نشتی از سکشنِ واژگان",
    }
    for ch in doc["chapters"]:
        if vocab_sec in ch["sections"]:
            idx = ch["sections"].index(vocab_sec)
            ch["sections"].insert(idx + 1, note)
            return True
    return False


def collocation_pass(doc):
    changed = []
    for ch in doc["chapters"]:
        for s in ch["sections"]:
            if (s.get("title") or "").startswith("Collocations") and s.get("type") == "vocab":
                new_lines = []
                converted = 0
                for l in s.get("lines") or []:
                    if not l.strip():
                        continue
                    m = RE_LATIN_RUN.match(l.lstrip())
                    if m and m.start() == 0:
                        rest = l[m.end():].strip()
                        if RE_FA.search(rest):
                            # r399: ایدمپوتنسی — جداکنندهٔ «—»ی موجود و میراثِ چندتیرهٔ
                            # اجراهایِ مکرر پاک می‌شود تا هر بار یک تیره اضافه نشود
                            core = re.sub(r"^(?:[=\-–—]+\s*)+", "", rest)
                            new_lines.append(f"{m.group().strip()} — {core}")
                            converted += 1
                            continue
                    new_lines.append(l)
                s["lines"] = new_lines
                changed.append((s["title"], converted, len(new_lines)))
    return changed


PUNCT = "،؛:.!؟()«»\"'-"  # r399: خطِ تیره هم اضافه شد — «رورسی-»/«یافی-» را از کار می‌انداخت


def _core(tok):
    return tok.strip(PUNCT)


def _tail(tok):
    return tok[len(tok.rstrip(PUNCT)):]


def _head(tok):
    return tok[:len(tok) - len(tok.lstrip(PUNCT))]


def apply_fixes(meaning, fixes):
    """r399: توکنیزه با split() (فاصلهٔ دوتاییِ کورپوس توکنِ خالی می‌ساخت و بیگرام را
    از کار می‌انداخت) + تطبیقِ بی‌پایانگذاریِ نشانه‌گذاری برای بیگرام/تری‌گرام + تری‌گرام."""
    if not meaning:
        return meaning
    toks = meaning.split()
    trigrams = fixes.get("trigrams") or {}
    out = []
    i = 0
    while i < len(toks):
        matched = False
        for n in (3, 2):
            if i + n > len(toks):
                continue
            group = toks[i:i + n]
            table = trigrams if n == 3 else fixes["bigrams"]
            key = " ".join(_core(t) for t in group)
            fixed = table.get(key)
            if fixed:
                out.append(_head(group[0]) + fixed + _tail(group[-1]))
                i += n
                matched = True
                break
        if matched:
            continue
        core = _core(toks[i])
        if core in fixes["unigrams"]:
            out.append(_head(toks[i]) + fixes["unigrams"][core] + _tail(toks[i]))
        elif core in fixes["dropSingles"] and not _tail(toks[i]):
            pass
        else:
            out.append(toks[i])
        i += 1
    res = " ".join(out)
    res = re.sub(r"\s+([،؛:.!؟])", r"\1", res)
    res = re.sub(r"\s+", " ", res).strip()
    return res


def load_fixes():
    """r399: نقشهٔ r398 + نقشهٔ r399 (در صورتِ وجود) — ر398 مبناست، r399 رویش سوار می‌شود."""
    merged = {"bigrams": {}, "trigrams": {}, "unigrams": {}, "dropSingles": []}
    for name in ("r398-token-fixes.json", "r399-token-fixes.json"):
        path = os.path.join(ROOT, "scripts", name)
        if not os.path.exists(path):
            continue
        data = json.load(open(path, encoding="utf-8"))
        merged["bigrams"].update(data.get("bigrams") or {})
        merged["trigrams"].update(data.get("trigrams") or {})
        merged["unigrams"].update(data.get("unigrams") or {})
        merged["dropSingles"].extend(data.get("dropSingles") or [])
    return merged


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "--stats"
    corpora = {g: load_corpus(g) for g in (10, 11, 12)}
    docs = {g: json.load(open(os.path.join(OUT, f"g{g}.json"), encoding="utf-8")) for g in (10, 11, 12)}

    # گذرِ ۱: لنگرگذاریِ همهٔ آغازها (مونوتونیک در هر پایه)
    starts = {}
    cursor = {g: 0 for g in (10, 11, 12)}
    for grade, title_key, anchors in TABLES:
        st = find_chain(corpora[grade], anchors, cursor[grade], len(corpora[grade]))
        starts[(grade, title_key)] = st
        if st is not None:
            cursor[grade] = st + 3

    # گذرِ ۲: پارسِ هر ناحیه با پایانِ آغازِ بعدی
    keys = [(g, t) for g, t, _ in TABLES]
    results = {}
    for i, (grade, title_key) in enumerate(keys):
        st = starts[(grade, title_key)]
        if st is None:
            print(f"{grade:<3} {title_key[:40]:40} ERROR: START-NOT-FOUND")
            continue
        nxt = None
        for j in range(i + 1, len(keys)):
            if keys[j][0] == grade and starts[keys[j]] is not None:
                nxt = starts[keys[j]]
                break
        sec_pre = find_section(docs[grade], title_key)
        jw_pre = len(json_flat_words(sec_pre)) if sec_pre else 0
        cap = int(jw_pre * 1.35) + 24
        rows, orphans = parse_region(corpora[grade], st, nxt if nxt else len(corpora[grade]), cap=cap)
        rows, n_merged = merge_fragment_rows(rows)
        sec = find_section(docs[grade], title_key)
        jw = Counter(json_flat_words(sec))
        rw = Counter(w.lower() for w, _ in rows)
        matched = sum(min(c, rw.get(w, 0)) for w, c in jw.items())
        cov = round(100 * matched / max(1, sum(jw.values())), 1)
        results[(grade, title_key)] = (rows, orphans, cov, st, sec)
        flag = "" if cov >= 60 else "  <<< کم‌پوشش"
        print(f"{grade:<3} {title_key[:40]:40} L{st:<6} rows={len(rows):<5} jsonW={sum(jw.values()):<5} cov={cov}%{flag}")
        for w, m in rows[:3]:
            print(f"      | {w} — {(m or '؟')[:60]}")
        if rows:
            w, m = rows[len(rows) // 2]
            print(f"      | … {w} — {(m or '؟')[:60]}")

    if mode == "--apply":
        moved_stats = []
        for (grade, title_key), (rows, orphans, cov, st, sec) in results.items():
            if "pairedFrom" in sec:
                # ایدمپوتنسی: جفتِ پیشین — نثر پیش‌تر جابه‌جا شده؛ فقط ردیف‌ها بازسازی می‌شوند
                moved_stats.append((grade, title_key, -1, -1, False))
            else:
                corpus_words = {w.lower() for w, _ in rows}
                tableish, prose = classify_old_lines(sec, corpus_words)
                had_notes = append_notes_section(docs[grade], sec, prose)
                moved_stats.append((grade, title_key, len(tableish), len(prose), had_notes))
            FIXES = load_fixes()
            new_lines = []
            for w, m in rows:
                mm = m or "؟"
                mm = apply_fixes(mm, FIXES) if m else "؟"
                new_lines.append(f"{w} — {mm}")
            sec["lines"] = new_lines
            sec["pairedFrom"] = f"grade{grade}.txt:L{st} (r398, cov={cov}%)"
        for g, t, ti, pr, hn in moved_stats:
            print(f"[moved] g{g} {t[:36]:36} tableish={ti:<4} prose→notes={pr:<4} notes={'Y' if hn else '-'}")
        for t, c, n in collocation_pass(docs[12]):
            print(f"[g12 collocations] {t[:40]} converted={c} lines={n}")
        for g in (10, 11, 12):
            json.dump(docs[g], open(os.path.join(OUT, f"g{g}.json"), "w", encoding="utf-8"),
                      ensure_ascii=False, indent=1)
        grades = []
        for g in range(7, 13):
            doc = json.load(open(os.path.join(OUT, f"g{g}.json"), encoding="utf-8"))
            grades.append({
                "grade": g, "title": doc["title"], "pages": doc["pages"],
                "sourceSha256": doc["sourceSha256"],
                "chapters": [
                    {"id": c["id"], "title": c["title"], "kind": c["kind"],
                     "sections": [{"type": s["type"], "title": s["title"], "lines": len(s["lines"])}
                                  for s in c["sections"]]}
                    for c in doc["chapters"]
                ],
            })
        json.dump({"generatedAt": "2026-10-20T04:30:00.000Z", "grades": grades},
                  open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
        print("APPLIED: g10/g11/g12 + index.json rewritten")


if __name__ == "__main__":
    main()
