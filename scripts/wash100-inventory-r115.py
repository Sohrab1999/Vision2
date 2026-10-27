#!/usr/bin/env python3
"""r115 tranche-3c inventory — the -100 wash layer.

Per tinted family, classify every TSX usage of a -100 shade by utility kind
(bg / border / ring / other) and list the existing .dark rules that name it.
Output drives the token-vs-converge-vs-skip decision per family.
"""
import re, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project")
FAMILIES = ["emerald", "rose", "amber", "teal", "orange", "sky", "violet", "fuchsia", "lime"]

css = (ROOT / "src/app/globals.css").read_text()

# all .dark rule lines (any indentation) naming a -100 utility
dark_rules = []
for m in re.finditer(r"(?m)^\s*\.dark[^{\n]*\{", css):
    ln = css[:m.start()].count("\n") + 1
    sel = m.group(0).strip()[:-1].strip()
    val = css[m.end():css.find("}", m.end())].strip() if m.end() < len(css) else ""
    for mm in re.finditer(r"(?:bg|border|ring|from|to|via)-(?:emerald|rose|amber|teal|orange|sky|violet|fuchsia|lime)-100(?:\\/\d+)?", sel):
        dark_rules.append((ln, sel, mm.group(0), val[:70]))

usage = collections.defaultdict(lambda: collections.Counter())
sites = collections.defaultdict(list)
util_re = re.compile(r"(?<![\w-])((?:hover:)?(?:bg|border|ring|ring-offset|from|to|via)-(emerald|rose|amber|teal|orange|sky|violet|fuchsia|lime)-100)(\\/(\d+))?(?![\w-])")
for f in list(ROOT.glob("src/**/*.tsx")) + list(ROOT.glob("src/**/*.ts")):
    txt = f.read_text()
    for i, line in enumerate(txt.splitlines(), 1):
        for m in util_re.finditer(line):
            fam = m.group(2)
            kind = m.group(1).split("-")[0].split(":")[-1]
            usage[fam][kind] += 1
            sites[fam].append((m.group(1), str(f.relative_to(ROOT)), i))

print("=" * 76)
print("A. per-family utility-kind matrix (TSX) + dark-rule coverage")
print("=" * 76)
for fam in FAMILIES:
    if not usage[fam] and not any(f == r[3].split("-")[1] if False else fam in r[2] for r in dark_rules):
        continue
    kinds = dict(usage[fam])
    rules = [r for r in dark_rules if fam + "-100" in r[2]]
    print(f"\n### {fam}-100: TSX kinds={kinds} | dark rules={len(rules)}")
    for ln, sel, util, val in rules:
        print(f"    L{ln}: {sel[:96]}")
        print(f"         → {val}")

print("\n" + "=" * 76)
print("B. uncovered TSX sites (utility has NO .dark rule naming it)")
print("=" * 76)
covered_utils = {r[2] for r in dark_rules}
covered_norm = {c.replace("\\/", "/") for c in covered_utils}
for fam in FAMILIES:
    for util, f, i in sites[fam]:
        base = re.sub(r"/\d+$", "", util)
        if util not in covered_norm and base not in covered_norm:
            print(f"    [{fam}] {util:34s} {f}:{i}")
