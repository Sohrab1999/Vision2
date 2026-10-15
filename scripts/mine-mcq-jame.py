#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
r212 — mine MCQ exam questions from the three jame booklet text dumps
(booklet-extract/g10.txt / g11.txt / g12.txt).

Owner command: "extract all booklet content precisely, feed the related
lessons" — r209 roadmap item ② (sample exam questions → quiz bank).

Design:
  * stems are Latin; Persian explanation columns are deliberately NOT
    extracted (that is where the font glyph-soup lives);
  * every question must join exactly one پاسخنامه key entry — we never
    invent answers;
  * two safe join modes:
      A) range mode — key block claims «سؤالات: صفحه X تا Y» and covers the
         question's page (keys sit on later pages, e.g. answer sections);
      B) segment mode — keys directly follow their questions in document
         order; a key region (after a پاسخنامه header) is matched against
         the question groups immediately preceding it, requiring unique
         numbers on both sides;
  * konkur-style option lines (1) ... 2) ... 3) ... 4) ...) are parsed too,
    with Persian source tags stripped from option values;
  * validation gates kill bleed artefacts (option text swallowing the next
    stem, Persian contamination of option values, overlong fragments);
  * everything that fails lands honestly in mcq-residue.txt.

Output: booklet-extract/mcq-mine.json (joined + residue + stats)
"""
import json
import os
import re
import sys
from collections import Counter, defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.join(BASE, "booklet-extract")

FILES = [("g10.txt", 10), ("g11.txt", 11), ("g12.txt", 12)]

FA_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

def to_en_digits(s):
    return s.translate(FA_DIGITS)

def norm_space(s):
    return re.sub(r"\s+", " ", s).strip()

def latin_ratio(s):
    s2 = re.sub(r"[^A-Za-z]", "", s)
    return len(s2) / max(1, len(s))

# ---------------------------------------------------------------- patterns
# stem line: "12. text" / "12- text" (ASCII or Persian digits)
STEM = re.compile(r"^\s{0,24}(\d{1,3})\s*[.\-]\s+(.+)$")
# konkur option run: line starts with "1) opt 2) opt ..."
KONKUR_OPTS = re.compile(r"^\s{0,40}1\)\s+(\S.*)$")
KONKUR_SPLIT = re.compile(r"\b([1-4])\)\s*")
# a/b/c/d option run marker
OPT_RUN = re.compile(r"\ba\s*[.)]\s+")
OPT_SPLIT = re.compile(r"\b([abcd])\s*[.)]\s*", re.IGNORECASE)
# پاسخنامه header
PASSOKH = re.compile(r"پاسخنامه|پاسخناه|پاسخ نامه")
# key entry on a joined 4-line window: "1- گزینه (b)" / "2 - گزینهd" /
# "3- گزینه (3" (digits = konkur style, 1-indexed)
KEY_WIN = re.compile(
    r"(\d{1,3})\s*[-.)]?\s*[گگ]ز[یي]ن?[هة]?\s*[(:]?\s*([abcd1-4])\b",
    re.IGNORECASE,
)
# second key style: "1- (b)" / "2 - (c" — g12's کلیدی و ترجمه sections
KEY_WIN2 = re.compile(r"(\d{1,3})\s*[-.)]\s*[(:]\s*([abcd])\s*[)\]]",
                      re.IGNORECASE)
# RTL-scrambled style: "(b) - 1" — same sections, reversed token order
KEY_WIN3 = re.compile(r"\(\s*([abcd])\s*\)\s*[-.)]?\s*(\d{1,3})\b",
                      re.IGNORECASE)
# question-page range claimed by a key block — extraction scrambles RTL
# token order («) 25 تا 21 (سؤاالت: صفحه»), so we match ANY «X تا Y» near a
# صفحه token and keep the sane ones (a<b, width<=12)
TILL_RANGE = re.compile(r"(\d{1,3})\s*(?:تا|الی|و)\s*(\d{1,3})")
SAFAR = "صفحه"

def parse_qrange(win):
    dtxt = to_en_digits(win)
    safar_at = [m.start() for m in re.finditer(SAFAR, dtxt)]
    if not safar_at:
        return None
    for m in TILL_RANGE.finditer(dtxt):
        if any(abs(m.start() - s) <= 45 for s in safar_at):
            a, b = int(m.group(1)), int(m.group(2))
            if a > b:
                a, b = b, a
            if 0 < a <= b <= a + 12:
                return (a, b)
    return None
PAGE_MARK = re.compile(r"<<<PAGE\s*(\d+)>>>")
# lesson markers
LATIN_LESSON = re.compile(r"Lesson\s*(\d)", re.IGNORECASE)
FA_LESSON = re.compile(r"درس\s*[\"«]?\s*(اول|دوم|سوم|چهارم|پنجم|ششم|هفتم|هشتم|نهم|دهم)")
FA_ORD = {"اول": 1, "دوم": 2, "سوم": 3, "چهارم": 4, "پنجم": 5,
          "ششم": 6, "هفتم": 7, "هشتم": 8, "نهم": 9, "دهم": 10}

def target_of(grade, lesson):
    """same mapping as mine-vocab-jame.py target_of()"""
    if grade == 10:
        return 6 + lesson if lesson <= 3 else 9
    if grade == 11:
        return lesson
    return 3 + lesson

# ---------------------------------------------------------------- gates
def clean_option(v):
    """strip Persian tails (source tags etc.) and bleed artefacts"""
    v = norm_space(v)
    # cut at the first Persian char (source tags/RTL annotations)
    v = re.sub(r"[\u0600-\u06FF].*$", "", v).strip(" ;:،,.")
    # bleed: an inner letter-dot restart means the split failed
    if re.search(r"\b[abcd]\s*[.)]\s*", v, re.IGNORECASE):
        return None
    # bleed: a question number restart inside the option ("43. My body…")
    if re.search(r"\b\d{1,3}\s*[.\-]\s+\S", v):
        return None
    if not v or len(v) > 64 or latin_ratio(v) < 0.7:
        return None
    return v

def blankless(s):
    """blank runs count as content for ratio purposes, not noise"""
    return re.sub(r"[-_\u2015\u2013\u2014]{4,}", " BLANK ", s)

def valid_group(g):
    stem = norm_space(g["stem"])
    if not (12 <= len(stem) <= 320):
        return False
    if latin_ratio(blankless(stem)) < 0.75:
        return False
    # must look like an exam item: blank run OR a question/dialogue
    if not (re.search(r"[-_―–—]{4,}", stem) or "?" in stem or
            re.search(r"\b(choose|complete|select)\b", stem, re.IGNORECASE)):
        return False
    opts = [clean_option(g["options"].get(c, "")) for c in "abcd"]
    if any(o is None for o in opts):
        return False
    if len({o.lower() for o in opts}) < 4:
        return False
    g["opts_clean"] = opts
    return True

# ---------------------------------------------------------------- parsing
def split_pages(text):
    out = []
    cur_page = None
    cur = []
    for line in text.splitlines():
        m = PAGE_MARK.search(to_en_digits(line))
        if m:
            out.append((cur_page, cur))
            cur_page = int(m.group(1))
            line = PAGE_MARK.sub("", line)
            cur = []
        cur.append(line)
    out.append((cur_page, cur))
    return out

def track_lesson(lines, state):
    for line in lines:
        n = norm_space(line)
        m = LATIN_LESSON.search(n)
        if m:
            state["lesson"] = int(m.group(1))
            continue
        m = FA_LESSON.search(n)
        if m:
            state["lesson"] = FA_ORD[m.group(1)]

Q_TEXT_STEM = re.compile(r"(?:(?<=\s)|^)(\d{1,3})\s*[.\-]\s+(?=[A-Z\"“])")
Q_TEXT_OPT = re.compile(r"\b([abcd])\s*[.)]\s+", re.IGNORECASE)

def split_compound(text):
    """Split 'stem a. x b. y c. z d. w  23. Next stem ...' into ordered
    marker events; multiple questions per extracted line are common."""
    events = []
    pad = " " + text
    for m in Q_TEXT_STEM.finditer(pad):
        events.append((m.start(1) - 1, "stem", int(m.group(1))))
    for m in Q_TEXT_OPT.finditer(pad):
        events.append((m.start() - 1, "opt", m.group(1).lower()))
    events.sort(key=lambda e: e[0])
    # dedupe same-position events (a stem marker right at an opt marker)
    out, last_pos = [], -1
    for e in events:
        if e[0] > last_pos or (out and out[-1][1] != e[1]):
            out.append(e)
            last_pos = e[0]
    return out, len(text)

def parse_page(page, lines, seq):
    """parse one page -> (groups, keys, headers)"""
    groups, keys, headers = [], [], []
    box = {"cur": None, "opt_buf": None}

    def flush_group():
        cur, opt_buf = box["cur"], box["opt_buf"]
        if cur is not None:
            stem = norm_space(cur["stem"])
            if len(cur["options"]) == 4 and 12 <= len(stem) <= 320:
                cur["stem"] = stem
                groups.append(cur)
        box["cur"] = None
        box["opt_buf"] = None

    def new_group(num, stem_text):
        flush_group()
        box["cur"] = {"seq": seq.next(), "num": num, "stem": stem_text,
                      "options": {}, "page": page}
        box["opt_buf"] = None

    def feed_options(seg):
        """parse an a/b/c/d option run out of seg into the current group;
        returns True if any option letter found"""
        parts = OPT_SPLIT.split(seg)
        j = 1
        found = False
        while j < len(parts):
            letter = parts[j].lower()
            val = parts[j + 1] if j + 1 < len(parts) else ""
            if letter in "abcd":
                box["cur"]["options"][letter] = val
                box["opt_buf"] = letter
                found = True
            j += 2
        return found

    def consume_stem_text(num, text):
        """handle a stem line body that may embed its own options and the
        NEXT question's stem (compound extraction lines)"""
        events, tlen = split_compound(text)
        if not events:
            new_group(num, text)
            return
        first = events[0]
        if first[1] == "stem":
            # consecutive stems without options in between (rare): keep the
            # first as an option-less group (it dies honestly), recurse
            nxt_text = text[first[0]:]
            m2 = Q_TEXT_STEM.match(" " + nxt_text)
            consumed = m2.end() - 1 if m2 else len(text)
            new_group(num, text[:first[0]])
            rest = text[consumed:].lstrip()
            m3 = re.match(r"(\d{1,3})\s*[.\-]\s+(.*)$", rest)
            if m3:
                consume_stem_text(int(m3.group(1)), m3.group(2))
            return
        # first event is an option run: stem = text before it
        new_group(num, text[:first[0]])
        pos = first[0]
        pending = None
        for e in events:
            if e[1] == "opt":
                seg = text[pos:e[0]] if pending is None else None
                if seg is not None:
                    feed_options(seg)
                pos = e[0]
                pending = e[2]
            else:  # next stem marker: cut options, recurse into the rest
                seg = text[pos:e[0]]
                # feed the tail of the last option value
                mopt = re.match(r"\s*" + pending + r"\s*[.)]\s*(.*)$", seg, re.S)
                if mopt and pending:
                    box["cur"]["options"][pending] = mopt.group(1)
                    box["opt_buf"] = None
                rest = text[e[0]:].lstrip()
                m3 = re.match(r"(\d{1,3})\s*[.\-]\s+(.*)$", rest, re.S)
                if m3:
                    consume_stem_text(int(m3.group(1)), m3.group(2))
                return
        # options ran to end of text: last option value = text[pos:] minus
        # its own letter marker
        seg = text[pos:]
        mopt = re.match(r"\s*([abcd])\s*[.)]\s*(.*)$", seg, re.S | re.I)
        if mopt and box["cur"] is not None:
            box["cur"]["options"][mopt.group(1).lower()] = mopt.group(2)
            box["opt_buf"] = mopt.group(1).lower()

    for i, raw in enumerate(lines):
        line = raw.rstrip("\n")
        n = norm_space(line)
        if not n:
            continue

        # ---- پاسخنامه header (starts a key region; may claim a page range)
        if PASSOKH.search(n):
            win = norm_space(" ".join(lines[i:i + 14]))
            rng = parse_qrange(win)
            headers.append({"seq": seq.next(), "page": page, "range": rng})
            continue

        # ---- answer keys via 4-line joined window
        win = norm_space(" ".join(lines[i:i + 4]))
        for km in KEY_WIN.finditer(to_en_digits(win)):
            num = int(km.group(1))
            tok = km.group(2).lower()
            idx = ("abcd".index(tok)) if tok in "abcd" else (int(tok) - 1)
            if 0 <= idx <= 3:
                keys.append({"seq": seq.next(), "page": page,
                             "num": num, "idx": idx})
                break  # one key per line position
        else:
            for km in KEY_WIN2.finditer(to_en_digits(win)):
                num = int(km.group(1))
                idx = "abcd".index(km.group(2).lower())
                keys.append({"seq": seq.next(), "page": page,
                             "num": num, "idx": idx})
                break

        # ---- konkur option run ("1) they 2) them 3) themselves 4) who they")
        if box["cur"] is not None and len(box["cur"]["options"]) == 0:
            kom = KONKUR_OPTS.match(line)
            if kom and KONKUR_SPLIT.search(n) and re.search(r"\b2\)\s", n):
                parts = KONKUR_SPLIT.split(n)
                j = 1
                while j < len(parts):
                    letter = "abcd"[int(parts[j]) - 1]
                    val = parts[j + 1] if j + 1 < len(parts) else ""
                    box["cur"]["options"][letter] = val
                    box["opt_buf"] = letter
                    j += 2
                continue

        # ---- stem start (with compound-line handling)
        sm = STEM.match(to_en_digits(line))
        if sm and latin_ratio(blankless(n)) > 0.55 and not OPT_RUN.search(n):
            # NOTE: key-list regions stay open across cloze answer lists
            # («1. unhealthy») — they close only at the next پاسخنامه header
            consume_stem_text(int(sm.group(1)), sm.group(2))
            continue

        # ---- option run lines (a. or a continuation b./c./d. lead)
        if box["cur"] is not None and (OPT_RUN.search(n) or
                                       re.match(r"^\s*[b-d]\s*[.)]\s+", n)):
            feed_options(n)
            continue

        # ---- continuation lines (guarded against Persian contamination)
        if box["cur"] is not None:
            if box["opt_buf"] is not None:
                if latin_ratio(n) > 0.5:
                    box["cur"]["options"][box["opt_buf"]] = \
                        box["cur"]["options"].get(box["opt_buf"], "") + " " + n
                # Persian footnote/source tag -> ignore, options stand
            else:
                if latin_ratio(n) > 0.5:
                    box["cur"]["stem"] += " " + n
                # Persian translation/source between stem and options -> ignore
    flush_group()
    return groups, keys, headers

def extract_keylists(pages_lines, file_id):
    """Region-level extraction of numbered key lists. A region starts at a
    پاسخنامه header that claims a question-page range and runs until the
    next پاسخنامه header. Key entries appear in three shapes:
      «12- گزینه (b)»  «18 - ( b )»  «(b) - 18» (RTL-scrambled)
    Entries are matched over the WHOLE region text so line splits cannot
    hide them; nums with two distinct letters are dropped as ambiguous.
    """
    regions = []
    cur = None

    def fin(cur):
        text = norm_space(" ".join(cur["buf"]))
        dtxt = to_en_digits(text)
        keys = {}
        for km in KEY_WIN2.finditer(dtxt):
            keys.setdefault(int(km.group(1)), set()).add(
                "abcd".index(km.group(2).lower()))
        for km in KEY_WIN3.finditer(dtxt):
            keys.setdefault(int(km.group(2)), set()).add(
                "abcd".index(km.group(1).lower()))
        for km in KEY_WIN.finditer(dtxt):
            tok = km.group(2).lower()
            if tok in "abcd":
                keys.setdefault(int(km.group(1)), set()).add(
                    "abcd".index(tok))
        keys = {n: next(iter(s)) for n, s in keys.items() if len(s) == 1}
        return {"page": cur["page"], "range": cur["range"],
                "keys": keys, "file": file_id}

    for page, lines in pages_lines:
        for i, raw in enumerate(lines):
            n = norm_space(raw)
            if not PASSOKH.search(n):
                if cur is not None:
                    cur["buf"].append(raw)
                continue
            if cur is not None:
                regions.append(fin(cur))
                cur = None
            win = norm_space(" ".join(lines[i:i + 14]))
            rng = parse_qrange(win)
            if rng is not None:
                cur = {"page": page, "range": rng, "buf": []}
    if cur is not None:
        regions.append(fin(cur))
    return regions

class Seq:
    def __init__(self):
        self.v = 0
    def next(self):
        self.v += 1
        return self.v

def join_keys(groups, keys, headers, keylists):
    """
    Mode K (keylist — primary): numbered key-list regions extracted from
    «کلیدی و ترجمه» / «پاسخنامه» blocks; a question joins when its (file,
    page-in-range, num) hits exactly one distinct letter in a region.
    Mode B (segment — fallback): range-less inline keys (konkur style)
    matched against the immediately preceding question segment.
    Everything is scoped per source file — page numbers collide across
    booklets and must never cross-match.
    """
    joined = []

    # ---- Mode K
    for g in groups:
        if g["lesson"] == 0:
            continue
        cands = set()
        for kl in keylists:
            if kl["file"] != g["file"]:
                continue
            a, b = kl["range"]
            if a <= g["page"] <= b and g["num"] in kl["keys"]:
                cands.add(kl["keys"][g["num"]])
        if len(cands) == 1:
            idx = next(iter(cands))
            g["answer_idx"] = idx
            g["answer_letter"] = "abcd"[idx]
            g["mode"] = "keylist"
            joined.append(g)
        else:
            g["mode"] = None

    # ---- Mode B: segments over inline keys only
    events = ([(g["seq"], "g", g) for g in groups] +
              [(k["seq"], "k", k) for k in keys] +
              [(h["seq"], "h", h) for h in headers])
    events.sort(key=lambda e: e[0])
    segments = []
    cur_groups, cur_keys, mode = [], [], "q"
    for _, kind, ev in events:
        if kind == "h":
            if cur_keys:
                segments.append((cur_groups, cur_keys))
                cur_groups, cur_keys = [], []
            mode = "k"
        elif kind == "g":
            if mode == "k" and cur_keys:
                segments.append((cur_groups, cur_keys))
                cur_groups, cur_keys = [], []
            mode = "q"
            cur_groups.append(ev)
        else:
            cur_keys.append(ev)
    if cur_keys:
        segments.append((cur_groups, cur_keys))

    for seg_groups, seg_keys in segments:
        kmap = {}
        for k in seg_keys:
            kmap.setdefault(k["num"], set()).add(k["idx"])
        kmap = {n: next(iter(s)) for n, s in kmap.items() if len(s) == 1}
        gnum = Counter(g["num"] for g in seg_groups)
        for g in seg_groups:
            if g["mode"] is not None or g["lesson"] == 0:
                continue
            if g["num"] in kmap and gnum[g["num"]] == 1:
                g["answer_idx"] = kmap[g["num"]]
                g["answer_letter"] = "abcd"[g["answer_idx"]]
                g["mode"] = "segment"
                joined.append(g)

    # ---- Mode C (range fallback): keys inherit the nearest preceding
    # ranged header (same file); a question joins when the range covers its
    # page and the key page is at/after the question's. This recovers the
    # r212 first-pass joins for questions the numbered key lists miss.
    headers_sorted = sorted(headers, key=lambda h: h["seq"])
    keyed = []
    for k in keys:
        rng = None
        for h in headers_sorted:
            if h["seq"] > k["seq"]:
                break
            if h["file"] != k["file"]:
                continue
            if h["range"] is not None:
                rng = h["range"]
        if rng is not None:
            keyed.append((k, rng))
    used = set()
    for g in groups:
        if g["mode"] is not None or g["lesson"] == 0:
            continue
        cands = set()
        win = []
        for k, rng in keyed:
            if k["seq"] in used or k["num"] != g["num"]:
                continue
            if k.get("lesson", 0) not in (0, g["lesson"]):
                continue
            a, b = rng
            if a <= g["page"] <= b and k["page"] >= g["page"]:
                cands.add(k["idx"])
                win.append(k)
        if len(cands) == 1:
            g["answer_idx"] = next(iter(cands))
            g["answer_letter"] = "abcd"[g["answer_idx"]]
            g["mode"] = "range"
            for k in win:
                used.add(k["seq"])
            joined.append(g)

    residue = [g for g in groups if g["mode"] is None]
    return joined, residue

def main():
    all_groups, all_keys, all_headers, all_kls = [], [], [], []
    for fid, (fname, grade) in enumerate(FILES):
        path = os.path.join(EX, fname)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        pages = split_pages(text)
        state = {"lesson": 0}
        seq = Seq()
        groups, keys, headers = [], [], []
        for page, lines in pages:
            track_lesson(lines, state)
            lesson_snapshot = state["lesson"]
            gs, ks, hs = parse_page(page, lines, seq)
            for g in gs:
                g["grade"] = grade
                g["file"] = fid
                g["lesson"] = lesson_snapshot
                g["target"] = target_of(grade, lesson_snapshot)
            for k in ks:
                k["lesson"] = lesson_snapshot
                k["file"] = fid
            for h in hs:
                h["file"] = fid
            groups.extend(gs)
            keys.extend(ks)
            headers.extend(hs)
        kls = extract_keylists(pages, fid)
        n_valid = sum(1 for g in groups if valid_group(g))
        n_klkeys = sum(len(kl["keys"]) for kl in kls)
        print(f"{fname}: pages={len(pages)} groups={len(groups)} "
              f"valid={n_valid} keys={len(keys)} headers={len(headers)} "
              f"keylists={len(kls)}/{n_klkeys}keys")
        all_groups.extend(groups)
        all_keys.extend(keys)
        all_headers.extend(headers)
        all_kls.extend(kls)

    # keep only gate-passing groups
    all_groups = [g for g in all_groups if valid_group(g)]

    joined, residue = join_keys(all_groups, all_keys, all_headers, all_kls)
    print(f"joined={len(joined)} residue={len(residue)} "
          f"modes={Counter(g['mode'] for g in joined)}")

    out = {"joined": joined, "residue": residue,
           "stats": {"groups": len(all_groups), "keys": len(all_keys),
                     "joined": len(joined)}}
    with open(os.path.join(EX, "mcq-mine.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    # residue dump (honest parking lot)
    with open(os.path.join(EX, "mcq-residue.txt"), "w", encoding="utf-8") as f:
        for g in residue:
            opts = " | ".join(g["options"].get(c, "")[:40] for c in "abcd")
            f.write(f"g{g['grade']} L{g['target']} p{g['page']} #{g['num']} "
                    f":: {g['stem'][:140]} :: {opts[:140]}\n")

if __name__ == "__main__":
    main()
