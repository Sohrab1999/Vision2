#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Round 268 — splice 121 recovered lesson-3 tests into src/data/lesson3.ts
#   v16..v41 (26 vocab) + k11..k20 (10 konkur) + g16..g30 (15 grammar) + gs1..gs70
# Guards: no double-splice, unique IDs, counts asserted, completeness check.
import importlib.util
import json
import re

def _load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_vkg = _load("/home/z/my-project/scripts/r268-data-vkg.py", "r268_data_vkg")
_gsd = _load("/home/z/my-project/scripts/r268-data-gs.py", "r268_data_gs")
V_TR, K_TR, G_FA, GS_FA = _vkg.V_TR, _vkg.K_TR, _vkg.G_FA, _gsd.GS_FA

PARSED = "/home/z/my-project/content-extracts/l3-missing-tests-r268.json"
TARGET = "/home/z/my-project/src/data/lesson3.ts"

r = json.load(open(PARSED))
src = open(TARGET).read()

assert 'l3-gs1"' not in src, "already spliced (l3-gs1 exists)"
assert 'l3-v16"' not in src, "already spliced (l3-v16 exists)"

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

app_norms = set()
for line in src.split("\n"):
    m = re.match(r'\s*Q\("l3-[a-z0-9]+",\s*"[^"]*",(.*),\s*\[', line)
    if m:
        s = m.group(1).strip()
        if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
            s = s[1:-1]
        app_norms.add(dash_norm(s))

missing_data = []
lines_v, lines_k, lines_g, lines_gs = [], [], [], []

n = 15
for q in r["newVocab"]:
    sn = q["srcNum"]
    n += 1
    tr = V_TR.get(sn, "").strip()
    if not tr:
        missing_data.append(f"v-src{sn}")
        continue
    assert dash_norm(q["question"]) not in app_norms, f"vocab src{sn} duplicate?"
    lines_v.append(qline(f"l3-v{n}", "vocab", q["question"], q["options"], q["answer"], tr))
assert len(lines_v) == 26, f"vocab lines {len(lines_v)}"

n = 10
for q in r["newKonkur"]:
    sn = q["srcNum"]
    n += 1
    tr = K_TR.get(sn, "").strip()
    if not tr:
        missing_data.append(f"k-src{sn}")
        continue
    assert dash_norm(q["question"]) not in app_norms, f"konkur src{sn} duplicate?"
    lines_k.append(qline(f"l3-k{n}", "vocab-konkuri", q["question"], q["options"], q["answer"], tr))
assert len(lines_k) == 10, f"konkur lines {len(lines_k)}"

n = 15
for q in r["newGram"]:
    sn = q["srcNum"]
    n += 1
    pair = G_FA.get(sn)
    if not pair:
        missing_data.append(f"g-src{sn}")
        continue
    tr, note = pair
    assert dash_norm(q["question"]) not in app_norms, f"gram src{sn} duplicate?"
    lines_g.append(qline(f"l3-g{n}", "grammar", q["question"], q["options"], q["answer"], f"{tr} ({note})"))
assert len(lines_g) == 15, f"gram lines {len(lines_g)}"

for q in r["newGs"]:
    sn = q["srcNum"]
    pair = GS_FA.get(sn)
    if not pair:
        missing_data.append(f"gs-src{sn}")
        continue
    tr, note = pair
    lines_gs.append(qline(f"l3-gs{sn}", "grammar", q["question"], q["options"], q["answer"], f"{tr} ({note})"))
assert len(lines_gs) == 70, f"gs lines {len(lines_gs)}"

if missing_data:
    print("MISSING POLISH DATA:", missing_data)
    raise SystemExit(1)

def insert_after(anchor_sub, new_lines, text):
    i = text.find(anchor_sub)
    assert i >= 0, f"anchor not found: {anchor_sub[:60]}"
    j = text.find("\n", i)
    return text[: j + 1] + "\n".join(new_lines) + "\n" + text[j + 1 :]

src = insert_after('Q("l3-v15"', lines_v, src)
src = insert_after('Q("l3-k10"', lines_k, src)
src = insert_after('Q("l3-g15"', lines_g, src)
src = insert_after(lines_g[-1][2:40], lines_gs, src)

open(TARGET, "w").write(src)

new_src = open(TARGET).read()
ids = re.findall(r'Q\("(l3-[a-z]+[0-9]+)"', new_src)
assert len(ids) == len(set(ids)), "duplicate IDs!"
assert len(ids) == 161, f"lesson3 quiz count {len(ids)} != 161"
for probe in ('l3-v41"', 'l3-k20"', 'l3-g30"', 'l3-gs70"'):
    assert probe in new_src, f"missing {probe}"
print(f"spliced OK: total l3 quizzes = {len(ids)}")
print("families:", {f: len([i for i in ids if i.startswith('l3-' + f)]) for f in ('v', 'k', 'g', 'gs')})
