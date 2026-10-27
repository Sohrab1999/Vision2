#!/usr/bin/env python3
"""Task 133 — splice the r12 band out of globals.css, leaving the residue
(cross-family canonical groups + generic utility overrides)."""
from pathlib import Path

P = Path("/home/z/my-project/src/app/globals.css")
lines = P.read_text(encoding="utf-8").split("\n")

# sanity: verify band boundaries before splicing (1-indexed 692..925)
assert "r12 — rush challenge + SRS dashboard + spell audio" in lines[691], lines[691]
assert ".dark .report-foot .text-emerald-800" in lines[924], lines[924]
assert "r14 — SRS donut" in lines[927], lines[927]

residue = """/* ================= r12 — residue after per-feature extraction (§8.3 wave 1, task 133) =================
   The feature-owned rules moved BESIDE their components:
     shared/confetti.css · duel/rush.css · duel/spell-input.css ·
     practice/srs-panel.css · practice/skill-panel.css · reports/report-card.css
   All six always load via the src/app/features.css manifest (imported in
   layout.tsx right after globals.css) — same always-loaded guarantee as before,
   rules at cascade end, safety proven by the wave-1 isolation scan
   (scripts/css-band-isolation-scan.cjs + selector-level greps: no
   equal-specificity competition outside the band; the print band wins via
   !important; @utility definitions lose to unlayered author rules).
   ONLY cross-family canonical groups + generic utility overrides stay here: */

/* ink tone text-stone-600 → #c9c2bb — canonical group (Step 9 tranche-2; was 8 drifted per-panel copies) */
.dark .rush-banner .text-stone-600,.dark .rush-hero .text-stone-600,.dark .rush-done .text-stone-600,
.dark .rush-card .text-stone-600,.dark .report-best .text-stone-600,.dark .duel-card .text-stone-600,
.dark .duel-done .text-stone-600,.dark .gmetro-dialog .text-stone-600 { color: #c9c2bb; }

/* shared orange painters — the rush family and report-paper share the same
   deviating values; cross-family groups are canonical-layer residents (§8.3) */
.dark .rush-hero .text-orange-600,.dark .rush-score-live,.dark .rush-board .text-orange-600,.dark .report-paper .text-orange-600 { color: #fdba74; }
.dark .rush-hero .border-orange-200,.dark .rush-board .border-orange-200,.dark .report-paper .border-orange-200 { border-color: rgb(154 52 18 / 0.55); }

/* spell hover utilities — NOT spell-exclusive (task 133 scan: teacher panels
   and my-words views consume them too) — the generic utility-override band
   stays global until §8.3's codegen pass retires it properly */
.dark .hover\\:bg-sky-50:hover { background-color: rgba(8, 47, 60, 0.65); }
.dark .hover\\:bg-sky-100:hover { background-color: rgba(8, 47, 60, 0.7); }
.dark .hover\\:bg-violet-50:hover { background-color: rgba(59, 40, 92, 0.55); }"""

out = lines[:691] + residue.split("\n") + lines[925:]
P.write_text("\n".join(out), encoding="utf-8")
print("spliced OK — new line count:", len(out))
