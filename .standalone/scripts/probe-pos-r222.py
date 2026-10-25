#!/usr/bin/env python3
# r222 — parse the booklets' "Parts of Speech" (اجزای کلماتی) word-family
# tables: 10 tables across g10 (Vision One, 4 lessons) / g11 (Vision Two, 3) /
# g12 (Vision Three, 3). Each table is an RTL 5-column stream:
#   قید(adverb) | صفت(adjective) | فعل(verb) | معنی(meaning) | اسم(noun)
# The PDF text extraction flattens it into cells; a Persian meaning sometimes
# merges INLINE into the verb cell ("begin مبتدی"). We stream cells in order,
# group into rows of 5, and FLAG every anomaly for hand review instead of
# guessing. Watermark scrub follows the r214/r216 convention (tatweel-free).
# Output: booklet-extract/pos-r222-rows.json + pos-r222-review.txt
import json
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

FILES = {
    "دهم": ("g10.txt", 4),
    "یازدهم": ("g11.txt", 3),
    "دوازدهم": ("g12.txt", 3),
}

HEADER_RX = re.compile(r"Parts of Speech")
END_RX = re.compile(r"دیکشنری|دیکشی|English to English|^Irregular$")
PAGE_RX = re.compile(r"^<<<PAGE \d+>>>$")
# watermark / junk scrub (r214/r216 convention, matched tatweel-free)
WM = re.compile(
    r"جزوه|Vision|تألیف|گردآوری|احمدی|همکاران|تلگرام|Telegram|هزینه|"
    r"تعداد صفحه|دبیرستان|بوکان|آذربایجان|کمک آموزش|بان ز|انگلییس|پایه|"
    r"استاد|انتشارات|منبع|کتاب کار|والیت|آسان"
)
# quoted tail fragments of the split column headers: «د "» «ل "» «م ""
COLTAIL = re.compile(r'^[\s"\'«»]*[دلماویصفعکگهتیشق]{1,2}[\s"\'«»]*$')
# column-header pieces surviving after tatweel removal: «"قی» «"صف ت» «"م عت»
HEADER_FRAG = re.compile(
    r'^[\s"\'«»]*(?:قی\s*د?|صف\s*ت?|فع\s*ل?|م\s*عتن?|معنی|اس\s*م?)[\s"\'«»]*$'
)
QUOTES = re.compile(r'["«»]')
DASH_RX = re.compile(r"^[-—–\s]+$")
EDGE_DASH = re.compile(r"^[-—–\s]+|[-—–\s]+$")
LATIN_RX = re.compile(r"^[A-Za-z'’\-\. ]+$")
PERSIAN_RX = re.compile(r"[\u0600-\u06FF]")


def classify(line: str, wm: bool = True):
    """Return ('dash'|'latin'|'persian'|'mixed'|'junk', payload).
    wm=False skips the watermark filter (used for split parts of mixed
    lines — their persian half is a real meaning like «هزینه», not junk)."""
    t = line.strip().replace("\u0640", "")  # tatweel-free (r214 lesson)
    if not t or PAGE_RX.match(t) or t.isdigit():
        return ("junk", t)
    has_fa = bool(PERSIAN_RX.search(t))
    has_lat = bool(re.search(r"[A-Za-z]", t))
    # watermark only on single-script lines — mixed lines inside table
    # regions are verb+meaning cells (e.g. «cost هزینه») and stay intact
    if wm and not (has_fa and has_lat) and WM.search(t):
        return ("junk", t)
    if not has_lat and QUOTES.search(t) and (COLTAIL.match(t) or HEADER_FRAG.match(t)):
        return ("junk", t)  # column-header fragments & quote tails (always quoted)
    if re.fullmatch(r"[:\s]*Note[:\s]*", t, re.IGNORECASE):
        return ("junk", t)  # the booklet's own table-end marker
    stripped = EDGE_DASH.sub("", t)  # «---------- سخاوت» -> «سخاوت»
    if not stripped:
        return ("dash", "-")
    if PERSIAN_RX.search(stripped):
        t = stripped
        has_fa = True
    if has_fa and has_lat:
        return ("mixed", t)
    if has_fa:
        return ("persian", t)
    if LATIN_RX.match(t):
        return ("latin", t)
    return ("junk", t)  # punctuation soup, odd symbols


def split_mixed(t: str):
    """'access دسی یس' -> ['access', 'دسی یس']; latin first per observed stream."""
    m = re.match(r"^([A-Za-z][A-Za-z'’\-\.]*)(?:\s+(.*))?$", t.strip())
    if m and PERSIAN_RX.search(t):
        lat = m.group(1)
        rest = (m.group(2) or "").strip()
        if PERSIAN_RX.search(rest):
            return [lat, rest]
        return [lat]  # latin + latin junk like (Lesson One)
    return [t]


def parse_table(lines, start, end):
    """Column-aware state machine. Stream order per row:
    [adv(L), adj(L), verb(L), meaning(P), noun(L)] — cells may be missing
    entirely (no dash). A persian cell ALWAYS lands on the meaning slot:
    earlier unfilled slots are silent empties. Mixed lines split L then P."""
    stream = []  # (kind, value)
    for ln in lines[start + 1 : end]:
        kind, val = classify(ln)
        if kind == "junk":
            continue
        if kind == "mixed":
            for part in split_mixed(val):
                k2, v2 = classify(part, wm=False)
                if k2 != "junk":
                    stream.append((k2, v2))
        else:
            stream.append((kind, val))

    rows, anomalies = [], []
    slots, kinds = ["-"] * 5, ["dash"] * 5
    idx = 0

    def flush():
        nonlocal idx, slots, kinds
        rows.append((list(slots), list(kinds)))
        slots, kinds = ["-"] * 5, ["dash"] * 5
        idx = 0

    for kind, val in stream:
        if idx >= 5:
            flush()
        if kind == "dash":
            kinds[idx] = "dash"
            idx += 1
        elif kind == "latin":
            if idx == 3:  # meaning absent — this is the noun arriving early
                anomalies.append(("missing-meaning", val))
                slots[4], kinds[4] = val, "latin"
                kinds[3] = "missing"
                idx = 5
            else:
                slots[idx], kinds[idx] = val, "latin"
                idx += 1
        elif kind == "persian":
            if idx < 3:  # silent empties before the meaning
                for k in range(idx, 3):
                    slots[k], kinds[k] = "-", "dash"
                slots[3], kinds[3] = val, "persian"
                idx = 4
            elif idx == 3:
                slots[3], kinds[3] = val, "persian"
                idx = 4
            elif kinds[3] == "persian":  # meaning split across two lines
                anomalies.append(("persian-joined", val))
                slots[3] = slots[3] + " " + val
                kinds[3] = "joined"
            else:  # persian where the noun belongs
                anomalies.append(("persian-at-noun", val))
                slots[4], kinds[4] = val, "persian"
                idx = 5
        if idx >= 5:
            flush()
    if any(k != "dash" for k in kinds):
        anomalies.append(("tail-row", [s for s in slots]))

    clean, flagged = [], []
    for i, (vals, ks) in enumerate(rows):
        if all(v == "-" for v in vals):
            continue  # pure separator row
        ok = (
            ks[0] in ("latin", "dash")
            and ks[1] in ("latin", "dash")
            and ks[2] in ("latin", "dash")
            and ks[3] in ("persian", "dash")
            and ks[4] in ("latin", "dash")
        )
        (clean if ok else flagged).append((i, vals, ks))
    return clean, flagged, anomalies


def main():
    report, all_rows = [], {}
    for grade, (fname, _) in FILES.items():
        lines = (BASE / fname).read_text().split("\n")
        starts = [i for i, l in enumerate(lines) if HEADER_RX.search(l) and "Lesson" in l]
        starts = [s for i, s in enumerate(starts) if i == 0 or s - starts[i - 1] > 5]
        report.append(f"== {grade} ({fname}): {len(starts)} tables ==")
        for ti, s in enumerate(starts):
            end = len(lines)
            for j in range(s + 1, len(lines)):
                if (HEADER_RX.search(lines[j]) and "Lesson" in lines[j] and j - s > 5) or END_RX.search(lines[j]):
                    end = j
                    break
            clean, flagged, anomalies = parse_table(lines, s, end)
            label = lines[s].strip()
            report.append(
                f"  [{grade} T{ti+1}] lines {s}-{end} rows={len(clean)} "
                f"flagged={len(flagged)} anomalies={anomalies[:2]}"
            )
            for i, vals, kinds in flagged[:10]:
                report.append(f"      FLAG row{i} kinds={kinds} vals={vals}")
            key = f"{grade}-{ti+1}"
            all_rows[key] = {"grade": grade, "label": label, "clean": [v for _, v, _ in clean]}
        report.append("")
    out_json = BASE / "pos-r222-rows.json"
    out_json.write_text(json.dumps(all_rows, ensure_ascii=False, indent=1))
    (BASE / "pos-r222-review.txt").write_text("\n".join(report))
    print("\n".join(report))
    print(f"\nwrote {out_json}")


if __name__ == "__main__":
    main()
