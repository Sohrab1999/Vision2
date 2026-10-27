#!/bin/bash
# تستِ QN در همان ساختارِ درایور
QN() {
  agent-browser eval "(()=>{const m=document.body.innerText.match(/(\d+)\s*\/\s*12/);return m?m[1]:'0'})()" 2>/dev/null | tr -d '"' | tr -d '\n'
}
for t in 1 2 3; do
  V=$(QN)
  echo "try$t: [$V]"
  sleep 0.5
done
