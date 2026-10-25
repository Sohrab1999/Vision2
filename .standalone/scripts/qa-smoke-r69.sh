#!/usr/bin/env bash
# Single-session smoke QA r69
set -u
AB="bunx agent-browser"
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 2
$AB eval "localStorage.setItem('vision2-onboarded','1'); localStorage.setItem('onboarding-done','1'); 'seeded'" >/dev/null 2>&1
$AB open http://127.0.0.1:3000 >/dev/null 2>&1
sleep 3
echo "== console errors =="
$AB console --level error 2>&1 | tail -5
echo "== app root =="
$AB eval "(()=>{const m=document.querySelector('[role=banner],header');const b=document.body;return JSON.stringify({hasHeader:!!m,bodyLen:b.innerText.length,title:document.title})})()" 2>&1
echo "== mobile 390 overflow =="
$AB set viewport 390 844 >/dev/null 2>&1
sleep 1
$AB eval "(()=>{const d=document.documentElement;return JSON.stringify({sw:d.scrollWidth,cw:d.clientWidth,overflow:d.scrollWidth>d.clientWidth+1})})()" 2>&1
$AB set viewport 1280 800 >/dev/null 2>&1
sleep 1
echo "== dark probe =="
$AB eval "(()=>{const btn=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('حالت شب'));if(btn){btn.click();return 'clicked-night'};return 'no-btn'})()" 2>&1
sleep 1
$AB eval "(()=>{const b=getComputedStyle(document.body).backgroundColor;return JSON.stringify({dark:bg=>b,bg:b})})()" 2>&1
$AB eval "(()=>{const btn=[...document.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label')||'').includes('حالت روشن'));if(btn){btn.click();return 'clicked-light'};return 'no-btn'})()" >/dev/null 2>&1
sleep 1
echo "== palette quick =="
$AB press Control+k >/dev/null 2>&1
sleep 1
$AB eval "(()=>{const d=document.querySelector('.command-palette');return JSON.stringify({paletteOpen:!!d,groups:d?d.querySelectorAll('[role=group],.group-header').length:0})})()" 2>&1
$AB press Escape >/dev/null 2>&1
echo "== done =="
