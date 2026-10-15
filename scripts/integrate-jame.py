#!/usr/bin/env python3
"""Integrate the repaired جامع rows into the app's lesson data — round 210.

Reads booklet-extract/jame{7,10,11,12}-clean.json (rows already repaired and
gated), appends them alphabetically to the target lesson's vocabulary array
under a provenance comment, and prints the new counts for lesson-meta and the
pinned tests. Zero fabrication: rows arrive verified; the integrator only
dedupes against the live file one last time.
"""
import json
import os
import re

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")


def norm(s):
    s = s.lower().replace(chr(8217), chr(39))
    return re.sub(r"[()\s]+", " ", s).strip()


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def integrate(target, rows):
    path = os.path.join(BASE, f"src/data/lesson{target}.ts")
    src = open(path, encoding="utf-8").read()
    m = re.search(r"const vocabulary = \[\n", src)
    assert m, path
    end = src.index("\n];", m.end())
    block = src[m.end():end]
    existing = set()
    for line in block.split("\n"):
        w = re.match(r'\s*W\("([^"]+)"', line)
        if w:
            existing.add(norm(w.group(1)))
    fresh, seen = [], set()
    for r in rows:
        k = norm(r["en"])
        if not k or k in existing or k in seen:
            continue
        seen.add(k)
        fresh.append(r)
    if not fresh:
        return 0, len(existing)
    fresh.sort(key=lambda r: norm(r["en"]))
    lines = ["  // — واژگان جامع (راند ۲۱۰، گیت‌شده)"]
    for r in fresh:
        lines.append(f'  W("{esc(r["en"])}", "{esc(r["fa"])}"),')
    out = src[:end] + "\n" + "\n".join(lines) + src[end:]
    open(path, "w", encoding="utf-8").write(out)
    return len(fresh), len(existing) + len(fresh)


def main():
    total_new = 0
    summary = {}
    for g in (7, 10, 11, 12):
        rows = json.load(open(f"{EXTRACT}/jame{g}-clean.json", encoding="utf-8"))
        by_target = {}
        for r in rows:
            by_target.setdefault(r["target"], []).append(r)
        for target, trows in sorted(by_target.items()):
            added, total = integrate(target, trows)
            summary[target] = (added, total)
            total_new += added
    print("per-lesson (added, new-total):")
    for t in sorted(summary):
        added, total = summary[t]
        print(f"  lesson{t}: +{added} → {total}")
    print("TOTAL NEW:", total_new)
    grand = sum(t for _, t in summary.values())
    print("NEW TOTAL_VOCABULARY:", grand)


if __name__ == "__main__":
    main()
