#!/usr/bin/env python3
# P4 sweep (round 270): transition-all -> scoped transitions.
# The original plans/unslop.md mapping table is lost (LOST-ERA-INVENTORY.md),
# so the mapping is RECONSTRUCTED from the unslop principle:
#   each transition-all becomes the narrowest scoped transition covering
#   exactly the properties that actually CHANGE between element states:
#     - variant-prefixed utilities (hover:/active:/focus:/disabled:/dark:/md:/group-hover:/data-*/...)
#     - conditional class branches (ternary ?/:, && / ||, clsx object keys)
#     - inline style={{...}} keys on the same tag
#   Static base utilities are the default state and must NOT leak into the set.
#   Tailwind's standard `transition` set is the safe fallback for dynamic/
#   undetectable cases (never layout properties).
# Analysis is bounded to the enclosing className attribute and its tag.
# Skips src/app/error.tsx (in-flight parallel session owns it).
import re, json, pathlib, collections

ROOT = pathlib.Path("/home/z/my-project")
SKIP = {ROOT / "src/app/error.tsx"}
FILES = [p for p in (ROOT / "src").rglob("*") if p.suffix in (".tsx", ".ts") and p not in SKIP]

NONCOLOR_TEXT = re.compile(
    r"^text-(?:lg|xl|sm|base|2xl|3xl|4xl|5xl|6xl|7xl|xs|[0-9]+xl|left|center|right|justify|"
    r"start|end|nowrap|balance|pretty|ellipsis|clip|uppercase|lowercase|capitalize|"
    r"normal|italic|bold|semibold|medium|light|thin|extrabold|black)\b"
)
FILT = re.compile(r"^(?:backdrop-)?(?:blur|brightness|contrast|saturate|hue-rotate|invert|sepia|grayscale)(?:-|$)|^drop-shadow")
LAYOUT = [
    ("min-w", "min-width"), ("min-h", "min-height"), ("max-w", "max-width"), ("max-h", "max-height"),
    ("basis", "flex-basis"), ("rounded", "border-radius"), ("size", "width"),
    ("pt", "padding-top"), ("pb", "padding-bottom"), ("pl", "padding-left"), ("pr", "padding-right"),
    ("px", "padding-left"), ("py", "padding-top"), ("p", "padding"),
    ("mt", "margin-top"), ("mb", "margin-bottom"), ("ml", "margin-left"), ("mr", "margin-right"),
    ("mx", "margin-left"), ("my", "margin-top"), ("m", "margin"),
    ("top", "top"), ("bottom", "bottom"), ("left", "left"), ("right", "right"), ("inset", "top"),
    ("w", "width"), ("h", "height"), ("gap", "gap"),
]
STYLE_KEY_PROP = {
    "width": "width", "height": "height", "maxHeight": "max-height", "maxWidth": "max-width",
    "minHeight": "min-height", "top": "top", "left": "left", "right": "right", "bottom": "bottom",
    "padding": "padding", "margin": "margin", "marginTop": "margin-top", "marginBottom": "margin-bottom",
    "paddingTop": "padding-top", "paddingBottom": "padding-bottom", "fontSize": "font-size",
    "transform": "transform", "opacity": "opacity", "gap": "gap", "lineHeight": "line-height",
}
CANON = ["color", "background-color", "border-color", "text-decoration-color", "fill", "stroke",
         "opacity", "box-shadow", "transform"]
CLASSNAME_ATTR = re.compile(r"\bclassName\s*=\s*")


def classify(tok: str):
    tok = tok.strip().lstrip("!")
    if not tok:
        return None
    tok = tok.lstrip("!")
    if not tok or tok.startswith(("transition", "duration-", "ease-", "animate-", "cursor",
                                  "origin", "content-", "will-change", "overflow", "z-", "order-",
                                  "flex", "grid", "items-", "justify-", "self-", "place-", "shrink",
                                  "grow", "basis-", "whitespace", "break-", "select", "pointer-events",
                                  "sr-only", "not-sr-only", "resize", "appearance", "static", "fixed",
                                  "absolute", "relative", "sticky", "visible", "invisible", "collapse",
                                  "isolate", "object-", "list-", "align-", "block", "inline", "table",
                                  "hidden", "uppercase", "lowercase", "capitalize", "normal-case",
                                  "italic", "underline", "line-through", "no-underline", "antialiased",
                                  "truncate", "font-")):
        return None
    if FILT.match(tok):
        return "filter"
    if tok == "ring" or tok.startswith("ring-") or tok.startswith("shadow"):
        return "box-shadow"
    if re.match(r"^-?(?:scale|translate|rotate|skew|transform)", tok):
        return "transform"
    if tok.startswith("opacity-"):
        return "opacity"
    if tok.startswith(("bg-gradient", "from-", "via-", "to-")):
        return "background-image"
    if tok.startswith("bg-"):
        return "background-color"
    if tok.startswith("text-"):
        if NONCOLOR_TEXT.match(tok):
            return "font-size"
        if tok.startswith("text-["):
            return "color" if re.match(r"^text-\[(#|rgb|lab|oklch|hsl|var\()", tok) else "font-size"
        return "color"
    if tok.startswith("border"):
        rest = tok[len("border"):]
        if rest == "":
            return None
        if re.match(r"^-?(?:[xytrblse](?:-|$))", rest) or re.match(r"^-?\d", rest):
            return "border-width"
        if rest.startswith("[") and ("px" in rest or "rem" in rest):
            return "border-width"
        return "border-color"
    if tok.startswith("decoration-"):
        rest = tok[len("decoration-"):]
        if re.match(r"^\d", rest):
            return "text-decoration-thickness"
        if rest in ("solid", "double", "dotted", "dashed", "wavy", "none", "auto", "from-font", "clone", "slice"):
            return None
        if rest.startswith("offset"):
            return None
        return "text-decoration-color"
    if tok.startswith("outline"):
        rest = tok[len("outline"):]
        if rest in ("-none", "-hidden", "") or rest.startswith(("-offset", "-dashed", "-dotted", "-double", "-solid", "-wavy")):
            return None
        if re.match(r"^-\d", rest) or rest.startswith("["):
            return "outline-width"
        return "outline-color"
    if tok.startswith(("accent-", "caret-")):
        return "color"
    if tok.startswith("fill-"):
        return "fill"
    if tok.startswith("stroke-"):
        rest = tok[len("stroke-"):]
        if re.match(r"^\d", rest) or rest.startswith("["):
            return "stroke-width"
        return "stroke"
    if re.match(r"^c-[a-z0-9-]+$", tok):
        return "color"  # design-system color tokens (globals.css audit: bg/border colors)
    neg = tok.startswith("-")
    base = tok[1:] if neg else tok
    for k, prop in LAYOUT:
        if base == k or base.startswith(k + "-"):
            return prop
    return None


def find_close(text: str, start: int, ch: str, cap: int = 6000):
    j = text.find(ch, start + 1)
    return j if j != -1 else min(len(text), start + cap)


def analyze_changing(src: str):
    """Properties that CHANGE between states within a class-expression source.

    src = raw source (template content, {expr} inner text, or plain string body).
    Signals: (A) variant-prefixed tokens, (B) conditional quoted branches.
    """
    changing = set()
    # A) variant-prefixed tokens anywhere: prefix:utility (utility = last : segment)
    for m in re.finditer(r"[^\s\"'`{}()]+(?::[^\s\"'`{}()]+)+", src):
        util = m.group(0).rsplit(":", 1)[-1]
        c = classify(util)
        if c:
            changing.add(c)
    # B) conditional quoted strings: ternary branches (? / :), && / ||, clsx object keys
    i, n = 0, len(src)
    while i < n:
        ch = src[i]
        if ch in "\"`":
            j = src.find(ch, i + 1)
            j = j if j != -1 else n
            content = src[i + 1:j]
            pre = src[max(0, i - 6):i].rstrip()
            post = src[j + 1:j + 3].lstrip()
            conditional = (pre.endswith(("&&", "?", "||", ":")) or post.startswith(":"))
            if conditional:
                for tok in content.split():
                    c = classify(tok)
                    if c:
                        changing.add(c)
            i = j + 1
        else:
            i += 1
    return changing


def attr_span(text: str, p: int):
    """Locate the enclosing className attribute value around match position p.

    Returns (start, end, src) or None. src is the raw source to analyze.
    """
    head = text[:p]
    last = None
    for m in CLASSNAME_ATTR.finditer(head):
        last = m
    if last is None or p - last.end() > 4000:
        return None
    v = last.end()
    if v >= len(text):
        return None
    ch = text[v]
    if ch == '"':
        close = find_close(text, v, '"')
        return (v, close + 1, text[v + 1:close])
    if ch == "`":
        close = find_close(text, v, "`")
        return (v, close + 1, text[v + 1:close])
    if ch == "{":
        depth, i, n = 0, v, len(text)
        while i < n:
            c = text[i]
            if c in "\"`":
                j = text.find(c, i + 1)
                i = (j + 1) if j != -1 else n
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return (v, i + 1, text[v + 1:i])
            i += 1
    return None


def tag_window(text: str, a_start: int, a_end: int):
    """The enclosing JSX tag (best effort) for inline-style detection."""
    ts = text.rfind("<", max(0, a_start - 2500), a_start)
    if ts == -1:
        ts = max(0, a_start - 300)
    te = text.find(">", a_end)
    te = (te + 1) if te != -1 and te - a_end < 2500 else min(len(text), a_end + 300)
    return text[ts:te]


def choose(props: set):
    colors = props & {"color", "background-color", "border-color", "fill", "stroke",
                      "text-decoration-color"}
    shadows = props & {"box-shadow"}
    transforms = props & {"transform"}
    opacs = props & {"opacity"}
    extra = props - colors - shadows - transforms - opacs
    if not props:
        return "transition", "fallback: no changing props detected (dynamic classes)"
    if extra:
        ordered = [x for x in CANON if x in props] + sorted(extra)
        return f"transition-[{','.join(ordered)}]", f"explicit list incl. extras: {sorted(extra)}"
    s = frozenset(props)
    if s == frozenset(colors):
        return "transition-colors", "colors only"
    if s == frozenset(shadows):
        return "transition-shadow", "box-shadow only"
    if s == frozenset(transforms):
        return "transition-transform", "transform only"
    if s == frozenset(opacs):
        return "transition-opacity", "opacity only"
    if colors and shadows and transforms and opacs and s == frozenset(colors | shadows | transforms | opacs):
        return "transition", "full standard set (colors+shadow+transform+opacity)"
    # any other partial combo -> explicit arbitrary property list (narrowest scope)
    ordered = [x for x in CANON if x in props]
    return f"transition-[{','.join(ordered)}]", "partial combo: " + ",".join(sorted(props))


report, changed_files = [], set()
for path in sorted(FILES):
    text = path.read_text()
    if "transition-all" not in text:
        continue
    matches = list(re.finditer(r"(?<![\w-])transition-all(?![\w-])", text))
    if not matches:
        continue
    for m in reversed(matches):
        p = m.start()
        span = attr_span(text, p)
        if span is None:
            # not inside a className attribute (constant/variable) — analyze the
            # local string only; variants live at call sites -> safe fallback
            i = p - 1
            while i >= 0 and text[i] not in "\"`":
                i -= 1
            q = text[i] if i >= 0 else '"'
            close = find_close(text, max(i, 0), q)
            src = text[i + 1:close] if i >= 0 else ""
            scope = "const"
            window = text[max(0, p - 400):min(len(text), p + 400)]
        else:
            a_start, a_end, src = span
            scope = "attr"
            window = tag_window(text, a_start, a_end)
        props = set(analyze_changing(src))
        for sm in re.finditer(r"style=\{\{([^}]*)\}\}", window):
            for km in re.finditer(r"([A-Za-z]+)\s*:", sm.group(1)):
                prop = STYLE_KEY_PROP.get(km.group(1))
                if prop:
                    props.add(prop)
        new, why = choose(props)
        text = text[:p] + new + text[p + len("transition-all"):]
        report.append({"file": str(path.relative_to(ROOT)),
                       "line": text[:p].count("\n") + 1, "new": new, "why": why,
                       "props": sorted(props), "scope": scope})
        changed_files.add(path)
    path.write_text(text)  # persist

(ROOT / "scripts" / "p4-report-r270.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
dist = collections.Counter(r["new"] for r in report)
print(json.dumps(dict(dist.most_common()), indent=1))
print(f"occurrences swept: {sum(dist.values())} across {len(changed_files)} files")
print("fallback count:", dist.get("transition", 0))
