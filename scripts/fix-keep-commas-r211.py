#!/usr/bin/env python3
r"""Round 211 hotfix — restore the «،» separators of keep-rows.

The first integration ran apply_token_fixes with a comma-eating tokenizer
(split on [\s،]+ → rejoin with spaces), so ~150 keep-rows lost their «،»
separators («سنگ، صخره» → «سنگ صخره»). ROW rows are intact.

This script re-derives every keep-row fa from the HEAD residue (git show),
applies the FIXED pipeline (apply_token_fixes + polish_fa) and patches the
W("en", "fa") line in the target lesson in place — only when the current fa
is exactly the comma-stripped variant (sanity gate against blind rewrite).
"""
import re
import subprocess
import sys, os

sys.path.insert(0, "/home/z/my-project/scripts")
import importlib.util


def _load_mod(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BASE = "/home/z/my-project"
resc = _load_mod("rescue_jame_residue", f"{BASE}/scripts/rescue-jame-residue.py")
a = _load_mod("rda", f"{BASE}/scripts/rescue-data-a.py")
b = _load_mod("rdb", f"{BASE}/scripts/rescue-data-b.py")
ROW_FA = {**a.ROW_FA, **b.ROW_FA}
ROW_FA[(6, "conflict")] = "کشمکش، نبرد، ناسازگاری، تضاد"


def norm(s):
    return re.sub(r"[()\s]+", " ", s.lower().replace(chr(8217), chr(39))).strip()


def head_residue(g):
    try:
        out = subprocess.run(
            ["git", "show", f"df68ea8:booklet-extract/jame{g}-residue.txt"],
            capture_output=True, text=True, cwd=BASE, check=True,
        ).stdout
    except subprocess.CalledProcessError:
        return []
    rows = []
    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        m = re.match(r"G\d+L\d+T(\d+)", parts[0])
        if m and parts[1].strip():
            rows.append((int(m.group(1)), parts[1].strip(), parts[2].strip()))
    return rows


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


patched, skipped_row, verified = 0, 0, 0
for g in (7, 8, 9, 10, 11, 12):
    for target, en, raw in head_residue(g):
        key = (target, en)
        if key in ROW_FA:
            skipped_row += 1  # ROW rows were written from ROW_FA — intact
            continue
        correct = resc.polish_fa(resc.apply_token_fixes(raw))
        path = f"{BASE}/src/data/lesson{target}.ts"
        src = open(path, encoding="utf-8").read()
        pat = re.compile(r'(W\("' + re.escape(en) + r'", ")([^"]*)("\),)')
        m = pat.search(src)
        if not m:
            print(f"!! no W line for g{g} L{target} {en!r}")
            continue
        cur = m.group(2)
        if cur == correct:
            verified += 1
            continue
        # same token sequence (separators may differ: dash→comma via polish)
        toks = lambda s: re.split(r"[\s،]+", s.strip())
        if toks(cur) != toks(correct):
            print(f"?? mismatch g{g} L{target} {en!r}: cur={cur!r} want={correct!r}")
            continue
        src = src[: m.start(2)] + esc(correct) + src[m.end(2):]
        open(path, "w", encoding="utf-8").write(src)
        patched += 1

print(f"patched: {patched}, ROW-skipped: {skipped_row}, already-ok: {verified}")
