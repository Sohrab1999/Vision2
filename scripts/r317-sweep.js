// r317 dialog sweep — horizontal (r316 three-way classifier) + vertical classifier
// h: scroller | truncate | transform | sr_only | deco_bleed | sheen_bleed -> legit; else real bug
// v: vscroller | clamp | vscroller-ancestor | flow | sr_only | deco_bleed | truncate_slack | leading_none | ping_wave | transform -> legit;
//    hidden_clip -> candidate (invisible clipping)
// body-level horizontal check appended
((sel) => {
  const root = document.querySelector(sel);
  if (!root) return JSON.stringify({ sel: sel.slice(0, 34), missing: true });
  const scrollsX = (el) => {
    for (let n = el; n && n !== root.parentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX === "auto" || cs.overflowX === "scroll") return true;
    }
    return false;
  };
  const scrollsY = (el) => {
    for (let n = el; n && n !== root.parentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowY === "auto" || cs.overflowY === "scroll") return true;
    }
    return false;
  };
  const truncates = (el) => {
    const cs = getComputedStyle(el);
    return cs.textOverflow === "ellipsis" && cs.overflowX === "hidden";
  };
  // r317 — legit class 4: sr-only (screen-reader-only) hides by design; its
  // 1px box overflows with the full text (palette DialogTitle/Description).
  const srOnly = (el) => {
    const cs = getComputedStyle(el);
    return (
      cs.position === "absolute" &&
      parseFloat(cs.width) <= 2 &&
      cs.overflow === "hidden" &&
      cs.whiteSpace === "nowrap"
    );
  };
  const transformBleed = (el) => {
    for (const d of el.querySelectorAll("*")) {
      const cs = getComputedStyle(d);
      const t = cs.transform !== "none" || (cs.rotate && cs.rotate !== "none");
      if (t) {
        const bb = d.getBoundingClientRect().width;
        if (bb > d.offsetWidth + 1) return true;
      }
    }
    return false;
  };
  const lineClamp = (el) => {
    const cs = getComputedStyle(el);
    return cs.webkitLineClamp && cs.webkitLineClamp !== "none";
  };
  // r318 — legit class 5: deco bleed. Watermark/bolt/glow decorations sit at
  // negative offsets (-left-6, -inset-4); in RTL their left bleed inflates
  // scrollWidth (and bottom bleed inflates scrollHeight) even though
  // overflow:hidden clips them by design. Stable signal = aria-hidden subtree;
  // pointer-events is INHERITED and framer-motion toggles it inline on the
  // animating view wrapper — non-deterministic between runs, so never used
  // here. A bleeding in-flow text child outside aria-hidden stays a real bug.
  const silenced = (k, stop) => {
    for (let n = k; n && n !== stop; n = n.parentElement)
      if (n.getAttribute && n.getAttribute("aria-hidden") === "true") return true;
    return false;
  };
  const decoBleed = (el) => {
    if (el.getAttribute("aria-hidden") === "true") return true; // leaf decoration itself (watermark glyph)
    const er = el.getBoundingClientRect();
    const bleeds = [...el.querySelectorAll("*")].filter((k) => {
      if (getComputedStyle(k).display === "none") return false; // invisible: a zero rect crosses edges but never bleeds
      const kr = k.getBoundingClientRect();
      return kr.right > er.right + 1 || kr.left < er.left - 1 || kr.bottom > er.bottom + 1 || kr.top < er.top - 1;
    });
    return bleeds.length > 0 && bleeds.every((k) => silenced(k, el));
  };
  // r324 — کلاسِ مشروعِ عمودیِ ششم: truncate_slack. پیلِ تکخطیِ truncate
  // (روزِ نمودارِ هفتگی — ترمیمِ r321): overflowYِ خودِ عنصر hidden است و
  // کسریِ عمودیِ ≤3px فضایِ خالیِ line-box است — متریکِ ascent/descentِ
  // بلندِ فونتِ فارسی از line-heightِ کوچکتر (۱۵px) بیرون میزند ولی آن
  // حاشیه بیجوهر است؛ برشِ افقیِ همین عنصر طراحی است (ellipsis). کلاسِ
  // بنجلِ ثبتشدهٔ r323 (hidden_clipهایِ over≤3) با امضایِ قطعیِ همین خانواده
  // به قرارداد بدل شد — چهار پیل در هر زبانهٔ رتبهبندی، پایدار در دو ران.
  // کسریِ >3 (چندخطیِ تحمیلشده) کاندیدا میماند.
  const truncateSlack = (el, over) => {
    const cs = getComputedStyle(el);
    return (
      over <= 3 &&
      cs.textOverflow === "ellipsis" &&
      cs.whiteSpace === "nowrap" &&
      (cs.overflowY === "hidden" || cs.overflowY === "clip")
    );
  };
  // r324 — کلاسِ مشروعِ عمودیِ هفتم: leading_none. عددِ درشتِ leading-none
  // (Podium/درصدها): line-height=1 عمداً تنگ است؛ کسریِ ≤3px اسلکِ متریکِ
  // فونت است (ascent/descent از em بیرون میزند) و رقم میانهٔ em نشسته —
  // جوهرِ بریده نمیشود (تصدیقِ زنده: fs=24/lh=24 · over=2، پایدار در r322/r324).
  // کسریِ >3 = چندخطی یا فونتِ غیرمعمول — کاندیدا میماند.
  const leadingNone = (el, over) => {
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight);
    return (
      over <= 3 &&
      Number.isFinite(fs) && Number.isFinite(lh) &&
      Math.abs(lh - fs) <= 0.5
    );
  };
  // r324 — کلاسِ مشروعِ عمودیِ هشتم: ping_wave. نقطهٔ شاخصِ کوچک (h-2 w-2)
  // با بچهٔ مطلقِ animate-ping: موجِ انیمیشنیِ عمدی تا ۲× جعبه و clip آن
  // طراحی است (تصدیقِ زنده: kids=[absolute/ping/16x16] در جعبهٔ 8px · over=4).
  const pingWave = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 14 || r.height > 14) return false;
    return [...el.children].some((k) => {
      const kc = getComputedStyle(k);
      return kc.position === "absolute" && kc.animationName !== "none";
    });
  };
  // r324 — دوقلوی عمودیِ کلاسِ transform (r316): framer-motionِ whileInView
  // ستونهایِ سکو را با translateY از پایینِ خطِ پایه بالا میآورد؛ در فازِ
  // پیش از دید، جابجاییِ مثبتِ y ستون را از کارتِ overflow-hidden بیرون
  // میبرد (سنجشِ زنده: bottom=3 رویِ سرپودومِ فوشیا) — حرکتِ طراحی‌شده است
  // نه برشِ محتوا؛ همان قاعدهٔ محورِ افقی، این بار برایِ محورِ عمودی.
  // تفاوت با transformBleedِ افقی: translateY عرض/قد را عوض نمیکند —
  // جابجاییِ موضع است، پس امضا از rect است نه offset.
  const transformDisplacedY = (el) => {
    const er = el.getBoundingClientRect();
    return [...el.querySelectorAll("*")].some((d) => {
      const cs = getComputedStyle(d);
      if (cs.display === "none") return false;
      if (cs.transform === "none" && (!cs.rotate || cs.rotate === "none")) return false;
      const dr = d.getBoundingClientRect();
      return dr.bottom > er.bottom + 1 || dr.top < er.top - 1;
    });
  };
  const nearestVCliip = (el) => {
    // نزدیکترین جدّی که در محورِ عمودی مرئی نیست: hidden/clip؛ اگر auto/scroll = پیمایشگر
    for (let n = el.parentElement; n && n !== root.parentElement; n = n.parentElement) {
      const oy = getComputedStyle(n).overflowY;
      if (oy === "auto" || oy === "scroll") return "scroller";
      if (oy === "hidden" || oy === "clip") return "hidden";
    }
    return "flow";
  };
  // r322 — کلاسِ مشروعِ ششم: sheen_bleed. درخشِ متحرکِ درونِ کارتِ قفلشده
  // (badge-shine): پزودوییِ ::after با inset:0 و translateX(-120%→120%) بی‌نهایت؛
  // scrollWidthِ والدِ overflow:hidden محتوایِ بریدهشده را هم میشمارد، پس در
  // لحظهٔ میانهٔ انیمیشن تا ~1.2× عرضِ کارت inflated میشود (سنجشِ زنده: over=203
  // در یک ران، صفر در رانِ دیگر — ناپایدارِ زمانی، ولی امضایش قطعی است:
  // پزودوِ مطلقِ متحرک رویِ والدِ overflow:hidden = تزئینِ بریدهشده به عمد).
  // querySelectorAll("*") پزودو را نمیبیند (transformBleed کور است)؛ امضا از
  // getComputedStyle(el, "::after") خوانده میشود — قطعی و مستقل از فازِ انیمیشن.
  const sheenBleed = (el) => {
    const cs = getComputedStyle(el);
    if (cs.overflowX !== "hidden" && cs.overflow !== "hidden") return false;
    const ps = getComputedStyle(el, "::after");
    return ps.position === "absolute" && ps.animationName !== "none";
  };
  const hOff = [], hLegit = [], vCand = [], vLegit = [];
  for (const el of root.querySelectorAll("*")) {
    const sw = el.scrollWidth, cw = el.clientWidth;
    const sh = el.scrollHeight, ch = el.clientHeight;
    if (sw > cw + 1 && cw > 0) {
      let anc = false;
      for (let n = el.parentElement; n && n !== root; n = n.parentElement)
        if (n.scrollWidth > n.clientWidth + 1) { anc = true; break; }
      if (!anc) {
        const item = { tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 44), over: sw - cw };
        if (scrollsX(el)) { item.why = "scroller"; hLegit.push(item); }
        else if (srOnly(el)) { item.why = "sr_only"; hLegit.push(item); }
        else if (truncates(el)) { item.why = "truncate"; hLegit.push(item); }
        else if (transformBleed(el)) { item.why = "transform"; hLegit.push(item); }
        else if (decoBleed(el)) { item.why = "deco_bleed"; hLegit.push(item); }
        else if (sheenBleed(el)) { item.why = "sheen_bleed"; hLegit.push(item); }
        else hOff.push(item);
      }
    }
    if (sh > ch + 1 && ch > 0) {
      let anc = false;
      for (let n = el.parentElement; n && n !== root; n = n.parentElement)
        if (n.scrollHeight > n.clientHeight + 1) { anc = true; break; }
      if (anc) continue;
      const item = { tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 44), over: sh - ch };
      if (scrollsY(el)) { item.why = "vscroller"; vLegit.push(item); }
      else if (srOnly(el)) { item.why = "sr_only"; vLegit.push(item); }
      else if (lineClamp(el)) { item.why = "clamp"; vLegit.push(item); }
      else if (decoBleed(el)) { item.why = "deco_bleed"; vLegit.push(item); }
      else if (truncateSlack(el, item.over)) { item.why = "truncate_slack"; vLegit.push(item); }
      else if (leadingNone(el, item.over)) { item.why = "leading_none"; vLegit.push(item); }
      else if (pingWave(el)) { item.why = "ping_wave"; vLegit.push(item); }
      else if (transformDisplacedY(el)) { item.why = "transform"; vLegit.push(item); }
      else {
        const near = nearestVCliip(el);
        if (near === "scroller") { item.why = "vscroller-ancestor"; vLegit.push(item); }
        else if (near === "hidden") { item.why = "hidden_clip"; vCand.push(item); }
        else { item.why = "flow"; vLegit.push(item); }
      }
    }
  }
  const b = document.body, se = document.scrollingElement;
  return JSON.stringify({
    sel: sel.slice(0, 34),
    h_bugs: hOff.length, h_off: hOff.slice(0, 4), h_legit: hLegit.length,
    v_cand: vCand.length, v_cands: vCand.slice(0, 4), v_legit: vLegit.length,
    body_sw: se.scrollWidth, body_cw: se.clientWidth,
  });
})('__SEL__')