#!/usr/bin/env python3
# Task 164 — §8.3 wave 17: the grammar-metro family (.gmetro + .glesson)
# leaves globals.css for grammar/grammar-metro.css (verbatim move).
# Multi-family canonical groups with gmetro/glesson members STAY.
import re, sys

GP = "src/app/globals.css"
FP = "src/app/features.css"

lines = open(GP, encoding="utf-8").read().split("\n")

# locate band: first line starting the grammar metro header comment ...
start = next(i for i, l in enumerate(lines) if l.startswith("/* ---------------- grammar metro map (Task-39"))
# ... through the gmetro-lesson-badge rule (last line of the exclusive band)
end = next(i for i, l in enumerate(lines) if l.startswith(".dark .gmetro-lesson-badge { background-color: rgb(41 37 36 / 0.6); }"))
assert start < end, "band order broken"

band = lines[start : end + 1]
sel_lines = [l for l in band if re.match(r"^\s*\.[a-z]", l) and "→" not in l]
print(f"band lines {start+1}..{end+1} | selector lines removed = {len(sel_lines)}")
assert len(sel_lines) == 72, f"expected 72 selector lines, got {len(sel_lines)}"

# safety: every removed selector line must carry a gmetro/glesson token
stray = [l for l in sel_lines if "gmetro" not in l and "glesson" not in l]
assert not stray, f"non-family selector in band: {stray}"

tombstone = """/* ==================== Grammar metro map + 90-second lesson flow —
   moved to grammar/grammar-metro.css (§8.3 wave 17 — task 164; always
   loaded via the features.css manifest). The multi-family canonical
   groups carrying gmetro/glesson members STAY (the elevated bg-white
   group, the stone ink groups, the r115 bg-stone-100 trio at the first
   member's position). ==================== */"""

new_lines = lines[:start] + tombstone.split("\n") + lines[end + 1 :]
open(GP, "w", encoding="utf-8").write("\n".join(new_lines))

# budget verification with the guard's own regex
css = open(GP, encoding="utf-8").read()
glines = css.split("\n")
n = len([l for l in glines if re.match(r"^\s*\.[a-z]", l) and "→" not in l])
print(f"globals selector lines now = {n} (expect 169)")
assert n == 169, "budget mismatch"

# features.css: wave-17 import (idempotent guard)
feat = open(FP, encoding="utf-8").read()
imp = '@import "../components/study/grammar/grammar-metro.css";'
assert imp not in feat, "import already present"
feat = feat.rstrip("\n") + "\n" + (
    "/* wave 17 (task 164): the grammar metro family — map + 90s lesson\n"
    "   flow co-render in grammar-view; one view family, one file\n"
    "   (the wave-13 precedent); the biggest single extraction so far */\n"
    + imp + "\n"
)
open(FP, "w", encoding="utf-8").write(feat)
print("features.css: wave-17 import appended")
print("MIGRATION-OK")
