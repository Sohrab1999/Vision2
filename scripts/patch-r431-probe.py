#!/usr/bin/env python3
"""Rewrite the r431 probe judge: string-compare against same-engine reference
elements (color-space agnostic by construction) + fix $6 unbound under set -u."""
PATH = "/home/z/my-project/scripts/qa-r431-ring-color.sh"
src = open(PATH).read()

# 1) shot default under set -u
src = src.replace(
    'local mode="$1" bank="$2" aria="$3" findExpr="$4" bexpr="$5" shot="$6"',
    'local mode="$1" bank="$2" aria="$3" findExpr="$4" bexpr="$5" shot="${6:-}"',
)

# 2) replace judge + tick block (from 'const judge=' to 'setTimeout(tick,300);')
start = src.find("    const judge=(el,foundAt)=>{")
endm = "    setTimeout(tick,300);"
end = src.find(endm, start)
assert start > 0 and end > start, "judge anchors not found"
end += len(endm)

BS = chr(92)
def sh(js):
    return js.replace(BS, BS + BS)

# color token regex (JS form) — doubled backslashes for the shell file
color_re = sh("([a-z]+\\([^)]*\\)|#[0-9a-fA-F]+)")

new_block = (
    "    const mk=(cls)=>{const d=document.createElement('div');d.className=cls;document.body.appendChild(d);return d;};\n"
    "    const segOf=(el)=>{const s=getComputedStyle(el).boxShadow||'';return s.split(/, (?=[a-z(#])/).find(function(x){return x.indexOf('2px')>=0&&x.indexOf('inset')>=0;})||'';};\n"
    "    const refL=mk('shadow-[inset_0_0_0_2px] shadow-emerald-300');\n"
    "    const refRing=segOf(refL); // رنگِ مرجعِ خانواده در همین موتور و همین حالت — بیتعصبِ رنگفضا\n"
    "    const refBgEl=mk('bg-emerald-50');\n"
    "    const refBgEmerald=getComputedStyle(refBgEl).backgroundColor;\n"
    "    const refBgW=mk('bg-white');\n"
    "    const whiteBg=getComputedStyle(refBgW).backgroundColor;\n"
    "    const refBgS=mk('bg-stone-50');\n"
    "    const stoneBg=getComputedStyle(refBgS).backgroundColor;\n"
    "    const refD=mk('shadow-[inset_0_0_0_2px] dark:shadow-emerald-700');\n"
    "    const refRingDark=segOf(refD);\n"
    "    const kEl=document.createElement('div');kEl.style.boxShadow='inset 0 0 0 2px rgb(4, 120, 87)';document.body.appendChild(kEl);\n"
    "    const refKernel=segOf(kEl);\n"
    "    [refL,refBgEl,refBgW,refBgS,refD,kEl].forEach(function(n){n.remove();});\n"
    "    const judge=(el,foundAt)=>{try{\n"
    "      const cs=getComputedStyle(el);\n"
    "      const sh=cs.boxShadow||'';\n"
    "      const seg=segOf(el);\n"
    "      const ringGeom=seg.indexOf('0px 0px 0px 2px')>=0;\n"
    "      const bg=cs.backgroundColor||'';\n"
    "      const dlgGone=!document.querySelector('[role=\"dialog\"]');\n"
    "      const expectedRing=(MODE==='light')?refRing:(BANK==='words'?refKernel:refRingDark);\n"
    "      if(MODE==='light'){\n"
    "        if(ringGeom&&seg===refRing&&bg===refBgEmerald&&bg!==whiteBg&&bg!==stoneBg&&dlgGone){res(JSON.stringify({mode:MODE,bank:BANK,ring:'2px-inset',ringSeg:seg.slice(0,56),bgOK:true,dialogClosed:true,at:foundAt}));return true;}\n"
    "        return false;\n"
    "      }\n"
    "      const alpha30=/0\\.3\\)/.test(bg)||bg.indexOf('0.3')>=0;\n"
    "      const notStone=!(bg.indexOf('28, 25, 23')>=0||bg.indexOf('28,25,23')>=0);\n"
    "      if(ringGeom&&seg===expectedRing&&alpha30&&notStone&&dlgGone){res(JSON.stringify({mode:MODE,bank:BANK,ring:'2px-inset',ringSeg:seg.slice(0,56),bg:bg.slice(0,44),dialogClosed:true,at:foundAt}));return true;}\n"
    "      return false;\n"
    "    }catch(e){res('READ-ERR-'+BANK+':'+e.message);return true;}};\n"
    "    const tick=()=>{try{\n"
    "      const el=FIND();\n"
    "      if(el&&el.className&&el.className.includes('shadow-emerald-300')){\n"
    "        const foundAt=Date.now()-t0;\n"
    "        const tryReads=(offs)=>{if(!offs.length){const cs2=getComputedStyle(el);res('RING-MISS-'+BANK+':found@'+foundAt+',lastRead='+(Date.now()-t0)+',seg='+segOf(el).slice(0,56)+',bg='+cs2.backgroundColor.slice(0,40)+',refRing='+refRing.slice(0,44));return;}setTimeout(()=>{if(judge(el,foundAt))return;tryReads(offs.slice(1));},offs[0]);};\n"
    "        tryReads([150,350,650,950]);\n"
    "        return;\n"
    "      }\n"
    "      if(Date.now()-t0>9000){res('PULSE-MISS-'+BANK+':'+(el?('class='+el.className.slice(0,72)):'no-element'));return;}\n"
    "      setTimeout(tick,200);\n"
    "    }catch(e){res('TICK-ERR-'+BANK+':'+e.message);}};\n"
    "    setTimeout(tick,300);"
)

src = src[:start] + new_block + src[end:]

# 3) ensure SEEDED quoted form
src = src.replace("return 'SEEDED:'+$bank;})()", "return 'SEEDED:$bank';})()")

open(PATH, "w").write(src)
print("PATCHED-OK")
