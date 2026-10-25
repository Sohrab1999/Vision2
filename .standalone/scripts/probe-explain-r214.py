#!/usr/bin/env python3
# r214 probe v2 — measure the yield of aligning the booklets' explanation
# blocks («N. گزینه(x)» + «ترجمه» + Persian option glosses + reasoning)
# to the landed bk rows via (grade, page-range, num).
#
# The raw text scatters pieces across lines: the header may be
# «سؤاالت :صفحه37 \n تا \n39» and the block «1- \n گزینه (\nb\n)».
import json
import re
from pathlib import Path

BASE = Path("/home/z/my-project/booklet-extract")

HDR = re.compile(r"[سؤاالت]{4,}\s*[:：]?\s*صفحه?\s*(\d{1,3})")
GOZINE = re.compile(r"گزینه\s*[\(\[]\s*([abcd])\b")


def file_of(grade: int) -> str:
    return {10: "g10", 11: "g11", 12: "g12"}[grade]


def mine_blocks(grade: int):
    src = (BASE / f"{file_of(grade)}.txt").read_text()
    lines = src.split("\n")
    lo = hi = None
    blocks = []
    for i, ln in enumerate(lines):
        m = HDR.search(ln)
        if m:
            lo = int(m.group(1))
            hi = None
            # «تا Y» may sit on one of the next 3 lines
            for j in range(i + 1, min(i + 4, len(lines))):
                tm = re.search(r"تا\s*(\d{1,3})", lines[j])
                if tm:
                    hi = int(tm.group(1))
                    break
                t = lines[j].strip()
                if t and not re.fullmatch(r"[\)\]»\-\s]*", t):
                    break
            hi = hi if hi is not None else lo
            continue
        gm = GOZINE.search(ln)
        if gm:
            num = None
            # same-line prefix first: «1- گزینه (b»
            t0 = ln.strip()
            nm = re.match(r"^(\d{1,3})\s*[\.\-–]?\s*گزینه", t0)
            if nm:
                num = int(nm.group(1))
            else:
                for back in range(1, 7):
                    if i - back < 0:
                        break
                    t = lines[i - back].strip()
                    if not t or re.fullmatch(r"[\(\[\{«\]\)\s]+", t):
                        continue
                    bm = re.match(r"^[\(\[\{«]*\s*(\d{1,3})\s*[\.\-–\)]?\s*$", t)
                    if bm:
                        num = int(bm.group(1))
                        break
            if num is None:
                continue
            blocks.append(
                {"num": num, "letter": gm.group(1), "li": i,
                 "page_lo": lo, "page_hi": hi}
            )
    return blocks


def main():
    rows = []
    for fn in ["mcq-curated.json", "mcq-r213-curated.json"]:
        rows += json.load(open(BASE / fn))
    print("curated rows:", len(rows))

    all_blocks = {}
    for g in (10, 11, 12):
        bs = mine_blocks(g)
        all_blocks[g] = bs
        print(f"g{g}: blocks={len(bs)}")

    hit = miss = multi = no_range = 0
    for r in rows:
        g, page, num = r["grade"], r["page"], r["num"]
        cands = [
            b for b in all_blocks[g]
            if b["num"] == num and b["page_lo"] is not None
            and b["page_lo"] <= page <= b["page_hi"]
        ]
        if len(cands) == 1:
            hit += 1
        elif len(cands) > 1:
            multi += 1
        elif any(b["num"] == num for b in all_blocks[g]):
            no_range += 1
        else:
            miss += 1
    print(f"aligned-unique={hit}  multi={multi}  num-but-out-of-range={no_range}  no-num={miss}")

    # letter agreement on hits — free quality signal
    agree = disagree = 0
    ex = []
    for r in rows:
        g, page, num = r["grade"], r["page"], r["num"]
        cands = [
            b for b in all_blocks[g]
            if b["num"] == num and b["page_lo"] is not None
            and b["page_lo"] <= page <= b["page_hi"]
        ]
        if len(cands) == 1:
            bl = "abcd".index(cands[0]["letter"])
            if bl == r["answer"]:
                agree += 1
            else:
                disagree += 1
                if len(ex) < 8:
                    ex.append((g, page, num, r["question"][:60],
                               r["options"][r["answer"]][:20],
                               cands[0]["letter"]))
    print(f"letter agreement: {agree} agree / {disagree} disagree")
    for e in ex:
        print("  disagree:", e)


if __name__ == "__main__":
    main()
