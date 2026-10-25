#!/usr/bin/env python3
"""r114 tranche-3b inventory — tinted -50 wash layer.

For every tinted family F in FAMILIES, classify every TSX usage site of
`{bg|border|from|to|via|hover:bg|...}-{F}-50(/NN)?` against the .dark rules in
globals.css:
  - covered   : a .dark rule (global or scoped) names this exact utility
  - uncovered : NO .dark rule names it → renders LIGHT in dark mode (leak!)
Also lists the .dark rules touching each family so deletions can be planned,
and checks the always-light scopes (official-report / official-chrome) for
tokenized utilities that would need re-lighting.
"""
import re, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project")
FAMILIES = ["emerald", "rose", "amber", "teal", "orange", "sky", "violet",
            "fuchsia", "lime", "cyan", "indigo"]

css = (ROOT / "src/app/globals.css").read_text()

# ---- parse .dark rules (top-level + nested contexts) -------------------------
# a rule line looks like:  .dark .bg-rose-50\/60 { ... }  or
#                          .dark .srs-panel .bg-amber-50 { ... }
dark_rules = []  # (lineno, selector, utilities[])
for m in re.finditer(r"(?m)^\.dark[^{]*\{", css):
    line_no = css[:m.start()].count("\n") + 1
    sel = m.group(0)[:-1].strip()
    utils = set(re.findall(
        r"(?:bg|border|from|to|via)-(?:emerald|rose|amber|teal|orange|sky|violet|fuchsia|lime|cyan|indigo)-50(?:\\/\d+)?",
        sel))
    dark_rules.append((line_no, sel, utils))

# ---- scan TSX usage ----------------------------------------------------------
util_re = re.compile(
    r"(?<![\w-])((?:hover:)?(?:bg|border|from|to|via)-(emerald|rose|amber|teal|orange|sky|violet|fuchsia|lime|cyan|indigo)-50)(\\/(\d+))?(?![\w-])")

usage = collections.defaultdict(list)  # utility -> [(file, line, text)]
for f in list(ROOT.glob("src/**/*.tsx")) + list(ROOT.glob("src/**/*.ts")):
    for i, line in enumerate(f.read_text().splitlines(), 1):
        for m in util_re.finditer(line):
            usage[m.group(1)].append((str(f.relative_to(ROOT)), i, line.strip()[:110]))

covered = set()
for _, sel, utils in dark_rules:
    covered |= utils

norm = lambda u: u  # keys in usage keep backslash form? no — TSX uses plain /NN
cov_norm = {c.replace("\\/", "/") for c in covered}

print("=" * 72)
print("A. TSX usage sites classified (dark-mode coverage)")
print("=" * 72)
tot_cov = tot_unc = 0
for util in sorted(usage):
    fam = re.search(r"-(emerald|rose|amber|teal|orange|sky|violet|fuchsia|lime|cyan|indigo)-50", util).group(1)
    is_cov = util in cov_norm or re.sub(r"/\d+$", "", util) in cov_norm
    mark = "covered " if is_cov else "UNCOVERED"
    if is_cov: tot_cov += len(usage[util])
    else: tot_unc += len(usage[util])
    print(f"\n[{mark}] {util}  ({len(usage[util])} sites)")
    for f, i, t in usage[util][:4]:
        print(f"    {f}:{i}  {t}")
    if len(usage[util]) > 4:
        print(f"    … +{len(usage[util]) - 4} more")

print("\n" + "=" * 72)
print(f"B. totals: covered sites = {tot_cov}, UNCOVERED (light-leak) sites = {tot_unc}")
print("=" * 72)

print("\n" + "=" * 72)
print("C. .dark rules touching tinted-50 (deletion candidates / keeps)")
print("=" * 72)
for ln, sel, utils in dark_rules:
    print(f"  L{ln:<5} {sel[:120]}")

print("\n" + "=" * 72)
print("D. always-light scopes: tokenized utilities used inside official-report / official-chrome / print")
print("=" * 72)
light_files = [p for p in ROOT.glob("src/**/*.tsx")
               if p.name in ("official-report.tsx",)]
for f in light_files:
    hits = sorted({m.group(1) for m in util_re.finditer(f.read_text())})
    print(f"  {f.name}: {hits if hits else 'none'}")
# also any CSS-scoped re-light blocks already present
print("\n  existing official-report re-light blocks in css:")
for m in re.finditer(r"(?m)^[^{]*official-(report|chrome)[^{]*\{", css):
    ln = css[:m.start()].count("\n") + 1
    print(f"    L{ln}: {m.group(0).strip()[:110]}")
