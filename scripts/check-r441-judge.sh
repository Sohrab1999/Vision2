#!/usr/bin/env bash
# Extract the result_judge probe JS from the r441 script and syntax-check with node
set -euo pipefail
LINE=$(rg -n 'probe "\(\(\)=>\{const sec=\[\.\.\.document\.querySelectorAll' /home/z/my-project/scripts/qa-r441-mobile-result.sh | head -1 | cut -d: -f1)
echo "judge line: $LINE"
# pull that line, strip leading whitespace + probe " and trailing "
JS=$(sed -n "${LINE}p" /home/z/my-project/scripts/qa-r441-mobile-result.sh)
JS="${JS#*probe \"}"
JS="${JS%\"}"
# substitute the bash params as the script would
JS_DARK="${JS//\$1/MOBILE-RESULT-DARK}"
JS_DARK="${JS_DARK//\$2/LEARN}"
printf '%s' "$JS_DARK" > /tmp/r441-judge-check.js
node --check /tmp/r441-judge-check.js && echo "JS-SYNTAX-OK" || echo "JS-SYNTAX-FAIL"
