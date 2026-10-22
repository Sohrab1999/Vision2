// r326 — پروبِ کنتراستِ خانوادگیِ متن-روی-رنگ — گسترشِ رزولورِ بومیِ r325
//   پیشنهادِ ②ِ r325: سویپِ ۳۰ خانهٔ حرارتی فقط یک سطح را دید؛ خانوادهٔ
//   «متن روی زمینهٔ رنگی» خیلی بزرگتر است (چیپهای ریسک واژه، بنرهای SRS،
//   نشانها، کارت گرادیانی، جوهرِ گرادیانی). ابزار:
//     • بومِ 1×1 (درسِ r325): هر رشتهٔ رنگی CSS — oklch/lab/rgba/hex — پذیرفته
//       میشود؛ پارسرِ rgb-فقط Tailwind v4 را سیاه میخواند و حکمِ غلط میدهد.
//     • زمینهٔ مؤثر: ترکیبِ همهٔ لایههای آلفادار از ریشه تا عنصر (چیپهای
//       نیمشفافِ دارک مثل rgba(80,18,28,.35) هم درست اندازهگیری میشوند —
//       آستانهٔ 0.5ِ r325 اینها را از قلم میانداخت).
//     • زمینهٔ گرادیانی: استاپها از computed backgroundImage پارس و نسبت
//       علیه هر استاپ سنجیده میشود — بدترین (کمینه) گزارش میشود.
//     • جوهرِ گرادیانی (bg-clip-text): هر استاپ بهسانِ جوهر سنجیده میشود.
//     • آلفای ترکیبی: حاصلضربِ opacityِ زنجیره × آلفای رنگِ جوهر، پیش از
//       ترکیب روی زمینه (white/85 و framer-motion entry هر دو پوشش داده میشوند).
//     • آستانهٔ WCAG: 4.5 متنِ عادی · 3.0 بزرگ (fs>=24 یا bold&&fs>=18.66).
// خروجی: گروههای (زمینه|جوهر|بزرگی) مرتب بر کمینهٔ نسبت + شمارشِ خطاها.
// مصرف: agent-browser eval "$(cat scripts/r326-contrast-sweep.js)"
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

  // ——— زمینهٔ مؤثر + حاصلضربِ opacity، در یک پیماشِ یکتا (el → ریشه) ———
  // لایهها از نزدیک به دور جمع میشوند؛ ترکیب نهایی از دور به نزدیک
  // (زمینهٔ پایه → رنگهای بالارویِ آن).
  // درسِ سنجشِ زندهٔ r326: عنصرِ bg-clip-text گرادیانِ خودش را «جوهر»
  // دارد نه «زمینه» — پیماشِ سطح از والدش آغاز میشود (skipSelf).
  // درسِ دوم (قرصِ «با روخوانی هوش مصنوعی»): گرادیانهایِ عمیقتر از سطحِ
  // نزدیک هم زیرِ رنگِ نهایی زندگی میکنند (قرصِ white/15 رویِ جلدِ کتاب) —
  // پس بعد از یافتنِ سطح هم گرادیانها جمع میشوند و ترکیب، حاصلضربِ
  // کارتزینیِ استاپها میشود (سقف: ۲ گرادیان × ۳ استاپ = ۹ پایه).
  const walk = (el, skipSelf) => {
    const layers = []; // {kind:'solid',c} | {kind:'grad',stops,el}
    let op = 1;
    let gradCount = 0;
    for (let n = skipSelf ? el.parentElement : el; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      // درسِ سنجشِ زندهٔ ②: «|| 1» اُپاسیتهٔ صفر را ۱ میخواند — محتوایِ
      // pre-view (whileInView زیرِ فولد) با op=1 سنجیده میشد. صفر در این اپ
      // همیشه وضعیتِ گذرای ورود است — کاربر با اسکرول به op=۱ میرسد؛ پس صفر
      // = ۱ (حالتِ سکون) و مقادیرِ میانه (طراحیِ persistent) واقعی میمانند.
      const o = parseFloat(cs.opacity);
      op *= Number.isFinite(o) && o > 0 ? o : 1;
      const raw = cs.backgroundColor;
      if (raw && raw !== "transparent") {
        const c = toRGBA(raw);
        if (c[3] > 0) layers.push({ kind: "solid", c, el: n });
      }
      // گرادیانهایِ عمیقتر هم جمع میشوند (سقفِ ۲ تا) — کارتزینِ استاپها
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
    // از دور به نزدیک: پایهٔ صفحه (یا سفید) → هر لایه بالای قبلیها؛
    // گرادیان = حاصلضربِ کارتزینیِ استاپها (هر استاپ یک پایهٔ نامزد)
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
        bases = next.slice(0, 9); // سقفِ کارتزین — ۲ گرادیانِ ۳استاپی
      }
    }
    return { bases, gradEls };
  };

  const groups = new Map();
  let probed = 0;
  const els = [...document.querySelectorAll("body *")].filter((el) => {
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
    if (op <= 0.02) continue; // عملاً نامرئی
    const { bases, gradEls } = compose(layers);
    const fs = parseFloat(cs.fontSize) || 16;
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = fs >= 24 || (bold && fs >= 18.66);
    const need = large ? 3 : 4.5;
    const sample = el.textContent.trim().slice(0, 26);
    // معافیتِ WCAG: کنترلهایِ غیرفعال (disabled/aria-disabled) از قانونِ
    // کنتراست مستثنایند — دکمهٔ «دیکتهٔ همین‌ها» با opacity-50 حکمِ کاذب میگرفت.
    const disOwner = el.closest('button[disabled], [aria-disabled="true"], fieldset[disabled]');
    if (disOwner) continue;

    // ——— جوهر: solid یا گرادیانی (bg-clip-text) — isClipText از بالا میآید.
    // حکم، علیه همهٔ پایههایِ کارتزینی (بدترین = کمینه) است.
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
    if (!isClipText && inkA.a < 0.15) continue; // جوهرِ تزئینی — حکمِ کنتراست نمیگیرد
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
    probed++;
    const key = `${worst.bg}|${worst.bgCls}|${inkCls || cs.color}|${large ? "L" : "N"}`;
    const g =
      groups.get(key) ||
      { bg: worst.bg, bgCls: worst.bgCls, inkCls, large, n: 0, minCR: 99, need, samples: [], dbg: null };
    g.n++;
    if (worst.cr < g.minCR) {
      g.minCR = worst.cr;
      if (worst.cr < 3 && !g.dbg) {
        // شناسنامهٔ سطح برایِ گروههایِ سخت — ردیابیِ حکمِ ابزار
        const surfEl = (layers[0] && layers[0].el) || null;
        const gradEl = gradEls.length ? gradEls[gradEls.length - 1] : null;
        g.dbg = {
          ink: cs.color,
          fs,
          fw: cs.fontWeight,
          surfSolid: surfEl ? getComputedStyle(surfEl).backgroundColor : "",
          surfImg: gradEl ? getComputedStyle(gradEl).backgroundImage.slice(0, 160) : "",
          surfCls: surfEl ? String(surfEl.className).slice(0, 90) : "",
          gradCls: gradEl ? String(gradEl.className).slice(0, 90) : "",
          nBases: bases.length,
          sample,
        };
      }
    }
    if (worst.cr < need && g.samples.length < 3) g.samples.push(sample);
    groups.set(key, g);
  }
  const out = [...groups.values()].sort((a, b) => a.minCR - b.minCR);
  for (const g of out) g.fail = g.minCR < g.need;
  return JSON.stringify({
    probed,
    groups: out.length,
    fails: out.filter((g) => g.fail).length,
    worst: out.filter((g) => g.fail && g.minCR < 3).slice(0, 18).map((g) => ({
      cr: g.minCR, need: g.need, n: g.n, large: g.large,
      bg: g.bg, bgCls: g.bgCls, inkCls: g.inkCls, samples: g.samples, dbg: g.dbg,
    })),
    all: out.map((g) => ({ cr: g.minCR, need: g.need, n: g.n, bg: g.bg, bgCls: g.bgCls, ink: g.inkCls, L: g.large ? 1 : 0 })),
  });
})();
