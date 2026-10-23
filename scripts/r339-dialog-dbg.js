// r328 — نسخهٔ تشخیصیِ پروبِ r326: همهٔ گروههایِ مردود (cr<need) با
//   نمونه + شناسنامهٔ کاملِ سطح (dbg برایِ هر گروه، نه فقط cr<3).
//   هدف: شناساییِ دقیقِ گروههایِ ناشناختهٔ O2 (#009966، #ff2056،
//   4.14/n120، 4.32/n93، از-stone-100ها) پیش از ترمیم.
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
  const over = (ink, bg, a) =>
    [0, 1, 2].map((i) => Math.round(ink[i] * a + bg[i] * (1 - a)));
  const ratio = (A, B) => {
    const l1 = lum(A), l2 = lum(B);
    const hi = l1 > l2 ? l1 : l2, lo = l1 > l2 ? l2 : l1;
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  const hex = (rgb) =>
    "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  const COLOR_RE =
    /(oklch\([^)]+\)|oklab\([^)]+\)|lab\([^)]+\)|lch\([^)]+\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g;
  const gradStops = (img) => (img && img.match(COLOR_RE)) || [];
  const clsTokens = (el, re) => {
    const m = (el && typeof el.className === "string" ? el.className : "").match(re);
    return m ? m[0] : "";
  };
  const BG_RE = /(?:bg|from|via|to)-[a-z]+-\d{2,3}/;
  const walk = (el, skipSelf) => {
    const layers = [];
    let op = 1;
    let gradCount = 0;
    for (let n = skipSelf ? el.parentElement : el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const o = parseFloat(cs.opacity);
      op *= Number.isFinite(o) && o > 0 ? o : 1;
      const raw = cs.backgroundColor;
      if (raw && raw !== "transparent") {
        const c = toRGBA(raw);
        if (c[3] > 0) layers.push({ kind: "solid", c, el: n });
      }
      if (
        gradCount < 2 &&
        cs.backgroundImage &&
        cs.backgroundImage !== "none" &&
        cs.backgroundImage.includes("gradient")
      ) {
        const stops = gradStops(cs.backgroundImage).slice(0, 3);
        if (stops.length) {
          gradCount++;
          layers.push({ kind: "grad", stops, el: n });
        }
      }
    }
    return { op, layers };
  };
  const compose = (layers) => {
    let bases = [[255, 255, 255]];
    const rootBg = getComputedStyle(document.documentElement).backgroundColor;
    if (rootBg && rootBg !== "transparent") {
      const c = toRGBA(rootBg);
      if (c[3] > 0) bases = [[c[0], c[1], c[2]]];
    }
    const gradEls = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.kind === "solid") {
        bases = bases.map((b) =>
          [0, 1, 2].map((k) => Math.round(L.c[k] * L.c[3] + b[k] * (1 - L.c[3])))
        );
      } else {
        gradEls.push(L.el);
        const next = [];
        for (const b of bases) {
          for (const gs of L.stops) {
            const gb = toRGBA(gs);
            next.push([0, 1, 2].map((k) => Math.round(gb[k] * gb[3] + b[k] * (1 - gb[3]))));
          }
        }
        bases = next.slice(0, 9);
      }
    }
    return { bases, gradEls };
  };
  const groups = new Map();
  // r339 — دامنهٔ دیالوگ-scoped: راهنمای میانبر و فرمان‌یاب Dialogِ رادیکس‌اند
  //   نه Popover (درسِ همین راند) — محتوا در DialogContent با data-state=open
  //   زندگی میکند و کلاسِ دامنهٔ مشخص دارد (.shortcuts-dialog / .command-palette).
  //   فیلترِ data-state=open محتوای animate-outِ بستهشده را هم دور میزند.
  //   درسِ r338 پابرجا: حلقهٔ داوری دستنخورده — تنها ROOTS قابلِ تعویض است.
  const ROOTS = [...document.querySelectorAll(".shortcuts-dialog, .command-palette")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.getAttribute("data-state") === "open";
  });
  const els = ROOTS.flatMap((R) => [R, ...R.querySelectorAll("*")]).filter((el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|SVG|PATH)$/.test(el.tagName)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    if (!(r.width > 0 && r.height > 0)) return false;
    return [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
  });
  for (const el of els) {
    const cs = getComputedStyle(el);
    const isClipText =
      (cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text") &&
      cs.backgroundImage &&
      cs.backgroundImage !== "none";
    const { op, layers } = walk(el, !!isClipText);
    if (op <= 0.02) continue;
    const { bases, gradEls } = compose(layers);
    const fs = parseFloat(cs.fontSize) || 16;
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = fs >= 24 || (bold && fs >= 18.66);
    const need = large ? 3 : 4.5;
    const sample = el.textContent.trim().slice(0, 26);
    const disOwner = el.closest('button[disabled], [aria-disabled="true"], fieldset[disabled]');
    if (disOwner) continue;
    const inkCls = clsTokens(el, /text-[a-z]+-\d{2,3}/) || (isClipText ? "grad-ink" : "");
    let worst = { cr: 99, bg: "", bgCls: "" };
    const judge = (inkRGB, a, surfaceRGB, surfaceLabel) => {
      const eff = over(inkRGB, surfaceRGB, a);
      const cr = ratio(eff, surfaceRGB);
      if (cr < worst.cr) worst = { cr, bg: hex(surfaceRGB), bgCls: surfaceLabel };
    };
    const inkA = isClipText ? null : (() => {
      const c = toRGBA(cs.color);
      return { rgb: [c[0], c[1], c[2]], a: c[3] * op };
    })();
    if (!isClipText && inkA.a < 0.15) continue;
    const judgeAll = (inkRGB, a) => {
      for (const b of bases) {
        judge(inkRGB, a, b, clsTokens(gradEls[0], BG_RE) || (bases.length === 1 ? "page" : "page"));
      }
    };
    if (isClipText) {
      const stops = gradStops(cs.backgroundImage);
      for (const st of stops) {
        const c = toRGBA(st);
        judgeAll([c[0], c[1], c[2]], c[3] * op);
      }
    } else {
      judgeAll(inkA.rgb, inkA.a);
    }
    if (worst.cr === 99) continue;
    const key = `${worst.bg}|${worst.bgCls}|${inkCls || cs.color}|${large ? "L" : "N"}`;
    const g =
      groups.get(key) ||
      { bg: worst.bg, bgCls: worst.bgCls, inkCls, large, n: 0, minCR: 99, need, samples: [], dbg: null };
    g.n++;
    if (worst.cr < g.minCR) {
      g.minCR = worst.cr;
      const surfEl = (layers[0] && layers[0].el) || null;
      const gradEl = gradEls.length ? gradEls[gradEls.length - 1] : null;
      g.dbg = {
        ink: cs.color,
        fs,
        fw: cs.fontWeight,
        surfSolid: surfEl ? getComputedStyle(surfEl).backgroundColor : "",
        surfImg: gradEl ? getComputedStyle(gradEl).backgroundImage.slice(0, 160) : "",
        surfCls: surfEl ? String(surfEl.className).slice(0, 120) : "",
        gradCls: gradEl ? String(gradEl.className).slice(0, 120) : "",
        sample,
      };
    }
    if (worst.cr < need && g.samples.length < 3) g.samples.push(sample);
    groups.set(key, g);
  }
  const out = [...groups.values()].sort((a, b) => a.minCR - b.minCR);
  for (const g of out) g.fail = g.minCR < g.need;
  return JSON.stringify({
    probed: els.length,
    roots: ROOTS.length,
    fails: out.filter((g) => g.fail).length,
    failsList: out.filter((g) => g.fail).map((g) => ({
      cr: g.minCR, need: g.need, n: g.n, large: g.large,
      bg: g.bg, bgCls: g.bgCls, inkCls: g.inkCls, samples: g.samples, dbg: g.dbg,
    })),
  });
})();
