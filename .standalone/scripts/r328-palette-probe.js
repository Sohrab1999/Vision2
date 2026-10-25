// r328 — سنجشِ زندهٔ جفتهایِ نامزدِ ترمیمِ O2 (رزولورِ بومِ 1×1 — درسِ r325)
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
  const mk = (cls) => {
    const d = document.createElement("div");
    d.className = cls;
    document.body.appendChild(d);
    return d;
  };
  // solid class → computed color, white CR
  const solid = (name, cls, prop) => {
    const el = mk(cls);
    const c = toRGBA(getComputedStyle(el)[prop || "backgroundColor"]);
    out[name] = { hex: hx(c), white: ratio(WHITE, c) };
    el.remove();
  };
  // ink literal over bg literal
  const pairLit = (name, ink, bg, a) => {
    const ci = toRGBA(ink), cb = toRGBA(bg);
    const al = a == null ? ci[3] : a;
    const eff = [0, 1, 2].map((i) => Math.round(ci[i] * al + cb[i] * (1 - al)));
    out[name] = { eff: hx(eff), bg: hx(cb), cr: ratio(eff, cb) };
  };
  // class pair
  const pair = (name, inkCls, bgCls) => {
    const el = mk(bgCls + " " + inkCls);
    const cs = getComputedStyle(el);
    const ink = toRGBA(cs.color), bg = toRGBA(cs.backgroundColor);
    out[name] = { ink: hx(ink), bg: hx(bg), cr: ratio(ink, bg) };
    el.remove();
  };
  // gradient worst stop with white
  const grad = (name, cls) => {
    const el = mk(cls);
    const img = getComputedStyle(el).backgroundImage;
    const ss = (img && img.match(/oklch\([^)]+\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|lab\([^)]+\)/g)) || [];
    const stops = ss.map((s) => {
      const c = toRGBA(s);
      return { hex: hx(c), white: ratio(WHITE, c) };
    });
    out[name] = { worst: Math.min(...stops.map((s) => s.white)), stops };
    el.remove();
  };
  // ——— candidates for the solid deepenings ———
  solid("em600", "bg-emerald-600");
  solid("em700", "bg-emerald-700");
  solid("teal600", "bg-teal-600");
  solid("teal700", "bg-teal-700");
  solid("rose500", "bg-rose-500");
  solid("rose600", "bg-rose-600");
  solid("rose700", "bg-rose-700");
  solid("rose800", "bg-rose-800");
  solid("orange900", "bg-orange-900");
  solid("orange950", "bg-orange-950");
  // ——— kernel stone-500 candidate #9c958c on worst dark tints ———
  pairLit("k500-on-292524", "#9c958c", "#292524");
  pairLit("k500-on-28241f", "#9c958c", "#28241f");
  pairLit("k500-on-231f1b", "#9c958c", "#231f1b");
  pairLit("k500-on-2a2113", "#9c958c", "#2a2113");
  pairLit("k500-on-132328", "#9c958c", "#132328");
  pairLit("k500-on-14231d", "#9c958c", "#14231d");
  pairLit("k500-on-102c2a", "#9c958c", "#102c2a");
  pairLit("k500-old-on-292524", "#8c857d", "#292524");
  // ——— paper pairs ———
  pairLit("s600-on-zebra", "#57534e", "#f5f5f4");
  pairLit("s600-on-white", "#57534e", "#ffffff");
  pairLit("foot78716c-on-white", "#78716c", "#ffffff");
  pairLit("pin500-on-chart50", "#78716c", "#fafaf9");
  pairLit("em700-on-em50", "#047857", "#ecfdf5");
  pairLit("em700-on-white", "#047857", "#ffffff");
  pairLit("titleEn80-on-white", "#44403c", "#ffffff", 0.8);
  pairLit("titleEn80-on-zebra", "#44403c", "#f5f5f4", 0.8);
  // ——— band: new stop + date pill ———
  solid("teal700lit", "bg-teal-700");
  const band = toRGBA("#0f766e");
  const pillDark = [0, 1, 2].map((i) => Math.round(0 * 0.15 + band[i] * 0.85));
  out["band-pill-black15"] = { bg: hx(pillDark), white: ratio(WHITE, pillDark) };
  out["band-pill-white15-old"] = (() => {
    const old6 = toRGBA("#0d9488");
    const p = [0, 1, 2].map((i) => Math.round(255 * 0.15 + old6[i] * 0.85));
    return { bg: hx(p), white: ratio(WHITE, p) };
  })();
  // ——— hero-book: emerald-100 ink on emerald-700/900 stops + black/15 pill ———
  pairLit("em100-on-em700", "#d1fae5", "#047857");
  pairLit("em100-on-em900", "#d1fae5", "#064e3b");
  const emMid = toRGBA("#059669");
  const heroPill = [0, 1, 2].map((i) => Math.round(0 * 0.15 + emMid[i] * 0.85));
  out["hero-pill-black15"] = { bg: hx(heroPill), white: ratio(WHITE, heroPill) };
  // ——— weekly tab: cyan-300 on cyan-950 ———
  pair("tab-dark-cand", "text-cyan-300", "bg-cyan-950");
  // ——— spine candidates ———
  grad("spine-rose700", "bg-gradient-to-b from-rose-700 to-rose-950");
  grad("spine-rose800", "bg-gradient-to-b from-rose-800 to-rose-950");
  grad("spine-orange950", "bg-gradient-to-b from-orange-950 to-orange-950");
  grad("spine-teal700-em700", "bg-gradient-to-l from-teal-700 to-emerald-700");
  grad("band-new", "bg-gradient-to-b from-transparent to-transparent");
  return JSON.stringify(out);
})();
