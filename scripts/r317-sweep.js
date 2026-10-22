// r317 dialog sweep — horizontal (r316 three-way classifier) + vertical classifier
// h: scroller | truncate | transform  -> legit;  else real bug
// v: vscroller | clamp | vscroller-ancestor | flow -> legit;  hidden_clip -> candidate (invisible clipping)
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
  const nearestVCliip = (el) => {
    // نزدیکترین جدّی که در محورِ عمودی مرئی نیست: hidden/clip؛ اگر auto/scroll = پیمایشگر
    for (let n = el.parentElement; n && n !== root.parentElement; n = n.parentElement) {
      const oy = getComputedStyle(n).overflowY;
      if (oy === "auto" || oy === "scroll") return "scroller";
      if (oy === "hidden" || oy === "clip") return "hidden";
    }
    return "flow";
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