(() => {
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const toRGBA = (s) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = s;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (A, B) => {
    const l1 = lum(A), l2 = lum(B);
    const hi = l1 > l2 ? l1 : l2, lo = l1 > l2 ? l2 : l1;
    return Math.round((hi + 0.05) / (lo + 0.05) * 100) / 100;
  };
  const hx = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const WHITE = [255, 255, 255];
  const out = {};
  // gradient stops via real classes
  const mk = (cls) => {
    const d = document.createElement("div");
    d.className = cls;
    document.body.appendChild(d);
    return d;
  };
  const gradProbe = (name, cls) => {
    const el = mk(cls);
    const img = getComputedStyle(el).backgroundImage;
    const ss = (img && img.match(/oklch\([^)]+\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|lab\([^)]+\)/g)) || [];
    out[name] = ss.map((s) => {
      const c = toRGBA(s);
      return { hex: hx(c), white: ratio(WHITE, c), slate700: ratio([68, 64, 60], c) };
    });
    el.remove();
  };
  gradProbe("amber700to700", "bg-gradient-to-b from-amber-700 to-amber-700");
  gradProbe("orange700to700", "bg-gradient-to-b from-orange-700 to-orange-700");
  gradProbe("yellow700to700", "bg-gradient-to-b from-yellow-700 to-yellow-700");
  gradProbe("amber700toorange700", "bg-gradient-to-b from-amber-700 to-orange-700");
  gradProbe("yellow700toamber700", "bg-gradient-to-b from-yellow-700 to-amber-700");
  gradProbe("emerald700to900", "bg-gradient-to-b from-emerald-700 to-emerald-900");
  gradProbe("violet600toPurple700", "bg-gradient-to-b from-violet-600 to-purple-700");
  gradProbe("rose600toorange700", "bg-gradient-to-b from-rose-600 to-orange-700");
  gradProbe("amber400top", "bg-gradient-to-b from-amber-400 to-amber-400");
  gradProbe("amber300top", "bg-gradient-to-b from-amber-300 to-amber-300");
  gradProbe("fuchsia300top", "bg-gradient-to-b from-fuchsia-300 to-fuchsia-300");
  gradProbe("stone200top", "bg-gradient-to-b from-stone-200 to-stone-200");
  gradProbe("orange200top", "bg-gradient-to-b from-orange-200 to-orange-200");
  // solid tiles: ink on -50 bg
  const pair = (name, inkCls, bgCls) => {
    const el = mk(bgCls + " " + inkCls);
    const cs = getComputedStyle(el);
    const ink = toRGBA(cs.color), bg = toRGBA(cs.backgroundColor);
    out[name] = { ink: hx(ink), bg: hx(bg), cr: ratio(ink, bg) };
    el.remove();
  };
  pair("tile-emerald700on50", "text-emerald-700", "bg-emerald-50");
  pair("tile-amber700on50", "text-amber-700", "bg-amber-50");
  pair("tile-orange700on50", "text-orange-700", "bg-orange-50");
  pair("tile-rose600on50", "text-rose-600", "bg-rose-50");
  // violet chip dark composite: violet-950/60 over dark page (#0c0a09 approximated by measuring bg on body in dark? use literal composite)
  const comp = (fg, a, bg) => fg.map((v, i) => Math.round(v * a + bg[i] * (1 - a)));
  const v950 = toRGBA("#2e1065"), page = [12, 10, 9], v300lit = toRGBA("#c4b5fd");
  const chipBg = comp(v950, 0.6, page);
  out["violet-chip-dark"] = { chipBg: hx(chipBg), ink: hx(v300lit), cr: ratio(v300lit, chipBg) };
  const rose950 = toRGBA("#4c0519");
  const roseChipBg = comp(rose950, 0.6, page);
  const roseInk = toRGBA("#fda4af");
  out["rose-chip-dark"] = { chipBg: hx(roseChipBg), ink: hx(roseInk), cr: ratio(roseInk, roseChipBg) };
  // dark badge pins: white on amber-700 / orange-800-ish / yellow-800-ish
  gradProbe("goldTopYellow800", "bg-gradient-to-b from-yellow-800 to-yellow-800");
  gradProbe("bronzeBottomOrange800", "bg-gradient-to-b from-orange-800 to-orange-800");
  // chip bg-black/20 over amber-700 composite
  const a700 = toRGBA("#b45309");
  const chipDeep = comp([0, 0, 0], 0.2, a700);
  out["badge-chip-deep"] = { bg: hx(chipDeep), white: ratio(WHITE, chipDeep) };
  return JSON.stringify(out);
})()
