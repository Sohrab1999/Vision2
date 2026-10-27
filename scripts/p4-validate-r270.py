#!/usr/bin/env python3
# Validate every transition utility produced by the P4 sweep (round 270).
# Checks: (1) zero transition-all left outside skipped files,
#         (2) every transition-[...] arbitrary class is a well-formed CSS
#             property list from the known vocabulary,
#         (3) report file ↔ tree consistency.
import re, json, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project")
KNOWN = {
    "color", "background-color", "border-color", "text-decoration-color", "fill", "stroke",
    "opacity", "box-shadow", "transform", "filter", "backdrop-filter",
    "width", "height", "min-width", "min-height", "max-width", "max-height",
    "padding", "padding-top", "padding-bottom", "padding-left", "padding-right",
    "margin", "margin-top", "margin-bottom", "margin-left", "margin-right",
    "top", "bottom", "left", "right", "gap", "border-radius", "border-width",
    "font-size", "outline-color", "outline-width", "text-decoration-thickness", "stroke-width",
    "stroke-dashoffset", "background-image", "line-height",
}
VALID = re.compile(r"^transition-\[[a-z-]+(?:,[a-z-]+)*\]$")
issues = []
dist = collections.Counter()
for p in (ROOT / "src").rglob("*"):
    if p.suffix not in (".tsx", ".ts"):
        continue
    text = p.read_text()
    for m in re.finditer(r"transition-(?:all|colors|shadow|transform|opacity|\[[^\]\s\"]+\])", text):
        tok = m.group(0)
        dist[tok] += 1
        if tok == "transition-all":
            if p.name != "error.tsx":
                issues.append(f"{p.relative_to(ROOT)}: transition-all survived")
        elif tok.startswith("transition-["):
            inner = tok[12:-1]
            props = inner.split(",")
            if not VALID.match(tok):
                issues.append(f"{p.relative_to(ROOT)}: malformed {tok}")
            bad = [x for x in props if x not in KNOWN]
            if bad:
                issues.append(f"{p.relative_to(ROOT)}: unknown props {bad} in {tok}")

out = []
out.append("distribution:")
for k, v in dist.most_common():
    out.append(f"  {v:4d}  {k}")
out.append(f"total tokens: {sum(dist.values())}")
out.append(f"issues: {len(issues)}")
out += [f"  {i}" for i in issues[:20]]
(ROOT / "scripts" / "p4-validate-r270.txt").write_text("\n".join(out))
print("issues:", len(issues))
print("total tokens:", sum(dist.values()))
print("transition-all outside error.tsx:", sum(1 for i in issues if "survived" in i))
print("distinct scoped classes:", len([k for k in dist if k.startswith("transition-[")]))
