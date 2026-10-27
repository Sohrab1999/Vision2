#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Round 267 — splice 110 recovered lesson-2 tests into src/data/lesson2.ts
#   v16..v40 (25 vocab) + k11..k20 (10 konkur) + g16..g20 (5 grammar) + gs1..gs70
# Guards: no double-splice, unique IDs, every line complete, counts asserted.
import json
import re
import importlib.util

def _load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_vkg = _load("/home/z/my-project/scripts/r267-data-vkg.py", "r267_data_vkg")
_gsd = _load("/home/z/my-project/scripts/r267-data-gs.py", "r267_data_gs")
V_TR, K_TR, G_FA, GS_FA = _vkg.V_TR, _vkg.K_TR, _vkg.G_FA, _gsd.GS_FA

PARSED = "/home/z/my-project/content-extracts/l2-missing-tests-r267.json"
TARGET = "/home/z/my-project/src/data/lesson2.ts"

r = json.load(open(PARSED))
src = open(TARGET).read()

# ---------- guard: no double splice ----------
assert 'l2-gs1"' not in src, "already spliced (l2-gs1 exists)"
assert 'l2-v16"' not in src, "already spliced (l2-v16 exists)"

def qline(qid, category, question, options, answer, persian):
    q_esc = question.replace("\\", "\\\\").replace('"', '\\"')
    o_esc = ", ".join(
        ('"' + o.replace("\\", "\\\\").replace('"', '\\"') + '"') if "'" not in o
        else ("'" + o.replace("'", "\\'") + "'")
        for o in options
    )
    p_esc = persian.replace("\\", "\\\\").replace('"', '\\"')
    return f'  Q("{qid}", "{category}", "{q_esc}", [{o_esc}], {answer}, "{p_esc}"),'

def dash_norm(q):
    return re.sub(r"[-\s]+", " ", q.lower()).strip()

# app-side normalized questions (for the completeness assertion at the end)
app_norms = set()
for line in src.split("\n"):
    m = re.match(r'\s*Q\("l2-[a-z0-9]+",\s*"[^"]*",(.*),\s*\[', line)
    if m:
        s = m.group(1).strip()
        if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
            s = s[1:-1]
        app_norms.add(dash_norm(s))

missing_data = []
lines_v, lines_k, lines_g, lines_gs = [], [], [], []

# ---------- vocab v16..v40 ----------
n = 15
for q in r["newVocab"]:
    sn = q["srcNum"]
    n += 1
    tr = V_TR.get(sn, "").strip()
    if not tr:
        missing_data.append(q["id"] if "id" in q else f"v-src{sn}")
        continue
    assert dash_norm(q["question"]) not in app_norms, f"vocab src{sn} duplicate?"
    lines_v.append(qline(f"l2-v{n}", "vocab", q["question"], q["options"], q["answer"], tr))
assert len(lines_v) == 25, f"vocab lines {len(lines_v)}"

# ---------- konkur k11..k20 ----------
n = 10
for q in r["newKonkur"]:
    sn = q["srcNum"]
    n += 1
    tr = K_TR.get(sn, "").strip()
    if not tr:
        missing_data.append(f"k-src{sn}")
        continue
    assert dash_norm(q["question"]) not in app_norms, f"konkur src{sn} duplicate?"
    lines_k.append(qline(f"l2-k{n}", "vocab-konkuri", q["question"], q["options"], q["answer"], tr))
assert len(lines_k) == 10, f"konkur lines {len(lines_k)}"

# ---------- grammar g16..g20 ----------
n = 15
for q in r["newGram"]:
    sn = q["srcNum"]
    n += 1
    pair = G_FA.get(sn)
    if not pair:
        missing_data.append(f"g-src{sn}")
        continue
    tr, note = pair
    persian = f"{tr} ({note})"
    assert dash_norm(q["question"]) not in app_norms, f"gram src{sn} duplicate?"
    lines_g.append(qline(f"l2-g{n}", "grammar", q["question"], q["options"], q["answer"], persian))
assert len(lines_g) == 5, f"gram lines {len(lines_g)}"

# ---------- gs1..gs70 ----------
for q in r["newGs"]:
    sn = q["srcNum"]
    pair = GS_FA.get(sn)
    if not pair:
        missing_data.append(f"gs-src{sn}")
        continue
    tr, note = pair
    idx = q["srcNum"]
    persian = f"{tr} ({note})"
    lines_gs.append(qline(f"l2-gs{idx}", "grammar", q["question"], q["options"], q["answer"], persian))
assert len(lines_gs) == 70, f"gs lines {len(lines_gs)}"

if missing_data:
    print("MISSING POLISH DATA:", missing_data)
    sys.exit(1)

# ---------- splice anchors ----------
def insert_after(anchor_sub, new_lines, text):
    i = text.find(anchor_sub)
    assert i >= 0, f"anchor not found: {anchor_sub[:60]}"
    j = text.find("\n", i)
    return text[: j + 1] + "\n".join(new_lines) + "\n" + text[j + 1 :]

src = insert_after('Q("l2-v15"', lines_v, src)
src = insert_after('Q("l2-k10"', lines_k, src)
src = insert_after('Q("l2-g15"', lines_g, src)
src = insert_after(lines_g[-1][2:40], lines_gs, src)  # gs block right after new g20

open(TARGET, "w").write(src)

# ---------- post checks ----------
new_src = open(TARGET).read()
ids = re.findall(r'Q\("(l2-[a-z]+[0-9]+)"', new_src)
assert len(ids) == len(set(ids)), "duplicate IDs!"
assert len(ids) == 150, f"lesson2 quiz count {len(ids)} != 150"
for probe in ('l2-v40"', 'l2-k20"', 'l2-g20"', 'l2-gs70"'):
    assert probe in new_src, f"missing {probe}"
print(f"spliced OK: total l2 quizzes = {len(ids)}")
print("families:", {f: len([i for i in ids if i.startswith('l2-' + f)]) for f in ('v', 'k', 'g', 'gs')})
