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
  const btn = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("تمرین همین"),
  );
  if (!btn) return JSON.stringify({ found: false });
  const img = getComputedStyle(btn).backgroundImage;
  const stops = (img.match(/oklch\([^)]+\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|lab\([^)]+\)/g) || []).slice(0, 3);
  const measured = stops.map((s) => {
    const c = toRGBA(s);
    return { stop: s.slice(0, 28), hex: "#" + c.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join(""), white: ratio([255, 255, 255], c) };
  });
  return JSON.stringify({ found: true, cls: btn.className.slice(0, 80), measured });
})()
