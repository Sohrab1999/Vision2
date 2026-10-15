#!/usr/bin/env python3
"""Round 211 — rescue the parked جامع residue rows (the cron-polish item).

The r210 strict gate parked 466 rows. Manual review shows three classes:
  1. false positives — real Persian words the small verified corpus lacked
     (امشب، هزار، کوه، دیوار، …) → APPROVE_WL (each reviewed in context).
  2. lam-alef / glyph-soup tokens → ROW_FA hand-verified clean rewrites.
  3. rows the app already covers via another en spelling → skipped (dedupe).

Nothing enters the lessons ungated: every rescued row must pass the same
token gate (whitelist ∪ APPROVE_WL ∪ STOP ∪ suffix rules), and anything
still failing stays honestly in the residue file.

Also fixes the committed scripts/integrate-jame.py syntax error (line 33).
"""
import json
import os
import re
import sys

BASE = "/home/z/my-project"
EXTRACT = os.path.join(BASE, "booklet-extract")
def _load_mod(name, path):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

_a = _load_mod("rescue_data_a", os.path.join(os.path.dirname(os.path.abspath(__file__)), "rescue-data-a.py"))
_b = _load_mod("rescue_data_b", os.path.join(os.path.dirname(os.path.abspath(__file__)), "rescue-data-b.py"))
ROW_FA_A, APPROVE_WL_A = _a.ROW_FA, _a.APPROVE_WL_A
ROW_FA_B, APPROVE_WL_B = _b.ROW_FA, _b.APPROVE_WL_B

ROW_FA = {**ROW_FA_A, **ROW_FA_B}
ROW_FA[(6, "conflict")] = "کشمکش، نبرد، ناسازگاری، تضاد"
APPROVE_WL = APPROVE_WL_A | APPROVE_WL_B


def _extract_extra_wl():
    """Pull EXTRA_WL out of scripts/repair-jame.py (single source of truth)."""
    src = open(os.path.join(BASE, "scripts", "repair-jame.py"), encoding="utf-8").read()
    m = re.search(r'EXTRA_WL = set\("""(.*?)"""\.split\(\)\)', src, re.S)
    return set(m.group(1).split()) if m else set()

# function words / conjunctions the corpus gate lacked («دوباره و دوباره»)
FUNCTION_OK = {"و", "دو", "سه", "یا"}

POS_TAG = re.compile(r"\s*\((?:n|v|adj|adv|prep|conj|pron|interj|phr|id|pl|s)\)\s*")
STOP = set("""به از در برای با تا هر که این آن یک های ها یا ولی اما بسیار خیلی
بیشتر همچنین مورد طور حالت نوع شخص نفر کس چیزی هیچ همه بعضی چند داخل خارج
شده شدن کردن دادن گرفتن بودن داشتن رفتن آمدن گفتن خود هم حتی فقط اگر
بر روی زیر بین نزد مثل غیر جز سایر دیگر دیگری آنان آنها اش ام ای بله
""".split())

TOKEN_FIXES = {
    "اخالق": "اخلاق", "اخالقیات": "اخلاقیات", "تالش": "تلاش", "عالقه": "علاقه",
    "داشتر": "داشتن", "داشتر ز": "داشتن", "داشی": "داشتن", "داشن": "داشتن",
    "برریس": "بررسی", "خییل": "خیلی", "زمات": "زمان", "زماتز": "زمان",
    "الزم": "لازم", "المپ": "لامپ", "الم پ": "لامپ", "عایل": "عالی",
    "محشی": "محشر", "اصأل": "اصلاً", "ابدأ": "ابداً", "رسعت": "سرعت",
    "جمالت": "جملات", "چیر": "چیز", "رص": "ضرر", "عالوه": "علاوه",
}

GRADES = (7, 8, 9, 10, 11, 12)


def norm(s):
    s = s.lower().replace(chr(8217), chr(39))
    return re.sub(r"[()\s]+", " ", s).strip()


def load_lesson_ens():
    """en sets per lesson, keyed by normalized + base (paren-stripped)."""
    out = {}
    for lid in range(1, 13):
        ens = set()
        for line in open(f"{BASE}/src/data/lesson{lid}.ts", encoding="utf-8"):
            m = re.match(r'\s*W\("([^"]+)"', line)
            if m:
                ens.add(norm(m.group(1)))
                base = norm(POS_TAG.sub("", m.group(1)))
                if base:
                    ens.add(base)
        out[lid] = ens
    return out


EXTRA_WL = _extract_extra_wl()


def apply_token_fixes(fa):
    """Single-token learned fixes (keep-rows need them too: اصأل→اصلاً).
    Whitespace-split only — «،» separators ride on tokens and survive."""
    out = []
    for tok in fa.split(" "):
        if not tok:
            continue
        core = tok.strip("،().-«»…")
        if not core:
            out.append(tok)
            continue
        i = tok.index(core)
        lead, trail = tok[:i], tok[i + len(core):]
        fixed = TOKEN_FIXES.get(core, TOKEN_FIXES.get(core.strip("().-"), core))
        out.append(lead + fixed + trail)
    return " ".join(out)


def load_whitelist():
    wl = set(STOP) | set(APPROVE_WL) | set(FUNCTION_OK) | set(TOKEN_FIXES.values()) | set(EXTRA_WL)
    for lid in range(1, 13):
        for line in open(f"{BASE}/src/data/lesson{lid}.ts", encoding="utf-8"):
            m = re.match(r'\s*W\("([^"]+)",\s*"([^"]+)"', line)
            if m:
                for t in re.split(r"[\s،\-]+", m.group(2)):
                    t = t.strip("().«»")
                    if t:
                        wl.add(t)
    for fa_path in (f"{BASE}/src/data/syn-ant-pairs.ts",):
        if os.path.exists(fa_path):
            src = open(fa_path, encoding="utf-8").read()
            for fa in re.findall(r'fa:\s*"([^"]+)"', src):
                for t in re.split(r"[\s،\-]+", fa):
                    t = t.strip("().«»")
                    if t:
                        wl.add(t)
    for g in (7, 8, 9):
        src = open(f"{BASE}/src/data/booklet/grade{g}.ts", encoding="utf-8").read()
        for fa in re.findall(r'fa:\s*"([^"]+)"', src):
            for t in re.split(r"[\s،\-]+", fa):
                t = t.strip("().«»")
                if t:
                    wl.add(t)
    return wl


SINGLE_SUSPECT = set("ابپتثجسشصرزینموکیه")


def tokens(s):
    return [t for t in re.split(r"[\s،]+", s) if t]


def gate(fa, wl):
    bad = []
    for tok in tokens(fa):
        if re.fullmatch(r"[A-Za-z0-9./]+", tok):
            continue
        t = tok.strip("().-«»…")
        if not t:
            continue
        if len(t) == 1 and t not in FUNCTION_OK and t in SINGLE_SUSPECT:
            bad.append(tok)
            continue
        if t in wl or tok in wl:
            continue
        hit = False
        for suf in ("ی", "های", "ها", "تر", "ترین", "گر", "نده", "مند", "کار"):
            if t.endswith(suf) and len(t) > len(suf) + 1 and t[: -len(suf)] in wl:
                hit = True
                break
        if hit:
            continue
        bad.append(tok)
    return (not bad), bad


def polish_fa(fa):
    fa = re.sub(r"\s+", " ", fa).strip()
    fa = re.sub(r"^[،،\s]+", "", fa)
    fa = re.sub(r"\s*،\s*", "، ", fa)
    fa = re.sub(r"\(\s*", "(", fa)
    fa = re.sub(r"\s*\)", ")", fa)
    if fa.count("(") != fa.count(")"):
        fa = fa.replace("(", "").replace(")", "")
    fa = re.sub(r"\s+([،)])", r"\1", fa)
    fa = re.sub(r"\s*-\s*", "، ", fa)
    return fa.strip("، ").strip()


def parse_residue(g):
    rows = []
    path = f"{EXTRACT}/jame{g}-residue.txt"
    if not os.path.exists(path):
        return rows
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if "\t" not in line:
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        tag = parts[0]                      # G10L1T7
        m = re.match(r"G\d+L\d+T(\d+)", tag)
        target = int(m.group(1)) if m else None
        en, raw = parts[1].strip(), parts[2].strip()
        if target and en:
            rows.append({"grade": g, "tag": tag, "target": target,
                         "en": en, "raw": raw})
    return rows


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def integrate(target, rows):
    """Append rows alphabetically to lesson{target} vocabulary (deduped)."""
    path = f"{BASE}/src/data/lesson{target}.ts"
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
            base = norm(POS_TAG.sub("", w.group(1)))
            if base:
                existing.add(base)
    fresh, seen = [], set()
    for r in rows:
        k = norm(r["en"])
        base = norm(POS_TAG.sub("", r["en"]))
        if not k or k in existing or k in seen or (base and base in existing):
            continue
        seen.add(k)
        if base:
            seen.add(base)
        fresh.append(r)
    if not fresh:
        return 0, len(existing)
    fresh.sort(key=lambda r: norm(r["en"]))
    lines = ["  // — واژگان جامع (راند ۲۱۱، نجاتِ رسوبِ گیت‌شده)"]
    for r in fresh:
        lines.append(f'  W("{esc(r["en"])}", "{esc(r["fa"])}"),')
    out = src[:end] + "\n" + "\n".join(lines) + src[end:]
    open(path, "w", encoding="utf-8").write(out)
    return len(fresh), len(existing) + len(fresh)


def main():
    wl = load_whitelist()
    lesson_ens = load_lesson_ens()
    per_target = {}
    kept, rescued, skipped, still_bad = 0, 0, [], []
    for g in GRADES:
        for r in parse_residue(g):
            k, base = norm(r["en"]), norm(POS_TAG.sub("", r["en"]))
            if k in lesson_ens[r["target"]] or (base and base in lesson_ens[r["target"]]):
                skipped.append((g, r["en"]))
                continue
            key = (r["target"], r["en"])
            if key in ROW_FA:
                fa, src_note = ROW_FA[key], "ROW"
            else:
                fa, src_note = apply_token_fixes(r["raw"]), "keep"
            ok, bad = gate(fa, wl)
            if not ok:
                still_bad.append((g, r["en"], fa, bad, src_note))
                continue
            r2 = dict(r, fa=polish_fa(fa), via=src_note)
            per_target.setdefault(r["target"], []).append(r2)
            rescued += 1
            if src_note == "keep":
                kept += 1

    print(f"rescued: {rescued} (row-rewrites: {rescued - kept}, keep-original: {kept})")
    print(f"skipped (en already in lesson): {len(skipped)}")
    for g, en in skipped:
        print(f"  dup g{g}: {en}")
    print(f"STILL BAD (stays in residue): {len(still_bad)}")
    for g, en, fa, bad, note in still_bad:
        print(f"  g{g} [{note}] {en} → {fa}  <bad: {' '.join(bad)}>")

    json.dump(per_target, open(f"{EXTRACT}/rescue-r211.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ——— integrate ———
    total_added = 0
    grand_after = {}
    for target in sorted(per_target):
        added, after = integrate(target, per_target[target])
        total_added += added
        grand_after[target] = after
        print(f"lesson{target}: +{added} → {after}")
    print("TOTAL ADDED:", total_added)

    # rewrite residue files with only the still-bad rows
    bad_keys = {(g, en) for g, en, *_ in still_bad}
    for g in GRADES:
        path = f"{EXTRACT}/jame{g}-residue.txt"
        if not os.path.exists(path):
            continue
        out_lines = []
        for line in open(path, encoding="utf-8"):
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3:
                continue
            m = re.match(r"G\d+L\d+T(\d+)", parts[0])
            en = parts[1].strip()
            if m and (g, en) in bad_keys:
                out_lines.append(line.rstrip("\n"))
        open(path, "w", encoding="utf-8").write("\n".join(out_lines) + ("\n" if out_lines else ""))
    print("residue files rewritten with survivors only")


if __name__ == "__main__":
    main()
