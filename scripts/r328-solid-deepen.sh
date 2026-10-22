#!/usr/bin/env bash
# r328 — تعمیقِ سولیدهایِ آفتابی: bg-emerald-600→700 · bg-rose-500→700 ·
#   bg-teal-600→700 + جفتهایِ hover هماهنگ. گاردِ آلفا: پس از -500/-600
#   اگر / یا رقم بیاید دستنخورده میماند (bg-rose-500/20 و امثالش).
#   ترتیبِ مهم: اول hover:bg-emerald-700→800 (تا بعد از تعویضِ پایه،
#   هاورِ بیاثر نشود) بعد پایهها.
set -euo pipefail
cd /home/z/my-project

before_em=$(rg -P "bg-emerald-600(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l)
before_ro=$(rg -P "bg-rose-500(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l)
before_te=$(rg -P "bg-teal-600(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l)
echo "before: em600=$before_em rose500=$before_ro teal600=$before_te"

# ۱) هاورِ emerald-700 → 800 (پایههایِ 600 بهزودی 700 میشوند)
rg -l "hover:bg-emerald-700" src --glob "*.tsx" | while read -r f; do
  perl -pi -e 's/hover:bg-emerald-700/hover:bg-emerald-800/g' "$f"
done

# ۲) پایههایِ سولید (گاردِ آلفا با lookahead)
rg -l "bg-emerald-600" src --glob "*.tsx" --glob "*.ts" | while read -r f; do
  perl -pi -e 's/bg-emerald-600(?![\/\d])/bg-emerald-700/g' "$f"
done
rg -l "bg-rose-500" src --glob "*.tsx" --glob "*.ts" | while read -r f; do
  perl -pi -e 's/bg-rose-500(?![\/\d])/bg-rose-700/g' "$f"
done
rg -l "bg-teal-600" src --glob "*.tsx" --glob "*.ts" | while read -r f; do
  perl -pi -e 's/bg-teal-600(?![\/\d])/bg-teal-700/g' "$f"
done

after_em=$(rg -P "bg-emerald-600(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l || true)
after_ro=$(rg -P "bg-rose-500(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l || true)
after_te=$(rg -P "bg-teal-600(?![/\d])" src --glob "*.tsx" --glob "*.ts" | wc -l || true)
alpha_em=$(rg -o "bg-emerald-600/" src --glob "*.tsx" --glob "*.ts" | wc -l || true)
alpha_ro=$(rg -o "bg-rose-500/" src --glob "*.tsx" --glob "*.ts" | wc -l || true)
echo "after: em600=$after_em rose500=$after_ro teal600=$after_te | alpha kept: em=$alpha_em rose=$alpha_ro"
echo "new: em700=$(rg -o 'bg-emerald-700' src --glob '*.tsx' --glob '*.ts' | wc -l) rose700=$(rg -o 'bg-rose-700' src --glob '*.tsx' --glob '*.ts' | wc -l) teal700=$(rg -o 'bg-teal-700' src --glob '*.tsx' --glob '*.ts' | wc -l) hover800=$(rg -o 'hover:bg-emerald-800' src --glob '*.tsx' | wc -l)"
